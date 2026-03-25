import { useRef, useState, useEffect } from "react";
import { PersonalInfoForm } from "@/components/resume/PersonalInfoForm";
import { ProfileForm } from "@/components/resume/ProfileForm";
import { EducationForm } from "@/components/resume/EducationForm";
import { WorkExperienceForm } from "@/components/resume/WorkExperienceForm";
import { VolunteeringForm } from "@/components/resume/VolunteeringForm";
import { ProjectsForm } from "@/components/resume/ProjectsForm";
import { SkillsForm } from "@/components/resume/SkillsForm";
import { CustomSectionsForm } from "@/components/resume/CustomSectionsForm";
import { ProgressIndicator } from "@/components/resume/ProgressIndicator";
import { ExportDialog } from "@/components/resume/ExportDialog";
import { DraftRestoreDialog } from "@/components/resume/DraftRestoreDialog";
import { CelebrationDialog } from "@/components/resume/CelebrationDialog";
import { UnifiedResumeCoach } from "@/components/resume/UnifiedResumeCoach";
import { CVUploadDialog } from "@/components/resume/CVUploadDialog";
import { TextPasteDialog } from "@/components/resume/TextPasteDialog";
import { ReferencesForm } from "@/components/resume/ReferencesForm";
import { OnboardingTutorial, useOnboardingReset } from "@/components/resume/OnboardingTutorial";
import { SectionOrderManager } from "@/components/resume/SectionOrderManager";
import { templateComponents } from "@/components/resume/templates";
import { templates } from "@/types/templates";
import { useResumeStorage } from "@/hooks/useResumeStorage";
import { ResumeData } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import {
  ArrowLeft, ArrowRight, Check, RotateCcw, Save, Clock, Layout, Upload, X,
  Eye, Layers, FileText, Bot, ChevronLeft, ChevronRight, HelpCircle
} from "lucide-react";
import { PoweredByFooter } from "@/components/resume/PoweredByFooter";
import { FontSelector, FontFamily } from "@/components/resume/FontSelector";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { exportResumeToPdf } from "@/lib/resumePdfExporter";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const STEPS = ["Personal", "Profile", "Education", "Work Experience", "Volunteering", "Projects & Research", "Skills", "References", "Custom"];

const ResumeBuilder = () => {
  const {
    resumeData, updateResumeData, selectedTemplate, setSelectedTemplate,
    selectedFont, setSelectedFont, clearDraft, hasDraft, lastSaved, forceSave, updateSectionOrder,
  } = useResumeStorage();

  const navigate = useNavigate();
  const resumeRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(0);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [mobileView, setMobileView] = useState<"form" | "preview" | "coach">("form");
  const [selectedText, setSelectedText] = useState<string>("");
  const [showTutorial, setShowTutorial] = useState(false);
  const [coachSyncNonce, setCoachSyncNonce] = useState(0);
  const [coachSyncMode, setCoachSyncMode] = useState<"quality" | "jobMatch" | "cvAnalysis">("quality");
  const { resetOnboarding } = useOnboardingReset();

  const TemplateComponent = templateComponents[selectedTemplate] || templateComponents.classic;

  useEffect(() => {
    const hasExistingDraft = localStorage.getItem("resume_draft");
    if (hasExistingDraft) {
      const parsed = JSON.parse(hasExistingDraft);
      if (parsed.personalInfo?.fullName || parsed.education?.length > 0) {
        setShowDraftDialog(true);
      }
    }
  }, []);

  const handleNext = () => { if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1); };
  const handlePrevious = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };
  const handleClearDraft = () => { clearDraft(); setCurrentStep(0); toast({ title: "Draft Cleared", description: "Your resume data has been reset." }); };
  const handleFinish = () => { forceSave(); setShowCelebration(true); };

  const requestCoachSync = (mode: "quality" | "jobMatch" | "cvAnalysis") => {
    setCoachSyncMode(mode);
    setCoachSyncNonce((prev) => prev + 1);
  };

  const handleGetAIFeedback = () => {
    setShowCelebration(false);
    if (isMobile) setMobileView("coach");
    requestCoachSync("cvAnalysis");
  };

  const handleDownloadPDF = async () => {
    if (!resumeRef.current) return;

    await exportResumeToPdf({
      resumeElement: resumeRef.current,
      fileName: resumeData.personalInfo.fullName || "resume",
      pageSize: "a4",
    });

    setShowCelebration(false);
  };

  const handleCVDataExtracted = (data: Partial<ResumeData>) => {
    updateResumeData(data);
    // Navigate to first step so user can review imported data
    setCurrentStep(0);
    if (isMobile) setMobileView("form");
    toast({ title: "CV Data Imported", description: "Your resume data has been loaded. Review each section to verify." });
  };

  const handleDownloadText = () => {
    const lines: string[] = [];
    if (resumeData.personalInfo.fullName) lines.push(resumeData.personalInfo.fullName.toUpperCase());
    if (resumeData.personalInfo.email) lines.push(resumeData.personalInfo.email);
    lines.push(""); if (resumeData.profile) lines.push(resumeData.profile);
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `${resumeData.personalInfo.fullName || "resume"}.txt`;
    a.click(); URL.revokeObjectURL(url); setShowCelebration(false);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) setSelectedText(selection.toString().trim());
  };

  const renderCurrentForm = () => {
    switch (currentStep) {
      case 0: return <PersonalInfoForm data={resumeData.personalInfo} onChange={(data) => updateResumeData({ personalInfo: data })} />;
      case 1: return <ProfileForm data={resumeData.profile} onChange={(data) => updateResumeData({ profile: data })} />;
      case 2: return <EducationForm data={resumeData.education} onChange={(data) => updateResumeData({ education: data })} />;
      case 3: return <WorkExperienceForm data={resumeData} onChange={updateResumeData} />;
      case 4: return <VolunteeringForm data={resumeData} onChange={updateResumeData} />;
      case 5: return <ProjectsForm data={resumeData} onChange={updateResumeData} />;
      case 6: return <SkillsForm data={resumeData} onChange={updateResumeData} />;
      case 7: return <ReferencesForm data={resumeData} onChange={updateResumeData} />;
      case 8: return <CustomSectionsForm data={resumeData} onChange={updateResumeData} />;
      default: return null;
    }
  };

  // ─── Desktop 3-panel layout ────────────────────────────────────
  const DesktopLayout = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Full-width Form Navigation Bar */}
      <div className="border-b border-border bg-card/80 backdrop-blur-sm py-2.5 flex-shrink-0 overflow-x-auto px-4">
        <ProgressIndicator steps={STEPS} currentStep={currentStep} onStepClick={setCurrentStep} />
      </div>

      {/* 3-panel resizable area */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* LEFT — AI Resume Coach */}
        <ResizablePanel defaultSize={22} minSize={16} maxSize={35} className="flex flex-col overflow-hidden" data-coach-panel>
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
            <Bot className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground tracking-wide">AI Coach</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <UnifiedResumeCoach
              resumeData={resumeData}
              selectedText={selectedText}
              onClearSelectedText={() => setSelectedText("")}
              onUpdateResumeData={updateResumeData}
              coachSyncRequest={{ mode: coachSyncMode, nonce: coachSyncNonce }}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* CENTER — Form Editor */}
        <ResizablePanel defaultSize={40} minSize={30} className="flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4 xl:p-6 bg-muted/20">
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Form Card */}
              <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-card to-muted/30 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{currentStep + 1}</span>
                    </div>
                    <h2 className="text-sm lg:text-base font-semibold text-foreground">{STEPS[currentStep]}</h2>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
                    Step {currentStep + 1} of {STEPS.length}
                  </span>
                </div>
                <div className="p-4 lg:p-5">
                  {renderCurrentForm()}
                </div>
              </div>

              {/* Nav Buttons */}
              <div className="flex justify-between pb-4">
                <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0} size="sm" className="gap-1.5">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                {currentStep === STEPS.length - 1 ? (
                  <Button onClick={handleFinish} size="sm" className="gap-1.5">
                    <Check className="w-4 h-4" /> Complete
                  </Button>
                ) : (
                  <Button onClick={handleNext} size="sm" className="gap-1.5">
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* RIGHT — Live Preview */}
        <ResizablePanel defaultSize={38} minSize={25} maxSize={55} className="flex flex-col overflow-hidden">
          {/* Preview header */}
          <div className="px-3 py-2 border-b border-border bg-card flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">Live Preview</span>
                <span className="text-[10px] text-muted-foreground capitalize px-1.5 py-0.5 bg-muted rounded-md">{selectedTemplate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                      <Layout className="w-3 h-3 mr-1" /> Template
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-64 flex flex-col">
                    <SheetHeader><SheetTitle>Templates</SheetTitle></SheetHeader>
                    <div className="mt-4 space-y-2 overflow-y-auto flex-1 pb-4">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => { setSelectedTemplate(template.id); toast({ title: "Template Changed", description: `Switched to ${template.name}` }); }}
                          className={`w-full rounded-lg overflow-hidden border-2 transition-all ${selectedTemplate === template.id ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"}`}
                        >
                          <div className="aspect-[8.5/11] bg-white p-1 relative">
                            <div className="w-full h-full bg-white text-[3px] leading-tight p-1 overflow-hidden">
                              <div className="border-b border-gray-200 pb-0.5 mb-0.5"><div className="font-bold text-[4px]">Name</div></div>
                              <div className="space-y-0.5"><div className="bg-gray-100 h-2 rounded-sm" /><div className="bg-gray-100 h-1.5 rounded-sm w-3/4" /></div>
                            </div>
                            {selectedTemplate === template.id && (
                              <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5"><Check className="w-3 h-3" /></div>
                            )}
                          </div>
                          <div className="p-1.5 bg-card"><span className="text-xs font-medium text-foreground">{template.name}</span></div>
                        </button>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
            <div className="pt-2 border-t border-border/50 mt-2">
              <FontSelector value={selectedFont} onChange={setSelectedFont} />
            </div>
          </div>

          {/* Selected text indicator */}
          {selectedText && (
            <div className="px-3 py-1.5 bg-primary/10 border-b border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Bot className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-[11px] text-primary font-medium truncate">Text selected for AI review</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedText("")} className="h-6 w-6">
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}

          {/* Resume preview - renders like actual document */}
          <div className="flex-1 overflow-auto p-4 bg-neutral-200/60" onMouseUp={handleTextSelection}>
            <div className="mx-auto" style={{ maxWidth: "8.5in", aspectRatio: "8.5/11", boxShadow: "0 4px 20px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.1)" }}>
              <div ref={resumeRef} className={`resume-template bg-white ${selectedFont === "serif" ? "font-resume-serif" : "font-resume-sans"}`} style={{ cursor: "text", width: "100%", minHeight: "100%" }}>
                <TemplateComponent data={resumeData} />
              </div>
            </div>
          </div>

          <div className="px-3 py-1.5 border-t border-border bg-card text-[10px] text-muted-foreground text-center shrink-0">
            💡 Select text in preview for AI feedback
          </div>
          <PoweredByFooter />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );

  // ─── Mobile layout ─────────────────────────────────────────────
  const MobileLayout = () => (
    <>
      {/* Mobile View Toggle */}
      <div className="border-b border-border bg-card flex-shrink-0">
        <div className="flex">
          {[
            { key: "coach" as const, icon: Bot, label: "AI Coach" },
            { key: "form" as const, icon: Layout, label: "Edit" },
            { key: "preview" as const, icon: Eye, label: "Preview" },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setMobileView(key)}
              className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors flex items-center justify-center gap-1.5 ${
                mobileView === key ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Mobile Coach */}
        {mobileView === "coach" && (
          <div className="flex-1 overflow-hidden">
            <UnifiedResumeCoach
              resumeData={resumeData}
              selectedText={selectedText}
              onClearSelectedText={() => setSelectedText("")}
              onUpdateResumeData={updateResumeData}
              coachSyncRequest={{ mode: coachSyncMode, nonce: coachSyncNonce }}
            />
          </div>
        )}

        {/* Mobile Form */}
        {mobileView === "form" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-border bg-card/80 py-2 flex-shrink-0 overflow-x-auto">
              <ProgressIndicator steps={STEPS} currentStep={currentStep} onStepClick={setCurrentStep} />
            </div>
            <div className="flex-1 overflow-auto p-3">
              <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-card to-muted/30 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary">{currentStep + 1}</span>
                    </div>
                    <h2 className="text-sm font-semibold text-foreground">{STEPS[currentStep]}</h2>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{currentStep + 1}/{STEPS.length}</span>
                </div>
                <div className="p-3">{renderCurrentForm()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Preview */}
        {mobileView === "preview" && (
          <div className="flex-1 flex flex-col overflow-hidden" onTouchEnd={() => setTimeout(handleTextSelection, 100)}>
            <div className="px-3 py-2 border-b border-border bg-card flex-shrink-0 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold">Preview</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                        <Layout className="w-3 h-3 mr-1" /> Template
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-64 flex flex-col">
                      <SheetHeader><SheetTitle>Templates</SheetTitle></SheetHeader>
                      <div className="mt-4 space-y-2 overflow-y-auto flex-1 pb-4">
                        {templates.map((t) => (
                          <button key={t.id} onClick={() => { setSelectedTemplate(t.id); toast({ title: "Template Changed" }); }}
                            className={`w-full rounded-lg overflow-hidden border-2 transition-all ${selectedTemplate === t.id ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"}`}>
                            <div className="p-1.5 bg-card"><span className="text-xs font-medium">{t.name}</span></div>
                          </button>
                        ))}
                      </div>
                    </SheetContent>
                  </Sheet>
                  <ExportDialog resumeRef={resumeRef} fileName={resumeData.personalInfo.fullName || "resume"} resumeData={resumeData} />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border/50 pt-2">
                <FontSelector value={selectedFont} onChange={setSelectedFont} />
              </div>
            </div>
            {selectedText && (
              <div className="px-3 py-1.5 bg-primary/10 border-b border-primary/20 flex items-center justify-between">
                <span className="text-[11px] text-primary font-medium truncate">Selected for review</span>
                <div className="flex gap-1">
                  <Button variant="default" size="sm" className="h-6 text-[10px] px-2" onClick={() => setMobileView("coach")}>Review</Button>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedText("")} className="h-6 w-6"><X className="w-3 h-3" /></Button>
                </div>
              </div>
            )}
            <div className="flex-1 overflow-auto p-3 bg-neutral-200/60">
              <div className="mx-auto" style={{ maxWidth: "8.5in", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
                <div ref={resumeRef} className={`resume-template bg-white ${selectedFont === "serif" ? "font-resume-serif" : "font-resume-sans"}`}>
                  <TemplateComponent data={resumeData} />
                </div>
              </div>
            </div>
            <PoweredByFooter />
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      {mobileView === "form" && (
        <div className="bg-card border-t border-border p-2 safe-area-inset-bottom flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentStep === 0} className="gap-1 h-9">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <Button variant="ghost" size="sm" onClick={forceSave} className="gap-1 h-9">
              <Save className="w-4 h-4" /> Save
            </Button>
            {currentStep === STEPS.length - 1 ? (
              <Button size="sm" onClick={handleFinish} className="gap-1 h-9"><Check className="w-4 h-4" /> Finish</Button>
            ) : (
              <Button size="sm" onClick={handleNext} className="gap-1 h-9">Next <ArrowRight className="w-4 h-4" /></Button>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <OnboardingTutorial
        forceShow={showTutorial}
        onClose={() => setShowTutorial(false)}
        onNavigate={(target) => { if (isMobile) setMobileView(target); }}
        onStepClick={(step) => { setCurrentStep(step); if (isMobile) setMobileView("form"); }}
      />
      <DraftRestoreDialog open={showDraftDialog} onRestore={() => setShowDraftDialog(false)} onStartFresh={() => { clearDraft(); setShowDraftDialog(false); }} />
      <CelebrationDialog open={showCelebration} onOpenChange={setShowCelebration} onDownloadPDF={handleDownloadPDF} onDownloadText={handleDownloadText} onContinueEditing={() => setShowCelebration(false)} onGetAIFeedback={handleGetAIFeedback} resumeRef={resumeRef} resumeData={resumeData} />

      {/* Compact Header */}
      <header className="border-b border-border bg-card flex-shrink-0 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate("/templates")} className="h-8 w-8 shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-sm font-bold text-foreground truncate">Resume Builder</h1>
              {lastSaved && (
                <span className="text-[10px] text-muted-foreground hidden sm:flex items-center gap-1 whitespace-nowrap">
                  <Clock className="w-3 h-3" /> Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <CVUploadDialog onDataExtracted={handleCVDataExtracted} trigger={
              <Button variant="outline" size="sm" className="gap-1 h-8">
                <Upload className="w-3.5 h-3.5" /><span className="hidden sm:inline text-xs">Upload</span>
              </Button>
            } />
            <TextPasteDialog onDataExtracted={handleCVDataExtracted} trigger={
              <Button variant="outline" size="sm" className="gap-1 h-8">
                <FileText className="w-3.5 h-3.5" /><span className="hidden sm:inline text-xs">Paste</span>
              </Button>
            } />
            <SectionOrderManager resumeData={resumeData} sectionOrder={resumeData.sectionOrder} onOrderChange={updateSectionOrder} trigger={
              <Button variant="outline" size="sm" className="gap-1 h-8">
                <Layers className="w-3.5 h-3.5" /><span className="hidden xl:inline text-xs">Order</span>
              </Button>
            } />
            <Button variant="ghost" size="icon" onClick={() => { resetOnboarding(); setShowTutorial(true); }} className="h-8 w-8" title="Replay Guide">
              <HelpCircle className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={forceSave} className="h-8 w-8 hidden sm:flex" title="Save">
              <Save className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" title="Reset">
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Draft?</AlertDialogTitle>
                  <AlertDialogDescription>This will reset all your resume data.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearDraft}>Clear Draft</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <span data-export-btn><ExportDialog resumeRef={resumeRef} fileName={resumeData.personalInfo.fullName || "resume"} resumeData={resumeData} /></span>
          </div>
        </div>
      </header>

      {/* Content: Desktop vs Mobile */}
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
    </div>
  );
};

export default ResumeBuilder;
