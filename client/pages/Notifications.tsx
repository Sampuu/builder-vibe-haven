import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import NotificationCenter from "@/components/NotificationCenter";

export default function Notifications() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              All Notifications
            </h1>
            <p className="text-slate-600">
              View and manage all your emergency alerts and notifications
            </p>
          </div>
        </div>

        {/* Full Notification Center */}
        <NotificationCenter maxHeight="70vh" />
      </div>
    </DashboardLayout>
  );
}
