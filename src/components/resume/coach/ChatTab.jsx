import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Send,
  Loader2,
  Bot,
  User,
  FileSearch,
  RefreshCw
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }

  .chat-container {
    height: 100%; display: flex; flex-direction: column;
    font-family: var(--font); color: var(--text); background: var(--surface);
  }

  .messages-area {
    flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 16px;
  }

  .message-row { display: flex; gap: 12px; }
  .message-row.user { justify-content: flex-end; }
  .message-row.assistant { justify-content: flex-start; }

  .avatar {
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .avatar-bot { background: rgba(79, 142, 247, 0.1); color: var(--accent); }
  .avatar-user { background: var(--surface2); color: var(--text); }

  .bubble {
    max-width: 85%; border-radius: var(--r-sm); padding: 8px 12px;
    font-size: 13.5px; line-height: 1.5; white-space: pre-wrap;
  }
  .bubble-bot { background: var(--surface2); color: var(--text); border-bottom-left-radius: 2px; }
  .bubble-user { background: var(--text); color: var(--bg); border-bottom-right-radius: 2px; }

  .quick-actions {
    display: flex; gap: 8px; overflow-x: auto; padding: 8px 16px;
    border-top: 1px solid var(--border); scrollbar-width: none;
  }
  .quick-actions::-webkit-scrollbar { display: none; }

  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 6px 12px; border-radius: var(--r-sm);
    font-size: 11.5px; font-weight: 500; cursor: pointer;
    transition: all 0.2s; border: none; font-family: var(--font); white-space: nowrap;
  }
  .btn-outline { border: 1px solid var(--border); background: var(--surface2); color: var(--text); }
  .btn-outline:hover { background: var(--border); }
  .btn-outline:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-icon { width: 36px; height: 36px; padding: 0; flex-shrink: 0; background: var(--text); color: var(--bg); }
  .btn-icon:hover { opacity: 0.9; }
  .btn-icon:disabled { opacity: 0.5; cursor: not-allowed; }

  .input-area {
    padding: 16px; border-top: 1px solid var(--border);
    display: flex; gap: 8px; align-items: flex-end;
  }

  .textarea {
    flex: 1; min-height: 40px; max-height: 100px; padding: 10px 12px;
    border-radius: var(--r-sm); background: rgba(31, 36, 53, 0.4);
    border: 1px solid var(--border); color: var(--text); font-family: var(--font);
    font-size: 13.5px; resize: none; outline: none; transition: border-color 0.2s;
  }
  .textarea:focus { border-color: var(--accent); }
\`;

export const ChatTab = ({
  resumeData,
  qualityScore,
  jobMatchResult,
  jobDescription,
  selectedText,
  onClearSelectedText
}) => {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm your AI Resume Coach. I can help you improve your resume with personalized suggestions. Ask me anything or use the Quick Actions below!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedText && selectedText.trim().length > 0) {
      handleHighlightReview(selectedText);
    }
  }, [selectedText]);

  const streamAIResponse = async (type, message, onDelta) => {
    try {
      // Mock AI Streaming Response
      const responseText = type === "full-review"
        ? "Here is a full review: Your resume looks great, but could use more quantifiable metrics in the experience section. Let's work on adding those!"
        : "Here is an AI response based on your query: I suggest adding an action verb like 'Spearheaded' to start your bullet points.";
      
      const words = responseText.split(' ');
      for (let i = 0; i < words.length; i++) {
        await new Promise(r => setTimeout(r, 50));
        onDelta(words[i] + (i < words.length - 1 ? ' ' : ''));
      }
    } catch (error) {
      console.error("AI response error:", error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
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
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
          }
          return [...prev, {
            id: "streaming-" + Date.now(),
            role: "assistant",
            content: assistantContent,
            timestamp: new Date()
          }];
        });
      });
    } catch (error) {
      toast({
        title: "AI Error",
        description: error.message || "Failed to get AI response",
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

  const handleHighlightReview = async (text) => {
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: \`Review this text: "\${text}"\`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    let assistantContent = "";

    try {
      await streamAIResponse("chat", \`Please review this resume text and provide specific improvements: "\${text}"\`, (chunk) => {
        assistantContent += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.id.startsWith("streaming-")) {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
          }
          return [...prev, {
            id: "streaming-" + Date.now(),
            role: "assistant",
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
      if (onClearSelectedText) onClearSelectedText();
    }
  };

  const handleFullReview = async () => {
    const userMessage = {
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
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
          }
          return [...prev, {
            id: "streaming-" + Date.now(),
            role: "assistant",
            content: assistantContent,
            timestamp: new Date()
          }];
        });
      });
    } catch (error) {
      toast({
        title: "Review Failed",
        description: error.message || "Could not complete review",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="chat-container">
        
        {/* Messages */}
        <div className="messages-area">
          {messages.map((msg) => (
            <div key={msg.id} className={\`message-row \${msg.role}\`}>
              {msg.role === "assistant" && (
                <div className="avatar avatar-bot">
                  <Bot size={16} />
                </div>
              )}
              <div className={\`bubble \${msg.role === "user" ? "bubble-user" : "bubble-bot"}\`}>
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="avatar avatar-user">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="message-row assistant">
              <div className="avatar avatar-bot">
                <Bot size={16} />
              </div>
              <div className="bubble bubble-bot" style={{ display: 'flex', alignItems: 'center' }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="btn btn-outline" onClick={handleFullReview} disabled={isTyping}>
            <FileSearch size={14} /> Full Review
          </button>
          <button className="btn btn-outline" onClick={() => setInputValue("How can I improve my professional summary?")}>
            Improve Summary
          </button>
          <button className="btn btn-outline" onClick={() => setInputValue("Suggest stronger action verbs for my experience bullets")}>
            Better Verbs
          </button>
        </div>

        {/* Input */}
        <div className="input-area">
          <textarea
            className="textarea"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask for resume advice..."
            rows={1}
          />
          <button className="btn btn-icon" onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}>
            <Send size={16} />
          </button>
        </div>

      </div>
    </>
  );
};
