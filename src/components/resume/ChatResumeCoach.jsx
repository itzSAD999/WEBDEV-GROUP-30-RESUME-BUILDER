import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Sparkles, Target, CheckCircle2, AlertTriangle, Crown, MessageSquare,
  Eye, FileSearch, Lightbulb, Send, RefreshCw, Check, X, Bot, User, Clipboard
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599; --primary: #4f8ef7;
    --success: #22c55e; --warning: #f59e0b; --danger: #ef4444;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }

  .coach-container {
    height: 100%; display: flex; flex-direction: column; background: var(--surface);
    border-radius: var(--r); border: 1px solid var(--border); overflow: hidden;
    font-family: var(--font); color: var(--text);
  }

  .coach-header {
    padding: 12px 16px; border-bottom: 1px solid var(--border);
    display: flex; items-center: center; justify-content: space-between;
    background: rgba(31, 36, 53, 0.3);
  }
  
  .coach-header-left { display: flex; align-items: center; gap: 8px; }
  .bot-avatar {
    width: 32px; height: 32px; border-radius: 16px; background: rgba(79, 142, 247, 0.1);
    display: flex; align-items: center; justify-content: center; color: var(--primary);
  }
  .coach-title { font-size: 13.5px; font-weight: 600; margin-bottom: 2px; }
  .coach-subtitle { font-size: 11.5px; color: var(--text-muted); }

  .tabs-list {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px;
    margin: 8px; background: rgba(31, 36, 53, 0.5); padding: 4px; border-radius: var(--r-sm);
  }
  .tab-trigger {
    display: flex; align-items: center; justify-content: center; gap: 4px;
    padding: 6px; border-radius: 4px; font-size: 11.5px; font-weight: 500;
    cursor: pointer; transition: all 0.2s; border: none; background: transparent; color: var(--text-muted);
  }
  .tab-trigger[data-state="active"] { background: var(--surface); color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
  .tab-trigger:hover:not([data-state="active"]) { color: var(--text); }

  .tab-content { flex: 1; overflow-y: auto; padding: 16px; display: none; flex-direction: column; gap: 16px; }
  .tab-content[data-state="active"] { display: flex; }

  /* Score Tab */
  .score-circle-container { text-align: center; padding: 16px 0; }
  .score-circle-wrapper { position: relative; display: inline-flex; align-items: center; justify-content: center; }
  .score-text-absolute { position: absolute; font-size: 24px; font-weight: 700; }
  .score-label { font-size: 13.5px; font-weight: 500; margin-top: 8px; }

  .score-bars { display: flex; flex-direction: column; gap: 12px; }
  .score-bar-row { display: flex; flex-direction: column; gap: 4px; }
  .score-bar-header { display: flex; align-items: center; justify-content: space-between; font-size: 11.5px; }
  .score-bar-label { color: var(--text-muted); }
  .score-bar-value { font-weight: 500; }
  .progress-bg { width: 100%; height: 6px; background: var(--surface2); border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; background: var(--primary); transition: width 0.3s; }

  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 8px 16px; border-radius: var(--r-sm); width: 100%;
    font-size: 13.5px; font-weight: 500; cursor: pointer;
    transition: all 0.2s; border: none; font-family: var(--font);
  }
  .btn-primary { background: var(--text); color: var(--bg); }
  .btn-primary:hover { opacity: 0.9; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-outline { border: 1px solid var(--border); background: transparent; color: var(--text); }
  .btn-outline:hover { background: var(--surface2); }
  .btn-ghost { background: transparent; color: var(--text); padding: 4px 8px; width: auto; font-size: 11.5px; }
  .btn-ghost:hover { background: var(--surface2); border-radius: var(--r-sm); }
  .btn-icon { width: 36px; height: 36px; padding: 0; background: var(--text); color: var(--bg); display: flex; align-items: center; justify-content: center; border-radius: var(--r-sm); border: none; cursor: pointer; transition: opacity 0.2s; }
  .btn-icon:hover { opacity: 0.9; }
  .btn-icon:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Tips Tab */
  .tip-card { background: rgba(31, 36, 53, 0.3); border: 1px solid var(--border); border-radius: var(--r-sm); padding: 12px; display: flex; gap: 8px; align-items: flex-start; }
  .tip-card-icon { margin-top: 2px; }
  .tip-card-title { font-size: 11.5px; font-weight: 500; }
  .tip-card-text { font-size: 11.5px; color: var(--text-muted); margin-top: 2px; line-height: 1.4; }
  
  .badge { display: inline-flex; align-items: center; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; white-space: nowrap; }
  .badge-secondary { background: var(--surface2); color: var(--text); }
  .badge-success { background: rgba(34, 197, 94, 0.1); color: #4ade80; }
  .badge-warning { background: rgba(245, 158, 11, 0.1); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }

  /* Tailor Tab */
  .form-group { display: flex; flex-direction: column; gap: 8px; }
  .form-header { display: flex; align-items: center; justify-content: space-between; }
  .form-label { font-size: 13.5px; font-weight: 500; display: flex; align-items: center; gap: 8px; }
  .textarea {
    width: 100%; min-height: 100px; padding: 12px; border-radius: var(--r-sm);
    border: 1px solid var(--border); background: var(--surface); color: var(--text);
    font-family: var(--font); font-size: 13.5px; resize: vertical; line-height: 1.5; outline: none; transition: border-color 0.2s;
  }
  .textarea:focus { border-color: var(--primary); }
  
  .quick-analysis { display: flex; flex-direction: column; gap: 8px; }
  .quick-analysis-title { font-size: 11.5px; font-weight: 500; }
  .quick-analysis-tags { display: flex; flex-wrap: wrap; gap: 6px; }

  /* Chat Tab */
  .chat-area { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 16px; }
  .message-row { display: flex; gap: 8px; width: 100%; }
  .message-row.user { justify-content: flex-end; }
  .message-row.assistant { justify-content: flex-start; }
  
  .message-avatar { width: 24px; height: 24px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .message-avatar.assistant { background: rgba(79, 142, 247, 0.1); color: var(--primary); }
  .message-avatar.user { background: var(--primary); color: #fff; }
  
  .message-bubble {
    max-width: 85%; padding: 8px 12px; border-radius: var(--r-sm); font-size: 13.5px; line-height: 1.5; white-space: pre-wrap;
  }
  .message-bubble.assistant { background: var(--surface2); color: var(--text); }
  .message-bubble.user { background: var(--primary); color: #fff; }

  .typing-indicator { display: flex; gap: 4px; padding: 4px 0; }
  .typing-dot { width: 8px; height: 8px; background: var(--text-muted); border-radius: 50%; opacity: 0.5; animation: bounce 1.4s infinite ease-in-out both; }
  .typing-dot:nth-child(1) { animation-delay: -0.32s; }
  .typing-dot:nth-child(2) { animation-delay: -0.16s; }
  @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

  .chat-input-area { padding: 12px; border-top: 1px solid var(--border); display: flex; gap: 8px; }
  .input {
    flex: 1; padding: 8px 12px; border-radius: var(--r-sm); border: 1px solid var(--border);
    background: var(--surface); color: var(--text); font-family: var(--font); font-size: 13.5px;
    outline: none; transition: border-color 0.2s;
  }
  .input:focus { border-color: var(--primary); }
\`;

export const ChatResumeCoach = ({ 
  resumeData, 
  currentSection = "Personal",
  selectedText,
  onClearSelectedText 
}) => {
  const [activeTab, setActiveTab] = useState("score");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm your AI Resume Coach. I'll help you build an impressive, ATS-optimized resume. Ask me anything or select text from your preview to get specific feedback!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (selectedText && selectedText.trim().length > 0) {
      handleHighlightReview(selectedText);
    }
  }, [selectedText]);

  const calculateScore = useCallback(() => {
    let contentScore = 0; let atsScore = 0; let jobOptScore = 0; let writingScore = 0; let readyScore = 0;

    if (resumeData.personalInfo?.fullName) contentScore += 5;
    if (resumeData.profile && resumeData.profile.length > 50) contentScore += 10;
    if (resumeData.education?.length > 0) contentScore += 5;
    if (resumeData.workExperience?.length > 0) {
      contentScore += 10;
      const hasMetrics = resumeData.workExperience.some(w => 
        (w.responsibilities || []).some(r => /d+%|d++|increased|decreased|improved|reduced/i.test(r))
      );
      if (hasMetrics) contentScore += 5;
    }
    if (resumeData.projects?.length > 0) contentScore += 5;

    atsScore = 13;
    if (resumeData.technicalSkills?.length > 0) atsScore += 4;
    if (resumeData.education?.length > 0) atsScore += 3;

    if (jobDescription) {
      const jdWords = jobDescription.toLowerCase().split(/s+/);
      const resumeText = JSON.stringify(resumeData).toLowerCase();
      const matches = jdWords.filter(w => w.length > 4 && resumeText.includes(w));
      jobOptScore = Math.min(25, Math.round((matches.length / (jdWords.length || 1)) * 50));
    }

    writingScore = 7;
    if (resumeData.profile && resumeData.profile.length > 100) writingScore += 3;

    if (resumeData.personalInfo?.email) readyScore += 2;
    if (resumeData.personalInfo?.phone) readyScore += 1;
    if (resumeData.personalInfo?.linkedin) readyScore += 1;
    if (resumeData.personalInfo?.portfolio) readyScore += 1;

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

  const getScoreColor = (score) => {
    if (score >= 80) return "var(--success)";
    if (score >= 50) return "var(--warning)";
    return "var(--danger)";
  };

  const getScoreLabel = (score) => {
    if (score >= 92) return "Hire Zone! 🎉";
    if (score >= 80) return "Looking Great";
    if (score >= 50) return "Needs Work";
    return "Getting Started";
  };

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
    const userMessage = { id: Date.now().toString(), role: "user", content: inputValue, timestamp: new Date() };
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
          return [...prev, { id: "streaming-" + Date.now(), role: "assistant", content: assistantContent, timestamp: new Date() }];
        });
      });
    } catch (error) {
      toast({ title: "AI Error", description: error.message || "Failed to get AI response", variant: "destructive", });
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: "I'm sorry, I encountered an error. Please try again.", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleHighlightReview = async (text) => {
    const userMessage = { id: Date.now().toString(), role: "user", content: \`Review this text: "\${text}"\`, timestamp: new Date(), type: "highlight-review" };
    setMessages(prev => [...prev, userMessage]);
    setActiveTab("chat");
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
          return [...prev, { id: "streaming-" + Date.now(), role: "assistant", content: assistantContent, timestamp: new Date(), type: "highlight-review" }];
        });
      });
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: "I couldn't analyze that text. Please try again.", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
      if (onClearSelectedText) onClearSelectedText();
    }
  };

  const handleFullReview = async () => {
    setIsAnalyzing(true); setActiveTab("chat");
    const userMessage = { id: Date.now().toString(), role: "user", content: "Please review my entire resume", timestamp: new Date() };
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
          return [...prev, { id: "streaming-" + Date.now(), role: "assistant", content: assistantContent, timestamp: new Date(), type: "feedback" }];
        });
      });
    } catch (error) {
      toast({ title: "Review Failed", description: error.message || "Could not complete review", variant: "destructive" });
    } finally {
      setIsTyping(false); setIsAnalyzing(false);
    }
  };

  const handleTailorAnalysis = async () => {
    if (!jobDescription) return;
    setIsAnalyzing(true); setActiveTab("chat");
    const userMessage = { id: Date.now().toString(), role: "user", content: "Analyze my resume against this job description and suggest improvements", timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    let assistantContent = "";
    try {
      await streamAIResponse("tailor", "", (chunk) => {
        assistantContent += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.id.startsWith("streaming-")) {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
          }
          return [...prev, { id: "streaming-" + Date.now(), role: "assistant", content: assistantContent, timestamp: new Date() }];
        });
      });
    } catch (error) {
      toast({ title: "Analysis Failed", description: error.message || "Could not analyze job fit", variant: "destructive" });
    } finally {
      setIsTyping(false); setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="coach-container">
        <div className="coach-header">
          <div className="coach-header-left">
            <div className="bot-avatar"><Bot className="w-4 h-4" /></div>
            <div>
              <div className="coach-title">AI Resume Coach</div>
              <div className="coach-subtitle">Powered by AI</div>
            </div>
          </div>
        </div>

        <div className="tabs-list">
          {[
            { id: "score", icon: Eye, label: "Score" },
            { id: "tips", icon: Lightbulb, label: "Tips" },
            { id: "tailor", icon: Target, label: "Tailor" },
            { id: "chat", icon: MessageSquare, label: "Chat" }
          ].map(tab => (
            <button key={tab.id} className="tab-trigger" data-state={activeTab === tab.id ? "active" : "inactive"} onClick={() => setActiveTab(tab.id)}>
              <tab.icon size={12} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Score Tab */}
        <div className="tab-content" data-state={activeTab === "score" ? "active" : "inactive"}>
          <div className="score-circle-container">
            <div className="score-circle-wrapper">
              <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="48" cy="48" r="40" stroke="rgba(107, 117, 153, 0.3)" strokeWidth="8" fill="transparent" />
                <circle cx="48" cy="48" r="40" stroke={getScoreColor(scores.total)} strokeWidth="8" fill="transparent" 
                  strokeDasharray="251.2" strokeDashoffset={251.2 - (scores.total / 100) * 251.2} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s ease" }} />
              </svg>
              <span className="score-text-absolute" style={{ color: getScoreColor(scores.total) }}>{scores.total}</span>
            </div>
            <div className="score-label" style={{ color: getScoreColor(scores.total) }}>{getScoreLabel(scores.total)}</div>
          </div>

          <div className="score-bars">
            {[
              { label: "Content", score: scores.content.score, max: scores.content.max },
              { label: "ATS", score: scores.ats.score, max: scores.ats.max },
              { label: "Job Match", score: scores.jobOpt.score, max: scores.jobOpt.max },
              { label: "Writing", score: scores.writing.score, max: scores.writing.max },
              { label: "Ready", score: scores.ready.score, max: scores.ready.max },
            ].map(b => (
              <div key={b.label} className="score-bar-row">
                <div className="score-bar-header">
                  <span className="score-bar-label">{b.label}</span>
                  <span className="score-bar-value">{b.score}/{b.max}</span>
                </div>
                <div className="progress-bg">
                  <div className="progress-fill" style={{ width: \`\${(b.score / b.max) * 100}%\` }} />
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-primary" onClick={handleFullReview} disabled={isAnalyzing} style={{ marginTop: 'auto' }}>
            {isAnalyzing ? <RefreshCw size={16} className="lucide-refresh-cw" style={{ animation: 'spin 1s linear infinite' }} /> : <FileSearch size={16} />} 
            Full AI Resume Review
          </button>
        </div>

        {/* Tips Tab */}
        <div className="tab-content" data-state={activeTab === "tips" ? "active" : "inactive"}>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            Tips for: <span className="badge badge-secondary">{currentSection}</span>
          </div>
          
          {currentSection === "Personal" && (
            <div className="tip-card">
              <User size={16} className="tip-card-icon" />
              <div>
                <div className="tip-card-title">Contact Info</div>
                <div className="tip-card-text">Include full name, professional email, phone, and LinkedIn. Avoid nicknames.</div>
              </div>
            </div>
          )}
          {currentSection === "Profile" && (
            <div className="tip-card">
              <MessageSquare size={16} className="tip-card-icon" />
              <div>
                <div className="tip-card-title">Summary</div>
                <div className="tip-card-text">Write 2-3 sentences highlighting your experience level, specialization, and value.</div>
              </div>
            </div>
          )}
          {currentSection === "Experience" && (
            <div className="tip-card">
              <CheckCircle2 size={16} className="tip-card-icon" />
              <div>
                <div className="tip-card-title">Achievements</div>
                <div className="tip-card-text">Use action verbs and include metrics. "Increased revenue by 30%" beats "Helped with sales."</div>
              </div>
            </div>
          )}
          
          <div className="tip-card">
            <AlertTriangle size={16} style={{ color: 'var(--warning)' }} className="tip-card-icon" />
            <div>
              <div className="tip-card-title">ATS Tip</div>
              <div className="tip-card-text">Use standard section headers and avoid tables or graphics that confuse ATS systems.</div>
            </div>
          </div>
          
          <div className="tip-card">
            <Lightbulb size={16} style={{ color: 'var(--primary)' }} className="tip-card-icon" />
            <div>
              <div className="tip-card-title">Quick Win</div>
              <div className="tip-card-text">
                {!resumeData.personalInfo?.linkedin ? "Add your LinkedIn profile to increase credibility." : scores.total < 60 ? "Complete all sections to boost your score." : "Great progress! Consider tailoring to a specific job."}
              </div>
            </div>
          </div>
        </div>

        {/* Tailor Tab */}
        <div className="tab-content" data-state={activeTab === "tailor" ? "active" : "inactive"}>
          <div className="form-group">
            <div className="form-header">
              <label className="form-label"><Target size={16} /> Job Description</label>
              <button className="btn-ghost" onClick={async () => {
                const text = await navigator.clipboard.readText();
                setJobDescription(text);
              }}>
                <Clipboard size={12} style={{ marginRight: '4px' }} /> Paste
              </button>
            </div>
            <textarea className="textarea" placeholder="Paste the job description here..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
          </div>

          {jobDescription && (
            <div className="quick-analysis">
              <div className="quick-analysis-title">Quick Analysis</div>
              <div className="quick-analysis-tags">
                {(() => {
                  const jdWords = jobDescription.toLowerCase().split(/s+/).filter(w => w.length > 4);
                  const resumeText = JSON.stringify(resumeData).toLowerCase();
                  const unique = [...new Set(jdWords)].slice(0, 10);
                  return unique.map((word, i) => (
                    resumeText.includes(word) ? (
                      <span key={i} className="badge badge-success"><Check size={10} style={{ marginRight: '4px' }}/> {word}</span>
                    ) : (
                      <span key={i} className="badge badge-warning"><X size={10} style={{ marginRight: '4px' }}/> {word}</span>
                    )
                  ));
                })()}
              </div>
            </div>
          )}

          <button className="btn btn-primary" disabled={!jobDescription || isAnalyzing} onClick={handleTailorAnalysis} style={{ marginTop: 'auto' }}>
            {isAnalyzing ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={16} />}
            Analyze with AI
          </button>
        </div>

        {/* Chat Tab */}
        <div className="tab-content" data-state={activeTab === "chat" ? "active" : "inactive"} style={{ padding: '0', display: activeTab === 'chat' ? 'flex' : 'none' }}>
          <div className="chat-area">
            {messages.map((message) => (
              <div key={message.id} className={\`message-row \${message.role}\`}>
                {message.role === "assistant" && <div className="message-avatar assistant"><Bot size={14} /></div>}
                <div className={\`message-bubble \${message.role}\`}>{message.content}</div>
                {message.role === "user" && <div className="message-avatar user"><User size={14} /></div>}
              </div>
            ))}
            {isTyping && (
              <div className="message-row assistant">
                <div className="message-avatar assistant"><Bot size={14} /></div>
                <div className="message-bubble assistant">
                  <div className="typing-indicator">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chat-input-area">
            <input className="input" placeholder="Ask for resume advice..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={handleKeyPress} />
            <button className="btn-icon" onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}>
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
