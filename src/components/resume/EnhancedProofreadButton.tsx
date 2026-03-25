import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Loader2, 
  Lightbulb,
  Zap,
  PenLine,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface ProofreadIssue {
  type: "error" | "warning" | "suggestion" | "improvement";
  category: string;
  original: string;
  suggestion: string;
  reason: string;
  position?: { start: number; end: number };
}

interface EnhancedProofreadButtonProps {
  text: string;
  onApply: (corrected: string) => void;
  label?: string;
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default";
  fieldName?: string;
}

// Comprehensive proofreading rules engine
function analyzeText(text: string, fieldName?: string): ProofreadIssue[] {
  const issues: ProofreadIssue[] = [];
  
  if (!text || text.length < 5) return issues;
  
  // 1. Weak verbs check
  const weakVerbs: [string, string][] = [
    ["helped", "facilitated, enabled, supported"],
    ["helped with", "contributed to, led, managed"],
    ["worked on", "developed, implemented, engineered"],
    ["was responsible for", "managed, led, oversaw, directed"],
    ["assisted with", "supported, collaborated on, contributed to"],
    ["participated in", "contributed to, engaged in, drove"],
    ["was involved in", "led, coordinated, spearheaded"],
    ["did", "completed, executed, delivered"],
    ["made", "created, developed, produced"],
    ["got", "achieved, obtained, secured"]
  ];
  
  weakVerbs.forEach(([weak, strong]) => {
    if (text.toLowerCase().includes(weak)) {
      issues.push({
        type: "suggestion",
        category: "Action Verbs",
        original: weak,
        suggestion: strong,
        reason: "Use stronger action verbs to make your achievements more impactful"
      });
    }
  });
  
  // 2. Missing quantification check
  const hasNumbers = /\d+/.test(text);
  const isDescriptive = text.length > 40;
  const suggestMetrics = [
    "increased", "decreased", "improved", "reduced", "managed", 
    "led", "delivered", "completed", "achieved", "generated"
  ];
  
  if (!hasNumbers && isDescriptive) {
    const hasActionWord = suggestMetrics.some(word => text.toLowerCase().includes(word));
    if (hasActionWord) {
      issues.push({
        type: "improvement",
        category: "Impact Metrics",
        original: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
        suggestion: "Add specific numbers (e.g., '25%', 'team of 5', '$10K')",
        reason: "Quantified achievements are 40% more likely to catch a recruiter's attention"
      });
    }
  }
  
  // 3. Passive voice detection
  const passivePatterns: [RegExp, string][] = [
    [/was\s+(\w+ed|built|created|developed|managed)/gi, "I $1"],
    [/were\s+(\w+ed|built|created|developed)/gi, "$1"],
    [/is\s+being\s+(\w+ed)/gi, "$1"],
    [/has\s+been\s+(\w+ed)/gi, "$1"],
    [/had\s+been\s+(\w+ed)/gi, "$1"]
  ];
  
  passivePatterns.forEach(([pattern, replacement]) => {
    const match = text.match(pattern);
    if (match) {
      issues.push({
        type: "warning",
        category: "Voice",
        original: match[0],
        suggestion: `Use active voice: "${replacement.replace('$1', match[1] || 'action')}"`,
        reason: "Active voice is more direct and impactful on resumes"
      });
    }
  });
  
  // 4. Common grammar and style issues
  const grammarRules: [RegExp, string, string, string][] = [
    [/\bi\b/g, "I", "Capitalization", "Always capitalize 'I'"],
    [/\s{2,}/g, " ", "Spacing", "Remove extra spaces"],
    [/,,+/g, ",", "Punctuation", "Remove duplicate commas"],
    [/\.{2,}/g, ".", "Punctuation", "Remove extra periods"],
    [/\s+\./g, ".", "Spacing", "Remove space before period"],
    [/\s+,/g, ",", "Spacing", "Remove space before comma"],
    [/\bteh\b/gi, "the", "Spelling", "Common typo: 'teh' → 'the'"],
    [/\brecieve\b/gi, "receive", "Spelling", "Correct spelling: 'receive'"],
    [/\bseperate\b/gi, "separate", "Spelling", "Correct spelling: 'separate'"],
    [/\baccomplised\b/gi, "accomplished", "Spelling", "Correct spelling: 'accomplished'"],
    [/\bacheived\b/gi, "achieved", "Spelling", "Correct spelling: 'achieved'"],
    [/\bexperiance\b/gi, "experience", "Spelling", "Correct spelling: 'experience'"]
  ];
  
  grammarRules.forEach(([pattern, replacement, category, reason]) => {
    if (pattern.test(text)) {
      const match = text.match(pattern);
      if (match) {
        issues.push({
          type: "error",
          category,
          original: match[0],
          suggestion: replacement,
          reason
        });
      }
    }
  });
  
  // 5. Buzzword and cliché detection
  const cliches = [
    "team player", "hard worker", "detail-oriented", "self-motivated",
    "results-driven", "think outside the box", "go-getter", "synergy",
    "leverage", "circle back", "move the needle"
  ];
  
  cliches.forEach(cliche => {
    if (text.toLowerCase().includes(cliche)) {
      issues.push({
        type: "suggestion",
        category: "Clarity",
        original: cliche,
        suggestion: "Replace with specific examples of how you demonstrate this quality",
        reason: "Clichés are overused and don't differentiate you from other candidates"
      });
    }
  });
  
  // 6. Sentence length check
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  sentences.forEach(sentence => {
    const wordCount = sentence.trim().split(/\s+/).length;
    if (wordCount > 30) {
      issues.push({
        type: "warning",
        category: "Readability",
        original: sentence.substring(0, 40) + "...",
        suggestion: "Break this into 2-3 shorter sentences",
        reason: "Long sentences can be hard to scan quickly"
      });
    }
  });
  
  // 7. First-person pronoun check (for bullet points)
  if (fieldName === "responsibility" || fieldName === "bullet") {
    if (/^I\s/i.test(text.trim())) {
      issues.push({
        type: "suggestion",
        category: "Style",
        original: "I " + text.split(" ").slice(1, 3).join(" ") + "...",
        suggestion: "Start with action verb directly (e.g., 'Led' instead of 'I led')",
        reason: "Resume bullet points should start with action verbs, not 'I'"
      });
    }
  }
  
  // 8. Missing period at end
  if (text.length > 20 && !/[.!?]$/.test(text.trim())) {
    issues.push({
      type: "suggestion",
      category: "Punctuation",
      original: "..." + text.slice(-20),
      suggestion: "Add period at the end",
      reason: "Consistent punctuation looks more professional"
    });
  }
  
  return issues;
}

// Apply automatic corrections
function applyCorrections(text: string, issues: ProofreadIssue[]): string {
  let corrected = text;
  
  // Only apply error-type corrections automatically
  const autoFixable = issues.filter(i => i.type === "error");
  
  autoFixable.forEach(issue => {
    if (issue.original && issue.suggestion) {
      // Handle regex-based replacements
      if (issue.category === "Capitalization" && issue.original === "i") {
        corrected = corrected.replace(/\bi\b/g, "I");
      } else if (issue.category === "Spacing") {
        corrected = corrected.replace(/\s{2,}/g, " ");
        corrected = corrected.replace(/\s+\./g, ".");
        corrected = corrected.replace(/\s+,/g, ",");
      } else if (issue.category === "Punctuation") {
        corrected = corrected.replace(/,,+/g, ",");
        corrected = corrected.replace(/\.{2,}/g, ".");
      } else if (issue.category === "Spelling") {
        corrected = corrected.replace(new RegExp(issue.original, "gi"), issue.suggestion);
      }
    }
  });
  
  return corrected;
}

export const EnhancedProofreadButton = ({ 
  text, 
  onApply, 
  label = "Proofread", 
  variant = "ghost",
  size = "sm",
  fieldName
}: EnhancedProofreadButtonProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState<ProofreadIssue[]>([]);
  const { toast } = useToast();

  const handleProofread = async () => {
    setLoading(true);
    setOpen(true);
    
    // Simulate processing delay for better UX
    await new Promise(r => setTimeout(r, 600));
    
    const foundIssues = analyzeText(text, fieldName);
    setIssues(foundIssues);
    setLoading(false);
  };

  const handleApplyAll = () => {
    const corrected = applyCorrections(text, issues);
    onApply(corrected);
    setOpen(false);
    
    const errorCount = issues.filter(i => i.type === "error").length;
    toast({
      title: "Corrections Applied",
      description: `Fixed ${errorCount} issue${errorCount !== 1 ? 's' : ''} in your text.`
    });
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case "suggestion":
        return <Lightbulb className="w-4 h-4 text-primary" />;
      case "improvement":
        return <Zap className="w-4 h-4 text-green-500" />;
      default:
        return <PenLine className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getIssueBadge = (type: string) => {
    switch (type) {
      case "error":
        return <Badge variant="destructive" className="text-xs">Error</Badge>;
      case "warning":
        return <Badge className="bg-amber-500/10 text-amber-700 text-xs">Warning</Badge>;
      case "suggestion":
        return <Badge className="bg-primary/10 text-primary text-xs">Suggestion</Badge>;
      case "improvement":
        return <Badge className="bg-green-500/10 text-green-700 text-xs">Improvement</Badge>;
      default:
        return null;
    }
  };

  const errorCount = issues.filter(i => i.type === "error").length;
  const warningCount = issues.filter(i => i.type === "warning").length;
  const suggestionCount = issues.filter(i => i.type === "suggestion" || i.type === "improvement").length;

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleProofread}
        className="gap-1.5 text-xs"
        disabled={!text || text.length < 10}
      >
        <Sparkles className="w-3 h-3" />
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Proofreading Analysis
            </DialogTitle>
            <DialogDescription>
              Review suggestions to improve your content's impact and clarity
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Analyzing your text...</p>
            </div>
          ) : issues.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">Looking great!</p>
              <p className="text-sm text-muted-foreground mt-1">
                No issues found. Your text is well-written.
              </p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="flex gap-3 py-3 border-b border-border">
                {errorCount > 0 && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <span className="font-medium text-destructive">{errorCount}</span>
                    <span className="text-muted-foreground">errors</span>
                  </div>
                )}
                {warningCount > 0 && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="font-medium text-amber-600">{warningCount}</span>
                    <span className="text-muted-foreground">warnings</span>
                  </div>
                )}
                {suggestionCount > 0 && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    <span className="font-medium text-primary">{suggestionCount}</span>
                    <span className="text-muted-foreground">suggestions</span>
                  </div>
                )}
              </div>

              {/* Issues List */}
              <ScrollArea className="flex-1 max-h-[400px] pr-4">
                <div className="space-y-3 py-2">
                  {issues.map((issue, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        issue.type === "error"
                          ? "border-destructive/30 bg-destructive/5"
                          : issue.type === "warning"
                          ? "border-amber-500/30 bg-amber-500/5"
                          : "border-primary/30 bg-primary/5"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {getIssueIcon(issue.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getIssueBadge(issue.type)}
                            <span className="text-xs text-muted-foreground">{issue.category}</span>
                          </div>
                          <p className="text-sm font-medium text-foreground">{issue.reason}</p>
                          <div className="mt-2 text-xs">
                            <span className="text-muted-foreground line-through">{issue.original}</span>
                            <span className="mx-2 text-muted-foreground">→</span>
                            <span className="text-primary font-medium">{issue.suggestion}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <DialogFooter className="border-t border-border pt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Close
                </Button>
                {errorCount > 0 && (
                  <Button onClick={handleApplyAll} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Fix {errorCount} Error{errorCount !== 1 ? 's' : ''}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
