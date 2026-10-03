import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Sliders,
  Scale,
  Equal,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Building2,
  TrendingUp,
  ShieldAlert,
  Percent,
  Info,
  DollarSign,
  Briefcase,
} from 'lucide-react';
import {
  BenchmarkPeer,
  BenchmarkSettings,
  PeerGroupWeightingMethod,
  BenchmarkCategoryWeights,
} from '../types';
import { EnhancedIndustryPeerGroup, getDefaultBenchmarkSettings } from '../utils/benchmarkingData';

interface BenchmarkSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  peerGroup: EnhancedIndustryPeerGroup;
  onSaveSettings: (settings: BenchmarkSettings) => void;
  onResetSettings: () => void;
}

export const BenchmarkSettingsModal: React.FC<BenchmarkSettingsModalProps> = ({
  isOpen,
  onClose,
  peerGroup,
  onSaveSettings,
  onResetSettings,
}) => {
  const allPeers = useMemo(() => peerGroup.peers || [], [peerGroup.peers]);

  // Working state initialized from current settings
  const [selectedPeerIds, setSelectedPeerIds] = useState<string[]>([]);
  const [weightingMethod, setWeightingMethod] = useState<PeerGroupWeightingMethod>('market_cap');
  const [customWeights, setCustomWeights] = useState<Record<string, number>>({});
  const [categoryWeights, setCategoryWeights] = useState<BenchmarkCategoryWeights>({
    profitability: 35,
    growth: 25,
    liquidity: 20,
    efficiency: 20,
  });
  const [activeTab, setActiveTab] = useState<'peers' | 'categories'>('peers');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state when modal opens or peerGroup changes
  useEffect(() => {
    if (isOpen) {
      const current = peerGroup.currentSettings || getDefaultBenchmarkSettings(peerGroup);
      setSelectedPeerIds(current.selectedPeerIds && current.selectedPeerIds.length > 0 ? [...current.selectedPeerIds] : allPeers.map(p => p.id));
      setWeightingMethod(current.weightingMethod || 'market_cap');
      setCustomWeights(current.customWeights ? { ...current.customWeights } : {});
      setCategoryWeights(current.categoryWeights ? { ...current.categoryWeights } : {
        profitability: 35,
        growth: 25,
        liquidity: 20,
        efficiency: 20,
      });
      setErrorMessage(null);
    }
  }, [isOpen, peerGroup, allPeers]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Compute live effective weights for preview
  const liveEffectiveWeights = useMemo(() => {
    const weights: Record<string, number> = {};
    const active = allPeers.filter((p) => selectedPeerIds.includes(p.id));
    if (active.length === 0) return weights;

    if (weightingMethod === 'market_cap') {
      const totalCap = active.reduce((sum, p) => sum + p.marketCap, 0) || 1;
      active.forEach((p) => {
        weights[p.id] = (p.marketCap / totalCap) * 100;
      });
    } else if (weightingMethod === 'equal') {
      const eq = 100 / active.length;
      active.forEach((p) => {
        weights[p.id] = eq;
      });
    } else {
      const totalCustom = active.reduce((sum, p) => sum + (customWeights[p.id] ?? 20), 0) || 1;
      active.forEach((p) => {
        weights[p.id] = ((customWeights[p.id] ?? 20) / totalCustom) * 100;
      });
    }
    return weights;
  }, [allPeers, selectedPeerIds, weightingMethod, customWeights]);

  // Aggregates
  const totalEffectiveMarketCap = useMemo(() => {
    return allPeers
      .filter((p) => selectedPeerIds.includes(p.id))
      .reduce((sum, p) => sum + p.marketCap, 0);
  }, [allPeers, selectedPeerIds]);

  const handleTogglePeer = (peerId: string) => {
    setErrorMessage(null);
    if (selectedPeerIds.includes(peerId)) {
      if (selectedPeerIds.length <= 1) {
        setErrorMessage('At least one peer must remain selected for benchmark calculation.');
        return;
      }
      setSelectedPeerIds(selectedPeerIds.filter((id) => id !== peerId));
    } else {
      setSelectedPeerIds([...selectedPeerIds, peerId]);
    }
  };

  const handleSelectAll = () => {
    setErrorMessage(null);
    setSelectedPeerIds(allPeers.map((p) => p.id));
  };

  const handleCustomWeightChange = (peerId: string, value: number) => {
    setCustomWeights((prev) => ({
      ...prev,
      [peerId]: Math.max(0, Math.min(100, value)),
    }));
  };

  const handleNormalizeWeights = () => {
    const active = allPeers.filter((p) => selectedPeerIds.includes(p.id));
    if (active.length === 0) return;
    const currentSum = active.reduce((sum, p) => sum + (customWeights[p.id] || 0), 0);
    if (currentSum === 0) {
      const even = Math.round(100 / active.length);
      const newWeights: Record<string, number> = {};
      active.forEach((p) => {
        newWeights[p.id] = even;
      });
      setCustomWeights(newWeights);
      return;
    }
    const newWeights: Record<string, number> = { ...customWeights };
    active.forEach((p) => {
      newWeights[p.id] = Math.round(((customWeights[p.id] || 0) / currentSum) * 100);
    });
    setCustomWeights(newWeights);
  };

  const handleApply = () => {
    if (selectedPeerIds.length === 0) {
      setErrorMessage('Please select at least one peer company.');
      return;
    }
    onSaveSettings({
      selectedPeerIds,
      weightingMethod,
      customWeights,
      categoryWeights,
    });
    onClose();
  };

  const handleReset = () => {
    onResetSettings();
    const defaults = getDefaultBenchmarkSettings(peerGroup);
    setSelectedPeerIds(defaults.selectedPeerIds);
    setWeightingMethod(defaults.weightingMethod);
    setCustomWeights(defaults.customWeights);
    setCategoryWeights(defaults.categoryWeights);
    setErrorMessage(null);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#121214] border border-[#27272a] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-[#27272a] flex items-center justify-between bg-[#18181b]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                Benchmark Settings & Peer Group Algorithm
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  Custom Weights
                </span>
              </h2>
              <p className="text-xs text-[#a1a1aa]">
                Cohort: <span className="text-white font-medium">{peerGroup.name}</span> &bull; Select peer companies and choose weighting method.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#71717a] hover:text-white rounded-lg hover:bg-[#27272a] transition-colors"
            title="Close modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#27272a] bg-[#141416] px-5 pt-2 gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('peers')}
            className={`pb-2.5 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'peers'
                ? 'border-indigo-500 text-white font-semibold'
                : 'border-transparent text-[#71717a] hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Peer Selection & Weighting ({selectedPeerIds.length}/{allPeers.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-2.5 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'categories'
                ? 'border-indigo-500 text-white font-semibold'
                : 'border-transparent text-[#71717a] hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Category Score Priorities
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 flex items-center gap-2 text-xs">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'peers' && (
            <>
              {/* Algorithm Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white uppercase tracking-wider block">
                  Peer Weighting Algorithm
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setWeightingMethod('market_cap')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      weightingMethod === 'market_cap'
                        ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/30'
                        : 'bg-[#18181b] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs flex items-center gap-1.5 text-white">
                        <Scale className="w-3.5 h-3.5 text-indigo-400" />
                        Market-Cap Weighted
                      </span>
                      {weightingMethod === 'market_cap' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-[#71717a] leading-relaxed">
                      Proportional to company market cap ($B). Industry giants exert higher influence.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWeightingMethod('equal')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      weightingMethod === 'equal'
                        ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/30'
                        : 'bg-[#18181b] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs flex items-center gap-1.5 text-white">
                        <Equal className="w-3.5 h-3.5 text-emerald-400" />
                        Equal-Weighted (1/N)
                      </span>
                      {weightingMethod === 'equal' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-[#71717a] leading-relaxed">
                      All active peers hold identical statistical weighting regardless of scale.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWeightingMethod('custom')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      weightingMethod === 'custom'
                        ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/30'
                        : 'bg-[#18181b] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs flex items-center gap-1.5 text-white">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                        Custom Sliders
                      </span>
                      {weightingMethod === 'custom' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-[#71717a] leading-relaxed">
                      Manually fine-tune individual peer percentages to reflect your strategic focus.
                    </p>
                  </button>
                </div>
              </div>

              {/* Peer Companies Selection Header */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-1 border-b border-[#27272a]">
                  <div>
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                      Included Peer Companies ({selectedPeerIds.length} of {allPeers.length} Active)
                    </h3>
                    <span className="text-[11px] text-[#71717a]">
                      Effective Aggregate Market Cap: ${(totalEffectiveMarketCap / 1000000000).toFixed(2)}B
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {weightingMethod === 'custom' && (
                      <button
                        type="button"
                        onClick={handleNormalizeWeights}
                        className="px-2.5 py-1 text-[11px] font-medium text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
                      >
                        Normalize Weights
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="px-2.5 py-1 text-[11px] font-medium text-[#a1a1aa] hover:text-white bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] rounded-lg transition-colors"
                    >
                      Select All
                    </button>
                  </div>
                </div>

                {/* Peer Cards List */}
                <div className="space-y-2.5">
                  {allPeers.map((peer: BenchmarkPeer) => {
                    const isSelected = selectedPeerIds.includes(peer.id);
                    const liveWeight = liveEffectiveWeights[peer.id] || 0;

                    return (
                      <div
                        key={peer.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-[#18181b] border-[#3f3f46]'
                            : 'bg-[#121214] border-[#27272a]/60 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleTogglePeer(peer.id)}
                              className="mt-1 w-4 h-4 rounded border-[#3f3f46] text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                              id={`peer-chk-${peer.id}`}
                            />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <label
                                  htmlFor={`peer-chk-${peer.id}`}
                                  className="font-semibold text-white text-xs cursor-pointer hover:text-indigo-300 transition-colors"
                                >
                                  {peer.name}
                                </label>
                                <span className="px-1.5 py-0.5 rounded bg-[#27272a] text-[#a1a1aa] font-mono text-[10px] font-medium">
                                  {peer.ticker}
                                </span>
                                <span className="text-[11px] text-[#71717a] font-mono">
                                  Cap: {peer.marketCapFormatted}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#71717a] mt-0.5">
                                {peer.description}
                              </p>
                              {/* Mini ratios pill strip */}
                              <div className="flex items-center gap-3 mt-2 text-[10px] text-[#a1a1aa] font-mono">
                                <span>Gross Margin: <strong className="text-white">{peer.metrics.grossProfitMargin}%</strong></span>
                                <span>Growth: <strong className="text-emerald-400">+{peer.metrics.revenueGrowthYoY}%</strong></span>
                                <span>Op Margin: <strong className="text-white">{peer.metrics.operatingMargin}%</strong></span>
                              </div>
                            </div>
                          </div>

                          {/* Weight Indicator / Slider */}
                          <div className="flex flex-col items-end flex-shrink-0 min-w-[110px]">
                            <span className="text-[10px] text-[#71717a] uppercase font-mono">Weighting</span>
                            <span
                              className={`text-xs font-mono font-bold px-2 py-0.5 rounded mt-0.5 ${
                                isSelected
                                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                                  : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                              }`}
                            >
                              {isSelected ? `${liveWeight.toFixed(1)}%` : 'Excluded'}
                            </span>
                          </div>
                        </div>

                        {/* Custom Weight Slider if weightingMethod === 'custom' and peer is selected */}
                        {weightingMethod === 'custom' && isSelected && (
                          <div className="mt-3 pt-2.5 border-t border-[#27272a] flex items-center gap-3">
                            <span className="text-[11px] text-[#a1a1aa] whitespace-nowrap">
                              Custom Weight Factor:
                            </span>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={5}
                              value={customWeights[peer.id] ?? 20}
                              onChange={(e) => handleCustomWeightChange(peer.id, Number(e.target.value))}
                              className="w-full accent-indigo-500 h-1.5 bg-[#27272a] rounded-lg cursor-pointer"
                            />
                            <span className="font-mono text-xs font-bold text-white w-10 text-right">
                              {customWeights[peer.id] ?? 20}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-start gap-3">
                <Info className="w-4 h-4 flex-shrink-0 text-indigo-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Composite Score Prioritization</p>
                  <p className="text-[11px] text-[#a1a1aa] mt-0.5 leading-relaxed">
                    Adjust the relative weighting assigned to each fundamental performance dimension when computing {peerGroup.name}'s overall percentile rank.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Profitability */}
                <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white text-xs block">Profitability & Margins</span>
                      <span className="text-[11px] text-[#71717a]">
                        Gross Margin, Operating Margin (EBIT)
                      </span>
                    </div>
                    <span className="text-sm font-bold font-mono text-indigo-400">
                      {categoryWeights.profitability}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={60}
                    step={5}
                    value={categoryWeights.profitability}
                    onChange={(e) =>
                      setCategoryWeights({ ...categoryWeights, profitability: Number(e.target.value) })
                    }
                    className="w-full accent-indigo-500 h-1.5 bg-[#27272a] rounded-lg cursor-pointer"
                  />
                </div>

                {/* Growth */}
                <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white text-xs block">Top-Line Growth Velocity</span>
                      <span className="text-[11px] text-[#71717a]">
                        Year-over-Year Revenue Growth
                      </span>
                    </div>
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      {categoryWeights.growth}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={60}
                    step={5}
                    value={categoryWeights.growth}
                    onChange={(e) =>
                      setCategoryWeights({ ...categoryWeights, growth: Number(e.target.value) })
                    }
                    className="w-full accent-emerald-500 h-1.5 bg-[#27272a] rounded-lg cursor-pointer"
                  />
                </div>

                {/* Liquidity & Solvency */}
                <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white text-xs block">Liquidity & Balance Sheet Solvency</span>
                      <span className="text-[11px] text-[#71717a]">
                        Current Ratio, Debt-to-Equity Leverage
                      </span>
                    </div>
                    <span className="text-sm font-bold font-mono text-blue-400">
                      {categoryWeights.liquidity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={60}
                    step={5}
                    value={categoryWeights.liquidity}
                    onChange={(e) =>
                      setCategoryWeights({ ...categoryWeights, liquidity: Number(e.target.value) })
                    }
                    className="w-full accent-blue-500 h-1.5 bg-[#27272a] rounded-lg cursor-pointer"
                  />
                </div>

                {/* Efficiency */}
                <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white text-xs block">Capital & Working Capital Efficiency</span>
                      <span className="text-[11px] text-[#71717a]">
                        FCF Conversion, Days Sales Outstanding (DSO)
                      </span>
                    </div>
                    <span className="text-sm font-bold font-mono text-amber-400">
                      {categoryWeights.efficiency}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={60}
                    step={5}
                    value={categoryWeights.efficiency}
                    onChange={(e) =>
                      setCategoryWeights({ ...categoryWeights, efficiency: Number(e.target.value) })
                    }
                    className="w-full accent-amber-500 h-1.5 bg-[#27272a] rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-[#27272a] bg-[#18181b] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-[#a1a1aa] hover:text-white bg-[#09090b] hover:bg-[#27272a] border border-[#27272a] rounded-xl transition-colors font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Sector Defaults
          </button>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#a1a1aa] hover:text-white rounded-xl hover:bg-[#27272a] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Apply & Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
