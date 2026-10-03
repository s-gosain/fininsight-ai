import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Activity, 
  Lightbulb, 
  ArrowRight, 
  Play, 
  Pause, 
  RotateCw, 
  MessageSquareText, 
  ExternalLink,
  Sliders,
  Maximize2,
  Calendar,
  Layers,
  Award,
  X,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FinancialDataset, FinancialRatios, FinancialHealthGrade, CurrencyCode } from '../types';
import { formatCurrency, formatPercent } from '../data/currenciesAndFiscal';

interface InsightItem {
  id: string;
  category: string;
  categoryColor: string;
  title: string;
  trendType: 'positive' | 'warning' | 'neutral' | 'critical';
  trendBadge: string;
  trendDelta?: string;
  summary: string;
  metricComparison: {
    label: string;
    currentValue: string;
    previousValue: string;
    deltaPercent?: string;
  };
  recommendation: string;
  targetTab: string;
  targetTabLabel: string;
  suggestedPrompt: string;
}

interface AiInsightSidebarProps {
  dataset: FinancialDataset;
  ratios: FinancialRatios;
  health: FinancialHealthGrade;
  currency: CurrencyCode;
  isDataMasked: boolean;
  onNavigateToTab: (tab: string) => void;
  onOpenChatWithPrompt?: (prompt: string) => void;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  onClose?: () => void;
}

const STORAGE_COLLAPSED_KEY = 'fininsight_ai_insight_sidebar_collapsed';
const STORAGE_DISMISSED_KEY = 'fininsight_ai_insight_widget_dismissed';
const ROTATION_INTERVAL_MS = 12000; // 12 seconds per rotating insight

export const AiInsightSidebar: React.FC<AiInsightSidebarProps> = ({
  dataset,
  ratios,
  health,
  currency,
  isDataMasked,
  onNavigateToTab,
  onOpenChatWithPrompt,
  isOpen: controlledIsOpen,
  onToggleOpen,
  onClose: controlledOnClose,
}) => {
  // Collapsed state: ALWAYS default to true (collapsed) so it never interrupts the dashboard on load
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COLLAPSED_KEY);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {}
    return true; // Default to collapsed
  });

  // User preference to completely dismiss the floating edge widget if desired
  const [isWidgetDismissed, setIsWidgetDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_DISMISSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const isControlled = typeof controlledIsOpen === 'boolean';
  const isExpanded = isControlled ? controlledIsOpen : !internalCollapsed;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoRotateActive, setIsAutoRotateActive] = useState(true);
  const [progress, setProgress] = useState(0);
  const isHoveredRef = useRef(false);

  // Toggle collapsed and save to localStorage
  const handleToggleCollapse = useCallback(() => {
    if (isControlled && onToggleOpen) {
      onToggleOpen();
    } else {
      setInternalCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem(STORAGE_COLLAPSED_KEY, String(next));
        } catch {}
        return next;
      });
    }
  }, [isControlled, onToggleOpen]);

  const handleClose = useCallback(() => {
    if (isControlled && controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalCollapsed(true);
      try {
        localStorage.setItem(STORAGE_COLLAPSED_KEY, 'true');
      } catch {}
    }
  }, [isControlled, controlledOnClose]);

  const handleDismissWidget = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWidgetDismissed(true);
    try {
      localStorage.setItem(STORAGE_DISMISSED_KEY, 'true');
    } catch {}
  }, []);

  const handleRestoreWidget = useCallback(() => {
    setIsWidgetDismissed(false);
    try {
      localStorage.removeItem(STORAGE_DISMISSED_KEY);
    } catch {}
  }, []);

  // Listen for Escape key to cleanly dismiss drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, handleClose]);

  // Compute active & previous period details
  const activePeriod = dataset.activePeriod;
  const periods = dataset.periods;
  const prevPeriod = periods[periods.indexOf(activePeriod) - 1] || periods[0];

  // Helper to extract statement figures
  const getStmtVal = (items: typeof dataset.incomeStatement, key: string, p: string = activePeriod): number => {
    const item = items.find((i) => i.key.toLowerCase() === key.toLowerCase());
    return item?.values[p] ?? 0;
  };

  const revenue = getStmtVal(dataset.incomeStatement, 'revenue', activePeriod);
  const prevRevenue = getStmtVal(dataset.incomeStatement, 'revenue', prevPeriod);
  const grossProfit = getStmtVal(dataset.incomeStatement, 'grossProfit', activePeriod);
  const operatingIncome = getStmtVal(dataset.incomeStatement, 'operatingIncome', activePeriod);
  const netIncome = getStmtVal(dataset.incomeStatement, 'netIncome', activePeriod);
  const prevNetIncome = getStmtVal(dataset.incomeStatement, 'netIncome', prevPeriod);
  const cash = getStmtVal(dataset.balanceSheet, 'cashAndEquivalents', activePeriod);
  const prevCash = getStmtVal(dataset.balanceSheet, 'cashAndEquivalents', prevPeriod) || cash;
  const operatingCashFlow = getStmtVal(dataset.cashFlowStatement, 'operatingCashFlow', activePeriod);

  // 1. Dynamically compute tailored AI insights based on active dataset trends
  const insights = useMemo<InsightItem[]>(() => {
    const list: InsightItem[] = [];

    // --- Insight 1: Revenue & Growth Trajectory ---
    const revYoY = ratios.revenueGrowthYoY;
    const revDiff = revenue - prevRevenue;
    const isRevSurge = revYoY >= 12;
    const isRevContracting = revYoY < 0;

    list.push({
      id: 'insight-growth',
      category: 'Growth Momentum',
      categoryColor: isRevSurge ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : isRevContracting ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      title: isRevSurge 
        ? `Top-Line Expansion Surging at ${revYoY.toFixed(1)}% YoY` 
        : isRevContracting 
        ? `Revenue Contraction of ${Math.abs(revYoY).toFixed(1)}% YoY Requires Scrutiny`
        : `Steady Top-Line Compounding at ${revYoY.toFixed(1)}% YoY`,
      trendType: isRevSurge ? 'positive' : isRevContracting ? 'critical' : 'neutral',
      trendBadge: `${revYoY > 0 ? '+' : ''}${revYoY.toFixed(1)}% YoY`,
      trendDelta: revDiff !== 0 ? `${revDiff > 0 ? '+' : ''}${formatCurrency(revDiff, currency, true)}` : undefined,
      summary: isRevSurge
        ? `${dataset.companyName} achieved strong top-line momentum in ${activePeriod}, generating ${formatCurrency(revenue, currency, true)} in annualized revenue. Operating leverage is expanding faster than general sector peer averages.`
        : isRevContracting
        ? `${dataset.companyName} experienced revenue headwinds in ${activePeriod}, with top-line declining from ${formatCurrency(prevRevenue, currency, true)} to ${formatCurrency(revenue, currency, true)}. Customer retention and pipeline conversion must be prioritized.`
        : `${dataset.companyName} generated ${formatCurrency(revenue, currency, true)} during ${activePeriod}, exhibiting resilient recurring revenue baseline across core customer cohorts.`,
      metricComparison: {
        label: `Revenue (${prevPeriod} to ${activePeriod})`,
        currentValue: formatCurrency(revenue, currency, true),
        previousValue: formatCurrency(prevRevenue, currency, true),
        deltaPercent: `${revYoY > 0 ? '+' : ''}${revYoY.toFixed(1)}%`,
      },
      recommendation: isRevSurge
        ? 'Capitalize on sales momentum by expanding high-margin enterprise accounts while maintaining strict payback hurdles.'
        : isRevContracting
        ? 'Review churn distribution, implement customer success interventions, and hedge against further demand soft spots.'
        : 'Optimize unit economics and explore cross-sell expansion to unlock higher organic growth acceleration.',
      targetTab: 'visualization',
      targetTabLabel: 'Explore Revenue Visualizations',
      suggestedPrompt: `Analyze the revenue growth of ${dataset.companyName} in ${activePeriod}. What are the key drivers and risk factors?`,
    });

    // --- Insight 2: Margin Architecture & Profitability ---
    const grossMargin = ratios.grossProfitMargin;
    const opMargin = ratios.operatingMargin;
    const netMargin = ratios.netProfitMargin;
    const isHighMargin = grossMargin >= 65 || opMargin >= 20;

    list.push({
      id: 'insight-margins',
      category: 'Margin Architecture',
      categoryColor: isHighMargin ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : opMargin < 5 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      title: isHighMargin
        ? `Robust Gross Margin of ${grossMargin.toFixed(1)}% Protects Profitability`
        : opMargin < 5
        ? `Compressed Operating Margin (${opMargin.toFixed(1)}%) Flags Overhead Drag`
        : `Balanced Margin Profile: ${opMargin.toFixed(1)}% Operating Spread`,
      trendType: isHighMargin ? 'positive' : opMargin < 5 ? 'warning' : 'neutral',
      trendBadge: `${opMargin.toFixed(1)}% Op Margin`,
      summary: `${dataset.companyName} generated ${formatCurrency(operatingIncome, currency, true)} in operating income during ${activePeriod}. Gross margin holds at ${grossMargin.toFixed(1)}% while bottom-line net profit margin stands at ${netMargin.toFixed(1)}%.`,
      metricComparison: {
        label: 'Gross vs Operating Margin',
        currentValue: `${opMargin.toFixed(1)}% Op`,
        previousValue: `${grossMargin.toFixed(1)}% Gross`,
        deltaPercent: `${netMargin.toFixed(1)}% Net`,
      },
      recommendation: opMargin < 10
        ? 'Conduct line-by-line SG&A efficiency audit and renegotiate SaaS and vendor infrastructure contracts.'
        : 'Reinvest gross profit surplus into strategic R&D and automated operational tooling to defend pricing power.',
      targetTab: 'statements',
      targetTabLabel: 'Inspect Statements Breakdown',
      suggestedPrompt: `Examine the margin structure for ${dataset.companyName}. Why is operating margin at ${opMargin.toFixed(1)}% and how can we optimize it?`,
    });

    // --- Insight 3: Liquidity Fortress & Cash Runway ---
    const currRatio = ratios.currentRatio;
    const quickRatio = ratios.quickRatio;
    const isSolidLiquidity = currRatio >= 1.8 && quickRatio >= 1.2;
    const isTightLiquidity = currRatio < 1.2;

    list.push({
      id: 'insight-liquidity',
      category: 'Liquidity & Solvency',
      categoryColor: isSolidLiquidity ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' : isTightLiquidity ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      title: isSolidLiquidity
        ? `Liquidity Fortress: ${currRatio.toFixed(2)}x Current Ratio Cushion`
        : isTightLiquidity
        ? `Tight Working Capital: ${currRatio.toFixed(2)}x Ratio Demands Buffer`
        : `Adequate Working Capital Buffer of ${currRatio.toFixed(2)}x`,
      trendType: isSolidLiquidity ? 'positive' : isTightLiquidity ? 'critical' : 'neutral',
      trendBadge: `${currRatio.toFixed(2)}x Current Ratio`,
      summary: `Cash and short-term liquid reserves stand at ${formatCurrency(cash, currency, true)}. Quick ratio of ${quickRatio.toFixed(2)}x verifies immediate capability to meet obligations without liquidating non-cash inventory.`,
      metricComparison: {
        label: `Liquid Reserves (${activePeriod})`,
        currentValue: formatCurrency(cash, currency, true),
        previousValue: formatCurrency(prevCash, currency, true),
        deltaPercent: `${quickRatio.toFixed(2)}x Quick`,
      },
      recommendation: isTightLiquidity
        ? 'Establish revolving credit backstops and accelerate collections on 60+ day receivables.'
        : 'Maintain structured cash reserves in high-yield treasury equivalents while preserving M&A agility.',
      targetTab: 'forecasting',
      targetTabLabel: 'View Cash Runway Forecast',
      suggestedPrompt: `What is the liquidity health of ${dataset.companyName} based on its ${currRatio.toFixed(2)}x current ratio and ${formatCurrency(cash, currency, true)} cash balance?`,
    });

    // --- Insight 4: Capital Structure & Leverage ---
    const deRatio = ratios.debtToEquity;
    const intCoverage = ratios.interestCoverage;
    const isLowLeverage = deRatio <= 0.6;
    const isElevatedLeverage = deRatio > 1.8;

    list.push({
      id: 'insight-solvency',
      category: 'Capital Structure',
      categoryColor: isLowLeverage ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : isElevatedLeverage ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      title: isLowLeverage
        ? `Conservative Balance Sheet with Low ${deRatio.toFixed(2)}x Debt/Equity`
        : isElevatedLeverage
        ? `Elevated Financial Leverage (${deRatio.toFixed(2)}x D/E) Requires Monitoring`
        : `Prudent Leverage Structure at ${deRatio.toFixed(2)}x Debt/Equity`,
      trendType: isLowLeverage ? 'positive' : isElevatedLeverage ? 'warning' : 'neutral',
      trendBadge: `${deRatio.toFixed(2)}x D/E`,
      summary: `Interest coverage stands at ${intCoverage.toFixed(1)}x operating profit, indicating ${intCoverage > 5 ? 'substantial debt servicing capability' : 'potential exposure to interest rate volatility'}.`,
      metricComparison: {
        label: 'Debt/Equity vs Interest Coverage',
        currentValue: `${deRatio.toFixed(2)}x D/E`,
        previousValue: `${intCoverage.toFixed(1)}x Cov`,
        deltaPercent: intCoverage >= 4 ? 'Low Risk' : 'Watch',
      },
      recommendation: isElevatedLeverage
        ? 'Prioritize free cash flow toward scheduled debt amortization before initiating equity buybacks.'
        : 'Take advantage of pristine credit metrics to negotiate favorable financing terms for core growth initiatives.',
      targetTab: 'benchmarks',
      targetTabLabel: 'Check Sector Benchmarks',
      suggestedPrompt: `Evaluate the debt and leverage profile of ${dataset.companyName}. Are debt covenants at risk?`,
    });

    // --- Insight 5: Overall Health & Governance Sentinel ---
    const healthGrade = health.overallGrade;
    const piotroski = ratios.piotroskiFScore ?? 7;
    const isGradeA = healthGrade.startsWith('A');
    const isGradeC_or_D = healthGrade.startsWith('C') || healthGrade.startsWith('D');

    list.push({
      id: 'insight-health',
      category: 'Enterprise Health Grade',
      categoryColor: isGradeA ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : isGradeC_or_D ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      title: `Composite Financial Health: Grade ${healthGrade} (${health.solvencyRating} Solvency)`,
      trendType: isGradeA ? 'positive' : isGradeC_or_D ? 'critical' : 'neutral',
      trendBadge: `Grade ${healthGrade}`,
      summary: health.summarySentence || `Comprehensive assessment yields Grade ${healthGrade} with a Piotroski F-Score of ${piotroski}/9, signifying fundamental financial stability and operational discipline.`,
      metricComparison: {
        label: 'Pillar Health Ratings',
        currentValue: `Prof: ${health.profitabilityRating}`,
        previousValue: `Liq: ${health.liquidityRating}`,
        deltaPercent: `Solv: ${health.solvencyRating}`,
      },
      recommendation: health.keySkillsToImprove?.[0] || (isGradeA
        ? 'Institutional resilience is confirmed. Maintain disciplined capital allocation while scaling high-ROI segments.'
        : 'Formulate an operational turnaround plan focusing on working capital recovery and cost rationalization.'),
      targetTab: 'dashboard',
      targetTabLabel: 'View Executive Dashboard',
      suggestedPrompt: `Give me an executive summary of ${dataset.companyName}'s financial health rating (Grade ${healthGrade}, ${health.solvencyRating} solvency, ${health.liquidityRating} liquidity).`,
    });

    // --- Insight 6: Free Cash Flow & Return on Equity ---
    const roe = ratios.returnOnEquity;
    const roa = ratios.returnOnAssets;

    list.push({
      id: 'insight-efficiency',
      category: 'Capital Efficiency & ROE',
      categoryColor: roe >= 15 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : roe < 5 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-violet-400 bg-violet-500/10 border-violet-500/20',
      title: roe >= 15
        ? `Superior Shareholder Returns with ${roe.toFixed(1)}% ROE`
        : `Return on Equity Compounding at ${roe.toFixed(1)}%`,
      trendType: roe >= 15 ? 'positive' : roe < 5 ? 'warning' : 'neutral',
      trendBadge: `${roe.toFixed(1)}% ROE`,
      summary: `Generating ${formatPercent(roe)} return on equity and ${formatPercent(roa)} return on assets. Operating cash flow reached ${formatCurrency(operatingCashFlow, currency, true)} for the reporting period.`,
      metricComparison: {
        label: 'Return on Equity vs Return on Assets',
        currentValue: `${roe.toFixed(1)}% ROE`,
        previousValue: `${roa.toFixed(1)}% ROA`,
        deltaPercent: roe > roa * 1.5 ? 'Leveraged' : 'Organic',
      },
      recommendation: 'Benchmark return on invested capital against industry cost of capital (WACC) to ensure economic value add.',
      targetTab: 'visualization',
      targetTabLabel: 'Analyze DuPont & ROE Charts',
      suggestedPrompt: `Analyze return on equity (${roe.toFixed(1)}%) and operating cash flow for ${dataset.companyName}.`,
    });

    return list;
  }, [dataset, ratios, health, currency, activePeriod, prevPeriod, revenue, prevRevenue, grossProfit, operatingIncome, netIncome, prevNetIncome, cash, prevCash, operatingCashFlow]);

  // Ensure currentIndex stays within bounds if dataset changes
  useEffect(() => {
    if (currentIndex >= insights.length) {
      setCurrentIndex(0);
    }
  }, [insights.length, currentIndex]);

  // 2. Auto-rotate timer with pause-on-hover & smooth progress bar
  useEffect(() => {
    if (!isExpanded || !isAutoRotateActive || insights.length <= 1) {
      setProgress(0);
      return;
    }

    const stepMs = 100;
    const totalSteps = ROTATION_INTERVAL_MS / stepMs;
    let stepCount = 0;

    const timer = setInterval(() => {
      if (isHoveredRef.current) return; // Pause on hover

      stepCount += 1;
      setProgress(Math.min(100, (stepCount / totalSteps) * 100));

      if (stepCount >= totalSteps) {
        stepCount = 0;
        setProgress(0);
        setCurrentIndex((prev) => (prev + 1) % insights.length);
      }
    }, stepMs);

    return () => clearInterval(timer);
  }, [isExpanded, isAutoRotateActive, insights.length, currentIndex]);

  const handleNext = useCallback(() => {
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1) % insights.length);
  }, [insights.length]);

  const handlePrev = useCallback(() => {
    setProgress(0);
    setCurrentIndex((prev) => (prev - 1 + insights.length) % insights.length);
  }, [insights.length]);

  const currentInsight = insights[currentIndex] || insights[0];

  // Formatted date string for "Insight of the Day"
  const todayFormatted = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. COLLAPSED DOCKED TAB (Right-edge trigger when sidebar is minimized)      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {!isExpanded && !isWidgetDismissed && (
          <motion.div
            id="ai-insight-collapsed-tab"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-30 flex items-center group pointer-events-auto"
          >
            <div className="relative flex items-center">
              {/* Dismiss/Hide floating button on hover */}
              <button
                type="button"
                onClick={handleDismissWidget}
                title="Hide floating insight tab from screen (can reopen anytime from top Header)"
                aria-label="Hide floating insight tab"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute -left-6 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#18181b] hover:bg-rose-950/80 border border-[#3f3f46] hover:border-rose-500/60 text-[#71717a] hover:text-rose-300 flex items-center justify-center cursor-pointer shadow-lg z-10"
              >
                <X className="w-2.5 h-2.5" />
              </button>

              <button
                id="btn-ai-insight-collapsed-arrow"
                type="button"
                onClick={handleToggleCollapse}
                title="Expand AI Insight panel (Click or press Enter)"
                aria-label="Expand AI Insight panel"
                aria-expanded={false}
                aria-controls="ai-insight-persistent-sidebar"
                className="w-7 h-12 rounded-l-lg bg-[#18181b]/95 hover:bg-[#27272a] border-y border-l border-[#3f3f46] hover:border-purple-500/60 backdrop-blur-xl transition-all duration-200 flex items-center justify-center cursor-pointer shadow-xl hover:shadow-purple-500/20 text-[#a1a1aa] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1 focus-visible:ring-offset-[#09090b]"
              >
                <ChevronLeft className="w-4 h-4 text-[#a1a1aa] hover:text-white transition-transform group-hover:-translate-x-0.5 shrink-0" />
                <span className="sr-only">Expand AI Insight panel</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 2. EXPANDED PERSISTENT RIGHT SIDEBAR DRAWER                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Click-outside backdrop to dismiss cleanly without trapping the user */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40"
              aria-hidden="true"
            />

            <motion.aside
              id="ai-insight-persistent-sidebar"
              initial={{ x: 380, opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 380, opacity: 0.8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              onMouseEnter={() => { isHoveredRef.current = true; }}
              onMouseLeave={() => { isHoveredRef.current = false; }}
              className="fixed right-0 top-0 bottom-0 w-80 sm:w-96 max-w-full bg-[#09090b]/98 backdrop-blur-2xl border-l border-[#27272a] shadow-2xl z-50 flex flex-col text-left select-none overflow-hidden"
            >
              {/* Top Progress Bar for Rotating Insights */}
              <div className="w-full h-1 bg-[#27272a]/60 relative shrink-0">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-400 transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Sidebar Header */}
              <div className="p-3.5 sm:p-4 border-b border-[#27272a] bg-[#18181b]/70 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-purple-500/30 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs sm:text-sm font-bold text-white truncate tracking-tight">
                        AI Insight of the Day
                      </h3>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    </div>
                    <div className="text-[10px] text-[#a1a1aa] truncate flex items-center gap-1.5 font-mono">
                      <span>{todayFormatted}</span>
                      <span>•</span>
                      <span className="text-purple-300 font-medium truncate">{dataset.companyName}</span>
                    </div>
                  </div>
                </div>

                {/* Header Controls */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Play/Pause Rotation */}
                  <button
                    id="btn-ai-insight-toggle-rotation"
                    onClick={() => setIsAutoRotateActive((prev) => !prev)}
                    title={isAutoRotateActive ? 'Pause auto-rotation' : 'Resume auto-rotation'}
                    aria-label={isAutoRotateActive ? 'Pause auto-rotation' : 'Resume auto-rotation'}
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs transition-colors cursor-pointer ${
                      isAutoRotateActive 
                        ? 'bg-[#27272a] text-[#a1a1aa] hover:text-white border-[#3f3f46]' 
                        : 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                    }`}
                  >
                    {isAutoRotateActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                  </button>

                  {/* Close / Collapse Button */}
                  <button
                    id="btn-ai-insight-collapse"
                    onClick={handleClose}
                    title="Close AI Insight drawer (Esc)"
                    aria-label="Close sidebar"
                    className="w-7 h-7 rounded-lg bg-[#27272a]/80 hover:bg-[#27272a] border border-[#3f3f46] flex items-center justify-center text-[#a1a1aa] hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sub-header Controls & Counter */}
              <div className="px-4 py-2 bg-[#09090b] border-b border-[#27272a]/60 flex items-center justify-between text-[11px] text-[#71717a] shrink-0 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-semibold">{currentIndex + 1}</span>
                  <span>of</span>
                  <span>{insights.length}</span>
                  <span className="text-[#3f3f46]">|</span>
                  <span className="text-[#a1a1aa] text-[10px]">Active Trend Vector</span>
                </div>

                {/* Dot Selectors */}
                <div className="flex items-center gap-1">
                  {insights.map((ins, idx) => (
                    <button
                      key={ins.id}
                      onClick={() => {
                        setProgress(0);
                        setCurrentIndex(idx);
                      }}
                      title={`Jump to ${ins.category}`}
                      aria-label={`Jump to ${ins.category}`}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === currentIndex 
                          ? 'w-4 bg-indigo-500' 
                          : 'w-1.5 bg-[#27272a] hover:bg-[#3f3f46]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Scrollable Insight Content Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentInsight.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-4"
                  >
                    {/* Category & Direction Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold border ${currentInsight.categoryColor}`}>
                        {currentInsight.category}
                      </span>

                      <div className="flex items-center gap-1">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                            currentInsight.trendType === 'positive'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : currentInsight.trendType === 'critical'
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              : currentInsight.trendType === 'warning'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                          }`}
                        >
                          {currentInsight.trendType === 'positive' && <TrendingUp className="w-3.5 h-3.5 shrink-0" />}
                          {currentInsight.trendType === 'critical' && <TrendingDown className="w-3.5 h-3.5 shrink-0" />}
                          {currentInsight.trendType === 'warning' && <ShieldAlert className="w-3.5 h-3.5 shrink-0" />}
                          {currentInsight.trendType === 'neutral' && <Activity className="w-3.5 h-3.5 shrink-0" />}
                          <span>{currentInsight.trendBadge}</span>
                        </span>
                      </div>
                    </div>

                    {/* Headline */}
                    <h4 className="text-sm font-semibold text-white leading-snug tracking-tight">
                      {currentInsight.title}
                    </h4>

                    {/* Metric Card */}
                    <div className="p-3 rounded-xl bg-[#18181b] border border-[#27272a] space-y-2 shadow-inner">
                      <div className="flex items-center justify-between text-[11px] text-[#71717a] font-mono">
                        <span>{currentInsight.metricComparison.label}</span>
                        {currentInsight.metricComparison.deltaPercent && (
                          <span className="font-semibold text-indigo-300">
                            {currentInsight.metricComparison.deltaPercent}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#27272a]/60">
                        <div>
                          <span className="text-[10px] text-[#71717a] block font-mono">Previous Baseline</span>
                          <span className="text-xs font-semibold text-[#a1a1aa] font-mono">
                            {isDataMasked ? '••••••••' : currentInsight.metricComparison.previousValue}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-[#71717a] block font-mono">Active Trend</span>
                          <span className="text-xs font-bold text-white font-mono">
                            {isDataMasked ? '••••••••' : currentInsight.metricComparison.currentValue}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Narrative Analysis */}
                    <div className="text-xs text-[#a1a1aa] leading-relaxed bg-[#18181b]/50 p-3 rounded-xl border border-[#27272a]/60">
                      <p>{currentInsight.summary}</p>
                    </div>

                    {/* Actionable Recommendation */}
                    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/30 to-purple-950/20 border border-indigo-500/20 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-indigo-400 text-[11px] font-semibold">
                        <Lightbulb className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                        <span>Executive Recommendation</span>
                      </div>
                      <p className="text-[11px] text-[#d4d4d8] leading-normal">
                        {currentInsight.recommendation}
                      </p>
                    </div>

                    {/* Quick Tab Action Button */}
                    <div className="pt-1 space-y-2">
                      <button
                        id="btn-ai-insight-navigate-tab"
                        onClick={() => onNavigateToTab(currentInsight.targetTab)}
                        className="w-full py-2 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 hover:border-indigo-500/60 text-indigo-300 text-xs font-medium flex items-center justify-between transition-all cursor-pointer group"
                      >
                        <span className="truncate">{currentInsight.targetTabLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-1 transition-transform shrink-0" />
                      </button>

                      {onOpenChatWithPrompt && (
                        <button
                          id="btn-ai-insight-ask-chat"
                          onClick={() => onOpenChatWithPrompt(currentInsight.suggestedPrompt)}
                          className="w-full py-2 px-3 rounded-lg bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] hover:border-[#3f3f46] text-[#a1a1aa] hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <MessageSquareText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>Discuss Insight with AI Analyst</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Sidebar Footer Navigation */}
              <div className="p-3 bg-[#18181b] border-t border-[#27272a] flex items-center justify-between shrink-0">
                <button
                  id="btn-ai-insight-prev"
                  onClick={handlePrev}
                  aria-label="Previous insight"
                  className="h-8 px-2.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-1 text-[11px] font-mono text-[#a1a1aa]">
                  <RotateCw className="w-3 h-3 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>{isAutoRotateActive ? 'Auto 12s' : 'Paused'}</span>
                </div>

                <button
                  id="btn-ai-insight-next"
                  onClick={handleNext}
                  aria-label="Next insight"
                  className="h-8 px-2.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sub-footer: Edge Tab visibility toggle and ESC hint */}
              <div className="px-3.5 py-1.5 bg-[#121215] border-t border-[#27272a]/60 flex items-center justify-between text-[10px] text-[#71717a] font-mono">
                <span>Press ESC or click backdrop to close</span>
                {isWidgetDismissed ? (
                  <button
                    type="button"
                    onClick={handleRestoreWidget}
                    className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Show Edge Tab</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDismissWidget}
                    title="Hide floating edge button so it never covers the screen"
                    className="text-[#71717a] hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    <span>Hide Edge Tab</span>
                  </button>
                )}
              </div>

            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
