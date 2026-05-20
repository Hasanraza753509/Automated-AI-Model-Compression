# Automated AI Model Compression Pipeline

> **CompressAI** — Upload, compress, and optimize PyTorch models for edge deployment.

A B2B SaaS MVP that automatically applies **quantization** (FP32 → INT8) and **pruning** (L1 unstructured) to PyTorch models, returning optimized weights with full performance metrics.

##  Architecture

```
Frontend (React + Vite + TailwindCSS)
   ↓ Upload .pth
Backend (FastAPI)
   ↓ Background Task
ML Core (PyTorch Quantization + Pruning)
   ↓ Metrics + Compressed Model
Frontend (Dashboard with charts & reconstruction comparison)
```

##  Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install --extra-index-url https://download.pytorch.org/whl/cpu -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Demo: Train a test model

```bash
cd demo
pip install torch torchvision
python train_autoencoder.py
```

Then upload the generated `.pth` file through the UI.

##  Project Structure

```
├── backend/           # FastAPI + PyTorch compression engine
│   ├── app/
│   │   ├── main.py           # App entry
│   │   ├── routers/          # API endpoints
│   │   ├── core/             # ML compression pipeline
│   │   ├── schemas/          # Pydantic models
│   │   └── utils/            # File handling
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/          # React + Vite + TailwindCSS v4
│   └── src/
│       ├── components/       # UI components
│       ├── services/         # API client
│       └── App.jsx           # Main orchestrator
├── demo/              # Training scripts for PoC models
└── ARCHITECTURE.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/upload` | Upload .pth model |
| POST | `/api/v1/compress/{job_id}` | Start compression |
| GET | `/api/v1/status/{job_id}` | Poll results |
| GET | `/api/v1/download/{job_id}` | Download compressed model |
| GET | `/api/v1/health` | Health check |

##  Deployment

- **Frontend**: Vercel (static build)
- **Backend**: Railway or Render (Docker container, CPU-only PyTorch)

See `ARCHITECTURE.md` for detailed deployment strategy.
