import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Terminal,
  RefreshCw,
  Trash2,
  Download,
  Send,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Cpu,
  Server,
  Activity,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { BackendLogEntry, ServerStats } from '../types';

interface BackendLogsViewerProps {
  onClose?: () => void;
}

export const BackendLogsViewer: React.FC<BackendLogsViewerProps> = () => {
  const [logs, setLogs] = useState<BackendLogEntry[]>([]);
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchLogs = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch('/api/backend-logs?limit=200');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLogs(data.logs || []);
          if (data.serverStats) {
            setServerStats(data.serverStats);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch backend logs:', err);
    } finally {
      setIsLoading(false);
      if (!silent) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(false);
  }, [fetchLogs]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  // Show transient feedback helper
  const triggerFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleClearLogs = async () => {
    try {
      const res = await fetch('/api/backend-logs', { method: 'DELETE' });
      if (res.ok) {
        setLogs([]);
        triggerFeedback('Backend event buffer cleared successfully');
        fetchLogs(true);
      }
    } catch (err) {
      console.error('Failed to clear logs:', err);
    }
  };

  const handleSendTestPing = async () => {
    try {
      const res = await fetch('/api/backend-logs/test', { method: 'POST' });
      if (res.ok) {
        triggerFeedback('Test diagnostic ping dispatched and logged');
        fetchLogs(true);
      }
    } catch (err) {
      console.error('Failed to send test ping:', err);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backend_server_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerFeedback('Exported logs as JSON');
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (levelFilter !== 'ALL' && log.level !== levelFilter) return false;
      if (categoryFilter !== 'ALL' && log.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesMsg = log.message.toLowerCase().includes(query);
        const matchesPath = log.path?.toLowerCase().includes(query);
        const matchesCategory = log.category.toLowerCase().includes(query);
        return matchesMsg || matchesPath || matchesCategory;
      }
      return true;
    });
  }, [logs, levelFilter, categoryFilter, searchQuery]);

  const levelCounts = useMemo(() => {
    const counts = { INFO: 0, WARN: 0, ERROR: 0, SUCCESS: 0 };
    logs.forEach((l) => {
      if (counts[l.level] !== undefined) counts[l.level]++;
    });
    return counts;
  }, [logs]);

  const formatUptime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Top Diagnostics Dashboard Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-[#121214] border border-[#27272a] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-mono text-[#71717a]">Server Status</div>
            <div className="text-xs font-semibold text-[#fafafa] flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Online (Port 3000)</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#121214] border border-[#27272a] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-mono text-[#71717a]">Gemini Engine</div>
            <div className="text-xs font-semibold text-indigo-300 truncate">
              {serverStats?.activeModel || 'gemini-3.1-flash-lite'}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#121214] border border-[#27272a] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-mono text-[#71717a]">Total Requests</div>
            <div className="text-xs font-semibold text-[#fafafa]">
              {serverStats?.totalRequests || logs.length} calls
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#121214] border border-[#27272a] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-mono text-[#71717a]">Engine Uptime</div>
            <div className="text-xs font-semibold text-[#fafafa]">
              {serverStats ? formatUptime(serverStats.uptimeSeconds) : 'Active'}
            </div>
          </div>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 font-mono text-[11px] animate-fadeIn">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Control Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-[#121214] border border-[#27272a]">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#71717a]" />
          <input
            id="backend-log-search"
            type="text"
            placeholder="Search endpoint, model, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181b] border border-[#27272a] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Level Filter */}
          <div className="flex items-center gap-1 bg-[#18181b] border border-[#27272a] rounded-lg p-0.5">
            {(['ALL', 'SUCCESS', 'INFO', 'WARN', 'ERROR'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                  levelFilter === lvl
                    ? lvl === 'ERROR'
                      ? 'bg-rose-500/20 text-rose-300 font-semibold'
                      : lvl === 'WARN'
                      ? 'bg-amber-500/20 text-amber-300 font-semibold'
                      : lvl === 'SUCCESS'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'bg-indigo-600 text-white font-semibold'
                    : 'text-[#71717a] hover:text-[#a1a1aa]'
                }`}
              >
                {lvl} {lvl !== 'ALL' && `(${levelCounts[lvl] || 0})`}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            id="backend-category-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#18181b] border border-[#27272a] rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-[#fafafa] focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="GEMINI">Gemini AI</option>
            <option value="API">HTTP API</option>
            <option value="SYSTEM">System Engine</option>
            <option value="ERP">ERP Sync</option>
            <option value="AUTH">Security/Auth</option>
          </select>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
            {/* Auto Refresh Toggle */}
            <button
              id="btn-auto-refresh-toggle"
              onClick={() => setAutoRefresh(!autoRefresh)}
              title={autoRefresh ? 'Disable live auto-polling' : 'Enable live auto-polling (3s)'}
              className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
                autoRefresh
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-[#18181b] text-[#71717a] border-[#27272a] hover:text-[#fafafa]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-[#71717a]'}`}></span>
              <span>{autoRefresh ? 'Live' : 'Paused'}</span>
            </button>

            {/* Manual Refresh */}
            <button
              id="btn-refresh-backend-logs"
              onClick={() => fetchLogs(false)}
              disabled={isRefreshing}
              title="Refresh logs from server"
              className="p-1.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white border border-[#27272a] transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>

            {/* Test Ping */}
            <button
              id="btn-test-ping"
              onClick={handleSendTestPing}
              title="Dispatch test diagnostic ping to server"
              className="px-2 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>Ping</span>
            </button>

            {/* Export */}
            <button
              id="btn-export-backend-logs"
              onClick={handleExportJson}
              title="Download logs JSON"
              className="p-1.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white border border-[#27272a] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Clear */}
            <button
              id="btn-clear-backend-logs"
              onClick={handleClearLogs}
              title="Clear server log memory"
              className="p-1.5 rounded-lg bg-[#18181b] hover:bg-rose-950/40 text-[#71717a] hover:text-rose-400 border border-[#27272a] transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Log Feed Stream */}
      <div className="rounded-xl border border-[#27272a] bg-[#0c0c0e] overflow-hidden font-mono text-[11px]">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-[#141417] border-b border-[#27272a] text-[#71717a] font-medium text-[10px] uppercase">
          <div className="col-span-2 sm:col-span-2">Time</div>
          <div className="col-span-2 sm:col-span-1">Level</div>
          <div className="col-span-2 sm:col-span-1">Category</div>
          <div className="col-span-6 sm:col-span-8">Event / Endpoint & Latency</div>
        </div>

        {/* Log rows */}
        <div className="max-h-[440px] overflow-y-auto divide-y divide-[#18181b]">
          {isLoading && logs.length === 0 ? (
            <div className="p-8 text-center text-[#71717a] flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
              <span>Connecting to backend server stream...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-[#71717a]">
              No server log events match the selected criteria.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const timeStr = new Date(log.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                fractionalSecondDigits: 3,
              });

              return (
                <div key={log.id} className="hover:bg-[#121215] transition-colors">
                  <div
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="grid grid-cols-12 gap-2 px-3 py-2 cursor-pointer items-center"
                  >
                    {/* Time */}
                    <div className="col-span-2 sm:col-span-2 text-[#71717a] text-[10px] truncate">
                      {timeStr}
                    </div>

                    {/* Level */}
                    <div className="col-span-2 sm:col-span-1">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          log.level === 'SUCCESS'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : log.level === 'WARN'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            : log.level === 'ERROR'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        }`}
                      >
                        {log.level}
                      </span>
                    </div>

                    {/* Category */}
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[#a1a1aa] text-[10px] uppercase">
                        [{log.category}]
                      </span>
                    </div>

                    {/* Message & Route Details */}
                    <div className="col-span-6 sm:col-span-8 flex items-center gap-2 min-w-0">
                      {log.method && (
                        <span className="px-1.5 py-0.5 rounded bg-[#1f1f23] text-[#a1a1aa] text-[10px] shrink-0">
                          {log.method}
                        </span>
                      )}
                      {log.statusCode && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] shrink-0 font-bold ${
                            log.statusCode >= 500
                              ? 'bg-rose-500/20 text-rose-300'
                              : log.statusCode >= 400
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {log.statusCode}
                        </span>
                      )}
                      {typeof log.durationMs === 'number' && (
                        <span className="text-[#71717a] text-[10px] shrink-0">
                          {log.durationMs}ms
                        </span>
                      )}
                      <span className="text-[#fafafa] truncate flex-1">
                        {log.message}
                      </span>
                      {log.details && (
                        <span className="text-[#71717a] shrink-0">
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded details viewer */}
                  {isExpanded && log.details && (
                    <div className="px-4 py-3 bg-[#08080a] border-t border-[#1e1e22] text-[#a1a1aa]">
                      <div className="text-[10px] text-[#71717a] uppercase mb-1 font-semibold">
                        Payload & Diagnostic Metadata
                      </div>
                      <pre className="bg-[#101014] p-2.5 rounded-lg border border-[#27272a] overflow-x-auto text-[10px] text-[#d4d4d8]">
                        {typeof log.details === 'string'
                          ? log.details
                          : JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Table Footer */}
        <div className="px-3 py-2 bg-[#141417] border-t border-[#27272a] text-[#71717a] text-[10px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-3 h-3 text-emerald-400" />
            <span>Showing {filteredLogs.length} of {logs.length} server events</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Free-Tier Engine Priority: Active</span>
            <span className="text-emerald-400">● Live Feed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
