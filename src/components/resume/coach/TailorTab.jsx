import { useCallback } from "react";
import { 
  Target, 
  Clipboard,
  Loader2,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Lightbulb,
  Plus
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599; --danger: #f75f5f;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }

  .scroll-container {
    height: 100%; overflow-y: auto; padding: 16px;
    font-family: var(--font); color: var(--text);
  }

  .input-label {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 8px; font-size: 13.5px; font-weight: 500;
  }

  .textarea {
    width: 100%; min-height: 140px; padding: 12px; border-radius: var(--r-sm);
    background: rgba(31, 36, 53, 0.4); border: 1px solid var(--border);
    color: var(--text); font-family: var(--font); font-size: 13.5px;
    resize: vertical; outline: none; transition: border-color 0.2s;
  }
  .textarea:focus { border-color: var(--accent); }

  .word-count { font-size: 11.5px; color: var(--text-muted); margin-top: 4px; }

  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 8px 16px; border-radius: var(--r-sm);
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: all 0.2s; border: none; font-family: var(--font);
  }
  .btn-primary { background: var(--text); color: var(--bg); }
  .btn-primary:hover { opacity: 0.9; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-ghost { background: transparent; color: var(--text); padding: 4px 8px; font-size: 11.5px; }
  .btn-ghost:hover { background: var(--surface2); }
  .btn-block { width: 100%; margin: 16px 0; }

  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); padding: 12px; margin-bottom: 16px;
  }
  .card-dashed { border-style: dashed; text-align: center; padding: 24px; }

  .card-title {
    font-size: 13.5px; font-weight: 600; display: flex; align-items: center; gap: 8px;
    margin-bottom: 8px;
  }

  .tag-container { display: flex; flex-wrap: wrap; gap: 4px; }
  .tag {
    display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 12px;
    font-size: 11.5px; border: 1px solid transparent; gap: 4px;
  }
  .tag-green { background: rgba(74, 222, 128, 0.1); color: #4ade80; }
  .tag-outline { background: transparent; border-color: var(--border); color: var(--text); }
  
  .missing-item {
    display: flex; align-items: flex-start; gap: 8px; padding: 8px;
    background: rgba(248, 113, 113, 0.05); border: 1px solid rgba(248, 113, 113, 0.15);
    border-radius: var(--r-sm); margin-bottom: 8px;
  }
  .missing-badge {
    font-size: 10.5px; padding: 0 6px; border-radius: 4px; border: 1px solid currentColor; flex-shrink: 0;
  }
  .missing-content { flex: 1; min-width: 0; }
  .missing-word { font-weight: 500; font-size: 13px; margin-bottom: 2px; }
  .missing-desc { font-size: 11.5px; color: var(--text-muted); margin: 0; }

  .synonym-row {
    font-size: 11.5px; display: flex; align-items: center; gap: 8px;
    color: var(--text-muted); padding: 4px 0;
  }
  .synonym-resume { font-weight: 500; color: var(--text); }

  .add-skill-btn {
    background: transparent; border: none; padding: 2px; border-radius: 50%;
    color: inherit; cursor: pointer; display: flex;
  }
  .add-skill-btn:hover { background: rgba(255, 255, 255, 0.1); }
\`;

export const TailorTab = ({
  jobDescription,
  onJobDescriptionChange,
  isAnalyzing,
  onAnalyze,
  jobMatchResult,
  onAutoApplyKeyword
}) => {

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      onJobDescriptionChange(text);
      toast({ title: "Pasted", description: "Job description pasted from clipboard" });
    } catch {
      toast({ title: "Paste failed", description: "Could not read from clipboard", variant: "destructive" });
    }
  }, [onJobDescriptionChange]);

  const handleQuickAdd = (keyword) => {
    if (onAutoApplyKeyword) {
      onAutoApplyKeyword(keyword);
      toast({
        title: "Skill Added",
        description: \`"\${keyword}" has been added to your technical skills.\`
      });
    }
  };

  const wordCount = jobDescription && jobDescription.trim() ? jobDescription.trim().split(/s+/).length : 0;

  return (
    <>
      <style>{styles}</style>
      <div className="scroll-container">
        
        {/* JD Input Box */}
        <div>
          <div className="input-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Target size={14} /> Job Description</span>
            <button className="btn btn-ghost" onClick={handlePaste}>
              <Clipboard size={12} /> Paste
            </button>
          </div>
          <textarea
            className="textarea"
            placeholder="Paste the job description here to get tailored suggestions and see how well your resume matches..."
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange(e.target.value)}
          />
          <p className="word-count">
            {wordCount > 0 ? \`\${wordCount} words\` : "Paste a job description to begin"}
          </p>
        </div>

        {/* Analyze btn */}
        <button 
          className="btn btn-primary btn-block" 
          disabled={!jobDescription || !jobDescription.trim() || isAnalyzing}
          onClick={onAnalyze}
        >
          {isAnalyzing ? (
            <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</>
          ) : (
            <><Sparkles size={14} /> Analyze Job Match</>
          )}
        </button>

        {/* Dynamic Results */}
        {jobMatchResult && (
          <div>
            {/* Keywords Found */}
            <div className="card">
              <h4 className="card-title">
                <Check size={16} color="#4ade80" /> Keywords Found ({jobMatchResult.keywordAnalysis.found.length})
              </h4>
              <div className="tag-container">
                {jobMatchResult.keywordAnalysis.found.slice(0, 15).map((kw, i) => (
                  <span key={i} className="tag tag-green">
                    {kw.keyword}
                    {kw.count > 1 && <span style={{ opacity: 0.7 }}>×{kw.count}</span>}
                  </span>
                ))}
                {jobMatchResult.keywordAnalysis.found.length > 15 && (
                  <span className="tag tag-outline">+{jobMatchResult.keywordAnalysis.found.length - 15} more</span>
                )}
              </div>
            </div>

            {/* Missing Keywords */}
            {jobMatchResult.keywordAnalysis.missing.length > 0 && (
              <div className="card">
                <h4 className="card-title">
                  <X size={16} color="#f87171" /> Missing Keywords ({jobMatchResult.keywordAnalysis.missing.length})
                </h4>
                <div>
                  {jobMatchResult.keywordAnalysis.missing.slice(0, 8).map((kw, i) => {
                    const statusColor = 
                      kw.importance === "High" ? "#f87171" :
                      kw.importance === "Medium" ? "#fbbf24" : "var(--text-muted)";
                      
                    return (
                      <div key={i} className="missing-item">
                        <span className="missing-badge" style={{ color: statusColor }}>
                          {kw.importance}
                        </span>
                        <div className="missing-content">
                          <p className="missing-word">{kw.keyword}</p>
                          <p className="missing-desc">{kw.suggestion}</p>
                        </div>
                        {onAutoApplyKeyword && (
                          <button className="btn btn-ghost" style={{ padding: '4px 6px' }} onClick={() => handleQuickAdd(kw.keyword)}>
                            <Plus size={12} /> Add
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Synonym Matches */}
            {jobMatchResult.keywordAnalysis.synonymsMatched.length > 0 && (
              <div className="card">
                <h4 className="card-title">
                  <ArrowRight size={16} color="#60a5fa" /> Synonym Matches
                </h4>
                <div>
                  {jobMatchResult.keywordAnalysis.synonymsMatched.slice(0, 5).map((match, i) => (
                    <div key={i} className="synonym-row">
                      <span className="synonym-resume">{match.resumeTerm}</span>
                      <ArrowRight size={10} />
                      <span>{match.jdTerm}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills to Add */}
            {jobMatchResult.tailoringSuggestions.skillsToAdd.length > 0 && (
              <div className="card">
                <h4 className="card-title">
                  <Lightbulb size={16} color="#fbbf24" /> Skills to Add
                </h4>
                <div className="tag-container">
                  {jobMatchResult.tailoringSuggestions.skillsToAdd.map((skill, i) => (
                    <span key={i} className="tag tag-outline" style={{ paddingRight: onAutoApplyKeyword ? '4px' : '8px' }}>
                      {skill}
                      {onAutoApplyKeyword && (
                        <button className="add-skill-btn" title="Add to skills" onClick={() => handleQuickAdd(skill)}>
                          <Plus size={12} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Click <Plus size={10} style={{ display: 'inline' }} /> to instantly add skills to your resume.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!jobMatchResult && !isAnalyzing && (
          <div className="card card-dashed">
            <Target size={32} style={{ color: 'rgba(107, 117, 153, 0.5)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Paste a job description to see keyword matches, missing skills, and tailored suggestions.
            </p>
          </div>
        )}

      </div>
    </>
  );
};
