import { useState } from "react";
import { Download, Loader2, FileText, FileType, FileIcon, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateDocx } from "@/lib/docxExporter";
import { exportResumeToPdf } from "@/lib/resumePdfExporter";

const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599; --primary: #4f8ef7;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }

  .dialog-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center;
    z-index: 50; padding: 16px; backdrop-filter: blur(4px); font-family: var(--font);
  }

  .dialog-content {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); width: 100%; max-width: 450px; max-height: 90vh;
    display: flex; flex-direction: column; overflow: hidden; color: var(--text);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  }

  .dialog-header { padding: 20px 24px 12px; }
  .dialog-title { font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .dialog-title-icon { width: 36px; height: 36px; border-radius: 12px; background: rgba(79, 142, 247, 0.1); display: flex; align-items: center; justify-content: center; }
  .dialog-desc { font-size: 13.5px; color: var(--text-muted); line-height: 1.5; }

  .dialog-body { padding: 12px 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }
  
  .section-label { font-size: 13.5px; font-weight: 600; margin-bottom: 12px; display: block; }
  
  .radio-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .radio-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  
  .radio-card {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    border-radius: 12px; border: 2px solid var(--border); padding: 16px;
    cursor: pointer; transition: all 0.2s; position: relative;
  }
  .radio-card:hover { border-color: rgba(79, 142, 247, 0.4); background: rgba(31, 36, 53, 0.5); }
  .radio-card.active { border-color: var(--primary); background: rgba(79, 142, 247, 0.05); transform: scale(1.02); box-shadow: 0 4px 12px rgba(79, 142, 247, 0.1); }
  
  .radio-icon { margin-bottom: 8px; }
  .radio-label { font-size: 13.5px; font-weight: 600; }
  .radio-desc { font-size: 10px; color: var(--text-muted); margin-top: 2px; }
  .radio-check { position: absolute; bottom: 8px; color: var(--primary); }

  .info-banner {
    background: rgba(31, 36, 53, 0.5); border-radius: 12px; padding: 16px;
    border: 1px solid rgba(42, 48, 72, 0.5); font-size: 11.5px; color: var(--text-muted); line-height: 1.5;
  }

  .dialog-footer { padding: 16px 24px; display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border); }

  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 8px 16px; border-radius: var(--r-sm);
    font-size: 13.5px; font-weight: 500; cursor: pointer;
    transition: all 0.2s; border: none; font-family: var(--font);
  }
  .btn-sm { padding: 6px 12px; font-size: 12.5px; }
  .btn-premium { background: linear-gradient(to right, #6366f1, #a855f7, #ec4899); color: white; min-width: 140px; }
  .btn-premium:hover { opacity: 0.9; }
  .btn-premium:disabled { opacity: 0.7; cursor: not-allowed; }
  .btn-outline { border: 1px solid var(--border); background: transparent; color: var(--text); }
  .btn-outline:hover { background: var(--surface2); }
\`;

export const ExportDialog = ({ resumeRef, fileName, resumeData, trigger }) => {
  const [pageSize, setPageSize] = useState("a4");
  const [format, setFormat] = useState("pdf");
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
    const lines = [];
    if (resumeData.personalInfo.fullName) lines.push(resumeData.personalInfo.fullName.toUpperCase());
    if (resumeData.personalInfo.jobTitle) lines.push(resumeData.personalInfo.jobTitle);
    const contactParts = [];
    if (resumeData.personalInfo.email) contactParts.push(resumeData.personalInfo.email);
    if (resumeData.personalInfo.phone) contactParts.push(resumeData.personalInfo.phone);
    if (resumeData.personalInfo.linkedin) contactParts.push(resumeData.personalInfo.linkedin);
    if (resumeData.personalInfo.portfolio) contactParts.push(resumeData.personalInfo.portfolio);
    if (contactParts.length) lines.push(contactParts.join(" | "));
    lines.push("");
    if (resumeData.profile) { lines.push("PROFESSIONAL SUMMARY"); lines.push("-".repeat(40)); lines.push(resumeData.profile); lines.push(""); }
    if (resumeData.education?.length > 0) {
      lines.push("EDUCATION"); lines.push("-".repeat(40));
      resumeData.education.forEach((edu) => {
        lines.push(\`\${edu.institution} | \${edu.startDate} - \${edu.endDate}\`);
        lines.push(edu.degree);
        if (edu.bullets?.length) edu.bullets.filter((b) => b.trim()).forEach((b) => lines.push(\`  • \${b}\`));
        lines.push("");
      });
    }
    if (resumeData.workExperience?.length > 0) {
      lines.push("EXPERIENCE"); lines.push("-".repeat(40));
      resumeData.workExperience.forEach((work) => {
        lines.push(\`\${work.title} | \${work.company}\`);
        lines.push(\`\${work.startDate} - \${work.current ? "Present" : work.endDate}\`);
        if (work.responsibilities?.length) work.responsibilities.filter((r) => r.trim()).forEach((r) => lines.push(\`  • \${r}\`));
        lines.push("");
      });
    }
    if (resumeData.projects?.length > 0) {
      lines.push("PROJECTS"); lines.push("-".repeat(40));
      resumeData.projects.forEach((proj) => {
        lines.push(\`\${proj.title}\${proj.role ? \` - \${proj.role}\` : ""} | \${proj.startDate}\${proj.endDate ? \` - \${proj.endDate}\` : ""}\`);
        if (proj.technologies) lines.push(\`Technologies: \${proj.technologies}\`);
        if (proj.description?.length) proj.description.filter((d) => d.trim()).forEach((d) => lines.push(\`  • \${d}\`));
        lines.push("");
      });
    }
    if (resumeData.technicalSkills?.length > 0 || resumeData.softSkills?.length > 0) {
      lines.push("SKILLS"); lines.push("-".repeat(40));
      if (resumeData.technicalSkills?.length) lines.push(\`Technical: \${resumeData.technicalSkills.join(", ")}\`);
      if (resumeData.softSkills?.length) lines.push(\`Soft Skills: \${resumeData.softSkills.join(", ")}\`);
      lines.push("");
    }
    if (resumeData.certifications?.length > 0) {
      lines.push("CERTIFICATIONS"); lines.push("-".repeat(40));
      resumeData.certifications.forEach((cert) => lines.push(\`\${cert.name} | \${cert.issuer} | \${cert.date}\`));
      lines.push("");
    }
    if (resumeData.interests?.length > 0) {
      lines.push("INTERESTS"); lines.push("-".repeat(40));
      lines.push(resumeData.interests.join(", "));
    }
    const blob = new Blob([lines.join("n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = \`\${fileName || "resume"}.txt\`;
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
    { value: "pdf", icon: FileText, label: "PDF", desc: "Styled", color: "var(--primary)" },
    { value: "docx", icon: FileIcon, label: "DOCX", desc: "ATS-best", color: "var(--primary)" },
    { value: "text", icon: FileType, label: "Text", desc: "Plain", color: "var(--text-muted)" },
  ];

  return (
    <>
      <style>{styles}</style>
      
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <button className="btn btn-sm btn-premium" onClick={() => setOpen(true)}>
          <Download size={16} /> Export
        </button>
      )}

      {open && (
        <div className="dialog-overlay" onClick={() => setOpen(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">
                <div className="dialog-title-icon">
                  <FileText size={20} />
                </div>
                Export Resume
              </h2>
              <p className="dialog-desc">Choose your format and download your polished resume.</p>
            </div>

            <div className="dialog-body">
              <div>
                <label className="section-label">Format</label>
                <div className="radio-grid">
                  {formatOptions.map((opt) => (
                    <div
                      key={opt.value}
                      className={\`radio-card \${format === opt.value ? 'active' : ''}\`}
                      onClick={() => setFormat(opt.value)}
                    >
                      <opt.icon size={24} className="radio-icon" style={{ color: format === opt.value ? 'var(--primary)' : opt.color }} />
                      <span className="radio-label">{opt.label}</span>
                      <span className="radio-desc">{opt.desc}</span>
                      {format === opt.value && <CheckCircle2 size={14} className="radio-check" />}
                    </div>
                  ))}
                </div>
              </div>

              {format === "pdf" && (
                <div>
                  <label className="section-label">Page Size</label>
                  <div className="radio-grid-2">
                    {[
                      { value: "letter", label: "Letter", desc: "8.5 × 11 in" },
                      { value: "a4", label: "A4", desc: "210 × 297 mm" },
                    ].map((opt) => (
                      <div
                        key={opt.value}
                        className={\`radio-card \${pageSize === opt.value ? 'active' : ''}\`}
                        onClick={() => setPageSize(opt.value)}
                        style={{ padding: '12px' }}
                      >
                        <span className="radio-label">{opt.label}</span>
                        <span className="radio-desc">{opt.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="info-banner">
                {format === "pdf"
                  ? "📄 High-quality PDF with professional formatting preserved. Best for email applications."
                  : format === "docx"
                  ? "📝 DOCX is the best format for ATS systems and recruiters. Fully editable in Word/Google Docs."
                  : "📋 Plain text format is ideal for copy-pasting into online application forms."}
              </div>
            </div>

            <div className="dialog-footer">
              <button className="btn btn-sm btn-outline" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-sm btn-premium" onClick={handleExport} disabled={isExporting}>
                {isExporting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
                {isExporting ? "Exporting..." : \`Download \${formatLabel}\`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
