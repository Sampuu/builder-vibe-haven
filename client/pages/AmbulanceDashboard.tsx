import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, MapPin, Heart } from 'lucide-react';

export default function AmbulanceDashboard() {
  const navigate = useNavigate();
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center">
            <Truck className="mr-3 h-8 w-8 text-emergency-resolved" />
            Ambulance Service Command
          </h2>
          <p className="text-slate-600">Respond to medical emergencies and transport patients.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="bg-emergency-resolved/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Heart className="h-8 w-8 text-emergency-resolved" />
              </div>
              <CardTitle>Medical Incidents</CardTitle>
              <CardDescription>View medical/injury incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="success" onClick={() => navigate('/ambulance/incidents')}>View Incidents</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="bg-emergency-info/10 p-4 rounded-full w-fit mx-auto mb-3">
                <MapPin className="h-8 w-8 text-emergency-info" />
              </div>
              <CardTitle>Patient Location</CardTitle>
              <CardDescription>Navigate to patient locations</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="info" onClick={() => navigate('/ambulance/incidents')}>Open Map</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="bg-emergency-warning/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Truck className="h-8 w-8 text-emergency-warning" />
              </div>
              <CardTitle>Update Status</CardTitle>
              <CardDescription>Dispatched / Picked Up / At Hospital</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="warning">Update Status</Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-12 text-center text-slate-500">
            <Truck className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">Ambulance Dashboard</p>
            <p>Medical emergency response management will be implemented here</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
