import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle, 
  Quote, 
  BarChart2, 
  Target, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { SentimentAnalysisResult, FinancialDataset } from '../types';

interface SentimentAnalysisProps {
  sentiment: SentimentAnalysisResult;
  dataset: FinancialDataset;
}

export const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({
  sentiment,
  dataset,
}) => {
  const getSentimentBadge = (tone: string) => {
    switch (tone) {
      case 'Bullish':
        return 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30';
      case 'Moderately Optimistic':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'Neutral':
        return 'bg-[#27272a] text-[#a1a1aa] border-[#3f3f46]';
      case 'Cautious':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-red-500/10 text-red-400 border-red-500/30';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Management Tonality Stance */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left: Big Score & Badge (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider font-mono">Annual Report Sentiment Index</span>
            </div>
            
            <div className="flex items-baseline gap-3 my-1">
              <span className="text-4xl font-semibold text-white font-mono">{sentiment.overallScore}</span>
              <span className="text-sm font-normal text-[#71717a] font-mono">/ 100</span>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded border font-mono ${getSentimentBadge(sentiment.sentiment)}`}>
                {sentiment.sentiment.toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-[#a1a1aa] mt-2 leading-relaxed">
              <span className="font-medium text-white">Management Tone: </span>
              {sentiment.managementTone}
            </p>
          </div>

          {/* Right: 3 Core Pillars (Optimism, Caution, Risk Awareness) (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Optimism Score */}
            <div className="bg-[#09090b] p-3.5 rounded-lg border border-[#27272a]">
              <div className="flex items-center justify-between text-xs text-[#71717a] mb-1">
                <span>Optimism & Growth</span>
                <TrendingUp className="w-4 h-4 text-[#10b981]" />
              </div>
              <div className="text-xl font-semibold text-[#10b981] font-mono">{sentiment.optimismScore}%</div>
              <div className="w-full bg-[#27272a] h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#10b981] h-full rounded-full" style={{ width: `${sentiment.optimismScore}%` }}></div>
              </div>
              <span className="text-[10px] text-[#71717a] mt-1 block">Forward guidance posture</span>
            </div>

            {/* Caution Score */}
            <div className="bg-[#09090b] p-3.5 rounded-lg border border-[#27272a]">
              <div className="flex items-center justify-between text-xs text-[#71717a] mb-1">
                <span>Cost Caution</span>
                <AlertCircle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-semibold text-amber-400 font-mono">{sentiment.cautionScore}%</div>
              <div className="w-full bg-[#27272a] h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: `${sentiment.cautionScore}%` }}></div>
              </div>
              <span className="text-[10px] text-[#71717a] mt-1 block">Expense & hurdle caveats</span>
            </div>

            {/* Risk Awareness Score */}
            <div className="bg-[#09090b] p-3.5 rounded-lg border border-[#27272a]">
              <div className="flex items-center justify-between text-xs text-[#71717a] mb-1">
                <span>Risk Governance</span>
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-xl font-semibold text-indigo-400 font-mono">{sentiment.riskAwarenessScore}%</div>
              <div className="w-full bg-[#27272a] h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${sentiment.riskAwarenessScore}%` }}></div>
              </div>
              <span className="text-[10px] text-[#71717a] mt-1 block">Item 1A risk disclosure rigour</span>
            </div>

          </div>

        </div>
      </div>

      {/* Tonality Clusters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Cluster 1: Bullish Catalysts */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-[11px] font-semibold text-[#10b981] uppercase tracking-wider font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Bullish Growth Catalysts</span>
          </div>
          <div className="space-y-2">
            {sentiment.toneKeywordsDistribution.bullish.map((item, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-[#a1a1aa] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cluster 2: Hedged Caveats */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-[11px] font-semibold text-amber-400 uppercase tracking-wider font-mono">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Hedged Constraints & Headwinds</span>
          </div>
          <div className="space-y-2">
            {sentiment.toneKeywordsDistribution.hedged.map((item, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-[#a1a1aa] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cluster 3: Risk Disclosures */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-[11px] font-semibold text-indigo-400 uppercase tracking-wider font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Statutory Risk Disclosures</span>
          </div>
          <div className="space-y-2">
            {sentiment.toneKeywordsDistribution.riskDisclosures.map((item, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-[#a1a1aa] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MD&A Excerpts with Audit Highlighting */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Quote className="w-4 h-4 text-indigo-400" />
            <h4 className="text-sm font-semibold text-white">Management Discussion & Analysis (MD&A) Excerpts</h4>
          </div>
          <span className="text-xs text-[#71717a] font-mono">Item 7 • Form 10-K Ingestion</span>
        </div>

        <div className="space-y-3">
          {dataset.mdaExcerpts.map((excerpt, idx) => (
            <div key={idx} className="p-3.5 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-[#a1a1aa] leading-relaxed flex items-start gap-3">
              <span className="text-[#71717a] font-mono text-[10px] mt-0.5">§{idx + 1}</span>
              <p className="flex-1">{excerpt}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
