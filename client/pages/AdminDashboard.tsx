import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useIncidents, useMissions, useInitializeData } from "@/hooks/use-data";
import RealTimeDashboardStats from "@/components/RealTimeDashboardStats";
import { useAuth } from "@/hooks/use-auth";
import {
  Settings,
  Users,
  Activity,
  FileText,
  Shield,
  RefreshCw,
  AlertTriangle,
  Database,
  UserCheck,
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    incidents,
    loading: incidentsLoading,
    error: incidentsError,
    refresh: refreshIncidents,
  } = useIncidents();
  const {
    missions,
    loading: missionsLoading,
    error: missionsError,
    refresh: refreshMissions,
  } = useMissions();
  const dataInitialized = useInitializeData();
  const [systemAccess, setSystemAccess] = useState(false);
  const [adminAccess, setAdminAccess] = useState(false);

  // Simulated system stats
  const totalUsers = 247;
  const activeIncidents = incidents.filter(
    (i) => i.status !== "resolved",
  ).length;
  const resolvedToday = incidents.filter(
    (i) =>
      i.status === "resolved" &&
      new Date(i.updatedAt).toDateString() === new Date().toDateString(),
  ).length;
  const systemStatus = "Online";

  const handleRefreshAll = async () => {
    try {
      await Promise.all([refreshIncidents(), refreshMissions()]);
      toast({
        title: "System Refreshed",
        description: "All data has been refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh system data",
        variant: "destructive",
      });
    }
  };

  const handleSystemAccess = () => {
    setSystemAccess(true);
    toast({
      title: "System Access Granted",
      description: "Full system administration access enabled",
    });
  };

  const handleAdminAccess = () => {
    setAdminAccess(true);
    toast({
      title: "Admin Access Granted",
      description: "Administrative privileges activated",
    });
  };

  const getDashboardStats = () => {
    return {
      police: incidents.filter(
        (i) => i.type === "accident" || i.type === "police",
      ).length,
      fire: incidents.filter((i) => i.type === "fire").length,
      ambulance: incidents.filter((i) => i.type === "medical").length,
      hospital: 0, // Would be supply requests in real implementation
    };
  };

  const dashboardStats = getDashboardStats();

  useEffect(() => {
    if (dataInitialized) {
      console.log(
        "Admin dashboard data loaded:",
        incidents.length,
        "incidents,",
        missions.length,
        "missions",
      );
    }
  }, [dataInitialized, incidents.length, missions.length]);
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
              <p className="text-slate-600">
                Full system access and management controls.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-700">⚡</div>
              <div className="text-sm text-slate-500">Admin Control</div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshAll}
                disabled={incidentsLoading || missionsLoading}
                className="mt-2"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${incidentsLoading || missionsLoading ? "animate-spin" : ""}`}
                />
                Refresh All
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alerts */}
        {(incidentsError || missionsError) && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {incidentsError || missionsError}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="bg-slate-100 p-4 rounded-full w-fit mx-auto mb-3">
                <Users className="h-8 w-8 text-slate-700" />
              </div>
              <CardTitle>Manage Users</CardTitle>
              <CardDescription>
                Add, remove, edit users ({totalUsers} total)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="default"
                onClick={() => navigate("/admin/users")}
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="bg-emergency-info/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Activity className="h-8 w-8 text-emergency-info" />
              </div>
              <CardTitle>Mission Control</CardTitle>
              <CardDescription>
                Mark complete, refresh, delete ({missions.length} active)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="info"
                onClick={() => navigate("/admin/missions")}
              >
                <Activity className="mr-2 h-4 w-4" />
                Mission Control
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="bg-emergency-warning/10 p-4 rounded-full w-fit mx-auto mb-3">
                <FileText className="h-8 w-8 text-emergency-warning" />
              </div>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>View system activity logs</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="warning"
                onClick={() => navigate("/admin/logs")}
              >
                <FileText className="mr-2 h-4 w-4" />
                View Logs
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="bg-emergency-danger/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Shield className="h-8 w-8 text-emergency-danger" />
              </div>
              <CardTitle>All Dashboards</CardTitle>
              <CardDescription>Access to all role dashboards</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="danger"
                onClick={() => navigate("/admin/dashboards")}
              >
                <Shield className="mr-2 h-4 w-4" />
                View All
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Stats and Dashboard Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Quick Stats
                <Badge variant="outline">
                  {incidentsLoading || missionsLoading ? "Loading..." : "Live"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Users</span>
                  <span className="font-semibold">{totalUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Incidents</span>
                  <span className="font-semibold text-emergency-danger">
                    {activeIncidents}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Resolved Today</span>
                  <span className="font-semibold text-emergency-resolved">
                    {resolvedToday}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>System Status</span>
                  <span className="font-semibold text-emergency-resolved">
                    {systemStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Missions</span>
                  <span className="font-semibold text-emergency-info">
                    {missions.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dashboard Activity</CardTitle>
              <CardDescription>
                Recent activity across all departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Police Dashboard</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {dashboardStats.police} incidents
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate("/dashboard/police")}
                    >
                      View
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Fire Brigade</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {dashboardStats.fire} incidents
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate("/dashboard/fire")}
                    >
                      View
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Ambulance Service</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {dashboardStats.ambulance} incidents
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate("/dashboard/ambulance")}
                    >
                      View
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Hospital Network</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {dashboardStats.hospital} requests
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate("/dashboard/hospital")}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Dashboard Integration */}
        <RealTimeDashboardStats />

        {/* Admin Access Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Administrative Access</CardTitle>
            <CardDescription>System and admin access controls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">System Access</div>
                    <div className="text-sm text-slate-600">
                      Full system administration privileges
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant={systemAccess ? "success" : "outline"}
                        size="sm"
                      >
                        <Database className="mr-2 h-4 w-4" />
                        {systemAccess ? "Active" : "Grant Access"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Grant System Access</DialogTitle>
                        <DialogDescription>
                          This will grant full system administration privileges.
                          Are you sure?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex space-x-2">
                        <Button onClick={handleSystemAccess} className="flex-1">
                          Grant Access
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">Admin Access</div>
                    <div className="text-sm text-slate-600">
                      Administrative panel privileges
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant={adminAccess ? "success" : "outline"}
                        size="sm"
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        {adminAccess ? "Active" : "Grant Access"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Grant Admin Access</DialogTitle>
                        <DialogDescription>
                          This will activate administrative panel privileges.
                          Continue?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex space-x-2">
                        <Button onClick={handleAdminAccess} className="flex-1">
                          Grant Access
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
