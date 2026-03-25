import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Updated system prompt with cleaner formatting instructions
const CV_REVIEWER_SYSTEM_PROMPT = `You are an expert career coach and professional CV reviewer. Your task is to analyze any CV provided and give detailed, constructive, and actionable feedback. You handle CVs for different career levels (entry-level, mid-career, senior) and roles (technical, creative, management, or hybrid).

IMPORTANT FORMATTING RULES:
- Do NOT use excessive asterisks or bold markers
- Use clear headings without markdown symbols
- Write in clean, readable prose
- Use numbered lists or bullet points sparingly and only when listing items
- Keep paragraphs short and scannable
- Use natural emphasis through word choice, not formatting

Follow these guidelines:

1. Section-by-section feedback:
   For each CV section, evaluate:
   • Completeness: Are all essential details included?
   • Clarity: Is the information easy to read and understand?
   • Relevance: Does it match the targeted role or industry?
   • Strengths: What is strong or well-presented
   • Areas for Improvement: Specific suggestions for changes

2. Sections to analyze (if present):
   Personal Information, Career Objective/Summary, Education, Work Experience, Skills, Projects, Certifications, Languages, Achievements/Awards, Volunteer Work, References

3. Improvement Suggestions:
   • Actionable ways to strengthen each section
   • Formatting and structure recommendations
   • Missing elements that would strengthen the CV
   • Action words and metrics to emphasize impact
   • Role-specific advice (portfolio for creative, projects for technical)

4. Overall Feedback:
   • Summarize strengths and weaknesses
   • High-level recommendation for improvement
   • Impact rating from 1 to 5
   • Suggested improved career summary if needed

5. Tone:
   Professional, supportive, constructive, and encouraging. Focus on actionable advice without discouraging language.

6. Handling Different CV Types:
   • Entry-Level/Student: Focus on education, internships, projects, skills, extracurriculars
   • Technical: Emphasize skills, projects, technologies, certifications, measurable outcomes
   • Creative: Focus on portfolio, achievements, creative projects, impact
   • Management/Leadership: Highlight leadership experience, impact, achievements, soft skills

Return your response as valid JSON:
{
  "sections": [
    {
      "name": "Section Name",
      "strengths": ["strength 1", "strength 2"],
      "improvements": ["improvement 1", "improvement 2"],
      "score": 1-5
    }
  ],
  "overallScore": 1-5,
  "overallFeedback": "Summary of the CV",
  "topPriorities": ["priority 1", "priority 2", "priority 3"],
  "suggestedSummary": "Optional improved career summary"
}`;

const CHAT_SYSTEM_PROMPT = `You are a friendly and knowledgeable AI Resume Coach. You help users improve their resumes by providing specific, actionable advice.

CRITICAL FORMATTING RULES:
- Write in clear, natural prose without excessive formatting
- Do NOT use asterisks for bold or emphasis
- Use plain text with natural sentence structure
- When listing items, use simple numbered lists or dashes
- Keep responses conversational and easy to read
- Avoid markdown formatting symbols

Your expertise includes:
- Resume formatting and structure
- ATS (Applicant Tracking System) optimization
- Industry-specific resume tips
- Action verbs and quantifying achievements
- Tailoring resumes to job descriptions

Be conversational, encouraging, and specific. When giving advice, provide examples where helpful.
Keep responses concise but helpful - aim for 2-3 paragraphs maximum unless more detail is specifically requested.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, resumeData, message, selectedText, jobDescription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Processing ${type} request`);

    let messages: { role: string; content: string }[] = [];
    let shouldStream = false;

    switch (type) {
      case "full-review":
        messages = [
          { role: "system", content: CV_REVIEWER_SYSTEM_PROMPT },
          { role: "user", content: `Please review this CV and provide detailed feedback:\n\n${JSON.stringify(resumeData, null, 2)}` }
        ];
        break;

      case "chat":
        shouldStream = true;
        const context = resumeData ? `\nCurrent Resume Data:\n${JSON.stringify(resumeData, null, 2)}` : '';
        const selectedContext = selectedText ? `\nUser selected this text for review: "${selectedText}"` : '';
        const jobContext = jobDescription ? `\nTarget Job Description:\n${jobDescription}` : '';
        
        messages = [
          { role: "system", content: CHAT_SYSTEM_PROMPT + context + selectedContext + jobContext },
          { role: "user", content: message }
        ];
        break;

      case "highlight-review":
        messages = [
          { role: "system", content: "You are an expert resume coach. Analyze the selected resume text and provide specific feedback on how to improve it. Be concise but actionable. Write in clear prose without markdown formatting or excessive asterisks." },
          { role: "user", content: `Please review this resume text and suggest improvements:\n\n"${selectedText}"\n\nContext from the full resume:\n${JSON.stringify(resumeData, null, 2)}` }
        ];
        break;

      case "tailor":
        messages = [
          { role: "system", content: "You are an expert at optimizing resumes for specific job opportunities. Analyze the job description and resume, then provide specific recommendations to tailor the resume for this role. Write in clear prose without excessive formatting." },
          { role: "user", content: `Job Description:\n${jobDescription}\n\nCurrent Resume:\n${JSON.stringify(resumeData, null, 2)}\n\nProvide specific recommendations to tailor this resume for the job.` }
        ];
        break;

      case "section-tips":
        messages = [
          { role: "system", content: "You are an expert resume coach. Provide specific, actionable tips for the requested resume section. Be concise and helpful. Write in clear prose without markdown formatting." },
          { role: "user", content: message }
        ];
        break;

      default:
        throw new Error(`Unknown request type: ${type}`);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        stream: shouldStream,
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
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (shouldStream) {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    } else {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      
      let result;
      try {
        const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } else {
          result = { text: content };
        }
      } catch {
        result = { text: content };
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("CV reviewer error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
