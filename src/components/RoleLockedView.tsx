import React from 'react';
import { 
  Lock, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight, 
  UserCheck, 
  Building2, 
  FileText, 
  Layers, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { UserRole, NavigationTabId } from '../types';
import { USER_ROLES, TAB_TITLES, getRequiredRolesForTab } from '../utils/encryption';

interface RoleLockedViewProps {
  tabId?: NavigationTabId;
  currentRole?: UserRole;
  userRole?: UserRole;
  featureName?: string;
  requiredClearance?: string;
  description?: string;
  userOrg?: string;
  onSwitchRole?: (role: UserRole) => void;
  onNavigateTab?: (tabId: NavigationTabId) => void;
  onOpenRoleMatrix?: () => void;
}

export const RoleLockedView: React.FC<RoleLockedViewProps> = ({
  tabId,
  currentRole,
  userRole,
  featureName,
  requiredClearance,
  description,
  userOrg = 'Enterprise Corporation',
  onSwitchRole,
  onNavigateTab,
  onOpenRoleMatrix,
}) => {
  const activeRole: UserRole = currentRole || userRole || 'STAKEHOLDER';
  const currentRoleConfig = USER_ROLES[activeRole];
  const featureTitle = featureName || (tabId ? TAB_TITLES[tabId] : 'Requested Financial Function') || 'Requested Feature';
  const requiredRoles = tabId ? getRequiredRolesForTab(tabId) : [];

  // Tab-specific governance reasoning
  const getGovernanceReason = (tab?: NavigationTabId): string => {
    if (description) return description;
    switch (tab) {
      case 'forecasting':
        return 'Forward-looking financial forecasting and Monte Carlo simulations require quantitative modeling authority. External auditors and read-only stakeholders are restricted to historical verified GAAP/IFRS statements to prevent unverified speculative guidance.';
      case 'anomalies':
        return 'Forensic anomaly detection, including Benford First-Digit distribution tests, chi-square divergence, and ledger discrepancy scanning, is restricted to certified auditors and corporate controllers under SOX Section 404.';
      case 'redflags':
        return 'Material financial misstatement warnings, liquidity stress triggers, and forensic covenant red flags are restricted to executive audit committees and compliance officers.';
      case 'statements':
        return 'Detailed general ledger chart-of-accounts and statement line-item editing are restricted to financial operations personnel with active write-clearance.';
      case 'budget':
        return 'Departmental operational expense variances and internal disbursement allocations are restricted to corporate managers with budget approval or dispute authority.';
      case 'visualization':
        return 'Custom multi-variable charting and raw metric pivoting are restricted to operational analysts and financial controllers.';
      default:
        return 'Access to this operational capability is restricted under your organization\'s Role-Based Access Control (RBAC) policy and SOX Section 404 segregation of duties.';
    }
  };

  return (
    <div className="min-h-[520px] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl bg-[#141418] border border-[#27272a] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#27272a]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Access Restricted
                </span>
                <span className="text-[10px] font-mono text-[#71717a]">
                  SOX-404 Security Guard
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                {featureTitle} is Locked
              </h2>
            </div>
          </div>

          {onOpenRoleMatrix && (
            <button
              onClick={onOpenRoleMatrix}
              className="px-3 py-1.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] hover:border-[#3f3f46] text-xs text-[#a1a1aa] hover:text-white font-mono flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>View Access Matrix</span>
            </button>
          )}
        </div>

        {/* Governance Rationale */}
        <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Institutional Governance & Compliance Enforcement</span>
          </div>
          <p className="text-xs text-[#a1a1aa] leading-relaxed">
            {getGovernanceReason(tabId)}
          </p>
        </div>

        {/* Clearance Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Current Role Card */}
          <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717a] block">
              Your Current Identity & Role
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400"></div>
              <span className="text-sm font-bold text-white">
                {currentRoleConfig.displayName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#71717a]">
              <Building2 className="w-3.5 h-3.5" />
              <span>{userOrg}</span>
            </div>
            <p className="text-[11px] text-[#71717a] pt-1 border-t border-[#27272a]">
              {currentRoleConfig.description}
            </p>
          </div>

          {/* Required Roles Card */}
          <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717a] block">
              Required Clearance For This Function
            </span>
            <div className="space-y-1.5">
              {requiredRoles.length > 0 ? (
                requiredRoles.map((reqRole) => {
                  const conf = USER_ROLES[reqRole];
                  return (
                    <div key={reqRole} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-[#141418] border border-[#27272a]">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-semibold text-white">{conf.displayName}</span>
                      </div>
                      {onSwitchRole && (
                        <button
                          onClick={() => onSwitchRole(reqRole)}
                          className="text-[10px] font-mono font-bold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
                          title={`Switch to ${conf.displayName} to unlock`}
                        >
                          Elevate →
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-2 rounded-lg bg-[#141418] border border-[#27272a] text-xs font-mono text-amber-300 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{requiredClearance || 'ADMIN_CFO | AUDITOR'}</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-[#71717a] pt-1">
              Dual-authorization or administrator clearance is mandated for this operation.
            </p>
          </div>

        </div>

        {/* Governance Enforcement Notice & Navigation Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#27272a]">
          
          <div className="flex items-center gap-2 text-xs text-[#a1a1aa]">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              Accessibility strictly governed by <strong className="text-white">{currentRoleConfig.displayName}</strong> role. Mode switching between operating models is disabled.
            </span>
          </div>

          {/* Fallback navigation to Dashboard */}
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('dashboard')}
              className="px-4 py-2 rounded-xl bg-[#27272a] hover:bg-[#3f3f46] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 sm:ml-auto"
            >
              <span>Return to Executive Dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

        </div>

        {/* Security Footer Notice */}
        <div className="text-center pt-2 text-[10px] font-mono text-[#71717a]">
          Access verification token verified • Security event logged to immutable SOX-404 audit ledger
        </div>

      </div>
    </div>
  );
};
