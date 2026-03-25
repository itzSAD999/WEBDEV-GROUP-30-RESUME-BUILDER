import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Loader2,
  FileUp,
  X,
  AlertCircle,
  ChevronDown,
  GraduationCap,
  Briefcase,
  Award,
  FolderOpen,
  Users,
  Heart,
  Star,
  Shield,
  User,
  BookOpen,
  Wrench
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ResumeData, Education, WorkExperience } from "@/types/resume";
import { extractTextFromFile, parseResumeText } from "@/lib/documentParser";

interface CVUploadDialogProps {
  onDataExtracted: (data: Partial<ResumeData>) => void;
  trigger?: React.ReactNode;
}

interface ExtractedSection {
  name: string;
  confidence: "high" | "medium" | "low";
  data: any;
  verified: boolean;
}

export const CVUploadDialog = ({ onDataExtracted, trigger }: CVUploadDialogProps) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<"upload" | "processing" | "review">("upload");
  const [extractedSections, setExtractedSections] = useState<ExtractedSection[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const extractDataFromFile = async (file: File): Promise<Partial<ResumeData>> => {
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
        })) as Education[],
        workExperience: parsed.workExperience as WorkExperience[],
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
      const sections: ExtractedSection[] = [];
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
    const data: Partial<ResumeData> = {};
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

  const toggleSection = (index: number) => {
    setExtractedSections(prev => prev.map((s, i) => i === index ? { ...s, verified: !s.verified } : s));
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "high": return <Badge className="bg-green-500/10 text-green-700 text-xs">High</Badge>;
      case "medium": return <Badge className="bg-amber-500/10 text-amber-700 text-xs">Medium</Badge>;
      default: return <Badge className="bg-red-500/10 text-red-700 text-xs">Low</Badge>;
    }
  };

  const getSectionIcon = (name: string) => {
    const iconClass = "w-4 h-4 text-muted-foreground";
    switch (name) {
      case "Personal Info": return <User className={iconClass} />;
      case "Profile Summary": return <BookOpen className={iconClass} />;
      case "Education": return <GraduationCap className={iconClass} />;
      case "Work Experience": return <Briefcase className={iconClass} />;
      case "Skills": return <Wrench className={iconClass} />;
      case "Leadership": return <Shield className={iconClass} />;
      case "Certifications": return <Award className={iconClass} />;
      case "Awards": return <Star className={iconClass} />;
      case "Projects": return <FolderOpen className={iconClass} />;
      case "Volunteering": return <Heart className={iconClass} />;
      case "Interests": return <Star className={iconClass} />;
      case "References": return <Users className={iconClass} />;
      default: return <FileText className={iconClass} />;
    }
  };

  const getSectionCount = (section: ExtractedSection) => {
    if (typeof section.data === "string") return "";
    if (Array.isArray(section.data)) return `(${section.data.length})`;
    return "";
  };

  const renderSectionPreview = (section: ExtractedSection) => {
    const data = section.data;
    switch (section.name) {
      case "Personal Info":
        return (
          <div className="space-y-1 text-xs">
            {data.fullName && <p><span className="font-medium text-foreground">Name:</span> {data.fullName}</p>}
            {data.jobTitle && <p><span className="font-medium text-foreground">Title:</span> {data.jobTitle}</p>}
            {data.email && <p><span className="font-medium text-foreground">Email:</span> {data.email}</p>}
            {data.phone && <p><span className="font-medium text-foreground">Phone:</span> {data.phone}</p>}
            {data.linkedin && <p><span className="font-medium text-foreground">LinkedIn:</span> {data.linkedin}</p>}
          </div>
        );
      case "Profile Summary":
        return <p className="text-xs text-muted-foreground leading-relaxed">{data}</p>;
      case "Education":
        return (
          <div className="space-y-2">
            {data.map((edu: any) => (
              <div key={edu.id} className="text-xs border-l-2 border-primary/30 pl-2">
                <p className="font-medium text-foreground">{edu.degree || "Degree not specified"}</p>
                <p className="text-muted-foreground">{[edu.institution, edu.location].filter(Boolean).join(", ")}</p>
                {(edu.startDate || edu.endDate) && (
                  <p className="text-muted-foreground">{edu.startDate}{edu.endDate ? ` — ${edu.endDate}` : ""}</p>
                )}
                {edu.gpa && <p className="text-muted-foreground">GPA: {edu.gpa}</p>}
              </div>
            ))}
          </div>
        );
      case "Work Experience":
        return (
          <div className="space-y-2">
            {data.map((work: any) => (
              <div key={work.id} className="text-xs border-l-2 border-primary/30 pl-2">
                <p className="font-medium text-foreground">{work.title}</p>
                <p className="text-muted-foreground">{[work.company, work.location].filter(Boolean).join(", ")}</p>
                {(work.startDate || work.endDate) && (
                  <p className="text-muted-foreground">{work.startDate}{work.current ? " — Present" : work.endDate ? ` — ${work.endDate}` : ""}</p>
                )}
                {work.responsibilities?.length > 0 && (
                  <ul className="mt-1 space-y-0.5 text-muted-foreground">
                    {work.responsibilities.slice(0, 2).map((r: string, i: number) => (
                      <li key={i} className="flex gap-1"><span>•</span><span className="line-clamp-1">{r}</span></li>
                    ))}
                    {work.responsibilities.length > 2 && <li className="text-muted-foreground/60">+{work.responsibilities.length - 2} more...</li>}
                  </ul>
                )}
              </div>
            ))}
          </div>
        );
      case "Skills":
        return (
          <div className="flex flex-wrap gap-1">
            {data.slice(0, 15).map((skill: string, i: number) => (
              <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">{skill}</Badge>
            ))}
            {data.length > 15 && <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{data.length - 15} more</Badge>}
          </div>
        );
      case "Leadership":
        return (
          <div className="space-y-2">
            {data.map((lead: any) => (
              <div key={lead.id} className="text-xs border-l-2 border-primary/30 pl-2">
                <p className="font-medium text-foreground">{lead.title}</p>
                <p className="text-muted-foreground">{lead.organization}</p>
                {(lead.startDate || lead.endDate) && (
                  <p className="text-muted-foreground">{lead.startDate}{lead.current ? " — Present" : lead.endDate ? ` — ${lead.endDate}` : ""}</p>
                )}
              </div>
            ))}
          </div>
        );
      case "Certifications":
        return (
          <div className="space-y-1">
            {data.map((cert: any) => (
              <div key={cert.id} className="text-xs flex items-center gap-2">
                <span className="font-medium text-foreground">{cert.name}</span>
                {cert.issuer && <span className="text-muted-foreground">— {cert.issuer}</span>}
                {cert.date && <span className="text-muted-foreground/60">{cert.date}</span>}
              </div>
            ))}
          </div>
        );
      case "Awards":
        return (
          <div className="space-y-1">
            {data.map((award: any) => (
              <div key={award.id} className="text-xs flex items-center gap-2">
                <span className="font-medium text-foreground">{award.title}</span>
                {award.organization && <span className="text-muted-foreground">— {award.organization}</span>}
                {award.date && <span className="text-muted-foreground/60">{award.date}</span>}
              </div>
            ))}
          </div>
        );
      case "Projects":
        return (
          <div className="space-y-2">
            {data.map((proj: any) => (
              <div key={proj.id} className="text-xs border-l-2 border-primary/30 pl-2">
                <p className="font-medium text-foreground">{proj.title || proj.name}</p>
                {proj.role && <p className="text-muted-foreground italic">{proj.role}</p>}
                {proj.technologies && <p className="text-muted-foreground">Tech: {proj.technologies}</p>}
                {(proj.description?.length > 0 || proj.bullets?.length > 0) && (
                  <ul className="mt-1 space-y-0.5 text-muted-foreground">
                    {(proj.description || proj.bullets || []).slice(0, 2).map((d: string, i: number) => (
                      <li key={i} className="flex gap-1"><span>•</span><span className="line-clamp-1">{d}</span></li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        );
      case "Volunteering":
        return (
          <div className="space-y-2">
            {data.map((vol: any) => (
              <div key={vol.id} className="text-xs border-l-2 border-primary/30 pl-2">
                <p className="font-medium text-foreground">{vol.title || vol.role}</p>
                <p className="text-muted-foreground">{[vol.organization, vol.location].filter(Boolean).join(", ")}</p>
                {(vol.startDate || vol.endDate) && (
                  <p className="text-muted-foreground">{vol.startDate}{vol.endDate ? ` — ${vol.endDate}` : ""}</p>
                )}
              </div>
            ))}
          </div>
        );
      case "Interests":
        return (
          <div className="flex flex-wrap gap-1">
            {data.map((interest: string, i: number) => (
              <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">{interest}</Badge>
            ))}
          </div>
        );
      case "References":
        return (
          <div className="space-y-2">
            {data.map((ref: any) => (
              <div key={ref.id} className="text-xs border-l-2 border-primary/30 pl-2">
                <p className="font-medium text-foreground">{ref.name}</p>
                {ref.title && <p className="text-muted-foreground">{ref.title}</p>}
                {ref.organization && <p className="text-muted-foreground">{ref.organization}</p>}
                {ref.email && <p className="text-muted-foreground">{ref.email}</p>}
              </div>
            ))}
          </div>
        );
      default:
        return <p className="text-xs text-muted-foreground">Data extracted</p>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Upload CV
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="w-5 h-5 text-primary" />
            {step === "upload" && "Upload Your CV"}
            {step === "processing" && "Processing..."}
            {step === "review" && "Review Extracted Data"}
          </DialogTitle>
          <DialogDescription>
            {step === "upload" && "Upload an existing CV and we'll extract the content automatically."}
            {step === "processing" && "Analyzing your document..."}
            {step === "review" && "Verify the extracted information before importing."}
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4 py-4">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                file ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" onChange={handleFileSelect} className="hidden" />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">Drop your CV here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">Supports PDF, DOCX, and TXT files (max 5MB)</p>
                </>
              )}
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> We use algorithmic extraction to parse your document. 
                No AI is used to generate or modify your content — only to extract what's already there.
              </p>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="py-8 text-center">
            <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
            <Progress value={progress} className="h-2 mb-2" />
            <p className="text-sm text-muted-foreground">
              {progress < 30 && "Reading document..."}
              {progress >= 30 && progress < 60 && "Extracting sections..."}
              {progress >= 60 && progress < 90 && "Mapping fields..."}
              {progress >= 90 && "Almost done..."}
            </p>
          </div>
        )}

        {step === "review" && (
          <div className="py-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {extractedSections.map((section, idx) => (
                  <Collapsible key={idx} defaultOpen={idx < 3}>
                    <div
                      className={`rounded-lg border transition-all ${
                        section.verified 
                          ? "bg-card border-border" 
                          : "bg-muted/30 border-muted opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleSection(idx)}
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                              section.verified 
                                ? "bg-primary border-primary text-primary-foreground" 
                                : "border-border"
                            }`}
                          >
                            {section.verified && <CheckCircle2 className="w-3 h-3" />}
                          </button>
                          {getSectionIcon(section.name)}
                          <span className="font-medium text-sm">{section.name}</span>
                          <span className="text-xs text-muted-foreground">{getSectionCount(section)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getConfidenceBadge(section.confidence)}
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <ChevronDown className="h-3 w-3 transition-transform" />
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                      <CollapsibleContent>
                        <div className="px-3 pb-3 ml-7 border-t border-border/50 pt-2">
                          {renderSectionPreview(section)}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            </ScrollArea>

            {extractedSections.some(s => s.confidence === "low") && (
              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <p className="text-xs text-amber-700">Some sections have low confidence. Review carefully after import.</p>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === "upload" && (
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={processFile} disabled={!file}>
                <FileUp className="w-4 h-4 mr-2" />
                Process File
              </Button>
            </>
          )}
          {step === "review" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>Back</Button>
              <Button onClick={handleConfirm} disabled={!extractedSections.some(s => s.verified)}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Import Selected
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
