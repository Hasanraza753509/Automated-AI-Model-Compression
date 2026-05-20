"""
File handling utilities for upload/download operations.
"""

import os
import uuid
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
OUTPUT_DIR = BASE_DIR / "outputs"

# Ensure directories exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Max file size: 500MB
MAX_FILE_SIZE = 500 * 1024 * 1024
ALLOWED_EXTENSIONS = {".pth", ".pt"}


def generate_job_id() -> str:
    """Generate a unique job ID."""
    return str(uuid.uuid4())


def get_upload_path(job_id: str, filename: str) -> Path:
    """Get the upload path for a job, creating the job directory."""
    job_dir = UPLOAD_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)
    return job_dir / filename


def get_output_dir(job_id: str) -> Path:
    """Get the output directory for a job."""
    job_dir = OUTPUT_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)
    return job_dir


def validate_file_extension(filename: str) -> bool:
    """Check if the file has an allowed extension."""
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXTENSIONS


def get_file_size_mb(filepath: str) -> float:
    """Get file size in megabytes."""
    return os.path.getsize(filepath) / (1024 * 1024)
