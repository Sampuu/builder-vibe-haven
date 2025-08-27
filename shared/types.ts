// Shared types for the emergency response system

export type UserRole =
  | "user"
  | "police"
  | "fire"
  | "ambulance"
  | "hospital"
  | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface DisasterReport {
  id: string;
  userId: string;
  type: "fire" | "medical" | "accident" | "natural" | "other";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  contactName: string;
  contactPhone: string;
  images?: string[];
  status: "submitted" | "acknowledged" | "in-progress" | "resolved";
  assignedResponders?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HelpRequest {
  id: string;
  userId: string;
  type: "medical" | "supplies" | "transport" | "other";
  urgency: "low" | "medium" | "high" | "critical";
  description: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  contactPhone: string;
  specialRequests?: string;
  status:
    | "submitted"
    | "acknowledged"
    | "in-progress"
    | "fulfilled"
    | "cancelled";
  assignedResponders?: string[];
  estimatedArrival?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsUpdate {
  id: string;
  title: string;
  content: string;
  category: "emergency" | "weather" | "safety" | "update" | "resolved";
  severity: "info" | "warning" | "danger";
  location?: string;
  authorId: string;
  authorName: string;
  images?: string[];
  isPublic: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  type: "fire" | "medical" | "accident" | "natural" | "other";
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "contained" | "resolved";
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  affectedArea?: {
    radius: number; // in meters
    polygon?: Array<{ lat: number; lng: number }>;
  };
  responders: Array<{
    id: string;
    name: string;
    type: "police" | "fire" | "medical" | "other";
    status: "dispatched" | "on-scene" | "available";
  }>;
  relatedReports?: string[]; // IDs of related DisasterReports
  evacuationZone?: boolean;
  estimatedContainment?: string;
  publicAlert?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  hasMore: boolean;
  lastDoc?: any;
}
