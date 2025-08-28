import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Notification, User } from "@shared/api";
import { useAuth } from "./use-auth";
import { toast } from "./use-toast";

interface UseWebSocketReturn {
  isConnected: boolean;
  notifications: Notification[];
  clearNotifications: () => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    // Connect to WebSocket server
    const socket = io("/", {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("WebSocket connected");

      // Authenticate with server
      socket.emit("authenticate", {
        userId: user.id,
        userRole: user.role,
      });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("WebSocket disconnected");
    });

    // Listen for real-time notifications
    socket.on("notification", (notification: Notification) => {
      console.log("Received notification:", notification);

      // Add to local notifications list
      setNotifications((prev) => [notification, ...prev]);

      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
        variant: getToastVariant(notification.priority),
        duration: notification.priority === "critical" ? 10000 : 5000,
      });
    });

    // Listen for incident updates
    socket.on(
      "incident_update",
      (data: { incidentId: string; update: any }) => {
        console.log("Incident update:", data);

        // Show toast for incident updates
        toast({
          title: "Incident Updated",
          description: `Incident ${data.incidentId} has been updated`,
          variant: "default",
          duration: 3000,
        });
      },
    );

    // Listen for user-specific notifications
    socket.on(
      "user_notification",
      (data: { targetUserId: string; notification: Notification }) => {
        if (data.targetUserId === user.id) {
          console.log("User-specific notification:", data.notification);

          setNotifications((prev) => [data.notification, ...prev]);

          toast({
            title: data.notification.title,
            description: data.notification.message,
            variant: getToastVariant(data.notification.priority),
            duration: 5000,
          });
        }
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    isConnected,
    notifications,
    clearNotifications,
  };
}

function getToastVariant(priority: string): "default" | "destructive" {
  switch (priority) {
    case "critical":
    case "high":
      return "destructive";
    default:
      return "default";
  }
}
