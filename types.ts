
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
  ADMIN = 'Admin',
  USER = 'User'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string; // Only for simulation
}

export interface DeploymentTask {
  id: string;
  label: string;
  isCompleted: boolean;
  assignedRole: string;
  timestamp?: string;
}

export interface Equipment {
  id: string;
  type: string;
  vendor: Vendor;
  model: string;
  serialNumber: string;
}

export interface TechnicalInstruction {
  task: string;
  estimatedDuration: string;
  safetyPrecaution: string;
}

export interface Site {
  id: string;
  name: string;
  region: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  currentVendor: Vendor.HUAWEI | Vendor.NOKIA;
  targetVendor: Vendor.ERICSSON;
  status: SiteStatus;
  lastUpdate: string;
  equipment: Equipment[];
  riskLevel: 'Low' | 'Medium' | 'High';
  scheduledDate?: string;
  assignedTeam?: string;
  progress?: number;
  tasks?: DeploymentTask[];
  technicalInstructions?: {
    steps: TechnicalInstruction[];
    alerts: string[];
    generatedAt: string;
  };
}
