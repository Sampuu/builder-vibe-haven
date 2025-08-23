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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useIncidents, useInitializeData } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import {
  Truck,
  MapPin,
  Heart,
  RefreshCw,
  Navigation,
  Clock,
  AlertTriangle,
  Activity,
} from "lucide-react";

export default function AmbulanceDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { incidents, loading, error, updateIncident, refresh } = useIncidents();
  const dataInitialized = useInitializeData();

  // Filter incidents relevant to ambulance service
  const medicalIncidents = incidents.filter(
    (incident) =>
      incident.type === "medical" || incident.assignedRole === "ambulance",
  );

  const handleDispatch = async (incidentId: string) => {
    try {
      await updateIncident(incidentId, {
        status: "in-progress",
        assignedTo: user?.name || "Ambulance Unit",
        assignedRole: "ambulance",
      });
      toast({
        title: "Ambulance Dispatched",
        description: "Medical unit has been dispatched to the incident",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to dispatch ambulance",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (incidentId: string, newStatus: string) => {
    try {
      const statusMap: { [key: string]: string } = {
        pending: "pending",
        dispatched: "in-progress",
        "en-route": "in-progress",
        "on-scene": "in-progress",
        transporting: "in-progress",
        "at-hospital": "resolved",
        resolved: "resolved",
      };

      await updateIncident(incidentId, { status: statusMap[newStatus] as any });
      toast({
        title: "Status Updated",
        description: `Patient status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update patient status",
        variant: "destructive",
      });
    }
  };

  const handleNavigateToPatient = (incident: any) => {
    toast({
      title: "Navigation Started",
      description: `Navigating to patient at ${incident.location}`,
    });

    if (incident.latitude && incident.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`;
      window.open(url, "_blank");
    } else {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(incident.location)}`;
      window.open(url, "_blank");
    }
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      toast({
        title: "Dashboard Refreshed",
        description: "Latest medical incident data loaded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh dashboard",
        variant: "destructive",
      });
    }
  };

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

  const getAmbulanceStatus = (incident: any) => {
    if (incident.status === "pending") return "Available";
    if (incident.status === "in-progress") return "En Route/On Scene";
    if (incident.status === "resolved") return "At Hospital";
    return "Unknown";
  };

  useEffect(() => {
    if (dataInitialized) {
      console.log(
        "Ambulance dashboard data loaded:",
        medicalIncidents.length,
        "medical incidents",
      );
    }
  }, [dataInitialized, medicalIncidents.length]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Ambulance Service Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center">
                <Truck className="mr-3 h-8 w-8 text-emergency-resolved" />
                Ambulance Service Command
              </h2>
              <p className="text-slate-600">
                Respond to medical emergencies and transport patients.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emergency-resolved">
                🚑
              </div>
              <div className="text-sm text-slate-500">Medical Units Ready</div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="mt-2"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-danger">
                {medicalIncidents.filter((i) => i.status !== "resolved").length}
              </div>
              <div className="text-sm text-slate-600">Active Cases</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-warning">
                {
                  medicalIncidents.filter((i) => i.priority === "critical")
                    .length
                }
              </div>
              <div className="text-sm text-slate-600">Critical Priority</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-info">
                {
                  medicalIncidents.filter((i) => i.status === "in-progress")
                    .length
                }
              </div>
              <div className="text-sm text-slate-600">Units Dispatched</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-resolved">
                {
                  incidents.filter(
                    (i) =>
                      i.type === "medical" &&
                      i.status === "resolved" &&
                      new Date(i.updatedAt).toDateString() ===
                        new Date().toDateString(),
                  ).length
                }
              </div>
              <div className="text-sm text-slate-600">
                Patients Helped Today
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medical Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Heart className="mr-2 h-5 w-5 text-emergency-resolved" />
                Active Medical Incidents (
                {medicalIncidents.filter((i) => i.status !== "resolved").length}
                )
              </span>
              <Button
                variant="success"
                size="sm"
                onClick={() => navigate("/ambulance/incidents")}
              >
                <Heart className="mr-2 h-4 w-4" />
                View All
              </Button>
            </CardTitle>
            <CardDescription>
              Monitor and respond to medical emergencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-slate-400" />
                <p className="text-slate-600">Loading medical incidents...</p>
              </div>
            ) : medicalIncidents.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Heart className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No active medical incidents</p>
              </div>
            ) : (
              <div className="space-y-4">
                {medicalIncidents.slice(0, 3).map((incident) => (
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
                          {incident.title}
                        </div>
                        <div className="text-sm text-slate-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {incident.location}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {incident.description}
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
                        {new Date(incident.createdAt).toLocaleTimeString()}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleNavigateToPatient(incident)}
                      >
                        <Navigation className="mr-2 h-4 w-4" />
                        Navigate
                      </Button>
                      {incident.status === "pending" && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleDispatch(incident.id)}
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          Dispatch
                        </Button>
                      )}
                      <Select
                        onValueChange={(value) =>
                          handleUpdateStatus(incident.id, value)
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue
                            placeholder={getAmbulanceStatus(incident)}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Available</SelectItem>
                          <SelectItem value="dispatched">Dispatched</SelectItem>
                          <SelectItem value="en-route">En Route</SelectItem>
                          <SelectItem value="on-scene">On Scene</SelectItem>
                          <SelectItem value="transporting">
                            Transporting
                          </SelectItem>
                          <SelectItem value="at-hospital">
                            At Hospital
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="bg-emergency-resolved/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Heart className="h-8 w-8 text-emergency-resolved" />
              </div>
              <CardTitle>All Medical Incidents</CardTitle>
              <CardDescription>
                View and manage all medical emergencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="success"
                onClick={() => navigate("/ambulance/incidents")}
              >
                <Heart className="mr-2 h-4 w-4" />
                View All Incidents
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="bg-emergency-info/10 p-4 rounded-full w-fit mx-auto mb-3">
                <MapPin className="h-8 w-8 text-emergency-info" />
              </div>
              <CardTitle>Patient Locations</CardTitle>
              <CardDescription>View patient locations on map</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="info"
                onClick={() => navigate("/user/map")}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Open Map
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="bg-emergency-warning/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Activity className="h-8 w-8 text-emergency-warning" />
              </div>
              <CardTitle>Unit Status</CardTitle>
              <CardDescription>
                Manage ambulance unit assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="warning"
                onClick={() => navigate("/ambulance/incidents")}
              >
                <Truck className="mr-2 h-4 w-4" />
                Manage Units
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
