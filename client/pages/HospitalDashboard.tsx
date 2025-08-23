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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSupplyRequests, useInitializeData } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import {
  Building2,
  MapPin,
  Package,
  RefreshCw,
  Navigation,
  Clock,
  AlertTriangle,
  Truck,
  Plus,
} from "lucide-react";

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    supplyRequests,
    loading,
    error,
    createSupplyRequest,
    updateSupplyRequest,
    refresh,
  } = useSupplyRequests();
  const dataInitialized = useInitializeData();
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [assignVehicleOpen, setAssignVehicleOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [newRequest, setNewRequest] = useState({
    itemName: "",
    quantity: 1,
    urgency: "medium",
    location: "",
    notes: "",
  });

  // Sample supply requests if none exist
  useEffect(() => {
    const initSampleData = async () => {
      if (dataInitialized && supplyRequests.length === 0) {
        try {
          await createSupplyRequest({
            hospitalId: user?.id || "hospital-1",
            itemName: "Blood Type O-",
            quantity: 10,
            urgency: "critical",
            location: "General Hospital, Emergency Wing",
            latitude: 40.7505,
            longitude: -73.9934,
            status: "pending",
            requestedBy: user?.name || "Dr. Smith",
            notes: "Urgent need for emergency surgery patient",
          });

          await createSupplyRequest({
            hospitalId: user?.id || "hospital-1",
            itemName: "Ventilators",
            quantity: 3,
            urgency: "high",
            location: "Memorial Hospital, ICU",
            latitude: 40.758,
            longitude: -73.9855,
            status: "pending",
            requestedBy: user?.name || "Dr. Johnson",
            notes: "COVID-19 patient surge capacity",
          });
        } catch (error) {
          console.error("Failed to create sample supply requests:", error);
        }
      }
    };

    initSampleData();
  }, [dataInitialized, supplyRequests.length, createSupplyRequest, user]);

  const handleCreateSupplyRequest = async () => {
    if (!newRequest.itemName || !newRequest.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createSupplyRequest({
        hospitalId: user?.id || "hospital-1",
        itemName: newRequest.itemName,
        quantity: newRequest.quantity,
        urgency: newRequest.urgency as any,
        location: newRequest.location,
        status: "pending",
        requestedBy: user?.name || "Hospital Staff",
        notes: newRequest.notes,
      });

      toast({
        title: "Supply Request Created",
        description: `Request for ${newRequest.itemName} has been submitted`,
      });

      setNewRequestOpen(false);
      setNewRequest({
        itemName: "",
        quantity: 1,
        urgency: "medium",
        location: "",
        notes: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create supply request",
        variant: "destructive",
      });
    }
  };

  const handleAssignVehicle = async (requestId: string, vehicleId: string) => {
    try {
      await updateSupplyRequest(requestId, {
        status: "assigned",
        assignedVehicle: vehicleId,
      });

      toast({
        title: "Vehicle Assigned",
        description: `Vehicle ${vehicleId} has been assigned to the supply request`,
      });

      setAssignVehicleOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign vehicle",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      await updateSupplyRequest(requestId, { status: newStatus as any });
      toast({
        title: "Status Updated",
        description: `Supply request status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    }
  };

  const handleNavigateToLocation = (request: any) => {
    toast({
      title: "Navigation Started",
      description: `Navigating to ${request.location}`,
    });

    if (request.latitude && request.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${request.latitude},${request.longitude}`;
      window.open(url, "_blank");
    } else {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(request.location)}`;
      window.open(url, "_blank");
    }
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      toast({
        title: "Dashboard Refreshed",
        description: "Latest supply request data loaded",
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
      case "assigned":
        return "bg-emergency-info";
      case "in-transit":
        return "bg-emergency-info";
      case "delivered":
        return "bg-emergency-resolved";
      default:
        return "bg-slate-500";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-emergency-danger";
      case "high":
        return "bg-emergency-warning";
      case "medium":
        return "bg-emergency-info";
      case "low":
        return "bg-slate-500";
      default:
        return "bg-slate-500";
    }
  };

  const vehicles = [
    { id: "AMB-001", name: "Ambulance Unit 1", available: true },
    { id: "AMB-002", name: "Ambulance Unit 2", available: true },
    { id: "TRUCK-001", name: "Medical Supply Truck 1", available: true },
    { id: "VAN-001", name: "Medical Transport Van", available: false },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hospital Management Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center">
                <Building2 className="mr-3 h-8 w-8 text-emergency-info" />
                Hospital Management Center
              </h2>
              <p className="text-slate-600">
                Manage medical equipment requests and dispatch services.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emergency-info">🏥</div>
              <div className="text-sm text-slate-500">Hospital Network</div>
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
              <div className="text-2xl font-bold text-emergency-warning">
                {supplyRequests.filter((r) => r.status === "pending").length}
              </div>
              <div className="text-sm text-slate-600">Pending Requests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-danger">
                {supplyRequests.filter((r) => r.urgency === "critical").length}
              </div>
              <div className="text-sm text-slate-600">Critical Urgency</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-info">
                {supplyRequests.filter((r) => r.status === "in-transit").length}
              </div>
              <div className="text-sm text-slate-600">In Transit</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-resolved">
                {
                  supplyRequests.filter(
                    (r) =>
                      r.status === "delivered" &&
                      new Date(r.updatedAt).toDateString() ===
                        new Date().toDateString(),
                  ).length
                }
              </div>
              <div className="text-sm text-slate-600">Delivered Today</div>
            </CardContent>
          </Card>
        </div>

        {/* Supply Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Package className="mr-2 h-5 w-5 text-emergency-info" />
                Active Supply Requests (
                {supplyRequests.filter((r) => r.status !== "delivered").length})
              </span>
              <div className="flex space-x-2">
                <Dialog open={newRequestOpen} onOpenChange={setNewRequestOpen}>
                  <DialogTrigger asChild>
                    <Button variant="info" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      New Request
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Supply Request</DialogTitle>
                      <DialogDescription>
                        Request medical supplies or equipment
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="itemName">Item Name</Label>
                        <Input
                          id="itemName"
                          placeholder="e.g., Blood Type O-, Ventilators"
                          value={newRequest.itemName}
                          onChange={(e) =>
                            setNewRequest((prev) => ({
                              ...prev,
                              itemName: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={newRequest.quantity}
                          onChange={(e) =>
                            setNewRequest((prev) => ({
                              ...prev,
                              quantity: parseInt(e.target.value) || 1,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="urgency">Urgency</Label>
                        <Select
                          value={newRequest.urgency}
                          onValueChange={(value) =>
                            setNewRequest((prev) => ({
                              ...prev,
                              urgency: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="location">Delivery Location</Label>
                        <Input
                          id="location"
                          placeholder="e.g., General Hospital, Emergency Wing"
                          value={newRequest.location}
                          onChange={(e) =>
                            setNewRequest((prev) => ({
                              ...prev,
                              location: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Input
                          id="notes"
                          placeholder="Additional details..."
                          value={newRequest.notes}
                          onChange={(e) =>
                            setNewRequest((prev) => ({
                              ...prev,
                              notes: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleCreateSupplyRequest}
                          className="flex-1"
                        >
                          Create Request
                        </Button>
                        <Button
                          onClick={() => setNewRequestOpen(false)}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => navigate("/hospital/supplies")}
                >
                  <Package className="mr-2 h-4 w-4" />
                  View All
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Monitor and manage medical supply requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-slate-400" />
                <p className="text-slate-600">Loading supply requests...</p>
              </div>
            ) : supplyRequests.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No supply requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {supplyRequests.slice(0, 5).map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-3 h-3 rounded-full ${getStatusColor(request.status)}`}
                      ></div>
                      <div>
                        <div className="font-medium text-slate-900">
                          {request.itemName} (x{request.quantity})
                        </div>
                        <div className="text-sm text-slate-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {request.location}
                        </div>
                        {request.notes && (
                          <div className="text-xs text-slate-500 mt-1">
                            {request.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge
                        className={`${getUrgencyColor(request.urgency)} text-white`}
                      >
                        {request.urgency}
                      </Badge>
                      <div className="text-sm text-slate-500 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(request.createdAt).toLocaleTimeString()}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleNavigateToLocation(request)}
                      >
                        <Navigation className="mr-2 h-4 w-4" />
                        Navigate
                      </Button>
                      {request.status === "pending" && (
                        <Dialog
                          open={
                            assignVehicleOpen && selectedRequest === request.id
                          }
                          onOpenChange={(open) => {
                            setAssignVehicleOpen(open);
                            if (open) setSelectedRequest(request.id);
                            else setSelectedRequest(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="info" size="sm">
                              <Truck className="mr-2 h-4 w-4" />
                              Assign Vehicle
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Vehicle</DialogTitle>
                              <DialogDescription>
                                Select a vehicle for delivery of{" "}
                                {request.itemName}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {vehicles.map((vehicle) => (
                                <div
                                  key={vehicle.id}
                                  className="flex items-center justify-between p-3 border rounded"
                                >
                                  <div>
                                    <div className="font-medium">
                                      {vehicle.name}
                                    </div>
                                    <div className="text-sm text-slate-600">
                                      {vehicle.id}
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    disabled={!vehicle.available}
                                    onClick={() =>
                                      handleAssignVehicle(
                                        request.id,
                                        vehicle.id,
                                      )
                                    }
                                  >
                                    {vehicle.available
                                      ? "Assign"
                                      : "Unavailable"}
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      <Select
                        onValueChange={(value) =>
                          handleUpdateStatus(request.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder={request.status} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="assigned">Assigned</SelectItem>
                          <SelectItem value="in-transit">In Transit</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
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
              <div className="bg-emergency-info/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Package className="h-8 w-8 text-emergency-info" />
              </div>
              <CardTitle>All Supply Requests</CardTitle>
              <CardDescription>
                View and manage all supply requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="info"
                onClick={() => navigate("/hospital/supplies")}
              >
                <Package className="mr-2 h-4 w-4" />
                View All Requests
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="bg-emergency-resolved/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Truck className="h-8 w-8 text-emergency-resolved" />
              </div>
              <CardTitle>Vehicle Fleet</CardTitle>
              <CardDescription>
                Manage hospital transport vehicles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="success"
                onClick={() => navigate("/hospital/supplies")}
              >
                <Truck className="mr-2 h-4 w-4" />
                Manage Fleet
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="bg-emergency-warning/10 p-4 rounded-full w-fit mx-auto mb-3">
                <MapPin className="h-8 w-8 text-emergency-warning" />
              </div>
              <CardTitle>Supply Locations</CardTitle>
              <CardDescription>
                View all supply locations on map
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="warning"
                onClick={() => navigate("/user/map")}
              >
                <MapPin className="mr-2 h-4 w-4" />
                View Map
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
