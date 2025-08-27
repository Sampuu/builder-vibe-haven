/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Base interface for all reports
 */
export interface BaseReport {
  id: string;
  title: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  contactName: string;
  contactPhone: string;
  images?: string[];
  status: 'submitted' | 'acknowledged' | 'in-progress' | 'resolved';
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  problemType: ReportProblemType;
}

/**
 * Problem types that determine which collection to use
 */
export type ReportProblemType = 'hospital' | 'fire' | 'police' | 'ambulance' | 'general';

/**
 * Hospital-specific reports
 */
export interface HospitalReport extends BaseReport {
  problemType: 'hospital';
  medicalType: 'equipment' | 'staff_shortage' | 'supplies' | 'patient_overflow' | 'other';
  priorityLevel: 'routine' | 'urgent' | 'emergency';
  departmentAffected?: string;
  estimatedPatientsAffected?: number;
}

/**
 * Fire-related reports
 */
export interface FireReport extends BaseReport {
  problemType: 'fire';
  fireType: 'building' | 'wildfire' | 'vehicle' | 'hazmat' | 'explosion' | 'other';
  buildingType?: 'residential' | 'commercial' | 'industrial' | 'other';
  smokeVisible: boolean;
  flamesVisible: boolean;
  peopleTrapped?: boolean;
  estimatedSize?: string;
}

/**
 * Police-related reports
 */
export interface PoliceReport extends BaseReport {
  problemType: 'police';
  crimeType: 'theft' | 'assault' | 'vandalism' | 'domestic' | 'traffic' | 'suspicious' | 'other';
  inProgress: boolean;
  suspectPresent: boolean;
  weaponsInvolved?: boolean;
  victimsCount?: number;
  witnessesCount?: number;
}

/**
 * Ambulance/Medical emergency reports
 */
export interface AmbulanceRequest extends BaseReport {
  problemType: 'ambulance';
  emergencyType: 'cardiac' | 'respiratory' | 'trauma' | 'overdose' | 'stroke' | 'childbirth' | 'other';
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  consciousnessLevel: 'conscious' | 'unconscious' | 'semi-conscious' | 'unknown';
  breathing: 'normal' | 'difficulty' | 'not_breathing' | 'unknown';
  needsImmediateAttention: boolean;
}

/**
 * General user reports
 */
export interface GeneralUserReport extends BaseReport {
  problemType: 'general';
  category: 'infrastructure' | 'environmental' | 'public_safety' | 'utilities' | 'other';
  affectedPeople?: number;
  urgencyLevel: 'low' | 'medium' | 'high';
}

/**
 * Union type for all possible reports
 */
export type AnyReport = HospitalReport | FireReport | PoliceReport | AmbulanceRequest | GeneralUserReport;

/**
 * Collection names mapping
 */
export const COLLECTION_NAMES = {
  hospital: 'hospitalReports',
  fire: 'fireReports',
  police: 'policeReports',
  ambulance: 'ambulanceRequests',
  general: 'generalUserReports'
} as const;

/**
 * Get collection name from problem type
 */
export function getCollectionName(problemType: ReportProblemType): string {
  return COLLECTION_NAMES[problemType];
}

/**
 * Report submission request interface
 */
export interface SubmitReportRequest {
  report: Omit<AnyReport, 'id' | 'timestamp' | 'status'>;
}

/**
 * Report submission response interface
 */
export interface SubmitReportResponse {
  success: boolean;
  reportId?: string;
  error?: string;
}
