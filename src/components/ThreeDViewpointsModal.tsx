import React, { useState } from 'react';
import { 
  Bookmark, 
  BookmarkPlus, 
  X, 
  Check, 
  Download, 
  Upload, 
  Copy, 
  Trash2, 
  ChevronRight, 
  Split, 
  Eye, 
  Compass,
  Layers3,
  BarChart2,
  Activity,
  FileText,
  Clock,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { ThreeDViewpoint, CurrencyCode } from '../types';

interface ThreeDViewpointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: Omit<ThreeDViewpoint, 'id' | 'createdAt' | 'name'>;
  savedViewpoints: ThreeDViewpoint[];
  onSaveViewpoint: (name: string, description?: string) => void;
  onApplyViewpoint: (viewpoint: ThreeDViewpoint) => void;
  onDeleteViewpoint: (id: string) => void;
  onImportViewpoint?: (viewpoint: ThreeDViewpoint) => void;
  currency: CurrencyCode;
}

export const INSTITUTIONAL_PRESET_VIEWPOINTS: ThreeDViewpoint[] = [
  {
    id: 'preset-cash-liquidity',
    name: 'Treasury & Immediate Liquidity Sweeps',
    description: 'Explodes Cash & Equivalents into operating sweeps, commercial paper, and short-term sovereign T-Bills.',
    createdAt: 'Built-in Institutional Preset',
    viewMode: 'capital-tower',
    period: 'FY2024',
    explodedNodes: ['Cash & Equivalents'],
    lastExplodedNode: 'Cash & Equivalents',
    selectedSubAccountCode: 'GL-1010',
    camera: {
      theta: 0.82,
      phi: 0.58,
      radius: 22,
      isIsometric: false,
    },
    colorTheme: 'obsidian-emerald',
    drillDownPath: [
      { level: 0, label: 'Consolidated Monolith', type: 'root' },
      { level: 1, label: 'Current Assets', type: 'category' },
      { level: 2, label: 'Cash & Equivalents', type: 'node' },
      { level: 3, label: 'GL-1010 Operating Checking & Sweeps', type: 'subaccount' },
    ],
  },
  {
    id: 'preset-working-capital',
    name: 'Working Capital & Trade Receivables Slices',
    description: 'Bifurcates Accounts Receivable and Inventory into enterprise contracts, public sector receivables, and raw components.',
    createdAt: 'Built-in Institutional Preset',
    viewMode: 'capital-tower',
    period: 'FY2024',
    explodedNodes: ['Accounts Receivable', 'Inventories & Supplies'],
    lastExplodedNode: 'Accounts Receivable',
    selectedSubAccountCode: 'GL-1110',
    camera: {
      theta: 0.95,
      phi: 0.62,
      radius: 24,
      isIsometric: false,
    },
    colorTheme: 'titanium',
    drillDownPath: [
      { level: 0, label: 'Consolidated Monolith', type: 'root' },
      { level: 1, label: 'Current Assets', type: 'category' },
      { level: 2, label: 'Accounts Receivable', type: 'node' },
      { level: 3, label: 'GL-1110 Enterprise Commercial Contracts', type: 'subaccount' },
    ],
  },
  {
    id: 'preset-capital-structure',
    name: 'Capital Structure & Senior Debt Covenants',
    description: 'Inspects Current Liabilities and Long-Term Senior Notes to evaluate debt-to-equity equilibrium and covenant coverage.',
    createdAt: 'Built-in Institutional Preset',
    viewMode: 'capital-tower',
    period: 'FY2024',
    explodedNodes: ['Current Liabilities', 'Long-Term Senior Debt'],
    lastExplodedNode: 'Long-Term Senior Debt',
    selectedSubAccountCode: 'GL-2110',
    camera: {
      theta: 2.35,
      phi: 0.52,
      radius: 23,
      isIsometric: false,
    },
    colorTheme: 'slate-sapphire',
    drillDownPath: [
      { level: 0, label: 'Consolidated Monolith', type: 'root' },
      { level: 1, label: 'Claims & Capital', type: 'category' },
      { level: 2, label: 'Long-Term Senior Debt', type: 'node' },
      { level: 3, label: 'GL-2110 Senior Secured Notes (5.75%)', type: 'subaccount' },
    ],
  },
  {
    id: 'preset-cashflow-waterfall',
    name: 'Free Cash Flow Generation & CapEx Reinvestment',
    description: 'Explodes Operating Cash Flow into collections, payroll, and server compute alongside CapEx infrastructure investments.',
    createdAt: 'Built-in Institutional Preset',
    viewMode: 'cashflow-waterfall',
    period: 'FY2024',
    explodedNodes: ['Operating Cash Flow', 'Capital Expenditures (CapEx)'],
    lastExplodedNode: 'Operating Cash Flow',
    selectedSubAccountCode: 'CF-101',
    camera: {
      theta: 0.45,
      phi: 0.68,
      radius: 26,
      isIsometric: false,
    },
    colorTheme: 'champagne-gold',
    drillDownPath: [
      { level: 0, label: 'Cash Flow Waterfall', type: 'root' },
      { level: 1, label: 'Operational Activities', type: 'category' },
      { level: 2, label: 'Operating Cash Flow', type: 'node' },
      { level: 3, label: 'CF-101 Customer Cash Collections', type: 'subaccount' },
    ],
  },
  {
    id: 'preset-dupont-tree',
    name: 'DuPont Return on Equity Multi-Tier Decomposition',
    description: 'Deconstructs ROE into Net Margin, Asset Turnover, and Financial Leverage orbitals with full constituent drivers.',
    createdAt: 'Built-in Institutional Preset',
    viewMode: 'dupont-tree',
    period: 'FY2024',
    explodedNodes: ['Net Profit Margin', 'Asset Turnover Ratio'],
    lastExplodedNode: 'Net Profit Margin',
    camera: {
      theta: 0.65,
      phi: 0.55,
      radius: 24,
      isIsometric: false,
    },
    colorTheme: 'titanium',
    drillDownPath: [
      { level: 0, label: 'DuPont Spatial Tree', type: 'root' },
      { level: 1, label: 'Profitability Pillar', type: 'category' },
      { level: 2, label: 'Net Profit Margin', type: 'node' },
    ],
  },
];

export const ThreeDViewpointsModal: React.FC<ThreeDViewpointsModalProps> = ({
  isOpen,
  onClose,
  currentState,
  savedViewpoints,
  onSaveViewpoint,
  onApplyViewpoint,
  onDeleteViewpoint,
  onImportViewpoint,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'custom' | 'presets'>('all');

  if (!isOpen) return null;

  // Auto-generate suggested title
  const defaultSuggestedTitle = (() => {
    if (currentState.lastExplodedNode) {
      return `${currentState.lastExplodedNode} Deep-Dive (${currentState.period})`;
    }
    if (currentState.explodedNodes.length > 0) {
      return `${currentState.explodedNodes[0]} & ${currentState.explodedNodes.length - 1} Sub-Ledgers (${currentState.period})`;
    }
    return `Consolidated 3D Financial View (${currentState.period})`;
  })();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const titleToUse = newTitle.trim() || defaultSuggestedTitle;
    onSaveViewpoint(titleToUse, newDesc.trim() || undefined);
    setNewTitle('');
    setNewDesc('');
  };

  const handleCopyPath = (vp: ThreeDViewpoint) => {
    const pathString = (vp.drillDownPath ?? []).map((s) => s.label).join(' › ');
    const exportString = `3D Spatial Financial Viewpoint: "${vp.name}"\n` +
      `Filing Period: ${vp.period}\n` +
      `View Mode: ${vp.viewMode}\n` +
      `Exploded Sub-Ledgers: ${(vp.explodedNodes ?? []).join(', ') || 'None (Consolidated)'}\n` +
      `Drill-Down Path: ${pathString}`;
    
    navigator.clipboard.writeText(exportString);
    setCopiedId(vp.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJson = (vp: ThreeDViewpoint) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(vp, null, 2));
    const downloadAnchor = document.createElement('a');
    const safeName = vp.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `financial-viewpoint-${safeName}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportViewpoint) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as ThreeDViewpoint;
        if (parsed.viewMode && parsed.period) {
          onImportViewpoint({
            ...parsed,
            id: `imported-${Date.now()}`,
            name: parsed.name ? `(Imported) ${parsed.name}` : `Imported Viewpoint`,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("Invalid Viewpoint JSON", err);
      }
    };
    reader.readAsText(file);
  };

  const allViewpoints = [
    ...savedViewpoints,
    ...INSTITUTIONAL_PRESET_VIEWPOINTS,
  ];

  const displayedList = activeTab === 'custom'
    ? savedViewpoints
    : activeTab === 'presets'
    ? INSTITUTIONAL_PRESET_VIEWPOINTS
    : allViewpoints;

  const getViewModeIcon = (mode: ThreeDViewpoint['viewMode']) => {
    switch (mode) {
      case 'capital-tower':
        return <Layers3 className="w-3.5 h-3.5 text-indigo-400" />;
      case 'risk-terrain':
        return <Compass className="w-3.5 h-3.5 text-emerald-400" />;
      case 'dupont-tree':
        return <Activity className="w-3.5 h-3.5 text-cyan-400" />;
      case 'cashflow-waterfall':
        return <BarChart2 className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#121215] border border-[#27272a] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#27272a] flex items-center justify-between bg-[#18181b]/80">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Bookmark className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span>3D Spatial Viewpoint Snapshots</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  State Persistence
                </span>
              </h3>
              <p className="text-xs text-[#a1a1aa] mt-0.5">
                Save, recall, or export exact 3D camera viewpoints, drill-down trajectories, and exploded sub-ledger states.
              </p>
            </div>
          </div>

          <button
            id="btn-close-viewpoints-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">

          {/* Section 1: Save Current Viewpoint Snapshot Form */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-white flex items-center gap-1.5 font-mono uppercase tracking-wider">
                <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>Capture Current 3D Spatial State</span>
              </h4>

              <div className="text-[11px] font-mono text-[#a1a1aa] flex items-center gap-1">
                <span>Active:</span>
                <strong className="text-indigo-300">{currentState.period}</strong>
                <span>•</span>
                <span className="text-emerald-300">{currentState.explodedNodes.length} Exploded</span>
              </div>
            </div>

            {/* Current path preview */}
            <div className="p-2 rounded-lg bg-[#121215] border border-[#27272a] text-[11px] font-mono flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-[#71717a] shrink-0">Current Path:</span>
              {(currentState.drillDownPath ?? []).map((p, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <ChevronRight className="w-3 h-3 text-[#52525b] shrink-0" />}
                  <span className={`shrink-0 ${i === (currentState.drillDownPath?.length ?? 0) - 1 ? 'text-indigo-300 font-medium' : 'text-[#a1a1aa]'}`}>
                    {p.label}
                  </span>
                </React.Fragment>
              ))}
            </div>

            <form onSubmit={handleSave} className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={defaultSuggestedTitle}
                  className="sm:col-span-2 px-3 py-2 rounded-xl bg-[#121215] border border-[#27272a] text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-indigo-500 transition-all font-mono"
                />

                <button
                  type="submit"
                  id="btn-save-viewpoint-submit"
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Save Snapshot</span>
                </button>
              </div>
              
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Optional analytical annotation or audit thesis note..."
                className="w-full px-3 py-1.5 rounded-xl bg-[#121215] border border-[#27272a] text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-indigo-500 transition-all"
              />
            </form>
          </div>

          {/* Section 2: Viewpoints Filter Tabs & Import Option */}
          <div className="flex items-center justify-between gap-2 border-b border-[#27272a] pb-2">
            <div className="flex items-center gap-1 bg-[#18181b] p-1 rounded-xl border border-[#27272a]">
              <button
                id="btn-filter-all"
                onClick={() => setActiveTab('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'text-[#a1a1aa] hover:text-white'
                }`}
              >
                All ({allViewpoints.length})
              </button>
              <button
                id="btn-filter-custom"
                onClick={() => setActiveTab('custom')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  activeTab === 'custom'
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'text-[#a1a1aa] hover:text-white'
                }`}
              >
                Custom ({savedViewpoints.length})
              </button>
              <button
                id="btn-filter-presets"
                onClick={() => setActiveTab('presets')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  activeTab === 'presets'
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'text-[#a1a1aa] hover:text-white'
                }`}
              >
                Presets ({INSTITUTIONAL_PRESET_VIEWPOINTS.length})
              </button>
            </div>

            {/* Import JSON Snapshot Button */}
            <label className="px-2.5 py-1 rounded-xl bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white border border-[#27272a] text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Import JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </div>

          {/* Section 3: Viewpoints Cards List */}
          <div className="space-y-2.5">
            {displayedList.length === 0 ? (
              <div className="text-center py-8 text-xs font-mono text-[#71717a] bg-[#18181b]/50 rounded-xl border border-dashed border-[#27272a]">
                No viewpoints saved yet. Use the form above to snapshot your current 3D position.
              </div>
            ) : (
              displayedList.map((vp) => {
                const isPreset = vp.id.startsWith('preset-');
                const isCurrentlyActive = 
                  currentState.period === vp.period && 
                  currentState.viewMode === vp.viewMode &&
                  currentState.lastExplodedNode === vp.lastExplodedNode;

                return (
                  <div
                    key={vp.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrentlyActive
                        ? 'bg-indigo-950/30 border-indigo-500/50 shadow-md shadow-indigo-500/5'
                        : 'bg-[#18181b] border-[#27272a] hover:border-[#3f3f46]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getViewModeIcon(vp.viewMode)}
                          <h5 className="text-xs font-semibold text-white font-mono">
                            {vp.name}
                          </h5>
                          {isPreset && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              Preset
                            </span>
                          )}
                          {isCurrentlyActive && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Active
                            </span>
                          )}
                        </div>

                        {vp.description && (
                          <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
                            {vp.description}
                          </p>
                        )}

                        {/* Trajectory / Drill-Down Breadcrumb Path Preview */}
                        <div className="flex items-center gap-1 text-[10px] font-mono text-[#71717a] pt-1">
                          <span className="text-[#52525b]">Path:</span>
                          {(vp.drillDownPath ?? []).map((step, idx) => (
                            <React.Fragment key={idx}>
                              {idx > 0 && <span className="text-[#3f3f46]">›</span>}
                              <span className={idx === (vp.drillDownPath?.length ?? 0) - 1 ? 'text-indigo-300 font-semibold' : 'text-[#a1a1aa]'}>
                                {step.label}
                              </span>
                            </React.Fragment>
                          ))}
                        </div>

                        {/* Telemetry pill row */}
                        <div className="flex items-center gap-2 text-[10px] font-mono text-[#71717a] pt-1">
                          <span>Period: <strong className="text-white">{vp.period}</strong></span>
                          <span>•</span>
                          <span>Exploded: <strong className="text-emerald-400">{vp.explodedNodes.length}</strong></span>
                          <span>•</span>
                          <span>Camera: {vp.camera.isIsometric ? 'Ortho' : 'Persp'} ({vp.camera.radius}m)</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Apply Viewpoint Button */}
                        <button
                          id={`btn-apply-viewpoint-${vp.id}`}
                          onClick={() => {
                            onApplyViewpoint(vp);
                            onClose();
                          }}
                          title="Restore this viewpoint immediately in 3D"
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Apply</span>
                        </button>

                        {/* Copy Path Summary */}
                        <button
                          onClick={() => handleCopyPath(vp)}
                          title="Copy step-by-step drill-down path to clipboard"
                          className="p-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#a1a1aa] hover:text-white transition-all cursor-pointer"
                        >
                          {copiedId === vp.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Export JSON Download */}
                        <button
                          onClick={() => handleExportJson(vp)}
                          title="Export viewpoint as JSON file"
                          className="p-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#a1a1aa] hover:text-white transition-all cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete (if user custom viewpoint) */}
                        {!isPreset && (
                          <button
                            onClick={() => onDeleteViewpoint(vp.id)}
                            title="Delete custom viewpoint"
                            className="p-1.5 rounded-lg bg-[#27272a] hover:bg-rose-950/60 text-[#a1a1aa] hover:text-rose-300 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-[#27272a] bg-[#18181b]/90 flex items-center justify-between text-xs text-[#71717a] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>State Synchronizer Active • Local Persistence Enabled</span>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-white transition-all cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
