import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
});

export async function uploadModel(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/api/v1/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });
  return response.data;
}

export async function compressModel(jobId, config = {}) {
  const response = await api.post(`/api/v1/compress/${jobId}`, {
    quantization: config.quantization ?? true,
    quantization_backend: config.quantizationBackend ?? 'fbgemm',
    pruning: config.pruning ?? true,
    pruning_amount: config.pruningAmount ?? 0.3,
    model_type: config.modelType ?? 'cnn_autoencoder',
    latent_dim: config.latentDim ?? 32,
  });
  return response.data;
}

export async function getJobStatus(jobId) {
  const response = await api.get(`/api/v1/status/${jobId}`);
  return response.data;
}

export function getDownloadUrl(jobId) {
  return `${API_BASE}/api/v1/download/${jobId}`;
}

export async function healthCheck() {
  const response = await api.get('/api/v1/health');
  return response.data;
}
