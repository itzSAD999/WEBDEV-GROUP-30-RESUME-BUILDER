import { useEffect, useRef, useMemo } from "react";
import {
  Download, FileText, Pencil, PartyPopper, Trophy, CheckCircle2,
  Sparkles, ArrowRight, Star, Target, Brain, X
} from "lucide-react";
import confetti from "canvas-confetti";
import { ExportDialog } from "./ExportDialog";

const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599; --primary: #4f8ef7;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }

  .dialog-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center;
    z-index: 50; padding: 16px; backdrop-filter: blur(4px); font-family: var(--font);
  }

  .dialog-content {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); width: 100%; max-width: 500px; max-height: 90vh;
    display: flex; flex-direction: column; overflow: hidden; color: var(--text);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  }

  .hero-header {
    background: linear-gradient(135deg, rgba(79, 142, 247, 1), rgba(79, 142, 247, 0.9), rgba(79, 142, 247, 0.7));
    padding: 24px 24px 32px; color: #fff; position: relative; overflow: hidden; text-align: center;
  }

  .hero-bg-circle-1 { position: absolute; top: 0; right: 0; width: 160px; height: 160px; background: rgba(255,255,255,0.05); border-radius: 50%; transform: translate(50%, -50%); }
  .hero-bg-circle-2 { position: absolute; bottom: 0; left: 0; width: 112px; height: 112px; background: rgba(255,255,255,0.05); border-radius: 50%; transform: translate(-50%, 50%); }

  .hero-icon-container {
    width: 80px; height: 80px; border-radius: 16px; background: rgba(255,255,255,0.2);
    backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  }

  .hero-title { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
  .hero-subtitle { font-size: 13.5px; color: rgba(255,255,255,0.8); margin-bottom: 0; }

  .level-badge {
    margin-top: 16px; display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.2); backdrop-filter: blur(4px);
    border-radius: 24px; padding: 6px 16px;
  }
  .level-text { font-size: 13.5px; font-weight: 600; }
  .stars-container { display: flex; gap: 2px; }

  .stats-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
    padding: 0 24px; margin-top: -16px; position: relative; z-index: 10;
  }
  .stat-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 12px; text-align: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
  .stat-icon { width: 32px; height: 32px; border-radius: 8px; margin: 0 auto 6px; display: flex; align-items: center; justify-content: center; }
  .stat-value { font-size: 18px; font-weight: 700; color: var(--text); }
  .stat-label { font-size: 10px; font-weight: 500; color: var(--text-muted); }

  .actions-area { padding: 24px; display: flex; flex-direction: column; gap: 12px; }

  .ai-feedback-box {
    background: rgba(79, 142, 247, 0.05); border: 1px solid rgba(79, 142, 247, 0.2);
    border-radius: 12px; padding: 16px; margin-bottom: 8px;
  }
  .ai-feedback-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 13.5px; font-weight: 600; }
  .ai-feedback-text { font-size: 11.5px; color: var(--text-muted); margin-bottom: 12px; }

  .tip-box {
    background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2);
    border-radius: 12px; padding: 12px; margin-bottom: 8px;
  }
  .tip-content { display: flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 500; color: #d97706; }

  .btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 10px 16px; border-radius: var(--r-sm);
    font-size: 13.5px; font-weight: 500; cursor: pointer;
    transition: all 0.2s; border: none; font-family: var(--font); width: 100%;
  }
  .btn-primary { background: var(--text); color: var(--bg); }
  .btn-primary:hover { opacity: 0.9; }
  .btn-premium { background: linear-gradient(to right, #6366f1, #a855f7, #ec4899); color: white; }
  .btn-premium:hover { opacity: 0.9; }
  .btn-outline { border: 1px solid var(--border); background: transparent; color: var(--text); }
  .btn-outline:hover { background: var(--surface2); }
  .btn-ghost { background: transparent; color: var(--text-muted); }
  .btn-ghost:hover { color: var(--text); }
  
  .btn-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px; }
  
  .close-overlay {
    position: absolute; top: 16px; right: 16px; z-index: 20;
    width: 32px; height: 32px; border-radius: 16px; background: rgba(0,0,0,0.2);
    display: flex; align-items: center; justify-content: center; color: white;
    cursor: pointer; border: none;
  }
\`;

export const CelebrationDialog = ({
  open,
  onOpenChange,
  onDownloadPDF,
  onDownloadText,
  onContinueEditing,
  onGetAIFeedback,
  resumeRef,
  resumeData,
}) => {
  const hasConfettiFired = useRef(false);

  const stats = useMemo(() => {
    if (!resumeData) return null;
    const sectionsCompleted = [
      resumeData.personalInfo?.fullName,
      resumeData.profile,
      resumeData.education?.length > 0,
      resumeData.workExperience?.length > 0,
      resumeData.technicalSkills?.length > 0 || resumeData.softSkills?.length > 0,
    ].filter(Boolean).length;

    const totalBullets = (resumeData.workExperience || []).reduce(
      (sum, w) => sum + (w.responsibilities || []).filter((r) => r.trim()).length, 0
    ) + (resumeData.projects || []).reduce(
      (sum, p) => sum + (p.description || []).filter((d) => d.trim()).length, 0
    );

    const skillCount = (resumeData.technicalSkills || []).length + (resumeData.softSkills || []).length;

    return { sectionsCompleted, totalBullets, skillCount };
  }, [resumeData]);

  useEffect(() => {
    if (open && !hasConfettiFired.current) {
      hasConfettiFired.current = true;

      const bursts = [
        { delay: 0, particleCount: 80, spread: 70, origin: { x: 0.5, y: 0.6 } },
        { delay: 200, particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } },
        { delay: 200, particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } },
        { delay: 600, particleCount: 40, spread: 100, origin: { x: 0.5, y: 0.5 } },
      ];

      bursts.forEach(({ delay, ...opts }) => {
        setTimeout(() => {
          confetti({
            ...opts,
            colors: ["#c41e3a", "#ff6b6b", "#ffd93d", "#22c55e", "#3b82f6"],
            ticks: 200,
            gravity: 0.8,
            scalar: 1.2,
            shapes: ["circle", "square"],
          });
        }, delay);
      });

      const duration = 2500;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60 + Math.random() * 60,
          spread: 45,
          origin: { x: Math.random(), y: Math.random() * 0.5 },
          colors: ["#c41e3a", "#ffd93d"],
          ticks: 100,
          gravity: 1.2,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      setTimeout(frame, 400);
    }
    if (!open) hasConfettiFired.current = false;
  }, [open]);

  if (!open) return null;

  const completionLevel = stats
    ? stats.sectionsCompleted >= 5 ? "Expert" : stats.sectionsCompleted >= 3 ? "Advanced" : "Starter"
    : "Starter";

  return (
    <>
      <style>{styles}</style>
      <div className="dialog-overlay" onClick={() => onOpenChange(false)}>
        <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
          <button className="close-overlay" onClick={() => onOpenChange(false)}><X size={16} /></button>
          
          {/* Hero Header */}
          <div className="hero-header">
            <div className="hero-bg-circle-1" />
            <div className="hero-bg-circle-2" />

            <div style={{ position: 'relative', zIndex: 10 }}>
              <div className="hero-icon-container">
                <PartyPopper size={40} />
              </div>
              <h2 className="hero-title">Your Resume is Ready! 🎉</h2>
              <p className="hero-subtitle">
                Congratulations on completing your professional resume
              </p>

              <div className="level-badge">
                <Trophy size={16} color="#fde047" />
                <span className="level-text">{completionLevel} Resume Builder</span>
                <div className="stars-container">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      color={s <= (completionLevel === "Expert" ? 3 : completionLevel === "Advanced" ? 2 : 1) ? "#fde047" : "rgba(255,255,255,0.3)"}
                      fill={s <= (completionLevel === "Expert" ? 3 : completionLevel === "Advanced" ? 2 : 1) ? "#fde047" : "transparent"}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="stats-grid">
              {[
                { icon: CheckCircle2, label: "Sections", value: \`\${stats.sectionsCompleted}/5\`, color: "#16a34a", bg: "rgba(22, 163, 74, 0.1)" },
                { icon: Target, label: "Bullet Points", value: String(stats.totalBullets), color: "#2563eb", bg: "rgba(37, 99, 235, 0.1)" },
                { icon: Sparkles, label: "Skills", value: String(stats.skillCount), color: "#9333ea", bg: "rgba(147, 51, 234, 0.1)" },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className="stat-card">
                  <div className="stat-icon" style={{ background: bg, color: color }}>
                    <Icon size={16} />
                  </div>
                  <div className="stat-value">{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="actions-area">
            {onGetAIFeedback && (
              <div className="ai-feedback-box">
                <div className="ai-feedback-header">
                  <Brain size={20} className="text-primary" />
                  <span>Get AI Feedback</span>
                </div>
                <p className="ai-feedback-text">
                  Let our AI analyze your resume for content quality, impact, and industry readiness before you export.
                </p>
                <button onClick={onGetAIFeedback} className="btn btn-primary">
                  <Sparkles size={16} /> Analyze My Resume
                </button>
              </div>
            )}

            {stats && stats.sectionsCompleted < 5 && (
              <div className="tip-box">
                <p className="tip-content">
                  <Sparkles size={14} />
                  Tip: Complete all 5 sections to reach Expert level and maximize your ATS score!
                </p>
              </div>
            )}

            {resumeRef && resumeData ? (
              <ExportDialog
                resumeRef={resumeRef}
                fileName={resumeData.personalInfo?.fullName || "resume"}
                resumeData={resumeData}
                trigger={
                  <button className="btn btn-premium">
                    <Download size={20} /> Download Options
                  </button>
                }
              />
            ) : (
              <>
                <button onClick={onDownloadPDF} className="btn btn-premium">
                  <Download size={20} /> Download PDF
                </button>
                <button onClick={onDownloadText} className="btn btn-outline">
                  <FileText size={20} /> Download as Text
                </button>
              </>
            )}

            <div className="btn-row">
              <button onClick={onContinueEditing} className="btn btn-outline">
                <Pencil size={16} /> Keep Editing
              </button>
              <button onClick={onContinueEditing} className="btn btn-ghost">
                <ArrowRight size={16} /> Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
