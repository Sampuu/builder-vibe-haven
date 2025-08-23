import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import UserManagement from '@/components/UserManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  AlertTriangle, 
  Activity, 
  Shield, 
  Database,
  BarChart3,
  Bell,
  Settings,
  Eye,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { userDatabase } from '@/lib/userDatabase';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Get real-time stats
  const stats = userDatabase.getStats();

  const systemStats = {
    totalIncidents: 45,
    activeIncidents: 12,
    resolvedToday: 8,
    responseTime: '4.2 min',
    systemUptime: '99.8%',
    totalAlerts: 156
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <Shield className="mr-3 h-8 w-8 text-red-600" />
              Admin Dashboard
            </h1>
            <p className="text-slate-600">System overview and management</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-red-100 text-red-700">
              Admin Access
            </Badge>
            <Badge variant="outline">
              {user?.name}
            </Badge>
          </div>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs text-green-600">+{stats.recentSignups} this week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Incidents</p>
                  <p className="text-2xl font-bold">{systemStats.activeIncidents}</p>
                  <p className="text-xs text-orange-600">-3 from yesterday</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">System Uptime</p>
                  <p className="text-2xl font-bold">{systemStats.systemUptime}</p>
                  <p className="text-xs text-green-600">Excellent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Avg Response</p>
                  <p className="text-2xl font-bold">{systemStats.responseTime}</p>
                  <p className="text-xs text-green-600">15% faster</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New user registered</p>
                        <p className="text-xs text-slate-600">police@newuser.com - Police role</p>
                      </div>
                      <span className="text-xs text-slate-500">2m ago</span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Critical incident reported</p>
                        <p className="text-xs text-slate-600">Fire emergency - Downtown area</p>
                      </div>
                      <span className="text-xs text-slate-500">15m ago</span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Incident resolved</p>
                        <p className="text-xs text-slate-600">Medical emergency - Hospital dispatch</p>
                      </div>
                      <span className="text-xs text-slate-500">1h ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Role Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    User Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.usersByRole).map(([role, count]) => (
                      <div key={role} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            role === 'admin' ? 'bg-red-500' :
                            role === 'police' ? 'bg-blue-500' :
                            role === 'fire' ? 'bg-orange-500' :
                            role === 'ambulance' ? 'bg-green-500' :
                            role === 'hospital' ? 'bg-cyan-500' : 'bg-gray-500'
                          }`}></div>
                          <span className="text-sm font-medium capitalize">{role}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                role === 'admin' ? 'bg-red-500' :
                                role === 'police' ? 'bg-blue-500' :
                                role === 'fire' ? 'bg-orange-500' :
                                role === 'ambulance' ? 'bg-green-500' :
                                role === 'hospital' ? 'bg-cyan-500' : 'bg-gray-500'
                              }`}
                              style={{ width: `${Math.max((count / stats.totalUsers) * 100, 5)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold w-8">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">✓</div>
                    <p className="text-sm font-medium">Database</p>
                    <p className="text-xs text-green-600">Online</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">✓</div>
                    <p className="text-sm font-medium">Authentication</p>
                    <p className="text-xs text-green-600">Operational</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">✓</div>
                    <p className="text-sm font-medium">Notifications</p>
                    <p className="text-xs text-green-600">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="incidents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Incident Management
                </CardTitle>
                <CardDescription>
                  Monitor and manage all emergency incidents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Incident management interface</p>
                  <p className="text-sm text-gray-500">Real-time incident tracking and response coordination</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Settings
                </CardTitle>
                <CardDescription>
                  Configure system parameters and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Emergency Notifications</h4>
                      <p className="text-sm text-gray-600">Real-time alerts for critical incidents</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Auto-Backup</h4>
                      <p className="text-sm text-gray-600">Automatic data backup every 5 minutes</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Development Mode</h4>
                      <p className="text-sm text-gray-600">Enhanced debugging and testing features</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
