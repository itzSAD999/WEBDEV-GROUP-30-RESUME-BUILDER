import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { ATSAnalysisResult } from "@/types/ats";
import { toast } from "@/hooks/use-toast";

interface TailorTabProps {
  jobDescription: string;
  onJobDescriptionChange: (jd: string) => void;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  jobMatchResult: ATSAnalysisResult | null;
  onAutoApplyKeyword?: (keyword: string) => void;
}

export const TailorTab = ({
  jobDescription,
  onJobDescriptionChange,
  isAnalyzing,
  onAnalyze,
  jobMatchResult,
  onAutoApplyKeyword
}: TailorTabProps) => {

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      onJobDescriptionChange(text);
      toast({ title: "Pasted", description: "Job description pasted from clipboard" });
    } catch {
      toast({ title: "Paste failed", description: "Could not read from clipboard", variant: "destructive" });
    }
  }, [onJobDescriptionChange]);

  const handleQuickAdd = (keyword: string) => {
    if (onAutoApplyKeyword) {
      onAutoApplyKeyword(keyword);
      toast({
        title: "Skill Added",
        description: `"${keyword}" has been added to your technical skills.`
      });
    }
  };

  const wordCount = jobDescription.trim() ? jobDescription.trim().split(/\s+/).length : 0;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Job Description Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Job Description
            </label>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handlePaste}>
              <Clipboard className="w-3 h-3 mr-1" />
              Paste
            </Button>
          </div>
          <Textarea
            placeholder="Paste the job description here to get tailored suggestions and see how well your resume matches..."
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange(e.target.value)}
            className="min-h-[140px] text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {wordCount > 0 ? `${wordCount} words` : "Paste a job description to begin"}
          </p>
        </div>

        {/* Analyze Button */}
        <Button 
          className="w-full" 
          disabled={!jobDescription.trim() || isAnalyzing}
          onClick={onAnalyze}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze Job Match
            </>
          )}
        </Button>

        {/* Results */}
        {jobMatchResult && (
          <div className="space-y-4">
            {/* Keywords Found */}
            <Card>
              <CardContent className="p-3">
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Keywords Found ({jobMatchResult.keywordAnalysis.found.length})
                </h4>
                <div className="flex flex-wrap gap-1">
                  {jobMatchResult.keywordAnalysis.found.slice(0, 15).map((kw, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary" 
                      className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    >
                      {kw.keyword}
                      {kw.count > 1 && <span className="ml-1 opacity-70">×{kw.count}</span>}
                    </Badge>
                  ))}
                  {jobMatchResult.keywordAnalysis.found.length > 15 && (
                    <Badge variant="outline" className="text-xs">
                      +{jobMatchResult.keywordAnalysis.found.length - 15} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Missing Keywords */}
            {jobMatchResult.keywordAnalysis.missing.length > 0 && (
              <Card>
                <CardContent className="p-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                    <X className="w-4 h-4 text-red-500" />
                    Missing Keywords ({jobMatchResult.keywordAnalysis.missing.length})
                  </h4>
                  <div className="space-y-2">
                    {jobMatchResult.keywordAnalysis.missing.slice(0, 8).map((kw, i) => (
                      <div 
                        key={i} 
                        className="flex items-start gap-2 text-xs p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-100 dark:border-red-900/30"
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
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{kw.keyword}</span>
                          <p className="text-muted-foreground mt-0.5">{kw.suggestion}</p>
                        </div>
                        {onAutoApplyKeyword && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 shrink-0"
                            onClick={() => handleQuickAdd(kw.keyword)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Synonym Matches */}
            {jobMatchResult.keywordAnalysis.synonymsMatched.length > 0 && (
              <Card>
                <CardContent className="p-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                    <ArrowRight className="w-4 h-4 text-blue-500" />
                    Synonym Matches
                  </h4>
                  <div className="space-y-1">
                    {jobMatchResult.keywordAnalysis.synonymsMatched.slice(0, 5).map((match, i) => (
                      <div key={i} className="text-xs flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium text-foreground">{match.resumeTerm}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span>{match.jdTerm}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills to Add - with auto-apply */}
            {jobMatchResult.tailoringSuggestions.skillsToAdd.length > 0 && (
              <Card>
                <CardContent className="p-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Skills to Add
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {jobMatchResult.tailoringSuggestions.skillsToAdd.map((skill, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs pr-1">
                          {skill}
                          {onAutoApplyKeyword && (
                            <button
                              onClick={() => handleQuickAdd(skill)}
                              className="ml-1 p-0.5 hover:bg-primary/20 rounded-full transition-colors"
                              title="Add to skills"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          )}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Click <Plus className="w-3 h-3 inline" /> to instantly add skills to your resume.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Empty State */}
        {!jobMatchResult && !isAnalyzing && (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <Target className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Paste a job description to see keyword matches, missing skills, and tailored suggestions.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};
