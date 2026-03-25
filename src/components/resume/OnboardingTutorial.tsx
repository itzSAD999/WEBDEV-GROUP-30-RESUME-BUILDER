import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Rocket, Upload, Layout, MessageSquare, Eye, Palette, Sparkles, Download,
  ChevronRight, ChevronLeft, X, Trophy, Zap, Target, PartyPopper,
  MousePointerClick
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────
interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: TourAction;
  highlight?: string;
  position: "center" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
  xpReward: number;
  interactionHint?: string; // e.g. "Try clicking it!"
}

type TourAction =
  | { type: "navigate"; target: "form" | "preview" | "coach" }
  | { type: "click_step"; step: number }
  | { type: "none" };

// ─── Steps ───────────────────────────────────────────────────────
const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Resume Builder! 🎯",
    description: "Let's walk through the builder together. I'll highlight each area and show you how it works.",
    icon: <Rocket className="w-5 h-5" />,
    action: { type: "none" },
    position: "center",
    xpReward: 10,
  },
  {
    id: "upload",
    title: "Import Your Existing CV",
    description: "Got a CV already? Use these buttons to upload a PDF/DOCX or paste text. We'll auto-fill all fields for you.",
    icon: <Upload className="w-5 h-5" />,
    action: { type: "none" },
    highlight: "[title='Upload CV'], [title='Paste Text']",
    position: "bottom-center",
    xpReward: 10,
    interactionHint: "👆 These buttons are highlighted above",
  },
  {
    id: "personal",
    title: "Start with Personal Info",
    description: "This is where you fill in your name, email, phone, and links. It appears at the top of your resume.",
    icon: <Layout className="w-5 h-5" />,
    action: { type: "click_step", step: 0 },
    position: "bottom-left",
    xpReward: 15,
    interactionHint: "📝 The form on the right is now showing this section",
  },
  {
    id: "profile",
    title: "Write Your Profile Summary",
    description: "A 2-3 sentence professional summary. This is the first thing recruiters read — make it count!",
    icon: <Layout className="w-5 h-5" />,
    action: { type: "click_step", step: 1 },
    position: "bottom-left",
    xpReward: 15,
    interactionHint: "📝 Check the form — it switched to Profile",
  },
  {
    id: "experience",
    title: "Add Work Experience",
    description: "List your jobs with bullet points. Use action verbs like 'Led', 'Built', 'Increased' for maximum impact.",
    icon: <Layout className="w-5 h-5" />,
    action: { type: "click_step", step: 3 },
    position: "bottom-left",
    xpReward: 20,
    interactionHint: "📝 The Work Experience form is now active",
  },
  {
    id: "coach",
    title: "Meet Your AI Coach",
    description: "This panel scores your resume in real-time and gives improvement tips. It has Score, Tips, Tailor, and Chat tabs.",
    icon: <MessageSquare className="w-5 h-5" />,
    action: { type: "navigate", target: "coach" },
    highlight: "[data-coach-panel]",
    position: "bottom-left",
    xpReward: 20,
    interactionHint: "👈 The AI Coach panel is highlighted on the left",
  },
  {
    id: "preview",
    title: "Live Preview",
    description: "Your resume updates in real-time as you type. Select any text here to get instant AI suggestions.",
    icon: <Eye className="w-5 h-5" />,
    action: { type: "navigate", target: "preview" },
    highlight: ".resume-template",
    position: "bottom-right",
    xpReward: 15,
    interactionHint: "👉 Your live resume preview is highlighted on the right",
  },
  {
    id: "template",
    title: "Choose a Template",
    description: "Click the 'Template' button to switch between 6 ATS-optimized styles — Classic, Creative, Stanford, MIT, and more.",
    icon: <Palette className="w-5 h-5" />,
    action: { type: "navigate", target: "preview" },
    position: "bottom-right",
    xpReward: 10,
    interactionHint: "🎨 Try the Template button in the preview header",
  },
  {
    id: "export",
    title: "Export & Apply! 🎉",
    description: "When done, click 'Export' to download as PDF, DOCX, or text. DOCX works best with ATS systems.",
    icon: <Download className="w-5 h-5" />,
    action: { type: "navigate", target: "form" },
    highlight: "[data-export-btn]",
    position: "top-center",
    xpReward: 15,
    interactionHint: "📥 The Export button is highlighted in the header",
  },
  {
    id: "complete",
    title: "You're All Set! 🏆",
    description: "You know everything you need. Start building your interview-winning resume now!",
    icon: <Trophy className="w-5 h-5" />,
    action: { type: "click_step", step: 0 },
    position: "center",
    xpReward: 0,
  },
];

const STORAGE_KEY = "resume_onboarding_completed";
const FEEDBACK_KEY = "resume_onboarding_feedback";

// ─── Component ───────────────────────────────────────────────────
interface OnboardingTutorialProps {
  forceShow?: boolean;
  onClose?: () => void;
  onNavigate?: (target: "form" | "preview" | "coach") => void;
  onStepClick?: (step: number) => void;
}

export const OnboardingTutorial = ({
  forceShow = false,
  onClose,
  onNavigate,
  onStepClick,
}: OnboardingTutorialProps) => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [highlightRects, setHighlightRects] = useState<DOMRect[]>([]);

  const totalXP = TOUR_STEPS.reduce((sum, s) => sum + s.xpReward, 0);
  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;
  const isFirst = currentStep === 0;

  useEffect(() => {
    if (forceShow) {
      setOpen(true);
      setCurrentStep(0);
      setEarnedXP(0);
      setCompletedSteps(new Set());
      return;
    }
    const hasCompleted = localStorage.getItem(STORAGE_KEY);
    if (!hasCompleted) setOpen(true);
  }, [forceShow]);

  // Execute step action and highlight elements
  useEffect(() => {
    if (!open || !step) return;

    // Execute action
    if (step.action.type === "navigate" && onNavigate) {
      onNavigate(step.action.target);
    } else if (step.action.type === "click_step" && onStepClick) {
      onStepClick(step.action.step);
    }

    // Highlight elements (support multiple via querySelectorAll)
    if (step.highlight) {
      const timer = setTimeout(() => {
        const els = document.querySelectorAll(step.highlight!);
        const rects: DOMRect[] = [];
        els.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) rects.push(rect);
        });
        setHighlightRects(rects);

        // Scroll highlighted element into view
        if (els.length > 0) {
          (els[0] as HTMLElement).scrollIntoView?.({ behavior: "smooth", block: "center" });
        }
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setHighlightRects([]);
    }
  }, [currentStep, open, step, onNavigate, onStepClick]);

  // Update highlights on resize
  useEffect(() => {
    if (!open || !step?.highlight) return;
    const handleResize = () => {
      const els = document.querySelectorAll(step.highlight!);
      const rects: DOMRect[] = [];
      els.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) rects.push(rect);
      });
      setHighlightRects(rects);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [open, step]);

  const awardXP = useCallback((stepIndex: number) => {
    if (completedSteps.has(stepIndex)) return;
    const reward = TOUR_STEPS[stepIndex].xpReward;
    if (reward > 0) {
      setEarnedXP((prev) => prev + reward);
      setShowXPAnimation(true);
      setTimeout(() => setShowXPAnimation(false), 1200);
    }
    setCompletedSteps((prev) => new Set([...prev, stepIndex]));
  }, [completedSteps]);

  const handleNext = () => {
    awardXP(currentStep);
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
    onNavigate?.("form");
    onStepClick?.(0);
    onClose?.();
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
    onClose?.();
  };

  if (!open) return null;

  // Compute bounding box around all highlighted elements
  const combinedRect = highlightRects.length > 0 ? {
    top: Math.min(...highlightRects.map(r => r.top)),
    left: Math.min(...highlightRects.map(r => r.left)),
    bottom: Math.max(...highlightRects.map(r => r.bottom)),
    right: Math.max(...highlightRects.map(r => r.right)),
  } : null;

  const getTooltipStyle = (): React.CSSProperties => {
    if (step.position === "center" || !combinedRect) {
      return { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }

    const padding = 16;
    const tooltipWidth = 380;

    switch (step.position) {
      case "bottom-left":
        return {
          position: "fixed",
          top: Math.min(combinedRect.bottom + 16, window.innerHeight - 260),
          left: Math.max(padding, Math.min(combinedRect.left, window.innerWidth - tooltipWidth - padding)),
        };
      case "bottom-right":
        return {
          position: "fixed",
          top: Math.min(combinedRect.bottom + 16, window.innerHeight - 260),
          right: Math.max(padding, window.innerWidth - combinedRect.right),
        };
      case "top-center":
        return {
          position: "fixed",
          bottom: window.innerHeight - combinedRect.top + 16,
          left: "50%",
          transform: "translateX(-50%)",
        };
      case "bottom-center":
        return {
          position: "fixed",
          top: Math.min(combinedRect.bottom + 16, window.innerHeight - 260),
          left: "50%",
          transform: "translateX(-50%)",
        };
      default:
        return { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* SVG overlay with spotlight cutouts */}
      <svg className="absolute inset-0 w-full h-full z-[100]" style={{ pointerEvents: "none" }}>
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {highlightRects.map((rect, i) => (
              <rect
                key={i}
                x={rect.left - 6}
                y={rect.top - 6}
                width={rect.width + 12}
                height={rect.height + 12}
                rx="8"
                fill="black"
              />
            ))}
          </mask>
        </defs>
        <rect
          width="100%" height="100%"
          fill="rgba(0,0,0,0.6)"
          mask="url(#spotlight-mask)"
          style={{ pointerEvents: "all" }}
        />
      </svg>

      {/* Spotlight rings on highlighted elements */}
      {highlightRects.map((rect, i) => (
        <div
          key={i}
          className="absolute z-[101] rounded-lg ring-2 ring-primary ring-offset-2 pointer-events-none"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: "0 0 20px 4px hsl(var(--primary) / 0.3)",
          }}
        >
          {/* Pulsing glow */}
          <div className="absolute inset-0 rounded-lg animate-pulse ring-2 ring-primary/40" />
        </div>
      ))}

      {/* XP floating animation */}
      {showXPAnimation && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[110] animate-fade-in">
          <div className="bg-yellow-400 text-yellow-900 font-bold px-4 py-1.5 rounded-full text-sm shadow-lg flex items-center gap-1.5">
            <Zap className="w-4 h-4" />
            +{TOUR_STEPS[currentStep]?.xpReward || 0} XP!
          </div>
        </div>
      )}

      {/* Tooltip card */}
      <div
        className="z-[102] w-[380px] max-w-[calc(100vw-32px)] animate-scale-in"
        style={getTooltipStyle()}
      >
        <div className="bg-card rounded-xl shadow-2xl border border-border overflow-hidden">
          {/* Header with progress */}
          <div className="bg-gradient-to-r from-primary to-primary/70 p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                  <Target className="w-3 h-3" />
                  {currentStep + 1}/{TOUR_STEPS.length}
                </div>
                <div className="flex items-center gap-1 bg-yellow-400/90 text-yellow-900 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  <Zap className="w-3 h-3" />
                  {earnedXP} XP
                </div>
              </div>
              <button onClick={handleSkip} className="text-white/60 hover:text-white p-0.5 rounded hover:bg-white/10">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Body */}
          <div className="p-4">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                {step.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground leading-tight">{step.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.description}</p>
              </div>
            </div>

            {/* Interaction hint */}
            {step.interactionHint && highlightRects.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-lg bg-primary/5 border border-primary/15">
                <MousePointerClick className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-[11px] text-primary font-medium">{step.interactionHint}</span>
              </div>
            )}

            {/* Step indicator dots */}
            <div className="flex justify-center gap-1 mb-3">
              {TOUR_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    idx === currentStep ? "w-6 bg-primary" :
                    completedSteps.has(idx) ? "w-1.5 bg-primary/50" : "w-1.5 bg-muted"
                  )}
                />
              ))}
            </div>

            {/* Completion celebration */}
            {isLast && (
              <div className="text-center mb-3 py-2">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5 text-xs font-semibold text-foreground">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  {earnedXP}/{totalXP} XP Earned!
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-2">
              {!isFirst && (
                <Button variant="outline" size="sm" onClick={handlePrevious} className="flex-1 gap-1 h-8 text-xs">
                  <ChevronLeft className="w-3.5 h-3.5" /> Back
                </Button>
              )}
              {isFirst && (
                <Button variant="ghost" size="sm" onClick={handleSkip} className="flex-1 h-8 text-xs text-muted-foreground">
                  Skip Tour
                </Button>
              )}
              <Button size="sm" onClick={handleNext} className="flex-1 gap-1 h-8 text-xs">
                {isLast ? (
                  <>
                    <PartyPopper className="w-3.5 h-3.5" /> Start Building!
                  </>
                ) : (
                  <>
                    Next
                    {step.xpReward > 0 && (
                      <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[9px] font-bold">+{step.xpReward}</span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const useOnboardingReset = () => {
  const resetOnboarding = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FEEDBACK_KEY);
  };
  return { resetOnboarding };
};
