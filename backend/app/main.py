"""
FastAPI Application Entry Point.

Configures CORS, logging, and mounts the compression router.
"""

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

# CORS — Allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",      # Vite dev server
        "http://localhost:3000",      # Fallback dev
        "https://*.vercel.app",       # Production frontend
    ],
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
