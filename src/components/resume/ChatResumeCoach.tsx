import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, 
  Target, 
  CheckCircle2, 
  AlertTriangle,
  Crown,
  MessageSquare,
  Eye,
  FileSearch,
  Lightbulb,
  Send,
  RefreshCw,
  Check,
  X,
  Bot,
  User,
  Clipboard
} from "lucide-react";
import { ResumeData } from "@/types/resume";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ChatResumeCoachProps {
  resumeData: ResumeData;
  currentSection?: string;
  selectedText?: string;
  onClearSelectedText?: () => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "feedback" | "suggestion" | "highlight-review";
}

interface ScoreData {
  total: number;
  content: { score: number; max: number };
  ats: { score: number; max: number };
  jobOpt: { score: number; max: number };
  writing: { score: number; max: number };
  ready: { score: number; max: number };
}

export const ChatResumeCoach = ({ 
  resumeData, 
  currentSection = "Personal",
  selectedText,
  onClearSelectedText 
}: ChatResumeCoachProps) => {
  // All features are now free
  const [activeTab, setActiveTab] = useState("score");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm your AI Resume Coach. I'll help you build an impressive, ATS-optimized resume. Ask me anything or select text from your preview to get specific feedback!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle highlighted text review
  useEffect(() => {
    if (selectedText && selectedText.trim().length > 0) {
      handleHighlightReview(selectedText);
    }
  }, [selectedText]);

  // Calculate comprehensive score
  const calculateScore = useCallback((): ScoreData => {
    let contentScore = 0;
    let atsScore = 0;
    let jobOptScore = 0;
    let writingScore = 0;
    let readyScore = 0;

    // Content Quality (40 max)
    if (resumeData.personalInfo.fullName) contentScore += 5;
    if (resumeData.profile && resumeData.profile.length > 50) contentScore += 10;
    if (resumeData.education.length > 0) contentScore += 5;
    if (resumeData.workExperience.length > 0) {
      contentScore += 10;
      const hasMetrics = resumeData.workExperience.some(w => 
        w.responsibilities.some(r => /\d+%|\d+\+|increased|decreased|improved|reduced/i.test(r))
      );
      if (hasMetrics) contentScore += 5;
    }
    if (resumeData.projects.length > 0) contentScore += 5;

    // ATS & Structure (20 max)
    atsScore = 13;
    if (resumeData.technicalSkills.length > 0) atsScore += 4;
    if (resumeData.education.length > 0) atsScore += 3;

    // Job Optimization (25 max)
    if (jobDescription) {
      const jdWords = jobDescription.toLowerCase().split(/\s+/);
      const resumeText = JSON.stringify(resumeData).toLowerCase();
      const matches = jdWords.filter(w => w.length > 4 && resumeText.includes(w));
      jobOptScore = Math.min(25, Math.round((matches.length / jdWords.length) * 50));
    }

    // Writing Quality (10 max)
    writingScore = 7;
    if (resumeData.profile && resumeData.profile.length > 100) writingScore += 3;

    // Application Ready (5 max)
    if (resumeData.personalInfo.email) readyScore += 2;
    if (resumeData.personalInfo.phone) readyScore += 1;
    if (resumeData.personalInfo.linkedin) readyScore += 1;
    if (resumeData.personalInfo.portfolio) readyScore += 1;

    return {
      total: Math.min(100, contentScore + atsScore + jobOptScore + writingScore + readyScore),
      content: { score: contentScore, max: 40 },
      ats: { score: atsScore, max: 20 },
      jobOpt: { score: jobOptScore, max: 25 },
      writing: { score: writingScore, max: 10 },
      ready: { score: readyScore, max: 5 }
    };
  }, [resumeData, jobDescription]);

  const scores = calculateScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 50) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 92) return "Hire Zone! 🎉";
    if (score >= 80) return "Looking Great";
    if (score >= 50) return "Needs Work";
    return "Getting Started";
  };

  // Real AI response using edge function
  const streamAIResponse = async (
    type: string, 
    message: string, 
    onDelta: (text: string) => void
  ): Promise<void> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cv-reviewer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            type,
            resumeData,
            message,
            selectedText,
            jobDescription,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit reached. Please try again in a moment.");
        }
        if (response.status === 402) {
          throw new Error("AI credits exhausted. Please add funds to continue.");
        }
        throw new Error("Failed to get AI response");
      }

      if (type === "chat") {
        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");
        
        const decoder = new TextDecoder();
        let textBuffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          textBuffer += decoder.decode(value, { stream: true });
          
          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;
            
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;
            
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) onDelta(content);
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }
      } else {
        // Handle regular JSON response
        const data = await response.json();
        if (data.text) {
          onDelta(data.text);
        } else if (data.overallFeedback) {
          // Structured review response
          let formattedResponse = `📊 **Full Resume Analysis** (Score: ${data.overallScore}/5)\n\n`;
          formattedResponse += `${data.overallFeedback}\n\n`;
          
          if (data.topPriorities?.length > 0) {
            formattedResponse += "🎯 **Top Priorities:**\n";
            data.topPriorities.forEach((p: string, i: number) => {
              formattedResponse += `${i + 1}. ${p}\n`;
            });
          }
          
          if (data.suggestedSummary) {
            formattedResponse += `\n✨ **Suggested Summary:**\n"${data.suggestedSummary}"`;
          }
          
          onDelta(formattedResponse);
        }
      }
    } catch (error) {
      console.error("AI response error:", error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    let assistantContent = "";

    try {
      await streamAIResponse("chat", inputValue, (chunk) => {
        assistantContent += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.id.startsWith("streaming-")) {
            return prev.map((m, i) => 
              i === prev.length - 1 ? { ...m, content: assistantContent } : m
            );
          }
          return [...prev, {
            id: "streaming-" + Date.now(),
            role: "assistant" as const,
            content: assistantContent,
            timestamp: new Date()
          }];
        });
      });
    } catch (error) {
      toast({
        title: "AI Error",
        description: error instanceof Error ? error.message : "Failed to get AI response",
        variant: "destructive",
      });
      // Add error message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleHighlightReview = async (text: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: `Review this text: "${text}"`,
      timestamp: new Date(),
      type: "highlight-review"
    };

    setMessages(prev => [...prev, userMessage]);
    setActiveTab("chat");
    setIsTyping(true);

    let assistantContent = "";

    try {
      await streamAIResponse("chat", `Please review this resume text and provide specific improvements: "${text}"`, (chunk) => {
        assistantContent += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.id.startsWith("streaming-")) {
            return prev.map((m, i) => 
              i === prev.length - 1 ? { ...m, content: assistantContent } : m
            );
          }
          return [...prev, {
            id: "streaming-" + Date.now(),
            role: "assistant" as const,
            content: assistantContent,
            timestamp: new Date(),
            type: "highlight-review" as const
          }];
        });
      });
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "I couldn't analyze that text. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
      onClearSelectedText?.();
    }
  };

  const handleFullReview = async () => {
    setIsAnalyzing(true);
    setActiveTab("chat");

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: "Please review my entire resume",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    let assistantContent = "";

    try {
      await streamAIResponse("full-review", "", (chunk) => {
        assistantContent += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.id.startsWith("streaming-")) {
            return prev.map((m, i) => 
              i === prev.length - 1 ? { ...m, content: assistantContent } : m
            );
          }
          return [...prev, {
            id: "streaming-" + Date.now(),
            role: "assistant" as const,
            content: assistantContent,
            timestamp: new Date(),
            type: "feedback" as const
          }];
        });
      });
    } catch (error) {
      toast({
        title: "Review Failed",
        description: error instanceof Error ? error.message : "Could not complete review",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
      setIsAnalyzing(false);
    }
  };

  const handleTailorAnalysis = async () => {
    if (!jobDescription) return;

    setIsAnalyzing(true);
    setActiveTab("chat");

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: "Analyze my resume against this job description and suggest improvements",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    let assistantContent = "";

    try {
      await streamAIResponse("tailor", "", (chunk) => {
        assistantContent += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.id.startsWith("streaming-")) {
            return prev.map((m, i) => 
              i === prev.length - 1 ? { ...m, content: assistantContent } : m
            );
          }
          return [...prev, {
            id: "streaming-" + Date.now(),
            role: "assistant" as const,
            content: assistantContent,
            timestamp: new Date()
          }];
        });
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Could not analyze job fit",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Resume Coach</h3>
            <p className="text-xs text-muted-foreground">Powered by AI</p>
          </div>
        </div>
        
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-4 m-2 h-9">
          <TabsTrigger value="score" className="text-xs px-2">
            <Eye className="w-3 h-3 mr-1" />
            Score
          </TabsTrigger>
          <TabsTrigger value="tips" className="text-xs px-2">
            <Lightbulb className="w-3 h-3 mr-1" />
            Tips
          </TabsTrigger>
          <TabsTrigger value="tailor" className="text-xs px-2">
            <Target className="w-3 h-3 mr-1" />
            Tailor
          </TabsTrigger>
          <TabsTrigger value="chat" className="text-xs px-2">
            <MessageSquare className="w-3 h-3 mr-1" />
            Chat
          </TabsTrigger>
        </TabsList>

        {/* Score Tab */}
        <TabsContent value="score" className="flex-1 overflow-auto p-4 mt-0">
          {/* Score Circle */}
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
                  strokeDashoffset={251.2 - (scores.total / 100) * 251.2}
                  className={getScoreColor(scores.total)}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              </svg>
              <div className="absolute text-center">
                <span className={`text-2xl font-bold ${getScoreColor(scores.total)}`}>
                  {scores.total}
                </span>
              </div>
            </div>
            <p className={`text-sm font-medium mt-2 ${getScoreColor(scores.total)}`}>
              {getScoreLabel(scores.total)}
            </p>
          </div>

          {/* Score Breakdown */}
          <div className="space-y-3">
            <ScoreBar label="Content" score={scores.content.score} max={scores.content.max} />
            <ScoreBar label="ATS" score={scores.ats.score} max={scores.ats.max} />
            <ScoreBar label="Job Match" score={scores.jobOpt.score} max={scores.jobOpt.max} />
            <ScoreBar label="Writing" score={scores.writing.score} max={scores.writing.max} />
            <ScoreBar label="Ready" score={scores.ready.score} max={scores.ready.max} />
          </div>

          <Button
            onClick={handleFullReview}
            className="w-full mt-4"
            variant="default"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileSearch className="w-4 h-4 mr-2" />
            )}
            Full AI Resume Review
          </Button>
        </TabsContent>

        {/* Tips Tab */}
        <TabsContent value="tips" className="flex-1 overflow-auto p-4 mt-0 space-y-3">
          <p className="text-xs text-muted-foreground">
            Tips for: <Badge variant="secondary">{currentSection}</Badge>
          </p>
          
          {currentSection === "Personal" && (
            <TipCard icon={<User className="w-4 h-4" />} title="Contact Info">
              Include full name, professional email, phone, and LinkedIn. Avoid nicknames.
            </TipCard>
          )}
          {currentSection === "Profile" && (
            <TipCard icon={<MessageSquare className="w-4 h-4" />} title="Summary">
              Write 2-3 sentences highlighting your experience level, specialization, and value.
            </TipCard>
          )}
          {currentSection === "Experience" && (
            <TipCard icon={<CheckCircle2 className="w-4 h-4" />} title="Achievements">
              Use action verbs and include metrics. "Increased revenue by 30%" beats "Helped with sales."
            </TipCard>
          )}
          
          <TipCard icon={<AlertTriangle className="w-4 h-4 text-amber-600" />} title="ATS Tip">
            Use standard section headers and avoid tables or graphics that confuse ATS systems.
          </TipCard>
          
          <TipCard icon={<Lightbulb className="w-4 h-4 text-primary" />} title="Quick Win">
            {!resumeData.personalInfo.linkedin 
              ? "Add your LinkedIn profile to increase credibility." 
              : scores.total < 60 
                ? "Complete all sections to boost your score." 
                : "Great progress! Consider tailoring to a specific job."}
          </TipCard>
        </TabsContent>

        {/* Tailor Tab */}
        <TabsContent value="tailor" className="flex-1 overflow-auto p-4 mt-0 space-y-4">
          <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Job Description
                  </label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={async () => {
                      const text = await navigator.clipboard.readText();
                      setJobDescription(text);
                    }}
                  >
                    <Clipboard className="w-3 h-3 mr-1" />
                    Paste
                  </Button>
                </div>
                <Textarea
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[100px] text-sm"
                />
              </div>

              {jobDescription && (
                <div className="space-y-3">
                  <p className="text-xs font-medium">Quick Analysis</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(() => {
                      const jdWords = jobDescription.toLowerCase().split(/\s+/).filter(w => w.length > 4);
                      const resumeText = JSON.stringify(resumeData).toLowerCase();
                      const unique = [...new Set(jdWords)].slice(0, 10);
                      return unique.map((word, i) => (
                        resumeText.includes(word) ? (
                          <Badge key={i} variant="secondary" className="text-xs bg-green-500/10 text-green-700 dark:text-green-400">
                            <Check className="w-3 h-3 mr-1" /> {word}
                          </Badge>
                        ) : (
                          <Badge key={i} variant="outline" className="text-xs text-amber-600 border-amber-500/30">
                            <X className="w-3 h-3 mr-1" /> {word}
                          </Badge>
                        )
                      ));
                    })()}
                  </div>
                </div>
              )}

              <Button 
                className="w-full" 
                disabled={!jobDescription || isAnalyzing}
                onClick={handleTailorAnalysis}
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Analyze with AI
              </Button>
            </>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden mt-0">
          <ScrollArea className="flex-1 p-4" ref={chatScrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2 items-center">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-3 h-3 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Ask for resume advice..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 text-sm"
              />
              <Button size="icon" onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Score Bar Component
const ScoreBar = ({ label, score, max, locked }: { label: string; score: number; max: number; locked?: boolean }) => {
  const percentage = (score / max) * 100;
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        {locked ? (
          <Crown className="w-3 h-3 text-amber-600" />
        ) : (
          <span className="font-medium">{score}/{max}</span>
        )}
      </div>
      <Progress value={locked ? 0 : percentage} className="h-1.5" />
    </div>
  );
};

// Tip Card Component
const TipCard = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <Card className="bg-muted/30">
    <CardContent className="p-3">
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{icon}</div>
        <div>
          <p className="text-xs font-medium">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{children}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);
