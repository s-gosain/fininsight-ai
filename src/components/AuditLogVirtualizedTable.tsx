import React from 'react';
import { List } from 'react-window';
import { AuditLog } from '../types';
import { ShieldCheck, Database, FileSpreadsheet, Share2, RefreshCw } from 'lucide-react';

interface AuditLogVirtualizedTableProps {
  logs: AuditLog[];
  isDataMasked?: boolean;
  height?: number;
}

interface RowData {
  logs: AuditLog[];
  isDataMasked?: boolean;
}

const getCategoryBadge = (category: AuditLog['category']) => {
  switch (category) {
    case 'Security':
      return {
        bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        icon: ShieldCheck,
      };
    case 'ERP Sync':
      return {
        bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        icon: RefreshCw,
      };
    case 'Export':
      return {
        bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
        icon: FileSpreadsheet,
      };
    case 'Collaboration':
      return {
        bg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
        icon: Share2,
      };
    case 'Analysis':
    default:
      return {
        bg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
        icon: Database,
      };
  }
};

const LogRow = ({
  index,
  style,
  logs,
}: {
  index: number;
  style: React.CSSProperties;
  logs: AuditLog[];
  isDataMasked?: boolean;
}) => {
  const log = logs[index];
  if (!log) return null;

  const badge = getCategoryBadge(log.category);
  const Icon = badge.icon;
  const isEven = index % 2 === 0;

  return (
    <div
      style={style}
      className={`flex items-center px-3 border-b border-[#27272a]/70 font-mono text-xs hover:bg-[#27272a]/40 transition-colors ${
        isEven ? 'bg-[#18181b]' : 'bg-[#141416]'
      }`}
    >
      {/* Timestamp */}
      <div className="w-[165px] shrink-0 text-[#71717a] text-[11px] truncate pr-2">
        {new Date(log.timestamp).toLocaleString(undefined, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })}
      </div>

      {/* User & Role */}
      <div className="w-[180px] shrink-0 pr-3 truncate">
        <div className="font-sans font-medium text-white truncate">{log.user}</div>
        <div className="text-[10px] text-[#71717a] truncate">{log.role}</div>
      </div>

      {/* Category */}
      <div className="w-[115px] shrink-0 pr-2">
        <span
          className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border font-mono ${badge.bg}`}
        >
          <Icon className="w-2.5 h-2.5 shrink-0" />
          <span className="truncate">{log.category}</span>
        </span>
      </div>

      {/* Action */}
      <div className="w-[175px] shrink-0 pr-3 font-sans font-medium text-slate-200 truncate">
        {log.action}
      </div>

      {/* Details & Parameters */}
      <div className="flex-1 min-w-[200px] pr-3 font-sans text-[#a1a1aa] text-[11px] truncate" title={log.details}>
        {log.details}
      </div>

      {/* Origin IP */}
      <div className="w-[110px] shrink-0 text-right text-[#71717a] text-[11px] font-mono">
        {log.ipAddress}
      </div>
    </div>
  );
};

export const AuditLogVirtualizedTable: React.FC<AuditLogVirtualizedTableProps> = ({
  logs,
  isDataMasked = false,
  height = 380,
}) => {
  if (logs.length === 0) {
    return (
      <div className="border border-[#27272a] rounded-xl p-12 text-center text-[#71717a] bg-[#09090b]">
        <p className="text-sm font-medium text-white mb-1">No matching audit logs found</p>
        <p className="text-xs text-[#71717a]">
          Adjust search criteria, category filters, role restrictions, or date range.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[#27272a] rounded-xl overflow-hidden bg-[#18181b] flex flex-col shadow-inner">
      {/* Fixed Sticky Header */}
      <div className="flex items-center px-3 py-2.5 bg-[#09090b] text-[#71717a] font-semibold border-b border-[#27272a] font-mono text-[11px] uppercase tracking-wider select-none shrink-0">
        <div className="w-[165px] shrink-0">Timestamp</div>
        <div className="w-[180px] shrink-0">User & Role</div>
        <div className="w-[115px] shrink-0">Category</div>
        <div className="w-[175px] shrink-0">Action</div>
        <div className="flex-1 min-w-[200px]">Details & Parameters</div>
        <div className="w-[110px] shrink-0 text-right">Origin IP</div>
      </div>

      {/* Virtualized Body */}
      <div className="w-full relative" style={{ height }}>
        <List<RowData>
          rowCount={logs.length}
          rowHeight={52}
          rowComponent={LogRow}
          rowProps={{ logs, isDataMasked }}
          style={{ height, width: '100%' }}
        />
      </div>

      {/* Virtualization Footer Status */}
      <div className="px-3 py-1.5 bg-[#0d0d10] border-t border-[#27272a] text-[10px] font-mono text-[#71717a] flex items-center justify-between">
        <span>Virtualized Pipeline: Rendering {logs.length.toLocaleString()} entries smoothly</span>
        <span className="text-emerald-400/80 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Hardware Accelerated 60 FPS
        </span>
      </div>
    </div>
  );
};
