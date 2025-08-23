import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

export interface DashboardEvent {
  type:
    | "incident_created"
    | "incident_updated"
    | "incident_deleted"
    | "mission_created"
    | "mission_updated"
    | "mission_deleted"
    | "backup_requested"
    | "status_updated"
    | "supply_requested"
    | "notification_created"
    | "user_action";
  data: any;
  timestamp: string;
  userId?: string;
  userRole?: string;
  dashboardType?: string;
}

export interface ConnectedUser {
  id: string;
  socketId: string;
  role: string;
  name: string;
  joinedAt: string;
}

class DashboardWebSocketServer {
  private io: SocketIOServer;
  private connectedUsers: Map<string, ConnectedUser> = new Map();
  private rooms: Map<string, Set<string>> = new Map(); // role -> socket ids

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      path: "/dashboard-socket/",
    });

    this.setupEventHandlers();
    console.log("🔌 WebSocket server initialized for dashboard communication");
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket) => {
      console.log(`🔗 New dashboard connection: ${socket.id}`);

      // Handle user joining with their role
      socket.on(
        "join_dashboard",
        (userData: { id: string; role: string; name: string }) => {
          const user: ConnectedUser = {
            id: userData.id,
            socketId: socket.id,
            role: userData.role,
            name: userData.name,
            joinedAt: new Date().toISOString(),
          };

          this.connectedUsers.set(socket.id, user);

          // Join role-specific room
          socket.join(`dashboard_${userData.role}`);
          socket.join("all_dashboards");

          // Track room membership
          if (!this.rooms.has(userData.role)) {
            this.rooms.set(userData.role, new Set());
          }
          this.rooms.get(userData.role)!.add(socket.id);

          // Notify others about new user
          socket.broadcast.emit("user_joined", {
            user: user,
            activeUsers: this.getActiveUsersByRole(),
          });

          // Send current stats to new user
          socket.emit("dashboard_stats", this.getCurrentStats());

          console.log(
            `👤 User ${userData.name} (${userData.role}) joined dashboard`,
          );
        },
      );

      // Handle dashboard events
      socket.on("dashboard_event", (event: DashboardEvent) => {
        this.handleDashboardEvent(socket, event);
      });

      // Handle incident updates
      socket.on("incident_update", (data) => {
        socket.broadcast.emit("incident_updated", data);
        this.logEvent("incident_updated", data, socket);
      });

      // Handle mission updates
      socket.on("mission_update", (data) => {
        socket.broadcast.emit("mission_updated", data);
        this.logEvent("mission_updated", data, socket);
      });

      // Handle backup requests
      socket.on("backup_request", (data) => {
        // Send to specific role dashboard
        if (data.targetRole) {
          socket
            .to(`dashboard_${data.targetRole}`)
            .emit("backup_requested", data);
        }
        // Also send to admin
        socket.to("dashboard_admin").emit("backup_requested", data);
        this.logEvent("backup_requested", data, socket);
      });

      // Handle status updates
      socket.on("status_update", (data) => {
        socket.broadcast.emit("status_updated", data);
        this.logEvent("status_updated", data, socket);
      });

      // Handle supply requests
      socket.on("supply_request", (data) => {
        socket.to("dashboard_hospital").emit("supply_requested", data);
        socket.to("dashboard_admin").emit("supply_requested", data);
        this.logEvent("supply_requested", data, socket);
      });

      // Handle notifications
      socket.on("send_notification", (data) => {
        if (data.targetUserId) {
          // Send to specific user
          const targetSocket = this.findSocketByUserId(data.targetUserId);
          if (targetSocket) {
            this.io.to(targetSocket).emit("notification_received", data);
          }
        } else if (data.targetRole) {
          // Send to all users of specific role
          socket
            .to(`dashboard_${data.targetRole}`)
            .emit("notification_received", data);
        } else {
          // Broadcast to all
          socket.broadcast.emit("notification_received", data);
        }
        this.logEvent("notification_sent", data, socket);
      });

      // Handle real-time stats requests
      socket.on("request_stats", () => {
        socket.emit("dashboard_stats", this.getCurrentStats());
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        const user = this.connectedUsers.get(socket.id);
        if (user) {
          console.log(`👤 User ${user.name} (${user.role}) disconnected`);

          // Remove from rooms
          this.rooms.get(user.role)?.delete(socket.id);
          this.connectedUsers.delete(socket.id);

          // Notify others
          socket.broadcast.emit("user_left", {
            user: user,
            activeUsers: this.getActiveUsersByRole(),
          });
        }
      });
    });
  }

  private handleDashboardEvent(socket: any, event: DashboardEvent) {
    const user = this.connectedUsers.get(socket.id);
    if (!user) return;

    // Add user context to event
    event.userId = user.id;
    event.userRole = user.role;
    event.timestamp = new Date().toISOString();

    // Broadcast to appropriate dashboards based on event type
    switch (event.type) {
      case "incident_created":
      case "incident_updated":
      case "incident_deleted":
        // Send to all dashboards
        socket.broadcast.emit("dashboard_event", event);
        break;

      case "backup_requested":
        // Send to target role and admin
        if (event.data.targetRole) {
          socket
            .to(`dashboard_${event.data.targetRole}`)
            .emit("dashboard_event", event);
        }
        socket.to("dashboard_admin").emit("dashboard_event", event);
        break;

      case "supply_requested":
        // Send to hospital and admin
        socket.to("dashboard_hospital").emit("dashboard_event", event);
        socket.to("dashboard_admin").emit("dashboard_event", event);
        break;

      default:
        // Broadcast to all dashboards
        socket.broadcast.emit("dashboard_event", event);
    }

    this.logEvent(event.type, event.data, socket);
  }

  private logEvent(eventType: string, data: any, socket: any) {
    const user = this.connectedUsers.get(socket.id);
    console.log(
      `📡 Dashboard Event [${eventType}] from ${user?.name || "unknown"} (${user?.role || "unknown"}):`,
      data,
    );
  }

  private findSocketByUserId(userId: string): string | null {
    for (const [socketId, user] of this.connectedUsers) {
      if (user.id === userId) {
        return socketId;
      }
    }
    return null;
  }

  private getActiveUsersByRole(): { [role: string]: number } {
    const stats: { [role: string]: number } = {};
    for (const user of this.connectedUsers.values()) {
      stats[user.role] = (stats[user.role] || 0) + 1;
    }
    return stats;
  }

  private getCurrentStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      usersByRole: this.getActiveUsersByRole(),
      rooms: Array.from(this.rooms.keys()),
      timestamp: new Date().toISOString(),
    };
  }

  // Public methods for external use
  public broadcastToAll(event: string, data: any) {
    this.io.emit(event, data);
  }

  public broadcastToRole(role: string, event: string, data: any) {
    this.io.to(`dashboard_${role}`).emit(event, data);
  }

  public getConnectedUsers(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values());
  }

  public getUsersByRole(role: string): ConnectedUser[] {
    return Array.from(this.connectedUsers.values()).filter(
      (user) => user.role === role,
    );
  }
}

export default DashboardWebSocketServer;
