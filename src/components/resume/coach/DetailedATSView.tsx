import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
  ArrowRight
} from "lucide-react";
import { ATSAnalysisResult, ATSRiskFactor } from "@/types/ats";

interface DetailedATSViewProps {
  result: ATSAnalysisResult;
  onClose: () => void;
}

export const DetailedATSView = ({ result, onClose }: DetailedATSViewProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "bg-green-500";
    if (grade.startsWith("B")) return "bg-blue-500";
    if (grade.startsWith("C")) return "bg-amber-500";
    return "bg-red-500";
  };

  const getSeverityIcon = (severity: ATSRiskFactor["severity"]) => {
    switch (severity) {
      case "Critical": return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "Warning": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/30">
        <h3 className="font-semibold text-sm">Detailed ATS Analysis</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Score Header */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <span className={`text-4xl font-bold ${getScoreColor(result.overallScore)}`}>
                      {result.overallScore}
                    </span>
                    <p className="text-xs text-muted-foreground">Overall Score</p>
                  </div>
                  <Badge className={`${getGradeColor(result.grade)} text-white`}>
                    Grade: {result.grade}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">ATS Pass Probability</p>
                  <Badge 
                    variant={
                      result.atsPassProbability === "High" ? "default" : 
                      result.atsPassProbability === "Medium" ? "secondary" : "destructive"
                    }
                  >
                    {result.atsPassProbability}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Match Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Skills Match", ...result.matchBreakdown.skillMatch, max: 40 },
                { label: "Tools & Tech", ...result.matchBreakdown.toolMatch, max: 20 },
                { label: "Experience", ...result.matchBreakdown.experienceMatch, max: 20 },
                { label: "Keyword Density", ...result.matchBreakdown.keywordDensity, max: 10 },
                { label: "ATS Formatting", ...result.matchBreakdown.formatScore, max: 10 },
              ].map(({ label, score, percentage, max }) => (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>{label}</span>
                    <span className={`font-medium ${getScoreColor((score / max) * 100)}`}>
                      {score}/{max}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        percentage >= 80 ? "bg-green-500" : 
                        percentage >= 50 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Keywords Analysis */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileWarning className="w-4 h-4" />
                Keyword Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Found Keywords */}
              <div>
                <h4 className="text-xs font-medium flex items-center gap-1 mb-2">
                  <Check className="w-3 h-3 text-green-500" />
                  Found ({result.keywordAnalysis.found.length})
                </h4>
                <div className="flex flex-wrap gap-1">
                  {result.keywordAnalysis.found.map((kw, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary" 
                      className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    >
                      {kw.keyword}
                      {kw.count > 1 && <span className="ml-1 opacity-70">×{kw.count}</span>}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Missing Keywords */}
              <div>
                <h4 className="text-xs font-medium flex items-center gap-1 mb-2">
                  <X className="w-3 h-3 text-red-500" />
                  Missing ({result.keywordAnalysis.missing.length})
                </h4>
                <div className="space-y-2">
                  {result.keywordAnalysis.missing.map((kw, i) => (
                    <div 
                      key={i} 
                      className="flex items-start gap-2 text-xs p-2 bg-red-50 dark:bg-red-900/20 rounded"
                    >
                      <Badge 
                        variant="outline" 
                        className={`text-xs shrink-0 ${
                          kw.importance === "High" ? "border-red-500 text-red-600" :
                          kw.importance === "Medium" ? "border-amber-500 text-amber-600" :
                          "border-muted-foreground text-muted-foreground"
                        }`}
                      >
                        {kw.importance}
                      </Badge>
                      <div>
                        <span className="font-medium">{kw.keyword}</span>
                        <p className="text-muted-foreground mt-0.5">{kw.suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Synonym Matches */}
              {result.keywordAnalysis.synonymsMatched.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium flex items-center gap-1 mb-2">
                    <ArrowRight className="w-3 h-3 text-blue-500" />
                    Synonym Matches
                  </h4>
                  <div className="space-y-1">
                    {result.keywordAnalysis.synonymsMatched.map((match, i) => (
                      <div key={i} className="text-xs flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium text-foreground">{match.resumeTerm}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span>{match.jdTerm}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ATS Risk Factors */}
          {result.atsRiskFactors.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  ATS Risk Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.atsRiskFactors.map((risk, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs p-2 bg-muted rounded">
                      {getSeverityIcon(risk.severity)}
                      <div>
                        <span className="font-medium">{risk.issue}</span>
                        <p className="text-muted-foreground mt-0.5">{risk.fix}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tailoring Suggestions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Tailoring Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Top Priorities */}
              <div>
                <h4 className="text-xs font-medium flex items-center gap-1 mb-2">
                  <Zap className="w-3 h-3 text-amber-500" />
                  Top Priorities
                </h4>
                <ol className="space-y-1 list-decimal list-inside text-xs">
                  {result.topPriorities.map((priority, i) => (
                    <li key={i} className="text-muted-foreground">
                      <span className="text-foreground">{priority}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Strengths */}
              <div>
                <h4 className="text-xs font-medium flex items-center gap-1 mb-2">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  Your Strengths
                </h4>
                <ul className="space-y-1 text-xs">
                  {result.strengthHighlights.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bullet Rewrites */}
              {result.tailoringSuggestions.bulletRewrites.length > 0 && (
                <Accordion type="single" collapsible>
                  <AccordionItem value="rewrites">
                    <AccordionTrigger className="text-xs font-medium">
                      Bullet Rewrites ({result.tailoringSuggestions.bulletRewrites.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {result.tailoringSuggestions.bulletRewrites.map((rewrite, i) => (
                          <div key={i} className="text-xs space-y-1 p-2 bg-muted rounded">
                            <div className="flex items-start gap-2">
                              <X className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                              <span className="line-through text-muted-foreground">{rewrite.original}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                              <span className="font-medium">{rewrite.improved}</span>
                            </div>
                            <p className="text-muted-foreground pl-5 italic">{rewrite.reason}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              {/* Section Improvements */}
              {result.tailoringSuggestions.sectionImprovements.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium mb-2">Section Improvements</h4>
                  <div className="space-y-2">
                    {result.tailoringSuggestions.sectionImprovements.map((imp, i) => (
                      <div key={i} className="text-xs p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <span className="font-medium text-blue-700 dark:text-blue-400">{imp.section}:</span>
                        <p className="text-blue-600 dark:text-blue-300 mt-0.5">{imp.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary Rewrite */}
              {result.tailoringSuggestions.summaryRewrite && (
                <div>
                  <h4 className="text-xs font-medium mb-2">Suggested Summary</h4>
                  <div className="text-xs p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-100 dark:border-green-900/30">
                    <p className="text-green-800 dark:text-green-300">{result.tailoringSuggestions.summaryRewrite}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};
