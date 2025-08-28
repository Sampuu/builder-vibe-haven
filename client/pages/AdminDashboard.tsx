import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Users, Activity, FileText, Shield } from 'lucide-react';
import NotificationCenter, { NotificationBell } from '@/components/NotificationCenter';
import NotificationSystemTest from '@/components/NotificationSystemTest';

export default function AdminDashboard() {
  const navigate = useNavigate();
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center">
                <Settings className="mr-3 h-8 w-8 text-slate-700" />
                System Administration Center
              </h2>
              <p className="text-slate-600">Full system access and management controls.</p>
            </div>
            <NotificationBell department="admin" />
          </div>
        </div>

        {/* Emergency Notifications */}
        <NotificationCenter
          department="admin"
          showUnreadOnly={false}
          maxHeight="300px"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="bg-slate-100 p-4 rounded-full w-fit mx-auto mb-3">
                <Users className="h-8 w-8 text-slate-700" />
              </div>
              <CardTitle>Manage Users</CardTitle>
              <CardDescription>Add, remove, edit users</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="default" onClick={() => navigate('/admin/users')}>Manage Users</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="bg-emergency-info/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Activity className="h-8 w-8 text-emergency-info" />
              </div>
              <CardTitle>Mission Control</CardTitle>
              <CardDescription>Mark complete, refresh, delete</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="info" onClick={() => navigate('/admin/missions')}>Mission Control</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="bg-emergency-warning/10 p-4 rounded-full w-fit mx-auto mb-3">
                <FileText className="h-8 w-8 text-emergency-warning" />
              </div>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>View system activity logs</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="warning" onClick={() => navigate('/admin/logs')}>View Logs</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="bg-emergency-danger/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Shield className="h-8 w-8 text-emergency-danger" />
              </div>
              <CardTitle>All Dashboards</CardTitle>
              <CardDescription>Access to all role dashboards</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="danger" onClick={() => navigate('/admin/dashboards')}>View All</Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Users</span>
                  <span className="font-semibold">247</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Incidents</span>
                  <span className="font-semibold text-emergency-danger">3</span>
                </div>
                <div className="flex justify-between">
                  <span>Resolved Today</span>
                  <span className="font-semibold text-emergency-resolved">12</span>
                </div>
                <div className="flex justify-between">
                  <span>System Status</span>
                  <span className="font-semibold text-emergency-resolved">Online</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-12 text-center text-slate-500">
              <Settings className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">Admin Dashboard</p>
              <p>Advanced system management tools will be implemented here</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
