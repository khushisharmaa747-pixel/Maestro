import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || (import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) || "";
if (!apiKey) {
  console.warn("GEMINI_API_KEY is missing. AI features will not work.");
}
const ai = new GoogleGenAI({ apiKey });

export const generateBrief = async (ads: any[]) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `### ROLE
You are a $100M DTC Growth Strategist and Senior Marketing Analyst. Your goal is to provide high-level strategic intelligence for Mosaic Wellness brands (ManMatters, BeBodywise, Little Joys).

### DATA
Competitor Ads: ${JSON.stringify(ads)}

### TASK
Generate a "Weekly Intelligence Brief" that feels like a confidential memo to a VP of Marketing.

### OUTPUT SCHEMA (JSON)
{
  "summary": "Strategic overview of the competitive landscape this week.",
  "patterns": ["Major creative patterns detected (e.g., 'Problem-Solution Video dominance')."],
  "experiments": ["New experiments competitors launched (e.g., 'mCaffeine testing clinical-first hooks')."],
  "scaling_ads": ["Proven ads still scaling based on longevity (>30 days)."],
  "emerging_themes": ["Themes gaining traction (e.g., 'Gut health as a gateway to skin wellness')."],
  "opportunities": ["Specific creative playbooks Mosaic brands should exploit."]
}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
          experiments: { type: Type.ARRAY, items: { type: Type.STRING } },
          scaling_ads: { type: Type.ARRAY, items: { type: Type.STRING } },
          emerging_themes: { type: Type.ARRAY, items: { type: Type.STRING } },
          opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["summary", "patterns", "experiments", "scaling_ads", "emerging_themes", "opportunities"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
};

export const detectTerritories = async (ads: any[]) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Analyze the following ads and cluster them into "Creative Territories".
    Ads Data: ${JSON.stringify(ads)}
    
    Return a JSON array of objects, each with:
    - name: Territory name (e.g., "Clinical Science", "Emotional Trust").
    - brands: Array of brands in this territory.
    - description: Why these brands are here.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            brands: { type: Type.ARRAY, items: { type: Type.STRING } },
            description: { type: Type.STRING },
          },
          required: ["name", "brands", "description"],
        },
      },
    },
  });

  return JSON.parse(response.text || "[]");
};

export const detectPatterns = async (ads: any[]) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `### TASK
Detect creative patterns and clusters from the following competitor ads.
Ads: ${JSON.stringify(ads)}

### GOAL
Identify creative playbooks competitors are using. Look for clusters of similar ads, repeated hooks, dominant messaging strategies, and format patterns.

### OUTPUT SCHEMA (JSON)
[{
  "pattern_name": "Name of the playbook",
  "hook_type": "e.g., Question, Statistic, Story",
  "format": "Video/Static/Carousel",
  "messaging_style": "Emotional vs Rational",
  "longevity_signal": "Average days active for this pattern",
  "brands_using_it": ["Brand A", "Brand B"]
}]`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            pattern_name: { type: Type.STRING },
            hook_type: { type: Type.STRING },
            format: { type: Type.STRING },
            messaging_style: { type: Type.STRING },
            longevity_signal: { type: Type.STRING },
            brands_using_it: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["pattern_name", "hook_type", "format", "messaging_style", "longevity_signal", "brands_using_it"],
        },
      },
    },
  });

  return JSON.parse(response.text || "[]");
};

export const analyzeBrandStrategy = async (brand: string, ads: any[]) => {
  const brandAds = ads.filter(a => a.brand === brand);
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `### TASK
Generate a "Competitor Strategy Profile" for ${brand}.
Ads: ${JSON.stringify(brandAds)}

### GOAL
Analyze what the brand is optimizing for, their creative identity, and how they evolve.

### OUTPUT SCHEMA (JSON)
{
  "brand": "${brand}",
  "optimization_goal": "e.g., Education, Social Proof, Direct Conversion",
  "dominant_themes": ["Theme 1", "Theme 2"],
  "primary_hooks": ["Hook 1", "Hook 2"],
  "creative_identity": "Short description of their brand voice in ads",
  "format_preference": "e.g., 80% Video, 20% Static"
}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          brand: { type: Type.STRING },
          optimization_goal: { type: Type.STRING },
          dominant_themes: { type: Type.ARRAY, items: { type: Type.STRING } },
          primary_hooks: { type: Type.ARRAY, items: { type: Type.STRING } },
          creative_identity: { type: Type.STRING },
          format_preference: { type: Type.STRING },
        },
        required: ["brand", "optimization_goal", "dominant_themes", "primary_hooks", "creative_identity", "format_preference"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
};

export const scrapeCompetitorAds = async (existingAds: any[], targetBrand?: string) => {
  const brandContext = targetBrand ? `specifically for the brand "${targetBrand}"` : "for wellness brands (Mamaearth, Wellbeing Nutrition, Oziva, Boldfit, mCaffeine, The Moms Co, Pilgrim, Wow Skin Science, HealthKart, Nykaa Health)";
  
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `### ROLE
You are Aria, the AI Scraper for Maestro. Your task is to "discover" new competitor ads and marketing activities ${brandContext}.

### REAL-TIME SEARCH
Use your search tool to find the latest marketing news, ad campaigns, or brand activities ${brandContext} from the last 30 days.

### CONTEXT
Existing Ads: ${JSON.stringify(existingAds.map(a => ({ brand: a.brand, theme: a.theme })))}

### TASK
Based on your real-time search findings, generate 3 NEW, highly realistic ad objects that reflect what these competitors are actually doing right now. Ensure they have different hooks and themes than the existing ones.

### OUTPUT SCHEMA (JSON ARRAY)
[{
  "id": "unique_id",
  "brand": "Brand Name",
  "format": "video|static|carousel",
  "theme": "Theme Name",
  "tone": "expert|emotional|humorous|testimonial|clinical",
  "hook": "Opening line",
  "days_active": number (1-10),
  "proven": false,
  "copy": "Full ad copy",
  "summary": "Strategic summary based on real-time findings",
  "additional_signals": {
    "promise_type": "string",
    "objection_handling": "string",
    "cta_style": "string",
    "authority_signals": "string",
    "before_after": boolean,
    "urgency_framing": "string",
    "audience_persona": "string"
  }
}]`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            brand: { type: Type.STRING },
            format: { type: Type.STRING },
            theme: { type: Type.STRING },
            tone: { type: Type.STRING },
            hook: { type: Type.STRING },
            days_active: { type: Type.NUMBER },
            proven: { type: Type.BOOLEAN },
            copy: { type: Type.STRING },
            summary: { type: Type.STRING },
            additional_signals: {
              type: Type.OBJECT,
              properties: {
                promise_type: { type: Type.STRING },
                objection_handling: { type: Type.STRING },
                cta_style: { type: Type.STRING },
                authority_signals: { type: Type.STRING },
                before_after: { type: Type.BOOLEAN },
                urgency_framing: { type: Type.STRING },
                audience_persona: { type: Type.STRING },
              },
            },
          },
          required: ["id", "brand", "format", "theme", "tone", "hook", "days_active", "proven", "copy", "summary"],
        },
      },
    },
  });

  return JSON.parse(response.text || "[]");
};

export const ariaChat = async (message: string, context: any) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `You are Aria, the AI strategist inside Maestro. You analyze competitor advertising behavior.
    Context (Current Ads/Data): ${JSON.stringify(context)}
    User Message: ${message}
    
    Provide strategic insights, detect patterns, and support growth marketing decisions. Use your search tool if the user asks about real-time events, specific brand news, or current trends.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return response.text;
};
