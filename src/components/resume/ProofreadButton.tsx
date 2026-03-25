import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProofreadResult {
  type: "error" | "warning" | "suggestion";
  original: string;
  suggestion: string;
  reason: string;
}

interface ProofreadButtonProps {
  text: string;
  onApply: (corrected: string) => void;
  label?: string;
}

// Simple proofreading rules
const proofreadText = (text: string): ProofreadResult[] => {
  const results: ProofreadResult[] = [];
  
  // Check for weak verbs
  const weakVerbs = ["helped", "worked on", "was responsible for", "assisted with", "participated in"];
  weakVerbs.forEach((verb) => {
    if (text.toLowerCase().includes(verb)) {
      results.push({
        type: "suggestion",
        original: verb,
        suggestion: verb === "helped" ? "enabled/facilitated" :
                    verb === "worked on" ? "developed/implemented" :
                    verb === "was responsible for" ? "managed/led" :
                    verb === "assisted with" ? "contributed to/supported" :
                    "engaged in/led",
        reason: "Consider using stronger action verbs",
      });
    }
  });

  // Check for missing quantification
  if (!/\d+/.test(text) && text.length > 30) {
    results.push({
      type: "suggestion",
      original: text.substring(0, 30) + "...",
      suggestion: "Add specific numbers (e.g., 'increased by 25%', 'managed team of 5')",
      reason: "Quantify achievements for more impact",
    });
  }

  // Common spelling/grammar issues
  const commonIssues: [RegExp, string, string][] = [
    [/\bi\b/g, "I", "Capitalize 'I'"],
    [/\s{2,}/g, " ", "Remove extra spaces"],
    [/,,/g, ",", "Remove duplicate comma"],
    [/\.{2,}/g, ".", "Remove extra periods"],
  ];

  commonIssues.forEach(([pattern, replacement, reason]) => {
    if (pattern.test(text)) {
      results.push({
        type: "error",
        original: text.match(pattern)?.[0] || "",
        suggestion: replacement,
        reason,
      });
    }
  });

  // Check for passive voice
  const passiveIndicators = ["was created", "were developed", "is managed", "are handled"];
  passiveIndicators.forEach((phrase) => {
    if (text.toLowerCase().includes(phrase)) {
      results.push({
        type: "warning",
        original: phrase,
        suggestion: "Use active voice (e.g., 'created', 'developed', 'manage', 'handle')",
        reason: "Passive voice can weaken impact",
      });
    }
  });

  return results;
};

export const ProofreadButton = ({ text, onApply, label = "Check Grammar" }: ProofreadButtonProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ProofreadResult[]>([]);
  const { toast } = useToast();

  const handleProofread = async () => {
    setLoading(true);
    setOpen(true);
    
    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 500));
    
    const proofreadResults = proofreadText(text);
    setResults(proofreadResults);
    setLoading(false);
  };

  const applyCorrections = () => {
    let corrected = text;
    
    // Apply error corrections
    results
      .filter((r) => r.type === "error")
      .forEach((r) => {
        if (r.original && r.suggestion) {
          corrected = corrected.replace(r.original, r.suggestion);
        }
      });
    
    onApply(corrected);
    setOpen(false);
    toast({
      title: "Corrections Applied",
      description: "Grammar corrections have been applied to your text.",
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleProofread}
        className="gap-1 text-xs"
        disabled={!text || text.length < 10}
      >
        <Sparkles className="w-3 h-3" />
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Proofreading Results
            </DialogTitle>
            <DialogDescription>
              Review suggestions to improve your content
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-foreground font-medium">Looks great!</p>
              <p className="text-sm text-muted-foreground">No issues found in your text.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.type === "error"
                      ? "border-destructive/50 bg-destructive/5"
                      : result.type === "warning"
                      ? "border-yellow-500/50 bg-yellow-500/5"
                      : "border-primary/50 bg-primary/5"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {result.type === "error" ? (
                      <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    ) : result.type === "warning" ? (
                      <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{result.reason}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="line-through">{result.original}</span>
                        {" → "}
                        <span className="text-primary font-medium">{result.suggestion}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                  Dismiss
                </Button>
                {results.some((r) => r.type === "error") && (
                  <Button onClick={applyCorrections} className="flex-1">
                    Apply Corrections
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
