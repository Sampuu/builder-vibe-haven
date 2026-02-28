import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  Clock, 
  AlertTriangle, 
  Heart, 
  Fire, 
  Shield,
  CheckCircle,
  X,
  ExternalLink,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import NotificationService, { type Notification, type NotificationPriority } from '@/lib/notification-service';

interface NotificationCenterProps {
  compact?: boolean;
  maxHeight?: string;
  className?: string;
}

export default function NotificationCenter({ 
  compact = false, 
  maxHeight = "400px",
  className = "" 
}: NotificationCenterProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    // Load initial notifications
    loadNotifications();

    // Set up real-time listener
    const unsubscribe = NotificationService.subscribeToUserNotifications(user.id, (newNotifications) => {
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.isRead).length);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [user?.id]);

  const loadNotifications = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const userNotifications = await NotificationService.getNotificationsForUser(user.id);
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await NotificationService.markAsRead(notificationId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive" className="text-xs">🚨 Critical</Badge>;
      case 'high':
        return <Badge variant="destructive" className="bg-orange-600 text-xs">⚠️ High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">📋 Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">💬 Low</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">📋 Info</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'help_request_new':
      case 'help_request_updated':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'disaster_report_new':
      case 'disaster_report_updated':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'incident_new':
      case 'incident_updated':
        return <Fire className="h-4 w-4 text-red-600" />;
      case 'news_emergency':
        return <Shield className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`} style={{ maxHeight, overflowY: 'auto' }}>
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="ml-2 text-sm text-gray-600">Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          notifications.slice(0, compact ? 5 : undefined).map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : 'border-gray-200'
              } ${getPriorityColor(notification.priority)}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-3">
                {getTypeIcon(notification.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {notification.title}
                    </h4>
                    {getPriorityBadge(notification.priority)}
                  </div>
                  <p className="text-xs text-gray-700 line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                    {notification.isActionRequired && (
                      <ExternalLink className="h-3 w-3 text-blue-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={loadNotifications} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3" style={{ maxHeight, overflowY: 'auto' }}>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-gray-600">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <Alert>
              <Bell className="h-4 w-4" />
              <AlertDescription>
                No notifications yet. You'll receive alerts for emergency requests and updates relevant to your role.
              </AlertDescription>
            </Alert>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`border transition-all duration-200 hover:shadow-md cursor-pointer ${
                  !notification.isRead 
                    ? 'border-l-4 border-l-blue-500 bg-blue-50/30' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${getPriorityColor(notification.priority)}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {getTypeIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 truncate">
                          {notification.title}
                        </h4>
                        {getPriorityBadge(notification.priority)}
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(notification.createdAt)}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {notification.isActionRequired && (
                            <Badge variant="outline" className="text-xs">
                              Action Required
                            </Badge>
                          )}
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      {notification.data && (
                        <div className="mt-2 text-xs text-gray-600 bg-gray-100 rounded p-2">
                          <strong>Details:</strong> {notification.data.location || notification.data.type || 'Additional info available'}
                        </div>
                      )}
                    </div>
                    
                    {notification.actionUrl && (
                      <ExternalLink className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm" className="text-xs">
              View All Notifications
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook for notification count
export const useNotificationCount = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = NotificationService.subscribeToUserNotifications(user.id, (notifications) => {
      setUnreadCount(notifications.filter(n => !n.isRead).length);
    });

    return unsubscribe;
  }, [user?.id]);

  return unreadCount;
};
