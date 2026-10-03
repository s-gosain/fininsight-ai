import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  Scale,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  ShieldCheck,
} from 'lucide-react';
import { FinancialDataset, FinancialRatios, CurrencyCode } from '../types';

const METRIC_CALCULATION_LOGIC: Record<string, { formula: string; explanation: string; auditTip: string }> = {
  revenue: {
    formula: 'Gross Revenue = Σ (Delivered Contracts + Product Volume × Unit Price)',
    explanation: 'Recognized top-line commercial turnover per GAAP/IFRS standards.',
    auditTip: 'Reconcile billings against unearned/deferred revenue timing.',
  },
  cogs: {
    formula: 'COGS = Direct Materials + Direct Labor + Hosting/Fulfillment Infrastructure',
    explanation: 'Direct variable expenses absorbed in producing deliverables.',
    auditTip: 'Verify cloud server allocations between COGS and general R&D.',
  },
  grossProfit: {
    formula: 'Gross Profit = Gross Revenue - Cost of Goods Sold (COGS)',
    explanation: 'Core gross surplus retained before deducting corporate overhead and R&D.',
    auditTip: 'Watch for sudden supplier pricing pressure degrading baseline margin.',
  },
  rdExpenses: {
    formula: 'R&D = Engineering Payroll + Prototyping + Cloud Architecture Testing',
    explanation: 'Expenditures dedicated to intellectual property innovation.',
    auditTip: 'Confirm software capitalization thresholds meet strict accounting rules.',
  },
  sgaExpenses: {
    formula: 'SG&A = Sales Quotas/Commissions + Executive Salaries + Legal/Compliance',
    explanation: 'Commercial distribution, marketing, and corporate administrative costs.',
    auditTip: 'Examine sales commission amortization schedules across contracts.',
  },
  operatingIncome: {
    formula: 'Operating Income (EBIT) = Gross Profit - Operating Expenses (R&D + SG&A)',
    explanation: 'The true operational earning power of the company before capital structure effects.',
    auditTip: 'Ensure non-recurring litigation or restructuring costs are isolated.',
  },
  netIncome: {
    formula: 'Net Income = EBIT - Net Interest Expense - Effective Taxes',
    explanation: 'The definitive bottom-line surplus belonging to equity owners.',
    auditTip: 'Scrutinize non-operating gains (e.g. FX gains, asset sales) inflating net profit.',
  },
  cashAndEquivalents: {
    formula: 'Cash & Equivalents = Commercial Bank Balances + T-Bills (<90 Day Maturity)',
    explanation: 'Highest liquidity assets immediately on-hand without price risk.',
    auditTip: 'Confirm bank balances with independent third-party confirmation letters.',
  },
  accountsReceivable: {
    formula: 'A/R = Invoiced Customer Debits - Allowance for Doubtful Accounts',
    explanation: 'Credit extended to buyers pending cash receipt collections.',
    auditTip: 'Audit Days Sales Outstanding (DSO) and aging buckets past 90 days.',
  },
  totalCurrentAssets: {
    formula: 'Current Assets = Cash + Short-Term Investments + A/R + Inventory + Prepaids',
    explanation: 'Liquid resources convertible into cash within one normal operating cycle (12 mo).',
    auditTip: 'Verify inventory obsolescence write-downs are taken promptly.',
  },
  totalAssets: {
    formula: 'Total Assets = Current Assets + Net PP&E + Intangibles + Goodwill',
    explanation: 'Aggregate economic capital base deployed to generate commercial income.',
    auditTip: 'Audit annual impairment reviews on acquired goodwill assets.',
  },
  longTermDebt: {
    formula: 'Long-Term Debt = Senior Secured Notes + Term Facility Balances (>12 mo)',
    explanation: 'Contractual debt capital with specified maturity dates and coupon obligations.',
    auditTip: 'Track debt service coverage and restrictive bond covenants.',
  },
  stockholdersEquity: {
    formula: 'Stockholders Equity = Contributed Capital + Retained Earnings - Treasury Stock',
    explanation: 'Net book value backing shareholder claims after total obligations.',
    auditTip: 'Check share buyback authorizations against treasury share accounts.',
  },
  operatingCashFlow: {
    formula: 'OCF = GAAP Net Income + Non-Cash D&A ± Net Working Capital Inflows/Outflows',
    explanation: 'Hard cash minted directly by operational activities during the period.',
    auditTip: 'Investigate significant negative working capital swings from ballooning receivables.',
  },
  freeCashFlow: {
    formula: 'Free Cash Flow = Operating Cash Flow (OCF) - Capital Expenditures (CapEx)',
    explanation: 'Surplus cash available for strategic deployment, debt paydown, or dividend payouts.',
    auditTip: 'Differentiate maintenance CapEx from discretionary growth expansion CapEx.',
  },
  capitalExpenditures: {
    formula: 'CapEx = Purchases of PP&E + Capitalized Technology Assets',
    explanation: 'Reinvestment in physical and digital productive capacity for long-term growth.',
    auditTip: 'Compare CapEx against annual depreciation to determine asset replenishment rate.',
  },
};

interface MetricOption {
  key: string;
  name: string;
  category: 'Income Statement' | 'Balance Sheet' | 'Cash Flow' | 'Key Margins';
  color: string;
  unit: '$' | '%' | 'x';
  statement: 'incomeStatement' | 'balanceSheet' | 'cashFlowStatement' | 'ratio';
}

interface CrossReferenceTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  dataset: FinancialDataset;
  ratios: FinancialRatios;
  currency: CurrencyCode;
  availableMetrics: MetricOption[];
  formatCurrencyValue: (val: number) => string;
}

export const CrossReferenceTooltip: React.FC<CrossReferenceTooltipProps> = ({
  active,
  payload,
  label,
  dataset,
  ratios,
  currency,
  availableMetrics,
  formatCurrencyValue,
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const period = label || payload[0]?.payload?.period || dataset.activePeriod;

  // Helper to extract line item value for a specific period
  const getLineItemVal = (statement: 'incomeStatement' | 'balanceSheet' | 'cashFlowStatement', key: string, targetPeriod: string): number => {
    const list = dataset[statement] || [];
    const item = list.find((i) => i.key.toLowerCase() === key.toLowerCase());
    return item?.values[targetPeriod] ?? 0;
  };

  // Find previous period for YoY calculation
  const periodIndex = dataset.periods.indexOf(period);
  const prevPeriod = periodIndex > 0 ? dataset.periods[periodIndex - 1] : null;

  // Cross-reference data points for the hovered period
  const rev = getLineItemVal('incomeStatement', 'revenue', period) || 1;
  const gp = getLineItemVal('incomeStatement', 'grossProfit', period);
  const op = getLineItemVal('incomeStatement', 'operatingIncome', period);
  const ni = getLineItemVal('incomeStatement', 'netIncome', period);
  const ocf = getLineItemVal('cashFlowStatement', 'operatingCashFlow', period);
  const fcf = getLineItemVal('cashFlowStatement', 'freeCashFlow', period);
  const capex = getLineItemVal('cashFlowStatement', 'capitalExpenditures', period);
  const cash = getLineItemVal('balanceSheet', 'cashAndEquivalents', period);
  const ar = getLineItemVal('balanceSheet', 'accountsReceivable', period);
  const currentAssets = getLineItemVal('balanceSheet', 'totalCurrentAssets', period);
  const currentLiabilities = getLineItemVal('balanceSheet', 'totalCurrentLiabilities', period);

  // Derived Cross-Reference Metrics
  const grossMargin = Number(((gp / rev) * 100).toFixed(1));
  const operatingMargin = Number(((op / rev) * 100).toFixed(1));
  const netMargin = Number(((ni / rev) * 100).toFixed(1));
  const cashConversionRatio = ni !== 0 ? Number((ocf / ni).toFixed(2)) : 1.0;
  const currentRatio = currentLiabilities > 0 ? Number((currentAssets / currentLiabilities).toFixed(2)) : 1.8;
  const fcfMargin = Number(((fcf / rev) * 100).toFixed(1));

  // Find primary hovered metric calculation logic
  const primaryEntry = payload[0];
  const primaryMetricDef = primaryEntry
    ? availableMetrics.find((m) => m.key === primaryEntry.dataKey || m.name === primaryEntry.name)
    : null;
  const primaryKey = primaryMetricDef?.key || (typeof primaryEntry?.dataKey === 'string' ? primaryEntry.dataKey : '');
  const primaryMetricLogic = METRIC_CALCULATION_LOGIC[primaryKey];

  // Determine intelligent contextual insight based on hovered data
  let contextualInsight = '';
  if (fcf > ni && ni > 0) {
    contextualInsight = `High quality of earnings: Cash flow conversion is ${cashConversionRatio}x GAAP Net Income due to healthy working capital velocity.`;
  } else if (operatingMargin > 20) {
    contextualInsight = `Strong operating leverage: EBIT margin sits at ${operatingMargin}% with disciplined overhead expenditure.`;
  } else if (fcf < 0) {
    contextualInsight = `CapEx investment (${formatCurrencyValue(capex)}) absorbed operating cash flow during this development phase.`;
  } else {
    contextualInsight = `Gross margin of ${grossMargin}% supports steady capital reinvestment across operations.`;
  }

  return (
    <div className="bg-[#18181b]/95 backdrop-blur-md border border-[#3f3f46] rounded-xl shadow-2xl p-4 min-w-[310px] max-w-[360px] text-xs space-y-3 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#27272a]">
        <div>
          <span className="text-[10px] text-[#71717a] font-mono uppercase tracking-wider block">
            {dataset.companyName}
          </span>
          <span className="font-bold text-white text-sm">
            {period}
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-500/20 flex items-center gap-1">
          <Layers className="w-2.5 h-2.5" />
          Cross-Reference
        </span>
      </div>

      {/* Hovered Series Values with YoY Delta */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-[#a1a1aa] uppercase font-semibold tracking-wider block">
          Hovered Metric Data
        </span>
        <div className="space-y-1">
          {payload.map((entry, idx) => {
            const metricDef = availableMetrics.find((m) => m.key === entry.dataKey || m.name === entry.name);
            const numVal = Number(entry.value);
            const isPct = metricDef?.unit === '%' || entry.unit === '%';
            const displayVal = isPct ? `${numVal.toFixed(1)}%` : formatCurrencyValue(numVal);

            // Compute YoY if available
            let yoyChange: number | null = null;
            if (prevPeriod && metricDef) {
              const prevVal = metricDef.statement === 'ratio'
                ? 0
                : getLineItemVal(metricDef.statement, metricDef.key, prevPeriod);
              if (prevVal && prevVal !== 0 && !isPct) {
                yoyChange = Number((((numVal - prevVal) / Math.abs(prevVal)) * 100).toFixed(1));
              }
            }

            // Percentage of revenue for dollar items
            const revShare = !isPct && rev > 0 ? Number(((numVal / rev) * 100).toFixed(1)) : null;

            return (
              <div
                key={idx}
                className="flex items-center justify-between p-1.5 rounded-lg bg-[#09090b]/60 border border-[#27272a] font-mono"
              >
                <div className="flex items-center gap-1.5 truncate mr-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: entry.color || entry.stroke || '#6366f1' }}
                  />
                  <span className="text-white text-xs truncate">
                    {entry.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 text-right">
                  <span className="font-bold text-white text-xs">
                    {displayVal}
                  </span>

                  {yoyChange !== null && (
                    <span
                      className={`text-[10px] px-1 py-0.2 rounded font-semibold flex items-center ${
                        yoyChange >= 0
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : 'text-rose-400 bg-rose-500/10'
                      }`}
                    >
                      {yoyChange >= 0 ? '+' : ''}{yoyChange}% YoY
                    </span>
                  )}

                  {revShare !== null && revShare <= 100 && revShare >= 0 && (
                    <span className="text-[10px] text-[#71717a]">
                      ({revShare}% rev)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calculation Logic & Deeper Context for Hovered Figure */}
      {primaryMetricLogic && (
        <div className="p-2.5 rounded-lg bg-[#09090b] border border-[#27272a] space-y-1.5 font-mono text-[10px]">
          <div className="flex items-center justify-between text-[#a1a1aa] uppercase font-semibold">
            <span className="flex items-center gap-1 text-indigo-300">
              <Calculator className="w-3 h-3 text-indigo-400" />
              Calculation Logic ({primaryEntry?.name || primaryKey})
            </span>
            <span className="text-[#71717a] text-[9px]">Formula</span>
          </div>
          <div className="text-indigo-200 p-1.5 rounded bg-[#18181b] border border-[#27272a] text-[10px] break-words">
            {primaryMetricLogic.formula}
          </div>
          <p className="text-[#a1a1aa] font-sans text-[10px] leading-tight pt-0.5">
            {primaryMetricLogic.explanation}
          </p>
          {primaryMetricLogic.auditTip && (
            <div className="flex items-center gap-1 text-[#71717a] pt-1 border-t border-[#27272a]/60 text-[9px]">
              <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">CFO Tip: {primaryMetricLogic.auditTip}</span>
            </div>
          )}
        </div>
      )}

      {/* Multi-Statement Cross-Reference Telemetry Grid */}
      <div className="pt-2 border-t border-[#27272a] space-y-2">
        <span className="text-[10px] text-[#a1a1aa] uppercase font-semibold tracking-wider flex items-center justify-between">
          <span>Statement Cross-References</span>
          <span className="text-[#71717a] font-mono text-[9px]">IS ↔ BS ↔ CF</span>
        </span>

        <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
          <div className="p-1.5 rounded-lg bg-[#09090b] border border-[#27272a]">
            <span className="text-[9px] text-[#71717a] block">Gross Margin</span>
            <span className="text-[11px] font-bold text-emerald-400">{grossMargin}%</span>
          </div>
          <div className="p-1.5 rounded-lg bg-[#09090b] border border-[#27272a]">
            <span className="text-[9px] text-[#71717a] block">Operating EBIT</span>
            <span className="text-[11px] font-bold text-indigo-400">{operatingMargin}%</span>
          </div>
          <div className="p-1.5 rounded-lg bg-[#09090b] border border-[#27272a]">
            <span className="text-[9px] text-[#71717a] block">Net Margin</span>
            <span className="text-[11px] font-bold text-sky-400">{netMargin}%</span>
          </div>

          <div className="p-1.5 rounded-lg bg-[#09090b] border border-[#27272a]">
            <span className="text-[9px] text-[#71717a] block">Free Cash Flow</span>
            <span className="text-[11px] font-bold text-white">{formatCurrencyValue(fcf)}</span>
          </div>
          <div className="p-1.5 rounded-lg bg-[#09090b] border border-[#27272a]">
            <span className="text-[9px] text-[#71717a] block">Cash Conversion</span>
            <span className="text-[11px] font-bold text-emerald-400">{cashConversionRatio}x NI</span>
          </div>
          <div className="p-1.5 rounded-lg bg-[#09090b] border border-[#27272a]">
            <span className="text-[9px] text-[#71717a] block">Current Ratio</span>
            <span className="text-[11px] font-bold text-white">{currentRatio}x</span>
          </div>
        </div>
      </div>

      {/* Contextual Cross-Reference Insight */}
      <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-[10px] text-[#e4e4e7] leading-relaxed flex items-start gap-1.5">
        <Sparkles className="w-3 h-3 text-indigo-400 flex-shrink-0 mt-0.5" />
        <span>{contextualInsight}</span>
      </div>

    </div>
  );
};
