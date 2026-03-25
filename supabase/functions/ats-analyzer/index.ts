import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Synonym mapping for keyword normalization
const SYNONYMS: Record<string, string[]> = {
  "javascript": ["js", "ecmascript", "es6", "es2015+"],
  "typescript": ["ts"],
  "python": ["py", "python3"],
  "machine learning": ["ml", "deep learning", "ai", "artificial intelligence"],
  "amazon web services": ["aws", "amazon cloud"],
  "google cloud platform": ["gcp", "google cloud"],
  "microsoft azure": ["azure"],
  "restful api": ["rest", "rest api", "restful"],
  "graphql": ["gql"],
  "postgresql": ["postgres", "psql"],
  "mongodb": ["mongo"],
  "kubernetes": ["k8s"],
  "docker": ["container", "containerization"],
  "continuous integration": ["ci", "ci/cd"],
  "continuous deployment": ["cd", "ci/cd"],
  "react": ["reactjs", "react.js"],
  "vue": ["vuejs", "vue.js"],
  "angular": ["angularjs", "angular.js"],
  "node": ["nodejs", "node.js"],
  "express": ["expressjs", "express.js"],
};

// Common technical skills and tools for extraction
const SKILL_PATTERNS = [
  // Programming languages
  "javascript", "typescript", "python", "java", "c\\+\\+", "c#", "ruby", "go", "rust", "swift", "kotlin", "php", "scala",
  // Frontend
  "react", "vue", "angular", "svelte", "next\\.?js", "nuxt", "html", "css", "sass", "less", "tailwind",
  // Backend
  "node\\.?js", "express", "django", "flask", "spring", "fastapi", "rails", "\\.net",
  // Databases
  "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "dynamodb", "firebase", "supabase",
  // Cloud & DevOps
  "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins", "github actions", "gitlab ci",
  // Data & ML
  "machine learning", "deep learning", "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn",
  // Tools
  "git", "jira", "confluence", "figma", "sketch", "postman", "swagger",
  // Soft skills
  "leadership", "communication", "problem-solving", "teamwork", "agile", "scrum", "project management"
];

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) analyzer and resume optimization specialist.

Your task is to analyze a resume against a job description and provide comprehensive feedback.

You MUST return your response as a valid JSON object with this exact structure:
{
  "overallScore": <number 0-100>,
  "grade": "<string: A+, A, B+, B, C+, C, D, F>",
  "atsPassProbability": "<string: High, Medium, Low>",
  "matchBreakdown": {
    "skillMatch": { "score": <number 0-40>, "percentage": <number 0-100>, "found": ["skill1", "skill2"], "missing": ["skill3"] },
    "toolMatch": { "score": <number 0-20>, "percentage": <number 0-100>, "found": ["tool1"], "missing": ["tool2"] },
    "experienceMatch": { "score": <number 0-20>, "percentage": <number 0-100>, "relevantRoles": ["role1"], "gaps": ["gap1"] },
    "keywordDensity": { "score": <number 0-10>, "percentage": <number 0-100> },
    "formatScore": { "score": <number 0-10>, "issues": ["issue1"] }
  },
  "keywordAnalysis": {
    "found": [{ "keyword": "string", "count": <number>, "locations": ["section1"] }],
    "missing": [{ "keyword": "string", "importance": "<High/Medium/Low>", "suggestion": "string" }],
    "synonymsMatched": [{ "jdTerm": "string", "resumeTerm": "string" }]
  },
  "atsRiskFactors": [
    { "issue": "string", "severity": "<Critical/Warning/Info>", "fix": "string" }
  ],
  "tailoringSuggestions": {
    "skillsToAdd": ["skill1", "skill2"],
    "bulletRewrites": [
      { "original": "string", "improved": "string", "reason": "string" }
    ],
    "sectionImprovements": [
      { "section": "string", "suggestion": "string" }
    ],
    "summaryRewrite": "string"
  },
  "strengthHighlights": ["strength1", "strength2"],
  "topPriorities": ["priority1", "priority2", "priority3"]
}

Scoring weights:
- Skill Match: 40 points (required technical skills coverage)
- Tools/Tech Match: 20 points (frameworks, tools, technologies)
- Experience Match: 20 points (relevant role experience)
- Keyword Density: 10 points (proper frequency of JD keywords)
- ATS Formatting: 10 points (clean structure, no tables/graphics)

Be specific, actionable, and provide concrete examples for improvements.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeData, jobDescription, resumeText } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!jobDescription) {
      return new Response(JSON.stringify({ error: "Job description is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Starting ATS analysis...");

    // Build resume text from structured data if not provided
    let fullResumeText = resumeText || "";
    if (!fullResumeText && resumeData) {
      const sections: string[] = [];
      
      if (resumeData.personalInfo) {
        sections.push(`Name: ${resumeData.personalInfo.fullName || ""}`);
        sections.push(`Title: ${resumeData.personalInfo.jobTitle || ""}`);
      }
      
      if (resumeData.profile) {
        sections.push(`\nPROFESSIONAL SUMMARY:\n${resumeData.profile}`);
      }
      
      if (resumeData.workExperience?.length) {
        sections.push("\nWORK EXPERIENCE:");
        resumeData.workExperience.forEach((exp: any) => {
          sections.push(`${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate || "Present"})`);
          if (exp.responsibilities?.length) {
            exp.responsibilities.forEach((r: string) => sections.push(`• ${r}`));
          }
        });
      }
      
      if (resumeData.education?.length) {
        sections.push("\nEDUCATION:");
        resumeData.education.forEach((edu: any) => {
          sections.push(`${edu.degree} - ${edu.institution} (${edu.endDate})`);
          if (edu.bullets?.length) {
            edu.bullets.forEach((b: string) => sections.push(`• ${b}`));
          }
        });
      }
      
      if (resumeData.projects?.length) {
        sections.push("\nPROJECTS:");
        resumeData.projects.forEach((proj: any) => {
          sections.push(`${proj.title} - ${proj.technologies || ""}`);
          if (proj.description?.length) {
            proj.description.forEach((d: string) => sections.push(`• ${d}`));
          }
        });
      }
      
      if (resumeData.technicalSkills?.length) {
        sections.push(`\nTECHNICAL SKILLS:\n${resumeData.technicalSkills.join(", ")}`);
      }
      
      if (resumeData.skillCategories?.length) {
        sections.push("\nSKILLS:");
        resumeData.skillCategories.forEach((cat: any) => {
          sections.push(`${cat.name}: ${cat.skills.join(", ")}`);
        });
      }
      
      if (resumeData.certifications?.length) {
        sections.push("\nCERTIFICATIONS:");
        resumeData.certifications.forEach((cert: any) => {
          sections.push(`${cert.name} - ${cert.issuer} (${cert.date})`);
        });
      }
      
      fullResumeText = sections.join("\n");
    }

    // Pre-process: Extract keywords from job description for context
    const jdLower = jobDescription.toLowerCase();
    const resumeLower = fullResumeText.toLowerCase();
    
    // Quick keyword extraction
    const extractedJDKeywords: string[] = [];
    SKILL_PATTERNS.forEach(pattern => {
      const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
      const matches = jdLower.match(regex);
      if (matches) {
        extractedJDKeywords.push(...matches.map((m: string) => m.toLowerCase()));
      }
    });
    
    const uniqueJDKeywords = [...new Set(extractedJDKeywords)];

    const userPrompt = `Analyze this resume against the job description and provide a comprehensive ATS analysis.

JOB DESCRIPTION:
${jobDescription}

RESUME:
${fullResumeText}

DETECTED JD KEYWORDS (for reference): ${uniqueJDKeywords.join(", ")}

Provide detailed analysis with specific, actionable suggestions. Focus on:
1. Exact keyword matches and what's missing
2. Skills gap analysis
3. ATS formatting issues
4. Bullet point rewrites with action verbs and metrics
5. Overall tailoring recommendations

Return ONLY valid JSON matching the specified structure.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    console.log("AI response received, parsing...");

    // Parse JSON from response
    let result;
    try {
      // Try to extract JSON from markdown code blocks or raw
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      // Return a fallback structure with the raw content
      result = {
        overallScore: 0,
        grade: "N/A",
        atsPassProbability: "Unknown",
        error: "Failed to parse analysis. Please try again.",
        rawContent: content.substring(0, 500)
      };
    }

    console.log("ATS analysis complete, score:", result.overallScore);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("ATS analyzer error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
