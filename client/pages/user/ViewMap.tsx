import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import MapSystem from '@/components/MapSystem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { Incident } from '@shared/api';
import {
  Map,
  ArrowLeft,
  MapPin,
  AlertTriangle
} from 'lucide-react';

export default function ViewMap() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);

  // Fetch incidents
  const fetchIncidents = async () => {
    try {
      const response = await fetch('/api/incidents', {
        headers: {
          'x-user-id': user?.id || '',
          'x-user-role': user?.role || 'user'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIncidents(data.incidents || []);
      } else {
        console.error('Failed to fetch incidents');
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
    }
  };

  useEffect(() => {
    fetchIncidents();
    // Set up polling for real-time updates
    const interval = setInterval(fetchIncidents, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const getIncidentDistance = (incident: Incident): string => {
    // Mock distance calculation - in production, use user's location
    return `${(Math.random() * 5 + 0.5).toFixed(1)} miles`;
  };

  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const incidentTime = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - incidentTime.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
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
              <p className="text-slate-600">View danger zones, navigate safely, and track emergency response units</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Map Area */}
          <div className="lg:col-span-3">
            <MapSystem
              height="700px"
              showControls={true}
              defaultCenter={[20.5937, 78.9629]}
              defaultZoom={5}
            />
          </div>

          {/* Incident List */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Incidents</CardTitle>
                <CardDescription>
                  {incidents.length} active emergencies reported
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {incidents.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No active incidents</p>
                    </div>
                  ) : (
                    incidents.slice(0, 10).map((incident) => (
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
                              incident.type === 'accident' ? 'text-emergency-warning' :
                              incident.type === 'medical' ? 'text-emergency-info' : 'text-slate-500'
                            }`} />
                            <span className="text-sm font-medium capitalize">{incident.type}</span>
                          </div>
                          <Badge variant={
                            incident.urgency === 'critical' || incident.urgency === 'high' ? 'destructive' : 'secondary'
                          }>
                            {incident.urgency}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600 flex items-center mb-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {incident.location}
                        </div>
                        <div className="text-xs text-slate-500 flex justify-between">
                          <span>{getIncidentDistance(incident)} away</span>
                          <span>{getTimeAgo(incident.timestamp)}</span>
                        </div>
                        {incident.status !== 'submitted' && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {incident.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Map Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm font-medium text-slate-700 mb-2">Danger Zones</div>
                  <div className="space-y-2 ml-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 border-2 border-red-500 bg-red-500/30 rounded-full"></div>
                      <span className="text-sm">Critical - Avoid area</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 border-2 border-orange-500 bg-orange-500/30 rounded-full"></div>
                      <span className="text-sm">High - Use caution</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 border-2 border-yellow-500 bg-yellow-500/30 rounded-full"></div>
                      <span className="text-sm">Medium - Minor delays</span>
                    </div>
                  </div>

                  <div className="text-sm font-medium text-slate-700 mb-2 mt-4">Response Units</div>
                  <div className="space-y-2 ml-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                      <span className="text-sm">Police Units</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                      <span className="text-sm">Fire Department</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <span className="text-sm">Ambulance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      <span className="text-sm">Hospital</span>
                    </div>
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
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate('/user/report')}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Report Emergency
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700"
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
