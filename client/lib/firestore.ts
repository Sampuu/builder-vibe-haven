import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  GeoPoint
} from 'firebase/firestore';
import { db } from './firebase';
import { UserRole } from '@/hooks/use-auth';

// Firestore Types
export interface DisasterRequest {
  id?: string;
  userId: string;
  userEmail: string;
  type: 'fire' | 'medical' | 'natural' | 'accident' | 'crime' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: {
    address: string;
    coordinates: GeoPoint;
  };
  status: 'pending' | 'assigned' | 'in-progress' | 'resolved' | 'rejected';
  assignedTo?: string;
  assignedRole?: UserRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  images?: string[];
  contactNumber?: string;
  urgencyLevel: number; // 1-10
}

export interface NewsAlert {
  id?: string;
  title: string;
  content: string;
  type: 'emergency' | 'warning' | 'info' | 'update';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  publishedBy: string;
  publishedAt: Timestamp;
  expiresAt?: Timestamp;
  isActive: boolean;
  targetRoles: UserRole[];
}

export interface HospitalSupplyRequest {
  id?: string;
  hospitalId: string;
  hospitalName: string;
  requestedBy: string;
  items: {
    name: string;
    quantity: number;
    unit: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  }[];
  deliveryLocation: {
    address: string;
    coordinates: GeoPoint;
  };
  status: 'pending' | 'approved' | 'in-transit' | 'delivered' | 'rejected';
  requestedAt: Timestamp;
  expectedDelivery?: Timestamp;
  notes?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  phoneNumber?: string;
  department?: string;
  location?: {
    address: string;
    coordinates: GeoPoint;
  };
  isActive: boolean;
  lastLoginAt: Timestamp;
  createdAt: Timestamp;
}

export interface EmergencyIncident {
  id?: string;
  type: 'fire' | 'medical' | 'police' | 'natural-disaster';
  title: string;
  description: string;
  location: {
    address: string;
    coordinates: GeoPoint;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'responding' | 'resolved';
  assignedUnits: string[];
  reportedBy: string;
  reportedAt: Timestamp;
  resolvedAt?: Timestamp;
  estimatedResponse?: number; // minutes
  actualResponse?: number; // minutes
}

// Collection references
export const collections = {
  users: 'users',
  disasters: 'disaster_requests',
  news: 'news_alerts',
  supplies: 'hospital_supplies',
  incidents: 'emergency_incidents',
  auditLogs: 'audit_logs'
};

// Helper functions for Firestore operations
export const firestoreService = {
  // Disaster Requests
  async createDisasterRequest(data: Omit<DisasterRequest, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = Timestamp.now();
    return await addDoc(collection(db, collections.disasters), {
      ...data,
      createdAt: now,
      updatedAt: now
    });
  },

  async getDisasterRequests() {
    const q = query(collection(db, collections.disasters), orderBy('createdAt', 'desc'));
    return await getDocs(q);
  },

  async updateDisasterRequest(id: string, updates: Partial<DisasterRequest>) {
    const docRef = doc(db, collections.disasters, id);
    return await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  },

  // News & Alerts
  async createNewsAlert(data: Omit<NewsAlert, 'id' | 'publishedAt'>) {
    return await addDoc(collection(db, collections.news), {
      ...data,
      publishedAt: Timestamp.now()
    });
  },

  async getActiveNews() {
    const q = query(
      collection(db, collections.news), 
      where('isActive', '==', true),
      orderBy('publishedAt', 'desc')
    );
    return await getDocs(q);
  },

  // Hospital Supplies
  async createSupplyRequest(data: Omit<HospitalSupplyRequest, 'id' | 'requestedAt'>) {
    return await addDoc(collection(db, collections.supplies), {
      ...data,
      requestedAt: Timestamp.now()
    });
  },

  async getSupplyRequests() {
    const q = query(collection(db, collections.supplies), orderBy('requestedAt', 'desc'));
    return await getDocs(q);
  },

  // User Profiles
  async createUserProfile(uid: string, data: Omit<UserProfile, 'uid' | 'createdAt' | 'lastLoginAt'>) {
    const now = Timestamp.now();
    const docRef = doc(db, collections.users, uid);
    await updateDoc(docRef, {
      uid,
      ...data,
      createdAt: now,
      lastLoginAt: now
    });
  },

  async getUserProfile(uid: string) {
    const docRef = doc(db, collections.users, uid);
    return await getDoc(docRef);
  },

  async updateUserProfile(uid: string, updates: Partial<UserProfile>) {
    const docRef = doc(db, collections.users, uid);
    return await updateDoc(docRef, {
      ...updates,
      lastLoginAt: Timestamp.now()
    });
  },

  // Real-time subscriptions
  subscribeToDisasterRequests(callback: (requests: DisasterRequest[]) => void) {
    const q = query(collection(db, collections.disasters), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DisasterRequest));
      callback(requests);
    });
  },

  subscribeToNews(callback: (news: NewsAlert[]) => void) {
    const q = query(
      collection(db, collections.news), 
      where('isActive', '==', true),
      orderBy('publishedAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const news = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as NewsAlert));
      callback(news);
    });
  }
};
