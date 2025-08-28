// Adaptive services that switch between Firebase and offline storage
import { checkFirebaseAvailability } from './serviceDetector';
import { 
  disasterReportsService as firebaseDisasterService,
  helpRequestsService as firebaseHelpService,
  notificationsService as firebaseNotificationService,
  DisasterReport,
  HelpRequest,
  Notification
} from './firestore';
import {
  offlineDisasterService,
  offlineHelpService,
  offlineNotificationService
} from './offlineStorage';
import {
  backendDisasterService,
  backendHelpService,
  testBackend
} from './backendService';

// Adaptive disaster reports service
export const adaptiveDisasterService = {
  async create(report: Omit<DisasterReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const isFirebaseAvailable = await checkFirebaseAvailability();

    if (isFirebaseAvailable) {
      try {
        return await firebaseDisasterService.create(report);
      } catch (error) {
        console.warn('Firebase failed, trying backend API:', error);
        // Fall back to backend API if Firebase fails
      }
    }

    // Try backend API
    const isBackendAvailable = await testBackend();
    if (isBackendAvailable) {
      try {
        return await backendDisasterService.create(report);
      } catch (error) {
        console.warn('Backend API failed, using offline mode:', error);
      }
    }

    // Final fallback to offline storage
    return offlineDisasterService.create(report);
  },

  async getAll(): Promise<DisasterReport[]> {
    const isFirebaseAvailable = await checkFirebaseAvailability();
    
    if (isFirebaseAvailable) {
      return firebaseDisasterService.getAll();
    } else {
      return offlineDisasterService.getAll();
    }
  },

  async getByUser(userId: string): Promise<DisasterReport[]> {
    const isFirebaseAvailable = await checkFirebaseAvailability();
    
    if (isFirebaseAvailable) {
      return firebaseDisasterService.getByUser(userId);
    } else {
      return offlineDisasterService.getByUser(userId);
    }
  },

  async updateStatus(id: string, status: DisasterReport['status'], assignedTo?: string): Promise<void> {
    const isFirebaseAvailable = await checkFirebaseAvailability();
    
    if (isFirebaseAvailable) {
      return firebaseDisasterService.updateStatus(id, status, assignedTo);
    } else {
      return offlineDisasterService.updateStatus(id, status, assignedTo);
    }
  },

  async onSnapshot(callback: (reports: DisasterReport[]) => void): Promise<() => void> {
    const isFirebaseAvailable = await checkFirebaseAvailability();

    if (isFirebaseAvailable) {
      return firebaseDisasterService.onSnapshot(callback);
    } else {
      // For offline mode, simulate real-time updates by polling
      const pollInterval = setInterval(async () => {
        const reports = await offlineDisasterService.getAll();
        callback(reports);
      }, 1000);

      // Return cleanup function
      return () => clearInterval(pollInterval);
    }
  }
};

// Adaptive help requests service
export const adaptiveHelpService = {
  async create(request: Omit<HelpRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const isFirebaseAvailable = await checkFirebaseAvailability();

    if (isFirebaseAvailable) {
      try {
        return await firebaseHelpService.create(request);
      } catch (error) {
        console.warn('Firebase failed, trying backend API:', error);
      }
    }

    // Try backend API
    const isBackendAvailable = await testBackend();
    if (isBackendAvailable) {
      try {
        return await backendHelpService.create(request);
      } catch (error) {
        console.warn('Backend API failed, using offline mode:', error);
      }
    }

    // Final fallback to offline storage
    return offlineHelpService.create(request);
  },

  async getAll(): Promise<HelpRequest[]> {
    const isFirebaseAvailable = await checkFirebaseAvailability();
    
    if (isFirebaseAvailable) {
      return firebaseHelpService.getAll();
    } else {
      return offlineHelpService.getAll();
    }
  },

  async getByUser(userId: string): Promise<HelpRequest[]> {
    const isFirebaseAvailable = await checkFirebaseAvailability();
    
    if (isFirebaseAvailable) {
      return firebaseHelpService.getByUser(userId);
    } else {
      return offlineHelpService.getByUser(userId);
    }
  },

  async updateStatus(id: string, status: HelpRequest['status'], assignedTo?: string): Promise<void> {
    const isFirebaseAvailable = await checkFirebaseAvailability();
    
    if (isFirebaseAvailable) {
      return firebaseHelpService.updateStatus(id, status, assignedTo);
    } else {
      // Offline mode doesn't have this method yet, so we'll skip it
      console.log('Offline mode: updateStatus not implemented for help requests');
    }
  },

  async onSnapshot(callback: (requests: HelpRequest[]) => void): Promise<() => void> {
    const isFirebaseAvailable = await checkFirebaseAvailability();

    if (isFirebaseAvailable) {
      return firebaseHelpService.onSnapshot(callback);
    } else {
      // For offline mode, simulate real-time updates by polling
      const pollInterval = setInterval(async () => {
        const requests = await offlineHelpService.getAll();
        callback(requests);
      }, 1000);

      // Return cleanup function
      return () => clearInterval(pollInterval);
    }
  }
};

// Adaptive notifications service
export const adaptiveNotificationService = {
  async create(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    const isFirebaseAvailable = await checkFirebaseAvailability();
    
    if (isFirebaseAvailable) {
      return firebaseNotificationService.create(notification);
    } else {
      return offlineNotificationService.create(notification);
    }
  },

  async getByRole(role: string): Promise<Notification[]> {
    const isFirebaseAvailable = await checkFirebaseAvailability();
    
    if (isFirebaseAvailable) {
      return firebaseNotificationService.getByRole(role);
    } else {
      return offlineNotificationService.getByRole(role);
    }
  },

  async markAsRead(id: string): Promise<void> {
    const isFirebaseAvailable = await checkFirebaseAvailability();
    
    if (isFirebaseAvailable) {
      return firebaseNotificationService.markAsRead(id);
    } else {
      return offlineNotificationService.markAsRead(id);
    }
  },

  async onSnapshot(role: string, callback: (notifications: Notification[]) => void): Promise<() => void> {
    const isFirebaseAvailable = await checkFirebaseAvailability();

    if (isFirebaseAvailable) {
      return firebaseNotificationService.onSnapshot(role, callback);
    } else {
      // For offline mode, simulate real-time updates by polling
      const pollInterval = setInterval(async () => {
        const notifications = await offlineNotificationService.getByRole(role);
        callback(notifications);
      }, 1000);

      // Return cleanup function
      return () => clearInterval(pollInterval);
    }
  }
};

// Simplified notification helpers for offline mode
export const createNotificationForReport = async (report: DisasterReport): Promise<void> => {
  const isFirebaseAvailable = await checkFirebaseAvailability();
  
  if (isFirebaseAvailable) {
    // Use the existing Firebase implementation
    const { createNotificationForReport: firebaseCreateNotification } = await import('./firestore');
    return firebaseCreateNotification(report);
  } else {
    // Notification creation is handled automatically by offlineDisasterService.create
    console.log('Notification created for disaster report:', report.id);
  }
};

export const createNotificationForHelpRequest = async (request: HelpRequest): Promise<void> => {
  const isFirebaseAvailable = await checkFirebaseAvailability();
  
  if (isFirebaseAvailable) {
    // Use the existing Firebase implementation
    const { createNotificationForHelpRequest: firebaseCreateNotification } = await import('./firestore');
    return firebaseCreateNotification(request);
  } else {
    // Notification creation is handled automatically by offlineHelpService.create
    console.log('Notification created for help request:', request.id);
  }
};
