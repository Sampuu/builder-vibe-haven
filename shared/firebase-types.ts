// User roles in the rescue system
export type UserRole =
  | "user"
  | "police"
  | "ambulance"
  | "fireBrigade"
  | "hospital"
  | "admin";

// User profile interface
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  contact: string;
  createdAt: Date;
  updatedAt: Date;
  emergencyRequests?: string[];
}

// Police report interface
export interface PoliceReport {
  reportId: string;
  officerId: string;
  officerName: string;
  details: string;
  status: "open" | "in_progress" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  location: string;
  timestamp: Date;
  caseUpdates?: CaseUpdate[];
}

export interface CaseUpdate {
  updateId: string;
  description: string;
  timestamp: Date;
  updatedBy: string;
}

// Ambulance request interface
export interface AmbulanceRequest {
  requestId: string;
  patientName: string;
  emergencyType: string;
  location: string;
  dispatchedAmbulanceId?: string;
  status: "requested" | "dispatched" | "en_route" | "arrived" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  requestedBy: string;
  timestamp: Date;
  hospitalDestination?: string;
}

// Fire brigade report interface
export interface FireBrigadeReport {
  reportId: string;
  fireStationId: string;
  incidentType: "fire" | "rescue" | "hazmat" | "natural_disaster";
  location: string;
  severity: "minor" | "moderate" | "major" | "critical";
  status: "reported" | "responding" | "on_scene" | "controlled" | "resolved";
  timestamp: Date;
  assignedTeam: string;
  description: string;
  casualties?: number;
  evacuated?: number;
}

// Hospital record interface
export interface HospitalRecord {
  recordId: string;
  hospitalId: string;
  hospitalName: string;
  availableBeds: number;
  totalBeds: number;
  emergencyCapacity: number;
  specialties: string[];
  contact: string;
  location: string;
  status: "operational" | "full" | "emergency_only" | "closed";
  lastUpdated: Date;
  patientRecords?: PatientRecord[];
}

export interface PatientRecord {
  patientId: string;
  name: string;
  condition: string;
  admissionDate: Date;
  status: "admitted" | "discharged" | "transferred";
  emergencyContact: string;
}

// Admin logs interface
export interface AdminLog {
  logId: string;
  adminId: string;
  action: string;
  targetUser?: string;
  details: string;
  timestamp: Date;
  category:
    | "user_management"
    | "system_config"
    | "emergency_response"
    | "audit";
}

// Emergency request interface
export interface EmergencyRequest {
  requestId: string;
  userId: string;
  userName: string;
  type: "police" | "ambulance" | "fire" | "general";
  description: string;
  location: string;
  urgency: "low" | "medium" | "high" | "critical";
  status: "pending" | "assigned" | "in_progress" | "resolved" | "cancelled";
  timestamp: Date;
  assignedTo?: string;
  responseTime?: Date;
}
