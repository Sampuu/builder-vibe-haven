import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface NetworkStatusProps {
  onRetry?: () => void;
  showRetryButton?: boolean;
  className?: string;
}

export default function NetworkStatus({ 
  onRetry, 
  showRetryButton = false, 
  className = "" 
}: NetworkStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineAlert(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setShowOfflineAlert(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    }
  };

  if (!showOfflineAlert && isOnline) {
    return null;
  }

  return (
    <Alert className={`border-emergency-warning bg-emergency-warning/5 ${className}`}>
      {isOnline ? (
        <Wifi className="h-4 w-4 text-emergency-resolved" />
      ) : (
        <WifiOff className="h-4 w-4 text-emergency-warning" />
      )}
      <AlertDescription className="text-emergency-warning">
        <div className="flex items-center justify-between">
          <div>
            {isOnline 
              ? "Connection restored. You can continue using the app."
              : "No internet connection. Please check your network settings."
            }
          </div>
          {showRetryButton && onRetry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
              className="ml-2 text-xs"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Retry
                </>
              )}
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

// Hook for checking network connectivity
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'poor' | 'offline'>('good');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkConnectivity = async (): Promise<boolean> => {
    if (!navigator.onLine) {
      setConnectionQuality('offline');
      return false;
    }

    try {
      const start = Date.now();
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      const duration = Date.now() - start;
      
      if (duration > 3000) {
        setConnectionQuality('poor');
      } else {
        setConnectionQuality('good');
      }
      
      return true;
    } catch {
      setConnectionQuality('offline');
      return false;
    }
  };

  return {
    isOnline,
    connectionQuality,
    checkConnectivity
  };
};
