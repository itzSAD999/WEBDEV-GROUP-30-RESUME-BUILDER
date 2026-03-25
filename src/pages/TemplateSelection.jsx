import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { templates, Template } from "@/types/templates";
import { templateComponents } from "@/components/resume/templates";
import { ResumeData } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";

const sampleData: ResumeData = {
  personalInfo: {
    fullName: "Sarah Johnson",
    jobTitle: "Senior Software Engineer",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 234-5678",
    linkedin: "linkedin.com/in/sarahjohnson",
    portfolio: "github.com/sarahjohnson",
  },
  profile:
    "Results-driven software engineer with 5+ years of experience building scalable web applications. Passionate about clean code, performance optimization, and mentoring junior developers. Led cross-functional teams to deliver products used by 2M+ users.",
  education: [
    {
      id: "edu1",
      institution: "Stanford University",
      degree: "M.S. Computer Science",
      location: "Stanford, CA",
      startDate: "Sep 2017",
      endDate: "Jun 2019",
      gpa: "3.9/4.0",
      bullets: [
        "Specialized in Distributed Systems and Machine Learning",
        "Teaching Assistant for CS 144: Introduction to Computer Networking",
      ],
    },
    {
      id: "edu2",
      institution: "University of California, Berkeley",
      degree: "B.S. Computer Science",
      location: "Berkeley, CA",
      startDate: "Aug 2013",
      endDate: "May 2017",
      gpa: "3.7/4.0",
      bullets: ["Dean's List — 6 semesters"],
    },
  ],
  workExperience: [
    {
      id: "work1",
      title: "Senior Software Engineer",
      company: "Google",
      location: "Mountain View, CA",
      startDate: "Jul 2021",
      endDate: "Present",
      current: true,
      responsibilities: [
        "Architected a real-time data pipeline processing 500K+ events/sec, reducing latency by 40%",
        "Led a team of 6 engineers to deliver a customer-facing dashboard used by 10K+ enterprise clients",
        "Mentored 4 junior engineers through structured code reviews and pair programming sessions",
      ],
    },
    {
      id: "work2",
      title: "Software Engineer",
      company: "Meta",
      location: "Menlo Park, CA",
      startDate: "Aug 2019",
      endDate: "Jun 2021",
      current: false,
      responsibilities: [
        "Built React components for the Ads Manager platform, serving 3M+ daily active advertisers",
        "Improved page load performance by 35% through code splitting and lazy loading strategies",
      ],
    },
  ],
  volunteering: [],
  achievements: [
    { id: "ach1", title: "Google Spot Bonus Award 2023", date: "2023", organization: "Google" },
  ],
  projects: [
    {
      id: "proj1",
      title: "OpenTrack — Open Source Fitness Tracker",
      technologies: "React Native, TypeScript, Firebase",
      startDate: "Jan 2023",
      endDate: "Present",
      description: [
        "Built a cross-platform fitness app with 5K+ GitHub stars and 1.2K active users",
        "Implemented offline-first architecture using local SQLite with cloud sync",
      ],
    },
  ],
  certifications: [
    { id: "cert1", name: "AWS Solutions Architect — Associate", issuer: "Amazon Web Services", date: "2022" },
  ],
  leadership: [],
  technicalSkills: [
    "TypeScript", "Python", "Go", "React", "Node.js", "GraphQL",
    "PostgreSQL", "Redis", "Docker", "Kubernetes", "AWS", "CI/CD",
  ],
  softSkills: ["Leadership", "Communication", "Mentoring"],
  interests: ["Open Source", "Rock Climbing", "Photography"],
  customSections: [],
  skillCategories: [
    { name: "Languages", skills: ["TypeScript", "Python", "Go", "Java"] },
    { name: "Frameworks", skills: ["React", "Node.js", "Django", "GraphQL"] },
    { name: "Infrastructure", skills: ["AWS", "Docker", "Kubernetes", "Terraform"] },
  ],
  sectionOrder: ["profile", "education", "experience", "projects", "skills", "interests"],
  references: [],
};

const TemplateSelection = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(templates[0]);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    localStorage.setItem("selected_template", selectedTemplate.id);
    navigate("/builder");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Button variant="ghost" className="gap-2" onClick={() => navigate("/")} aria-label="Go back">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Select Template</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Section Title */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            {templates.length} Professional Templates
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
            Select a Template to Get Started
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            Choose a template that best fits your style and industry
          </p>
        </div>

        {/* Template Cards */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-10">
          {templates.map((template) => {
            const TemplateComp = templateComponents[template.id] || templateComponents.classic;
            return (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                aria-label={`Select ${template.name} template`}
                aria-pressed={selectedTemplate.id === template.id}
                className={`flex flex-col w-[140px] sm:w-[160px] md:w-[200px] rounded-xl overflow-hidden border-2 transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  selectedTemplate.id === template.id
                    ? "border-primary ring-2 ring-primary/20 shadow-md scale-[1.02]"
                    : "border-border hover:border-primary/50 hover:-translate-y-1"
                }`}
              >
                <div className="aspect-[8.5/11] bg-white relative overflow-hidden">
                  <div className="absolute inset-0 origin-top-left" style={{ transform: "scale(0.18)", width: "555%", height: "555%" }}>
                    <div className="font-resume-serif">
                      <TemplateComp data={sampleData} />
                    </div>
                  </div>
                  {selectedTemplate.id === template.id && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-lg animate-in zoom-in-50 z-10">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div className="p-3 bg-card text-center border-t border-border">
                  <span className="text-sm font-semibold text-foreground block">{template.name}</span>
                  <span className="text-xs text-muted-foreground line-clamp-2 mt-1 hidden sm:block">{template.description}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Template Preview & CTA */}
        <div className="max-w-4xl mx-auto">
          <Card className="p-4 sm:p-6 md:p-8 border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Live Preview using actual template */}
              <div className="aspect-[8.5/11] bg-white rounded-lg overflow-hidden shadow-xl border border-border relative">
                <div className="absolute inset-0 origin-top-left overflow-hidden" style={{ transform: "scale(0.48)", width: "208%", height: "208%" }}>
                  <div className="font-resume-serif">
                    {(() => {
                      const SelectedComp = templateComponents[selectedTemplate.id] || templateComponents.classic;
                      return <SelectedComp data={sampleData} />;
                    })()}
                  </div>
                </div>
              </div>

              {/* Info & CTA */}
              <div className="text-center md:text-left space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  {selectedTemplate.name}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedTemplate.description}
                </p>

                <div className="bg-muted/50 rounded-xl p-4 sm:p-5">
                  <p className="text-sm text-foreground mb-4">
                    Click below to start building your resume with this template.
                  </p>
                  <Button 
                    size="lg" 
                    className="w-full gap-2"
                    onClick={handleGetStarted}
                  >
                    Get Started <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  You can switch templates anytime in the builder
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TemplateSelection;
