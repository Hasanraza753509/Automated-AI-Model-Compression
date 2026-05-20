"""
Demo Script: Train a CNN Autoencoder on EMNIST.

This script trains the proof-of-concept autoencoder that can be
uploaded to the compression pipeline. Run this to generate a .pth
file for testing.

Usage:
    python train_autoencoder.py

Output:
    sample_models/cnn_autoencoder_emnist.pth
    sample_models/ann_autoencoder_emnist.pth
"""

import os
import sys
import ssl
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

# Bypass SSL verification for macOS Python to download datasets
ssl._create_default_https_context = ssl._create_unverified_context

# Add parent dir so we can import the model architectures
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
from app.core.models import CNNAutoencoder, ANNAutoencoder


def train_autoencoder(model, train_loader, epochs=10, lr=1e-3, device="cpu"):
    """Train an autoencoder with MSE loss."""
    model.to(device)
    model.train()
    optimizer = optim.Adam(model.parameters(), lr=lr)
    criterion = nn.MSELoss()

    for epoch in range(epochs):
        total_loss = 0
        for batch_idx, (data, _) in enumerate(train_loader):
            data = data.to(device)
            optimizer.zero_grad()
            output = model(data)
            loss = criterion(output, data)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        avg_loss = total_loss / len(train_loader)
        print(f"  Epoch {epoch+1}/{epochs} — Loss: {avg_loss:.6f}")

    return model


def main():
    os.makedirs("sample_models", exist_ok=True)

    # Dataset
    transform = transforms.Compose([transforms.ToTensor()])
    print("Downloading EMNIST dataset...")
    train_dataset = datasets.EMNIST(
        root="./data", split="digits", train=True,
        download=True, transform=transform,
    )
    train_loader = DataLoader(train_dataset, batch_size=128, shuffle=True, num_workers=2)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}\n")

    # --- Train CNN Autoencoder ---
    print("=" * 50)
    print("Training CNN Autoencoder...")
    print("=" * 50)
    cnn_model = CNNAutoencoder(latent_dim=32)
    cnn_model = train_autoencoder(cnn_model, train_loader, epochs=10, device=device)
    cnn_path = "sample_models/cnn_autoencoder_emnist.pth"
    torch.save(cnn_model.state_dict(), cnn_path)
    size_mb = os.path.getsize(cnn_path) / (1024 * 1024)
    print(f"Saved: {cnn_path} ({size_mb:.2f} MB)\n")

    # --- Train ANN Autoencoder ---
    print("=" * 50)
    print("Training ANN Autoencoder...")
    print("=" * 50)
    ann_model = ANNAutoencoder(latent_dim=32)
    ann_model = train_autoencoder(ann_model, train_loader, epochs=10, device=device)
    ann_path = "sample_models/ann_autoencoder_emnist.pth"
    torch.save(ann_model.state_dict(), ann_path)
    size_mb = os.path.getsize(ann_path) / (1024 * 1024)
    print(f"Saved: {ann_path} ({size_mb:.2f} MB)\n")

    print("Done! Upload these .pth files to the compression pipeline.")


if __name__ == "__main__":
    main()
