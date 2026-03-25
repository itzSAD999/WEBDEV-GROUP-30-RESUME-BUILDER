import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  Target, 
  Zap, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Clipboard,
  Crown
} from "lucide-react";
import { useProTier } from "@/contexts/ProTierContext";
import { ProFeatureLock, ProBadge } from "./ProFeatureLock";

interface AIOptimizerPanelProps {
  resumeData: any;
}

export const AIOptimizerPanel = ({ resumeData }: AIOptimizerPanelProps) => {
  const { isPro, setShowUpgradeDialog } = useProTier();
  const [jobDescription, setJobDescription] = useState("");
  const [activeTab, setActiveTab] = useState("tailor");

  // Mock score calculation
  const calculateScore = () => {
    let score = 0;
    if (resumeData.personalInfo.fullName) score += 10;
    if (resumeData.personalInfo.email) score += 5;
    if (resumeData.personalInfo.phone) score += 5;
    if (resumeData.personalInfo.linkedin) score += 5;
    if (resumeData.profile) score += 15;
    if (resumeData.education.length > 0) score += 15;
    if (resumeData.workExperience.length > 0) score += 20;
    if (resumeData.projects.length > 0) score += 10;
    if (resumeData.technicalSkills.length > 0) score += 10;
    if (jobDescription) score += 5;
    return Math.min(score, 100);
  };

  const score = calculateScore();
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-green-600";
    if (s >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 92) return "Hire Zone! 🎉";
    if (s >= 80) return "Looking Great";
    if (s >= 50) return "Needs Work";
    return "Getting Started";
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Optimizer
          </CardTitle>
          {!isPro && <ProBadge />}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="tailor" className="gap-1">
              <Target className="w-3 h-3" />
              Tailor to Job
            </TabsTrigger>
            <TabsTrigger value="optimize" className="gap-1">
              <Zap className="w-3 h-3" />
              Quick Optimize
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tailor" className="space-y-4">
            {!isPro ? (
              <div className="rounded-lg border-2 border-amber-500/30 bg-amber-500/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-sm">Pro Feature</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Upgrade to unlock AI optimization that tailors your resume to match job requirements.
                </p>
                <Button
                  size="sm"
                  onClick={() => setShowUpgradeDialog(true)}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                >
                  Upgrade to Unlock
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Job Description
                    </label>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      <Clipboard className="w-3 h-3 mr-1" />
                      Paste
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Paste the job description here... The AI will match your resume to job requirements."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[120px] text-sm"
                  />
                </div>

                <Button className="w-full" disabled={!jobDescription}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze & Optimize
                </Button>

                {jobDescription && (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-medium">Keyword Matches:</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">React</Badge>
                      <Badge variant="secondary" className="text-xs">TypeScript</Badge>
                      <Badge variant="outline" className="text-xs text-amber-600">+ Add: AWS</Badge>
                      <Badge variant="outline" className="text-xs text-amber-600">+ Add: Docker</Badge>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="optimize" className="space-y-4">
            {/* Score Display */}
            <div className="text-center py-4">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-muted/30"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (score / 100) * 251.2}
                    className={getScoreColor(score)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className={`absolute text-2xl font-bold ${getScoreColor(score)}`}>
                  {score}
                </span>
              </div>
              <p className={`text-sm font-medium mt-2 ${getScoreColor(score)}`}>
                {getScoreLabel(score)}
              </p>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-3">
              <p className="text-xs font-medium">Score Breakdown:</p>
              
              <ScoreItem 
                label="Content Quality" 
                score={25} 
                max={40} 
                status={score >= 50 ? "good" : "needs-work"}
              />
              <ScoreItem 
                label="ATS & Structure" 
                score={13} 
                max={20} 
                status="good"
              />
              <ScoreItem 
                label="Job Optimization" 
                score={isPro ? 17 : 0} 
                max={25} 
                status={isPro ? "good" : "locked"}
                isPro={!isPro}
              />
              <ScoreItem 
                label="Writing Quality" 
                score={isPro ? 7 : 0} 
                max={10} 
                status={isPro ? "good" : "locked"}
                isPro={!isPro}
              />
              <ScoreItem 
                label="Application Ready" 
                score={4} 
                max={5} 
                status="good"
              />
            </div>

            {!isPro && (
              <Button
                onClick={() => setShowUpgradeDialog(true)}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
              >
                <Crown className="w-4 h-4 mr-2" />
                Unlock Full Score Analysis
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface ScoreItemProps {
  label: string;
  score: number;
  max: number;
  status: "good" | "needs-work" | "locked";
  isPro?: boolean;
}

const ScoreItem = ({ label, score, max, status, isPro }: ScoreItemProps) => {
  const percentage = (score / max) * 100;
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1">
          {label}
          {status === "needs-work" && (
            <span className="text-amber-600">(needs work)</span>
          )}
          {isPro && <ProBadge />}
        </span>
        <span className={isPro ? "text-muted-foreground" : ""}>
          {score}/{max}
        </span>
      </div>
      <Progress 
        value={isPro ? 0 : percentage} 
        className={`h-1.5 ${isPro ? "opacity-50" : ""}`}
      />
    </div>
  );
};
