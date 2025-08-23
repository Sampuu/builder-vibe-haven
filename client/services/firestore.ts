import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserRole } from '@/hooks/use-auth';

// Data Types
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
  images?: string[];
  status: 'submitted' | 'acknowledged' | 'in-progress' | 'resolved';
  reportedBy: string; // User ID
  assignedTo?: string; // Responder ID
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface NewsAlert {
  id?: string;
  title: string;
  content: string;
  type: 'emergency' | 'warning' | 'info' | 'resolved';
  location?: string;
  coordinates?: { lat: number; lng: number };
  authorId: string;
  authorName: string;
  createdAt: Timestamp;
  isPublic: boolean;
}

export interface SupplyRequest {
  id?: string;
  hospitalId: string;
  hospitalName: string;
  items: Array<{
    name: string;
    quantity: number;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  }>;
  deliveryLocation: string;
  coordinates?: { lat: number; lng: number };
  contactInfo: string;
  notes?: string;
  status: 'pending' | 'approved' | 'in-transit' | 'delivered' | 'rejected';
  requestedAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  department?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Disaster Reports Service
export const disasterReportsService = {
  // Create a new disaster report
  async create(report: Omit<DisasterReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'disasterReports'), {
      ...report,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Get all disaster reports
  async getAll(): Promise<DisasterReport[]> {
    const q = query(collection(db, 'disasterReports'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DisasterReport));
  },

  // Get reports by status
  async getByStatus(status: DisasterReport['status']): Promise<DisasterReport[]> {
    const q = query(
      collection(db, 'disasterReports'), 
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DisasterReport));
  },

  // Get reports by type
  async getByType(type: DisasterReport['type']): Promise<DisasterReport[]> {
    const q = query(
      collection(db, 'disasterReports'), 
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DisasterReport));
  },

  // Get reports by user
  async getByUser(userId: string): Promise<DisasterReport[]> {
    const q = query(
      collection(db, 'disasterReports'), 
      where('reportedBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DisasterReport));
  },

  // Update report status
  async updateStatus(reportId: string, status: DisasterReport['status'], assignedTo?: string): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: serverTimestamp()
    };
    if (assignedTo) {
      updateData.assignedTo = assignedTo;
    }
    await updateDoc(doc(db, 'disasterReports', reportId), updateData);
  },

  // Delete a report
  async delete(reportId: string): Promise<void> {
    await deleteDoc(doc(db, 'disasterReports', reportId));
  },

  // Subscribe to real-time updates
  subscribeToUpdates(callback: (reports: DisasterReport[]) => void): () => void {
    const q = query(collection(db, 'disasterReports'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const reports = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DisasterReport));
      callback(reports);
    });
  }
};

// News Alerts Service
export const newsAlertsService = {
  // Create a news alert
  async create(alert: Omit<NewsAlert, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'newsAlerts'), {
      ...alert,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Get all public news alerts
  async getPublic(): Promise<NewsAlert[]> {
    const q = query(
      collection(db, 'newsAlerts'), 
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as NewsAlert));
  },

  // Subscribe to real-time news updates
  subscribeToUpdates(callback: (alerts: NewsAlert[]) => void): () => void {
    const q = query(
      collection(db, 'newsAlerts'), 
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    return onSnapshot(q, (querySnapshot) => {
      const alerts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as NewsAlert));
      callback(alerts);
    });
  }
};

// Supply Requests Service
export const supplyRequestsService = {
  // Create a supply request
  async create(request: Omit<SupplyRequest, 'id' | 'requestedAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'supplyRequests'), {
      ...request,
      requestedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Get all supply requests
  async getAll(): Promise<SupplyRequest[]> {
    const q = query(collection(db, 'supplyRequests'), orderBy('requestedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SupplyRequest));
  },

  // Get requests by hospital
  async getByHospital(hospitalId: string): Promise<SupplyRequest[]> {
    const q = query(
      collection(db, 'supplyRequests'), 
      where('hospitalId', '==', hospitalId),
      orderBy('requestedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SupplyRequest));
  },

  // Update request status
  async updateStatus(requestId: string, status: SupplyRequest['status']): Promise<void> {
    await updateDoc(doc(db, 'supplyRequests', requestId), {
      status,
      updatedAt: serverTimestamp()
    });
  },

  // Subscribe to real-time updates
  subscribeToUpdates(callback: (requests: SupplyRequest[]) => void): () => void {
    const q = query(collection(db, 'supplyRequests'), orderBy('requestedAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SupplyRequest));
      callback(requests);
    });
  }
};

// User Profiles Service
export const userProfilesService = {
  // Get all users (admin only)
  async getAll(): Promise<UserProfile[]> {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as UserProfile));
  },

  // Get users by role
  async getByRole(role: UserRole): Promise<UserProfile[]> {
    const q = query(
      collection(db, 'users'), 
      where('role', '==', role),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as UserProfile));
  },

  // Update user status
  async updateStatus(userId: string, isActive: boolean): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      isActive,
      updatedAt: serverTimestamp()
    });
  }
};
