"""
FastAPI Application Entry Point.

Configures CORS, logging, and mounts the compression router.
"""

import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.compression import router as compression_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

app = FastAPI(
    title="AI Model Compression Pipeline",
    description="Automated PyTorch model compression with quantization and pruning",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — Build origins from env or use dev defaults
_default_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]
_env_origins = os.getenv("CORS_ORIGINS", "")
_origins = [o.strip() for o in _env_origins.split(",") if o.strip()] if _env_origins else _default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(compression_router)


@app.get("/")
async def root():
    return {
        "service": "AI Model Compression Pipeline",
        "version": "0.1.0",
        "docs": "/docs",
    }
