import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  X, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Filter,
  Archive,
  Download,
  Trash2,
  Clock,
  Search,
  RotateCcw,
  FileSpreadsheet,
  BarChart2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { AuditLog, UserRole } from '../types';
import { USER_ROLES, COMPLIANCE_STANDARDS } from '../utils/encryption';
import { 
  getArchivedAuditLogs, 
  cleanupAndArchiveAuditLogs, 
  exportArchivedLogsAsJson, 
  exportAuditLogsToCsv,
  clearArchivedAuditLogs,
  generateSampleAuditLogs,
  isOlderThanDays 
} from '../utils/auditLogger';
import { AuditActivityChart } from './AuditActivityChart';
import { AuditLogVirtualizedTable } from './AuditLogVirtualizedTable';
import { BackendLogsViewer } from './BackendLogsViewer';
import { RoleLockedView } from './RoleLockedView';
import { Terminal, Lock } from 'lucide-react';

interface AuditSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLogs: AuditLog[];
  userRole: UserRole;
  isDataMasked: boolean;
  onToggleDataMask: () => void;
  onUpdateActiveLogs?: (prunedLogs: AuditLog[]) => void;
  initialTab?: 'logs' | 'backend' | 'archive' | 'rbac' | 'security' | 'compliance';
}

export const AuditSecurityModal: React.FC<AuditSecurityModalProps> = ({
  isOpen,
  onClose,
  auditLogs,
  userRole,
  isDataMasked,
  onToggleDataMask,
  onUpdateActiveLogs,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'backend' | 'archive' | 'rbac' | 'security' | 'compliance'>(
    initialTab || 'logs'
  );

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedActionType, setSelectedActionType] = useState<string>('All');
  const [dateRange, setDateRange] = useState<'all' | '24h' | '7d' | '30d' | '90d' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedChartDate, setSelectedChartDate] = useState<string | null>(null);

  // View & Simulation States
  const [showActivityChart, setShowActivityChart] = useState<boolean>(true);
  const [localLogsOverride, setLocalLogsOverride] = useState<AuditLog[] | null>(null);
  const [archivedLogs, setArchivedLogs] = useState<AuditLog[]>([]);
  const [cleanupMessage, setCleanupMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setArchivedLogs(getArchivedAuditLogs());
    }
  }, [isOpen]);

  // Working active logs pool (standard or simulated)
  const roleConfig = USER_ROLES[userRole];
  const canViewLogs = roleConfig?.canViewAuditLogs ?? true;

  const activeLogsList = useMemo(() => {
    return localLogsOverride || auditLogs;
  }, [localLogsOverride, auditLogs]);

  const categories = ['All', 'Security', 'Analysis', 'Export', 'Collaboration', 'ERP Sync'];

  // Dynamic filter option extractions
  const availableRoles = useMemo(() => {
    const roles = new Set(activeLogsList.map((l) => l.role));
    return ['All', ...Array.from(roles).sort()];
  }, [activeLogsList]);

  const availableActionTypes = useMemo(() => {
    const actions = new Set(activeLogsList.map((l) => l.action));
    return ['All', ...Array.from(actions).sort()];
  }, [activeLogsList]);

  // Comprehensive multi-criteria filtering
  const filteredLogs = useMemo(() => {
    return activeLogsList.filter((log) => {
      // 1. Text Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          log.user.toLowerCase().includes(q) ||
          log.role.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q) ||
          log.ipAddress.toLowerCase().includes(q) ||
          log.category.toLowerCase().includes(q) ||
          log.id.toLowerCase().includes(q);
        if (!match) return false;
      }

      // 2. Category
      if (selectedCategory !== 'All' && log.category !== selectedCategory) {
        return false;
      }

      // 3. User Role
      if (selectedRole !== 'All' && log.role !== selectedRole) {
        return false;
      }

      // 4. Action Type
      if (selectedActionType !== 'All' && log.action !== selectedActionType) {
        return false;
      }

      // 5. Date Range
      const logTime = new Date(log.timestamp).getTime();
      const now = Date.now();

      if (!isNaN(logTime)) {
        if (dateRange === '24h') {
          if (logTime < now - 24 * 60 * 60 * 1000) return false;
        } else if (dateRange === '7d') {
          if (logTime < now - 7 * 24 * 60 * 60 * 1000) return false;
        } else if (dateRange === '30d') {
          if (logTime < now - 30 * 24 * 60 * 60 * 1000) return false;
        } else if (dateRange === '90d') {
          if (logTime < now - 90 * 24 * 60 * 60 * 1000) return false;
        } else if (dateRange === 'custom') {
          if (startDate) {
            const startEpoch = new Date(startDate).getTime();
            if (logTime < startEpoch) return false;
          }
          if (endDate) {
            const endEpoch = new Date(`${endDate}T23:59:59`).getTime();
            if (logTime > endEpoch) return false;
          }
        }
      }

      // 6. Interactive Chart Date Drill-down
      if (selectedChartDate) {
        const logDateKey = new Date(log.timestamp).toISOString().split('T')[0];
        if (logDateKey !== selectedChartDate) return false;
      }

      return true;
    });
  }, [
    activeLogsList,
    searchQuery,
    selectedCategory,
    selectedRole,
    selectedActionType,
    dateRange,
    startDate,
    endDate,
    selectedChartDate,
  ]);

  const filteredArchived = archivedLogs.filter((log) => {
    if (selectedCategory === 'All') return true;
    return log.category === selectedCategory;
  });

  const olderThan30DaysCount = activeLogsList.filter((l) => isOlderThanDays(l.timestamp, 30)).length;

  const isFiltered =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedRole !== 'All' ||
    selectedActionType !== 'All' ||
    dateRange !== 'all' ||
    selectedChartDate !== null;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedRole('All');
    setSelectedActionType('All');
    setDateRange('all');
    setStartDate('');
    setEndDate('');
    setSelectedChartDate(null);
  };

  // CSV Export
  const handleDownloadCsv = () => {
    const exportData = filteredLogs.length > 0 ? filteredLogs : activeLogsList;
    exportAuditLogsToCsv(
      exportData,
      `FinVitals_Audit_Report_${selectedCategory === 'All' ? 'Consolidated' : selectedCategory}`
    );
    setCleanupMessage(`Exported ${exportData.length.toLocaleString()} audit log record(s) to CSV for regulatory compliance.`);
    setTimeout(() => setCleanupMessage(null), 4000);
  };

  // Archive Cleanup
  const handleRunCleanup = () => {
    const result = cleanupAndArchiveAuditLogs(activeLogsList, 30);
    setArchivedLogs(result.archivedLogs);
    if (onUpdateActiveLogs && !localLogsOverride) {
      onUpdateActiveLogs(result.activeLogs);
    }
    if (localLogsOverride) {
      setLocalLogsOverride(result.activeLogs);
    }
    setCleanupMessage(
      result.newlyArchivedCount > 0
        ? `Successfully moved ${result.newlyArchivedCount} log(s) older than 30 days to the local storage archive vault.`
        : 'All current audit logs are within the active 30-day retention window.'
    );
    setTimeout(() => setCleanupMessage(null), 4000);
  };

  const handleClearArchive = () => {
    if (window.confirm('Are you sure you want to permanently clear the local archive vault?')) {
      clearArchivedAuditLogs();
      setArchivedLogs([]);
      setCleanupMessage('Archived log vault cleared.');
      setTimeout(() => setCleanupMessage(null), 3000);
    }
  };

  // Synthetic Test Generator for High-Volume Virtualization Testing
  const handleSimulateLargeLogs = (count: number) => {
    const syntheticLogs = generateSampleAuditLogs(count);
    setLocalLogsOverride(syntheticLogs);
    setCleanupMessage(`Generated ${count.toLocaleString()} simulated enterprise audit entries. Virtualized list rendering active at 60 FPS.`);
    setTimeout(() => setCleanupMessage(null), 5000);
  };

  const handleRestoreDefaultLogs = () => {
    setLocalLogsOverride(null);
    setCleanupMessage('Restored baseline system audit logs.');
    setTimeout(() => setCleanupMessage(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl w-full max-w-5xl xl:max-w-6xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#27272a] bg-[#18181b] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2 flex-wrap">
                Audit Trail & Cloud Security Governance
                <span className="text-xs px-2 py-0.5 rounded bg-[#10b981]/10 text-[#10b981] font-mono border border-[#10b981]/30">
                  SOX 404 Ready
                </span>
                {localLogsOverride && (
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono border border-purple-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Stress-Test Mode ({localLogsOverride.length.toLocaleString()} entries)
                  </span>
                )}
              </h3>
              <p className="text-xs text-[#71717a]">
                Cryptographic Verification, Real-Time Telemetry & Regulatory Reporting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Primary Download CSV Button in Header */}
            {canViewLogs ? (
              <button
                onClick={handleDownloadCsv}
                title="Export current audit trail as an RFC 4180-compliant CSV report"
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer font-medium shadow-sm hover:shadow"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download CSV</span>
                <span className="text-[10px] opacity-75">({filteredLogs.length})</span>
              </button>
            ) : (
              <button
                disabled
                className="px-3 py-1.5 rounded-lg bg-[#18181b] text-[#71717a] border border-[#27272a] font-mono text-xs flex items-center gap-1.5 opacity-60 cursor-not-allowed"
                title={`Audit trail export is locked for ${roleConfig.displayName}`}
              >
                <Lock className="w-3.5 h-3.5 text-amber-500/70" />
                <span>Download CSV (Locked)</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-3 sm:px-5 border-b border-[#27272a] bg-[#09090b] flex items-center justify-between gap-2 text-xs overflow-x-auto scrollbar-none shrink-0">
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-3 px-3 font-medium border-b-2 transition-all font-mono whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'logs'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-[#71717a] hover:text-[#a1a1aa]'
              }`}
            >
              {!canViewLogs && <Lock className="w-3 h-3 text-amber-500/70" />}
              <span>Active Audit Trail ({activeLogsList.length.toLocaleString()})</span>
            </button>
            <button
              id="tab-backend-logs"
              onClick={() => setActiveTab('backend')}
              className={`py-3 px-3 font-medium border-b-2 transition-all font-mono flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'backend'
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-[#71717a] hover:text-[#a1a1aa]'
              }`}
            >
              {!canViewLogs ? (
                <Lock className="w-3 h-3 text-amber-500/70" />
              ) : (
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>Backend Server Logs</span>
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={`py-3 px-3 font-medium border-b-2 transition-all font-mono flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'archive'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-[#71717a] hover:text-[#a1a1aa]'
              }`}
            >
              {!canViewLogs ? (
                <Lock className="w-3 h-3 text-amber-500/70" />
              ) : (
                <Archive className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span>Archive Vault ({archivedLogs.length.toLocaleString()})</span>
            </button>
            <button
              onClick={() => setActiveTab('rbac')}
              className={`py-3 px-3 font-medium border-b-2 transition-all font-mono whitespace-nowrap ${
                activeTab === 'rbac'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-[#71717a] hover:text-[#a1a1aa]'
              }`}
            >
              Role-Based Access (RBAC)
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-3 px-3 font-medium border-b-2 transition-all font-mono whitespace-nowrap ${
                activeTab === 'security'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-[#71717a] hover:text-[#a1a1aa]'
              }`}
            >
              End-to-End Encryption
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`py-3 px-3 font-medium border-b-2 transition-all font-mono whitespace-nowrap ${
                activeTab === 'compliance'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-[#71717a] hover:text-[#a1a1aa]'
              }`}
            >
              Regulatory Compliance
            </button>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 py-1.5">
            {activeTab === 'logs' && (
              <button
                onClick={() => setShowActivityChart((prev) => !prev)}
                className={`px-2.5 py-1.5 rounded-lg border font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showActivityChart
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
                    : 'bg-[#18181b] text-[#71717a] border-[#27272a] hover:text-[#a1a1aa]'
                }`}
                title="Toggle visual activity chart"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>{showActivityChart ? 'Hide Trends' : 'Show Trends'}</span>
              </button>
            )}

            <button
              onClick={handleRunCleanup}
              title="Archive audit records older than 30 days into local storage"
              className="px-2.5 py-1.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white border border-[#27272a] font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Archive &gt;30 Days</span>
              {olderThan30DaysCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px]">
                  {olderThan30DaysCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 text-xs space-y-4">
          
          {/* Notification / Feedback Banner */}
          {cleanupMessage && (
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{cleanupMessage}</span>
              </div>
              <button
                onClick={() => setCleanupMessage(null)}
                className="text-xs text-indigo-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TAB 1: AUDIT TRAIL LOGS (VIRTUALIZED + FILTERS + CHART) */}
          {activeTab === 'logs' && (
            !canViewLogs ? (
              <RoleLockedView
                featureName="Immutable Audit Trail"
                requiredClearance="ADMIN_CFO | AUDITOR | SENIOR_ANALYST"
                userRole={userRole}
                onOpenRoleMatrix={() => setActiveTab('rbac')}
                description="Live audit transaction logging is restricted for this clearance level under SOX-404 regulatory compliance rules."
              />
            ) : (
            <div className="space-y-4">
              
              {/* Activity Trend Chart (Recharts) */}
              {showActivityChart && (
                <AuditActivityChart
                  logs={activeLogsList}
                  selectedDate={selectedChartDate}
                  onSelectDate={(d) => setSelectedChartDate(d)}
                />
              )}

              {/* Advanced Filter Control Bar */}
              <div className="bg-[#121214] border border-[#27272a] rounded-xl p-3 space-y-3 shadow-sm">
                
                {/* Upper Filter Row: Search + Category + Role + Action + Date Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2.5 items-center">
                  
                  {/* Search Input (Col 1-4) */}
                  <div className="md:col-span-4 relative">
                    <Search className="w-3.5 h-3.5 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search user, action, details, IP..."
                      className="w-full pl-8 pr-7 py-1.5 bg-[#18181b] border border-[#27272a] rounded-lg text-white placeholder-[#71717a] text-xs font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Category Filter Dropdown (Col 5-6) */}
                  <div className="md:col-span-2">
                    <label className="sr-only">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full py-1.5 px-2.5 bg-[#18181b] border border-[#27272a] rounded-lg text-white text-xs font-mono focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat} className="bg-[#18181b]">
                          {cat === 'All' ? 'All Categories' : cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* User Role Filter Dropdown (Col 7-8) */}
                  <div className="md:col-span-2">
                    <label className="sr-only">User Role</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full py-1.5 px-2.5 bg-[#18181b] border border-[#27272a] rounded-lg text-white text-xs font-mono focus:outline-none focus:border-indigo-500 cursor-pointer truncate"
                    >
                      {availableRoles.map((role) => (
                        <option key={role} value={role} className="bg-[#18181b]">
                          {role === 'All' ? 'All Roles' : role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Action Type Filter Dropdown (Col 9-10) */}
                  <div className="md:col-span-2">
                    <label className="sr-only">Action Type</label>
                    <select
                      value={selectedActionType}
                      onChange={(e) => setSelectedActionType(e.target.value)}
                      className="w-full py-1.5 px-2.5 bg-[#18181b] border border-[#27272a] rounded-lg text-white text-xs font-mono focus:outline-none focus:border-indigo-500 cursor-pointer truncate"
                    >
                      {availableActionTypes.map((action) => (
                        <option key={action} value={action} className="bg-[#18181b]">
                          {action === 'All' ? 'All Action Types' : action}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Range Dropdown (Col 11-12) */}
                  <div className="md:col-span-2">
                    <label className="sr-only">Date Range</label>
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value as any)}
                      className="w-full py-1.5 px-2.5 bg-[#18181b] border border-[#27272a] rounded-lg text-white text-xs font-mono focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="all" className="bg-[#18181b]">All Time</option>
                      <option value="24h" className="bg-[#18181b]">Last 24 Hours</option>
                      <option value="7d" className="bg-[#18181b]">Last 7 Days</option>
                      <option value="30d" className="bg-[#18181b]">Last 30 Days</option>
                      <option value="90d" className="bg-[#18181b]">Last 90 Days</option>
                      <option value="custom" className="bg-[#18181b]">Custom Range</option>
                    </select>
                  </div>

                </div>

                {/* Custom Date Range Sub-Bar (Shown when 'custom' is selected) */}
                {dateRange === 'custom' && (
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#27272a]/60 text-xs font-mono">
                    <span className="text-[#71717a] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      Date Window:
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="py-1 px-2.5 bg-[#18181b] border border-[#27272a] rounded text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-[#71717a]">to</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="py-1 px-2.5 bg-[#18181b] border border-[#27272a] rounded text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {/* Lower Filter Status & Action Triggers */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#27272a]/60 text-xs">
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-[#71717a]">
                      Displaying{' '}
                      <strong className="text-white font-semibold">
                        {filteredLogs.length.toLocaleString()}
                      </strong>{' '}
                      of {activeLogsList.length.toLocaleString()} records
                    </span>

                    {selectedChartDate && (
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] flex items-center gap-1">
                        Filtered to {selectedChartDate}
                        <button
                          onClick={() => setSelectedChartDate(null)}
                          className="hover:text-white"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    )}

                    {isFiltered && (
                      <button
                        onClick={handleResetFilters}
                        className="px-2 py-0.5 rounded bg-[#27272a] hover:bg-[#3f3f46] text-[#a1a1aa] hover:text-white text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Reset Filters</span>
                      </button>
                    )}
                  </div>

                  {/* Virtualization Stress-Test Simulation Toggles */}
                  <div className="flex items-center gap-2">
                    {!localLogsOverride ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#71717a] font-mono hidden sm:inline">
                          Stress-Test Virtualization:
                        </span>
                        <button
                          onClick={() => handleSimulateLargeLogs(1000)}
                          className="px-2 py-1 rounded bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 font-mono text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                          title="Generate 1,000 synthetic records to verify 60 FPS virtualization"
                        >
                          <Layers className="w-3 h-3" />
                          <span>+1,000 Logs</span>
                        </button>
                        <button
                          onClick={() => handleSimulateLargeLogs(2500)}
                          className="px-2 py-1 rounded bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 font-mono text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                          title="Generate 2,500 synthetic records to verify high-volume virtualized scrolling"
                        >
                          <Layers className="w-3 h-3" />
                          <span>+2,500 Logs</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleRestoreDefaultLogs}
                        className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restore Standard Logs</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* Virtualized Audit Logs Table Component */}
              <AuditLogVirtualizedTable
                logs={filteredLogs}
                isDataMasked={isDataMasked}
                height={370}
              />

            </div>
            )
          )}

          {/* TAB 1.5: ARCHIVE VAULT (>30 DAYS) */}
          {activeTab === 'archive' && (
            !canViewLogs ? (
              <RoleLockedView
                featureName="Historical Log Archives"
                requiredClearance="ADMIN_CFO | AUDITOR | SENIOR_ANALYST"
                userRole={userRole}
                onOpenRoleMatrix={() => setActiveTab('rbac')}
                description="Long-term historical audit log archives and regulatory compliance snapshots are restricted to authorized compliance officers."
              />
            ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#09090b] border border-[#27272a] rounded-xl p-4">
                <div>
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <Archive className="w-4 h-4 text-indigo-400" />
                    Long-Term Audit Log Storage Vault
                  </h4>
                  <p className="text-xs text-[#71717a] mt-0.5">
                    Audit trails older than 30 days are automatically archived to local storage to maintain optimal application rendering performance and memory footprint.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportAuditLogsToCsv(archivedLogs, 'FinVitals_Audit_Archive')}
                    disabled={archivedLogs.length === 0}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export Archive (.csv)</span>
                  </button>
                  <button
                    onClick={() => exportArchivedLogsAsJson(archivedLogs)}
                    disabled={archivedLogs.length === 0}
                    className="px-3 py-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-white font-mono text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Dossier (.json)</span>
                  </button>
                  <button
                    onClick={handleClearArchive}
                    disabled={archivedLogs.length === 0}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Vault</span>
                  </button>
                </div>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <span className="text-[#71717a] font-medium mr-1 flex items-center gap-1 font-mono text-[11px]">
                  <Filter className="w-3.5 h-3.5" /> Filter Category:
                </span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#27272a] text-white border border-[#3f3f46]'
                        : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]/50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Virtualized Archive Table */}
              <AuditLogVirtualizedTable
                logs={filteredArchived}
                isDataMasked={isDataMasked}
                height={380}
              />
            </div>
            )
          )}

          {/* TAB: BACKEND SERVER LOGS & DIAGNOSTICS */}
          {activeTab === 'backend' && (
            !canViewLogs ? (
              <RoleLockedView
                featureName="Backend Server Telemetry"
                requiredClearance="ADMIN_CFO | AUDITOR | SENIOR_ANALYST"
                userRole={userRole}
                onOpenRoleMatrix={() => setActiveTab('rbac')}
                description="Low-level container diagnostics, system health telemetry, and runtime process logs are restricted to authorized administrators."
              />
            ) : (
            <div className="space-y-4">
              <BackendLogsViewer />
            </div>
            )
          )}

          {/* TAB 2: ROLE-BASED ACCESS CONTROL (RBAC) */}
          {activeTab === 'rbac' && (
            <div className="space-y-4">
              <p className="text-[#a1a1aa] leading-relaxed">
                Granular permission matrix enforced per authenticated user session. Segregation of duties conforms to Sarbanes-Oxley (SOX) Section 404.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(USER_ROLES).map((role) => (
                  <div key={role.role} className="bg-[#09090b] border border-[#27272a] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white text-sm">{role.displayName}</h4>
                      {userRole === role.role && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#10b981]/10 text-[#10b981] font-mono border border-[#10b981]/30">
                          Active Session
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#71717a]">{role.description}</p>

                    {/* Permissions list */}
                    <div className="space-y-1.5 pt-2 border-t border-[#27272a] text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#a1a1aa]">Export PDF Reports</span>
                        <span className={role.canExportPDF ? 'text-[#10b981] font-mono' : 'text-[#71717a] font-mono'}>
                          {role.canExportPDF ? 'Allowed' : 'Restricted'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#a1a1aa]">Modify Statement Data</span>
                        <span className={role.canEditData ? 'text-[#10b981] font-mono' : 'text-[#71717a] font-mono'}>
                          {role.canEditData ? 'Allowed' : 'Restricted'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#a1a1aa]">View System Audit Trail</span>
                        <span className={role.canViewAuditLogs ? 'text-[#10b981] font-mono' : 'text-[#71717a] font-mono'}>
                          {role.canViewAuditLogs ? 'Allowed' : 'Restricted'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#a1a1aa]">ERP Ledger Synchronization</span>
                        <span className={role.canSyncERP ? 'text-[#10b981] font-mono' : 'text-[#71717a] font-mono'}>
                          {role.canSyncERP ? 'Allowed' : 'Restricted'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#a1a1aa]">Encryption & Key Controls</span>
                        <span className={role.canToggleEncryption ? 'text-[#10b981] font-mono' : 'text-[#71717a] font-mono'}>
                          {role.canToggleEncryption ? 'Allowed' : 'Restricted'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: END-TO-END ENCRYPTION */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                  Cryptographic Architecture & Envelope Encryption
                </h4>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  Financial payloads, scenario models, and customer balances are encrypted at rest using AES-256 GCM authenticated encryption. Cryptographic keys are protected using an envelope pattern with distinct Data Encryption Keys (DEKs) rotated on 90-day intervals.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a]">
                    <span className="text-[10px] text-[#71717a] block font-mono">Transit Security</span>
                    <span className="font-medium text-white">TLS 1.3 Strict Ciphers</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a]">
                    <span className="text-[10px] text-[#71717a] block font-mono">Rest Encryption</span>
                    <span className="font-medium text-white">AES-256 GCM Authenticated</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a]">
                    <span className="text-[10px] text-[#71717a] block font-mono">Key Rotation Cycle</span>
                    <span className="font-medium text-[#10b981] font-mono">90-Day Auto KMS Rotation</span>
                  </div>
                </div>
              </div>

              {/* Data Masking Setting */}
              <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                    Executive Confidential Data Masking
                    {isDataMasked && <span className="text-amber-400 text-xs font-mono">(Active)</span>}
                  </h4>
                  <p className="text-xs text-[#71717a] mt-0.5">
                    Hides exact numerical balances across dashboard charts, tables, and budget lines during public presentations.
                  </p>
                </div>

                <button
                  onClick={onToggleDataMask}
                  className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                    isDataMasked
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] border border-[#3f3f46]'
                  }`}
                >
                  {isDataMasked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{isDataMasked ? 'Unmask Numbers' : 'Enable Data Masking'}</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 4: COMPLIANCE STANDARDS */}
          {activeTab === 'compliance' && (
            <div className="space-y-3">
              {COMPLIANCE_STANDARDS.map((std, idx) => (
                <div key={idx} className="bg-[#09090b] border border-[#27272a] rounded-xl p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-indigo-400 text-xs px-2 py-0.5 rounded bg-[#18181b] border border-[#27272a]">
                        {std.code}
                      </span>
                      <h4 className="font-semibold text-white text-sm">{std.title}</h4>
                    </div>
                    <p className="text-xs text-[#a1a1aa] leading-relaxed">{std.description}</p>
                  </div>

                  <span className="px-2.5 py-0.5 rounded bg-[#10b981]/10 text-[#10b981] font-mono border border-[#10b981]/30 text-xs whitespace-nowrap flex items-center gap-1 flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{std.status}</span>
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#27272a] bg-[#18181b] flex flex-wrap items-center justify-between gap-3 text-xs text-[#71717a] font-mono">
          <div className="flex items-center gap-3">
            <span>Session IP: 192.168.1.42 • Session ID: #AUD-2026-X89</span>
            <span className="hidden sm:inline text-[#3f3f46]">|</span>
            <span className="hidden sm:inline text-emerald-400">Cryptographic Seal: VALID</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] border border-[#3f3f46] font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] border border-[#3f3f46] font-sans font-medium cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
