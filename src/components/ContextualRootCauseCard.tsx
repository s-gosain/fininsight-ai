import React from 'react';
import {
  Sparkles,
  AlertTriangle,
  FileText,
  CheckCircle2,
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Scale,
  BrainCircuit,
  HelpCircle,
} from 'lucide-react';
import { StatisticalAnomalyItem, ContextualRootCauseAnalysis, FinancialDataset } from '../types';

interface ContextualRootCauseCardProps {
  anomaly: StatisticalAnomalyItem;
  rootCause: ContextualRootCauseAnalysis | null;
  isLoading: boolean;
  onRefresh: () => void;
  dataset: FinancialDataset;
}

export const ContextualRootCauseCard: React.FC<ContextualRootCauseCardProps> = ({
  anomaly,
  rootCause,
  isLoading,
  onRefresh,
  dataset,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (!rootCause) return;
    const text = `FORENSIC ROOT CAUSE ANALYSIS: ${anomaly.lineItemName} (${anomaly.period})
Headline: ${rootCause.rootCauseTitle}
Primary Driver: ${rootCause.primaryDriver}
Statistical Interpretation (${anomaly.method === 'Z_SCORE' ? 'Z-Score' : 'IQR'}): ${rootCause.statisticalInterpretation}
Cross-Statement Reference: ${rootCause.financialStatementCrossReference}
Audit Verification: ${rootCause.auditVerificationSteps.join('; ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isZScore = anomaly.method === 'Z_SCORE';

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BrainCircuit className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                Contextual Root Cause
              </h4>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Gemini AI
              </span>
            </div>
            <span className="text-[10px] text-[#71717a]">
              Forensic statement interpretation
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Re-run Gemini Forensic Interpretation"
            className="p-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#a1a1aa] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
          <button
            onClick={handleCopy}
            disabled={!rootCause}
            title="Copy Analysis Memo"
            className="p-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#a1a1aa] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 px-4 text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 animate-pulse">
            <BrainCircuit className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-white">Synthesizing Contextual Root Cause...</p>
            <p className="text-[11px] text-[#71717a] max-w-xs mx-auto">
              Gemini 3.8 Flash is cross-referencing {anomaly.lineItemName} across Income Statement, Balance Sheet, and Cash Flows.
            </p>
          </div>
        </div>
      ) : rootCause ? (
        <div className="space-y-4 text-xs">
          {/* Target Anomaly Headline & Statistical Deviation Pill */}
          <div className="p-3.5 rounded-xl bg-[#09090b] border border-[#27272a] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#71717a] font-mono uppercase tracking-wider">
                {anomaly.period} • {anomaly.category}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                Confidence: {rootCause.confidenceScore}%
              </span>
            </div>

            <h5 className="text-sm font-bold text-white leading-snug">
              {rootCause.rootCauseTitle}
            </h5>

            {/* Deviation Comparison */}
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px] border-t border-[#27272a]">
              <div>
                <span className="text-[#71717a] block text-[10px]">Reported Value</span>
                <span className="text-rose-400 font-bold">${anomaly.actualValue.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-[#71717a] block text-[10px]">Model Baseline</span>
                <span className="text-emerald-400 font-bold">${anomaly.expectedValue.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-[#a1a1aa] flex items-center gap-1 font-mono">
                <Scale className="w-3.5 h-3.5 text-indigo-400" />
                {anomaly.deviationMetric} ({isZScore ? 'Z-Score Breach' : 'IQR Fence Outlier'})
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {rootCause.riskImpact}
              </span>
            </div>
          </div>

          {/* Primary Driver */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-semibold text-indigo-400 tracking-wider flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Primary Accounting & Operational Driver
            </span>
            <p className="text-xs text-[#fafafa] leading-relaxed bg-[#09090b]/60 p-3 rounded-xl border border-[#27272a]">
              {rootCause.primaryDriver}
            </p>
          </div>

          {/* Statistical Interpretation (Z-score or IQR variance explanation) */}
          <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-indigo-300 tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-indigo-400" />
              Statistical Variance Rationale ({isZScore ? 'Z-Score Analysis' : 'Interquartile Range IQR'})
            </span>
            <p className="text-[11px] text-[#e4e4e7] leading-relaxed">
              {rootCause.statisticalInterpretation}
            </p>
          </div>

          {/* Financial Statement Cross-Reference */}
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
            <span className="text-[10px] uppercase font-semibold text-amber-400 tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Statement Cross-Reference Linkage
            </span>
            <p className="text-[11px] text-[#fafafa] leading-relaxed">
              {rootCause.financialStatementCrossReference}
            </p>
          </div>

          {/* Contributing Factors */}
          {rootCause.contributingFactors && rootCause.contributingFactors.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-semibold text-[#a1a1aa] tracking-wider block">
                Underlying Catalysts
              </span>
              <ul className="space-y-1 text-xs text-[#a1a1aa]">
                {rootCause.contributingFactors.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 bg-[#09090b]/40 p-1.5 rounded-lg border border-[#27272a]/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                    <span className="text-[11px] text-[#d4d4d8] leading-snug">{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Audit Verification Protocol */}
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <span className="font-semibold text-emerald-300 block flex items-center gap-1.5 text-xs">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              Prescriptive Audit Verification Protocol:
            </span>
            <ul className="space-y-1.5 text-[11px] text-[#e4e4e7]">
              {rootCause.auditVerificationSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold font-mono">0{idx + 1}.</span>
                  <span className="leading-snug">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Inquiry question */}
          <div className="p-3 rounded-xl bg-[#09090b] border border-[#27272a] text-xs space-y-1">
            <span className="text-[10px] uppercase font-semibold text-[#71717a] flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-indigo-400" />
              Direct Auditor Inquiry to Controller:
            </span>
            <p className="text-white italic leading-relaxed text-[11px]">
              "{anomaly.auditInquiryQuestion}"
            </p>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-[#71717a] space-y-2">
          <HelpCircle className="w-6 h-6 text-[#71717a] mx-auto" />
          <p>No root cause interpretation available. Click refresh to query Gemini AI.</p>
        </div>
      )}
    </div>
  );
};
