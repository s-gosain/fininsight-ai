import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  HelpCircle, 
  Layers, 
  Compass, 
  AlertTriangle, 
  Target, 
  ShieldCheck, 
  Calculator, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { METRIC_DEFINITIONS, MetricDefinition } from '../utils/metricDefinitions';
import { FinancialRatios, CurrencyCode, FinancialDataset } from '../types';

interface MetricInfoPopoverProps {
  metricId: string;
  triggerRect: DOMRect | null;
  isOpen: boolean;
  onClose: () => void;
  ratios: FinancialRatios;
  dataset: FinancialDataset;
  currency: CurrencyCode;
}

export const MetricInfoPopover: React.FC<MetricInfoPopoverProps> = ({
  metricId,
  triggerRect,
  isOpen,
  onClose,
  ratios,
  dataset,
  currency,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; position: 'top' | 'bottom' | 'center' }>({
    top: 0,
    left: 0,
    position: 'bottom',
  });

  const def: MetricDefinition = METRIC_DEFINITIONS[metricId] || {
    id: metricId,
    title: metricId.replace(/_/g, ' ').toUpperCase(),
    category: 'Quality',
    formulaDisplay: `${metricId} = Derived from Financial Statements`,
    description: 'Financial ratio measuring corporate operational health.',
    getSectorInsight: (industry) => ({
      sectorLabel: industry || 'Enterprise Sector',
      whyCritical: 'Key barometer for assessing ongoing corporate performance and capital allocation.',
      benchmarkTarget: 'Optimal: In line with top-quartile industry peers.',
      sectorRisk: 'Sudden deviation signals fundamental operating volatility.',
    }),
    cfoAuditTip: 'Compare with multi-period filings to verify trend consistency.',
  };

  const actuals = def.getActualsBreakdown ? def.getActualsBreakdown(ratios, dataset, currency) : null;
  const sectorInsight = def.getSectorInsight(dataset?.industry || 'Enterprise Sector', ratios, dataset);

  // Position calculation with viewport bounds checking
  useEffect(() => {
    if (!isOpen) return;

    const computePosition = () => {
      const isMobile = window.innerWidth < 640;
      if (isMobile || !triggerRect) {
        setCoords({ top: 0, left: 0, position: 'center' });
        return;
      }

      const popoverWidth = Math.min(420, window.innerWidth - 32);
      const popoverEstimatedHeight = 440;
      const margin = 10;

      let left = triggerRect.left + (triggerRect.width / 2) - (popoverWidth / 2);
      // Bound horizontally
      if (left + popoverWidth > window.innerWidth - margin) {
        left = window.innerWidth - popoverWidth - margin;
      }
      if (left < margin) {
        left = margin;
      }

      // Check vertical space: prefers bottom, flips top if close to bottom of screen
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      let top = 0;
      let position: 'top' | 'bottom' | 'center' = 'bottom';

      if (spaceBelow < popoverEstimatedHeight && triggerRect.top > popoverEstimatedHeight) {
        top = triggerRect.top - margin - popoverEstimatedHeight;
        position = 'top';
      } else {
        top = triggerRect.bottom + margin;
        position = 'bottom';
      }

      // Guard top boundary
      if (top < margin) top = margin;

      setCoords({ top, left, position });
    };

    computePosition();
    window.addEventListener('resize', computePosition);
    window.addEventListener('scroll', computePosition, true);

    return () => {
      window.removeEventListener('resize', computePosition);
      window.removeEventListener('scroll', computePosition, true);
    };
  }, [isOpen, triggerRect]);

  // Handle escape key and outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Use timeout so trigger click doesn't immediately dismiss
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isCenterModal = coords.position === 'center';

  const content = (
    <div 
      className={`fixed inset-0 z-[9999] ${isCenterModal ? 'bg-black/65 backdrop-blur-xs flex items-center justify-center p-3' : 'pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`metric-info-title-${def.id}`}
    >
      <div
        ref={popoverRef}
        style={!isCenterModal ? {
          position: 'fixed',
          top: `${coords.top}px`,
          left: `${coords.left}px`,
          maxWidth: '440px',
          width: 'calc(100vw - 32px)',
        } : {
          maxWidth: '460px',
          width: '100%',
        }}
        className={`pointer-events-auto bg-[#18181b] border border-[#3f3f46] text-[#fafafa] rounded-xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-150 ring-1 ring-indigo-500/20`}
      >
        {/* Top Header */}
        <div className="bg-[#1c1c20] border-b border-[#27272a] px-4 py-3 flex items-start justify-between gap-3 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider">
                {def.category} KPI
              </span>
              <span className="text-[10px] font-mono text-[#a1a1aa] bg-[#27272a] px-2 py-0.5 rounded border border-[#3f3f46] truncate max-w-[200px]" title={dataset?.industry}>
                {dataset?.industry || 'Enterprise'}
              </span>
            </div>
            <h3 id={`metric-info-title-${def.id}`} className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 truncate">
              <span>{def.title}</span>
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Close Popover (Esc)"
            className="p-1 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto custom-scrollbar text-xs leading-relaxed">

          {/* 1. Mathematical Calculation Formula Section */}
          <div className="bg-[#09090b] border border-[#27272a] rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-indigo-400 font-mono text-[11px] font-semibold uppercase tracking-wider">
                <Calculator className="w-3.5 h-3.5" />
                <span>Calculation Formula</span>
              </div>
              <span className="text-[10px] text-[#71717a] font-mono">Standard US-GAAP / IFRS</span>
            </div>

            {/* Formula Monospace Banner */}
            <div className="bg-[#121215] border border-indigo-500/25 rounded-md p-2.5 text-indigo-200 font-mono text-[11px] sm:text-[12px] font-medium text-center break-words shadow-inner">
              {def.formulaDisplay}
            </div>

            {/* Numerator / Denominator Anatomy */}
            {(def.numeratorLabel || def.denominatorLabel) && (
              <div className="pt-1.5 border-t border-[#27272a]/60 grid grid-cols-1 gap-1.5 text-[11px] font-mono">
                {def.numeratorLabel && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-indigo-400 font-bold shrink-0">Numerator:</span>
                    <span className="text-[#d4d4d8]">{def.numeratorLabel}</span>
                  </div>
                )}
                {def.denominatorLabel && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-cyan-400 font-bold shrink-0">Denominator:</span>
                    <span className="text-[#d4d4d8]">{def.denominatorLabel}</span>
                  </div>
                )}
                {def.multiplierLabel && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-amber-400 font-bold shrink-0">Scaling:</span>
                    <span className="text-[#d4d4d8]">{def.multiplierLabel}</span>
                  </div>
                )}
              </div>
            )}

            {/* Company Current Active Period Breakdown */}
            {actuals && (
              <div className="mt-2 pt-2 border-t border-[#27272a] flex items-center justify-between text-[11px] bg-[#18181b]/50 px-2 py-1.5 rounded">
                <span className="text-[#a1a1aa] font-medium">{actuals.actualFormula || 'Active Period Value'}:</span>
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="font-bold text-white text-xs">{actuals.computedValue}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-sans ${
                    actuals.isPositive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {actuals.evaluation}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Why Critical for Current Sector Section */}
          <div className="bg-gradient-to-b from-[#1a1c29]/60 to-[#12131a]/80 border border-indigo-500/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-indigo-300 font-mono text-[11px] font-semibold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sector Relevance & Thesis</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 truncate max-w-[150px]">
                {sectorInsight.sectorLabel}
              </span>
            </div>

            <p className="text-[#d4d4d8] text-[11.5px] leading-relaxed">
              {sectorInsight.whyCritical}
            </p>

            <div className="pt-2 border-t border-indigo-500/20 space-y-1.5">
              <div className="flex items-start gap-2 text-[11px]">
                <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-emerald-300">Sector Benchmark: </span>
                  <span className="text-[#a1a1aa]">{sectorInsight.benchmarkTarget}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-300">Sector Risk: </span>
                  <span className="text-[#a1a1aa]">{sectorInsight.sectorRisk}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. CFO / Forensic Audit Tip */}
          <div className="bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 flex items-start gap-2 text-[11px] text-[#a1a1aa]">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Forensic Audit Check: </span>
              <span>{def.cfoAuditTip}</span>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="bg-[#141417] border-t border-[#27272a] px-4 py-2.5 flex items-center justify-between text-xs shrink-0">
          <span className="text-[11px] text-[#71717a] flex items-center gap-1 font-mono">
            <span>Press Esc to close</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors cursor-pointer shadow-sm"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
};
