import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type {
  DisasterReport,
  HelpRequest,
  NewsUpdate,
  Incident,
  User,
  DatabaseResponse,
  PaginatedResponse,
} from "@shared/types";

// Collection references
const COLLECTIONS = {
  USERS: "users",
  DISASTER_REPORTS: "disasterReports",
  HELP_REQUESTS: "helpRequests",
  NEWS_UPDATES: "newsUpdates",
  INCIDENTS: "incidents",
} as const;

// Helper function to convert Firestore timestamp to ISO string
const timestampToString = (timestamp: any): string => {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString();
  }
  return timestamp || new Date().toISOString();
};

// Helper function to prepare data for Firestore
const prepareDataForFirestore = (data: any) => {
  const prepared = { ...data };
  delete prepared.id;
  prepared.updatedAt = serverTimestamp();
  return prepared;
};

// User Services
export const userService = {
  async create(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">,
  ): Promise<DatabaseResponse<User>> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.USERS), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const user: User = {
        id: docRef.id,
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async getById(id: string): Promise<DatabaseResponse<User>> {
    try {
      const docSnap = await getDoc(doc(db, COLLECTIONS.USERS, id));
      if (!docSnap.exists()) {
        return { success: false, error: "User not found" };
      }

      const data = docSnap.data();
      const user: User = {
        id: docSnap.id,
        ...data,
        createdAt: timestampToString(data.createdAt),
        updatedAt: timestampToString(data.updatedAt),
      } as User;

      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async getAll(): Promise<DatabaseResponse<User[]>> {
    try {
      const q = query(
        collection(db, COLLECTIONS.USERS),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
        } as User;
      });

      return { success: true, data: users };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async getByRole(role: string): Promise<DatabaseResponse<User[]>> {
    try {
      const q = query(
        collection(db, COLLECTIONS.USERS),
        where("role", "==", role),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
        } as User;
      });

      return { success: true, data: users };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async update(
    id: string,
    updates: Partial<User>,
  ): Promise<DatabaseResponse<void>> {
    try {
      await updateDoc(
        doc(db, COLLECTIONS.USERS, id),
        prepareDataForFirestore(updates),
      );
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  // Real-time listener for users
  subscribeToUsers(callback: (users: User[]) => void, role?: string) {
    const q = role
      ? query(
          collection(db, COLLECTIONS.USERS),
          where("role", "==", role),
          orderBy("createdAt", "desc"),
        )
      : query(collection(db, COLLECTIONS.USERS), orderBy("createdAt", "desc"));

    return onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
        } as User;
      });
      callback(users);
    });
  },

  // Real-time listener for a specific user
  subscribeToUser(userId: string, callback: (user: User | null) => void) {
    return onSnapshot(doc(db, COLLECTIONS.USERS, userId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const user: User = {
          id: snapshot.id,
          ...data,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
        } as User;
        callback(user);
      } else {
        callback(null);
      }
    });
  },
};

// Disaster Report Services
export const disasterReportService = {
  async create(
    reportData: Omit<DisasterReport, "id" | "createdAt" | "updatedAt">,
  ): Promise<DatabaseResponse<DisasterReport>> {
    try {
      const docRef = await addDoc(
        collection(db, COLLECTIONS.DISASTER_REPORTS),
        {
          ...reportData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
      );

      const report: DisasterReport = {
        id: docRef.id,
        ...reportData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return { success: true, data: report };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async getById(id: string): Promise<DatabaseResponse<DisasterReport>> {
    try {
      const docSnap = await getDoc(doc(db, COLLECTIONS.DISASTER_REPORTS, id));
      if (!docSnap.exists()) {
        return { success: false, error: "Report not found" };
      }

      const data = docSnap.data();
      const report: DisasterReport = {
        id: docSnap.id,
        ...data,
        createdAt: timestampToString(data.createdAt),
        updatedAt: timestampToString(data.updatedAt),
      } as DisasterReport;

      return { success: true, data: report };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async getByUserId(
    userId: string,
  ): Promise<DatabaseResponse<DisasterReport[]>> {
    try {
      const q = query(
        collection(db, COLLECTIONS.DISASTER_REPORTS),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const reports = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
        } as DisasterReport;
      });

      return { success: true, data: reports };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async getRecent(
    limitCount: number = 10,
  ): Promise<DatabaseResponse<DisasterReport[]>> {
    try {
      const q = query(
        collection(db, COLLECTIONS.DISASTER_REPORTS),
        orderBy("createdAt", "desc"),
        limit(limitCount),
      );

      const querySnapshot = await getDocs(q);
      const reports = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
        } as DisasterReport;
      });

      return { success: true, data: reports };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async updateStatus(
    id: string,
    status: DisasterReport["status"],
    notes?: string,
  ): Promise<DatabaseResponse<void>> {
    try {
      const updates: any = { status };
      if (notes) updates.notes = notes;

      await updateDoc(
        doc(db, COLLECTIONS.DISASTER_REPORTS, id),
        prepareDataForFirestore(updates),
      );
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  // Real-time listener for reports
  subscribeToReports(
    callback: (reports: DisasterReport[]) => void,
    userId?: string,
  ) {
    const q = userId
      ? query(
          collection(db, COLLECTIONS.DISASTER_REPORTS),
          where("userId", "==", userId),
          orderBy("createdAt", "desc"),
        )
      : query(
          collection(db, COLLECTIONS.DISASTER_REPORTS),
          orderBy("createdAt", "desc"),
          limit(20),
        );

    return onSnapshot(q, (snapshot) => {
      const reports = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
        } as DisasterReport;
      });
      callback(reports);
    });
  },
};

// Help Request Services
export const helpRequestService = {
  async create(
    requestData: Omit<HelpRequest, "id" | "createdAt" | "updatedAt">,
  ): Promise<DatabaseResponse<HelpRequest>> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.HELP_REQUESTS), {
        ...requestData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const request: HelpRequest = {
        id: docRef.id,
        ...requestData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return { success: true, data: request };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async getById(id: string): Promise<DatabaseResponse<HelpRequest>> {
    try {
      const docSnap = await getDoc(doc(db, COLLECTIONS.HELP_REQUESTS, id));
      if (!docSnap.exists()) {
        return { success: false, error: "Help request not found" };
      }

      const data = docSnap.data();
      const request: HelpRequest = {
        id: docSnap.id,
        ...data,
        createdAt: timestampToString(data.createdAt),
        updatedAt: timestampToString(data.updatedAt),
      } as HelpRequest;

      return { success: true, data: request };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async getAll(
    limitCount: number = 50,
  ): Promise<DatabaseResponse<HelpRequest[]>> {
    try {
      const q = query(
        collection(db, COLLECTIONS.HELP_REQUESTS),
        orderBy("createdAt", "desc"),
        limit(limitCount),
      );

      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
        } as HelpRequest;
      });

      return { success: true, data: requests };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async getByUserId(userId: string): Promise<DatabaseResponse<HelpRequest[]>> {
    try {
      const q = query(
        collection(db, COLLECTIONS.HELP_REQUESTS),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
        } as HelpRequest;
      });

      return { success: true, data: requests };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async getByStatus(
    status: HelpRequest["status"],
  ): Promise<DatabaseResponse<HelpRequest[]>> {
    try {
      const q = query(
        collection(db, COLLECTIONS.HELP_REQUESTS),
        where("status", "==", status),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
        } as HelpRequest;
      });

      return { success: true, data: requests };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async updateStatus(
    id: string,
    status: HelpRequest["status"],
    estimatedArrival?: string,
  ): Promise<DatabaseResponse<void>> {
    try {
      const updates: any = { status };
      if (estimatedArrival) updates.estimatedArrival = estimatedArrival;

      await updateDoc(
        doc(db, COLLECTIONS.HELP_REQUESTS, id),
        prepareDataForFirestore(updates),
      );
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  // Real-time listener for help requests
  subscribeToHelpRequests(
    callback: (requests: HelpRequest[]) => void,
    userId?: string,
    status?: HelpRequest["status"],
  ) {
    let q = query(
      collection(db, COLLECTIONS.HELP_REQUESTS),
      orderBy("createdAt", "desc"),
      limit(50),
    );

    if (userId) {
      q = query(
        collection(db, COLLECTIONS.HELP_REQUESTS),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
      );
    } else if (status) {
      q = query(
        collection(db, COLLECTIONS.HELP_REQUESTS),
        where("status", "==", status),
        orderBy("createdAt", "desc"),
      );
    }

    return onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
        } as HelpRequest;
      });
      callback(requests);
    });
  },

  // Real-time listener for a specific help request
  subscribeToHelpRequest(
    requestId: string,
    callback: (request: HelpRequest | null) => void,
  ) {
    return onSnapshot(
      doc(db, COLLECTIONS.HELP_REQUESTS, requestId),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const request: HelpRequest = {
            id: snapshot.id,
            ...data,
            createdAt: timestampToString(data.createdAt),
            updatedAt: timestampToString(data.updatedAt),
          } as HelpRequest;
          callback(request);
        } else {
          callback(null);
        }
      },
    );
  },
};

// News Update Services
export const newsService = {
  async create(
    newsData: Omit<NewsUpdate, "id" | "createdAt" | "updatedAt">,
  ): Promise<DatabaseResponse<NewsUpdate>> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.NEWS_UPDATES), {
        ...newsData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const news: NewsUpdate = {
        id: docRef.id,
        ...newsData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return { success: true, data: news };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async getById(id: string): Promise<DatabaseResponse<NewsUpdate>> {
    try {
      const docSnap = await getDoc(doc(db, COLLECTIONS.NEWS_UPDATES, id));
      if (!docSnap.exists()) {
        return { success: false, error: "News update not found" };
      }

      const data = docSnap.data();
      const news: NewsUpdate = {
        id: docSnap.id,
        ...data,
        createdAt: timestampToString(data.createdAt),
        updatedAt: timestampToString(data.updatedAt),
      } as NewsUpdate;

      return { success: true, data: news };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async getAll(
    limitCount: number = 50,
  ): Promise<DatabaseResponse<NewsUpdate[]>> {
    try {
      const q = query(
        collection(db, COLLECTIONS.NEWS_UPDATES),
        orderBy("createdAt", "desc"),
        limit(limitCount),
      );

      const querySnapshot = await getDocs(q);
      const news = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
        } as NewsUpdate;
      });

      return { success: true, data: news };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async getPublicNews(
    limitCount: number = 10,
  ): Promise<DatabaseResponse<NewsUpdate[]>> {
    try {
      const q = query(
        collection(db, COLLECTIONS.NEWS_UPDATES),
        where("isPublic", "==", true),
        orderBy("createdAt", "desc"),
        limit(limitCount),
      );

      const querySnapshot = await getDocs(q);
      const news = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
        } as NewsUpdate;
      });

      return { success: true, data: news };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async getByCategory(
    category: NewsUpdate["category"],
    limitCount: number = 20,
  ): Promise<DatabaseResponse<NewsUpdate[]>> {
    try {
      const q = query(
        collection(db, COLLECTIONS.NEWS_UPDATES),
        where("category", "==", category),
        where("isPublic", "==", true),
        orderBy("createdAt", "desc"),
        limit(limitCount),
      );

      const querySnapshot = await getDocs(q);
      const news = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
        } as NewsUpdate;
      });

      return { success: true, data: news };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async update(
    id: string,
    updates: Partial<NewsUpdate>,
  ): Promise<DatabaseResponse<void>> {
    try {
      await updateDoc(
        doc(db, COLLECTIONS.NEWS_UPDATES, id),
        prepareDataForFirestore(updates),
      );
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async delete(id: string): Promise<DatabaseResponse<void>> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.NEWS_UPDATES, id));
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  // Real-time listener for news updates
  subscribeToNews(
    callback: (news: NewsUpdate[]) => void,
    isPublicOnly: boolean = true,
    category?: NewsUpdate["category"],
  ) {
    let q = query(
      collection(db, COLLECTIONS.NEWS_UPDATES),
      orderBy("createdAt", "desc"),
      limit(50),
    );

    if (isPublicOnly && category) {
      q = query(
        collection(db, COLLECTIONS.NEWS_UPDATES),
        where("isPublic", "==", true),
        where("category", "==", category),
        orderBy("createdAt", "desc"),
        limit(50),
      );
    } else if (isPublicOnly) {
      q = query(
        collection(db, COLLECTIONS.NEWS_UPDATES),
        where("isPublic", "==", true),
        orderBy("createdAt", "desc"),
        limit(50),
      );
    } else if (category) {
      q = query(
        collection(db, COLLECTIONS.NEWS_UPDATES),
        where("category", "==", category),
        orderBy("createdAt", "desc"),
        limit(50),
      );
    }

    return onSnapshot(q, (snapshot) => {
      const news = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
        } as NewsUpdate;
      });
      callback(news);
    });
  },

  // Real-time listener for a specific news update
  subscribeToNewsItem(
    newsId: string,
    callback: (news: NewsUpdate | null) => void,
  ) {
    return onSnapshot(doc(db, COLLECTIONS.NEWS_UPDATES, newsId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const news: NewsUpdate = {
          id: snapshot.id,
          ...data,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
        } as NewsUpdate;
        callback(news);
      } else {
        callback(null);
      }
    });
  },
};

// Incident Services
export const incidentService = {
  async create(
    incidentData: Omit<Incident, "id" | "createdAt" | "updatedAt">,
  ): Promise<DatabaseResponse<Incident>> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.INCIDENTS), {
        ...incidentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const incident: Incident = {
        id: docRef.id,
        ...incidentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return { success: true, data: incident };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async getById(id: string): Promise<DatabaseResponse<Incident>> {
    try {
      const docSnap = await getDoc(doc(db, COLLECTIONS.INCIDENTS, id));
      if (!docSnap.exists()) {
        return { success: false, error: "Incident not found" };
      }

      const data = docSnap.data();
      const incident: Incident = {
        id: docSnap.id,
        ...data,
        createdAt: timestampToString(data.createdAt),
        updatedAt: timestampToString(data.updatedAt),
      } as Incident;

      return { success: true, data: incident };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async getAll(limitCount: number = 50): Promise<DatabaseResponse<Incident[]>> {
    try {
      const q = query(
        collection(db, COLLECTIONS.INCIDENTS),
        orderBy("createdAt", "desc"),
        limit(limitCount),
      );

      const querySnapshot = await getDocs(q);
      const incidents = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
        } as Incident;
      });

      return { success: true, data: incidents };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async getActiveIncidents(): Promise<DatabaseResponse<Incident[]>> {
    try {
      const q = query(
        collection(db, COLLECTIONS.INCIDENTS),
        where("status", "in", ["active", "contained"]),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const incidents = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
        } as Incident;
      });

      return { success: true, data: incidents };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async getByType(
    type: Incident["type"],
  ): Promise<DatabaseResponse<Incident[]>> {
    try {
      const q = query(
        collection(db, COLLECTIONS.INCIDENTS),
        where("type", "==", type),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const incidents = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
        } as Incident;
      });

      return { success: true, data: incidents };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async updateStatus(
    id: string,
    status: Incident["status"],
  ): Promise<DatabaseResponse<void>> {
    try {
      await updateDoc(
        doc(db, COLLECTIONS.INCIDENTS, id),
        prepareDataForFirestore({ status }),
      );
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async update(
    id: string,
    updates: Partial<Incident>,
  ): Promise<DatabaseResponse<void>> {
    try {
      await updateDoc(
        doc(db, COLLECTIONS.INCIDENTS, id),
        prepareDataForFirestore(updates),
      );
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  // Real-time listener for incidents
  subscribeToIncidents(
    callback: (incidents: Incident[]) => void,
    activeOnly: boolean = false,
    type?: Incident["type"],
  ) {
    let q = query(
      collection(db, COLLECTIONS.INCIDENTS),
      orderBy("createdAt", "desc"),
      limit(50),
    );

    if (activeOnly && type) {
      q = query(
        collection(db, COLLECTIONS.INCIDENTS),
        where("status", "in", ["active", "contained"]),
        where("type", "==", type),
        orderBy("createdAt", "desc"),
      );
    } else if (activeOnly) {
      q = query(
        collection(db, COLLECTIONS.INCIDENTS),
        where("status", "in", ["active", "contained"]),
        orderBy("createdAt", "desc"),
      );
    } else if (type) {
      q = query(
        collection(db, COLLECTIONS.INCIDENTS),
        where("type", "==", type),
        orderBy("createdAt", "desc"),
      );
    }

    return onSnapshot(q, (snapshot) => {
      const incidents = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
        } as Incident;
      });
      callback(incidents);
    });
  },

  // Real-time listener for a specific incident
  subscribeToIncident(
    incidentId: string,
    callback: (incident: Incident | null) => void,
  ) {
    return onSnapshot(
      doc(db, COLLECTIONS.INCIDENTS, incidentId),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const incident: Incident = {
            id: snapshot.id,
            ...data,
            createdAt: timestampToString(data.createdAt),
            updatedAt: timestampToString(data.updatedAt),
          } as Incident;
          callback(incident);
        } else {
          callback(null);
        }
      },
    );
  },
};

// Export all services
export const firebaseDb = {
  users: userService,
  disasterReports: disasterReportService,
  helpRequests: helpRequestService,
  news: newsService,
  incidents: incidentService,
};

export default firebaseDb;
