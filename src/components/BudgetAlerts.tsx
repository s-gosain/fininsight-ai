import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Sparkles, 
  ShieldAlert,
  ArrowRight,
  Filter,
  Check,
  Lock,
  Shield
} from 'lucide-react';
import { BudgetDepartmentItem, CurrencyCode, UserRole } from '../types';
import { formatCurrency, formatPercent } from '../data/currenciesAndFiscal';
import { USER_ROLES } from '../utils/encryption';

interface BudgetAlertsProps {
  budgetItems: BudgetDepartmentItem[];
  currency: CurrencyCode;
  isDataMasked: boolean;
  onDisputeVariance: (item: BudgetDepartmentItem) => void;
  onApproveVariance: (item: BudgetDepartmentItem) => void;
  userRole?: UserRole;
  onOpenRoleMatrix?: () => void;
}

export const BudgetAlerts: React.FC<BudgetAlertsProps> = ({
  budgetItems,
  currency,
  isDataMasked,
  onDisputeVariance,
  onApproveVariance,
  userRole = 'ADMIN_CFO',
  onOpenRoleMatrix,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'All' | 'Critical' | 'Warning' | 'Normal'>('All');

  const roleConfig = USER_ROLES[userRole];
  const canDispute = roleConfig?.canDisputeBudget ?? true;
  const canApprove = roleConfig?.canApproveBudget ?? true;

  const filteredItems = budgetItems.filter((item) => 
    filterSeverity === 'All' ? true : item.severity === filterSeverity
  );

  const totalBudgeted = budgetItems.reduce((acc, curr) => acc + curr.budgeted, 0);
  const totalActual = budgetItems.reduce((acc, curr) => acc + curr.actual, 0);
  const netVariance = totalActual - totalBudgeted;
  const netVariancePct = totalBudgeted > 0 ? (netVariance / totalBudgeted) * 100 : 0;

  const criticalCount = budgetItems.filter((i) => i.severity === 'Critical').length;
  const warningCount = budgetItems.filter((i) => i.severity === 'Warning').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Budget Health & AI Anomaly Detection */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Automated Budget Discrepancy & Variance Alerts</h3>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1 max-w-2xl">
            Real-time variance monitor comparing original fiscal forecasts against live general ledger disbursements. Flags unauthorized overspends automatically.
          </p>
        </div>

        {/* Aggregate Stats */}
        <div className="flex items-center gap-3">
          <div className="bg-[#09090b] p-3 rounded-lg border border-[#27272a] text-right">
            <span className="text-[10px] text-[#71717a] block font-mono uppercase">Total Discrepancy (Net)</span>
            <div className={`text-sm font-semibold font-mono ${netVariance > 0 ? 'text-red-400' : 'text-[#10b981]'}`}>
              {isDataMasked ? '••••••••' : `${netVariance > 0 ? '+' : ''}${formatCurrency(netVariance, currency, true)} (${formatPercent(netVariancePct, true)})`}
            </div>
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-medium font-mono text-[11px]">
              {criticalCount} Critical Overages
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-medium font-mono text-[11px]">
              {warningCount} Warnings
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-[#18181b] p-2 rounded-xl border border-[#27272a]">
        <span className="text-xs text-[#71717a] font-medium ml-2">Filter Severity:</span>
        {(['All', 'Critical', 'Warning', 'Normal'] as const).map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all font-mono ${
              filterSeverity === sev
                ? sev === 'Critical' 
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                  : sev === 'Warning' 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                    : 'bg-[#27272a] text-white border border-[#3f3f46]'
                : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]/50'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Department Variance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const isOver = item.variance > 0;
          const pct = Math.min(150, Math.max(0, (item.actual / (item.budgeted || 1)) * 100));

          return (
            <div
              key={item.id}
              className={`bg-[#18181b] border rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all ${
                item.severity === 'Critical'
                  ? 'border-red-500/40'
                  : item.severity === 'Warning'
                    ? 'border-amber-500/40'
                    : 'border-[#27272a]'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${
                      item.severity === 'Critical' 
                        ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                        : item.severity === 'Warning' 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                          : 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30'
                    }`}>
                      {item.severity.toUpperCase()}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#09090b] text-[#a1a1aa] border border-[#27272a]">
                      {item.category}
                    </span>
                  </div>

                  {item.flaggedByAI && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center gap-1 font-mono">
                      <Sparkles className="w-2.5 h-2.5" /> AI Flagged
                    </span>
                  )}
                </div>

                {/* Department Name */}
                <h4 className="text-sm font-semibold text-white mb-2">{item.department}</h4>

                {/* Numbers Grid */}
                <div className="grid grid-cols-3 gap-2 bg-[#09090b] p-3 rounded-lg border border-[#27272a] text-xs mb-3 font-mono">
                  <div>
                    <span className="text-[10px] text-[#71717a] block font-sans">Budgeted</span>
                    <span className="text-[#a1a1aa] font-medium">
                      {isDataMasked ? '••••••••' : formatCurrency(item.budgeted, currency, true)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#71717a] block font-sans">Actual Spend</span>
                    <span className="text-[#fafafa] font-semibold">
                      {isDataMasked ? '••••••••' : formatCurrency(item.actual, currency, true)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#71717a] block font-sans">Variance (%)</span>
                    <span className={`font-semibold ${isOver ? 'text-red-400' : 'text-[#10b981]'}`}>
                      {formatPercent(item.variancePct, true)}
                    </span>
                  </div>
                </div>

                {/* Variance Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-[11px] text-[#71717a] mb-1">
                    <span>Budget Consumption</span>
                    <span className="font-mono text-white">{pct.toFixed(0)}% of Allocation</span>
                  </div>
                  <div className="w-full bg-[#09090b] h-1.5 rounded-full overflow-hidden border border-[#27272a]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct > 100 ? 'bg-red-500' : pct > 85 ? 'bg-amber-400' : 'bg-[#10b981]'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="p-2.5 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-[#a1a1aa] leading-relaxed mb-4">
                  <span className="font-medium text-white">Root Cause: </span>
                  {item.explanation}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#27272a] text-xs">
                {canDispute ? (
                  <button
                    onClick={() => onDisputeVariance(item)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-medium transition-colors cursor-pointer"
                  >
                    Hold for Audit Review
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenRoleMatrix?.()}
                    className="px-3 py-1.5 rounded-lg bg-[#18181b] text-[#71717a] border border-[#27272a] font-medium flex items-center gap-1 cursor-pointer hover:border-amber-500/30"
                    title={`Variance dispute is locked for ${roleConfig.displayName}. Click to view RBAC rules.`}
                  >
                    <Lock className="w-3 h-3 text-amber-500/70" />
                    <span>Audit Hold (Locked)</span>
                  </button>
                )}

                {canApprove ? (
                  <button
                    onClick={() => onApproveVariance(item)}
                    className="px-3 py-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] border border-[#3f3f46] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>Acknowledge</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenRoleMatrix?.()}
                    className="px-3 py-1.5 rounded-lg bg-[#18181b] text-[#71717a] border border-[#27272a] font-medium flex items-center gap-1 cursor-pointer hover:border-amber-500/30"
                    title={`Variance sign-off is locked for ${roleConfig.displayName}. Click to view RBAC rules.`}
                  >
                    <Lock className="w-3 h-3 text-amber-500/70" />
                    <span>Acknowledge (Locked)</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
