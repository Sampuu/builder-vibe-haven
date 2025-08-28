import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseAvailable } from "./firebase";
import { UserRole } from "@/hooks/use-auth";
import {
  IncidentType,
  IncidentSeverity,
  Incident,
  HelpRequest,
} from "./incident-service";

// Notification types and interfaces
export interface Notification {
  id: string;
  type: "incident" | "help_request" | "status_update" | "assignment";
  incidentId?: string;
  helpRequestId?: string;
  title: string;
  message: string;
  severity: IncidentSeverity;
  targetDepartments: UserRole[];
  targetUsers?: string[];
  sentBy: {
    userId: string;
    name: string;
    role: UserRole;
  };
  data: {
    incidentType?: IncidentType;
    location: string;
    contactPhone: string;
    coordinates?: { lat: number; lng: number };
  };
  timestamps: {
    created: Date;
    sent: Date;
  };
  acknowledgments: NotificationAcknowledgment[];
  isRead: boolean;
  isArchived: boolean;
}

export interface NotificationAcknowledgment {
  userId: string;
  userName: string;
  department: UserRole;
  acknowledgedAt: Date;
  response?: string;
}

// Emergency department contact information
export const DEPARTMENT_CONTACTS = {
  fire: {
    name: "Fire Department",
    icon: "🚒",
    color: "emergency-warning",
    phone: "911",
    description: "Fire emergencies, explosions, hazardous materials",
  },
  police: {
    name: "Police Department",
    icon: "🚔",
    color: "emergency-danger",
    phone: "911",
    description: "Criminal activities, traffic accidents, public safety",
  },
  ambulance: {
    name: "Emergency Medical Services",
    icon: "🚑",
    color: "emergency-resolved",
    phone: "911",
    description: "Medical emergencies, patient transport",
  },
  hospital: {
    name: "Hospital Emergency",
    icon: "🏥",
    color: "emergency-info",
    phone: "Hospital Direct Line",
    description: "Medical supplies, equipment, patient preparation",
  },
  admin: {
    name: "Emergency Coordination",
    icon: "���",
    color: "slate-600",
    phone: "Coordination Center",
    description: "Overall emergency management and coordination",
  },
};

// Incident routing rules
export const getNotificationRouting = (
  incidentType: IncidentType,
  severity: IncidentSeverity,
): UserRole[] => {
  const routes: Record<IncidentType, UserRole[]> = {
    fire: ["fire", "admin"],
    medical: ["ambulance", "hospital", "admin"],
    accident: ["police", "ambulance", "admin"],
    natural: ["fire", "police", "ambulance", "admin"], // Natural disasters need multi-department response
    police: ["police", "admin"],
    other: ["admin"], // Admin decides who to route to
  };

  let departments = routes[incidentType] || ["admin"];

  // Add extra departments for critical incidents
  if (severity === "critical") {
    if (!departments.includes("admin")) {
      departments.push("admin");
    }

    // Critical incidents may need multi-department response
    if (incidentType === "medical" && !departments.includes("police")) {
      departments.push("police"); // Police may need to secure area for medical emergencies
    }

    if (incidentType === "accident" && !departments.includes("fire")) {
      departments.push("fire"); // Fire dept needed for vehicle extrication
    }
  }

  return departments;
};

// Help request routing
export const getHelpRequestRouting = (
  requestType: string,
  urgency: IncidentSeverity,
): UserRole[] => {
  const routes: Record<string, UserRole[]> = {
    medical: ["ambulance", "hospital", "admin"],
    supplies: ["hospital", "admin"],
    transport: ["ambulance", "admin"],
    other: ["admin"],
  };

  let departments = routes[requestType] || ["admin"];

  // For critical help requests, add police for safety
  if (urgency === "critical" && !departments.includes("police")) {
    departments.push("police");
  }

  return departments;
};

// Fallback storage for notifications
let localNotifications: Notification[] = [];

/**
 * Clean object of undefined values for Firebase compatibility
 * Firestore doesn't accept undefined values, so we remove them
 */
const cleanObjectForFirebase = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(cleanObjectForFirebase);
  }

  if (typeof obj === "object") {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanObjectForFirebase(value);
      }
    }
    return cleaned;
  }

  return obj;
};

/**
 * Send incident notification to relevant departments
 */
export const sendIncidentNotification = async (
  incident: Incident,
): Promise<Notification> => {
  const targetDepartments = getNotificationRouting(
    incident.type,
    incident.severity,
  );

  // Create data object and only include coordinates if they exist
  const notificationData: any = {
    incidentType: incident.type,
    location: incident.location,
    contactPhone: incident.reporterPhone,
  };

  // Only add coordinates if they exist (avoid undefined values in Firestore)
  if (incident.coordinates) {
    notificationData.coordinates = incident.coordinates;
  }

  const notification: Omit<Notification, "id"> = {
    type: "incident",
    incidentId: incident.id,
    title: `🚨 ${incident.severity.toUpperCase()}: ${incident.title}`,
    message: `${DEPARTMENT_CONTACTS[incident.type]?.name || "Emergency"} response needed for ${incident.type} incident at ${incident.location}`,
    severity: incident.severity,
    targetDepartments,
    sentBy: {
      userId: incident.reporterUserId,
      name: incident.reporterName,
      role: "user",
    },
    data: notificationData,
    timestamps: {
      created: new Date(),
      sent: new Date(),
    },
    acknowledgments: [],
    isRead: false,
    isArchived: false,
  };

  if (isFirebaseAvailable() && db) {
    try {
      // Create a clean version for Firebase (remove any undefined values)
      const cleanNotificationForFirebase = cleanObjectForFirebase({
        ...notification,
        timestamps: {
          created: serverTimestamp(),
          sent: serverTimestamp(),
        },
      });

      const docRef = await addDoc(
        collection(db, "notifications"),
        cleanNotificationForFirebase,
      );

      const createdNotification = { ...notification, id: docRef.id };
      console.log(
        "🔥 Notification sent via Firebase to:",
        targetDepartments.join(", "),
      );

      // Log notification for each department
      targetDepartments.forEach((dept) => {
        console.log(
          `📢 ${DEPARTMENT_CONTACTS[dept]?.icon} ${DEPARTMENT_CONTACTS[dept]?.name}: ${notification.title}`,
        );
      });

      return createdNotification;
    } catch (error) {
      console.error("Failed to send notification via Firebase:", error);
    }
  }

  // Fallback to local storage
  const localNotification = {
    ...notification,
    id: `local-notif-${Date.now()}`,
  };
  localNotifications.push(localNotification);
  localStorage.setItem(
    "emergency-notifications",
    JSON.stringify(localNotifications),
  );

  console.log("📱 Notification sent locally to:", targetDepartments.join(", "));
  targetDepartments.forEach((dept) => {
    console.log(
      `📢 ${DEPARTMENT_CONTACTS[dept]?.icon} ${DEPARTMENT_CONTACTS[dept]?.name}: ${notification.title}`,
    );
  });

  return localNotification;
};

/**
 * Send help request notification
 */
export const sendHelpRequestNotification = async (
  helpRequest: HelpRequest,
): Promise<Notification> => {
  const targetDepartments = getHelpRequestRouting(
    helpRequest.type,
    helpRequest.urgency,
  );

  const notification: Omit<Notification, "id"> = {
    type: "help_request",
    helpRequestId: helpRequest.id,
    title: `🆘 ${helpRequest.urgency.toUpperCase()}: Help Request - ${helpRequest.type}`,
    message: `${helpRequest.type} assistance requested at ${helpRequest.location}. Urgency: ${helpRequest.urgency}`,
    severity: helpRequest.urgency,
    targetDepartments,
    sentBy: {
      userId: helpRequest.requesterUserId,
      name: helpRequest.requesterName,
      role: "user",
    },
    data: {
      location: helpRequest.location,
      contactPhone: helpRequest.requesterPhone,
    },
    timestamps: {
      created: new Date(),
      sent: new Date(),
    },
    acknowledgments: [],
    isRead: false,
    isArchived: false,
  };

  if (isFirebaseAvailable() && db) {
    try {
      const cleanNotificationForFirebase = cleanObjectForFirebase({
        ...notification,
        timestamps: {
          created: serverTimestamp(),
          sent: serverTimestamp(),
        },
      });

      const docRef = await addDoc(
        collection(db, "notifications"),
        cleanNotificationForFirebase,
      );

      const createdNotification = { ...notification, id: docRef.id };
      console.log(
        "🔥 Help request notification sent via Firebase to:",
        targetDepartments.join(", "),
      );

      targetDepartments.forEach((dept) => {
        console.log(
          `📢 ${DEPARTMENT_CONTACTS[dept]?.icon} ${DEPARTMENT_CONTACTS[dept]?.name}: ${notification.title}`,
        );
      });

      return createdNotification;
    } catch (error) {
      console.error(
        "Failed to send help request notification via Firebase:",
        error,
      );
    }
  }

  // Fallback to local storage
  const localNotification = {
    ...notification,
    id: `local-help-notif-${Date.now()}`,
  };
  localNotifications.push(localNotification);
  localStorage.setItem(
    "emergency-notifications",
    JSON.stringify(localNotifications),
  );

  console.log(
    "📱 Help request notification sent locally to:",
    targetDepartments.join(", "),
  );
  targetDepartments.forEach((dept) => {
    console.log(
      `📢 ${DEPARTMENT_CONTACTS[dept]?.icon} ${DEPARTMENT_CONTACTS[dept]?.name}: ${notification.title}`,
    );
  });

  return localNotification;
};

/**
 * Get notifications for a specific department
 */
export const getNotificationsForDepartment = async (
  department: UserRole,
): Promise<Notification[]> => {
  if (isFirebaseAvailable() && db) {
    try {
      const q = query(
        collection(db, "notifications"),
        where("targetDepartments", "array-contains", department),
      );

      const querySnapshot = await getDocs(q);
      const notifications = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];

      return notifications.sort(
        (a, b) =>
          new Date(b.timestamps.sent).getTime() -
          new Date(a.timestamps.sent).getTime(),
      );
    } catch (error) {
      console.error("Failed to fetch notifications from Firebase:", error);
    }
  }

  // Fallback to local storage
  const notifications = JSON.parse(
    localStorage.getItem("emergency-notifications") || "[]",
  ) as Notification[];
  const departmentNotifications = notifications.filter((notification) =>
    notification.targetDepartments.includes(department),
  );

  return departmentNotifications.sort(
    (a, b) =>
      new Date(b.timestamps.sent).getTime() -
      new Date(a.timestamps.sent).getTime(),
  );
};

/**
 * Acknowledge a notification
 */
export const acknowledgeNotification = async (
  notificationId: string,
  userId: string,
  userName: string,
  department: UserRole,
  response?: string,
): Promise<void> => {
  const acknowledgment: NotificationAcknowledgment = {
    userId,
    userName,
    department,
    acknowledgedAt: new Date(),
    response,
  };

  if (isFirebaseAvailable() && db) {
    try {
      const notificationRef = doc(db, "notifications", notificationId);
      const currentNotif = await getNotificationsForDepartment(department);
      const notification = currentNotif.find((n) => n.id === notificationId);

      if (notification) {
        const updatedAcknowledgments = [
          ...notification.acknowledgments,
          acknowledgment,
        ];
        await updateDoc(notificationRef, {
          acknowledgments: updatedAcknowledgments,
          isRead: true,
        });
        console.log(
          "🔥 Notification acknowledged in Firebase:",
          notificationId,
        );
      }
      return;
    } catch (error) {
      console.error("Failed to acknowledge notification in Firebase:", error);
    }
  }

  // Fallback to local storage
  const notifications = JSON.parse(
    localStorage.getItem("emergency-notifications") || "[]",
  ) as Notification[];
  const notificationIndex = notifications.findIndex(
    (n) => n.id === notificationId,
  );

  if (notificationIndex !== -1) {
    notifications[notificationIndex].acknowledgments.push(acknowledgment);
    notifications[notificationIndex].isRead = true;
    localStorage.setItem(
      "emergency-notifications",
      JSON.stringify(notifications),
    );
    console.log("📱 Notification acknowledged locally:", notificationId);
  }
};

/**
 * Get notification statistics for dashboard
 */
export const getNotificationStats = async (department: UserRole) => {
  const notifications = await getNotificationsForDepartment(department);

  const stats = {
    total: notifications.length,
    unread: notifications.filter((n) => !n.isRead).length,
    critical: notifications.filter((n) => n.severity === "critical").length,
    pending: notifications.filter((n) => n.acknowledgments.length === 0).length,
    byType: {
      incident: notifications.filter((n) => n.type === "incident").length,
      help_request: notifications.filter((n) => n.type === "help_request")
        .length,
      status_update: notifications.filter((n) => n.type === "status_update")
        .length,
    },
  };

  return stats;
};

/**
 * Send status update notification
 */
export const sendStatusUpdateNotification = async (
  incidentId: string,
  title: string,
  message: string,
  sentBy: { userId: string; name: string; role: UserRole },
  targetDepartments: UserRole[],
): Promise<Notification> => {
  const notification: Omit<Notification, "id"> = {
    type: "status_update",
    incidentId,
    title,
    message,
    severity: "medium",
    targetDepartments,
    sentBy,
    data: {
      location: "Status Update",
      contactPhone: "",
    },
    timestamps: {
      created: new Date(),
      sent: new Date(),
    },
    acknowledgments: [],
    isRead: false,
    isArchived: false,
  };

  if (isFirebaseAvailable() && db) {
    try {
      const cleanNotificationForFirebase = cleanObjectForFirebase({
        ...notification,
        timestamps: {
          created: serverTimestamp(),
          sent: serverTimestamp(),
        },
      });

      const docRef = await addDoc(
        collection(db, "notifications"),
        cleanNotificationForFirebase,
      );

      return { ...notification, id: docRef.id };
    } catch (error) {
      console.error("Failed to send status update notification:", error);
    }
  }

  // Fallback to local storage
  const localNotification = {
    ...notification,
    id: `local-status-${Date.now()}`,
  };
  localNotifications.push(localNotification);
  localStorage.setItem(
    "emergency-notifications",
    JSON.stringify(localNotifications),
  );

  return localNotification;
};

// Initialize local storage on load
if (!isFirebaseAvailable()) {
  const storedNotifications = localStorage.getItem("emergency-notifications");
  if (storedNotifications) {
    try {
      localNotifications = JSON.parse(storedNotifications);
    } catch (error) {
      console.error("Failed to parse stored notifications:", error);
      localNotifications = [];
    }
  }
}
