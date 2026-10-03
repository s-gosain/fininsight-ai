import React from 'react';
import { 
  X, 
  Keyboard, 
  Command, 
  CornerDownLeft, 
  Search, 
  FileSpreadsheet, 
  Download, 
  RefreshCw, 
  Lock, 
  MessageSquareText, 
  Terminal, 
  Users,
  Compass,
  TrendingUp,
  ScanEye,
  ShieldAlert,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { WorkspaceType } from '../types';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceType?: WorkspaceType;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'Global & Navigation' | 'Actions & Tools' | 'Direct Tab Access';
  icon?: React.ReactNode;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  workspaceType = 'SOLO_ANALYST',
}) => {
  if (!isOpen) return null;

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcuts: ShortcutItem[] = [
    // Global & Navigation
    {
      keys: [modKey, 'K'],
      description: 'Open Universal Command Palette & Search',
      category: 'Global & Navigation',
      icon: <Search className="w-3.5 h-3.5 text-indigo-400" />
    },
    {
      keys: ['Esc'],
      description: 'Close active modal, drawer, or command palette',
      category: 'Global & Navigation',
      icon: <X className="w-3.5 h-3.5 text-rose-400" />
    },
    {
      keys: ['?'],
      description: 'Show / hide this keyboard shortcuts guide',
      category: 'Global & Navigation',
      icon: <Keyboard className="w-3.5 h-3.5 text-amber-400" />
    },

    // Actions & Tools
    {
      keys: [modKey, 'J'],
      description: 'Toggle AI Financial Assistant Chat Drawer',
      category: 'Actions & Tools',
      icon: <MessageSquareText className="w-3.5 h-3.5 text-indigo-400" />
    },
    {
      keys: [modKey, 'I'],
      description: 'Toggle AI Insight of the Day Drawer',
      category: 'Actions & Tools',
      icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" />
    },
    ...(workspaceType !== 'SOLO_ANALYST' ? [{
      keys: [modKey, 'N'],
      description: 'Toggle Team Collaboration & Annotations Drawer',
      category: 'Actions & Tools' as const,
      icon: <Users className="w-3.5 h-3.5 text-emerald-400" />
    }] : []),
    {
      keys: [modKey, 'M'],
      description: 'Toggle Confidential Data Masking (AES-256)',
      category: 'Actions & Tools',
      icon: <Lock className="w-3.5 h-3.5 text-amber-400" />
    },
    {
      keys: [modKey, 'E'],
      description: 'Export Executive Audit Dossier (PDF)',
      category: 'Actions & Tools',
      icon: <Download className="w-3.5 h-3.5 text-indigo-400" />
    },
    {
      keys: [modKey, 'L'],
      description: 'Open Security Governance & Backend Logs Audit',
      category: 'Actions & Tools',
      icon: <Terminal className="w-3.5 h-3.5 text-emerald-400" />
    },
    {
      keys: [modKey, 'U'],
      description: 'Trigger ERP NetSuite / SAP Synchronization Modal',
      category: 'Actions & Tools',
      icon: <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
    },

    // Direct Tab Access (1-9, 0)
    {
      keys: ['1'],
      description: 'Go to Financial Health & Executive KPI Dashboard',
      category: 'Direct Tab Access',
      icon: <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
    },
    {
      keys: ['2'],
      description: 'Go to Interactive Data Visualizer Studio',
      category: 'Direct Tab Access',
      icon: <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
    },
    {
      keys: ['3'],
      description: 'Go to Competitor Benchmark Intelligence',
      category: 'Direct Tab Access',
      icon: <Users className="w-3.5 h-3.5 text-emerald-400" />
    },
    {
      keys: ['4'],
      description: 'Go to Multi-Variable Anomaly Detection',
      category: 'Direct Tab Access',
      icon: <ScanEye className="w-3.5 h-3.5 text-rose-400" />
    },
    {
      keys: ['5'],
      description: 'Go to Peer Industry Benchmarks & Percentiles',
      category: 'Direct Tab Access',
      icon: <Compass className="w-3.5 h-3.5 text-cyan-400" />
    },
    {
      keys: ['6'],
      description: 'Go to Predictive Forecasting & Monte Carlo Simulation',
      category: 'Direct Tab Access',
      icon: <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
    },
    {
      keys: ['7'],
      description: 'Go to Red Flags & Forensic Risk Indicators',
      category: 'Direct Tab Access',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
    },
    {
      keys: ['8'],
      description: 'Go to Multi-Period Financial Statements & Notes',
      category: 'Direct Tab Access',
      icon: <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
    },
    {
      keys: ['9'],
      description: 'Go to MD&A Sentiment & Lexical NLP Analysis',
      category: 'Direct Tab Access',
      icon: <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
    },
    {
      keys: ['0'],
      description: 'Go to Departmental Budget Variance Alerts',
      category: 'Direct Tab Access',
      icon: <DollarSign className="w-3.5 h-3.5 text-amber-400" />
    },
  ];

  const categories = ['Global & Navigation', 'Actions & Tools', 'Direct Tab Access'] as const;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#121214] border border-[#27272a] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a] bg-[#18181b]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                Keyboard Shortcuts & Hotkeys
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-mono border border-indigo-500/30">
                  Power User
                </span>
              </h3>
              <p className="text-[11px] text-[#71717a]">
                Quickly navigate tabs, trigger actions, and close dialogs with high-speed keyboard shortcuts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-6 overflow-y-auto space-y-6 scrollbar-thin">
          {categories.map((category) => {
            const items = shortcuts.filter((s) => s.category === category);
            return (
              <div key={category} className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider font-mono">
                    {category}
                  </h4>
                  <span className="text-[10px] text-[#52525b] font-mono">
                    {items.length} shortcuts
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#18181b] border border-[#27272a]/80 hover:border-[#3f3f46] transition-colors group"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        {item.icon}
                        <span className="text-xs text-[#d4d4d8] group-hover:text-white transition-colors truncate">
                          {item.description}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {item.keys.map((k, kIdx) => (
                          <kbd
                            key={kIdx}
                            className="min-w-[22px] px-1.5 py-0.5 text-center text-[11px] font-mono font-medium text-[#e4e4e7] bg-[#27272a] border border-[#3f3f46] rounded-md shadow-xs"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#27272a] bg-[#18181b] flex items-center justify-between text-xs text-[#71717a]">
          <div className="flex items-center gap-2">
            <span>Tip: Press</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#e4e4e7] bg-[#27272a] border border-[#3f3f46] rounded">
              Esc
            </kbd>
            <span>anytime to close open views</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-xs font-medium text-white transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
