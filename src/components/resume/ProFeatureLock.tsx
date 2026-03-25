import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";
import { useProTier } from "@/contexts/ProTierContext";

interface ProFeatureLockProps {
  children: ReactNode;
  featureName?: string;
  showOverlay?: boolean;
}

export const ProFeatureLock = ({ 
  children, 
  featureName = "This feature",
  showOverlay = true 
}: ProFeatureLockProps) => {
  const { isPro, setShowUpgradeDialog } = useProTier();

  if (isPro) {
    return <>{children}</>;
  }

  if (!showOverlay) {
    return null;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-40 blur-[1px]">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg border-2 border-dashed border-primary/30">
        <div className="flex flex-col items-center gap-3 p-4 text-center">
          <div className="p-3 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20">
            <Lock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-sm">{featureName}</p>
            <p className="text-xs text-muted-foreground">Requires Assisted Tier</p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowUpgradeDialog(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Upgrade to Unlock
          </Button>
        </div>
      </div>
    </div>
  );
};

// Simple badge to show Pro feature indicator
export const ProBadge = ({ onClick }: { onClick?: () => void }) => {
  const { setShowUpgradeDialog } = useProTier();
  
  return (
    <button
      onClick={onClick || (() => setShowUpgradeDialog(true))}
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gradient-to-r from-amber-500/20 to-orange-600/20 text-amber-700 hover:from-amber-500/30 hover:to-orange-600/30 transition-colors"
    >
      <Sparkles className="w-3 h-3" />
      PRO
    </button>
  );
};
