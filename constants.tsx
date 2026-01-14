
import { Site, SiteStatus, Vendor } from './types.ts';

export const MOCK_SITES: Site[] = [
  {
    id: 'MNL-GLOBE-001',
    name: 'Makati Central Hub',
    region: 'NCR',
    coordinates: { lat: 14.5547, lng: 121.0244 },
    currentVendor: Vendor.HUAWEI,
    targetVendor: Vendor.ERICSSON,
    status: SiteStatus.IN_PROGRESS,
    lastUpdate: '2024-05-20',
    riskLevel: 'Low',
    progress: 35,
    equipment: [
      { id: 'EQ-101', type: 'BBU', vendor: Vendor.HUAWEI, model: 'BBU3900', serialNumber: 'SN-HA-9921' },
      { id: 'EQ-102', type: 'Radio', vendor: Vendor.HUAWEI, model: 'MRFU', serialNumber: 'SN-HA-1102' }
    ],
    tasks: [
      { id: '1', label: 'Site Survey & Pre-checks', isCompleted: true, assignedRole: 'Surveyor' },
      { id: '2', label: 'Equipment De-staging', isCompleted: true, assignedRole: 'Field Tech' },
      { id: '3', label: 'Ericsson Module Installation', isCompleted: false, assignedRole: 'Field Tech' },
      { id: '4', label: 'Fiber Re-patching', isCompleted: false, assignedRole: 'Rigger' },
      { id: '5', label: 'Integration & Testing', isCompleted: false, assignedRole: 'Core Engineer' },
      { id: '6', label: 'Acceptance Sign-off', isCompleted: false, assignedRole: 'Team Lead' },
    ]
  },
  {
    id: 'CEB-GLOBE-042',
    name: 'Cebu IT Park Node',
    region: 'Visayas',
    coordinates: { lat: 10.3302, lng: 123.9067 },
    currentVendor: Vendor.NOKIA,
    targetVendor: Vendor.ERICSSON,
    status: SiteStatus.PENDING,
    lastUpdate: '2024-05-18',
    riskLevel: 'Medium',
    progress: 0,
    equipment: [
      { id: 'EQ-201', type: 'BBU', vendor: Vendor.NOKIA, model: 'AirScale', serialNumber: 'SN-NK-8812' }
    ]
  },
  {
    id: 'DAV-GLOBE-099',
    name: 'Davao South Tower',
    region: 'Mindanao',
    coordinates: { lat: 7.0707, lng: 125.6087 },
    currentVendor: Vendor.HUAWEI,
    targetVendor: Vendor.ERICSSON,
    status: SiteStatus.COMPLETED,
    lastUpdate: '2024-05-15',
    riskLevel: 'Low',
    progress: 100,
    equipment: [
      { id: 'EQ-301', type: 'BBU', vendor: Vendor.ERICSSON, model: 'BB6630', serialNumber: 'SN-ER-4412' }
    ],
    tasks: [
      { id: '1', label: 'Site Survey & Pre-checks', isCompleted: true, assignedRole: 'Surveyor' },
      { id: '2', label: 'Equipment De-staging', isCompleted: true, assignedRole: 'Field Tech' },
      { id: '3', label: 'Ericsson Module Installation', isCompleted: true, assignedRole: 'Field Tech' },
      { id: '4', label: 'Fiber Re-patching', isCompleted: true, assignedRole: 'Rigger' },
      { id: '5', label: 'Integration & Testing', isCompleted: true, assignedRole: 'Core Engineer' },
      { id: '6', label: 'Acceptance Sign-off', isCompleted: true, assignedRole: 'Team Lead' },
    ]
  },
  {
    id: 'MNL-GLOBE-005',
    name: 'BGC North Sector',
    region: 'NCR',
    coordinates: { lat: 14.5409, lng: 121.0503 },
    currentVendor: Vendor.HUAWEI,
    targetVendor: Vendor.ERICSSON,
    status: SiteStatus.BLOCKED,
    lastUpdate: '2024-05-21',
    riskLevel: 'High',
    progress: 15,
    equipment: [
      { id: 'EQ-501', type: 'BBU', vendor: Vendor.HUAWEI, model: 'BBU3910', serialNumber: 'SN-HA-0012' }
    ]
  }
];
