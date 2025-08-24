import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Map, AlertTriangle } from 'lucide-react';
import type { EmergencyEntity, Incident } from '@/lib/emergency-data';

// Dynamically import the EmergencyMap component to avoid SSR issues
const EmergencyMap = lazy(() => import('./EmergencyMap'));

interface DynamicEmergencyMapProps {
  height?: string;
  showUserLocation?: boolean;
  showEntities?: boolean;
  showIncidents?: boolean;
  onEntityClick?: (entity: EmergencyEntity) => void;
  onIncidentClick?: (incident: Incident) => void;
  className?: string;
}

// Loading component
const MapLoading = ({ height }: { height: string }) => (
  <div className="relative" style={{ height }}>
    <div className="absolute inset-0 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
      <div className="text-center text-slate-500">
        <Map className="h-12 w-12 mx-auto mb-2 opacity-50 animate-pulse" />
        <p className="font-medium">Loading Map...</p>
        <p className="text-sm">Initializing interactive map components</p>
      </div>
    </div>
  </div>
);

// Error fallback component
const MapError = ({ height, onRetry }: { height: string; onRetry: () => void }) => (
  <div className="relative" style={{ height }}>
    <div className="absolute inset-0 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
      <div className="text-center text-slate-500">
        <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-amber-500" />
        <p className="font-medium text-slate-700">Map Unavailable</p>
        <p className="text-sm mb-3">Unable to load interactive map</p>
        <button 
          onClick={onRetry}
          className="px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded text-sm transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
);

// Error boundary component
class MapErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Map Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default function DynamicEmergencyMap(props: DynamicEmergencyMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapKey, setMapKey] = useState(0); // For forcing re-renders on error

  // Ensure this only renders on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRetry = () => {
    setMapKey(prev => prev + 1);
  };

  // Don't render anything on the server
  if (!isClient) {
    return <MapLoading height={props.height || '400px'} />;
  }

  return (
    <MapErrorBoundary
      fallback={<MapError height={props.height || '400px'} onRetry={handleRetry} />}
    >
      <Suspense fallback={<MapLoading height={props.height || '400px'} />}>
        <EmergencyMap key={mapKey} {...props} />
      </Suspense>
    </MapErrorBoundary>
  );
}
