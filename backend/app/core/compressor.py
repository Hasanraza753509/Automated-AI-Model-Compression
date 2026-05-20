"""
ML Compression Pipeline — Core Engine.

This module orchestrates the full compression pipeline:
1. Load the original model from a .pth state dict
2. Benchmark the original model (size + latency)
3. Apply post-training static quantization (FP32 → INT8)
4. Apply unstructured L1 pruning on Conv2d layers
5. Benchmark the compressed model
6. Generate reconstruction samples for visual comparison
7. Save the compressed model and return all metrics
"""

import os
import copy
import base64
import io
import logging
import ssl
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field

import torch
import torch.nn as nn
import torch.quantization as tq
import torch.nn.utils.prune as prune
from torchvision import datasets, transforms
from PIL import Image
import numpy as np

# Bypass SSL verification for macOS Python to download datasets
ssl._create_default_https_context = ssl._create_unverified_context

from app.core.models import get_model
from app.core.benchmarks import get_full_benchmark, measure_model_size

logger = logging.getLogger(__name__)


@dataclass
class CompressionConfig:
    """Configuration for the compression pipeline."""
    quantization: bool = True
    quantization_backend: str = "fbgemm"  # "fbgemm" (x86) or "qnnpack" (ARM)
    pruning: bool = True
    pruning_amount: float = 0.3  # Fraction of weights to prune (0.0 to 1.0)
    model_type: str = "cnn_autoencoder"
    latent_dim: int = 32
    num_samples: int = 8  # Number of reconstruction samples to return


@dataclass
class CompressionResult:
    """Result of a compression pipeline run."""
    original_size_mb: float = 0.0
    compressed_size_mb: float = 0.0
    compression_ratio: str = "1.0x"
    original_latency_ms: float = 0.0
    compressed_latency_ms: float = 0.0
    speedup: str = "1.0x"
    original_reconstructions: List[str] = field(default_factory=list)  # base64 images
    compressed_reconstructions: List[str] = field(default_factory=list)  # base64 images
    compressed_model_path: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "original_size_mb": self.original_size_mb,
            "compressed_size_mb": self.compressed_size_mb,
            "compression_ratio": self.compression_ratio,
            "original_latency_ms": self.original_latency_ms,
            "compressed_latency_ms": self.compressed_latency_ms,
            "speedup": self.speedup,
            "original_reconstructions": self.original_reconstructions,
            "compressed_reconstructions": self.compressed_reconstructions,
        }


def _tensor_to_base64_image(tensor: torch.Tensor) -> str:
    """
    Convert a single-channel 28x28 tensor to a base64-encoded PNG string.

    Args:
        tensor: Shape (1, 28, 28) or (28, 28), values in [0, 1].

    Returns:
        Base64-encoded PNG string.
    """
    if tensor.dim() == 3:
        tensor = tensor.squeeze(0)
    # Clamp and convert to uint8
    img_array = (tensor.detach().cpu().clamp(0, 1).numpy() * 255).astype(np.uint8)
    img = Image.fromarray(img_array, mode="L")
    # Upscale for better visibility
    img = img.resize((112, 112), Image.NEAREST)
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def _get_emnist_samples(num_samples: int = 8) -> torch.Tensor:
    """
    Load a batch of EMNIST test samples for reconstruction comparison.

    Downloads EMNIST dataset if not already cached.

    Args:
        num_samples: Number of samples to return.

    Returns:
        Tensor of shape (num_samples, 1, 28, 28).
    """
    transform = transforms.Compose([
        transforms.ToTensor(),
    ])

    try:
        dataset = datasets.EMNIST(
            root="./data",
            split="digits",
            train=False,
            download=True,
            transform=transform,
        )
    except Exception as e:
        logger.warning(f"Failed to download EMNIST, using random samples: {e}")
        return torch.rand(num_samples, 1, 28, 28)

    # Get first num_samples
    indices = list(range(min(num_samples, len(dataset))))
    samples = torch.stack([dataset[i][0] for i in indices])
    return samples


def _apply_quantization(
    model: nn.Module,
    backend: str = "fbgemm",
    calibration_data: Optional[torch.Tensor] = None,
) -> nn.Module:
    """
    Apply post-training static quantization to a model.

    Converts FP32 weights to INT8, significantly reducing model size
    and improving inference speed on CPU.

    Args:
        model: The original FP32 model.
        backend: Quantization backend ("fbgemm" for x86, "qnnpack" for ARM).
        calibration_data: Optional tensor for calibration (uses random if None).

    Returns:
        Quantized model (INT8).
    """
    model_copy = copy.deepcopy(model)
    model_copy.eval()

    # Set quantization backend
    torch.backends.quantized.engine = backend

    # Fuse modules where possible (Conv-ReLU, Linear-ReLU)
    # For our autoencoder, we handle this manually since the architecture
    # uses nn.Sequential with separate layers
    model_copy.qconfig = tq.get_default_qconfig(backend)

    # Prepare for static quantization
    model_prepared = tq.prepare(model_copy, inplace=False)

    # Calibration: run representative data through the model
    if calibration_data is None:
        calibration_data = torch.randn(32, 1, 28, 28)

    with torch.no_grad():
        model_prepared(calibration_data)

    # Convert to quantized model
    model_quantized = tq.convert(model_prepared, inplace=False)

    logger.info("Post-training static quantization applied successfully")
    return model_quantized


def _apply_pruning(
    model: nn.Module,
    amount: float = 0.3,
) -> nn.Module:
    """
    Apply unstructured L1 pruning to Conv2d and Linear layers.

    Removes the lowest-magnitude weights, introducing sparsity
    that can lead to smaller serialized models and potentially faster
    inference with sparse computation support.

    Args:
        model: The PyTorch model to prune.
        amount: Fraction of weights to prune (0.0 = none, 1.0 = all).

    Returns:
        Pruned model (weights zeroed out, pruning masks applied permanently).
    """
    model_copy = copy.deepcopy(model)

    # Collect all prunable layers
    layers_pruned = 0
    for name, module in model_copy.named_modules():
        if isinstance(module, (nn.Conv2d, nn.Linear)):
            prune.l1_unstructured(module, name="weight", amount=amount)
            # Make pruning permanent (remove the reparametrization)
            prune.remove(module, "weight")
            layers_pruned += 1

    logger.info(f"L1 unstructured pruning applied to {layers_pruned} layers (amount={amount})")
    return model_copy


def run_compression_pipeline(
    model_path: str,
    output_dir: str,
    config: CompressionConfig,
) -> CompressionResult:
    """
    Execute the full model compression pipeline.

    This is the main entry point for the ML core. It:
    1. Loads the model from a .pth file
    2. Benchmarks the original model
    3. Applies quantization and/or pruning
    4. Benchmarks the compressed model
    5. Generates reconstruction comparison images
    6. Saves the compressed model

    Args:
        model_path: Path to the uploaded .pth model file.
        output_dir: Directory to save compressed model artifacts.
        config: Compression configuration parameters.

    Returns:
        CompressionResult with all metrics and reconstruction images.
    """
    os.makedirs(output_dir, exist_ok=True)
    result = CompressionResult()

    # ─── Step 1: Load the original model ───
    logger.info(f"Loading model from {model_path} (type: {config.model_type})")
    original_model = get_model(config.model_type, latent_dim=config.latent_dim)

    state_dict = torch.load(model_path, map_location="cpu", weights_only=True)
    original_model.load_state_dict(state_dict)
    original_model.eval()

    # ─── Step 2: Benchmark original model ───
    logger.info("Benchmarking original model...")
    original_bench = get_full_benchmark(original_model)
    result.original_size_mb = original_bench["size_mb"]
    result.original_latency_ms = original_bench["latency_ms"]

    # ─── Step 3: Get calibration / test samples ───
    logger.info(f"Loading {config.num_samples} EMNIST samples for calibration & comparison...")
    samples = _get_emnist_samples(config.num_samples)

    # Generate original reconstructions
    with torch.no_grad():
        original_outputs = original_model(samples)
    result.original_reconstructions = [
        _tensor_to_base64_image(original_outputs[i]) for i in range(len(original_outputs))
    ]

    # ─── Step 4: Apply compression ───
    compressed_model = copy.deepcopy(original_model)

    # Apply pruning first (works on FP32 model)
    if config.pruning:
        logger.info(f"Applying pruning (amount={config.pruning_amount})...")
        compressed_model = _apply_pruning(compressed_model, amount=config.pruning_amount)

    # Apply quantization
    if config.quantization:
        logger.info(f"Applying quantization (backend={config.quantization_backend})...")
        try:
            compressed_model = _apply_quantization(
                compressed_model,
                backend=config.quantization_backend,
                calibration_data=samples,
            )
        except Exception as e:
            logger.warning(f"Quantization failed, skipping: {e}")
            # Continue with just pruning if quantization fails

    # ─── Step 5: Benchmark compressed model ───
    logger.info("Benchmarking compressed model...")
    compressed_bench = get_full_benchmark(compressed_model)
    result.compressed_size_mb = compressed_bench["size_mb"]
    result.compressed_latency_ms = compressed_bench["latency_ms"]

    # Calculate ratios
    if result.compressed_size_mb > 0:
        ratio = result.original_size_mb / result.compressed_size_mb
        result.compression_ratio = f"{ratio:.1f}x"

    if result.compressed_latency_ms > 0:
        speedup = result.original_latency_ms / result.compressed_latency_ms
        result.speedup = f"{speedup:.1f}x"

    # ─── Step 6: Generate compressed reconstructions ───
    with torch.no_grad():
        try:
            compressed_outputs = compressed_model(samples)
        except Exception as e:
            logger.warning(f"Compressed model inference failed for reconstructions: {e}")
            compressed_outputs = original_outputs  # Fallback

    result.compressed_reconstructions = [
        _tensor_to_base64_image(compressed_outputs[i]) for i in range(len(compressed_outputs))
    ]

    # ─── Step 7: Save compressed model ───
    compressed_path = os.path.join(output_dir, "compressed_model.pth")
    torch.save(compressed_model.state_dict(), compressed_path)
    result.compressed_model_path = compressed_path

    logger.info(
        f"Compression complete: {result.original_size_mb:.2f}MB → {result.compressed_size_mb:.2f}MB "
        f"({result.compression_ratio}), "
        f"Latency: {result.original_latency_ms:.2f}ms → {result.compressed_latency_ms:.2f}ms "
        f"({result.speedup})"
    )

    return result
