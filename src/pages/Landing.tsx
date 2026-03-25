import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FileText, Palette, Edit3, Eye, Download, ArrowRight, Sparkles,
  Target, Zap, CheckCircle2, Star, Play, ChevronRight, Shield,
  Upload, Brain, BarChart3, Users, Award
} from "lucide-react";
import { PoweredByFooter } from "@/components/resume/PoweredByFooter";

const workflowSteps = [
  { icon: Upload, title: "Import or Start Fresh", description: "Upload your CV or start from scratch" },
  { icon: Edit3, title: "Smart Form Builder", description: "Guided fields with real-time tips" },
  { icon: Brain, title: "AI Coach Reviews", description: "Get ATS score & improvement tips" },
  { icon: Download, title: "Export & Apply", description: "Download polished PDF instantly" },
];

const features = [
  {
    icon: BarChart3,
    title: "Real-Time ATS Scoring",
    description: "See your resume score update live as you type. Get granular feedback on content quality, impact language, and keyword coverage."
  },
  {
    icon: Target,
    title: "Job Description Matching",
    description: "Paste any job posting and instantly see how well your resume matches. Get specific keyword suggestions to boost your match rate."
  },
  {
    icon: Sparkles,
    title: "AI Resume Coach",
    description: "Chat with an AI that understands your resume context. Get tailored suggestions for bullet points, summaries, and skills."
  },
  {
    icon: Shield,
    title: "ATS-Safe Templates",
    description: "Every template is designed to pass Applicant Tracking Systems. No graphics, tables, or formatting that confuse ATS parsers."
  },
  {
    icon: Palette,
    title: "6 Professional Templates",
    description: "From classic to creative — each template is optimized for both human readers and ATS software."
  },
  {
    icon: Zap,
    title: "CV Import & Extraction",
    description: "Upload an existing PDF/DOCX or paste your CV text. Our engine extracts and structures your data automatically."
  }
];

const testimonials = [
  {
    name: "Kwame A.",
    role: "Software Engineer at Andela",
    quote: "The ATS scoring showed me exactly why I wasn't getting callbacks. After optimizing, I got 3 interview invites in one week.",
    rating: 5
  },
  {
    name: "Fatima O.",
    role: "Product Manager",
    quote: "I pasted my dream job description and the tool highlighted every missing keyword. My match score went from 45% to 89%.",
    rating: 5
  },
  {
    name: "David M.",
    role: "Data Analyst at MTN",
    quote: "Built a professional resume in 15 minutes. The AI coach helped me rewrite weak bullet points into achievement statements.",
    rating: 5
  }
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ─── Hero ─── */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 z-10" />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />

        <div className="container relative z-20 px-4 py-16 md:py-20 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-full mb-8 backdrop-blur-sm text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            100% Free • No Sign-up • ATS-Optimized
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground mb-6 leading-[1.1] tracking-tight">
            Build a Resume That
            <span className="text-primary block mt-1">Actually Gets Interviews</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Our AI-powered builder scores your resume against real ATS systems,
            matches it to job descriptions, and coaches you to stand out.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              size="lg"
              className="gap-2 text-lg px-10 py-7 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all w-full sm:w-auto font-semibold"
              onClick={() => navigate("/templates")}
            >
              <Play className="w-5 h-5" />
              Start Building — It's Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 text-lg px-8 py-7 w-full sm:w-auto"
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              See How It Works
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            {[
              { icon: CheckCircle2, text: "No credit card" },
              { icon: Shield, text: "Your data stays private" },
              { icon: Award, text: "6 pro templates" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-primary" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trusted By Marquee ─── */}
      <section className="py-6 sm:py-8 border-y border-border/40 bg-muted/20 overflow-hidden">
        <p className="text-center text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-4 sm:mb-6">
          Trusted by professionals at leading organizations
        </p>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-20 bg-gradient-to-r from-muted/20 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-10 sm:w-20 bg-gradient-to-l from-muted/20 to-transparent z-10 pointer-events-none" />
          <div className="flex animate-marquee whitespace-nowrap">
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex items-center gap-6 sm:gap-12 px-3 sm:px-6">
                {[
                  "Google", "Microsoft", "Amazon", "Deloitte", "McKinsey",
                  "Goldman Sachs", "JPMorgan", "Accenture", "PwC", "Meta",
                  "Apple", "Netflix", "Spotify", "Salesforce", "IBM",
                ].map((org) => (
                  <span key={`${setIdx}-${org}`} className="text-xs sm:text-sm font-semibold text-muted-foreground/60 tracking-wide select-none">
                    {org}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-20 md:py-28 bg-muted/30 px-4" id="features">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">Simple 4-Step Process</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              From Blank Page to Interview-Ready
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Our guided workflow ensures nothing gets missed
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {workflowSteps.map((step, index) => (
              <Card
                key={step.title}
                className="p-5 md:p-7 text-center relative overflow-hidden group hover:shadow-xl hover:border-primary/40 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute -top-3 -left-2 text-7xl font-black text-primary/[0.04] group-hover:text-primary/[0.08] transition-colors select-none">
                  {index + 1}
                </div>
                <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <step.icon className="w-6 h-6 md:w-7 md:h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-bold text-foreground mb-1.5 text-sm md:text-base">{step.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="py-20 md:py-28 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">Powerful Features</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Everything You Need to Land the Job
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Tools that give you a real competitive advantage
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="p-6 md:p-8 hover:shadow-lg hover:border-primary/30 transition-all group hover:-translate-y-0.5">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="py-16 bg-primary/5 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "6", label: "Pro Templates" },
              { value: "100%", label: "Free Forever" },
              { value: "ATS", label: "Optimized" },
              { value: "AI", label: "Powered Coach" },
            ].map(({ value, label }) => (
              <div key={label} className="p-4">
                <div className="text-3xl md:text-4xl font-black text-primary mb-1">{value}</div>
                <p className="text-xs md:text-sm text-muted-foreground font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-20 md:py-28 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">Success Stories</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Real Results From Real People
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-shadow border-border/60">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground/80 mb-5 leading-relaxed">"{t.quote}"</p>
                <div className="border-t border-border pt-4">
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-20 md:py-28 px-4 bg-gradient-to-t from-primary/8 to-transparent">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-5">
            Your Next Interview Starts Here
          </h2>
          <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
            Stop guessing why you're not getting callbacks. Build a resume that's
            optimized for both humans and ATS systems.
          </p>
          <Button
            size="lg"
            className="gap-2 text-lg px-12 py-7 shadow-xl shadow-primary/20 font-semibold"
            onClick={() => navigate("/templates")}
          >
            Build Your Resume Now
            <ArrowRight className="w-5 h-5" />
          </Button>
          <p className="text-xs text-muted-foreground mt-4">No sign-up required. Start building immediately.</p>
        </div>
      </section>

      <footer className="py-8 border-t border-border">
        <PoweredByFooter />
      </footer>
    </div>
  );
};

export default Landing;
