import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  X, 
  TrendingUp, 
  Sparkles, 
  Users, 
  ScanEye, 
  Compass, 
  ShieldAlert, 
  FileSpreadsheet, 
  DollarSign, 
  MessageSquareText, 
  Lock, 
  Download, 
  Terminal, 
  RefreshCw, 
  Keyboard, 
  CornerDownLeft, 
  Building2, 
  Globe, 
  Shield, 
  ShieldCheck,
  Check, 
  ArrowRight,
  Sliders,
  Cpu
} from 'lucide-react';
import { FinancialDataset, CurrencyCode, UserRole, WorkspaceType } from '../types';
import { SAMPLE_DATASETS } from '../data/sampleDatasets';
import { CURRENCIES } from '../data/currenciesAndFiscal';
import { USER_ROLES } from '../utils/encryption';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
  onToggleChat: () => void;
  onToggleCollab: () => void;
  onToggleAiInsight?: () => void;
  onToggleDataMask: () => void;
  isDataMasked: boolean;
  onExportPdf: () => void;
  onOpenAuditModal: () => void;
  onOpenErpModal: () => void;
  onOpenShortcutsHelp: () => void;
  onOpenAccountCenter?: () => void;
  isDemoMode?: boolean;
  currentDataset: FinancialDataset;
  onSelectDataset: (dataset: FinancialDataset) => void;
  currentCurrency: CurrencyCode;
  onSelectCurrency: (currency: CurrencyCode) => void;
  currentUserRole: UserRole;
  onSelectUserRole: (role: UserRole) => void;
  onStartTour?: () => void;
  onTriggerErpReconciliation?: () => void;
  isReconciling?: boolean;
  workspaceType?: WorkspaceType;
  onOpenSecEdgar?: () => void;
  onOpenModelCalibration?: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Navigation' | 'Actions & Tools' | 'Companies / Datasets' | 'Currencies' | 'User Role & Access';
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
  badge?: string;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onToggleChat,
  onToggleCollab,
  onToggleAiInsight,
  onToggleDataMask,
  isDataMasked,
  onExportPdf,
  onOpenAuditModal,
  onOpenErpModal,
  onOpenShortcutsHelp,
  onOpenAccountCenter,
  isDemoMode = false,
  currentDataset,
  onSelectDataset,
  currentCurrency,
  onSelectCurrency,
  currentUserRole,
  onSelectUserRole,
  onStartTour,
  onTriggerErpReconciliation,
  isReconciling = false,
  workspaceType = 'SOLO_ANALYST',
  onOpenSecEdgar,
  onOpenModelCalibration,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modKey = isMac ? '⌘' : 'Ctrl';

  // Build command catalogue
  const allCommands = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [
      // Navigation
      {
        id: 'nav-dashboard',
        title: 'Financial Health & Executive KPI Dashboard',
        subtitle: 'Core performance overview, solvency ratings, DuPont breakdown, revenue heatmap',
        category: 'Navigation',
        shortcut: '1',
        icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
        action: () => { onNavigateTab('dashboard'); onClose(); },
      },
      {
        id: 'nav-visualization',
        title: 'Interactive Data Visualizer Studio',
        subtitle: 'Multi-axis charts, revenue vs profit trajectories, metric correlations',
        category: 'Navigation',
        shortcut: '2',
        icon: <TrendingUp className="w-4 h-4 text-indigo-400" />,
        action: () => { onNavigateTab('visualization'); onClose(); },
      },
      {
        id: 'nav-competitors',
        title: 'Competitor Benchmark Intelligence',
        subtitle: 'Peer comparison, enterprise valuation multiples, market share',
        category: 'Navigation',
        shortcut: '3',
        icon: <Users className="w-4 h-4 text-emerald-400" />,
        action: () => { onNavigateTab('competitors'); onClose(); },
      },
      {
        id: 'nav-anomalies',
        title: 'Multi-Variable Anomaly Detection',
        subtitle: 'Z-score outliers, benign variance vs red-flag divergence',
        category: 'Navigation',
        shortcut: '4',
        icon: <ScanEye className="w-4 h-4 text-rose-400" />,
        action: () => { onNavigateTab('anomalies'); onClose(); },
      },
      {
        id: 'nav-benchmarks',
        title: 'Peer Industry Benchmarks & Percentiles',
        subtitle: 'Median, 75th, and 90th percentile comparisons across industry peers',
        category: 'Navigation',
        shortcut: '5',
        icon: <Compass className="w-4 h-4 text-cyan-400" />,
        action: () => { onNavigateTab('benchmarks'); onClose(); },
      },
      {
        id: 'nav-forecasting',
        title: 'Predictive Forecasting & Monte Carlo Simulation',
        subtitle: 'Forward probabilistic projections, worst/best-case bounds, sensitivity',
        category: 'Navigation',
        shortcut: '6',
        icon: <TrendingUp className="w-4 h-4 text-purple-400" />,
        action: () => { onNavigateTab('forecasting'); onClose(); },
      },
      {
        id: 'nav-redflags',
        title: 'Forensic Red Flags & Risk Indicators',
        subtitle: 'Beneish M-Score, Altman Z-Score, Cash vs Net Income divergence',
        category: 'Navigation',
        shortcut: '7',
        icon: <ShieldAlert className="w-4 h-4 text-red-400" />,
        action: () => { onNavigateTab('redflags'); onClose(); },
      },
      {
        id: 'nav-statements',
        title: 'Multi-Period Financial Statements & Notes',
        subtitle: 'Income Statement, Balance Sheet, Cash Flows with line-item annotations',
        category: 'Navigation',
        shortcut: '8',
        icon: <FileSpreadsheet className="w-4 h-4 text-indigo-400" />,
        action: () => { onNavigateTab('statements'); onClose(); },
      },
      {
        id: 'nav-sentiment',
        title: 'MD&A Sentiment & Lexical NLP Analysis',
        subtitle: 'Management disclosure tone, hedging indices, executive sentiment scoring',
        category: 'Navigation',
        shortcut: '9',
        icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
        action: () => { onNavigateTab('sentiment'); onClose(); },
      },
      {
        id: 'nav-budget',
        title: 'Departmental Budget Variance Alerts',
        subtitle: 'Target vs Actual expense tracking, burn rates, threshold alarms',
        category: 'Navigation',
        shortcut: '0',
        icon: <DollarSign className="w-4 h-4 text-amber-400" />,
        action: () => { onNavigateTab('budget'); onClose(); },
      },

      // Actions & Tools
      {
        id: 'act-chat',
        title: 'Toggle AI Financial Assistant Chat Drawer',
        subtitle: 'Interactive Gemini conversational copilot with instant ratio retrieval',
        category: 'Actions & Tools',
        shortcut: `${modKey}+J`,
        icon: <MessageSquareText className="w-4 h-4 text-indigo-400" />,
        action: () => { onToggleChat(); onClose(); },
      },
      {
        id: 'act-ai-insight',
        title: 'Toggle AI Insight of the Day (Trend Intelligence)',
        subtitle: 'Rotating daily executive insight and predictive trend analysis',
        category: 'Actions & Tools',
        shortcut: `${modKey}+I`,
        icon: <Sparkles className="w-4 h-4 text-purple-400" />,
        action: () => { onToggleAiInsight?.(); onClose(); },
      },
      ...(workspaceType !== 'SOLO_ANALYST' ? [{
        id: 'act-collab',
        title: 'Toggle Team Collaboration & Annotations',
        subtitle: 'View analyst notes, audit remarks, and discussion threads',
        category: 'Actions & Tools' as const,
        shortcut: `${modKey}+N`,
        icon: <Users className="w-4 h-4 text-emerald-400" />,
        action: () => { onToggleCollab(); onClose(); },
      }] : []),
      {
        id: 'act-mask',
        title: isDataMasked ? 'Disable Data Masking (Reveal Values)' : 'Enable Confidential Data Masking (AES-256)',
        subtitle: 'Obfuscate sensitive financial figures for safe client presentations',
        category: 'Actions & Tools',
        shortcut: `${modKey}+M`,
        icon: <Lock className="w-4 h-4 text-amber-400" />,
        badge: isDataMasked ? 'Masked' : 'Unmasked',
        action: () => { onToggleDataMask(); onClose(); },
      },
      {
        id: 'act-export-pdf',
        title: 'Export Executive Audit Dossier (PDF)',
        subtitle: 'Generate client-ready multi-page dossier with compliance certification',
        category: 'Actions & Tools',
        shortcut: `${modKey}+E`,
        icon: <Download className="w-4 h-4 text-indigo-400" />,
        action: () => { onExportPdf(); onClose(); },
      },
      {
        id: 'act-audit',
        title: 'Security, Compliance Audit Trail & Backend Logs',
        subtitle: 'Inspect immutable ledger logs, system diagnostics, and server traces',
        category: 'Actions & Tools',
        shortcut: `${modKey}+L`,
        icon: <Terminal className="w-4 h-4 text-emerald-400" />,
        action: () => { onOpenAuditModal(); onClose(); },
      },
      {
        id: 'act-erp',
        title: 'ERP Integration & Cloud Synchronization',
        subtitle: 'Sync ledgers with NetSuite, SAP S/4HANA, and QuickBooks Online',
        category: 'Actions & Tools',
        shortcut: `${modKey}+U`,
        icon: <RefreshCw className="w-4 h-4 text-indigo-400" />,
        action: () => { onOpenErpModal(); onClose(); },
      },
      ...(onOpenSecEdgar ? [{
        id: 'act-sec-edgar',
        title: 'SEC EDGAR Statutory 10-K Ingestion',
        subtitle: 'Search and ingest live verified Form 10-K filings (NVDA, MSFT, AAPL, AMZN, TSLA)',
        category: 'Actions & Tools' as const,
        icon: <Building2 className="w-4 h-4 text-cyan-400" />,
        action: () => { onOpenSecEdgar(); onClose(); },
      }] : []),
      ...(onOpenModelCalibration ? [{
        id: 'act-model-calibration',
        title: 'AI Model Architecture & Domain Weights Studio',
        subtitle: 'Calibrate domain adaptors (Forensic CPA, Growth Equity), loss penalties & few-shot exemplars',
        category: 'Actions & Tools' as const,
        icon: <Sliders className="w-4 h-4 text-indigo-400" />,
        action: () => { onOpenModelCalibration(); onClose(); },
      }] : []),
      ...(onTriggerErpReconciliation ? [{
        id: 'act-erp-reconcile',
        title: isReconciling ? 'ERP Data Reconciliation in Progress...' : 'Run ERP General Ledger Reconciliation',
        subtitle: isReconciling 
          ? 'Live data reconciliation and journal matching currently running'
          : 'Trigger live multi-subsidiary ledger reconciliation and journal check',
        category: 'Actions & Tools' as const,
        badge: isReconciling ? 'Pulsing' : 'Run Now',
        icon: <RefreshCw className={`w-4 h-4 ${isReconciling ? 'text-amber-400 animate-spin' : 'text-emerald-400'}`} />,
        action: () => { onTriggerErpReconciliation(); onClose(); },
      }] : []),
      ...(onOpenAccountCenter ? [{
        id: 'act-account-center',
        title: isDemoMode ? 'Account Center (Locked in Demo)' : 'Account Center & Security Settings',
        subtitle: isDemoMode
          ? 'Security credentials and operational role switching are locked in demo mode'
          : 'Manage user identity, Google Firebase authentication, cloud persistence, and role credentials',
        category: 'Actions & Tools' as const,
        badge: isDemoMode ? 'Locked' : undefined,
        icon: isDemoMode ? <Lock className="w-4 h-4 text-amber-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />,
        action: () => { 
          if (!isDemoMode) {
            onOpenAccountCenter();
          }
          onClose(); 
        },
      }] : []),
      {
        id: 'act-shortcuts',
        title: 'Keyboard Shortcuts Cheat Sheet',
        subtitle: 'View comprehensive keyboard hotkeys reference for power users',
        category: 'Actions & Tools',
        shortcut: '?',
        icon: <Keyboard className="w-4 h-4 text-amber-400" />,
        action: () => { onOpenShortcutsHelp(); onClose(); },
      },
      ...(onStartTour ? [{
        id: 'act-tour',
        title: 'Getting Started Onboarding Tour',
        subtitle: 'Walkthrough of Command Palette, layout toggles, and AI Copilot',
        category: 'Actions & Tools' as const,
        icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
        action: () => { onStartTour(); onClose(); },
      }] : []),

      // Companies / Datasets
      ...SAMPLE_DATASETS.map((ds) => ({
        id: `ds-${ds.id}`,
        title: `Switch Dataset: ${ds.companyName}`,
        subtitle: `${ds.industry} • ${ds.ticker || 'Private'} • ${ds.periods.length} fiscal years loaded`,
        category: 'Companies / Datasets' as const,
        icon: <Building2 className="w-4 h-4 text-indigo-400" />,
        badge: ds.id === currentDataset.id ? 'Active' : undefined,
        action: () => { onSelectDataset(ds); onClose(); },
      })),

      // Currencies
      ...Object.entries(CURRENCIES).map(([code, cfg]) => ({
        id: `cur-${code}`,
        title: `Display Currency: ${code} (${cfg.symbol} - ${cfg.name})`,
        subtitle: `Set all statement rows and visual graphs to ${code}`,
        category: 'Currencies' as const,
        icon: <Globe className="w-4 h-4 text-emerald-400" />,
        badge: code === currentCurrency ? 'Selected' : undefined,
        action: () => { onSelectCurrency(code as CurrencyCode); onClose(); },
      })),

      // User Roles
      ...Object.entries(USER_ROLES).map(([roleKey, cfg]) => ({
        id: `role-${roleKey}`,
        title: `Switch Role: ${cfg.displayName}`,
        subtitle: cfg.description,
        category: 'User Role & Access' as const,
        icon: <Shield className="w-4 h-4 text-purple-400" />,
        badge: roleKey === currentUserRole ? 'Current' : undefined,
        action: () => { onSelectUserRole(roleKey as UserRole); onClose(); },
      })),
    ];

    return list;
  }, [
    modKey,
    isDataMasked,
    currentDataset.id,
    currentCurrency,
    currentUserRole,
    onNavigateTab,
    onClose,
    onToggleChat,
    onToggleCollab,
    onToggleDataMask,
    onExportPdf,
    onOpenAuditModal,
    onOpenErpModal,
    onOpenShortcutsHelp,
    onSelectDataset,
    onSelectCurrency,
    onSelectUserRole,
  ]);

  // Filter commands by search query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return allCommands;
    const q = query.toLowerCase();
    return allCommands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(q) ||
        (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q)) ||
        cmd.category.toLowerCase().includes(q)
    );
  }, [allCommands, query]);

  // Reset selected index when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Handle arrow keys and enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredCommands[selectedIndex];
      if (current) {
        current.action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-[#121214] border border-[#27272a] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#27272a] bg-[#18181b]">
          <Search className="w-5 h-5 text-[#a1a1aa] shrink-0" />
          <input
            ref={inputRef}
            id="command-palette-search-input"
            name="commandPaletteSearch"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            aria-label="Search commands, views, and datasets"
            placeholder="Type a command, tab name, action, or company..."
            className="flex-1 bg-transparent border-none text-sm text-white placeholder-[#71717a] focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-[#a1a1aa] bg-[#27272a] border border-[#3f3f46] rounded">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          className="p-2 overflow-y-auto space-y-1 scrollbar-thin max-h-[50vh]"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-[#71717a]">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium text-[#a1a1aa]">No commands or actions match "{query}"</p>
              <p className="text-xs text-[#52525b] mt-1">Try searching for "Dashboard", "Export", "Masking", or "USD"</p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  data-index={idx}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-600/20 border border-indigo-500/40 text-white' 
                      : 'hover:bg-[#18181b] border border-transparent text-[#d4d4d8]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      isSelected ? 'bg-indigo-500/30 text-white' : 'bg-[#18181b] border border-[#27272a] text-[#a1a1aa]'
                    }`}>
                      {cmd.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold truncate text-white">
                          {cmd.title}
                        </span>
                        {cmd.badge && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                            {cmd.badge}
                          </span>
                        )}
                      </div>
                      {cmd.subtitle && (
                        <p className="text-[11px] text-[#71717a] truncate mt-0.5">
                          {cmd.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-[#71717a] font-mono hidden md:inline">
                      {cmd.category}
                    </span>
                    {cmd.shortcut ? (
                      <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[#e4e4e7] bg-[#27272a] border border-[#3f3f46] rounded shadow-xs">
                        {cmd.shortcut}
                      </kbd>
                    ) : isSelected ? (
                      <CornerDownLeft className="w-3.5 h-3.5 text-indigo-400" />
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 border-t border-[#27272a] bg-[#18181b] flex items-center justify-between text-[11px] text-[#71717a]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.2 text-[9px] font-mono bg-[#27272a] border border-[#3f3f46] rounded text-[#e4e4e7]">↑</kbd>
              <kbd className="px-1.5 py-0.2 text-[9px] font-mono bg-[#27272a] border border-[#3f3f46] rounded text-[#e4e4e7]">↓</kbd>
              <span className="hidden sm:inline">to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.2 text-[9px] font-mono bg-[#27272a] border border-[#3f3f46] rounded text-[#e4e4e7]">↵</kbd>
              <span className="hidden sm:inline">to select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.2 text-[9px] font-mono bg-[#27272a] border border-[#3f3f46] rounded text-[#e4e4e7]">esc</kbd>
              <span className="hidden sm:inline">to close</span>
            </span>
          </div>

          <div className="text-[10px] text-[#52525b] font-mono">
            {filteredCommands.length} commands available
          </div>
        </div>
      </div>
    </div>
  );
};
