import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calculator, Compass, Sparkles, Target, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { METRIC_DEFINITIONS, MetricDefinition } from '../utils/metricDefinitions';
import { FinancialRatios, CurrencyCode, FinancialDataset } from '../types';

interface MetricHoverTooltipProps {
  metricId: string;
  ratios: FinancialRatios;
  dataset?: FinancialDataset;
  currency: CurrencyCode;
  isDataMasked?: boolean;
  currentValue?: string;
  onOpenFullInfo?: (id: string, rect: DOMRect) => void;
  children: React.ReactNode;
  className?: string;
}

export const MetricHoverTooltip: React.FC<MetricHoverTooltipProps> = ({
  metricId,
  ratios,
  dataset,
  currency,
  isDataMasked = false,
  currentValue,
  onOpenFullInfo,
  children,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placement: 'top' | 'bottom' }>({
    top: 0,
    left: 0,
    placement: 'bottom',
  });

  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const enterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const def: MetricDefinition = METRIC_DEFINITIONS[metricId] || {
    id: metricId,
    title: metricId.replace(/_/g, ' ').toUpperCase(),
    category: 'Quality',
    formulaDisplay: `${metricId} = Statement Line Item Analysis`,
    description: 'Financial indicator reflecting business operational metrics.',
    getSectorInsight: (industry) => ({
      sectorLabel: industry || 'Enterprise Sector',
      whyCritical: 'Core metric for assessing performance and capital efficiency.',
      benchmarkTarget: 'Target: In line with peer industry medians.',
      sectorRisk: 'Variance indicates operational shifts or accounting anomalies.',
    }),
    cfoAuditTip: 'Audit underlying financial statement classifications.',
  };

  const actuals = def.getActualsBreakdown && dataset ? def.getActualsBreakdown(ratios, dataset, currency) : null;
  const sectorInsight = def.getSectorInsight(dataset?.industry || 'Enterprise', ratios, dataset || ({} as any));

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = Math.min(360, window.innerWidth - 24);
    const tooltipHeight = 280; // approximate
    const margin = 8;

    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    // Keep in viewport horizontally
    if (left + tooltipWidth > window.innerWidth - 12) {
      left = window.innerWidth - tooltipWidth - 12;
    }
    if (left < 12) {
      left = 12;
    }

    // Vertical placement
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    let top = 0;
    let placement: 'top' | 'bottom' = 'bottom';

    if (spaceBelow < tooltipHeight && spaceAbove > tooltipHeight) {
      top = rect.top - margin;
      placement = 'top';
    } else {
      top = rect.bottom + margin;
      placement = 'bottom';
    }

    setCoords({ top, left, placement });
  }, []);

  const handleMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    enterTimerRef.current = setTimeout(() => {
      updatePosition();
      setIsVisible(true);
    }, 140);
  };

  const handleMouseLeave = () => {
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
    leaveTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 180);
  };

  // Reposition on scroll or resize while visible
  useEffect(() => {
    if (!isVisible) return;
    const handleScroll = () => updatePosition();
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isVisible, updatePosition]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-block ${className}`}
    >
      {children}

      {isVisible && typeof document !== 'undefined' && createPortal(
        <div
          ref={tooltipRef}
          onMouseEnter={() => {
            if (leaveTimerRef.current) {
              clearTimeout(leaveTimerRef.current);
              leaveTimerRef.current = null;
            }
          }}
          onMouseLeave={handleMouseLeave}
          style={{
            position: 'fixed',
            top: coords.placement === 'top' ? undefined : `${coords.top}px`,
            bottom: coords.placement === 'top' ? `${window.innerHeight - coords.top}px` : undefined,
            left: `${coords.left}px`,
            maxWidth: '360px',
            width: 'calc(100vw - 24px)',
            zIndex: 99999,
          }}
          className="bg-[#18181b]/98 backdrop-blur-md border border-indigo-500/40 rounded-xl shadow-2xl p-3.5 text-xs text-white space-y-2.5 animate-in fade-in zoom-in-95 duration-150 pointer-events-auto"
          role="tooltip"
          aria-live="polite"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#27272a]">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0 animate-pulse" />
              <div className="truncate">
                <span className="font-bold text-white text-xs truncate block">
                  {def.title}
                </span>
                <span className="text-[10px] text-[#71717a] font-mono">
                  {def.category} Tier
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {currentValue && (
                <span className="text-xs font-bold text-indigo-300 font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
                  {isDataMasked ? '••••••••' : currentValue}
                </span>
              )}
              {onOpenFullInfo && triggerRef.current && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsVisible(false);
                    if (triggerRef.current) {
                      onOpenFullInfo(metricId, triggerRef.current.getBoundingClientRect());
                    }
                  }}
                  className="p-1 rounded text-[#71717a] hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                  title="Open full interactive popover"
                  aria-label={`Open comprehensive details for ${def.title}`}
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Calculation Logic Box */}
          <div className="p-2 rounded-lg bg-[#09090b] border border-[#27272a] space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between text-[#a1a1aa] text-[10px] uppercase font-semibold">
              <span className="flex items-center gap-1">
                <Calculator className="w-3 h-3 text-indigo-400" />
                Calculation Logic
              </span>
              <span className="text-[#71717a]">Formula</span>
            </div>
            <div className="text-indigo-200 font-medium text-[11px] leading-tight break-words bg-[#18181b]/80 p-1.5 rounded border border-[#27272a]">
              {def.formulaDisplay}
            </div>

            {actuals && (
              <div className="text-[#e4e4e7] text-[10px] space-y-0.5 pt-1 border-t border-[#27272a]/60">
                <div className="flex items-center justify-between text-[#71717a]">
                  <span>Active Period Input:</span>
                  <span className="text-[#a1a1aa]">{actuals.actualFormula || dataset?.activePeriod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a1a1aa]">Result:</span>
                  <span className="text-emerald-400 font-bold">
                    {isDataMasked ? '••••••••' : actuals.computedValue}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Deeper Context & Sector Benchmark */}
          <div className="space-y-1.5 text-[11px] leading-relaxed">
            <div className="p-2 rounded-lg bg-indigo-950/25 border border-indigo-500/20 text-[#d4d4d8] space-y-1 text-[10px]">
              <div className="flex items-center gap-1 text-indigo-300 font-semibold">
                <Target className="w-3 h-3 text-indigo-400 shrink-0" />
                <span>Benchmark: {sectorInsight.benchmarkTarget}</span>
              </div>
              <p className="text-[#a1a1aa] text-[10px]">
                {sectorInsight.whyCritical}
              </p>
            </div>

            {def.cfoAuditTip && (
              <div className="flex items-start gap-1 text-[10px] text-[#71717a] font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                <span>CFO Tip: {def.cfoAuditTip}</span>
              </div>
            )}
          </div>

          {/* Interactive footer note */}
          <div className="pt-1.5 border-t border-[#27272a] flex items-center justify-between text-[9px] text-[#71717a] font-mono">
            <span>Hover active • Move cursor over card</span>
            {onOpenFullInfo && (
              <span className="text-indigo-400 hover:underline cursor-pointer">
                Click (i) for deep audit modal
              </span>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
