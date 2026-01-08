
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { FactCheckResult, GroundingSource } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async analyzeArticle(content: string): Promise<FactCheckResult> {
    const prompt = `
      You are an expert investigative journalist and professional fact-checker for a world-class news organization. 
      Analyze the following text for factual accuracy, political bias, logical fallacies, and sensationalism.
      
      Structure your response exactly as follows:
      1. **Credibility Score**: Provide a score from 0 to 100 (where 100 is perfectly factual).
      2. **Key Findings**: A bulleted list of 3-5 critical observations about the text's veracity.
      3. **Bias Assessment**: Analyze the political or commercial bias.
      4. **Verification Details**: Explain which parts are confirmed by external sources and which parts are disputed or unsupported.
      5. **Conclusion**: A final verdict (e.g., Verified, Partially False, Misleading, Satire, or Fake).

      ---
      TEXT TO ANALYZE:
      ${content}
    `;

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "No analysis provided.";
      
      // Extract grounding sources
      const sources: GroundingSource[] = [];
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      if (groundingChunks) {
        groundingChunks.forEach((chunk: any) => {
          if (chunk.web && chunk.web.uri) {
            sources.push({
              title: chunk.web.title || "Reference Source",
              uri: chunk.web.uri
            });
          }
        });
      }

      // De-duplicate sources
      const uniqueSources = Array.from(new Set(sources.map(s => s.uri)))
        .map(uri => sources.find(s => s.uri === uri) as GroundingSource);

      return {
        text,
        sources: uniqueSources,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      throw new Error("Failed to analyze article. Please check your API key and try again.");
    }
  }
}

export const geminiService = new GeminiService();
