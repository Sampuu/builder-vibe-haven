import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";
import { dashboardService, type BackupRequest } from "@/lib/dashboardService";

export interface DashboardStats {
  connectedUsers: number;
  usersByRole: { [role: string]: number };
  rooms: string[];
  timestamp: string;
}

export function useDashboardIntegration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [connectedUsers, setConnectedUsers] = useState<DashboardStats | null>(
    null,
  );
  const [realtimeEvents, setRealtimeEvents] = useState<any[]>([]);

  // Connect to dashboard service when user is available
  useEffect(() => {
    if (user && connectionStatus === "disconnected") {
      dashboardService.connect({
        id: user.id,
        role: user.role,
        name: user.name,
      });
      setConnectionStatus("connecting");
    }

    return () => {
      if (connectionStatus !== "disconnected") {
        dashboardService.disconnect();
        setConnectionStatus("disconnected");
      }
    };
  }, [user, connectionStatus]);

  // Set up event listeners
  useEffect(() => {
    const handleConnectionStatusChange = () => {
      setConnectionStatus(dashboardService.getConnectionStatus());
    };

    const handleDashboardStats = (stats: DashboardStats) => {
      setConnectedUsers(stats);
    };

    const handleUserJoined = (data: any) => {
      toast({
        title: "User Joined",
        description: `${data.user.name} (${data.user.role}) joined the system`,
      });
      setConnectedUsers((prev) =>
        prev ? { ...prev, ...data.activeUsers } : null,
      );
    };

    const handleUserLeft = (data: any) => {
      console.log(`User ${data.user.name} left the system`);
      setConnectedUsers((prev) =>
        prev ? { ...prev, ...data.activeUsers } : null,
      );
    };

    const handleBackupRequested = (request: BackupRequest) => {
      if (user?.role === request.targetRole || user?.role === "admin") {
        toast({
          title: "🚨 Backup Requested",
          description: `${request.requesterName} needs ${request.targetRole} backup: ${request.reason}`,
          variant: "destructive",
        });

        // Add to recent events
        setRealtimeEvents((prev) => [
          {
            type: "backup_request",
            data: request,
            timestamp: new Date().toISOString(),
          },
          ...prev.slice(0, 9), // Keep last 10 events
        ]);
      }
    };

    const handleIncidentUpdated = (incident: any) => {
      toast({
        title: "📋 Incident Updated",
        description: `${incident.title} status changed to ${incident.status}`,
      });

      setRealtimeEvents((prev) => [
        {
          type: "incident_update",
          data: incident,
          timestamp: new Date().toISOString(),
        },
        ...prev.slice(0, 9),
      ]);
    };

    const handleMissionUpdated = (mission: any) => {
      toast({
        title: "🎯 Mission Updated",
        description: `Mission ${mission.title} has been updated`,
      });

      setRealtimeEvents((prev) => [
        {
          type: "mission_update",
          data: mission,
          timestamp: new Date().toISOString(),
        },
        ...prev.slice(0, 9),
      ]);
    };

    const handleSupplyRequested = (request: any) => {
      if (user?.role === "hospital" || user?.role === "admin") {
        toast({
          title: "📦 Supply Requested",
          description: `${request.itemName} requested for ${request.location}`,
        });

        setRealtimeEvents((prev) => [
          {
            type: "supply_request",
            data: request,
            timestamp: new Date().toISOString(),
          },
          ...prev.slice(0, 9),
        ]);
      }
    };

    const handleNotificationReceived = (notification: any) => {
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === "error" ? "destructive" : "default",
      });
    };

    // Register event listeners
    dashboardService.on("dashboard_stats", handleDashboardStats);
    dashboardService.on("user_joined", handleUserJoined);
    dashboardService.on("user_left", handleUserLeft);
    dashboardService.on("backup_requested", handleBackupRequested);
    dashboardService.on("incident_updated", handleIncidentUpdated);
    dashboardService.on("mission_updated", handleMissionUpdated);
    dashboardService.on("supply_requested", handleSupplyRequested);
    dashboardService.on("notification_received", handleNotificationReceived);

    // Check connection status periodically
    const statusInterval = setInterval(() => {
      const newStatus = dashboardService.getConnectionStatus();
      if (newStatus !== connectionStatus) {
        setConnectionStatus(newStatus);
      }
    }, 1000);

    return () => {
      clearInterval(statusInterval);
      dashboardService.off("dashboard_stats", handleDashboardStats);
      dashboardService.off("user_joined", handleUserJoined);
      dashboardService.off("user_left", handleUserLeft);
      dashboardService.off("backup_requested", handleBackupRequested);
      dashboardService.off("incident_updated", handleIncidentUpdated);
      dashboardService.off("mission_updated", handleMissionUpdated);
      dashboardService.off("supply_requested", handleSupplyRequested);
      dashboardService.off("notification_received", handleNotificationReceived);
    };
  }, [user, toast, connectionStatus]);

  // Helper functions
  const requestBackup = useCallback(
    (
      targetRole: "fire" | "ambulance" | "hospital" | "police",
      reason: string,
      incidentId?: string,
    ) => {
      if (!user) return;

      dashboardService.requestBackup({
        requesterId: user.id,
        requesterName: user.name,
        requesterRole: user.role,
        targetRole,
        reason,
        incidentId,
        priority: "high",
      });

      toast({
        title: "Backup Requested",
        description: `${targetRole} backup request sent: ${reason}`,
      });
    },
    [user, toast],
  );

  const updateIncidentStatus = useCallback(
    (incidentId: string, status: string, additionalData?: any) => {
      dashboardService.updateIncidentStatus(incidentId, status, additionalData);
    },
    [],
  );

  const requestSupplies = useCallback((request: any) => {
    dashboardService.requestSupplies(request);
  }, []);

  const sendNotification = useCallback((notification: any) => {
    dashboardService.sendNotification(notification);
  }, []);

  const refreshStats = useCallback(() => {
    dashboardService.requestStats();
  }, []);

  return {
    connectionStatus,
    isConnected: connectionStatus === "connected",
    connectedUsers,
    realtimeEvents,
    requestBackup,
    updateIncidentStatus,
    requestSupplies,
    sendNotification,
    refreshStats,
  };
}

// Hook for real-time incident updates
export function useRealtimeIncidents() {
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    const handleIncidentUpdate = (incident: any) => {
      setIncidents((prev) => {
        const index = prev.findIndex((i) => i.id === incident.id);
        if (index >= 0) {
          // Update existing
          const updated = [...prev];
          updated[index] = incident;
          return updated;
        } else {
          // Add new
          return [incident, ...prev];
        }
      });
    };

    const handleIncidentDeleted = (data: { id: string }) => {
      setIncidents((prev) => prev.filter((i) => i.id !== data.id));
    };

    dashboardService.on("incident_updated", handleIncidentUpdate);
    dashboardService.on("incident_created", handleIncidentUpdate);
    dashboardService.on("incident_deleted", handleIncidentDeleted);

    return () => {
      dashboardService.off("incident_updated", handleIncidentUpdate);
      dashboardService.off("incident_created", handleIncidentUpdate);
      dashboardService.off("incident_deleted", handleIncidentDeleted);
    };
  }, []);

  return incidents;
}

// Hook for real-time mission updates
export function useRealtimeMissions() {
  const [missions, setMissions] = useState<any[]>([]);

  useEffect(() => {
    const handleMissionUpdate = (mission: any) => {
      setMissions((prev) => {
        const index = prev.findIndex((m) => m.id === mission.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = mission;
          return updated;
        } else {
          return [mission, ...prev];
        }
      });
    };

    const handleMissionDeleted = (data: { id: string }) => {
      setMissions((prev) => prev.filter((m) => m.id !== data.id));
    };

    dashboardService.on("mission_updated", handleMissionUpdate);
    dashboardService.on("mission_created", handleMissionUpdate);
    dashboardService.on("mission_deleted", handleMissionDeleted);

    return () => {
      dashboardService.off("mission_updated", handleMissionUpdate);
      dashboardService.off("mission_created", handleMissionUpdate);
      dashboardService.off("mission_deleted", handleMissionDeleted);
    };
  }, []);

  return missions;
}
