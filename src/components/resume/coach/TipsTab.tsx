import { useMemo, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle2, AlertTriangle, AlertCircle, Lightbulb, Target,
  FileText, Briefcase, GraduationCap, Wrench, ChevronRight, Check, Copy
} from "lucide-react";
import { ResumeData } from "@/types/resume";
import { ResumeQualityScore } from "@/hooks/useATSEngine";
import { ATSAnalysisResult } from "@/types/ats";
import { toast } from "@/hooks/use-toast";

interface Tip {
  id: string;
  type: "success" | "warning" | "error" | "info";
  category: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: string;
  suggestion?: { text: string; field: string };
}

interface TipsTabProps {
  resumeData: ResumeData;
  qualityScore: ResumeQualityScore;
  jobMatchResult: ATSAnalysisResult | null;
  onApplySuggestion?: (field: string, value: string) => void;
}

export const TipsTab = ({ resumeData, qualityScore, jobMatchResult, onApplySuggestion }: TipsTabProps) => {
  const [appliedTips, setAppliedTips] = useState<Set<string>>(new Set());
  
  const tips = useMemo((): Tip[] => {
    const result: Tip[] = [];

    // Profile/Summary
    if (!resumeData.profile) {
      result.push({
        id: "missing-summary", type: "error", category: "Summary",
        icon: <FileText className="w-4 h-4" />,
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
        icon: <FileText className="w-4 h-4" />,
        title: "Expand Your Summary",
        description: "Your summary is brief. Include key achievements and the unique value you bring.",
        action: "Aim for 2-3 impactful sentences",
      });
    } else {
      result.push({
        id: "good-summary", type: "success", category: "Summary",
        icon: <FileText className="w-4 h-4" />,
        title: "Strong Summary",
        description: "Your professional summary provides good context.",
      });
    }

    // Work Experience
    if (resumeData.workExperience.length === 0) {
      result.push({
        id: "missing-experience", type: "error", category: "Experience",
        icon: <Briefcase className="w-4 h-4" />,
        title: "Add Work Experience",
        description: "Include relevant work experience, internships, or volunteer positions.",
        action: "Add at least one experience entry"
      });
    } else {
      const allBullets = resumeData.workExperience.flatMap(w => w.responsibilities);
      const bulletsWithMetrics = allBullets.filter(b => /\d+%|\$\d+|\d+ [a-z]+/i.test(b));
      const weakBullets = allBullets.filter(b => /^(responsible for|helped|worked on|assisted)/i.test(b));

      if (bulletsWithMetrics.length === 0 && allBullets.length > 0) {
        result.push({
          id: "no-metrics", type: "warning", category: "Experience",
          icon: <Target className="w-4 h-4" />,
          title: "Add Quantifiable Results",
          description: "Numbers make impact tangible. e.g., 'Increased sales by 25%' beats 'Increased sales'.",
          action: "Add % gains, $ amounts, or team sizes to your bullets"
        });
      } else if (bulletsWithMetrics.length > 0) {
        result.push({
          id: "has-metrics", type: "success", category: "Experience",
          icon: <Target className="w-4 h-4" />,
          title: "Great Use of Metrics",
          description: `${bulletsWithMetrics.length} bullet(s) include measurable results.`
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
          icon: <Lightbulb className="w-4 h-4" />,
          title: "Strengthen Weak Phrasing",
          description: `"${example.slice(0, 50)}..." → Try: "${improved.slice(0, 50)}..."`,
          action: "Replace 'Responsible for' with action verbs like Led, Built, Developed",
        });
      }

      const bulletsWithActionVerbs = allBullets.filter(b => 
        /^(Led|Built|Developed|Created|Increased|Reduced|Managed|Designed|Implemented|Launched|Optimized|Streamlined|Delivered|Spearheaded|Orchestrated)/i.test(b)
      );
      if (bulletsWithActionVerbs.length >= allBullets.length / 2 && allBullets.length > 0) {
        result.push({
          id: "strong-verbs", type: "success", category: "Experience",
          icon: <Lightbulb className="w-4 h-4" />,
          title: "Strong Action Verbs",
          description: `${bulletsWithActionVerbs.length} bullets start with powerful action verbs.`
        });
      }
    }

    // Skills
    const totalSkills = resumeData.technicalSkills.length + 
      (resumeData.skillCategories?.reduce((sum, cat) => sum + cat.skills.length, 0) || 0);
    if (totalSkills === 0) {
      result.push({
        id: "missing-skills", type: "error", category: "Skills",
        icon: <Wrench className="w-4 h-4" />,
        title: "Add Your Skills",
        description: "Skills are critical for ATS matching. Add 8-15 relevant skills.",
        action: "Add technical and soft skills in the Skills section"
      });
    } else if (totalSkills < 5) {
      result.push({
        id: "few-skills", type: "warning", category: "Skills",
        icon: <Wrench className="w-4 h-4" />,
        title: "Add More Skills",
        description: "You have fewer skills than recommended. Aim for 8-15 to improve ATS matching.",
        action: "Include both technical tools and soft skills"
      });
    } else {
      result.push({
        id: "good-skills", type: "success", category: "Skills",
        icon: <Wrench className="w-4 h-4" />,
        title: "Good Skills Coverage",
        description: `${totalSkills} skills listed. Ensure they match your target job.`
      });
    }

    // Education
    if (resumeData.education.length === 0) {
      result.push({
        id: "missing-education", type: "warning", category: "Education",
        icon: <GraduationCap className="w-4 h-4" />,
        title: "Add Education",
        description: "Include your highest degree or relevant certifications.",
        action: "Add education in the Education section"
      });
    }

    // Contact
    if (!resumeData.personalInfo.email) {
      result.push({
        id: "missing-email", type: "error", category: "Contact",
        icon: <AlertCircle className="w-4 h-4" />,
        title: "Add Email Address",
        description: "Recruiters need your email. This is essential.",
      });
    }
    if (!resumeData.personalInfo.linkedin) {
      result.push({
        id: "missing-linkedin", type: "info", category: "Contact",
        icon: <Lightbulb className="w-4 h-4" />,
        title: "Add LinkedIn Profile",
        description: "LinkedIn increases your visibility to recruiters.",
        action: "Add your LinkedIn URL in Personal Info"
      });
    }

    // ATS risk factors
    if (jobMatchResult) {
      jobMatchResult.atsRiskFactors.forEach((risk, i) => {
        result.push({
          id: `ats-risk-${i}`,
          type: risk.severity === "Critical" ? "error" : risk.severity === "Warning" ? "warning" : "info",
          category: "ATS Match",
          icon: risk.severity === "Critical" ? <AlertCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />,
          title: risk.issue,
          description: risk.fix
        });
      });

      // Missing keywords as actionable tips
      jobMatchResult.keywordAnalysis.missing.slice(0, 5).forEach((kw, i) => {
        result.push({
          id: `missing-kw-${i}`,
          type: kw.importance === "High" ? "warning" : "info",
          category: "Keywords",
          icon: <Target className="w-4 h-4" />,
          title: `Missing: ${kw.keyword}`,
          description: kw.suggestion || `Consider adding "${kw.keyword}" to your resume.`,
          suggestion: { text: kw.keyword, field: "skill" }
        });
      });
    }

    return result;
  }, [resumeData, jobMatchResult]);

  const handleApply = useCallback((tip: Tip) => {
    if (!tip.suggestion) return;
    if (tip.suggestion.field === "profile" && onApplySuggestion) {
      onApplySuggestion("profile", tip.suggestion.text);
      setAppliedTips(prev => new Set(prev).add(tip.id));
      toast({ title: "Applied", description: "Suggestion applied to your resume." });
    } else if (tip.suggestion.field === "skill" && onApplySuggestion) {
      onApplySuggestion("skill", tip.suggestion.text);
      setAppliedTips(prev => new Set(prev).add(tip.id));
      toast({ title: "Skill Added", description: `"${tip.suggestion.text}" added to your skills.` });
    }
  }, [onApplySuggestion]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Text copied to clipboard." });
  }, []);

  const getTypeStyles = (type: Tip["type"]) => {
    switch (type) {
      case "success": return "border-green-500/30 bg-green-500/5";
      case "warning": return "border-amber-500/30 bg-amber-500/5";
      case "error": return "border-red-500/30 bg-red-500/5";
      default: return "border-blue-500/30 bg-blue-500/5";
    }
  };

  const getIconColor = (type: Tip["type"]) => {
    switch (type) {
      case "success": return "text-green-500";
      case "warning": return "text-amber-500";
      case "error": return "text-red-500";
      default: return "text-blue-500";
    }
  };

  const sortedTips = [...tips].sort((a, b) => {
    const order = { error: 0, warning: 1, info: 2, success: 3 };
    return order[a.type] - order[b.type];
  });

  const errorCount = tips.filter(t => t.type === "error").length;
  const warningCount = tips.filter(t => t.type === "warning").length;
  const successCount = tips.filter(t => t.type === "success").length;

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-3">
        {/* Summary Bar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {errorCount > 0 && (
            <Badge variant="destructive" className="text-[10px] h-5">{errorCount} Issue{errorCount > 1 ? "s" : ""}</Badge>
          )}
          {warningCount > 0 && (
            <Badge variant="secondary" className="text-[10px] h-5 bg-amber-500/20 text-amber-700 dark:text-amber-400">{warningCount} Warning{warningCount > 1 ? "s" : ""}</Badge>
          )}
          {successCount > 0 && (
            <Badge variant="secondary" className="text-[10px] h-5 bg-green-500/20 text-green-700 dark:text-green-400">{successCount} Good</Badge>
          )}
          {errorCount === 0 && warningCount === 0 && (
            <Badge variant="secondary" className="text-[10px] h-5 bg-green-500/20 text-green-700">✨ Looking Great!</Badge>
          )}
        </div>

        {/* Tips List */}
        <div className="space-y-2">
          {sortedTips.map((tip) => {
            const isApplied = appliedTips.has(tip.id);
            return (
              <Card key={tip.id} className={`border ${getTypeStyles(tip.type)} transition-all ${isApplied ? "opacity-60" : ""}`}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-2.5">
                    <div className={`mt-0.5 shrink-0 ${getIconColor(tip.type)}`}>{tip.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{tip.category}</span>
                      </div>
                      <h4 className="text-sm font-medium leading-tight">{tip.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tip.description}</p>
                      
                      {tip.action && !tip.suggestion && (
                        <p className="text-xs font-medium mt-2 text-primary flex items-center gap-1">
                          <ChevronRight className="w-3 h-3" /> {tip.action}
                        </p>
                      )}

                      {/* Actionable suggestion */}
                      {tip.suggestion && onApplySuggestion && (
                        <div className="mt-2 flex items-center gap-1.5">
                          {isApplied ? (
                            <Badge variant="secondary" className="text-[10px] bg-green-500/20 text-green-700 gap-1">
                              <Check className="w-3 h-3" /> Applied
                            </Badge>
                          ) : (
                            <>
                              <Button size="sm" variant="default" className="h-6 text-[10px] px-2 gap-1" onClick={() => handleApply(tip)}>
                                <Check className="w-3 h-3" /> Apply
                              </Button>
                              {tip.suggestion.field === "profile" && (
                                <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 gap-1" onClick={() => handleCopy(tip.suggestion!.text)}>
                                  <Copy className="w-3 h-3" /> Copy
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
};
