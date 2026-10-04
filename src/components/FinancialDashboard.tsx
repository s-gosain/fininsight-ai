import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShieldAlert, 
  Activity, 
  Layers, 
  CheckCircle, 
  AlertTriangle,
  Award,
  Sparkles,
  PieChart as PieIcon,
  BarChart2,
  Percent,
  Wallet,
  Boxes,
  Maximize2,
  ArrowUpRight,
  ArrowDownRight,
  Flag,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  FinancialDataset, 
  FinancialRatios, 
  FinancialHealthGrade, 
  CurrencyCode, 
  DeepAIAnalysisResponse 
} from '../types';
import { formatCurrency, formatPercent } from '../data/currenciesAndFiscal';
import { maskSensitiveValue } from '../utils/encryption';
import { ThreeDCard } from './ThreeDCard';
import { MetricInfoPopover } from './MetricInfoPopover';
import { DashboardChartTooltip } from './DashboardChartTooltip';
import { MetricHoverTooltip } from './MetricHoverTooltip';
import { ThreeDMiniWidget } from './ThreeDMiniWidget';
import { DocumentSummaryWidget } from './DocumentSummaryWidget';
import { SortableKpiGrid } from './SortableKpiGrid';
import { DocumentSummaryData } from '../types';
import { dashboardGridContainerVariants, dashboardGridItemVariants, dashboardCardHoverProps } from '../utils/animations';

interface FinancialDashboardProps {
  dataset: FinancialDataset;
  ratios: FinancialRatios;
  health: FinancialHealthGrade;
  currency: CurrencyCode;
  isDataMasked: boolean;
  aiAnalysis: DeepAIAnalysisResponse | null;
  onNavigateToTab: (tab: string) => void;
  documentSummary?: DocumentSummaryData | null;
  isSummaryLoading?: boolean;
  onRegenerateSummary?: () => void;
  uploadedFileName?: string;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  dataset,
  ratios,
  health,
  currency,
  isDataMasked,
  aiAnalysis,
  onNavigateToTab,
  documentSummary = null,
  isSummaryLoading = false,
  onRegenerateSummary = () => {},
  uploadedFileName,
}) => {
  const ALL_COLLAPSIBLE_CARD_KEYS = [
    'health_card',
    'ai_brief_card',
    'monolith_card',
    'heatmap_card',
    'chart_revenue',
    'chart_margins',
    'chart_balance_sheet',
    'chart_cash_flow',
  ];

  const [collapsedCards, setCollapsedCards] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('dashboard_collapsed_cards');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleCardCollapse = (cardId: string) => {
    setCollapsedCards((prev) => {
      const next = { ...prev, [cardId]: !prev[cardId] };
      try {
        localStorage.setItem('dashboard_collapsed_cards', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleCollapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    ALL_COLLAPSIBLE_CARD_KEYS.forEach((k) => {
      allCollapsed[k] = true;
    });
    setCollapsedCards(allCollapsed);
    try {
      localStorage.setItem('dashboard_collapsed_cards', JSON.stringify(allCollapsed));
    } catch {
      // ignore
    }
  };

  const handleExpandAll = () => {
    setCollapsedCards({});
    try {
      localStorage.removeItem('dashboard_collapsed_cards');
    } catch {
      // ignore
    }
  };

  // Prepare Multi-Period Chart Data
  const periods = dataset.periods;
  const getValue = (items: typeof dataset.incomeStatement, key: string, p: string) => {
    return items.find((i) => i.key.toLowerCase() === key.toLowerCase())?.values[p] ?? 0;
  };

  const trendData = periods.map((p) => {
    const rev = getValue(dataset.incomeStatement, 'revenue', p);
    const gp = getValue(dataset.incomeStatement, 'grossProfit', p);
    const op = getValue(dataset.incomeStatement, 'operatingIncome', p);
    const ni = getValue(dataset.incomeStatement, 'netIncome', p);
    const ocf = getValue(dataset.cashFlowStatement, 'operatingCashFlow', p);
    const fcf = getValue(dataset.cashFlowStatement, 'freeCashFlow', p);

    return {
      period: p,
      Revenue: rev,
      GrossProfit: gp,
      OperatingIncome: op,
      NetIncome: ni,
      OperatingCashFlow: ocf,
      FreeCashFlow: fcf,
      GrossMarginPct: rev > 0 ? Number(((gp / rev) * 100).toFixed(1)) : 0,
      OperatingMarginPct: rev > 0 ? Number(((op / rev) * 100).toFixed(1)) : 0,
      NetMarginPct: rev > 0 ? Number(((ni / rev) * 100).toFixed(1)) : 0,
    };
  });

  const balanceSheetStructure = periods.map((p) => {
    const assets = getValue(dataset.balanceSheet, 'totalAssets', p);
    const debt = getValue(dataset.balanceSheet, 'longTermDebt', p);
    const equity = getValue(dataset.balanceSheet, 'stockholdersEquity', p);
    const cash = getValue(dataset.balanceSheet, 'cashAndEquivalents', p);
    return {
      period: p,
      TotalAssets: assets,
      Debt: debt,
      Equity: equity,
      Cash: cash,
    };
  });

  // Health Score Color
  const [activeInfoMetric, setActiveInfoMetric] = React.useState<{ id: string; rect: DOMRect } | null>(null);

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-[#10b981] bg-[#10b9811a] border-[#10b98133]';
    if (grade.startsWith('B')) return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
    if (grade.startsWith('C')) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  const getAltmanColor = (zone: string) => {
    if (zone === 'Safe') return 'text-[#10b981]';
    if (zone === 'Grey') return 'text-amber-400';
    return 'text-red-400';
  };

  // Helper to resolve EBITDA across standard or customized statement structures
  const getEbitda = (p: string) => {
    const explicit = getValue(dataset.incomeStatement, 'ebitda', p);
    if (explicit) return explicit;
    const opIncome = getValue(dataset.incomeStatement, 'operatingIncome', p);
    const depr = getValue(dataset.cashFlowStatement, 'depreciation', p) 
      || getValue(dataset.incomeStatement, 'depreciation', p) 
      || (Math.abs(getValue(dataset.cashFlowStatement, 'capitalExpenditures', p)) * 0.4);
    return opIncome + depr;
  };

  // YoY Growth Trends Heatmap for Key Line Items (Revenue, EBITDA, Net Income)
  const heatmapData = React.useMemo(() => {
    const lineItems = [
      {
        id: 'rev',
        name: 'Revenue',
        tag: 'Top-Line Scale',
        icon: DollarSign,
        color: 'indigo',
        getValue: (p: string) => getValue(dataset.incomeStatement, 'revenue', p),
      },
      {
        id: 'ebitda',
        name: 'EBITDA',
        tag: 'Operating Cash Flow',
        icon: Activity,
        color: 'amber',
        getValue: (p: string) => getEbitda(p),
      },
      {
        id: 'netIncome',
        name: 'Net Income',
        tag: 'GAAP Bottom-Line',
        icon: Award,
        color: 'emerald',
        getValue: (p: string) => getValue(dataset.incomeStatement, 'netIncome', p),
      },
    ];

    // Build consecutive period YoY steps (e.g. FY2022->FY2023, FY2023->FY2024)
    const transitions: { from: string; to: string; label: string }[] = [];
    for (let i = 1; i < periods.length; i++) {
      transitions.push({
        from: periods[i - 1],
        to: periods[i],
        label: `${periods[i - 1]} to ${periods[i]}`,
      });
    }

    const rows = lineItems.map((item) => {
      const periodValues: Record<string, number> = {};
      periods.forEach((p) => {
        periodValues[p] = item.getValue(p);
      });

      const yoySteps = transitions.map((t) => {
        const prevVal = periodValues[t.from] ?? 0;
        const curVal = periodValues[t.to] ?? 0;
        const growthPct = prevVal !== 0 ? ((curVal - prevVal) / Math.abs(prevVal)) * 100 : 0;
        const delta = curVal - prevVal;
        return {
          ...t,
          prevVal,
          curVal,
          growthPct: Number(growthPct.toFixed(1)),
          delta,
        };
      });

      const firstVal = periodValues[periods[0]] ?? 0;
      const lastVal = periodValues[periods[periods.length - 1]] ?? 0;
      const totalGrowth = firstVal !== 0 ? ((lastVal - firstVal) / Math.abs(firstVal)) * 100 : 0;
      const numYears = Math.max(1, periods.length - 1);
      const cagr = firstVal > 0 && lastVal > 0
        ? (Math.pow(lastVal / firstVal, 1 / numYears) - 1) * 100
        : totalGrowth / numYears;

      return {
        ...item,
        periodValues,
        yoySteps,
        firstVal,
        lastVal,
        cagr: Number(cagr.toFixed(1)),
        totalGrowth: Number(totalGrowth.toFixed(1)),
      };
    });

    return { transitions, rows };
  }, [dataset, periods]);

  // Color gradient resolver based on YoY percentage
  const getHeatmapStyle = (pct: number) => {
    if (pct >= 25) {
      return {
        bg: 'bg-emerald-500/25 border-emerald-500/50 hover:bg-emerald-500/35',
        text: 'text-emerald-300',
        badge: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40',
        glow: 'shadow-[0_0_12px_rgba(16,185,129,0.15)]',
        status: 'Hyper Growth',
      };
    }
    if (pct >= 10) {
      return {
        bg: 'bg-emerald-500/15 border-emerald-500/30 hover:bg-emerald-500/25',
        text: 'text-emerald-400',
        badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        glow: '',
        status: 'Strong Growth',
      };
    }
    if (pct >= 0) {
      return {
        bg: 'bg-indigo-500/15 border-indigo-500/25 hover:bg-indigo-500/25',
        text: 'text-indigo-300',
        badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
        glow: '',
        status: 'Moderate Expansion',
      };
    }
    if (pct >= -10) {
      return {
        bg: 'bg-amber-500/15 border-amber-500/30 hover:bg-amber-500/25',
        text: 'text-amber-300',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        glow: '',
        status: 'Mild Contraction',
      };
    }
    return {
      bg: 'bg-rose-500/25 border-rose-500/45 hover:bg-rose-500/35',
      text: 'text-rose-300',
      badge: 'bg-rose-500/25 text-rose-200 border-rose-500/40',
      glow: 'shadow-[0_0_12px_rgba(244,63,94,0.15)]',
      status: 'Steep Contraction',
    };
  };

  return (
    <motion.div
      variants={dashboardGridContainerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Dashboard Grid Header Controls: Information Density / Collapse All Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-[#71717a]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-[#a1a1aa] uppercase tracking-wider">Dashboard Grid Cards</span>
          {Object.values(collapsedCards).filter(Boolean).length > 0 && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {Object.values(collapsedCards).filter(Boolean).length} of {ALL_COLLAPSIBLE_CARD_KEYS.length} cards collapsed
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id="btn-dashboard-collapse-all"
            onClick={handleCollapseAll}
            className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white border border-[#27272a] hover:border-[#3f3f46] transition-all cursor-pointer shadow-sm"
          >
            Collapse All
          </button>
          <button
            type="button"
            id="btn-dashboard-expand-all"
            onClick={handleExpandAll}
            className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white border border-[#27272a] hover:border-[#3f3f46] transition-all cursor-pointer shadow-sm"
          >
            Expand All
          </button>
        </div>
      </div>
      
      {/* 1. Health Scorecard, 3D Monolith Preview & Executive Brief Banner */}
      <motion.div variants={dashboardGridItemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Overall Health Score Card (4 cols) */}
        <motion.div {...dashboardCardHoverProps} className="lg:col-span-4 h-auto">
          <ThreeDCard className="h-full group" depth={6} scale={1}>
            <div 
              id="financial-health-card"
              className={`bg-[#18181b] border border-[#27272a] hover:border-indigo-500/40 rounded-xl p-5 shadow-sm hover:shadow-[0_20px_35px_-10px_rgba(0,0,0,0.6),0_0_25px_rgba(99,102,241,0.22)] transition-all duration-300 ease-out relative overflow-hidden flex flex-col justify-between ${
                collapsedCards['health_card'] ? 'h-auto' : 'h-full min-h-[380px]'
              }`}
            >
            <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/5 group-hover:bg-indigo-500/20 rounded-full blur-2xl pointer-events-none transition-all duration-500"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-emerald-500/0 group-hover:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none transition-all duration-500"></div>
            
            <div>
              <div className="flex items-center justify-between">
                <MetricHoverTooltip
                  metricId="health_grade"
                  ratios={ratios}
                  dataset={dataset}
                  currency={currency}
                  currentValue={`Grade ${health.overallGrade}`}
                  onOpenFullInfo={(id, rect) => setActiveInfoMetric({ id, rect })}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider font-mono">Financial Health Rating</h3>
                    <button
                      type="button"
                      id="btn-metric-info-health_grade"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveInfoMetric({ id: 'health_grade', rect: e.currentTarget.getBoundingClientRect() });
                      }}
                      title="View Financial Health rating formula & sector methodology"
                      className="p-1 rounded text-[#71717a] hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                      aria-label="Financial Health rating info"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </MetricHoverTooltip>
                <div className="flex items-center gap-1.5">
                  <span className={`text-sm font-bold px-2.5 py-1 rounded-md border font-mono ${getGradeColor(health.overallGrade)}`}>
                    GRADE {health.overallGrade}
                  </span>
                  <button
                    type="button"
                    id="btn-toggle-collapse-health-card"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCardCollapse('health_card');
                    }}
                    aria-label={collapsedCards['health_card'] ? 'Expand Financial Health Rating card' : 'Collapse Financial Health Rating card'}
                    title={collapsedCards['health_card'] ? 'Expand card' : 'Collapse card to show only header'}
                    className="p-1 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#a1a1aa] hover:text-white border border-[#3f3f46] transition-all cursor-pointer shadow-sm"
                  >
                    {collapsedCards['health_card'] ? <ChevronDown className="w-3.5 h-3.5 text-indigo-400" /> : <ChevronUp className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {!collapsedCards['health_card'] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs text-[#a1a1aa] mt-3 leading-relaxed">
                      {health.summarySentence}
                    </p>

                    {/* Score gauges (Piotroski & Altman Z) */}
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#27272a]">
                      
                      {/* Piotroski F-Score */}
                      <MetricHoverTooltip
                        metricId="piotroski"
                        ratios={ratios}
                        dataset={dataset}
                        currency={currency}
                        currentValue={`${ratios.piotroskiFScore} / 9`}
                        onOpenFullInfo={(id, rect) => setActiveInfoMetric({ id, rect })}
                        className="cursor-pointer block w-full"
                      >
                        <div className="bg-[#09090b] p-3 rounded-lg border border-[#27272a] hover:border-indigo-500/30 transition-colors">
                          <div className="flex items-center justify-between text-xs text-[#71717a]">
                            <div className="flex items-center gap-1">
                              <span>Piotroski F-Score</span>
                              <button
                                type="button"
                                id="btn-metric-info-piotroski"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveInfoMetric({ id: 'piotroski', rect: e.currentTarget.getBoundingClientRect() });
                                }}
                                title="View Piotroski F-Score formula & sector importance"
                                className="p-0.5 rounded text-[#71717a] hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                                aria-label="Piotroski formula info"
                              >
                                <Info className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="font-bold text-white font-mono">{ratios.piotroskiFScore} / 9</span>
                          </div>
                          <div className="w-full bg-[#27272a] h-1.5 rounded-full mt-2 overflow-hidden">
                            <div 
                              className="bg-indigo-600 h-full rounded-full transition-all duration-700" 
                              style={{ width: `${(ratios.piotroskiFScore / 9) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] text-indigo-400 mt-1.5 block font-medium">
                            {ratios.piotroskiFScore >= 7 ? 'High Efficiency' : ratios.piotroskiFScore >= 5 ? 'Moderate' : 'Vulnerable'}
                          </span>
                        </div>
                      </MetricHoverTooltip>

                      {/* Altman Z-Score */}
                      <MetricHoverTooltip
                        metricId="altman_z"
                        ratios={ratios}
                        dataset={dataset}
                        currency={currency}
                        currentValue={`${ratios.altmanZScore} (${ratios.altmanZone})`}
                        onOpenFullInfo={(id, rect) => setActiveInfoMetric({ id, rect })}
                        className="cursor-pointer block w-full"
                      >
                        <div className="bg-[#09090b] p-3 rounded-lg border border-[#27272a] hover:border-indigo-500/30 transition-colors">
                          <div className="flex items-center justify-between text-xs text-[#71717a]">
                            <div className="flex items-center gap-1">
                              <span>Altman Z-Score</span>
                              <button
                                type="button"
                                id="btn-metric-info-altman_z"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveInfoMetric({ id: 'altman_z', rect: e.currentTarget.getBoundingClientRect() });
                                }}
                                title="View Altman Z-Score formula & sector bankruptcy prediction"
                                className="p-0.5 rounded text-[#71717a] hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                                aria-label="Altman Z-Score formula info"
                              >
                                <Info className="w-3 h-3" />
                              </button>
                            </div>
                            <span className={`font-bold font-mono ${getAltmanColor(ratios.altmanZone)}`}>
                              {ratios.altmanZScore} ({ratios.altmanZone})
                            </span>
                          </div>
                          <div className="w-full bg-[#27272a] h-1.5 rounded-full mt-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-700 ${
                                ratios.altmanZone === 'Safe' ? 'bg-[#10b981]' : ratios.altmanZone === 'Grey' ? 'bg-amber-500' : 'bg-red-500'
                              }`} 
                              style={{ width: `${Math.min(100, (ratios.altmanZScore / 4.5) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] text-[#71717a] mt-1.5 block">
                            {ratios.altmanZone === 'Safe' ? 'Safe Zone' : ratios.altmanZone === 'Grey' ? 'Monitor Working Cap' : 'High Distress'}
                          </span>
                        </div>
                      </MetricHoverTooltip>

                    </div>

                    {/* Pillar Ratings */}
                    <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                      <div className="p-2 rounded-lg bg-[#09090b] border border-[#27272a]">
                        <span className="text-[10px] text-[#71717a] block">Solvency</span>
                        <span className="text-xs font-medium text-white">{health.solvencyRating}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#09090b] border border-[#27272a]">
                        <span className="text-[10px] text-[#71717a] block">Liquidity</span>
                        <span className="text-xs font-medium text-white">{health.liquidityRating}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#09090b] border border-[#27272a]">
                        <span className="text-[10px] text-[#71717a] block">Profitability</span>
                        <span className="text-xs font-medium text-white">{health.profitabilityRating}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#09090b] border border-[#27272a]">
                        <span className="text-[10px] text-[#71717a] block">Efficiency</span>
                        <span className="text-xs font-medium text-white">{health.efficiencyRating}</span>
                      </div>
                    </div>

                    {/* Skill Takeaways */}
                    <div className="mt-4 pt-3 border-t border-[#27272a]">
                      <div className="flex flex-wrap gap-1.5">
                        {(health.keySkillsToImprove ?? []).map((skill, idx) => (
                          <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-[#09090b] text-[#a1a1aa] border border-[#27272a]">
                            • {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </ThreeDCard>
        </motion.div>

        {/* AI Deep Brief & Key Insights (5 cols) */}
        <motion.div
          {...dashboardCardHoverProps}
          data-tilt-card="true"
          data-tilt-max="5"
          data-tilt-scale="1.012"
          id="ai-executive-brief-card"
          className={`relative lg:col-span-5 bg-[#18181b] border border-[#27272a] hover:border-indigo-500/40 rounded-xl p-5 shadow-sm flex flex-col justify-between transition-colors ${
            collapsedCards['ai_brief_card'] ? 'h-auto' : 'h-full min-h-[380px]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider font-mono">AI Executive Financial Brief</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#09090b] text-[#10b981] border border-[#10b98133] font-mono font-medium">
                  Gemini 3.7 Flash Grounded
                </span>
                <button
                  type="button"
                  id="btn-toggle-collapse-ai-brief-card"
                  onClick={() => toggleCardCollapse('ai_brief_card')}
                  aria-label={collapsedCards['ai_brief_card'] ? 'Expand AI Executive Financial Brief card' : 'Collapse AI Executive Financial Brief card'}
                  title={collapsedCards['ai_brief_card'] ? 'Expand card' : 'Collapse card to show only header'}
                  className="p-1 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#a1a1aa] hover:text-white border border-[#3f3f46] transition-all cursor-pointer shadow-sm"
                >
                  {collapsedCards['ai_brief_card'] ? <ChevronDown className="w-3.5 h-3.5 text-indigo-400" /> : <ChevronUp className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {!collapsedCards['ai_brief_card'] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs text-[#a1a1aa] mt-3 leading-relaxed">
                    {aiAnalysis?.executiveSummary || 
                      `Automated audit analysis indicates ${dataset.companyName} is maintaining solid revenue momentum with YoY growth of ${ratios.revenueGrowthYoY}%. However, operating margin compression to ${ratios.operatingMargin}% and rising leverage warrants disciplined cost management and strategic CapEx staging.`
                    }
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {/* Key Strengths */}
                    <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a]">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#10b981] mb-2">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Key Financial Strengths</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-[#a1a1aa]">
                        {(aiAnalysis?.keyStrengths || [
                          `Resilient gross margin at ${ratios.grossProfitMargin}%`,
                          `Healthy interest coverage exceeding ${ratios.interestCoverage}x`,
                          `Solid balance sheet cash cushion of ${formatCurrency(getValue(dataset.balanceSheet, 'cashAndEquivalents', dataset.activePeriod), currency, true)}`,
                        ]).map((st, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-[#10b981] font-bold">•</span>
                            <span>{st}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Key Risks */}
                    <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a]">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400 mb-2">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Major Risks & Vulnerabilities</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-[#a1a1aa]">
                        {(aiAnalysis?.keyRisks || [
                          `Operating margin compressed to ${ratios.operatingMargin}%`,
                          `Debt-to-equity ratio increased to ${ratios.debtToEquity}x`,
                          `Free cash flow conversion impacted by heavy capital expenditures`,
                        ]).map((rk, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-red-400 font-bold">•</span>
                            <span>{rk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#27272a] text-xs">
                    <span className="text-[#71717a]">
                      Filings: {dataset.periods.join(' & ')}
                    </span>
                    <button
                      onClick={() => onNavigateToTab('redflags')}
                      className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>View Red Flags</span>
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* 3D Interactive Mini-Widget (3 cols) */}
        <motion.div {...dashboardCardHoverProps} className="lg:col-span-3 flex flex-col h-auto">
          <ThreeDMiniWidget
            dataset={dataset}
            ratios={ratios}
            currency={currency}
            onExpandTo3DTab={() => onNavigateToTab('3d-spatial')}
            isCollapsed={Boolean(collapsedCards['monolith_card'])}
            onToggleCollapse={() => toggleCardCollapse('monolith_card')}
          />
        </motion.div>

      </motion.div>

      {/* 2. Automated Gemini-Powered Document Summary Widget */}
      <motion.div variants={dashboardGridItemVariants} whileHover="hover">
        <DocumentSummaryWidget
          summary={documentSummary}
          isLoading={isSummaryLoading}
          onRegenerate={onRegenerateSummary}
          dataset={dataset}
          ratios={ratios}
          currency={currency}
          fileName={uploadedFileName}
        />
      </motion.div>

      {/* 3. Drag-and-Drop Priority KPI Metric Board (dnd-kit Grid System) */}
      <motion.div variants={dashboardGridItemVariants}>
        <SortableKpiGrid
          ratios={ratios}
          currency={currency}
          isDataMasked={isDataMasked}
          dataset={dataset}
        />
      </motion.div>

      {/* 4. YoY Growth Trends Heatmap Visualization (Revenue, EBITDA, Net Income) */}
      <motion.div
        variants={dashboardGridItemVariants}
        whileHover="hover"
        data-tilt-card="true"
        data-tilt-max="3"
        data-tilt-scale="1.006"
        id="growth-momentum-heatmap-card"
        className="relative bg-[#18181b] border border-[#27272a] hover:border-indigo-500/30 rounded-xl p-5 shadow-sm space-y-4 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272a] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                  YoY Growth Momentum Heatmap
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-mono">
                  Core Fundamentals
                </span>
              </div>
              <p className="text-[11px] text-[#71717a]">
                Multi-period comparative momentum across Revenue (Top-Line), EBITDA (Operating Cash Flow), and Net Income (GAAP Bottom-Line).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#a1a1aa] bg-[#09090b] px-3 py-1.5 rounded-lg border border-[#27272a]">
              <span>Filings Analyzed:</span>
              <span className="text-white font-semibold">{periods.join(' • ')}</span>
            </div>
            <button
              type="button"
              id="btn-toggle-collapse-heatmap-card"
              onClick={() => toggleCardCollapse('heatmap_card')}
              aria-label={collapsedCards['heatmap_card'] ? 'Expand YoY Growth Momentum Heatmap card' : 'Collapse YoY Growth Momentum Heatmap card'}
              title={collapsedCards['heatmap_card'] ? 'Expand card' : 'Collapse card to show only header'}
              className="p-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#a1a1aa] hover:text-white border border-[#3f3f46] transition-all cursor-pointer shadow-sm"
            >
              {collapsedCards['heatmap_card'] ? <ChevronDown className="w-3.5 h-3.5 text-indigo-400" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {!collapsedCards['heatmap_card'] && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden space-y-4"
            >

        {/* Heatmap Matrix Table */}
        <div className="table-responsive-wrapper dashboard-visual-container">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#27272a] text-[11px] font-mono uppercase tracking-wider text-[#71717a]">
                <th className="py-2.5 px-3 min-w-[180px]">Key Line Item</th>
                <th className="py-2.5 px-3 text-right min-w-[120px]">{periods[0]} (Base Anchor)</th>
                {heatmapData.transitions.map((t, idx) => (
                  <th key={idx} className="py-2.5 px-3 text-center min-w-[140px]">
                    <div className="flex flex-col items-center">
                      <span className="text-white font-medium">{t.label}</span>
                      <span className="text-[9px] text-[#71717a] font-normal">YoY Delta</span>
                    </div>
                  </th>
                ))}
                <th className="py-2.5 px-3 text-right min-w-[130px]">Multi-Year CAGR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]/60">
              {heatmapData.rows.map((row) => {
                const ItemIcon = row.icon;
                return (
                  <tr key={row.id} className="hover:bg-[#27272a]/20 transition-colors">
                    {/* Line Item Label & Tag */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-md border ${
                          row.color === 'indigo'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            : row.color === 'amber'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-emerald-500/10 text-[#10b981] border-[#10b98133]'
                        }`}>
                          <ItemIcon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white font-mono flex items-center gap-1.5">
                            <span>{row.name}</span>
                          </div>
                          <span className="text-[10px] text-[#71717a]">{row.tag}</span>
                        </div>
                      </div>
                    </td>

                    {/* Baseline Anchor Value */}
                    <td className="py-3 px-3 text-right font-mono">
                      <div className="text-xs font-semibold text-[#e4e4e7]">
                        {isDataMasked ? '••••••••' : formatCurrency(row.firstVal, currency, true)}
                      </div>
                      <span className="text-[9px] text-[#71717a]">Base Level</span>
                    </td>

                    {/* YoY Step Heatmap Cells */}
                    {row.yoySteps.map((step, idx) => {
                      const style = getHeatmapStyle(step.growthPct);
                      const isPositive = step.growthPct >= 0;
                      return (
                        <td key={idx} className="py-2 px-2.5">
                          <div className={`p-2 rounded-lg border transition-all duration-150 ${style.bg} ${style.glow}`}>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${style.badge}`}>
                                {style.status}
                              </span>
                              <div className="flex items-center gap-0.5">
                                {isPositive ? (
                                  <ArrowUpRight className={`w-3.5 h-3.5 ${style.text}`} />
                                ) : (
                                  <ArrowDownRight className={`w-3.5 h-3.5 ${style.text}`} />
                                )}
                                <span className={`text-xs font-bold font-mono ${style.text}`}>
                                  {step.growthPct > 0 ? `+${step.growthPct}%` : `${step.growthPct}%`}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-mono text-[#a1a1aa] border-t border-white/5 pt-1 mt-1">
                              <span className="text-white font-medium">
                                {isDataMasked ? '••••••••' : formatCurrency(step.curVal, currency, true)}
                              </span>
                              <span className={step.delta >= 0 ? 'text-[#10b981]' : 'text-red-400'}>
                                {step.delta >= 0 ? '+' : ''}{isDataMasked ? '••••' : formatCurrency(step.delta, currency, true)}
                              </span>
                            </div>
                          </div>
                        </td>
                      );
                    })}

                    {/* Multi-Year CAGR / Trajectory Column */}
                    <td className="py-3 px-3 text-right font-mono">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className={`text-xs font-bold ${
                          row.cagr >= 15 ? 'text-[#10b981]' : row.cagr >= 0 ? 'text-indigo-400' : 'text-red-400'
                        }`}>
                          {row.cagr > 0 ? `+${row.cagr}%` : `${row.cagr}%`}
                        </span>
                        {row.cagr >= 0 ? (
                          <TrendingUp className="w-3.5 h-3.5 text-[#10b981]" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                        )}
                      </div>
                      <span className="text-[10px] text-[#71717a] block">
                        Net: {row.totalGrowth > 0 ? `+${row.totalGrowth}%` : `${row.totalGrowth}%`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Heatmap Legend & Summary Takeaways */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-3 border-t border-[#27272a] text-xs">
          {/* Color Scale Legend */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider">YoY Scale:</span>
            <div className="flex items-center gap-1.5 text-[10px] font-mono">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/25 border border-emerald-500/50 text-emerald-300">
                ≥ +25% Hyper
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                +10% to +25% Strong
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/25 text-indigo-300">
                0% to +10% Moderate
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300">
                -10% to 0% Mild Decline
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/25 border border-rose-500/45 text-rose-300">
                &lt; -10% Contraction
              </span>
            </div>
          </div>

          {/* Quick Analytical Callout */}
          <div className="text-[11px] text-[#a1a1aa] flex items-center gap-1.5 bg-[#09090b] px-2.5 py-1 rounded-lg border border-[#27272a]">
            <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
            <span>
              Top-line Revenue pace: <strong className="text-white">{formatPercent(ratios.revenueGrowthYoY, true)}</strong> • 
              Operating EBITDA conversion: <strong className="text-white">{ratios.ebitdaMargin}% margin</strong>
            </span>
          </div>
        </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 5. Interactive Charts Grid */}
      <motion.div variants={dashboardGridItemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Chart 1: Multi-Period Revenue & Profitability Trajectory */}
        <motion.div {...dashboardCardHoverProps} data-tilt-card="true" data-tilt-max="4.5" data-tilt-scale="1.012" id="chart-card-revenue-profit" className="relative bg-[#18181b] border border-[#27272a] hover:border-indigo-500/30 rounded-xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Revenue, Gross Profit & Net Income</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#71717a] font-mono">MULTI-PERIOD</span>
              <button
                type="button"
                id="btn-toggle-collapse-chart-revenue"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCardCollapse('chart_revenue');
                }}
                aria-label={collapsedCards['chart_revenue'] ? 'Expand Revenue, Gross Profit & Net Income chart' : 'Collapse Revenue, Gross Profit & Net Income chart'}
                aria-expanded={!collapsedCards['chart_revenue']}
                title={collapsedCards['chart_revenue'] ? 'Expand chart' : 'Collapse chart to show only header'}
                className="p-1 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#a1a1aa] hover:text-white border border-[#3f3f46] transition-all cursor-pointer shadow-sm"
              >
                {collapsedCards['chart_revenue'] ? <ChevronDown className="w-3.5 h-3.5 text-indigo-400" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {!collapsedCards['chart_revenue'] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="w-full dashboard-visual-container visual-containment aspect-chart-responsive relative [min-height:0]" style={{ minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.8} />
                      <XAxis dataKey="period" stroke="#71717a" fontSize={11} tickLine={false} />
                      <YAxis 
                        stroke="#71717a" 
                        fontSize={11} 
                        tickLine={false}
                        tickFormatter={(val) => formatCurrency(val, currency, true)}
                      />
                      <Tooltip 
                        allowEscapeViewBox={{ x: true, y: true }}
                        wrapperStyle={{ zIndex: 9999, pointerEvents: 'none' }}
                        content={
                          <DashboardChartTooltip 
                            chartVariant="revenue_profit" 
                            dataset={dataset} 
                            ratios={ratios} 
                            currency={currency} 
                          />
                        }
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', zIndex: 1 }} />
                      <Bar dataKey="Revenue" fill="#4f46e5" radius={[3, 3, 0, 0]} name="Total Revenue" />
                      <Bar dataKey="GrossProfit" fill="#06b6d4" radius={[3, 3, 0, 0]} name="Gross Profit" />
                      <Bar dataKey="NetIncome" fill="#10b981" radius={[3, 3, 0, 0]} name="Net Income" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Chart 2: Margin Expansion & Compression Trajectory */}
        <motion.div {...dashboardCardHoverProps} data-tilt-card="true" data-tilt-max="4.5" data-tilt-scale="1.012" id="chart-card-margin-trends" className="relative bg-[#18181b] border border-[#27272a] hover:border-indigo-500/30 rounded-xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Margin Trends (%) & Efficiency</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#71717a] font-mono">EFFICIENCY</span>
              <button
                type="button"
                id="btn-toggle-collapse-chart-margins"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCardCollapse('chart_margins');
                }}
                aria-label={collapsedCards['chart_margins'] ? 'Expand Margin Trends chart' : 'Collapse Margin Trends chart'}
                aria-expanded={!collapsedCards['chart_margins']}
                title={collapsedCards['chart_margins'] ? 'Expand chart' : 'Collapse chart to show only header'}
                className="p-1 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#a1a1aa] hover:text-white border border-[#3f3f46] transition-all cursor-pointer shadow-sm"
              >
                {collapsedCards['chart_margins'] ? <ChevronDown className="w-3.5 h-3.5 text-indigo-400" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {!collapsedCards['chart_margins'] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="w-full dashboard-visual-container visual-containment aspect-chart-responsive relative [min-height:0]" style={{ minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.8} />
                      <XAxis dataKey="period" stroke="#71717a" fontSize={11} tickLine={false} />
                      <YAxis 
                        stroke="#71717a" 
                        fontSize={11} 
                        tickLine={false}
                        tickFormatter={(val) => `${val}%`}
                        domain={[0, 80]}
                      />
                      <Tooltip 
                        allowEscapeViewBox={{ x: true, y: true }}
                        wrapperStyle={{ zIndex: 9999, pointerEvents: 'none' }}
                        content={
                          <DashboardChartTooltip 
                            chartVariant="margins" 
                            dataset={dataset} 
                            ratios={ratios} 
                            currency={currency} 
                          />
                        }
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', zIndex: 1 }} />
                      <Line type="monotone" dataKey="GrossMarginPct" stroke="#06b6d4" strokeWidth={2} name="Gross Margin %" dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="OperatingMarginPct" stroke="#f59e0b" strokeWidth={2} name="Operating Margin %" dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="NetMarginPct" stroke="#10b981" strokeWidth={2} name="Net Margin %" dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Chart 3: Capital Structure & Solvency Breakdown */}
        <motion.div {...dashboardCardHoverProps} data-tilt-card="true" data-tilt-max="4.5" data-tilt-scale="1.012" id="chart-card-balance-sheet" className="relative bg-[#18181b] border border-[#27272a] hover:border-indigo-500/30 rounded-xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Balance Sheet Structure</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#71717a] font-mono">SOLVENCY</span>
              <button
                type="button"
                id="btn-toggle-collapse-chart-balance-sheet"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCardCollapse('chart_balance_sheet');
                }}
                aria-label={collapsedCards['chart_balance_sheet'] ? 'Expand Balance Sheet Structure chart' : 'Collapse Balance Sheet Structure chart'}
                aria-expanded={!collapsedCards['chart_balance_sheet']}
                title={collapsedCards['chart_balance_sheet'] ? 'Expand chart' : 'Collapse chart to show only header'}
                className="p-1 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#a1a1aa] hover:text-white border border-[#3f3f46] transition-all cursor-pointer shadow-sm"
              >
                {collapsedCards['chart_balance_sheet'] ? <ChevronDown className="w-3.5 h-3.5 text-indigo-400" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {!collapsedCards['chart_balance_sheet'] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="w-full dashboard-visual-container visual-containment aspect-chart-responsive relative [min-height:0]" style={{ minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={balanceSheetStructure} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.8} />
                      <XAxis dataKey="period" stroke="#71717a" fontSize={11} tickLine={false} />
                      <YAxis 
                        stroke="#71717a" 
                        fontSize={11} 
                        tickLine={false}
                        tickFormatter={(val) => formatCurrency(val, currency, true)}
                      />
                      <Tooltip 
                        allowEscapeViewBox={{ x: true, y: true }}
                        wrapperStyle={{ zIndex: 9999, pointerEvents: 'none' }}
                        content={
                          <DashboardChartTooltip 
                            chartVariant="balance_sheet" 
                            dataset={dataset} 
                            ratios={ratios} 
                            currency={currency} 
                          />
                        }
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', zIndex: 1 }} />
                      <Area type="monotone" dataKey="TotalAssets" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} name="Total Assets" />
                      <Area type="monotone" dataKey="Equity" stroke="#10b981" fill="#10b981" fillOpacity={0.25} name="Equity" />
                      <Area type="monotone" dataKey="Debt" stroke="#ef4444" fill="#ef4444" fillOpacity={0.25} name="Long-Term Debt" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Chart 4: Operating Cash Flow vs Free Cash Flow */}
        <motion.div {...dashboardCardHoverProps} data-tilt-card="true" data-tilt-max="4.5" data-tilt-scale="1.012" id="chart-card-cash-flow" className="relative bg-[#18181b] border border-[#27272a] hover:border-indigo-500/30 rounded-xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Cash Flow Generation & FCF Conversion</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#71717a] font-mono">LIQUIDITY</span>
              <button
                type="button"
                id="btn-toggle-collapse-chart-cash-flow"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCardCollapse('chart_cash_flow');
                }}
                aria-label={collapsedCards['chart_cash_flow'] ? 'Expand Cash Flow Generation chart' : 'Collapse Cash Flow Generation chart'}
                aria-expanded={!collapsedCards['chart_cash_flow']}
                title={collapsedCards['chart_cash_flow'] ? 'Expand chart' : 'Collapse chart to show only header'}
                className="p-1 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#a1a1aa] hover:text-white border border-[#3f3f46] transition-all cursor-pointer shadow-sm"
              >
                {collapsedCards['chart_cash_flow'] ? <ChevronDown className="w-3.5 h-3.5 text-indigo-400" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {!collapsedCards['chart_cash_flow'] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="w-full dashboard-visual-container visual-containment aspect-chart-responsive relative [min-height:0]" style={{ minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.8} />
                      <XAxis dataKey="period" stroke="#71717a" fontSize={11} tickLine={false} />
                      <YAxis 
                        stroke="#71717a" 
                        fontSize={11} 
                        tickLine={false}
                        tickFormatter={(val) => formatCurrency(val, currency, true)}
                      />
                      <Tooltip 
                        allowEscapeViewBox={{ x: true, y: true }}
                        wrapperStyle={{ zIndex: 9999, pointerEvents: 'none' }}
                        content={
                          <DashboardChartTooltip 
                            chartVariant="cash_flow" 
                            dataset={dataset} 
                            ratios={ratios} 
                            currency={currency} 
                          />
                        }
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', zIndex: 1 }} />
                      <Bar dataKey="OperatingCashFlow" fill="#10b981" radius={[3, 3, 0, 0]} name="Operating Cash Flow" />
                      <Bar dataKey="FreeCashFlow" fill="#06b6d4" radius={[3, 3, 0, 0]} name="Free Cash Flow" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </motion.div>

      {/* Metric Info Popover */}
      {activeInfoMetric && (
        <MetricInfoPopover
          metricId={activeInfoMetric.id}
          triggerRect={activeInfoMetric.rect}
          isOpen={Boolean(activeInfoMetric)}
          onClose={() => setActiveInfoMetric(null)}
          ratios={ratios}
          dataset={dataset}
          currency={currency}
        />
      )}

    </motion.div>
  );
};
