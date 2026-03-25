import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Mail, 
  Plus, 
  TrendingUp, 
  Target, 
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Sparkles,
  Zap
} from "lucide-react";

// Simulated data - in production this would come from storage/API
const resumeScore = 72;
const industryAverage = 65;
const topPerformers = 85;

const scoreBreakdown = [
  { label: "Content Quality", score: 78, max: 100 },
  { label: "ATS Compatibility", score: 85, max: 100 },
  { label: "Keywords", score: 62, max: 100 },
  { label: "Formatting", score: 70, max: 100 },
  { label: "Impact Statements", score: 65, max: 100 },
];

const recentResumes = [
  { id: "1", name: "Software Engineer Resume", lastEdited: "2 hours ago", score: 72, status: "complete" },
  { id: "2", name: "Product Manager CV", lastEdited: "1 day ago", score: 58, status: "draft" },
];

const weeklyGoals = [
  { id: "1", task: "Add 3 impact statements", completed: true },
  { id: "2", task: "Include relevant keywords", completed: true },
  { id: "3", task: "Proofread all sections", completed: false },
  { id: "4", task: "Get AI feedback", completed: false },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const goalsCompleted = weeklyGoals.filter(g => g.completed).length;
  const goalsTotal = weeklyGoals.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your resumes and track progress</p>
          </div>
          <Button onClick={() => navigate("/templates")} className="gap-2">
            <Plus className="w-4 h-4" />
            New Resume
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/50 group"
            onClick={() => navigate("/templates")}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground">Resume Builder</h3>
                <p className="text-sm text-muted-foreground">Create or edit your professional resume</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/50 group opacity-60"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-secondary rounded-xl">
                <Mail className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground">Cover Letter</h3>
                <p className="text-sm text-muted-foreground">Coming soon...</p>
              </div>
              <span className="text-xs bg-muted px-2 py-1 rounded">Soon</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Industry Benchmark */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Industry Benchmark
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-48 flex items-end justify-center gap-4 px-8">
                {/* Bell Curve SVG */}
                <svg viewBox="0 0 400 150" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  {/* Bell curve path */}
                  <path
                    d="M 0 150 Q 50 150, 80 140 Q 120 100, 160 50 Q 200 10, 200 10 Q 200 10, 240 50 Q 280 100, 320 140 Q 350 150, 400 150 Z"
                    fill="url(#curveGradient)"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                  />
                  {/* Industry average line */}
                  <line x1="160" y1="0" x2="160" y2="150" stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="4" />
                  {/* Your score line */}
                  <line x1={180 + (resumeScore - industryAverage) * 2} y1="0" x2={180 + (resumeScore - industryAverage) * 2} y2="150" stroke="hsl(var(--primary))" strokeWidth="2" />
                  {/* Top performers line */}
                  <line x1="280" y1="0" x2="280" y2="150" stroke="hsl(142 76% 36%)" strokeWidth="1" strokeDasharray="4" />
                </svg>
                
                {/* Labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-muted-foreground">
                  <span>Low</span>
                  <span>Average ({industryAverage}%)</span>
                  <span>Top ({topPerformers}%)</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{resumeScore}%</div>
                  <div className="text-sm text-muted-foreground">Your Score</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div className="text-center">
                  <div className="text-xl font-semibold text-muted-foreground">{industryAverage}%</div>
                  <div className="text-sm text-muted-foreground">Industry Avg</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div className="text-center">
                  <div className="text-xl font-semibold text-green-600">{topPerformers}%</div>
                  <div className="text-sm text-muted-foreground">Top 10%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {scoreBreakdown.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">{item.score}%</span>
                  </div>
                  <Progress value={item.score} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Resumes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="w-5 h-5 text-primary" />
                Recent Resumes
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/templates")}>
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentResumes.map((resume) => (
                <div 
                  key={resume.id} 
                  className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate("/builder")}
                >
                  <div className={`p-2 rounded-lg ${resume.status === 'complete' ? 'bg-green-500/10' : 'bg-amber-500/10'}`}>
                    {resume.status === 'complete' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">{resume.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {resume.lastEdited}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-foreground">{resume.score}%</div>
                    <div className="text-xs text-muted-foreground">score</div>
                  </div>
                </div>
              ))}

              {recentResumes.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-3">No resumes yet</p>
                  <Button variant="outline" size="sm" onClick={() => navigate("/templates")}>
                    Create Your First Resume
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Award className="w-5 h-5 text-primary" />
                Weekly Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">{goalsCompleted}/{goalsTotal}</span>
                </div>
                <Progress value={(goalsCompleted / goalsTotal) * 100} className="h-3" />
              </div>

              <div className="space-y-2">
                {weeklyGoals.map((goal) => (
                  <div 
                    key={goal.id}
                    className={`flex items-center gap-3 p-2 rounded-lg ${goal.completed ? 'bg-green-500/5' : 'bg-muted/30'}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${goal.completed ? 'bg-green-500 border-green-500' : 'border-muted-foreground'}`}>
                      {goal.completed && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm ${goal.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {goal.task}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Improve Your Score</h3>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  Your resume is above average! To reach the top 10%, focus on adding more quantified achievements and industry-specific keywords.
                </p>
                <Button variant="outline" size="sm" onClick={() => navigate("/builder")} className="w-full sm:w-auto">
                  Get AI Recommendations
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
