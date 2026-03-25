import { useState } from "react";
import { 
  Sparkles, 
  Target, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Clipboard,
  Crown
} from "lucide-react";
import { useProTier } from "@/contexts/ProTierContext";
import { ProBadge } from "./ProFeatureLock";

const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599; --primary: #4f8ef7;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }

  .panel-container {
    background: var(--surface); border: 1px solid rgba(79, 142, 247, 0.2);
    border-radius: var(--r); overflow: hidden; font-family: var(--font); color: var(--text);
  }

  .panel-header {
    padding: 16px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .panel-title { font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px; margin: 0; color: var(--text); }
  
  .panel-content { padding: 16px; display: flex; flex-direction: column; gap: 16px; }

  .tabs-list {
    display: grid; grid-template-columns: 1fr 1fr; gap: 4px;
    background: rgba(31, 36, 53, 0.5); padding: 4px; border-radius: 8px;
  }
  .tab-trigger {
    background: transparent; border: none; padding: 8px; border-radius: 6px;
    font-size: 13.5px; font-weight: 500; color: var(--text-muted);
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: all 0.2s; font-family: var(--font);
  }
  .tab-trigger[data-state="active"] {
    background: var(--surface); color: var(--text);
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }

  .pro-banner {
    background: rgba(245, 158, 11, 0.05); border: 2px solid rgba(245, 158, 11, 0.3);
    border-radius: var(--r-sm); padding: 16px;
  }
  .pro-banner-title { display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 600; margin-bottom: 8px; color: #d97706; }
  .pro-banner-text { font-size: 11.5px; color: var(--text-muted); margin: 0 0 12px 0; line-height: 1.5; }

  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 8px 16px; border-radius: var(--r-sm);
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: all 0.2s; border: none; font-family: var(--font);
  }
  .btn-primary { background: var(--text); color: var(--bg); }
  .btn-primary:hover { opacity: 0.9; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-ghost { background: transparent; color: var(--text); padding: 4px 8px; height: 28px; font-size: 11.5px; }
  .btn-ghost:hover { background: var(--surface2); }
  .btn-block { width: 100%; }
  .btn-upgrade { background: linear-gradient(to right, #f59e0b, #ea580c); color: #fff; }
  .btn-upgrade:hover { background: linear-gradient(to right, #d97706, #c2410c); }

  .input-group { display: flex; flex-direction: column; gap: 8px; }
  .input-label { display: flex; align-items: center; justify-content: space-between; font-size: 13px; font-weight: 500; }
  .textarea {
    width: 100%; min-height: 120px; padding: 12px; border-radius: var(--r-sm);
    background: rgba(31, 36, 53, 0.4); border: 1px solid var(--border);
    color: var(--text); font-family: var(--font); font-size: 13.5px;
    resize: vertical; outline: none; transition: border-color 0.2s;
  }
  .textarea:focus { border-color: var(--accent); }

  .tag-container { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
  .tag {
    display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 12px;
    font-size: 11.5px; border: 1px solid transparent; background: var(--surface2); color: var(--text);
  }
  .tag-outline { background: transparent; border-color: rgba(245, 158, 11, 0.5); color: #d97706; }

  .score-circle-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px 0; }
  .score-circle { position: relative; display: inline-flex; align-items: center; justify-content: center; }
  .score-svg { width: 96px; height: 96px; transform: rotate(-90deg); }
  .score-bg { stroke: rgba(107, 117, 153, 0.3); fill: transparent; stroke-width: 8; }
  .score-fill { fill: transparent; stroke-width: 8; stroke-dasharray: 251.2; stroke-linecap: round; transition: stroke-dashoffset 1s ease; }
  .score-text { position: absolute; font-size: 24px; font-weight: 700; }
  .score-label { font-size: 13.5px; font-weight: 500; margin-top: 8px; }

  .text-green { color: #4ade80; stroke: #4ade80; }
  .text-amber { color: #fbbf24; stroke: #fbbf24; }
  .text-red { color: #f87171; stroke: #f87171; }

  .breakdown-list { display: flex; flex-direction: column; gap: 12px; }
  .breakdown-title { font-size: 11.5px; font-weight: 500; margin-bottom: 4px; }
  .score-item { display: flex; flex-direction: column; gap: 4px; }
  .score-item-header { display: flex; justify-content: space-between; font-size: 11.5px; }
  .score-item-label { display: flex; align-items: center; gap: 4px; }
  .score-progress-bg { width: 100%; height: 6px; background: var(--surface2); border-radius: 3px; overflow: hidden; }
  .score-progress-fill { height: 100%; background: var(--text); border-radius: 3px; }
  .locked { opacity: 0.5; }
\`;

export const AIOptimizerPanel = ({ resumeData }) => {
  const { isPro, setShowUpgradeDialog } = useProTier();
  const [jobDescription, setJobDescription] = useState("");
  const [activeTab, setActiveTab] = useState("tailor");

  const calculateScore = () => {
    let score = 0;
    if (resumeData.personalInfo?.fullName) score += 10;
    if (resumeData.personalInfo?.email) score += 5;
    if (resumeData.personalInfo?.phone) score += 5;
    if (resumeData.personalInfo?.linkedin) score += 5;
    if (resumeData.profile) score += 15;
    if (resumeData.education?.length > 0) score += 15;
    if (resumeData.workExperience?.length > 0) score += 20;
    if (resumeData.projects?.length > 0) score += 10;
    if (resumeData.technicalSkills?.length > 0) score += 10;
    if (jobDescription) score += 5;
    return Math.min(score, 100);
  };

  const score = calculateScore();
  const getScoreColor = (s) => {
    if (s >= 80) return "text-green";
    if (s >= 50) return "text-amber";
    return "text-red";
  };

  const getScoreLabel = (s) => {
    if (s >= 92) return "Hire Zone! 🎉";
    if (s >= 80) return "Looking Great";
    if (s >= 50) return "Needs Work";
    return "Getting Started";
  };

  const ScoreItem = ({ label, itemScore, max, status, isProLocked }) => {
    const percentage = isProLocked ? 0 : (itemScore / max) * 100;
    return (
      <div className="score-item">
        <div className="score-item-header">
          <div className="score-item-label">
            {label}
            {status === "needs-work" && <span style={{ color: '#d97706' }}>(needs work)</span>}
            {isProLocked && <ProBadge />}
          </div>
          <span style={{ color: isProLocked ? 'var(--text-muted)' : 'inherit' }}>
            {itemScore}/{max}
          </span>
        </div>
        <div className={\`score-progress-bg \${isProLocked ? 'locked' : ''}\`}>
          <div className="score-progress-fill" style={{ width: \`\${percentage}%\` }} />
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{styles}</style>
      <div className="panel-container">
        <div className="panel-header">
          <h3 className="panel-title">
            <Sparkles size={20} className="text-primary" />
            AI Optimizer
          </h3>
          {!isPro && <ProBadge />}
        </div>
        
        <div className="panel-content">
          <div className="tabs-list">
            <button 
              className="tab-trigger" 
              data-state={activeTab === "tailor" ? "active" : "inactive"}
              onClick={() => setActiveTab("tailor")}
            >
              <Target size={14} /> Tailor to Job
            </button>
            <button 
              className="tab-trigger" 
              data-state={activeTab === "optimize" ? "active" : "inactive"}
              onClick={() => setActiveTab("optimize")}
            >
              <Zap size={14} /> Quick Optimize
            </button>
          </div>

          {activeTab === "tailor" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {!isPro ? (
                <div className="pro-banner">
                  <div className="pro-banner-title"><Crown size={16} /> Pro Feature</div>
                  <p className="pro-banner-text">
                    Upgrade to unlock AI optimization that tailors your resume to match job requirements.
                  </p>
                  <button className="btn btn-upgrade" onClick={() => setShowUpgradeDialog(true)}>
                    Upgrade to Unlock
                  </button>
                </div>
              ) : (
                <>
                  <div className="input-group">
                    <div className="input-label">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Target size={16} /> Job Description
                      </span>
                      <button className="btn btn-ghost" onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          setJobDescription(text);
                        } catch (e) {
                           // error handled quietly or could use toast
                        }
                      }}>
                        <Clipboard size={12} /> Paste
                      </button>
                    </div>
                    <textarea
                      placeholder="Paste the job description here... The AI will match your resume to job requirements."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="textarea"
                    />
                  </div>
                  <button className="btn btn-primary btn-block" disabled={!jobDescription}>
                    <Sparkles size={16} /> Analyze & Optimize
                  </button>

                  {jobDescription && (
                    <div style={{ marginTop: '8px' }}>
                      <p style={{ fontSize: '11.5px', fontWeight: 500, marginBottom: '4px' }}>Keyword Matches:</p>
                      <div className="tag-container">
                        <span className="tag">React</span>
                        <span className="tag">TypeScript</span>
                        <span className="tag tag-outline">+ Add: AWS</span>
                        <span className="tag tag-outline">+ Add: Docker</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "optimize" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="score-circle-container">
                <div className="score-circle">
                  <svg className="score-svg">
                    <circle cx="48" cy="48" r="40" className="score-bg" />
                    <circle 
                      cx="48" cy="48" r="40" 
                      className={\`score-fill \${getScoreColor(score)}\`}
                      style={{ strokeDashoffset: 251.2 - (score / 100) * 251.2 }}
                    />
                  </svg>
                  <span className={\`score-text \${getScoreColor(score)}\`}>{score}</span>
                </div>
                <div className={\`score-label \${getScoreColor(score)}\`}>{getScoreLabel(score)}</div>
              </div>

              <div className="breakdown-list">
                <div className="breakdown-title">Score Breakdown:</div>
                <ScoreItem label="Content Quality" itemScore={25} max={40} status={score >= 50 ? "good" : "needs-work"} isProLocked={false} />
                <ScoreItem label="ATS & Structure" itemScore={13} max={20} status="good" isProLocked={false} />
                <ScoreItem label="Job Optimization" itemScore={isPro ? 17 : 0} max={25} status={isPro ? "good" : "locked"} isProLocked={!isPro} />
                <ScoreItem label="Writing Quality" itemScore={isPro ? 7 : 0} max={10} status={isPro ? "good" : "locked"} isProLocked={!isPro} />
                <ScoreItem label="Application Ready" itemScore={4} max={5} status="good" isProLocked={false} />
              </div>

              {!isPro && (
                <button className="btn btn-upgrade btn-block" onClick={() => setShowUpgradeDialog(true)}>
                  <Crown size={16} /> Unlock Full Score Analysis
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
