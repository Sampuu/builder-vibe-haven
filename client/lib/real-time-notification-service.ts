import { 
  collection, 
  doc, 
  addDoc,
  query, 
  orderBy, 
  where, 
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, analytics } from './firebase';
import { logEvent } from 'firebase/analytics';
import {
  NotificationData,
  EmergencyType,
  EmergencyPriority,
  UserReportDisaster
} from '@shared/role-based-database-types';

export interface NotificationSubscription {
  id: string;
  unsubscribe: () => void;
}

export class RealTimeNotificationService {
  private static subscriptions: Map<string, NotificationSubscription> = new Map();
  private static notificationCallbacks: Map<string, (notifications: NotificationData[]) => void> = new Map();

  /**
   * Subscribe to real-time notifications for a specific role
   */
  static subscribeToRoleNotifications(
    userId: string,
    userRole: string,
    callback: (notifications: NotificationData[]) => void
  ): string {
    const subscriptionId = `${userRole}_${userId}_notifications`;
    
    // Store callback for this subscription
    this.notificationCallbacks.set(subscriptionId, callback);

    // Subscribe to role-specific collection changes
    const unsubscribeRole = this.subscribeToRoleCollection(userId, userRole, subscriptionId);
    
    // Subscribe to global notifications for this role
    const unsubscribeGlobal = this.subscribeToGlobalNotifications(userRole, subscriptionId);

    // Combine unsubscribe functions
    const combinedUnsubscribe = () => {
      unsubscribeRole();
      unsubscribeGlobal();
      this.notificationCallbacks.delete(subscriptionId);
    };

    const subscription: NotificationSubscription = {
      id: subscriptionId,
      unsubscribe: combinedUnsubscribe
    };

    this.subscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }

  /**
   * Subscribe to role-specific collection for new incidents
   */
  private static subscribeToRoleCollection(
    userId: string,
    userRole: string,
    subscriptionId: string
  ): () => void {
    let collectionPath: string;
    let subCollection: string;

    switch (userRole) {
      case 'police':
        collectionPath = 'police';
        subCollection = 'policeReports';
        break;
      case 'ambulance':
        collectionPath = 'ambulance';
        subCollection = 'ambulanceRequests';
        break;
      case 'fireBrigade':
        collectionPath = 'fireBrigade';
        subCollection = 'fireIncidents';
        break;
      case 'hospital':
        collectionPath = 'hospital';
        subCollection = 'patientAdmissions';
        break;
      case 'admin':
        collectionPath = 'admin';
        subCollection = 'systemLogs';
        break;
      default:
        return () => {}; // No role-specific collection for users
    }

    const roleDocRef = doc(db, collectionPath, userId);
    const collectionRef = collection(roleDocRef, subCollection);
    
    // Query for recent incidents (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const q = query(
      collectionRef, 
      where('timestamp', '>=', twentyFourHoursAgo),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notifications: NotificationData[] = [];

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const notification = this.createNotificationFromData(
            change.doc.id,
            userRole,
            data,
            subCollection
          );
          
          if (notification) {
            notifications.push(notification);
          }
        }
      });

      if (notifications.length > 0) {
        this.handleNewNotifications(subscriptionId, notifications);
      }
    });
  }

  /**
   * Subscribe to global notifications
   */
  private static subscribeToGlobalNotifications(
    userRole: string,
    subscriptionId: string
  ): () => void {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('targetRoles', 'array-contains', userRole),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notifications: NotificationData[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const notification: NotificationData = {
          id: doc.id,
          type: data.type || 'emergency',
          title: data.title || 'New Notification',
          message: data.message || '',
          priority: data.priority || 'medium',
          timestamp: this.convertTimestamp(data.timestamp),
          sourceId: data.sourceId || '',
          targetRoles: data.targetRoles || [],
          isRead: data.isRead || false,
          actionRequired: data.actionRequired || false
        };
        notifications.push(notification);
      });

      this.handleNewNotifications(subscriptionId, notifications);
    });
  }

  /**
   * Handle new notifications by calling the appropriate callback
   */
  private static handleNewNotifications(
    subscriptionId: string,
    notifications: NotificationData[]
  ): void {
    const callback = this.notificationCallbacks.get(subscriptionId);
    if (callback) {
      callback(notifications);
    }

    // Log analytics for notification received
    if (analytics && notifications.length > 0) {
      logEvent(analytics, 'notifications_received', {
        subscription_id: subscriptionId,
        notification_count: notifications.length,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Create notification data from Firestore document
   */
  private static createNotificationFromData(
    docId: string,
    userRole: string,
    data: any,
    subCollection: string
  ): NotificationData | null {
    try {
      let notification: NotificationData;

      switch (subCollection) {
        case 'policeReports':
          notification = {
            id: `police_${docId}`,
            type: 'emergency',
            title: '🚔 New Police Report',
            message: `New ${data.incidentType} incident reported: ${data.description?.substring(0, 100)}...`,
            priority: data.priority || 'medium',
            timestamp: this.convertTimestamp(data.timestamp),
            sourceId: data.sourceReportId || docId,
            targetRoles: ['police'],
            isRead: false,
            actionRequired: data.status === 'pending'
          };
          break;

        case 'ambulanceRequests':
          notification = {
            id: `ambulance_${docId}`,
            type: 'emergency',
            title: '🚑 New Ambulance Request',
            message: `${data.emergencyType} emergency: ${data.description?.substring(0, 100)}...`,
            priority: data.priority || 'high',
            timestamp: this.convertTimestamp(data.timestamp),
            sourceId: data.sourceReportId || docId,
            targetRoles: ['ambulance'],
            isRead: false,
            actionRequired: data.status === 'pending'
          };
          break;

        case 'fireIncidents':
          notification = {
            id: `fire_${docId}`,
            type: 'emergency',
            title: '🔥 New Fire Incident',
            message: `${data.incidentType} incident: ${data.description?.substring(0, 100)}...`,
            priority: data.severity || 'high',
            timestamp: this.convertTimestamp(data.timestamp),
            sourceId: data.sourceReportId || docId,
            targetRoles: ['fireBrigade'],
            isRead: false,
            actionRequired: data.status === 'pending'
          };
          break;

        case 'patientAdmissions':
          notification = {
            id: `hospital_${docId}`,
            type: 'emergency',
            title: '🏥 New Patient Admission',
            message: `${data.emergencyType} patient: ${data.condition?.substring(0, 100)}...`,
            priority: data.priority || 'medium',
            timestamp: this.convertTimestamp(data.admissionTime),
            sourceId: data.sourceReportId || docId,
            targetRoles: ['hospital'],
            isRead: false,
            actionRequired: data.status === 'admitted'
          };
          break;

        case 'systemLogs':
          notification = {
            id: `admin_${docId}`,
            type: 'update',
            title: '⚙️ System Alert',
            message: `${data.action}: ${data.details?.substring(0, 100)}...`,
            priority: data.severity === 'critical' ? 'critical' : 'medium',
            timestamp: this.convertTimestamp(data.timestamp),
            sourceId: docId,
            targetRoles: ['admin'],
            isRead: false,
            actionRequired: data.severity === 'critical'
          };
          break;

        default:
          return null;
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification from data:', error);
      return null;
    }
  }

  /**
   * Send notification to specific roles when emergency is forwarded
   */
  static async sendEmergencyForwardedNotification(
    emergencyReport: UserReportDisaster,
    targetRoles: string[]
  ): Promise<void> {
    try {
      const notification: Omit<NotificationData, 'id'> = {
        type: 'emergency',
        title: `🚨 New ${emergencyReport.type.toUpperCase()} Emergency`,
        message: `Emergency reported by ${emergencyReport.userName}: ${emergencyReport.description.substring(0, 150)}...`,
        priority: emergencyReport.severity,
        timestamp: new Date(),
        sourceId: emergencyReport.reportId,
        targetRoles,
        isRead: false,
        actionRequired: true
      };

      // Add to global notifications collection
      await addDoc(collection(db, 'notifications'), {
        ...notification,
        timestamp: serverTimestamp()
      });

      // Log analytics
      if (analytics) {
        logEvent(analytics, 'emergency_notification_sent', {
          emergency_type: emergencyReport.type,
          target_roles: targetRoles.join(','),
          priority: emergencyReport.severity,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Error sending emergency forwarded notification:', error);
    }
  }

  /**
   * Send update notification when emergency status changes
   */
  static async sendStatusUpdateNotification(
    sourceId: string,
    newStatus: string,
    message: string,
    targetRoles: string[],
    priority: EmergencyPriority = 'medium'
  ): Promise<void> {
    try {
      const notification: Omit<NotificationData, 'id'> = {
        type: 'update',
        title: '📋 Status Update',
        message,
        priority,
        timestamp: new Date(),
        sourceId,
        targetRoles,
        isRead: false,
        actionRequired: false
      };

      await addDoc(collection(db, 'notifications'), {
        ...notification,
        timestamp: serverTimestamp()
      });

    } catch (error) {
      console.error('Error sending status update notification:', error);
    }
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await import('firebase/firestore').then(({ updateDoc }) => 
        updateDoc(notificationRef, { isRead: true })
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Get unread notification count for user role
   */
  static async getUnreadNotificationCount(userRole: string): Promise<number> {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('targetRoles', 'array-contains', userRole),
        where('isRead', '==', false)
      );

      const snapshot = await import('firebase/firestore').then(({ getDocs }) => getDocs(q));
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      return 0;
    }
  }

  /**
   * Unsubscribe from specific subscription
   */
  static unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionId);
    }
  }

  /**
   * Unsubscribe from all notifications
   */
  static unsubscribeAll(): void {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
    this.notificationCallbacks.clear();
  }

  /**
   * Convert Firestore timestamp to Date
   */
  private static convertTimestamp(timestamp: any): Date {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    if (timestamp?.toDate) {
      return timestamp.toDate();
    }
    return timestamp || new Date();
  }

  /**
   * Test notification system by sending a test notification
   */
  static async sendTestNotification(targetRoles: string[]): Promise<void> {
    try {
      const notification: Omit<NotificationData, 'id'> = {
        type: 'update',
        title: '🧪 Test Notification',
        message: 'This is a test notification to verify the real-time notification system is working.',
        priority: 'low',
        timestamp: new Date(),
        sourceId: 'test',
        targetRoles,
        isRead: false,
        actionRequired: false
      };

      await addDoc(collection(db, 'notifications'), {
        ...notification,
        timestamp: serverTimestamp()
      });

      console.log('Test notification sent to roles:', targetRoles);
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }
}

// =================== NOTIFICATION HOOK ===================
export interface UseNotificationsReturn {
  notifications: NotificationData[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  clearAll: () => void;
}

/**
 * React hook for using real-time notifications
 */
export const useNotifications = (
  userId: string,
  userRole: string
): UseNotificationsReturn => {
  const [notifications, setNotifications] = React.useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!userId || !userRole) return;

    const subscriptionId = RealTimeNotificationService.subscribeToRoleNotifications(
      userId,
      userRole,
      (newNotifications) => {
        setNotifications(prev => {
          // Merge and deduplicate notifications
          const existingIds = new Set(prev.map(n => n.id));
          const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id));
          return [...uniqueNew, ...prev].slice(0, 50); // Keep only last 50 notifications
        });
        setIsLoading(false);
      }
    );

    return () => {
      RealTimeNotificationService.unsubscribe(subscriptionId);
    };
  }, [userId, userRole]);

  const markAsRead = async (notificationId: string) => {
    await RealTimeNotificationService.markNotificationAsRead(notificationId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    clearAll
  };
};

// Import React for the hook
import React from 'react';
