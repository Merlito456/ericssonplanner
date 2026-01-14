
import { Site, SiteStatus, Vendor, RiskLevel } from "../types.ts";

/**
 * Local Strategy Engine
 * Replaces Cloud Gemini AI with deterministic local logic for offline field operations.
 * Mimics the intelligence requirements for the Ericsson-Globe swap project.
 */
export class StrategyEngine {
  
  async analyzeProjectStatus(sites: Site[]) {
    // Artificial delay to simulate computation
    await new Promise(resolve => setTimeout(resolve, 800));

    const total = sites.length;
    if (total === 0) return this.getEmptyState();

    const completed = sites.filter(s => s.status === SiteStatus.COMPLETED).length;
    const blocked = sites.filter(s => s.status === SiteStatus.BLOCKED).length;
    // Fix: Use correct property name risk_level
    const highRisk = sites.filter(s => s.risk_level === RiskLevel.High).length;
    const healthScore = Math.round(((completed + (total - blocked - highRisk) * 0.5) / total) * 100);

    const insights = [
      `Localized analysis of ${total} nodes completed.`,
      blocked > 0 ? `Critical: ${blocked} sites are currently in BLOCKED status. Immediate field intervention required.` : "No critical path blockages detected.",
      highRisk > 1 ? `High-risk density detected in ${this.getDenseRegion(sites)}. Logistics buffer should be increased.` : "Supply chain parameters remain within nominal limits."
    ];

    const risks = [
      "Interoperability issues between Legacy Huawei BBU and Ericsson Radio 4415.",
      "Extreme weather window affecting Visayas/Mindanao tower climbs.",
      "Fiber backhaul capacity limitations during dual-stack operation."
    ];

    // Fix: Use correct property name risk_level
    const priorities = sites
      .filter(s => s.status !== SiteStatus.COMPLETED)
      .sort((a, b) => (b.risk_level === RiskLevel.High ? 1 : -1))
      .slice(0, 3)
      .map(s => `Site ${s.id}: ${s.name} (${s.risk_level} Risk)`);

    return {
      strategicInsights: insights,
      riskMitigation: risks,
      priorities: priorities,
      projectHealth: `${healthScore}%`
    };
  }

  async generateDeploymentSchedule(sites: Site[]) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const today = new Date();
    
    return sites
      .filter(s => s.status !== SiteStatus.COMPLETED)
      .map((s, i) => {
        const scheduledDate = new Date(today);
        scheduledDate.setDate(today.getDate() + (Math.floor(i / 2) * 2)); // 2 sites per 2 days
        return {
          siteId: s.id,
          scheduledDate: scheduledDate.toISOString().split('T')[0],
          rationale: `Regional cluster optimization for ${s.region}.`
        };
      });
  }

  async getSwapPlan(site: Site) {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Fix: Use correct property name current_vendor
    const isHuawei = site.current_vendor === Vendor.HUAWEI;
    
    const steps = [
      { task: "On-site safety briefing and PPE check", estimatedDuration: "30m", safetyPrecaution: "Climbing gear inspection" },
      // Fix: Use correct property name current_vendor
      { task: `De-commissioning of legacy ${site.current_vendor} ${isHuawei ? 'BBU3900' : 'Flexi'} cabinet`, estimatedDuration: "2h", safetyPrecaution: "Power isolation protocols" },
      { task: "Installation of Ericsson Baseband 6630 and Router 6000", estimatedDuration: "3h", safetyPrecaution: "Static discharge prevention" },
      { task: "Radio 4415 installation and fiber re-termination", estimatedDuration: "4h", safetyPrecaution: "RF radiation safety distance" },
      { task: "Call test and Core Network integration", estimatedDuration: "2h", safetyPrecaution: "Data session verification" }
    ];

    return {
      steps: steps,
      criticalAlerts: [
        "Check 4G/5G cross-layer mapping parameters.",
        "Verify legacy antenna tilt before final handover.",
        "Ensure grounding is bonded to the main ring."
      ]
    };
  }

  private getDenseRegion(sites: Site[]): string {
    const regions: Record<string, number> = {};
    sites.forEach(s => { regions[s.region] = (regions[s.region] || 0) + 1; });
    return Object.entries(regions).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown";
  }

  private getEmptyState() {
    return {
      strategicInsights: ["Inventory empty. Please add sites to begin analysis."],
      riskMitigation: ["None"],
      priorities: ["None"],
      projectHealth: "0%"
    };
  }
}

export const strategyEngine = new StrategyEngine();
