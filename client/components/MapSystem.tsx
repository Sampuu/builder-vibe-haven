import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { AccidentZone, TrackedEntity, RouteResponse } from '@shared/api';
import { 
  MapPin, 
  Search, 
  Navigation, 
  AlertTriangle, 
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  Flame,
  Truck,
  Building2,
  User
} from 'lucide-react';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapSystemProps {
  className?: string;
  height?: string;
  showControls?: boolean;
  defaultCenter?: [number, number];
  defaultZoom?: number;
}

const entityIcons = {
  police: Shield,
  fire: Flame,
  ambulance: Truck,
  hospital: Building2,
  user: User,
};

const entityColors = {
  police: '#dc2626', // red
  fire: '#ea580c', // orange
  ambulance: '#16a34a', // green
  hospital: '#2563eb', // blue
  user: '#6b7280', // gray
};

const severityColors = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#dc2626',
};

// Custom component to handle map updates
function MapController({ 
  center, 
  zoom, 
  routeCoordinates 
}: { 
  center: [number, number]; 
  zoom: number;
  routeCoordinates?: Array<[number, number]>;
}) {
  const map = useMap();
  const routeRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);

  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 0) {
      // Remove existing route
      if (routeRef.current) {
        map.removeLayer(routeRef.current);
      }

      // Add new route
      routeRef.current = L.polyline(routeCoordinates, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.7
      }).addTo(map);

      // Fit map to route bounds
      if (routeCoordinates.length > 1) {
        const bounds = L.latLngBounds(routeCoordinates);
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }

    return () => {
      if (routeRef.current) {
        map.removeLayer(routeRef.current);
      }
    };
  }, [map, routeCoordinates]);

  return null;
}

export default function MapSystem({
  className = '',
  height = '600px',
  showControls = true,
  defaultCenter = [20.5937, 78.9629], // India center
  defaultZoom = 5
}: MapSystemProps) {
  const { user } = useAuth();
  const [accidentZones, setAccidentZones] = useState<AccidentZone[]>([]);
  const [trackedEntities, setTrackedEntities] = useState<TrackedEntity[]>([]);
  const [showDangerZones, setShowDangerZones] = useState(true);
  const [showEntities, setShowEntities] = useState(true);
  const [searchDestination, setSearchDestination] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<RouteResponse | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [mapZoom, setMapZoom] = useState(defaultZoom);

  // Fetch accident zones
  const fetchAccidentZones = async () => {
    try {
      const response = await fetch('/api/accident-zones?active=true', {
        headers: {
          'x-user-id': user?.id || '',
          'x-user-role': user?.role || 'user'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAccidentZones(data.zones);
      } else {
        console.error('Failed to fetch accident zones');
      }
    } catch (error) {
      console.error('Error fetching accident zones:', error);
    }
  };

  // Fetch tracked entities
  const fetchTrackedEntities = async () => {
    try {
      const response = await fetch('/api/entities', {
        headers: {
          'x-user-id': user?.id || '',
          'x-user-role': user?.role || 'user'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTrackedEntities(data.entities);
      } else {
        console.error('Failed to fetch tracked entities');
      }
    } catch (error) {
      console.error('Error fetching tracked entities:', error);
    }
  };

  // Calculate route with danger zone avoidance
  const calculateRoute = async (destination: string) => {
    setIsLoading(true);
    try {
      // For demo, use Delhi as start point
      const startCoords = { lat: 28.6139, lng: 77.2090 };
      
      // Simple geocoding - in production, use a proper geocoding service
      const endCoords = await geocodeDestination(destination);
      
      if (!endCoords) {
        throw new Error('Could not find destination');
      }

      const response = await fetch('/api/routes/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
          'x-user-role': user?.role || 'user'
        },
        body: JSON.stringify({
          start: startCoords,
          end: endCoords,
          avoidZones: true,
          entityType: user?.role || 'user',
          priority: 'normal'
        })
      });

      if (response.ok) {
        const routeData: RouteResponse = await response.json();
        setCurrentRoute(routeData);
        
        // Update map view to show route
        if (routeData.route.coordinates.length > 0) {
          const bounds = L.latLngBounds(
            routeData.route.coordinates.map(coord => [coord[1], coord[0]]) // Convert to [lat, lng]
          );
          setMapCenter([bounds.getCenter().lat, bounds.getCenter().lng]);
          setMapZoom(12);
        }
      } else {
        throw new Error('Failed to calculate route');
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      alert('Failed to calculate route. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Geocoding function using server API
  const geocodeDestination = async (destination: string): Promise<{lat: number; lng: number} | null> => {
    try {
      const response = await fetch(`/api/geocode?query=${encodeURIComponent(destination)}`, {
        headers: {
          'x-user-id': user?.id || '',
          'x-user-role': user?.role || 'user'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.coordinates;
      } else {
        console.error('Geocoding failed');
        return null;
      }
    } catch (error) {
      console.error('Error geocoding destination:', error);
      return null;
    }
  };

  // Recalculate route (useful when danger zones update)
  const recalculateRoute = () => {
    if (searchDestination) {
      calculateRoute(searchDestination);
    }
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchDestination.trim()) {
      calculateRoute(searchDestination.trim());
    }
  };

  // Initialize data
  useEffect(() => {
    fetchAccidentZones();
    fetchTrackedEntities();

    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchAccidentZones();
      fetchTrackedEntities();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  // Custom marker icons for different entity types
  const createEntityIcon = (entity: TrackedEntity) => {
    const IconComponent = entityIcons[entity.type];
    const color = entityColors[entity.type];
    
    return L.divIcon({
      html: `
        <div style="
          background: ${color}; 
          border-radius: 50%; 
          width: 30px; 
          height: 30px; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L12 2C10.34 2 9 3.34 9 5C9 6.66 10.34 8 12 8C13.66 8 15 6.66 15 5C15 3.34 13.66 2 12 2Z"/>
          </svg>
        </div>
      `,
      className: '',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  return (
    <div className={`w-full ${className}`}>
      {showControls && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Emergency Response Map
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Navigation */}
            <div className="flex space-x-2">
              <form onSubmit={handleSearch} className="flex-1 flex space-x-2">
                <Input
                  placeholder="Enter destination (e.g., Mumbai, Delhi, Bangalore)"
                  value={searchDestination}
                  onChange={(e) => setSearchDestination(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </form>
              <Button 
                variant="outline" 
                onClick={recalculateRoute}
                disabled={!currentRoute || isLoading}
              >
                <Navigation className="h-4 w-4" />
              </Button>
            </div>

            {/* Map Controls */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="danger-zones"
                  checked={showDangerZones}
                  onCheckedChange={setShowDangerZones}
                />
                <Label htmlFor="danger-zones" className="flex items-center">
                  {showDangerZones ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                  Danger Zones
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="entities"
                  checked={showEntities}
                  onCheckedChange={setShowEntities}
                />
                <Label htmlFor="entities" className="flex items-center">
                  {showEntities ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                  Response Units
                </Label>
              </div>

              <Badge variant="outline" className="flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {accidentZones.length} Active Zones
              </Badge>

              <Badge variant="outline" className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {trackedEntities.filter(e => e.status !== 'offline').length} Units Online
              </Badge>
            </div>

            {/* Route Information */}
            {currentRoute && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Route Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-blue-600">Distance:</span>
                    <div className="font-medium">{(currentRoute.route.distance / 1000).toFixed(1)} km</div>
                  </div>
                  <div>
                    <span className="text-blue-600">Duration:</span>
                    <div className="font-medium">{Math.round(currentRoute.route.duration / 60)} min</div>
                  </div>
                  <div>
                    <span className="text-blue-600">Avoided Zones:</span>
                    <div className="font-medium">{currentRoute.avoidedZones.length}</div>
                  </div>
                  <div>
                    <span className="text-blue-600">Status:</span>
                    <div className="font-medium text-green-600">Optimal Route</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Map Container */}
      <div style={{ height }} className="w-full border rounded-lg overflow-hidden">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          <MapController 
            center={mapCenter} 
            zoom={mapZoom} 
            routeCoordinates={currentRoute?.route.coordinates.map(coord => [coord[1], coord[0]])}
          />

          {/* Accident Zones */}
          {showDangerZones && accidentZones.map((zone) => (
            <Circle
              key={zone.id}
              center={[zone.latitude, zone.longitude]}
              radius={zone.radius}
              pathOptions={{
                color: severityColors[zone.severity],
                fillColor: severityColors[zone.severity],
                fillOpacity: 0.3,
                weight: 2,
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-gray-900">{zone.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{zone.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={zone.severity === 'critical' || zone.severity === 'high' ? 'destructive' : 'secondary'}
                    >
                      {zone.severity.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500">{zone.type}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Radius: {zone.radius}m
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}

          {/* Tracked Entities */}
          {showEntities && trackedEntities
            .filter(entity => entity.status !== 'offline')
            .map((entity) => (
            <Marker
              key={entity.id}
              position={[entity.latitude, entity.longitude]}
              icon={createEntityIcon(entity)}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <h3 className="font-bold text-gray-900">{entity.name}</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <Badge variant="outline">{entity.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge 
                        variant={entity.status === 'responding' ? 'destructive' : 'secondary'}
                      >
                        {entity.status}
                      </Badge>
                    </div>
                    {entity.speed !== undefined && (
                      <div className="flex justify-between">
                        <span>Speed:</span>
                        <span>{entity.speed} km/h</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      Last update: {new Date(entity.lastUpdate).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
