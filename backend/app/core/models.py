"""
PyTorch Model Architectures for the Compression Pipeline.

Defines the CNN Autoencoder architecture used for the EMNIST
proof-of-concept demo. These architectures must match what the
user trained so we can properly load state dicts.
"""

import torch
import torch.nn as nn


class CNNEncoder(nn.Module):
    """CNN-based encoder for 28x28 grayscale images."""

    def __init__(self, latent_dim: int = 32):
        super().__init__()
        self.encoder = nn.Sequential(
            # Input: (1, 28, 28)
            nn.Conv2d(1, 16, kernel_size=3, stride=2, padding=1),  # (16, 14, 14)
            nn.ReLU(inplace=True),
            nn.Conv2d(16, 32, kernel_size=3, stride=2, padding=1),  # (32, 7, 7)
            nn.ReLU(inplace=True),
            nn.Conv2d(32, 64, kernel_size=3, stride=2, padding=1),  # (64, 4, 4)
            nn.ReLU(inplace=True),
        )
        self.fc = nn.Linear(64 * 4 * 4, latent_dim)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.encoder(x)
        x = x.view(x.size(0), -1)
        x = self.fc(x)
        return x


class CNNDecoder(nn.Module):
    """CNN-based decoder that reconstructs 28x28 grayscale images."""

    def __init__(self, latent_dim: int = 32):
        super().__init__()
        self.fc = nn.Linear(latent_dim, 64 * 4 * 4)
        self.decoder = nn.Sequential(
            # Input: (64, 4, 4)
            nn.ConvTranspose2d(64, 32, kernel_size=3, stride=2, padding=1, output_padding=0),  # (32, 7, 7)
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(32, 16, kernel_size=3, stride=2, padding=1, output_padding=1),  # (16, 14, 14)
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(16, 1, kernel_size=3, stride=2, padding=1, output_padding=1),  # (1, 28, 28)
            nn.Sigmoid(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.fc(x)
        x = x.view(x.size(0), 64, 4, 4)
        x = self.decoder(x)
        return x


class CNNAutoencoder(nn.Module):
    """
    Full CNN Autoencoder for EMNIST image reconstruction.

    Architecture:
        Encoder: Conv2d(1→16) → Conv2d(16→32) → Conv2d(32→64) → Linear(1024→latent_dim)
        Decoder: Linear(latent_dim→1024) → ConvTranspose2d(64→32) → ConvTranspose2d(32→16) → ConvTranspose2d(16→1)
    """

    def __init__(self, latent_dim: int = 32):
        super().__init__()
        self.encoder = CNNEncoder(latent_dim)
        self.decoder = CNNDecoder(latent_dim)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        latent = self.encoder(x)
        reconstructed = self.decoder(latent)
        return reconstructed


class ANNAutoencoder(nn.Module):
    """
    Fully-connected (ANN) Autoencoder for EMNIST image reconstruction.

    Architecture:
        Encoder: Linear(784→256) → Linear(256→128) → Linear(128→latent_dim)
        Decoder: Linear(latent_dim→128) → Linear(128→256) → Linear(256→784)
    """

    def __init__(self, latent_dim: int = 32):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(784, 256),
            nn.ReLU(inplace=True),
            nn.Linear(256, 128),
            nn.ReLU(inplace=True),
            nn.Linear(128, latent_dim),
            nn.ReLU(inplace=True),
        )
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 128),
            nn.ReLU(inplace=True),
            nn.Linear(128, 256),
            nn.ReLU(inplace=True),
            nn.Linear(256, 784),
            nn.Sigmoid(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        batch_size = x.size(0)
        x = x.view(batch_size, -1)  # Flatten
        latent = self.encoder(x)
        reconstructed = self.decoder(latent)
        reconstructed = reconstructed.view(batch_size, 1, 28, 28)
        return reconstructed


# Registry for easy lookup by model_type string
MODEL_REGISTRY = {
    "cnn_autoencoder": CNNAutoencoder,
    "ann_autoencoder": ANNAutoencoder,
}


def get_model(model_type: str, **kwargs) -> nn.Module:
    """
    Factory function to create a model by type name.

    Args:
        model_type: Key from MODEL_REGISTRY (e.g. "cnn_autoencoder")
        **kwargs: Passed to the model constructor (e.g. latent_dim=32)

    Returns:
        An instantiated nn.Module

    Raises:
        ValueError: If model_type is not in the registry
    """
    if model_type not in MODEL_REGISTRY:
        raise ValueError(
            f"Unknown model_type '{model_type}'. "
            f"Available: {list(MODEL_REGISTRY.keys())}"
        )
    return MODEL_REGISTRY[model_type](**kwargs)
