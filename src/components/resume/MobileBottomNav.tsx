import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save, Check } from "lucide-react";

interface MobileBottomNavProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  onFinish: () => void;
  isLastStep: boolean;
}

export const MobileBottomNav = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSave,
  onFinish,
  isLastStep,
}: MobileBottomNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 lg:hidden z-50">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={currentStep === 0}
          className="gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <Button variant="ghost" size="sm" onClick={onSave} className="gap-1">
          <Save className="w-4 h-4" />
          Save
        </Button>

        {isLastStep ? (
          <Button size="sm" onClick={onFinish} className="gap-1">
            <Check className="w-4 h-4" />
            Finish
          </Button>
        ) : (
          <Button size="sm" onClick={onNext} className="gap-1">
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
