import { ArrowRight, Sparkles } from 'lucide-react';

export default function Hero({ onGetStarted }) {
  return (
    <section className="relative overflow-hidden" style={{
      background: 'linear-gradient(160deg, #f5f0e8 0%, #e8f0e8 40%, #eef4f8 80%, #f5f0e8 100%)',
      paddingTop: '140px',
      paddingBottom: '100px',
    }}>
      <div className="absolute top-[15%] left-[15%] w-[350px] h-[350px] rounded-full opacity-20 blur-[120px] pointer-events-none animate-float"
        style={{ background: 'radial-gradient(circle, rgba(5,150,105,0.3), transparent 70%)' }} />
      <div className="absolute bottom-[10%] right-[15%] w-[300px] h-[300px] rounded-full opacity-15 blur-[120px] pointer-events-none animate-float-delayed"
        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.25), transparent 70%)' }} />

      <div className="relative z-10" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
          <div className="fade-in-up">
            <div className="badge" style={{
              marginBottom: '32px',
              background: 'rgba(5, 150, 105, 0.08)',
              border: '1px solid rgba(5, 150, 105, 0.18)',
              color: 'var(--color-accent-primary)',
            }}>
              <Sparkles size={14} />
              Automated PyTorch Optimization
            </div>

            <h1 className="font-extrabold" style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
              lineHeight: 1.1,
              marginBottom: '24px',
              color: 'var(--color-text-primary)',
            }}>
              Compress AI Models
              <br />
              <span className="gradient-text">in Seconds</span>
            </h1>

            <p style={{
              fontSize: '1.125rem',
              maxWidth: '520px',
              marginBottom: '40px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.75,
            }}>
              Upload your PyTorch models. Get quantized, pruned, edge-ready weights
              back — with full performance metrics and visual reconstruction fidelity.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '48px' }}>
              <button id="get-started-btn" onClick={onGetStarted}
                className="btn-primary" style={{ fontSize: '1rem' }}>
                Start Compressing
                <ArrowRight size={20} />
              </button>
              <a href="#how-it-works" className="btn-secondary" style={{ textDecoration: 'none', fontSize: '1rem' }}>
                Learn How It Works
              </a>
            </div>

            <div style={{ display: 'flex', gap: '32px' }}>
              {[
                { value: '70%', label: 'Size Reduction' },
                { value: '2×', label: 'Speed Boost' },
                { value: '<1min', label: 'Processing' },
              ].map(({ value, label }) => (
                <div key={label} style={{ textAlign: 'left' }}>
                  <p className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>{value}</p>
                  <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="img-glow">
              <img
                src="/images/hero-illustration.png"
                alt="Neural network compression illustration showing model optimization"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .relative.z-10 > div > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
          .relative.z-10 > div > div > div:last-child {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
