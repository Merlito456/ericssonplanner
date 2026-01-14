
import { GoogleGenAI, Type } from "@google/genai";
import { Site } from "../types.ts";

export class GeminiService {
  // Utility to safely parse JSON from model responses
  private safeParse(text: string | undefined): any {
    if (!text) return null;
    try {
      // Remove potential markdown code blocks if the model includes them despite the mimeType config
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error("Failed to parse Gemini JSON response:", text);
      throw new Error("The AI returned an invalid data format. Please try again.");
    }
  }

  async analyzeProjectStatus(sites: Site[]) {
    // Create new instance as per guidelines to ensure it picks up the latest environment variables
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const summary = sites.map(s => ({
      id: s.id,
      vendor: s.currentVendor,
      status: s.status,
      risk: s.riskLevel,
      region: s.region
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following swap project data for Ericsson replacing Huawei/Nokia equipment for Globe Telecom. Provide strategic insights, risk mitigation plans, and priority sites.
      
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
            projectHealth: { type: Type.STRING, description: 'A health percentage score (e.g., "85%")' }
          },
          required: ["strategicInsights", "riskMitigation", "priorities", "projectHealth"]
        }
      }
    });

    return this.safeParse(response.text);
  }

  async generateDeploymentSchedule(sites: Site[]) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create an optimized 4-week deployment schedule for the following sites. Group by region and minimize travel time. Use ISO dates starting from today.
      Sites: ${JSON.stringify(sites.filter(s => s.status !== 'Completed').map(s => ({id: s.id, name: s.name, region: s.region})))}`,
      config: {
        systemInstruction: "You are a logistics expert specializing in telecommunications infrastructure rollouts. Return only valid JSON array.",
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a detailed technical swap plan for site ${site.id} (${site.name}). 
      Current Vendor: ${site.currentVendor}. Target: Ericsson. 
      Equipment: ${JSON.stringify(site.equipment)}.
      Provide a step-by-step procedure for the field technicians.`,
      config: {
        systemInstruction: "You are a senior Ericsson field engineer creating technical methods of procedure (MOP) for network equipment swaps. Return only valid JSON.",
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
