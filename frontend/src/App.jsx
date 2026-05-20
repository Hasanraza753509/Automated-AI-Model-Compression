import { useState, useRef, useCallback, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import ModelUploader from './components/ModelUploader';
import CompressionConfig from './components/CompressionConfig';
import ResultsDashboard from './components/ResultsDashboard';
import { uploadModel, compressModel, getJobStatus, getDownloadUrl } from './services/api';

export default function App() {
  const [stage, setStage] = useState('hero');
  const [jobId, setJobId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [processingMessage, setProcessingMessage] = useState('Initializing compression pipeline...');

  const pipelineRef = useRef(null);
  const pollingRef = useRef(null);

  const [config, setConfig] = useState({
    quantization: true,
    quantizationBackend: 'fbgemm',
    pruning: true,
    pruningAmount: 0.3,
    modelType: 'cnn_autoencoder',
    latentDim: 32,
  });

  const scrollToPipeline = () => {
    setStage('upload');
    setTimeout(() => {
      pipelineRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleUpload = useCallback(async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const response = await uploadModel(file, (progress) => {
        setUploadProgress(progress);
      });
      setJobId(response.job_id);
      setStage('config');
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Upload failed';
      setError(message);
      setStage('error');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleCompress = useCallback(async () => {
    if (!jobId) return;
    setIsCompressing(true);
    setStage('processing');
    setError('');

    try {
      await compressModel(jobId, config);

      const processingMessages = [
        'Loading model architecture...',
        'Benchmarking original model...',
        'Applying INT8 quantization...',
        'Calibrating with EMNIST samples...',
        'Applying L1 pruning...',
        'Benchmarking compressed model...',
        'Generating reconstruction comparisons...',
        'Finalizing results...',
      ];
      let msgIndex = 0;

      const msgInterval = setInterval(() => {
        msgIndex = Math.min(msgIndex + 1, processingMessages.length - 1);
        setProcessingMessage(processingMessages[msgIndex]);
      }, 2000);

      pollingRef.current = setInterval(async () => {
        try {
          const status = await getJobStatus(jobId);

          if (status.status === 'completed') {
            clearInterval(pollingRef.current);
            clearInterval(msgInterval);
            setResults(status);
            setStage('results');
            setIsCompressing(false);
          } else if (status.status === 'failed') {
            clearInterval(pollingRef.current);
            clearInterval(msgInterval);
            setError(status.error || 'Compression failed');
            setStage('error');
            setIsCompressing(false);
          }
        } catch (pollErr) {
          console.warn('Polling error:', pollErr);
        }
      }, 2000);
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Compression failed';
      setError(message);
      setStage('error');
      setIsCompressing(false);
    }
  }, [jobId, config]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleReset = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setStage('upload');
    setJobId(null);
    setResults(null);
    setError('');
    setIsCompressing(false);
    setIsUploading(false);
    setUploadProgress(0);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
      <Navbar />
      <Hero onGetStarted={scrollToPipeline} />
      <Features />
      <HowItWorks />

      <section
        ref={pipelineRef}
        id="pipeline"
        className="section"
        style={{ background: 'var(--color-bg-secondary)' }}
      >
        <div className="section-narrow">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="badge" style={{
              display: 'inline-flex',
              margin: '0 auto 24px',
              background: 'rgba(2, 132, 199, 0.08)',
              border: '1px solid rgba(2, 132, 199, 0.18)',
              color: 'var(--color-accent-blue)',
            }}>
              Try It Now
            </div>
            <h2 className="font-extrabold" style={{ fontSize: 'clamp(1.875rem, 4vw, 2.25rem)', color: 'var(--color-text-primary)', marginBottom: '16px', textAlign: 'center' }}>
              Compression <span className="gradient-text">Pipeline</span>
            </h2>
            <div className="divider" />
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, textAlign: 'center', maxWidth: '560px', margin: '0 auto', fontSize: '1rem' }}>
              Upload your model, configure settings, and get results — all in one place.
            </p>
          </div>

          <div className="flex justify-center items-center gap-2 sm:gap-4 mb-16">
            {['Upload', 'Configure', 'Compress', 'Results'].map((step, i) => {
              const stages = ['upload', 'config', 'processing', 'results'];
              const currentIndex = stages.indexOf(stage);
              const isActive = i <= currentIndex;
              const isCurrent = i === currentIndex;

              return (
                <div key={step} className="flex items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500"
                      style={{
                        background: isActive
                          ? 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-teal))'
                          : 'var(--color-bg-card)',
                        border: `2px solid ${isActive ? 'transparent' : 'var(--color-border)'}`,
                        color: isActive ? '#fff' : 'var(--color-text-muted)',
                        boxShadow: isCurrent ? '0 4px 16px rgba(5, 150, 105, 0.25)' : isActive ? 'var(--shadow-xs)' : 'none',
                        transform: isCurrent ? 'scale(1.15)' : 'scale(1)',
                      }}>
                      {i + 1}
                    </div>
                    <span className="text-sm font-semibold hidden sm:block" style={{
                      color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                    }}>
                      {step}
                    </span>
                  </div>
                  {i < 3 && (
                    <div className="w-6 sm:w-12 h-0.5 rounded-full transition-all duration-500" style={{
                      background: i < currentIndex
                        ? 'linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-teal))'
                        : 'var(--color-border)',
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-8">
            {(stage === 'upload' || stage === 'hero') && (
              <ModelUploader onUpload={handleUpload} isUploading={isUploading} uploadProgress={uploadProgress} />
            )}

            {stage === 'config' && (
              <CompressionConfig config={config} onConfigChange={setConfig} onCompress={handleCompress} isDisabled={isCompressing} />
            )}

            {stage === 'processing' && (
              <div className="flex flex-col items-center gap-8 py-20 fade-in-up">
                <div className="spinner animate-pulse-glow" />
                <div className="text-center">
                  <p className="text-2xl font-extrabold mb-3 gradient-text">Compressing Model</p>
                  <p className="text-sm font-mono" style={{ color: 'var(--color-text-muted)' }}>
                    {processingMessage}
                  </p>
                </div>
                <div className="flex gap-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-3 h-3 rounded-full" style={{
                      background: 'var(--color-accent-primary)',
                      animation: `fadeInUp 1s ease-in-out infinite ${i * 0.2}s`,
                      opacity: 0.4,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {stage === 'results' && results && (
              <>
                <ResultsDashboard results={results} jobId={jobId} downloadUrl={getDownloadUrl(jobId)} />
                <button onClick={handleReset}
                  className="btn-secondary mt-4" id="compress-another-btn">
                  Compress Another Model
                </button>
              </>
            )}

            {stage === 'error' && (
              <div className="flex flex-col items-center gap-6 py-16 fade-in-up">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{
                  background: 'rgba(225, 29, 72, 0.06)',
                  border: '1px solid rgba(225, 29, 72, 0.18)',
                }}>
                  <span className="text-3xl">⚠️</span>
                </div>
                <div className="text-center">
                  <p className="text-xl font-extrabold mb-2" style={{ color: 'var(--color-accent-rose)' }}>Something went wrong</p>
                  <p className="text-sm font-mono max-w-md" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
                </div>
                <button onClick={handleReset} className="btn-primary mt-2">Try Again</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="py-14 px-6" style={{
        background: 'var(--color-bg-primary)',
        borderTop: '1px solid var(--color-border)',
      }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
            © 2025 CompressAI — Automated Model Compression Pipeline
          </p>
          <div className="flex gap-6">
            <a href="#features" className="text-sm hover-lift" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Features</a>
            <a href="#how-it-works" className="text-sm hover-lift" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>How It Works</a>
            <a href="#pipeline" className="text-sm hover-lift" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Pipeline</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
