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
            <Card>
              <CardContent className="p-0">
                <div className="relative bg-slate-100 h-96 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <Map className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Police Command Map</p>
                    <p className="text-sm">Real-time unit tracking and incident mapping</p>
                    <div className="mt-4 space-y-1 text-sm">
                      <p>• Blue markers: Police units</p>
                      <p>• Red markers: Active incidents</p>
                      <p>• Green routes: Navigation paths</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  {activeUnits.map((unit) => (
                    <div key={unit.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{unit.id}</span>
                        <Badge className={`text-xs ${
                          unit.status === 'responding' ? 'bg-emergency-danger' :
                          unit.status === 'patrolling' ? 'bg-emergency-warning' : 'bg-emergency-resolved'
                        } text-white`}>
                          {unit.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-600 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {unit.location}
                      </div>
                      {unit.incident && (
                        <div className="text-xs text-slate-500 mt-1">
                          Responding to: {unit.incident}
                        </div>
                      )}
                      <Button size="sm" variant="outline" className="w-full mt-2">
                        <Radio className="mr-2 h-4 w-4" />
                        Contact Unit
                      </Button>
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
                <Button variant="danger" size="sm" className="w-full">
                  <Shield className="mr-2 h-4 w-4" />
                  Dispatch Units
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Navigation className="mr-2 h-4 w-4" />
                  Route Planning
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
