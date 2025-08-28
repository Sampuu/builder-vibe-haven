// Offline fallback storage for when Firebase is unavailable
import { User, UserRole } from '@/hooks/use-auth';
import { DisasterReport, HelpRequest, Notification } from './firestore';

const STORAGE_KEYS = {
  USERS: 'offline_users',
  CURRENT_USER: 'offline_current_user',
  DISASTER_REPORTS: 'offline_disaster_reports',
  HELP_REQUESTS: 'offline_help_requests',
  NOTIFICATIONS: 'offline_notifications',
  DEMO_SETUP: 'offline_demo_setup'
};

// Helper functions for localStorage
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setInStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// Generate unique IDs
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// User management
export const offlineUserService = {
  async createUser(email: string, password: string, name: string, role: UserRole): Promise<{ uid: string; email: string }> {
    const users = getFromStorage(STORAGE_KEYS.USERS, {});
    const uid = generateId();
    
    if (users[email]) {
      throw new Error('User already exists');
    }
    
    const user = {
      uid,
      email,
      name,
      role,
      password, // In real app, this would be hashed
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isDemo: true
    };
    
    users[email] = user;
    setInStorage(STORAGE_KEYS.USERS, users);
    
    return { uid, email };
  },

  async signIn(email: string, password: string): Promise<{ uid: string; email: string } | null> {
    const users = getFromStorage(STORAGE_KEYS.USERS, {});
    const user = users[email];
    
    if (!user || user.password !== password) {
      return null;
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    users[email] = user;
    setInStorage(STORAGE_KEYS.USERS, users);
    
    // Set current user
    setInStorage(STORAGE_KEYS.CURRENT_USER, {
      uid: user.uid,
      email: user.email,
      name: user.name,
      role: user.role
    });
    
    return { uid: user.uid, email: user.email };
  },

  async signOut(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getCurrentUser(): User | null {
    return getFromStorage(STORAGE_KEYS.CURRENT_USER, null);
  },

  async getUserData(uid: string): Promise<any> {
    const users = getFromStorage(STORAGE_KEYS.USERS, {});
    const user = Object.values(users).find((u: any) => u.uid === uid);
    return user || null;
  }
};

// Disaster reports
export const offlineDisasterService = {
  async create(report: Omit<DisasterReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const reports = getFromStorage(STORAGE_KEYS.DISASTER_REPORTS, []);
    const id = generateId();
    
    const newReport: DisasterReport = {
      ...report,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    reports.unshift(newReport);
    setInStorage(STORAGE_KEYS.DISASTER_REPORTS, reports);
    
    // Create notification
    await this.createNotification(newReport);
    
    return id;
  },

  async getAll(): Promise<DisasterReport[]> {
    return getFromStorage(STORAGE_KEYS.DISASTER_REPORTS, []);
  },

  async getByUser(userId: string): Promise<DisasterReport[]> {
    const reports = getFromStorage(STORAGE_KEYS.DISASTER_REPORTS, []);
    return reports.filter((r: DisasterReport) => r.userId === userId);
  },

  async updateStatus(id: string, status: DisasterReport['status'], assignedTo?: string): Promise<void> {
    const reports = getFromStorage(STORAGE_KEYS.DISASTER_REPORTS, []);
    const index = reports.findIndex((r: DisasterReport) => r.id === id);
    
    if (index !== -1) {
      reports[index].status = status;
      reports[index].updatedAt = new Date();
      if (assignedTo) reports[index].assignedTo = assignedTo;
      if (status === 'resolved') reports[index].resolvedAt = new Date();
      
      setInStorage(STORAGE_KEYS.DISASTER_REPORTS, reports);
    }
  },

  async createNotification(report: DisasterReport): Promise<void> {
    const notifications = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    
    // Determine which authorities to notify
    const targetRoles: string[] = [];
    switch (report.type) {
      case 'fire':
        targetRoles.push('fire', 'police');
        break;
      case 'medical':
        targetRoles.push('ambulance', 'hospital');
        break;
      case 'accident':
        targetRoles.push('police', 'ambulance');
        break;
      case 'natural':
        targetRoles.push('police', 'fire', 'ambulance');
        break;
      default:
        targetRoles.push('police');
    }
    targetRoles.push('admin');

    // Create notifications for each role
    for (const role of targetRoles) {
      const notification: Notification = {
        id: generateId(),
        type: 'disaster_report',
        title: `New ${report.severity.toUpperCase()} Emergency: ${report.type}`,
        message: `${report.title} at ${report.location}`,
        targetRole: role as any,
        relatedId: report.id!,
        read: false,
        priority: report.severity as any,
        createdAt: new Date()
      };
      
      notifications.unshift(notification);
    }
    
    setInStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }
};

// Help requests
export const offlineHelpService = {
  async create(request: Omit<HelpRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const requests = getFromStorage(STORAGE_KEYS.HELP_REQUESTS, []);
    const id = generateId();
    
    const newRequest: HelpRequest = {
      ...request,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    requests.unshift(newRequest);
    setInStorage(STORAGE_KEYS.HELP_REQUESTS, requests);
    
    // Create notification
    await this.createNotification(newRequest);
    
    return id;
  },

  async getAll(): Promise<HelpRequest[]> {
    return getFromStorage(STORAGE_KEYS.HELP_REQUESTS, []);
  },

  async getByUser(userId: string): Promise<HelpRequest[]> {
    const requests = getFromStorage(STORAGE_KEYS.HELP_REQUESTS, []);
    return requests.filter((r: HelpRequest) => r.userId === userId);
  },

  async createNotification(request: HelpRequest): Promise<void> {
    const notifications = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    
    const targetRoles: string[] = [];
    switch (request.type) {
      case 'medical':
        targetRoles.push('ambulance', 'hospital');
        break;
      case 'supplies':
        targetRoles.push('hospital', 'admin');
        break;
      case 'transport':
        targetRoles.push('ambulance');
        break;
      default:
        targetRoles.push('admin');
    }

    for (const role of targetRoles) {
      const notification: Notification = {
        id: generateId(),
        type: 'help_request',
        title: `New ${request.urgency.toUpperCase()} Help Request: ${request.type}`,
        message: `${request.description} at ${request.location}`,
        targetRole: role as any,
        relatedId: request.id!,
        read: false,
        priority: request.urgency as any,
        createdAt: new Date()
      };
      
      notifications.unshift(notification);
    }
    
    setInStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }
};

// Notifications
export const offlineNotificationService = {
  async create(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    const notifications = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    const id = generateId();
    
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date()
    };
    
    notifications.unshift(newNotification);
    setInStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    
    return id;
  },

  async getByRole(role: string): Promise<Notification[]> {
    const notifications = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    return notifications.filter((n: Notification) => 
      n.targetRole === role || n.targetRole === 'all'
    );
  },

  async markAsRead(id: string): Promise<void> {
    const notifications = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    const index = notifications.findIndex((n: Notification) => n.id === id);
    
    if (index !== -1) {
      notifications[index].read = true;
      notifications[index].readAt = new Date();
      setInStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
  }
};

// Demo setup
export const offlineDemoService = {
  async setupDemoAccounts(): Promise<void> {
    const setupDone = getFromStorage(STORAGE_KEYS.DEMO_SETUP, false);
    if (setupDone) return;

    const demoAccounts = [
      { email: 'user@demo.com', password: 'demo123', name: 'John Citizen', role: 'user' as UserRole },
      { email: 'police@demo.com', password: 'demo123', name: 'Officer Smith', role: 'police' as UserRole },
      { email: 'fire@demo.com', password: 'demo123', name: 'Chief Johnson', role: 'fire' as UserRole },
      { email: 'ambulance@demo.com', password: 'demo123', name: 'Paramedic Davis', role: 'ambulance' as UserRole },
      { email: 'hospital@demo.com', password: 'demo123', name: 'Dr. Wilson', role: 'hospital' as UserRole },
      { email: 'admin@demo.com', password: 'demo123', name: 'System Admin', role: 'admin' as UserRole }
    ];

    for (const account of demoAccounts) {
      try {
        await offlineUserService.createUser(account.email, account.password, account.name, account.role);
        console.log(`Demo account created: ${account.email}`);
      } catch (error) {
        console.log(`Demo account already exists: ${account.email}`);
      }
    }

    setInStorage(STORAGE_KEYS.DEMO_SETUP, true);
    console.log('Offline demo accounts setup completed');
  }
};
