import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  Building2,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  Sparkles,
  Layers,
  Activity,
  Compass,
  Sliders,
  Eye,
  EyeOff,
  Filter,
  BarChart3,
  PieChart,
  RotateCcw,
  Check,
  HelpCircle,
} from 'lucide-react';
import { FinancialDataset, FinancialRatios, CurrencyCode, BenchmarkMetricDetail, BenchmarkSettings } from '../types';
import {
  INDUSTRY_PEER_GROUPS,
  getIndustryBenchmarkForDataset,
  saveBenchmarkSettings,
  resetBenchmarkSettings,
  EnhancedIndustryPeerGroup,
} from '../utils/benchmarkingData';
import { BenchmarkSettingsModal } from './BenchmarkSettingsModal';

interface IndustryBenchmarkingProps {
  dataset: FinancialDataset;
  ratios: FinancialRatios;
  currency: CurrencyCode;
}

const VISIBLE_METRICS_STORAGE_KEY = 'fininsight_benchmark_visible_metrics';

const ALL_METRIC_KEYS = [
  'grossProfitMargin',
  'revenueGrowthYoY',
  'operatingMargin',
  'fcfConversion',
  'currentRatio',
  'debtToEquity',
  'dso',
];

export const IndustryBenchmarking: React.FC<IndustryBenchmarkingProps> = ({ dataset, ratios, currency }) => {
  // Active peer group selection
  const [selectedGroupId, setSelectedGroupId] = useState<string>(INDUSTRY_PEER_GROUPS[0].id);

  // Settings version counter to trigger recalculations when localStorage updates
  const [settingsVersion, setSettingsVersion] = useState<number>(0);

  // Benchmark Settings modal visibility
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Chart view mode: Radar or Bar comparison
  const [chartViewMode, setChartViewMode] = useState<'radar' | 'bar'>('radar');

  // Table filter mode: All metrics vs only visible in chart
  const [tableFilterMode, setTableFilterMode] = useState<'all' | 'visible'>('all');

  // Metric Visibility state (persisted in localStorage)
  const [visibleMetricKeys, setVisibleMetricKeys] = useState<string[]>(() => {
    if (typeof window === 'undefined') return ALL_METRIC_KEYS;
    try {
      const raw = localStorage.getItem(VISIBLE_METRICS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter((k: string) => ALL_METRIC_KEYS.includes(k));
          if (valid.length > 0) return valid;
        }
      }
    } catch {
      // fallback
    }
    return ALL_METRIC_KEYS;
  });

  // Toggle single metric visibility
  const handleToggleMetricVisibility = (metricKey: string) => {
    setVisibleMetricKeys((prev) => {
      let next: string[];
      if (prev.includes(metricKey)) {
        if (prev.length <= 1) {
          return prev; // keep at least 1 metric visible
        }
        next = prev.filter((k) => k !== metricKey);
      } else {
        next = [...prev, metricKey];
      }
      try {
        localStorage.setItem(VISIBLE_METRICS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Handled
      }
      return next;
    });
  };

  // Set preset metric visibility
  const handleSetPreset = (keys: string[]) => {
    setVisibleMetricKeys(keys);
    try {
      localStorage.setItem(VISIBLE_METRICS_STORAGE_KEY, JSON.stringify(keys));
    } catch {
      // Handled
    }
  };

  // Compute Benchmark metrics based on active dataset, selected cohort, and dynamic peer settings
  const activePeerGroup: EnhancedIndustryPeerGroup = useMemo(() => {
    // depend on settingsVersion to force re-computation when settings are saved/reset
    void settingsVersion;
    return getIndustryBenchmarkForDataset(dataset, ratios, selectedGroupId);
  }, [dataset, ratios, selectedGroupId, settingsVersion]);

  // Filtered metrics for primary comparison chart based on visibleMetricKeys
  const visibleChartMetrics = useMemo(() => {
    return activePeerGroup.metrics.filter((m) => visibleMetricKeys.includes(m.key));
  }, [activePeerGroup.metrics, visibleMetricKeys]);

  // Radar Data for company vs industry median
  const radarData = useMemo(() => {
    return visibleChartMetrics.map((m) => ({
      metric: m.name.split('(')[0].trim(),
      key: m.key,
      'Analyzed Company': m.percentileRank,
      'Industry Median (50th)': 50,
      'Top Quartile (75th)': 75,
    }));
  }, [visibleChartMetrics]);

  // Bar Comparison Data (actual values vs median vs top quartile)
  const barComparisonData = useMemo(() => {
    return visibleChartMetrics.map((m) => ({
      name: m.name.split('(')[0].trim(),
      key: m.key,
      unit: m.unit,
      'Analyzed Company': m.companyValue,
      'Industry Median': m.industryMedian,
      'Top Quartile (75th)': m.topQuartile,
    }));
  }, [visibleChartMetrics]);

  // Metrics to display in table based on tableFilterMode
  const tableMetrics = useMemo(() => {
    if (tableFilterMode === 'visible') {
      return activePeerGroup.metrics.filter((m) => visibleMetricKeys.includes(m.key));
    }
    return activePeerGroup.metrics;
  }, [activePeerGroup.metrics, tableFilterMode, visibleMetricKeys]);

  // Counts
  const outperformingCount = activePeerGroup.metrics.filter((m) => m.status === 'Outperforming').length;
  const underperformingCount = activePeerGroup.metrics.filter(
    (m) => m.status === 'Underperforming' || m.status === 'Critical Lag'
  ).length;

  const currentAlgorithmLabel = useMemo(() => {
    const method = activePeerGroup.currentSettings?.weightingMethod;
    if (method === 'market_cap') return 'Market-Cap Proportional';
    if (method === 'equal') return 'Equal-Weighted (1/N)';
    return 'Custom Weight Sliders';
  }, [activePeerGroup.currentSettings]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Industry Peer Group Selector + Settings Modal Trigger */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 shadow-lg flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-semibold text-white tracking-tight">
                  Industry Peer Group & Ratio Benchmarking
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-500/30">
                  Quartile Distribution
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/30">
                  {activePeerGroup.sampleCompaniesCount} Peers Active
                </span>
              </div>
              <p className="text-xs text-[#71717a] mt-0.5">
                Compare {dataset.companyName}'s financial ratios and operational efficiency against 25th, 50th (Median), and 75th percentile industry benchmarks.
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Peer Group Dropdown & Benchmark Settings Modal Button */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-[#71717a] font-medium whitespace-nowrap">Cohort:</label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="bg-[#09090b] border border-[#27272a] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans cursor-pointer"
            >
              {INDUSTRY_PEER_GROUPS.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.sampleCompaniesCount} peers)
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20 border border-indigo-500/40 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
            title="Configure active industry peers and algorithm weightings"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-200" />
            Benchmark Settings
          </button>
        </div>
      </div>

      {/* 2. Top Cohort Metadata Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#18181b] border border-[#27272a] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#71717a] font-medium block">Benchmark Sample Size</span>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Edit Peers
            </button>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {activePeerGroup.sampleCompaniesCount} Companies
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#71717a] font-mono">
            <span>Median Cap: {activePeerGroup.medianMarketCap}</span>
            <span className="text-indigo-400/80 font-sans text-[10px]">{currentAlgorithmLabel}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#18181b] border border-[#27272a] space-y-1">
          <span className="text-xs text-[#71717a] font-medium block">Outperforming Metrics</span>
          <div className="text-2xl font-bold font-mono text-[#10b981]">
            {outperformingCount} / {activePeerGroup.metrics.length}
          </div>
          <span className="text-[11px] text-[#71717a] font-mono">
            Top Quartile or Higher (&gt;75th %ile)
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#18181b] border border-[#27272a] space-y-1">
          <span className="text-xs text-[#71717a] font-medium block">Underperforming Gaps</span>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {underperformingCount} Gaps
          </div>
          <span className="text-[11px] text-[#71717a] font-mono">
            Requires Operational Optimization
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#18181b] border border-[#27272a] space-y-1">
          <span className="text-xs text-[#71717a] font-medium block">Composite Percentile Standing</span>
          <div className="text-2xl font-bold font-mono text-indigo-400">
            {activePeerGroup.compositePercentile}th %ile
          </div>
          <span className="text-[11px] text-[#71717a] font-mono">
            Category Weighted &bull; Above Sector Median
          </span>
        </div>
      </div>

      {/* 3. Metric Focus & Visibility Toggle Control Bar */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Filter className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  Metric Focus & Chart Visibility
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#27272a] text-[#a1a1aa] border border-[#3f3f46]">
                  {visibleChartMetrics.length} of {activePeerGroup.metrics.length} metrics visible
                </span>
              </div>
              <p className="text-[11px] text-[#71717a]">
                Toggle individual benchmark metrics to focus the primary comparison chart on specific performance dimensions.
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-[#71717a] font-mono uppercase mr-1">Presets:</span>
            <button
              type="button"
              onClick={() => handleSetPreset(ALL_METRIC_KEYS)}
              className={`px-2.5 py-1 text-[11px] rounded-lg border font-medium transition-colors ${
                visibleChartMetrics.length === activePeerGroup.metrics.length
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                  : 'bg-[#09090b] border-[#27272a] text-[#a1a1aa] hover:text-white'
              }`}
            >
              All ({ALL_METRIC_KEYS.length})
            </button>
            <button
              type="button"
              onClick={() => handleSetPreset(['grossProfitMargin', 'operatingMargin'])}
              className="px-2.5 py-1 text-[11px] rounded-lg border border-[#27272a] bg-[#09090b] text-[#a1a1aa] hover:text-white font-medium transition-colors"
            >
              Profitability
            </button>
            <button
              type="button"
              onClick={() => handleSetPreset(['revenueGrowthYoY', 'fcfConversion'])}
              className="px-2.5 py-1 text-[11px] rounded-lg border border-[#27272a] bg-[#09090b] text-[#a1a1aa] hover:text-white font-medium transition-colors"
            >
              Growth & FCF
            </button>
            <button
              type="button"
              onClick={() => handleSetPreset(['currentRatio', 'debtToEquity', 'dso'])}
              className="px-2.5 py-1 text-[11px] rounded-lg border border-[#27272a] bg-[#09090b] text-[#a1a1aa] hover:text-white font-medium transition-colors"
            >
              Solvency & Working Capital
            </button>
            {visibleChartMetrics.length < activePeerGroup.metrics.length && (
              <button
                type="button"
                onClick={() => handleSetPreset(ALL_METRIC_KEYS)}
                className="flex items-center gap-1 px-2 py-1 text-[11px] text-[#a1a1aa] hover:text-white font-medium"
                title="Reset to all metrics visible"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Metric Toggle Chips Strip */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-[#27272a]/60">
          {activePeerGroup.metrics.map((metric) => {
            const isVisible = visibleMetricKeys.includes(metric.key);
            return (
              <button
                key={metric.key}
                type="button"
                onClick={() => handleToggleMetricVisibility(metric.key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                  isVisible
                    ? 'bg-[#27272a] border-indigo-500/40 text-white shadow-sm ring-1 ring-indigo-500/20'
                    : 'bg-[#121214] border-[#27272a] text-[#71717a] hover:text-[#a1a1aa] opacity-60'
                }`}
                title={isVisible ? `Click to hide ${metric.name} from comparison chart` : `Click to show ${metric.name} on comparison chart`}
              >
                {isVisible ? (
                  <Eye className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                )}
                <span className="font-medium">{metric.name.split('(')[0].trim()}</span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                    metric.status === 'Outperforming'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : metric.status === 'In-Line'
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {metric.companyValue}{metric.unit}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Primary Comparison Chart: Radar or Multi-Metric Bar & Sector Strategic Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Primary Comparison Chart Container */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                Primary Comparison Chart
                <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-[#27272a] text-indigo-300">
                  {visibleChartMetrics.length} Active {visibleChartMetrics.length === 1 ? 'Metric' : 'Metrics'}
                </span>
              </h3>
              <p className="text-xs text-[#71717a]">
                {chartViewMode === 'radar'
                  ? 'Relative percentile rank spider chart against industry quartiles.'
                  : 'Absolute financial values comparing Analyzed Company against Median and Top Quartile.'}
              </p>
            </div>

            {/* View Switcher: Radar vs Bar */}
            <div className="flex items-center gap-1 bg-[#09090b] p-1 rounded-xl border border-[#27272a] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setChartViewMode('radar')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
                  chartViewMode === 'radar'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-[#71717a] hover:text-white'
                }`}
                title="Percentile Spider Radar View"
              >
                <PieChart className="w-3.5 h-3.5" />
                Radar
              </button>
              <button
                type="button"
                onClick={() => setChartViewMode('bar')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
                  chartViewMode === 'bar'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-[#71717a] hover:text-white'
                }`}
                title="Direct Bar Value Comparison View"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Bar Chart
              </button>
            </div>
          </div>

          {/* Chart Rendering Canvas */}
          <div className="w-full h-[400px] min-h-[400px] relative [min-height:0]" style={{ minHeight: 0 }}>
            {visibleChartMetrics.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <EyeOff className="w-8 h-8 text-[#71717a]" />
                <p className="text-xs text-[#a1a1aa]">All metrics are currently hidden from the chart.</p>
                <button
                  type="button"
                  onClick={() => handleSetPreset(ALL_METRIC_KEYS)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  Show All Metrics
                </button>
              </div>
            ) : chartViewMode === 'radar' ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius={110}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="metric" stroke="#a1a1aa" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#3f3f46" tick={{ fill: '#71717a', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fafafa' }}
                    formatter={(val: any) => [`${val}th Percentile`, '']}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Radar name={dataset.companyName} dataKey="Analyzed Company" stroke="#6366f1" fill="#6366f1" fillOpacity={0.35} />
                  <Radar name="Industry Median (50th %ile)" dataKey="Industry Median (50th)" stroke="#71717a" fill="#71717a" fillOpacity={0.1} />
                  <Radar name="Top Quartile (75th %ile)" dataKey="Top Quartile (75th)" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barComparisonData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#71717a"
                    tick={{ fill: '#a1a1aa', fontSize: 10 }}
                    angle={-15}
                    textAnchor="end"
                    interval={0}
                    height={40}
                  />
                  <YAxis stroke="#71717a" tick={{ fill: '#71717a', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fafafa' }}
                    formatter={(val: any, name: any, item: any) => [`${val} ${item?.payload?.unit || ''}`, name]}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="Analyzed Company" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Industry Median" fill="#71717a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Top Quartile (75th)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Macro Sector Risk Factors & Peer Cohort Profile */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Cohort Strategic Profile: {activePeerGroup.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                <Sliders className="w-3 h-3" />
                Configure
              </button>
            </div>
            <p className="text-xs text-[#71717a] leading-relaxed">
              {activePeerGroup.description}
            </p>
          </div>

          {/* Active Included Peers Pill Strip */}
          <div className="p-3.5 rounded-xl bg-[#09090b] border border-[#27272a] space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-white font-medium flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                Active Peer Group ({activePeerGroup.sampleCompaniesCount} Companies):
              </span>
              <span className="font-mono text-indigo-400 text-[10px]">{currentAlgorithmLabel}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activePeerGroup.activePeers.map((peer) => {
                const weightPct = ((activePeerGroup.effectiveWeights[peer.id] || 0) * 100).toFixed(1);
                return (
                  <span
                    key={peer.id}
                    className="px-2 py-0.5 rounded-md bg-[#18181b] border border-[#27272a] text-[10px] font-mono text-[#a1a1aa] flex items-center gap-1"
                    title={`${peer.name} (${peer.ticker}) - Cap: ${peer.marketCapFormatted}, Effective Weight: ${weightPct}%`}
                  >
                    <strong className="text-white font-sans">{peer.ticker}</strong>
                    <span className="text-[#71717a]">({weightPct}%)</span>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider block">
              Active Industry Macro Risk Factors:
            </span>
            <div className="space-y-2">
              {activePeerGroup.macroRiskFactors.map((risk, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#09090b] border border-[#27272a] flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                  <span className="text-xs text-white font-medium">{risk}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-[#fafafa] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>
              Dynamic weighting engine recalibrated with latest SEC Form 10-K filings.
            </span>
          </div>
        </div>

      </div>

      {/* 5. Detailed Ratio Comparison Table with Quartiles & Table Metric Toggle */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-[#27272a] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Financial Metric Quartile Breakdown
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                Peer Recalculated
              </span>
            </h3>
            <p className="text-xs text-[#71717a]">
              Detailed percentile thresholds (25th, 50th Median, 75th Top Quartile, 90th Leader) derived from the selected peer cohort.
            </p>
          </div>

          {/* Table filter toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#71717a]">Filter table:</span>
            <div className="flex items-center gap-1 bg-[#09090b] p-1 rounded-xl border border-[#27272a]">
              <button
                type="button"
                onClick={() => setTableFilterMode('all')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
                  tableFilterMode === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'text-[#71717a] hover:text-white'
                }`}
              >
                All Metrics ({activePeerGroup.metrics.length})
              </button>
              <button
                type="button"
                onClick={() => setTableFilterMode('visible')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
                  tableFilterMode === 'visible'
                    ? 'bg-indigo-600 text-white'
                    : 'text-[#71717a] hover:text-white'
                }`}
              >
                Visible on Chart ({visibleChartMetrics.length})
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#27272a] bg-[#09090b] font-semibold text-[#a1a1aa] uppercase tracking-wider text-[11px]">
                <th className="p-4 w-12 text-center" title="Chart Visibility Toggle">Chart</th>
                <th className="p-4">Metric & Category</th>
                <th className="p-4">{dataset.companyName}</th>
                <th className="p-4">Bottom 25%</th>
                <th className="p-4">Industry Median</th>
                <th className="p-4">Top 75%</th>
                <th className="p-4">Percentile Standing</th>
                <th className="p-4">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a] font-mono">
              {tableMetrics.map((metric) => {
                const isVisible = visibleMetricKeys.includes(metric.key);
                return (
                  <tr
                    key={metric.key}
                    className={`hover:bg-[#27272a]/40 transition-colors ${
                      !isVisible ? 'opacity-65' : ''
                    }`}
                  >
                    {/* Toggle visibility icon directly in table */}
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleMetricVisibility(metric.key)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isVisible
                            ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25'
                            : 'bg-zinc-800/60 border-zinc-700 text-zinc-500 hover:text-zinc-300'
                        }`}
                        title={isVisible ? 'Visible on primary chart. Click to hide.' : 'Hidden from primary chart. Click to show.'}
                      >
                        {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="p-4 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs">{metric.name}</span>
                        {!isVisible && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                            Hidden
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#71717a]">{metric.category}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-white text-xs bg-[#27272a] px-2 py-1 rounded-md border border-[#3f3f46]">
                        {metric.companyValue}{metric.unit}
                      </span>
                    </td>
                    <td className="p-4 text-[#71717a]">
                      {metric.bottomQuartile}{metric.unit}
                    </td>
                    <td className="p-4 text-white font-medium">
                      {metric.industryMedian}{metric.unit}
                    </td>
                    <td className="p-4 text-[#10b981]">
                      {metric.topQuartile}{metric.unit}
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-white font-semibold">{metric.percentileRank}th %ile</span>
                        </div>
                        <div className="w-24 h-1.5 rounded-full bg-[#27272a] overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${metric.percentileRank}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-sans">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium border inline-block ${
                          metric.status === 'Outperforming'
                            ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30'
                            : metric.status === 'In-Line'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {metric.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Benchmark Settings Modal */}
      <BenchmarkSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        peerGroup={activePeerGroup}
        onSaveSettings={(newSettings: BenchmarkSettings) => {
          saveBenchmarkSettings(selectedGroupId, newSettings);
          setSettingsVersion((v) => v + 1);
        }}
        onResetSettings={() => {
          resetBenchmarkSettings(selectedGroupId);
          setSettingsVersion((v) => v + 1);
        }}
      />
    </div>
  );
};
