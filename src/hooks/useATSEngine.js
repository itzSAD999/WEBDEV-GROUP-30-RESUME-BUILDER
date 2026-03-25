import { useState, useCallback, useMemo, useRef } from "react";

const generateCacheKey = (resumeData, jd) => {
  const resumeHash = JSON.stringify({
    profile: resumeData.profile,
    skills: resumeData.technicalSkills,
    experience: resumeData.workExperience.length,
    education: resumeData.education.length,
  });
  return \`\${resumeHash}__\${jd.slice(0, 100)}\`;
};

// Real-world ATS keyword patterns
const POWER_VERBS = /^(Achieved|Accelerated|Administered|Advised|Analyzed|Architected|Automated|Built|Championed|Collaborated|Conducted|Consolidated|Contributed|Coordinated|Created|Customized|Decreased|Delivered|Designed|Developed|Directed|Drove|Earned|Eliminated|Enabled|Engineered|Enhanced|Established|Evaluated|Exceeded|Executed|Expanded|Facilitated|Forecasted|Generated|Grew|Guided|Identified|Implemented|Improved|Increased|Influenced|Initiated|Innovated|Integrated|Introduced|Launched|Led|Leveraged|Managed|Maximized|Mentored|Migrated|Modernized|Negotiated|Optimized|Orchestrated|Organized|Oversaw|Pioneered|Planned|Prioritized|Produced|Programmed|Proposed|Provided|Published|Raised|Recommended|Reduced|Refactored|Reformulated|Reorganized|Resolved|Restructured|Revamped|Scaled|Secured|Simplified|Spearheaded|Standardized|Streamlined|Strengthened|Supervised|Surpassed|Transformed|Troubleshot|Unified|Upgraded)/i;
const METRICS_PATTERN = /d+%|$[d,]+.?d*|d+[xX]|d++?s*(users?|clients?|customers?|employees?|team members?|projects?|accounts?|transactions?|queries?|requests?|tickets?|reports?|applications?|students?|people|stakeholders?|partners?|vendors?|departments?|regions?|countries?|sites?|locations?|servers?|databases?|systems?|features?|products?|services?|campaigns?|channels?|markets?|stores?|branches?|units?|modules?|endpoints?|APIs?|pages?|records?|documents?|orders?|deliverables?|milestones?|sprints?|releases?|iterations?)|d+[s-]*(year|month|week|day|hour|minute)s?|b(revenue|budget|savings?|cost|profit|ROI|KPI|SLA|OKR)b.*d/i;
const WEAK_PHRASES = /^(Responsible for|Duties included|Helped with|Worked on|Tasked with|Assisted in|Participated in|Involved in|Was responsible|Did various|Handled various|Supported the)/i;

const getResumeHash = (data) => JSON.stringify({
  p: data.profile?.slice(0, 50),
  s: data.technicalSkills?.length,
  w: data.workExperience?.map(w => w.responsibilities?.length),
  e: data.education?.length,
  n: data.personalInfo?.fullName,
  pr: data.projects?.length,
});

export function useATSEngine(resumeData) {
  const [resumeSource, setResumeSource] = useState("builder");
  const [uploadedResumeText, setUploadedResumeText] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [jobMatchResult, setJobMatchResult] = useState(null);
  const [cvAnalysisResult, setCvAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzingCV, setIsAnalyzingCV] = useState(false);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState(null);
  const [error, setError] = useState(null);
  const cacheRef = useRef(new Map());
  const lastCVAnalysisHash = useRef("");
  const lastJobMatchHash = useRef("");

  const calculateQualityScore = useCallback(() => {
    const contentDetails = [];
    const atsDetails = [];
    const completenessDetails = [];
    const impactDetails = [];
    const readyDetails = [];

    let contentScore = 0;
    let atsScore = 0;
    let completenessScore = 0;
    let impactScore = 0;
    let readyScore = 0;

    // ── Content Quality (35 max) ──
    if (resumeData.personalInfo.fullName) {
      contentScore += 3;
      contentDetails.push("✓ Name provided");
    } else {
      contentDetails.push("✗ Missing name — recruiters need this immediately");
    }

    if (resumeData.profile) {
      const wordCount = resumeData.profile.split(/s+/).length;
      if (wordCount >= 30 && wordCount <= 80) {
        contentScore += 12;
        contentDetails.push(\`✓ Professional summary is well-sized (\${wordCount} words)\`);
      } else if (wordCount > 80) {
        contentScore += 8;
        contentDetails.push(\`⚠ Summary may be too long (\${wordCount} words) — aim for 30–80 words\`);
      } else if (wordCount >= 10) {
        contentScore += 5;
        contentDetails.push(\`⚠ Summary is thin (\${wordCount} words) — expand to 30+ words\`);
      } else {
        contentScore += 2;
        contentDetails.push("⚠ Summary too brief — add 2–3 sentences about your value proposition");
      }
    } else {
      contentDetails.push("✗ Missing professional summary — this is the first thing recruiters read");
    }

    // Experience depth
    if (resumeData.workExperience.length > 0) {
      contentScore += 8;
      const totalBullets = resumeData.workExperience.reduce((sum, exp) => sum + exp.responsibilities.filter(r => r.trim()).length, 0);
      const avgBullets = totalBullets / resumeData.workExperience.length;

      if (avgBullets >= 3) {
        contentScore += 7;
        contentDetails.push(\`✓ \${totalBullets} bullet points across \${resumeData.workExperience.length} role(s) — good depth\`);
      } else if (avgBullets >= 2) {
        contentScore += 4;
        contentDetails.push(\`⚠ Average \${avgBullets.toFixed(1)} bullets per role — aim for 3–5 per position\`);
      } else {
        contentScore += 1;
        contentDetails.push("⚠ Too few bullet points — add 3–5 achievements per role");
      }

      // Check bullet length quality
      const shortBullets = resumeData.workExperience.flatMap(w => w.responsibilities).filter(r => r.trim().length > 0 && r.trim().split(/s+/).length < 6);
      if (shortBullets.length > 0) {
        contentDetails.push(\`⚠ \${shortBullets.length} bullet(s) are too short — describe impact, not just tasks\`);
      } else if (totalBullets > 0) {
        contentScore += 5;
        contentDetails.push("✓ Bullet points have good descriptive length");
      }
    } else {
      contentDetails.push("✗ No work experience listed");
    }

    // ── ATS & Structure (25 max) ──
    atsScore = 8; // Base for clean text format
    atsDetails.push("✓ Clean text-based format (ATS-parseable)");

    const hasSkills = resumeData.technicalSkills.length > 0 || (resumeData.skillCategories?.length || 0) > 0;
    if (hasSkills) {
      const skillCount = resumeData.technicalSkills.length + (resumeData.skillCategories?.reduce((s, c) => s + c.skills.length, 0) || 0);
      if (skillCount >= 8) {
        atsScore += 9;
        atsDetails.push(\`✓ Strong skills section (\${skillCount} skills) — great for ATS keyword matching\`);
      } else if (skillCount >= 4) {
        atsScore += 6;
        atsDetails.push(\`⚠ \${skillCount} skills listed — add more relevant technical skills for better ATS matching\`);
      } else {
        atsScore += 3;
        atsDetails.push(\`⚠ Only \${skillCount} skills — ATS systems rely heavily on keyword matching\`);
      }
    } else {
      atsDetails.push("✗ Missing skills section — critical for ATS keyword scanning");
    }

    if (resumeData.education.length > 0) {
      atsScore += 8;
      atsDetails.push("✓ Education section present");
    } else {
      atsDetails.push("⚠ No education — many ATS filters require this");
    }

    // ── Section Completeness (20 max) ──
    const sections = [
      { name: "Personal Info", has: !!resumeData.personalInfo.fullName && !!resumeData.personalInfo.email, weight: 4 },
      { name: "Summary", has: !!resumeData.profile, weight: 4 },
      { name: "Experience", has: resumeData.workExperience.length > 0, weight: 5 },
      { name: "Education", has: resumeData.education.length > 0, weight: 4 },
      { name: "Skills", has: hasSkills, weight: 3 },
    ];

    const completedWeight = sections.filter(s => s.has).reduce((s, sec) => s + sec.weight, 0);
    const totalWeight = sections.reduce((s, sec) => s + sec.weight, 0);
    completenessScore = Math.round((completedWeight / totalWeight) * 18);

    const completedNames = sections.filter(s => !s.has).map(s => s.name);
    if (completedNames.length === 0) {
      completenessDetails.push("✓ All core sections complete");
    } else {
      completenessDetails.push(\`⚠ Missing: \${completedNames.join(", ")}\`);
    }

    // Bonus sections
    if (resumeData.projects.length > 0) {
      completenessScore = Math.min(20, completenessScore + 1);
      completenessDetails.push("✓ Projects section adds depth");
    }
    if (resumeData.certifications.length > 0) {
      completenessScore = Math.min(20, completenessScore + 1);
      completenessDetails.push("✓ Certifications strengthen credibility");
    }

    // ── Impact Language (15 max) ──
    const allBullets = [
      ...resumeData.workExperience.flatMap(w => w.responsibilities),
      ...resumeData.projects.flatMap(p => p.description || []),
      ...resumeData.leadership.flatMap(l => l.responsibilities),
    ].filter(b => b.trim());

    if (allBullets.length > 0) {
      const withMetrics = allBullets.filter(b => METRICS_PATTERN.test(b));
      const withPowerVerbs = allBullets.filter(b => POWER_VERBS.test(b.trim()));
      const withWeakPhrases = allBullets.filter(b => WEAK_PHRASES.test(b.trim()));

      // Metrics scoring (0-7)
      const metricsRatio = withMetrics.length / allBullets.length;
      if (metricsRatio >= 0.5) {
        impactScore += 7;
        impactDetails.push(\`✓ \${withMetrics.length}/\${allBullets.length} bullets quantified — excellent\`);
      } else if (metricsRatio >= 0.25) {
        impactScore += 4;
        impactDetails.push(\`⚠ \${withMetrics.length}/\${allBullets.length} bullets have metrics — aim for 50%+\`);
      } else if (withMetrics.length > 0) {
        impactScore += 2;
        impactDetails.push(\`⚠ Only \${withMetrics.length} bullet(s) with numbers — quantify results (%, $, counts)\`);
      } else {
        impactDetails.push("✗ No quantified achievements — add numbers to show measurable impact");
      }

      // Action verbs (0-5)
      const verbRatio = withPowerVerbs.length / allBullets.length;
      if (verbRatio >= 0.6) {
        impactScore += 5;
        impactDetails.push(\`✓ Strong action verbs in \${withPowerVerbs.length} bullets\`);
      } else if (verbRatio >= 0.3) {
        impactScore += 3;
        impactDetails.push(\`⚠ \${withPowerVerbs.length} bullets start with action verbs — use more (Led, Built, Increased…)\`);
      } else {
        impactScore += 1;
        impactDetails.push("⚠ Start bullets with powerful verbs: Achieved, Delivered, Spearheaded…");
      }

      // Weak phrases penalty (0-3)
      if (withWeakPhrases.length === 0) {
        impactScore += 3;
        impactDetails.push("✓ No weak phrasing detected");
      } else {
        impactDetails.push(\`⚠ \${withWeakPhrases.length} bullet(s) use weak phrasing like "Responsible for" — rewrite with action verbs\`);
      }
    } else {
      impactDetails.push("✗ No bullet points to evaluate — add achievements to experience");
    }

    // ── Application Ready (5 max) ──
    if (resumeData.personalInfo.email) {
      readyScore += 2;
      readyDetails.push("✓ Email provided");
    } else {
      readyDetails.push("✗ Missing email — essential for applications");
    }
    if (resumeData.personalInfo.phone) {
      readyScore += 1;
      readyDetails.push("✓ Phone number included");
    } else {
      readyDetails.push("⚠ No phone number");
    }
    if (resumeData.personalInfo.linkedin) {
      readyScore += 1;
      readyDetails.push("✓ LinkedIn profile linked");
    } else {
      readyDetails.push("⚠ Add LinkedIn — 87% of recruiters use it");
    }
    if (resumeData.personalInfo.portfolio) {
      readyScore += 1;
      readyDetails.push("✓ Portfolio/GitHub linked");
    }

    return {
      total: contentScore + atsScore + completenessScore + impactScore + readyScore,
      content: { score: contentScore, max: 35, details: contentDetails },
      ats: { score: atsScore, max: 25, details: atsDetails },
      completeness: { score: completenessScore, max: 20, details: completenessDetails },
      impact: { score: impactScore, max: 15, details: impactDetails },
      ready: { score: readyScore, max: 5, details: readyDetails },
    };
  }, [resumeData]);

  const qualityScore = useMemo(() => calculateQualityScore(), [calculateQualityScore]);

  const analyzeJobMatch = useCallback(async () => {
    if (!jobDescription.trim()) {
      setError("Job description is required");
      return null;
    }

    const cacheKey = generateCacheKey(resumeData, jobDescription);
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setJobMatchResult(cached);
      return cached;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Mock ATS Analysis 
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = {
        overallScore: 75,
        keywordAnalysis: {
          present: [{ keyword: "React", context: "Used React" }],
          missing: [{ keyword: "Node.js", context: "Required" }]
        },
        topPriorities: ["Add more quantifiable metrics", "Include Node.js experience"],
        strengthHighlights: ["Good formatting", "Clear technical skills section"]
      };

      cacheRef.current.set(cacheKey, result);
      setJobMatchResult(result);
      setLastAnalyzedAt(new Date());
      lastJobMatchHash.current = getResumeHash(resumeData);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setError(message);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [resumeData, jobDescription, resumeSource, uploadedResumeText]);

  const clearJobMatch = useCallback(() => {
    setJobMatchResult(null);
    setJobDescription("");
  }, []);

  const analyzeCVContent = useCallback(async () => {
    setIsAnalyzingCV(true);
    setError(null);

    try {
      // Mock CV Analysis
      await new Promise(resolve => setTimeout(resolve, 1500));

      const result = {
        overallScore: 82,
        overallFeedback: "Your resume is looking good! It has a clear structure and strong technical skills.",
        topPriorities: ["Expand profile summary", "Add more details to recent work experience"],
        suggestedSummary: "Experienced developer with a strong background in frontend technologies...",
        strengthHighlights: ["Strong education section", "Good use of keywords"]
      };

      setCvAnalysisResult(result);
      lastCVAnalysisHash.current = getResumeHash(resumeData);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setError(message);
      return null;
    } finally {
      setIsAnalyzingCV(false);
    }
  }, [resumeData, resumeSource, uploadedResumeText]);

  const currentHash = getResumeHash(resumeData);
  const cvAnalysisStale = !!cvAnalysisResult && lastCVAnalysisHash.current !== currentHash;
  const jobMatchStale = !!jobMatchResult && lastJobMatchHash.current !== currentHash;

  const state = {
    resumeSource, uploadedResumeText, qualityScore, jobMatchResult, cvAnalysisResult, jobDescription, isAnalyzing, isAnalyzingCV, lastAnalyzedAt, error, cvAnalysisStale, jobMatchStale,
  };

  const actions = {
    setResumeSource, setUploadedResumeText, setJobDescription, calculateQualityScore, analyzeJobMatch, analyzeCVContent, clearJobMatch,
  };

  return [state, actions];
}
