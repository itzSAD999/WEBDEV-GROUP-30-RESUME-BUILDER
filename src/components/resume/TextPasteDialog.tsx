import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Sparkles, CheckCircle2 } from "lucide-react";
import { ResumeData } from "@/types/resume";
import { parseResumeText } from "@/lib/documentParser";
import { toast } from "@/hooks/use-toast";

interface TextPasteDialogProps {
  onDataExtracted: (data: Partial<ResumeData>) => void;
  trigger?: React.ReactNode;
}

export const TextPasteDialog = ({ onDataExtracted, trigger }: TextPasteDialogProps) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<ResumeData> | null>(null);

  const handleExtract = async () => {
    if (!text.trim()) {
      toast({
        title: "No text provided",
        description: "Please paste your resume content first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Parse the text
      const parsed = parseResumeText(text);
      
      // Convert to ResumeData format
      const resumeData: Partial<ResumeData> = {
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
          id: edu.id,
          degree: edu.degree,
          institution: edu.institution,
          location: edu.location,
          startDate: edu.startDate,
          endDate: edu.endDate,
          gpa: edu.gpa,
          bullets: edu.bullets,
        })),
        workExperience: parsed.workExperience.map(exp => ({
          id: exp.id,
          title: exp.title,
          company: exp.company,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          current: exp.current,
          responsibilities: exp.responsibilities,
        })),
        technicalSkills: parsed.skills,
        interests: parsed.interests || [],
        projects: parsed.projects.map(proj => ({
          id: proj.id,
          title: proj.name,
          startDate: proj.startDate || "",
          endDate: proj.endDate || "",
          role: proj.role || "",
          technologies: proj.technologies,
          description: proj.bullets,
        })),
        volunteering: parsed.volunteering.map(vol => ({
          id: vol.id,
          title: vol.role,
          organization: vol.organization,
          location: vol.location,
          startDate: vol.startDate,
          endDate: vol.endDate,
          current: false,
          responsibilities: vol.bullets,
        })),
        certifications: parsed.certifications?.map(cert => ({
          id: cert.id,
          name: cert.name,
          date: cert.date,
          issuer: cert.issuer,
        })) || [],
        leadership: parsed.leadershipExperience?.map(lead => ({
          id: lead.id,
          title: lead.title,
          organization: lead.organization,
          startDate: lead.startDate,
          endDate: lead.endDate,
          current: lead.current,
          responsibilities: lead.responsibilities,
        })) || [],
        achievements: parsed.awardsAndRecognition?.map(award => ({
          id: award.id,
          title: award.title,
          date: award.date,
          organization: award.organization,
        })) || [],
        references: parsed.references?.map(ref => ({
          id: ref.id,
          name: ref.name,
          title: ref.title,
          organization: ref.organization,
          email: ref.email,
          phone: ref.phone,
          relationship: ref.relationship,
        })) || [],
      };

      setExtractedData(resumeData);
      
      toast({
        title: "Text parsed successfully",
        description: "Review the extracted data and click Import to apply.",
      });
    } catch (error) {
      console.error("Text parsing error:", error);
      toast({
        title: "Parsing failed",
        description: "Could not parse the text. Please check the format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    if (extractedData) {
      onDataExtracted(extractedData);
      toast({
        title: "Data imported",
        description: "Your resume data has been imported successfully.",
      });
      setOpen(false);
      setText("");
      setExtractedData(null);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setText("");
    setExtractedData(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => isOpen ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            Paste Text
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Paste Resume Text
          </DialogTitle>
          <DialogDescription>
            Paste your resume content below and we'll automatically extract and categorize the information.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4 py-4">
          {!extractedData ? (
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Paste your resume text here...

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
JavaScript, React, Node.js, Python...`}
              className="min-h-[300px] font-mono text-sm"
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Text parsed successfully!</span>
              </div>
              
              <div className="grid gap-3 text-sm">
                {extractedData.personalInfo?.fullName && (
                  <div className="p-3 bg-muted rounded-lg">
                    <span className="font-medium">Name:</span> {extractedData.personalInfo.fullName}
                  </div>
                )}
                {extractedData.personalInfo?.email && (
                  <div className="p-3 bg-muted rounded-lg">
                    <span className="font-medium">Email:</span> {extractedData.personalInfo.email}
                  </div>
                )}
                {extractedData.profile && (
                  <div className="p-3 bg-muted rounded-lg">
                    <span className="font-medium">Profile:</span> {extractedData.profile.substring(0, 100)}...
                  </div>
                )}
                {extractedData.workExperience && extractedData.workExperience.length > 0 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <span className="font-medium">Experience:</span> {extractedData.workExperience.length} positions found
                  </div>
                )}
                {extractedData.education && extractedData.education.length > 0 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <span className="font-medium">Education:</span> {extractedData.education.length} entries found
                  </div>
                )}
                {extractedData.technicalSkills && extractedData.technicalSkills.length > 0 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <span className="font-medium">Skills:</span> {extractedData.technicalSkills.slice(0, 5).join(", ")}
                    {extractedData.technicalSkills.length > 5 && ` +${extractedData.technicalSkills.length - 5} more`}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {!extractedData ? (
            <Button onClick={handleExtract} disabled={isProcessing || !text.trim()}>
              {isProcessing ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Extract Data
                </>
              )}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setExtractedData(null)}>
                Edit Text
              </Button>
              <Button onClick={handleImport}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
