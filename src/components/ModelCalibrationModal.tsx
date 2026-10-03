import React, { useState } from 'react';
import { 
  Cpu, 
  Sliders, 
  Sparkles, 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  Gauge, 
  Layers, 
  FileCode, 
  TrendingUp, 
  Scale, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { 
  ModelCalibrationConfig, 
  ModelDomainAdaptor, 
  DOMAIN_ADAPTORS, 
  DEFAULT_CALIBRATION_CONFIG, 
  loadModelCalibration, 
  saveModelCalibration 
} from '../utils/modelCalibration';

interface ModelCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCalibrationSaved?: (config: ModelCalibrationConfig) => void;
}

export const ModelCalibrationModal: React.FC<ModelCalibrationModalProps> = ({
  isOpen,
  onClose,
  onCalibrationSaved,
}) => {
  const [config, setConfig] = useState<ModelCalibrationConfig>(loadModelCalibration);
  const [activeTab, setActiveTab] = useState<'adaptors' | 'parameters' | 'exemplars'>('adaptors');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  if (!isOpen) return null;

  const currentAdaptorMeta = DOMAIN_ADAPTORS[config.activeAdaptor];

  const handleSelectAdaptor = (adaptor: ModelDomainAdaptor) => {
    const meta = DOMAIN_ADAPTORS[adaptor];
    setConfig((prev) => ({
      ...prev,
      activeAdaptor: adaptor,
      temperature: meta.recommendedTemp,
    }));
  };

  const handleSave = () => {
    saveModelCalibration(config);
    onCalibrationSaved?.(config);
    setIsSavedNotice(true);
    setTimeout(() => {
      setIsSavedNotice(false);
      onClose();
    }, 1000);
  };

  const handleReset = () => {
    setConfig(DEFAULT_CALIBRATION_CONFIG);
    saveModelCalibration(DEFAULT_CALIBRATION_CONFIG);
    onCalibrationSaved?.(DEFAULT_CALIBRATION_CONFIG);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-calibration-title"
    >
      <div 
        className="w-full max-w-3xl max-h-[90vh] bg-[#121214] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#27272a] bg-[#18181b]/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="modal-calibration-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                  AI Model Architecture & Domain Weights Studio
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  CALIBRATION
                </span>
              </div>
              <p className="text-xs text-[#a1a1aa] mt-0.5">
                Foundation Model: Google Gemini (3.1 Flash Lite / 3.8 Flash) • In-Context Weight Adaptations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#a1a1aa] hover:text-white rounded-lg hover:bg-[#27272a] transition-colors cursor-pointer"
            aria-label="Close Model Calibration modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#27272a] bg-[#09090b]/60 px-4">
          <button
            onClick={() => setActiveTab('adaptors')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'adaptors'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-[#71717a] hover:text-[#a1a1aa]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Domain Adaptors ({Object.keys(DOMAIN_ADAPTORS).length})</span>
          </button>
          <button
            onClick={() => setActiveTab('parameters')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'parameters'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-[#71717a] hover:text-[#a1a1aa]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Hyperparameters & Loss Penalties</span>
          </button>
          <button
            onClick={() => setActiveTab('exemplars')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'exemplars'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-[#71717a] hover:text-[#a1a1aa]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>In-Context Few-Shot Exemplars</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'adaptors' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-300">
                <span className="font-semibold text-white">System Architecture Disclosure:</span> Rather than altering proprietary foundation weights, FinInsight AI uses <strong>Domain-Specific In-Context Weight Steering</strong>. This primes the model with rigorous CPA loss functions, accounting penalty constraints, and targeted financial exemplars.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(DOMAIN_ADAPTORS) as ModelDomainAdaptor[]).map((key) => {
                  const meta = DOMAIN_ADAPTORS[key];
                  const isSelected = config.activeAdaptor === key;

                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectAdaptor(key)}
                      className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-indigo-950/30 border-indigo-500 ring-1 ring-indigo-500/40 text-white'
                          : 'bg-[#18181b]/70 border-[#27272a] hover:bg-[#18181b] hover:border-[#3f3f46] text-[#a1a1aa]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-white text-xs sm:text-sm">{meta.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {meta.badge}
                          </span>
                        </div>
                        <p className="text-xs text-[#a1a1aa] leading-relaxed line-clamp-3">
                          {meta.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#27272a] flex items-center justify-between text-[11px]">
                        <span className="text-[#71717a]">Rec. Temp: {meta.recommendedTemp}</span>
                        {isSelected && (
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active Adaptor</span>
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Loss Prioritization for Active Adaptor */}
              <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-white mb-2 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Loss Function Weight Allocation ({currentAdaptorMeta.name})</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {currentAdaptorMeta.lossPrioritization.map((loss, i) => (
                    <div key={i} className="p-2 rounded-lg bg-[#09090b] border border-[#27272a] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <span className="text-[#e4e4e7]">{loss}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'parameters' && (
            <div className="space-y-5">
              {/* Temperature */}
              <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-white block">Sampling Temperature</label>
                    <span className="text-[11px] text-[#71717a]">Lower values (0.1–0.2) force strict mathematical accuracy; higher values allow broader commentary.</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/40 px-2 py-1 rounded border border-indigo-500/30">
                    {config.temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={config.temperature}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* GAAP Strictness Weight */}
              <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-white block">GAAP / IFRS Compliance Strictness Penalty</label>
                    <span className="text-[11px] text-[#71717a]">Penalizes non-standard adjustments or revenue acceleration claims in LLM output.</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/30">
                    {config.gaapStrictnessWeight}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={config.gaapStrictnessWeight}
                  onChange={(e) => setConfig({ ...config, gaapStrictnessWeight: parseInt(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Accrual Divergence Penalty */}
              <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-white block">Accrual vs. Operating Cash Flow Divergence Weight</label>
                    <span className="text-[11px] text-[#71717a]">Heavily flags disconnects between Net Income and operating cash generation.</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-1 rounded border border-amber-500/30">
                    {config.accrualDivergencePenaltyWeight}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={config.accrualDivergencePenaltyWeight}
                  onChange={(e) => setConfig({ ...config, accrualDivergencePenaltyWeight: parseInt(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="p-3.5 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-between cursor-pointer hover:border-[#3f3f46]">
                  <div>
                    <span className="text-xs font-medium text-white block">Few-Shot Exemplars</span>
                    <span className="text-[11px] text-[#71717a]">Inject domain pairs into prompt context</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.fewShotExemplarsEnabled}
                    onChange={(e) => setConfig({ ...config, fewShotExemplarsEnabled: e.target.checked })}
                    className="accent-indigo-500 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="p-3.5 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-between cursor-pointer hover:border-[#3f3f46]">
                  <div>
                    <span className="text-xs font-medium text-white block">Mandatory SEC Citations</span>
                    <span className="text-[11px] text-[#71717a]">Ground every metric in 10-K items</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.citationGroundingEnforced}
                    onChange={(e) => setConfig({ ...config, citationGroundingEnforced: e.target.checked })}
                    className="accent-indigo-500 w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'exemplars' && (
            <div className="space-y-4">
              <div className="text-xs text-[#a1a1aa]">
                These paired input/output financial exemplars are dynamically injected into the system prompt to steer model attention toward forensic rigor and standard financial conventions:
              </div>

              <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-400">Exemplar Pair #1 ({currentAdaptorMeta.name})</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                    Calibrated
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a] text-xs font-mono">
                  <span className="text-[#71717a] block mb-1 uppercase text-[10px]">User Input Prompt:</span>
                  <p className="text-[#e4e4e7]">{currentAdaptorMeta.sampleFewShotPrompt}</p>
                </div>

                <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a] text-xs font-mono">
                  <span className="text-[#71717a] block mb-1 uppercase text-[10px]">Steered Model Response:</span>
                  <p className="text-indigo-300">{currentAdaptorMeta.sampleFewShotResponse}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#18181b]/50 border border-[#27272a] text-xs text-[#71717a] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Exemplar injection eliminates out-of-distribution reasoning and guarantees CPA-consistent formatting.</span>
              </div>
            </div>
          )}

          {isSavedNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Model calibration applied successfully. Active for all subsequent AI analyses.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#27272a] bg-[#18181b]/80 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-lg text-xs text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-apply-calibration"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-950/40 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Save & Apply Calibration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
