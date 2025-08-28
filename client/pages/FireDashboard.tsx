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
import { Flame, MapPin, AlertTriangle, Bell } from "lucide-react";
import NotificationCenter, {
  NotificationBell,
} from "@/components/NotificationCenter";

export default function FireDashboard() {
  const navigate = useNavigate();
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center">
                <Flame className="mr-3 h-8 w-8 text-emergency-warning" />
                Fire Brigade Command
              </h2>
              <p className="text-slate-600">
                Monitor and respond to fire-related emergencies.
              </p>
            </div>
            <NotificationBell department="fire" />
          </div>
        </div>

        {/* Emergency Notifications */}
        <NotificationCenter
          department="fire"
          showUnreadOnly={false}
          maxHeight="300px"
        />

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="bg-emergency-warning/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Flame className="h-8 w-8 text-emergency-warning" />
              </div>
              <CardTitle>Fire Incidents</CardTitle>
              <CardDescription>
                View fire-related incidents only
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="warning"
                onClick={() => navigate("/fire/incidents")}
              >
                View Incidents
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="bg-emergency-info/10 p-4 rounded-full w-fit mx-auto mb-3">
                <MapPin className="h-8 w-8 text-emergency-info" />
              </div>
              <CardTitle>Fire Location Map</CardTitle>
              <CardDescription>Navigate to fire locations</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="info"
                onClick={() => navigate("/fire/incidents")}
              >
                Open Map
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="bg-emergency-resolved/10 p-4 rounded-full w-fit mx-auto mb-3">
                <AlertTriangle className="h-8 w-8 text-emergency-resolved" />
              </div>
              <CardTitle>Update Status</CardTitle>
              <CardDescription>
                Dispatched / Active / Controlled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="success">
                Update Status
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-12 text-center text-slate-500">
            <Flame className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">Fire Brigade Dashboard</p>
            <p>Detailed fire incident management will be implemented here</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
