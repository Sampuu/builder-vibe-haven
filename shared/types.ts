// Shared types between client and server for incident management

export type UserRole =
  | "user"
  | "police"
  | "fire"
  | "ambulance"
  | "hospital"
  | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Incident {
  id: string;
  type: "help_request" | "disaster_report";
  category:
    | "fire"
    | "medical"
    | "accident"
    | "natural"
    | "police"
    | "supplies"
    | "transport"
    | "other";
  urgency: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  reporter: {
    id: string;
    name: string;
    phone: string;
    role: UserRole;
  };
  assignedDepartments: UserRole[];
  status:
    | "submitted"
    | "acknowledged"
    | "assigned"
    | "in_progress"
    | "resolved"
    | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  timestamps: {
    submitted: string; // ISO string
    acknowledged?: string;
    assigned?: string;
    inProgress?: string;
    resolved?: string;
  };
  metadata?: {
    images?: string[];
    specialRequests?: string;
    supplies?: string[];
    injuries?: number;
    vehiclesInvolved?: number;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "emergency" | "warning" | "info" | "success";
  timestamp: string; // ISO string
  read: boolean;
  priority: "high" | "medium" | "low";
  category: "incident" | "system" | "update" | "alert" | "news";
  targetRoles?: UserRole[];
  relatedIncidentId?: string;
}

// API Request/Response types
export interface CreateIncidentRequest {
  type: "help_request" | "disaster_report";
  category: Incident["category"];
  urgency: Incident["urgency"];
  title: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  reporter: {
    id: string;
    name: string;
    phone: string;
    role: UserRole;
  };
  metadata?: Incident["metadata"];
}

export interface CreateIncidentResponse {
  success: boolean;
  incidentId: string;
  assignedDepartments: UserRole[];
  message: string;
}

export interface GetIncidentsResponse {
  success: boolean;
  incidents: Incident[];
}

export interface UpdateIncidentStatusRequest {
  incidentId: string;
  status: Incident["status"];
  updatedBy: {
    userId: string;
    role: UserRole;
  };
}

export interface UpdateIncidentStatusResponse {
  success: boolean;
  incident: Incident;
  message: string;
}

export interface AcknowledgeIncidentRequest {
  incidentId: string;
  department: UserRole;
  acknowledgedBy: {
    userId: string;
    role: UserRole;
  };
}

export interface AcknowledgeIncidentResponse {
  success: boolean;
  incident: Incident;
  message: string;
}

export interface GetNotificationsResponse {
  success: boolean;
  notifications: Notification[];
}

export interface BroadcastNewsRequest {
  title: string;
  message: string;
  type: "emergency" | "warning" | "info" | "success";
  priority: "high" | "medium" | "low";
  broadcastBy: {
    userId: string;
    role: UserRole;
  };
}

export interface BroadcastNewsResponse {
  success: boolean;
  notificationId: string;
  message: string;
}

// SSE Event types
export interface SSENotificationEvent {
  type: "notification";
  data: Notification;
}

export interface SSEIncidentUpdateEvent {
  type: "incident_update";
  data: Incident;
}

export type SSEEvent = SSENotificationEvent | SSEIncidentUpdateEvent;
