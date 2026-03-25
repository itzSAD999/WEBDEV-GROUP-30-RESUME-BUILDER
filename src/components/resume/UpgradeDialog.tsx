import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Zap, Target, FileCheck, MessageSquare, Download } from "lucide-react";
import { useProTier, proFeatures } from "@/contexts/ProTierContext";
import { toast } from "@/hooks/use-toast";

const featureIcons: Record<string, React.ReactNode> = {
  "AI-Powered Content Suggestions": <Sparkles className="w-4 h-4" />,
  "Keyword Optimization for ATS": <Target className="w-4 h-4" />,
  "Grammar & Spell Check": <FileCheck className="w-4 h-4" />,
  "Professional Formatting Assistance": <Zap className="w-4 h-4" />,
  "Resume Score & Feedback": <Crown className="w-4 h-4" />,
  "Job Description Tailoring": <Target className="w-4 h-4" />,
  "Priority Support": <MessageSquare className="w-4 h-4" />,
  "Unlimited Resume Exports": <Download className="w-4 h-4" />,
};

export const UpgradeDialog = () => {
  const { showUpgradeDialog, setShowUpgradeDialog, setIsPro } = useProTier();

  const handleUnlockDemo = () => {
    // For demo/testing purposes - this would be replaced with actual payment
    setIsPro(true);
    setShowUpgradeDialog(false);
    toast({
      title: "Pro Features Unlocked! 🎉",
      description: "You now have access to all Assisted Tier features.",
    });
  };

  return (
    <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
              <Crown className="w-5 h-5 text-white" />
            </div>
            Upgrade to Assisted Tier
          </DialogTitle>
          <DialogDescription>
            Unlock powerful AI-assisted features to create a standout resume
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Pricing Card */}
          <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold">$9.99</span>
              <span className="text-muted-foreground">/month</span>
              <Badge variant="secondary" className="ml-2">Most Popular</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Cancel anytime • 7-day free trial
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Everything included:</p>
            <div className="grid gap-2">
              {proFeatures.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                >
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                    {featureIcons[feature] || <Check className="w-4 h-4" />}
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2 pt-2">
            <Button 
              onClick={handleUnlockDemo} 
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start Free Trial
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              💡 Demo Mode: Click to unlock features for testing
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
