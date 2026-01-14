
import { Site, SiteStatus, Vendor, RiskLevel } from './types.ts';

// Fix: Updated mock data property names to match snake_case interface definitions and flattened coordinates
// Fix: Added required 'milestones' property to all mock sites to resolve property missing errors
export const MOCK_SITES: Site[] = [
  {
    id: 'MNL-GLOBE-001',
    name: 'Makati Central Hub',
    region: 'NCR',
    lat: 14.5547,
    lng: 121.0244,
    current_vendor: Vendor.HUAWEI,
    target_vendor: Vendor.ERICSSON,
    status: SiteStatus.IN_PROGRESS,
    last_update: '2024-05-20',
    risk_level: RiskLevel.Low,
    progress: 35,
    // Fix: Added milestones property to satisfy Site interface
    milestones: {
      survey: { plan: '2024-05-01', actual: '2024-05-02' },
      survey_report: { plan: '2024-05-05', actual: '2024-05-07' },
      installation: { plan: '2024-05-15', actual: '' },
      integration: { plan: '2024-05-20', actual: '' },
      completion_report: { plan: '2024-05-25', actual: '' },
      site_close: { plan: '2024-05-30', actual: '' },
    },
    equipment: [
      { id: 'EQ-101', site_id: 'MNL-GLOBE-001', type: 'BBU', vendor: Vendor.HUAWEI, model: 'BBU3900', serial_number: 'SN-HA-9921' },
      { id: 'EQ-102', site_id: 'MNL-GLOBE-001', type: 'Radio', vendor: Vendor.HUAWEI, model: 'MRFU', serial_number: 'SN-HA-1102' }
    ],
    tasks: [
      { id: '1', site_id: 'MNL-GLOBE-001', label: 'Site Survey & Pre-checks', is_completed: true, assigned_role: 'Surveyor' },
      { id: '2', site_id: 'MNL-GLOBE-001', label: 'Equipment De-staging', is_completed: true, assigned_role: 'Field Tech' },
      { id: '3', site_id: 'MNL-GLOBE-001', label: 'Ericsson Module Installation', is_completed: false, assigned_role: 'Field Tech' },
      { id: '4', site_id: 'MNL-GLOBE-001', label: 'Fiber Re-patching', is_completed: false, assigned_role: 'Rigger' },
      { id: '5', site_id: 'MNL-GLOBE-001', label: 'Integration & Testing', is_completed: false, assigned_role: 'Core Engineer' },
      { id: '6', site_id: 'MNL-GLOBE-001', label: 'Acceptance Sign-off', is_completed: false, assigned_role: 'Team Lead' },
    ]
  },
  {
    id: 'CEB-GLOBE-042',
    name: 'Cebu IT Park Node',
    region: 'Visayas',
    lat: 10.3302,
    lng: 123.9067,
    current_vendor: Vendor.NOKIA,
    target_vendor: Vendor.ERICSSON,
    status: SiteStatus.PENDING,
    last_update: '2024-05-18',
    risk_level: RiskLevel.Medium,
    progress: 0,
    // Fix: Added milestones property to satisfy Site interface
    milestones: {
      survey: { plan: '2024-06-01', actual: '' },
      survey_report: { plan: '2024-06-05', actual: '' },
      installation: { plan: '2024-06-15', actual: '' },
      integration: { plan: '2024-06-20', actual: '' },
      completion_report: { plan: '2024-06-25', actual: '' },
      site_close: { plan: '2024-06-30', actual: '' },
    },
    equipment: [
      { id: 'EQ-201', site_id: 'CEB-GLOBE-042', type: 'BBU', vendor: Vendor.NOKIA, model: 'AirScale', serial_number: 'SN-NK-8812' }
    ]
  },
  {
    id: 'DAV-GLOBE-099',
    name: 'Davao South Tower',
    region: 'Mindanao',
    lat: 7.0707,
    lng: 125.6087,
    current_vendor: Vendor.HUAWEI,
    target_vendor: Vendor.ERICSSON,
    status: SiteStatus.COMPLETED,
    last_update: '2024-05-15',
    risk_level: RiskLevel.Low,
    progress: 100,
    // Fix: Added milestones property to satisfy Site interface
    milestones: {
      survey: { plan: '2024-04-01', actual: '2024-04-02' },
      survey_report: { plan: '2024-04-05', actual: '2024-04-06' },
      installation: { plan: '2024-04-15', actual: '2024-04-16' },
      integration: { plan: '2024-04-20', actual: '2024-04-21' },
      completion_report: { plan: '2024-04-25', actual: '2024-04-26' },
      site_close: { plan: '2024-04-30', actual: '2024-04-30' },
    },
    equipment: [
      { id: 'EQ-301', site_id: 'DAV-GLOBE-099', type: 'BBU', vendor: Vendor.ERICSSON, model: 'BB6630', serial_number: 'SN-ER-4412' }
    ],
    tasks: [
      { id: '1', site_id: 'DAV-GLOBE-099', label: 'Site Survey & Pre-checks', is_completed: true, assigned_role: 'Surveyor' },
      { id: '2', site_id: 'DAV-GLOBE-099', label: 'Equipment De-staging', is_completed: true, assigned_role: 'Field Tech' },
      { id: '3', site_id: 'DAV-GLOBE-099', label: 'Ericsson Module Installation', is_completed: true, assigned_role: 'Field Tech' },
      { id: '4', site_id: 'DAV-GLOBE-099', label: 'Fiber Re-patching', is_completed: true, assigned_role: 'Rigger' },
      { id: '5', site_id: 'DAV-GLOBE-099', label: 'Integration & Testing', is_completed: true, assigned_role: 'Core Engineer' },
      { id: '6', site_id: 'DAV-GLOBE-099', label: 'Acceptance Sign-off', is_completed: true, assigned_role: 'Team Lead' },
    ]
  },
  {
    id: 'MNL-GLOBE-005',
    name: 'BGC North Sector',
    region: 'NCR',
    lat: 14.5409,
    lng: 121.0503,
    current_vendor: Vendor.HUAWEI,
    target_vendor: Vendor.ERICSSON,
    status: SiteStatus.BLOCKED,
    last_update: '2024-05-21',
    risk_level: RiskLevel.High,
    progress: 15,
    // Fix: Added milestones property to satisfy Site interface
    milestones: {
      survey: { plan: '2024-05-10', actual: '2024-05-12' },
      survey_report: { plan: '2024-05-15', actual: '' },
      installation: { plan: '2024-05-25', actual: '' },
      integration: { plan: '2024-06-01', actual: '' },
      completion_report: { plan: '2024-06-05', actual: '' },
      site_close: { plan: '2024-06-10', actual: '' },
    },
    equipment: [
      { id: 'EQ-501', site_id: 'MNL-GLOBE-005', type: 'BBU', vendor: Vendor.HUAWEI, model: 'BBU3910', serial_number: 'SN-HA-0012' }
    ]
  }
];
