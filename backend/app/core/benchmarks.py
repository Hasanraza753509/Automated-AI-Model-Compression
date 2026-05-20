"""
Benchmarking utilities for measuring model performance.

Measures model file size and inference latency to quantify
the impact of compression techniques.
"""

import os
import time
import tempfile
from typing import Dict

import torch
import torch.nn as nn


def measure_model_size(model: nn.Module) -> float:
    """
    Measure the serialized size of a PyTorch model in megabytes.

    Saves the model's state_dict to a temporary file and measures its size.
    This gives an accurate disk-size representation of the model.

    Args:
        model: The PyTorch model to measure.

    Returns:
        Size of the model in megabytes (MB).
    """
    with tempfile.NamedTemporaryFile(suffix=".pth", delete=False) as tmp:
        torch.save(model.state_dict(), tmp.name)
        size_bytes = os.path.getsize(tmp.name)
        os.unlink(tmp.name)
    return size_bytes / (1024 * 1024)


def measure_file_size(filepath: str) -> float:
    """
    Measure file size in megabytes.

    Args:
        filepath: Path to the file.

    Returns:
        Size in megabytes (MB).
    """
    return os.path.getsize(filepath) / (1024 * 1024)


def measure_inference_latency(
    model: nn.Module,
    input_shape: tuple = (1, 1, 28, 28),
    num_runs: int = 100,
    warmup_runs: int = 10,
    device: str = "cpu",
) -> float:
    """
    Measure average inference latency in milliseconds.

    Performs warmup runs followed by timed runs and returns the average
    latency. Uses torch.no_grad() for inference mode.

    Args:
        model: The PyTorch model to benchmark.
        input_shape: Shape of the input tensor (default: single EMNIST image).
        num_runs: Number of timed inference runs.
        warmup_runs: Number of warmup runs before timing starts.
        device: Device to run inference on ("cpu" or "cuda").

    Returns:
        Average inference latency in milliseconds.
    """
    model.eval()
    model.to(device)
    dummy_input = torch.randn(*input_shape).to(device)

    # Warmup: ensure JIT compilation, caches, etc. are settled
    with torch.no_grad():
        for _ in range(warmup_runs):
            model(dummy_input)

    # Timed runs
    latencies = []
    with torch.no_grad():
        for _ in range(num_runs):
            start = time.perf_counter()
            model(dummy_input)
            end = time.perf_counter()
            latencies.append((end - start) * 1000)  # Convert to ms

    avg_latency = sum(latencies) / len(latencies)
    return round(avg_latency, 3)


def get_full_benchmark(
    model: nn.Module,
    input_shape: tuple = (1, 1, 28, 28),
    num_runs: int = 100,
    device: str = "cpu",
) -> Dict[str, float]:
    """
    Run a complete benchmark on a model.

    Args:
        model: The PyTorch model to benchmark.
        input_shape: Input tensor shape.
        num_runs: Number of inference runs for latency measurement.
        device: Device to run on.

    Returns:
        Dictionary with 'size_mb' and 'latency_ms' keys.
    """
    size_mb = measure_model_size(model)
    latency_ms = measure_inference_latency(
        model, input_shape=input_shape, num_runs=num_runs, device=device
    )
    return {
        "size_mb": round(size_mb, 4),
        "latency_ms": latency_ms,
    }
