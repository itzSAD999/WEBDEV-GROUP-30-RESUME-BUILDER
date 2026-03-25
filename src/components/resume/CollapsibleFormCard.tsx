import { useState, useEffect, ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleFormCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  summary?: string;
  itemCount?: number;
  isEmpty?: boolean;
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  className?: string;
  dragHandle?: ReactNode;
}

export const CollapsibleFormCard = ({
  title,
  icon,
  children,
  summary,
  itemCount,
  isEmpty = false,
  defaultExpanded = true,
  onToggle,
  className,
  dragHandle
}: CollapsibleFormCardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Auto-collapse if empty, expand if has content
  useEffect(() => {
    if (isEmpty && !defaultExpanded) {
      setIsExpanded(false);
    }
  }, [isEmpty, defaultExpanded]);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(newState);
  };

  return (
    <Card className={cn(
      "transition-all duration-200",
      !isExpanded && "bg-muted/30",
      className
    )}>
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {dragHandle}
            {icon && <span className="text-primary">{icon}</span>}
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">{title}</h3>
              {itemCount !== undefined && itemCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {itemCount}
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {/* Summary when collapsed */}
        {!isExpanded && summary && (
          <p className="text-xs text-muted-foreground mt-2 ml-9 line-clamp-1">
            {summary}
          </p>
        )}
        
        {!isExpanded && isEmpty && (
          <p className="text-xs text-muted-foreground mt-2 ml-9 italic">
            Click to expand and add content
          </p>
        )}
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0 px-4 pb-4">
          {children}
        </CardContent>
      )}
    </Card>
  );
};

// Helper to generate summary text
export const generateSummary = {
  education: (data: any[]): string => {
    if (!data || data.length === 0) return "";
    const first = data[0];
    return `${first.institution || ""}${first.degree ? ` — ${first.degree}` : ""}${first.endDate ? ` (${first.endDate})` : ""}`;
  },
  
  experience: (data: any[]): string => {
    if (!data || data.length === 0) return "";
    const first = data[0];
    return `${first.title || ""}${first.company ? ` at ${first.company}` : ""}`;
  },
  
  skills: (technical: string[], soft: string[]): string => {
    const all = [...(technical || []), ...(soft || [])];
    if (all.length === 0) return "";
    const preview = all.slice(0, 4).join(", ");
    return all.length > 4 ? `${preview} +${all.length - 4} more` : preview;
  },
  
  projects: (data: any[]): string => {
    if (!data || data.length === 0) return "";
    return data.map(p => p.title).filter(Boolean).slice(0, 2).join(", ");
  },
  
  personalInfo: (data: any): string => {
    if (!data) return "";
    const parts = [data.fullName, data.email].filter(Boolean);
    return parts.join(" • ");
  }
};