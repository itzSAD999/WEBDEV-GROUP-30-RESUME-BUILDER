import { useState } from "react";
import { 
  Check, 
  X, 
  Bookmark,
  TrendingUp,
  ArrowRight
} from "lucide-react";

// CSS styles injected via template literal
const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599; --danger: #f75f5f;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }
  
  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); padding: 16px; margin-bottom: 12px;
    font-family: var(--font); color: var(--text);
  }
  
  .card-header {
    display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
    margin-bottom: 12px;
  }
  
  .badge {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 2px 8px; font-size: 10.5px; font-weight: 500;
    border-radius: 12px; margin-bottom: 4px;
    border: 1px solid currentColor;
  }
  
  .badge-skill { background: rgba(59, 130, 246, 0.1); color: #60a5fa; border-color: rgba(59, 130, 246, 0.3); }
  .badge-bullet { background: rgba(168, 85, 247, 0.1); color: #c084fc; border-color: rgba(168, 85, 247, 0.3); }
  .badge-summary { background: rgba(34, 197, 94, 0.1); color: #4ade80; border-color: rgba(34, 197, 94, 0.3); }
  .badge-section { background: rgba(245, 158, 11, 0.1); color: #fbbf24; border-color: rgba(245, 158, 11, 0.3); }

  .title { font-size: 13.5px; font-weight: 500; margin: 0; }
  .score-boost { display: flex; align-items: center; gap: 4px; font-size: 11.5px; color: #4ade80; flex-shrink: 0; }
  
  .section-label { font-size: 11px; font-weight: 500; color: var(--text-muted); margin-bottom: 2px; }
  .section-text { font-size: 13px; margin: 0 0 12px 0; }
  
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 6px 12px; border-radius: var(--r-sm);
    font-size: 12px; font-weight: 500; cursor: pointer;
    transition: all 0.2s; border: none; background: transparent; color: var(--text);
  }
  .btn-primary { background: var(--text); color: var(--bg); }
  .btn-primary:hover { opacity: 0.9; }
  .btn-outline { border: 1px solid var(--border); background: var(--surface2); }
  .btn-outline:hover { background: var(--border); }
  .btn-ghost { padding: 4px 8px; }
  .btn-ghost:hover { background: var(--surface2); }
  .btn-block { width: 100%; justify-content: space-between; }
  
  .preview-area {
    background: rgba(31, 36, 53, 0.4); border-radius: var(--r-sm); padding: 12px;
    margin-top: 8px; display: flex; flex-direction: column; gap: 8px;
  }
  
  .action-bar {
    display: flex; align-items: center; gap: 8px; padding-top: 12px;
    margin-top: 12px; border-top: 1px solid var(--border);
  }
  
  .scroll-container { height: 100%; overflow-y: auto; padding: 16px; font-family: var(--font); color: var(--text); }
  .empty-state { text-align: center; padding: 32px 0; color: var(--text-muted); }
  
  .saved-card {
    background: var(--surface); border: 1px solid var(--border); opacity: 0.6;
    border-radius: var(--r); padding: 12px; margin-bottom: 8px; transition: opacity 0.2s;
  }
  .saved-card:hover { opacity: 1; }
\`;

export const SuggestionCard = ({ suggestion, onApply, onDismiss, onSave }) => {
  const [showPreview, setShowPreview] = useState(false);

  const getTypeClass = (type) => {
    switch (type) {
      case "skill": return "badge-skill";
      case "bullet": return "badge-bullet";
      case "summary": return "badge-summary";
      case "section": return "badge-section";
      default: return "";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "skill": return "Add Skill";
      case "bullet": return "Rewrite Bullet";
      case "summary": return "Improve Summary";
      case "section": return "Section Change";
      default: return "Suggestion";
    }
  };

  if (suggestion.status !== "pending") return null;

  return (
    <>
      <style>{styles}</style>
      <div className="card">
        <div className="card-header">
          <div>
            <span className={\`badge \${getTypeClass(suggestion.type)}\`}>
              {getTypeLabel(suggestion.type)}
            </span>
            <h4 className="title">{suggestion.title}</h4>
          </div>
          <div className="score-boost">
            <TrendingUp size={12} /> +{suggestion.estimatedScoreImprovement}
          </div>
        </div>

        <div>
          <p className="section-label">Problem</p>
          <p className="section-text">{suggestion.problem}</p>
        </div>

        <div>
          <p className="section-label">Why it matters</p>
          <p className="section-text" style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{suggestion.whyItMatters}</p>
        </div>

        {(suggestion.before || suggestion.after) && (
          <div>
            <button className="btn btn-ghost btn-block" onClick={() => setShowPreview(!showPreview)}>
              <span>Preview Change</span>
              <ArrowRight size={12} style={{ transform: showPreview ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            
            {showPreview && (
              <div className="preview-area">
                {suggestion.before && (
                  <div>
                    <p className="section-label" style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <X size={12} /> Before
                    </p>
                    <p className="section-text" style={{ textDecoration: 'line-through', color: 'var(--text-muted)', marginBottom: 0 }}>
                      {suggestion.before}
                    </p>
                  </div>
                )}
                <div>
                  <p className="section-label" style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={12} /> After
                  </p>
                  <p className="section-text" style={{ marginBottom: 0 }}>{suggestion.after}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="action-bar">
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onApply(suggestion)}>
            <Check size={14} /> Apply
          </button>
          <button className="btn btn-outline" onClick={() => onSave(suggestion)}>
            <Bookmark size={14} />
          </button>
          <button className="btn btn-ghost" onClick={() => onDismiss(suggestion)}>
            <X size={14} />
          </button>
        </div>
      </div>
    </>
  );
};

export const SuggestionsPanel = ({ suggestions, onApply, onDismiss, onSave }) => {
  const pendingSuggestions = suggestions.filter(s => s.status === "pending");
  const savedSuggestions = suggestions.filter(s => s.status === "saved");

  if (pendingSuggestions.length === 0 && savedSuggestions.length === 0) {
    return (
      <>
        <style>{styles}</style>
        <div className="empty-state">
          <p style={{ fontSize: '13.5px' }}>No suggestions available yet.</p>
          <p style={{ fontSize: '11.5px', marginTop: '4px' }}>Add a job description to get tailored suggestions.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="scroll-container">
        {pendingSuggestions.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: '600' }}>Suggestions</h4>
              <span className="badge" style={{ background: 'var(--surface2)', color: 'var(--text)', border: 'none' }}>
                {pendingSuggestions.length} pending
              </span>
            </div>
            {pendingSuggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onApply={onApply}
                onDismiss={onDismiss}
                onSave={onSave}
              />
            ))}
          </div>
        )}

        {savedSuggestions.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-muted)' }}>Saved for Later</h4>
              <span className="badge badge-outline" style={{ color: 'var(--text-muted)' }}>
                {savedSuggestions.length}
              </span>
            </div>
            {savedSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="saved-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span className="badge badge-outline" style={{ display: 'inline-block', marginBottom: '4px' }}>{suggestion.type}</span>
                    <p style={{ fontSize: '12px', fontWeight: '500', margin: 0 }}>{suggestion.title}</p>
                  </div>
                  <button className="btn btn-ghost" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => onApply(suggestion)}>
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
