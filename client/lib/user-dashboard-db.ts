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
  serverTimestamp,
  GeoPoint,
} from "firebase/firestore";
import { db, analytics } from "./firebase";
import { logEvent } from "firebase/analytics";
import {
  ReportDisaster,
  RequestHelp,
  ViewMapIncident,
  DisasterNews,
  CreateReportDisasterForm,
  CreateRequestHelpForm,
  CreateDisasterNewsForm,
  UserDashboardAnalyticsEvent,
} from "@shared/user-dashboard-types";

// Helper function to track analytics events
const trackEvent = (
  event: UserDashboardAnalyticsEvent,
  userId: string,
  metadata?: Record<string, any>,
) => {
  if (analytics) {
    logEvent(analytics, event, {
      user_id: userId,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }
};

// Helper function to convert location to GeoPoint
const locationToGeoPoint = (location: {
  latitude: number;
  longitude: number;
}) => {
  return new GeoPoint(location.latitude, location.longitude);
};

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

export class UserDashboardService {
  // Report Disaster Collection Methods
  static async createDisasterReport(
    userId: string,
    reportData: CreateReportDisasterForm,
    userName: string,
  ): Promise<string> {
    try {
      const userDocRef = doc(db, "users", userId);
      const reportsCollectionRef = collection(userDocRef, "reportDisaster");

      const newReport: Omit<ReportDisaster, "reportId"> = {
        type: reportData.type,
        location: reportData.location,
        description: reportData.description,
        severity: reportData.severity,
        status: "reported",
        timestamp: new Date(),
        userId,
        userName,
        contact: reportData.contact,
      };

      const docRef = await addDoc(reportsCollectionRef, {
        ...newReport,
        location: locationToGeoPoint(reportData.location),
        timestamp: serverTimestamp(),
      });

      // Track analytics
      trackEvent("report_disaster_created", userId, {
        type: reportData.type,
        severity: reportData.severity,
      });

      return docRef.id;
    } catch (error) {
      console.error("Error creating disaster report:", error);
      throw error;
    }
  }

  static async getUserDisasterReports(
    userId: string,
  ): Promise<ReportDisaster[]> {
    try {
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
          timestamp: data.timestamp?.toDate() || new Date(),
        } as ReportDisaster;
      });
    } catch (error) {
      console.error("Error getting disaster reports:", error);
      throw error;
    }
  }

  static async updateDisasterReport(
    userId: string,
    reportId: string,
    updateData: Partial<ReportDisaster>,
  ): Promise<void> {
    try {
      const userDocRef = doc(db, "users", userId);
      const reportDocRef = doc(userDocRef, "reportDisaster", reportId);

      const dataToUpdate: any = { ...updateData };
      if (updateData.location) {
        dataToUpdate.location = locationToGeoPoint(updateData.location);
      }

      await updateDoc(reportDocRef, dataToUpdate);
    } catch (error) {
      console.error("Error updating disaster report:", error);
      throw error;
    }
  }

  // Request Help Collection Methods
  static async createHelpRequest(
    userId: string,
    requestData: CreateRequestHelpForm,
    userName: string,
  ): Promise<string> {
    try {
      const userDocRef = doc(db, "users", userId);
      const requestsCollectionRef = collection(userDocRef, "requestHelp");

      const newRequest: Omit<RequestHelp, "requestId"> = {
        helpType: requestData.helpType,
        details: requestData.details,
        urgency: requestData.urgency,
        status: "pending",
        location: requestData.location,
        timestamp: new Date(),
        userId,
        userName,
        contact: requestData.contact,
      };

      const docRef = await addDoc(requestsCollectionRef, {
        ...newRequest,
        location: locationToGeoPoint(requestData.location),
        timestamp: serverTimestamp(),
      });

      // Track analytics
      trackEvent("help_request_created", userId, {
        helpType: requestData.helpType,
        urgency: requestData.urgency,
      });

      return docRef.id;
    } catch (error) {
      console.error("Error creating help request:", error);
      throw error;
    }
  }

  static async getUserHelpRequests(userId: string): Promise<RequestHelp[]> {
    try {
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
          timestamp: data.timestamp?.toDate() || new Date(),
          responseTime: data.responseTime?.toDate(),
        } as RequestHelp;
      });
    } catch (error) {
      console.error("Error getting help requests:", error);
      throw error;
    }
  }

  static async updateHelpRequest(
    userId: string,
    requestId: string,
    updateData: Partial<RequestHelp>,
  ): Promise<void> {
    try {
      const userDocRef = doc(db, "users", userId);
      const requestDocRef = doc(userDocRef, "requestHelp", requestId);

      const dataToUpdate: any = { ...updateData };
      if (updateData.location) {
        dataToUpdate.location = locationToGeoPoint(updateData.location);
      }

      await updateDoc(requestDocRef, dataToUpdate);
    } catch (error) {
      console.error("Error updating help request:", error);
      throw error;
    }
  }

  // View Map Collection Methods (Read-only incidents)
  static async getAllMapIncidents(): Promise<ViewMapIncident[]> {
    try {
      // This would typically aggregate from a global incidents collection
      // For now, we'll return a sample structure
      const incidents: ViewMapIncident[] = [];

      // In a real implementation, you'd query a global "incidents" collection
      // that aggregates data from all users' reports

      return incidents;
    } catch (error) {
      console.error("Error getting map incidents:", error);
      throw error;
    }
  }

  static async trackMapView(userId: string): Promise<void> {
    try {
      trackEvent("map_viewed", userId);
    } catch (error) {
      console.error("Error tracking map view:", error);
    }
  }

  // Disaster News Collection Methods
  static async createDisasterNews(
    userId: string,
    newsData: CreateDisasterNewsForm,
    authorName: string,
  ): Promise<string> {
    try {
      const userDocRef = doc(db, "users", userId);
      const newsCollectionRef = collection(userDocRef, "disasterNews");

      const newNews: Omit<DisasterNews, "newsId"> = {
        title: newsData.title,
        content: newsData.content,
        category: newsData.category,
        timestamp: new Date(),
        authorId: userId,
        authorName,
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

      // Track analytics
      trackEvent("news_created", userId, {
        category: newsData.category,
        priority: newsData.priority,
      });

      return docRef.id;
    } catch (error) {
      console.error("Error creating disaster news:", error);
      throw error;
    }
  }

  static async getUserDisasterNews(userId: string): Promise<DisasterNews[]> {
    try {
      const userDocRef = doc(db, "users", userId);
      const newsCollectionRef = collection(userDocRef, "disasterNews");
      const q = query(newsCollectionRef, orderBy("timestamp", "desc"));

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          newsId: doc.id,
          ...data,
          location: data.location
            ? geoPointToLocation(data.location)
            : undefined,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as DisasterNews;
      });
    } catch (error) {
      console.error("Error getting disaster news:", error);
      throw error;
    }
  }

  static async updateDisasterNews(
    userId: string,
    newsId: string,
    updateData: Partial<DisasterNews>,
  ): Promise<void> {
    try {
      const userDocRef = doc(db, "users", userId);
      const newsDocRef = doc(userDocRef, "disasterNews", newsId);

      const dataToUpdate: any = { ...updateData };
      if (updateData.location) {
        dataToUpdate.location = locationToGeoPoint(updateData.location);
      }

      await updateDoc(newsDocRef, dataToUpdate);
    } catch (error) {
      console.error("Error updating disaster news:", error);
      throw error;
    }
  }

  static async incrementNewsViewCount(
    userId: string,
    newsId: string,
  ): Promise<void> {
    try {
      const userDocRef = doc(db, "users", userId);
      const newsDocRef = doc(userDocRef, "disasterNews", newsId);

      const newsDoc = await getDoc(newsDocRef);
      if (newsDoc.exists()) {
        const currentViewCount = newsDoc.data().viewCount || 0;
        await updateDoc(newsDocRef, { viewCount: currentViewCount + 1 });
      }

      trackEvent("news_viewed", userId, { newsId });
    } catch (error) {
      console.error("Error incrementing news view count:", error);
      throw error;
    }
  }

  // Dashboard Analytics
  static async trackDashboardAccess(userId: string): Promise<void> {
    try {
      trackEvent("dashboard_accessed", userId);
    } catch (error) {
      console.error("Error tracking dashboard access:", error);
    }
  }
}
