import { HardDrive, Clock, TrendingDown, Zap, Download, ArrowDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ResultsDashboard({ results, jobId, downloadUrl }) {
  if (!results) return null;

  const {
    original_size_mb, compressed_size_mb, compression_ratio,
    original_latency_ms, compressed_latency_ms, speedup,
    original_reconstructions = [], compressed_reconstructions = [],
  } = results;

  const sizeChartData = [
    { name: 'Original', value: original_size_mb, fill: '#0284c7' },
    { name: 'Compressed', value: compressed_size_mb, fill: '#059669' },
  ];
  const latencyChartData = [
    { name: 'Original', value: original_latency_ms, fill: '#d97706' },
    { name: 'Compressed', value: compressed_latency_ms, fill: '#14b8a6' },
  ];

  const metrics = [
    { label: 'Original Size', value: `${original_size_mb?.toFixed(2)} MB`, icon: <HardDrive size={18} />, color: 'var(--color-accent-blue)', bg: 'rgba(2,132,199,0.06)' },
    { label: 'Compressed Size', value: `${compressed_size_mb?.toFixed(2)} MB`, icon: <TrendingDown size={18} />, color: 'var(--color-accent-teal)', bg: 'rgba(20,184,166,0.06)', highlight: true },
    { label: 'Compression Ratio', value: compression_ratio, icon: <ArrowDown size={18} />, color: 'var(--color-accent-green)', bg: 'rgba(22,163,74,0.06)', highlight: true },
    { label: 'Original Latency', value: `${original_latency_ms?.toFixed(2)} ms`, icon: <Clock size={18} />, color: 'var(--color-accent-amber)', bg: 'rgba(217,119,6,0.06)' },
    { label: 'Compressed Latency', value: `${compressed_latency_ms?.toFixed(2)} ms`, icon: <Zap size={18} />, color: 'var(--color-accent-primary)', bg: 'rgba(5,150,105,0.06)', highlight: true },
    { label: 'Speedup', value: speedup, icon: <Zap size={18} />, color: 'var(--color-accent-sky)', bg: 'rgba(14,165,233,0.06)', highlight: true },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-xl text-sm" style={{ background: '#fff', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
          <p className="font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
          <p style={{ color: payload[0].fill }}>{payload[0].value?.toFixed(3)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 fade-in-up">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold mb-3" style={{ color: 'var(--color-text-primary)' }}>
          Compression <span className="gradient-text">Results</span>
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Job ID: <span className="font-mono">{jobId}</span></p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {metrics.map(({ label, value, icon, color, bg, highlight }, idx) => (
          <div key={label} className="metric-card hover-lift fade-in-scale"
            style={{ animationDelay: `${idx * 0.08}s`, background: bg, borderColor: highlight ? `${color}30` : 'var(--color-border)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, color }}>{icon}</div>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
            </div>
            <p className="text-2xl font-extrabold font-mono" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glow-card p-6">
          <h3 className="text-lg font-bold mb-5" style={{ color: 'var(--color-text-primary)' }}>Model Size (MB)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sizeChartData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>{sizeChartData.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glow-card p-6">
          <h3 className="text-lg font-bold mb-5" style={{ color: 'var(--color-text-primary)' }}>Inference Latency (ms)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={latencyChartData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>{latencyChartData.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {original_reconstructions.length > 0 && (
        <div className="glow-card p-8">
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Reconstruction Fidelity</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>EMNIST test samples — Original (top) vs Compressed (bottom)</p>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-accent-blue)' }}>Original</p>
              <div className="flex gap-3 flex-wrap">
                {original_reconstructions.slice(0, 8).map((img, i) => (
                  <div key={`orig-${i}`} className="rounded-xl overflow-hidden hover-lift" style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xs)' }}>
                    <img src={`data:image/png;base64,${img}`} alt={`Original ${i + 1}`} className="w-16 h-16 sm:w-20 sm:h-20" style={{ imageRendering: 'pixelated' }} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-accent-primary)' }}>Compressed</p>
              <div className="flex gap-3 flex-wrap">
                {compressed_reconstructions.slice(0, 8).map((img, i) => (
                  <div key={`comp-${i}`} className="rounded-xl overflow-hidden hover-lift" style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xs)' }}>
                    <img src={`data:image/png;base64,${img}`} alt={`Compressed ${i + 1}`} className="w-16 h-16 sm:w-20 sm:h-20" style={{ imageRendering: 'pixelated' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <a href={downloadUrl} download className="btn-primary text-base px-10 py-4" id="download-compressed-btn">
          <Download size={20} /> Download Compressed Model
        </a>
      </div>
    </div>
  );
}
