import { useState, useEffect } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import { adaptiveNotificationService } from '@/lib/adaptiveServices';
import { Notification } from '@/lib/firestore';
import { cn } from '@/lib/utils';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || user.role === 'user') return;

    let unsubscribe: (() => void) | undefined;

    // Listen for real-time notifications for this user's role
    const setupListener = async () => {
      unsubscribe = await adaptiveNotificationService.onSnapshot(user.role, (newNotifications) => {
        setNotifications(newNotifications);
        setUnreadCount(newNotifications.filter(n => !n.read).length);
      });
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await adaptiveNotificationService.markAsRead(notification.id!);
    }
  };

  const formatTime = (date: any) => {
    if (!date) return '';
    const timestamp = date.toDate ? date.toDate() : new Date(date);
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-emergency-danger';
      case 'high': return 'text-emergency-warning';
      case 'medium': return 'text-emergency-info';
      default: return 'text-slate-600';
    }
  };

  // Don't show for regular users
  if (!user || user.role === 'user') return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-sm">
            No notifications yet
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            {notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "p-3 cursor-pointer border-b border-slate-100 last:border-0",
                  !notification.read && "bg-slate-50"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="w-full">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "font-medium text-sm truncate",
                        getPriorityColor(notification.priority)
                      )}>
                        {notification.title}
                      </div>
                      <div className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {notification.message}
                      </div>
                    </div>
                    <div className="flex flex-col items-end ml-2">
                      <div className="text-xs text-slate-400">
                        {formatTime(notification.createdAt)}
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-emergency-info rounded-full mt-1"></div>
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
