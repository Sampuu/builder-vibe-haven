import React, { useState, useEffect, Suspense } from 'react';
import { MapPin, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Type definition for map incidents
export interface MapIncident {
  id: string;
  type: 'fire' | 'medical' | 'accident' | 'police';
  title: string;
  location: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  time: string;
  assignedTo?: string;
}

interface SafeInteractiveMapProps {
  incidents: MapIncident[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onIncidentClick?: (incident: MapIncident) => void;
  showUserLocation?: boolean;
}

// Lazy load the actual map component to prevent React context issues
const LazyInteractiveMap = React.lazy(() => 
  import('./InteractiveMap').then(module => ({
    default: module.default
  })).catch((error) => {
    console.warn('Failed to load map component:', error);
    return {
      default: ({ incidents, height = '400px', onIncidentClick }: SafeInteractiveMapProps) => (
        <MapFallback incidents={incidents} height={height} onIncidentClick={onIncidentClick} />
      )
    };
  })
);

// Fallback component when map fails to load
function MapFallback({ incidents, height = '400px', onIncidentClick }: SafeInteractiveMapProps) {
  return (
    <div style={{ height, width: '100%' }} className="bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-slate-500">
          <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Map Unavailable</p>
          <p className="text-sm mb-4">Interactive map could not be loaded</p>
          <p className="text-xs">Showing incident list instead</p>
        </div>
      </div>
      
      {/* Show incidents as a list when map is unavailable */}
      {incidents.length > 0 && (
        <div className="p-4 border-t border-slate-300 max-h-32 overflow-y-auto">
          <div className="text-xs font-medium text-slate-700 mb-2">Incidents ({incidents.length})</div>
          <div className="space-y-1">
            {incidents.slice(0, 5).map((incident) => (
              <div 
                key={incident.id}
                className="text-xs p-2 bg-white rounded border cursor-pointer hover:bg-slate-50"
                onClick={() => onIncidentClick?.(incident)}
              >
                <div className="font-medium">{incident.title}</div>
                <div className="text-slate-600">{incident.location}</div>
              </div>
            ))}
            {incidents.length > 5 && (
              <div className="text-xs text-slate-500 text-center py-1">
                +{incidents.length - 5} more incidents
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Loading component for the map
function MapLoading({ height = '400px' }: { height?: string }) {
  return (
    <div style={{ height, width: '100%' }} className="bg-slate-50 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-slate-400" />
        <p className="text-slate-600">Loading map...</p>
      </div>
    </div>
  );
}

// Main safe map component
const SafeInteractiveMap: React.FC<SafeInteractiveMapProps> = (props) => {
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Ensure we're on the client side
    setIsClient(true);
  }, []);

  // Don't render the map until we're on the client side
  if (!isClient) {
    return <MapLoading height={props.height} />;
  }

  if (hasError) {
    return <MapFallback {...props} />;
  }

  return (
    <Suspense fallback={<MapLoading height={props.height} />}>
      <ErrorBoundary onError={() => setHasError(true)}>
        <LazyInteractiveMap {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

// Simple error boundary for the map
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('Map component error caught:', error);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null; // Will trigger the fallback in the parent
    }

    return this.props.children;
  }
}

export default SafeInteractiveMap;
export type { SafeInteractiveMapProps };
