import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Check, 
  X, 
  Bookmark,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { ApplySuggestion } from "@/types/ats";

interface SuggestionCardProps {
  suggestion: ApplySuggestion;
  onApply: (suggestion: ApplySuggestion) => void;
  onDismiss: (suggestion: ApplySuggestion) => void;
  onSave: (suggestion: ApplySuggestion) => void;
}

export const SuggestionCard = ({ 
  suggestion, 
  onApply, 
  onDismiss, 
  onSave 
}: SuggestionCardProps) => {
  const [showPreview, setShowPreview] = useState(false);

  const getTypeColor = (type: ApplySuggestion["type"]) => {
    switch (type) {
      case "skill": return "bg-blue-500/10 text-blue-700 border-blue-500/30";
      case "bullet": return "bg-purple-500/10 text-purple-700 border-purple-500/30";
      case "summary": return "bg-green-500/10 text-green-700 border-green-500/30";
      case "section": return "bg-amber-500/10 text-amber-700 border-amber-500/30";
    }
  };

  const getTypeLabel = (type: ApplySuggestion["type"]) => {
    switch (type) {
      case "skill": return "Add Skill";
      case "bullet": return "Rewrite Bullet";
      case "summary": return "Improve Summary";
      case "section": return "Section Change";
    }
  };

  if (suggestion.status !== "pending") {
    return null;
  }

  return (
    <Card className="border border-border overflow-hidden">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <Badge variant="outline" className={`text-xs ${getTypeColor(suggestion.type)}`}>
              {getTypeLabel(suggestion.type)}
            </Badge>
            <h4 className="text-sm font-medium">{suggestion.title}</h4>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600 shrink-0">
            <TrendingUp className="w-3 h-3" />
            +{suggestion.estimatedScoreImprovement}
          </div>
        </div>

        {/* Problem */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Problem</p>
          <p className="text-sm">{suggestion.problem}</p>
        </div>

        {/* Why it matters */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Why it matters</p>
          <p className="text-xs text-muted-foreground">{suggestion.whyItMatters}</p>
        </div>

        {/* Before/After Preview */}
        {(suggestion.before || suggestion.after) && (
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7 w-full justify-between"
              onClick={() => setShowPreview(!showPreview)}
            >
              <span>Preview Change</span>
              <ArrowRight className={`w-3 h-3 transition-transform ${showPreview ? "rotate-90" : ""}`} />
            </Button>
            
            {showPreview && (
              <div className="space-y-2 bg-muted/50 rounded-lg p-3">
                {suggestion.before && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-red-600 flex items-center gap-1">
                      <X className="w-3 h-3" /> Before
                    </p>
                    <p className="text-xs text-muted-foreground line-through">{suggestion.before}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-green-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> After
                  </p>
                  <p className="text-xs font-medium">{suggestion.after}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button 
            size="sm" 
            className="flex-1 h-8"
            onClick={() => onApply(suggestion)}
          >
            <Check className="w-3 h-3 mr-1" />
            Apply
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8"
            onClick={() => onSave(suggestion)}
          >
            <Bookmark className="w-3 h-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8"
            onClick={() => onDismiss(suggestion)}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface SuggestionsPanelProps {
  suggestions: ApplySuggestion[];
  onApply: (suggestion: ApplySuggestion) => void;
  onDismiss: (suggestion: ApplySuggestion) => void;
  onSave: (suggestion: ApplySuggestion) => void;
}

export const SuggestionsPanel = ({ 
  suggestions, 
  onApply, 
  onDismiss, 
  onSave 
}: SuggestionsPanelProps) => {
  const pendingSuggestions = suggestions.filter(s => s.status === "pending");
  const savedSuggestions = suggestions.filter(s => s.status === "saved");

  if (pendingSuggestions.length === 0 && savedSuggestions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No suggestions available yet.</p>
        <p className="text-xs mt-1">Add a job description to get tailored suggestions.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Pending Suggestions */}
        {pendingSuggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Suggestions</h4>
              <Badge variant="secondary" className="text-xs">
                {pendingSuggestions.length} pending
              </Badge>
            </div>
            {pendingSuggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onApply={onApply}
                onDismiss={onDismiss}
                onSave={onSave}
              />
            ))}
          </div>
        )}

        {/* Saved Suggestions */}
        {savedSuggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-muted-foreground">Saved for Later</h4>
              <Badge variant="outline" className="text-xs">
                {savedSuggestions.length}
              </Badge>
            </div>
            {savedSuggestions.map((suggestion) => (
              <Card key={suggestion.id} className="opacity-60 hover:opacity-100 transition-opacity">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="outline" className="text-xs mb-1">
                        {suggestion.type}
                      </Badge>
                      <p className="text-xs font-medium">{suggestion.title}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="h-7"
                      onClick={() => onApply(suggestion)}
                    >
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
