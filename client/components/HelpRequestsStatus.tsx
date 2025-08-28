import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, AlertTriangle, CheckCircle, Database, RefreshCw } from 'lucide-react';
import { firebaseDb } from '@/lib/firebase-db';
import FirebaseBackupService from '@/lib/firebase-backup';

interface HelpRequestsStatusProps {
  compact?: boolean;
  showActions?: boolean;
  className?: string;
}

export default function HelpRequestsStatus({ 
  compact = false, 
  showActions = false,
  className = ""
}: HelpRequestsStatusProps) {
  const [requestCount, setRequestCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    loadStatus();
    
    // Set up real-time listener
    const unsubscribe = firebaseDb.helpRequests.subscribeToHelpRequests((requests) => {
      setRequestCount(requests.length);
      setLastUpdate(new Date());
      setHasError(false);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const result = await firebaseDb.helpRequests.getAll();
      if (result.success) {
        setRequestCount(result.data?.length || 0);
        setHasError(false);
      } else {
        setHasError(true);
      }
    } catch (error) {
      setHasError(true);
      console.error('Failed to load help requests status:', error);
    } finally {
      setIsLoading(false);
      setLastUpdate(new Date());
    }
  };

  const handleRefresh = () => {
    loadStatus();
  };

  const getStatusInfo = () => {
    if (isLoading) {
      return {
        icon: RefreshCw,
        color: 'text-blue-500',
        bgColor: 'bg-blue-100',
        status: 'Loading...',
        badge: 'secondary' as const,
        message: 'Checking collection status'
      };
    }

    if (hasError) {
      return {
        icon: AlertTriangle,
        color: 'text-red-500',
        bgColor: 'bg-red-100',
        status: 'Error',
        badge: 'destructive' as const,
        message: 'Failed to access helpRequests collection'
      };
    }

    if (requestCount === 0) {
      return {
        icon: Database,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100',
        status: 'Empty',
        badge: 'secondary' as const,
        message: 'No help requests found in collection'
      };
    }

    return {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      status: 'Active',
      badge: 'default' as const,
      message: `${requestCount} help request${requestCount !== 1 ? 's' : ''} in collection`
    };
  };

  const statusInfo = getStatusInfo();
  const IconComponent = statusInfo.icon;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <IconComponent className={`h-4 w-4 ${statusInfo.color} ${isLoading ? 'animate-spin' : ''}`} />
        <span className="text-sm font-medium">{requestCount}</span>
        <Badge variant={statusInfo.badge} size="sm">
          {statusInfo.status}
        </Badge>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${statusInfo.bgColor} ${className}`}>
      <div className={`p-2 rounded-full bg-white/50`}>
        <IconComponent className={`h-5 w-5 ${statusInfo.color} ${isLoading ? 'animate-spin' : ''}`} />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-red-500" />
          <span className="font-medium text-gray-900">Help Requests</span>
          <Badge variant={statusInfo.badge}>
            {statusInfo.status}
          </Badge>
        </div>
        <p className="text-sm text-gray-700">{statusInfo.message}</p>
        <p className="text-xs text-gray-500">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </p>
      </div>

      {showActions && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-8"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      )}
    </div>
  );
}

// Hook for using help requests status in other components
export const useHelpRequestsStatus = () => {
  const [status, setStatus] = useState({
    count: 0,
    isLoading: true,
    hasError: false,
    lastUpdate: new Date()
  });

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const result = await firebaseDb.helpRequests.getAll();
        setStatus({
          count: result.success ? (result.data?.length || 0) : 0,
          isLoading: false,
          hasError: !result.success,
          lastUpdate: new Date()
        });
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          isLoading: false,
          hasError: true,
          lastUpdate: new Date()
        }));
      }
    };

    loadStatus();

    // Set up real-time listener
    const unsubscribe = firebaseDb.helpRequests.subscribeToHelpRequests((requests) => {
      setStatus({
        count: requests.length,
        isLoading: false,
        hasError: false,
        lastUpdate: new Date()
      });
    });

    return unsubscribe;
  }, []);

  return status;
};
