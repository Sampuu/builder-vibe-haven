import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import { Notification, GetNotificationsResponse } from '@shared/api';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  AlertTriangle,
  Heart,
  Flame,
  Shield,
  Truck,
  Building2,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDropdownProps {
  className?: string;
}

const typeIcons = {
  incident_created: AlertTriangle,
  incident_assigned: Check,
  incident_updated: CheckCheck,
  help_request: Heart,
};

const priorityColors = {
  low: 'text-slate-500',
  medium: 'text-emergency-info',
  high: 'text-emergency-warning',
  critical: 'text-emergency-danger',
};

export default function NotificationDropdown({ className }: NotificationDropdownProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  // Refresh notifications periodically
  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'x-user-id': user.id,
          'x-user-role': user.role
        }
      });

      if (response.ok) {
        const data: GetNotificationsResponse = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } else {
        console.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
          'x-user-role': user?.role || 'user'
        },
        body: JSON.stringify({ read: true })
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
          'x-user-role': user?.role || 'user'
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={`relative ${className}`}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs min-w-[20px]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <DropdownMenuLabel className="text-base font-semibold p-0">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs h-auto p-1"
            >
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Clock className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-12 w-12 text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => {
                const IconComponent = typeIcons[notification.type] || AlertTriangle;
                const priorityColor = priorityColors[notification.priority] || 'text-slate-500';
                
                return (
                  <DropdownMenuItem 
                    key={notification.id}
                    className="p-0 cursor-pointer"
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <Card className={`w-full border-0 shadow-none ${!notification.read ? 'bg-blue-50' : ''}`}>
                      <CardContent className="p-3">
                        <div className="flex items-start space-x-3">
                          <div className={`p-1.5 rounded-full bg-slate-100 ${priorityColor}`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className={`text-sm font-medium truncate ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
                              )}
                            </div>
                            
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-slate-400">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                              
                              <Badge 
                                variant={notification.priority === 'critical' || notification.priority === 'high' ? 'destructive' : 'secondary'}
                                className="text-xs px-2 py-0.5"
                              >
                                {notification.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button 
                variant="ghost" 
                className="w-full text-sm h-8"
                onClick={() => {
                  setIsOpen(false);
                  // Could navigate to a full notifications page
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
