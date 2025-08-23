import { useState, useEffect, useCallback } from "react";
import {
  dataService,
  Incident,
  Mission,
  Notification,
  SupplyRequest,
  type BaseEntity,
} from "@/lib/dataService";

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dataService.getIncidents();
      setIncidents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load incidents");
    } finally {
      setLoading(false);
    }
  }, []);

  const createIncident = useCallback(
    async (incident: Omit<Incident, keyof BaseEntity>) => {
      try {
        const newIncident = await dataService.createIncident(incident);
        setIncidents((prev) => [...prev, newIncident]);
        return newIncident;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create incident",
        );
        throw err;
      }
    },
    [],
  );

  const updateIncident = useCallback(
    async (id: string, updates: Partial<Incident>) => {
      try {
        const updatedIncident = await dataService.updateIncident(id, updates);
        if (updatedIncident) {
          setIncidents((prev) =>
            prev.map((incident) =>
              incident.id === id ? updatedIncident : incident,
            ),
          );
        }
        return updatedIncident;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update incident",
        );
        throw err;
      }
    },
    [],
  );

  const deleteIncident = useCallback(async (id: string) => {
    try {
      const success = await dataService.deleteIncident(id);
      if (success) {
        setIncidents((prev) => prev.filter((incident) => incident.id !== id));
      }
      return success;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete incident",
      );
      throw err;
    }
  }, []);

  useEffect(() => {
    loadIncidents();

    // Subscribe to real-time updates
    const handleIncidentsUpdate = (updatedIncidents: Incident[]) => {
      setIncidents(updatedIncidents);
    };

    const handleIncidentCreated = (newIncident: Incident) => {
      setIncidents((prev) => {
        const exists = prev.find((incident) => incident.id === newIncident.id);
        if (exists) return prev;
        return [...prev, newIncident];
      });
    };

    const handleIncidentUpdated = (updatedIncident: Incident) => {
      setIncidents((prev) =>
        prev.map((incident) =>
          incident.id === updatedIncident.id ? updatedIncident : incident,
        ),
      );
    };

    const handleIncidentDeleted = (deletedId: string) => {
      setIncidents((prev) =>
        prev.filter((incident) => incident.id !== deletedId),
      );
    };

    dataService.on("incidentsUpdated", handleIncidentsUpdate);
    dataService.on("incidentCreated", handleIncidentCreated);
    dataService.on("incidentUpdated", handleIncidentUpdated);
    dataService.on("incidentDeleted", handleIncidentDeleted);

    return () => {
      dataService.off("incidentsUpdated", handleIncidentsUpdate);
      dataService.off("incidentCreated", handleIncidentCreated);
      dataService.off("incidentUpdated", handleIncidentUpdated);
      dataService.off("incidentDeleted", handleIncidentDeleted);
    };
  }, [loadIncidents]);

  return {
    incidents,
    loading,
    error,
    createIncident,
    updateIncident,
    deleteIncident,
    refresh: loadIncidents,
  };
}

export function useMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dataService.getMissions();
      setMissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load missions");
    } finally {
      setLoading(false);
    }
  }, []);

  const createMission = useCallback(
    async (mission: Omit<Mission, keyof BaseEntity>) => {
      try {
        const newMission = await dataService.createMission(mission);
        setMissions((prev) => [...prev, newMission]);
        return newMission;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create mission",
        );
        throw err;
      }
    },
    [],
  );

  const updateMission = useCallback(
    async (id: string, updates: Partial<Mission>) => {
      try {
        const updatedMission = await dataService.updateMission(id, updates);
        if (updatedMission) {
          setMissions((prev) =>
            prev.map((mission) =>
              mission.id === id ? updatedMission : mission,
            ),
          );
        }
        return updatedMission;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update mission",
        );
        throw err;
      }
    },
    [],
  );

  const deleteMission = useCallback(async (id: string) => {
    try {
      const success = await dataService.deleteMission(id);
      if (success) {
        setMissions((prev) => prev.filter((mission) => mission.id !== id));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete mission");
      throw err;
    }
  }, []);

  useEffect(() => {
    loadMissions();

    // Subscribe to real-time updates
    const handleMissionsUpdate = (updatedMissions: Mission[]) => {
      setMissions(updatedMissions);
    };

    dataService.on("missionsUpdated", handleMissionsUpdate);

    return () => {
      dataService.off("missionsUpdated", handleMissionsUpdate);
    };
  }, [loadMissions]);

  return {
    missions,
    loading,
    error,
    createMission,
    updateMission,
    deleteMission,
    refresh: loadMissions,
  };
}

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await dataService.getNotifications(userId);
      setNotifications(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load notifications",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createNotification = useCallback(
    async (notification: Omit<Notification, keyof BaseEntity>) => {
      try {
        const newNotification =
          await dataService.createNotification(notification);
        if (newNotification.userId === userId) {
          setNotifications((prev) => [newNotification, ...prev]);
        }
        return newNotification;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create notification",
        );
        throw err;
      }
    },
    [userId],
  );

  const markAsRead = useCallback(async (id: string) => {
    try {
      const success = await dataService.markNotificationAsRead(id);
      if (success) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? { ...notification, isRead: true }
              : notification,
          ),
        );
      }
      return success;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark notification as read",
      );
      throw err;
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    loadNotifications();

    // Subscribe to real-time updates
    const handleNotificationCreated = (newNotification: Notification) => {
      if (newNotification.userId === userId) {
        setNotifications((prev) => [newNotification, ...prev]);
      }
    };

    const handleNotificationUpdated = (updatedNotification: Notification) => {
      if (updatedNotification.userId === userId) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === updatedNotification.id
              ? updatedNotification
              : notification,
          ),
        );
      }
    };

    dataService.on("notificationCreated", handleNotificationCreated);
    dataService.on("notificationUpdated", handleNotificationUpdated);

    return () => {
      dataService.off("notificationCreated", handleNotificationCreated);
      dataService.off("notificationUpdated", handleNotificationUpdated);
    };
  }, [loadNotifications, userId]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    createNotification,
    markAsRead,
    refresh: loadNotifications,
  };
}

export function useSupplyRequests() {
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSupplyRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dataService.getSupplyRequests();
      setSupplyRequests(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load supply requests",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const createSupplyRequest = useCallback(
    async (request: Omit<SupplyRequest, keyof BaseEntity>) => {
      try {
        const newRequest = await dataService.createSupplyRequest(request);
        setSupplyRequests((prev) => [...prev, newRequest]);
        return newRequest;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to create supply request",
        );
        throw err;
      }
    },
    [],
  );

  const updateSupplyRequest = useCallback(
    async (id: string, updates: Partial<SupplyRequest>) => {
      try {
        const updatedRequest = await dataService.updateSupplyRequest(
          id,
          updates,
        );
        if (updatedRequest) {
          setSupplyRequests((prev) =>
            prev.map((request) =>
              request.id === id ? updatedRequest : request,
            ),
          );
        }
        return updatedRequest;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to update supply request",
        );
        throw err;
      }
    },
    [],
  );

  useEffect(() => {
    loadSupplyRequests();

    // Subscribe to real-time updates
    const handleSupplyRequestsUpdate = (updatedRequests: SupplyRequest[]) => {
      setSupplyRequests(updatedRequests);
    };

    dataService.on("supplyRequestsUpdated", handleSupplyRequestsUpdate);

    return () => {
      dataService.off("supplyRequestsUpdated", handleSupplyRequestsUpdate);
    };
  }, [loadSupplyRequests]);

  return {
    supplyRequests,
    loading,
    error,
    createSupplyRequest,
    updateSupplyRequest,
    refresh: loadSupplyRequests,
  };
}

// Initialize sample data on first load
export function useInitializeData() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        await dataService.initializeSampleData();
        setInitialized(true);
      } catch (error) {
        console.error("Failed to initialize sample data:", error);
      }
    };

    initData();
  }, []);

  return initialized;
}
