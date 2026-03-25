import { useState } from "react";
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp,
  FileSearch,
  Target,
  Brain,
  Sparkles,
  XCircle,
  Loader2
} from "lucide-react";

// CSS styles injected via template literal
const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599; --danger: #f75f5f;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }
  
  .score-container {
    height: 100%; overflow-y: auto; padding: 16px;
    font-family: var(--font); color: var(--text);
    display: flex; flex-direction: column; gap: 16px;
  }
  
  .mode-toggle {
    display: flex; gap: 4px; background: rgba(31, 36, 53, 0.4);
    padding: 4px; border-radius: var(--r);
  }
  
  .mode-btn {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;
    padding: 8px 4px; border-radius: var(--r-sm); border: none;
    font-size: 11.5px; font-weight: 500; cursor: pointer; transition: all 0.2s;
    background: transparent; color: var(--text-muted);
  }
  
  .mode-btn.active {
    background: var(--bg); color: var(--text);
    box-shadow: 0 1px 2px rgba(0,0,0,0.2);
  }
  
  .mode-btn:disabled {
    opacity: 0.4; cursor: not-allowed;
  }

  .score-circle-area {
    text-align: center; padding: 16px 0;
    display: flex; flex-direction: column; align-items: center; gap: 8px;
  }
  
  .loading-area {
    display: flex; flex-direction: column; items-center; gap: 12px;
    padding: 24px 0;
  }
  
  .circle-wrapper {
    position: relative; display: inline-flex; align-items: center; justify-content: center;
  }

  .badge {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 2px 8px; font-size: 11px; font-weight: 600;
    border-radius: 12px; margin-top: 8px; color: #fff;
  }
  .badge-outline {
    background: transparent; border: 1px solid currentColor; color: inherit;
  }

  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 8px 16px; border-radius: var(--r-sm);
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: all 0.2s; border: none; font-family: var(--font);
  }
  .btn-primary { background: var(--text); color: var(--bg); }
  .btn-primary:hover { opacity: 0.9; }
  .btn-outline { border: 1px solid var(--border); background: var(--surface2); color: var(--text); }
  .btn-outline:hover { background: var(--border); }
  .btn-sm { padding: 6px 12px; font-size: 12px; }

  .section-title {
    font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px;
    margin-bottom: 8px;
  }

  .collapsible {
    border-radius: var(--r-sm); transition: background 0.2s;
  }
  .collapsible-trigger {
    width: 100%; display: flex; flex-direction: column;
    background: transparent; border: none; padding: 8px;
    cursor: pointer; border-radius: var(--r-sm); color: var(--text);
  }
  .collapsible-trigger:hover { background: rgba(31, 36, 53, 0.5); }
  .collapsible-header {
    display: flex; align-items: center; justify-content: space-between; width: 100%;
    margin-bottom: 4px;
  }
  .collapsible-title { display: flex; align-items: center; gap: 8px; font-size: 13px; }
  .collapsible-score { font-size: 13px; font-weight: 500; }
  .progress-bg {
    width: 100%; height: 6px; background: var(--surface2);
    border-radius: 4px; overflow: hidden;
  }
  .progress-fill { height: 100%; transition: width 0.5s ease; }
  .collapsible-content {
    padding: 4px 8px 12px 32px; display: flex; flex-direction: column; gap: 4px;
  }

  .detail-item {
    font-size: 11.5px; color: var(--text-muted); display: flex; align-items: flex-start; gap: 6px;
    text-align: left;
  }

  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); padding: 12px;
  }
  .card-muted { background: rgba(31, 36, 53, 0.3); }

  .text-green { color: #4ade80; }
  .bg-green { background: #4ade80; }
  .text-amber { color: #fbbf24; }
  .bg-amber { background: #fbbf24; }
  .text-red { color: #f87171; }
  .bg-red { background: #f87171; }
  .text-blue { color: #60a5fa; }
\`;

export const ScoreTab = ({
  qualityScore, jobMatchResult, cvAnalysisResult, jobDescription,
  isAnalyzing, isAnalyzingCV, onViewDetailedAnalysis, onRunCVAnalysis,
  scoreMode, onScoreModeChange, cvAnalysisStale, jobMatchStale,
}) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const getScoreColor = (score, max) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return "text-green";
    if (pct >= 50) return "text-amber";
    return "text-red";
  };

  const getProgressColor = (score, max) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return "bg-green";
    if (pct >= 50) return "bg-amber";
    return "bg-red";
  };

  const getGradeLabel = (score) => {
    if (score >= 90) return { text: "Excellent", color: "bg-green" };
    if (score >= 75) return { text: "Good", color: "bg-green" };
    if (score >= 50) return { text: "Needs Work", color: "bg-amber" };
    return { text: "Getting Started", color: "bg-red" };
  };

  const getPriorityColor = (priority) => {
    if (priority === "High") return "text-red";
    if (priority === "Medium") return "text-amber";
    return "text-blue";
  };

  const currentScore = scoreMode === "quality" 
    ? qualityScore.total 
    : scoreMode === "jobMatch" 
      ? (jobMatchResult?.overallScore || 0) 
      : (cvAnalysisResult?.overallScore || 0);

  const grade = getGradeLabel(currentScore);
  const canShowJobMatch = jobDescription && jobDescription.trim().length > 0;
  const isLoading = scoreMode === "jobMatch" ? isAnalyzing : scoreMode === "cvAnalysis" ? isAnalyzingCV : false;

  return (
    <>
      <style>{styles}</style>
      <div className="score-container">
        
        {/* Toggle */}
        <div className="mode-toggle">
          <button
            onClick={() => onScoreModeChange("quality")}
            className={\`mode-btn \${scoreMode === 'quality' ? 'active' : ''}\`}
          >
            <TrendingUp size={14} /> Quality
          </button>
          <button
            onClick={() => onScoreModeChange("cvAnalysis")}
            className={\`mode-btn \${scoreMode === 'cvAnalysis' ? 'active' : ''}\`}
          >
            <Brain size={14} /> AI Review
          </button>
          <button
            onClick={() => onScoreModeChange("jobMatch")}
            disabled={!canShowJobMatch}
            className={\`mode-btn \${scoreMode === 'jobMatch' ? 'active' : ''}\`}
          >
            <Target size={14} /> Job Match
          </button>
        </div>

        {/* Score Circle Area */}
        <div className="score-circle-area">
          {isLoading ? (
            <div className="loading-area">
              <Loader2 size={48} className="text-accent" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {scoreMode === "cvAnalysis" ? "AI is reviewing your CV..." : "Analyzing resume..."}
              </span>
            </div>
          ) : scoreMode === "cvAnalysis" && !cvAnalysisResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '24px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(79,142,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={32} style={{ color: 'var(--accent)' }} />
              </div>
              <div style={{ textAlign: 'center', maxWidth: '250px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px' }}>AI-Powered CV Review</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Get an expert-level analysis of your CV's content, impact, and readiness — scored by AI.
                </p>
              </div>
              <button className="btn btn-primary" onClick={onRunCVAnalysis}>
                <Sparkles size={14} /> Analyze My CV
              </button>
            </div>
          ) : (
            <>
              <div className="circle-wrapper">
                <svg width="128" height="128" viewBox="0 0 128 128" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="64" cy="64" r="56" stroke="rgba(107, 117, 153, 0.3)" strokeWidth="8" fill="none" />
                  <circle 
                    cx="64" cy="64" r="56" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    fill="none" 
                    strokeDasharray="351.86" 
                    strokeDashoffset={351.86 - (currentScore / 100) * 351.86}
                    strokeLinecap="round"
                    className={getScoreColor(currentScore, 100)}
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span className={\`\${getScoreColor(currentScore, 100)}\`} style={{ fontSize: '32px', fontWeight: '700' }}>
                    {currentScore}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/100</span>
                </div>
              </div>
              
              <span className={\`badge \${grade.color}\`}>
                {scoreMode === "cvAnalysis" && cvAnalysisResult?.grade ? \`Grade: \${cvAnalysisResult.grade}\` : grade.text}
              </span>
              
              {scoreMode === "cvAnalysis" && cvAnalysisResult && (
                <div style={{ marginTop: '8px' }}>
                  <span className={\`badge \${
                    cvAnalysisResult.industryReadiness === "Ready" ? "bg-green" : 
                    cvAnalysisResult.industryReadiness === "Almost Ready" ? "bg-amber" : "bg-red"
                  }\`}>
                    {cvAnalysisResult.industryReadiness}
                  </span>
                </div>
              )}
              
              {scoreMode === "jobMatch" && jobMatchResult && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>ATS Pass:</span>
                  <span className={\`badge \${
                    jobMatchResult.atsPassProbability === "High" ? "bg-green" : 
                    jobMatchResult.atsPassProbability === "Medium" ? "bg-amber" : "bg-red"
                  }\`}>
                    {jobMatchResult.atsPassProbability}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Breakdowns */}
        {scoreMode === "quality" ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h4 className="section-title"><TrendingUp size={16} /> Score Breakdown</h4>
            
            {[
              { key: "content", label: "Content Quality", data: qualityScore.content },
              { key: "ats", label: "ATS & Structure", data: qualityScore.ats },
              { key: "completeness", label: "Section Completeness", data: qualityScore.completeness },
              { key: "impact", label: "Impact Language", data: qualityScore.impact },
              { key: "ready", label: "Application Ready", data: qualityScore.ready },
            ].map(({ key, label, data }) => (
              <div key={key} className="collapsible">
                <button 
                  className="collapsible-trigger"
                  onClick={() => setExpandedCategory(expandedCategory === key ? null : key)}
                >
                  <div className="collapsible-header">
                    <span className="collapsible-title">
                      {expandedCategory === key ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      {label}
                    </span>
                    <span className={\`collapsible-score \${getScoreColor(data.score, data.max)}\`}>
                      {data.score}/{data.max}
                    </span>
                  </div>
                  <div className="progress-bg">
                    <div className={\`progress-fill \${getProgressColor(data.score, data.max)}\`} style={{ width: \`\${(data.score / data.max) * 100}%\` }} />
                  </div>
                </button>
                
                {expandedCategory === key && (
                  <div className="collapsible-content">
                    {data.details.map((detail, i) => {
                      const isGood = detail.startsWith("✓");
                      const isWarn = detail.startsWith("⚠");
                      return (
                        <div key={i} className="detail-item">
                          {isGood ? <CheckCircle2 size={12} className="text-green" style={{marginTop: '2px', flexShrink: 0}} /> :
                           isWarn ? <AlertTriangle size={12} className="text-amber" style={{marginTop: '2px', flexShrink: 0}} /> :
                                    <XCircle size={12} className="text-red" style={{marginTop: '2px', flexShrink: 0}} />}
                          <span>{detail.replace(/^[✓✗⚠]\s*/, "")}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}

            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(79,142,247,0.05)', border: '1px solid rgba(79,142,247,0.15)', borderRadius: 'var(--r)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Brain size={14} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: '13px', fontWeight: '600' }}>Want deeper insights?</span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: '1.4' }}>
                Quality Score is a quick checklist. Run AI Review for expert-level content analysis, rewrite suggestions, and industry readiness.
              </p>
              <button 
                className="btn btn-outline btn-sm" style={{ width: '100%' }}
                onClick={() => { onScoreModeChange("cvAnalysis"); onRunCVAnalysis(); }}
              >
                <Sparkles size={12} /> Run AI Review
              </button>
            </div>
          </div>
        ) : scoreMode === "cvAnalysis" && cvAnalysisResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cvAnalysisResult.executiveSummary && (
              <div className="card" style={{ background: 'rgba(79,142,247,0.05)', borderColor: 'rgba(79,142,247,0.2)' }}>
                <p style={{ fontSize: '12px', lineHeight: '1.5' }}>{cvAnalysisResult.executiveSummary}</p>
                {cvAnalysisResult.estimatedCallbackRate && (
                  <p style={{ fontSize: '12px', fontWeight: '500', color: 'var(--accent)', marginTop: '8px' }}>
                    📊 {cvAnalysisResult.estimatedCallbackRate}
                  </p>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h4 className="section-title"><Brain size={16} /> Detailed Breakdown</h4>
              {cvAnalysisResult.categories?.map((cat, idx) => (
                <div key={idx} className="collapsible">
                  <button 
                    className="collapsible-trigger"
                    onClick={() => setExpandedCategory(expandedCategory === \`cv-\${idx}\` ? null : \`cv-\${idx}\`)}
                  >
                    <div className="collapsible-header">
                      <span className="collapsible-title">
                        {expandedCategory === \`cv-\${idx}\` ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        {cat.name} <span style={{fontSize: '10px', color: 'var(--text-muted)'}}>({cat.weight}%)</span>
                      </span>
                      <span className={\`collapsible-score \${getScoreColor(cat.score, 100)}\`}>
                        {cat.score}/100
                      </span>
                    </div>
                    <div className="progress-bg">
                      <div className={\`progress-fill \${getProgressColor(cat.score, 100)}\`} style={{ width: \`\${cat.score}%\` }} />
                    </div>
                  </button>
                  {expandedCategory === \`cv-\${idx}\` && (
                    <div className="collapsible-content">
                      <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>{cat.feedback}</p>
                      {cat.strengths?.map((s, i) => (
                        <div key={\`s-\${i}\`} className="detail-item">
                          <CheckCircle2 size={12} className="text-green" style={{marginTop: '2px', flexShrink: 0}} />
                          <span>{s}</span>
                        </div>
                      ))}
                      {cat.improvements?.map((imp, i) => (
                        <div key={\`i-\${i}\`} className="detail-item">
                          <AlertTriangle size={12} className="text-amber" style={{marginTop: '2px', flexShrink: 0}} />
                          <span>{imp}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {cvAnalysisResult.criticalImprovements?.length > 0 && (
              <div>
                <h4 className="section-title"><AlertTriangle size={16} className="text-amber" /> Priority Actions</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {cvAnalysisResult.criticalImprovements.map((item, i) => (
                    <div key={i} className="card card-muted">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className={\`badge badge-outline \${getPriorityColor(item.priority)}\`} style={{marginTop: 0, fontSize: '10px', padding: '0 6px'}}>
                          {item.priority}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: '500' }}>{item.issue}</span>
                      </div>
                      <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{item.fix}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {cvAnalysisStale && (
              <div className="card" style={{ background: 'rgba(251,191,36,0.1)', borderColor: 'rgba(251,191,36,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={14} className="text-amber" />
                  <span style={{ fontSize: '11.5px' }}>CV updated since last analysis</span>
                </div>
                <button className="btn btn-outline btn-sm" onClick={onRunCVAnalysis}>
                  <Sparkles size={12} /> Sync
                </button>
              </div>
            )}

            {!cvAnalysisStale && (
              <button className="btn btn-outline btn-sm" style={{ width: '100%' }} onClick={onRunCVAnalysis}>
                <Sparkles size={14} /> Re-analyze CV
              </button>
            )}

          </div>
        ) : scoreMode === "jobMatch" && jobMatchResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 className="section-title"><Target size={16} /> Job Match Breakdown</h4>
            {[
              { label: "Skills Match", score: jobMatchResult.matchBreakdown.skillMatch.score, max: 40, pct: jobMatchResult.matchBreakdown.skillMatch.percentage },
              { label: "Tools & Tech", score: jobMatchResult.matchBreakdown.toolMatch.score, max: 20, pct: jobMatchResult.matchBreakdown.toolMatch.percentage },
              { label: "Experience", score: jobMatchResult.matchBreakdown.experienceMatch.score, max: 20, pct: jobMatchResult.matchBreakdown.experienceMatch.percentage },
              { label: "Keyword Density", score: jobMatchResult.matchBreakdown.keywordDensity.score, max: 10, pct: jobMatchResult.matchBreakdown.keywordDensity.percentage },
              { label: "ATS Formatting", score: jobMatchResult.matchBreakdown.formatScore.score, max: 10, pct: 100 - (jobMatchResult.matchBreakdown.formatScore.issues?.length || 0) * 20 },
            ].map(({ label, score, max, pct }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                  <span>{label}</span>
                  <span className={getScoreColor(score, max)} style={{ fontWeight: '500' }}>{score}/{max}</span>
                </div>
                <div className="progress-bg">
                  <div className={\`progress-fill \${getProgressColor(pct, 100)}\`} style={{ width: \`\${pct}%\` }} />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {scoreMode === "jobMatch" && jobMatchStale && jobMatchResult && (
          <div className="card" style={{ background: 'rgba(251,191,36,0.1)', borderColor: 'rgba(251,191,36,0.3)', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={14} className="text-amber" />
              <span style={{ fontSize: '11.5px' }}>CV changed — re-analyze for accuracy</span>
            </div>
          </div>
        )}

        {(scoreMode === "jobMatch" && jobMatchResult) && (
          <button className="btn btn-outline" style={{ width: '100%', marginTop: '8px' }} onClick={onViewDetailedAnalysis}>
            <FileSearch size={14} /> View Detailed ATS Analysis
          </button>
        )}
      </div>
    </>
  );
};
