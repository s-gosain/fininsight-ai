import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  LayoutGrid, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Check, 
  Command,
  Smartphone,
  MessageSquareText
} from 'lucide-react';

export interface TourStep {
  id: string;
  targetId: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  hint?: string;
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step-command-palette',
    targetId: 'btn-command-palette',
    title: 'Universal Command Palette',
    subtitle: 'Search statements, switch datasets, & run audits',
    description: 'Press ⌘K or Ctrl+K anywhere to launch the unified Command Palette. Instantly search financial line items, switch benchmark companies, filter audit logs, or toggle confidential data masking without leaving your keyboard.',
    badge: 'Shortcut: ⌘K / Ctrl+K',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    icon: <Search className="w-4 h-4 text-indigo-400" />,
    hint: 'Pro-tip: Press number keys 1-0 inside the palette to jump directly to any tab.',
  },
  {
    id: 'step-ai-chat',
    targetId: 'btn-toggle-chat',
    title: 'Live Financial AI Copilot',
    subtitle: 'Conversational balance sheet & variance intelligence',
    description: 'Tap "AI Chat" anytime to interrogate your active dataset. The Gemini-powered assistant calculates solvency ratios, explains unexpected cash variances, and pinpoints forensic anomalies in seconds.',
    badge: 'AI Assistant',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    icon: <MessageSquareText className="w-4 h-4 text-indigo-400" />,
    hint: 'Ask questions like "Explain the 14% drop in Operating Margin" or "Calculate Beneish M-Score".',
  },
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number; placeAbove: boolean }>({
    top: 0,
    left: 0,
    placeAbove: false,
  });

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  // Calculate target element rect and position tooltip relative to it
  const updatePosition = useCallback(() => {
    if (!isOpen || !currentStep) return;

    const el = document.getElementById(currentStep.targetId);
    if (!el) {
      setTargetRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    setTargetRect(rect);

    const tooltipWidth = Math.min(380, window.innerWidth - 32);
    const tooltipHeight = 260; // Estimated height

    // Determine if tooltip fits below or should be placed above
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const placeAbove = spaceBelow < tooltipHeight + 20 && spaceAbove > tooltipHeight;

    let top = placeAbove 
      ? Math.max(16, rect.top - tooltipHeight - 12)
      : Math.min(window.innerHeight - tooltipHeight - 16, rect.bottom + 12);

    // Center horizontally aligned with target, but clamped to screen
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    left = Math.max(16, Math.min(window.innerWidth - tooltipWidth - 16, left));

    setTooltipPosition({ top, left, placeAbove });
  }, [isOpen, currentStep]);

  // Scroll target element into view smoothly when step changes
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      const el = document.getElementById(currentStep.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      // Re-measure after scrolling completes
      setTimeout(updatePosition, 300);
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, currentStepIndex, currentStep, updatePosition]);

  // Handle window resizing and scrolling while tour is active
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem('fininsight_onboarding_completed', 'true');
    } catch {
      // ignore in private browsing modes
    }
    onClose();
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('fininsight_onboarding_completed', 'true');
    } catch {
      // ignore
    }
    if (onComplete) onComplete();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      id="onboarding-tour-overlay"
      role="dialog"
      aria-label="Getting Started Interactive Tour"
      className="fixed inset-0 z-50 pointer-events-auto select-none"
    >
      {/* Dynamic SVG Spotlight Cutout Backdrop: Leaves target element 100% bright, illuminated and clear */}
      <svg
        className="fixed inset-0 w-full h-full z-40 transition-opacity duration-300"
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => {
          if (targetRect) {
            const { left, right, top, bottom } = targetRect;
            if (
              e.clientX >= left - 6 &&
              e.clientX <= right + 6 &&
              e.clientY >= top - 6 &&
              e.clientY <= bottom + 6
            ) {
              handleDismiss();
              const el = document.getElementById(currentStep.targetId);
              if (el) el.click();
              return;
            }
          }
          handleDismiss();
        }}
        aria-hidden="true"
      >
        <defs>
          <mask id="onboarding-spotlight-mask">
            {/* White covers entire screen (opaque backdrop) */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cuts out the spotlight hole so target element is 100% visible and unmasked */}
            {targetRect && (
              <rect
                x={Math.max(0, targetRect.left - 4)}
                y={Math.max(0, targetRect.top - 4)}
                width={targetRect.width + 8}
                height={targetRect.height + 8}
                rx="10"
                ry="10"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.72)"
          mask="url(#onboarding-spotlight-mask)"
        />
      </svg>

      {/* Target Element Spotlight Cutout Ring */}
      {targetRect && (
        <div
          id="onboarding-spotlight-ring"
          className="fixed pointer-events-none transition-all duration-300 ease-out z-50 rounded-xl ring-4 ring-indigo-500/40 border-2 border-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.5)]"
          style={{
            top: `${Math.max(0, targetRect.top - 4)}px`,
            left: `${Math.max(0, targetRect.left - 4)}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`,
          }}
        />
      )}

      {/* Tooltip Card */}
      <div
        id="onboarding-tooltip-card"
        className="fixed z-50 w-[calc(100vw-32px)] sm:w-[380px] max-w-[380px] max-h-[calc(100vh-32px)] overflow-y-auto bg-[#18181b] border border-[#3f3f46] rounded-2xl shadow-2xl p-5 text-white flex flex-col transition-all duration-200 animate-in fade-in zoom-in-95"
        style={{
          top: targetRect ? `${tooltipPosition.top}px` : '50%',
          left: targetRect ? `${tooltipPosition.left}px` : '50%',
          transform: targetRect ? 'none' : 'translate(-50%, -50%)',
        }}
      >
        {/* Tooltip Top Header */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              {currentStep.icon}
            </div>
            <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${currentStep.badgeColor}`}>
              {currentStep.badge}
            </span>
          </div>

          <button
            id="btn-onboarding-dismiss"
            onClick={handleDismiss}
            title="Dismiss Tour"
            className="p-1 rounded-md text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Content */}
        <h3 className="text-base font-bold text-white tracking-tight mb-1">
          {currentStep.title}
        </h3>
        <p className="text-xs text-indigo-300 font-medium mb-2.5">
          {currentStep.subtitle}
        </p>
        <p className="text-xs text-[#a1a1aa] leading-relaxed mb-3">
          {currentStep.description}
        </p>

        {/* Pro-tip / Hint Box */}
        {currentStep.hint && (
          <div className="p-2 rounded-lg bg-[#09090b] border border-[#27272a] text-[11px] text-[#71717a] font-mono mb-4 flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>{currentStep.hint}</span>
          </div>
        )}

        {/* Footer Navigation & Progress */}
        <div className="pt-2 border-t border-[#27272a] flex items-center justify-between gap-2 mt-auto">
          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-6 bg-indigo-500'
                    : 'w-2 bg-[#3f3f46] hover:bg-[#52525b]'
                }`}
                title={`Go to step ${idx + 1}`}
              />
            ))}
            <span className="text-[10px] font-mono text-[#71717a] ml-1.5">
              {currentStepIndex + 1}/{TOUR_STEPS.length}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                id="btn-onboarding-prev"
                onClick={handlePrev}
                className="px-2.5 py-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-xs font-medium text-[#e4e4e7] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            <button
              id="btn-onboarding-skip"
              onClick={handleDismiss}
              className="px-2.5 py-1.5 text-xs text-[#71717a] hover:text-white transition-colors cursor-pointer"
            >
              Skip
            </button>

            <button
              id="btn-onboarding-next"
              onClick={handleNext}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              {isLastStep ? (
                <>
                  <span>Get Started</span>
                  <Check className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
