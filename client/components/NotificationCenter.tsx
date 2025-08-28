import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bell, 
  BellRing, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Phone,
  MapPin,
  User,
  X,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { 
  getNotificationsForDepartment, 
  acknowledgeNotification, 
  getNotificationStats,
  Notification,
  DEPARTMENT_CONTACTS
} from '@/lib/notification-service';

interface NotificationCenterProps {
  department: string;
  showUnreadOnly?: boolean;
  maxHeight?: string;
}

export default function NotificationCenter({ 
  department, 
  showUnreadOnly = false, 
  maxHeight = "400px" 
}: NotificationCenterProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [acknowledging, setAcknowledging] = useState(false);

  // Load notifications
  useEffect(() => {
    loadNotifications();
    loadStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadNotifications();
      loadStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [department]);

  const loadNotifications = async () => {
    try {
      const allNotifications = await getNotificationsForDepartment(department as any);
      const filteredNotifications = showUnreadOnly 
        ? allNotifications.filter(n => !n.isRead)
        : allNotifications;
      
      setNotifications(filteredNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const notificationStats = await getNotificationStats(department as any);
      setStats(notificationStats);
    } catch (error) {
      console.error('Failed to load notification stats:', error);
    }
  };

  const handleAcknowledge = async (notification: Notification) => {
    if (!user) return;

    setAcknowledging(true);
    try {
      await acknowledgeNotification(
        notification.id,
        user.id,
        user.name,
        user.role,
        responseMessage
      );
      
      await loadNotifications();
      await loadStats();
      setSelectedNotification(null);
      setResponseMessage('');
    } catch (error) {
      console.error('Failed to acknowledge notification:', error);
    } finally {
      setAcknowledging(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-emergency-danger text-emergency-danger-foreground';
      case 'high': return 'bg-emergency-warning text-emergency-warning-foreground';
      case 'medium': return 'bg-emergency-info text-emergency-info-foreground';
      case 'low': return 'bg-emergency-resolved text-emergency-resolved-foreground';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'incident': return <AlertTriangle className="h-4 w-4" />;
      case 'help_request': return <Phone className="h-4 w-4" />;
      case 'status_update': return <MessageSquare className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Clock className="h-6 w-6 animate-spin text-slate-400" />
            <span className="ml-2 text-slate-600">Loading notifications...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BellRing className="h-5 w-5 text-slate-600" />
              <CardTitle className="text-lg">Emergency Notifications</CardTitle>
              {stats && stats.unread > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {stats.unread} new
                </Badge>
              )}
            </div>
            {stats && (
              <div className="text-sm text-slate-500">
                {stats.total} total | {stats.pending} pending
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-500">
                {showUnreadOnly ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            <div className={`space-y-2 p-4`} style={{ maxHeight, overflowY: 'auto' }}>
              {notifications.map((notification) => {
                const isAcknowledged = notification.acknowledgments.some(
                  ack => ack.userId === user?.id
                );
                
                return (
                  <div
                    key={notification.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      notification.isRead 
                        ? 'bg-slate-50 border-slate-200' 
                        : 'bg-white border-blue-200 shadow-sm'
                    } hover:shadow-md`}
                    onClick={() => setSelectedNotification(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${getSeverityColor(notification.severity)}`}>
                        {getTypeIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-slate-900 truncate">
                            {notification.title}
                          </h4>
                          <Badge 
                            className={getSeverityColor(notification.severity)}
                            variant="secondary"
                          >
                            {notification.severity}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeAgo(notification.timestamps.sent)}</span>
                          </div>
                          
                          {notification.data.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-24">
                                {notification.data.location}
                              </span>
                            </div>
                          )}
                          
                          {notification.data.contactPhone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{notification.data.contactPhone}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-1 text-xs text-slate-500">
                            <User className="h-3 w-3" />
                            <span>From: {notification.sentBy.name}</span>
                          </div>
                          
                          {isAcknowledged ? (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Acknowledged
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending Response
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Detail Dialog */}
      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="max-w-2xl">
          {selectedNotification && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center space-x-2">
                    <div className={`p-2 rounded-full ${getSeverityColor(selectedNotification.severity)}`}>
                      {getTypeIcon(selectedNotification.type)}
                    </div>
                    <span>{selectedNotification.title}</span>
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedNotification(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <DialogDescription>
                  {selectedNotification.type === 'incident' ? 'Emergency Incident Report' : 'Help Request'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Alert Message */}
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="font-medium text-orange-800">
                    Emergency response required - please acknowledge receipt and take appropriate action.
                  </AlertDescription>
                </Alert>

                {/* Notification Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Severity</label>
                    <div className="mt-1">
                      <Badge className={getSeverityColor(selectedNotification.severity)}>
                        {selectedNotification.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-slate-700">Type</label>
                    <div className="mt-1 text-sm text-slate-600">
                      {selectedNotification.type.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700">Location</label>
                    <div className="mt-1 flex items-center space-x-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedNotification.data.location}</span>
                    </div>
                  </div>
                  
                  {selectedNotification.data.contactPhone && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-slate-700">Contact</label>
                      <div className="mt-1 flex items-center space-x-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4" />
                        <span>{selectedNotification.data.contactPhone}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="text-sm font-medium text-slate-700">Details</label>
                  <div className="mt-1 p-3 bg-slate-50 rounded-lg text-sm text-slate-700">
                    {selectedNotification.message}
                  </div>
                </div>

                {/* Acknowledgments */}
                {selectedNotification.acknowledgments.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Department Responses</label>
                    <div className="mt-2 space-y-2">
                      {selectedNotification.acknowledgments.map((ack, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{ack.userName}</span>
                          <span className="text-slate-500">({ack.department})</span>
                          <span className="text-slate-400">
                            acknowledged {formatTimeAgo(ack.acknowledgedAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Response Section */}
                {!selectedNotification.acknowledgments.some(ack => ack.userId === user?.id) && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Your Response (Optional)</label>
                    <Textarea
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      placeholder="Add a response or status update..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  {!selectedNotification.acknowledgments.some(ack => ack.userId === user?.id) ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedNotification(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleAcknowledge(selectedNotification)}
                        disabled={acknowledging}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {acknowledging ? (
                          <>
                            <Clock className="mr-2 h-4 w-4 animate-spin" />
                            Acknowledging...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Acknowledge & Respond
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedNotification(null)}
                    >
                      Close
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Compact notification bell for dashboard headers
export function NotificationBell({ department }: { department: string }) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const notificationStats = await getNotificationStats(department as any);
        setStats(notificationStats);
      } catch (error) {
        console.error('Failed to load notification stats:', error);
      }
    };

    loadStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [department]);

  return (
    <div className="relative">
      <Bell className="h-6 w-6 text-slate-600" />
      {stats && stats.unread > 0 && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {stats.unread > 9 ? '9+' : stats.unread}
        </div>
      )}
    </div>
  );
}
