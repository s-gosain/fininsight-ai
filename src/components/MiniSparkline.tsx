import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';

export interface SparklinePoint {
  quarter: string; // e.g. "Q1", "Q2", "Q3", "Q4" or "Q1 '24"
  value: number;
  formatted?: string;
}

interface MiniSparklineProps {
  data: SparklinePoint[];
  color?: 'emerald' | 'indigo' | 'cyan' | 'amber' | 'rose' | 'purple' | 'blue';
  isDataMasked?: boolean;
  height?: number;
  showLabels?: boolean;
  trendLabel?: string;
}

const COLOR_MAP = {
  emerald: {
    stroke: '#10b981',
    fillStart: 'rgba(16, 185, 129, 0.35)',
    fillEnd: 'rgba(16, 185, 129, 0.02)',
    dot: '#34d399',
    badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  cyan: {
    stroke: '#06b6d4',
    fillStart: 'rgba(6, 182, 212, 0.35)',
    fillEnd: 'rgba(6, 182, 212, 0.02)',
    dot: '#22d3ee',
    badge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  },
  indigo: {
    stroke: '#6366f1',
    fillStart: 'rgba(99, 102, 241, 0.35)',
    fillEnd: 'rgba(99, 102, 241, 0.02)',
    dot: '#818cf8',
    badge: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  },
  blue: {
    stroke: '#3b82f6',
    fillStart: 'rgba(59, 130, 246, 0.35)',
    fillEnd: 'rgba(59, 130, 246, 0.02)',
    dot: '#60a5fa',
    badge: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  amber: {
    stroke: '#f59e0b',
    fillStart: 'rgba(245, 158, 11, 0.35)',
    fillEnd: 'rgba(245, 158, 11, 0.02)',
    dot: '#fbbf24',
    badge: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  rose: {
    stroke: '#f43f5e',
    fillStart: 'rgba(244, 63, 94, 0.35)',
    fillEnd: 'rgba(244, 63, 94, 0.02)',
    dot: '#fb7185',
    badge: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  },
  purple: {
    stroke: '#a855f7',
    fillStart: 'rgba(168, 85, 247, 0.35)',
    fillEnd: 'rgba(168, 85, 247, 0.02)',
    dot: '#c084fc',
    badge: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
};

export const MiniSparkline: React.FC<MiniSparklineProps> = ({
  data,
  color = 'indigo',
  isDataMasked = false,
  height = 32,
  showLabels = true,
  trendLabel,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return null;
  }

  const palette = COLOR_MAP[color] || COLOR_MAP.indigo;
  const gradientId = `sparkline-grad-${color}-${Math.random().toString(36).substring(2, 8)}`;

  // SVG Coordinates mapping
  const width = 160;
  const svgHeight = height;
  const padX = 8;
  const padY = 5;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min === 0 ? 1 : max - min;

  // Calculate coordinates for points
  const points = data.map((item, idx) => {
    const x = padX + (idx / Math.max(1, data.length - 1)) * (width - padX * 2);
    // Invert Y because SVG 0 is top
    const normalized = (item.value - min) / range;
    const y = svgHeight - padY - normalized * (svgHeight - padY * 2);
    return { ...item, x, y };
  });

  // Generate smooth SVG path
  let pathD = '';
  let areaD = '';

  if (points.length === 1) {
    pathD = `M ${points[0].x} ${points[0].y}`;
  } else {
    // Generate curved path using monotonic spline / control points
    pathD = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      pathD += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    // Closed area path for gradient
    const firstX = points[0].x.toFixed(1);
    const lastX = points[points.length - 1].x.toFixed(1);
    const bottomY = (svgHeight).toFixed(1);
    areaD = `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }

  // Calculate Q4 vs Q1 trend percentage
  const firstVal = data[0]?.value ?? 0;
  const lastVal = data[data.length - 1]?.value ?? 0;
  const deltaPct = firstVal !== 0 ? (((lastVal - firstVal) / Math.abs(firstVal)) * 100).toFixed(1) : '0.0';
  const isUp = lastVal >= firstVal;

  return (
    <div className="w-full select-none" onMouseLeave={() => setHoveredIdx(null)}>
      {/* Top micro status bar */}
      <div className="flex items-center justify-between text-[10px] font-mono mb-1 text-[#71717a]">
        <span className="flex items-center gap-1 font-medium">
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: palette.stroke }} />
          <span>4-Quarter Trend</span>
        </span>
        
        {trendLabel ? (
          <span className="text-[10px] text-[#a1a1aa] font-medium">{trendLabel}</span>
        ) : isDataMasked ? (
          <span className="text-[10px] text-[#52525b]">••••••••</span>
        ) : (
          <span className={`font-semibold text-[10px] flex items-center gap-1.5 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            <span className="flex items-center gap-0.5">
              {isUp ? (
                <ArrowUpRight className="w-3 h-3 shrink-0" />
              ) : (
                <ArrowDownRight className="w-3 h-3 shrink-0" />
              )}
              <span>{isUp ? `+${deltaPct}%` : `${deltaPct}%`}</span>
            </span>
            <span className="text-[#52525b] text-[9px] font-normal flex items-center gap-0.5">
              <span>Q1</span>
              <ArrowRight className="w-2.5 h-2.5 shrink-0 text-[#52525b]" />
              <span>Q4</span>
            </span>
          </span>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden rounded-md bg-[#09090b]/40 py-1">
        <svg
          viewBox={`0 0 ${width} ${svgHeight}`}
          className="w-full overflow-visible"
          style={{ height: `${svgHeight}px` }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={palette.stroke} stopOpacity={0.4} />
              <stop offset="100%" stopColor={palette.stroke} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          {!isDataMasked && areaD && (
            <path d={areaD} fill={`url(#${gradientId})`} />
          )}

          {/* Grid Baseline */}
          <line
            x1={padX}
            y1={svgHeight - 1}
            x2={width - padX}
            y2={svgHeight - 1}
            stroke="#27272a"
            strokeWidth={0.75}
            strokeDasharray="2,2"
          />

          {/* Sparkline Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke={palette.stroke}
            strokeWidth={isDataMasked ? 1.5 : 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={isDataMasked ? '3,3' : undefined}
          />

          {/* Points */}
          {!isDataMasked &&
            points.map((pt, idx) => {
              const isHovered = hoveredIdx === idx;
              const isLast = idx === points.length - 1;
              return (
                <g key={idx}>
                  {/* Outer glow ring for latest quarter */}
                  {isLast && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={4}
                      fill="none"
                      stroke={palette.dot}
                      strokeWidth={1}
                      opacity={0.6}
                      className="animate-pulse"
                    />
                  )}
                  {/* Main dot */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 3.5 : isLast ? 2.75 : 1.75}
                    fill={isLast || isHovered ? palette.dot : '#18181b'}
                    stroke={palette.stroke}
                    strokeWidth={isLast || isHovered ? 1.5 : 1}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredIdx(idx)}
                  />
                </g>
              );
            })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIdx !== null && !isDataMasked && points[hoveredIdx] && (
          <div
            className="absolute -top-6 transform -translate-x-1/2 pointer-events-none z-20 px-1.5 py-0.5 rounded bg-[#18181b] border border-[#3f3f46] shadow-md text-[9px] font-mono text-white whitespace-nowrap"
            style={{
              left: `${(points[hoveredIdx].x / width) * 100}%`,
            }}
          >
            <span className="text-indigo-300 font-semibold">{points[hoveredIdx].quarter}:</span>{' '}
            <span>{points[hoveredIdx].formatted || points[hoveredIdx].value}</span>
          </div>
        )}
      </div>

      {/* Quarter Labels (Q1, Q2, Q3, Q4) */}
      {showLabels && (
        <div className="flex items-center justify-between text-[9px] font-mono text-[#52525b] mt-1 px-1">
          {data.map((item, idx) => {
            const isHovered = hoveredIdx === idx;
            const isLatest = idx === data.length - 1;
            return (
              <span
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                className={`transition-colors cursor-pointer ${
                  isHovered
                    ? 'text-white font-bold'
                    : isLatest
                    ? 'text-[#a1a1aa] font-semibold'
                    : 'hover:text-[#a1a1aa]'
                }`}
              >
                {item.quarter}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
