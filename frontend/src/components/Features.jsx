import { Cpu, Scissors, Gauge, Shield, Zap, BarChart3 } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: <Cpu size={24} />,
      title: 'INT8 Quantization',
      description: 'Convert FP32 weights to INT8 precision, reducing model size by up to 4× while preserving accuracy.',
      color: 'var(--color-accent-primary)',
      bg: 'rgba(5, 150, 105, 0.07)',
      border: 'rgba(5, 150, 105, 0.15)',
    },
    {
      icon: <Scissors size={24} />,
      title: 'L1 Pruning',
      description: 'Remove redundant neural connections using L1 unstructured pruning with configurable sparsity levels.',
      color: 'var(--color-accent-teal)',
      bg: 'rgba(20, 184, 166, 0.07)',
      border: 'rgba(20, 184, 166, 0.15)',
    },
    {
      icon: <Gauge size={24} />,
      title: 'Performance Metrics',
      description: 'Get real-time benchmarks — model size, inference latency, compression ratio, and speedup measurements.',
      color: 'var(--color-accent-blue)',
      bg: 'rgba(2, 132, 199, 0.07)',
      border: 'rgba(2, 132, 199, 0.15)',
    },
    {
      icon: <BarChart3 size={24} />,
      title: 'Visual Comparisons',
      description: 'Compare original vs compressed reconstruction outputs side-by-side with EMNIST test samples.',
      color: 'var(--color-accent-sky)',
      bg: 'rgba(14, 165, 233, 0.07)',
      border: 'rgba(14, 165, 233, 0.15)',
    },
    {
      icon: <Zap size={24} />,
      title: 'Edge-Ready Export',
      description: 'Optimized weights ready for deployment on mobile, IoT, ARM, and x86 edge devices.',
      color: 'var(--color-accent-amber)',
      bg: 'rgba(217, 119, 6, 0.07)',
      border: 'rgba(217, 119, 6, 0.15)',
    },
    {
      icon: <Shield size={24} />,
      title: 'Zero Config',
      description: 'Upload, click compress, download. No infrastructure setup or ML expertise required.',
      color: 'var(--color-accent-green)',
      bg: 'rgba(22, 163, 74, 0.07)',
      border: 'rgba(22, 163, 74, 0.15)',
    },
  ];

  return (
    <section id="features" className="section" style={{ background: 'var(--color-bg-secondary)' }}>
      <div className="section-narrow">
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div className="badge" style={{
            display: 'inline-flex',
            margin: '0 auto 24px',
            background: 'rgba(5, 150, 105, 0.08)',
            border: '1px solid rgba(5, 150, 105, 0.18)',
            color: 'var(--color-accent-primary)',
          }}>
            Core Capabilities
          </div>
          <h2 className="font-extrabold" style={{ fontSize: 'clamp(1.875rem, 4vw, 2.25rem)', color: 'var(--color-text-primary)', marginBottom: '16px', textAlign: 'center' }}>
            Everything You Need to <span className="gradient-text">Optimize</span>
          </h2>
          <div className="divider" />
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, textAlign: 'center', maxWidth: '560px', margin: '0 auto', fontSize: '1rem' }}>
            Professional-grade model compression tools, accessible through
            a simple drag-and-drop interface.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon, title, description, color, bg, border }, idx) => (
            <div key={title} className="feature-card fade-in-scale" style={{ animationDelay: `${idx * 0.08}s` }}>
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300"
                  style={{ background: bg, border: `1px solid ${border}`, color }}>
                  {icon}
                </div>
              </div>
              <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
