import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  Layers,
  Sparkles,
  Download,
  Check,
  Maximize2,
  Filter,
  Sliders,
  DollarSign,
  Percent,
} from 'lucide-react';
import { FinancialDataset, FinancialRatios, CurrencyCode, VisualizationChartType } from '../types';
import { CrossReferenceTooltip } from './CrossReferenceTooltip';
import { DashboardChartTooltip } from './DashboardChartTooltip';

interface DataVisualizationProps {
  dataset: FinancialDataset;
  ratios: FinancialRatios;
  currency: CurrencyCode;
}

interface MetricOption {
  key: string;
  name: string;
  category: 'Income Statement' | 'Balance Sheet' | 'Cash Flow' | 'Key Margins';
  color: string;
  unit: '$' | '%' | 'x';
  statement: 'incomeStatement' | 'balanceSheet' | 'cashFlowStatement' | 'ratio';
}

const AVAILABLE_METRICS: MetricOption[] = [
  { key: 'revenue', name: 'Gross Revenue', category: 'Income Statement', color: '#6366f1', unit: '$', statement: 'incomeStatement' },
  { key: 'cogs', name: 'Cost of Goods Sold (COGS)', category: 'Income Statement', color: '#f43f5e', unit: '$', statement: 'incomeStatement' },
  { key: 'grossProfit', name: 'Gross Profit', category: 'Income Statement', color: '#10b981', unit: '$', statement: 'incomeStatement' },
  { key: 'rdExpenses', name: 'Research & Development (R&D)', category: 'Income Statement', color: '#38bdf8', unit: '$', statement: 'incomeStatement' },
  { key: 'sgaExpenses', name: 'SG&A Expenses', category: 'Income Statement', color: '#fbbf24', unit: '$', statement: 'incomeStatement' },
  { key: 'operatingIncome', name: 'Operating Income (EBIT)', category: 'Income Statement', color: '#a855f7', unit: '$', statement: 'incomeStatement' },
  { key: 'netIncome', name: 'Net Income (GAAP)', category: 'Income Statement', color: '#22c55e', unit: '$', statement: 'incomeStatement' },
  
  { key: 'cashAndEquivalents', name: 'Cash & Equivalents', category: 'Balance Sheet', color: '#06b6d4', unit: '$', statement: 'balanceSheet' },
  { key: 'accountsReceivable', name: 'Accounts Receivable', category: 'Balance Sheet', color: '#f97316', unit: '$', statement: 'balanceSheet' },
  { key: 'totalCurrentAssets', name: 'Current Assets', category: 'Balance Sheet', color: '#818cf8', unit: '$', statement: 'balanceSheet' },
  { key: 'totalAssets', name: 'Total Assets', category: 'Balance Sheet', color: '#3b82f6', unit: '$', statement: 'balanceSheet' },
  { key: 'longTermDebt', name: 'Long-Term Debt', category: 'Balance Sheet', color: '#e11d48', unit: '$', statement: 'balanceSheet' },
  { key: 'stockholdersEquity', name: 'Stockholders Equity', category: 'Balance Sheet', color: '#14b8a6', unit: '$', statement: 'balanceSheet' },

  { key: 'operatingCashFlow', name: 'Operating Cash Flow', category: 'Cash Flow', color: '#10b981', unit: '$', statement: 'cashFlowStatement' },
  { key: 'freeCashFlow', name: 'Free Cash Flow', category: 'Cash Flow', color: '#34d399', unit: '$', statement: 'cashFlowStatement' },
  { key: 'capitalExpenditures', name: 'Capital Expenditures (CapEx)', category: 'Cash Flow', color: '#f43f5e', unit: '$', statement: 'cashFlowStatement' },

  { key: 'grossProfitMargin', name: 'Gross Margin %', category: 'Key Margins', color: '#10b981', unit: '%', statement: 'ratio' },
  { key: 'operatingMargin', name: 'Operating Margin %', category: 'Key Margins', color: '#818cf8', unit: '%', statement: 'ratio' },
  { key: 'netProfitMargin', name: 'Net Margin %', category: 'Key Margins', color: '#38bdf8', unit: '%', statement: 'ratio' },
];

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#38bdf8', '#8b5cf6', '#14b8a6', '#f43f5e'];

export const DataVisualization: React.FC<DataVisualizationProps> = ({ dataset, ratios, currency }) => {
  // Chart controls state
  const [chartType, setChartType] = useState<VisualizationChartType>('line');
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(dataset.periods);
  const [selectedMetricKeys, setSelectedMetricKeys] = useState<string[]>(['revenue', 'grossProfit', 'operatingIncome', 'netIncome']);
  const [isCommonSize, setIsCommonSize] = useState<boolean>(false);
  const [selectedPiePeriod, setSelectedPiePeriod] = useState<string>(dataset.activePeriod);
  const [pieBreakdownType, setPieBreakdownType] = useState<'expenses' | 'assets' | 'margins'>('expenses');

  // Synchronize periods and active period selection when dataset changes
  useEffect(() => {
    setSelectedPeriods(dataset.periods);
    setSelectedPiePeriod(dataset.activePeriod);
  }, [dataset.id, dataset.periods, dataset.activePeriod]);

  // Composite key that triggers entry/exit animation when switching periods, datasets, or visual configurations
  const chartAnimationKey = useMemo(() => {
    if (chartType === 'pie') {
      return `pie-${dataset.id}-${selectedPiePeriod}-${pieBreakdownType}`;
    }
    return `${chartType}-${dataset.id}-${selectedPeriods.slice().sort().join(',')}-${selectedMetricKeys.slice().sort().join(',')}-${isCommonSize}`;
  }, [chartType, dataset.id, selectedPiePeriod, pieBreakdownType, selectedPeriods, selectedMetricKeys, isCommonSize]);

  // Toggle period in selector
  const togglePeriod = (p: string) => {
    if (selectedPeriods.includes(p)) {
      if (selectedPeriods.length > 1) {
        setSelectedPeriods(selectedPeriods.filter((item) => item !== p));
      }
    } else {
      setSelectedPeriods([...selectedPeriods, p]);
    }
  };

  // Toggle metric in multi-selector
  const toggleMetric = (key: string) => {
    if (selectedMetricKeys.includes(key)) {
      if (selectedMetricKeys.length > 1) {
        setSelectedMetricKeys(selectedMetricKeys.filter((k) => k !== key));
      }
    } else {
      if (selectedMetricKeys.length < 6) {
        setSelectedMetricKeys([...selectedMetricKeys, key]);
      }
    }
  };

  // Build time-series multi-period data structure
  const chartData = useMemo(() => {
    return selectedPeriods.map((period) => {
      const point: Record<string, any> = { period };

      const getVal = (statementName: string, key: string): number => {
        if (statementName === 'incomeStatement') {
          const item = dataset.incomeStatement.find((i) => i.key.toLowerCase() === key.toLowerCase());
          return item?.values[period] ?? 0;
        } else if (statementName === 'balanceSheet') {
          const item = dataset.balanceSheet.find((i) => i.key.toLowerCase() === key.toLowerCase());
          return item?.values[period] ?? 0;
        } else if (statementName === 'cashFlowStatement') {
          const item = dataset.cashFlowStatement.find((i) => i.key.toLowerCase() === key.toLowerCase());
          return item?.values[period] ?? 0;
        } else if (statementName === 'ratio') {
          const rev = dataset.incomeStatement.find((i) => i.key === 'revenue')?.values[period] || 1;
          if (key === 'grossProfitMargin') {
            const gp = dataset.incomeStatement.find((i) => i.key === 'grossProfit')?.values[period] || 0;
            return Number(((gp / rev) * 100).toFixed(1));
          }
          if (key === 'operatingMargin') {
            const op = dataset.incomeStatement.find((i) => i.key === 'operatingIncome')?.values[period] || 0;
            return Number(((op / rev) * 100).toFixed(1));
          }
          if (key === 'netProfitMargin') {
            const ni = dataset.incomeStatement.find((i) => i.key === 'netIncome')?.values[period] || 0;
            return Number(((ni / rev) * 100).toFixed(1));
          }
        }
        return 0;
      };

      const periodRevenue = getVal('incomeStatement', 'revenue') || 1;

      selectedMetricKeys.forEach((key) => {
        const metric = AVAILABLE_METRICS.find((m) => m.key === key);
        if (metric) {
          const rawVal = getVal(metric.statement, metric.key);
          if (isCommonSize && metric.unit === '$') {
            point[key] = Number(((rawVal / periodRevenue) * 100).toFixed(1));
          } else {
            point[key] = rawVal;
          }
        }
      });

      return point;
    });
  }, [dataset, selectedPeriods, selectedMetricKeys, isCommonSize]);

  // Build Pie / Donut Breakdown data
  const pieData = useMemo(() => {
    const period = selectedPiePeriod;
    const getVal = (items: typeof dataset.incomeStatement, key: string): number => {
      const item = items.find((i) => i.key.toLowerCase() === key.toLowerCase());
      return Math.abs(item?.values[period] ?? 0);
    };

    if (pieBreakdownType === 'expenses') {
      const cogs = getVal(dataset.incomeStatement, 'cogs');
      const rd = getVal(dataset.incomeStatement, 'rdExpenses');
      const sga = getVal(dataset.incomeStatement, 'sgaExpenses');
      const ga = getVal(dataset.incomeStatement, 'gaExpenses');
      const interest = getVal(dataset.incomeStatement, 'interestExpense');
      const tax = getVal(dataset.incomeStatement, 'incomeTax');

      return [
        { name: 'Cost of Goods Sold (COGS)', value: cogs },
        { name: 'R&D Engineering', value: rd },
        { name: 'Sales & Marketing', value: sga },
        { name: 'General & Admin', value: ga },
        { name: 'Interest Expense', value: interest },
        { name: 'Income Taxes', value: tax },
      ].filter((item) => item.value > 0);
    } else if (pieBreakdownType === 'assets') {
      const cash = getVal(dataset.balanceSheet, 'cashAndEquivalents');
      const ar = getVal(dataset.balanceSheet, 'accountsReceivable');
      const prepaid = getVal(dataset.balanceSheet, 'prepaidExpenses');
      const ppe = getVal(dataset.balanceSheet, 'propertyPlantEquipment');
      const goodwill = getVal(dataset.balanceSheet, 'goodwillIntangibles');

      return [
        { name: 'Cash & Short-Term Deposits', value: cash },
        { name: 'Accounts Receivable', value: ar },
        { name: 'Prepaid & Other Current', value: prepaid },
        { name: 'PP&E (Fixed Assets)', value: ppe },
        { name: 'Intangibles & Goodwill', value: goodwill },
      ].filter((item) => item.value > 0);
    } else {
      const gp = getVal(dataset.incomeStatement, 'grossProfit');
      const opex = getVal(dataset.incomeStatement, 'rdExpenses') + getVal(dataset.incomeStatement, 'sgaExpenses');
      const net = getVal(dataset.incomeStatement, 'netIncome');

      return [
        { name: 'Gross Profit Retained', value: gp },
        { name: 'Operating Overhead (OpEx)', value: opex },
        { name: 'Net Bottom Line Profit', value: net },
      ].filter((item) => item.value > 0);
    }
  }, [dataset, selectedPiePeriod, pieBreakdownType]);

  // Preset configuration helpers
  const applyPreset = (preset: 'growth' | 'costs' | 'cash' | 'margins') => {
    if (preset === 'growth') {
      setChartType('line');
      setSelectedMetricKeys(['revenue', 'grossProfit', 'operatingIncome', 'netIncome']);
      setIsCommonSize(false);
    } else if (preset === 'costs') {
      setChartType('stacked_bar');
      setSelectedMetricKeys(['cogs', 'rdExpenses', 'sgaExpenses']);
      setIsCommonSize(false);
    } else if (preset === 'cash') {
      setChartType('area');
      setSelectedMetricKeys(['operatingCashFlow', 'freeCashFlow', 'capitalExpenditures']);
      setIsCommonSize(false);
    } else if (preset === 'margins') {
      setChartType('composed');
      setSelectedMetricKeys(['revenue', 'grossProfitMargin', 'operatingMargin', 'netProfitMargin']);
      setIsCommonSize(false);
    }
  };

  const formatCurrencyValue = (val: number) => {
    if (isCommonSize) return `${val.toFixed(1)}%`;
    if (Math.abs(val) >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (Math.abs(val) >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  const activeSelectedMetrics = AVAILABLE_METRICS.filter((m) => selectedMetricKeys.includes(m.key));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header & Studio Controls Bar */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 shadow-lg flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BarChart2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                Interactive Financial Data Visualization Studio
                <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-500/30">
                  Real-Time Multi-Axis
                </span>
              </h2>
              <p className="text-xs text-[#71717a]">
                Generate customizable visual representations across historical periods, cost categories, and balance sheet dynamics.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#71717a] font-medium mr-1">Presets:</span>
          <button
            onClick={() => applyPreset('growth')}
            className="px-2.5 py-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-xs font-medium text-[#fafafa] border border-[#3f3f46] transition-colors cursor-pointer"
          >
            Growth Trajectory
          </button>
          <button
            onClick={() => applyPreset('costs')}
            className="px-2.5 py-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-xs font-medium text-[#fafafa] border border-[#3f3f46] transition-colors cursor-pointer"
          >
            OpEx Stack
          </button>
          <button
            onClick={() => applyPreset('cash')}
            className="px-2.5 py-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-xs font-medium text-[#fafafa] border border-[#3f3f46] transition-colors cursor-pointer"
          >
            Cash Flow Dynamics
          </button>
          <button
            onClick={() => applyPreset('margins')}
            className="px-2.5 py-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-xs font-medium text-[#fafafa] border border-[#3f3f46] transition-colors cursor-pointer"
          >
            Margin Waterfall
          </button>
        </div>
      </div>

      {/* 2. Interactive Chart Mode & Period Selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Visual Selectors & Metric Filters */}
        <div className="lg:col-span-1 space-y-5">
          
          {/* Chart Type Selector */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 space-y-3">
            <label className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider block">
              Chart Topology
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setChartType('line')}
                className={`p-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  chartType === 'line'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                    : 'bg-[#09090b] text-[#a1a1aa] border border-[#27272a] hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Line</span>
              </button>

              <button
                onClick={() => setChartType('bar')}
                className={`p-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  chartType === 'bar'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                    : 'bg-[#09090b] text-[#a1a1aa] border border-[#27272a] hover:text-white'
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                <span>Bar</span>
              </button>

              <button
                onClick={() => setChartType('stacked_bar')}
                className={`p-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  chartType === 'stacked_bar'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                    : 'bg-[#09090b] text-[#a1a1aa] border border-[#27272a] hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Stacked</span>
              </button>

              <button
                onClick={() => setChartType('area')}
                className={`p-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  chartType === 'area'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                    : 'bg-[#09090b] text-[#a1a1aa] border border-[#27272a] hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Area</span>
              </button>

              <button
                onClick={() => setChartType('pie')}
                className={`p-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  chartType === 'pie'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                    : 'bg-[#09090b] text-[#a1a1aa] border border-[#27272a] hover:text-white'
                }`}
              >
                <PieIcon className="w-4 h-4" />
                <span>Pie / Donut</span>
              </button>

              <button
                onClick={() => setChartType('composed')}
                className={`p-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  chartType === 'composed'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                    : 'bg-[#09090b] text-[#a1a1aa] border border-[#27272a] hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Dual-Axis</span>
              </button>
            </div>
          </div>

          {/* Time Period Filter */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
                Time Periods
              </label>
              <button
                onClick={() => setSelectedPeriods(dataset.periods)}
                className="text-[11px] text-indigo-400 hover:underline cursor-pointer"
              >
                Select All
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {dataset.periods.map((period) => {
                const isSelected = selectedPeriods.includes(period);
                return (
                  <motion.button
                    key={period}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => togglePeriod(period)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-[#09090b] text-[#71717a] border border-[#27272a] hover:text-[#fafafa]'
                    }`}
                  >
                    {period}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Scale & Percentage Toggle */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 space-y-2">
            <label className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider block">
              Vertical Metric Scale
            </label>
            <div className="flex items-center gap-2 bg-[#09090b] p-1 rounded-xl border border-[#27272a]">
              <button
                onClick={() => setIsCommonSize(false)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  !isCommonSize ? 'bg-[#27272a] text-white' : 'text-[#71717a] hover:text-[#fafafa]'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Nominal Value</span>
              </button>
              <button
                onClick={() => setIsCommonSize(true)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isCommonSize ? 'bg-[#27272a] text-white' : 'text-[#71717a] hover:text-[#fafafa]'
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Common Size %</span>
              </button>
            </div>
          </div>

          {/* Metric Selector Accordion */}
          {chartType !== 'pie' && (
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
                  Active Metrics ({selectedMetricKeys.length}/6)
                </label>
                <span className="text-[10px] text-[#71717a] font-mono">Max 6</span>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {AVAILABLE_METRICS.map((metric) => {
                  const isChecked = selectedMetricKeys.includes(metric.key);
                  return (
                    <button
                      key={metric.key}
                      onClick={() => toggleMetric(metric.key)}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-all border cursor-pointer ${
                        isChecked
                          ? 'bg-[#27272a] border-indigo-500/40 text-white'
                          : 'bg-[#09090b] border-[#27272a] text-[#a1a1aa] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: metric.color }}
                        />
                        <span className="truncate">{metric.name}</span>
                      </div>
                      {isChecked && <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pie Chart Specific Controls */}
          {chartType === 'pie' && (
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 space-y-3">
              <label className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider block">
                Pie Slice Dimension
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'expenses', label: 'Operating & Cost Breakdown' },
                  { id: 'assets', label: 'Asset Structure Composition' },
                  { id: 'margins', label: 'Margin & Profitability Stack' },
                ].map((dim) => (
                  <button
                    key={dim.id}
                    onClick={() => setPieBreakdownType(dim.id as any)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all border cursor-pointer ${
                      pieBreakdownType === dim.id
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                        : 'bg-[#09090b] text-[#a1a1aa] border-[#27272a] hover:text-white'
                    }`}
                  >
                    {dim.label}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="text-[11px] text-[#71717a] block mb-1">Target Period:</label>
                <select
                  value={selectedPiePeriod}
                  onChange={(e) => setSelectedPiePeriod(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                >
                  {dataset.periods.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Main Chart Canvas Surface */}
        <div className="lg:col-span-3 bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          
          {/* Chart Header Meta */}
          <div className="flex items-center justify-between pb-4 border-b border-[#27272a] min-h-[58px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`header-${dataset.id}-${chartType}-${chartType === 'pie' ? selectedPiePeriod : selectedPeriods.slice().sort().join('-')}`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <h3 className="text-sm font-semibold text-white">
                  {chartType === 'pie'
                    ? `${dataset.companyName} — ${pieBreakdownType === 'expenses' ? 'Expense & Cost Distribution' : pieBreakdownType === 'assets' ? 'Asset Balance Sheet Allocation' : 'Margin Stack'} (${selectedPiePeriod})`
                    : `${dataset.companyName} — Financial Performance Trends (${selectedPeriods.join(' • ')})`}
                </h3>
                <p className="text-xs text-[#71717a] font-mono mt-0.5">
                  {isCommonSize ? 'Values normalized as percentage of Gross Revenue (%)' : `Base reporting currency: ${dataset.reportingCurrency} (${currency})`}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-500/30">
                <Layers className="w-3.5 h-3.5" />
                Cross-Reference Telemetry Hover Active
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={`badge-${dataset.id}-${chartType === 'pie' ? selectedPiePeriod : selectedPeriods.slice().sort().join('-')}`}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.15 }}
                  className="text-xs px-2.5 py-1 rounded-md bg-[#27272a] text-[#fafafa] font-mono border border-[#3f3f46]"
                >
                  {chartType === 'pie' ? selectedPiePeriod : `${selectedPeriods.length} Periods Plotted`}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Chart Render Container with Aspect-Ratio Preservation and Boundary Scaling */}
          <div className="w-full dashboard-visual-container visual-containment aspect-chart-responsive my-4 relative [min-height:0] overflow-hidden" style={{ minHeight: 0 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={chartAnimationKey}
                initial={{ opacity: 0, scale: 0.985, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.985, y: -8 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full"
                style={{ width: '100%', height: '100%' }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'line' ? (
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="period" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} />
                      <YAxis stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} tickFormatter={formatCurrencyValue} />
                      <Tooltip
                        content={
                          <CrossReferenceTooltip
                            dataset={dataset}
                            ratios={ratios}
                            currency={currency}
                            availableMetrics={AVAILABLE_METRICS}
                            formatCurrencyValue={formatCurrencyValue}
                          />
                        }
                      />
                      <Legend wrapperStyle={{ paddingTop: '15px' }} />
                      {activeSelectedMetrics.map((metric) => (
                        <Line
                          key={metric.key}
                          type="monotone"
                          dataKey={metric.key}
                          name={metric.name}
                          stroke={metric.color}
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: metric.color }}
                          activeDot={{ r: 7 }}
                        />
                      ))}
                    </LineChart>
                  ) : chartType === 'bar' ? (
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="period" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} />
                      <YAxis stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} tickFormatter={formatCurrencyValue} />
                      <Tooltip
                        content={
                          <CrossReferenceTooltip
                            dataset={dataset}
                            ratios={ratios}
                            currency={currency}
                            availableMetrics={AVAILABLE_METRICS}
                            formatCurrencyValue={formatCurrencyValue}
                          />
                        }
                      />
                      <Legend wrapperStyle={{ paddingTop: '15px' }} />
                      {activeSelectedMetrics.map((metric) => (
                        <Bar key={metric.key} dataKey={metric.key} name={metric.name} fill={metric.color} radius={[4, 4, 0, 0]} />
                      ))}
                    </BarChart>
                  ) : chartType === 'stacked_bar' ? (
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="period" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} />
                      <YAxis stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} tickFormatter={formatCurrencyValue} />
                      <Tooltip
                        content={
                          <CrossReferenceTooltip
                            dataset={dataset}
                            ratios={ratios}
                            currency={currency}
                            availableMetrics={AVAILABLE_METRICS}
                            formatCurrencyValue={formatCurrencyValue}
                          />
                        }
                      />
                      <Legend wrapperStyle={{ paddingTop: '15px' }} />
                      {activeSelectedMetrics.map((metric) => (
                        <Bar key={metric.key} dataKey={metric.key} name={metric.name} stackId="a" fill={metric.color} />
                      ))}
                    </BarChart>
                  ) : chartType === 'area' ? (
                    <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                      <defs>
                        {activeSelectedMetrics.map((metric) => (
                          <linearGradient key={`grad-${metric.key}`} id={`grad-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={metric.color} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={metric.color} stopOpacity={0.0} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="period" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} />
                      <YAxis stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} tickFormatter={formatCurrencyValue} />
                      <Tooltip
                        content={
                          <CrossReferenceTooltip
                            dataset={dataset}
                            ratios={ratios}
                            currency={currency}
                            availableMetrics={AVAILABLE_METRICS}
                            formatCurrencyValue={formatCurrencyValue}
                          />
                        }
                      />
                      <Legend wrapperStyle={{ paddingTop: '15px' }} />
                      {activeSelectedMetrics.map((metric) => (
                        <Area
                          key={metric.key}
                          type="monotone"
                          dataKey={metric.key}
                          name={metric.name}
                          stroke={metric.color}
                          fillOpacity={1}
                          fill={`url(#grad-${metric.key})`}
                        />
                      ))}
                    </AreaChart>
                  ) : chartType === 'composed' ? (
                    <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="period" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} />
                      <YAxis yAxisId="left" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} tickFormatter={formatCurrencyValue} />
                      <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fill: '#10b981', fontSize: 12 }} unit="%" />
                      <Tooltip
                        content={
                          <CrossReferenceTooltip
                            dataset={dataset}
                            ratios={ratios}
                            currency={currency}
                            availableMetrics={AVAILABLE_METRICS}
                            formatCurrencyValue={formatCurrencyValue}
                          />
                        }
                      />
                      <Legend wrapperStyle={{ paddingTop: '15px' }} />
                      <Bar yAxisId="left" dataKey="revenue" name="Gross Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="grossProfitMargin" name="Gross Margin %" stroke="#10b981" strokeWidth={3} />
                      <Line yAxisId="right" type="monotone" dataKey="operatingMargin" name="Operating Margin %" stroke="#818cf8" strokeWidth={2.5} />
                      <Line yAxisId="right" type="monotone" dataKey="netProfitMargin" name="Net Margin %" stroke="#38bdf8" strokeWidth={2} />
                    </ComposedChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={75}
                        outerRadius={135}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent }: any) => `${name.split(' ')[0]} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        allowEscapeViewBox={{ x: true, y: true }}
                        wrapperStyle={{ zIndex: 9999, pointerEvents: 'none' }}
                        content={
                          <DashboardChartTooltip
                            chartVariant="pie_breakdown"
                            dataset={dataset}
                            ratios={ratios}
                            currency={currency}
                          />
                        }
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px', zIndex: 1 }} />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Insights Footer */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`insights-${dataset.id}-${dataset.activePeriod}-${chartData.length}-${selectedPeriods.slice().sort().join('-')}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="pt-4 border-t border-[#27272a] grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs"
            >
              <div className="p-3 rounded-xl bg-[#09090b] border border-[#27272a]">
                <span className="text-[10px] text-[#71717a] font-sans block">3-Period Revenue CAGR</span>
                <span className="font-semibold text-white">
                  +{((Math.pow((chartData[chartData.length - 1]?.revenue || 1) / (chartData[0]?.revenue || 1), 1 / (chartData.length - 1 || 1)) - 1) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#09090b] border border-[#27272a]">
                <span className="text-[10px] text-[#71717a] font-sans block">Active Period FCF Conversion</span>
                <span className="font-semibold text-[#10b981]">
                  {ratios.fcfConversion.toFixed(1)}% of GAAP Net Income
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#09090b] border border-[#27272a]">
                <span className="text-[10px] text-[#71717a] font-sans block">Operating Margin Spread</span>
                <span className="font-semibold text-indigo-400">
                  {ratios.operatingMargin.toFixed(1)}% vs {ratios.grossProfitMargin.toFixed(1)}% GM
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
};
