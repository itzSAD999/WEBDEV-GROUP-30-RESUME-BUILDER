import { useState, useCallback, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Lightbulb, Target, MessageSquare } from "lucide-react";
import { ResumeData } from "@/types/resume";
import { useATSEngine } from "@/hooks/useATSEngine";
import { ScoreTab } from "./coach/ScoreTab";
import { TipsTab } from "./coach/TipsTab";
import { TailorTab } from "./coach/TailorTab";
import { ChatTab } from "./coach/ChatTab";
import { DetailedATSView } from "./coach/DetailedATSView";
import { toast } from "@/hooks/use-toast";

interface UnifiedResumeCoachProps {
  resumeData: ResumeData;
  selectedText?: string;
  onClearSelectedText?: () => void;
  onUpdateResumeData?: (data: Partial<ResumeData>) => void;
  coachSyncRequest?: {
    mode: "quality" | "jobMatch" | "cvAnalysis";
    nonce: number;
  };
}

export const UnifiedResumeCoach = ({
  resumeData,
  selectedText,
  onClearSelectedText,
  onUpdateResumeData,
  coachSyncRequest,
}: UnifiedResumeCoachProps) => {
  const [activeTab, setActiveTab] = useState("score");
  const [scoreMode, setScoreMode] = useState<"quality" | "jobMatch" | "cvAnalysis">("quality");
  const [showDetailedATS, setShowDetailedATS] = useState(false);
  const [atsState, atsActions] = useATSEngine(resumeData);
  const lastHandledSyncNonceRef = useRef(0);

  const switchToScoreMode = useCallback((mode: "quality" | "jobMatch" | "cvAnalysis") => {
    setActiveTab("score");
    setScoreMode(mode);

    if (mode === "cvAnalysis" && !atsState.cvAnalysisResult && !atsState.isAnalyzingCV) {
      atsActions.analyzeCVContent();
    }
  }, [atsState.cvAnalysisResult, atsState.isAnalyzingCV, atsActions]);

  // Backward-compatible event listener
  useEffect(() => {
    const handler = () => switchToScoreMode("cvAnalysis");
    window.addEventListener("switch-to-cv-analysis", handler);
    return () => window.removeEventListener("switch-to-cv-analysis", handler);
  }, [switchToScoreMode]);

  // App-level sync request (reliable on both desktop and mobile)
  useEffect(() => {
    if (!coachSyncRequest || coachSyncRequest.nonce === 0) return;
    if (coachSyncRequest.nonce === lastHandledSyncNonceRef.current) return;

    lastHandledSyncNonceRef.current = coachSyncRequest.nonce;
    switchToScoreMode(coachSyncRequest.mode);
  }, [coachSyncRequest, switchToScoreMode]);

  const handleAnalyze = async () => {
    const result = await atsActions.analyzeJobMatch();
    if (result) setScoreMode("jobMatch");
  };

  const handleRunCVAnalysis = async () => {
    const result = await atsActions.analyzeCVContent();
    if (result) setScoreMode("cvAnalysis");
  };

  const handleAutoApplyKeyword = useCallback((keyword: string) => {
    if (!onUpdateResumeData) return;
    const currentSkills = resumeData.technicalSkills || [];
    if (currentSkills.some((s) => s.toLowerCase() === keyword.toLowerCase())) {
      toast({ title: "Already Exists", description: `"${keyword}" is already in your skills.`, variant: "destructive" });
      return;
    }
    onUpdateResumeData({ technicalSkills: [...currentSkills, keyword] });
  }, [resumeData.technicalSkills, onUpdateResumeData]);

  const handleApplySuggestion = useCallback((field: string, value: string) => {
    if (!onUpdateResumeData) return;
    if (field === "profile") {
      onUpdateResumeData({ profile: value });
    } else if (field === "skill") {
      const currentSkills = resumeData.technicalSkills || [];
      if (!currentSkills.some((s) => s.toLowerCase() === value.toLowerCase())) {
        onUpdateResumeData({ technicalSkills: [...currentSkills, value] });
      }
    }
  }, [resumeData.technicalSkills, onUpdateResumeData]);

  if (showDetailedATS && atsState.jobMatchResult) {
    return <DetailedATSView result={atsState.jobMatchResult} onClose={() => setShowDetailedATS(false)} />;
  }

  return (
    <div className="h-full flex flex-col bg-card overflow-hidden min-h-0">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <TabsList className="grid grid-cols-4 mx-2 mt-2 mb-1 h-8 shrink-0">
          <TabsTrigger value="score" className="text-[10px] sm:text-xs px-1 gap-0.5">
            <Eye className="w-3 h-3" /><span className="hidden sm:inline">Score</span>
          </TabsTrigger>
          <TabsTrigger value="tips" className="text-[10px] sm:text-xs px-1 gap-0.5">
            <Lightbulb className="w-3 h-3" /><span className="hidden sm:inline">Tips</span>
          </TabsTrigger>
          <TabsTrigger value="tailor" className="text-[10px] sm:text-xs px-1 gap-0.5">
            <Target className="w-3 h-3" /><span className="hidden sm:inline">Tailor</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="text-[10px] sm:text-xs px-1 gap-0.5">
            <MessageSquare className="w-3 h-3" /><span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="score" className="flex-1 overflow-y-auto mt-0 min-h-0">
          <ScoreTab qualityScore={atsState.qualityScore!} jobMatchResult={atsState.jobMatchResult} cvAnalysisResult={atsState.cvAnalysisResult} jobDescription={atsState.jobDescription} isAnalyzing={atsState.isAnalyzing} isAnalyzingCV={atsState.isAnalyzingCV} onViewDetailedAnalysis={() => setShowDetailedATS(true)} onRunCVAnalysis={handleRunCVAnalysis} scoreMode={scoreMode} onScoreModeChange={setScoreMode} cvAnalysisStale={atsState.cvAnalysisStale} jobMatchStale={atsState.jobMatchStale} />
        </TabsContent>
        <TabsContent value="tips" className="flex-1 overflow-y-auto mt-0 min-h-0">
          <TipsTab resumeData={resumeData} qualityScore={atsState.qualityScore!} jobMatchResult={atsState.jobMatchResult} onApplySuggestion={onUpdateResumeData ? handleApplySuggestion : undefined} />
        </TabsContent>
        <TabsContent value="tailor" className="flex-1 overflow-y-auto mt-0 min-h-0">
          <TailorTab jobDescription={atsState.jobDescription} onJobDescriptionChange={atsActions.setJobDescription} isAnalyzing={atsState.isAnalyzing} onAnalyze={handleAnalyze} jobMatchResult={atsState.jobMatchResult} onAutoApplyKeyword={onUpdateResumeData ? handleAutoApplyKeyword : undefined} />
        </TabsContent>
        <TabsContent value="chat" className="flex-1 overflow-y-auto mt-0 min-h-0">
          <ChatTab resumeData={resumeData} qualityScore={atsState.qualityScore!} jobMatchResult={atsState.jobMatchResult} jobDescription={atsState.jobDescription} selectedText={selectedText} onClearSelectedText={onClearSelectedText} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
