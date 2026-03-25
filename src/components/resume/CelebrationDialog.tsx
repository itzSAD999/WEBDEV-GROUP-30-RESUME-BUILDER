import { useEffect, useRef, useMemo } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Download, FileText, Pencil, PartyPopper, Trophy, CheckCircle2,
  Briefcase, GraduationCap, User, Sparkles, ArrowRight, Star, Target, Brain
} from "lucide-react";
import confetti from "canvas-confetti";
import { ExportDialog } from "./ExportDialog";
import { ResumeData } from "@/types/resume";
import { cn } from "@/lib/utils";

interface CelebrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownloadPDF: () => void;
  onDownloadText: () => void;
  onContinueEditing: () => void;
  onGetAIFeedback?: () => void;
  resumeRef?: React.RefObject<HTMLDivElement>;
  resumeData?: ResumeData;
}

export const CelebrationDialog = ({
  open,
  onOpenChange,
  onDownloadPDF,
  onDownloadText,
  onContinueEditing,
  onGetAIFeedback,
  resumeRef,
  resumeData,
}: CelebrationDialogProps) => {
  const hasConfettiFired = useRef(false);

  // Calculate resume stats
  const stats = useMemo(() => {
    if (!resumeData) return null;
    const sectionsCompleted = [
      resumeData.personalInfo.fullName,
      resumeData.profile,
      resumeData.education.length > 0,
      resumeData.workExperience.length > 0,
      resumeData.technicalSkills.length > 0 || resumeData.softSkills.length > 0,
    ].filter(Boolean).length;

    const totalBullets = resumeData.workExperience.reduce(
      (sum, w) => sum + w.responsibilities.filter((r) => r.trim()).length, 0
    ) + resumeData.projects.reduce(
      (sum, p) => sum + p.description.filter((d) => d.trim()).length, 0
    );

    const skillCount = resumeData.technicalSkills.length + resumeData.softSkills.length;

    return { sectionsCompleted, totalBullets, skillCount };
  }, [resumeData]);

  useEffect(() => {
    if (open && !hasConfettiFired.current) {
      hasConfettiFired.current = true;

      // Multi-burst confetti
      const bursts = [
        { delay: 0, particleCount: 80, spread: 70, origin: { x: 0.5, y: 0.6 } },
        { delay: 200, particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } },
        { delay: 200, particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } },
        { delay: 600, particleCount: 40, spread: 100, origin: { x: 0.5, y: 0.5 } },
      ];

      bursts.forEach(({ delay, ...opts }) => {
        setTimeout(() => {
          confetti({
            ...opts,
            colors: ["#c41e3a", "#ff6b6b", "#ffd93d", "#22c55e", "#3b82f6"],
            ticks: 200,
            gravity: 0.8,
            scalar: 1.2,
            shapes: ["circle", "square"],
          });
        }, delay);
      });

      // Continuous sparkle
      const duration = 2500;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60 + Math.random() * 60,
          spread: 45,
          origin: { x: Math.random(), y: Math.random() * 0.5 },
          colors: ["#c41e3a", "#ffd93d"],
          ticks: 100,
          gravity: 1.2,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      setTimeout(frame, 400);
    }
    if (!open) hasConfettiFired.current = false;
  }, [open]);

  const completionLevel = stats
    ? stats.sectionsCompleted >= 5 ? "Expert" : stats.sectionsCompleted >= 3 ? "Advanced" : "Starter"
    : "Starter";

  const levelColor = completionLevel === "Expert"
    ? "from-yellow-400 to-amber-500"
    : completionLevel === "Advanced"
    ? "from-primary to-primary/70"
    : "from-blue-400 to-blue-600";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden gap-0">
        {/* Hero Gradient Header */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 pb-8 text-white relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl animate-scale-in">
              <PartyPopper className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-1">Your Resume is Ready! 🎉</h2>
            <p className="text-white/80 text-sm">
              Congratulations on completing your professional resume
            </p>

            {/* Level badge */}
            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5">
              <Trophy className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-semibold">{completionLevel} Resume Builder</span>
              <div className="flex gap-0.5">
                {[1, 2, 3].map((s) => (
                  <Star
                    key={s}
                    className={cn("w-3.5 h-3.5", s <= (completionLevel === "Expert" ? 3 : completionLevel === "Advanced" ? 2 : 1)
                      ? "fill-yellow-300 text-yellow-300"
                      : "text-white/30"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="px-6 -mt-4 relative z-10">
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: CheckCircle2, label: "Sections", value: `${stats.sectionsCompleted}/5`, color: "text-green-600 bg-green-500/10" },
                { icon: Target, label: "Bullet Points", value: String(stats.totalBullets), color: "text-blue-600 bg-blue-500/10" },
                { icon: Sparkles, label: "Skills", value: String(stats.skillCount), color: "text-purple-600 bg-purple-500/10" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="bg-card rounded-xl border border-border p-3 text-center shadow-sm">
                  <div className={cn("w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center", color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-lg font-bold text-foreground">{value}</div>
                  <div className="text-[10px] text-muted-foreground font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 space-y-3">
          {/* AI Feedback Prompt */}
          {onGetAIFeedback && (
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">Get AI Feedback</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Let our AI analyze your resume for content quality, impact, and industry readiness before you export.
              </p>
              <Button onClick={onGetAIFeedback} className="w-full gap-2" variant="default">
                <Sparkles className="w-4 h-4" />
                Analyze My Resume
              </Button>
            </div>
          )}

          {/* Improvement suggestions */}
          {stats && stats.sectionsCompleted < 5 && (
            <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-3 mb-2">
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Tip: Complete all 5 sections to reach Expert level and maximize your ATS score!
              </p>
            </div>
          )}

          {/* Export */}
          {resumeRef && resumeData ? (
            <ExportDialog
              resumeRef={resumeRef}
              fileName={resumeData.personalInfo.fullName || "resume"}
              resumeData={resumeData}
            />
          ) : (
            <>
              <Button onClick={onDownloadPDF} variant="premium" className="w-full gap-2" size="lg">
                <Download className="w-5 h-5" />
                Download PDF
              </Button>
              <Button onClick={onDownloadText} variant="outline" className="w-full gap-2" size="lg">
                <FileText className="w-5 h-5" />
                Download as Text
              </Button>
            </>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button onClick={onContinueEditing} variant="outline" className="gap-2">
              <Pencil className="w-4 h-4" />
              Keep Editing
            </Button>
            <Button onClick={onContinueEditing} variant="ghost" className="gap-2 text-muted-foreground">
              <ArrowRight className="w-4 h-4" />
              Dashboard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
