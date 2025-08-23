const {
  onCall,
  onRequest,
  HttpsError,
} = require("firebase-functions/v2/https");
const {
  onDocumentCreated,
  onDocumentUpdated,
} = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();
const messaging = getMessaging();

// Trigger when a new disaster request is created
exports.onDisasterRequestCreated = onDocumentCreated(
  "disaster_requests/{requestId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();
    console.log("New disaster request created:", data);

    try {
      // Create notification for relevant emergency services
      const notificationData = {
        title: `🚨 ${data.severity.toUpperCase()} Emergency`,
        body: `${data.type.toUpperCase()}: ${data.title}`,
        location: data.location.address,
        severity: data.severity,
        type: data.type,
        requestId: event.params.requestId,
        timestamp: new Date().toISOString(),
      };

      // Determine which roles should be notified based on emergency type
      let targetRoles = ["admin"]; // Admin always gets notified

      switch (data.type) {
        case "fire":
          targetRoles.push("fire");
          break;
        case "medical":
          targetRoles.push("ambulance", "hospital");
          break;
        case "crime":
          targetRoles.push("police");
          break;
        case "accident":
          targetRoles.push("police", "ambulance");
          break;
        default:
          targetRoles.push("police"); // Default to police for other emergencies
      }

      // Get users with target roles
      const usersQuery = await db
        .collection("users")
        .where("role", "in", targetRoles)
        .where("isActive", "==", true)
        .get();

      const notifications = [];
      const fcmTokens = [];

      usersQuery.forEach((userDoc) => {
        const userData = userDoc.data();

        // Create notification record
        notifications.push({
          userId: userDoc.id,
          userRole: userData.role,
          type: "disaster_alert",
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData,
          read: false,
          createdAt: new Date(),
        });

        // Collect FCM tokens if available
        if (userData.fcmToken) {
          fcmTokens.push(userData.fcmToken);
        }
      });

      // Batch write notifications to Firestore
      const batch = db.batch();
      notifications.forEach((notification) => {
        const notificationRef = db.collection("notifications").doc();
        batch.set(notificationRef, notification);
      });
      await batch.commit();

      // Send FCM push notifications
      if (fcmTokens.length > 0) {
        const message = {
          notification: {
            title: notificationData.title,
            body: notificationData.body,
          },
          data: {
            type: "disaster_alert",
            requestId: event.params.requestId,
            severity: data.severity,
            location: data.location.address,
          },
          tokens: fcmTokens,
        };

        try {
          const response = await messaging.sendEachForMulticast(message);
          console.log(
            "Successfully sent notifications:",
            response.successCount,
          );
          console.log("Failed notifications:", response.failureCount);
        } catch (fcmError) {
          console.error("Error sending FCM notifications:", fcmError);
        }
      }

      // For critical emergencies, also create a news alert
      if (data.severity === "critical") {
        await db.collection("news_alerts").add({
          title: `CRITICAL EMERGENCY: ${data.type.toUpperCase()}`,
          content: `Critical emergency reported: ${data.title}. Location: ${data.location.address}. Emergency services have been dispatched.`,
          type: "emergency",
          priority: "critical",
          location: data.location.address,
          publishedBy: "system",
          publishedAt: new Date(),
          isActive: true,
          targetRoles: [
            "user",
            "police",
            "fire",
            "ambulance",
            "hospital",
            "admin",
          ],
        });
      }

      console.log(`Notifications sent to ${notifications.length} users`);
    } catch (error) {
      console.error("Error processing disaster request:", error);
    }
  },
);

// Trigger when a disaster request is updated
exports.onDisasterRequestUpdated = onDocumentUpdated(
  "disaster_requests/{requestId}",
  async (event) => {
    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();

    // Check if status changed
    if (beforeData.status !== afterData.status) {
      console.log(
        `Disaster request ${event.params.requestId} status changed from ${beforeData.status} to ${afterData.status}`,
      );

      // Notify the original reporter about status changes
      try {
        const userQuery = await db
          .collection("users")
          .where("uid", "==", afterData.userId)
          .limit(1)
          .get();

        if (!userQuery.empty) {
          const userData = userQuery.docs[0].data();

          const statusMessages = {
            assigned:
              "Your emergency report has been assigned to emergency responders.",
            "in-progress":
              "Emergency responders are currently handling your reported incident.",
            resolved: "Your reported emergency has been resolved.",
            rejected: "Your emergency report requires additional information.",
          };

          const notificationData = {
            userId: afterData.userId,
            userRole: userData.role,
            type: "status_update",
            title: "Emergency Report Update",
            body:
              statusMessages[afterData.status] ||
              `Status updated to: ${afterData.status}`,
            data: {
              requestId: event.params.requestId,
              status: afterData.status,
              title: afterData.title,
            },
            read: false,
            createdAt: new Date(),
          };

          await db.collection("notifications").add(notificationData);

          // Send FCM notification if token available
          if (userData.fcmToken) {
            const message = {
              notification: {
                title: notificationData.title,
                body: notificationData.body,
              },
              data: {
                type: "status_update",
                requestId: event.params.requestId,
                status: afterData.status,
              },
              token: userData.fcmToken,
            };

            try {
              await messaging.send(message);
              console.log("Status update notification sent");
            } catch (fcmError) {
              console.error("Error sending status notification:", fcmError);
            }
          }
        }
      } catch (error) {
        console.error("Error sending status update:", error);
      }
    }
  },
);

// HTTP function to send test notifications
exports.sendTestNotification = onCall({ cors: true }, async (request) => {
  const { auth, data } = request;

  if (!auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  try {
    // Create a test news alert
    await db.collection("news_alerts").add({
      title: "Test Emergency Alert",
      content:
        "This is a test notification from the disaster management system.",
      type: "info",
      priority: "low",
      publishedBy: auth.uid,
      publishedAt: new Date(),
      isActive: true,
      targetRoles: ["user", "police", "fire", "ambulance", "hospital", "admin"],
    });

    return { success: true, message: "Test notification sent" };
  } catch (error) {
    console.error("Error sending test notification:", error);
    throw new HttpsError("internal", "Failed to send test notification");
  }
});

// Function to clean up old notifications
exports.cleanupOldNotifications = onRequest(
  { cors: true },
  async (req, res) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const oldNotificationsQuery = await db
        .collection("notifications")
        .where("createdAt", "<", thirtyDaysAgo)
        .get();

      const batch = db.batch();
      oldNotificationsQuery.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      res.json({
        success: true,
        message: `Cleaned up ${oldNotificationsQuery.size} old notifications`,
      });
    } catch (error) {
      console.error("Error cleaning up notifications:", error);
      res.status(500).json({ error: "Failed to cleanup notifications" });
    }
  },
);

// Function to get emergency statistics
exports.getEmergencyStats = onCall({ cors: true }, async (request) => {
  const { auth } = request;

  if (!auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  try {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get today's stats
    const todayQuery = await db
      .collection("disaster_requests")
      .where("createdAt", ">=", startOfDay)
      .get();

    // Get this week's stats
    const weekQuery = await db
      .collection("disaster_requests")
      .where("createdAt", ">=", startOfWeek)
      .get();

    // Get stats by type and severity
    const typeStats = {};
    const severityStats = {};
    const statusStats = {};

    weekQuery.forEach((doc) => {
      const data = doc.data();

      typeStats[data.type] = (typeStats[data.type] || 0) + 1;
      severityStats[data.severity] = (severityStats[data.severity] || 0) + 1;
      statusStats[data.status] = (statusStats[data.status] || 0) + 1;
    });

    return {
      today: todayQuery.size,
      thisWeek: weekQuery.size,
      byType: typeStats,
      bySeverity: severityStats,
      byStatus: statusStats,
    };
  } catch (error) {
    console.error("Error getting emergency stats:", error);
    throw new HttpsError("internal", "Failed to get emergency statistics");
  }
});
