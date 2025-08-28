// User Dashboard Sub-collection Types for Firestore

export interface ReportDisaster {
  reportId: string;
  type: 'fire' | 'accident' | 'medical' | 'flood' | 'earthquake' | 'other';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  description: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'in_progress' | 'resolved';
  userId: string;
  userName: string;
  contact?: string;
}

export interface RequestHelp {
  requestId: string;
  helpType: 'medical' | 'supplies' | 'rescue' | 'evacuation' | 'other';
  details: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  timestamp: Date;
  userId: string;
  userName: string;
  contact: string;
  assignedTo?: string;
  responseTime?: Date;
}

export interface ViewMapIncident {
  incidentId: string;
  type: 'fire' | 'flood' | 'earthquake' | 'accident' | 'medical' | 'other';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'monitoring';
  reportedBy: string;
  reporterName: string;
  timestamp: Date;
  description: string;
  lastUpdated: Date;
}

export interface DisasterNews {
  newsId: string;
  title: string;
  content: string;
  category: 'emergency_alert' | 'safety_tips' | 'incident_update' | 'general_info';
  timestamp: Date;
  authorId: string;
  authorName: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  tags?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isVerified: boolean;
  viewCount: number;
}

// Form interfaces for creating new documents
export interface CreateReportDisasterForm {
  type: ReportDisaster['type'];
  location: ReportDisaster['location'];
  description: string;
  severity: ReportDisaster['severity'];
  contact?: string;
}

export interface CreateRequestHelpForm {
  helpType: RequestHelp['helpType'];
  details: string;
  urgency: RequestHelp['urgency'];
  location: RequestHelp['location'];
  contact: string;
}

export interface CreateDisasterNewsForm {
  title: string;
  content: string;
  category: DisasterNews['category'];
  location?: DisasterNews['location'];
  tags?: string[];
  priority: DisasterNews['priority'];
}

// Analytics event types
export type UserDashboardAnalyticsEvent = 
  | 'report_disaster_created'
  | 'help_request_created'
  | 'map_viewed'
  | 'news_viewed'
  | 'news_created'
  | 'dashboard_accessed';

export interface AnalyticsEventData {
  userId: string;
  action: UserDashboardAnalyticsEvent;
  timestamp: Date;
  metadata?: Record<string, any>;
}
