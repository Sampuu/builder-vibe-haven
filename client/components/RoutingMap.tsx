import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import ORSRoute from './ORSRoute';
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
  Gauge,
  Loader
} from 'lucide-react';
import { geocodeAddress, reverseGeocode, OPENROUTE_API_KEY } from '@/lib/openroute';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface RoutingMapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  showControls?: boolean;
  startCoords?: [number, number];
  endCoords?: [number, number];
  onRouteCalculated?: (distance: number, duration: number) => void;
  className?: string;
}

export default function RoutingMap({
  center = [27.7172, 85.3240], // Default to Kathmandu, Nepal (from user's example)
  zoom = 13,
  height = '500px',
  showControls = true,
  startCoords,
  endCoords,
  onRouteCalculated,
  className = ''
}: RoutingMapProps) {
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [startPosition, setStartPosition] = useState<[number, number] | null>(startCoords || null);
  const [endPosition, setEndPosition] = useState<[number, number] | null>(endCoords || null);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update positions when props change
  useEffect(() => {
    if (startCoords) setStartPosition(startCoords);
    if (endCoords) setEndPosition(endCoords);
  }, [startCoords, endCoords]);

  const handleGeocode = async (address: string, isStart: boolean) => {
    try {
      setLoading(true);
      setError('');
      
      const coords = await geocodeAddress(address);
      const position: [number, number] = [coords.lat, coords.lon];
      
      if (isStart) {
        setStartPosition(position);
      } else {
        setEndPosition(position);
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
      setError(`Failed to find location: ${address}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateRoute = async () => {
    if (!startAddress || !endAddress) {
      setError('Please enter both start and destination addresses');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Geocode both addresses
      const [startCoords, endCoords] = await Promise.all([
        geocodeAddress(startAddress),
        geocodeAddress(endAddress)
      ]);

      setStartPosition([startCoords.lat, startCoords.lon]);
      setEndPosition([endCoords.lat, endCoords.lon]);
    } catch (error) {
      console.error('Route calculation failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to calculate route');
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    const position: [number, number] = [lat, lng];

    try {
      const address = await reverseGeocode(lat, lng);
      
      if (!startPosition) {
        setStartPosition(position);
        setStartAddress(address);
      } else if (!endPosition) {
        setEndPosition(position);
        setEndAddress(address);
      } else {
        // Reset and start over
        setStartPosition(position);
        setEndPosition(null);
        setStartAddress(address);
        setEndAddress('');
        setRouteInfo(null);
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
  };

  const handleRouteCalculated = (distance: number, duration: number) => {
    setRouteInfo({ distance, duration });
    if (onRouteCalculated) {
      onRouteCalculated(distance, duration);
    }
  };

  const handleRouteError = (errorMessage: string) => {
    setError(errorMessage);
    setRouteInfo(null);
  };

  const clearRoute = () => {
    setStartPosition(null);
    setEndPosition(null);
    setStartAddress('');
    setEndAddress('');
    setRouteInfo(null);
    setError('');
  };

  const MapClickHandler = () => {
    const map = L.useMap();
    
    useEffect(() => {
      const onClick = (e: L.LeafletMouseEvent) => handleMapClick(e);
      map.on('click', onClick);
      return () => {
        map.off('click', onClick);
      };
    }, [map]);

    return null;
  };

  return (
    <div className={`routing-map ${className}`}>
      {/* Route Controls */}
      {showControls && (
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
                <Label htmlFor="start">Start Location</Label>
                <Input
                  id="start"
                  value={startAddress}
                  onChange={(e) => setStartAddress(e.target.value)}
                  placeholder="Enter start location"
                  onKeyPress={(e) => e.key === 'Enter' && handleGeocode(startAddress, true)}
                />
              </div>
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={endAddress}
                  onChange={(e) => setEndAddress(e.target.value)}
                  placeholder="Enter destination"
                  onKeyPress={(e) => e.key === 'Enter' && handleGeocode(endAddress, false)}
                />
              </div>
              <Button 
                onClick={handleCalculateRoute} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Route className="mr-2 h-4 w-4" />
                    Calculate Route
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={clearRoute}
                className="w-full"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Route
              </Button>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <p className="text-sm text-gray-600 mt-2">
              💡 Tip: Click on the map to set start and destination points
            </p>
          </CardContent>
        </Card>
      )}

      {/* Route Information */}
      {routeInfo && (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center">
                <Route className="mr-2 h-4 w-4" />
                Route Information
              </h3>
              <div className="flex space-x-4">
                <Badge variant="outline" className="flex items-center">
                  <Gauge className="mr-1 h-3 w-3" />
                  {routeInfo.distance.toFixed(2)} km
                </Badge>
                <Badge variant="outline" className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {Math.round(routeInfo.duration)} min
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Container */}
      <div style={{ height, width: '100%' }}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg border"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapClickHandler />
          
          {/* Start Marker */}
          {startPosition && (
            <Marker 
              position={startPosition}
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
                  {startAddress || `${startPosition[0].toFixed(6)}, ${startPosition[1].toFixed(6)}`}
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* End Marker */}
          {endPosition && (
            <Marker 
              position={endPosition}
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
                  {endAddress || `${endPosition[0].toFixed(6)}, ${endPosition[1].toFixed(6)}`}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Route Layer */}
          {startPosition && endPosition && (
            <ORSRoute
              start={startPosition}
              end={endPosition}
              onRouteCalculated={handleRouteCalculated}
              onError={handleRouteError}
              routeColor="#2563eb"
              routeWeight={5}
              routeOpacity={0.8}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
