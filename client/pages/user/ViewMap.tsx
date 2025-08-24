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

const mockIncidents = [
  { id: 1, type: 'fire', location: 'Downtown Plaza', severity: 'high', distance: '0.8 miles' },
  { id: 2, type: 'accident', location: 'Highway 101', severity: 'medium', distance: '2.1 miles' },
  { id: 3, type: 'medical', location: 'Oak Street', severity: 'high', distance: '1.5 miles' },
];

export default function ViewMap() {
  const navigate = useNavigate();
  const [selectedIncident, setSelectedIncident] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

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
            <Card>
              <CardContent className="p-0">
                <div className="relative bg-slate-100 h-96 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <Map className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Interactive Emergency Map</p>
                    <p className="text-sm">Map integration with incident markers will be implemented here</p>
                    <p className="text-sm mt-2">• Red markers: Fire emergencies</p>
                    <p className="text-sm">• Orange markers: Accidents</p>
                    <p className="text-sm">• Blue markers: Medical emergencies</p>
                    <p className="text-sm">• Green zones: Safe areas</p>
                  </div>
                  
                  {/* Map Controls */}
                  <div className="absolute top-4 right-4 flex flex-col space-y-2">
                    <Button size="sm" variant="outline" className="bg-white">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="bg-white">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="bg-white">
                      <Layers className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
