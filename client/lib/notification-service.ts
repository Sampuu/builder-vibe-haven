import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
  getDocs
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { firebaseDb } from './firebase-db';
import type { User, HelpRequest, DisasterReport, NewsUpdate, Incident } from '@shared/types';

// Notification types and priorities
export type NotificationType = 
  | 'help_request_new'
  | 'help_request_updated'
  | 'disaster_report_new'
  | 'disaster_report_updated'
  | 'incident_new'
  | 'incident_updated'
  | 'news_emergency'
  | 'system_alert';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Notification {
  id: string;
  recipientId: string;
  recipientRole: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  isActionRequired: boolean;
  actionUrl?: string;
  relatedDocumentId?: string;
  relatedCollection?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationRule {
  type: NotificationType;
  targetRoles: string[];
  priority: NotificationPriority;
  template: {
    title: string;
    message: string;
  };
  actionRequired?: boolean;
  actionUrl?: string;
}

/**
 * Notification Service - Monitors database changes and sends targeted notifications
 */
export class NotificationService {
  private static readonly COLLECTION_NAME = 'notifications';
  private static unsubscribers: (() => void)[] = [];

  // Notification routing rules
  private static notificationRules: Record<string, NotificationRule> = {
    // Help Request Rules
    'help_request_medical': {
      type: 'help_request_new',
      targetRoles: ['ambulance', 'hospital', 'admin'],
      priority: 'high',
      template: {
        title: '🚨 New Medical Help Request',
        message: 'Medical assistance requested at {location}'
      },
      actionRequired: true,
      actionUrl: '/dashboard/ambulance'
    },
    'help_request_supplies': {
      type: 'help_request_new',
      targetRoles: ['hospital', 'admin'],
      priority: 'medium',
      template: {
        title: '📦 Supply Request',
        message: 'Emergency supplies needed at {location}'
      },
      actionRequired: true,
      actionUrl: '/dashboard/hospital'
    },
    'help_request_transport': {
      type: 'help_request_new',
      targetRoles: ['ambulance', 'admin'],
      priority: 'high',
      template: {
        title: '🚗 Transport Request',
        message: 'Medical transport needed at {location}'
      },
      actionRequired: true,
      actionUrl: '/dashboard/ambulance'
    },

    // Disaster Report Rules
    'disaster_fire': {
      type: 'disaster_report_new',
      targetRoles: ['fire', 'police', 'admin'],
      priority: 'critical',
      template: {
        title: '🔥 Fire Emergency',
        message: 'Fire reported at {location} - {severity} severity'
      },
      actionRequired: true,
      actionUrl: '/dashboard/fire'
    },
    'disaster_medical': {
      type: 'disaster_report_new',
      targetRoles: ['ambulance', 'hospital', 'admin'],
      priority: 'critical',
      template: {
        title: '🚨 Medical Emergency',
        message: 'Medical emergency at {location} - {severity} severity'
      },
      actionRequired: true,
      actionUrl: '/dashboard/ambulance'
    },
    'disaster_accident': {
      type: 'disaster_report_new',
      targetRoles: ['police', 'ambulance', 'admin'],
      priority: 'high',
      template: {
        title: '🚗 Accident Report',
        message: 'Accident reported at {location} - {severity} severity'
      },
      actionRequired: true,
      actionUrl: '/dashboard/police'
    },
    'disaster_natural': {
      type: 'disaster_report_new',
      targetRoles: ['police', 'fire', 'ambulance', 'admin'],
      priority: 'critical',
      template: {
        title: '🌪️ Natural Disaster',
        message: 'Natural disaster at {location} - {severity} severity'
      },
      actionRequired: true,
      actionUrl: '/dashboard/admin'
    }
  };

  /**
   * Initialize the notification service with real-time listeners
   */
  static async initialize(): Promise<void> {
    console.log('🔔 Initializing Notification Service...');
    
    try {
      // Set up listeners for all relevant collections
      this.setupHelpRequestListener();
      this.setupDisasterReportListener();
      this.setupIncidentListener();
      this.setupNewsListener();
      
      console.log('✅ Notification Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Notification Service:', error);
    }
  }

  /**
   * Clean up all listeners
   */
  static cleanup(): void {
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    this.unsubscribers = [];
    console.log('🔔 Notification Service cleaned up');
  }

  /**
   * Set up help request listener
   */
  private static setupHelpRequestListener(): void {
    const unsubscribe = firebaseDb.helpRequests.subscribeToHelpRequests((requests) => {
      // Process new/updated help requests
      requests.forEach(request => {
        this.processHelpRequest(request);
      });
    });
    this.unsubscribers.push(unsubscribe);
  }

  /**
   * Set up disaster report listener
   */
  private static setupDisasterReportListener(): void {
    const unsubscribe = firebaseDb.disasterReports.subscribeToReports((reports) => {
      reports.forEach(report => {
        this.processDisasterReport(report);
      });
    });
    this.unsubscribers.push(unsubscribe);
  }

  /**
   * Set up incident listener
   */
  private static setupIncidentListener(): void {
    const unsubscribe = firebaseDb.incidents.subscribeToIncidents((incidents) => {
      incidents.forEach(incident => {
        this.processIncident(incident);
      });
    });
    this.unsubscribers.push(unsubscribe);
  }

  /**
   * Set up news listener for emergency alerts
   */
  private static setupNewsListener(): void {
    const unsubscribe = firebaseDb.news.subscribeToNews((news) => {
      news.forEach(newsItem => {
        if (newsItem.category === 'emergency' && newsItem.severity === 'danger') {
          this.processEmergencyNews(newsItem);
        }
      });
    });
    this.unsubscribers.push(unsubscribe);
  }

  /**
   * Process help request and send notifications
   */
  private static async processHelpRequest(request: HelpRequest): Promise<void> {
    const ruleKey = `help_request_${request.type}`;
    const rule = this.notificationRules[ruleKey];
    
    if (!rule) return;

    // Check if this is a new request (created within last 5 minutes)
    const isNew = this.isRecentlyCreated(request.createdAt);
    if (!isNew) return;

    const notification: Omit<Notification, 'id'> = {
      recipientId: '', // Will be set for each recipient
      recipientRole: '', // Will be set for each recipient
      type: rule.type,
      priority: this.getUrgencyPriority(request.urgency),
      title: rule.template.title,
      message: this.interpolateTemplate(rule.template.message, {
        location: request.location,
        type: request.type,
        urgency: request.urgency
      }),
      data: {
        helpRequestId: request.id,
        requestType: request.type,
        urgency: request.urgency,
        location: request.location
      },
      isRead: false,
      isActionRequired: rule.actionRequired || false,
      actionUrl: rule.actionUrl,
      relatedDocumentId: request.id,
      relatedCollection: 'helpRequests',
      createdAt: new Date().toISOString()
    };

    // Send to all relevant roles
    await this.sendToRoles(notification, rule.targetRoles);
    
    console.log(`🔔 Sent ${rule.targetRoles.length} notifications for help request: ${request.type}`);
  }

  /**
   * Process disaster report and send notifications
   */
  private static async processDisasterReport(report: DisasterReport): Promise<void> {
    const ruleKey = `disaster_${report.type}`;
    const rule = this.notificationRules[ruleKey];
    
    if (!rule) return;

    const isNew = this.isRecentlyCreated(report.createdAt);
    if (!isNew) return;

    const notification: Omit<Notification, 'id'> = {
      recipientId: '',
      recipientRole: '',
      type: rule.type,
      priority: this.getSeverityPriority(report.severity),
      title: rule.template.title,
      message: this.interpolateTemplate(rule.template.message, {
        location: report.location,
        severity: report.severity,
        type: report.type
      }),
      data: {
        disasterReportId: report.id,
        reportType: report.type,
        severity: report.severity,
        location: report.location
      },
      isRead: false,
      isActionRequired: rule.actionRequired || false,
      actionUrl: rule.actionUrl,
      relatedDocumentId: report.id,
      relatedCollection: 'disasterReports',
      createdAt: new Date().toISOString()
    };

    await this.sendToRoles(notification, rule.targetRoles);
    console.log(`🔔 Sent ${rule.targetRoles.length} notifications for disaster: ${report.type}`);
  }

  /**
   * Process incident and send notifications
   */
  private static async processIncident(incident: Incident): Promise<void> {
    // Only notify for new active incidents
    if (incident.status !== 'active') return;
    
    const isNew = this.isRecentlyCreated(incident.createdAt);
    if (!isNew) return;

    const notification: Omit<Notification, 'id'> = {
      recipientId: '',
      recipientRole: '',
      type: 'incident_new',
      priority: this.getSeverityPriority(incident.severity),
      title: `�� New ${incident.type.toUpperCase()} Incident`,
      message: `${incident.title} at ${incident.location}`,
      data: {
        incidentId: incident.id,
        incidentType: incident.type,
        severity: incident.severity,
        location: incident.location
      },
      isRead: false,
      isActionRequired: true,
      actionUrl: '/dashboard/admin',
      relatedDocumentId: incident.id,
      relatedCollection: 'incidents',
      createdAt: new Date().toISOString()
    };

    // Send to all emergency roles for incidents
    await this.sendToRoles(notification, ['police', 'fire', 'ambulance', 'admin']);
  }

  /**
   * Process emergency news and send notifications
   */
  private static async processEmergencyNews(news: NewsUpdate): Promise<void> {
    const notification: Omit<Notification, 'id'> = {
      recipientId: '',
      recipientRole: '',
      type: 'news_emergency',
      priority: 'high',
      title: `📢 Emergency Alert: ${news.title}`,
      message: news.content.substring(0, 200) + (news.content.length > 200 ? '...' : ''),
      data: {
        newsId: news.id,
        category: news.category,
        severity: news.severity
      },
      isRead: false,
      isActionRequired: false,
      relatedDocumentId: news.id,
      relatedCollection: 'newsUpdates',
      createdAt: new Date().toISOString(),
      expiresAt: news.expiresAt
    };

    // Send emergency news to all roles
    await this.sendToRoles(notification, ['user', 'police', 'fire', 'ambulance', 'hospital', 'admin']);
  }

  /**
   * Send notification to users with specified roles
   */
  private static async sendToRoles(notification: Omit<Notification, 'id'>, roles: string[]): Promise<void> {
    try {
      // Get users with the specified roles
      for (const role of roles) {
        const users = await this.getUsersByRole(role);
        
        for (const user of users) {
          const userNotification = {
            ...notification,
            recipientId: user.id,
            recipientRole: user.role
          };
          
          await this.createNotification(userNotification);
        }
      }
    } catch (error) {
      console.error('Failed to send notifications to roles:', error);
    }
  }

  /**
   * Create a notification in the database
   */
  private static async createNotification(notification: Omit<Notification, 'id'>): Promise<void> {
    try {
      await addDoc(collection(db, this.COLLECTION_NAME), {
        ...notification,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }

  /**
   * Get users by role
   */
  private static async getUsersByRole(role: string): Promise<User[]> {
    try {
      const result = await firebaseDb.users.getByRole(role);
      return result.success ? result.data || [] : [];
    } catch (error) {
      console.error(`Failed to get users by role ${role}:`, error);
      return [];
    }
  }

  /**
   * Get notifications for a user
   */
  static async getNotificationsForUser(userId: string, limitCount: number = 20): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('recipientId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
    } catch (error) {
      console.error('Failed to get user notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, this.COLLECTION_NAME, notificationId), {
        isRead: true
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  /**
   * Subscribe to user notifications
   */
  static subscribeToUserNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      callback(notifications);
    });
  }

  // Helper methods
  private static isRecentlyCreated(createdAt: string): boolean {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - created.getTime()) / (1000 * 60);
    return diffMinutes <= 5; // Only process items created within last 5 minutes
  }

  private static getUrgencyPriority(urgency: string): NotificationPriority {
    switch (urgency) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  }

  private static getSeverityPriority(severity: string): NotificationPriority {
    switch (severity) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  }

  private static interpolateTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{([^}]+)\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  /**
   * Send custom notification
   */
  static async sendCustomNotification(
    recipientId: string,
    title: string,
    message: string,
    priority: NotificationPriority = 'medium',
    actionUrl?: string
  ): Promise<void> {
    const notification: Omit<Notification, 'id'> = {
      recipientId,
      recipientRole: '',
      type: 'system_alert',
      priority,
      title,
      message,
      isRead: false,
      isActionRequired: !!actionUrl,
      actionUrl,
      createdAt: new Date().toISOString()
    };

    await this.createNotification(notification);
  }
}

export default NotificationService;
