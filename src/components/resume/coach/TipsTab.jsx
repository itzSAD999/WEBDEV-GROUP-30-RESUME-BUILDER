import { useMemo, useState, useCallback } from "react";
import { 
  CheckCircle2, AlertTriangle, AlertCircle, Lightbulb, Target,
  FileText, Briefcase, GraduationCap, Wrench, ChevronRight, Check, Copy
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }

  .scroll-container {
    height: 100%; overflow-y: auto; padding: 12px;
    font-family: var(--font); color: var(--text);
  }

  .summary-bar {
    display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;
  }

  .badge {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 2px 8px; font-size: 10px; font-weight: 600;
    border-radius: 12px; height: 20px;
  }

  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); padding: 12px; margin-bottom: 8px;
    transition: opacity 0.2s;
  }
  .card.applied { opacity: 0.6; }

  .tip-header { display: flex; align-items: flex-start; gap: 10px; }
  
  .tip-content { flex: 1; min-width: 0; }
  .tip-category {
    font-size: 10px; font-weight: 500; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;
  }
  .tip-title { font-size: 13.5px; font-weight: 500; line-height: 1.2; margin-bottom: 4px; }
  .tip-desc { font-size: 12px; color: var(--text-muted); line-height: 1.5; margin: 0; }
  
  .tip-action-text {
    font-size: 12px; font-weight: 500; color: var(--accent);
    display: flex; align-items: center; gap: 4px; margin-top: 8px;
  }

  .action-bar { display: flex; align-items: center; gap: 6px; margin-top: 8px; }

  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 4px;
    padding: 4px 8px; border-radius: var(--r-sm);
    font-size: 10px; font-weight: 500; cursor: pointer;
    border: none; background: transparent; transition: all 0.2s; height: 24px; color: var(--text);
  }
  .btn-primary { background: var(--text); color: var(--bg); }
  .btn-primary:hover { opacity: 0.9; }
  .btn-outline { border: 1px solid var(--border); background: var(--surface2); }
  .btn-outline:hover { background: var(--border); }

  .type-success { border-color: rgba(74, 222, 128, 0.3); background: rgba(74, 222, 128, 0.05); }
  .text-success { color: #4ade80; }
  .badge-success { background: rgba(74, 222, 128, 0.2); color: #4ade80; }

  .type-warning { border-color: rgba(251, 191, 36, 0.3); background: rgba(251, 191, 36, 0.05); }
  .text-warning { color: #fbbf24; }
  .badge-warning { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }

  .type-error { border-color: rgba(248, 113, 113, 0.3); background: rgba(248, 113, 113, 0.05); }
  .text-error { color: #f87171; }
  .badge-error { background: rgba(248, 113, 113, 0.2); color: #f87171; }

  .type-info { border-color: rgba(96, 165, 250, 0.3); background: rgba(96, 165, 250, 0.05); }
  .text-info { color: #60a5fa; }
\`;

export const TipsTab = ({ resumeData, qualityScore, jobMatchResult, onApplySuggestion }) => {
  const [appliedTips, setAppliedTips] = useState(new Set());
  
  const tips = useMemo(() => {
    const result = [];

    // Profile/Summary
    if (!resumeData.profile) {
      result.push({
        id: "missing-summary", type: "error", category: "Summary",
        icon: <FileText size={16} />,
        title: "Add a Professional Summary",
        description: "Recruiters scan the summary first. A 2-3 sentence overview of your qualifications makes a strong first impression.",
        action: "Go to Profile section and add your summary",
        suggestion: {
          text: "Results-driven professional with experience in delivering high-quality work. Skilled in problem-solving, collaboration, and continuous improvement. Seeking to leverage my expertise to contribute to a dynamic team.",
          field: "profile"
        }
      });
    } else if (resumeData.profile.length < 100) {
      result.push({
        id: "short-summary", type: "warning", category: "Summary",
        icon: <FileText size={16} />,
        title: "Expand Your Summary",
        description: "Your summary is brief. Include key achievements and the unique value you bring.",
        action: "Aim for 2-3 impactful sentences",
      });
    } else {
      result.push({
        id: "good-summary", type: "success", category: "Summary",
        icon: <FileText size={16} />,
        title: "Strong Summary",
        description: "Your professional summary provides good context.",
      });
    }

    // Work Experience
    if (!resumeData.workExperience || resumeData.workExperience.length === 0) {
      result.push({
        id: "missing-experience", type: "error", category: "Experience",
        icon: <Briefcase size={16} />,
        title: "Add Work Experience",
        description: "Include relevant work experience, internships, or volunteer positions.",
        action: "Add at least one experience entry"
      });
    } else {
      const allBullets = resumeData.workExperience.flatMap(w => w.responsibilities || []);
      const bulletsWithMetrics = allBullets.filter(b => /d+%|$d+|d+ [a-z]+/i.test(b));
      const weakBullets = allBullets.filter(b => /^(responsible for|helped|worked on|assisted)/i.test(b));

      if (bulletsWithMetrics.length === 0 && allBullets.length > 0) {
        result.push({
          id: "no-metrics", type: "warning", category: "Experience",
          icon: <Target size={16} />,
          title: "Add Quantifiable Results",
          description: "Numbers make impact tangible. e.g., 'Increased sales by 25%' beats 'Increased sales'.",
          action: "Add % gains, $ amounts, or team sizes to your bullets"
        });
      } else if (bulletsWithMetrics.length > 0) {
        result.push({
          id: "has-metrics", type: "success", category: "Experience",
          icon: <Target size={16} />,
          title: "Great Use of Metrics",
          description: \`\${bulletsWithMetrics.length} bullet(s) include measurable results.\`
        });
      }

      if (weakBullets.length > 0) {
        const example = weakBullets[0];
        const improved = example
          .replace(/^responsible for /i, "Managed ")
          .replace(/^helped /i, "Contributed to ")
          .replace(/^worked on /i, "Developed ")
          .replace(/^assisted /i, "Supported ");
        result.push({
          id: "weak-verbs", type: "warning", category: "Experience",
          icon: <Lightbulb size={16} />,
          title: "Strengthen Weak Phrasing",
          description: \`"\${example.slice(0, 50)}..." → Try: "\${improved.slice(0, 50)}..."\`,
          action: "Replace 'Responsible for' with action verbs like Led, Built, Developed",
        });
      }

      const bulletsWithActionVerbs = allBullets.filter(b => 
        /^(Led|Built|Developed|Created|Increased|Reduced|Managed|Designed|Implemented|Launched|Optimized|Streamlined|Delivered|Spearheaded|Orchestrated)/i.test(b)
      );
      if (bulletsWithActionVerbs.length >= allBullets.length / 2 && allBullets.length > 0) {
        result.push({
          id: "strong-verbs", type: "success", category: "Experience",
          icon: <Lightbulb size={16} />,
          title: "Strong Action Verbs",
          description: \`\${bulletsWithActionVerbs.length} bullets start with powerful action verbs.\`
        });
      }
    }

    // Skills
    const ts = resumeData.technicalSkills || [];
    const sc = resumeData.skillCategories || [];
    const totalSkills = ts.length + sc.reduce((sum, cat) => sum + (cat.skills ? cat.skills.length : 0), 0);
    
    if (totalSkills === 0) {
      result.push({
        id: "missing-skills", type: "error", category: "Skills",
        icon: <Wrench size={16} />,
        title: "Add Your Skills",
        description: "Skills are critical for ATS matching. Add 8-15 relevant skills.",
        action: "Add technical and soft skills in the Skills section"
      });
    } else if (totalSkills < 5) {
      result.push({
        id: "few-skills", type: "warning", category: "Skills",
        icon: <Wrench size={16} />,
        title: "Add More Skills",
        description: "You have fewer skills than recommended. Aim for 8-15 to improve ATS matching.",
        action: "Include both technical tools and soft skills"
      });
    } else {
      result.push({
        id: "good-skills", type: "success", category: "Skills",
        icon: <Wrench size={16} />,
        title: "Good Skills Coverage",
        description: \`\${totalSkills} skills listed. Ensure they match your target job.\`
      });
    }

    // Education
    if (!resumeData.education || resumeData.education.length === 0) {
      result.push({
        id: "missing-education", type: "warning", category: "Education",
        icon: <GraduationCap size={16} />,
        title: "Add Education",
        description: "Include your highest degree or relevant certifications.",
        action: "Add education in the Education section"
      });
    }

    // Contact
    if (resumeData.personalInfo && !resumeData.personalInfo.email) {
      result.push({
        id: "missing-email", type: "error", category: "Contact",
        icon: <AlertCircle size={16} />,
        title: "Add Email Address",
        description: "Recruiters need your email. This is essential.",
      });
    }
    if (resumeData.personalInfo && !resumeData.personalInfo.linkedin) {
      result.push({
        id: "missing-linkedin", type: "info", category: "Contact",
        icon: <Lightbulb size={16} />,
        title: "Add LinkedIn Profile",
        description: "LinkedIn increases your visibility to recruiters.",
        action: "Add your LinkedIn URL in Personal Info"
      });
    }

    // ATS risk factors
    if (jobMatchResult) {
      jobMatchResult.atsRiskFactors.forEach((risk, i) => {
        result.push({
          id: \`ats-risk-\${i}\`,
          type: risk.severity === "Critical" ? "error" : risk.severity === "Warning" ? "warning" : "info",
          category: "ATS Match",
          icon: risk.severity === "Critical" ? <AlertCircle size={16} /> : <AlertTriangle size={16} />,
          title: risk.issue,
          description: risk.fix
        });
      });

      jobMatchResult.keywordAnalysis.missing.slice(0, 5).forEach((kw, i) => {
        result.push({
          id: \`missing-kw-\${i}\`,
          type: kw.importance === "High" ? "warning" : "info",
          category: "Keywords",
          icon: <Target size={16} />,
          title: \`Missing: \${kw.keyword}\`,
          description: kw.suggestion || \`Consider adding "\${kw.keyword}" to your resume.\`,
          suggestion: { text: kw.keyword, field: "skill" }
        });
      });
    }

    return result;
  }, [resumeData, jobMatchResult]);

  const handleApply = useCallback((tip) => {
    if (!tip.suggestion) return;
    if (tip.suggestion.field === "profile" && onApplySuggestion) {
      onApplySuggestion("profile", tip.suggestion.text);
      setAppliedTips(prev => new Set(prev).add(tip.id));
      toast({ title: "Applied", description: "Suggestion applied to your resume." });
    } else if (tip.suggestion.field === "skill" && onApplySuggestion) {
      onApplySuggestion("skill", tip.suggestion.text);
      setAppliedTips(prev => new Set(prev).add(tip.id));
      toast({ title: "Skill Added", description: \`"\${tip.suggestion.text}" added to your skills.\` });
    }
  }, [onApplySuggestion]);

  const handleCopy = useCallback((text) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Text copied to clipboard." });
  }, []);

  const getTypeClass = (type) => \`type-\${type}\`;
  const getIconColor = (type) => \`text-\${type}\`;

  const sortedTips = [...tips].sort((a, b) => {
    const order = { error: 0, warning: 1, info: 2, success: 3 };
    return order[a.type] - order[b.type];
  });

  const errorCount = tips.filter(t => t.type === "error").length;
  const warningCount = tips.filter(t => t.type === "warning").length;
  const successCount = tips.filter(t => t.type === "success").length;

  return (
    <>
      <style>{styles}</style>
      <div className="scroll-container">
        
        {/* Summary Bar */}
        <div className="summary-bar">
          {errorCount > 0 && <span className="badge badge-error">{errorCount} Issue{errorCount > 1 ? "s" : ""}</span>}
          {warningCount > 0 && <span className="badge badge-warning">{warningCount} Warning{warningCount > 1 ? "s" : ""}</span>}
          {successCount > 0 && <span className="badge badge-success">{successCount} Good</span>}
          {errorCount === 0 && warningCount === 0 && <span className="badge badge-success">✨ Looking Great!</span>}
        </div>

        {/* Tips List */}
        <div>
          {sortedTips.map((tip) => {
            const isApplied = appliedTips.has(tip.id);
            return (
              <div key={tip.id} className={\`card \${getTypeClass(tip.type)} \${isApplied ? 'applied' : ''}\`}>
                <div className="tip-header">
                  <div className={\`\${getIconColor(tip.type)}\`} style={{ marginTop: '2px' }}>
                    {tip.icon}
                  </div>
                  <div className="tip-content">
                    <div className="tip-category">{tip.category}</div>
                    <h4 className="tip-title">{tip.title}</h4>
                    <p className="tip-desc">{tip.description}</p>
                    
                    {tip.action && !tip.suggestion && (
                      <div className="tip-action-text">
                        <ChevronRight size={12} /> {tip.action}
                      </div>
                    )}

                    {tip.suggestion && onApplySuggestion && (
                      <div className="action-bar">
                        {isApplied ? (
                          <span className="badge badge-success" style={{ gap: '4px' }}>
                            <Check size={10} /> Applied
                          </span>
                        ) : (
                          <>
                            <button className="btn btn-primary" onClick={() => handleApply(tip)}>
                              <Check size={10} /> Apply
                            </button>
                            {tip.suggestion.field === "profile" && (
                              <button className="btn btn-outline" onClick={() => handleCopy(tip.suggestion.text)}>
                                <Copy size={10} /> Copy
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
