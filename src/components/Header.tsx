import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Download, 
  RefreshCw, 
  History, 
  MessageSquareText, 
  Users, 
  Globe, 
  Calendar, 
  Lock, 
  FileSpreadsheet, 
  ChevronDown, 
  ChevronRight,
  Terminal, 
  Search, 
  Keyboard, 
  Home, 
  User, 
  Play, 
  Database, 
  Cloud, 
  Sparkles,
  Shield,
  Sliders,
  Cpu
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
  const userMenuRef = useRef<HTMLDivElement>(null);

  // In demo mode, name is simply 'User' without extra company/org suffixes
  const displayUserName = viewMode === 'demo' ? 'User' : (authUser?.name || 'Account');

  const displayUserOrg = viewMode === 'demo' ? '' : (authUser?.organization || 'Enterprise Financial Group');

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserMenuOpen]);

  return (
    <header id="global-header" className="bg-[#09090b]/80 backdrop-blur-md border-b border-[#27272a]/80 sticky top-0 z-40 text-[#fafafa] transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5">
        <div className="flex items-start justify-between gap-6 lg:gap-8 xl:gap-12 flex-wrap lg:flex-nowrap">
          
          {/* Logo & Brand Identity Segment */}
          <div className="flex flex-col justify-between gap-1.5 shrink-0 relative pr-0 lg:pr-2">
            {/* Ambient Brand Backlight Glow */}
            <div className="absolute -left-2 -top-2 w-48 h-14 bg-indigo-600/15 blur-xl rounded-full pointer-events-none -z-10"></div>

            {/* Left Row 1 (h-[32px]): Logo + Brand + Version + Mode + User Session */}
            <div className="flex items-center gap-2 sm:gap-2.5 h-[32px] whitespace-nowrap">
              <button
                onClick={() => onNavigateView && onNavigateView('landing')}
                title="Return to Marketing Landing Page"
                className="group relative h-[32px] w-[32px] bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 hover:from-indigo-400 hover:to-violet-600 rounded-lg flex items-center justify-center font-black text-base italic text-white shadow-lg shadow-indigo-600/30 ring-1 ring-white/25 shrink-0 cursor-pointer transition-all duration-300 ease-out hover:scale-105 hover:shadow-[0_0_20px_rgba(99,102,241,0.7)] hover:ring-indigo-400/60"
              >
                {/* Subtle animated ambient glow ring */}
                <span className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 group-hover:opacity-75 blur-xs transition-opacity duration-300 -z-10 pointer-events-none" />
                <span className="relative z-10 drop-shadow-sm transition-transform duration-300 group-hover:scale-110">F</span>
                <span className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </button>
              
              <button
                onClick={() => onNavigateView && onNavigateView('landing')}
                className="group flex items-center cursor-pointer text-left focus:outline-none transition-all duration-300"
                title="Return to Marketing Landing Page"
              >
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white group-hover:text-indigo-200 group-hover:drop-shadow-[0_0_8px_rgba(165,180,252,0.6)] transition-all duration-300">
                  FinInsight
                </span>
                <span className="font-black text-sm sm:text-base tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent ml-1 drop-shadow-sm group-hover:drop-shadow-[0_0_10px_rgba(192,132,252,0.8)] transition-all duration-300">
                  AI
                </span>
              </button>

              <span className="text-[#a1a1aa] font-mono text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-[#18181b]/90 border border-[#27272a] whitespace-nowrap shadow-sm">
                v2.4
              </span>
              
              {viewMode === 'demo' ? (
                <div className="inline-flex items-center gap-1.5 text-[10px] text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30 whitespace-nowrap font-mono font-bold shadow-sm shadow-amber-950/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>DEMO</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/25 whitespace-nowrap font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-[10px] font-mono font-medium tracking-wide hidden sm:inline">AES-256 ENCRYPTED</span>
                  <span className="text-[10px] font-mono font-medium tracking-wide sm:hidden">ENCRYPTED</span>
                </div>
              )}

              {(authUser || viewMode === 'demo') && (
                <div className="hidden lg:inline-flex items-center gap-1.5 text-[10px] font-mono text-[#e4e4e7] bg-[#18181b]/90 border border-[#27272a] px-2 py-0.5 rounded-md shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                  <span className="font-semibold">{displayUserName}</span>
                  {displayUserOrg && (
                    <span className="text-[#a1a1aa]">({displayUserOrg})</span>
                  )}
                </div>
              )}
            </div>

            {/* Left Row 2 (h-[32px]): Subtitle aligned horizontally with Right Row 2 */}
            <div className="h-[32px] flex items-center">
              <p className="text-[11px] text-[#a1a1aa] tracking-tight hidden sm:flex items-center gap-1.5 font-medium whitespace-nowrap">
                <span>Enterprise Financial Intelligence</span>
                <span className="text-indigo-400/50">•</span>
                <span>Multi-Period Audit</span>
                <span className="text-indigo-400/50">•</span>
                <span>SEC 10-K Ingestion</span>
              </p>
            </div>
          </div>

          {/* Separation Spacer & Vertical Accent Divider between the Two Segments */}
          <div className="hidden xl:block w-px h-12 self-center bg-gradient-to-b from-transparent via-[#27272a] to-transparent shrink-0 mx-1" aria-hidden="true" />

          {/* Right Side: 2-Row Positioned Control Bar - fully responsive across mobile, tablet, laptop, large screens */}
          <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0 w-full lg:w-auto ml-auto relative pl-0 lg:pl-1">
            
            {/* Top Row: Selectors & Status Badges */}
            <div className="flex items-center gap-1.5 sm:gap-2 w-full lg:w-auto overflow-x-auto scrollbar-none py-0.5 justify-start sm:justify-end shrink-0 h-[32px]">
              {/* Currency Selector */}
              <div className="relative inline-flex items-center h-[32px] px-2 rounded-lg bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-xs text-[#a1a1aa] hover:text-[#fafafa] transition-colors shrink-0">
                <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <label htmlFor="currency-select" className="sr-only">Currency</label>
                <select
                  id="currency-select"
                  value={currentCurrency}
                  onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                  className="bg-transparent border-none text-xs font-medium focus:outline-none cursor-pointer text-[#fafafa] pr-0.5 pl-1.5 py-0"
                >
                  {Object.entries(CURRENCIES).map(([code, config]) => (
                    <option key={code} value={code} className="bg-[#18181b] text-[#fafafa]">
                      {config.symbol} {code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fiscal Year Selector: Standard Calendar */}
              <div className="relative inline-flex items-center h-[32px] px-2 sm:px-2.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-xs text-[#a1a1aa] hover:text-[#fafafa] transition-colors shrink-0">
                <Calendar className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                <label htmlFor="fiscal-year-select" className="sr-only">Fiscal Year</label>
                <select
                  id="fiscal-year-select"
                  value={fiscalYearType}
                  onChange={(e) => onFiscalYearChange(e.target.value as FiscalYearType)}
                  className="bg-transparent border-none text-xs font-medium focus:outline-none cursor-pointer text-[#fafafa] pr-0.5 pl-1 py-0 max-w-[110px] sm:max-w-[150px] truncate"
                >
                  {Object.entries(FISCAL_YEAR_TYPES).map(([type, config]) => (
                    <option key={type} value={type} className="bg-[#18181b] text-[#fafafa]">
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Operational Clearance Display (Fixed by Workspace & Job Role - No Switcher) */}
              {workspaceType === 'SOLO_ANALYST' ? (
                <div 
                  id="badge-workspace-solo"
                  className="inline-flex items-center gap-1.5 h-[32px] px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-400 shrink-0 select-none shadow-sm"
                  title="Solo Professional Workspace: Master Clearance across all 10 analytical modules"
                >
                  <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-white">Solo Analyst</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold hidden sm:inline">
                    Full Clearance
                  </span>
                </div>
              ) : (
                <div 
                  id="badge-workspace-enterprise"
                  className="inline-flex items-center gap-1.5 h-[32px] px-2 sm:px-2.5 rounded-lg bg-[#18181b] border border-[#27272a] text-xs text-[#a1a1aa] shrink-0 select-none shadow-sm"
                  title={`Corporate Governance (SOX-404): Operational access strictly bound to ${roleConfig.displayName} clearance. Mode switching is disabled.`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${userRole === 'ADMIN_CFO' ? 'bg-[#10b981]' : userRole === 'AUDITOR' ? 'bg-amber-400' : 'bg-indigo-400'}`}></div>
                  <span className="text-white font-medium max-w-[120px] sm:max-w-[170px] truncate">{roleConfig.displayName}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#27272a] text-[#71717a] border border-[#3f3f46] hidden sm:inline">
                    SOX-404
                  </span>
                </div>
              )}

              {/* RBAC Governance Matrix Trigger (Enterprise Only) */}
              {workspaceType !== 'SOLO_ANALYST' && onOpenRoleMatrix && (
                <button
                  id="btn-rbac-matrix"
                  onClick={onOpenRoleMatrix}
                  title="View Enterprise Role-Based Access Control (RBAC) Governance Matrix"
                  className="h-[32px] px-2 sm:px-2.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] hover:border-indigo-500/40 text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">RBAC</span>
                </button>
              )}

              {/* Data Masking Toggle (Square icon button matching screenshot) */}
              <button
                id="btn-toggle-mask"
                onClick={roleConfig.canToggleEncryption ? onToggleDataMask : onOpenRoleMatrix}
                title={
                  !roleConfig.canToggleEncryption 
                    ? `Data masking toggle is locked for ${roleConfig.displayName} clearance` 
                    : isDataMasked 
                    ? "Data masking enabled (Click to unmask numbers)" 
                    : "Click to mask sensitive financial values"
                }
                className={`h-[32px] w-[32px] rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  !roleConfig.canToggleEncryption
                    ? 'bg-[#18181b] text-[#71717a] border-[#27272a] opacity-60'
                    : isDataMasked 
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                    : 'bg-[#18181b] text-[#71717a] border-[#27272a] hover:text-[#fafafa] hover:bg-[#27272a]'
                }`}
              >
                <Lock className={`w-3.5 h-3.5 ${!roleConfig.canToggleEncryption ? 'text-amber-500/70' : ''}`} />
              </button>

              {/* Collaboration Drawer Toggle (Enterprise Multi-user Only - Removed from Individual app page) */}
              {workspaceType !== 'SOLO_ANALYST' && (
                <button
                  id="btn-toggle-collab"
                  onClick={onToggleCollab}
                  title="Team Insights & Annotations"
                  className={`h-[32px] relative px-2 sm:px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                    isCollabOpen 
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm' 
                      : 'bg-[#18181b] text-[#a1a1aa] border-[#27272a] hover:text-[#fafafa] hover:bg-[#27272a]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="hidden sm:inline">Team Notes</span>
                  {unreadCommentsCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                      {unreadCommentsCount}
                    </span>
                  )}
                </button>
              )}

              {/* AI Financial Chat Toggle */}
              <button
                id="btn-toggle-chat"
                onClick={onToggleChat}
                title="Ask AI Statement Assistant"
                className={`h-[32px] px-2.5 sm:px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  isChatOpen
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-900/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-sm'
                }`}
              >
                <MessageSquareText className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">AI Chat</span>
              </button>

              {/* AI Insight of the Day Toggle */}
              {onToggleAiInsight && (
                <button
                  id="btn-toggle-ai-insight"
                  onClick={onToggleAiInsight}
                  title="Daily AI Trend Insights & Intelligence (Collapsible Drawer)"
                  className={`h-[32px] px-2.5 sm:px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                    isAiInsightOpen
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/30'
                      : 'bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white border-[#27272a] hover:border-purple-500/40 shadow-sm'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="whitespace-nowrap hidden sm:inline">AI Insight</span>
                </button>
              )}
            </div>

            {/* Bottom Row: Actions (ERP Sync, Logs & Audit, Keyboard, Export PDF) & User Profile */}
            <div className="flex items-center gap-1.5 sm:gap-2 w-full lg:w-auto justify-start sm:justify-end shrink-0 relative h-[32px]">
              {/* Scrollable Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5 shrink">
                {/* Quick Command Palette / Search Trigger */}
                <button
                  id="btn-command-palette"
                  onClick={onOpenCommandPalette}
                  title="Open Command Palette & Search (⌘K / Ctrl+K)"
                  className="h-[32px] px-2.5 sm:px-3 rounded-lg bg-[#18181b] hover:bg-[#27272a] border border-[#3f3f46]/60 hover:border-indigo-500/50 text-[#e4e4e7] hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="font-medium text-[#e4e4e7]">Search</span>
                  <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-zinc-300 bg-[#27272a] border border-[#3f3f46] rounded">
                    ⌘K
                  </kbd>
                </button>

                {/* ERP Sync Trigger with Status Indicator & Subtle Pulse Animation */}
                <button
                  id="btn-erp-sync"
                  onClick={onOpenErpModal}
                  title={
                    !roleConfig.canSyncERP
                      ? `ERP Sync is locked for ${roleConfig.displayName} clearance (SOX-404)`
                      : isReconciling
                      ? `Data reconciliation in progress: Synchronizing general ledger entries with ${erpSyncStatus?.system || 'ERP'}...`
                      : `ERP Real-Time Data Synchronization (${erpSyncStatus?.system || 'Oracle NetSuite'} • ${erpSyncStatus?.status || 'Connected'})`
                  }
                  className={`h-[32px] px-2 sm:px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                    !roleConfig.canSyncERP
                      ? 'bg-[#18181b] border-[#27272a] text-[#71717a]'
                      : isReconciling
                      ? 'bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-950/30'
                      : 'bg-[#18181b] hover:bg-[#27272a] border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa]'
                  }`}
                >
                  {!roleConfig.canSyncERP ? (
                    <Lock className="w-3.5 h-3.5 text-amber-500/70 shrink-0" />
                  ) : (
                    <>
                      {/* Status Indicator Dot with Subtle Pulse Animation */}
                      <span
                        id="erp-sync-status-indicator"
                        className="relative flex h-2 w-2 items-center justify-center shrink-0"
                        aria-label={isReconciling ? 'Data reconciliation in progress' : 'ERP Connected'}
                      >
                        {isReconciling ? (
                          <>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                          </>
                        ) : (
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                        )}
                      </span>

                      <RefreshCw
                        className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                          isReconciling ? 'text-amber-400 animate-spin' : 'text-indigo-400'
                        }`}
                      />
                    </>
                  )}
                  <span className="hidden sm:inline">
                    {isReconciling ? 'Reconciling...' : 'ERP Sync'}
                  </span>
                  <span className="sm:hidden">
                    {isReconciling ? 'Syncing' : 'Sync'}
                  </span>
                  {!roleConfig.canSyncERP && (
                    <span className="text-[9px] font-mono text-amber-500/80 hidden lg:inline">
                      Locked
                    </span>
                  )}

                  {isReconciling && (
                    <span className="hidden md:inline-flex items-center text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 animate-pulse border border-amber-500/30 tracking-tight uppercase font-semibold">
                      Sync
                    </span>
                  )}
                </button>

                {/* SEC EDGAR Statutory 10-K Ingestion Trigger */}
                {onOpenSecEdgar && (
                  <button
                    id="btn-header-sec-edgar"
                    onClick={onOpenSecEdgar}
                    title="SEC EDGAR Statutory 10-K Ingestion Engine (NVDA, MSFT, AAPL, AMZN, TSLA)"
                    className="h-[32px] px-2 sm:px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 bg-[#18181b] hover:bg-[#27272a] border-[#27272a] hover:border-cyan-500/40 text-cyan-400 hover:text-white"
                  >
                    <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="hidden sm:inline">SEC EDGAR</span>
                    <span className="sm:hidden">SEC</span>
                  </button>
                )}

                {/* Security, Audit & Backend Logs Modal */}
                <button
                  id="btn-audit-logs"
                  onClick={onOpenAuditModal}
                  title={
                    !roleConfig.canViewAuditLogs
                      ? `System audit logs are locked for ${roleConfig.displayName} clearance`
                      : "Audit Logs, Backend Server Logs & Security Governance (⌘L)"
                  }
                  className={`h-[32px] px-2 sm:px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                    !roleConfig.canViewAuditLogs
                      ? 'bg-[#18181b] border-[#27272a] text-[#71717a]'
                      : 'bg-[#18181b] hover:bg-[#27272a] border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa]'
                  }`}
                >
                  {!roleConfig.canViewAuditLogs ? (
                    <Lock className="w-3.5 h-3.5 text-amber-500/70 shrink-0" />
                  ) : (
                    <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                  <span className="hidden sm:inline">Logs & Audit</span>
                  <span className="sm:hidden">Logs</span>
                  {!roleConfig.canViewAuditLogs && (
                    <span className="text-[9px] font-mono text-amber-500/80 hidden lg:inline">
                      Locked
                    </span>
                  )}
                </button>

                {/* Keyboard Shortcuts Trigger */}
                <button
                  id="btn-keyboard-shortcuts"
                  onClick={onOpenShortcutsHelp}
                  title="Keyboard Shortcuts Cheat Sheet (?)"
                  className="h-[32px] w-[32px] rounded-lg bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] hover:border-[#3f3f46] text-[#71717a] hover:text-[#fafafa] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                </button>

                {/* Cloud Persistence & Saved Models */}
                {onOpenCloudModal && (
                  <button
                    id="btn-cloud-persistence"
                    onClick={roleConfig.canManageCloudModels ? onOpenCloudModal : onOpenRoleMatrix}
                    title={
                      !roleConfig.canManageCloudModels
                        ? `Cloud model management is locked for ${roleConfig.displayName}`
                        : "Firestore Cloud Persistence & Saved Models"
                    }
                    className={`h-[32px] px-2 sm:px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                      !roleConfig.canManageCloudModels
                        ? 'bg-[#18181b] border-[#27272a] text-[#71717a] opacity-75'
                        : 'bg-[#18181b] hover:bg-[#27272a] border-[#27272a] hover:border-indigo-500/40 text-[#a1a1aa] hover:text-white'
                    }`}
                  >
                    {!roleConfig.canManageCloudModels ? (
                      <Lock className="w-3.5 h-3.5 text-amber-500/70 shrink-0" />
                    ) : (
                      <Cloud className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    )}
                    <span className="hidden sm:inline">Cloud Models</span>
                  </button>
                )}

                {/* AI Model Calibration & Domain Weights Studio */}
                {onOpenModelCalibration && (
                  <button
                    id="btn-header-model-calibration"
                    onClick={onOpenModelCalibration}
                    title="AI Model Architecture & Domain Weights Calibration Studio"
                    className="h-[32px] px-2 sm:px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 bg-[#18181b] hover:bg-[#27272a] border-[#27272a] hover:border-indigo-500/40 text-indigo-300 hover:text-white"
                  >
                    <Sliders className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="hidden sm:inline">Model Weights</span>
                    <span className="sm:hidden">Weights</span>
                  </button>
                )}

                {/* Export PDF */}
                <button
                  id="btn-export-pdf"
                  onClick={onExportPdf}
                  disabled={!roleConfig.canExportPDF}
                  title="Export Executive PDF Audit Dossier"
                  className="h-[32px] px-2.5 sm:px-3 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] disabled:opacity-50 text-xs text-[#fafafa] border border-[#3f3f46] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="hidden sm:inline">Export PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>
              </div>

              {/* Action Buttons: Sign In with Google & User Account Dropdown */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative z-50">
                {/* Sign In with Google if not authenticated via Firebase */}
                {(!authUser || authUser.id === 'usr_demo_sandbox' || !auth.currentUser) && onSignInGoogle && (
                  <button
                    id="btn-header-signin-google"
                    onClick={onSignInGoogle}
                    title="Sign In with Google via Firebase Authentication"
                    className="h-[32px] px-2.5 sm:px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-900/40 cursor-pointer shrink-0"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#ffffff" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                      <path fill="#ffffff" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                      <path fill="#ffffff" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                      <path fill="#ffffff" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
                    </svg>
                    <span className="whitespace-nowrap">Sign In</span>
                  </button>
                )}

                {/* Dedicated Account Center & Workspace Menu */}
                <div className="relative shrink-0" ref={userMenuRef}>
                  <button
                    id="btn-user-account-dropdown"
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    title={`Account Center & Workspace Menu (${displayUserName})`}
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                    className={`h-[32px] pl-1.5 pr-2 rounded-lg bg-[#18181b] hover:bg-[#27272a] border transition-all cursor-pointer flex items-center gap-2 ${
                      isUserMenuOpen ? 'border-indigo-500/60 bg-[#27272a] ring-1 ring-indigo-500/20' : 'border-[#27272a] hover:border-[#3f3f46]'
                    }`}
                  >
                    {authUser?.avatar ? (
                      <img
                        src={authUser.avatar}
                        alt={displayUserName}
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-[#3f3f46]"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-purple-600/40 text-purple-200 font-bold text-[10px] flex items-center justify-center shrink-0 ring-1 ring-purple-500/30">
                        {(displayUserName || 'S').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-white max-w-[90px] sm:max-w-[120px] truncate hidden sm:inline">
                      {displayUserName}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Connected to Workspace & Firestore"></span>
                    <ChevronDown className={`w-3.5 h-3.5 text-[#a1a1aa] transition-transform duration-200 shrink-0 ${isUserMenuOpen ? 'rotate-180 text-white' : ''}`} />
                  </button>

                  {/* Dropdown Menu - Unclipped and High z-index */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        id="user-signout-dropdown-menu"
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-xl bg-[#18181b]/98 backdrop-blur-xl border border-[#3f3f46] shadow-2xl z-50 p-2.5 text-left divide-y divide-[#27272a]"
                      >
                        {/* 1. User Identity Header */}
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
                                {(displayUserName || 'S').charAt(0).toUpperCase()}
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

                          <div className="mt-2.5 flex items-center justify-between text-[10px] bg-[#09090b] px-2.5 py-1.5 rounded-lg border border-[#27272a]">
                            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span>{authUser?.clearanceSource?.includes('Microsoft Entra') ? 'Microsoft Entra SSO' : 'Firebase & Cloud Active'}</span>
                            </div>
                            <span className="font-mono text-[#a1a1aa] font-medium">
                              {workspaceType === 'SOLO_ANALYST' ? 'Solo Analyst' : roleConfig.displayName.split(' ')[0]}
                            </span>
                          </div>
                        </div>

                        {/* 2. Account Center Primary Option (Locked in Demo Mode) */}
                        <div className="py-2 space-y-1">
                          {viewMode === 'demo' ? (
                            <div
                              id="btn-dropdown-account-center"
                              title="Account Center is locked in demo mode. Exit demo mode to configure workspace credentials & roles."
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
                                      <Lock className="w-2.5 h-2.5" />
                                      Locked
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-[#71717a]">Security, credentials & roles (Locked in Demo)</div>
                                </div>
                              </div>
                              <Lock className="w-3.5 h-3.5 text-amber-500/70" />
                            </div>
                          ) : (
                            <button
                              id="btn-dropdown-account-center"
                              onClick={() => {
                                setIsUserMenuOpen(false);
                                if (onOpenAccountCenter) {
                                  onOpenAccountCenter();
                                }
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

                          {/* Sign in with Google if not connected with Google */}
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

                        {/* 3. Navigation Items (Saved Cloud Models & Landing Page) */}
                        <div className="py-2 space-y-1">
                          {/* Saved Cloud Models */}
                          {onOpenCloudModal && (
                            <button
                              id="btn-dropdown-cloud-models"
                              onClick={() => {
                                setIsUserMenuOpen(false);
                                onOpenCloudModal();
                              }}
                              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer text-left font-medium group"
                            >
                              <div className="flex items-center gap-2">
                                <Cloud className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
                                <span>Saved Cloud Models</span>
                              </div>
                              <span className="text-[10px] font-mono text-[#71717a]">
                                Firestore
                              </span>
                            </button>
                          )}

                          {/* Home */}
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
                                <span>Home</span>
                              </div>
                            </button>
                          )}
                        </div>

                        {/* 4. Dedicated Log Out Action */}
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
                            className="w-full flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 transition-all cursor-pointer shadow-sm"
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

          </div>

        </div>
      </div>
    </header>
  );
};
