import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Navigation, 
  MapPin, 
  Route, 
  AlertTriangle,
  X,
  Clock,
  Gauge
} from 'lucide-react';
import { 
  geocodeAddress, 
  getRoute, 
  reverseGeocode, 
  Coordinates, 
  RouteData,
  INCIDENT_TYPES,
  IncidentType 
} from '@/lib/openroute';

// Fix for default Leaflet marker icons in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export interface IncidentMarker {
  id: string;
  type: IncidentType;
  position: Coordinates;
  title: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  timestamp?: Date;
}

export interface EmergencyMapProps {
  incidents?: IncidentMarker[];
  showRouting?: boolean;
  showIncidentForm?: boolean;
  onIncidentClick?: (incident: IncidentMarker) => void;
  onMapClick?: (coordinates: Coordinates) => void;
  center?: Coordinates;
  zoom?: number;
  height?: string;
  className?: string;
}

interface RouteDisplayProps {
  routeData: RouteData | null;
  onClear: () => void;
}

const RouteDisplay: React.FC<RouteDisplayProps> = ({ routeData, onClear }) => {
  if (!routeData) return null;

  const route = routeData.features[0];
  const segment = route.properties.segments[0];
  const distance = (segment.distance / 1000).toFixed(1); // Convert to km
  const duration = Math.round(segment.duration / 60); // Convert to minutes

  return (
    <Card className="absolute top-4 left-4 z-[1000] w-80">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <Route className="mr-2 h-4 w-4" />
            Route Information
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between text-sm">
          <div className="flex items-center">
            <Gauge className="mr-1 h-3 w-3" />
            <span>{distance} km</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            <span>{duration} min</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RouteLayer: React.FC<{ routeData: RouteData | null }> = ({ routeData }) => {
  const map = useMap();

  useEffect(() => {
    if (!routeData) return;

    const route = routeData.features[0];
    const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]] as [number, number]);
    
    const routeLine = L.polyline(coordinates, {
      color: '#2563eb',
      weight: 5,
      opacity: 0.8
    }).addTo(map);

    // Fit map to route bounds
    const bounds = routeLine.getBounds();
    map.fitBounds(bounds, { padding: [20, 20] });

    return () => {
      map.removeLayer(routeLine);
    };
  }, [routeData, map]);

  return null;
};

const createCustomIcon = (type: IncidentType) => {
  const { color } = INCIDENT_TYPES[type];
  
  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

export default function EmergencyMap({
  incidents = [],
  showRouting = true,
  showIncidentForm = false,
  onIncidentClick,
  onMapClick,
  center = { lat: 20, lon: 0 },
  zoom = 2,
  height = '400px',
  className = ''
}: EmergencyMapProps) {
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [markers, setMarkers] = useState<{ start?: Coordinates; end?: Coordinates }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clickPosition, setClickPosition] = useState<Coordinates | null>(null);

  const handleCalculateRoute = async () => {
    if (!startAddress || !endAddress) {
      setError('Please enter both start and destination addresses');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const startCoords = await geocodeAddress(startAddress);
      const endCoords = await geocodeAddress(endAddress);
      
      setMarkers({ start: startCoords, end: endCoords });
      
      const route = await getRoute(startCoords, endCoords);
      setRouteData(route);
    } catch (error) {
      console.error('Route calculation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to calculate route');
    } finally {
      setLoading(false);
    }
  };

  const handleClearRoute = () => {
    setRouteData(null);
    setMarkers({});
    setStartAddress('');
    setEndAddress('');
    setError('');
  };

  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    const coordinates = { lat, lon: lng };
    
    setClickPosition(coordinates);
    
    if (onMapClick) {
      onMapClick(coordinates);
    }

    // Auto-fill address for routing
    if (showRouting) {
      try {
        const address = await reverseGeocode(lat, lng);
        if (!startAddress) {
          setStartAddress(address);
        } else if (!endAddress) {
          setEndAddress(address);
        }
      } catch (error) {
        console.error('Reverse geocoding failed:', error);
      }
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Routing Controls */}
      {showRouting && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Navigation className="mr-2 h-5 w-5" />
              Route Planning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <Label htmlFor="start">Start Address</Label>
                <Input
                  id="start"
                  value={startAddress}
                  onChange={(e) => setStartAddress(e.target.value)}
                  placeholder="Enter start location"
                />
              </div>
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={endAddress}
                  onChange={(e) => setEndAddress(e.target.value)}
                  placeholder="Enter destination"
                />
              </div>
              <Button 
                onClick={handleCalculateRoute} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Calculating...' : 'Calculate Route'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClearRoute}
                className="w-full"
              >
                Clear Route
              </Button>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <p className="text-sm text-gray-600 mt-2">
              💡 Tip: Click on the map to auto-fill addresses
            </p>
          </CardContent>
        </Card>
      )}

      {/* Map Container */}
      <div className="relative">
        <MapContainer
          center={[center.lat, center.lon]}
          zoom={zoom}
          style={{ height, width: '100%' }}
          className="rounded-lg border"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Route Layer */}
          <RouteLayer routeData={routeData} />
          
          {/* Route Markers */}
          {markers.start && (
            <Marker 
              position={[markers.start.lat, markers.start.lon]}
              icon={L.divIcon({
                html: '<div style="background-color: #22c55e; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                className: 'custom-marker',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })}
            >
              <Popup>
                <div>
                  <strong>Start Location</strong>
                  <br />
                  {startAddress || `${markers.start.lat.toFixed(6)}, ${markers.start.lon.toFixed(6)}`}
                </div>
              </Popup>
            </Marker>
          )}
          
          {markers.end && (
            <Marker 
              position={[markers.end.lat, markers.end.lon]}
              icon={L.divIcon({
                html: '<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                className: 'custom-marker',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })}
            >
              <Popup>
                <div>
                  <strong>Destination</strong>
                  <br />
                  {endAddress || `${markers.end.lat.toFixed(6)}, ${markers.end.lon.toFixed(6)}`}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Incident Markers */}
          {incidents.map((incident) => (
            <Marker
              key={incident.id}
              position={[incident.position.lat, incident.position.lon]}
              icon={createCustomIcon(incident.type)}
              eventHandlers={{
                click: () => onIncidentClick?.(incident)
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <strong>{incident.title}</strong>
                    {incident.severity && (
                      <Badge className={`text-xs text-white ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    Type: {INCIDENT_TYPES[incident.type].label}
                  </div>
                  {incident.description && (
                    <div className="text-sm text-gray-700 mb-2">
                      {incident.description}
                    </div>
                  )}
                  {incident.timestamp && (
                    <div className="text-xs text-gray-500">
                      {incident.timestamp.toLocaleString()}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Click Position Marker */}
          {clickPosition && !markers.start && !markers.end && (
            <Marker 
              position={[clickPosition.lat, clickPosition.lon]}
              icon={L.divIcon({
                html: '<div style="background-color: #3b82f6; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                className: 'custom-marker',
                iconSize: [15, 15],
                iconAnchor: [7, 7]
              })}
            >
              <Popup>
                <div>
                  <strong>Selected Location</strong>
                  <br />
                  {clickPosition.lat.toFixed(6)}, {clickPosition.lon.toFixed(6)}
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Map Click Handler */}
          <MapClickHandler onClick={handleMapClick} />
        </MapContainer>

        {/* Route Information Overlay */}
        <RouteDisplay routeData={routeData} onClear={handleClearRoute} />
      </div>
    </div>
  );
}

// Helper component to handle map clicks
const MapClickHandler: React.FC<{ onClick: (e: L.LeafletMouseEvent) => void }> = ({ onClick }) => {
  const map = useMap();

  useEffect(() => {
    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
    };
  }, [map, onClick]);

  return null;
};
