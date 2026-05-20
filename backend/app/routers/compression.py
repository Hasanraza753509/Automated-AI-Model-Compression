"""
API Router — Compression Pipeline Endpoints.

Handles model upload, compression triggering, status polling,
and compressed model download.
"""

import logging
from typing import Dict, Any

from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse

from app.schemas.responses import (
    UploadResponse,
    CompressionRequest,
    CompressionResponse,
    JobStatusResponse,
    JobStatus,
    HealthResponse,
)
from app.utils.file_handler import (
    generate_job_id,
    get_upload_path,
    get_output_dir,
    validate_file_extension,
    get_file_size_mb,
    MAX_FILE_SIZE,
)
from app.core.compressor import run_compression_pipeline, CompressionConfig

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["compression"])

# In-memory job store (replace with Redis/DB for production)
jobs: Dict[str, Dict[str, Any]] = {}


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse()


@router.post("/upload", response_model=UploadResponse)
async def upload_model(file: UploadFile = File(...)):
    """
    Upload a .pth PyTorch model file.

    Returns a job_id that can be used to trigger compression
    and poll for results.
    """
    # Validate file extension
    if not validate_file_extension(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: .pth, .pt"
        )

    # Generate job ID and save file
    job_id = generate_job_id()
    upload_path = get_upload_path(job_id, file.filename)

    # Stream file to disk with size check
    total_size = 0
    with open(upload_path, "wb") as f:
        while chunk := await file.read(1024 * 1024):  # 1MB chunks
            total_size += len(chunk)
            if total_size > MAX_FILE_SIZE:
                upload_path.unlink(missing_ok=True)
                raise HTTPException(
                    status_code=413,
                    detail=f"File too large. Max size: {MAX_FILE_SIZE // (1024*1024)}MB"
                )
            f.write(chunk)

    size_mb = get_file_size_mb(str(upload_path))

    # Store job metadata
    jobs[job_id] = {
        "status": JobStatus.PENDING,
        "filename": file.filename,
        "upload_path": str(upload_path),
        "size_mb": size_mb,
        "result": None,
        "error": None,
    }

    logger.info(f"Model uploaded: {file.filename} ({size_mb:.2f}MB) → job_id={job_id}")

    return UploadResponse(
        job_id=job_id,
        filename=file.filename,
        size_mb=round(size_mb, 4),
    )


def _run_compression_task(job_id: str, config: CompressionConfig):
    """Background task that runs the compression pipeline."""
    job = jobs[job_id]
    job["status"] = JobStatus.PROCESSING

    try:
        output_dir = str(get_output_dir(job_id))
        result = run_compression_pipeline(
            model_path=job["upload_path"],
            output_dir=output_dir,
            config=config,
        )
        job["result"] = result.to_dict()
        job["result"]["compressed_model_path"] = result.compressed_model_path
        job["status"] = JobStatus.COMPLETED
        logger.info(f"Job {job_id} completed successfully")

    except Exception as e:
        job["status"] = JobStatus.FAILED
        job["error"] = str(e)
        logger.error(f"Job {job_id} failed: {e}", exc_info=True)


@router.post("/compress/{job_id}", response_model=CompressionResponse)
async def compress_model(
    job_id: str,
    config: CompressionRequest,
    background_tasks: BackgroundTasks,
):
    """
    Trigger the compression pipeline for an uploaded model.

    The compression runs as a background task. Poll GET /status/{job_id}
    to check progress and retrieve results.
    """
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    job = jobs[job_id]
    if job["status"] != JobStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail=f"Job is already {job['status'].value}"
        )

    # Convert request to internal config
    compression_config = CompressionConfig(
        quantization=config.quantization,
        quantization_backend=config.quantization_backend,
        pruning=config.pruning,
        pruning_amount=config.pruning_amount,
        model_type=config.model_type,
        latent_dim=config.latent_dim,
    )

    background_tasks.add_task(_run_compression_task, job_id, compression_config)

    return CompressionResponse(
        job_id=job_id,
        status=JobStatus.PROCESSING,
    )


@router.get("/status/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """
    Poll the status of a compression job.

    Returns full metrics and reconstruction images when completed.
    """
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    job = jobs[job_id]
    response = JobStatusResponse(
        job_id=job_id,
        status=job["status"],
    )

    if job["status"] == JobStatus.COMPLETED and job["result"]:
        result = job["result"]
        response.original_size_mb = result["original_size_mb"]
        response.compressed_size_mb = result["compressed_size_mb"]
        response.compression_ratio = result["compression_ratio"]
        response.original_latency_ms = result["original_latency_ms"]
        response.compressed_latency_ms = result["compressed_latency_ms"]
        response.speedup = result["speedup"]
        response.original_reconstructions = result["original_reconstructions"]
        response.compressed_reconstructions = result["compressed_reconstructions"]
        response.download_url = f"/api/v1/download/{job_id}"
        response.message = "Compression completed successfully"

    elif job["status"] == JobStatus.FAILED:
        response.error = job.get("error", "Unknown error")
        response.message = "Compression failed"

    elif job["status"] == JobStatus.PROCESSING:
        response.message = "Compression in progress..."

    else:
        response.message = "Waiting to start compression"

    return response


@router.get("/download/{job_id}")
async def download_compressed_model(job_id: str):
    """Download the compressed model file."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    job = jobs[job_id]
    if job["status"] != JobStatus.COMPLETED:
        raise HTTPException(
            status_code=400,
            detail="Compression not yet completed"
        )

    model_path = job["result"]["compressed_model_path"]
    return FileResponse(
        path=model_path,
        filename=f"compressed_{job['filename']}",
        media_type="application/octet-stream",
    )
