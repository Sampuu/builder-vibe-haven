import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Map,
  ArrowLeft,
  MapPin,
  Shield,
  Radio,
  Navigation
} from 'lucide-react';
import GoogleMap from '@/components/GoogleMap';
import { disasterReportsService, DisasterReport } from '@/services/firestore';

const activeUnits = [
  { id: 'Unit 12', status: 'responding', location: 'Highway 101', incident: 'Traffic Accident' },
  { id: 'Unit 8', status: 'patrolling', location: 'Downtown', incident: null },
  { id: 'Unit 15', status: 'available', location: 'Station 2', incident: null },
];

export default function CommandMap() {
  const navigate = useNavigate();
  const [disasterReports, setDisasterReports] = useState<DisasterReport[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<DisasterReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load initial data
    const loadReports = async () => {
      try {
        const reports = await disasterReportsService.getAll();
        setDisasterReports(reports.filter(r => r.status !== 'resolved'));
      } catch (error) {
        console.error('Error loading reports:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();

    // Subscribe to real-time updates
    const unsubscribe = disasterReportsService.subscribeToUpdates((reports) => {
      setDisasterReports(reports.filter(r => r.status !== 'resolved'));
    });

    return () => unsubscribe();
  }, []);

  // Convert disaster reports to map markers
  const mapMarkers = disasterReports
    .filter(report => report.coordinates)
    .map(report => ({
      position: report.coordinates!,
      title: report.title,
      info: `
        <div class="p-2">
          <h3 class="font-bold">${report.title}</h3>
          <p class="text-sm text-gray-600">${report.type} - ${report.severity}</p>
          <p class="text-sm">${report.description}</p>
          <p class="text-xs text-gray-500">Status: ${report.status}</p>
        </div>
      `,
      type: report.type === 'fire' ? 'fire' :
            report.type === 'medical' ? 'medical' :
            report.type === 'accident' ? 'police' : 'general'
    }));

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
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Live Incident Map</span>
                  <Badge variant="secondary">
                    {disasterReports.length} Active Incidents
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-96 flex items-center justify-center bg-slate-50 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-slate-600">Loading incidents...</p>
                    </div>
                  </div>
                ) : (
                  <GoogleMap
                    center={{ lat: 40.7128, lng: -74.0060 }}
                    zoom={11}
                    height="400px"
                    markers={mapMarkers}
                    onMapClick={(location) => {
                      console.log('Map clicked at:', location);
                    }}
                  />
                )}
                <div className="mt-4 flex items-center space-x-4 text-xs text-slate-600">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span>Fire Emergencies</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span>Medical Emergencies</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span>Police Incidents</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                    <span>Other</span>
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
