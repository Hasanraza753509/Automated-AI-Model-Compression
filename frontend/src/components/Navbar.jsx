import { useState, useEffect } from 'react';
import { Cpu, Zap, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pipeline', href: '#pipeline' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500" style={{
      background: scrolled ? 'rgba(245, 240, 232, 0.92)' : 'rgba(245, 240, 232, 0.5)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: `1px solid ${scrolled ? 'var(--color-border)' : 'transparent'}`,
      boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
    }}>
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
        <a href="#" className="flex items-center gap-3 group" style={{ textDecoration: 'none' }}>
          <div className="relative">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" style={{
              background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-teal))',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
            }}>
              <Cpu size={22} color="#fff" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full animate-pulse" style={{
              background: 'var(--color-accent-green)',
              boxShadow: '0 0 8px var(--color-accent-green)',
            }} />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            <span className="gradient-text">Compress</span>
            <span style={{ color: 'var(--color-text-primary)' }}>AI</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ label, href }) => (
            <a key={label} href={href}
              className="text-sm font-semibold transition-all duration-300"
              style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}
              onMouseEnter={e => { e.target.style.color = 'var(--color-accent-primary)'; }}
              onMouseLeave={e => { e.target.style.color = 'var(--color-text-secondary)'; }}>
              {label}
            </a>
          ))}
          <div className="badge" style={{
            background: 'rgba(22, 163, 74, 0.08)',
            border: '1px solid rgba(22, 163, 74, 0.2)',
            color: 'var(--color-accent-green)',
          }}>
            <Zap size={12} />
            v0.1.0 MVP
          </div>
        </div>

        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}
          style={{ color: 'var(--color-text-primary)', background: 'none', border: 'none' }}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden px-6 pb-4 fade-in-scale" style={{
          background: 'rgba(245, 240, 232, 0.98)',
          borderTop: '1px solid var(--color-border)',
        }}>
          {navLinks.map(({ label, href }) => (
            <a key={label} href={href}
              className="block py-3 text-sm font-semibold"
              style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}
              onClick={() => setMobileOpen(false)}>
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
