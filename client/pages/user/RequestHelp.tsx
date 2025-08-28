import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Phone,
  ArrowLeft,
  Heart,
  Package,
  Truck,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { createHelpRequest } from "@/lib/incident-service";
import {
  sendHelpRequestNotification,
  DEPARTMENT_CONTACTS,
  getHelpRequestRouting,
} from "@/lib/notification-service";

export default function RequestHelp() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: "medical" as "medical" | "supplies" | "transport" | "other",
    urgency: "medium" as "low" | "medium" | "high" | "critical",
    description: "",
    location: "",
    contactPhone: "",
    specialRequests: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notifiedDepartments, setNotifiedDepartments] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setIsSubmitting(true);

    try {
      // Create help request
      const helpRequest = await createHelpRequest({
        type: formData.type,
        urgency: formData.urgency,
        description: formData.description,
        location: formData.location,
        requesterUserId: user.id,
        requesterName: user.name,
        requesterPhone: formData.contactPhone,
        status: "submitted",
        specialRequests: formData.specialRequests,
      });

      console.log("✅ Help request created:", helpRequest.id);

      // Send notifications to relevant departments
      const notification = await sendHelpRequestNotification(helpRequest);
      console.log(
        "✅ Help request notifications sent to:",
        notification.targetDepartments.join(", "),
      );

      // Get department names for display
      const departments = getHelpRequestRouting(
        formData.type,
        formData.urgency,
      );
      const departmentNames = departments.map(
        (dept) => DEPARTMENT_CONTACTS[dept]?.name || dept,
      );
      setNotifiedDepartments(departmentNames);

      console.log(`🆘 HELP REQUEST SENT TO: ${departmentNames.join(", ")}`);
      console.log(`📍 Location: ${formData.location}`);
      console.log(`📞 Contact: ${formData.contactPhone}`);
      console.log(`⚠️ Urgency: ${formData.urgency.toUpperCase()}`);

      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit help request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto mt-12">
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-emergency-resolved mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Help Request Submitted Successfully
              </h2>
              <p className="text-slate-600 mb-4">
                Your help request has been sent to the appropriate departments.
              </p>

              <Alert className="border-green-200 bg-green-50 mb-6">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-800">
                  <strong>🆘 HELP REQUEST SENT!</strong>
                  <br />
                  <span className="text-sm mt-1 block">
                    Notified departments: {notifiedDepartments.join(", ")}
                  </span>
                </AlertDescription>
              </Alert>

              <div className="bg-slate-50 p-4 rounded-lg mb-6 text-left">
                <h4 className="font-medium text-slate-900 mb-2">
                  What happens next:
                </h4>
                <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                  <li>Medical personnel have been notified</li>
                  <li>Response teams will coordinate assistance</li>
                  <li>You may receive a call to confirm details</li>
                  <li>Track the status in your dashboard</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard/user")}
                  className="flex-1"
                >
                  Back to Dashboard
                </Button>
                <Button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      type: "medical",
                      urgency: "medium",
                      description: "",
                      location: "",
                      contactPhone: "",
                      specialRequests: "",
                    });
                  }}
                  className="flex-1"
                >
                  Submit Another Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard/user")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <Phone className="mr-3 h-8 w-8 text-emergency-resolved" />
              Request Medical Help
            </h1>
            <p className="text-slate-600">
              Request medical assistance and emergency supplies
            </p>
          </div>
        </div>

        <Alert className="border-emergency-danger bg-emergency-danger/5">
          <Heart className="h-4 w-4" />
          <AlertDescription className="text-emergency-danger font-medium">
            For life-threatening emergencies, call 911 immediately.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Help Request Form</CardTitle>
              <CardDescription>
                Request medical assistance or emergency supplies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type of Help Needed</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select help type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medical">
                        Medical Assistance
                      </SelectItem>
                      <SelectItem value="supplies">
                        Emergency Supplies
                      </SelectItem>
                      <SelectItem value="transport">
                        Medical Transport
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select
                    value={formData.urgency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, urgency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Can wait</SelectItem>
                      <SelectItem value="medium">
                        Medium - Needed soon
                      </SelectItem>
                      <SelectItem value="high">High - Urgent</SelectItem>
                      <SelectItem value="critical">
                        Critical - Emergency
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe what help you need..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="Your current address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPhone: e.target.value })
                    }
                    placeholder="Your phone number"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  variant="success"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <Phone className="mr-2 h-4 w-4" />
                      Submit Help Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="mr-2 h-5 w-5 text-emergency-resolved" />
                  Medical Assistance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• First aid and medical care</li>
                  <li>• Emergency medical evaluation</li>
                  <li>• Medication assistance</li>
                  <li>• Medical equipment</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5 text-emergency-info" />
                  Emergency Supplies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Food and water</li>
                  <li>• Blankets and shelter</li>
                  <li>• Basic medical supplies</li>
                  <li>• Emergency equipment</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="mr-2 h-5 w-5 text-emergency-warning" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Emergency Services</span>
                  <Button size="sm" variant="danger">
                    911
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Poison Control</span>
                  <Button size="sm" variant="outline">
                    1-800-222-1222
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
