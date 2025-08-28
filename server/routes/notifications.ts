import { RequestHandler } from "express";
import { 
  GetNotificationsResponse,
  BroadcastNewsRequest,
  BroadcastNewsResponse,
  UserRole
} from "../../shared/types";
import { 
  getNotificationsForUser, 
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsReadForUser,
  deleteNotification,
  clearNotificationsForUser
} from "../database/store";
import { 
  broadcastNewsNotification, 
  sendTargetedNotification 
} from "../services/notificationService";
import { addSSEClient, getConnectedClients, getClientCount } from "../services/sseService";

// GET /api/notifications?userRole=police - Get notifications for user
export const handleGetNotifications: RequestHandler = async (req, res) => {
  try {
    const { userRole, all } = req.query;

    if (!userRole && all !== 'true') {
      return res.status(400).json({
        success: false,
        message: "Must specify userRole or all=true"
      });
    }

    let notifications;
    if (all === 'true') {
      // Admin can get all notifications
      notifications = getAllNotifications();
    } else {
      notifications = getNotificationsForUser(userRole as UserRole);
    }

    const response: GetNotificationsResponse = {
      success: true,
      notifications
    };

    res.json(response);
  } catch (error) {
    console.error("❌ Error getting notifications:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// PUT /api/notifications/:id/read - Mark notification as read
export const handleMarkNotificationAsRead: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const success = markNotificationAsRead(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read"
    });
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// PUT /api/notifications/mark-all-read - Mark all notifications as read for user
export const handleMarkAllNotificationsAsRead: RequestHandler = async (req, res) => {
  try {
    const { userRole } = req.body;

    if (!userRole) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: userRole"
      });
    }

    const markedCount = markAllNotificationsAsReadForUser(userRole);

    res.json({
      success: true,
      message: `Marked ${markedCount} notifications as read`,
      markedCount
    });
  } catch (error) {
    console.error("❌ Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// DELETE /api/notifications/:id - Delete notification
export const handleDeleteNotification: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const success = deleteNotification(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.json({
      success: true,
      message: "Notification deleted"
    });
  } catch (error) {
    console.error("❌ Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// DELETE /api/notifications/clear - Clear all notifications for user
export const handleClearNotifications: RequestHandler = async (req, res) => {
  try {
    const { userRole } = req.body;

    if (!userRole) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: userRole"
      });
    }

    const deletedCount = clearNotificationsForUser(userRole);

    res.json({
      success: true,
      message: `Cleared ${deletedCount} notifications`,
      deletedCount
    });
  } catch (error) {
    console.error("❌ Error clearing notifications:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// POST /api/notifications/broadcast - Broadcast news to all users
export const handleBroadcastNews: RequestHandler = async (req, res) => {
  try {
    const broadcastData: BroadcastNewsRequest = req.body;

    if (!broadcastData.title || !broadcastData.message || !broadcastData.type || !broadcastData.priority) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, message, type, priority"
      });
    }

    const notification = broadcastNewsNotification(
      broadcastData.title,
      broadcastData.message,
      broadcastData.type,
      broadcastData.priority,
      broadcastData.broadcastBy
    );

    const response: BroadcastNewsResponse = {
      success: true,
      notificationId: notification.id,
      message: "News broadcast sent to all users"
    };

    console.log(`📢 News broadcast: ${broadcastData.title}`);
    res.status(201).json(response);
  } catch (error) {
    console.error("❌ Error broadcasting news:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// POST /api/notifications/targeted - Send targeted notification
export const handleSendTargetedNotification: RequestHandler = async (req, res) => {
  try {
    const { title, message, type, priority, category, targetRoles, relatedIncidentId } = req.body;

    if (!title || !message || !type || !priority || !category || !targetRoles) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, message, type, priority, category, targetRoles"
      });
    }

    const notification = sendTargetedNotification(
      title,
      message,
      type,
      priority,
      category,
      targetRoles,
      relatedIncidentId
    );

    res.status(201).json({
      success: true,
      notificationId: notification.id,
      message: `Targeted notification sent to: ${targetRoles.join(', ')}`
    });
  } catch (error) {
    console.error("❌ Error sending targeted notification:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// GET /api/notifications/sse - Server-Sent Events endpoint
export const handleSSEConnection: RequestHandler = async (req, res) => {
  try {
    const { userRole, userId } = req.query;

    if (!userRole || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required query parameters: userRole, userId"
      });
    }

    const clientId = `${userId}-${Date.now()}`;
    addSSEClient(clientId, res, userRole as string, userId as string);

    // Don't call res.json() here as SSE connection is handled by addSSEClient
  } catch (error) {
    console.error("❌ Error setting up SSE connection:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// GET /api/notifications/clients - Get connected SSE clients (admin only)
export const handleGetConnectedClients: RequestHandler = async (req, res) => {
  try {
    const clients = getConnectedClients();
    const clientCount = getClientCount();

    res.json({
      success: true,
      clientCount,
      clients
    });
  } catch (error) {
    console.error("❌ Error getting connected clients:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
