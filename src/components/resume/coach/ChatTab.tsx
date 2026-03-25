import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send,
  Loader2,
  Bot,
  User,
  FileSearch,
  RefreshCw
} from "lucide-react";
import { ResumeData } from "@/types/resume";
import { ATSAnalysisResult } from "@/types/ats";
import { ResumeQualityScore } from "@/hooks/useATSEngine";
import { toast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatTabProps {
  resumeData: ResumeData;
  qualityScore: ResumeQualityScore;
  jobMatchResult: ATSAnalysisResult | null;
  jobDescription: string;
  selectedText?: string;
  onClearSelectedText?: () => void;
}

export const ChatTab = ({
  resumeData,
  qualityScore,
  jobMatchResult,
  jobDescription,
  selectedText,
  onClearSelectedText
}: ChatTabProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm your AI Resume Coach. I can help you improve your resume with personalized suggestions. Ask me anything or use the Quick Actions below!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const streamAIResponse = async (
    type: string, 
    message: string, 
    onDelta: (text: string) => void
  ): Promise<void> => {
    try {
      // Build context with ATS data
      const atsContext = jobMatchResult ? {
        score: jobMatchResult.overallScore,
        missingKeywords: jobMatchResult.keywordAnalysis.missing.slice(0, 5).map(k => k.keyword),
        topPriorities: jobMatchResult.topPriorities,
        strengths: jobMatchResult.strengthHighlights
      } : null;

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
            atsContext, // Pass ATS analysis context
            qualityScore: qualityScore.total
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
        const data = await response.json();
        if (data.text) {
          onDelta(data.text);
        } else if (data.overallFeedback) {
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
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
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
            timestamp: new Date()
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
            timestamp: new Date()
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
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg px-3 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-border flex gap-2 overflow-x-auto">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs shrink-0"
          onClick={handleFullReview}
          disabled={isTyping}
        >
          <FileSearch className="w-3 h-3 mr-1" />
          Full Review
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs shrink-0"
          onClick={() => {
            setInputValue("How can I improve my professional summary?");
          }}
        >
          Improve Summary
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs shrink-0"
          onClick={() => {
            setInputValue("Suggest stronger action verbs for my experience bullets");
          }}
        >
          Better Verbs
        </Button>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask for resume advice..."
            className="min-h-[40px] max-h-[100px] text-sm resize-none"
            rows={1}
          />
          <Button 
            size="icon" 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
