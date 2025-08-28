import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'emergency' | 'warning' | 'info' | 'success';
  timestamp: Date;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  category: 'incident' | 'system' | 'update' | 'alert' | 'news';
  targetRoles?: string[]; // If undefined, notification goes to all users
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  addTargetedNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>, targetRoles: string[]) => void;
  addNewsNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'category'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  // Filter notifications based on user role
  const notifications = allNotifications.filter(notification => {
    // If no target roles specified, show to all users (global notifications like news)
    if (!notification.targetRoles) return true;

    // If user is admin, show all notifications
    if (user?.role === 'admin') return true;

    // Show only if user's role is in target roles
    return user?.role && notification.targetRoles.includes(user.role);
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false,
    };

    setAllNotifications(prev => [newNotification, ...prev]);

    // Show toast for high priority notifications, but only if user should see this notification
    if (notification.priority === 'high') {
      const shouldShowToast = !notification.targetRoles ||
                             user?.role === 'admin' ||
                             (user?.role && notification.targetRoles.includes(user.role));

      if (shouldShowToast) {
        toast({
          title: notification.title,
          description: notification.message,
          variant: notification.type === 'emergency' ? 'destructive' : 'default',
        });
      }
    }
  };

  const addTargetedNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>, targetRoles: string[]) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false,
      targetRoles,
    };

    setAllNotifications(prev => [newNotification, ...prev]);

    // Show toast only to targeted users for high priority notifications
    if (notification.priority === 'high') {
      const shouldShowToast = user?.role === 'admin' || (user?.role && targetRoles.includes(user.role));

      if (shouldShowToast) {
        toast({
          title: notification.title,
          description: notification.message,
          variant: notification.type === 'emergency' ? 'destructive' : 'default',
        });
      }
    }
  };

  const addNewsNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'category'>) => {
    const newNotification: Notification = {
      ...notification,
      category: 'news',
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false,
      // No targetRoles means it goes to all users
    };

    setAllNotifications(prev => [newNotification, ...prev]);

    // Show toast for high priority news to all users
    if (notification.priority === 'high') {
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'emergency' ? 'destructive' : 'default',
      });
    }
  };

  const markAsRead = (id: string) => {
    setAllNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    // Only mark as read the notifications that the current user can see
    const visibleNotificationIds = notifications.map(n => n.id);
    setAllNotifications(prev =>
      prev.map(n => visibleNotificationIds.includes(n.id) ? { ...n, read: true } : n)
    );
  };

  const removeNotification = (id: string) => {
    setAllNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    // Only clear notifications that the current user can see
    const visibleNotificationIds = notifications.map(n => n.id);
    setAllNotifications(prev => prev.filter(n => !visibleNotificationIds.includes(n.id)));
  };

  // Initialize with sample notifications on mount
  useEffect(() => {
    const sampleNotifications: Omit<Notification, 'id' | 'timestamp' | 'read'>[] = [
      {
        title: 'New Emergency Alert',
        message: 'Fire reported at Downtown District - Units dispatched',
        type: 'emergency',
        priority: 'high',
        category: 'incident'
      },
      {
        title: 'System Update',
        message: 'Emergency response protocols have been updated',
        type: 'info',
        priority: 'medium',
        category: 'system'
      },
      {
        title: 'Medical Unit Available',
        message: 'Ambulance Unit 7 is now available for dispatch',
        type: 'success',
        priority: 'low',
        category: 'update'
      },
      {
        title: 'Weather Warning',
        message: 'Heavy rainfall expected in the next 2 hours',
        type: 'warning',
        priority: 'medium',
        category: 'alert'
      }
    ];

    // Add sample notifications with a delay to simulate real-time updates
    sampleNotifications.forEach((notification, index) => {
      setTimeout(() => {
        addNotification(notification);
      }, index * 1000);
    });
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    addTargetedNotification,
    addNewsNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
