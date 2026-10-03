import React, { useRef, useState, useLayoutEffect, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calculator, 
  Layers, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck, 
  AlertTriangle, 
  Scale,
  Target,
  Info
} from 'lucide-react';
import { FinancialDataset, FinancialRatios, CurrencyCode } from '../types';
import { formatCurrency, formatPercent } from '../data/currenciesAndFiscal';

export type ChartVariant = 'revenue_profit' | 'margins' | 'balance_sheet' | 'cash_flow' | 'pie_breakdown';

interface DashboardChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  chartVariant: ChartVariant;
  dataset: FinancialDataset;
  ratios: FinancialRatios;
  currency: CurrencyCode;
  pieTotal?: number;
  pieCategory?: string;
}

export const DashboardChartTooltip: React.FC<DashboardChartTooltipProps> = ({
  active,
  payload,
  label,
  chartVariant,
  dataset,
  ratios,
  currency,
  pieTotal,
  pieCategory,
}) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; placement: 'top' | 'bottom' } | null>(null);

  const updatePosition = useCallback(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const tooltipWidth = Math.min(365, window.innerWidth - 24);
    const tooltipHeight = tooltipRef.current?.offsetHeight || 310;
    const margin = 12;

    // Horizontal positioning: align with data anchor, keep inside viewport
    let left = rect.left + 12;
    if (left + tooltipWidth > window.innerWidth - margin) {
      left = rect.left - tooltipWidth - 12;
    }
    if (left < margin) {
      left = margin;
    }

    // Vertical positioning: evaluate space above vs below to prevent clipping
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    let top = rect.top;
    let placement: 'top' | 'bottom' = 'bottom';

    // If not enough room below, flip upwards to keep fully visible (like Image 1)
    if (spaceBelow < tooltipHeight + 16 && spaceAbove > tooltipHeight) {
      top = Math.max(margin, rect.top - tooltipHeight - 8);
      placement = 'top';
    } else {
      top = Math.max(margin, Math.min(rect.top + 4, window.innerHeight - tooltipHeight - margin));
      placement = 'bottom';
    }

    setCoords({ top, left, placement });
  }, []);

  useLayoutEffect(() => {
    if (active && payload && payload.length > 0) {
      updatePosition();
    }
  }, [active, payload, label, updatePosition]);

  useEffect(() => {
    if (!active) return;
    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition, { passive: true });
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [active, updatePosition]);

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const period = label || payload[0]?.payload?.period || dataset.activePeriod;

  // Helper to extract line item values from dataset for a given period
  const getVal = (statement: 'incomeStatement' | 'balanceSheet' | 'cashFlowStatement', key: string, targetPeriod: string): number => {
    const list = dataset[statement] || [];
    const item = list.find((i) => i.key.toLowerCase() === key.toLowerCase());
    return item?.values[targetPeriod] ?? 0;
  };

  const periodIdx = dataset.periods.indexOf(period);
  const prevPeriod = periodIdx > 0 ? dataset.periods[periodIdx - 1] : null;

  // Key line items for current period
  const rev = getVal('incomeStatement', 'revenue', period);
  const prevRev = prevPeriod ? getVal('incomeStatement', 'revenue', prevPeriod) : 0;
  const cogs = getVal('incomeStatement', 'cogs', period);
  const gp = getVal('incomeStatement', 'grossProfit', period) || (rev - cogs);
  const op = getVal('incomeStatement', 'operatingIncome', period);
  const ni = getVal('incomeStatement', 'netIncome', period);
  const ocf = getVal('cashFlowStatement', 'operatingCashFlow', period);
  const capex = getVal('cashFlowStatement', 'capitalExpenditures', period);
  const absCapex = Math.abs(capex);
  const fcf = getVal('cashFlowStatement', 'freeCashFlow', period) || (ocf - absCapex);

  const assets = getVal('balanceSheet', 'totalAssets', period);
  const debt = getVal('balanceSheet', 'longTermDebt', period);
  const equity = getVal('balanceSheet', 'stockholdersEquity', period);
  const cash = getVal('balanceSheet', 'cashAndEquivalents', period);

  // Computed ratios for period
  const grossMarginPct = rev > 0 ? Number(((gp / rev) * 100).toFixed(1)) : 0;
  const opMarginPct = rev > 0 ? Number(((op / rev) * 100).toFixed(1)) : 0;
  const netMarginPct = rev > 0 ? Number(((ni / rev) * 100).toFixed(1)) : 0;
  const fcfConversionPct = ni > 0 ? Number(((fcf / ni) * 100).toFixed(1)) : 0;
  const debtToEquity = equity > 0 ? Number((debt / equity).toFixed(2)) : 0;
  const equityBufferPct = assets > 0 ? Number(((equity / assets) * 100).toFixed(1)) : 0;
  const revYoY = prevRev > 0 ? Number((((rev - prevRev) / prevRev) * 100).toFixed(1)) : null;

  // Header metadata per variant
  const getHeaderMeta = () => {
    switch (chartVariant) {
      case 'cash_flow':
        return {
          title: 'Free Cash Flow (FCF)',
          category: 'Liquidity Tier',
          pillValue: formatCurrency(fcf, currency, true),
          pillColor: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30',
        };
      case 'revenue_profit':
        return {
          title: 'Revenue & GAAP Earnings',
          category: 'P&L Trajectory',
          pillValue: formatCurrency(rev, currency, true),
          pillColor: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30',
        };
      case 'margins':
        return {
          title: 'Margin Efficiency Trends',
          category: 'Operating Leverage',
          pillValue: `${grossMarginPct}% GM`,
          pillColor: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
        };
      case 'balance_sheet':
        return {
          title: 'Balance Sheet Structure',
          category: 'Solvency Tier',
          pillValue: `${debtToEquity}x D/E`,
          pillColor: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
        };
      case 'pie_breakdown':
        return {
          title: pieCategory || 'Capital Composition',
          category: 'Resource Allocation',
          pillValue: `${((Number(payload[0]?.value || 0) / (pieTotal || 1)) * 100).toFixed(1)}%`,
          pillColor: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30',
        };
      default:
        return {
          title: 'Financial Analysis',
          category: 'Telemetry',
          pillValue: period,
          pillColor: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30',
        };
    }
  };

  const headerMeta = getHeaderMeta();

  // Render variant-specific calculation logic, benchmark targets, and CFO tips matching Image 1
  const renderCalculationLogic = () => {
    switch (chartVariant) {
      case 'cash_flow': {
        const capexIntensity = rev > 0 ? Number(((absCapex / rev) * 100).toFixed(1)) : 0;

        return (
          <div className="space-y-2">
            {/* Calculation Logic Box styled like Image 1 */}
            <div className="p-2.5 rounded-lg bg-[#09090b] border border-[#27272a] space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between text-[#a1a1aa] text-[10px] uppercase font-semibold">
                <span className="flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-indigo-400" />
                  Calculation Logic
                </span>
                <span className="text-[#71717a]">Formula</span>
              </div>
              
              <div className="text-indigo-200 font-medium text-[11px] leading-tight bg-[#18181b]/90 p-2 rounded border border-[#27272a]">
                Free Cash Flow = Cash Flow from Operating Activities (OCF) - Capital Expenditures (CapEx)
              </div>

              <div className="space-y-1 text-[#e4e4e7] text-[10px] pt-1 border-t border-[#27272a]">
                <div className="flex items-center justify-between">
                  <span className="text-[#a1a1aa]">Active Period Input:</span>
                  <span className="text-white font-mono">
                    {formatCurrency(ocf, currency, true)} - {formatCurrency(absCapex, currency, true)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a1a1aa]">Result:</span>
                  <strong className="text-cyan-400 font-bold font-mono">{formatCurrency(fcf, currency, true)}</strong>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#27272a]/60">
                  <span className="text-[#a1a1aa]">FCF Conversion Rate:</span>
                  <span className="text-white font-mono">
                    ({formatCurrency(fcf, currency, true)} ÷ {formatCurrency(ni, currency, true)}) × 100 = <strong className="text-emerald-400">{fcfConversionPct}%</strong>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a1a1aa]">CapEx Intensity:</span>
                  <span className="text-white font-mono">
                    ({formatCurrency(absCapex, currency, true)} ÷ {formatCurrency(rev, currency, true)}) × 100 = <strong className="text-indigo-300">{capexIntensity}% of Rev</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Description & Sector Benchmark (like Image 1) */}
            <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-[#d4d4d8] leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-[10px]">
                <Target className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                Benchmark: Target FCF Margin: &gt;20% – 28% of total revenue
              </div>
              <p className="text-[10px] text-[#a1a1aa] leading-normal">
                Software has minimal physical CapEx; high FCF enables opportunistic M&amp;A, share repurchases, and builds a defensive cash treasury.
              </p>
            </div>

            {/* CFO Audit Tip (like Image 1) */}
            <div className="flex items-start gap-1.5 text-[10px] text-[#a1a1aa] leading-snug px-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-emerald-400 font-semibold">CFO Tip:</strong> Scrutinize whether vendor financing or leased assets are classified as financing cash flows to cosmetically protect Operating Cash Flow.
              </span>
            </div>
          </div>
        );
      }

      case 'revenue_profit': {
        return (
          <div className="space-y-2">
            <div className="p-2.5 rounded-lg bg-[#09090b] border border-[#27272a] space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between text-[#a1a1aa] text-[10px] uppercase font-semibold">
                <span className="flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-indigo-400" />
                  Calculation Logic
                </span>
                <span className="text-[#71717a]">GAAP Standard</span>
              </div>
              
              <div className="text-indigo-200 font-medium text-[11px] leading-tight bg-[#18181b]/90 p-2 rounded border border-[#27272a]">
                Gross Profit = Total Revenue - Cost of Goods Sold (COGS)
              </div>

              <div className="text-[#e4e4e7] space-y-1 pt-1 border-t border-[#27272a] text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#a1a1aa]">Gross Profit:</span>
                  <span className="text-white font-mono">
                    {formatCurrency(rev, currency, true)} - {formatCurrency(cogs, currency, true)} = <strong className="text-cyan-400">{formatCurrency(gp, currency, true)}</strong>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a1a1aa]">Gross Margin:</span>
                  <span className="text-white font-mono">
                    ({formatCurrency(gp, currency, true)} ÷ {formatCurrency(rev, currency, true)}) × 100 = <strong className="text-emerald-400">{grossMarginPct}%</strong>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a1a1aa]">Net Profit Margin:</span>
                  <span className="text-white font-mono">
                    ({formatCurrency(ni, currency, true)} ÷ {formatCurrency(rev, currency, true)}) × 100 = <strong className="text-indigo-300">{netMarginPct}%</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-[#d4d4d8] leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-[10px]">
                <Target className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                Benchmark: Enterprise Gross Margin Target: &gt;70% – 80%
              </div>
              <p className="text-[10px] text-[#a1a1aa] leading-normal">
                For every $1.00 of revenue in {period}, the company retains {grossMarginPct}¢ after direct production costs and converts {netMarginPct}¢ into net GAAP income.
              </p>
            </div>

            <div className="flex items-start gap-1.5 text-[10px] text-[#a1a1aa] leading-snug px-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-emerald-400 font-semibold">CFO Tip:</strong> Reconcile deferred revenue recognition schedules and ensure non-recurring professional services are isolated from recurring ARR.
              </span>
            </div>
          </div>
        );
      }

      case 'margins': {
        const opexDrag = Number((grossMarginPct - opMarginPct).toFixed(1));
        const taxInterestDrag = Number((opMarginPct - netMarginPct).toFixed(1));

        return (
          <div className="space-y-2">
            <div className="p-2.5 rounded-lg bg-[#09090b] border border-[#27272a] space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between text-[#a1a1aa] text-[10px] uppercase font-semibold">
                <span className="flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                  Margin Waterfall Logic
                </span>
                <span className="text-[#71717a]">Efficiency</span>
              </div>

              <div className="text-cyan-200 font-medium text-[11px] leading-tight bg-[#18181b]/90 p-2 rounded border border-[#27272a]">
                Operating Margin (EBIT) = Gross Margin % - Operating Expense % (R&amp;D + SG&amp;A)
              </div>

              <div className="text-[#e4e4e7] space-y-1 pt-1 border-t border-[#27272a] text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#a1a1aa]">OpEx Drag:</span>
                  <span className="text-amber-300 font-semibold font-mono">
                    {grossMarginPct}% - {opMarginPct}% = -{opexDrag}% (R&amp;D + SG&amp;A)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a1a1aa]">Tax &amp; Interest Drag:</span>
                  <span className="text-indigo-300 font-semibold font-mono">
                    {opMarginPct}% - {netMarginPct}% = -{taxInterestDrag}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a1a1aa]">Net Profit Conversion:</span>
                  <span className="text-emerald-400 font-semibold font-mono">
                    {netMarginPct}% retained from {grossMarginPct}% GM
                  </span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-[#d4d4d8] leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-300 font-semibold text-[10px]">
                <Scale className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                Benchmark: Operating EBIT Margin Target: 18% – 25%
              </div>
              <p className="text-[10px] text-[#a1a1aa] leading-normal">
                {opMarginPct >= 20 ? (
                  <span>Optimal operating leverage: {opMarginPct}% EBIT margin outpaces standard enterprise baselines (15-18%).</span>
                ) : opMarginPct >= 10 ? (
                  <span>Moderate efficiency: Overhead consumes {opexDrag}% of top-line revenue, leaving a balanced EBIT buffer.</span>
                ) : (
                  <span>Compressed margins: Operating overhead absorbs {opexDrag}% of gross profits; monitoring fixed overhead is critical.</span>
                )}
              </p>
            </div>

            <div className="flex items-start gap-1.5 text-[10px] text-[#a1a1aa] leading-snug px-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-emerald-400 font-semibold">CFO Tip:</strong> Evaluate whether stock-based compensation (SBC) is masking core operating expense expansion across engineering payroll.
              </span>
            </div>
          </div>
        );
      }

      case 'balance_sheet': {
        const debtBurden = debt > 0 && cash > 0 ? (debt / cash).toFixed(2) : 'N/A';

        return (
          <div className="space-y-2">
            <div className="p-2.5 rounded-lg bg-[#09090b] border border-[#27272a] space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between text-[#a1a1aa] text-[10px] uppercase font-semibold">
                <span className="flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-indigo-400" />
                  Solvency Formula Logic
                </span>
                <span className="text-[#71717a]">Solvency</span>
              </div>

              <div className="text-indigo-200 font-medium text-[11px] leading-tight bg-[#18181b]/90 p-2 rounded border border-[#27272a]">
                Debt-to-Equity = Total Long-Term Debt ÷ Stockholders&apos; Equity
              </div>

              <div className="text-[#e4e4e7] space-y-1 pt-1 border-t border-[#27272a] text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#a1a1aa]">Debt-to-Equity:</span>
                  <span className="text-white font-mono">
                    {formatCurrency(debt, currency, true)} ÷ {formatCurrency(equity, currency, true)} = <strong className="text-amber-400">{debtToEquity}x</strong>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a1a1aa]">Equity-to-Assets:</span>
                  <span className="text-white font-mono">
                    ({formatCurrency(equity, currency, true)} ÷ {formatCurrency(assets, currency, true)}) × 100 = <strong className="text-emerald-400">{equityBufferPct}%</strong>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a1a1aa]">Debt-to-Cash Cover:</span>
                  <span className="text-white font-mono">
                    {formatCurrency(debt, currency, true)} ÷ {formatCurrency(cash, currency, true)} = <strong className="text-indigo-300">{debtBurden}x</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-[#d4d4d8] leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-300 font-semibold text-[10px]">
                <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Benchmark: Safe Covenant Leverage: &lt;1.5x D/E (Current: {debtToEquity}x)
              </div>
              <p className="text-[10px] text-[#a1a1aa] leading-normal">
                Shareholder equity finances {equityBufferPct}% of total assets, providing a resilient capital cushion against macroeconomic downturns.
              </p>
            </div>

            <div className="flex items-start gap-1.5 text-[10px] text-[#a1a1aa] leading-snug px-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-emerald-400 font-semibold">CFO Tip:</strong> Review off-balance-sheet contractual obligations, operating leases, and balloon debt maturities over the next 24 months.
              </span>
            </div>
          </div>
        );
      }

      case 'pie_breakdown': {
        const item = payload[0];
        const val = Number(item?.value || 0);
        const total = pieTotal || 1;
        const pct = ((val / total) * 100).toFixed(1);

        return (
          <div className="space-y-2">
            <div className="p-2.5 rounded-lg bg-[#09090b] border border-[#27272a] space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between text-[#a1a1aa] text-[10px] uppercase font-semibold">
                <span className="flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-indigo-400" />
                  Composition Math
                </span>
                <span className="text-[#71717a]">{pieCategory || 'Slice Share'}</span>
              </div>
              
              <div className="text-white pt-1 border-t border-[#27272a] flex items-center justify-between text-[10px]">
                <span className="text-[#a1a1aa]">Formula:</span>
                <span className="font-mono">
                  ({formatCurrency(val, currency, true)} ÷ {formatCurrency(total, currency, true)}) × 100 = <strong className="text-emerald-400">{pct}%</strong>
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-[#d4d4d8] leading-relaxed">
              <strong className="text-white block font-semibold text-[10px]">Strategic Significance:</strong>
              Represents {pct}% of aggregate {pieCategory?.toLowerCase() || 'category resources'}, directly informing capital allocation prioritization.
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  if (typeof document === 'undefined') return null;

  return (
    <>
      {/* Ghost anchor positioned by Recharts */}
      <div ref={anchorRef} className="w-0 h-0 pointer-events-none opacity-0" />

      {/* Render tooltip in React Portal to completely prevent container overflow clipping and legend overlaps */}
      {createPortal(
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: coords ? `${coords.top}px` : '-9999px',
            left: coords ? `${coords.left}px` : '-9999px',
            opacity: coords ? 1 : 0,
            zIndex: 99999,
            pointerEvents: 'none',
            maxWidth: '365px',
            width: 'calc(100vw - 24px)',
          }}
          className="bg-[#18181b]/98 backdrop-blur-md border border-[#3f3f46] rounded-xl shadow-2xl p-3.5 text-xs text-white space-y-2.5 pointer-events-none animate-in fade-in zoom-in-95 duration-100"
          role="tooltip"
          aria-live="polite"
        >
          {/* Header matching Image 1 */}
          <div className="flex items-center justify-between pb-2 border-b border-[#27272a]">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0 animate-pulse" />
              <div className="truncate">
                <span className="font-bold text-white text-xs truncate block">
                  {headerMeta.title}
                </span>
                <span className="text-[10px] text-[#71717a] font-mono block truncate">
                  {dataset.companyName} • {period}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${headerMeta.pillColor}`}>
                {headerMeta.pillValue}
              </span>
              <span className="p-1 rounded text-[#71717a]" title="GAAP Telemetry Information">
                <Info className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Plotted Figures Display */}
          <div className="space-y-1">
            <span className="text-[10px] text-[#a1a1aa] uppercase font-semibold tracking-wider block">
              Plotted Figures ({period})
            </span>
            <div className="grid grid-cols-1 gap-1">
              {payload.map((entry, idx) => {
                const numVal = Number(entry.value);
                const isPct = chartVariant === 'margins' || entry.name?.toString().includes('%');
                const displayVal = isPct ? `${numVal.toFixed(1)}%` : formatCurrency(numVal, currency, true);

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-[#09090b]/80 border border-[#27272a] font-mono"
                  >
                    <div className="flex items-center gap-1.5 truncate mr-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: entry.color || entry.fill || entry.stroke || '#6366f1' }}
                      />
                      <span className="text-white text-xs truncate">
                        {entry.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="font-bold text-white text-xs">
                        {displayVal}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Calculation Logic, Benchmark Target & CFO Tip (from Image 1) */}
          {renderCalculationLogic()}

          {/* Compact Footer */}
          <div className="text-[9px] text-[#71717a] text-center font-mono pt-1.5 border-t border-[#27272a]/60 flex items-center justify-center gap-1">
            <span>Hover active</span>
            <span>•</span>
            <span className="text-indigo-400">Interactive GAAP Telemetry</span>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
