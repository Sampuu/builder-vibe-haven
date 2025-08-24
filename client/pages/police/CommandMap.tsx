import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import EmergencyMap, { IncidentMarker } from '@/components/EmergencyMap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Map,
  ArrowLeft,
  MapPin,
  Shield,
  Radio,
  Navigation,
  AlertTriangle,
  Car,
  Clock
} from 'lucide-react';
import { Coordinates } from '@/lib/openroute';

// Mock police units with coordinates
const policeUnits = [
  {
    id: 'Unit 12',
    status: 'responding',
    position: { lat: 37.7849, lon: -122.4094 },
    incident: 'Traffic Accident',
    officer: 'Officer Johnson',
    eta: '3 min'
  },
  {
    id: 'Unit 8',
    status: 'patrolling',
    position: { lat: 37.7649, lon: -122.4194 },
    incident: null,
    officer: 'Officer Smith',
    eta: null
  },
  {
    id: 'Unit 15',
    status: 'available',
    position: { lat: 37.7549, lon: -122.4094 },
    incident: null,
    officer: 'Officer Davis',
    eta: null
  },
  {
    id: 'Unit 23',
    status: 'responding',
    position: { lat: 37.7749, lon: -122.4294 },
    incident: 'Domestic Disturbance',
    officer: 'Officer Wilson',
    eta: '7 min'
  }
];

// Mock incidents for police
const policeIncidents: IncidentMarker[] = [
  {
    id: 'INC-001',
    type: 'police',
    position: { lat: 37.7849, lon: -122.4094 },
    title: 'Traffic Accident - Highway 101',
    description: 'Multi-vehicle collision, Unit 12 responding',
    severity: 'medium',
    timestamp: new Date(Date.now() - 15 * 60 * 1000)
  },
  {
    id: 'INC-002',
    type: 'police',
    position: { lat: 37.7749, lon: -122.4294 },
    title: 'Domestic Disturbance - Oak Street',
    description: 'Noise complaint escalated, Unit 23 en route',
    severity: 'high',
    timestamp: new Date(Date.now() - 8 * 60 * 1000)
  },
  {
    id: 'INC-003',
    type: 'fire',
    position: { lat: 37.7649, lon: -122.4394 },
    title: 'Structure Fire - Main Street',
    description: 'Commercial building fire, police support requested',
    severity: 'critical',
    timestamp: new Date(Date.now() - 25 * 60 * 1000)
  }
];

// Create unit markers as incidents for display
const unitMarkers: IncidentMarker[] = policeUnits.map(unit => ({
  id: `unit-${unit.id}`,
  type: 'unit',
  position: unit.position,
  title: `${unit.id} - ${unit.officer}`,
  description: unit.incident ? `Responding to: ${unit.incident}` : `Status: ${unit.status}`,
  severity: unit.status === 'responding' ? 'high' : 'low',
  timestamp: new Date()
}));

export default function CommandMap() {
  const navigate = useNavigate();
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [mapCenter] = useState<Coordinates>({ lat: 37.7749, lon: -122.4194 });

  // Combine incidents and units for map display
  const allMarkers = [...policeIncidents, ...unitMarkers];

  const handleMarkerClick = (marker: IncidentMarker) => {
    if (marker.id.startsWith('unit-')) {
      setSelectedUnit(marker.id);
      setSelectedIncident(null);
    } else {
      setSelectedIncident(marker.id);
      setSelectedUnit(null);
    }
  };

  const handleMapClick = (coordinates: Coordinates) => {
    console.log('Command map clicked at:', coordinates);
    // Could be used for deploying units to specific locations
  };

  const dispatchUnit = (unitId: string, incidentId: string) => {
    console.log(`Dispatching ${unitId} to ${incidentId}`);
    // This would integrate with the backend dispatch system
    alert(`${unitId} has been dispatched to incident ${incidentId}`);
  };

  const contactUnit = (unitId: string) => {
    console.log(`Contacting ${unitId}`);
    // This would open communication channel
    alert(`Opening communication with ${unitId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'responding': return 'bg-emergency-danger';
      case 'patrolling': return 'bg-emergency-warning';
      case 'available': return 'bg-emergency-resolved';
      default: return 'bg-slate-500';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard/police')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Police Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <Map className="mr-3 h-8 w-8 text-emergency-info" />
              Police Command Map
            </h1>
            <p className="text-slate-600">Real-time tracking of units and incidents</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <EmergencyMap
              incidents={allMarkers}
              showRouting={true}
              onIncidentClick={handleMarkerClick}
              onMapClick={handleMapClick}
              center={mapCenter}
              zoom={12}
              height="600px"
              className="w-full"
            />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Active Units
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {policeUnits.map((unit) => (
                    <div
                      key={unit.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedUnit === `unit-${unit.id}` ? 'border-emergency-info bg-emergency-info/5' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                      onClick={() => setSelectedUnit(`unit-${unit.id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium">{unit.id}</span>
                          <div className="text-xs text-slate-500">{unit.officer}</div>
                        </div>
                        <Badge className={`text-xs ${getStatusColor(unit.status)} text-white`}>
                          {unit.status}
                        </Badge>
                      </div>

                      <div className="text-sm text-slate-600 flex items-center mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        {unit.position.lat.toFixed(4)}, {unit.position.lon.toFixed(4)}
                      </div>

                      {unit.incident && (
                        <div className="text-xs text-slate-700 mb-2 p-2 bg-slate-50 rounded">
                          <div className="flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1 text-emergency-danger" />
                            <span className="font-medium">Active Incident</span>
                          </div>
                          <div>{unit.incident}</div>
                          {unit.eta && (
                            <div className="flex items-center mt-1 text-slate-500">
                              <Clock className="h-3 w-3 mr-1" />
                              ETA: {unit.eta}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            contactUnit(unit.id);
                          }}
                        >
                          <Radio className="mr-1 h-3 w-3" />
                          Contact
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            // This would show dispatch options
                            alert(`Dispatch options for ${unit.id}`);
                          }}
                        >
                          <Car className="mr-1 h-3 w-3" />
                          Deploy
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full"
                  onClick={() => alert('Opening dispatch interface...')}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Emergency Dispatch
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => alert('Opening route planning...')}
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  Route Planning
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate('/police/incidents')}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  All Incidents
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {policeIncidents.map((incident) => (
                    <div
                      key={incident.id}
                      className={`p-2 border rounded cursor-pointer transition-colors ${
                        selectedIncident === incident.id ? 'border-emergency-info bg-emergency-info/5' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                      onClick={() => setSelectedIncident(incident.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{incident.id}</span>
                        <Badge className={`text-xs ${
                          incident.severity === 'critical' ? 'bg-red-600' :
                          incident.severity === 'high' ? 'bg-emergency-danger' :
                          'bg-emergency-warning'
                        } text-white`}>
                          {incident.severity}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-600 mb-1">{incident.title}</div>
                      <div className="text-xs text-slate-500">
                        {Math.floor((Date.now() - (incident.timestamp?.getTime() || 0)) / 60000)} min ago
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
