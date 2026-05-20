import { useState } from 'react';
import { Settings2, Cpu, Scissors, ChevronDown, ChevronUp } from 'lucide-react';

export default function CompressionConfig({ config, onConfigChange, onCompress, isDisabled }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateConfig = (key, value) => {
    onConfigChange({ ...config, [key]: value });
  };

  return (
    <div className="glow-card p-8 w-full max-w-2xl mx-auto fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{
            background: 'rgba(5, 150, 105, 0.08)', border: '1px solid rgba(5, 150, 105, 0.18)',
          }}>
            <Settings2 size={22} style={{ color: 'var(--color-accent-primary)' }} />
          </div>
          <div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Compression Settings</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Configure quantization & pruning</p>
          </div>
        </div>
        <button onClick={() => setIsExpanded(!isExpanded)}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover-lift"
          style={{ color: 'var(--color-text-secondary)', background: 'var(--color-bg-elevated)' }}
          id="toggle-config-btn">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-8">
        <label className="flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 hover-lift" style={{
          background: config.quantization ? 'rgba(2, 132, 199, 0.05)' : 'var(--color-bg-elevated)',
          border: `1.5px solid ${config.quantization ? 'rgba(2, 132, 199, 0.25)' : 'var(--color-border)'}`,
          boxShadow: config.quantization ? '0 4px 16px rgba(2, 132, 199, 0.08)' : 'none',
        }}>
          <input type="checkbox" checked={config.quantization}
            onChange={(e) => updateConfig('quantization', e.target.checked)}
            className="sr-only" id="quantization-toggle" />
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300" style={{
            background: config.quantization ? 'linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-sky))' : 'var(--color-border)',
            boxShadow: config.quantization ? '0 3px 10px rgba(2, 132, 199, 0.3)' : 'none',
          }}>
            <Cpu size={18} color="#fff" />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Quantization</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>FP32 → INT8</p>
          </div>
        </label>

        <label className="flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 hover-lift" style={{
          background: config.pruning ? 'rgba(5, 150, 105, 0.05)' : 'var(--color-bg-elevated)',
          border: `1.5px solid ${config.pruning ? 'rgba(5, 150, 105, 0.25)' : 'var(--color-border)'}`,
          boxShadow: config.pruning ? '0 4px 16px rgba(5, 150, 105, 0.08)' : 'none',
        }}>
          <input type="checkbox" checked={config.pruning}
            onChange={(e) => updateConfig('pruning', e.target.checked)}
            className="sr-only" id="pruning-toggle" />
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300" style={{
            background: config.pruning ? 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-teal))' : 'var(--color-border)',
            boxShadow: config.pruning ? '0 3px 10px rgba(5, 150, 105, 0.3)' : 'none',
          }}>
            <Scissors size={18} color="#fff" />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Pruning</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>L1 Unstructured</p>
          </div>
        </label>
      </div>

      {isExpanded && (
        <div className="space-y-6 mb-8 p-6 rounded-2xl fade-in-scale" style={{
          background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)',
        }}>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Model Architecture</label>
            <select value={config.modelType} onChange={(e) => updateConfig('modelType', e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm font-mono"
              style={{ background: '#fff', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', outline: 'none' }}
              id="model-type-select">
              <option value="cnn_autoencoder">CNN Autoencoder</option>
              <option value="ann_autoencoder">ANN Autoencoder</option>
            </select>
          </div>

          {config.pruning && (
            <div>
              <div className="flex justify-between mb-3">
                <label className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Pruning Amount</label>
                <span className="text-sm font-mono font-bold" style={{ color: 'var(--color-accent-primary)' }}>{(config.pruningAmount * 100).toFixed(0)}%</span>
              </div>
              <input type="range" min="0" max="0.95" step="0.05"
                value={config.pruningAmount}
                onChange={(e) => updateConfig('pruningAmount', parseFloat(e.target.value))}
                className="w-full accent-emerald-500" id="pruning-amount-slider" />
            </div>
          )}

          {config.quantization && (
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>Quantization Backend</label>
              <div className="flex gap-3">
                {['fbgemm', 'qnnpack'].map(backend => (
                  <button key={backend} onClick={() => updateConfig('quantizationBackend', backend)}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-mono transition-all duration-300 hover-lift"
                    style={{
                      background: config.quantizationBackend === backend ? 'rgba(2,132,199,0.08)' : 'var(--color-bg-card)',
                      border: `1.5px solid ${config.quantizationBackend === backend ? 'var(--color-accent-blue)' : 'var(--color-border)'}`,
                      color: config.quantizationBackend === backend ? 'var(--color-accent-blue)' : 'var(--color-text-secondary)',
                    }}>
                    {backend}
                    <span className="block text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{backend === 'fbgemm' ? 'x86 CPU' : 'ARM CPU'}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <button onClick={onCompress} disabled={isDisabled}
        className="btn-primary w-full text-base py-4" id="compress-btn">
        {isDisabled ? 'Processing...' : 'Compress Model'}
      </button>
    </div>
  );
}
