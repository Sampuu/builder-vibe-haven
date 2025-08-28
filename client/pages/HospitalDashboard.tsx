import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MapPin, Package } from 'lucide-react';
import NotificationCenter, { NotificationBell } from '@/components/NotificationCenter';

export default function HospitalDashboard() {
  const navigate = useNavigate();
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center">
            <Building2 className="mr-3 h-8 w-8 text-emergency-info" />
            Hospital Management Center
          </h2>
          <p className="text-slate-600">Manage medical equipment requests and dispatch services.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="bg-emergency-info/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Package className="h-8 w-8 text-emergency-info" />
              </div>
              <CardTitle>Supply Requests</CardTitle>
              <CardDescription>Medical equipment/supplies requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="info" onClick={() => navigate('/hospital/supplies')}>View Requests</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="bg-emergency-resolved/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Building2 className="h-8 w-8 text-emergency-resolved" />
              </div>
              <CardTitle>Assign Vehicle</CardTitle>
              <CardDescription>Assign ambulance for delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="success" onClick={() => navigate('/hospital/supplies')}>Assign Vehicle</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="bg-emergency-warning/10 p-4 rounded-full w-fit mx-auto mb-3">
                <MapPin className="h-8 w-8 text-emergency-warning" />
              </div>
              <CardTitle>Supply Locations</CardTitle>
              <CardDescription>View supply request locations</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="warning" onClick={() => navigate('/hospital/supplies')}>View Map</Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-12 text-center text-slate-500">
            <Building2 className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">Hospital Dashboard</p>
            <p>Medical supply management and dispatch will be implemented here</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
