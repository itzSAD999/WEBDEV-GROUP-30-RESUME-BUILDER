import { useState } from "react";
import { 
  CheckCircle, AlertCircle, Sparkles, Loader2, Lightbulb, Zap, PenLine, RefreshCw, X
} from "lucide-react";

// CSS styles injected via template literal
const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599;
    --danger: #ef4444; --warning: #f59e0b; --success: #10b981;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }
  
  .proofread-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 6px 12px; border-radius: var(--r-sm); font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.2s; font-family: var(--font);
    background: transparent; color: var(--text); border: 1px solid transparent; text-decoration: none;
  }
  .proofread-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .proofread-btn:not(:disabled):hover { background: rgba(255,255,255,0.05); }
  
  /* Modal Styles */
  .modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(2px);
    display: flex; align-items: center; justify-content: center;
    z-index: 100; font-family: var(--font); color: var(--text); padding: 16px;
  }
  .modal-content {
    background: var(--bg); border: 1px solid var(--border); border-radius: var(--r);
    width: 100%; max-width: 600px; max-height: 85vh; display: flex; flex-direction: column;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5); overflow: hidden;
  }
  .modal-header { padding: 16px; border-bottom: 1px solid var(--border); }
  .modal-title { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 600; margin-bottom: 4px; }
  .modal-desc { font-size: 14px; color: var(--text-muted); }
  
  .modal-body { flex: 1; overflow-y: auto; padding: 16px; }
  .modal-footer { padding: 16px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 8px; }
  
  .loader-container { display: flex; flex-direction: column; items-center: center; justify-content: center; padding: 48px 0; text-align: center; }
  .spinner { animation: spin 1s linear infinite; margin-bottom: 16px; color: var(--accent); }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  
  .success-container { text-align: center; padding: 48px 0; }
  .success-icon { color: var(--success); margin: 0 auto 16px; display: block; }
  .success-title { font-size: 18px; font-weight: 500; margin-bottom: 4px; }
  .success-desc { font-size: 14px; color: var(--text-muted); }
  
  /* Summary Bar */
  .summary-bar { display: flex; gap: 16px; padding: 12px; border-bottom: 1px solid var(--border); }
  .summary-item { display: flex; align-items: center; gap: 6px; font-size: 14px; }
  .summary-count { font-weight: 500; }
  
  /* Issues List */
  .issues-list { display: flex; flex-direction: column; gap: 12px; padding: 8px 0; }
  .issue-card {
    padding: 12px; border-radius: var(--r-sm); border: 1px solid var(--border);
    display: flex; gap: 12px; align-items: flex-start;
  }
  .issue-card.error { border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.05); }
  .issue-card.warning { border-color: rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.05); }
  .issue-card.suggestion { border-color: rgba(79, 142, 247, 0.3); background: rgba(79, 142, 247, 0.05); }
  
  .issue-content { flex: 1; min-width: 0; }
  .issue-header { display: flex; items-center: center; gap: 8px; margin-bottom: 4px; }
  
  .badge { display: inline-flex; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
  .badge-error { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
  .badge-warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
  .badge-suggestion { background: rgba(79, 142, 247, 0.1); color: #4f8ef7; }
  .badge-improvement { background: rgba(16, 185, 129, 0.1); color: #10b981; }
  
  .issue-category { font-size: 12px; color: var(--text-muted); }
  .issue-reason { font-size: 14px; font-weight: 500; margin-bottom: 8px; }
  .issue-diff { font-size: 12px; display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
  .issue-original { color: var(--text-muted); text-decoration: line-through; }
  .issue-arrow { color: var(--text-muted); }
  .issue-suggestion { color: var(--accent); font-weight: 500; }
  
  /* Buttons */
  .btn {
    display: inline-flex; align-items: center; gap: 8px; justify-content: center;
    padding: 8px 16px; border-radius: var(--r-sm); font-size: 13.5px; font-weight: 500;
    cursor: pointer; transition: all 0.2s; border: 1px solid transparent; font-family: var(--font);
  }
  .btn-outline { background: transparent; border-color: var(--border); color: var(--text); }
  .btn-outline:hover { background: rgba(255,255,255,0.05); }
  .btn-primary { background: var(--text); color: var(--bg); }
  .btn-primary:hover { opacity: 0.9; }
\`;

function analyzeText(text, fieldName) {
  const issues = [];
  if (!text || text.length < 5) return issues;
  
  // 1. Weak verbs check
  const weakVerbs = [
    ["helped", "facilitated, enabled, supported"],
    ["helped with", "contributed to, led, managed"],
    ["worked on", "developed, implemented, engineered"],
    ["was responsible for", "managed, led, oversaw, directed"],
    ["assisted with", "supported, collaborated on, contributed to"],
    ["participated in", "contributed to, engaged in, drove"],
    ["was involved in", "led, coordinated, spearheaded"],
    ["did", "completed, executed, delivered"],
    ["made", "created, developed, produced"],
    ["got", "achieved, obtained, secured"]
  ];
  
  weakVerbs.forEach(([weak, strong]) => {
    if (text.toLowerCase().includes(weak)) {
      issues.push({
        type: "suggestion",
        category: "Action Verbs",
        original: weak,
        suggestion: strong,
        reason: "Use stronger action verbs to make your achievements more impactful"
      });
    }
  });
  
  // 2. Missing quantification check
  const hasNumbers = /d+/.test(text);
  const isDescriptive = text.length > 40;
  const suggestMetrics = [
    "increased", "decreased", "improved", "reduced", "managed", 
    "led", "delivered", "completed", "achieved", "generated"
  ];
  
  if (!hasNumbers && isDescriptive) {
    const hasActionWord = suggestMetrics.some(word => text.toLowerCase().includes(word));
    if (hasActionWord) {
      issues.push({
        type: "improvement",
        category: "Impact Metrics",
        original: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
        suggestion: "Add specific numbers (e.g., '25%', 'team of 5', '$10K')",
        reason: "Quantified achievements are 40% more likely to catch a recruiter's attention"
      });
    }
  }
  
  // 3. Passive voice detection
  const passivePatterns = [
    [/wass+(w+ed|built|created|developed|managed)/gi, "I $1"],
    [/weres+(w+ed|built|created|developed)/gi, "$1"],
    [/iss+beings+(w+ed)/gi, "$1"],
    [/hass+beens+(w+ed)/gi, "$1"],
    [/hads+beens+(w+ed)/gi, "$1"]
  ];
  
  passivePatterns.forEach(([pattern, replacement]) => {
    const match = text.match(pattern);
    if (match) {
      issues.push({
        type: "warning",
        category: "Voice",
        original: match[0],
        suggestion: \`Use active voice: "\${replacement.replace('$1', match[1] || 'action')}"\`,
        reason: "Active voice is more direct and impactful on resumes"
      });
    }
  });
  
  // 4. Common grammar and style issues
  const grammarRules = [
    [/bib/g, "I", "Capitalization", "Always capitalize 'I'"],
    [/s{2,}/g, " ", "Spacing", "Remove extra spaces"],
    [/,,+/g, ",", "Punctuation", "Remove duplicate commas"],
    [/.{2,}/g, ".", "Punctuation", "Remove extra periods"],
    [/s+./g, ".", "Spacing", "Remove space before period"],
    [/s+,/g, ",", "Spacing", "Remove space before comma"],
    [/btehb/gi, "the", "Spelling", "Common typo: 'teh' → 'the'"],
    [/brecieveb/gi, "receive", "Spelling", "Correct spelling: 'receive'"],
    [/bseperateb/gi, "separate", "Spelling", "Correct spelling: 'separate'"],
    [/baccomplisedb/gi, "accomplished", "Spelling", "Correct spelling: 'accomplished'"],
    [/bacheivedb/gi, "achieved", "Spelling", "Correct spelling: 'achieved'"],
    [/bexperianceb/gi, "experience", "Spelling", "Correct spelling: 'experience'"]
  ];
  
  grammarRules.forEach(([pattern, replacement, category, reason]) => {
    if (pattern.test(text)) {
      const match = text.match(pattern);
      if (match) {
        issues.push({
          type: "error",
          category,
          original: match[0],
          suggestion: replacement,
          reason
        });
      }
    }
  });
  
  // 5. Buzzword and cliché detection
  const cliches = [
    "team player", "hard worker", "detail-oriented", "self-motivated",
    "results-driven", "think outside the box", "go-getter", "synergy",
    "leverage", "circle back", "move the needle"
  ];
  
  cliches.forEach(cliche => {
    if (text.toLowerCase().includes(cliche)) {
      issues.push({
        type: "suggestion",
        category: "Clarity",
        original: cliche,
        suggestion: "Replace with specific examples of how you demonstrate this quality",
        reason: "Clichés are overused and don't differentiate you from other candidates"
      });
    }
  });
  
  // 6. Sentence length check
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  sentences.forEach(sentence => {
    const wordCount = sentence.trim().split(/s+/).length;
    if (wordCount > 30) {
      issues.push({
        type: "warning",
        category: "Readability",
        original: sentence.substring(0, 40) + "...",
        suggestion: "Break this into 2-3 shorter sentences",
        reason: "Long sentences can be hard to scan quickly"
      });
    }
  });
  
  // 7. First-person pronoun check (for bullet points)
  if (fieldName === "responsibility" || fieldName === "bullet") {
    if (/^Is/i.test(text.trim())) {
      issues.push({
        type: "suggestion",
        category: "Style",
        original: "I " + text.split(" ").slice(1, 3).join(" ") + "...",
        suggestion: "Start with action verb directly (e.g., 'Led' instead of 'I led')",
        reason: "Resume bullet points should start with action verbs, not 'I'"
      });
    }
  }
  
  // 8. Missing period at end
  if (text.length > 20 && !/[.!?]$/.test(text.trim())) {
    issues.push({
      type: "suggestion",
      category: "Punctuation",
      original: "..." + text.slice(-20),
      suggestion: "Add period at the end",
      reason: "Consistent punctuation looks more professional"
    });
  }
  
  return issues;
}

function applyCorrections(text, issues) {
  let corrected = text;
  const autoFixable = issues.filter(i => i.type === "error");
  
  autoFixable.forEach(issue => {
    if (issue.original && issue.suggestion) {
      if (issue.category === "Capitalization" && issue.original === "i") {
        corrected = corrected.replace(/bib/g, "I");
      } else if (issue.category === "Spacing") {
        corrected = corrected.replace(/s{2,}/g, " ");
        corrected = corrected.replace(/s+./g, ".");
        corrected = corrected.replace(/s+,/g, ",");
      } else if (issue.category === "Punctuation") {
        corrected = corrected.replace(/,,+/g, ",");
        corrected = corrected.replace(/.{2,}/g, ".");
      } else if (issue.category === "Spelling") {
        corrected = corrected.replace(new RegExp(issue.original, "gi"), issue.suggestion);
      }
    }
  });
  
  return corrected;
}

export const EnhancedProofreadButton = ({ 
  text, 
  onApply, 
  label = "Proofread", 
  variant = "ghost",
  size = "sm",
  fieldName
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState([]);

  const handleProofread = async () => {
    setLoading(true);
    setOpen(true);
    
    await new Promise(r => setTimeout(r, 600));
    
    const foundIssues = analyzeText(text, fieldName);
    setIssues(foundIssues);
    setLoading(false);
  };

  const handleApplyAll = () => {
    const corrected = applyCorrections(text, issues);
    onApply(corrected);
    setOpen(false);
    
    // Using native alert instead of toast for simplicity in vanilla JS mode
    const errorCount = issues.filter(i => i.type === "error").length;
    if (errorCount > 0) {
      // In a real implementation a toast system would be better but we fallback to console/alert
      console.log(\`Fixed \${errorCount} issue(s) in your text.\`);
    }
  };

  const getIssueIcon = (type) => {
    switch (type) {
      case "error": return <AlertCircle size={16} color="#ef4444" />;
      case "warning": return <AlertCircle size={16} color="#f59e0b" />;
      case "suggestion": return <Lightbulb size={16} color="#4f8ef7" />;
      case "improvement": return <Zap size={16} color="#10b981" />;
      default: return <PenLine size={16} color="#6b7599" />;
    }
  };

  const getIssueBadge = (type) => {
    switch (type) {
      case "error": return <span className="badge badge-error">Error</span>;
      case "warning": return <span className="badge badge-warning">Warning</span>;
      case "suggestion": return <span className="badge badge-suggestion">Suggestion</span>;
      case "improvement": return <span className="badge badge-improvement">Improvement</span>;
      default: return null;
    }
  };

  const errorCount = issues.filter(i => i.type === "error").length;
  const warningCount = issues.filter(i => i.type === "warning").length;
  const suggestionCount = issues.filter(i => i.type === "suggestion" || i.type === "improvement").length;

  return (
    <>
      <style>{styles}</style>
      <button
        type="button"
        className="proofread-btn"
        onClick={handleProofread}
        disabled={!text || text.length < 10}
      >
        <Sparkles size={14} />
        {label}
      </button>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <Sparkles size={20} color="var(--accent)" />
                Proofreading Analysis
              </h2>
              <p className="modal-desc">
                Review suggestions to improve your content's impact and clarity
              </p>
            </div>

            <div className="modal-body">
              {loading ? (
                <div className="loader-container">
                  <Loader2 size={32} className="spinner" />
                  <p className="modal-desc">Analyzing your text...</p>
                </div>
              ) : issues.length === 0 ? (
                <div className="success-container">
                  <CheckCircle size={64} className="success-icon" />
                  <h3 className="success-title">Looking great!</h3>
                  <p className="success-desc">
                    No issues found. Your text is well-written.
                  </p>
                </div>
              ) : (
                <>
                  <div className="summary-bar">
                    {errorCount > 0 && (
                      <div className="summary-item">
                        <AlertCircle size={16} color="var(--danger)" />
                        <span className="summary-count" style={{ color: "var(--danger)" }}>{errorCount}</span>
                        <span style={{ color: "var(--text-muted)" }}>errors</span>
                      </div>
                    )}
                    {warningCount > 0 && (
                      <div className="summary-item">
                        <AlertCircle size={16} color="var(--warning)" />
                        <span className="summary-count" style={{ color: "var(--warning)" }}>{warningCount}</span>
                        <span style={{ color: "var(--text-muted)" }}>warnings</span>
                      </div>
                    )}
                    {suggestionCount > 0 && (
                      <div className="summary-item">
                        <Lightbulb size={16} color="var(--accent)" />
                        <span className="summary-count" style={{ color: "var(--accent)" }}>{suggestionCount}</span>
                        <span style={{ color: "var(--text-muted)" }}>suggestions</span>
                      </div>
                    )}
                  </div>

                  <div className="issues-list">
                    {issues.map((issue, index) => (
                      <div
                        key={index}
                        className={\`issue-card \${issue.type === 'error' ? 'error' : issue.type === 'warning' ? 'warning' : 'suggestion'}\`}
                      >
                        {getIssueIcon(issue.type)}
                        <div className="issue-content">
                          <div className="issue-header">
                            {getIssueBadge(issue.type)}
                            <span className="issue-category">{issue.category}</span>
                          </div>
                          <p className="issue-reason">{issue.reason}</p>
                          <div className="issue-diff">
                            <span className="issue-original">{issue.original}</span>
                            <span className="issue-arrow">→</span>
                            <span className="issue-suggestion">{issue.suggestion}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setOpen(false)}>
                Close
              </button>
              {!loading && issues.length > 0 && errorCount > 0 && (
                <button className="btn btn-primary" onClick={handleApplyAll}>
                  <RefreshCw size={16} />
                  Fix {errorCount} Error{errorCount !== 1 ? 's' : ''}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
