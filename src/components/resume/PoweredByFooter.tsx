import { ExternalLink } from "lucide-react";

export const PoweredByFooter = () => {
  return (
    <div className="flex items-center justify-center gap-1.5 py-3 text-xs text-muted-foreground">
      <span>Powered by</span>
      <a 
        href="https://find-mistar-uni.lovable.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-medium text-primary hover:underline transition-colors"
      >
        MiStarStudio
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
};
