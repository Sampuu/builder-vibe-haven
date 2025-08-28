import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import MapSystem from "@/components/MapSystem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { TrackedEntity } from "@shared/api";
import {
  Map,
  ArrowLeft,
  MapPin,
  Shield,
  Radio,
  Navigation,
} from "lucide-react";

export default function CommandMap() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trackedEntities, setTrackedEntities] = useState<TrackedEntity[]>([]);

  // Fetch tracked entities
  const fetchTrackedEntities = async () => {
    try {
      const response = await fetch("/api/entities?type=police", {
        headers: {
          "x-user-id": user?.id || "",
          "x-user-role": user?.role || "police",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTrackedEntities(data.entities || []);
      } else {
        console.error("Failed to fetch tracked entities");
      }
    } catch (error) {
      console.error("Error fetching tracked entities:", error);
    }
  };

  useEffect(() => {
    fetchTrackedEntities();
    // Set up polling for real-time updates
    const interval = setInterval(fetchTrackedEntities, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "responding":
        return "bg-emergency-danger";
      case "busy":
        return "bg-emergency-warning";
      case "idle":
        return "bg-emergency-resolved";
      default:
        return "bg-slate-500";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard/police")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Police Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <Map className="mr-3 h-8 w-8 text-emergency-info" />
              Police Command Map
            </h1>
            <p className="text-slate-600">
              Real-time tracking of units and incidents
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <MapSystem
              height="700px"
              showControls={true}
              defaultCenter={[20.5937, 78.9629]}
              defaultZoom={5}
            />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Police Units ({trackedEntities.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {trackedEntities.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">
                      <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No police units online</p>
                    </div>
                  ) : (
                    trackedEntities.map((entity) => (
                      <div key={entity.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{entity.name}</span>
                          <Badge
                            className={`text-xs ${getStatusColor(entity.status)} text-white`}
                          >
                            {entity.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600 flex items-center mb-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          Lat: {entity.latitude.toFixed(4)}, Lng:{" "}
                          {entity.longitude.toFixed(4)}
                        </div>
                        {entity.speed !== undefined && entity.speed > 0 && (
                          <div className="text-xs text-slate-500 mb-2">
                            Speed: {entity.speed} km/h
                          </div>
                        )}
                        {entity.assignedIncidentId && (
                          <div className="text-xs text-blue-600 mb-2">
                            Assigned to incident: {entity.assignedIncidentId}
                          </div>
                        )}
                        <div className="text-xs text-slate-400 mb-2">
                          Last update:{" "}
                          {new Date(entity.lastUpdate).toLocaleTimeString()}
                        </div>
                        <Button size="sm" variant="outline" className="w-full">
                          <Radio className="mr-2 h-4 w-4" />
                          Contact Unit
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="danger" size="sm" className="w-full">
                  <Shield className="mr-2 h-4 w-4" />
                  Dispatch Units
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Navigation className="mr-2 h-4 w-4" />
                  Route Planning
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
