export type ContainerSize = '20GP' | '40GP' | '40HC' | '45HC' | '20RF' | '40RF' | '20TK' | '40OT' | '40FR';

export type ContainerStatus = 
  | 'GATE_IN' 
  | 'YARD_STACKING' 
  | 'CUSTOMS_HOLD' 
  | 'CUSTOMS_CLEARED' 
  | 'VESSEL_LOADING' 
  | 'VESSEL_DISCHARGED' 
  | 'GATE_OUT';

export type ContainerCategory = 'EKSPOR' | 'IMPOR' | 'TRANSSHIPMENT' | 'DOMESTIK';

export type DangerClass = 'NON_DG' | 'CLASS_3_FLAMMABLE' | 'CLASS_8_CORROSIVE' | 'CLASS_6_TOXIC' | 'CLASS_9_MISC';

export interface YardLocation {
  block: string; // e.g., 'A', 'B', 'C', 'D'
  bay: string;   // e.g., '01' - '20'
  row: string;   // e.g., '01' - '06'
  tier: string;  // e.g., '01' - '05'
}

export interface Container {
  id: string; // Firestore document ID
  containerNumber: string; // ISO 6346 format: 4 letters + 7 digits (e.g., MSKU1234567)
  isoType: ContainerSize;
  teu: number; // 20ft = 1, 40ft/45ft = 2
  status: ContainerStatus;
  category: ContainerCategory;
  grossWeightKg: number;
  tareWeightKg: number;
  payloadKg: number;
  vgmVerified: boolean;
  sealNumber: string;
  shippingLine: string; // e.g., Maersk, Evergreen, Meratus, Spil, Samudera
  vesselName: string;
  voyageNumber: string;
  yardLocation: YardLocation;
  isReefer: boolean;
  temperatureCelsius?: number | null;
  dangerClass: DangerClass;
  shipper: string;
  consignee: string;
  gateInTime: string; // ISO String
  gateOutTime?: string | null;
  truckPlateNumber?: string;
  driverName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface TerminalStats {
  totalContainers: number;
  totalTeus: number;
  yardOccupancyPercent: number;
  gateInToday: number;
  gateOutToday: number;
  customsHoldCount: number;
  reeferCount: number;
  dgCount: number;
}

export interface AuditLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'RELOCATE' | 'GATE_OUT';
  containerNumber: string;
  description: string;
  performedBy: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'SUPER_ADMIN' | 'YARD_OPERATOR' | 'GATE_OPERATOR' | 'VESSEL_PLANNER';
  badgeNumber: string;
}
