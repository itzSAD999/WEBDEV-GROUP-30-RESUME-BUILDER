import { useState } from "react";
import { CheckCircle, AlertCircle, Sparkles, Loader2 } from "lucide-react";

const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599;
    --danger: #ef4444; --warning: #f59e0b; --success: #10b981;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }
  
  .proofread-sm-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 6px 12px; border-radius: var(--r-sm); font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.2s; font-family: var(--font);
    background: transparent; color: var(--text); border: 1px solid transparent; text-decoration: none;
  }
  .proofread-sm-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .proofread-sm-btn:not(:disabled):hover { background: rgba(255,255,255,0.05); }

  /* Modal */
  .modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(2px);
    display: flex; align-items: center; justify-content: center;
    z-index: 100; font-family: var(--font); color: var(--text); padding: 16px;
  }
  .modal-content {
    background: var(--bg); border: 1px solid var(--border); border-radius: var(--r);
    width: 100%; max-width: 500px; max-height: 80vh; display: flex; flex-direction: column;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5); overflow: hidden;
  }
  .modal-header { padding: 16px; border-bottom: 1px solid var(--border); }
  .modal-title { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 600; margin-bottom: 4px; }
  .modal-desc { font-size: 14px; color: var(--text-muted); }
  
  .modal-body { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
  .modal-footer { padding: 16px; border-top: 1px solid var(--border); display: flex; gap: 8px; }
  
  .loader-container { display: flex; align-items: center; justify-content: center; padding: 32px 0; }
  .spinner { animation: spin 1s linear infinite; color: var(--accent); }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  
  .success-container { text-align: center; padding: 32px 0; }
  .success-icon { color: var(--success); margin: 0 auto 12px; display: block; }
  .success-title { font-size: 16px; font-weight: 500; margin-bottom: 4px; color: var(--text); }
  .success-desc { font-size: 14px; color: var(--text-muted); }
  
  /* Issues */
  .issue-card {
    padding: 12px; border-radius: var(--r-sm); border: 1px solid var(--border);
    display: flex; gap: 12px; align-items: flex-start;
  }
  .issue-card.error { border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.05); }
  .issue-card.warning { border-color: rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.05); }
  .issue-card.suggestion { border-color: rgba(79, 142, 247, 0.3); background: rgba(79, 142, 247, 0.05); }
  
  .issue-content { flex: 1; min-width: 0; }
  .issue-reason { font-size: 14px; font-weight: 500; margin-bottom: 4px; color: var(--text); }
  .issue-diff { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
  .issue-original { text-decoration: line-through; }
  .issue-suggestion { color: var(--accent); font-weight: 500; }
  
  /* Buttons */
  .btn {
    flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 8px 16px; border-radius: var(--r-sm); font-size: 13.5px; font-weight: 500;
    cursor: pointer; transition: all 0.2s; border: 1px solid transparent; font-family: var(--font);
  }
  .btn-outline { background: transparent; border-color: var(--border); color: var(--text); }
  .btn-outline:hover { background: rgba(255,255,255,0.05); }
  .btn-primary { background: var(--text); color: var(--bg); }
  .btn-primary:hover { opacity: 0.9; }
\`;

const proofreadText = (text) => {
  const results = [];
  
  const weakVerbs = ["helped", "worked on", "was responsible for", "assisted with", "participated in"];
  weakVerbs.forEach((verb) => {
    if (text.toLowerCase().includes(verb)) {
      results.push({
        type: "suggestion",
        original: verb,
        suggestion: verb === "helped" ? "enabled/facilitated" :
                    verb === "worked on" ? "developed/implemented" :
                    verb === "was responsible for" ? "managed/led" :
                    verb === "assisted with" ? "contributed to/supported" :
                    "engaged in/led",
        reason: "Consider using stronger action verbs",
      });
    }
  });

  if (!/d+/.test(text) && text.length > 30) {
    results.push({
      type: "suggestion",
      original: text.substring(0, 30) + "...",
      suggestion: "Add specific numbers (e.g., 'increased by 25%', 'managed team of 5')",
      reason: "Quantify achievements for more impact",
    });
  }

  const commonIssues = [
    [/bib/g, "I", "Capitalize 'I'"],
    [/s{2,}/g, " ", "Remove extra spaces"],
    [/,,/g, ",", "Remove duplicate comma"],
    [/.{2,}/g, ".", "Remove extra periods"],
  ];

  commonIssues.forEach(([pattern, replacement, reason]) => {
    if (pattern.test(text)) {
      results.push({
        type: "error",
        original: text.match(pattern)?.[0] || "",
        suggestion: replacement,
        reason,
      });
    }
  });

  const passiveIndicators = ["was created", "were developed", "is managed", "are handled"];
  passiveIndicators.forEach((phrase) => {
    if (text.toLowerCase().includes(phrase)) {
      results.push({
        type: "warning",
        original: phrase,
        suggestion: "Use active voice (e.g., 'created', 'developed', 'manage', 'handle')",
        reason: "Passive voice can weaken impact",
      });
    }
  });

  return results;
};

export const ProofreadButton = ({ text, onApply, label = "Check Grammar" }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleProofread = async () => {
    setLoading(true);
    setOpen(true);
    
    await new Promise((r) => setTimeout(r, 500));
    
    const proofreadResults = proofreadText(text);
    setResults(proofreadResults);
    setLoading(false);
  };

  const applyCorrections = () => {
    let corrected = text;
    
    results
      .filter((r) => r.type === "error")
      .forEach((r) => {
        if (r.original && r.suggestion) {
          corrected = corrected.replace(r.original, r.suggestion);
        }
      });
    
    onApply(corrected);
    setOpen(false);
    
    // In vanila, we'd log or alert if needed, toast is unavailable here without import
    console.log("Corrections applied");
  };

  return (
    <>
      <style>{styles}</style>
      <button
        type="button"
        className="proofread-sm-btn"
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
                Proofreading Results
              </h2>
              <p className="modal-desc">
                Review suggestions to improve your content
              </p>
            </div>

            <div className="modal-body">
              {loading ? (
                <div className="loader-container">
                  <Loader2 size={24} className="spinner" />
                </div>
              ) : results.length === 0 ? (
                <div className="success-container">
                  <CheckCircle size={48} className="success-icon" />
                  <h3 className="success-title">Looks great!</h3>
                  <p className="success-desc">No issues found in your text.</p>
                </div>
              ) : (
                results.map((result, index) => (
                  <div
                    key={index}
                    className={\`issue-card \${
                      result.type === "error" ? "error" 
                      : result.type === "warning" ? "warning" : "suggestion"
                    }\`}
                  >
                    {result.type === "error" ? (
                      <AlertCircle size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
                    ) : result.type === "warning" ? (
                      <AlertCircle size={16} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} />
                    ) : (
                      <Sparkles size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                    )}
                    <div className="issue-content">
                      <p className="issue-reason">{result.reason}</p>
                      <p className="issue-diff">
                        <span className="issue-original">{result.original}</span>
                        {" → "}
                        <span className="issue-suggestion">{result.suggestion}</span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setOpen(false)}>
                Dismiss
              </button>
              {results.some((r) => r.type === "error") && (
                <button className="btn btn-primary" onClick={applyCorrections}>
                  Apply Corrections
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
