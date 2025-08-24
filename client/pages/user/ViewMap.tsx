import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import EmergencyMap, { IncidentMarker } from '@/components/EmergencyMap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Map,
  ArrowLeft,
  MapPin,
  AlertTriangle,
  Filter,
  Navigation,
  Phone
} from 'lucide-react';
import { Coordinates } from '@/lib/openroute';

// Mock incident data with actual coordinates
const mockIncidents: IncidentMarker[] = [
  {
    id: '1',
    type: 'fire',
    position: { lat: 37.7749, lon: -122.4194 }, // San Francisco
    title: 'Building Fire - Downtown Plaza',
    description: 'Multi-story commercial building fire with potential structural damage',
    severity: 'high',
    timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
  },
  {
    id: '2',
    type: 'accident',
    position: { lat: 37.7849, lon: -122.4094 }, // Near San Francisco
    title: 'Multi-Vehicle Accident - Highway 101',
    description: '3-car collision blocking two lanes, emergency responders on scene',
    severity: 'medium',
    timestamp: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
  },
  {
    id: '3',
    type: 'medical',
    position: { lat: 37.7649, lon: -122.4294 }, // Near San Francisco
    title: 'Medical Emergency - Oak Street',
    description: 'Cardiac arrest reported, ambulance dispatched',
    severity: 'high',
    timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
  },
  {
    id: '4',
    type: 'safe',
    position: { lat: 37.7549, lon: -122.4394 }, // Near San Francisco
    title: 'Evacuation Center - City Hall',
    description: 'Designated safe zone with medical and food assistance',
    severity: 'low',
    timestamp: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
  }
];

export default function ViewMap() {
  const navigate = useNavigate();
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [mapCenter] = useState<Coordinates>({ lat: 37.7749, lon: -122.4194 }); // San Francisco center

  const handleIncidentClick = (incident: IncidentMarker) => {
    setSelectedIncident(incident.id);
  };

  const handleMapClick = (coordinates: Coordinates) => {
    console.log('Map clicked at:', coordinates);
    // Could be used for reporting new incidents
  };

  const getDistanceDisplay = (incident: IncidentMarker) => {
    // Simple distance calculation (this could be enhanced with actual geolocation)
    const distance = Math.sqrt(
      Math.pow((incident.position.lat - mapCenter.lat) * 111, 2) +
      Math.pow((incident.position.lon - mapCenter.lon) * 85, 2)
    );
    return `${distance.toFixed(1)} km`;
  };

  const getTimeAgo = (timestamp?: Date) => {
    if (!timestamp) return 'Unknown time';
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard/user')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                <Map className="mr-3 h-8 w-8 text-emergency-info" />
                Emergency Map
              </h1>
              <p className="text-slate-600">View danger zones and reported incidents in your area</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Map Area */}
          <div className="lg:col-span-3">
            <EmergencyMap
              incidents={mockIncidents}
              showRouting={true}
              onIncidentClick={handleIncidentClick}
              onMapClick={handleMapClick}
              center={mapCenter}
              zoom={12}
              height="500px"
              className="w-full"
            />
          </div>

          {/* Incident List */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nearby Incidents</CardTitle>
                <CardDescription>Active emergencies in your area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockIncidents.map((incident) => (
                    <div 
                      key={incident.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedIncident === incident.id ? 'border-emergency-info bg-emergency-info/5' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                      onClick={() => setSelectedIncident(incident.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className={`h-4 w-4 ${
                            incident.type === 'fire' ? 'text-emergency-danger' :
                            incident.type === 'accident' ? 'text-emergency-warning' : 'text-emergency-info'
                          }`} />
                          <span className="text-sm font-medium capitalize">{incident.type}</span>
                        </div>
                        <Badge className={`text-xs ${
                          incident.severity === 'high' ? 'bg-emergency-danger' : 
                          incident.severity === 'medium' ? 'bg-emergency-warning' : 'bg-emergency-info'
                        } text-white`}>
                          {incident.severity}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-600 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {incident.location}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {incident.distance} away
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Map Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emergency-danger rounded-full"></div>
                    <span className="text-sm">Fire Emergency</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emergency-warning rounded-full"></div>
                    <span className="text-sm">Traffic Accident</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emergency-info rounded-full"></div>
                    <span className="text-sm">Medical Emergency</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emergency-resolved rounded-full"></div>
                    <span className="text-sm">Safe Zone</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="danger" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => navigate('/user/report')}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Report Emergency
                </Button>
                <Button 
                  variant="success" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate('/user/help')}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Request Help
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
