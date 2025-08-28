// Comprehensive Role-Based Database Types for 6 Main Collections

export type EmergencyType = 'fire' | 'medical' | 'traffic_accident' | 'flood' | 'earthquake' | 'other';
export type EmergencyPriority = 'low' | 'medium' | 'high' | 'critical';
export type EmergencyStatus = 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'cancelled';

// Common location interface
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

// =================== USERS COLLECTION ===================
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'user' | 'police' | 'ambulance' | 'fireBrigade' | 'hospital' | 'admin';
  contact: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  profilePicture?: string;
}

// Users Sub-Collections
export interface UserReportDisaster {
  reportId: string;
  userId: string;
  userName: string;
  type: EmergencyType;
  location: Location;
  description: string;
  severity: EmergencyPriority;
  status: EmergencyStatus;
  timestamp: Date;
  contact: string;
  forwardedTo: string[]; // Which role collections this was forwarded to
  responseTime?: Date;
  resolvedAt?: Date;
}

export interface UserRequestHelp {
  requestId: string;
  userId: string;
  userName: string;
  helpType: 'medical' | 'supplies' | 'rescue' | 'evacuation' | 'other';
  details: string;
  urgency: EmergencyPriority;
  status: EmergencyStatus;
  location: Location;
  timestamp: Date;
  contact: string;
  assignedTo?: string;
  responseTime?: Date;
}

export interface UserViewMap {
  incidentId: string;
  type: EmergencyType;
  location: Location;
  severity: EmergencyPriority;
  status: 'active' | 'resolved' | 'monitoring';
  reportedBy: string;
  reporterName: string;
  timestamp: Date;
  description: string;
  lastUpdated: Date;
}

export interface UserDisasterNews {
  newsId: string;
  userId: string;
  authorName: string;
  title: string;
  content: string;
  category: 'emergency_alert' | 'safety_tips' | 'incident_update' | 'general_info';
  timestamp: Date;
  location?: Location;
  tags?: string[];
  priority: EmergencyPriority;
  isVerified: boolean;
  viewCount: number;
}

// =================== POLICE COLLECTION ===================
export interface PoliceProfile {
  uid: string;
  name: string;
  email: string;
  badgeNumber: string;
  rank: string;
  station: string;
  contact: string;
  isOnDuty: boolean;
  specializations: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Police Sub-Collections
export interface PoliceReport {
  reportId: string;
  officerId: string;
  officerName: string;
  incidentType: EmergencyType;
  location: Location;
  description: string;
  priority: EmergencyPriority;
  status: EmergencyStatus;
  timestamp: Date;
  involvedParties?: string[];
  evidenceFiles?: string[];
  relatedIncidents?: string[];
  sourceReportId?: string; // If forwarded from user report
}

export interface PoliceCaseUpdate {
  updateId: string;
  reportId: string;
  officerId: string;
  updateDescription: string;
  status: EmergencyStatus;
  timestamp: Date;
  nextActions?: string;
  attachments?: string[];
}

// =================== AMBULANCE COLLECTION ===================
export interface AmbulanceProfile {
  uid: string;
  name: string;
  email: string;
  employeeId: string;
  vehicleNumber: string;
  currentLocation?: Location;
  isAvailable: boolean;
  specializations: string[];
  contact: string;
  createdAt: Date;
  updatedAt: Date;
}

// Ambulance Sub-Collections
export interface AmbulanceRequest {
  requestId: string;
  patientName?: string;
  emergencyType: 'medical' | 'accident' | 'transport';
  location: Location;
  description: string;
  priority: EmergencyPriority;
  status: EmergencyStatus;
  requestedBy: string;
  timestamp: Date;
  assignedAmbulanceId?: string;
  assignedParamedicId?: string;
  hospitalDestination?: string;
  responseTime?: Date;
  arrivalTime?: Date;
  transportTime?: Date;
  sourceReportId?: string; // If forwarded from user report
}

export interface AmbulanceDispatchLog {
  logId: string;
  requestId: string;
  ambulanceId: string;
  paramedicId: string;
  dispatchTime: Date;
  status: 'dispatched' | 'en_route' | 'on_scene' | 'transporting' | 'completed';
  location: Location;
  notes?: string;
  mileage?: number;
}

// =================== FIRE BRIGADE COLLECTION ===================
export interface FireBrigadeProfile {
  uid: string;
  name: string;
  email: string;
  firefighterId: string;
  rank: string;
  station: string;
  isOnDuty: boolean;
  specializations: string[];
  contact: string;
  createdAt: Date;
  updatedAt: Date;
}

// Fire Brigade Sub-Collections
export interface FireIncident {
  incidentId: string;
  firefighterId: string;
  firefighterName: string;
  incidentType: 'fire' | 'rescue' | 'hazmat' | 'flood' | 'earthquake';
  location: Location;
  description: string;
  severity: EmergencyPriority;
  status: EmergencyStatus;
  timestamp: Date;
  unitsDispatched: string[];
  casualties?: number;
  evacuated?: number;
  damageAssessment?: string;
  sourceReportId?: string; // If forwarded from user report
}

export interface FireRescueLog {
  logId: string;
  incidentId: string;
  firefighterId: string;
  actionTaken: string;
  timestamp: Date;
  equipmentUsed?: string[];
  personnelInvolved?: string[];
  outcome: string;
  nextSteps?: string;
}

// =================== HOSPITAL COLLECTION ===================
export interface HospitalProfile {
  uid: string;
  name: string;
  email: string;
  hospitalName: string;
  department: string;
  position: string;
  contact: string;
  isOnDuty: boolean;
  specializations: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Hospital Sub-Collections
export interface HospitalRecord {
  recordId: string;
  hospitalId: string;
  hospitalName: string;
  availableBeds: number;
  totalBeds: number;
  icuBeds: number;
  emergencyCapacity: number;
  specialties: string[];
  contact: string;
  location: Location;
  status: 'operational' | 'full' | 'emergency_only' | 'maintenance';
  lastUpdated: Date;
}

export interface PatientAdmission {
  admissionId: string;
  patientName?: string; // May be anonymous for privacy
  emergencyType: EmergencyType;
  condition: string;
  admissionTime: Date;
  status: 'admitted' | 'treated' | 'discharged' | 'transferred';
  priority: EmergencyPriority;
  assignedDoctor?: string;
  roomNumber?: string;
  estimatedDischarge?: Date;
  sourceReportId?: string; // If forwarded from user report
  ambulanceRequestId?: string; // If came via ambulance
}

// =================== ADMIN COLLECTION ===================
export interface AdminProfile {
  uid: string;
  name: string;
  email: string;
  adminLevel: 'system' | 'regional' | 'local';
  permissions: string[];
  contact: string;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Admin Sub-Collections
export interface SystemLog {
  logId: string;
  adminId: string;
  action: string;
  targetUser?: string;
  targetCollection?: string;
  details: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface RoleManagement {
  managementId: string;
  adminId: string;
  targetUserId: string;
  previousRole?: string;
  newRole: string;
  reason: string;
  timestamp: Date;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
}

// =================== EMERGENCY ROUTING CONFIGURATION ===================
export interface EmergencyRoutingRule {
  emergencyType: EmergencyType;
  targetCollections: {
    collection: 'police' | 'ambulance' | 'fireBrigade' | 'hospital' | 'admin';
    subCollection: string;
    priority: number; // 1 = highest priority
  }[];
}

export const EMERGENCY_ROUTING_RULES: EmergencyRoutingRule[] = [
  {
    emergencyType: 'fire',
    targetCollections: [
      { collection: 'fireBrigade', subCollection: 'fireIncidents', priority: 1 }
    ]
  },
  {
    emergencyType: 'medical',
    targetCollections: [
      { collection: 'hospital', subCollection: 'patientAdmissions', priority: 1 },
      { collection: 'ambulance', subCollection: 'ambulanceRequests', priority: 1 }
    ]
  },
  {
    emergencyType: 'traffic_accident',
    targetCollections: [
      { collection: 'police', subCollection: 'policeReports', priority: 1 },
      { collection: 'ambulance', subCollection: 'ambulanceRequests', priority: 2 }
    ]
  },
  {
    emergencyType: 'flood',
    targetCollections: [
      { collection: 'fireBrigade', subCollection: 'fireIncidents', priority: 1 },
      { collection: 'police', subCollection: 'policeReports', priority: 2 }
    ]
  },
  {
    emergencyType: 'earthquake',
    targetCollections: [
      { collection: 'police', subCollection: 'policeReports', priority: 1 },
      { collection: 'fireBrigade', subCollection: 'fireIncidents', priority: 1 },
      { collection: 'ambulance', subCollection: 'ambulanceRequests', priority: 1 },
      { collection: 'hospital', subCollection: 'patientAdmissions', priority: 1 }
    ]
  },
  {
    emergencyType: 'other',
    targetCollections: [
      { collection: 'admin', subCollection: 'systemLogs', priority: 1 }
    ]
  }
];

// =================== FORM INTERFACES ===================
export interface CreateEmergencyReportForm {
  type: EmergencyType;
  location: Location;
  description: string;
  severity: EmergencyPriority;
  contact: string;
}

export interface CreateHelpRequestForm {
  helpType: UserRequestHelp['helpType'];
  details: string;
  urgency: EmergencyPriority;
  location: Location;
  contact: string;
}

export interface CreateNewsForm {
  title: string;
  content: string;
  category: UserDisasterNews['category'];
  location?: Location;
  tags?: string[];
  priority: EmergencyPriority;
}

// =================== ANALYTICS EVENTS ===================
export type AnalyticsEvent = 
  | 'emergency_report_created'
  | 'help_request_created'
  | 'news_created'
  | 'map_viewed'
  | 'dashboard_accessed'
  | 'role_dashboard_accessed'
  | 'emergency_forwarded'
  | 'emergency_assigned'
  | 'emergency_resolved';

export interface AnalyticsEventData {
  userId: string;
  userRole: string;
  action: AnalyticsEvent;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// =================== REAL-TIME NOTIFICATION TYPES ===================
export interface NotificationData {
  id: string;
  type: 'emergency' | 'assignment' | 'update' | 'resolved';
  title: string;
  message: string;
  priority: EmergencyPriority;
  timestamp: Date;
  sourceId: string; // ID of the original report/request
  targetRoles: string[];
  isRead: boolean;
  actionRequired?: boolean;
}

// =================== DEMO ACCOUNT CREDENTIALS ===================
export interface DemoAccount {
  email: string;
  password: string;
  role: string;
  customClaims: {
    role: string;
    permissions: string[];
  };
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'user_demo@test.com',
    password: 'password123',
    role: 'user',
    customClaims: {
      role: 'user',
      permissions: ['report_emergency', 'request_help', 'view_map', 'create_news']
    }
  },
  {
    email: 'police_demo@test.com',
    password: 'password123',
    role: 'police',
    customClaims: {
      role: 'police',
      permissions: ['manage_police_reports', 'update_cases', 'view_all_emergencies']
    }
  },
  {
    email: 'ambulance_demo@test.com',
    password: 'password123',
    role: 'ambulance',
    customClaims: {
      role: 'ambulance',
      permissions: ['manage_ambulance_requests', 'dispatch_logs', 'view_medical_emergencies']
    }
  },
  {
    email: 'fire_demo@test.com',
    password: 'password123',
    role: 'fireBrigade',
    customClaims: {
      role: 'fireBrigade',
      permissions: ['manage_fire_incidents', 'rescue_logs', 'view_fire_emergencies']
    }
  },
  {
    email: 'hospital_demo@test.com',
    password: 'password123',
    role: 'hospital',
    customClaims: {
      role: 'hospital',
      permissions: ['manage_hospital_records', 'patient_admissions', 'view_medical_emergencies']
    }
  },
  {
    email: 'admin_demo@test.com',
    password: 'password123',
    role: 'admin',
    customClaims: {
      role: 'admin',
      permissions: ['full_access', 'role_management', 'system_logs', 'user_management']
    }
  }
];
