export interface CVAnalysisCategory {
  name: string;
  score: number;
  weight: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface CriticalImprovement {
  issue: string;
  fix: string;
  priority: "High" | "Medium" | "Low";
}

export interface RewriteSuggestion {
  section: string;
  original: string;
  improved: string;
}

export interface CVAnalysisResult {
  overallScore: number;
  grade: string;
  executiveSummary: string;
  categories: CVAnalysisCategory[];
  topStrengths: string[];
  criticalImprovements: CriticalImprovement[];
  industryReadiness: string;
  estimatedCallbackRate: string;
  rewriteSuggestions: RewriteSuggestion[];
  error?: string;
}
