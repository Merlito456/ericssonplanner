
import { GoogleGenAI, Type } from "@google/genai";
import { Site } from "../types.ts";

export class GeminiService {
  private _ai: GoogleGenAI | null = null;

  // Lazy-init the AI client to prevent crashes during module evaluation
  private get ai(): GoogleGenAI {
    if (!this._ai) {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API Key is missing from process.env.API_KEY. Please ensure it is configured in your environment.");
      }
      this._ai = new GoogleGenAI({ apiKey });
    }
    return this._ai;
  }

  async analyzeProjectStatus(sites: Site[]) {
    const summary = sites.map(s => ({
      id: s.id,
      vendor: s.currentVendor,
      status: s.status,
      risk: s.riskLevel
    }));

    // Fix: Using systemInstruction for better persona control and adhering to property access guidelines
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze the following swap project data for Ericsson replacing Huawei/Nokia equipment for Globe Telecom. Provide strategic insights, risk mitigation plans, and priority sites.
      
      Data: ${JSON.stringify(summary)}`,
      config: {
        systemInstruction: "You are a world-class network deployment strategist. Provide concise, professional, and actionable insights based on site inventory data.",
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

    return JSON.parse(response.text || '{}');
  }

  async generateDeploymentSchedule(sites: Site[]) {
    // Fix: Using systemInstruction for scheduling optimization
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Create an optimized 4-week deployment schedule for the following sites. Group by region and minimize travel time. Use ISO dates starting from 2024-01-01.
      Sites: ${JSON.stringify(sites.filter(s => s.status !== 'Completed').map(s => ({id: s.id, name: s.name, region: s.region})))}`,
      config: {
        systemInstruction: "You are a logistics expert specializing in telecommunications infrastructure rollouts.",
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
    return JSON.parse(response.text || '[]');
  }

  async getSwapPlan(site: Site) {
    // Fix: Using systemInstruction for technical instruction generation
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Create a detailed technical swap plan for site ${site.id} (${site.name}). 
      Current Vendor: ${site.currentVendor}. Target: Ericsson. 
      Equipment to swap: ${JSON.stringify(site.equipment)}.
      Provide a step-by-step procedure for the field technicians.`,
      config: {
        systemInstruction: "You are a senior Ericsson field engineer creating technical methods of procedure (MOP) for network equipment swaps.",
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

    return JSON.parse(response.text || '{}');
  }
}

export const geminiService = new GeminiService();
