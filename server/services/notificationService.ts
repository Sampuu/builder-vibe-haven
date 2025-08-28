// Notification service for handling incident-related notifications
import { Incident, Notification, UserRole } from "../../shared/types";
import { createNotification } from "../database/store";
import { notifyClients } from "./sseService";

export function sendIncidentNotification(incident: Incident): void {
  // Send targeted notification to assigned departments
  const notificationTitle =
    incident.type === "help_request"
      ? "New Help Request"
      : "New Emergency Report";

  const notificationMessage = `${incident.category.toUpperCase()}: ${incident.title} at ${incident.location}`;

  const notification = createNotification({
    title: notificationTitle,
    message: notificationMessage,
    type:
      incident.urgency === "critical"
        ? "emergency"
        : incident.urgency === "high"
          ? "warning"
          : "info",
    priority:
      incident.urgency === "critical" || incident.urgency === "high"
        ? "high"
        : "medium",
    category: "incident",
    targetRoles: incident.assignedDepartments,
    relatedIncidentId: incident.id,
    read: false,
  });

  // Send via SSE to connected clients
  notifyClients({
    type: "notification",
    data: notification,
  });

  // Send separate admin notification for high priority incidents
  if (incident.urgency === "critical" || incident.urgency === "high") {
    const adminNotification = createNotification({
      title: `${incident.urgency.toUpperCase()} Incident Reported`,
      message: `${incident.category.toUpperCase()}: ${incident.title} - Departments notified: ${incident.assignedDepartments.join(", ")}`,
      type: "emergency",
      priority: "high",
      category: "incident",
      targetRoles: ["admin"],
      relatedIncidentId: incident.id,
      read: false,
    });

    notifyClients({
      type: "notification",
      data: adminNotification,
    });
  }

  console.log(
    `✅ Sent notification for incident ${incident.id} to departments: ${incident.assignedDepartments.join(", ")}`,
  );
}

export function sendIncidentStatusNotification(
  incident: Incident,
  updatedBy?: { userId: string; role: UserRole },
): void {
  // Notify the reporter and assigned departments about status changes
  const targetRoles = [incident.reporter.role, ...incident.assignedDepartments];
  const uniqueRoles = [...new Set(targetRoles)]; // Remove duplicates

  const notification = createNotification({
    title: "Incident Status Updated",
    message: `Incident "${incident.title}" status changed to: ${incident.status.replace("_", " ")}`,
    type: incident.status === "resolved" ? "success" : "info",
    priority: "medium",
    category: "update",
    targetRoles: uniqueRoles,
    relatedIncidentId: incident.id,
    read: false,
  });

  notifyClients({
    type: "notification",
    data: notification,
  });

  // Also send incident update via SSE
  notifyClients({
    type: "incident_update",
    data: incident,
  });

  console.log(
    `✅ Sent status notification for incident ${incident.id} (${incident.status})`,
  );
}

export function sendIncidentAcknowledgmentNotification(
  incident: Incident,
  department: UserRole,
): void {
  // Notify the reporter that their incident has been acknowledged
  const notification = createNotification({
    title: "Incident Acknowledged",
    message: `Your ${incident.type === "help_request" ? "help request" : "emergency report"} has been acknowledged by ${department}`,
    type: "success",
    priority: "medium",
    category: "update",
    targetRoles: [incident.reporter.role],
    relatedIncidentId: incident.id,
    read: false,
  });

  notifyClients({
    type: "notification",
    data: notification,
  });

  // Also send incident update via SSE
  notifyClients({
    type: "incident_update",
    data: incident,
  });

  console.log(
    `✅ Sent acknowledgment notification for incident ${incident.id} by ${department}`,
  );
}

export function broadcastNewsNotification(
  title: string,
  message: string,
  type: "emergency" | "warning" | "info" | "success",
  priority: "high" | "medium" | "low",
  broadcastBy?: { userId: string; role: UserRole },
): Notification {
  const notification = createNotification({
    title,
    message,
    type,
    priority,
    category: "news",
    read: false,
    // No targetRoles means it goes to all users
  });

  notifyClients({
    type: "notification",
    data: notification,
  });

  console.log(
    `📢 Broadcast news notification: ${title} (${type}, ${priority})`,
  );
  return notification;
}

export function sendTargetedNotification(
  title: string,
  message: string,
  type: "emergency" | "warning" | "info" | "success",
  priority: "high" | "medium" | "low",
  category: "incident" | "system" | "update" | "alert" | "news",
  targetRoles: UserRole[],
  relatedIncidentId?: string,
): Notification {
  const notification = createNotification({
    title,
    message,
    type,
    priority,
    category,
    targetRoles,
    relatedIncidentId,
    read: false,
  });

  notifyClients({
    type: "notification",
    data: notification,
  });

  console.log(
    `🎯 Sent targeted notification to roles: ${targetRoles.join(", ")}`,
  );
  return notification;
}
