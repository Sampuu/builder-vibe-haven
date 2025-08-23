import { io, Socket } from "socket.io-client";
import { dataService } from "./dataService";

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
}

export interface BackupRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterRole: string;
  targetRole: "fire" | "ambulance" | "hospital" | "police";
  reason: string;
  incidentId?: string;
  location?: string;
  priority: "low" | "medium" | "high" | "critical";
  timestamp: string;
}

class DashboardService {
  private socket: Socket | null = null;
  private connectionStatus: "disconnected" | "connecting" | "connected" =
    "disconnected";
  private user: { id: string; role: string; name: string } | null = null;
  private eventCallbacks: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.setupEventListeners();
  }

  public connect(user: { id: string; role: string; name: string }) {
    if (this.connectionStatus === "connected") {
      return; // Already connected
    }

    this.user = user;
    this.connectionStatus = "connecting";

    const socketUrl = window.location.origin;

    this.socket = io(socketUrl, {
      path: "/dashboard-socket/",
      transports: ["websocket", "polling"],
      timeout: 10000,
      forceNew: true,
    });

    this.setupSocketEvents();

    console.log(
      `🔌 Connecting dashboard service for ${user.name} (${user.role})`,
    );
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionStatus = "disconnected";
    this.user = null;
    console.log("🔌 Dashboard service disconnected");
  }

  private setupSocketEvents() {
    if (!this.socket || !this.user) return;

    this.socket.on("connect", () => {
      console.log("✅ Dashboard service connected");
      this.connectionStatus = "connected";
      this.reconnectAttempts = 0;

      // Join dashboard with user info
      this.socket!.emit("join_dashboard", this.user);

      // Request current stats
      this.socket!.emit("request_stats");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Dashboard service disconnected:", reason);
      this.connectionStatus = "disconnected";

      // Attempt to reconnect
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(
          `🔄 Reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
        );
        setTimeout(() => {
          if (this.user) {
            this.connect(this.user);
          }
        }, 2000 * this.reconnectAttempts);
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Dashboard connection error:", error);
      this.connectionStatus = "disconnected";
    });

    // Dashboard-specific events
    this.socket.on("dashboard_event", (event: DashboardEvent) => {
      this.handleDashboardEvent(event);
    });

    this.socket.on("incident_updated", (data) => {
      this.emit("incident_updated", data);
      // Sync with local data service
      dataService.emit("incidentUpdated", data);
    });

    this.socket.on("mission_updated", (data) => {
      this.emit("mission_updated", data);
      dataService.emit("missionUpdated", data);
    });

    this.socket.on("backup_requested", (data) => {
      this.emit("backup_requested", data);
      // Create notification for backup request
      this.createNotificationFromBackupRequest(data);
    });

    this.socket.on("status_updated", (data) => {
      this.emit("status_updated", data);
    });

    this.socket.on("supply_requested", (data) => {
      this.emit("supply_requested", data);
    });

    this.socket.on("notification_received", (data) => {
      this.emit("notification_received", data);
    });

    this.socket.on("dashboard_stats", (stats) => {
      this.emit("dashboard_stats", stats);
    });

    this.socket.on("user_joined", (data) => {
      this.emit("user_joined", data);
      console.log(`👤 ${data.user.name} (${data.user.role}) joined dashboard`);
    });

    this.socket.on("user_left", (data) => {
      this.emit("user_left", data);
      console.log(`👤 ${data.user.name} (${data.user.role}) left dashboard`);
    });
  }

  private setupEventListeners() {
    // Listen to data service events and broadcast them
    dataService.on("incidentCreated", (incident) => {
      this.broadcastEvent("incident_created", incident);
    });

    dataService.on("incidentUpdated", (incident) => {
      this.broadcastEvent("incident_updated", incident);
    });

    dataService.on("incidentDeleted", (incidentId) => {
      this.broadcastEvent("incident_deleted", { id: incidentId });
    });

    dataService.on("missionCreated", (mission) => {
      this.broadcastEvent("mission_created", mission);
    });

    dataService.on("missionUpdated", (mission) => {
      this.broadcastEvent("mission_updated", mission);
    });

    dataService.on("missionDeleted", (missionId) => {
      this.broadcastEvent("mission_deleted", { id: missionId });
    });
  }

  private handleDashboardEvent(event: DashboardEvent) {
    console.log(`📡 Received dashboard event [${event.type}]:`, event.data);

    // Don't process events from ourselves
    if (event.userId === this.user?.id) {
      return;
    }

    this.emit(event.type, event.data);
  }

  private createNotificationFromBackupRequest(request: BackupRequest) {
    // Only create notification if this user is the target role or admin
    if (this.user?.role === request.targetRole || this.user?.role === "admin") {
      const notification = {
        id: Date.now().toString(),
        userId: this.user.id,
        title: "Backup Requested",
        message: `${request.requesterName} (${request.requesterRole}) requests backup: ${request.reason}`,
        type: "warning" as const,
        isRead: false,
        actionRequired: true,
        relatedId: request.incidentId,
        relatedType: "incident" as const,
        createdAt: request.timestamp,
        updatedAt: request.timestamp,
      };

      // Add to local notifications
      dataService.createNotification(notification);
      this.emit("notification_created", notification);
    }
  }

  // Public methods
  public requestBackup(request: Omit<BackupRequest, "id" | "timestamp">) {
    if (!this.socket || !this.user) return;

    const fullRequest: BackupRequest = {
      ...request,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    this.socket.emit("backup_request", fullRequest);
    console.log(
      `🚨 Backup request sent to ${request.targetRole}:`,
      request.reason,
    );
  }

  public updateIncidentStatus(
    incidentId: string,
    status: string,
    additionalData?: any,
  ) {
    if (!this.socket) return;

    const data = {
      incidentId,
      status,
      ...additionalData,
      updatedBy: this.user?.name,
      timestamp: new Date().toISOString(),
    };

    this.socket.emit("status_update", data);
  }

  public requestSupplies(request: any) {
    if (!this.socket) return;

    this.socket.emit("supply_request", {
      ...request,
      requestedBy: this.user?.name,
      timestamp: new Date().toISOString(),
    });
  }

  public sendNotification(notification: any) {
    if (!this.socket) return;

    this.socket.emit("send_notification", {
      ...notification,
      sentBy: this.user?.name,
      timestamp: new Date().toISOString(),
    });
  }

  public broadcastEvent(type: string, data: any) {
    if (!this.socket) return;

    const event: DashboardEvent = {
      type: type as any,
      data,
      timestamp: new Date().toISOString(),
    };

    this.socket.emit("dashboard_event", event);
  }

  public requestStats() {
    if (!this.socket) return;
    this.socket.emit("request_stats");
  }

  // Event system
  public on(event: string, callback: Function) {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }
    this.eventCallbacks.get(event)!.push(callback);
  }

  public off(event: string, callback: Function) {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `Error in dashboard service callback for ${event}:`,
            error,
          );
        }
      });
    }
  }

  // Getters
  public getConnectionStatus() {
    return this.connectionStatus;
  }

  public isConnected() {
    return this.connectionStatus === "connected";
  }

  public getCurrentUser() {
    return this.user;
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();
export default dashboardService;
