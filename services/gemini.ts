
import { GoogleGenAI, Type } from "@google/genai";
import { Site } from "../types.ts";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Fix: Always use process.env.API_KEY directly in the constructor as per SDK guidelines
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  async analyzeProjectStatus(sites: Site[]) {
    const summary = sites.map(s => ({
      id: s.id,
      vendor: s.currentVendor,
      status: s.status,
      risk: s.riskLevel
    }));

    // Use gemini-3-pro-preview for complex strategic analysis and reasoning
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze the following swap project data for Ericsson replacing Huawei/Nokia equipment for Globe Telecom. Provide strategic insights, risk mitigation plans, and priority sites.
      
      Data: ${JSON.stringify(summary)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strategicInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
            riskMitigation: { type: Type.ARRAY, items: { type: Type.STRING } },
            priorities: { type: Type.ARRAY, items: { type: Type.STRING } },
            projectHealth: { type: Type.STRING, description: 'Percentage or qualitative health score' }
          },
          required: ["strategicInsights", "riskMitigation", "priorities", "projectHealth"]
        }
      }
    });

    // Fix: Directly access the .text property of GenerateContentResponse
    return JSON.parse(response.text || '{}');
  }

  async generateDeploymentSchedule(sites: Site[]) {
    // Use gemini-3-pro-preview for optimization and scheduling tasks
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Create an optimized 4-week deployment schedule for the following sites. Group by region and minimize travel time. Use ISO dates starting from 2024-01-01.
      Sites: ${JSON.stringify(sites.filter(s => s.status !== 'Completed').map(s => ({id: s.id, name: s.name, region: s.region})))}`,
      config: {
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
    // Fix: Directly access the .text property
    return JSON.parse(response.text || '[]');
  }

  async getSwapPlan(site: Site) {
    // Use gemini-3-pro-preview for detailed technical task generation
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Create a detailed technical swap plan for site ${site.id} (${site.name}). 
      Current Vendor: ${site.currentVendor}. Target: Ericsson. 
      Equipment to swap: ${JSON.stringify(site.equipment)}.
      Provide a step-by-step procedure for the field technicians.`,
      config: {
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

    // Fix: Directly access the .text property
    return JSON.parse(response.text || '{}');
  }
}

export const geminiService = new GeminiService();
