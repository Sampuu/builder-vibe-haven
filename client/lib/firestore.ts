import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Types for database collections
export interface DisasterReport {
  id?: string;
  type: 'fire' | 'medical' | 'accident' | 'natural' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  userId: string;
  images?: string[];
  status: 'submitted' | 'acknowledged' | 'assigned' | 'in-progress' | 'resolved';
  assignedTo?: string;
  assignedTeam?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  resolvedAt?: Timestamp | Date;
  responseTime?: number; // in minutes
  notes?: string[];
}

export interface HelpRequest {
  id?: string;
  type: 'medical' | 'supplies' | 'transport' | 'other';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  contactPhone: string;
  contactName: string;
  contactEmail: string;
  userId: string;
  specialRequests?: string;
  status: 'submitted' | 'acknowledged' | 'assigned' | 'in-progress' | 'resolved';
  assignedTo?: string;
  assignedTeam?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  resolvedAt?: Timestamp | Date;
  supplies?: string[];
  notes?: string[];
}

export interface Notification {
  id?: string;
  type: 'disaster_report' | 'help_request' | 'status_update' | 'assignment';
  title: string;
  message: string;
  targetRole: 'police' | 'fire' | 'ambulance' | 'hospital' | 'admin' | 'all';
  targetUserId?: string;
  relatedId: string; // ID of the disaster report or help request
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Timestamp | Date;
  readAt?: Timestamp | Date;
}

// Database service functions
export const disasterReportsService = {
  // Create a new disaster report
  async create(report: Omit<DisasterReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'disasterReports'), {
      ...report,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Get all disaster reports
  async getAll(): Promise<DisasterReport[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'disasterReports'), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DisasterReport));
  },

  // Get disaster reports by user
  async getByUser(userId: string): Promise<DisasterReport[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'disasterReports'), 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DisasterReport));
  },

  // Get disaster reports by type
  async getByType(type: string): Promise<DisasterReport[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'disasterReports'), 
        where('type', '==', type),
        orderBy('createdAt', 'desc')
      )
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DisasterReport));
  },

  // Update disaster report status
  async updateStatus(id: string, status: DisasterReport['status'], assignedTo?: string): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
    };
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (status === 'resolved') updateData.resolvedAt = serverTimestamp();
    
    await updateDoc(doc(db, 'disasterReports', id), updateData);
  },

  // Listen to real-time updates
  onSnapshot(callback: (reports: DisasterReport[]) => void) {
    return onSnapshot(
      query(collection(db, 'disasterReports'), orderBy('createdAt', 'desc')),
      (querySnapshot) => {
        const reports = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as DisasterReport));
        callback(reports);
      }
    );
  }
};

export const helpRequestsService = {
  // Create a new help request
  async create(request: Omit<HelpRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'helpRequests'), {
      ...request,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Get all help requests
  async getAll(): Promise<HelpRequest[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'helpRequests'), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HelpRequest));
  },

  // Get help requests by user
  async getByUser(userId: string): Promise<HelpRequest[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'helpRequests'), 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HelpRequest));
  },

  // Update help request status
  async updateStatus(id: string, status: HelpRequest['status'], assignedTo?: string): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
    };
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (status === 'resolved') updateData.resolvedAt = serverTimestamp();
    
    await updateDoc(doc(db, 'helpRequests', id), updateData);
  },

  // Listen to real-time updates
  onSnapshot(callback: (requests: HelpRequest[]) => void) {
    return onSnapshot(
      query(collection(db, 'helpRequests'), orderBy('createdAt', 'desc')),
      (querySnapshot) => {
        const requests = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as HelpRequest));
        callback(requests);
      }
    );
  }
};

export const notificationsService = {
  // Create a new notification
  async create(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...notification,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Get notifications for a specific role
  async getByRole(role: string): Promise<Notification[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'notifications'), 
        where('targetRole', 'in', [role, 'all']),
        orderBy('createdAt', 'desc')
      )
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
  },

  // Mark notification as read
  async markAsRead(id: string): Promise<void> {
    await updateDoc(doc(db, 'notifications', id), {
      read: true,
      readAt: serverTimestamp(),
    });
  },

  // Listen to real-time notifications for a role
  onSnapshot(role: string, callback: (notifications: Notification[]) => void) {
    return onSnapshot(
      query(
        collection(db, 'notifications'), 
        where('targetRole', 'in', [role, 'all']),
        orderBy('createdAt', 'desc')
      ),
      (querySnapshot) => {
        const notifications = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as Notification));
        callback(notifications);
      }
    );
  }
};

// Helper function to create notifications when new reports are submitted
export const createNotificationForReport = async (report: DisasterReport): Promise<void> => {
  // Determine which authorities to notify based on report type
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

  // Always notify admin
  targetRoles.push('admin');

  // Create notifications for each relevant authority
  for (const role of targetRoles) {
    await notificationsService.create({
      type: 'disaster_report',
      title: `New ${report.severity.toUpperCase()} Emergency: ${report.type}`,
      message: `${report.title} at ${report.location}`,
      targetRole: role as any,
      relatedId: report.id!,
      read: false,
      priority: report.severity as any,
    });
  }
};

// Helper function to create notifications when new help requests are submitted
export const createNotificationForHelpRequest = async (request: HelpRequest): Promise<void> => {
  // Determine which authorities to notify based on request type
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

  // Create notifications for each relevant authority
  for (const role of targetRoles) {
    await notificationsService.create({
      type: 'help_request',
      title: `New ${request.urgency.toUpperCase()} Help Request: ${request.type}`,
      message: `${request.description} at ${request.location}`,
      targetRole: role as any,
      relatedId: request.id!,
      read: false,
      priority: request.urgency as any,
    });
  }
};
