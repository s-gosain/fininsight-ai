import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Layers, 
  UserCheck, 
  AlertCircle,
  Sparkles,
  Building2,
  FileSpreadsheet,
  Database,
  Key
} from 'lucide-react';
import { UserRole, NavigationTabId } from '../types';
import { USER_ROLES, TAB_TITLES } from '../utils/encryption';

interface RoleAccessMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

interface CapabilityItem {
  id: string;
  name: string;
  category: 'Tab / Navigation View' | 'Operational Capability';
  description: string;
  check: (role: UserRole) => boolean;
}

export const RoleAccessMatrixModal: React.FC<RoleAccessMatrixModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onRoleChange,
}) => {
  if (!isOpen) return null;

  const allRoles: UserRole[] = ['ADMIN_CFO', 'SENIOR_ANALYST', 'AUDITOR', 'STAKEHOLDER'];

  const allTabs: NavigationTabId[] = [
    'dashboard',
    'visualization',
    'competitors',
    'anomalies',
    'benchmarks',
    'forecasting',
    'redflags',
    'statements',
    'sentiment',
    'budget',
  ];

  const operationalCapabilities: CapabilityItem[] = [
    {
      id: 'upload',
      name: 'Ingest Financial Statements / Overwrite Datasets',
      category: 'Operational Capability',
      description: 'Upload SEC 10-K, 10-Q, or custom general ledger balance sheets and income statements.',
      check: (role) => USER_ROLES[role].canUploadDataset,
    },
    {
      id: 'deep_ai',
      name: 'Execute Gemini Deep 10-K Forensic Audit',
      category: 'Operational Capability',
      description: 'Run deep reasoning AI multi-period variance audit and accounting footnote extraction.',
      check: (role) => USER_ROLES[role].canRunDeepAI,
    },
    {
      id: 'edit_data',
      name: 'Modify Statement Figures & Model Assumptions',
      category: 'Operational Capability',
      description: 'Inline editing of chart-of-accounts balance line items and financial model parameters.',
      check: (role) => USER_ROLES[role].canEditData,
    },
    {
      id: 'erp_sync',
      name: 'Trigger Live ERP Ledger Sync (NetSuite, SAP, etc.)',
      category: 'Operational Capability',
      description: 'Bidirectional synchronization and live ledger revaluation write-backs to enterprise ERPs.',
      check: (role) => USER_ROLES[role].canSyncERP,
    },
    {
      id: 'audit_logs',
      name: 'Inspect System Audit Trail & SOX Forensic Logs',
      category: 'Operational Capability',
      description: 'Access complete immutable chronological logs, client IPs, user actions, and archive vaults.',
      check: (role) => USER_ROLES[role].canViewAuditLogs,
    },
    {
      id: 'approve_budget',
      name: 'Final Budget Variance Authorization (CFO Level)',
      category: 'Operational Capability',
      description: 'Final signatory approval for operational expense overspends and variance disbursements.',
      check: (role) => USER_ROLES[role].canApproveBudget,
    },
    {
      id: 'dispute_budget',
      name: 'Hold Budget Discrepancy for Audit Review',
      category: 'Operational Capability',
      description: 'Flag variance line items and trigger compliance holds on general ledger disbursements.',
      check: (role) => USER_ROLES[role].canDisputeBudget,
    },
    {
      id: 'add_comments',
      name: 'Collaborative Line Item Annotations & Comments',
      category: 'Operational Capability',
      description: 'Create discussion threads, tag colleagues, and attach notes to financial statement items.',
      check: (role) => USER_ROLES[role].canAddComments,
    },
    {
      id: 'resolve_comments',
      name: 'Sign-off & Resolve Audit Discussion Threads',
      category: 'Operational Capability',
      description: 'Mark audit review findings and dispute discussions as officially closed and resolved.',
      check: (role) => USER_ROLES[role].canResolveComments,
    },
    {
      id: 'encryption_keys',
      name: 'Cryptographic AES-256 Key & Masking Controls',
      category: 'Operational Capability',
      description: 'Administrative toggle for hardware envelope encryption and zero-knowledge data masking.',
      check: (role) => USER_ROLES[role].canToggleEncryption,
    },
    {
      id: 'export_pdf',
      name: 'Export Executive Dossier & Audit Package PDF',
      category: 'Operational Capability',
      description: 'Generate timestamped, encrypted PDF briefing packages with compliance watermark.',
      check: (role) => USER_ROLES[role].canExportPDF,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#141418] border border-[#27272a] rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
        
        {/* Header */}
        <div className="p-5 border-b border-[#27272a] flex items-center justify-between bg-[#18181b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Enterprise Role-Based Access Control (RBAC) Matrix
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  SOX-404 Enforced
                </span>
              </div>
              <p className="text-xs text-[#a1a1aa] mt-0.5">
                Every application feature is dynamically locked or unlocked according to institutional segregation of duties.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Quick Switcher Strip */}
        <div className="bg-[#09090b] px-5 py-3 border-b border-[#27272a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-[#a1a1aa] flex items-center gap-2">
            <span className="font-semibold text-white">Active Session Clearance:</span>
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-xs border border-indigo-500/30">
              {USER_ROLES[currentRole].displayName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[11px] text-[#71717a] mr-1 hidden md:inline">Switch Role:</span>
            {allRoles.map((role) => {
              const isSelected = currentRole === role;
              return (
                <button
                  key={role}
                  onClick={() => onRoleChange(role)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white border border-[#27272a]'
                  }`}
                >
                  {USER_ROLES[role].displayName.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Matrix Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Section 1: Navigation Tabs & Analytical Views */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Navigation Tabs & Analytical Dashboards</span>
              </h4>
              <span className="text-[11px] text-[#71717a]">
                10 Specialized Modules
              </span>
            </div>

            <div className="border border-[#27272a] rounded-xl overflow-x-auto bg-[#09090b]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#27272a] bg-[#18181b]/80 text-[#a1a1aa]">
                    <th className="py-2.5 px-4 font-semibold text-white">Application View / Tab</th>
                    {allRoles.map((r) => (
                      <th
                        key={r}
                        className={`py-2.5 px-3 font-semibold text-center whitespace-nowrap ${
                          currentRole === r ? 'text-indigo-400 bg-indigo-950/20' : ''
                        }`}
                      >
                        {USER_ROLES[r].displayName.split(' ')[0]}
                        {currentRole === r && (
                          <span className="block text-[9px] font-mono text-indigo-300">
                            (Active)
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]">
                  {allTabs.map((tabId) => {
                    return (
                      <tr key={tabId} className="hover:bg-[#18181b]/40 transition-colors">
                        <td className="py-2.5 px-4">
                          <span className="font-medium text-white block">
                            {TAB_TITLES[tabId]}
                          </span>
                          <span className="text-[10px] text-[#71717a] font-mono">
                            Tab ID: {tabId}
                          </span>
                        </td>
                        {allRoles.map((r) => {
                          const isAllowed = USER_ROLES[r].allowedTabs.includes(tabId);
                          const isCurrent = currentRole === r;
                          return (
                            <td
                              key={r}
                              className={`py-2.5 px-3 text-center ${
                                isCurrent ? 'bg-indigo-950/10' : ''
                              }`}
                            >
                              {isAllowed ? (
                                <div className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span className="hidden sm:inline text-[11px]">Allowed</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1 text-[#71717a]">
                                  <Lock className="w-3.5 h-3.5 text-amber-500/80" />
                                  <span className="hidden sm:inline text-[11px] text-[#71717a]">Locked</span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Operational Capabilities & Financial Actions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Operational Governance & Financial Actions</span>
              </h4>
              <span className="text-[11px] text-[#71717a]">
                Critical SOX-404 Operations
              </span>
            </div>

            <div className="border border-[#27272a] rounded-xl overflow-x-auto bg-[#09090b]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#27272a] bg-[#18181b]/80 text-[#a1a1aa]">
                    <th className="py-2.5 px-4 font-semibold text-white">Action / Capability</th>
                    {allRoles.map((r) => (
                      <th
                        key={r}
                        className={`py-2.5 px-3 font-semibold text-center whitespace-nowrap ${
                          currentRole === r ? 'text-indigo-400 bg-indigo-950/20' : ''
                        }`}
                      >
                        {USER_ROLES[r].displayName.split(' ')[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]">
                  {operationalCapabilities.map((op) => {
                    return (
                      <tr key={op.id} className="hover:bg-[#18181b]/40 transition-colors">
                        <td className="py-2.5 px-4">
                          <span className="font-medium text-white block">
                            {op.name}
                          </span>
                          <span className="text-[10px] text-[#71717a] leading-tight block">
                            {op.description}
                          </span>
                        </td>
                        {allRoles.map((r) => {
                          const isAllowed = op.check(r);
                          const isCurrent = currentRole === r;
                          return (
                            <td
                              key={r}
                              className={`py-2.5 px-3 text-center ${
                                isCurrent ? 'bg-indigo-950/10' : ''
                              }`}
                            >
                              {isAllowed ? (
                                <div className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span className="hidden sm:inline text-[11px]">Allowed</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1 text-[#71717a]">
                                  <Lock className="w-3.5 h-3.5 text-amber-500/80" />
                                  <span className="hidden sm:inline text-[11px] text-[#71717a]">Locked</span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Institutional Compliance Notice */}
          <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Sarbanes-Oxley (SOX 404) Segregation of Duties Notice</span>
            </div>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Financial data integrity requires that users who prepare financial models (Senior Analysts) cannot authorize disbursements or execute final sign-offs without supervisory review (CFO). Independent assurance (Auditor) maintains read-only access to master data to guarantee unbiased compliance validation.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#27272a] bg-[#18181b] flex items-center justify-between">
          <span className="text-[11px] text-[#71717a] font-mono">
            Permissions active for session • All role changes audited
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
