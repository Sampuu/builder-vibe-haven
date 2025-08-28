import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  where,
  limit,
  onSnapshot,
  serverTimestamp,
  GeoPoint,
  Timestamp,
} from "firebase/firestore";
import { db, analytics } from "./firebase";
import { logEvent } from "firebase/analytics";
import {
  UserProfile,
  PoliceProfile,
  AmbulanceProfile,
  FireBrigadeProfile,
  HospitalProfile,
  AdminProfile,
  UserReportDisaster,
  UserRequestHelp,
  UserViewMap,
  UserDisasterNews,
  PoliceReport,
  PoliceCaseUpdate,
  AmbulanceRequest,
  AmbulanceDispatchLog,
  FireIncident,
  FireRescueLog,
  HospitalRecord,
  PatientAdmission,
  SystemLog,
  RoleManagement,
  CreateEmergencyReportForm,
  CreateHelpRequestForm,
  CreateNewsForm,
  EmergencyType,
  EmergencyPriority,
  EmergencyStatus,
} from "@shared/role-based-database-types";

// Helper function to convert GeoPoint to location object
const geoPointToLocation = (geoPoint: any) => {
  if (
    geoPoint &&
    typeof geoPoint.latitude === "number" &&
    typeof geoPoint.longitude === "number"
  ) {
    return {
      latitude: geoPoint.latitude,
      longitude: geoPoint.longitude,
    };
  }
  return { latitude: 0, longitude: 0 };
};

// Helper function to convert location to GeoPoint
const locationToGeoPoint = (location: {
  latitude: number;
  longitude: number;
}) => {
  return new GeoPoint(location.latitude, location.longitude);
};

// Helper function to convert Firestore timestamps
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return timestamp || new Date();
};

// =================== BASE DATABASE SERVICE ===================
export class BaseDatabaseService {
  protected static async create<T>(
    collectionPath: string,
    data: Omit<T, "id">,
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, collectionPath), {
        ...data,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating document in ${collectionPath}:`, error);
      throw error;
    }
  }

  protected static async get<T>(
    collectionPath: string,
    docId: string,
  ): Promise<T | null> {
    try {
      const docRef = doc(db, collectionPath, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          timestamp: convertTimestamp(data.timestamp),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting document from ${collectionPath}:`, error);
      throw error;
    }
  }

  protected static async update<T>(
    collectionPath: string,
    docId: string,
    data: Partial<T>,
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionPath, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(`Error updating document in ${collectionPath}:`, error);
      throw error;
    }
  }

  protected static async queryDocuments<T>(
    collectionPath: string,
    conditions?: { field: string; operator: any; value: any }[],
    orderByField?: string,
    orderDirection: "asc" | "desc" = "desc",
    limitCount?: number,
  ): Promise<T[]> {
    try {
      let q = collection(db, collectionPath);

      if (conditions) {
        conditions.forEach((condition) => {
          q = query(
            q as any,
            where(condition.field, condition.operator, condition.value),
          );
        });
      }

      if (orderByField) {
        q = query(q as any, orderBy(orderByField, orderDirection));
      }

      if (limitCount) {
        q = query(q as any, limit(limitCount));
      }

      const querySnapshot = await getDocs(q as any);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: convertTimestamp(data.timestamp),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          location: data.location
            ? geoPointToLocation(data.location)
            : undefined,
        } as T;
      });
    } catch (error) {
      console.error(`Error querying ${collectionPath}:`, error);
      throw error;
    }
  }
}

// =================== USER SERVICES ===================
export class UserService extends BaseDatabaseService {
  // User Profile Management
  static async createUser(
    userData: Omit<UserProfile, "uid" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    return this.create<UserProfile>("users", userData as any);
  }

  static async getUser(uid: string): Promise<UserProfile | null> {
    return this.get<UserProfile>("users", uid);
  }

  static async updateUser(
    uid: string,
    userData: Partial<UserProfile>,
  ): Promise<void> {
    return this.update<UserProfile>("users", uid, userData);
  }

  // User Sub-Collection: Report Disaster
  static async createDisasterReport(
    userId: string,
    reportData: CreateEmergencyReportForm,
    userName: string,
  ): Promise<string> {
    const userDocRef = doc(db, "users", userId);
    const reportsCollectionRef = collection(userDocRef, "reportDisaster");

    const newReport: Omit<UserReportDisaster, "reportId"> = {
      userId,
      userName,
      type: reportData.type,
      location: reportData.location,
      description: reportData.description,
      severity: reportData.severity,
      status: "pending",
      timestamp: new Date(),
      contact: reportData.contact,
      forwardedTo: [],
    };

    const docRef = await addDoc(reportsCollectionRef, {
      ...newReport,
      location: locationToGeoPoint(reportData.location),
      timestamp: serverTimestamp(),
    });

    return docRef.id;
  }

  static async getUserDisasterReports(
    userId: string,
  ): Promise<UserReportDisaster[]> {
    const userDocRef = doc(db, "users", userId);
    const reportsCollectionRef = collection(userDocRef, "reportDisaster");
    const q = query(reportsCollectionRef, orderBy("timestamp", "desc"));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        reportId: doc.id,
        ...data,
        location: geoPointToLocation(data.location),
        timestamp: convertTimestamp(data.timestamp),
      } as UserReportDisaster;
    });
  }

  // User Sub-Collection: Request Help
  static async createHelpRequest(
    userId: string,
    requestData: CreateHelpRequestForm,
    userName: string,
  ): Promise<string> {
    const userDocRef = doc(db, "users", userId);
    const requestsCollectionRef = collection(userDocRef, "requestHelp");

    const newRequest: Omit<UserRequestHelp, "requestId"> = {
      userId,
      userName,
      helpType: requestData.helpType,
      details: requestData.details,
      urgency: requestData.urgency,
      status: "pending",
      location: requestData.location,
      timestamp: new Date(),
      contact: requestData.contact,
    };

    const docRef = await addDoc(requestsCollectionRef, {
      ...newRequest,
      location: locationToGeoPoint(requestData.location),
      timestamp: serverTimestamp(),
    });

    return docRef.id;
  }

  static async getUserHelpRequests(userId: string): Promise<UserRequestHelp[]> {
    const userDocRef = doc(db, "users", userId);
    const requestsCollectionRef = collection(userDocRef, "requestHelp");
    const q = query(requestsCollectionRef, orderBy("timestamp", "desc"));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        requestId: doc.id,
        ...data,
        location: geoPointToLocation(data.location),
        timestamp: convertTimestamp(data.timestamp),
      } as UserRequestHelp;
    });
  }

  // User Sub-Collection: Disaster News
  static async createDisasterNews(
    userId: string,
    newsData: CreateNewsForm,
    authorName: string,
  ): Promise<string> {
    const userDocRef = doc(db, "users", userId);
    const newsCollectionRef = collection(userDocRef, "disasterNews");

    const newNews: Omit<UserDisasterNews, "newsId"> = {
      userId,
      authorName,
      title: newsData.title,
      content: newsData.content,
      category: newsData.category,
      timestamp: new Date(),
      location: newsData.location,
      tags: newsData.tags || [],
      priority: newsData.priority,
      isVerified: false,
      viewCount: 0,
    };

    const docRef = await addDoc(newsCollectionRef, {
      ...newNews,
      location: newsData.location
        ? locationToGeoPoint(newsData.location)
        : null,
      timestamp: serverTimestamp(),
    });

    return docRef.id;
  }

  static async getUserDisasterNews(
    userId: string,
  ): Promise<UserDisasterNews[]> {
    const userDocRef = doc(db, "users", userId);
    const newsCollectionRef = collection(userDocRef, "disasterNews");
    const q = query(newsCollectionRef, orderBy("timestamp", "desc"));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        newsId: doc.id,
        ...data,
        location: data.location ? geoPointToLocation(data.location) : undefined,
        timestamp: convertTimestamp(data.timestamp),
      } as UserDisasterNews;
    });
  }
}

// =================== POLICE SERVICES ===================
export class PoliceService extends BaseDatabaseService {
  // Police Reports
  static async createPoliceReport(
    officerId: string,
    reportData: Partial<PoliceReport>,
  ): Promise<string> {
    const policeDocRef = doc(db, "police", officerId);
    const reportsCollectionRef = collection(policeDocRef, "policeReports");

    const docRef = await addDoc(reportsCollectionRef, {
      ...reportData,
      location: reportData.location
        ? locationToGeoPoint(reportData.location)
        : null,
      timestamp: serverTimestamp(),
    });

    return docRef.id;
  }

  static async getPoliceReports(officerId: string): Promise<PoliceReport[]> {
    const policeDocRef = doc(db, "police", officerId);
    const reportsCollectionRef = collection(policeDocRef, "policeReports");
    const q = query(reportsCollectionRef, orderBy("timestamp", "desc"));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        reportId: doc.id,
        ...data,
        location: data.location ? geoPointToLocation(data.location) : undefined,
        timestamp: convertTimestamp(data.timestamp),
      } as PoliceReport;
    });
  }

  // Case Updates
  static async createCaseUpdate(
    officerId: string,
    updateData: Partial<PoliceCaseUpdate>,
  ): Promise<string> {
    const policeDocRef = doc(db, "police", officerId);
    const updatesCollectionRef = collection(policeDocRef, "caseUpdates");

    const docRef = await addDoc(updatesCollectionRef, {
      ...updateData,
      timestamp: serverTimestamp(),
    });

    return docRef.id;
  }

  static async getCaseUpdates(
    officerId: string,
    reportId?: string,
  ): Promise<PoliceCaseUpdate[]> {
    const policeDocRef = doc(db, "police", officerId);
    const updatesCollectionRef = collection(policeDocRef, "caseUpdates");

    let q = query(updatesCollectionRef, orderBy("timestamp", "desc"));
    if (reportId) {
      q = query(
        updatesCollectionRef,
        where("reportId", "==", reportId),
        orderBy("timestamp", "desc"),
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        updateId: doc.id,
        ...data,
        timestamp: convertTimestamp(data.timestamp),
      } as PoliceCaseUpdate;
    });
  }
}

// =================== AMBULANCE SERVICES ===================
export class AmbulanceService extends BaseDatabaseService {
  // Ambulance Requests
  static async createAmbulanceRequest(
    paramedicId: string,
    requestData: Partial<AmbulanceRequest>,
  ): Promise<string> {
    const ambulanceDocRef = doc(db, "ambulance", paramedicId);
    const requestsCollectionRef = collection(
      ambulanceDocRef,
      "ambulanceRequests",
    );

    const docRef = await addDoc(requestsCollectionRef, {
      ...requestData,
      location: requestData.location
        ? locationToGeoPoint(requestData.location)
        : null,
      timestamp: serverTimestamp(),
    });

    return docRef.id;
  }

  static async getAmbulanceRequests(
    paramedicId: string,
  ): Promise<AmbulanceRequest[]> {
    const ambulanceDocRef = doc(db, "ambulance", paramedicId);
    const requestsCollectionRef = collection(
      ambulanceDocRef,
      "ambulanceRequests",
    );
    const q = query(requestsCollectionRef, orderBy("timestamp", "desc"));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        requestId: doc.id,
        ...data,
        location: data.location ? geoPointToLocation(data.location) : undefined,
        timestamp: convertTimestamp(data.timestamp),
      } as AmbulanceRequest;
    });
  }

  // Dispatch Logs
  static async createDispatchLog(
    paramedicId: string,
    logData: Partial<AmbulanceDispatchLog>,
  ): Promise<string> {
    const ambulanceDocRef = doc(db, "ambulance", paramedicId);
    const logsCollectionRef = collection(ambulanceDocRef, "dispatchLogs");

    const docRef = await addDoc(logsCollectionRef, {
      ...logData,
      location: logData.location ? locationToGeoPoint(logData.location) : null,
      dispatchTime: serverTimestamp(),
    });

    return docRef.id;
  }

  static async getDispatchLogs(
    paramedicId: string,
  ): Promise<AmbulanceDispatchLog[]> {
    const ambulanceDocRef = doc(db, "ambulance", paramedicId);
    const logsCollectionRef = collection(ambulanceDocRef, "dispatchLogs");
    const q = query(logsCollectionRef, orderBy("dispatchTime", "desc"));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        logId: doc.id,
        ...data,
        location: data.location ? geoPointToLocation(data.location) : undefined,
        dispatchTime: convertTimestamp(data.dispatchTime),
      } as AmbulanceDispatchLog;
    });
  }
}

// =================== FIRE BRIGADE SERVICES ===================
export class FireBrigadeService extends BaseDatabaseService {
  // Fire Incidents
  static async createFireIncident(
    firefighterId: string,
    incidentData: Partial<FireIncident>,
  ): Promise<string> {
    const fireDocRef = doc(db, "fireBrigade", firefighterId);
    const incidentsCollectionRef = collection(fireDocRef, "fireIncidents");

    const docRef = await addDoc(incidentsCollectionRef, {
      ...incidentData,
      location: incidentData.location
        ? locationToGeoPoint(incidentData.location)
        : null,
      timestamp: serverTimestamp(),
    });

    return docRef.id;
  }

  static async getFireIncidents(
    firefighterId: string,
  ): Promise<FireIncident[]> {
    const fireDocRef = doc(db, "fireBrigade", firefighterId);
    const incidentsCollectionRef = collection(fireDocRef, "fireIncidents");
    const q = query(incidentsCollectionRef, orderBy("timestamp", "desc"));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        incidentId: doc.id,
        ...data,
        location: data.location ? geoPointToLocation(data.location) : undefined,
        timestamp: convertTimestamp(data.timestamp),
      } as FireIncident;
    });
  }

  // Rescue Logs
  static async createRescueLog(
    firefighterId: string,
    logData: Partial<FireRescueLog>,
  ): Promise<string> {
    const fireDocRef = doc(db, "fireBrigade", firefighterId);
    const logsCollectionRef = collection(fireDocRef, "rescueLogs");

    const docRef = await addDoc(logsCollectionRef, {
      ...logData,
      timestamp: serverTimestamp(),
    });

    return docRef.id;
  }

  static async getRescueLogs(
    firefighterId: string,
    incidentId?: string,
  ): Promise<FireRescueLog[]> {
    const fireDocRef = doc(db, "fireBrigade", firefighterId);
    const logsCollectionRef = collection(fireDocRef, "rescueLogs");

    let q = query(logsCollectionRef, orderBy("timestamp", "desc"));
    if (incidentId) {
      q = query(
        logsCollectionRef,
        where("incidentId", "==", incidentId),
        orderBy("timestamp", "desc"),
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        logId: doc.id,
        ...data,
        timestamp: convertTimestamp(data.timestamp),
      } as FireRescueLog;
    });
  }
}

// =================== HOSPITAL SERVICES ===================
export class HospitalService extends BaseDatabaseService {
  // Hospital Records
  static async createHospitalRecord(
    hospitalId: string,
    recordData: Partial<HospitalRecord>,
  ): Promise<string> {
    const hospitalDocRef = doc(db, "hospital", hospitalId);
    const recordsCollectionRef = collection(hospitalDocRef, "hospitalRecords");

    const docRef = await addDoc(recordsCollectionRef, {
      ...recordData,
      location: recordData.location
        ? locationToGeoPoint(recordData.location)
        : null,
      lastUpdated: serverTimestamp(),
    });

    return docRef.id;
  }

  static async getHospitalRecords(
    hospitalId: string,
  ): Promise<HospitalRecord[]> {
    const hospitalDocRef = doc(db, "hospital", hospitalId);
    const recordsCollectionRef = collection(hospitalDocRef, "hospitalRecords");
    const q = query(recordsCollectionRef, orderBy("lastUpdated", "desc"));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        recordId: doc.id,
        ...data,
        location: data.location ? geoPointToLocation(data.location) : undefined,
        lastUpdated: convertTimestamp(data.lastUpdated),
      } as HospitalRecord;
    });
  }

  // Patient Admissions
  static async createPatientAdmission(
    hospitalId: string,
    admissionData: Partial<PatientAdmission>,
  ): Promise<string> {
    const hospitalDocRef = doc(db, "hospital", hospitalId);
    const admissionsCollectionRef = collection(
      hospitalDocRef,
      "patientAdmissions",
    );

    const docRef = await addDoc(admissionsCollectionRef, {
      ...admissionData,
      admissionTime: serverTimestamp(),
    });

    return docRef.id;
  }

  static async getPatientAdmissions(
    hospitalId: string,
  ): Promise<PatientAdmission[]> {
    const hospitalDocRef = doc(db, "hospital", hospitalId);
    const admissionsCollectionRef = collection(
      hospitalDocRef,
      "patientAdmissions",
    );
    const q = query(admissionsCollectionRef, orderBy("admissionTime", "desc"));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        admissionId: doc.id,
        ...data,
        admissionTime: convertTimestamp(data.admissionTime),
      } as PatientAdmission;
    });
  }
}

// =================== ADMIN SERVICES ===================
export class AdminService extends BaseDatabaseService {
  // System Logs
  static async createSystemLog(
    adminId: string,
    logData: Partial<SystemLog>,
  ): Promise<string> {
    const adminDocRef = doc(db, "admin", adminId);
    const logsCollectionRef = collection(adminDocRef, "systemLogs");

    const docRef = await addDoc(logsCollectionRef, {
      ...logData,
      timestamp: serverTimestamp(),
    });

    return docRef.id;
  }

  static async getSystemLogs(adminId: string): Promise<SystemLog[]> {
    const adminDocRef = doc(db, "admin", adminId);
    const logsCollectionRef = collection(adminDocRef, "systemLogs");
    const q = query(logsCollectionRef, orderBy("timestamp", "desc"));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        logId: doc.id,
        ...data,
        timestamp: convertTimestamp(data.timestamp),
      } as SystemLog;
    });
  }

  // Role Management
  static async createRoleManagement(
    adminId: string,
    managementData: Partial<RoleManagement>,
  ): Promise<string> {
    const adminDocRef = doc(db, "admin", adminId);
    const managementCollectionRef = collection(adminDocRef, "roleManagement");

    const docRef = await addDoc(managementCollectionRef, {
      ...managementData,
      timestamp: serverTimestamp(),
    });

    return docRef.id;
  }

  static async getRoleManagements(adminId: string): Promise<RoleManagement[]> {
    const adminDocRef = doc(db, "admin", adminId);
    const managementCollectionRef = collection(adminDocRef, "roleManagement");
    const q = query(managementCollectionRef, orderBy("timestamp", "desc"));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        managementId: doc.id,
        ...data,
        timestamp: convertTimestamp(data.timestamp),
      } as RoleManagement;
    });
  }
}

// =================== REAL-TIME LISTENER SERVICE ===================
export class RealtimeListenerService {
  private static listeners: { [key: string]: () => void } = {};

  // Listen to role-specific collections for real-time updates
  static listenToRoleCollection(
    role: string,
    userId: string,
    subCollection: string,
    callback: (documents: any[]) => void,
  ): string {
    const listenerId = `${role}_${userId}_${subCollection}`;

    const roleDocRef = doc(db, role, userId);
    const collectionRef = collection(roleDocRef, subCollection);
    const q = query(collectionRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const documents = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: convertTimestamp(data.timestamp),
          location: data.location
            ? geoPointToLocation(data.location)
            : undefined,
        };
      });
      callback(documents);
    });

    this.listeners[listenerId] = unsubscribe;
    return listenerId;
  }

  // Stop listening to a specific collection
  static stopListening(listenerId: string): void {
    if (this.listeners[listenerId]) {
      this.listeners[listenerId]();
      delete this.listeners[listenerId];
    }
  }

  // Stop all listeners
  static stopAllListeners(): void {
    Object.values(this.listeners).forEach((unsubscribe) => unsubscribe());
    this.listeners = {};
  }
}
