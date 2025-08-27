import { useState, useEffect, useCallback } from 'react';
import { AnyReport } from '@shared/api';
import { 
  subscribeToNotifications, 
  createHighPriorityListener,
  createEmergencyNotificationListener 
} from '@/lib/firebase-reports-realtime';

export interface NotificationData {
  id: string;
  type: 'emergency' | 'high_priority' | 'general';
  report: AnyReport;
  timestamp: string;
  read: boolean;
  sound?: boolean;
}

/**
 * Hook for managing real-time notifications in dashboards
 */
export const useRealtimeNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && typeof Audio !== 'undefined') {
      try {
        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
        console.warn('Could not play notification sound:', error);
      }
    }
  }, [soundEnabled]);

  // Add new notification
  const addNotification = useCallback((report: AnyReport, type: 'emergency' | 'high_priority' | 'general' = 'general') => {
    const notification: NotificationData = {
      id: `${report.id}-${Date.now()}`,
      type,
      report,
      timestamp: new Date().toISOString(),
      read: false,
      sound: type === 'emergency'
    };

    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep only last 50
    
    // Play sound for emergency reports
    if (type === 'emergency') {
      playNotificationSound();
    }
  }, [playNotificationSound]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Clear old notifications (older than 24 hours)
  const clearOldNotifications = useCallback(() => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    setNotifications(prev => 
      prev.filter(notification => 
        new Date(notification.timestamp) > oneDayAgo
      )
    );
  }, []);

  // Update unread count
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Set up real-time listeners
  useEffect(() => {
    // Subscribe to general report notifications
    const unsubscribeGeneral = subscribeToNotifications((report) => {
      addNotification(report, 'general');
    });

    // Subscribe to high-priority reports
    const unsubscribeHighPriority = createHighPriorityListener((reports) => {
      // Only notify for new reports (created in last minute)
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const newReports = reports.filter(report => 
        new Date(report.timestamp) > oneMinuteAgo
      );
      
      newReports.forEach(report => {
        addNotification(report, 'high_priority');
      });
    });

    // Subscribe to emergency notifications
    const unsubscribeEmergency = createEmergencyNotificationListener((reports) => {
      reports.forEach(report => {
        addNotification(report, 'emergency');
      });
    });

    // Clean up old notifications every hour
    const cleanupInterval = setInterval(clearOldNotifications, 60 * 60 * 1000);

    return () => {
      unsubscribeGeneral();
      unsubscribeHighPriority.forEach(unsub => unsub());
      unsubscribeEmergency.forEach(unsub => unsub());
      clearInterval(cleanupInterval);
    };
  }, [addNotification, clearOldNotifications]);

  return {
    notifications,
    unreadCount,
    soundEnabled,
    setSoundEnabled,
    markAsRead,
    markAllAsRead,
    clearAll,
    playNotificationSound
  };
};

/**
 * Hook for getting filtered notifications
 */
export const useFilteredNotifications = (type?: 'emergency' | 'high_priority' | 'general') => {
  const { notifications, ...rest } = useRealtimeNotifications();
  
  const filteredNotifications = type 
    ? notifications.filter(n => n.type === type)
    : notifications;

  return {
    notifications: filteredNotifications,
    ...rest
  };
};

/**
 * Hook for emergency-only notifications (for critical dashboards)
 */
export const useEmergencyNotifications = () => {
  return useFilteredNotifications('emergency');
};

/**
 * Hook for high-priority notifications (for department dashboards)
 */
export const useHighPriorityNotifications = () => {
  return useFilteredNotifications('high_priority');
};
