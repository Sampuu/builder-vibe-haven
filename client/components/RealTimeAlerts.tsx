import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock, MapPin, X, Bell } from 'lucide-react';
import { firestoreService, DisasterRequest, NewsAlert } from '@/lib/firestore';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface RealTimeAlertsProps {
  className?: string;
  showDisasterRequests?: boolean;
  showNewsAlerts?: boolean;
  maxAlerts?: number;
}

export default function RealTimeAlerts({
  className = "",
  showDisasterRequests = true,
  showNewsAlerts = true,
  maxAlerts = 5
}: RealTimeAlertsProps) {
  const [disasterRequests, setDisasterRequests] = useState<DisasterRequest[]>([]);
  const [newsAlerts, setNewsAlerts] = useState<NewsAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    let unsubscribeDisasters: (() => void) | undefined;
    let unsubscribeNews: (() => void) | undefined;

    if (showDisasterRequests) {
      unsubscribeDisasters = firestoreService.subscribeToDisasterRequests((requests) => {
        setDisasterRequests(requests.slice(0, maxAlerts));
        
        // Show toast for new high priority requests
        requests.forEach(request => {
          if (request.severity === 'critical' && !dismissedAlerts.has(request.id!)) {
            toast.error(`CRITICAL: ${request.title}`, {
              description: `Location: ${request.location.address}`,
              action: {
                label: "View",
                onClick: () => {/* Navigate to incident */}
              }
            });
          }
        });
      });
    }

    if (showNewsAlerts) {
      unsubscribeNews = firestoreService.subscribeToNews((news) => {
        const relevantNews = news.filter(alert => 
          alert.targetRoles.includes(user?.role || 'user')
        ).slice(0, maxAlerts);
        
        setNewsAlerts(relevantNews);

        // Show toast for critical news
        relevantNews.forEach(alert => {
          if (alert.priority === 'critical' && !dismissedAlerts.has(alert.id!)) {
            toast.error(`EMERGENCY: ${alert.title}`, {
              description: alert.content.slice(0, 100) + '...',
            });
          }
        });
      });
    }

    return () => {
      unsubscribeDisasters?.();
      unsubscribeNews?.();
    };
  }, [showDisasterRequests, showNewsAlerts, maxAlerts, user?.role, dismissedAlerts]);

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-500 text-red-900';
      case 'high': return 'bg-orange-100 border-orange-500 text-orange-900';
      case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      case 'low': return 'bg-green-100 border-green-500 text-green-900';
      default: return 'bg-gray-100 border-gray-500 text-gray-900';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return 'Now';
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const visibleDisasterRequests = disasterRequests.filter(req => 
    !dismissedAlerts.has(req.id!) && req.status === 'pending'
  );

  const visibleNewsAlerts = newsAlerts.filter(alert => 
    !dismissedAlerts.has(alert.id!)
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Disaster Requests */}
      {showDisasterRequests && visibleDisasterRequests.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Active Disaster Reports ({visibleDisasterRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {visibleDisasterRequests.map((request) => (
              <Alert
                key={request.id}
                className={`relative ${getSeverityColor(request.severity)}`}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => dismissAlert(request.id!)}
                >
                  <X className="h-3 w-3" />
                </Button>
                
                <div className="pr-8">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getSeverityColor(request.severity)}>
                      {request.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {request.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(request.createdAt)}
                    </span>
                  </div>
                  
                  <AlertDescription className="font-medium mb-1">
                    {request.title}
                  </AlertDescription>
                  
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {request.location.address}
                  </div>
                  
                  {request.contactNumber && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Contact: {request.contactNumber}
                    </div>
                  )}
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* News Alerts */}
      {showNewsAlerts && visibleNewsAlerts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-500" />
              Emergency Bulletins ({visibleNewsAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {visibleNewsAlerts.map((alert) => (
              <Alert key={alert.id} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => dismissAlert(alert.id!)}
                >
                  <X className="h-3 w-3" />
                </Button>
                
                <div className="pr-8">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getPriorityColor(alert.priority)}>
                      {alert.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {alert.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(alert.publishedAt)}
                    </span>
                  </div>
                  
                  <AlertDescription className="font-medium mb-1">
                    {alert.title}
                  </AlertDescription>
                  
                  <p className="text-xs text-muted-foreground">
                    {alert.content.slice(0, 150)}
                    {alert.content.length > 150 && '...'}
                  </p>
                  
                  {alert.location && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {alert.location}
                    </div>
                  )}
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Alerts Message */}
      {visibleDisasterRequests.length === 0 && visibleNewsAlerts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No active alerts</p>
            <p className="text-xs text-muted-foreground mt-1">
              You'll be notified of any emergency updates
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
