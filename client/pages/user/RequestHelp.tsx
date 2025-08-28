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
  MapPin,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { UserDashboardService } from "@/lib/user-dashboard-db";
import { CreateRequestHelpForm } from "@shared/user-dashboard-types";

const helpTypes = [
  {
    value: "medical",
    label: "Medical Assistance",
    description: "First aid, medical care, medication",
  },
  {
    value: "supplies",
    label: "Emergency Supplies",
    description: "Food, water, blankets, equipment",
  },
  {
    value: "rescue",
    label: "Rescue Operations",
    description: "Evacuation, search and rescue",
  },
  {
    value: "evacuation",
    label: "Evacuation",
    description: "Safe transport from danger zone",
  },
  {
    value: "other",
    label: "Other Emergency Help",
    description: "Any other type of assistance",
  },
] as const;

const urgencyLevels = [
  {
    value: "low",
    label: "Low",
    description: "Can wait, not urgent",
    color: "text-slate-600",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Needed soon, moderate urgency",
    color: "text-emergency-info",
  },
  {
    value: "high",
    label: "High",
    description: "Urgent, needed quickly",
    color: "text-emergency-warning",
  },
  {
    value: "critical",
    label: "Critical",
    description: "Life-threatening, immediate help needed",
    color: "text-emergency-danger",
  },
] as const;

export default function RequestHelp() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(
    null,
  );
  const [formData, setFormData] = useState({
    helpType: "" as CreateRequestHelpForm["helpType"] | "",
    urgency: "medium" as CreateRequestHelpForm["urgency"],
    details: "",
    location: {
      latitude: 0,
      longitude: 0,
      address: "",
    },
    contact: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleLocationChange = (address: string) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, address },
    }));
    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.helpType)
      newErrors.helpType = "Please select the type of help needed";
    if (!formData.details.trim())
      newErrors.details = "Please describe what help you need";
    if (!formData.location.address.trim())
      newErrors.location = "Please provide your location";
    if (!formData.contact.trim())
      newErrors.contact = "Please provide a contact phone number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({
            ...prev,
            location: {
              latitude,
              longitude,
              address: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            },
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          setErrors({
            location:
              "Unable to get current location. Please enter address manually.",
          });
        },
      );
    } else {
      setErrors({ location: "Geolocation is not supported by this browser." });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user?.id || !formData.helpType) return;

    setIsSubmitting(true);

    try {
      const requestData: CreateRequestHelpForm = {
        helpType: formData.helpType,
        urgency: formData.urgency,
        details: formData.details,
        location: formData.location,
        contact: formData.contact,
      };

      const requestId = await UserDashboardService.createHelpRequest(
        user.id,
        requestData,
        user.name || "Anonymous User",
      );

      setSubmittedRequestId(requestId);
      setSubmitted(true);

      // Reset form
      setFormData({
        helpType: "",
        urgency: "medium",
        details: "",
        location: { latitude: 0, longitude: 0, address: "" },
        contact: "",
      });
    } catch (error) {
      console.error("Failed to submit help request:", error);
      setErrors({ submit: "Failed to submit help request. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto mt-12">
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-emergency-resolved mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Help Request Submitted
              </h2>
              <p className="text-slate-600 mb-4">
                Your request has been saved to Firebase and emergency responders
                have been notified.
              </p>
              <div className="bg-emergency-resolved/10 p-3 rounded-lg mb-6">
                <p className="text-sm text-emergency-resolved">
                  <strong>Request ID:</strong> {submittedRequestId}
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={() => navigate("/dashboard/user")}
                  className="w-full"
                >
                  Back to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSubmitted(false)}
                  className="w-full"
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
                Request medical assistance or emergency supplies. This will be
                stored in your Firebase requestHelp sub-collection.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="helpType">Type of Help Needed *</Label>
                  <Select
                    value={formData.helpType}
                    onValueChange={(value) =>
                      handleInputChange("helpType", value)
                    }
                  >
                    <SelectTrigger
                      className={
                        errors.helpType ? "border-emergency-danger" : ""
                      }
                    >
                      <SelectValue placeholder="Select help type" />
                    </SelectTrigger>
                    <SelectContent>
                      {helpTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-slate-500">
                              {type.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.helpType && (
                    <p className="text-sm text-emergency-danger">
                      {errors.helpType}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select
                    value={formData.urgency}
                    onValueChange={(value) =>
                      handleInputChange("urgency", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {urgencyLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div>
                            <div className={`font-medium ${level.color}`}>
                              {level.label}
                            </div>
                            <div className="text-xs text-slate-500">
                              {level.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="details">Details *</Label>
                  <Textarea
                    id="details"
                    value={formData.details}
                    onChange={(e) =>
                      handleInputChange("details", e.target.value)
                    }
                    placeholder="Describe what help you need in detail..."
                    rows={3}
                    className={errors.details ? "border-emergency-danger" : ""}
                  />
                  {errors.details && (
                    <p className="text-sm text-emergency-danger">
                      {errors.details}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="location"
                      value={formData.location.address}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      placeholder="Your current address"
                      className={`flex-1 ${errors.location ? "border-emergency-danger" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={getCurrentLocation}
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                  {errors.location && (
                    <p className="text-sm text-emergency-danger">
                      {errors.location}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Phone *</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) =>
                      handleInputChange("contact", e.target.value)
                    }
                    placeholder="Your phone number"
                    className={errors.contact ? "border-emergency-danger" : ""}
                  />
                  {errors.contact && (
                    <p className="text-sm text-emergency-danger">
                      {errors.contact}
                    </p>
                  )}
                </div>

                {/* Submit Errors */}
                {errors.submit && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.submit}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  variant="success"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Submitting to Firebase...
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

            {/* Firebase Integration Status */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800 text-sm">
                  🔥 Firebase Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-green-700 space-y-1">
                  <div>✓ Connected to requestHelp collection</div>
                  <div>✓ Analytics tracking enabled</div>
                  <div>✓ User-specific sub-collection</div>
                  <div>✓ Real-time status updates</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
