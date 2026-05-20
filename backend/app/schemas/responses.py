"""
Pydantic schemas for API request/response validation.
"""

from typing import List, Optional
from pydantic import BaseModel, Field
from enum import Enum


class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class CompressionRequest(BaseModel):
    quantization: bool = Field(default=True)
    quantization_backend: str = Field(default="fbgemm")
    pruning: bool = Field(default=True)
    pruning_amount: float = Field(default=0.3, ge=0.0, le=0.95)
    model_type: str = Field(default="cnn_autoencoder")
    latent_dim: int = Field(default=32)


class UploadResponse(BaseModel):
    job_id: str
    filename: str
    size_mb: float
    message: str = "Model uploaded successfully"


class CompressionResponse(BaseModel):
    job_id: str
    status: JobStatus
    message: str = "Compression job started"


class JobStatusResponse(BaseModel):
    job_id: str
    status: JobStatus
    message: str = ""
    original_size_mb: Optional[float] = None
    compressed_size_mb: Optional[float] = None
    compression_ratio: Optional[str] = None
    original_latency_ms: Optional[float] = None
    compressed_latency_ms: Optional[float] = None
    speedup: Optional[str] = None
    original_reconstructions: Optional[List[str]] = None
    compressed_reconstructions: Optional[List[str]] = None
    download_url: Optional[str] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str = "0.1.0"
    service: str = "AI Model Compression Pipeline"
