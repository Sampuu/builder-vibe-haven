import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import IncidentManagement from '@/components/IncidentManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  AlertTriangle,
  MapPin,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function PoliceDashboard() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Police Control Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center">
                <Shield className="mr-3 h-8 w-8 text-emergency-danger" />
                Police Command Center
              </h2>
              <p className="text-slate-600">
                Monitor all incidents and coordinate emergency response across all departments.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emergency-danger">24/7</div>
              <div className="text-sm text-slate-500">Active Monitoring</div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-danger">3</div>
              <div className="text-sm text-slate-600">Active Incidents</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-warning">1</div>
              <div className="text-sm text-slate-600">Critical Priority</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-info">2</div>
              <div className="text-sm text-slate-600">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-resolved">12</div>
              <div className="text-sm text-slate-600">Resolved Today</div>
            </CardContent>
          </Card>
        </div>

        {/* Incident Management */}
        <IncidentManagement
          department="police"
          title="Police Incident Management"
          description="Monitor and coordinate response for all emergency incidents"
        />

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="bg-emergency-danger/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Users className="h-8 w-8 text-emergency-danger" />
              </div>
              <CardTitle>Request Backup</CardTitle>
              <CardDescription>Send requests to Fire Brigade, Ambulance, or Hospital</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="danger" onClick={() => navigate('/police/incidents')}>Request Help</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="bg-emergency-info/10 p-4 rounded-full w-fit mx-auto mb-3">
                <MapPin className="h-8 w-8 text-emergency-info" />
              </div>
              <CardTitle>Command Map</CardTitle>
              <CardDescription>View all incidents on interactive map</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="info" onClick={() => navigate('/police/map')}>Open Map</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="bg-emergency-resolved/10 p-4 rounded-full w-fit mx-auto mb-3">
                <CheckCircle className="h-8 w-8 text-emergency-resolved" />
              </div>
              <CardTitle>Status Management</CardTitle>
              <CardDescription>Update incident status and dispatch resources</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="success">Manage Status</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
