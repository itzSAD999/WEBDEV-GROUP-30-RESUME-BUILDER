import { useState } from "react";
import { FileText, Sparkles, CheckCircle2 } from "lucide-react";
import { parseResumeText } from "@/lib/documentParser";
import { toast } from "@/hooks/use-toast";

const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599; --primary: #4f8ef7;
    --success: #22c55e;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }

  .dialog-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center;
    z-index: 50; padding: 16px; backdrop-filter: blur(4px); font-family: var(--font);
  }

  .dialog-content {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); width: 100%; max-width: 600px; max-height: 90vh;
    display: flex; flex-direction: column; overflow: hidden; color: var(--text);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  }

  .dialog-header { padding: 20px 24px 12px; }
  .dialog-title { font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .dialog-desc { font-size: 13.5px; color: var(--text-muted); line-height: 1.5; }

  .dialog-body { padding: 12px 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; flex: 1; }

  .textarea {
    width: 100%; min-height: 300px; padding: 16px; border-radius: var(--r-sm);
    border: 1px solid var(--border); background: var(--surface2); color: var(--text);
    font-family: 'JetBrains Mono', monospace, var(--font); font-size: 13.5px; 
    resize: vertical; line-height: 1.5; outline: none; transition: border-color 0.2s;
  }
  .textarea:focus { border-color: var(--primary); }
  
  .success-banner { display: flex; align-items: center; gap: 8px; color: var(--success); font-weight: 500; font-size: 14px; }
  
  .data-grid { display: flex; flex-direction: column; gap: 12px; font-size: 13.5px; }
  .data-card { padding: 12px; background: var(--surface2); border-radius: var(--r-sm); border: 1px solid var(--border); }
  .data-label { font-weight: 600; margin-right: 4px; }

  .dialog-footer { padding: 16px 24px; display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid var(--border); }

  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 8px 16px; border-radius: var(--r-sm);
    font-size: 13.5px; font-weight: 500; cursor: pointer;
    transition: all 0.2s; border: none; font-family: var(--font);
  }
  .btn-sm { padding: 6px 12px; font-size: 12.5px; }
  .btn-primary { background: var(--text); color: var(--bg); }
  .btn-primary:hover { opacity: 0.9; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-outline { border: 1px solid var(--border); background: transparent; color: var(--text); }
  .btn-outline:hover { background: var(--surface2); }
\`;

export const TextPasteDialog = ({ onDataExtracted, trigger }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const handleExtract = async () => {
    if (!text.trim()) {
      toast({ title: "No text provided", description: "Please paste your resume content first.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      const parsed = parseResumeText(text);
      
      const resumeData = {
        personalInfo: {
          fullName: parsed.personalInfo.fullName,
          jobTitle: parsed.personalInfo.jobTitle,
          email: parsed.personalInfo.email,
          phone: parsed.personalInfo.phone,
          linkedin: parsed.personalInfo.linkedin,
          portfolio: parsed.personalInfo.portfolio,
        },
        profile: parsed.profile,
        education: parsed.education.map(edu => ({
          id: edu.id, degree: edu.degree, institution: edu.institution, location: edu.location,
          startDate: edu.startDate, endDate: edu.endDate, gpa: edu.gpa, bullets: edu.bullets,
        })),
        workExperience: parsed.workExperience.map(exp => ({
          id: exp.id, title: exp.title, company: exp.company, location: exp.location,
          startDate: exp.startDate, endDate: exp.endDate, current: exp.current, responsibilities: exp.responsibilities,
        })),
        technicalSkills: parsed.skills,
        interests: parsed.interests || [],
        projects: parsed.projects.map(proj => ({
          id: proj.id, title: proj.name, startDate: proj.startDate || "", endDate: proj.endDate || "",
          role: proj.role || "", technologies: proj.technologies, description: proj.bullets,
        })),
        volunteering: parsed.volunteering.map(vol => ({
          id: vol.id, title: vol.role, organization: vol.organization, location: vol.location,
          startDate: vol.startDate, endDate: vol.endDate, current: false, responsibilities: vol.bullets,
        })),
        certifications: parsed.certifications?.map(cert => ({
          id: cert.id, name: cert.name, date: cert.date, issuer: cert.issuer,
        })) || [],
        leadership: parsed.leadershipExperience?.map(lead => ({
          id: lead.id, title: lead.title, organization: lead.organization,
          startDate: lead.startDate, endDate: lead.endDate, current: lead.current, responsibilities: lead.responsibilities,
        })) || [],
        achievements: parsed.awardsAndRecognition?.map(award => ({
          id: award.id, title: award.title, date: award.date, organization: award.organization,
        })) || [],
        references: parsed.references?.map(ref => ({
          id: ref.id, name: ref.name, title: ref.title, organization: ref.organization,
          email: ref.email, phone: ref.phone, relationship: ref.relationship,
        })) || [],
      };

      setExtractedData(resumeData);
      toast({ title: "Text parsed successfully", description: "Review the extracted data and click Import to apply." });
    } catch (error) {
      console.error("Text parsing error:", error);
      toast({ title: "Parsing failed", description: "Could not parse the text. Please check the format and try again.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    if (extractedData) {
      onDataExtracted(extractedData);
      toast({ title: "Data imported", description: "Your resume data has been imported successfully." });
      setOpen(false); setText(""); setExtractedData(null);
    }
  };

  const handleClose = () => {
    setOpen(false); setText(""); setExtractedData(null);
  };

  return (
    <>
      <style>{styles}</style>
      
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <button className="btn btn-sm btn-outline" onClick={() => setOpen(true)}>
          <FileText size={16} /> Paste Text
        </button>
      )}

      {open && (
        <div className="dialog-overlay" onClick={handleClose}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title"><FileText size={20} className="text-primary"/> Paste Resume Text</h2>
              <p className="dialog-desc">Paste your resume content below and we'll automatically extract and categorize the information.</p>
            </div>

            <div className="dialog-body">
              {!extractedData ? (
                <textarea
                  className="textarea"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={\`Paste your resume text here...

Example:
John Smith
john.smith@email.com | +1 555-123-4567 | linkedin.com/in/johnsmith

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years...

EXPERIENCE
Senior Developer at Tech Corp
Jan 2020 - Present
• Led development of...
• Improved performance by 40%

EDUCATION
BSc Computer Science
University of Technology, 2019

SKILLS
JavaScript, React, Node.js, Python...\`}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="success-banner">
                    <CheckCircle2 size={20} />
                    Text parsed successfully!
                  </div>
                  
                  <div className="data-grid">
                    {extractedData.personalInfo?.fullName && (
                      <div className="data-card"><span className="data-label">Name:</span> {extractedData.personalInfo.fullName}</div>
                    )}
                    {extractedData.personalInfo?.email && (
                      <div className="data-card"><span className="data-label">Email:</span> {extractedData.personalInfo.email}</div>
                    )}
                    {extractedData.profile && (
                      <div className="data-card"><span className="data-label">Profile:</span> {extractedData.profile.substring(0, 100)}...</div>
                    )}
                    {extractedData.workExperience?.length > 0 && (
                      <div className="data-card"><span className="data-label">Experience:</span> {extractedData.workExperience.length} positions found</div>
                    )}
                    {extractedData.education?.length > 0 && (
                      <div className="data-card"><span className="data-label">Education:</span> {extractedData.education.length} entries found</div>
                    )}
                    {extractedData.technicalSkills?.length > 0 && (
                      <div className="data-card"><span className="data-label">Skills:</span> {extractedData.technicalSkills.slice(0, 5).join(", ")}
                        {extractedData.technicalSkills.length > 5 && \` +\${extractedData.technicalSkills.length - 5} more\`}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="dialog-footer">
              <button className="btn btn-outline" onClick={handleClose}>Cancel</button>
              {!extractedData ? (
                <button className="btn btn-primary" onClick={handleExtract} disabled={isProcessing || !text.trim()}>
                  {isProcessing ? <Sparkles size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={16} />}
                  {isProcessing ? "Processing..." : "Extract Data"}
                </button>
              ) : (
                <>
                  <button className="btn btn-outline" onClick={() => setExtractedData(null)}>Edit Text</button>
                  <button className="btn btn-primary" onClick={handleImport}>
                    <CheckCircle2 size={16} /> Import Data
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
