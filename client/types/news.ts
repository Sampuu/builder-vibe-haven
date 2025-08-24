export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  author: string;
  authorRole: "user" | "police" | "fire" | "ambulance" | "hospital" | "admin";
  timestamp: string;
  category:
    | "emergency"
    | "incident"
    | "weather"
    | "safety"
    | "update"
    | "resolved";
  priority: "low" | "medium" | "high" | "critical";
  location?: string;
  coordinates?: { lat: number; lng: number };
  images?: string[];
  affectedAreas?: string[];
  relatedIncidents?: string[];
  status: "active" | "resolved" | "archived";
  tags: string[];
  views: number;
  lastUpdated: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  newsArticleId?: string; // Link to full news article
  type: "emergency" | "info" | "warning" | "success";
  priority: "low" | "medium" | "high" | "critical";
  targetRoles: (
    | "user"
    | "police"
    | "fire"
    | "ambulance"
    | "hospital"
    | "admin"
  )[];
  timestamp: string;
  read: boolean;
  actionRequired?: boolean;
  actionUrl?: string;
  expiresAt?: string;
}

export interface CrisisAction {
  id: string;
  title: string;
  description: string;
  type:
    | "deployment"
    | "supply"
    | "evacuation"
    | "rescue"
    | "medical"
    | "coordination";
  assignedTo: "police" | "fire" | "ambulance" | "hospital" | "admin";
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  location: string;
  coordinates?: { lat: number; lng: number };
  resources: {
    personnel?: number;
    vehicles?: string[];
    supplies?: string[];
    equipment?: string[];
  };
  estimatedTime?: string;
  actualTime?: string;
  timestamp: string;
  completedAt?: string;
  notes?: string;
}
