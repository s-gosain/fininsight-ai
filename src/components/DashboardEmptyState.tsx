import React from 'react';
import { motion } from 'motion/react';
import { 
  UploadCloud, 
  Sparkles, 
  FileSpreadsheet, 
  BarChart2, 
  ShieldCheck, 
  ArrowRight,
  Database,
  Layers,
  Search,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export interface DashboardEmptyStateProps {
  activeTab: string;
  onLoadDemoData: () => void;
  onUploadClick: () => void;
  onNavigateTab?: (tab: string) => void;
}

interface TabMeta {
  title: string;
  badge: string;
  description: string;
  suggestion: string;
  primaryActionLabel: string;
}

const TAB_METAS: Record<string, TabMeta> = {
  dashboard: {
    title: 'No Financial Records Found',
    badge: 'Onboarding • Financial Dashboard',
    description: 'There are currently no audited financial statements or ratio metrics available for this workspace.',
    suggestion: 'Load an enterprise benchmark model or upload a 10-K filing to populate executive KPIs, liquidity ratios, and visual trend matrices.',
    primaryActionLabel: 'Load Demo Dataset',
  },
  visualization: {
    title: 'No Data for Visualization',
    badge: 'Onboarding • Visual Charts',
    description: 'Interactive financial trend charts require historical period line items to plot multi-year distributions.',
    suggestion: 'Ingest multi-period financial tables to unlock revenue trajectory, expense breakdown, and margin heatmaps.',
    primaryActionLabel: 'Load Multi-Period Data',
  },
  competitors: {
    title: 'No Peer Benchmarks Mapped',
    badge: 'Onboarding • Competitor Analysis',
    description: 'No competitor financial profiles or peer valuation multiples are registered for this company.',
    suggestion: 'Load industry peer groups or configure competitor tickers to benchmark gross margins, EV/EBITDA, and growth velocity.',
    primaryActionLabel: 'Load Competitor Profile',
  },
  anomalies: {
    title: 'No Anomaly Datasets Loaded',
    badge: 'Onboarding • Anomaly Detection',
    description: 'Statistical anomaly algorithms require at least two consecutive reporting periods to evaluate variances.',
    suggestion: 'Import multi-period annual reports (Form 10-K) or quarterly filings to run heuristic divergence detection.',
    primaryActionLabel: 'Load Multi-Year Data',
  },
  benchmarks: {
    title: 'Industry Benchmarks Awaiting Setup',
    badge: 'Onboarding • Sector Benchmarks',
    description: 'Sector quartile distributions and peer benchmarks require industry classification metrics.',
    suggestion: 'Select an enterprise benchmark scenario to compare capital efficiency against Fortune 500 peer percentiles.',
    primaryActionLabel: 'Load Benchmark Model',
  },
  forecasting: {
    title: 'Predictive Runway Awaiting Inputs',
    badge: 'Onboarding • Predictive Forecasting',
    description: 'Monte Carlo trajectory forecasts and scenario simulations require baseline revenue and expense run-rates.',
    suggestion: 'Ingest prior fiscal year statements to project 3-year cash runways, margin sensitivities, and stress-tests.',
    primaryActionLabel: 'Load Baseline Financials',
  },
  redflags: {
    title: 'Zero Risk Red Flags Detected',
    badge: 'Clean Audit • Risk Oversight',
    description: 'No accounting discrepancies, liquidity strains, or governance anomalies were flagged for this dataset.',
    suggestion: 'All financial statements passed SOX 404 integrity rules. You can upload custom ledger files or explore other audit modules.',
    primaryActionLabel: 'Load Scenario with Red Flags',
  },
  statements: {
    title: 'Financial Statements Not Ingested',
    badge: 'Onboarding • Statement Explorer',
    description: 'The Income Statement, Balance Sheet, and Cash Flow tables have not been populated for this workspace.',
    suggestion: 'Upload a CSV, XLSX, or PDF annual filing to automatically extract standard GAAP line items with inline formulas.',
    primaryActionLabel: 'Upload Financial Statements',
  },
  sentiment: {
    title: 'No Management MD&A Disclosures',
    badge: 'Onboarding • Sentiment Analysis',
    description: 'Qualitative tone and sentiment analysis require Management Discussion & Analysis (MD&A) textual filings.',
    suggestion: 'Ingest an annual 10-K report or conference call transcript to parse executive optimism, caution, and risk tone.',
    primaryActionLabel: 'Load Transcripts & Filings',
  },
  budget: {
    title: 'No Budget Variance Records',
    badge: 'Onboarding • Budget Tracking',
    description: 'No department budget allocations or actual spend variances are currently tracked.',
    suggestion: 'Import operational budget data or load a demo enterprise model with department-level variance breakdowns.',
    primaryActionLabel: 'Load Budget Variance Demo',
  },
};

export const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({
  activeTab,
  onLoadDemoData,
  onUploadClick,
  onNavigateTab,
}) => {
  const meta = TAB_METAS[activeTab] || TAB_METAS.dashboard;

  return (
    <div
      id="dashboard-empty-state"
      className="w-full bg-[#121214] border border-[#27272a] rounded-2xl p-6 sm:p-10 text-center relative overflow-hidden shadow-2xl backdrop-blur-md"
    >
      {/* Background ambient lighting */}
      <div 
        aria-hidden="true" 
        className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-transparent to-transparent" 
      />
      <div 
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-indigo-600/10 blur-3xl pointer-events-none rounded-full"
      />

      <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
        
        {/* Subtle Graphic Illustration */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Pulsing halo rings */}
          <div className="absolute w-44 h-44 rounded-full bg-indigo-500/5 animate-ping opacity-30" />
          <div className="absolute w-36 h-36 rounded-full border border-indigo-500/20 animate-pulse" />
          
          {/* Vector SVG Blueprint Graphic */}
          <svg
            className="w-32 h-32 sm:w-40 sm:h-40 drop-shadow-xl"
            viewBox="0 0 160 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="empty-grad-primary" x1="20" y1="20" x2="140" y2="140" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1" stopOpacity="0.8" />
                <stop offset="1" stopColor="#a855f7" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="empty-grad-card" x1="40" y1="40" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#18181b" stopOpacity="0.95" />
                <stop offset="1" stopColor="#09090b" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="empty-grad-bar" x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#818cf8" />
                <stop offset="1" stopColor="#4f46e5" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Isometric Grid Floor Lines */}
            <path
              d="M20 110L80 140L140 110L80 80L20 110Z"
              stroke="#27272a"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <path
              d="M40 95L80 115L120 95"
              stroke="#3f3f46"
              strokeWidth="1"
              strokeDasharray="2 2"
            />

            {/* Glowing Base Platform */}
            <polygon
              points="80,95 130,118 80,140 30,118"
              fill="url(#empty-grad-primary)"
              fillOpacity="0.12"
            />

            {/* Floating Card Stack */}
            <g className="transition-transform duration-700 hover:scale-105">
              {/* Back Card shadow */}
              <rect
                x="46"
                y="34"
                width="68"
                height="60"
                rx="10"
                fill="#18181b"
                stroke="#27272a"
                strokeWidth="1.2"
                transform="rotate(-5 46 34)"
                opacity="0.4"
              />

              {/* Front Primary Floating Glass Card */}
              <rect
                x="44"
                y="36"
                width="72"
                height="68"
                rx="10"
                fill="url(#empty-grad-card)"
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeOpacity="0.6"
              />

              {/* Card Header row */}
              <circle cx="56" cy="48" r="4" fill="#6366f1" />
              <rect x="64" y="46" width="38" height="4" rx="2" fill="#52525b" />

              {/* Chart Silhouette inside card */}
              <rect x="54" y="80" width="8" height="14" rx="2" fill="url(#empty-grad-bar)" />
              <rect x="66" y="72" width="8" height="22" rx="2" fill="url(#empty-grad-bar)" />
              <rect x="78" y="66" width="8" height="28" rx="2" fill="url(#empty-grad-bar)" />
              <rect x="90" y="60" width="8" height="34" rx="2" fill="#818cf8" />

              {/* Subtle Dashed Trend Line */}
              <path
                d="M58 78 Q 72 68, 94 56"
                stroke="#a855f7"
                strokeWidth="2"
                strokeDasharray="3 3"
                strokeLinecap="round"
              />
              <circle cx="94" cy="56" r="3" fill="#a855f7" />
            </g>

            {/* Floating Metric Badge 1 (Top Right) */}
            <g transform="translate(108, 26)">
              <rect width="36" height="18" rx="5" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
              <text x="18" y="12" fill="#818cf8" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                $0.00
              </text>
            </g>

            {/* Floating Metric Badge 2 (Bottom Left) */}
            <g transform="translate(16, 82)">
              <rect width="34" height="18" rx="5" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
              <text x="17" y="12" fill="#a1a1aa" fontSize="8" fontFamily="monospace" textAnchor="middle">
                --%
              </text>
            </g>

            {/* Center Pulsing Sparkle Node */}
            <g transform="translate(74, 98)">
              <circle cx="6" cy="6" r="6" fill="#6366f1" fillOpacity="0.2" className="animate-ping" />
              <circle cx="6" cy="6" r="3" fill="#6366f1" />
            </g>
          </svg>
        </div>

        {/* Tab Category Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>{meta.badge}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
          {meta.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-[#a1a1aa] leading-relaxed mb-1 max-w-lg">
          {meta.description}
        </p>
        <p className="text-xs text-[#71717a] leading-relaxed mb-6 max-w-lg">
          {meta.suggestion}
        </p>

        {/* Onboarding Steps Checklist */}
        <div className="w-full max-w-lg bg-[#18181b]/70 border border-[#27272a] rounded-xl p-3.5 mb-6 text-left space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#71717a] font-semibold flex items-center justify-between">
            <span>Quick Onboarding Guide</span>
            <span className="text-indigo-400 text-[10px]">3 Steps to Analysis</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <div className="flex items-start gap-2 p-2 rounded-lg bg-[#09090b]/60 border border-[#27272a]/50">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                1
              </span>
              <div className="text-[11px]">
                <p className="font-semibold text-[#e4e4e7]">Ingest Filing</p>
                <p className="text-[10px] text-[#71717a]">PDF 10-K, CSV, or sample</p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded-lg bg-[#09090b]/60 border border-[#27272a]/50">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                2
              </span>
              <div className="text-[11px]">
                <p className="font-semibold text-[#e4e4e7]">Extract GAAP</p>
                <p className="text-[10px] text-[#71717a]">18+ ratios & health rating</p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded-lg bg-[#09090b]/60 border border-[#27272a]/50">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                3
              </span>
              <div className="text-[11px]">
                <p className="font-semibold text-[#e4e4e7]">Audit & Export</p>
                <p className="text-[10px] text-[#71717a]">Forecasting & executive brief</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            id="btn-empty-load-demo"
            onClick={onLoadDemoData}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>{meta.primaryActionLabel}</span>
          </button>

          <button
            type="button"
            id="btn-empty-upload-file"
            onClick={onUploadClick}
            className="px-4 py-2 rounded-xl bg-[#18181b] hover:bg-[#27272a] text-white border border-[#3f3f46] text-xs font-medium flex items-center gap-2 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-indigo-400" />
            <span>Upload File (PDF / CSV)</span>
          </button>

          {activeTab !== 'dashboard' && onNavigateTab && (
            <button
              type="button"
              id="btn-empty-view-overview"
              onClick={() => onNavigateTab('dashboard')}
              className="px-3.5 py-2 rounded-xl text-[#a1a1aa] hover:text-white hover:bg-[#18181b] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Go to Main Dashboard</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
