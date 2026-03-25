import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, Loader2, FileText, FileType, FileIcon, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ResumeData } from "@/types/resume";
import { generateDocx } from "@/lib/docxExporter";
import { exportResumeToPdf } from "@/lib/resumePdfExporter";

interface ExportDialogProps {
  resumeRef: React.RefObject<HTMLDivElement>;
  fileName: string;
  resumeData?: ResumeData;
}

export const ExportDialog = ({ resumeRef, fileName, resumeData }: ExportDialogProps) => {
  const [pageSize, setPageSize] = useState<"letter" | "a4">("a4");
  const [format, setFormat] = useState<"pdf" | "text" | "docx">("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleExportPDF = async () => {
    if (!resumeRef.current) return;
    setIsExporting(true);
    try {
      await exportResumeToPdf({
        resumeElement: resumeRef.current,
        fileName: fileName || "resume",
        pageSize,
      });

      toast({ title: "✅ Downloaded!", description: "Your resume has been saved as PDF." });
      setOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to download PDF. Please try again.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportText = () => {
    if (!resumeData) return;
    const lines: string[] = [];
    if (resumeData.personalInfo.fullName) lines.push(resumeData.personalInfo.fullName.toUpperCase());
    if (resumeData.personalInfo.jobTitle) lines.push(resumeData.personalInfo.jobTitle);
    const contactParts: string[] = [];
    if (resumeData.personalInfo.email) contactParts.push(resumeData.personalInfo.email);
    if (resumeData.personalInfo.phone) contactParts.push(resumeData.personalInfo.phone);
    if (resumeData.personalInfo.linkedin) contactParts.push(resumeData.personalInfo.linkedin);
    if (resumeData.personalInfo.portfolio) contactParts.push(resumeData.personalInfo.portfolio);
    if (contactParts.length) lines.push(contactParts.join(" | "));
    lines.push("");
    if (resumeData.profile) { lines.push("PROFESSIONAL SUMMARY"); lines.push("-".repeat(40)); lines.push(resumeData.profile); lines.push(""); }
    if (resumeData.education.length > 0) {
      lines.push("EDUCATION"); lines.push("-".repeat(40));
      resumeData.education.forEach((edu) => {
        lines.push(`${edu.institution} | ${edu.startDate} - ${edu.endDate}`);
        lines.push(edu.degree);
        if (edu.bullets?.length) edu.bullets.filter((b) => b.trim()).forEach((b) => lines.push(`  • ${b}`));
        lines.push("");
      });
    }
    if (resumeData.workExperience.length > 0) {
      lines.push("EXPERIENCE"); lines.push("-".repeat(40));
      resumeData.workExperience.forEach((work) => {
        lines.push(`${work.title} | ${work.company}`);
        lines.push(`${work.startDate} - ${work.current ? "Present" : work.endDate}`);
        work.responsibilities.filter((r) => r.trim()).forEach((r) => lines.push(`  • ${r}`));
        lines.push("");
      });
    }
    if (resumeData.projects.length > 0) {
      lines.push("PROJECTS"); lines.push("-".repeat(40));
      resumeData.projects.forEach((proj) => {
        lines.push(`${proj.title}${proj.role ? ` - ${proj.role}` : ""} | ${proj.startDate}${proj.endDate ? ` - ${proj.endDate}` : ""}`);
        if (proj.technologies) lines.push(`Technologies: ${proj.technologies}`);
        proj.description.filter((d) => d.trim()).forEach((d) => lines.push(`  • ${d}`));
        lines.push("");
      });
    }
    if (resumeData.technicalSkills.length > 0 || resumeData.softSkills.length > 0) {
      lines.push("SKILLS"); lines.push("-".repeat(40));
      if (resumeData.technicalSkills.length) lines.push(`Technical: ${resumeData.technicalSkills.join(", ")}`);
      if (resumeData.softSkills.length) lines.push(`Soft Skills: ${resumeData.softSkills.join(", ")}`);
      lines.push("");
    }
    if (resumeData.certifications.length > 0) {
      lines.push("CERTIFICATIONS"); lines.push("-".repeat(40));
      resumeData.certifications.forEach((cert) => lines.push(`${cert.name} | ${cert.issuer} | ${cert.date}`));
      lines.push("");
    }
    if (resumeData.interests.length > 0) {
      lines.push("INTERESTS"); lines.push("-".repeat(40));
      lines.push(resumeData.interests.join(", "));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `${fileName || "resume"}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "✅ Downloaded!", description: "Your resume has been saved as text." });
    setOpen(false);
  };

  const handleExportDocx = async () => {
    if (!resumeData) return;
    setIsExporting(true);
    try {
      await generateDocx(resumeData, fileName || "resume");
      toast({ title: "✅ Downloaded!", description: "Your resume has been saved as DOCX." });
      setOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate DOCX. Please try again.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = () => {
    if (format === "pdf") handleExportPDF();
    else if (format === "docx") handleExportDocx();
    else handleExportText();
  };

  const formatLabel = format === "pdf" ? "PDF" : format === "docx" ? "DOCX" : "Text";

  const formatOptions = [
    { value: "pdf", icon: FileText, label: "PDF", desc: "Styled", color: "text-primary" },
    { value: "docx", icon: FileIcon, label: "DOCX", desc: "ATS-best", color: "text-primary" },
    { value: "text", icon: FileType, label: "Text", desc: "Plain", color: "text-muted-foreground" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" size="sm" variant="premium">
          <Download className="w-4 h-4" />
          <span>Export</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-lg">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            Export Resume
          </DialogTitle>
          <DialogDescription>Choose your format and download your polished resume.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Format</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as "pdf" | "text" | "docx")} className="grid grid-cols-3 gap-3">
              {formatOptions.map((opt) => (
                <Label
                  key={opt.value}
                  htmlFor={opt.value}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                    format === opt.value
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/10 scale-[1.02]"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  <RadioGroupItem value={opt.value} id={opt.value} className="sr-only" />
                  <opt.icon className={`w-6 h-6 mb-2 ${format === opt.value ? "text-primary" : opt.color}`} />
                  <span className="font-semibold text-sm">{opt.label}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</span>
                  {format === opt.value && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-1.5" />
                  )}
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Page Size (PDF only) */}
          {format === "pdf" && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Page Size</Label>
              <RadioGroup value={pageSize} onValueChange={(v) => setPageSize(v as "letter" | "a4")} className="grid grid-cols-2 gap-3">
                {[
                  { value: "letter", label: "Letter", desc: "8.5 × 11 in" },
                  { value: "a4", label: "A4", desc: "210 × 297 mm" },
                ].map((opt) => (
                  <Label
                    key={opt.value}
                    htmlFor={opt.value}
                    className={`flex flex-col items-center justify-center rounded-xl border-2 p-3.5 cursor-pointer transition-all duration-200 ${
                      pageSize === opt.value
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    <RadioGroupItem value={opt.value} id={opt.value} className="sr-only" />
                    <span className="font-semibold text-sm">{opt.label}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Info banner */}
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {format === "pdf"
                ? "📄 High-quality PDF with professional formatting preserved. Best for email applications."
                : format === "docx"
                ? "📝 DOCX is the best format for ATS systems and recruiters. Fully editable in Word/Google Docs."
                : "📋 Plain text format is ideal for copy-pasting into online application forms."}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)} size="sm">Cancel</Button>
          <Button onClick={handleExport} disabled={isExporting} variant="premium" className="gap-2 min-w-[140px]" size="sm">
            {isExporting ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Exporting...</>
            ) : (
              <><Download className="w-4 h-4" />Download {formatLabel}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
