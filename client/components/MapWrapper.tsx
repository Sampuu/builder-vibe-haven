import React, { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map, Loader } from 'lucide-react';

// Lazy load the EmergencyMap component
const EmergencyMap = React.lazy(() => import('./EmergencyMap'));

interface MapWrapperProps {
  incidents?: any[];
  showRouting?: boolean;
  onIncidentClick?: (incident: any) => void;
  onMapClick?: (coordinates: any) => void;
  center?: any;
  zoom?: number;
  height?: string;
  className?: string;
}

const MapLoadingFallback = () => (
  <Card className="w-full">
    <CardContent className="p-8">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="flex items-center space-x-2">
          <Loader className="h-6 w-6 animate-spin text-blue-500" />
          <Map className="h-6 w-6 text-slate-400" />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-slate-700">Loading Interactive Map...</p>
          <p className="text-sm text-slate-500">Initializing emergency mapping system</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const MapErrorFallback = ({ onRetry }: { onRetry: () => void }) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="text-red-600 flex items-center">
        <Map className="mr-2 h-5 w-5" />
        Map Service Unavailable
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="bg-slate-100 p-6 rounded-lg border-2 border-dashed border-slate-300 text-center">
        <Map className="h-16 w-16 mx-auto mb-4 opacity-50 text-slate-500" />
        <p className="text-lg font-medium text-slate-700 mb-2">Emergency Map Temporarily Unavailable</p>
        <p className="text-sm text-slate-600 mb-4">
          The interactive map service is experiencing technical difficulties. 
          Emergency services remain fully operational.
        </p>
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Try Loading Map Again
        </button>
      </div>
      
      {/* Emergency Contacts Always Available */}
      <div className="mt-4 bg-red-50 p-4 rounded-lg border border-red-200">
        <h3 className="font-medium text-red-800 mb-2">Emergency Contacts</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between items-center">
            <span>Emergency Services:</span>
            <button 
              onClick={() => window.open('tel:911')}
              className="text-red-600 font-medium hover:underline"
            >
              Call 911
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span>Poison Control:</span>
            <button 
              onClick={() => window.open('tel:1-800-222-1222')}
              className="text-blue-600 font-medium hover:underline"
            >
              1-800-222-1222
            </button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function MapWrapper(props: MapWrapperProps) {
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const handleRetry = () => {
    setHasError(false);
    setRetryKey(prev => prev + 1);
  };

  useEffect(() => {
    // Reset error state when retry key changes
    setHasError(false);
  }, [retryKey]);

  if (hasError) {
    return <MapErrorFallback onRetry={handleRetry} />;
  }

  return (
    <div className={props.className} style={{ height: props.height }}>
      <Suspense fallback={<MapLoadingFallback />}>
        <ErrorBoundary onError={() => setHasError(true)}>
          <EmergencyMap key={retryKey} {...props} />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Map component error:', error, errorInfo);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null; // Let parent handle the error display
    }

    return this.props.children;
  }
}
