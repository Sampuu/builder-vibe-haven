import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  AlertTriangle,
  MapPin,
  Users,
  Clock,
  CheckCircle,
} from "lucide-react";
import NotificationCenter, {
  NotificationBell,
} from "@/components/NotificationCenter";

export default function PoliceDashboard() {
  const navigate = useNavigate();
  // Mock data for incidents
  const incidents = [
    {
      id: 1,
      type: "Fire",
      location: "Downtown Plaza",
      status: "pending",
      priority: "high",
      time: "2 mins ago",
    },
    {
      id: 2,
      type: "Medical",
      location: "Oak Street",
      status: "in-progress",
      priority: "critical",
      time: "15 mins ago",
    },
    {
      id: 3,
      type: "Accident",
      location: "Highway 101",
      status: "resolved",
      priority: "medium",
      time: "1 hour ago",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-emergency-warning";
      case "in-progress":
        return "bg-emergency-info";
      case "resolved":
        return "bg-emergency-resolved";
      default:
        return "bg-slate-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-emergency-danger";
      case "high":
        return "bg-emergency-warning";
      case "medium":
        return "bg-emergency-info";
      default:
        return "bg-slate-500";
    }
  };

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
                Monitor all incidents and coordinate emergency response across
                all departments.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell department="police" />
              <div className="text-right">
                <div className="text-2xl font-bold text-emergency-danger">
                  24/7
                </div>
                <div className="text-sm text-slate-500">Active Monitoring</div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Notifications */}
        <NotificationCenter
          department="police"
          showUnreadOnly={false}
          maxHeight="300px"
        />

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
              <div className="text-2xl font-bold text-emergency-resolved">
                12
              </div>
              <div className="text-sm text-slate-600">Resolved Today</div>
            </CardContent>
          </Card>
        </div>

        {/* All Incidents View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-emergency-danger" />
                All Active Incidents
              </span>
              <Button
                variant="danger"
                size="sm"
                onClick={() => navigate("/police/incidents")}
              >
                <Users className="mr-2 h-4 w-4" />
                View All
              </Button>
            </CardTitle>
            <CardDescription>
              Monitor and coordinate response for all emergency incidents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-3 h-3 rounded-full ${getStatusColor(incident.status)}`}
                    ></div>
                    <div>
                      <div className="font-medium text-slate-900">
                        {incident.type} Emergency
                      </div>
                      <div className="text-sm text-slate-600 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {incident.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge
                      className={`${getPriorityColor(incident.priority)} text-white`}
                    >
                      {incident.priority}
                    </Badge>
                    <div className="text-sm text-slate-500 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {incident.time}
                    </div>
                    <Button variant="outline" size="sm">
                      <MapPin className="mr-2 h-4 w-4" />
                      Navigate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="bg-emergency-danger/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Users className="h-8 w-8 text-emergency-danger" />
              </div>
              <CardTitle>Request Backup</CardTitle>
              <CardDescription>
                Send requests to Fire Brigade, Ambulance, or Hospital
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="danger"
                onClick={() => navigate("/police/incidents")}
              >
                Request Help
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="bg-emergency-info/10 p-4 rounded-full w-fit mx-auto mb-3">
                <MapPin className="h-8 w-8 text-emergency-info" />
              </div>
              <CardTitle>Command Map</CardTitle>
              <CardDescription>
                View all incidents on interactive map
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="info"
                onClick={() => navigate("/police/map")}
              >
                Open Map
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="bg-emergency-resolved/10 p-4 rounded-full w-fit mx-auto mb-3">
                <CheckCircle className="h-8 w-8 text-emergency-resolved" />
              </div>
              <CardTitle>Status Management</CardTitle>
              <CardDescription>
                Update incident status and dispatch resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="success">
                Manage Status
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
