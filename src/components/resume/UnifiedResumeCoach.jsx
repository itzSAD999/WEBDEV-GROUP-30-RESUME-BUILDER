import { useState, useCallback, useEffect, useRef } from "react";
import { Eye, Lightbulb, Target, MessageSquare } from "lucide-react";
import { useATSEngine } from "@/hooks/useATSEngine";
import { ScoreTab } from "./coach/ScoreTab";
import { TipsTab } from "./coach/TipsTab";
import { TailorTab } from "./coach/TailorTab";
import { ChatTab } from "./coach/ChatTab";
import { DetailedATSView } from "./coach/DetailedATSView";
import { toast } from "@/hooks/use-toast";

const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }
  
  .coach-container {
    height: 100%; display: flex; flex-direction: column;
    background: var(--surface); overflow: hidden; font-family: var(--font);
    color: var(--text);
  }

  .tabs-list {
    display: grid; grid-template-columns: repeat(4, 1fr);
    margin: 8px 8px 4px; border-radius: var(--r-sm);
    background: var(--surface2); flex-shrink: 0; padding: 4px;
    height: 36px;
  }

  .tab-trigger {
    background: transparent; border: none; display: flex; align-items: center;
    justify-content: center; gap: 4px; font-size: 12px; font-weight: 500;
    color: var(--text-muted); cursor: pointer; border-radius: 4px; transition: all 0.2s;
  }
  
  .tab-trigger.active {
    background: var(--surface); color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }

  .tab-content {
    flex: 1; overflow-y: auto; overflow-x: hidden; min-height: 0; padding: 0;
  }
  
  @media (max-width: 640px) {
    .tab-text { display: none; }
    .tab-trigger { font-size: 10px; }
  }
\`;

export const UnifiedResumeCoach = ({
  resumeData,
  selectedText,
  onClearSelectedText,
  onUpdateResumeData,
  coachSyncRequest,
}) => {
  const [activeTab, setActiveTab] = useState("score");
  const [scoreMode, setScoreMode] = useState("quality");
  const [showDetailedATS, setShowDetailedATS] = useState(false);
  const [atsState, atsActions] = useATSEngine(resumeData);
  const lastHandledSyncNonceRef = useRef(0);

  const switchToScoreMode = useCallback((mode) => {
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

  // App-level sync request
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

  const handleAutoApplyKeyword = useCallback((keyword) => {
    if (!onUpdateResumeData) return;
    const currentSkills = resumeData.technicalSkills || [];
    if (currentSkills.some((s) => s.toLowerCase() === keyword.toLowerCase())) {
      toast({ title: "Already Exists", description: \`"\${keyword}" is already in your skills.\`, variant: "destructive" });
      return;
    }
    onUpdateResumeData({ technicalSkills: [...currentSkills, keyword] });
  }, [resumeData.technicalSkills, onUpdateResumeData]);

  const handleApplySuggestion = useCallback((field, value) => {
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
    <>
      <style>{styles}</style>
      <div className="coach-container">
        <div className="tabs-list">
          <button className={\`tab-trigger \${activeTab === 'score' ? 'active' : ''}\`} onClick={() => setActiveTab('score')}>
            <Eye size={14} /><span className="tab-text">Score</span>
          </button>
          <button className={\`tab-trigger \${activeTab === 'tips' ? 'active' : ''}\`} onClick={() => setActiveTab('tips')}>
            <Lightbulb size={14} /><span className="tab-text">Tips</span>
          </button>
          <button className={\`tab-trigger \${activeTab === 'tailor' ? 'active' : ''}\`} onClick={() => setActiveTab('tailor')}>
            <Target size={14} /><span className="tab-text">Tailor</span>
          </button>
          <button className={\`tab-trigger \${activeTab === 'chat' ? 'active' : ''}\`} onClick={() => setActiveTab('chat')}>
            <MessageSquare size={14} /><span className="tab-text">Chat</span>
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'score' && (
            <ScoreTab 
              qualityScore={atsState.qualityScore} 
              jobMatchResult={atsState.jobMatchResult} 
              cvAnalysisResult={atsState.cvAnalysisResult} 
              jobDescription={atsState.jobDescription} 
              isAnalyzing={atsState.isAnalyzing} 
              isAnalyzingCV={atsState.isAnalyzingCV} 
              onViewDetailedAnalysis={() => setShowDetailedATS(true)} 
              onRunCVAnalysis={handleRunCVAnalysis} 
              scoreMode={scoreMode} 
              onScoreModeChange={setScoreMode} 
              cvAnalysisStale={atsState.cvAnalysisStale} 
              jobMatchStale={atsState.jobMatchStale} 
            />
          )}
          {activeTab === 'tips' && (
            <TipsTab 
              resumeData={resumeData} 
              qualityScore={atsState.qualityScore} 
              jobMatchResult={atsState.jobMatchResult} 
              onApplySuggestion={onUpdateResumeData ? handleApplySuggestion : undefined} 
            />
          )}
          {activeTab === 'tailor' && (
            <TailorTab 
              jobDescription={atsState.jobDescription} 
              onJobDescriptionChange={atsActions.setJobDescription} 
              isAnalyzing={atsState.isAnalyzing} 
              onAnalyze={handleAnalyze} 
              jobMatchResult={atsState.jobMatchResult} 
              onAutoApplyKeyword={onUpdateResumeData ? handleAutoApplyKeyword : undefined} 
            />
          )}
          {activeTab === 'chat' && (
            <ChatTab 
              resumeData={resumeData} 
              qualityScore={atsState.qualityScore} 
              jobMatchResult={atsState.jobMatchResult} 
              jobDescription={atsState.jobDescription} 
              selectedText={selectedText} 
              onClearSelectedText={onClearSelectedText} 
            />
          )}
        </div>
      </div>
    </>
  );
};
