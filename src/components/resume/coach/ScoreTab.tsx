import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp,
  FileSearch,
  Target,
  FileText,
  Loader2,
  Brain,
  Sparkles,
  XCircle
} from "lucide-react";
import { ResumeQualityScore } from "@/hooks/useATSEngine";
import { ATSAnalysisResult } from "@/types/ats";
import { CVAnalysisResult } from "@/types/cvAnalysis";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ScoreTabProps {
  qualityScore: ResumeQualityScore;
  jobMatchResult: ATSAnalysisResult | null;
  cvAnalysisResult: CVAnalysisResult | null;
  jobDescription: string;
  isAnalyzing: boolean;
  isAnalyzingCV: boolean;
  onViewDetailedAnalysis: () => void;
  onRunCVAnalysis: () => void;
  scoreMode: "quality" | "jobMatch" | "cvAnalysis";
  onScoreModeChange: (mode: "quality" | "jobMatch" | "cvAnalysis") => void;
  cvAnalysisStale?: boolean;
  jobMatchStale?: boolean;
}

export const ScoreTab = ({
  qualityScore,
  jobMatchResult,
  cvAnalysisResult,
  jobDescription,
  isAnalyzing,
  isAnalyzingCV,
  onViewDetailedAnalysis,
  onRunCVAnalysis,
  scoreMode,
  onScoreModeChange,
  cvAnalysisStale,
  jobMatchStale,
}: ScoreTabProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const getScoreColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return "text-green-600 dark:text-green-400";
    if (pct >= 50) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getProgressColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return "bg-green-500";
    if (pct >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const getGradeLabel = (score: number) => {
    if (score >= 90) return { text: "Excellent", color: "bg-green-500" };
    if (score >= 75) return { text: "Good", color: "bg-green-400" };
    if (score >= 50) return { text: "Needs Work", color: "bg-amber-500" };
    return { text: "Getting Started", color: "bg-red-500" };
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "High") return "text-red-600 dark:text-red-400";
    if (priority === "Medium") return "text-amber-600 dark:text-amber-400";
    return "text-blue-600 dark:text-blue-400";
  };

  const currentScore = scoreMode === "quality" 
    ? qualityScore.total 
    : scoreMode === "jobMatch" 
      ? (jobMatchResult?.overallScore || 0) 
      : (cvAnalysisResult?.overallScore || 0);
  const grade = getGradeLabel(currentScore);
  const canShowJobMatch = jobDescription.trim().length > 0;
  const isLoading = scoreMode === "jobMatch" ? isAnalyzing : scoreMode === "cvAnalysis" ? isAnalyzingCV : false;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Score Mode Toggle - 3 tabs */}
        <div className="flex gap-1 bg-muted/40 p-1 rounded-lg">
          <button
            onClick={() => onScoreModeChange("quality")}
            className={`flex-1 text-xs font-medium py-2 px-2 rounded-md transition-all ${
              scoreMode === "quality" 
                ? "bg-background shadow-sm text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TrendingUp className="w-3 h-3 mx-auto mb-0.5" />
            Quality
          </button>
          <button
            onClick={() => onScoreModeChange("cvAnalysis")}
            className={`flex-1 text-xs font-medium py-2 px-2 rounded-md transition-all ${
              scoreMode === "cvAnalysis" 
                ? "bg-background shadow-sm text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Brain className="w-3 h-3 mx-auto mb-0.5" />
            AI Review
          </button>
          <button
            onClick={() => onScoreModeChange("jobMatch")}
            disabled={!canShowJobMatch}
            className={`flex-1 text-xs font-medium py-2 px-2 rounded-md transition-all ${
              scoreMode === "jobMatch" 
                ? "bg-background shadow-sm text-foreground" 
                : !canShowJobMatch
                  ? "text-muted-foreground/40 cursor-not-allowed"
                  : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Target className="w-3 h-3 mx-auto mb-0.5" />
            Job Match
          </button>
        </div>

        {/* Score Circle */}
        <div className="text-center py-4">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {scoreMode === "cvAnalysis" ? "AI is reviewing your CV..." : "Analyzing resume..."}
              </p>
            </div>
          ) : scoreMode === "cvAnalysis" && !cvAnalysisResult ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2 text-center">
                <h4 className="font-semibold text-foreground">AI-Powered CV Review</h4>
                <p className="text-xs text-muted-foreground max-w-[250px]">
                  Get an expert-level analysis of your CV's content, impact, and readiness — scored by AI.
                </p>
              </div>
              <Button onClick={onRunCVAnalysis} className="gap-2">
                <Sparkles className="w-4 h-4" />
                Analyze My CV
              </Button>
            </div>
          ) : (
            <>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64" cy="64" r="56"
                    stroke="currentColor" strokeWidth="8"
                    fill="transparent" className="text-muted/30"
                  />
                  <circle
                    cx="64" cy="64" r="56"
                    stroke="currentColor" strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={351.86}
                    strokeDashoffset={351.86 - (currentScore / 100) * 351.86}
                    className={getScoreColor(currentScore, 100)}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className={`text-4xl font-bold ${getScoreColor(currentScore, 100)}`}>
                    {currentScore}
                  </span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
              </div>
              <Badge className={`mt-2 ${grade.color} text-white`}>
                {scoreMode === "cvAnalysis" && cvAnalysisResult?.grade 
                  ? `Grade: ${cvAnalysisResult.grade}` 
                  : grade.text}
              </Badge>
              {scoreMode === "cvAnalysis" && cvAnalysisResult && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant={
                    cvAnalysisResult.industryReadiness === "Ready" ? "default" : 
                    cvAnalysisResult.industryReadiness === "Almost Ready" ? "secondary" : "destructive"
                  }>
                    {cvAnalysisResult.industryReadiness}
                  </Badge>
                </div>
              )}
              {scoreMode === "jobMatch" && jobMatchResult && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">ATS Pass:</span>
                  <Badge 
                    variant={
                      jobMatchResult.atsPassProbability === "High" ? "default" : 
                      jobMatchResult.atsPassProbability === "Medium" ? "secondary" : "destructive"
                    }
                  >
                    {jobMatchResult.atsPassProbability}
                  </Badge>
                </div>
              )}
            </>
          )}
        </div>

        {/* Score Breakdown */}
        {scoreMode === "quality" ? (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Score Breakdown
            </h4>
            
            {[
              { key: "content", label: "Content Quality", data: qualityScore.content },
              { key: "ats", label: "ATS & Structure", data: qualityScore.ats },
              { key: "completeness", label: "Section Completeness", data: qualityScore.completeness },
              { key: "impact", label: "Impact Language", data: qualityScore.impact },
              { key: "ready", label: "Application Ready", data: qualityScore.ready },
            ].map(({ key, label, data }) => (
              <Collapsible 
                key={key}
                open={expandedCategory === key}
                onOpenChange={(open) => setExpandedCategory(open ? key : null)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="flex items-center gap-2 flex-1">
                      {expandedCategory === key ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">{label}</span>
                    </div>
                    <span className={`text-sm font-medium ${getScoreColor(data.score, data.max)}`}>
                      {data.score}/{data.max}
                    </span>
                  </div>
                  <div className="px-2 pb-2">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${getProgressColor(data.score, data.max)}`}
                        style={{ width: `${(data.score / data.max) * 100}%` }}
                      />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pl-8 pr-2 pb-2 space-y-1">
                    {data.details.map((detail, i) => (
                      <div key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        {detail.startsWith("✓") ? (
                          <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                        ) : detail.startsWith("⚠") ? (
                          <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                        )}
                        <span>{detail.replace(/^[✓✗⚠]\s*/, "")}</span>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}

            {/* Link to AI Review */}
            <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/15">
              <div className="flex items-center gap-2 mb-1.5">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Want deeper insights?</span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2">
                Quality Score is a quick checklist. Run AI Review for expert-level content analysis, rewrite suggestions, and industry readiness.
              </p>
              <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs h-7" onClick={() => { onScoreModeChange("cvAnalysis"); onRunCVAnalysis(); }}>
                <Sparkles className="w-3 h-3" /> Run AI Review
              </Button>
            </div>
          </div>
        ) : scoreMode === "cvAnalysis" && cvAnalysisResult ? (
          <div className="space-y-4">
            {/* Executive Summary */}
            {cvAnalysisResult.executiveSummary && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-3">
                  <p className="text-xs text-foreground leading-relaxed">{cvAnalysisResult.executiveSummary}</p>
                  {cvAnalysisResult.estimatedCallbackRate && (
                    <p className="text-xs font-medium text-primary mt-2">
                      📊 {cvAnalysisResult.estimatedCallbackRate}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Category Breakdown */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Detailed Breakdown
              </h4>
              
              {cvAnalysisResult.categories?.map((cat, idx) => (
                <Collapsible 
                  key={idx}
                  open={expandedCategory === `cv-${idx}`}
                  onOpenChange={(open) => setExpandedCategory(open ? `cv-${idx}` : null)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                      <div className="flex items-center gap-2 flex-1">
                        {expandedCategory === `cv-${idx}` ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">{cat.name}</span>
                        <span className="text-[10px] text-muted-foreground">({cat.weight}%)</span>
                      </div>
                      <span className={`text-sm font-medium ${getScoreColor(cat.score, 100)}`}>
                        {cat.score}/100
                      </span>
                    </div>
                    <div className="px-2 pb-2">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${getProgressColor(cat.score, 100)}`}
                          style={{ width: `${cat.score}%` }}
                        />
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pl-8 pr-2 pb-3 space-y-2">
                      <p className="text-xs text-muted-foreground">{cat.feedback}</p>
                      {cat.strengths?.length > 0 && (
                        <div className="space-y-1">
                          {cat.strengths.map((s, i) => (
                            <div key={i} className="text-xs flex items-start gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                              <span className="text-muted-foreground">{s}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {cat.improvements?.length > 0 && (
                        <div className="space-y-1">
                          {cat.improvements.map((imp, i) => (
                            <div key={i} className="text-xs flex items-start gap-1.5">
                              <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                              <span className="text-muted-foreground">{imp}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>

            {/* Critical Improvements */}
            {cvAnalysisResult.criticalImprovements?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Priority Actions
                </h4>
                {cvAnalysisResult.criticalImprovements.map((item, i) => (
                  <Card key={i} className="bg-muted/30">
                    <CardContent className="p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </Badge>
                        <span className="text-xs font-medium text-foreground">{item.issue}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.fix}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Stale indicator */}
            {cvAnalysisStale && (
              <Card className="bg-amber-500/10 border-amber-500/30">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-xs text-foreground">CV updated since last analysis</span>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={onRunCVAnalysis}>
                    <Sparkles className="w-3 h-3" /> Sync
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Re-analyze button */}
            {!cvAnalysisStale && (
              <Button variant="outline" size="sm" className="w-full gap-2" onClick={onRunCVAnalysis}>
                <Sparkles className="w-3 h-3" />
                Re-analyze CV
              </Button>
            )}
          </div>
        ) : scoreMode === "jobMatch" && jobMatchResult ? (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Target className="w-4 h-4" />
              Job Match Breakdown
            </h4>
            
            {[
              { label: "Skills Match", score: jobMatchResult.matchBreakdown.skillMatch.score, max: 40, pct: jobMatchResult.matchBreakdown.skillMatch.percentage },
              { label: "Tools & Tech", score: jobMatchResult.matchBreakdown.toolMatch.score, max: 20, pct: jobMatchResult.matchBreakdown.toolMatch.percentage },
              { label: "Experience", score: jobMatchResult.matchBreakdown.experienceMatch.score, max: 20, pct: jobMatchResult.matchBreakdown.experienceMatch.percentage },
              { label: "Keyword Density", score: jobMatchResult.matchBreakdown.keywordDensity.score, max: 10, pct: jobMatchResult.matchBreakdown.keywordDensity.percentage },
              { label: "ATS Formatting", score: jobMatchResult.matchBreakdown.formatScore.score, max: 10, pct: 100 - (jobMatchResult.matchBreakdown.formatScore.issues?.length || 0) * 20 },
            ].map(({ label, score, max, pct }) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>{label}</span>
                  <span className={`font-medium ${getScoreColor(score, max)}`}>{score}/{max}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${getProgressColor(pct, 100)}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Stale indicator for job match */}
        {scoreMode === "jobMatch" && jobMatchStale && jobMatchResult && (
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-foreground">CV changed — re-analyze for accuracy</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* View Detailed Analysis Button */}
        {(scoreMode === "jobMatch" && jobMatchResult) && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={onViewDetailedAnalysis}
          >
            <FileSearch className="w-4 h-4 mr-2" />
            View Detailed ATS Analysis
          </Button>
        )}
      </div>
    </ScrollArea>
  );
};
