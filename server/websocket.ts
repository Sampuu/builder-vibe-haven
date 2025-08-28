import { Server as SocketIOServer } from "socket.io";
import { Server } from "http";
import { Notification, User } from "@shared/api";

interface SocketData {
  userId?: string;
  userRole?: User["role"];
}

let io: SocketIOServer | null = null;

export function setupWebSocket(server: Server) {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*", // In production, specify exact origins
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Handle user authentication/role assignment
    socket.on(
      "authenticate",
      (data: { userId: string; userRole: User["role"] }) => {
        const socketData: SocketData = socket.data;
        socketData.userId = data.userId;
        socketData.userRole = data.userRole;

        // Join role-based room for targeted notifications
        socket.join(`role_${data.userRole}`);

        console.log(
          `User ${data.userId} (${data.userRole}) authenticated and joined role room`,
        );
      },
    );

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

export function broadcastNotification(notification: Notification) {
  if (!io) {
    console.warn("WebSocket server not initialized");
    return;
  }

  // Send to specific role room
  io.to(`role_${notification.targetRole}`).emit("notification", notification);

  // Also send to specific user if targetUserId is set
  if (notification.targetUserId) {
    io.emit("user_notification", {
      targetUserId: notification.targetUserId,
      notification,
    });
  }

  console.log(
    `Broadcasted notification ${notification.id} to role: ${notification.targetRole}`,
  );
}

export function broadcastIncidentUpdate(
  incidentId: string,
  update: any,
  targetRoles: User["role"][],
) {
  if (!io) {
    console.warn("WebSocket server not initialized");
    return;
  }

  targetRoles.forEach((role) => {
    io!.to(`role_${role}`).emit("incident_update", {
      incidentId,
      update,
    });
  });

  console.log(
    `Broadcasted incident update for ${incidentId} to roles:`,
    targetRoles,
  );
}

export { io };
