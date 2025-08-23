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
  GeoPoint,
  setDoc,
} from "firebase/firestore";
import { db, isFirebaseAvailable } from "./firebase";
import { UserRole } from "@/hooks/use-auth";

// Firestore Types
export interface DisasterRequest {
  id?: string;
  userId: string;
  userEmail: string;
  type: "fire" | "medical" | "natural" | "accident" | "crime" | "other";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  location: {
    address: string;
    coordinates: GeoPoint;
  };
  status: "pending" | "assigned" | "in-progress" | "resolved" | "rejected";
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
  type: "emergency" | "warning" | "info" | "update";
  priority: "low" | "medium" | "high" | "critical";
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
    urgency: "low" | "medium" | "high" | "critical";
  }[];
  deliveryLocation: {
    address: string;
    coordinates: GeoPoint;
  };
  status: "pending" | "approved" | "in-transit" | "delivered" | "rejected";
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
  type: "fire" | "medical" | "police" | "natural-disaster";
  title: string;
  description: string;
  location: {
    address: string;
    coordinates: GeoPoint;
  };
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "responding" | "resolved";
  assignedUnits: string[];
  reportedBy: string;
  reportedAt: Timestamp;
  resolvedAt?: Timestamp;
  estimatedResponse?: number; // minutes
  actualResponse?: number; // minutes
}

// Collection references
export const collections = {
  users: "users",
  disasters: "disaster_requests",
  news: "news_alerts",
  supplies: "hospital_supplies",
  incidents: "emergency_incidents",
  auditLogs: "audit_logs",
};

// Helper function to clean data for Firestore (remove undefined values)
const cleanFirestoreData = (data: any): any => {
  if (data === null || data === undefined) {
    return null;
  }

  if (Array.isArray(data)) {
    return data.map(cleanFirestoreData);
  }

  if (typeof data === "object") {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = cleanFirestoreData(value);
      }
    }
    return cleaned;
  }

  return data;
};

// Mock data store for when Firebase is unavailable
class MockFirestoreService {
  private data: Map<string, Map<string, any>> = new Map();
  private listeners: Map<string, ((data: any[]) => void)[]> = new Map();

  constructor() {
    // Initialize collections
    Object.values(collections).forEach((collectionName) => {
      this.data.set(collectionName, new Map());
      this.listeners.set(collectionName, []);
    });

    // Load from localStorage
    this.loadFromStorage();

    // Add some sample data
    this.addSampleData();
  }

  private saveToStorage() {
    try {
      const serialized = {};
      this.data.forEach((docs, collection) => {
        serialized[collection] = Array.from(docs.entries());
      });
      localStorage.setItem("mock-firestore", JSON.stringify(serialized));
    } catch (e) {
      console.warn("Failed to save mock data to localStorage");
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem("mock-firestore");
      if (stored) {
        const data = JSON.parse(stored);
        Object.keys(data).forEach((collection) => {
          if (this.data.has(collection)) {
            this.data.set(collection, new Map(data[collection]));
          }
        });
      }
    } catch (e) {
      console.warn("Failed to load mock data from localStorage");
    }
  }

  private addSampleData() {
    // Add sample news alerts if none exist
    const newsCollection = this.data.get(collections.news)!;
    if (newsCollection.size === 0) {
      const sampleAlert = {
        id: "sample-1",
        title: "System Online - Development Mode",
        content:
          "The disaster management system is running in development mode. Mock authentication is active for safe testing.",
        type: "info",
        priority: "low",
        publishedBy: "system",
        publishedAt: { toDate: () => new Date() },
        isActive: true,
        targetRoles: [
          "user",
          "police",
          "fire",
          "ambulance",
          "hospital",
          "admin",
        ],
      };
      newsCollection.set("sample-1", sampleAlert);
      this.saveToStorage();
    }
  }

  private notifyListeners(collectionName: string) {
    const listeners = this.listeners.get(collectionName) || [];
    const collectionData = this.data.get(collectionName);
    if (collectionData) {
      const docs = Array.from(collectionData.values());
      listeners.forEach((callback) => callback(docs));
    }
  }

  async addDoc(collectionName: string, data: any) {
    const id = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const collection = this.data.get(collectionName);
    if (collection) {
      // Clean the data to remove undefined values
      const cleanedData = cleanFirestoreData(data);
      collection.set(id, { ...cleanedData, id });
      this.saveToStorage();
      this.notifyListeners(collectionName);
    }
    return { id };
  }

  async getDoc(collectionName: string, docId: string) {
    const collection = this.data.get(collectionName);
    const doc = collection?.get(docId);
    return {
      exists: () => !!doc,
      data: () => doc,
    };
  }

  async getDocs(collectionName: string) {
    const collection = this.data.get(collectionName);
    const docs = Array.from(collection?.values() || []);
    return {
      docs: docs.map((doc) => ({
        id: doc.id,
        data: () => doc,
      })),
    };
  }

  async updateDoc(collectionName: string, docId: string, updates: any) {
    const collection = this.data.get(collectionName);
    const existingDoc = collection?.get(docId);
    if (existingDoc) {
      // Clean the updates to remove undefined values
      const cleanedUpdates = cleanFirestoreData(updates);
      collection.set(docId, { ...existingDoc, ...cleanedUpdates });
      this.saveToStorage();
      this.notifyListeners(collectionName);
    }
  }

  async setDoc(collectionName: string, docId: string, data: any) {
    const collection = this.data.get(collectionName);
    if (collection) {
      // Clean the data to remove undefined values
      const cleanedData = cleanFirestoreData(data);
      collection.set(docId, { ...cleanedData, id: docId });
      this.saveToStorage();
      this.notifyListeners(collectionName);
    }
  }

  onSnapshot(collectionName: string, callback: (docs: any[]) => void) {
    const listeners = this.listeners.get(collectionName) || [];
    listeners.push(callback);
    this.listeners.set(collectionName, listeners);

    // Immediately call with current data
    const collection = this.data.get(collectionName);
    if (collection) {
      callback(Array.from(collection.values()));
    }

    // Return unsubscribe function
    return () => {
      const currentListeners = this.listeners.get(collectionName) || [];
      this.listeners.set(
        collectionName,
        currentListeners.filter((l) => l !== callback),
      );
    };
  }
}

const mockFirestore = new MockFirestoreService();

// Helper functions for Firestore operations
export const firestoreService = {
  // Disaster Requests
  async createDisasterRequest(
    data: Omit<DisasterRequest, "id" | "createdAt" | "updatedAt">,
  ) {
    const now = new Date();
    const requestData = {
      ...data,
      createdAt: { toDate: () => now },
      updatedAt: { toDate: () => now },
    };

    if (isFirebaseAvailable() && db) {
      try {
        const firestoreNow = Timestamp.now();
        const cleanedData = cleanFirestoreData({
          ...data,
          createdAt: firestoreNow,
          updatedAt: firestoreNow,
        });
        return await addDoc(collection(db, collections.disasters), cleanedData);
      } catch (error) {
        console.error(
          "Firebase createDisasterRequest failed, falling back to mock:",
          error,
        );
        return await mockFirestore.addDoc(collections.disasters, requestData);
      }
    } else {
      return await mockFirestore.addDoc(collections.disasters, requestData);
    }
  },

  async getDisasterRequests() {
    if (isFirebaseAvailable() && db) {
      try {
        const q = query(
          collection(db, collections.disasters),
          orderBy("createdAt", "desc"),
        );
        return await getDocs(q);
      } catch (error) {
        console.error(
          "Firebase getDisasterRequests failed, falling back to mock:",
          error,
        );
        return await mockFirestore.getDocs(collections.disasters);
      }
    } else {
      return await mockFirestore.getDocs(collections.disasters);
    }
  },

  async updateDisasterRequest(id: string, updates: Partial<DisasterRequest>) {
    const updateData = {
      ...updates,
      updatedAt: isFirebaseAvailable()
        ? Timestamp.now()
        : { toDate: () => new Date() },
    };

    if (isFirebaseAvailable() && db) {
      try {
        const docRef = doc(db, collections.disasters, id);
        const cleanedData = cleanFirestoreData(updateData);
        return await updateDoc(docRef, cleanedData);
      } catch (error) {
        console.error(
          "Firebase updateDisasterRequest failed, falling back to mock:",
          error,
        );
        return await mockFirestore.updateDoc(
          collections.disasters,
          id,
          updateData,
        );
      }
    } else {
      return await mockFirestore.updateDoc(
        collections.disasters,
        id,
        updateData,
      );
    }
  },

  // News & Alerts
  async createNewsAlert(data: Omit<NewsAlert, "id" | "publishedAt">) {
    const alertData = {
      ...data,
      publishedAt: isFirebaseAvailable()
        ? Timestamp.now()
        : { toDate: () => new Date() },
    };

    if (isFirebaseAvailable() && db) {
      try {
        const cleanedData = cleanFirestoreData(alertData);
        return await addDoc(collection(db, collections.news), cleanedData);
      } catch (error) {
        console.error(
          "Firebase createNewsAlert failed, falling back to mock:",
          error,
        );
        return await mockFirestore.addDoc(collections.news, alertData);
      }
    } else {
      return await mockFirestore.addDoc(collections.news, alertData);
    }
  },

  async getActiveNews() {
    if (isFirebaseAvailable() && db) {
      try {
        const q = query(
          collection(db, collections.news),
          where("isActive", "==", true),
          orderBy("publishedAt", "desc"),
        );
        return await getDocs(q);
      } catch (error) {
        console.error(
          "Firebase getActiveNews failed, falling back to mock:",
          error,
        );
        // Mock implementation - filter active news
        const allNews = await mockFirestore.getDocs(collections.news);
        const activeDocs = allNews.docs.filter((doc) => doc.data().isActive);
        return { docs: activeDocs };
      }
    } else {
      // Mock implementation - filter active news
      const allNews = await mockFirestore.getDocs(collections.news);
      const activeDocs = allNews.docs.filter((doc) => doc.data().isActive);
      return { docs: activeDocs };
    }
  },

  // Hospital Supplies
  async createSupplyRequest(
    data: Omit<HospitalSupplyRequest, "id" | "requestedAt">,
  ) {
    const requestData = {
      ...data,
      requestedAt: isFirebaseAvailable()
        ? Timestamp.now()
        : { toDate: () => new Date() },
    };

    if (isFirebaseAvailable() && db) {
      try {
        const cleanedData = cleanFirestoreData(requestData);
        return await addDoc(collection(db, collections.supplies), cleanedData);
      } catch (error) {
        console.error(
          "Firebase createSupplyRequest failed, falling back to mock:",
          error,
        );
        return await mockFirestore.addDoc(collections.supplies, requestData);
      }
    } else {
      return await mockFirestore.addDoc(collections.supplies, requestData);
    }
  },

  async getSupplyRequests() {
    if (isFirebaseAvailable() && db) {
      try {
        const q = query(
          collection(db, collections.supplies),
          orderBy("requestedAt", "desc"),
        );
        return await getDocs(q);
      } catch (error) {
        console.error(
          "Firebase getSupplyRequests failed, falling back to mock:",
          error,
        );
        return await mockFirestore.getDocs(collections.supplies);
      }
    } else {
      return await mockFirestore.getDocs(collections.supplies);
    }
  },

  // User Profiles
  async createUserProfile(
    uid: string,
    data: Omit<UserProfile, "uid" | "createdAt" | "lastLoginAt">,
  ) {
    const now = new Date();
    const profileData = {
      uid,
      ...data,
      createdAt: { toDate: () => now },
      lastLoginAt: { toDate: () => now },
    };

    if (isFirebaseAvailable() && db) {
      try {
        const firestoreNow = Timestamp.now();
        const docRef = doc(db, collections.users, uid);
        const cleanedData = cleanFirestoreData({
          uid,
          ...data,
          createdAt: firestoreNow,
          lastLoginAt: firestoreNow,
        });
        await setDoc(docRef, cleanedData);
      } catch (error) {
        console.error(
          "Firebase createUserProfile failed, falling back to mock:",
          error,
        );
        await mockFirestore.setDoc(collections.users, uid, profileData);
      }
    } else {
      await mockFirestore.setDoc(collections.users, uid, profileData);
    }
  },

  async getUserProfile(uid: string) {
    if (isFirebaseAvailable() && db) {
      try {
        const docRef = doc(db, collections.users, uid);
        return await getDoc(docRef);
      } catch (error) {
        console.error(
          "Firebase getUserProfile failed, falling back to mock:",
          error,
        );
        return await mockFirestore.getDoc(collections.users, uid);
      }
    } else {
      return await mockFirestore.getDoc(collections.users, uid);
    }
  },

  async updateUserProfile(uid: string, updates: Partial<UserProfile>) {
    const updateData = {
      ...updates,
      lastLoginAt: isFirebaseAvailable()
        ? Timestamp.now()
        : { toDate: () => new Date() },
    };

    if (isFirebaseAvailable() && db) {
      try {
        const docRef = doc(db, collections.users, uid);
        const cleanedData = cleanFirestoreData(updateData);
        return await updateDoc(docRef, cleanedData);
      } catch (error) {
        console.error(
          "Firebase updateUserProfile failed, falling back to mock:",
          error,
        );
        return await mockFirestore.updateDoc(
          collections.users,
          uid,
          updateData,
        );
      }
    } else {
      return await mockFirestore.updateDoc(collections.users, uid, updateData);
    }
  },

  // Real-time subscriptions
  subscribeToDisasterRequests(callback: (requests: DisasterRequest[]) => void) {
    if (isFirebaseAvailable() && db) {
      try {
        const q = query(
          collection(db, collections.disasters),
          orderBy("createdAt", "desc"),
        );
        return onSnapshot(
          q,
          (snapshot) => {
            const requests = snapshot.docs.map(
              (doc) =>
                ({
                  id: doc.id,
                  ...doc.data(),
                }) as DisasterRequest,
            );
            callback(requests);
          },
          (error) => {
            console.error(
              "Firebase subscribeToDisasterRequests failed, falling back to mock:",
              error,
            );
            // Fall back to mock subscription
            return mockFirestore.onSnapshot(collections.disasters, (docs) => {
              const requests = docs.map(
                (doc) =>
                  ({
                    id: doc.id,
                    ...doc,
                  }) as DisasterRequest,
              );
              callback(requests);
            });
          },
        );
      } catch (error) {
        console.error(
          "Firebase subscribeToDisasterRequests failed, falling back to mock:",
          error,
        );
        return mockFirestore.onSnapshot(collections.disasters, (docs) => {
          const requests = docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc,
              }) as DisasterRequest,
          );
          callback(requests);
        });
      }
    } else {
      return mockFirestore.onSnapshot(collections.disasters, (docs) => {
        const requests = docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc,
            }) as DisasterRequest,
        );
        callback(requests);
      });
    }
  },

  subscribeToNews(callback: (news: NewsAlert[]) => void) {
    if (isFirebaseAvailable() && db) {
      try {
        const q = query(
          collection(db, collections.news),
          where("isActive", "==", true),
          orderBy("publishedAt", "desc"),
        );
        return onSnapshot(
          q,
          (snapshot) => {
            const news = snapshot.docs.map(
              (doc) =>
                ({
                  id: doc.id,
                  ...doc.data(),
                }) as NewsAlert,
            );
            callback(news);
          },
          (error) => {
            console.error(
              "Firebase subscribeToNews failed, falling back to mock:",
              error,
            );
            // Fall back to mock subscription
            return mockFirestore.onSnapshot(collections.news, (docs) => {
              const news = docs
                .filter((doc) => doc.isActive)
                .map(
                  (doc) =>
                    ({
                      id: doc.id,
                      ...doc,
                    }) as NewsAlert,
                );
              callback(news);
            });
          },
        );
      } catch (error) {
        console.error(
          "Firebase subscribeToNews failed, falling back to mock:",
          error,
        );
        return mockFirestore.onSnapshot(collections.news, (docs) => {
          const news = docs
            .filter((doc) => doc.isActive)
            .map(
              (doc) =>
                ({
                  id: doc.id,
                  ...doc,
                }) as NewsAlert,
            );
          callback(news);
        });
      }
    } else {
      return mockFirestore.onSnapshot(collections.news, (docs) => {
        const news = docs
          .filter((doc) => doc.isActive)
          .map(
            (doc) =>
              ({
                id: doc.id,
                ...doc,
              }) as NewsAlert,
          );
        callback(news);
      });
    }
  },
};
