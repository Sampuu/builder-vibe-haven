import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/use-data';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function NotificationCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { notifications, unreadCount, markAsRead, refresh } = useNotifications(user?.id || '');
  const [isOpen, setIsOpen] = useState(false);

  // Auto-refresh notifications every 30 seconds, but only when component is visible
  useEffect(() => {
    let interval: number | null = null;

    const startInterval = () => {
      if (interval) clearInterval(interval);
      interval = window.setInterval(() => {
        // Only refresh if the notification center is not open to avoid layout shifts
        if (!isOpen) {
          refresh();
        }
      }, 30000);
    };

    // Start the interval
    startInterval();

    // Cleanup function
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [refresh, isOpen]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      toast({
        title: "Notification marked as read",
        description: "Notification has been marked as read",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      for (const notification of notifications.filter(n => !n.isRead)) {
        await markAsRead(notification.id);
      }
      toast({
        title: "All notifications marked as read",
        description: "All notifications have been marked as read",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-emergency-danger" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-emergency-warning" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-emergency-resolved" />;
      case 'info': 
      default: return <Info className="h-4 w-4 text-emergency-info" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-emergency-danger/10 border-emergency-danger/20';
      case 'warning': return 'bg-emergency-warning/10 border-emergency-warning/20';
      case 'success': return 'bg-emergency-resolved/10 border-emergency-resolved/20';
      case 'info': 
      default: return 'bg-emergency-info/10 border-emergency-info/20';
    }
  };

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleMarkAllAsRead}
                    className="text-xs"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {notifications.length > 0 && (
              <CardDescription>
                {unreadCount} unread of {notifications.length} total
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-1 p-2">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-colors hover:bg-slate-50",
                        !notification.isRead && "bg-slate-50/50",
                        getNotificationBgColor(notification.type)
                      )}
                      onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={cn(
                              "text-sm font-medium truncate",
                              !notification.isRead && "font-semibold"
                            )}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-1">
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-emergency-info rounded-full"></div>
                              )}
                              <span className="text-xs text-slate-500">
                                {formatNotificationTime(notification.createdAt)}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          {notification.actionRequired && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              Action Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

// Hook for creating notifications easily from components
export function useCreateNotification() {
  const { user } = useAuth();
  const { createNotification } = useNotifications(user?.id || '');
  
  const notify = async (
    title: string, 
    message: string, 
    type: 'info' | 'warning' | 'error' | 'success' = 'info',
    actionRequired: boolean = false,
    relatedId?: string,
    relatedType?: 'incident' | 'mission'
  ) => {
    if (!user?.id) return;
    
    try {
      await createNotification({
        userId: user.id,
        title,
        message,
        type,
        isRead: false,
        actionRequired,
        relatedId,
        relatedType
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  };

  return { notify };
}
