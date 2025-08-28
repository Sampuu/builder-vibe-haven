import { RequestHandler } from "express";
import {
  GetNotificationsResponse,
  UpdateNotificationRequest,
  User,
} from "@shared/api";
import { notifications } from "./incidents";

export const getNotifications: RequestHandler = (req, res) => {
  try {
    const userRole = req.headers["x-user-role"] as User["role"];
    const userId = req.headers["x-user-id"] as string;

    if (!userRole) {
      return res.status(400).json({ error: "User role required" });
    }

    // Filter notifications for the user's role
    const userNotifications = notifications.filter(
      (notification) =>
        notification.targetRole === userRole ||
        (notification.targetUserId && notification.targetUserId === userId),
    );

    // Sort by timestamp (newest first)
    userNotifications.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    // Count unread notifications
    const unreadCount = userNotifications.filter((n) => !n.read).length;

    const response: GetNotificationsResponse = {
      notifications: userNotifications,
      unreadCount,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

export const updateNotification: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updates: UpdateNotificationRequest = req.body;

    const notification = notifications.find((n) => n.id === id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    // Update notification properties
    if (updates.read !== undefined) {
      notification.read = updates.read;
    }
    if (updates.acknowledged !== undefined) {
      notification.acknowledged = updates.acknowledged;
    }

    res.json({ notification });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ error: "Failed to update notification" });
  }
};

export const markAllAsRead: RequestHandler = (req, res) => {
  try {
    const userRole = req.headers["x-user-role"] as User["role"];
    const userId = req.headers["x-user-id"] as string;

    if (!userRole) {
      return res.status(400).json({ error: "User role required" });
    }

    // Mark all user's notifications as read
    const updatedCount = notifications.filter((notification) => {
      const isForUser =
        notification.targetRole === userRole ||
        (notification.targetUserId && notification.targetUserId === userId);

      if (isForUser && !notification.read) {
        notification.read = true;
        return true;
      }
      return false;
    }).length;

    res.json({ message: `Marked ${updatedCount} notifications as read` });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ error: "Failed to mark notifications as read" });
  }
};
