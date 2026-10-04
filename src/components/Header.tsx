import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Download, 
  RefreshCw, 
  MessageSquareText, 
  Globe, 
  Calendar, 
  Lock, 
  ChevronDown, 
  ChevronRight,
  Terminal, 
  Search, 
  Keyboard, 
  Home, 
  Cloud, 
  Sparkles,
  Sliders,
  Zap,
  CheckCircle2,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CurrencyCode, FiscalYearType, UserRole, AuthUser, ErpSyncStatus, WorkspaceType } from '../types';
import { CURRENCIES, FISCAL_YEAR_TYPES } from '../data/currenciesAndFiscal';
import { USER_ROLES } from '../utils/encryption';
import { auth } from '../lib/firebase';

interface HeaderProps {
  currentCurrency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  fiscalYearType: FiscalYearType;
  onFiscalYearChange: (fy: FiscalYearType) => void;
  userRole: UserRole;
  onUserRoleChange: (r: UserRole) => void;
  onExportPdf: () => void;
  onOpenErpModal: () => void;
  onOpenAuditModal: () => void;
  isChatOpen: boolean;
  onToggleChat: () => void;
  isCollabOpen: boolean;
  onToggleCollab: () => void;
  isDataMasked: boolean;
  onToggleDataMask: () => void;
  unreadCommentsCount: number;
  onOpenCommandPalette: () => void;
  onOpenShortcutsHelp: () => void;
  isAiInsightOpen?: boolean;
  onToggleAiInsight?: () => void;
  viewMode?: 'landing' | 'demo' | 'app';
  onNavigateView?: (mode: 'landing' | 'demo' | 'onboarding' | 'app') => void;
  authUser?: AuthUser | null;
  onSignOut?: () => void;
  onOpenCloudModal?: () => void;
  onSignInGoogle?: () => void;
  onOpenAccountCenter?: () => void;
  isReconciling?: boolean;
  erpSyncStatus?: ErpSyncStatus;
  onOpenRoleMatrix?: () => void;
  workspaceType?: WorkspaceType;
  onOpenSecEdgar?: () => void;
  onOpenModelCalibration?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCurrency,
  onCurrencyChange,
  fiscalYearType,
  onFiscalYearChange,
  userRole,
  onUserRoleChange,
  onExportPdf,
  onOpenErpModal,
  onOpenAuditModal,
  isChatOpen,
  onToggleChat,
  isCollabOpen,
  onToggleCollab,
  isDataMasked,
  onToggleDataMask,
  unreadCommentsCount,
  onOpenCommandPalette,
  onOpenShortcutsHelp,
  isAiInsightOpen = false,
  onToggleAiInsight,
  viewMode = 'app',
  onNavigateView,
  authUser,
  onSignOut,
  onOpenCloudModal,
  onSignInGoogle,
  onOpenAccountCenter,
  isReconciling = false,
  erpSyncStatus,
  onOpenRoleMatrix,
  workspaceType = 'SOLO_ANALYST',
  onOpenSecEdgar,
  onOpenModelCalibration,
}) => {
  const roleConfig = USER_ROLES[userRole];
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  // In demo mode, name is simply 'User' without extra company/org suffixes
  const displayUserName = viewMode === 'demo' ? 'User' : (authUser?.name || 'Account');
  const displayUserOrg = viewMode === 'demo' ? '' : (authUser?.organization || 'Enterprise Financial Group');

  // Close dropdowns on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
        setIsToolsMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
        setIsToolsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header 
      id="global-header" 
      className="bg-[#09090b]/90 backdrop-blur-md border-b border-[#27272a] sticky top-0 z-40 text-[#fafafa] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* ========================================================================= */}
        {/* Left Zone: Identity + Badges (Single Line)                                */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            onClick={() => onNavigateView && onNavigateView('landing')}
            title="Return to Marketing Landing Page"
            className="group relative h-8 w-8 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 hover:from-indigo-400 hover:to-violet-600 rounded-lg flex items-center justify-center font-black text-sm italic text-white shadow-md shadow-indigo-600/30 ring-1 ring-white/20 shrink-0 cursor-pointer transition-all duration-200 hover:scale-105"
          >
            <span className="relative z-10 drop-shadow-xs">F</span>
          </button>
          
          <button
            onClick={() => onNavigateView && onNavigateView('landing')}
            className="group flex items-center cursor-pointer text-left focus:outline-none"
            title="Return to Marketing Landing Page"
          >
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-white group-hover:text-indigo-200 transition-colors">
              FinInsight
            </span>
            <span className="font-black text-sm sm:text-base tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent ml-1">
              AI
            </span>
          </button>

          <span className="text-[#71717a] font-mono text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#18181b] border border-[#27272a] hidden sm:inline-block shadow-xs">
            v2.4
          </span>
          
          {viewMode === 'demo' ? (
            <div className="inline-flex items-center gap-1.5 text-[10px] text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30 font-mono font-bold shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>DEMO</span>
            </div>
          ) : (
            <div className="hidden lg:inline-flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/25 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>AES-256</span>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* Center Zone: Universal Omnibar / Search (⌘K)                               */}
        {/* ========================================================================= */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-2 lg:mx-4">
          <button
            id="btn-command-palette-center"
            onClick={onOpenCommandPalette}
            title="Open Command Palette & Search (⌘K / Ctrl+K)"
            className="w-full h-8 px-3 rounded-lg bg-[#141417] hover:bg-[#1f1f23] border border-[#27272a] hover:border-indigo-500/40 text-[#a1a1aa] hover:text-[#fafafa] text-xs flex items-center justify-between transition-all cursor-pointer shadow-xs group"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              <span className="text-[#a1a1aa] group-hover:text-[#e4e4e7] truncate text-[11px] sm:text-xs">
                Search filings, ratios, tools...
              </span>
            </span>
            <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-zinc-300 bg-[#27272a] border border-[#3f3f46] rounded shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* Right Zone: Primary Actions + [··· Tools] Dropdown + User Profile         */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Mobile Search Button (Visible only when center search is hidden) */}
          <button
            id="btn-command-palette-mobile"
            onClick={onOpenCommandPalette}
            title="Search (⌘K)"
            className="md:hidden h-8 w-8 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#a1a1aa] hover:text-white transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-indigo-400" />
          </button>

          {/* Currency Selector (Compact Pill) */}
          <div className="relative inline-flex items-center h-8 px-2 rounded-lg bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-xs text-[#a1a1aa] hover:text-[#fafafa] transition-colors shrink-0">
            <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <label htmlFor="currency-select-header" className="sr-only">Currency</label>
            <select
              id="currency-select-header"
              value={currentCurrency}
              onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
              className="bg-transparent border-none text-xs font-medium focus:outline-none cursor-pointer text-[#fafafa] pr-0 pl-1.5 py-0"
            >
              {Object.entries(CURRENCIES).map(([code, config]) => (
                <option key={code} value={code} className="bg-[#18181b] text-[#fafafa]">
                  {config.symbol} {code}
                </option>
              ))}
            </select>
          </div>

          {/* Export PDF Button */}
          <button
            id="btn-export-pdf"
            onClick={onExportPdf}
            disabled={!roleConfig.canExportPDF}
            title="Export Executive PDF Audit Dossier"
            className="h-8 px-2 sm:px-2.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] hover:border-[#3f3f46] text-xs text-[#fafafa] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>

          {/* AI Financial Chat Button */}
          <button
            id="btn-toggle-chat"
            onClick={onToggleChat}
            title="Ask AI Statement Assistant"
            className={`h-8 px-2.5 sm:px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              isChatOpen
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-900/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-xs'
            }`}
          >
            <MessageSquareText className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">AI Chat</span>
          </button>

          {/* ===================================================================== */}
          {/* 1. The Categorized [··· Tools] Dropdown Menu (Image 1 Requirement)     */}
          {/* ===================================================================== */}
          <div className="relative shrink-0" ref={toolsMenuRef}>
            <button
              id="btn-header-tools-menu"
              onClick={() => setIsToolsMenuOpen((prev) => !prev)}
              title="Workspace Tools, Integrations & Model Config"
              aria-expanded={isToolsMenuOpen}
              aria-haspopup="true"
              className={`h-8 px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                isToolsMenuOpen
                  ? 'bg-[#27272a] text-white border-indigo-500/60 ring-1 ring-indigo-500/20'
                  : 'bg-[#18181b] hover:bg-[#27272a] text-[#d4d4d8] hover:text-white border-[#27272a] hover:border-[#3f3f46]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="font-mono text-xs font-medium">Tools</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#a1a1aa] transition-transform duration-200 shrink-0 ${isToolsMenuOpen ? 'rotate-180 text-white' : ''}`} />
            </button>

            {/* Categorized Tools Popover */}
            <AnimatePresence>
              {isToolsMenuOpen && (
                <motion.div
                  id="tools-dropdown-popover"
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-[#141418]/98 backdrop-blur-2xl border border-[#3f3f46]/80 shadow-2xl shadow-black/80 z-50 p-3 text-left divide-y divide-[#27272a] select-none"
                >
                  {/* Category 1: FINANCIAL DATA INTEGRATIONS */}
                  <div className="pb-3">
                    <p className="text-[10px] font-mono font-bold tracking-wider text-[#71717a] uppercase px-2 mb-2 flex items-center justify-between">
                      <span>FINANCIAL DATA INTEGRATIONS</span>
                      <span className="text-indigo-400/80 text-[9px] font-sans lowercase">live hooks</span>
                    </p>
                    <div className="space-y-1">
                      {/* ERP Real-Time Sync */}
                      <button
                        onClick={() => {
                          setIsToolsMenuOpen(false);
                          onOpenErpModal();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#1f1f26] transition-colors cursor-pointer text-left group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400 group-hover:scale-105 transition-transform">
                            <Zap className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                              ERP Real-Time Sync
                            </div>
                            <div className="text-[10px] text-[#71717a]">
                              General ledger & automated reconciliations
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>{isReconciling ? 'Reconciling...' : (erpSyncStatus?.system ? `${erpSyncStatus.system} • Active` : 'Oracle NetSuite • Active')}</span>
                        </span>
                      </button>

                      {/* SEC EDGAR Ingestion */}
                      {onOpenSecEdgar && (
                        <button
                          onClick={() => {
                            setIsToolsMenuOpen(false);
                            onOpenSecEdgar();
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#1f1f26] transition-colors cursor-pointer text-left group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400 group-hover:scale-105 transition-transform">
                              <Building2 className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                                SEC EDGAR Ingestion
                              </div>
                              <div className="text-[10px] text-[#71717a]">
                                Live statutory 10-K & 10-Q parser
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            Search 10-K & 10-Q
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Category 2: QUANTITATIVE & AI CONFIG */}
                  <div className="py-3">
                    <p className="text-[10px] font-mono font-bold tracking-wider text-[#71717a] uppercase px-2 mb-2 flex items-center justify-between">
                      <span>QUANTITATIVE & AI CONFIG</span>
                      <span className="text-indigo-400/80 text-[9px] font-sans lowercase">model parameters</span>
                    </p>
                    <div className="space-y-1">
                      {/* Calibrate Model Weights */}
                      {onOpenModelCalibration && (
                        <button
                          onClick={() => {
                            setIsToolsMenuOpen(false);
                            onOpenModelCalibration();
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#1f1f26] transition-colors cursor-pointer text-left group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400 group-hover:scale-105 transition-transform">
                              <Sliders className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                                Calibrate Model Weights
                              </div>
                              <div className="text-[10px] text-[#71717a]">
                                Fine-tune quantitative sensitivities
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            DuPont & Altman ratios
                          </span>
                        </button>
                      )}

                      {/* Cloud Inference Models */}
                      {onOpenCloudModal && (
                        <button
                          onClick={() => {
                            setIsToolsMenuOpen(false);
                            onOpenCloudModal();
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#1f1f26] transition-colors cursor-pointer text-left group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-400 group-hover:scale-105 transition-transform">
                              <Cloud className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                                Cloud Inference Models
                              </div>
                              <div className="text-[10px] text-[#71717a]">
                                Firestore persistence & saved models
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            Gemini 1.5 Flash Grounded
                          </span>
                        </button>
                      )}

                      {/* Fiscal Calendar Settings */}
                      <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#1f1f26] transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                            <Calendar className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white">
                              Fiscal Calendar Settings
                            </div>
                            <div className="text-[10px] text-[#71717a]">
                              Calendar cycle & period partitioning
                            </div>
                          </div>
                        </div>
                        <select
                          value={fiscalYearType}
                          onChange={(e) => onFiscalYearChange(e.target.value as FiscalYearType)}
                          className="text-[10px] font-mono px-2 py-1 rounded bg-[#18181b] text-emerald-300 border border-[#3f3f46] cursor-pointer focus:outline-none"
                        >
                          {Object.entries(FISCAL_YEAR_TYPES).map(([type, config]) => (
                            <option key={type} value={type} className="bg-[#18181b] text-white">
                              {config.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Category 3: COMPLIANCE & SECURITY */}
                  <div className="py-3">
                    <p className="text-[10px] font-mono font-bold tracking-wider text-[#71717a] uppercase px-2 mb-2 flex items-center justify-between">
                      <span>COMPLIANCE & SECURITY</span>
                      <span className="text-emerald-400/80 text-[9px] font-sans lowercase">governance</span>
                    </p>
                    <div className="space-y-1">
                      {/* SOX-404 Audit Trail */}
                      <button
                        onClick={() => {
                          setIsToolsMenuOpen(false);
                          onOpenAuditModal();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#1f1f26] transition-colors cursor-pointer text-left group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 text-rose-400 group-hover:scale-105 transition-transform">
                            <Terminal className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white group-hover:text-rose-300 transition-colors">
                              SOX-404 Audit Trail
                            </div>
                            <div className="text-[10px] text-[#71717a]">
                              Immutable audit trail & security events
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          Session Logs
                        </span>
                      </button>

                      {/* Security Clearance */}
                      <button
                        onClick={() => {
                          setIsToolsMenuOpen(false);
                          onOpenRoleMatrix?.();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#1f1f26] transition-colors cursor-pointer text-left group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 group-hover:scale-105 transition-transform">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                              Security Clearance
                            </div>
                            <div className="text-[10px] text-[#71717a]">
                              RBAC role access & permissions
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          {workspaceType === 'SOLO_ANALYST' ? 'Solo Analyst • Full' : `${roleConfig.displayName} • Active`}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Footer Category: Keyboard Shortcuts */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setIsToolsMenuOpen(false);
                        onOpenShortcutsHelp();
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#1f1f26] transition-colors cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#27272a] border border-[#3f3f46] flex items-center justify-center shrink-0 text-[#a1a1aa]">
                          <Keyboard className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-medium text-[#d4d4d8] group-hover:text-white transition-colors">
                          Keyboard Shortcuts
                        </span>
                      </div>
                      <kbd className="text-[10px] font-mono text-[#a1a1aa] bg-[#27272a] border border-[#3f3f46] px-1.5 py-0.5 rounded">
                        ⌘K
                      </kbd>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ===================================================================== */}
          {/* 2. User Profile with Integrated Security Clearance (Image 2 Requirement)*/}
          {/* ===================================================================== */}
          <div className="relative shrink-0" ref={userMenuRef}>
            <button
              id="btn-user-account-dropdown"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              title={`Account Center & Workspace Menu (${displayUserName})`}
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
              className={`h-8 pl-1.5 pr-2 rounded-lg bg-[#18181b] hover:bg-[#27272a] border transition-all cursor-pointer flex items-center gap-2 ${
                isUserMenuOpen ? 'border-indigo-500/60 bg-[#27272a] ring-1 ring-indigo-500/20' : 'border-[#27272a] hover:border-[#3f3f46]'
              }`}
            >
              {/* Avatar with Integrated Green Security Shield Badge */}
              <div className="relative shrink-0">
                {authUser?.avatar ? (
                  <img
                    src={authUser.avatar}
                    alt={displayUserName}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-[#3f3f46]"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-purple-600/40 text-purple-200 font-bold text-[10px] flex items-center justify-center shrink-0 ring-1 ring-purple-500/30">
                    {(displayUserName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Embedded Green Clearance Shield Badge */}
                <span 
                  className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-[#18181b] flex items-center justify-center shadow-xs"
                  title="Full Security Clearance Active"
                >
                  <span className="w-1 h-1 bg-white rounded-full"></span>
                </span>
              </div>

              <span className="text-xs font-semibold text-white max-w-[85px] sm:max-w-[110px] truncate hidden sm:inline">
                {displayUserName}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#a1a1aa] transition-transform duration-200 shrink-0 ${isUserMenuOpen ? 'rotate-180 text-white' : ''}`} />
            </button>

            {/* Dropdown Menu - Includes Merged Security Clearance Banner */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  id="user-signout-dropdown-menu"
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-[#141418]/98 backdrop-blur-2xl border border-[#3f3f46] shadow-2xl z-50 p-2.5 text-left divide-y divide-[#27272a]"
                >
                  {/* User Identity Header */}
                  <div className="p-2 pb-3">
                    <div className="flex items-center gap-3">
                      {authUser?.avatar ? (
                        <img
                          src={authUser.avatar}
                          alt={displayUserName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-indigo-500/40"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-bold text-base flex items-center justify-center shrink-0 ring-2 ring-purple-500/40 shadow-inner">
                          {(displayUserName || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                          <span>{displayUserName}</span>
                          {auth.currentUser && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              Google
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#a1a1aa] truncate font-mono mt-0.5" title={authUser?.email || 'user@financialintel.io'}>
                          {authUser?.email || 'user@financialintel.io'}
                        </div>
                        {displayUserOrg && (
                          <div className="text-[10px] text-[#71717a] truncate mt-0.5">
                            {displayUserOrg}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Integrated Security Clearance Badge (Merged from Header Row into User Menu) */}
                    <div className="mt-3 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <div className="font-semibold text-emerald-300 text-[11px]">
                            {workspaceType === 'SOLO_ANALYST' ? 'Solo Analyst (Full Clearance)' : roleConfig.displayName}
                          </div>
                          <div className="text-[9px] text-[#a1a1aa]">SOX-404 Master Access Active</div>
                        </div>
                      </div>
                      {onOpenRoleMatrix && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenRoleMatrix();
                          }}
                          className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 transition-colors cursor-pointer"
                        >
                          Matrix
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Account Center Primary Option */}
                  <div className="py-2 space-y-1">
                    {viewMode === 'demo' ? (
                      <div
                        id="btn-dropdown-account-center"
                        title="Account Center is locked in demo mode."
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs bg-[#18181b]/80 border border-[#27272a] text-[#71717a] cursor-not-allowed select-none transition-all group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0 text-amber-400">
                            <Lock className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-[#a1a1aa] flex items-center gap-1.5">
                              <span>Account Center</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                                Locked
                              </span>
                            </div>
                            <div className="text-[10px] text-[#71717a]">Security, credentials & roles</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        id="btn-dropdown-account-center"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (onOpenAccountCenter) onOpenAccountCenter();
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-white hover:bg-[#27272a] transition-all cursor-pointer text-left font-medium group border border-transparent hover:border-emerald-500/30"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 group-hover:scale-105 transition-transform">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-white group-hover:text-emerald-300 transition-colors">Account Center</div>
                            <div className="text-[10px] text-[#a1a1aa]">Security, credentials & roles</div>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-[#71717a] group-hover:text-white transition-colors" />
                      </button>
                    )}

                    {/* Sign in with Google if not connected */}
                    {(!authUser || authUser.id === 'usr_demo_sandbox' || !auth.currentUser) && onSignInGoogle && (
                      <button
                        id="btn-dropdown-google-signin"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onSignInGoogle();
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 transition-colors cursor-pointer text-left group"
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                            <path fill="#ffffff" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                            <path fill="#ffffff" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                            <path fill="#ffffff" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                            <path fill="#ffffff" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
                          </svg>
                          <span>Sign In with Google</span>
                        </div>
                        <span className="text-[10px] font-mono text-indigo-300">Firebase</span>
                      </button>
                    )}
                  </div>

                  {/* Navigation Items */}
                  <div className="py-2 space-y-1">
                    {onNavigateView && (
                      <button
                        id="btn-dropdown-home-landing"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigateView('landing');
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-[#fafafa] hover:bg-[#27272a] transition-colors cursor-pointer text-left font-medium group"
                      >
                        <div className="flex items-center gap-2">
                          <Home className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
                          <span>Home / Landing Page</span>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Dedicated Log Out Action */}
                  <div className="pt-2">
                    <button
                      id="btn-dropdown-signout"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (onSignOut) {
                          onSignOut();
                        } else if (onNavigateView) {
                          onNavigateView('landing');
                        }
                      }}
                      className="w-full flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 transition-all cursor-pointer shadow-xs"
                    >
                      <span>Log Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </header>
  );
};
