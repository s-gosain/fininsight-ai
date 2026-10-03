import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  ShieldAlert,
  AlertTriangle,
  FileSearch,
  Sliders,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  Activity,
  Sparkles,
  Info,
  ChevronRight,
  Calculator,
  ScanEye,
  BadgeAlert,
} from 'lucide-react';
import { FinancialDataset, FinancialRatios, CurrencyCode, StatisticalAnomalyItem, ContextualRootCauseAnalysis } from '../types';
import {
  detectStatisticalAnomalies,
  analyzeBenfordsLaw,
  calculateBeneishMScore,
  runCompleteAnomalySuite,
} from '../utils/statisticalAnomalies';
import { ContextualRootCauseCard } from './ContextualRootCauseCard';

interface AdvancedAnomalyDetectionProps {
  dataset: FinancialDataset;
  ratios: FinancialRatios;
  currency: CurrencyCode;
}

export const AdvancedAnomalyDetection: React.FC<AdvancedAnomalyDetectionProps> = ({ dataset, ratios, currency }) => {
  // Confidence sensitivity threshold: 0.90, 0.95, 0.99
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.95);
  const [selectedMethodFilter, setSelectedMethodFilter] = useState<'ALL' | 'Z_SCORE' | 'IQR' | 'BENFORD' | 'BENEISH'>('ALL');
  const [selectedAnomaly, setSelectedAnomaly] = useState<StatisticalAnomalyItem | null>(null);

  // Gemini Root Cause state
  const [rootCauseMap, setRootCauseMap] = useState<Record<string, ContextualRootCauseAnalysis>>({});
  const [isLoadingRootCause, setIsLoadingRootCause] = useState<boolean>(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  // Compute Anomaly Suite
  const suiteResult = useMemo(() => {
    return runCompleteAnomalySuite(dataset, ratios);
  }, [dataset, ratios]);

  // Filter anomalies based on sensitivity threshold & selected method
  const filteredAnomalies = useMemo(() => {
    const anomalies = detectStatisticalAnomalies(dataset, ratios, confidenceThreshold);
    if (selectedMethodFilter === 'ALL') return anomalies;
    return anomalies.filter((a) => a.method === selectedMethodFilter);
  }, [dataset, ratios, confidenceThreshold, selectedMethodFilter]);

  // Set default selected anomaly when available
  React.useEffect(() => {
    if (filteredAnomalies.length > 0 && !selectedAnomaly) {
      const priority = filteredAnomalies.find((a) => a.severity === 'Critical') || filteredAnomalies[0];
      setSelectedAnomaly(priority);
    }
  }, [filteredAnomalies, selectedAnomaly]);

  // Fetch or retrieve Gemini Contextual Root Cause for target anomaly
  const fetchRootCause = React.useCallback(async (anomaly: StatisticalAnomalyItem, forceRefresh = false) => {
    if (!forceRefresh && rootCauseMap[anomaly.id]) {
      return;
    }

    setIsLoadingRootCause(true);
    setAnalyzingId(anomaly.id);

    try {
      const response = await fetch('/api/ai/anomaly-root-cause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anomaly,
          statementContext: {
            incomeStatement: dataset.incomeStatement,
            balanceSheet: dataset.balanceSheet,
            cashFlowStatement: dataset.cashFlowStatement,
            activePeriod: dataset.activePeriod,
          },
          companyName: dataset.companyName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.analysis) {
          setRootCauseMap((prev) => ({
            ...prev,
            [anomaly.id]: data.analysis,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to retrieve anomaly root cause:', err);
    } finally {
      setIsLoadingRootCause(false);
      setAnalyzingId(null);
    }
  }, [dataset, rootCauseMap]);

  // Auto-fetch root cause when selectedAnomaly changes
  React.useEffect(() => {
    if (selectedAnomaly && !rootCauseMap[selectedAnomaly.id]) {
      fetchRootCause(selectedAnomaly);
    }
  }, [selectedAnomaly, fetchRootCause, rootCauseMap]);

  const benfordData = suiteResult.benfordAnalysis.digits.map((d) => ({
    digit: `Digit ${d.digit}`,
    expected: d.expectedPct,
    actual: d.actualPct,
    isAnomalous: d.isAnomalous,
  }));

  const beneish = suiteResult.beneishMScore;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header & Controls */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 shadow-lg flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ScanEye className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                Statistical & Forensic Anomaly Detection Engine
                <span className="text-[11px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-mono border border-rose-500/30">
                  {suiteResult.overallDataIntegrityGrade}
                </span>
              </h2>
              <p className="text-xs text-[#71717a]">
                Multi-algorithm forensic surveillance using Z-score deviations, IQR fences, Benford's Law first-digit frequencies, and Beneish M-Score manipulation modeling.
              </p>
            </div>
          </div>
        </div>

        {/* Sensitivity & Confidence Slider */}
        <div className="flex items-center gap-3 bg-[#09090b] px-3.5 py-2 rounded-xl border border-[#27272a]">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <div className="text-xs">
            <div className="text-[10px] text-[#71717a] font-mono">Statistical Confidence Floor</div>
            <div className="flex items-center gap-2 mt-0.5">
              <button
                onClick={() => setConfidenceThreshold(0.90)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer ${
                  confidenceThreshold === 0.90 ? 'bg-indigo-600 text-white font-semibold' : 'text-[#71717a] hover:text-white'
                }`}
              >
                90% (Relaxed)
              </button>
              <button
                onClick={() => setConfidenceThreshold(0.95)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer ${
                  confidenceThreshold === 0.95 ? 'bg-indigo-600 text-white font-semibold' : 'text-[#71717a] hover:text-white'
                }`}
              >
                95% (Standard)
              </button>
              <button
                onClick={() => setConfidenceThreshold(0.99)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer ${
                  confidenceThreshold === 0.99 ? 'bg-indigo-600 text-white font-semibold' : 'text-[#71717a] hover:text-white'
                }`}
              >
                99% (Strict 3σ)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Summary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Analyzed */}
        <div className="p-4 rounded-2xl bg-[#18181b] border border-[#27272a] space-y-1">
          <span className="text-xs text-[#71717a] font-medium flex items-center justify-between">
            <span>Analyzed Data Points</span>
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
          </span>
          <div className="text-2xl font-bold font-mono text-white">
            {suiteResult.totalAnalyzedDataPoints}
          </div>
          <span className="text-[11px] text-[#71717a] font-mono block">
            Across IS, BS, Cash Flow & Budget
          </span>
        </div>

        {/* Statistical Deviations */}
        <div className="p-4 rounded-2xl bg-[#18181b] border border-[#27272a] space-y-1">
          <span className="text-xs text-[#71717a] font-medium flex items-center justify-between">
            <span>Statistical Outliers Detected</span>
            <BadgeAlert className="w-3.5 h-3.5 text-amber-400" />
          </span>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {filteredAnomalies.length}
          </div>
          <span className="text-[11px] text-[#71717a] font-mono block">
            {filteredAnomalies.filter((a) => a.severity === 'Critical').length} Critical • {filteredAnomalies.filter((a) => a.severity === 'Warning').length} Warnings
          </span>
        </div>

        {/* Beneish M-Score */}
        <div className="p-4 rounded-2xl bg-[#18181b] border border-[#27272a] space-y-1">
          <span className="text-xs text-[#71717a] font-medium flex items-center justify-between">
            <span>Beneish M-Score (Manipulation)</span>
            <Calculator className="w-3.5 h-3.5 text-rose-400" />
          </span>
          <div className={`text-2xl font-bold font-mono ${beneish.mScore > -1.78 ? 'text-rose-400' : 'text-[#10b981]'}`}>
            {beneish.mScore.toFixed(2)}
          </div>
          <span className="text-[11px] text-[#71717a] font-mono block">
            {beneish.mScore > -1.78 ? 'High Manipulation Risk (> -1.78)' : 'Low Risk Zone (< -2.22)'}
          </span>
        </div>

        {/* Benford Chi-Square */}
        <div className="p-4 rounded-2xl bg-[#18181b] border border-[#27272a] space-y-1">
          <span className="text-xs text-[#71717a] font-medium flex items-center justify-between">
            <span>Benford χ² Statistic</span>
            <FileSearch className="w-3.5 h-3.5 text-cyan-400" />
          </span>
          <div className="text-2xl font-bold font-mono text-white">
            {suiteResult.benfordAnalysis.chiSquareStat}
          </div>
          <span className="text-[11px] text-[#71717a] font-mono block">
            p-val = {suiteResult.benfordAnalysis.pValue} ({suiteResult.benfordAnalysis.sampleSize} samples)
          </span>
        </div>

      </div>

      {/* 3. Main Statistical Anomaly List & Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Detected Statistical Outliers List */}
        <div className="lg:col-span-2 bg-[#18181b] border border-[#27272a] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Detected Statement Line-Item Anomalies
              </h3>
              <p className="text-xs text-[#71717a]">
                Departures identified by parametric Z-score and non-parametric IQR fences.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSelectedMethodFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                  selectedMethodFilter === 'ALL' ? 'bg-[#27272a] text-white' : 'text-[#71717a] hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedMethodFilter('Z_SCORE')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                  selectedMethodFilter === 'Z_SCORE' ? 'bg-[#27272a] text-white' : 'text-[#71717a] hover:text-white'
                }`}
              >
                Z-Score
              </button>
              <button
                onClick={() => setSelectedMethodFilter('IQR')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                  selectedMethodFilter === 'IQR' ? 'bg-[#27272a] text-white' : 'text-[#71717a] hover:text-white'
                }`}
              >
                IQR
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredAnomalies.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#71717a]">
                <CheckCircle2 className="w-8 h-8 text-[#10b981] mx-auto mb-2 opacity-80" />
                No statistical departures identified at the {confidenceThreshold * 100}% confidence threshold.
              </div>
            ) : (
              filteredAnomalies.map((anom) => {
                const isSelected = selectedAnomaly?.id === anom.id;
                const rootCause = rootCauseMap[anom.id];
                const isAnalyzing = isLoadingRootCause && analyzingId === anom.id;

                return (
                  <div
                    key={anom.id}
                    onClick={() => setSelectedAnomaly(anom)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'bg-[#27272a] border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                        : 'bg-[#09090b] border-[#27272a] hover:bg-[#27272a]/40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium border ${
                            anom.severity === 'Critical'
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {anom.severity} • {anom.method === 'Z_SCORE' ? 'Z-Score' : 'IQR Outlier'}
                        </span>
                        <span className="font-semibold text-xs text-white">
                          {anom.lineItemName}
                        </span>
                        <span className="text-[11px] text-[#71717a] font-mono">
                          ({anom.category} • {anom.period})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-right sm:self-auto self-end">
                        <div>
                          <span className="text-xs font-semibold text-white block">
                            {anom.deviationMetric}
                          </span>
                          <span className="text-[10px] text-indigo-400 block">
                            {anom.confidenceLevel}% CI
                          </span>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-indigo-400 rotate-90' : 'text-[#71717a]'}`} />
                      </div>
                    </div>

                    <p className="text-xs text-[#a1a1aa] leading-relaxed line-clamp-2">
                      {anom.explanation}
                    </p>

                    {/* Contextual Root Cause Preview Tag */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#27272a]/50 text-[11px]">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="text-indigo-400 flex items-center gap-1 flex-shrink-0 font-medium">
                          <Sparkles className="w-3 h-3" />
                          Root Cause:
                        </span>
                        {isAnalyzing ? (
                          <span className="text-[#71717a] italic animate-pulse">
                            Interpreting with Gemini...
                          </span>
                        ) : rootCause ? (
                          <span className="text-[#e4e4e7] truncate font-medium">
                            {rootCause.rootCauseTitle}
                          </span>
                        ) : (
                          <span className="text-[#71717a] italic">
                            Click to synthesize forensic root cause
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-[#71717a] font-mono flex-shrink-0 ml-2">
                        {anom.method === 'Z_SCORE' ? 'Gaussian Z-Model' : 'Tukey IQR Boxplot'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Contextual Root Cause Card & Forensic Auditor Inquiry */}
        <div className="lg:col-span-1">
          {selectedAnomaly ? (
            <ContextualRootCauseCard
              anomaly={selectedAnomaly}
              rootCause={rootCauseMap[selectedAnomaly.id] || null}
              isLoading={isLoadingRootCause && analyzingId === selectedAnomaly.id}
              onRefresh={() => fetchRootCause(selectedAnomaly, true)}
              dataset={dataset}
            />
          ) : (
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-8 shadow-xl text-center text-xs text-[#71717a] space-y-3">
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-fit mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-white font-semibold">No Anomaly Selected</p>
              <p className="text-[#71717a] max-w-xs mx-auto">
                Select any statistical departure on the left to trigger the Gemini forensic interpretation engine and inspect contextual root cause analysis.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* 4. Benford's Law & Beneish M-Score Detail Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Benford's Law Digital Analysis */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                Benford's Law First-Digit Frequency Distribution
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono border border-cyan-500/30">
                  Forensic Accounting
                </span>
              </h3>
              <p className="text-xs text-[#71717a]">
                Logarithmic digit frequency comparison: Expected P(d)=log10(1+1/d) vs Actual subledger occurrences.
              </p>
            </div>
          </div>

          <div className="w-full h-[400px] min-h-[400px] relative [min-height:0]" style={{ minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={benfordData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="digit" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 11 }} />
                <YAxis stroke="#71717a" tick={{ fill: '#71717a', fontSize: 11 }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fafafa' }}
                  formatter={(v: any) => [`${Number(v).toFixed(1)}%`, '']}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="expected" name="Theoretical Benford %" fill="#6366f1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="actual" name="Actual Ledger %" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-[#09090b] border border-[#27272a] text-xs text-[#a1a1aa] leading-relaxed">
            <span className="font-semibold text-white block mb-0.5">Statistical Assessment:</span>
            {suiteResult.benfordAnalysis.summary}
          </div>
        </div>

        {/* Beneish M-Score Index Breakdown */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                Beneish M-Score 8-Variable Manipulation Index
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 font-mono border border-rose-500/30">
                  Forensic M-Score
                </span>
              </h3>
              <p className="text-xs text-[#71717a]">
                Probability of financial statement earnings manipulation (M-Score &gt; -1.78 triggers red flag).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-[#09090b] border border-[#27272a]">
              <span className="text-[10px] text-[#71717a] font-sans block">DSRI (Receivables)</span>
              <span className={`font-semibold ${beneish.dsri > 1.2 ? 'text-rose-400' : 'text-white'}`}>{beneish.dsri}x</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#09090b] border border-[#27272a]">
              <span className="text-[10px] text-[#71717a] font-sans block">GMI (Gross Margin)</span>
              <span className={`font-semibold ${beneish.gmi > 1.15 ? 'text-amber-400' : 'text-white'}`}>{beneish.gmi}x</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#09090b] border border-[#27272a]">
              <span className="text-[10px] text-[#71717a] font-sans block">SGI (Sales Growth)</span>
              <span className="font-semibold text-white">{beneish.sgi}x</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#09090b] border border-[#27272a]">
              <span className="text-[10px] text-[#71717a] font-sans block">TATA (Accruals)</span>
              <span className={`font-semibold ${beneish.tata > 0.05 ? 'text-rose-400' : 'text-[#10b981]'}`}>{(beneish.tata * 100).toFixed(1)}%</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#09090b] border border-[#27272a] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Overall Manipulation Risk:</span>
              <span className="font-mono text-xs text-indigo-400 font-semibold">{beneish.manipulationProbability}</span>
            </div>
            <p className="text-[#a1a1aa] leading-relaxed">
              {beneish.interpretation}
            </p>
          </div>

          {beneish.flaggedVariables.length > 0 && (
            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">
                Flagged Sub-Index Drivers:
              </span>
              {beneish.flaggedVariables.map((v, idx) => (
                <div key={idx} className="text-[#71717a] flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
