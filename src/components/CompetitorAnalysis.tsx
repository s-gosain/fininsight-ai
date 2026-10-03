import React, { useState, useMemo } from 'react';
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
  Users,
  ShieldAlert,
  TrendingUp,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Download,
  PlusCircle,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Scale,
} from 'lucide-react';
import { FinancialDataset, FinancialRatios, CurrencyCode, CompetitorCompany } from '../types';
import {
  getCompetitorsForDataset,
  buildActiveCompanyProfile,
  generateComparativeReport,
} from '../utils/competitorData';

interface CompetitorAnalysisProps {
  dataset: FinancialDataset;
  ratios: FinancialRatios;
  currency: CurrencyCode;
}

const COMPARATIVE_METRICS = [
  { key: 'revenue', name: 'Total Revenue', unit: '$', higherIsBetter: true, format: (v: number) => `$${(v / 1000000).toFixed(1)}M` },
  { key: 'revenueGrowthYoY', name: 'YoY Revenue Growth', unit: '%', higherIsBetter: true, format: (v: number) => `+${v.toFixed(1)}%` },
  { key: 'grossMargin', name: 'Gross Profit Margin', unit: '%', higherIsBetter: true, format: (v: number) => `${v.toFixed(1)}%` },
  { key: 'operatingMargin', name: 'Operating Margin (EBIT)', unit: '%', higherIsBetter: true, format: (v: number) => `${v.toFixed(1)}%` },
  { key: 'netMargin', name: 'Net Profit Margin', unit: '%', higherIsBetter: true, format: (v: number) => `${v.toFixed(1)}%` },
  { key: 'returnOnEquity', name: 'Return on Equity (ROE)', unit: '%', higherIsBetter: true, format: (v: number) => `${v.toFixed(1)}%` },
  { key: 'currentRatio', name: 'Current Liquidity Ratio', unit: 'x', higherIsBetter: true, format: (v: number) => `${v.toFixed(2)}x` },
  { key: 'debtToEquity', name: 'Debt-to-Equity Leverage', unit: 'x', higherIsBetter: false, format: (v: number) => `${v.toFixed(2)}x` },
  { key: 'fcfMargin', name: 'Free Cash Flow Margin', unit: '%', higherIsBetter: true, format: (v: number) => `${v.toFixed(1)}%` },
  { key: 'piotroskiFScore', name: 'Piotroski F-Score', unit: 'pts', higherIsBetter: true, format: (v: number) => `${v}/9` },
  { key: 'altmanZScore', name: 'Altman Z-Score', unit: 'pts', higherIsBetter: true, format: (v: number) => `${v.toFixed(2)}` },
  { key: 'dso', name: 'Days Sales Outstanding (DSO)', unit: 'days', higherIsBetter: false, format: (v: number) => `${v} days` },
];

const COMPANY_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#38bdf8'];

export const CompetitorAnalysis: React.FC<CompetitorAnalysisProps> = ({ dataset, ratios, currency }) => {
  // 1. Initial State & Peer Selection
  const activeCompany = useMemo(() => buildActiveCompanyProfile(dataset, ratios), [dataset, ratios]);
  const availablePeers = useMemo(() => getCompetitorsForDataset(dataset), [dataset]);
  
  const [selectedPeerIds, setSelectedPeerIds] = useState<string[]>(availablePeers.map((p) => p.id));
  const [activeVisualMode, setActiveVisualMode] = useState<'matrix' | 'radar' | 'trends' | 'risks'>('matrix');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customTicker, setCustomTicker] = useState('');
  const [customRevenue, setCustomRevenue] = useState('75000000');
  const [customGrowth, setCustomGrowth] = useState('20.0');
  const [customGrossMargin, setCustomGrossMargin] = useState('70.0');

  // Included companies
  const activePeers = useMemo(() => {
    return availablePeers.filter((p) => selectedPeerIds.includes(p.id));
  }, [availablePeers, selectedPeerIds]);

  const allComparedCompanies: CompetitorCompany[] = useMemo(() => {
    return [activeCompany, ...activePeers];
  }, [activeCompany, activePeers]);

  // Generate executive report
  const comparativeReport = useMemo(() => {
    return generateComparativeReport(activeCompany, activePeers);
  }, [activeCompany, activePeers]);

  // Radar Data normalized to 0-100 scale
  const radarData = useMemo(() => {
    const dimensions = [
      { name: 'Revenue Growth', key: 'revenueGrowthYoY', max: 40 },
      { name: 'Gross Margin', key: 'grossMargin', max: 90 },
      { name: 'Operating Margin', key: 'operatingMargin', max: 25 },
      { name: 'ROE Efficiency', key: 'returnOnEquity', max: 25 },
      { name: 'Solvency (Altman)', key: 'altmanZScore', max: 6.0 },
      { name: 'Liquidity Buffer', key: 'currentRatio', max: 3.5 },
    ];

    return dimensions.map((dim) => {
      const row: Record<string, any> = { dimension: dim.name };
      allComparedCompanies.forEach((comp) => {
        const raw = (comp as any)[dim.key] || 0;
        const normalized = Math.min(100, Math.max(10, (raw / dim.max) * 100));
        row[comp.name] = Number(normalized.toFixed(1));
      });
      return row;
    });
  }, [allComparedCompanies]);

  // Historical Revenue Trend Data for bar comparisons
  const revenueTrendData = useMemo(() => {
    return dataset.periods.map((period) => {
      const point: Record<string, any> = { period };
      allComparedCompanies.forEach((c) => {
        point[c.name] = c.historicalRevenues[period] || c.revenue * (period === 'FY2022' ? 0.65 : period === 'FY2023' ? 0.82 : 1.0);
      });
      return point;
    });
  }, [dataset.periods, allComparedCompanies]);

  const togglePeer = (id: string) => {
    if (selectedPeerIds.includes(id)) {
      if (selectedPeerIds.length > 1) {
        setSelectedPeerIds(selectedPeerIds.filter((p) => p !== id));
      }
    } else {
      setSelectedPeerIds([...selectedPeerIds, id]);
    }
  };

  // Find leader for a metric
  const getLeaderCompany = (metricKey: string, higherIsBetter: boolean) => {
    const sorted = [...allComparedCompanies].sort((a, b) => {
      const valA = (a as any)[metricKey] || 0;
      const valB = (b as any)[metricKey] || 0;
      return higherIsBetter ? valB - valA : valA - valB;
    });
    return sorted[0];
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header & Peer Selector */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 shadow-lg flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                Competitor & Industry Peer Comparative Analysis
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-[#10b981] font-mono border border-emerald-500/30">
                  {allComparedCompanies.length} Entities Modeled
                </span>
              </h2>
              <p className="text-xs text-[#71717a]">
                Direct side-by-side benchmarking of key performance indicators, growth trajectories, and risk factors.
              </p>
            </div>
          </div>
        </div>

        {/* Peer Selection Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#71717a] font-medium mr-1">Active Peers:</span>
          {availablePeers.map((peer, idx) => {
            const isSelected = selectedPeerIds.includes(peer.id);
            return (
              <button
                key={peer.id}
                onClick={() => togglePeer(peer.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'bg-[#09090b] text-[#71717a] border border-[#27272a] hover:text-[#fafafa]'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COMPANY_COLORS[(idx + 1) % COMPANY_COLORS.length] }}
                />
                <span>{peer.ticker} ({peer.name.split(' ')[0]})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Visual View Mode Navigation Bar */}
      <div className="flex items-center justify-between bg-[#18181b] border border-[#27272a] rounded-xl p-1.5">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveVisualMode('matrix')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeVisualMode === 'matrix'
                ? 'bg-[#27272a] text-white shadow-sm'
                : 'text-[#71717a] hover:text-white'
            }`}
          >
            Side-by-Side KPI Matrix
          </button>
          <button
            onClick={() => setActiveVisualMode('radar')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeVisualMode === 'radar'
                ? 'bg-[#27272a] text-white shadow-sm'
                : 'text-[#71717a] hover:text-white'
            }`}
          >
            Competitive Radar Profile
          </button>
          <button
            onClick={() => setActiveVisualMode('trends')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeVisualMode === 'trends'
                ? 'bg-[#27272a] text-white shadow-sm'
                : 'text-[#71717a] hover:text-white'
            }`}
          >
            Historical Growth Trends
          </button>
          <button
            onClick={() => setActiveVisualMode('risks')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeVisualMode === 'risks'
                ? 'bg-[#27272a] text-white shadow-sm'
                : 'text-[#71717a] hover:text-white'
            }`}
          >
            Moat & Risk Comparison
          </button>
        </div>

        <div className="text-xs text-[#71717a] font-mono pr-2">
          Target: <span className="text-indigo-400 font-semibold">{activeCompany.name}</span>
        </div>
      </div>

      {/* 3. Main View Render */}
      {activeVisualMode === 'matrix' && (
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden shadow-xl table-responsive-wrapper dashboard-visual-container">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#27272a] bg-[#09090b]">
                  <th className="p-4 font-semibold text-[#a1a1aa] uppercase tracking-wider text-[11px]">
                    Financial KPI / Dimension
                  </th>
                  {allComparedCompanies.map((c, idx) => (
                    <th key={c.id} className="p-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COMPANY_COLORS[idx % COMPANY_COLORS.length] }}
                        />
                        <div>
                          <div className="font-semibold text-xs flex items-center gap-1.5">
                            {c.name}
                            {idx === 0 && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                                Target
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#71717a] font-mono block">
                            Ticker: {c.ticker} • {c.period}
                          </span>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a] font-mono">
                {COMPARATIVE_METRICS.map((metric) => {
                  const leader = getLeaderCompany(metric.key, metric.higherIsBetter);
                  return (
                    <tr key={metric.key} className="hover:bg-[#27272a]/40 transition-colors">
                      <td className="p-4 font-sans text-xs text-[#fafafa] font-medium flex items-center justify-between">
                        <span>{metric.name}</span>
                        <span className="text-[10px] text-[#71717a] font-mono">
                          {metric.higherIsBetter ? 'Higher is better' : 'Lower is better'}
                        </span>
                      </td>
                      {allComparedCompanies.map((c) => {
                        const val = (c as any)[metric.key] || 0;
                        const isLeader = c.id === leader.id;
                        return (
                          <td key={c.id} className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-semibold ${isLeader ? 'text-[#10b981]' : 'text-white'}`}>
                                {metric.format(val)}
                              </span>
                              {isLeader && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#10b981]/10 text-[#10b981] font-sans font-medium flex items-center gap-0.5">
                                  <Award className="w-3 h-3" />
                                  1st
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeVisualMode === 'radar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold text-white mb-2 self-start">
              Multi-Dimensional Competitor Benchmark Radar
            </h3>
            <p className="text-xs text-[#71717a] mb-4 self-start">
              Normalized index (0-100 scale) comparing Profitability, Capital Efficiency, Solvency, and Top-line Momentum.
            </p>
            <div className="w-full dashboard-visual-container visual-containment aspect-chart-responsive relative [min-height:0]" style={{ minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius={130}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="dimension" stroke="#a1a1aa" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#3f3f46" tick={{ fill: '#71717a', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fafafa' }}
                    formatter={(val: any, name: any) => [`${val}/100 pts`, name]}
                  />
                  <Legend wrapperStyle={{ paddingTop: '15px' }} />
                  {allComparedCompanies.map((c, idx) => (
                    <Radar
                      key={c.id}
                      name={c.name}
                      dataKey={c.name}
                      stroke={COMPANY_COLORS[idx % COMPANY_COLORS.length]}
                      fill={COMPANY_COLORS[idx % COMPANY_COLORS.length]}
                      fillOpacity={idx === 0 ? 0.35 : 0.15}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Summary Column */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
              Strategic Competitive Takeaways
            </h4>

            <div className="p-3.5 rounded-xl bg-[#09090b] border border-[#27272a] space-y-2">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Growth Leader: {comparativeReport.synthesis.growthLeader}
              </span>
              <p className="text-xs text-[#71717a] leading-relaxed">
                Outpaces peer group with superior enterprise acquisition velocity and recurring revenue expansion.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#09090b] border border-[#27272a] space-y-2">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#10b981]" />
                Margin Leader: {comparativeReport.synthesis.marginLeader}
              </span>
              <p className="text-xs text-[#71717a] leading-relaxed">
                Commands pricing power with minimal hosting or freight unit costs relative to top-line volume.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#09090b] border border-[#27272a] space-y-2">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Leverage Watch: {comparativeReport.synthesis.highestRisk}
              </span>
              <p className="text-xs text-[#71717a] leading-relaxed">
                Exhibits lowest Altman Z-score or highest debt load, requiring ongoing interest coverage surveillance.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeVisualMode === 'trends' && (
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Multi-Year Historical Revenue Comparison ($ USD)
              </h3>
              <p className="text-xs text-[#71717a]">
                Top-line trajectory across all active peers from FY2022 through FY2024.
              </p>
            </div>
          </div>

          <div className="w-full dashboard-visual-container visual-containment aspect-chart-responsive relative [min-height:0]" style={{ minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="period" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} />
                <YAxis
                  stroke="#71717a"
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fafafa' }}
                  formatter={(v: any) => [`$${(Number(v) / 1000000).toFixed(2)}M`, 'Revenue']}
                />
                <Legend wrapperStyle={{ paddingTop: '15px' }} />
                {allComparedCompanies.map((c, idx) => (
                  <Bar
                    key={c.id}
                    dataKey={c.name}
                    name={c.name}
                    fill={COMPANY_COLORS[idx % COMPANY_COLORS.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeVisualMode === 'risks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allComparedCompanies.map((comp, idx) => (
            <div
              key={comp.id}
              className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COMPANY_COLORS[idx % COMPANY_COLORS.length] }}
                    />
                    <div>
                      <h4 className="text-xs font-semibold text-white">{comp.name}</h4>
                      <span className="text-[10px] text-[#71717a] font-mono">{comp.ticker} • {comp.period}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium border ${
                      comp.riskLevel === 'Low'
                        ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30'
                        : comp.riskLevel === 'Moderate'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {comp.riskLevel} Risk Profile
                  </span>
                </div>

                <div className="pt-3 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#10b981] tracking-wider block mb-1">
                      Competitive Strengths
                    </span>
                    <ul className="space-y-1 text-xs text-[#a1a1aa]">
                      {comp.keyStrengths.map((str, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] flex-shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-rose-400 tracking-wider block mb-1">
                      Identified Vulnerabilities
                    </span>
                    <ul className="space-y-1 text-xs text-[#a1a1aa]">
                      {comp.vulnerabilities.map((vuln, vIdx) => (
                        <li key={vIdx} className="flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                          <span>{vuln}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#27272a] flex items-center justify-between text-xs font-mono">
                <span className="text-[#71717a]">Economic Moat:</span>
                <span className="text-white font-semibold">{comp.moatRating} Moat</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Executive Synthesis Dossier */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </span>
          <h3 className="text-sm font-semibold text-white">
            AI Executive Comparative Synthesis Report
          </h3>
        </div>

        <p className="text-xs text-[#a1a1aa] leading-relaxed font-serif text-[13px]">
          "{comparativeReport.synthesis.executiveSummary}"
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {comparativeReport.synthesis.strategicTakeaways.map((takeaway, tIdx) => (
            <div key={tIdx} className="p-3 rounded-xl bg-[#09090b] border border-[#27272a] text-xs space-y-1">
              <span className="font-semibold text-indigo-300 font-mono text-[11px]">Pillar #{tIdx + 1}</span>
              <p className="text-[#71717a] leading-relaxed">{takeaway}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
