import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell,
  Settings,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Users,
  Database,
  Activity,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import NotificationService from '@/lib/notification-service';
import { firebaseDb } from '@/lib/firebase-db';

interface NotificationStats {
  totalNotifications: number;
  unreadNotifications: number;
  criticalNotifications: number;
  todayNotifications: number;
}

export default function NotificationManager() {
  const { user } = useAuth();
  const [isServiceActive, setIsServiceActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<NotificationStats>({
    totalNotifications: 0,
    unreadNotifications: 0,
    criticalNotifications: 0,
    todayNotifications: 0
  });
  const [serviceStatus, setServiceStatus] = useState<'stopped' | 'starting' | 'running' | 'error'>('stopped');

  useEffect(() => {
    checkServiceStatus();
    loadNotificationStats();
  }, [user?.id]);

  const checkServiceStatus = async () => {
    // In a real app, you'd check if the service is running
    // For now, we'll simulate this
    setServiceStatus('running');
    setIsServiceActive(true);
  };

  const loadNotificationStats = async () => {
    if (!user?.id) return;

    try {
      const notifications = await NotificationService.getNotificationsForUser(user.id, 100);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats: NotificationStats = {
        totalNotifications: notifications.length,
        unreadNotifications: notifications.filter(n => !n.isRead).length,
        criticalNotifications: notifications.filter(n => n.priority === 'critical').length,
        todayNotifications: notifications.filter(n => 
          new Date(n.createdAt) >= today
        ).length
      };

      setStats(stats);
    } catch (error) {
      console.error('Failed to load notification stats:', error);
    }
  };

  const handleStartService = async () => {
    setIsLoading(true);
    setServiceStatus('starting');
    
    try {
      await NotificationService.initialize();
      setIsServiceActive(true);
      setServiceStatus('running');
      await loadNotificationStats();
    } catch (error) {
      console.error('Failed to start notification service:', error);
      setServiceStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopService = () => {
    setIsLoading(true);
    try {
      NotificationService.cleanup();
      setIsServiceActive(false);
      setServiceStatus('stopped');
    } catch (error) {
      console.error('Failed to stop notification service:', error);
      setServiceStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!user?.id) return;

    try {
      await NotificationService.sendCustomNotification(
        user.id,
        '🧪 Test Notification',
        'This is a test notification to verify the system is working correctly.',
        'medium',
        '/dashboard/user'
      );
      
      // Refresh stats after sending test notification
      setTimeout(loadNotificationStats, 1000);
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  };

  const handleCreateSampleData = async () => {
    setIsLoading(true);
    try {
      // Create sample help request to trigger notifications
      const sampleRequest = {
        userId: user?.id || 'sample-user',
        type: 'medical' as const,
        urgency: 'high' as const,
        description: 'Sample medical emergency for notification testing',
        location: '123 Test Street, Sample City',
        contactPhone: '+1-555-0199',
        status: 'submitted' as const
      };

      const result = await firebaseDb.helpRequests.create(sampleRequest);
      if (result.success) {
        alert('Sample help request created! This should trigger notifications to medical staff.');
        setTimeout(loadNotificationStats, 2000);
      }
    } catch (error) {
      console.error('Failed to create sample data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (serviceStatus) {
      case 'running':
        return <Badge variant="default" className="bg-green-100 text-green-800">🟢 Running</Badge>;
      case 'starting':
        return <Badge variant="secondary">🟡 Starting...</Badge>;
      case 'stopped':
        return <Badge variant="outline">⚪ Stopped</Badge>;
      case 'error':
        return <Badge variant="destructive">🔴 Error</Badge>;
      default:
        return <Badge variant="secondary">❓ Unknown</Badge>;
    }
  };

  const getStatusIcon = () => {
    switch (serviceStatus) {
      case 'running':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'starting':
        return <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'stopped':
        return <Pause className="h-5 w-5 text-gray-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification System Management
          </CardTitle>
          <CardDescription>
            Monitor and control the real-time notification service for emergency response
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Service Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <h3 className="font-medium">Notification Service</h3>
                <p className="text-sm text-gray-600">Real-time monitoring and alerts</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge()}
              {serviceStatus === 'stopped' ? (
                <Button 
                  onClick={handleStartService} 
                  disabled={isLoading}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start Service
                </Button>
              ) : (
                <Button 
                  onClick={handleStopService} 
                  disabled={isLoading}
                  size="sm"
                  variant="outline"
                >
                  <Pause className="h-4 w-4 mr-1" />
                  Stop Service
                </Button>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Bell className="h-6 w-6 text-blue-500 mb-2" />
                    <p className="text-sm font-medium">Total</p>
                    <p className="text-2xl font-bold">{stats.totalNotifications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <AlertTriangle className="h-6 w-6 text-yellow-500 mb-2" />
                    <p className="text-sm font-medium">Unread</p>
                    <p className="text-2xl font-bold">{stats.unreadNotifications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Activity className="h-6 w-6 text-red-500 mb-2" />
                    <p className="text-sm font-medium">Critical</p>
                    <p className="text-2xl font-bold">{stats.criticalNotifications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <BarChart3 className="h-6 w-6 text-green-500 mb-2" />
                    <p className="text-sm font-medium">Today</p>
                    <p className="text-2xl font-bold">{stats.todayNotifications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              onClick={handleTestNotification} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Send Test Notification
            </Button>
            
            <Button 
              onClick={handleCreateSampleData} 
              variant="outline"
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <Database className="h-4 w-4" />
              Create Sample Data
            </Button>
            
            <Button 
              onClick={loadNotificationStats} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Stats
            </Button>
          </div>

          {/* Service Info */}
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              <strong>How it works:</strong> The notification service monitors database changes in real-time 
              and automatically sends targeted notifications to the appropriate emergency response teams based 
              on their roles and the type of incident reported.
              
              <div className="mt-3 space-y-1 text-sm">
                <div>• <strong>Medical requests</strong> → Ambulance & Hospital staff</div>
                <div>• <strong>Fire emergencies</strong> → Fire department & Police</div>
                <div>• <strong>Accidents</strong> → Police & Ambulance</div>
                <div>• <strong>Critical alerts</strong> → All emergency responders</div>
              </div>
            </AlertDescription>
          </Alert>

          {serviceStatus === 'error' && (
            <Alert className="border-red-500 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Service Error:</strong> The notification service encountered an error. 
                Try restarting the service or check the browser console for more details.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
