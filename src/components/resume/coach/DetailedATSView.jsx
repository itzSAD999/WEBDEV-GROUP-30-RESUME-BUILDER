import { useState } from "react";
import { 
  X,
  Check,
  AlertTriangle,
  AlertCircle,
  Info,
  TrendingUp,
  FileWarning,
  Lightbulb,
  Zap,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  ChevronDown
} from "lucide-react";

const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }

  .ats-container {
    height: 100%; display: flex; flex-direction: column;
    font-family: var(--font); color: var(--text); background: var(--bg);
  }

  .ats-header {
    padding: 12px 16px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(31, 36, 53, 0.3); flex-shrink: 0;
  }
  .ats-header h3 { font-size: 13.5px; font-weight: 600; margin: 0; }
  
  .btn-close {
    background: transparent; border: none; color: var(--text-muted);
    padding: 4px; border-radius: 4px; cursor: pointer; display: flex;
  }
  .btn-close:hover { background: var(--surface2); color: var(--text); }

  .content-area {
    flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 16px;
  }

  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); overflow: hidden;
  }
  
  .card-header { padding: 12px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 600; }
  .card-content { padding: 16px; display: flex; flex-direction: column; gap: 12px; }

  .score-display { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .score-number { font-size: 32px; font-weight: 700; line-height: 1; }
  .score-label { font-size: 11.5px; color: var(--text-muted); margin-top: 4px; }
  
  .badge {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 2px 8px; font-size: 11px; font-weight: 600; border-radius: 12px; height: 20px;
  }
  
  .text-green { color: #4ade80; }
  .bg-green { background: #4ade80; color: #000; }
  .text-blue { color: #60a5fa; }
  .bg-blue { background: #60a5fa; color: #000; }
  .text-amber { color: #fbbf24; }
  .bg-amber { background: #fbbf24; color: #000; }
  .text-red { color: #f87171; }
  .bg-red { background: #f87171; color: #000; }

  .progress-row { display: flex; flex-direction: column; gap: 4px; }
  .progress-labels { display: flex; justify-content: space-between; font-size: 11.5px; }
  .progress-bg { width: 100%; height: 8px; background: var(--surface2); border-radius: 4px; overflow: hidden; }
  .progress-fill { height: 100%; transition: width 0.3s ease; }

  .subsection-title { font-size: 11.5px; font-weight: 600; display: flex; align-items: center; gap: 4px; margin-bottom: 8px; }

  .tag-container { display: flex; flex-wrap: wrap; gap: 4px; }
  .tag {
    display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 12px;
    font-size: 11.5px; border: 1px solid transparent; background: rgba(74, 222, 128, 0.1); color: #4ade80;
  }

  .missing-item {
    display: flex; align-items: flex-start; gap: 8px; font-size: 11.5px;
    padding: 8px; background: rgba(248, 113, 113, 0.05); border-radius: var(--r-sm);
  }
  .missing-badge { border: 1px solid currentColor; padding: 0 6px; border-radius: 4px; font-size: 10px; }

  .synonym-row { font-size: 11.5px; display: flex; align-items: center; gap: 8px; color: var(--text-muted); }
  .synonym-resume { font-weight: 500; color: var(--text); }

  .risk-item {
    display: flex; align-items: flex-start; gap: 8px; font-size: 11.5px;
    padding: 8px; background: rgba(31, 36, 53, 0.4); border-radius: var(--r-sm);
  }
  
  .list-item { font-size: 11.5px; color: var(--text-muted); margin-bottom: 4px; }
  .list-item span { color: var(--text); }
  
  .accordion-trigger {
    width: 100%; display: flex; align-items: center; justify-content: space-between;
    padding: 8px 0; background: transparent; border: none; color: var(--text); font-size: 11.5px;
    font-weight: 500; cursor: pointer; font-family: var(--font);
  }
  .accordion-content { padding-bottom: 8px; display: flex; flex-direction: column; gap: 8px; }
  
  .rewrite-item { font-size: 11.5px; padding: 8px; background: var(--surface2); border-radius: var(--r-sm); display: flex; flex-direction: column; gap: 4px; }
  
  .improvement-item { font-size: 11.5px; padding: 8px; background: rgba(96, 165, 250, 0.05); border-radius: var(--r-sm); }
  .summary-box { font-size: 11.5px; padding: 12px; background: rgba(74, 222, 128, 0.05); border: 1px solid rgba(74, 222, 128, 0.15); border-radius: var(--r-sm); color: #4ade80; }
\`;

export const DetailedATSView = ({ result, onClose }) => {
  const [rewritesOpen, setRewritesOpen] = useState(false);

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green";
    if (score >= 60) return "text-amber";
    return "text-red";
  };
  
  const getProgressColor = (score) => {
    if (score >= 80) return "bg-green";
    if (score >= 60) return "bg-amber";
    return "bg-red";
  };

  const getGradeColor = (grade) => {
    if (grade.startsWith("A")) return "bg-green";
    if (grade.startsWith("B")) return "bg-blue";
    if (grade.startsWith("C")) return "bg-amber";
    return "bg-red";
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "Critical": return <AlertCircle size={14} className="text-red" />;
      case "Warning": return <AlertTriangle size={14} className="text-amber" />;
      default: return <Info size={14} className="text-blue" />;
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="ats-container">
        
        <div className="ats-header">
          <h3>Detailed ATS Analysis</h3>
          <button className="btn-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="content-area">
          
          <div className="card" style={{ background: 'rgba(31, 36, 53, 0.3)' }}>
            <div className="card-content">
              <div className="score-display">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div className={\`score-number \${getScoreColor(result.overallScore)}\`}>{result.overallScore}</div>
                    <div className="score-label">Overall Score</div>
                  </div>
                  <span className={\`badge \${getGradeColor(result.grade)}\`}>Grade: {result.grade}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="score-label" style={{ marginBottom: '4px' }}>ATS Pass Probability</div>
                  <span className={\`badge \${
                    result.atsPassProbability === "High" ? "bg-green" : 
                    result.atsPassProbability === "Medium" ? "bg-amber" : "bg-red"
                  }\`}>
                    {result.atsPassProbability}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><TrendingUp size={16} /> Match Breakdown</div>
            <div className="card-content">
              {[
                { label: "Skills Match", ...result.matchBreakdown.skillMatch, max: 40 },
                { label: "Tools & Tech", ...result.matchBreakdown.toolMatch, max: 20 },
                { label: "Experience", ...result.matchBreakdown.experienceMatch, max: 20 },
                { label: "Keyword Density", ...result.matchBreakdown.keywordDensity, max: 10 },
                { label: "ATS Formatting", ...result.matchBreakdown.formatScore, max: 10 },
              ].map(({ label, score, percentage, max }) => (
                <div key={label} className="progress-row">
                  <div className="progress-labels">
                    <span>{label}</span>
                    <span className={getScoreColor((score / max) * 100)} style={{ fontWeight: 600 }}>{score}/{max}</span>
                  </div>
                  <div className="progress-bg">
                    <div className={\`progress-fill \${getProgressColor(percentage)}\`} style={{ width: \`\${percentage}%\` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><FileWarning size={16} /> Keyword Analysis</div>
            <div className="card-content">
              <div>
                <h4 className="subsection-title"><Check size={12} className="text-green" /> Found ({result.keywordAnalysis.found.length})</h4>
                <div className="tag-container">
                  {result.keywordAnalysis.found.map((kw, i) => (
                    <span key={i} className="tag">
                      {kw.keyword}
                      {kw.count > 1 && <span style={{ opacity: 0.7 }}>×{kw.count}</span>}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="subsection-title" style={{ marginTop: '16px' }}><X size={12} className="text-red" /> Missing ({result.keywordAnalysis.missing.length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.keywordAnalysis.missing.map((kw, i) => (
                    <div key={i} className="missing-item">
                      <span className="missing-badge" style={{
                        color: kw.importance === "High" ? "#f87171" : kw.importance === "Medium" ? "#fbbf24" : "var(--text-muted)"
                      }}>
                        {kw.importance}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{kw.keyword}</div>
                        <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>{kw.suggestion}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {result.keywordAnalysis.synonymsMatched.length > 0 && (
                <div>
                  <h4 className="subsection-title" style={{ marginTop: '16px' }}><ArrowRight size={12} className="text-blue" /> Synonym Matches</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {result.keywordAnalysis.synonymsMatched.map((match, i) => (
                      <div key={i} className="synonym-row">
                        <span className="synonym-resume">{match.resumeTerm}</span>
                        <ArrowRight size={10} />
                        <span>{match.jdTerm}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {result.atsRiskFactors.length > 0 && (
            <div className="card">
              <div className="card-header"><AlertTriangle size={16} className="text-amber" /> ATS Risk Factors</div>
              <div className="card-content">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.atsRiskFactors.map((risk, i) => (
                    <div key={i} className="risk-item">
                      <div style={{ marginTop: '2px' }}>{getSeverityIcon(risk.severity)}</div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{risk.issue}</div>
                        <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>{risk.fix}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header"><Lightbulb size={16} className="text-amber" /> Tailoring Suggestions</div>
            <div className="card-content">
              <div>
                <h4 className="subsection-title"><Zap size={12} className="text-amber" /> Top Priorities</h4>
                <ol style={{ paddingLeft: '16px', margin: 0 }}>
                  {result.topPriorities.map((priority, i) => (
                    <li key={i} className="list-item"><span>{priority}</span></li>
                  ))}
                </ol>
              </div>

              <div>
                <h4 className="subsection-title" style={{ marginTop: '16px' }}><CheckCircle2 size={12} className="text-green" /> Your Strengths</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {result.strengthHighlights.map((strength, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11.5px', marginBottom: '4px' }}>
                      <Check size={12} className="text-green" style={{ marginTop: '2px' }} />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {result.tailoringSuggestions.bulletRewrites.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <button className="accordion-trigger" onClick={() => setRewritesOpen(!rewritesOpen)}>
                    <span>Bullet Rewrites ({result.tailoringSuggestions.bulletRewrites.length})</span>
                    {rewritesOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  {rewritesOpen && (
                    <div className="accordion-content">
                      {result.tailoringSuggestions.bulletRewrites.map((rewrite, i) => (
                        <div key={i} className="rewrite-item">
                          <div style={{ display: 'flex', gap: '8px', color: 'var(--text-muted)' }}>
                            <X size={12} className="text-red" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span style={{ textDecoration: 'line-through' }}>{rewrite.original}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Check size={12} className="text-green" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span style={{ fontWeight: 500 }}>{rewrite.improved}</span>
                          </div>
                          <div style={{ paddingLeft: '20px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                            {rewrite.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {result.tailoringSuggestions.sectionImprovements.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ fontSize: '11.5px', fontWeight: 600, marginBottom: '8px' }}>Section Improvements</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.tailoringSuggestions.sectionImprovements.map((imp, i) => (
                      <div key={i} className="improvement-item">
                        <span style={{ fontWeight: 600, color: '#60a5fa' }}>{imp.section}: </span>
                        <span style={{ color: '#93c5fd' }}>{imp.suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.tailoringSuggestions.summaryRewrite && (
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ fontSize: '11.5px', fontWeight: 600, marginBottom: '8px' }}>Suggested Summary</h4>
                  <div className="summary-box">
                    {result.tailoringSuggestions.summaryRewrite}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </>
  );
};
