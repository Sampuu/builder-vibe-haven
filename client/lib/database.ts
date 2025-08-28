import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import {
  UserProfile,
  PoliceReport,
  AmbulanceRequest,
  FireBrigadeReport,
  HospitalRecord,
  AdminLog,
  EmergencyRequest,
  UserRole
} from '@shared/firebase-types';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  POLICE_REPORTS: 'policeReports',
  AMBULANCE_REQUESTS: 'ambulanceRequests',
  FIRE_BRIGADE_REPORTS: 'fireBrigadeReports',
  HOSPITAL_RECORDS: 'hospitalRecords',
  ADMIN_LOGS: 'adminLogs',
  EMERGENCY_REQUESTS: 'emergencyRequests'
} as const;

// Generic database operations
export class DatabaseService {
  // Create a new document
  static async create<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  // Get a single document
  static async get<T>(collectionName: string, docId: string): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error);
      throw error;
    }
  }

  // Update a document
  static async update<T>(collectionName: string, docId: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  }

  // Delete a document
  static async delete(collectionName: string, docId: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }

  // Get multiple documents with query
  static async query<T>(
    collectionName: string,
    conditions?: {
      field: string;
      operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not-in' | 'array-contains';
      value: any;
    }[],
    orderByField?: string,
    orderDirection: 'asc' | 'desc' = 'desc',
    limitCount?: number
  ): Promise<T[]> {
    try {
      let q = collection(db, collectionName);
      
      // Add where conditions
      if (conditions) {
        conditions.forEach(condition => {
          q = query(q as any, where(condition.field, condition.operator, condition.value));
        });
      }
      
      // Add ordering
      if (orderByField) {
        q = query(q as any, orderBy(orderByField, orderDirection));
      }
      
      // Add limit
      if (limitCount) {
        q = query(q as any, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q as any);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error) {
      console.error(`Error querying ${collectionName}:`, error);
      throw error;
    }
  }
}

// Specialized service classes for each entity type
export class UserService {
  static async createUser(userData: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return DatabaseService.create<UserProfile>(COLLECTIONS.USERS, userData as any);
  }

  static async getUser(uid: string): Promise<UserProfile | null> {
    return DatabaseService.get<UserProfile>(COLLECTIONS.USERS, uid);
  }

  static async updateUser(uid: string, userData: Partial<UserProfile>): Promise<void> {
    return DatabaseService.update<UserProfile>(COLLECTIONS.USERS, uid, userData);
  }

  static async getUsersByRole(role: UserRole): Promise<UserProfile[]> {
    return DatabaseService.query<UserProfile>(
      COLLECTIONS.USERS,
      [{ field: 'role', operator: '==', value: role }]
    );
  }
}

export class PoliceService {
  static async createReport(reportData: Omit<PoliceReport, 'reportId' | 'timestamp'>): Promise<string> {
    return DatabaseService.create<PoliceReport>(COLLECTIONS.POLICE_REPORTS, reportData as any);
  }

  static async getReport(reportId: string): Promise<PoliceReport | null> {
    return DatabaseService.get<PoliceReport>(COLLECTIONS.POLICE_REPORTS, reportId);
  }

  static async updateReport(reportId: string, reportData: Partial<PoliceReport>): Promise<void> {
    return DatabaseService.update<PoliceReport>(COLLECTIONS.POLICE_REPORTS, reportId, reportData);
  }

  static async getReportsByOfficer(officerId: string): Promise<PoliceReport[]> {
    return DatabaseService.query<PoliceReport>(
      COLLECTIONS.POLICE_REPORTS,
      [{ field: 'officerId', operator: '==', value: officerId }],
      'timestamp'
    );
  }

  static async getReportsByStatus(status: PoliceReport['status']): Promise<PoliceReport[]> {
    return DatabaseService.query<PoliceReport>(
      COLLECTIONS.POLICE_REPORTS,
      [{ field: 'status', operator: '==', value: status }],
      'timestamp'
    );
  }
}

export class AmbulanceService {
  static async createRequest(requestData: Omit<AmbulanceRequest, 'requestId' | 'timestamp'>): Promise<string> {
    return DatabaseService.create<AmbulanceRequest>(COLLECTIONS.AMBULANCE_REQUESTS, requestData as any);
  }

  static async getRequest(requestId: string): Promise<AmbulanceRequest | null> {
    return DatabaseService.get<AmbulanceRequest>(COLLECTIONS.AMBULANCE_REQUESTS, requestId);
  }

  static async updateRequest(requestId: string, requestData: Partial<AmbulanceRequest>): Promise<void> {
    return DatabaseService.update<AmbulanceRequest>(COLLECTIONS.AMBULANCE_REQUESTS, requestId, requestData);
  }

  static async getActiveRequests(): Promise<AmbulanceRequest[]> {
    return DatabaseService.query<AmbulanceRequest>(
      COLLECTIONS.AMBULANCE_REQUESTS,
      [{ field: 'status', operator: 'in', value: ['requested', 'dispatched', 'en_route', 'arrived'] }],
      'timestamp'
    );
  }
}

export class FireBrigadeService {
  static async createReport(reportData: Omit<FireBrigadeReport, 'reportId' | 'timestamp'>): Promise<string> {
    return DatabaseService.create<FireBrigadeReport>(COLLECTIONS.FIRE_BRIGADE_REPORTS, reportData as any);
  }

  static async getReport(reportId: string): Promise<FireBrigadeReport | null> {
    return DatabaseService.get<FireBrigadeReport>(COLLECTIONS.FIRE_BRIGADE_REPORTS, reportId);
  }

  static async updateReport(reportId: string, reportData: Partial<FireBrigadeReport>): Promise<void> {
    return DatabaseService.update<FireBrigadeReport>(COLLECTIONS.FIRE_BRIGADE_REPORTS, reportId, reportData);
  }

  static async getActiveIncidents(): Promise<FireBrigadeReport[]> {
    return DatabaseService.query<FireBrigadeReport>(
      COLLECTIONS.FIRE_BRIGADE_REPORTS,
      [{ field: 'status', operator: 'in', value: ['reported', 'responding', 'on_scene', 'controlled'] }],
      'timestamp'
    );
  }
}

export class HospitalService {
  static async createRecord(recordData: Omit<HospitalRecord, 'recordId' | 'lastUpdated'>): Promise<string> {
    return DatabaseService.create<HospitalRecord>(COLLECTIONS.HOSPITAL_RECORDS, recordData as any);
  }

  static async getRecord(recordId: string): Promise<HospitalRecord | null> {
    return DatabaseService.get<HospitalRecord>(COLLECTIONS.HOSPITAL_RECORDS, recordId);
  }

  static async updateRecord(recordId: string, recordData: Partial<HospitalRecord>): Promise<void> {
    return DatabaseService.update<HospitalRecord>(COLLECTIONS.HOSPITAL_RECORDS, recordId, recordData);
  }

  static async getAvailableHospitals(): Promise<HospitalRecord[]> {
    return DatabaseService.query<HospitalRecord>(
      COLLECTIONS.HOSPITAL_RECORDS,
      [{ field: 'status', operator: 'in', value: ['operational', 'emergency_only'] }],
      'lastUpdated'
    );
  }
}

export class EmergencyService {
  static async createRequest(requestData: Omit<EmergencyRequest, 'requestId' | 'timestamp'>): Promise<string> {
    return DatabaseService.create<EmergencyRequest>(COLLECTIONS.EMERGENCY_REQUESTS, requestData as any);
  }

  static async getRequest(requestId: string): Promise<EmergencyRequest | null> {
    return DatabaseService.get<EmergencyRequest>(COLLECTIONS.EMERGENCY_REQUESTS, requestId);
  }

  static async updateRequest(requestId: string, requestData: Partial<EmergencyRequest>): Promise<void> {
    return DatabaseService.update<EmergencyRequest>(COLLECTIONS.EMERGENCY_REQUESTS, requestId, requestData);
  }

  static async getRequestsByUser(userId: string): Promise<EmergencyRequest[]> {
    return DatabaseService.query<EmergencyRequest>(
      COLLECTIONS.EMERGENCY_REQUESTS,
      [{ field: 'userId', operator: '==', value: userId }],
      'timestamp'
    );
  }

  static async getPendingRequests(): Promise<EmergencyRequest[]> {
    return DatabaseService.query<EmergencyRequest>(
      COLLECTIONS.EMERGENCY_REQUESTS,
      [{ field: 'status', operator: '==', value: 'pending' }],
      'timestamp'
    );
  }
}

export class AdminService {
  static async createLog(logData: Omit<AdminLog, 'logId' | 'timestamp'>): Promise<string> {
    return DatabaseService.create<AdminLog>(COLLECTIONS.ADMIN_LOGS, logData as any);
  }

  static async getLog(logId: string): Promise<AdminLog | null> {
    return DatabaseService.get<AdminLog>(COLLECTIONS.ADMIN_LOGS, logId);
  }

  static async getLogsByAdmin(adminId: string): Promise<AdminLog[]> {
    return DatabaseService.query<AdminLog>(
      COLLECTIONS.ADMIN_LOGS,
      [{ field: 'adminId', operator: '==', value: adminId }],
      'timestamp'
    );
  }

  static async getLogsByCategory(category: AdminLog['category']): Promise<AdminLog[]> {
    return DatabaseService.query<AdminLog>(
      COLLECTIONS.ADMIN_LOGS,
      [{ field: 'category', operator: '==', value: category }],
      'timestamp'
    );
  }
}
