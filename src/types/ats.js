export interface KeywordMatch {
  keyword: string;
  count: number;
  locations: string[];
}

export interface MissingKeyword {
  keyword: string;
  importance: "High" | "Medium" | "Low";
  suggestion: string;
}

export interface SynonymMatch {
  jdTerm: string;
  resumeTerm: string;
}

export interface MatchCategory {
  score: number;
  percentage: number;
  found?: string[];
  missing?: string[];
  relevantRoles?: string[];
  gaps?: string[];
  issues?: string[];
}

export interface MatchBreakdown {
  skillMatch: MatchCategory;
  toolMatch: MatchCategory;
  experienceMatch: MatchCategory;
  keywordDensity: MatchCategory;
  formatScore: MatchCategory;
}

export interface KeywordAnalysis {
  found: KeywordMatch[];
  missing: MissingKeyword[];
  synonymsMatched: SynonymMatch[];
}

export interface ATSRiskFactor {
  issue: string;
  severity: "Critical" | "Warning" | "Info";
  fix: string;
}

export interface BulletRewrite {
  original: string;
  improved: string;
  reason: string;
}

export interface SectionImprovement {
  section: string;
  suggestion: string;
}

export interface TailoringSuggestions {
  skillsToAdd: string[];
  bulletRewrites: BulletRewrite[];
  sectionImprovements: SectionImprovement[];
  summaryRewrite?: string;
}

export interface ATSAnalysisResult {
  overallScore: number;
  grade: string;
  atsPassProbability: "High" | "Medium" | "Low";
  matchBreakdown: MatchBreakdown;
  keywordAnalysis: KeywordAnalysis;
  atsRiskFactors: ATSRiskFactor[];
  tailoringSuggestions: TailoringSuggestions;
  strengthHighlights: string[];
  topPriorities: string[];
  error?: string;
}

// Suggestion with apply workflow
export interface ApplySuggestion {
  id: string;
  type: "skill" | "bullet" | "summary" | "section";
  title: string;
  problem: string;
  whyItMatters: string;
  before?: string;
  after: string;
  estimatedScoreImprovement: number;
  status: "pending" | "applied" | "dismissed" | "saved";
  targetSection?: string;
  targetIndex?: number;
}
