import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  getCurrentLocation, 
  LocationCoordinates, 
  DEFAULT_LOCATION,
  calculateDistance,
  formatDistance,
  getDirectionsUrl 
} from '@/lib/geolocation';
import { 
  emergencyEntities, 
  currentIncidents, 
  EmergencyEntity, 
  Incident,
  getEntityTypeColor,
  getIncidentTypeColor,
  getSeverityColor,
  getEntityIcon,
  getIncidentIcon
} from '@/lib/emergency-data';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Clock,
  AlertTriangle,
  Crosshair
} from 'lucide-react';

interface EmergencyMapProps {
  height?: string;
  showUserLocation?: boolean;
  showEntities?: boolean;
  showIncidents?: boolean;
  onEntityClick?: (entity: EmergencyEntity) => void;
  onIncidentClick?: (incident: Incident) => void;
  className?: string;
}

// Component to update map view when user location changes
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

// Component to handle map click events
function MapEventHandler({ onMapClick }: { onMapClick?: (latlng: LocationCoordinates) => void }) {
  const map = useMap();
  
  useEffect(() => {
    if (onMapClick) {
      const handleClick = (e: any) => {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      };
      
      map.on('click', handleClick);
      return () => {
        map.off('click', handleClick);
      };
    }
  }, [map, onMapClick]);
  
  return null;
}

export default function EmergencyMap({
  height = '400px',
  showUserLocation = true,
  showEntities = true,
  showIncidents = true,
  onEntityClick,
  onIncidentClick,
  className = ''
}: EmergencyMapProps) {
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng]);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<EmergencyEntity | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const mapRef = useRef<any>(null);

  // Get user location on component mount
  useEffect(() => {
    if (showUserLocation) {
      getCurrentLocation().then((result) => {
        if (result.success && result.coordinates) {
          setUserLocation(result.coordinates);
          setMapCenter([result.coordinates.lat, result.coordinates.lng]);
          setLocationError(null);
        } else {
          setLocationError(result.error?.message || 'Failed to get location');
          // Use default location if geolocation fails
          setMapCenter([DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng]);
        }
      });
    }
  }, [showUserLocation]);

  // Create custom icons
  const createCustomIcon = (color: string, icon: string, size: 'small' | 'medium' | 'large' = 'medium') => {
    const sizes = {
      small: { width: 25, height: 25, fontSize: '12px' },
      medium: { width: 35, height: 35, fontSize: '16px' },
      large: { width: 45, height: 45, fontSize: '20px' }
    };
    
    const { width, height, fontSize } = sizes[size];
    
    return divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: ${width}px;
          height: ${height}px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${fontSize};
          color: white;
          font-weight: bold;
        ">${icon}</div>
      `,
      className: 'custom-marker',
      iconSize: [width, height],
      iconAnchor: [width / 2, height / 2]
    });
  };

  const userIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3B82F6">
        <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
      </svg>
    `),
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  const handleEntityClick = (entity: EmergencyEntity) => {
    setSelectedEntity(entity);
    setSelectedIncident(null);
    onEntityClick?.(entity);
  };

  const handleIncidentClick = (incident: Incident) => {
    setSelectedIncident(incident);
    setSelectedEntity(null);
    onIncidentClick?.(incident);
  };

  const navigateToLocation = (coordinates: LocationCoordinates) => {
    if (userLocation) {
      const url = getDirectionsUrl(userLocation, coordinates);
      window.open(url, '_blank');
    }
  };

  const centerOnUser = () => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
    }
  };

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {/* Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <ChangeView center={mapCenter} zoom={13} />
        
        {/* Base Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker */}
        {showUserLocation && userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>
                <div className="text-center">
                  <h3 className="font-semibold text-blue-600">Your Location</h3>
                  <p className="text-sm text-gray-600">
                    {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
            
            {/* User location radius circle */}
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={1000} // 1km radius
              pathOptions={{
                fillColor: '#3B82F6',
                fillOpacity: 0.1,
                color: '#3B82F6',
                weight: 2,
                opacity: 0.5
              }}
            />
          </>
        )}

        {/* Emergency Entities Markers */}
        {showEntities && emergencyEntities.map((entity) => (
          <Marker
            key={entity.id}
            position={[entity.coordinates.lat, entity.coordinates.lng]}
            icon={createCustomIcon(getEntityTypeColor(entity.type), getEntityIcon(entity.type))}
            eventHandlers={{
              click: () => handleEntityClick(entity)
            }}
          >
            <Popup>
              <div className="max-w-xs">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{entity.name}</h3>
                  <Badge 
                    className={`ml-2 text-xs ${
                      entity.status === 'active' ? 'bg-green-500' :
                      entity.status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                    } text-white`}
                  >
                    {entity.status}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {entity.address}
                  </p>
                  <p className="flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    {entity.phone}
                  </p>
                  {userLocation && (
                    <p className="text-blue-600 font-medium">
                      {formatDistance(calculateDistance(userLocation, entity.coordinates))} away
                    </p>
                  )}
                </div>
                
                {entity.specialties && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-700">Specialties:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {entity.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-3 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(`tel:${entity.phone}`, '_self')}
                    className="flex-1"
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Call
                  </Button>
                  {userLocation && (
                    <Button 
                      size="sm" 
                      variant="info"
                      onClick={() => navigateToLocation(entity.coordinates)}
                      className="flex-1"
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      Navigate
                    </Button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Incident Markers */}
        {showIncidents && currentIncidents.map((incident) => (
          <Marker
            key={incident.id}
            position={[incident.coordinates.lat, incident.coordinates.lng]}
            icon={createCustomIcon(
              getIncidentTypeColor(incident.type), 
              getIncidentIcon(incident.type),
              incident.severity === 'critical' ? 'large' : 'medium'
            )}
            eventHandlers={{
              click: () => handleIncidentClick(incident)
            }}
          >
            <Popup>
              <div className="max-w-xs">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                  <Badge 
                    style={{ backgroundColor: getSeverityColor(incident.severity) }}
                    className="ml-2 text-xs text-white"
                  >
                    {incident.severity}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {incident.address}
                  </p>
                  <p className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Reported {new Date(incident.reportedAt).toLocaleTimeString()}
                  </p>
                  {userLocation && (
                    <p className="text-blue-600 font-medium">
                      {formatDistance(calculateDistance(userLocation, incident.coordinates))} away
                    </p>
                  )}
                </div>
                
                {incident.respondingUnits && incident.respondingUnits.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-700">Responding Units:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {incident.respondingUnits.map((unit, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {unit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {incident.estimatedResolution && (
                  <p className="text-xs text-green-600 mt-2">
                    Est. resolution: {incident.estimatedResolution}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
        {showUserLocation && userLocation && (
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-white shadow-lg"
            onClick={centerOnUser}
            title="Center on your location"
          >
            <Crosshair className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Location Error */}
      {locationError && (
        <div className="absolute top-4 left-4 z-[1000]">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center text-amber-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span className="text-sm">{locationError}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
