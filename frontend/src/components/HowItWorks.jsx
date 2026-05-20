import { Upload, Settings2, BarChart3, Download, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    { number: '01', icon: <Upload size={28} />, title: 'Upload Your Model', description: 'Drag and drop your PyTorch .pth file. We support models up to 500 MB — autoencoders, CNNs, and more.', color: 'var(--color-accent-primary)', bg: 'rgba(5, 150, 105, 0.07)', borderColor: 'rgba(5, 150, 105, 0.18)' },
    { number: '02', icon: <Settings2 size={28} />, title: 'Configure Compression', description: 'Choose quantization (FP32 → INT8), pruning amount (L1 unstructured), backend target, and model architecture.', color: 'var(--color-accent-teal)', bg: 'rgba(20, 184, 166, 0.07)', borderColor: 'rgba(20, 184, 166, 0.18)' },
    { number: '03', icon: <BarChart3 size={28} />, title: 'Analyze Results', description: 'View detailed metrics — size reduction, latency speedup, compression ratio, and reconstruction fidelity comparisons.', color: 'var(--color-accent-blue)', bg: 'rgba(2, 132, 199, 0.07)', borderColor: 'rgba(2, 132, 199, 0.18)' },
    { number: '04', icon: <Download size={28} />, title: 'Download & Deploy', description: 'Download your optimized model weights, ready for edge deployment on mobile, IoT, or embedded devices.', color: 'var(--color-accent-green)', bg: 'rgba(22, 163, 74, 0.07)', borderColor: 'rgba(22, 163, 74, 0.18)' },
  ];

  return (
    <section id="how-it-works" className="section bg-grid" style={{ background: 'var(--color-bg-primary)' }}>
      <div className="section-narrow">
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div className="badge" style={{ display: 'inline-flex', margin: '0 auto 24px', background: 'rgba(20, 184, 166, 0.08)', border: '1px solid rgba(20, 184, 166, 0.18)', color: 'var(--color-accent-teal)' }}>
            Simple Process
          </div>
          <h2 className="font-extrabold" style={{ fontSize: 'clamp(1.875rem, 4vw, 2.25rem)', color: 'var(--color-text-primary)', marginBottom: '16px', textAlign: 'center' }}>
            How <span className="gradient-text">CompressAI</span> Works
          </h2>
          <div className="divider" />
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, textAlign: 'center', maxWidth: '560px', margin: '0 auto', fontSize: '1rem' }}>
            Four simple steps to compress your AI models for production deployment. No infrastructure setup — everything runs in the cloud.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(({ number, icon, title, description, color, bg, borderColor }, idx) => (
            <div key={title} className="step-card fade-in-scale" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="text-xs font-mono font-bold mb-5" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>STEP {number}</div>
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300" style={{ background: bg, border: `1px solid ${borderColor}`, color }}>{icon}</div>
              </div>
              <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
              {idx < steps.length - 1 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--color-border-hover)' }}><ArrowRight size={20} /></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
