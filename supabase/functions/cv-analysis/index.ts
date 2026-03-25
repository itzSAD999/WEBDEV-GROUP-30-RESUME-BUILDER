import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are an expert career consultant and CV reviewer with 20+ years of experience in hiring across industries.

Analyze the provided CV/resume on its own merits — no job description needed. Score it based on real-world hiring standards.

Return ONLY valid JSON matching this exact structure:
{
  "overallScore": <number 0-100>,
  "grade": "<A+|A|A-|B+|B|B-|C+|C|D|F>",
  "executiveSummary": "<2-3 sentence overall assessment>",
  "categories": [
    {
      "name": "Professional Branding",
      "score": <number 0-100>,
      "weight": 20,
      "feedback": "<specific actionable feedback>",
      "strengths": ["strength1"],
      "improvements": ["improvement1"]
    },
    {
      "name": "Experience & Achievements",
      "score": <number 0-100>,
      "weight": 30,
      "feedback": "<specific feedback>",
      "strengths": ["strength1"],
      "improvements": ["improvement1"]
    },
    {
      "name": "Skills & Competencies",
      "score": <number 0-100>,
      "weight": 15,
      "feedback": "<specific feedback>",
      "strengths": ["strength1"],
      "improvements": ["improvement1"]
    },
    {
      "name": "Education & Credentials",
      "score": <number 0-100>,
      "weight": 10,
      "feedback": "<specific feedback>",
      "strengths": ["strength1"],
      "improvements": ["improvement1"]
    },
    {
      "name": "Impact & Measurability",
      "score": <number 0-100>,
      "weight": 15,
      "feedback": "<specific feedback about quantified achievements>",
      "strengths": ["strength1"],
      "improvements": ["improvement1"]
    },
    {
      "name": "Clarity & Readability",
      "score": <number 0-100>,
      "weight": 10,
      "feedback": "<specific feedback>",
      "strengths": ["strength1"],
      "improvements": ["improvement1"]
    }
  ],
  "topStrengths": ["strength1", "strength2", "strength3"],
  "criticalImprovements": [
    { "issue": "string", "fix": "string", "priority": "High|Medium|Low" }
  ],
  "industryReadiness": "<Ready|Almost Ready|Needs Work|Major Revision Needed>",
  "estimatedCallbackRate": "<string like '15-25% callback rate expected'>",
  "rewriteSuggestions": [
    { "section": "string", "original": "string", "improved": "string" }
  ]
}

Scoring guidelines:
- Professional Branding (20%): Summary clarity, personal brand, job title alignment, contact completeness
- Experience & Achievements (30%): Depth, relevance, progression, role descriptions
- Skills & Competencies (15%): Breadth, relevance, organization, technical vs soft balance
- Education & Credentials (10%): Relevance, certifications, continuous learning
- Impact & Measurability (15%): Quantified results, metrics, specific outcomes
- Clarity & Readability (10%): Structure, bullet quality, conciseness, grammar signals

Be brutally honest but constructive. Real recruiters spend 6-8 seconds on initial scan — evaluate accordingly.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeData, resumeText } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build resume text
    let fullResumeText = resumeText || "";
    if (!fullResumeText && resumeData) {
      const sections: string[] = [];
      
      if (resumeData.personalInfo) {
        const pi = resumeData.personalInfo;
        sections.push(`Name: ${pi.fullName || "Not provided"}`);
        sections.push(`Title: ${pi.jobTitle || "Not provided"}`);
        sections.push(`Email: ${pi.email || "Not provided"}`);
        sections.push(`Phone: ${pi.phone || "Not provided"}`);
        if (pi.linkedin) sections.push(`LinkedIn: ${pi.linkedin}`);
        if (pi.portfolio) sections.push(`Portfolio: ${pi.portfolio}`);
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

      if (resumeData.volunteering?.length) {
        sections.push("\nVOLUNTEERING:");
        resumeData.volunteering.forEach((vol: any) => {
          sections.push(`${vol.role} at ${vol.organization} (${vol.startDate} - ${vol.endDate || "Present"})`);
          if (vol.responsibilities?.length) {
            vol.responsibilities.forEach((r: string) => sections.push(`• ${r}`));
          }
        });
      }
      
      fullResumeText = sections.join("\n");
    }

    if (!fullResumeText.trim()) {
      return new Response(JSON.stringify({ error: "Resume content is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Starting CV analysis...");

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
          { role: "user", content: `Analyze this CV/resume thoroughly:\n\n${fullResumeText}\n\nReturn ONLY valid JSON.` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    let result;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      result = { overallScore: 0, grade: "N/A", error: "Failed to parse analysis" };
    }

    console.log("CV analysis complete, score:", result.overallScore);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("CV analysis error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
