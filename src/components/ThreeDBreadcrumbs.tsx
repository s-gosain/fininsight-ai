import React from 'react';
import { 
  ChevronRight, 
  Boxes, 
  FolderTree, 
  Split, 
  FileText, 
  Bookmark, 
  RotateCcw,
  Sparkles,
  Compass,
  BookmarkPlus
} from 'lucide-react';

export interface BreadcrumbStep {
  id: string;
  level: 'root' | 'category' | 'node' | 'subaccount';
  label: string;
  sublabel?: string;
  badge?: string;
  badgeColor?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'zinc';
  isCurrent: boolean;
  onClick: () => void;
}

interface ThreeDBreadcrumbsProps {
  steps: BreadcrumbStep[];
  onResetToRoot: () => void;
  explodedCount: number;
  activePeriod: string;
  viewModeName: string;
  onSaveCurrentViewpoint: () => void;
  onOpenViewpoints: () => void;
  savedViewpointsCount: number;
}

export const ThreeDBreadcrumbs: React.FC<ThreeDBreadcrumbsProps> = ({
  steps,
  onResetToRoot,
  explodedCount,
  activePeriod,
  viewModeName,
  onSaveCurrentViewpoint,
  onOpenViewpoints,
  savedViewpointsCount,
}) => {
  const getLevelIcon = (level: BreadcrumbStep['level']) => {
    switch (level) {
      case 'root':
        return <Boxes className="w-3.5 h-3.5 text-indigo-400" />;
      case 'category':
        return <FolderTree className="w-3.5 h-3.5 text-cyan-400" />;
      case 'node':
        return <Split className="w-3.5 h-3.5 text-emerald-400" />;
      case 'subaccount':
        return <FileText className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const getBadgeClasses = (color?: BreadcrumbStep['badgeColor']) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'amber':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'rose':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'zinc':
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
      case 'indigo':
      default:
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    }
  };

  return (
    <div className="bg-[#141418] border border-[#27272a] rounded-2xl p-3 px-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
      
      {/* Left: Dynamic Drill-Down Trail */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin py-1 pr-2 min-w-0">
        <span className="text-[11px] font-mono text-[#71717a] uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
          <Compass className="w-3.5 h-3.5 text-indigo-400" />
          <span>Drill-Down:</span>
        </span>

        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          return (
            <React.Fragment key={step.id}>
              {idx > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-[#52525b] shrink-0 mx-0.5" />
              )}

              <button
                id={`breadcrumb-step-${step.id}`}
                onClick={step.onClick}
                title={isLast ? 'Current active drill-down level' : `Click to jump back to ${step.label}`}
                className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                  step.isCurrent
                    ? 'bg-indigo-950/70 border-indigo-500/50 text-white font-medium shadow-sm shadow-indigo-500/10'
                    : 'bg-[#18181b] border-[#27272a] hover:border-[#3f3f46] text-[#a1a1aa] hover:text-white hover:bg-[#202024]'
                }`}
              >
                {getLevelIcon(step.level)}
                <span className="truncate max-w-[140px] sm:max-w-[180px]">{step.label}</span>
                
                {step.badge && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${getBadgeClasses(step.badgeColor)}`}>
                    {step.badge}
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Right: Telemetry Badges & Viewpoint Snapshot Buttons */}
      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
        {/* Reset button if drilled down */}
        {steps.length > 1 && (
          <button
            id="breadcrumb-reset-btn"
            onClick={onResetToRoot}
            title="Return to consolidated top-level"
            className="px-2 py-1 rounded-xl bg-[#1c1c20] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white border border-[#2e2e34] transition-all cursor-pointer flex items-center gap-1 text-[11px] font-mono"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Consolidate</span>
          </button>
        )}

        {/* Viewpoint Snapshots Trigger */}
        <div className="flex items-center gap-1 bg-[#18181b] p-0.5 rounded-xl border border-[#27272a]">
          <button
            id="btn-open-viewpoints"
            onClick={onOpenViewpoints}
            title="Browse & apply saved Viewpoint snapshots"
            className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium text-[#d4d4d8] hover:text-white hover:bg-[#27272a] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>Viewpoints</span>
            {savedViewpointsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                {savedViewpointsCount}
              </span>
            )}
          </button>

          <button
            id="btn-save-current-viewpoint"
            onClick={onSaveCurrentViewpoint}
            title="Save current drill-down state & camera angle as a Viewpoint"
            className="p-1 rounded-lg text-[#a1a1aa] hover:text-amber-300 hover:bg-[#27272a] transition-all cursor-pointer"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Exploded node count indicator */}
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#18181b] border border-[#27272a] text-[11px] font-mono text-[#a1a1aa]">
          <span className={`w-1.5 h-1.5 rounded-full ${explodedCount > 0 ? 'bg-indigo-400 animate-pulse' : 'bg-[#52525b]'}`} />
          <span>{explodedCount > 0 ? `${explodedCount} Exploded` : 'Consolidated'}</span>
          <span className="text-[#52525b]">•</span>
          <span className="text-white font-medium">{activePeriod}</span>
        </div>
      </div>

    </div>
  );
};
