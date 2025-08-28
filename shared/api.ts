export interface DemoResponse {
  message: string;
}

export interface User {
  id: string;
  name: string;
  role: 'user' | 'police' | 'fire' | 'ambulance' | 'hospital' | 'admin';
}

export interface Incident {
  id: string;
  type: 'medical' | 'fire' | 'accident' | 'natural' | 'supplies' | 'transport' | 'other';
  title: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  urgency: 'low' | 'medium' | 'high' | 'critical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  contactName: string;
  contactPhone: string;
  reportedBy: string; // user ID
  reportedByRole: User['role'];
  status: 'submitted' | 'acknowledged' | 'in-progress' | 'resolved';
  assignedTo?: string; // responder ID
  timestamp: string;
  images?: string[];
  targetRoles: User['role'][];
}

export interface Notification {
  id: string;
  incidentId: string;
  targetRole: User['role'];
  targetUserId?: string;
  type: 'incident_created' | 'incident_assigned' | 'incident_updated' | 'help_request';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  acknowledged: boolean;
  timestamp: string;
  data?: Record<string, any>;
}

export interface CreateIncidentRequest {
  type: Incident['type'];
  title: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  urgency: Incident['urgency'];
  severity?: Incident['severity'];
  contactName: string;
  contactPhone: string;
  images?: string[];
}

export interface CreateIncidentResponse {
  incident: Incident;
  notifications: Notification[];
}

export interface GetNotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export interface UpdateNotificationRequest {
  read?: boolean;
  acknowledged?: boolean;
}
