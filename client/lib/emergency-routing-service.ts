import {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  GeoPoint,
  writeBatch,
} from "firebase/firestore";
import { db, analytics } from "./firebase";
import { logEvent } from "firebase/analytics";
import {
  EmergencyType,
  EmergencyRoutingRule,
  EMERGENCY_ROUTING_RULES,
  UserReportDisaster,
  PoliceReport,
  AmbulanceRequest,
  FireIncident,
  PatientAdmission,
  SystemLog,
  CreateEmergencyReportForm,
  AnalyticsEvent,
} from "@shared/role-based-database-types";

export class EmergencyRoutingService {
  /**
   * Forward emergency report to appropriate role collections based on type
   */
  static async forwardEmergencyReport(
    userId: string,
    userName: string,
    userReportId: string,
    reportData: CreateEmergencyReportForm,
  ): Promise<string[]> {
    try {
      const routingRule = EMERGENCY_ROUTING_RULES.find(
        (rule) => rule.emergencyType === reportData.type,
      );

      if (!routingRule) {
        throw new Error(
          `No routing rule found for emergency type: ${reportData.type}`,
        );
      }

      const forwardedTo: string[] = [];
      const batch = writeBatch(db);

      // Process each target collection
      for (const target of routingRule.targetCollections) {
        try {
          const forwardedId = await this.createForwardedReport(
            target.collection,
            target.subCollection,
            userReportId,
            userId,
            userName,
            reportData,
            batch,
          );

          forwardedTo.push(
            `${target.collection}/${target.subCollection}/${forwardedId}`,
          );

          // Track analytics for forwarding
          this.trackForwardingEvent(userId, reportData.type, target.collection);
        } catch (error) {
          console.error(`Error forwarding to ${target.collection}:`, error);
          // Continue processing other targets even if one fails
        }
      }

      // Commit all writes as a batch
      await batch.commit();

      // Update the original user report with forwarded destinations
      await this.updateUserReportForwarding(userId, userReportId, forwardedTo);

      return forwardedTo;
    } catch (error) {
      console.error("Error in emergency routing:", error);
      throw error;
    }
  }

  /**
   * Create forwarded report in specific role collection
   */
  private static async createForwardedReport(
    roleCollection: string,
    subCollection: string,
    sourceReportId: string,
    userId: string,
    userName: string,
    reportData: CreateEmergencyReportForm,
    batch: any,
  ): Promise<string> {
    const roleDocRef = doc(db, roleCollection, userId); // Using userId as role document ID for simplicity
    const subCollectionRef = collection(roleDocRef, subCollection);
    const newDocRef = doc(subCollectionRef);

    let forwardedData: any;

    switch (roleCollection) {
      case "police":
        forwardedData = this.createPoliceReport(
          sourceReportId,
          userId,
          userName,
          reportData,
        );
        break;
      case "ambulance":
        forwardedData = this.createAmbulanceRequest(
          sourceReportId,
          userId,
          userName,
          reportData,
        );
        break;
      case "fireBrigade":
        forwardedData = this.createFireIncident(
          sourceReportId,
          userId,
          userName,
          reportData,
        );
        break;
      case "hospital":
        forwardedData = this.createPatientAdmission(
          sourceReportId,
          userId,
          userName,
          reportData,
        );
        break;
      case "admin":
        forwardedData = this.createSystemLog(
          sourceReportId,
          userId,
          userName,
          reportData,
        );
        break;
      default:
        throw new Error(`Unknown role collection: ${roleCollection}`);
    }

    // Add to batch
    batch.set(newDocRef, {
      ...forwardedData,
      timestamp: serverTimestamp(),
      location: new GeoPoint(
        reportData.location.latitude,
        reportData.location.longitude,
      ),
    });

    return newDocRef.id;
  }

  /**
   * Create police report from user emergency report
   */
  private static createPoliceReport(
    sourceReportId: string,
    userId: string,
    userName: string,
    reportData: CreateEmergencyReportForm,
  ): Omit<PoliceReport, "reportId" | "timestamp"> {
    return {
      officerId: "auto-assigned", // Will be updated when officer takes the case
      officerName: "Auto-Assignment",
      incidentType: reportData.type,
      location: reportData.location,
      description: reportData.description,
      priority: reportData.severity,
      status: "pending",
      involvedParties: [userName],
      evidenceFiles: [],
      relatedIncidents: [],
      sourceReportId,
    };
  }

  /**
   * Create ambulance request from user emergency report
   */
  private static createAmbulanceRequest(
    sourceReportId: string,
    userId: string,
    userName: string,
    reportData: CreateEmergencyReportForm,
  ): Omit<AmbulanceRequest, "requestId" | "timestamp"> {
    return {
      patientName: reportData.type === "medical" ? userName : undefined,
      emergencyType:
        reportData.type === "traffic_accident" ? "accident" : "medical",
      location: reportData.location,
      description: reportData.description,
      priority: reportData.severity,
      status: "pending",
      requestedBy: userId,
      sourceReportId,
    };
  }

  /**
   * Create fire incident from user emergency report
   */
  private static createFireIncident(
    sourceReportId: string,
    userId: string,
    userName: string,
    reportData: CreateEmergencyReportForm,
  ): Omit<FireIncident, "incidentId" | "timestamp"> {
    let incidentType: FireIncident["incidentType"];
    switch (reportData.type) {
      case "fire":
        incidentType = "fire";
        break;
      case "flood":
        incidentType = "flood";
        break;
      case "earthquake":
        incidentType = "earthquake";
        break;
      default:
        incidentType = "rescue";
    }

    return {
      firefighterId: "auto-assigned", // Will be updated when firefighter takes the case
      firefighterName: "Auto-Assignment",
      incidentType,
      location: reportData.location,
      description: reportData.description,
      severity: reportData.severity,
      status: "pending",
      unitsDispatched: [],
      sourceReportId,
    };
  }

  /**
   * Create patient admission from user emergency report
   */
  private static createPatientAdmission(
    sourceReportId: string,
    userId: string,
    userName: string,
    reportData: CreateEmergencyReportForm,
  ): Omit<PatientAdmission, "admissionId" | "admissionTime"> {
    return {
      patientName: reportData.type === "medical" ? userName : undefined,
      emergencyType: reportData.type,
      condition: reportData.description,
      status: "admitted",
      priority: reportData.severity,
      sourceReportId,
    };
  }

  /**
   * Create system log for admin review
   */
  private static createSystemLog(
    sourceReportId: string,
    userId: string,
    userName: string,
    reportData: CreateEmergencyReportForm,
  ): Omit<SystemLog, "logId" | "timestamp"> {
    return {
      adminId: "system",
      action: "emergency_report_received",
      targetUser: userId,
      targetCollection: "users",
      details: `Emergency report of type '${reportData.type}' from ${userName} requires manual assignment. Description: ${reportData.description}`,
      severity: reportData.severity === "critical" ? "critical" : "warning",
    };
  }

  /**
   * Update user report with forwarding information
   */
  private static async updateUserReportForwarding(
    userId: string,
    reportId: string,
    forwardedTo: string[],
  ): Promise<void> {
    try {
      const userDocRef = doc(db, "users", userId);
      const reportDocRef = doc(userDocRef, "reportDisaster", reportId);

      await updateDoc(reportDocRef, {
        forwardedTo,
        status: "assigned",
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating user report forwarding:", error);
      throw error;
    }
  }

  /**
   * Track forwarding analytics event
   */
  private static trackForwardingEvent(
    userId: string,
    emergencyType: EmergencyType,
    targetRole: string,
  ): void {
    if (analytics) {
      logEvent(analytics, "emergency_forwarded", {
        user_id: userId,
        emergency_type: emergencyType,
        target_role: targetRole,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get routing configuration for emergency type
   */
  static getRoutingConfiguration(
    emergencyType: EmergencyType,
  ): EmergencyRoutingRule | undefined {
    return EMERGENCY_ROUTING_RULES.find(
      (rule) => rule.emergencyType === emergencyType,
    );
  }

  /**
   * Get all possible target roles for emergency type
   */
  static getTargetRoles(emergencyType: EmergencyType): string[] {
    const rule = this.getRoutingConfiguration(emergencyType);
    return rule
      ? rule.targetCollections.map((target) => target.collection)
      : [];
  }

  /**
   * Validate emergency report before forwarding
   */
  static validateEmergencyReport(
    reportData: CreateEmergencyReportForm,
  ): boolean {
    return !!(
      reportData.type &&
      reportData.description &&
      reportData.location &&
      reportData.location.latitude &&
      reportData.location.longitude &&
      reportData.severity &&
      reportData.contact
    );
  }

  /**
   * Process emergency with automatic routing and notifications
   */
  static async processEmergencyReport(
    userId: string,
    userName: string,
    userReportId: string,
    reportData: CreateEmergencyReportForm,
  ): Promise<{
    success: boolean;
    forwardedTo: string[];
    error?: string;
  }> {
    try {
      // Validate report
      if (!this.validateEmergencyReport(reportData)) {
        return {
          success: false,
          forwardedTo: [],
          error: "Invalid emergency report data",
        };
      }

      // Forward to appropriate role collections
      const forwardedTo = await this.forwardEmergencyReport(
        userId,
        userName,
        userReportId,
        reportData,
      );

      // Track successful processing
      if (analytics) {
        logEvent(analytics, "emergency_report_processed", {
          user_id: userId,
          emergency_type: reportData.type,
          forwarded_count: forwardedTo.length,
          timestamp: new Date().toISOString(),
        });
      }

      return {
        success: true,
        forwardedTo,
      };
    } catch (error) {
      console.error("Error processing emergency report:", error);
      return {
        success: false,
        forwardedTo: [],
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
