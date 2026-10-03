import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  TrendingDown, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Filter, 
  Zap,
  Clock,
  SendHorizontal
} from 'lucide-react';
import { RedFlagItem, WorkspaceType } from '../types';

interface RiskRedFlagsProps {
  redFlags: RedFlagItem[];
  onAnnotateFlag: (flag: RedFlagItem) => void;
  onAskChatAboutFlag: (flag: RedFlagItem) => void;
  workspaceType?: WorkspaceType;
}

export const RiskRedFlags: React.FC<RiskRedFlagsProps> = ({
  redFlags,
  onAnnotateFlag,
  onAskChatAboutFlag,
  workspaceType = 'SOLO_ANALYST',
}) => {
  const [severityFilter, setSeverityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Profitability', 'Solvency', 'Liquidity', 'Operations', 'Budget'];

  const filteredFlags = redFlags.filter((flag) => {
    const matchesSeverity = severityFilter === 'All' || flag.severity === severityFilter;
    const matchesCategory = selectedCategory === 'All' || flag.category === selectedCategory;
    return matchesSeverity && matchesCategory;
  });

  const highCount = redFlags.filter((f) => f.severity === 'High').length;
  const mediumCount = redFlags.filter((f) => f.severity === 'Medium').length;
  const lowCount = redFlags.filter((f) => f.severity === 'Low').length;

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-[#27272a] text-[#a1a1aa] border-[#3f3f46]';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Vulnerability Summary */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-semibold text-white">Automated Red Flag & Risk Detection Engine</h3>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1 max-w-2xl">
            Real-time heuristic & AI multi-period scans for margin erosion, debt covenant risks, working capital drag, and budget anomalies.
          </p>
        </div>

        {/* Severity Counters */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-1.5 font-medium font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            <span>{highCount} High Priority</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-1.5 font-medium font-mono">
            <span>{mediumCount} Medium</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#27272a] border border-[#3f3f46] text-[#a1a1aa] text-xs font-mono">
            <span>{lowCount} Low</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18181b] p-3 rounded-xl border border-[#27272a]">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-[#71717a] font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#27272a] text-white border border-[#3f3f46] shadow-sm'
                  : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Severity Tabs */}
        <div className="flex items-center gap-1 bg-[#09090b] p-1 rounded-lg border border-[#27272a]">
          {(['All', 'High', 'Medium', 'Low'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-0.5 text-xs font-medium rounded transition-all font-mono ${
                severityFilter === sev
                  ? sev === 'High' 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                    : sev === 'Medium' 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                      : 'bg-[#27272a] text-white'
                  : 'text-[#71717a] hover:text-[#a1a1aa]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

      </div>

      {/* Red Flags List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFlags.length > 0 ? (
          filteredFlags.map((flag) => (
            <div
              key={flag.id}
              className="bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all"
            >
              <div>
                {/* Header row with severity & category */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${getSeverityBadge(flag.severity)}`}>
                      {flag.severity.toUpperCase()} RISK
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#09090b] text-[#a1a1aa] border border-[#27272a]">
                      {flag.category}
                    </span>
                  </div>
                  <span className="text-xs text-[#71717a] font-mono">
                    Impact: {flag.impactScore}/100
                  </span>
                </div>

                {/* Metric Name */}
                <h4 className="text-sm font-semibold text-white mb-2">{flag.metric}</h4>

                {/* Comparison Box */}
                <div className="grid grid-cols-2 gap-2 bg-[#09090b] p-2.5 rounded-lg border border-[#27272a] text-xs mb-3">
                  <div>
                    <span className="text-[#71717a] block text-[10px]">Current Value</span>
                    <span className="font-mono font-medium text-red-400">{flag.currentValue}</span>
                  </div>
                  <div>
                    <span className="text-[#71717a] block text-[10px]">Recommended Threshold</span>
                    <span className="font-mono font-medium text-[#10b981]">{flag.threshold}</span>
                  </div>
                </div>

                {/* Observation Note */}
                <p className="text-xs text-[#a1a1aa] leading-relaxed mb-3">
                  <span className="font-medium text-white">Observation: </span>
                  {flag.observation}
                </p>

                {/* Prescriptive Recommendation */}
                <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a] text-xs">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-medium mb-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Mitigation Strategy</span>
                  </div>
                  <p className="text-[#a1a1aa] leading-relaxed">{flag.recommendation}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[#27272a] text-xs">
                <button
                  onClick={() => onAskChatAboutFlag(flag)}
                  className="px-3 py-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-[#3f3f46]"
                >
                  <SendHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Analyze with AI</span>
                </button>

                {workspaceType !== 'SOLO_ANALYST' && (
                  <button
                    onClick={() => onAnnotateFlag(flag)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Pin to Team Notes</span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                  </button>
                )}
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-2 p-12 text-center bg-[#18181b] border border-[#27272a] rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-[#10b981] mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-white">No Red Flags for Selected Filters</h4>
            <p className="text-xs text-[#71717a] mt-1">All monitored metrics in this category are operating within acceptable governance thresholds.</p>
          </div>
        )}
      </div>

    </div>
  );
};
