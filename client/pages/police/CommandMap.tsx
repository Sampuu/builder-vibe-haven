import { useNavigate } from 'react-router-dom';
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

const activeUnits = [
  { id: 'Unit 12', status: 'responding', location: 'Highway 101', incident: 'Traffic Accident' },
  { id: 'Unit 8', status: 'patrolling', location: 'Downtown', incident: null },
  { id: 'Unit 15', status: 'available', location: 'Station 2', incident: null },
];

export default function CommandMap() {
  const navigate = useNavigate();

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
