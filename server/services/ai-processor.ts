import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface ExtractedContent {
  characters: Array<{
    name: string;
    race?: string;
    characterClass?: string;
    alignment?: string;
    isNPC: boolean;
    biography?: string;
  }>;
  events: Array<{
    title: string;
    description: string;
    gameDate?: string;
    eventType: string;
    linkedCharacters: string[];
  }>;
  plots: Array<{
    title: string;
    description: string;
    plotType: string;
    linkedCharacters: string[];
  }>;
  lore: Array<{
    title: string;
    content: string;
    category: string;
    tags: string[];
  }>;
}

export async function processDocumentWithAI(
  content: string,
  options: {
    extractCharacters: boolean;
    extractEvents: boolean;
    extractPlots: boolean;
    extractLore: boolean;
  }
): Promise<ExtractedContent> {
  try {
    const systemPrompt = `You are an expert D&D campaign analyzer. Extract structured information from campaign notes and return it as JSON.

Instructions:
- Extract only information that is explicitly mentioned in the text
- For characters, identify both player characters and NPCs
- For events, focus on significant plot points, battles, discoveries, and roleplay moments
- For plots, identify main questlines, subplots, and story arcs
- For lore, extract world-building elements like locations, history, religions, cultures
- Use appropriate D&D terminology and classifications
- Return empty arrays for categories that have no relevant content

Return JSON in this exact format:
{
  "characters": [{"name": "string", "race": "string", "characterClass": "string", "alignment": "string", "isNPC": boolean, "biography": "string"}],
  "events": [{"title": "string", "description": "string", "gameDate": "string", "eventType": "string", "linkedCharacters": ["string"]}],
  "plots": [{"title": "string", "description": "string", "plotType": "string", "linkedCharacters": ["string"]}],
  "lore": [{"title": "string", "content": "string", "category": "string", "tags": ["string"]}]
}

Event types: combat, roleplay, discovery, travel, rest, other
Plot types: main, subplot, side-quest
Lore categories: location, history, religion, culture, organization, artifact, other`;

    const userPrompt = `Analyze this D&D campaign content and extract information based on these options:
- Extract characters: ${options.extractCharacters}
- Extract events: ${options.extractEvents}  
- Extract plots: ${options.extractPlots}
- Extract lore: ${options.extractLore}

Campaign content:
${content}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      characters: options.extractCharacters ? (result.characters || []) : [],
      events: options.extractEvents ? (result.events || []) : [],
      plots: options.extractPlots ? (result.plots || []) : [],
      lore: options.extractLore ? (result.lore || []) : [],
    };
  } catch (error) {
    console.error("AI processing failed:", error);
    throw new Error(`Failed to process document with AI: ${error.message}`);
  }
}

export async function generateAISuggestions(
  recentEvents: Array<{ title: string; description: string; linkedCharacters: string[] }>,
  characters: Array<{ name: string; appearanceCount: string }>,
  plots: Array<{ title: string; status: string }>
): Promise<Array<{ type: string; title: string; description: string; priority: string }>> {
  try {
    const systemPrompt = `You are a D&D campaign assistant. Analyze recent campaign activity and generate helpful suggestions for the DM.

Focus on:
- Plot connections and potential hooks
- Character development opportunities  
- Story consistency and continuity
- Missing narrative elements

Return JSON with an array of suggestions:
{
  "suggestions": [
    {
      "type": "plot_connection|character_development|story_hook|consistency_check",
      "title": "Brief suggestion title",
      "description": "Detailed explanation and actionable advice",
      "priority": "high|medium|low"
    }
  ]
}`;

    const analysisData = {
      recentEvents: recentEvents.slice(0, 10),
      activeCharacters: characters.filter(c => parseInt(c.appearanceCount) > 0),
      activePlots: plots.filter(p => p.status === "active")
    };

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this campaign data and provide 2-4 actionable suggestions: ${JSON.stringify(analysisData)}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.suggestions || [];
  } catch (error) {
    console.error("AI suggestion generation failed:", error);
    return [];
  }
}
