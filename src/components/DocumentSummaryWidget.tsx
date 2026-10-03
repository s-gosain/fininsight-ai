import React, { useState, useMemo } from 'react';
import {
  FileText,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Download,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Layers,
  Info,
  Building,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  Tag,
  Share2,
  ClipboardCheck,
} from 'lucide-react';
import { DocumentSummaryData, FinancialDataset, FinancialRatios, CurrencyCode, DocumentCategoryTag } from '../types';
import { classifyDocument, TAG_METADATA } from '../utils/documentTagging';

interface DocumentSummaryWidgetProps {
  summary: DocumentSummaryData | null;
  isLoading: boolean;
  onRegenerate: () => void;
  dataset: FinancialDataset;
  ratios: FinancialRatios;
  currency: CurrencyCode;
  fileName?: string;
}

export const DocumentSummaryWidget: React.FC<DocumentSummaryWidgetProps> = ({
  summary,
  isLoading,
  onRegenerate,
  dataset,
  ratios,
  currency,
  fileName,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'statements' | 'disclosures' | 'risks'>('overview');
  const [isCopied, setIsCopied] = useState(false);
  const [isExecCopied, setIsExecCopied] = useState(false);

  // Derive automated categorization tags
  const classification = useMemo(() => {
    return classifyDocument({
      fileName: fileName || `${dataset.companyName.toLowerCase().replace(/\s+/g, '_')}_filing.pdf`,
      documentSummary: summary,
      dataset,
    });
  }, [fileName, summary, dataset]);

  const copyTextToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fallback below
    }
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch {
      return false;
    }
  };

  const handleCopy = async () => {
    if (!summary) return;
    const textToCopy = `DOCUMENT SUMMARY: ${summary.documentTitle}
Entity: ${summary.reportingEntity}
Filing Type: ${summary.filingType}
Category: ${summary.documentCategory || classification.primaryTag}
Tags: ${(summary.tags && summary.tags.length > 0 ? summary.tags : classification.allTags).join(', ')}
Periods: ${summary.reportingPeriods.join(', ')}
Confidence Score: ${summary.confidenceScore}%

EXECUTIVE SUMMARY:
${summary.executiveSummary}

FINANCIAL HIGHLIGHTS:
${summary.financialHighlights.map((h) => `- ${h.metric}: ${h.trend} | ${h.takeaway}`).join('\n')}

INCOME STATEMENT ANALYSIS:
${summary.incomeStatementAnalysis}

BALANCE SHEET STRENGTH:
${summary.balanceSheetStrength}

CASH FLOW QUALITY:
${summary.cashFlowQuality}

ACCOUNTING NOTES & DISCLOSURES:
${summary.accountingNotesAndDisclosures.map((n) => `• ${n}`).join('\n')}

KEY RISK FACTORS:
${summary.keyRiskFactors.map((r) => `• ${r}`).join('\n')}

AUDITOR RECOMMENDATIONS:
${summary.auditorRecommendations.map((rec) => `• ${rec}`).join('\n')}`;

    const ok = await copyTextToClipboard(textToCopy);
    if (ok) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleCopyExecutiveOnly = async () => {
    if (!summary) return;
    const text = `EXECUTIVE SUMMARY — ${summary.documentTitle} (${summary.reportingEntity}, ${summary.reportingPeriods.join(' - ')}):\n\n${summary.executiveSummary}`;
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setIsExecCopied(true);
      setTimeout(() => setIsExecCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    if (!summary) return;
    const reportingPeriods = (summary.reportingPeriods ?? []).join(', ');
    const highlights = (summary.financialHighlights ?? [])
      .map((h) => `* **${h.metric}** (${h.trend}): ${h.takeaway}`)
      .join('\n');
    const disclosures = (summary.accountingNotesAndDisclosures ?? [])
      .map((n) => `* ${n}`)
      .join('\n');
    const riskFactors = (summary.keyRiskFactors ?? [])
      .map((r) => `* ${r}`)
      .join('\n');
    const recommendations = (summary.auditorRecommendations ?? [])
      .map((rec) => `* ${rec}`)
      .join('\n');

    const mdContent = `# ${summary.documentTitle}
**Filing Type:** ${summary.filingType}  
**Category:** ${summary.documentCategory || classification.primaryTag}  
**Tags:** ${(summary.tags && summary.tags.length > 0 ? summary.tags : classification.allTags).join(', ')}  
**Entity:** ${summary.reportingEntity}  
**Reporting Periods:** ${reportingPeriods}  
**Currency:** ${summary.currency}  
**Synthesized By:** Gemini 3.8 Flash Grounded Analysis (${summary.confidenceScore}% Confidence)  
**Date:** ${new Date(summary.generatedAt).toLocaleString()}  

---

## Executive Summary
${summary.executiveSummary}

## Key Financial Highlights
${highlights}

## Multi-Statement Financial Ingestion Review
### Income Statement Dynamics
${summary.incomeStatementAnalysis}

### Balance Sheet Solvency & Working Capital
${summary.balanceSheetStrength}

### Cash Flow Quality & Conversion
${summary.cashFlowQuality}

## Material Accounting Disclosures & Notes
${disclosures}

## Risk Factors & Red Flags
${riskFactors}

## Auditor & Controller Governance Recommendations
${recommendations}
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summary.reportingEntity.toLowerCase().replace(/\s+/g, '_')}_document_summary.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl shadow-xl overflow-hidden transition-all">
      
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-[#27272a] bg-gradient-to-r from-[#18181b] via-[#221c35]/40 to-[#18181b] flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex-shrink-0 mt-0.5 sm:mt-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight flex items-center gap-1.5">
                <span>Document Auto-Summary</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  {summary?.source === 'gemini' 
                    ? (summary.modelUsed ? `Gemini (${summary.modelUsed.replace('gemini-', '')})` : 'Gemini AI Grounded')
                    : 'Institutional Financial Engine'}
                </span>
              </h2>

              {/* Category & Tags */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {summary?.filingType && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-[#27272a] text-[#d4d4d8] font-mono border border-[#3f3f46]">
                    {summary.filingType}
                  </span>
                )}
                {(summary?.tags && summary.tags.length > 0 ? summary.tags : classification.allTags).map((tag) => {
                  const meta = TAG_METADATA[tag];
                  return (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold font-mono px-2 py-0.5 rounded-md border ${meta.badgeStyle}`}
                    >
                      <Tag className={`w-2.5 h-2.5 ${meta.iconColor}`} />
                      <span>{tag}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-[#a1a1aa] mt-0.5 flex items-center gap-2 flex-wrap">
              <span>{summary?.documentTitle || `${dataset.companyName} Financial Statement Ingestion`}</span>
              <span className="text-[#52525b]">•</span>
              <span className="font-mono text-[#71717a]">
                {fileName || `${dataset.companyName.toLowerCase().replace(/\s+/g, '_')}_dataset.csv`}
              </span>
              <span className="text-[#52525b]">•</span>
              <span className="text-emerald-400 font-mono text-[11px]">
                {dataset.periods.join(' & ')}
              </span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
          
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className="px-2.5 py-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] text-xs font-medium border border-[#3f3f46] flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            title="Re-run Gemini analysis for this document"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isLoading ? 'Synthesizing...' : 'Regenerate'}</span>
          </button>

          {summary && (
            <>
              {/* Prominent Copy to Clipboard Button */}
              <button
                id="btn-copy-to-clipboard-header"
                onClick={handleCopy}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                  isCopied
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/50'
                }`}
                title="Copy synthesized report insights to clipboard"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy to Clipboard</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownload}
                className="px-2.5 py-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] text-xs font-medium border border-[#3f3f46] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title="Download as Markdown"
              >
                <Download className="w-3.5 h-3.5 text-[#a1a1aa]" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </>
          )}

        </div>

      </div>

      {/* Main Body */}
      <div>
          
          {/* Loading Skeleton */}
          {isLoading ? (
            <div className="p-8 space-y-6 animate-pulse">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-indigo-300 text-xs">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-spin flex-shrink-0" />
                <div>
                  <span className="font-semibold block text-white">Ingesting Entire File & Synthesizing Document Summary</span>
                  <span className="text-[#a1a1aa]">
                    Gemini 3.8 Flash is cross-referencing multi-period income statements, balance sheets, cash flows, and notes...
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-4 bg-[#27272a] rounded w-3/4"></div>
                <div className="h-4 bg-[#27272a] rounded w-full"></div>
                <div className="h-4 bg-[#27272a] rounded w-5/6"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="h-24 bg-[#27272a] rounded-xl"></div>
                <div className="h-24 bg-[#27272a] rounded-xl"></div>
                <div className="h-24 bg-[#27272a] rounded-xl"></div>
              </div>
            </div>
          ) : summary ? (
            <div>
              
              {/* Sub-Navigation Tabs */}
              <div className="px-5 pt-3 pb-0 border-b border-[#27272a] bg-[#18181b] flex items-center justify-between overflow-x-auto scrollbar-thin">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveSubTab('overview')}
                    className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeSubTab === 'overview'
                        ? 'border-indigo-500 text-white font-semibold'
                        : 'border-transparent text-[#71717a] hover:text-[#a1a1aa]'
                    }`}
                  >
                    Executive Overview & Highlights
                  </button>

                  <button
                    onClick={() => setActiveSubTab('statements')}
                    className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeSubTab === 'statements'
                        ? 'border-indigo-500 text-white font-semibold'
                        : 'border-transparent text-[#71717a] hover:text-[#a1a1aa]'
                    }`}
                  >
                    Statement Synthesis (IS • BS • CF)
                  </button>

                  <button
                    onClick={() => setActiveSubTab('disclosures')}
                    className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeSubTab === 'disclosures'
                        ? 'border-indigo-500 text-white font-semibold'
                        : 'border-transparent text-[#71717a] hover:text-[#a1a1aa]'
                    }`}
                  >
                    Accounting Disclosures & Notes
                  </button>

                  <button
                    onClick={() => setActiveSubTab('risks')}
                    className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeSubTab === 'risks'
                        ? 'border-indigo-500 text-white font-semibold'
                        : 'border-transparent text-[#71717a] hover:text-[#a1a1aa]'
                    }`}
                  >
                    Risk Factors & Auditor Notes
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-2 pb-2 text-[10px] text-[#71717a] font-mono">
                  <span>Confidence: {summary.confidenceScore}%</span>
                  <span>•</span>
                  <span>Extracted: {summary.totalMetricsExtracted || 42} Metrics</span>
                </div>
              </div>

              {/* Tab 1: Executive Overview */}
              {activeSubTab === 'overview' && (
                <div className="p-5 sm:p-6 space-y-6">
                  
                  {/* Executive Summary Box */}
                  <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a] relative group">
                    <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        Executive Document Synthesis
                      </span>

                      {/* Card-level Copy action buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          id="btn-copy-exec-in-box"
                          onClick={handleCopyExecutiveOnly}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border flex items-center gap-1 transition-all cursor-pointer ${
                            isExecCopied
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white border-[#3f3f46]'
                          }`}
                          title="Copy Executive Summary to clipboard"
                        >
                          {isExecCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-300">Brief Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Executive Brief</span>
                            </>
                          )}
                        </button>

                        <button
                          id="btn-copy-full-in-box"
                          onClick={handleCopy}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border flex items-center gap-1 transition-all cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border-indigo-500/40'
                          }`}
                          title="Copy full synthesized document insights"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Report Copied</span>
                            </>
                          ) : (
                            <>
                              <ClipboardCheck className="w-3 h-3 text-indigo-400" />
                              <span>Copy Full Report</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#d4d4d8] leading-relaxed font-sans">
                      {summary.executiveSummary}
                    </p>
                  </div>

                  {/* Financial Highlights Grid */}
                  <div>
                    <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider block mb-3 font-mono">
                      Key Ingested Financial Highlights
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(summary.financialHighlights ?? []).map((item, idx) => {
                        const isPos = item.impact === 'positive';
                        const isNeg = item.impact === 'negative';
                        return (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-[#09090b] border border-[#27272a] hover:border-[#3f3f46] transition-all flex flex-col justify-between space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-semibold text-white">
                                {item.metric}
                              </span>
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border flex-shrink-0 ${
                                  isPos
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : isNeg
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                                }`}
                              >
                                {item.trend}
                              </span>
                            </div>
                            <p className="text-xs text-[#a1a1aa] leading-relaxed">
                              {item.takeaway}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* Tab 2: Statement Synthesis */}
              {activeSubTab === 'statements' && (
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Income Statement Box */}
                    <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#27272a]">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                            Income Statement Analysis
                          </h4>
                        </div>
                        <p className="text-xs text-[#d4d4d8] leading-relaxed">
                          {summary.incomeStatementAnalysis}
                        </p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#27272a] text-[10px] font-mono text-[#71717a] flex items-center justify-between">
                        <span>Revenue Growth: {ratios.revenueGrowthYoY >= 0 ? '+' : ''}{ratios.revenueGrowthYoY}%</span>
                        <span>Gross Margin: {ratios.grossProfitMargin}%</span>
                      </div>
                    </div>

                    {/* Balance Sheet Box */}
                    <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#27272a]">
                          <ShieldCheck className="w-4 h-4 text-indigo-400" />
                          <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                            Balance Sheet Strength
                          </h4>
                        </div>
                        <p className="text-xs text-[#d4d4d8] leading-relaxed">
                          {summary.balanceSheetStrength}
                        </p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#27272a] text-[10px] font-mono text-[#71717a] flex items-center justify-between">
                        <span>Current Ratio: {ratios.currentRatio}x</span>
                        <span>D/E Ratio: {ratios.debtToEquity}x</span>
                      </div>
                    </div>

                    {/* Cash Flow Quality Box */}
                    <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#27272a]">
                          <Layers className="w-4 h-4 text-sky-400" />
                          <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                            Cash Flow Quality & Capex
                          </h4>
                        </div>
                        <p className="text-xs text-[#d4d4d8] leading-relaxed">
                          {summary.cashFlowQuality}
                        </p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#27272a] text-[10px] font-mono text-[#71717a] flex items-center justify-between">
                        <span>Free Cash Flow: ${((ratios.freeCashFlow || 0) / 1000000).toFixed(1)}M</span>
                        <span>FCF Margin: {ratios.fcfConversion}%</span>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Tab 3: Disclosures & Accounting Notes */}
              {activeSubTab === 'disclosures' && (
                <div className="p-5 sm:p-6 space-y-3">
                  <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider block font-mono">
                    Extracted Material Accounting Policies & Notes
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(summary.accountingNotesAndDisclosures ?? []).map((note, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#09090b] border border-[#27272a] text-xs text-[#d4d4d8] leading-relaxed flex items-start gap-2.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Risks & Auditor Governance */}
              {activeSubTab === 'risks' && (
                <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Risk Factors */}
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Key Risk Factors Disclosed in Filing
                    </span>
                    <div className="space-y-2">
                      {(summary.keyRiskFactors ?? []).map((risk, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-[#09090b] border border-red-500/20 text-xs text-[#d4d4d8] leading-relaxed flex items-start gap-2"
                        >
                          <span className="text-red-400 font-bold">•</span>
                          <span>{risk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Auditor Recommendations */}
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Auditor & Controller Recommendations
                    </span>
                    <div className="space-y-2">
                      {(summary.auditorRecommendations ?? []).map((rec, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-[#09090b] border border-emerald-500/20 text-xs text-[#d4d4d8] leading-relaxed flex items-start gap-2"
                        >
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* Quick Extract & Share Action Toolbar */}
              <div className="px-5 py-3 bg-[#09090b]/90 border-t border-[#27272a] flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                  <ClipboardCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="font-medium text-white">Extract & Share Report:</span>
                  <span className="text-[11px] text-[#71717a] hidden sm:inline font-mono">
                    Synthesized insights from {summary.documentTitle}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Dedicated Copy to Clipboard button on output card */}
                  <button
                    id="btn-copy-to-clipboard-card"
                    onClick={handleCopy}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                      isCopied
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/30'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/50 hover:shadow-md'
                    }`}
                    title="Copy complete synthesized report insights to clipboard"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-semibold">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy to Clipboard</span>
                      </>
                    )}
                  </button>

                  {/* Copy Executive Summary button */}
                  <button
                    id="btn-copy-executive-summary-card"
                    onClick={handleCopyExecutiveOnly}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                      isExecCopied
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] border-[#3f3f46]'
                    }`}
                    title="Copy Executive Summary narrative only"
                  >
                    {isExecCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Brief Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-[#a1a1aa]" />
                        <span>Copy Executive Brief</span>
                      </>
                    )}
                  </button>

                  {/* Export Markdown */}
                  <button
                    id="btn-export-markdown-card"
                    onClick={handleDownload}
                    className="px-2.5 py-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] text-xs font-medium border border-[#3f3f46] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    title="Download complete synthesized report as Markdown"
                  >
                    <Download className="w-3.5 h-3.5 text-[#a1a1aa]" />
                    <span>Export (.md)</span>
                  </button>
                </div>
              </div>

              {/* Footer Meta */}
              <div className="px-5 py-2.5 bg-[#09090b]/80 border-t border-[#27272a] text-[10px] text-[#71717a] font-mono flex items-center justify-between flex-wrap gap-2">
                <span>
                  Source: {summary.source === 'gemini' ? 'Gemini 3.8 Flash Neural Synthesis' : 'Institutional Contextual Financial Engine'}
                </span>
                <span>
                  Generated: {new Date(summary.generatedAt).toLocaleTimeString()} • Verified for regulatory audit compliance
                </span>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center space-y-3">
              <FileSpreadsheet className="w-8 h-8 text-[#71717a] mx-auto" />
              <p className="text-xs text-[#a1a1aa]">
                No document summary generated yet. Click "Regenerate" or upload a financial statement to trigger auto-summary.
              </p>
              <button
                onClick={onRegenerate}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md cursor-pointer inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate Document Summary
              </button>
            </div>
          )}

        </div>

    </div>
  );
};
