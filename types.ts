
export enum Vendor {
  HUAWEI = 'Huawei',
  NOKIA = 'Nokia',
  ERICSSON = 'Ericsson'
}

export enum SiteStatus {
  PENDING = 'Pending',
  SURVEYED = 'Surveyed',
  PLANNED = 'Planned',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  BLOCKED = 'Blocked'
}

export enum UserRole {
  Admin = 'Admin',
  User = 'User'
}

export enum RiskLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string;
}

export interface DeploymentTask {
  id: string;
  site_id: string;
  label: string;
  is_completed: boolean;
  assigned_role: string;
  updated_at?: string;
}

export interface Equipment {
  id: string;
  site_id: string;
  type: string;
  vendor: Vendor;
  model: string;
  serial_number: string;
  installed_at?: string;
}

export interface TechnicalInstruction {
  task: string;
  estimatedDuration: string;
  safetyPrecaution: string;
}

export interface MilestoneEntry {
  plan?: string;
  actual?: string;
}

export interface SiteMilestones {
  survey: MilestoneEntry;
  survey_report: MilestoneEntry;
  installation: MilestoneEntry;
  integration: MilestoneEntry;
  completion_report: MilestoneEntry;
  site_close: MilestoneEntry;
}

export interface Site {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  current_vendor: Vendor.HUAWEI | Vendor.NOKIA;
  target_vendor: Vendor.ERICSSON;
  status: SiteStatus;
  risk_level: RiskLevel;
  progress: number;
  scheduled_date?: string;
  last_update: string;
  milestones: SiteMilestones;
  // UI-only aggregate fields
  equipment?: Equipment[];
  tasks?: DeploymentTask[];
  technicalInstructions?: {
    steps: TechnicalInstruction[];
    alerts: string[];
    generated_at: string;
  };
}
