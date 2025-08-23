import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  ArrowLeft,
  User,
  Flame,
  Truck,
  Building2,
  Settings,
  ExternalLink,
  Eye
} from 'lucide-react';

const dashboards = [
  {
    role: 'user',
    title: 'User Dashboard',
    description: 'Report disasters, request help, view incidents map',
    icon: User,
    color: 'bg-emergency-info',
    textColor: 'text-emergency-info',
    features: ['Report Disaster', 'Request Help', 'View Map', 'News Portal'],
    path: '/dashboard/user'
  },
  {
    role: 'police',
    title: 'Police Command Center',
    description: 'Monitor all incidents and coordinate emergency response',
    icon: Shield,
    color: 'bg-emergency-danger',
    textColor: 'text-emergency-danger',
    features: ['All Incidents', 'Request Backup', 'Command Map', 'Status Management'],
    path: '/dashboard/police'
  },
  {
    role: 'fire',
    title: 'Fire Brigade Command',
    description: 'Handle fire emergencies and coordinate fire response',
    icon: Flame,
    color: 'bg-emergency-warning',
    textColor: 'text-emergency-warning',
    features: ['Fire Incidents', 'Location Mapping', 'Status Updates', 'Resource Management'],
    path: '/dashboard/fire'
  },
  {
    role: 'ambulance',
    title: 'Ambulance Service',
    description: 'Medical emergency response and patient transport',
    icon: Truck,
    color: 'bg-emergency-resolved',
    textColor: 'text-emergency-resolved',
    features: ['Medical Incidents', 'Patient Tracking', 'Status Updates', 'Hospital Coordination'],
    path: '/dashboard/ambulance'
  },
  {
    role: 'hospital',
    title: 'Hospital Management',
    description: 'Medical supplies and emergency dispatch coordination',
    icon: Building2,
    color: 'bg-emergency-info',
    textColor: 'text-emergency-info',
    features: ['Supply Requests', 'Vehicle Assignment', 'Medical Dispatch', 'Resource Allocation'],
    path: '/dashboard/hospital'
  },
  {
    role: 'admin',
    title: 'Admin Control Panel',
    description: 'Full system access and administrative controls',
    icon: Settings,
    color: 'bg-slate-600',
    textColor: 'text-slate-600',
    features: ['User Management', 'Mission Control', 'Audit Logs', 'System Settings'],
    path: '/dashboard/admin'
  }
];

export default function AllDashboards() {
  const navigate = useNavigate();

  const handleAccessDashboard = (path: string) => {
    navigate(path);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard/admin')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <Shield className="mr-3 h-8 w-8 text-emergency-danger" />
              All Role Dashboards
            </h1>
            <p className="text-slate-600">Access any role's dashboard with administrative privileges</p>
          </div>
        </div>

        {/* Admin Notice */}
        <Card className="border-emergency-warning bg-emergency-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-emergency-warning">
              <Shield className="h-5 w-5" />
              <div>
                <div className="font-semibold">Administrator Access</div>
                <div className="text-sm text-slate-600">
                  You have full access to all role dashboards. Use this access responsibly for system administration and oversight.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((dashboard) => {
            const Icon = dashboard.icon;
            return (
              <Card key={dashboard.role} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`${dashboard.color}/10 p-3 rounded-lg w-fit`}>
                      <Icon className={`h-8 w-8 ${dashboard.textColor}`} />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAccessDashboard(dashboard.path)}
                      className="hover:bg-slate-50"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Access
                    </Button>
                  </div>
                  <CardTitle className="text-lg">{dashboard.title}</CardTitle>
                  <CardDescription>{dashboard.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Key Features:</h4>
                      <div className="grid grid-cols-1 gap-1">
                        {dashboard.features.map((feature, index) => (
                          <div key={index} className="text-sm text-slate-600 flex items-center">
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      className="w-full mt-4"
                      onClick={() => handleAccessDashboard(dashboard.path)}
                      style={{ backgroundColor: `hsl(var(--emergency-${dashboard.role === 'admin' ? 'info' : dashboard.role === 'police' ? 'danger' : dashboard.role === 'fire' ? 'warning' : dashboard.role === 'ambulance' ? 'resolved' : 'info'}))` }}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open {dashboard.title}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Quick stats across all role dashboards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emergency-danger">3</div>
                <div className="text-sm text-slate-600">Active Emergencies</div>
                <div className="text-xs text-slate-500">Across all departments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emergency-info">24</div>
                <div className="text-sm text-slate-600">Active Users</div>
                <div className="text-xs text-slate-500">Currently logged in</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emergency-resolved">15</div>
                <div className="text-sm text-slate-600">Resolved Today</div>
                <div className="text-xs text-slate-500">All incident types</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emergency-warning">2</div>
                <div className="text-sm text-slate-600">System Alerts</div>
                <div className="text-xs text-slate-500">Requiring attention</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Helper */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Helper</CardTitle>
            <CardDescription>Quick access to common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => navigate('/admin/users')}
              >
                <User className="h-6 w-6 text-slate-600" />
                <div className="text-center">
                  <div className="font-medium">Manage Users</div>
                  <div className="text-xs text-slate-500">Add, edit, delete users</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => navigate('/admin/missions')}
              >
                <Shield className="h-6 w-6 text-slate-600" />
                <div className="text-center">
                  <div className="font-medium">Mission Control</div>
                  <div className="text-xs text-slate-500">Monitor all missions</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => navigate('/admin/logs')}
              >
                <Settings className="h-6 w-6 text-slate-600" />
                <div className="text-center">
                  <div className="font-medium">Audit Logs</div>
                  <div className="text-xs text-slate-500">System activity logs</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
