import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ComposedChart,
} from 'recharts';
import {
  TrendingUp,
  Sliders,
  Sparkles,
  RefreshCw,
  Zap,
  ShieldAlert,
  DollarSign,
  Percent,
  Calendar,
  Layers,
  ArrowUpRight,
  Calculator,
  Flame,
} from 'lucide-react';
import {
  FinancialDataset,
  FinancialRatios,
  CurrencyCode,
  ForecastScenarioType,
  ScenarioParameters,
} from '../types';
import {
  generatePredictiveFinancialModel,
  DEFAULT_SCENARIOS,
} from '../utils/forecastingEngine';
import { WhatIfScenarioBuilder } from './WhatIfScenarioBuilder';

interface PredictiveForecastingProps {
  dataset: FinancialDataset;
  ratios: FinancialRatios;
  currency: CurrencyCode;
}

export const PredictiveForecasting: React.FC<PredictiveForecastingProps> = ({ dataset, ratios, currency }) => {
  // 1. Scenario State
  const [activeScenario, setActiveScenario] = useState<ForecastScenarioType>('BASE');
  const [customParams, setCustomParams] = useState<ScenarioParameters>(DEFAULT_SCENARIOS.BASE);
  const [selectedForecastMetric, setSelectedForecastMetric] = useState<'revenue' | 'netIncome' | 'freeCashFlow'>('revenue');
  const [showConfidenceBands, setShowConfidenceBands] = useState(true);

  // 2. Generate model
  const forecastResult = useMemo(() => {
    return generatePredictiveFinancialModel(dataset, activeScenario, activeScenario === 'CUSTOM' ? customParams : undefined);
  }, [dataset, activeScenario, customParams]);

  // Handle Scenario Switch
  const handleSelectScenario = (scen: ForecastScenarioType) => {
    setActiveScenario(scen);
    if (scen !== 'CUSTOM') {
      setCustomParams(DEFAULT_SCENARIOS[scen]);
    }
  };

  const handleParamChange = (field: keyof ScenarioParameters, val: number) => {
    setActiveScenario('CUSTOM');
    setCustomParams((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const formatCurrency = (val: number) => {
    if (Math.abs(val) >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (Math.abs(val) >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  // Prepare fan chart data
  const fanChartData = forecastResult.points.map((p) => {
    return {
      period: p.period,
      isHistorical: p.isHistorical,
      revenue: p.revenue,
      revenueLower80: showConfidenceBands ? p.revenueLower80 : p.revenue,
      revenueUpper80: showConfidenceBands ? p.revenueUpper80 : p.revenue,
      revenueLower95: showConfidenceBands ? p.revenueLower95 : p.revenue,
      revenueUpper95: showConfidenceBands ? p.revenueUpper95 : p.revenue,
      netIncome: p.netIncome,
      netIncomeLower80: showConfidenceBands ? p.netIncomeLower80 : p.netIncome,
      netIncomeUpper80: showConfidenceBands ? p.netIncomeUpper80 : p.netIncome,
      freeCashFlow: p.freeCashFlow,
      fcfLower80: showConfidenceBands ? p.fcfLower80 : p.freeCashFlow,
      fcfUpper80: showConfidenceBands ? p.fcfUpper80 : p.freeCashFlow,
      grossMarginPct: p.grossMarginPct,
      operatingMarginPct: p.operatingMarginPct,
      netMarginPct: p.netMarginPct,
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header & Scenario Selector */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 shadow-lg flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <TrendingUp className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                Predictive Financial Modeling & Forward Forecasting
                <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-500/30">
                  4-Year Horizon + Monte Carlo
                </span>
              </h2>
              <p className="text-xs text-[#71717a]">
                Project revenue, operating income, and free cash flows incorporating macroeconomic shocks, inflation, and confidence intervals.
              </p>
            </div>
          </div>
        </div>

        {/* Scenario Toggle Buttons */}
        <div className="flex items-center gap-1.5 bg-[#09090b] p-1 rounded-xl border border-[#27272a]">
          <button
            onClick={() => handleSelectScenario('BULL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeScenario === 'BULL'
                ? 'bg-emerald-600/30 text-[#10b981] border border-emerald-500/40 font-semibold'
                : 'text-[#71717a] hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Bull Case (+28%)</span>
          </button>

          <button
            onClick={() => handleSelectScenario('BASE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeScenario === 'BASE'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold'
                : 'text-[#71717a] hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Base Case (Consensus)</span>
          </button>

          <button
            onClick={() => handleSelectScenario('BEAR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeScenario === 'BEAR'
                ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40 font-semibold'
                : 'text-[#71717a] hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Bear Shock (+4%)</span>
          </button>

          <button
            onClick={() => handleSelectScenario('CUSTOM')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeScenario === 'CUSTOM'
                ? 'bg-[#27272a] text-white border border-[#3f3f46] font-semibold'
                : 'text-[#71717a] hover:text-white'
            }`}
          >
            Custom Parameters
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 rounded-2xl bg-[#18181b] border border-[#27272a] space-y-1">
          <span className="text-[11px] text-[#71717a] font-sans block">3-Yr Projected Revenue CAGR</span>
          <div className="text-2xl font-bold text-indigo-400">
            +{forecastResult.cagrSummary.projected3YrCagr}%
          </div>
          <span className="text-[10px] text-[#71717a] block">
            vs +{forecastResult.cagrSummary.historical3YrCagr}% Historical CAGR
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#18181b] border border-[#27272a] space-y-1">
          <span className="text-[11px] text-[#71717a] font-sans block">Projected FY2028 Revenue</span>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(forecastResult.points[forecastResult.points.length - 1].revenue)}
          </div>
          <span className="text-[10px] text-[#10b981] block">
            Confidence Range: {formatCurrency(forecastResult.points[forecastResult.points.length - 1].revenueLower80)} - {formatCurrency(forecastResult.points[forecastResult.points.length - 1].revenueUpper80)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#18181b] border border-[#27272a] space-y-1">
          <span className="text-[11px] text-[#71717a] font-sans block">Monte Carlo Profit Probability</span>
          <div className="text-2xl font-bold text-[#10b981]">
            {forecastResult.monteCarlo.probabilityOfProfitability}%
          </div>
          <span className="text-[10px] text-[#71717a] block">
            1,000 Iteration Stochastic Paths
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#18181b] border border-[#27272a] space-y-1">
          <span className="text-[11px] text-[#71717a] font-sans block">Value-at-Risk (95% VaR)</span>
          <div className="text-2xl font-bold text-rose-400">
            {formatCurrency(forecastResult.monteCarlo.valueAtRisk95Pct)}
          </div>
          <span className="text-[10px] text-[#71717a] block">
            Maximum downside tail risk
          </span>
        </div>
      </div>

      {/* 3. Main Fan Chart & Scenario Parameter Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Parameter Sliders Column */}
        <div className="lg:col-span-1 bg-[#18181b] border border-[#27272a] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#27272a]">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Scenario Drivers
            </h3>
            <span className="text-[10px] text-[#71717a] font-mono">{activeScenario}</span>
          </div>

          <div className="space-y-4 text-xs">
            
            {/* Revenue CAGR Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-mono">
                <span className="text-[#a1a1aa] font-sans">Revenue CAGR:</span>
                <span className="text-indigo-400 font-semibold">{customParams.revenueCagrPct > 0 ? '+' : ''}{customParams.revenueCagrPct}%</span>
              </div>
              <input
                type="range"
                min="-10"
                max="45"
                step="0.5"
                value={customParams.revenueCagrPct}
                onChange={(e) => handleParamChange('revenueCagrPct', parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* COGS & Hosting Cost Inflation */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-mono">
                <span className="text-[#a1a1aa] font-sans">COGS Inflation:</span>
                <span className="text-amber-400 font-semibold">+{customParams.cogsInflationPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={customParams.cogsInflationPct}
                onChange={(e) => handleParamChange('cogsInflationPct', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* OpEx Headcount Growth */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-mono">
                <span className="text-[#a1a1aa] font-sans">OpEx / SG&A Growth:</span>
                <span className="text-white font-semibold">+{customParams.opexGrowthPct}%</span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                step="0.5"
                value={customParams.opexGrowthPct}
                onChange={(e) => handleParamChange('opexGrowthPct', parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* CapEx Intensity */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-mono">
                <span className="text-[#a1a1aa] font-sans">CapEx Intensity:</span>
                <span className="text-white font-semibold">{customParams.capexIntensityPct}% rev</span>
              </div>
              <input
                type="range"
                min="2"
                max="18"
                step="0.5"
                value={customParams.capexIntensityPct}
                onChange={(e) => handleParamChange('capexIntensityPct', parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Macro Benchmark Interest Rate */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-mono">
                <span className="text-[#a1a1aa] font-sans">Benchmark Interest:</span>
                <span className="text-white font-semibold">{customParams.macroInterestRatePct}%</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="9.0"
                step="0.25"
                value={customParams.macroInterestRatePct}
                onChange={(e) => handleParamChange('macroInterestRatePct', parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Confidence Band Toggle */}
            <div className="pt-2 border-t border-[#27272a]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showConfidenceBands}
                  onChange={(e) => setShowConfidenceBands(e.target.checked)}
                  className="rounded border-[#27272a] text-indigo-600 focus:ring-0"
                />
                <span className="text-xs text-[#a1a1aa]">Show 80% & 95% Confidence Fans</span>
              </label>
            </div>

          </div>
        </div>

        {/* Right Main Fan Chart Canvas */}
        <div className="lg:col-span-3 bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          
          <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Forward Financial Trajectory with Statistical Confidence Envelopes
              </h3>
              <p className="text-xs text-[#71717a] font-mono">
                {dataset.companyName} • Historical (FY22-FY24) vs Projections (FY25-FY28)
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-[#09090b] p-1 rounded-xl border border-[#27272a]">
              <button
                onClick={() => setSelectedForecastMetric('revenue')}
                className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                  selectedForecastMetric === 'revenue' ? 'bg-[#27272a] text-white font-semibold' : 'text-[#71717a]'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setSelectedForecastMetric('netIncome')}
                className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                  selectedForecastMetric === 'netIncome' ? 'bg-[#27272a] text-white font-semibold' : 'text-[#71717a]'
                }`}
              >
                Net Income
              </button>
              <button
                onClick={() => setSelectedForecastMetric('freeCashFlow')}
                className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                  selectedForecastMetric === 'freeCashFlow' ? 'bg-[#27272a] text-white font-semibold' : 'text-[#71717a]'
                }`}
              >
                Free Cash Flow
              </button>
            </div>
          </div>

          {/* Render Fan Chart */}
          <div className="w-full h-[400px] min-h-[400px] relative [min-height:0]" style={{ minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fanChartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                <defs>
                  <linearGradient id="fan95" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="fan80" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="period" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} />
                <YAxis stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} tickFormatter={formatCurrency} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fafafa' }}
                  formatter={(val: any, name: any) => [formatCurrency(Number(val)), name]}
                />
                <Legend wrapperStyle={{ paddingTop: '15px' }} />

                {/* 95% Confidence Band */}
                {showConfidenceBands && selectedForecastMetric === 'revenue' && (
                  <Area
                    type="monotone"
                    dataKey="revenueUpper95"
                    name="95% Upper Bound"
                    stroke="#4338ca"
                    strokeDasharray="4 4"
                    fill="url(#fan95)"
                  />
                )}

                {/* 80% Confidence Band */}
                {showConfidenceBands && selectedForecastMetric === 'revenue' && (
                  <Area
                    type="monotone"
                    dataKey="revenueUpper80"
                    name="80% Upper Bound"
                    stroke="#6366f1"
                    strokeDasharray="2 2"
                    fill="url(#fan80)"
                  />
                )}

                {/* Center Median Trajectory */}
                <Line
                  type="monotone"
                  dataKey={selectedForecastMetric}
                  name={`Projected ${selectedForecastMetric === 'revenue' ? 'Revenue' : selectedForecastMetric === 'netIncome' ? 'Net Income' : 'Free Cash Flow'}`}
                  stroke={selectedForecastMetric === 'revenue' ? '#6366f1' : selectedForecastMetric === 'netIncome' ? '#10b981' : '#38bdf8'}
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#6366f1' }}
                />

                {showConfidenceBands && selectedForecastMetric === 'revenue' && (
                  <Area
                    type="monotone"
                    dataKey="revenueLower80"
                    name="80% Lower Bound"
                    stroke="#6366f1"
                    strokeDasharray="2 2"
                    fill="transparent"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3.5 rounded-xl bg-[#09090b] border border-[#27272a] text-xs text-[#a1a1aa] leading-relaxed flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>
              {forecastResult.aiForecastSynthesis}
            </span>
          </div>

        </div>

      </div>

      {/* 4. Interactive 'What-If' Scenario Builder & Forward Cash Flow Simulator */}
      <WhatIfScenarioBuilder
        dataset={dataset}
        forecastResult={forecastResult}
        currency={currency}
      />

      {/* 5. Monte Carlo Distribution & Seasonality Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monte Carlo Histogram */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                Monte Carlo Stochastic Distribution (1,000 Paths)
              </h3>
              <p className="text-xs text-[#71717a]">
                Probability density of projected 3-year forward revenue outcomes.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-[#27272a] text-indigo-300 font-mono border border-[#3f3f46]">
              P10-P90 Spread: {formatCurrency(forecastResult.monteCarlo.percentile10)} - {formatCurrency(forecastResult.monteCarlo.percentile90)}
            </span>
          </div>

          <div className="w-full h-[400px] min-h-[400px] relative [min-height:0]" style={{ minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastResult.monteCarlo.distributionBins} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="binRange" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 10 }} />
                <YAxis stroke="#71717a" tick={{ fill: '#71717a', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fafafa' }}
                  formatter={(val: any) => [`${val} simulations`, 'Frequency']}
                />
                <Bar dataKey="frequency" name="Simulation Frequency" fill="#6366f1" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Seasonality Decomposition */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Seasonality & Cyclical Component Decomposition
            </h3>
            <p className="text-xs text-[#71717a]">
              Deconstruction of recurring quarterly budget cycles and enterprise contract rhythms.
            </p>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#09090b] border border-[#27272a] flex items-center justify-between">
              <span className="text-[#71717a] font-sans">Underlying Trend:</span>
              <span className="text-white font-semibold">{forecastResult.seasonalityDecomposition.trendComponent}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#09090b] border border-[#27272a] flex items-center justify-between">
              <span className="text-[#71717a] font-sans">Quarterly Amplitude:</span>
              <span className="text-indigo-400 font-semibold">{forecastResult.seasonalityDecomposition.cyclicalAmplitude}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#09090b] border border-[#27272a] flex items-center justify-between">
              <span className="text-[#71717a] font-sans">Peak Season Quarter:</span>
              <span className="text-[#10b981] font-semibold">{forecastResult.seasonalityDecomposition.peakQuarter}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-[#fafafa]">
            Holt-Winters exponential smoothing parameters updated dynamically with quarterly closing frequencies.
          </div>
        </div>

      </div>

    </div>
  );
};
