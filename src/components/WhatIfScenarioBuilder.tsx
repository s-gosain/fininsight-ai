import React, { useState, useMemo } from 'react';
import {
  Sliders,
  TrendingUp,
  DollarSign,
  Percent,
  RefreshCw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  BarChart2,
  Check,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  FinancialDataset,
  PredictiveForecastModelResult,
  CurrencyCode,
  WhatIfScenarioOverrides,
} from '../types';

interface WhatIfScenarioBuilderProps {
  dataset: FinancialDataset;
  forecastResult: PredictiveForecastModelResult;
  currency: CurrencyCode;
}

export const WhatIfScenarioBuilder: React.FC<WhatIfScenarioBuilderProps> = ({
  dataset,
  forecastResult,
  currency,
}) => {
  // Overrides state
  const [overrides, setOverrides] = useState<WhatIfScenarioOverrides>({
    revenueGrowth: {
      active: false,
      value: 24.0, // %
    },
    operatingMargin: {
      active: false,
      value: 22.5, // %
    },
    capexIntensity: {
      active: false,
      value: 5.5, // % of revenue
    },
    dsoWorkingCapital: {
      active: false,
      days: 38, // days
    },
    discountRate: {
      active: false,
      value: 8.5, // %
    },
  });

  // Toggle override
  const toggleOverride = (key: keyof WhatIfScenarioOverrides) => {
    setOverrides((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        active: !prev[key].active,
      },
    }));
  };

  // Update override value
  const updateOverrideValue = (key: keyof WhatIfScenarioOverrides, val: number) => {
    setOverrides((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        active: true, // auto-enable on adjustment
        [key === 'dsoWorkingCapital' ? 'days' : 'value']: val,
      },
    }));
  };

  // Presets
  const applyPreset = (type: 'aggressive' | 'cashflow' | 'stress' | 'rule40') => {
    if (type === 'aggressive') {
      setOverrides({
        revenueGrowth: { active: true, value: 32.0 },
        operatingMargin: { active: true, value: 18.0 },
        capexIntensity: { active: true, value: 9.5 },
        dsoWorkingCapital: { active: true, days: 48 },
        discountRate: { active: true, value: 9.0 },
      });
    } else if (type === 'cashflow') {
      setOverrides({
        revenueGrowth: { active: true, value: 12.0 },
        operatingMargin: { active: true, value: 31.0 },
        capexIntensity: { active: true, value: 3.5 },
        dsoWorkingCapital: { active: true, days: 32 },
        discountRate: { active: true, value: 7.5 },
      });
    } else if (type === 'stress') {
      setOverrides({
        revenueGrowth: { active: true, value: -4.5 },
        operatingMargin: { active: true, value: 11.0 },
        capexIntensity: { active: true, value: 6.0 },
        dsoWorkingCapital: { active: true, days: 58 },
        discountRate: { active: true, value: 10.5 },
      });
    } else if (type === 'rule40') {
      setOverrides({
        revenueGrowth: { active: true, value: 25.0 },
        operatingMargin: { active: true, value: 20.0 },
        capexIntensity: { active: true, value: 5.0 },
        dsoWorkingCapital: { active: true, days: 36 },
        discountRate: { active: true, value: 8.0 },
      });
    }
  };

  const resetAllOverrides = () => {
    setOverrides({
      revenueGrowth: { active: false, value: 20.0 },
      operatingMargin: { active: false, value: 18.5 },
      capexIntensity: { active: false, value: 6.5 },
      dsoWorkingCapital: { active: false, days: 42 },
      discountRate: { active: false, value: 8.5 },
    });
  };

  const anyActive = (Object.keys(overrides) as (keyof WhatIfScenarioOverrides)[]).some(
    (k) => overrides[k].active
  );

  // Compute What-If cash flow model in real-time
  const whatIfAnalysis = useMemo(() => {
    const forwardPoints = forecastResult.points.filter((p) => !p.isHistorical);
    const lastHistorical = forecastResult.points.filter((p) => p.isHistorical).slice(-1)[0] || forwardPoints[0];
    const baseRevenueStart = lastHistorical?.revenue || 50000000;

    let cumulativeBaselineFcf = 0;
    let cumulativeWhatIfFcf = 0;
    let currentWhatIfRev = baseRevenueStart;

    const periodsData = forwardPoints.map((fp, idx) => {
      const step = idx + 1;

      // 1. Revenue
      let whatIfRev = fp.revenue;
      if (overrides.revenueGrowth.active) {
        const growthRate = (overrides.revenueGrowth.value / 100) * Math.pow(0.96, step - 1);
        currentWhatIfRev = Math.round(currentWhatIfRev * (1 + growthRate));
        whatIfRev = currentWhatIfRev;
      }

      // 2. Operating Income
      let whatIfOpIncome = fp.operatingIncome;
      if (overrides.operatingMargin.active) {
        whatIfOpIncome = Math.round(whatIfRev * (overrides.operatingMargin.value / 100));
      } else if (overrides.revenueGrowth.active) {
        // scale with new revenue using baseline operating margin
        const margin = fp.operatingMarginPct / 100;
        whatIfOpIncome = Math.round(whatIfRev * margin);
      }

      // 3. CapEx
      let whatIfCapEx = Math.round(whatIfRev * 0.065);
      if (overrides.capexIntensity.active) {
        whatIfCapEx = Math.round(whatIfRev * (overrides.capexIntensity.value / 100));
      }

      // 4. Working Capital & DSO Impact
      let workingCapitalDrag = 0;
      if (overrides.dsoWorkingCapital.active) {
        // Baseline assumed DSO is 42 days
        const deltaDays = overrides.dsoWorkingCapital.days - 42;
        // Faster collection (negative delta) frees up cash (+ cash); slower collection traps cash
        workingCapitalDrag = Math.round((deltaDays / 365) * whatIfRev * 0.45);
      }

      // 5. Operating Cash Flow & Free Cash Flow
      const baselineFcf = fp.freeCashFlow;
      const baselineOcf = fp.operatingCashFlow;

      // What-If Net Income estimate
      const whatIfTax = Math.max(0, whatIfOpIncome * 0.21);
      const whatIfNetIncome = Math.round(whatIfOpIncome - whatIfTax);
      const whatIfOcf = Math.round(whatIfNetIncome + whatIfRev * 0.04 - workingCapitalDrag);
      const whatIfFcf = Math.round(whatIfOcf - whatIfCapEx);

      cumulativeBaselineFcf += baselineFcf;
      cumulativeWhatIfFcf += whatIfFcf;

      const deltaPeriodFcf = whatIfFcf - baselineFcf;
      const pctVariance = baselineFcf !== 0 ? Number(((deltaPeriodFcf / Math.abs(baselineFcf)) * 100).toFixed(1)) : 0;

      return {
        period: fp.period,
        baselineRevenue: fp.revenue,
        whatIfRevenue: whatIfRev,
        baselineFcf,
        whatIfFcf,
        deltaPeriodFcf,
        pctVariance,
        cumulativeBaselineFcf,
        cumulativeWhatIfFcf,
        cumulativeDelta: cumulativeWhatIfFcf - cumulativeBaselineFcf,
        baselineOcf,
        whatIfOcf,
        whatIfCapEx,
        whatIfMargin: Number(((whatIfOpIncome / whatIfRev) * 100).toFixed(1)),
      };
    });

    const totalBaseline = cumulativeBaselineFcf;
    const totalWhatIf = cumulativeWhatIfFcf;
    const totalDelta = totalWhatIf - totalBaseline;
    const totalPct = totalBaseline !== 0 ? Number(((totalDelta / Math.abs(totalBaseline)) * 100).toFixed(1)) : 0;

    // Sensitivity elasticity rule of thumb
    const marginSensitivityFcf = Math.round((baseRevenueStart * 0.01) * 0.79);

    return {
      periodsData,
      totalBaseline,
      totalWhatIf,
      totalDelta,
      totalPct,
      marginSensitivityFcf,
      avgAnnualWhatIf: Math.round(totalWhatIf / (periodsData.length || 1)),
      avgAnnualBaseline: Math.round(totalBaseline / (periodsData.length || 1)),
    };
  }, [forecastResult, overrides]);

  const formatCurrency = (val: number) => {
    if (Math.abs(val) >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (Math.abs(val) >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header with Title & Quick Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-[#27272a]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                Interactive 'What-If' Scenario & Cash Flow Builder
                {anyActive && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/30">
                    Live Overrides Engaged
                  </span>
                )}
              </h3>
              <p className="text-xs text-[#71717a]">
                Toggle manual overrides for growth, margins, and working capital to evaluate real-time liquidity and cash flow model impact.
              </p>
            </div>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-[#71717a] font-medium mr-1">What-If Presets:</span>
          <button
            onClick={() => applyPreset('aggressive')}
            className="px-2.5 py-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-xs font-medium text-[#fafafa] border border-[#3f3f46] transition-colors cursor-pointer"
          >
            Scale-Up (+32%)
          </button>
          <button
            onClick={() => applyPreset('cashflow')}
            className="px-2.5 py-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-xs font-medium text-[#fafafa] border border-[#3f3f46] transition-colors cursor-pointer"
          >
            Cash Maximizer (31% Margin)
          </button>
          <button
            onClick={() => applyPreset('rule40')}
            className="px-2.5 py-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-xs font-medium text-[#fafafa] border border-[#3f3f46] transition-colors cursor-pointer"
          >
            Rule of 40 (+25% / 20%)
          </button>
          <button
            onClick={() => applyPreset('stress')}
            className="px-2.5 py-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-xs font-medium text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
          >
            Recession Stress (-4.5%)
          </button>
          {anyActive && (
            <button
              onClick={resetAllOverrides}
              className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-xs font-medium text-rose-400 border border-rose-500/30 transition-colors cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Overrides
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Controls (Toggles) & Right Real-Time Cash Flow Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 Cols): Override Toggles & Parameter Sliders */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              Manual Variable Overrides
            </span>
            <span className="text-[10px] text-[#71717a] font-mono">
              {(Object.keys(overrides) as (keyof WhatIfScenarioOverrides)[]).filter((k) => overrides[k].active).length} of 4 Active
            </span>
          </div>

          <div className="space-y-3.5">
            
            {/* 1. Revenue Growth Override */}
            <div className={`p-3.5 rounded-xl border transition-all ${overrides.revenueGrowth.active ? 'bg-[#27272a]/60 border-emerald-500/40 shadow-sm' : 'bg-[#09090b] border-[#27272a]'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleOverride('revenueGrowth')}
                    className="cursor-pointer text-emerald-400 focus:outline-none"
                    title={overrides.revenueGrowth.active ? 'Disable override' : 'Enable override'}
                  >
                    {overrides.revenueGrowth.active ? (
                      <ToggleRight className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-[#71717a]" />
                    )}
                  </button>
                  <div>
                    <label className="text-xs font-medium text-white block">
                      Revenue Growth Override
                    </label>
                    <span className="text-[10px] text-[#71717a]">
                      Baseline: +{forecastResult.scenarioParameters.revenueCagrPct}%
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className={`text-xs font-bold ${overrides.revenueGrowth.active ? 'text-emerald-400' : 'text-[#71717a]'}`}>
                    {overrides.revenueGrowth.value > 0 ? '+' : ''}{overrides.revenueGrowth.value}%
                  </span>
                </div>
              </div>

              <input
                type="range"
                min="-15"
                max="50"
                step="0.5"
                value={overrides.revenueGrowth.value}
                onChange={(e) => updateOverrideValue('revenueGrowth', parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#71717a] font-mono mt-1">
                <span>-15%</span>
                <span>Consensus Base</span>
                <span>+50%</span>
              </div>
            </div>

            {/* 2. Target Operating Margin Override */}
            <div className={`p-3.5 rounded-xl border transition-all ${overrides.operatingMargin.active ? 'bg-[#27272a]/60 border-emerald-500/40 shadow-sm' : 'bg-[#09090b] border-[#27272a]'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleOverride('operatingMargin')}
                    className="cursor-pointer text-emerald-400 focus:outline-none"
                    title={overrides.operatingMargin.active ? 'Disable override' : 'Enable override'}
                  >
                    {overrides.operatingMargin.active ? (
                      <ToggleRight className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-[#71717a]" />
                    )}
                  </button>
                  <div>
                    <label className="text-xs font-medium text-white block">
                      Target Operating Margin Override
                    </label>
                    <span className="text-[10px] text-[#71717a]">
                      Operating EBIT conversion rate
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className={`text-xs font-bold ${overrides.operatingMargin.active ? 'text-emerald-400' : 'text-[#71717a]'}`}>
                    {overrides.operatingMargin.value}%
                  </span>
                </div>
              </div>

              <input
                type="range"
                min="4"
                max="45"
                step="0.5"
                value={overrides.operatingMargin.value}
                onChange={(e) => updateOverrideValue('operatingMargin', parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#71717a] font-mono mt-1">
                <span>4% (Low)</span>
                <span>Historical (~18%)</span>
                <span>45% (High)</span>
              </div>
            </div>

            {/* 3. CapEx Reinvestment Intensity Override */}
            <div className={`p-3.5 rounded-xl border transition-all ${overrides.capexIntensity.active ? 'bg-[#27272a]/60 border-emerald-500/40 shadow-sm' : 'bg-[#09090b] border-[#27272a]'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleOverride('capexIntensity')}
                    className="cursor-pointer text-emerald-400 focus:outline-none"
                    title={overrides.capexIntensity.active ? 'Disable override' : 'Enable override'}
                  >
                    {overrides.capexIntensity.active ? (
                      <ToggleRight className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-[#71717a]" />
                    )}
                  </button>
                  <div>
                    <label className="text-xs font-medium text-white block">
                      CapEx Reinvestment Override
                    </label>
                    <span className="text-[10px] text-[#71717a]">
                      Capital expenditures (% of revenue)
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className={`text-xs font-bold ${overrides.capexIntensity.active ? 'text-emerald-400' : 'text-[#71717a]'}`}>
                    {overrides.capexIntensity.value}%
                  </span>
                </div>
              </div>

              <input
                type="range"
                min="1.0"
                max="20.0"
                step="0.5"
                value={overrides.capexIntensity.value}
                onChange={(e) => updateOverrideValue('capexIntensity', parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#71717a] font-mono mt-1">
                <span>1% (Asset-Light)</span>
                <span>6.5% (Base)</span>
                <span>20% (Heavy Infra)</span>
              </div>
            </div>

            {/* 4. Working Capital & DSO Override */}
            <div className={`p-3.5 rounded-xl border transition-all ${overrides.dsoWorkingCapital.active ? 'bg-[#27272a]/60 border-emerald-500/40 shadow-sm' : 'bg-[#09090b] border-[#27272a]'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleOverride('dsoWorkingCapital')}
                    className="cursor-pointer text-emerald-400 focus:outline-none"
                    title={overrides.dsoWorkingCapital.active ? 'Disable override' : 'Enable override'}
                  >
                    {overrides.dsoWorkingCapital.active ? (
                      <ToggleRight className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-[#71717a]" />
                    )}
                  </button>
                  <div>
                    <label className="text-xs font-medium text-white block">
                      Working Capital / DSO Collection
                    </label>
                    <span className="text-[10px] text-[#71717a]">
                      Days Sales Outstanding (Cash drag/acceleration)
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className={`text-xs font-bold ${overrides.dsoWorkingCapital.active ? 'text-emerald-400' : 'text-[#71717a]'}`}>
                    {overrides.dsoWorkingCapital.days} Days
                  </span>
                </div>
              </div>

              <input
                type="range"
                min="20"
                max="75"
                step="1"
                value={overrides.dsoWorkingCapital.days}
                onChange={(e) => updateOverrideValue('dsoWorkingCapital', parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#71717a] font-mono mt-1">
                <span>20 Days (Fast Cash)</span>
                <span>42 Days (Neutral)</span>
                <span>75 Days (Trapped Cash)</span>
              </div>
            </div>

          </div>

          {/* Quick Sensitivity Insight Box */}
          <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs space-y-1">
            <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Cash Flow Sensitivity Elasticity
            </span>
            <p className="text-[11px] text-[#e4e4e7] leading-relaxed">
              Every <strong className="text-white">+1.0% increase</strong> in Operating Margin unlocks approximately <strong className="text-emerald-400">+{formatCurrency(whatIfAnalysis.marginSensitivityFcf)}/yr</strong> in incremental Free Cash Flow at current scale.
            </p>
          </div>

        </div>

        {/* Right Column (7 Cols): Real-Time Cash Flow Impact Visualizer */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Top Cash Impact Scoreboard */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Cumulative 4-Year FCF Card */}
            <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a] space-y-1">
              <span className="text-[10px] text-[#71717a] font-mono uppercase tracking-wider block">
                4-Year Cumulative FCF
              </span>
              <div className="text-xl font-bold text-white font-mono">
                {formatCurrency(whatIfAnalysis.totalWhatIf)}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono">
                <span className="text-[#71717a]">Base: {formatCurrency(whatIfAnalysis.totalBaseline)}</span>
                <span className={`font-semibold flex items-center ${whatIfAnalysis.totalDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {whatIfAnalysis.totalDelta >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {whatIfAnalysis.totalDelta >= 0 ? '+' : ''}{formatCurrency(whatIfAnalysis.totalDelta)} ({whatIfAnalysis.totalPct > 0 ? '+' : ''}{whatIfAnalysis.totalPct}%)
                </span>
              </div>
            </div>

            {/* Annual Average Generation Card */}
            <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a] space-y-1">
              <span className="text-[10px] text-[#71717a] font-mono uppercase tracking-wider block">
                Avg Annual Free Cash Flow
              </span>
              <div className="text-xl font-bold text-emerald-400 font-mono">
                {formatCurrency(whatIfAnalysis.avgAnnualWhatIf)}/yr
              </div>
              <span className="text-[10px] text-[#71717a] block">
                vs Base {formatCurrency(whatIfAnalysis.avgAnnualBaseline)}/yr
              </span>
            </div>

            {/* Cash Conversion Efficiency */}
            <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a] space-y-1">
              <span className="text-[10px] text-[#71717a] font-mono uppercase tracking-wider block">
                Average Operating Margin
              </span>
              <div className="text-xl font-bold text-indigo-400 font-mono">
                {overrides.operatingMargin.active ? `${overrides.operatingMargin.value}%` : `${whatIfAnalysis.periodsData[0]?.whatIfMargin || 18}%`}
              </div>
              <span className="text-[10px] text-[#71717a] block">
                {overrides.operatingMargin.active ? 'User Overridden' : 'Model Projected'}
              </span>
            </div>

          </div>

          {/* Cash Flow Impact Chart: Baseline vs What-If */}
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#27272a]">
              <div>
                <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
                  Free Cash Flow Trajectory: Consensus Baseline vs What-If Model
                </h4>
                <p className="text-[11px] text-[#71717a]">
                  Real-time delta in annual cash flow generation across the 4-year forward forecast horizon.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1 text-[#71717a]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#3f3f46]" />
                  Baseline
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  What-If Overridden
                </span>
              </div>
            </div>

            <div className="w-full h-[240px] min-h-[240px] relative [min-height:0]" style={{ minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={whatIfAnalysis.periodsData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="period" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 11 }} />
                  <YAxis stroke="#71717a" tick={{ fill: '#71717a', fontSize: 11 }} tickFormatter={formatCurrency} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fafafa' }}
                    formatter={(val: any, name: any) => [formatCurrency(Number(val)), name]}
                  />
                  <Bar dataKey="baselineFcf" name="Baseline Cash Flow" fill="#3f3f46" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="whatIfFcf" name="What-If Cash Flow" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Line
                    type="monotone"
                    dataKey="whatIfRevenue"
                    name="What-If Revenue Scale"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    yAxisId={0}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Period Breakdown Table */}
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl overflow-hidden text-xs">
            <div className="p-3 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between">
              <span className="font-semibold text-white uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Annualized Cash Flow Delta Table
              </span>
              <span className="text-[10px] text-[#71717a] font-mono">Real-Time Forecast</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead className="bg-[#18181b]/50 text-[#71717a] text-[10px] uppercase border-b border-[#27272a]">
                  <tr>
                    <th className="p-2.5">Forecast Period</th>
                    <th className="p-2.5">What-If Revenue</th>
                    <th className="p-2.5">Baseline FCF</th>
                    <th className="p-2.5">What-If FCF</th>
                    <th className="p-2.5">Net Delta</th>
                    <th className="p-2.5">Cumulative Cash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]/50 text-[11px]">
                  {whatIfAnalysis.periodsData.map((row) => (
                    <tr key={row.period} className="hover:bg-[#27272a]/30 transition-colors">
                      <td className="p-2.5 font-bold text-white">{row.period}</td>
                      <td className="p-2.5 text-[#a1a1aa]">{formatCurrency(row.whatIfRevenue)}</td>
                      <td className="p-2.5 text-[#71717a]">{formatCurrency(row.baselineFcf)}</td>
                      <td className="p-2.5 text-emerald-400 font-semibold">{formatCurrency(row.whatIfFcf)}</td>
                      <td className="p-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${row.deltaPeriodFcf >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                          {row.deltaPeriodFcf >= 0 ? '+' : ''}{formatCurrency(row.deltaPeriodFcf)} ({row.pctVariance > 0 ? '+' : ''}{row.pctVariance}%)
                        </span>
                      </td>
                      <td className="p-2.5 text-white font-semibold">{formatCurrency(row.cumulativeWhatIfFcf)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
