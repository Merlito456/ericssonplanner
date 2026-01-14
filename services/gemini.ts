
import { GoogleGenAI, Type } from "@google/genai";
import { Site } from "../types.ts";

export class GeminiService {
  /**
   * Safe parser for Gemini JSON responses.
   * Handles cases where the model might wrap JSON in markdown blocks.
   */
  private safeParse(text: string | undefined): any {
    if (!text) return null;
    try {
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error("Gemini JSON Parse Error:", text);
      throw new Error("AI intelligence cluster returned non-standard data. Please re-run synthesis.");
    }
  }

  /**
   * Initializes a fresh client for every request.
   * This is critical for picking up keys selected via the openSelectKey() dialog.
   */
  private getClient(): GoogleGenAI {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error(
        "AI Core Offline: No API key detected. Please use the 'Connect AI' button in the sidebar."
      );
    }
    return new GoogleGenAI({ apiKey });
  }

  async analyzeProjectStatus(sites: Site[]) {
    const ai = this.getClient();
    const summary = sites.map(s => ({
      id: s.id,
      vendor: s.currentVendor,
      status: s.status,
      risk: s.riskLevel,
      region: s.region
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze site swap project data for Ericsson/Globe Telecom. Provide strategic insights, risk mitigation, and priority sites.
      
      Data: ${JSON.stringify(summary)}`,
      config: {
        systemInstruction: "You are a world-class network deployment strategist for Ericsson. Analyze site data and provide actionable technical and logistics insights. Return only valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strategicInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
            riskMitigation: { type: Type.ARRAY, items: { type: Type.STRING } },
            priorities: { type: Type.ARRAY, items: { type: Type.STRING } },
            projectHealth: { type: Type.STRING, description: 'Percentage score, e.g. "85%"' }
          },
          required: ["strategicInsights", "riskMitigation", "priorities", "projectHealth"]
        }
      }
    });

    return this.safeParse(response.text);
  }

  async generateDeploymentSchedule(sites: Site[]) {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create an optimized 4-week deployment schedule for these sites. Use ISO dates starting today.
      Sites: ${JSON.stringify(sites.filter(s => s.status !== 'Completed').map(s => ({id: s.id, name: s.name, region: s.region})))}`,
      config: {
        systemInstruction: "You are a logistics expert for telecom rollouts. Return valid JSON array.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              siteId: { type: Type.STRING },
              scheduledDate: { type: Type.STRING },
              rationale: { type: Type.STRING }
            },
            required: ["siteId", "scheduledDate", "rationale"]
          }
        }
      }
    });
    return this.safeParse(response.text);
  }

  async getSwapPlan(site: Site) {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create technical swap plan for site ${site.id}. Target: Ericsson. Equipment: ${JSON.stringify(site.equipment)}.`,
      config: {
        systemInstruction: "Senior Ericsson engineer creating MOP for equipment swaps. Return valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  task: { type: Type.STRING },
                  estimatedDuration: { type: Type.STRING },
                  safetyPrecaution: { type: Type.STRING }
                },
                required: ["task", "estimatedDuration", "safetyPrecaution"]
              }
            },
            criticalAlerts: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["steps", "criticalAlerts"]
        }
      }
    });

    return this.safeParse(response.text);
  }
}

export const geminiService = new GeminiService();
