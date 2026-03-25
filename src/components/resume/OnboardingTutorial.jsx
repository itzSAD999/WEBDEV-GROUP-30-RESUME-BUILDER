import { useState, useEffect, useCallback } from "react";
import {
  Rocket, Upload, Layout, MessageSquare, Eye, Palette, Sparkles, Download,
  ChevronRight, ChevronLeft, X, Trophy, Zap, Target, PartyPopper,
  MousePointerClick
} from "lucide-react";

// ─── Steps ───────────────────────────────────────────────────────
const TOUR_STEPS = [
  {
    id: "welcome", title: "Welcome to Resume Builder! 🎯", description: "Let's walk through the builder together. I'll highlight each area and show you how it works.", icon: <Rocket size={20} />, action: { type: "none" }, position: "center", xpReward: 10,
  },
  {
    id: "upload", title: "Import Your Existing CV", description: "Got a CV already? Use these buttons to upload a PDF/DOCX or paste text. We'll auto-fill all fields for you.", icon: <Upload size={20} />, action: { type: "none" }, highlight: "[title='Upload CV'], [title='Paste Text']", position: "bottom-center", xpReward: 10, interactionHint: "👆 These buttons are highlighted above",
  },
  {
    id: "personal", title: "Start with Personal Info", description: "This is where you fill in your name, email, phone, and links. It appears at the top of your resume.", icon: <Layout size={20} />, action: { type: "click_step", step: 0 }, position: "bottom-left", xpReward: 15, interactionHint: "📝 The form on the right is now showing this section",
  },
  {
    id: "profile", title: "Write Your Profile Summary", description: "A 2-3 sentence professional summary. This is the first thing recruiters read — make it count!", icon: <Layout size={20} />, action: { type: "click_step", step: 1 }, position: "bottom-left", xpReward: 15, interactionHint: "📝 Check the form — it switched to Profile",
  },
  {
    id: "experience", title: "Add Work Experience", description: "List your jobs with bullet points. Use action verbs like 'Led', 'Built', 'Increased' for maximum impact.", icon: <Layout size={20} />, action: { type: "click_step", step: 3 }, position: "bottom-left", xpReward: 20, interactionHint: "📝 The Work Experience form is now active",
  },
  {
    id: "coach", title: "Meet Your AI Coach", description: "This panel scores your resume in real-time and gives improvement tips. It has Score, Tips, Tailor, and Chat tabs.", icon: <MessageSquare size={20} />, action: { type: "navigate", target: "coach" }, highlight: "[data-coach-panel]", position: "bottom-left", xpReward: 20, interactionHint: "👈 The AI Coach panel is highlighted on the left",
  },
  {
    id: "preview", title: "Live Preview", description: "Your resume updates in real-time as you type. Select any text here to get instant AI suggestions.", icon: <Eye size={20} />, action: { type: "navigate", target: "preview" }, highlight: ".resume-template", position: "bottom-right", xpReward: 15, interactionHint: "👉 Your live resume preview is highlighted on the right",
  },
  {
    id: "template", title: "Choose a Template", description: "Click the 'Template' button to switch between 6 ATS-optimized styles — Classic, Creative, Stanford, MIT, and more.", icon: <Palette size={20} />, action: { type: "navigate", target: "preview" }, position: "bottom-right", xpReward: 10, interactionHint: "🎨 Try the Template button in the preview header",
  },
  {
    id: "export", title: "Export & Apply! 🎉", description: "When done, click 'Export' to download as PDF, DOCX, or text. DOCX works best with ATS systems.", icon: <Download size={20} />, action: { type: "navigate", target: "form" }, highlight: "[data-export-btn]", position: "top-center", xpReward: 15, interactionHint: "📥 The Export button is highlighted in the header",
  },
  {
    id: "complete", title: "You're All Set! 🏆", description: "You know everything you need. Start building your interview-winning resume now!", icon: <Trophy size={20} />, action: { type: "click_step", step: 0 }, position: "center", xpReward: 0,
  },
];

const STORAGE_KEY = "resume_onboarding_completed";
const FEEDBACK_KEY = "resume_onboarding_feedback";

const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599; --primary: #4f8ef7;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }
  
  .onboarding-overlay { position: fixed; inset: 0; z-index: 100; pointer-events: none; }
  .spotlight-mask { pointer-events: all; }
  
  .xp-float {
    position: fixed; top: 64px; left: 50%; transform: translateX(-50%); z-index: 110;
    background: #facc15; color: #713f12; font-weight: bold; padding: 6px 16px; border-radius: 9999px;
    font-size: 14px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 6px;
    animation: fadeInOut 1.2s ease-in-out forwards; pointer-events: none;
  }
  @keyframes fadeInOut { 0% { opacity: 0; transform: translate(-50%, -20px); } 15% { opacity: 1; transform: translate(-50%, 0); } 85% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, -20px); } }

  .tooltip-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: var(--r);
    width: 380px; max-width: calc(100vw - 32px); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    overflow: hidden; font-family: var(--font); color: var(--text); z-index: 102; pointer-events: all;
    animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

  .tooltip-header { background: linear-gradient(to right, #4f8ef7, rgba(79, 142, 247, 0.7)); padding: 12px; color: white; }
  .tooltip-header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .tooltip-stats { display: flex; align-items: center; gap: 8px; }
  .stat-badge { display: flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; }
  .stat-badge.xp { background: rgba(250, 204, 21, 0.9); color: #713f12; font-weight: 700; }
  .close-btn { background: transparent; border: none; color: rgba(255,255,255,0.6); cursor: pointer; padding: 2px; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
  .close-btn:hover { color: white; background: rgba(255,255,255,0.1); }
  
  .progress-bar-bg { height: 6px; background: rgba(255,255,255,0.2); border-radius: 9999px; overflow: hidden; }
  .progress-bar-fill { height: 100%; background: rgba(255,255,255,0.8); border-radius: 9999px; transition: width 0.5s ease; }

  .tooltip-body { padding: 16px; }
  .step-content { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 8px; }
  .step-icon-wrapper { width: 40px; height: 40px; border-radius: 12px; background: rgba(79, 142, 247, 0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .step-title { font-size: 14px; font-weight: 700; line-height: 1.2; margin-bottom: 4px; }
  .step-desc { font-size: 12px; color: var(--text-muted); line-height: 1.5; }

  .interaction-hint { display: flex; align-items: center; gap: 8px; padding: 8px 12px; margin-bottom: 12px; border-radius: 8px; background: rgba(79, 142, 247, 0.05); border: 1px solid rgba(79, 142, 247, 0.15); }
  .interaction-hint-text { font-size: 11px; color: var(--primary); font-weight: 500; }

  .dots-container { display: flex; justify-content: center; gap: 4px; margin-bottom: 12px; }
  .dot { height: 6px; border-radius: 9999px; transition: all 0.3s; }
  .dot.active { width: 24px; background: var(--primary); }
  .dot.completed { width: 6px; background: rgba(79, 142, 247, 0.5); }
  .dot.upcoming { width: 6px; background: var(--border); }

  .celebration-box { text-align: center; margin-bottom: 12px; padding: 8px 0; }
  .celebration-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(79, 142, 247, 0.1); border: 1px solid rgba(79, 142, 247, 0.2); border-radius: 9999px; padding: 6px 12px; font-size: 12px; font-weight: 600; color: var(--text); }

  .tooltip-nav { display: flex; gap: 8px; }
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 4px; height: 32px; padding: 0 12px; border-radius: var(--r-sm); font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; border: none; font-family: var(--font); flex: 1; }
  .btn-primary { background: var(--text); color: var(--bg); }
  .btn-primary:hover { opacity: 0.9; }
  .btn-outline { border: 1px solid var(--border); background: transparent; color: var(--text); }
  .btn-outline:hover { background: var(--surface2); }
  .btn-ghost { background: transparent; color: var(--text-muted); }
  .btn-ghost:hover { color: var(--text); background: var(--surface2); }
  .reward-pill { background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 9999px; font-size: 9px; font-weight: 700; color: var(--bg); }
\`;

export const OnboardingTutorial = ({
  forceShow = false,
  onClose,
  onNavigate,
  onStepClick,
}) => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [highlightRects, setHighlightRects] = useState([]);

  const totalXP = TOUR_STEPS.reduce((sum, s) => sum + s.xpReward, 0);
  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;
  const isFirst = currentStep === 0;

  useEffect(() => {
    if (forceShow) {
      setOpen(true); setCurrentStep(0); setEarnedXP(0); setCompletedSteps(new Set()); return;
    }
    const hasCompleted = localStorage.getItem(STORAGE_KEY);
    if (!hasCompleted) setOpen(true);
  }, [forceShow]);

  useEffect(() => {
    if (!open || !step) return;

    if (step.action.type === "navigate" && onNavigate) onNavigate(step.action.target);
    else if (step.action.type === "click_step" && onStepClick) onStepClick(step.action.step);

    if (step.highlight) {
      const timer = setTimeout(() => {
        const els = document.querySelectorAll(step.highlight);
        const rects = [];
        els.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) rects.push(rect);
        });
        setHighlightRects(rects);
        if (els.length > 0) els[0].scrollIntoView?.({ behavior: "smooth", block: "center" });
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setHighlightRects([]);
    }
  }, [currentStep, open, step, onNavigate, onStepClick]);

  useEffect(() => {
    if (!open || !step?.highlight) return;
    const handleResize = () => {
      const els = document.querySelectorAll(step.highlight);
      const rects = [];
      els.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) rects.push(rect);
      });
      setHighlightRects(rects);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [open, step]);

  const awardXP = useCallback((stepIndex) => {
    if (completedSteps.has(stepIndex)) return;
    const reward = TOUR_STEPS[stepIndex].xpReward;
    if (reward > 0) {
      setEarnedXP(prev => prev + reward);
      setShowXPAnimation(true);
      setTimeout(() => setShowXPAnimation(false), 1200);
    }
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
  }, [completedSteps]);

  const handleNext = () => {
    awardXP(currentStep);
    if (currentStep < TOUR_STEPS.length - 1) setCurrentStep(currentStep + 1);
    else handleComplete();
  };

  const handlePrevious = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false); onNavigate?.("form"); onStepClick?.(0); onClose?.();
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false); onClose?.();
  };

  if (!open) return null;

  const combinedRect = highlightRects.length > 0 ? {
    top: Math.min(...highlightRects.map(r => r.top)),
    left: Math.min(...highlightRects.map(r => r.left)),
    bottom: Math.max(...highlightRects.map(r => r.bottom)),
    right: Math.max(...highlightRects.map(r => r.right)),
  } : null;

  const getTooltipStyle = () => {
    if (step.position === "center" || !combinedRect) {
      if (step.position === "center") return { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
      return { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }
    const padding = 16; const tooltipWidth = 380;
    switch (step.position) {
      case "bottom-left": return { position: "fixed", top: Math.min(combinedRect.bottom + 16, window.innerHeight - 260), left: Math.max(padding, Math.min(combinedRect.left, window.innerWidth - tooltipWidth - padding)) };
      case "bottom-right": return { position: "fixed", top: Math.min(combinedRect.bottom + 16, window.innerHeight - 260), right: Math.max(padding, window.innerWidth - combinedRect.right) };
      case "top-center": return { position: "fixed", bottom: window.innerHeight - combinedRect.top + 16, left: "50%", transform: "translateX(-50%)" };
      case "bottom-center": return { position: "fixed", top: Math.min(combinedRect.bottom + 16, window.innerHeight - 260), left: "50%", transform: "translateX(-50%)" };
      default: return { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="onboarding-overlay">
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 100, pointerEvents: "none" }}>
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              {highlightRects.map((rect, i) => (
                <rect key={i} x={rect.left - 6} y={rect.top - 6} width={rect.width + 12} height={rect.height + 12} rx="8" fill="black" />
              ))}
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#spotlight-mask)" className="spotlight-mask" />
        </svg>

        {highlightRects.map((rect, i) => (
          <div key={i} style={{ position: "absolute", zIndex: 101, pointerEvents: "none", top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12, boxShadow: "0 0 20px 4px rgba(79, 142, 247, 0.3)", borderRadius: '8px', border: '2px solid var(--primary)' }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "0.5rem", border: '2px solid rgba(79, 142, 247, 0.4)', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
          </div>
        ))}

        {showXPAnimation && (
          <div className="xp-float">
            <Zap size={16} /> +{TOUR_STEPS[currentStep]?.xpReward || 0} XP!
          </div>
        )}

        <div className="tooltip-card" style={getTooltipStyle()}>
          <div className="tooltip-header">
            <div className="tooltip-header-top">
              <div className="tooltip-stats">
                <div className="stat-badge"><Target size={12} /> {currentStep + 1}/{TOUR_STEPS.length}</div>
                <div className="stat-badge xp"><Zap size={12} /> {earnedXP} XP</div>
              </div>
              <button onClick={handleSkip} className="close-btn"><X size={14} /></button>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: \`\${((currentStep + 1) / TOUR_STEPS.length) * 100}%\` }} />
            </div>
          </div>

          <div className="tooltip-body">
            <div className="step-content">
              <div className="step-icon-wrapper">{step.icon}</div>
              <div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.description}</p>
              </div>
            </div>

            {step.interactionHint && highlightRects.length > 0 && (
              <div className="interaction-hint">
                <MousePointerClick size={14} className="text-primary" style={{ color: 'var(--primary)' }} />
                <span className="interaction-hint-text">{step.interactionHint}</span>
              </div>
            )}

            <div className="dots-container">
              {TOUR_STEPS.map((_, idx) => (
                <div key={idx} className={\`dot \${idx === currentStep ? 'active' : completedSteps.has(idx) ? 'completed' : 'upcoming'}\`} />
              ))}
            </div>

            {isLast && (
              <div className="celebration-box">
                <div className="celebration-badge">
                  <Trophy size={16} style={{ color: '#eab308' }} /> {earnedXP}/{totalXP} XP Earned!
                </div>
              </div>
            )}

            <div className="tooltip-nav">
              {!isFirst && <button className="btn btn-outline" onClick={handlePrevious}><ChevronLeft size={14} /> Back</button>}
              {isFirst && <button className="btn btn-ghost" onClick={handleSkip}>Skip Tour</button>}
              <button className="btn btn-primary" onClick={handleNext}>
                {isLast ? <><PartyPopper size={14} /> Start Building!</> : <>Next {step.xpReward > 0 && <span className="reward-pill">+{step.xpReward}</span>} <ChevronRight size={14} /></>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const useOnboardingReset = () => {
  const resetOnboarding = () => { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(FEEDBACK_KEY); };
  return { resetOnboarding };
};
