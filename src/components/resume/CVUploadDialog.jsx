import { useState, useRef } from "react";
import {
  Upload, FileText, CheckCircle2, Loader2, FileUp, X, AlertCircle,
  ChevronDown, GraduationCap, Briefcase, Award, FolderOpen, Users,
  Heart, Star, Shield, User, BookOpen, Wrench
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromFile, parseResumeText } from "@/lib/documentParser";

const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599; --danger: #f87171;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px; --primary: #4f8ef7;
  }

  .dialog-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center;
    z-index: 50; padding: 16px; backdrop-filter: blur(4px); font-family: var(--font);
  }

  .dialog-content {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); width: 100%; max-width: 500px; max-height: 90vh;
    display: flex; flex-direction: column; overflow: hidden; color: var(--text);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  }

  .dialog-header { padding: 20px 24px; border-bottom: 1px solid var(--border); }
  .dialog-title { font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .dialog-desc { font-size: 13.5px; color: var(--text-muted); }

  .dialog-body { padding: 24px; overflow-y: auto; flex: 1; }
  .dialog-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 8px; background: rgba(31, 36, 53, 0.5); }

  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 8px 16px; border-radius: var(--r-sm);
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: all 0.2s; border: none; font-family: var(--font);
  }
  .btn-primary { background: var(--text); color: var(--bg); }
  .btn-primary:hover { opacity: 0.9; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-outline { border: 1px solid var(--border); background: transparent; color: var(--text); }
  .btn-outline:hover { background: var(--surface2); }
  .btn-ghost { background: transparent; color: var(--text); padding: 4px; }
  .btn-ghost:hover { background: var(--surface2); border-radius: var(--r-sm); }

  .upload-area {
    border: 2px dashed var(--border); border-radius: var(--r); padding: 32px;
    text-align: center; cursor: pointer; transition: all 0.2s; margin-bottom: 16px;
  }
  .upload-area:hover { border-color: rgba(79, 142, 247, 0.5); }
  .upload-area.has-file { border-color: var(--primary); background: rgba(79, 142, 247, 0.05); }

  .file-info { display: flex; align-items: center; justify-content: center; gap: 12px; }
  .file-name { font-size: 13.5px; font-weight: 500; text-align: left; }
  .file-size { font-size: 11.5px; color: var(--text-muted); text-align: left; }

  .note-box {
    background: rgba(31, 36, 53, 0.5); border-radius: var(--r-sm); padding: 12px;
    font-size: 11.5px; color: var(--text-muted); line-height: 1.5;
  }

  .processing-view { display: flex; flex-direction: column; align-items: center; padding: 32px 0; }
  .progress-bg { width: 100%; height: 8px; background: var(--surface2); border-radius: 4px; margin: 16px 0 8px; overflow: hidden; }
  .progress-fill { height: 100%; background: var(--primary); transition: width 0.3s; }
  .processing-text { font-size: 13.5px; color: var(--text-muted); }

  .review-list { display: flex; flex-direction: column; gap: 8px; }
  .review-item {
    border: 1px solid var(--border); border-radius: var(--r-sm); overflow: hidden;
    transition: all 0.2s; background: var(--surface);
  }
  .review-item.unverified { background: rgba(31, 36, 53, 0.3); border-color: rgba(42, 48, 72, 0.5); opacity: 0.7; }

  .review-header {
    display: flex; items-center: center; justify-content: space-between;
    padding: 12px; cursor: pointer;
  }
  .review-header-left { display: flex; align-items: center; gap: 8px; }
  .review-header-right { display: flex; align-items: center; gap: 8px; }
  
  .checkbox {
    width: 20px; height: 20px; border-radius: 4px; border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    background: transparent; color: transparent;
  }
  .checkbox.checked { background: var(--primary); border-color: var(--primary); color: #fff; }

  .badge {
    display: inline-flex; align-items: center; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;
  }
  .badge-high { background: rgba(74, 222, 128, 0.1); color: #4ade80; }
  .badge-medium { background: rgba(251, 191, 36, 0.1); color: #fbbf24; }
  .badge-low { background: rgba(248, 113, 113, 0.1); color: #f87171; }
  
  .review-content { padding: 0 12px 12px 36px; border-top: 1px solid rgba(42, 48, 72, 0.5); margin-top: 8px; padding-top: 8px; }

  .low-conf-alert {
    display: flex; align-items: flex-start; gap: 8px; padding: 12px; margin-top: 16px;
    background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2);
    border-radius: var(--r-sm);
  }
  .low-conf-text { font-size: 11.5px; color: #d97706; }
\`;

export const CVUploadDialog = ({ onDataExtracted, trigger }) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("upload");
  const [extractedSections, setExtractedSections] = useState([]);
  const [expandedSections, setExpandedSections] = useState(new Set([0, 1, 2]));
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
      ];
      if (!validTypes.includes(selectedFile.type)) {
        toast({ title: "Invalid file type", description: "Please upload a PDF, DOCX, or TXT file", variant: "destructive" });
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Maximum file size is 5MB", variant: "destructive" });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleDragOver = (e) => { e.preventDefault(); };

  const extractDataFromFile = async (file) => {
    try {
      const rawText = await extractTextFromFile(file);
      const parsed = parseResumeText(rawText);
      return {
        personalInfo: {
          fullName: parsed.personalInfo.fullName, jobTitle: parsed.personalInfo.jobTitle,
          email: parsed.personalInfo.email, phone: parsed.personalInfo.phone,
          linkedin: parsed.personalInfo.linkedin, portfolio: parsed.personalInfo.portfolio
        },
        profile: parsed.profile,
        education: parsed.education.map(edu => ({
          id: edu.id, degree: edu.degree, institution: edu.institution, location: edu.location,
          startDate: edu.startDate, endDate: edu.endDate, gpa: edu.gpa, coursework: edu.coursework || '', bullets: edu.bullets,
        })),
        workExperience: parsed.workExperience,
        technicalSkills: parsed.skills,
        softSkills: [],
        interests: parsed.interests || [],
        projects: parsed.projects.map(p => ({
          id: p.id, title: p.name, startDate: p.startDate || "", endDate: p.endDate || "",
          role: p.role || "", technologies: p.technologies,
          description: p.bullets.length > 0 ? p.bullets : (p.description ? [p.description] : [])
        })),
        volunteering: parsed.volunteering.map(v => ({
          id: v.id, title: v.role, organization: v.organization, location: v.location,
          startDate: v.startDate, endDate: v.endDate, current: false,
          responsibilities: v.bullets.length > 0 ? v.bullets : (v.description ? [v.description] : [])
        })),
        certifications: parsed.certifications?.map(cert => ({ id: cert.id, name: cert.name, date: cert.date, issuer: cert.issuer })) || [],
        achievements: parsed.awardsAndRecognition?.map(award => ({ id: award.id, title: award.title, date: award.date, organization: award.organization })) || [],
        leadership: parsed.leadershipExperience?.map(lead => ({
          id: lead.id, title: lead.title, organization: lead.organization,
          startDate: lead.startDate, endDate: lead.endDate, current: lead.current, responsibilities: lead.responsibilities,
        })) || [],
        references: parsed.references?.map(ref => ({
          id: ref.id, name: ref.name, title: ref.title, organization: ref.organization,
          email: ref.email, phone: ref.phone, relationship: ref.relationship,
        })) || [],
        customSections: [], skillCategories: [], sectionOrder: []
      };
    } catch (error) {
      console.error("Error parsing file:", error);
      throw error;
    }
  };

  const processFile = async () => {
    if (!file) return;
    setStep("processing"); setIsProcessing(true); setProgress(0);
    const progressInterval = setInterval(() => { setProgress(p => Math.min(p + 10, 90)); }, 200);
    try {
      const data = await extractDataFromFile(file);
      clearInterval(progressInterval);
      setProgress(100);
      const sections = [];
      if (data.personalInfo?.fullName || data.personalInfo?.email) {
        sections.push({ name: "Personal Info", confidence: data.personalInfo.fullName ? "high" : "medium", data: data.personalInfo, verified: true });
      }
      if (data.profile) sections.push({ name: "Profile Summary", confidence: "high", data: data.profile, verified: true });
      if (data.education && data.education.length > 0) sections.push({ name: "Education", confidence: "high", data: data.education, verified: true });
      if (data.workExperience && data.workExperience.length > 0) sections.push({ name: "Work Experience", confidence: "high", data: data.workExperience, verified: true });
      if (data.technicalSkills && data.technicalSkills.length > 0) sections.push({ name: "Skills", confidence: "medium", data: data.technicalSkills, verified: true });
      if (data.leadership && data.leadership.length > 0) sections.push({ name: "Leadership", confidence: "high", data: data.leadership, verified: true });
      if (data.certifications && data.certifications.length > 0) sections.push({ name: "Certifications", confidence: "medium", data: data.certifications, verified: true });
      if (data.achievements && data.achievements.length > 0) sections.push({ name: "Awards", confidence: "medium", data: data.achievements, verified: true });
      if (data.projects && data.projects.length > 0) sections.push({ name: "Projects", confidence: "high", data: data.projects, verified: true });
      if (data.volunteering && data.volunteering.length > 0) sections.push({ name: "Volunteering", confidence: "high", data: data.volunteering, verified: true });
      if (data.interests && data.interests.length > 0) sections.push({ name: "Interests", confidence: "medium", data: data.interests, verified: true });
      if (data.references && data.references.length > 0) sections.push({ name: "References", confidence: "medium", data: data.references, verified: true });
      setExtractedSections(sections);
      setTimeout(() => { setStep("review"); setIsProcessing(false); }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      toast({ title: "Extraction failed", description: "Could not parse the document. Please try a different file.", variant: "destructive" });
      setStep("upload"); setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    const verifiedSections = extractedSections.filter(s => s.verified);
    const data = {};
    verifiedSections.forEach(section => {
      switch (section.name) {
        case "Personal Info": data.personalInfo = section.data; break;
        case "Profile Summary": data.profile = section.data; break;
        case "Education": data.education = section.data; break;
        case "Work Experience": data.workExperience = section.data; break;
        case "Skills": data.technicalSkills = section.data; break;
        case "Leadership": data.leadership = section.data; break;
        case "Certifications": data.certifications = section.data; break;
        case "Awards": data.achievements = section.data; break;
        case "Projects": data.projects = section.data; break;
        case "Volunteering": data.volunteering = section.data; break;
        case "Interests": data.interests = section.data; break;
        case "References": data.references = section.data; break;
      }
    });
    onDataExtracted(data);
    toast({ title: "CV Imported Successfully", description: "Your data has been extracted and loaded. Review and edit as needed." });
    setOpen(false); setFile(null); setStep("upload"); setExtractedSections([]); setProgress(0);
  };

  const toggleSection = (index, e) => {
    e.stopPropagation();
    setExtractedSections(prev => prev.map((s, i) => i === index ? { ...s, verified: !s.verified } : s));
  };
  
  const toggleExpand = (index, e) => {
    e.stopPropagation();
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const getSectionIcon = (name) => {
    const s = { width: 16, height: 16, color: 'var(--text-muted)' };
    switch (name) {
      case "Personal Info": return <User {...s} />;
      case "Profile Summary": return <BookOpen {...s} />;
      case "Education": return <GraduationCap {...s} />;
      case "Work Experience": return <Briefcase {...s} />;
      case "Skills": return <Wrench {...s} />;
      case "Leadership": return <Shield {...s} />;
      case "Certifications": return <Award {...s} />;
      case "Awards": return <Star {...s} />;
      case "Projects": return <FolderOpen {...s} />;
      case "Volunteering": return <Heart {...s} />;
      case "Interests": return <Star {...s} />;
      case "References": return <Users {...s} />;
      default: return <FileText {...s} />;
    }
  };

  const getSectionCount = (section) => {
    if (typeof section.data === "string") return "";
    if (Array.isArray(section.data)) return \`(\${section.data.length})\`;
    return "";
  };

  const renderSectionPreview = (section) => {
    const data = section.data;
    switch (section.name) {
      case "Personal Info":
        return (
          <div style={{ fontSize: '11.5px' }}>
            {data.fullName && <div><span style={{ fontWeight: 500, color: '#fff' }}>Name:</span> {data.fullName}</div>}
            {data.jobTitle && <div><span style={{ fontWeight: 500, color: '#fff' }}>Title:</span> {data.jobTitle}</div>}
            {data.email && <div><span style={{ fontWeight: 500, color: '#fff' }}>Email:</span> {data.email}</div>}
            {data.phone && <div><span style={{ fontWeight: 500, color: '#fff' }}>Phone:</span> {data.phone}</div>}
            {data.linkedin && <div><span style={{ fontWeight: 500, color: '#fff' }}>LinkedIn:</span> {data.linkedin}</div>}
          </div>
        );
      case "Profile Summary":
        return <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{data}</p>;
      case "Education":
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.map((edu) => (
              <div key={edu.id} style={{ fontSize: '11.5px', borderLeft: '2px solid rgba(79, 142, 247, 0.3)', paddingLeft: '8px' }}>
                <div style={{ fontWeight: 500, color: '#fff' }}>{edu.degree || "Degree not specified"}</div>
                <div style={{ color: 'var(--text-muted)' }}>{[edu.institution, edu.location].filter(Boolean).join(", ")}</div>
                {(edu.startDate || edu.endDate) && (
                  <div style={{ color: 'var(--text-muted)' }}>{edu.startDate}{edu.endDate ? \` — \${edu.endDate}\` : ""}</div>
                )}
                {edu.gpa && <div style={{ color: 'var(--text-muted)' }}>GPA: {edu.gpa}</div>}
              </div>
            ))}
          </div>
        );
      case "Work Experience":
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.map((work) => (
              <div key={work.id} style={{ fontSize: '11.5px', borderLeft: '2px solid rgba(79, 142, 247, 0.3)', paddingLeft: '8px' }}>
                <div style={{ fontWeight: 500, color: '#fff' }}>{work.title}</div>
                <div style={{ color: 'var(--text-muted)' }}>{[work.company, work.location].filter(Boolean).join(", ")}</div>
                {(work.startDate || work.endDate) && (
                  <div style={{ color: 'var(--text-muted)' }}>{work.startDate}{work.current ? " — Present" : work.endDate ? \` — \${work.endDate}\` : ""}</div>
                )}
                {work.responsibilities?.length > 0 && (
                  <ul style={{ listStyle: 'none', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {work.responsibilities.slice(0, 2).map((r, i) => (
                      <li key={i} style={{ display: 'flex', gap: '4px' }}><span>•</span><span style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{r}</span></li>
                    ))}
                    {work.responsibilities.length > 2 && <li style={{ opacity: 0.6 }}>+\${work.responsibilities.length - 2} more...</li>}
                  </ul>
                )}
              </div>
            ))}
          </div>
        );
      case "Skills":
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {data.slice(0, 15).map((skill, i) => (
              <span key={i} style={{ fontSize: '10px', padding: '2px 6px', background: 'var(--surface2)', borderRadius: '4px' }}>{skill}</span>
            ))}
            {data.length > 15 && <span style={{ fontSize: '10px', padding: '2px 6px', border: '1px solid var(--border)', borderRadius: '4px' }}>+{data.length - 15} more</span>}
          </div>
        );
      case "Leadership":
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.map((lead) => (
              <div key={lead.id} style={{ fontSize: '11.5px', borderLeft: '2px solid rgba(79, 142, 247, 0.3)', paddingLeft: '8px' }}>
                <div style={{ fontWeight: 500, color: '#fff' }}>{lead.title}</div>
                <div style={{ color: 'var(--text-muted)' }}>{lead.organization}</div>
                {(lead.startDate || lead.endDate) && (
                  <div style={{ color: 'var(--text-muted)' }}>{lead.startDate}{lead.current ? " — Present" : lead.endDate ? \` — \${lead.endDate}\` : ""}</div>
                )}
              </div>
            ))}
          </div>
        );
      case "Certifications":
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {data.map((cert) => (
              <div key={cert.id} style={{ fontSize: '11.5px', display: 'flex', gap: '8px' }}>
                <span style={{ fontWeight: 500, color: '#fff' }}>{cert.name}</span>
                {cert.issuer && <span style={{ color: 'var(--text-muted)' }}>— {cert.issuer}</span>}
                {cert.date && <span style={{ color: 'var(--text-muted)', opacity: 0.6 }}>{cert.date}</span>}
              </div>
            ))}
          </div>
        );
      case "Awards":
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {data.map((award) => (
              <div key={award.id} style={{ fontSize: '11.5px', display: 'flex', gap: '8px' }}>
                <span style={{ fontWeight: 500, color: '#fff' }}>{award.title}</span>
                {award.organization && <span style={{ color: 'var(--text-muted)' }}>— {award.organization}</span>}
                {award.date && <span style={{ color: 'var(--text-muted)', opacity: 0.6 }}>{award.date}</span>}
              </div>
            ))}
          </div>
        );
      case "Projects":
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.map((proj) => (
              <div key={proj.id} style={{ fontSize: '11.5px', borderLeft: '2px solid rgba(79, 142, 247, 0.3)', paddingLeft: '8px' }}>
                <div style={{ fontWeight: 500, color: '#fff' }}>{proj.title || proj.name}</div>
                {proj.role && <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{proj.role}</div>}
                {proj.technologies && <div style={{ color: 'var(--text-muted)' }}>Tech: {proj.technologies}</div>}
                {(proj.description?.length > 0 || proj.bullets?.length > 0) && (
                  <ul style={{ listStyle: 'none', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {(proj.description || proj.bullets || []).slice(0, 2).map((d, i) => (
                      <li key={i} style={{ display: 'flex', gap: '4px' }}><span>•</span><span style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{d}</span></li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        );
      case "Volunteering":
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.map((vol) => (
              <div key={vol.id} style={{ fontSize: '11.5px', borderLeft: '2px solid rgba(79, 142, 247, 0.3)', paddingLeft: '8px' }}>
                <div style={{ fontWeight: 500, color: '#fff' }}>{vol.title || vol.role}</div>
                <div style={{ color: 'var(--text-muted)' }}>{[vol.organization, vol.location].filter(Boolean).join(", ")}</div>
                {(vol.startDate || vol.endDate) && (
                  <div style={{ color: 'var(--text-muted)' }}>{vol.startDate}{vol.endDate ? \` — \${vol.endDate}\` : ""}</div>
                )}
              </div>
            ))}
          </div>
        );
      case "Interests":
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {data.map((interest, i) => (
              <span key={i} style={{ fontSize: '10px', padding: '2px 6px', background: 'var(--surface2)', borderRadius: '4px' }}>{interest}</span>
            ))}
          </div>
        );
      case "References":
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.map((ref) => (
              <div key={ref.id} style={{ fontSize: '11.5px', borderLeft: '2px solid rgba(79, 142, 247, 0.3)', paddingLeft: '8px' }}>
                <div style={{ fontWeight: 500, color: '#fff' }}>{ref.name}</div>
                {ref.title && <div style={{ color: 'var(--text-muted)' }}>{ref.title}</div>}
                {ref.organization && <div style={{ color: 'var(--text-muted)' }}>{ref.organization}</div>}
                {ref.email && <div style={{ color: 'var(--text-muted)' }}>{ref.email}</div>}
              </div>
            ))}
          </div>
        );
      default:
        return <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Data extracted</p>;
    }
  };

  return (
    <>
      <style>{styles}</style>
      
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <button className="btn btn-outline" onClick={() => setOpen(true)}>
          <Upload size={16} /> Upload CV
        </button>
      )}

      {open && (
        <div className="dialog-overlay" onClick={() => setOpen(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">
                <FileUp size={20} className="text-primary" />
                {step === "upload" && "Upload Your CV"}
                {step === "processing" && "Processing..."}
                {step === "review" && "Review Extracted Data"}
              </h2>
              <p className="dialog-desc">
                {step === "upload" && "Upload an existing CV and we'll extract the content automatically."}
                {step === "processing" && "Analyzing your document..."}
                {step === "review" && "Verify the extracted information before importing."}
              </p>
            </div>

            <div className="dialog-body">
              {step === "upload" && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div
                    className={\`upload-area \${file ? 'has-file' : ''}\`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" onChange={handleFileSelect} style={{ display: 'none' }} />
                    {file ? (
                      <div className="file-info">
                        <FileText size={32} className="text-primary" />
                        <div>
                          <div className="file-name">{file.name}</div>
                          <div className="file-size">{(file.size / 1024).toFixed(1)} KB</div>
                        </div>
                        <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={40} style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
                        <div style={{ fontSize: '13.5px', fontWeight: 500 }}>Drop your CV here or click to browse</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>Supports PDF, DOCX, and TXT files (max 5MB)</div>
                      </>
                    )}
                  </div>
                  <div className="note-box">
                    <strong>Note:</strong> We use algorithmic extraction to parse your document. 
                    No AI is used to generate or modify your content — only to extract what's already there.
                  </div>
                </div>
              )}

              {step === "processing" && (
                <div className="processing-view">
                  <Loader2 size={48} className="text-primary" style={{ animation: 'spin 1s linear infinite' }} />
                  <div className="progress-bg">
                    <div className="progress-fill" style={{ width: \`\${progress}%\` }} />
                  </div>
                  <div className="processing-text">
                    {progress < 30 && "Reading document..."}
                    {progress >= 30 && progress < 60 && "Extracting sections..."}
                    {progress >= 60 && progress < 90 && "Mapping fields..."}
                    {progress >= 90 && "Almost done..."}
                  </div>
                </div>
              )}

              {step === "review" && (
                <div>
                  <div className="review-list">
                    {extractedSections.map((section, idx) => {
                      const isExpanded = expandedSections.has(idx);
                      return (
                        <div key={idx} className={\`review-item \${section.verified ? '' : 'unverified'}\`}>
                          <div className="review-header" onClick={(e) => toggleExpand(idx, e)}>
                            <div className="review-header-left">
                              <button 
                                className={\`checkbox \${section.verified ? 'checked' : ''}\`}
                                onClick={(e) => toggleSection(idx, e)}
                              >
                                {section.verified && <CheckCircle2 size={12} />}
                              </button>
                              {getSectionIcon(section.name)}
                              <span style={{ fontSize: '13.5px', fontWeight: 500 }}>{section.name}</span>
                              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{getSectionCount(section)}</span>
                            </div>
                            <div className="review-header-right">
                              <span className={\`badge badge-\${section.confidence}\`}>
                                {section.confidence.charAt(0).toUpperCase() + section.confidence.slice(1)}
                              </span>
                              <button className="btn-ghost" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                                <ChevronDown size={14} />
                              </button>
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="review-content">
                              {renderSectionPreview(section)}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {extractedSections.some(s => s.confidence === "low") && (
                    <div className="low-conf-alert">
                      <AlertCircle size={16} style={{ color: '#d97706', marginTop: '2px' }} />
                      <div className="low-conf-text">Some sections have low confidence. Review carefully after import.</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="dialog-footer">
              {step === "upload" && (
                <>
                  <button className="btn btn-outline" onClick={() => setOpen(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={processFile} disabled={!file}>
                    <FileUp size={16} /> Process File
                  </button>
                </>
              )}
              {step === "review" && (
                <>
                  <button className="btn btn-outline" onClick={() => setStep("upload")}>Back</button>
                  <button className="btn btn-primary" onClick={handleConfirm} disabled={!extractedSections.some(s => s.verified)}>
                    <CheckCircle2 size={16} /> Import Selected
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
