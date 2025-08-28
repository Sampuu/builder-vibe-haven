import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

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
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast for high priority notifications
    if (notification.priority === 'high') {
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'emergency' ? 'destructive' : 'default',
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
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
