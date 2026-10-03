import React, { useState } from 'react';
import { 
  RefreshCw, 
  X, 
  CheckCircle2, 
  Database, 
  Server, 
  ArrowRight, 
  Clock, 
  AlertCircle,
  Zap,
  Lock,
  ShieldAlert
} from 'lucide-react';
import { ErpSyncStatus, UserRole } from '../types';
import { USER_ROLES } from '../utils/encryption';

interface ErpSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncStatus: ErpSyncStatus;
  onTriggerSync: (erpSystem: string) => Promise<void>;
  isReconciling?: boolean;
  userRole?: UserRole;
  onOpenRoleMatrix?: () => void;
}

const SUPPORTED_ERPS = [
  {
    id: 'NetSuite',
    name: 'Oracle NetSuite OneWorld',
    type: 'Cloud ERP',
    description: 'Multi-subsidiary general ledger, automated currency revaluation, and invoice matching.',
  },
  {
    id: 'SAP',
    name: 'SAP S/4HANA Finance',
    type: 'Enterprise ERP',
    description: 'Universal journal ledger (ACDOCA), real-time CO-PA profitability, and cash management.',
  },
  {
    id: 'Dynamics365',
    name: 'Microsoft Dynamics 365 F&O',
    type: 'Enterprise ERP',
    description: 'General ledger journals, cost accounting, and multi-currency consolidation.',
  },
  {
    id: 'QuickBooks',
    name: 'QuickBooks Online Advanced',
    type: 'SMB Financials',
    description: 'Direct REST API synchronization of profit & loss, balance sheet, and expenses.',
  },
];

export const ErpSyncModal: React.FC<ErpSyncModalProps> = ({
  isOpen,
  onClose,
  syncStatus,
  onTriggerSync,
  isReconciling = false,
  userRole = 'ADMIN_CFO',
  onOpenRoleMatrix,
}) => {
  const [selectedErp, setSelectedErp] = useState(syncStatus.system);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const roleConfig = USER_ROLES[userRole];
  const canSync = roleConfig?.canSyncERP ?? true;

  const activeReconciling = isSyncing || isReconciling || syncStatus.status === 'Syncing';

  if (!isOpen) return null;

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      await onTriggerSync(selectedErp);
      setSyncFeedback(`Successfully synchronized ledger entries with ${selectedErp}. General ledger state updated.`);
    } catch (err: any) {
      setSyncFeedback('ERP Synchronization timed out. Please verify API gateway.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-[#27272a] bg-[#18181b] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                ERP System Live Data Synchronization
                <span className="text-xs px-2 py-0.5 rounded bg-[#10b981]/10 text-[#10b981] font-mono border border-[#10b981]/30">
                  Real-Time
                </span>
              </h3>
              <p className="text-xs text-[#71717a]">Direct General Ledger & Subledger Connector</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Active Status Card */}
          <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-white text-sm">Active Connector Status</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-medium border flex items-center gap-1.5 ${
                activeReconciling
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : syncStatus.status === 'Connected' 
                  ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30' 
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {activeReconciling ? (
                  <>
                    <span className="relative flex h-2 w-2 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400 animate-erp-pulse" />
                    </span>
                    Reconciling General Ledger
                  </>
                ) : (
                  syncStatus.status
                )}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
              <div className="p-2 rounded-lg bg-[#18181b] border border-[#27272a]">
                <span className="text-[10px] text-[#71717a] font-sans block">Connected ERP</span>
                <span className="font-medium text-white">{syncStatus.system}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#18181b] border border-[#27272a]">
                <span className="text-[10px] text-[#71717a] font-sans block">Records Synced</span>
                <span className="font-medium text-[#10b981]">{syncStatus.recordsSynced.toLocaleString()}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#18181b] border border-[#27272a]">
                <span className="text-[10px] text-[#71717a] font-sans block">Sync Latency</span>
                <span className="font-medium text-indigo-400">{syncStatus.latencyMs} ms</span>
              </div>
            </div>

            <div className="text-[11px] text-[#71717a] flex items-center gap-1.5 pt-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-[#71717a]" />
              <span>Last Synchronized: {new Date(syncStatus.lastSync).toLocaleString()}</span>
            </div>
          </div>

          {/* Select ERP System to Sync */}
          <div className="space-y-2">
            <label className="font-semibold text-white block">Select Target ERP Environment:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SUPPORTED_ERPS.map((erp) => (
                <button
                  key={erp.id}
                  onClick={() => setSelectedErp(erp.name)}
                  className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                    selectedErp === erp.name
                      ? 'bg-[#27272a] border-indigo-500 text-white shadow-sm'
                      : 'bg-[#09090b] border-[#27272a] hover:bg-[#27272a]/40 text-[#a1a1aa]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white text-xs">{erp.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#18181b] text-indigo-400 font-mono border border-[#27272a]">
                        {erp.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#71717a] leading-relaxed">{erp.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Role Locked Notice */}
          {!canSync && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Live ERP ledger synchronization is <strong>restricted</strong> for <strong>{roleConfig.displayName}</strong> under SOX-404 segregation of duties.
                </span>
              </div>
              {onOpenRoleMatrix && (
                <button
                  onClick={() => { onClose(); onOpenRoleMatrix(); }}
                  className="text-[11px] font-mono text-amber-400 hover:text-amber-200 underline cursor-pointer shrink-0"
                >
                  View RBAC Matrix →
                </button>
              )}
            </div>
          )}

          {syncFeedback && (
            <div className="p-3 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10b981] flex-shrink-0" />
              <span>{syncFeedback}</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#27272a] bg-[#18181b] flex items-center justify-between">
          <span className="text-xs text-[#71717a] font-mono">OAuth 2.0 Mutual TLS Auth</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] border border-[#3f3f46] text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            {canSync ? (
              <button
                onClick={handleSync}
                disabled={activeReconciling}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${activeReconciling ? 'animate-spin' : ''}`} />
                <span>{activeReconciling ? 'Reconciling General Ledger...' : 'Sync General Ledger Now'}</span>
              </button>
            ) : (
              <button
                onClick={() => { onClose(); onOpenRoleMatrix?.(); }}
                className="px-4 py-2 rounded-lg bg-[#27272a] text-[#71717a] border border-[#3f3f46] text-xs font-medium flex items-center gap-2 cursor-pointer hover:border-amber-500/40"
                title={`ERP Sync restricted for ${roleConfig.displayName}`}
              >
                <Lock className="w-3.5 h-3.5 text-amber-500/70" />
                <span>Sync Locked (SOX-404)</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
