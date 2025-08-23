import { useState, useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useIncidents, useInitializeData } from "@/hooks/use-data";
import SafeInteractiveMap, {
  type MapIncident,
} from "@/components/SafeInteractiveMap";
import { useResizeObserverErrorSuppression } from "@/components/MapErrorBoundary";
import {
  Map,
  ArrowLeft,
  MapPin,
  AlertTriangle,
  Filter,
  RefreshCw,
  Navigation,
} from "lucide-react";

export default function ViewMap() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { incidents, loading, error, refresh } = useIncidents();
  const dataInitialized = useInitializeData();

  // Suppress ResizeObserver errors
  useResizeObserverErrorSuppression();
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Convert incidents to map format
  const mapIncidents: MapIncident[] = incidents
    .filter((incident) => {
      const matchesType = typeFilter === "all" || incident.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" || incident.status === statusFilter;
      return matchesType && matchesStatus;
    })
    .map((incident) => ({
      id: incident.id,
      type: incident.type,
      title: incident.title,
      location: incident.location,
      latitude: incident.latitude || 40.7128 + (Math.random() - 0.5) * 0.02,
      longitude: incident.longitude || -74.006 + (Math.random() - 0.5) * 0.02,
      status: incident.status,
      priority: incident.priority,
      description: incident.description,
      time: new Date(incident.createdAt).toLocaleTimeString(),
      assignedTo: incident.assignedTo,
    }));

  const handleIncidentClick = (incident: MapIncident) => {
    setSelectedIncident(incident.id);
    toast({
      title: `${incident.title}`,
      description: `Status: ${incident.status} | Priority: ${incident.priority}`,
    });
  };

  const handleNavigateToIncident = (incident: MapIncident) => {
    // In a real app, this would open navigation app
    toast({
      title: "Navigation Started",
      description: `Navigating to ${incident.location}`,
    });

    // For demo, open Google Maps
    if (incident.latitude && incident.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`;
      window.open(url, "_blank");
    }
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      toast({
        title: "Map Updated",
        description: "Latest incident data loaded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh map data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (dataInitialized && incidents.length > 0) {
      console.log("Map data loaded:", incidents.length, "incidents");
    }
  }, [dataInitialized, incidents]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard/user")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                <Map className="mr-3 h-8 w-8 text-emergency-info" />
                Emergency Map
              </h1>
              <p className="text-slate-600">
                View danger zones and reported incidents in your area (
                {mapIncidents.length} incidents)
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle>Map Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Incident Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="all">All Types</option>
                    <option value="fire">Fire</option>
                    <option value="medical">Medical</option>
                    <option value="accident">Accident</option>
                    <option value="police">Police</option>
                    <option value="rescue">Rescue</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Map Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-4">
                {loading ? (
                  <div className="h-96 flex items-center justify-center bg-slate-50 rounded-lg">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-slate-400" />
                      <p className="text-slate-600">Loading map data...</p>
                    </div>
                  </div>
                ) : (
                  <SafeInteractiveMap
                    incidents={mapIncidents}
                    height="500px"
                    onIncidentClick={handleIncidentClick}
                    showUserLocation={true}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Incident List */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nearby Incidents</CardTitle>
                <CardDescription>
                  Active emergencies in your area
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-400" />
                    <p className="text-sm text-slate-600">
                      Loading incidents...
                    </p>
                  </div>
                ) : mapIncidents.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No incidents match your filters</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mapIncidents.map((incident) => (
                      <div
                        key={incident.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedIncident === incident.id
                            ? "border-emergency-info bg-emergency-info/5"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                        onClick={() => setSelectedIncident(incident.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle
                              className={`h-4 w-4 ${
                                incident.type === "fire"
                                  ? "text-emergency-danger"
                                  : incident.type === "accident"
                                    ? "text-emergency-warning"
                                    : incident.type === "medical"
                                      ? "text-emergency-info"
                                      : "text-emergency-resolved"
                              }`}
                            />
                            <span className="text-sm font-medium capitalize">
                              {incident.type}
                            </span>
                          </div>
                          <Badge
                            className={`text-xs ${
                              incident.priority === "critical"
                                ? "bg-emergency-danger"
                                : incident.priority === "high"
                                  ? "bg-emergency-warning"
                                  : incident.priority === "medium"
                                    ? "bg-emergency-info"
                                    : "bg-slate-500"
                            } text-white`}
                          >
                            {incident.priority}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600 flex items-center mb-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {incident.location}
                        </div>
                        <div className="text-xs text-slate-500 mb-2">
                          Status: {incident.status} • {incident.time}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigateToIncident(incident);
                          }}
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          Navigate
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Map Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emergency-danger rounded-full"></div>
                    <span className="text-sm">Fire Emergency</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emergency-warning rounded-full"></div>
                    <span className="text-sm">Traffic Accident</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emergency-info rounded-full"></div>
                    <span className="text-sm">Medical Emergency</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emergency-resolved rounded-full"></div>
                    <span className="text-sm">Safe Zone</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate("/user/report")}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Report Emergency
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate("/user/help")}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Request Help
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
