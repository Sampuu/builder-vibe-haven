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

export interface AccidentZone {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'accident' | 'fire' | 'flood' | 'construction' | 'chemical' | 'other';
  isActive: boolean;
  createdBy: string; // user ID
  createdAt: string;
  expiresAt?: string; // optional expiration
  affectedRoutes?: string[]; // route IDs that should avoid this zone
}

export interface TrackedEntity {
  id: string;
  name: string;
  type: 'police' | 'fire' | 'ambulance' | 'hospital' | 'user';
  latitude: number;
  longitude: number;
  heading?: number; // direction in degrees
  speed?: number; // speed in km/h
  status: 'idle' | 'responding' | 'busy' | 'offline';
  lastUpdate: string;
  assignedIncidentId?: string;
}

export interface RouteRequest {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  avoidZones?: boolean;
  entityType?: TrackedEntity['type'];
  priority?: 'normal' | 'emergency';
}

export interface RouteResponse {
  route: {
    coordinates: Array<[number, number]>; // [lng, lat] format for GeoJSON
    distance: number; // in meters
    duration: number; // in seconds
    instructions: Array<{
      instruction: string;
      distance: number;
      time: number;
    }>;
  };
  avoidedZones: AccidentZone[];
  alternativeRoutes?: RouteResponse['route'][];
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

export interface CreateAccidentZoneRequest {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  radius: number;
  severity: AccidentZone['severity'];
  type: AccidentZone['type'];
  expiresAt?: string;
}

export interface UpdateEntityLocationRequest {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  status?: TrackedEntity['status'];
}
