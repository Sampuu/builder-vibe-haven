import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowLeft,
  UserPlus,
  Check,
  X,
  Shield,
} from "lucide-react";
import { useAuth, UserRole } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user" as UserRole,
    phoneNumber: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const { signup, isFirebaseConnected, isDevelopmentMode } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation errors as user types
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Clear general error
    if (error) {
      setError("");
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await signup(
        formData.email,
        formData.password,
        formData.name,
        formData.role,
        formData.phoneNumber || undefined,
      );

      if (success) {
        // Show success message briefly then redirect
        setError("");
        setTimeout(() => {
          navigate(`/dashboard/${formData.role}`);
        }, 1000);
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    {
      value: "user",
      label: "User",
      description: "Report disasters & request help",
      icon: "👤",
    },
    {
      value: "police",
      label: "Police",
      description: "Monitor & coordinate response",
      icon: "👮",
    },
    {
      value: "fire",
      label: "Fire Brigade",
      description: "Handle fire emergencies",
      icon: "🚒",
    },
    {
      value: "ambulance",
      label: "Ambulance",
      description: "Medical emergency response",
      icon: "🚑",
    },
    {
      value: "hospital",
      label: "Hospital",
      description: "Medical supplies & dispatch",
      icon: "🏥",
    },
    {
      value: "admin",
      label: "Admin",
      description: "Full system access",
      icon: "⚙️",
    },
  ];

  const getFieldError = (field: string) => validationErrors[field];
  const hasFieldError = (field: string) => !!validationErrors[field];

  // Get authentication mode for display
  const getAuthMode = () => {
    if (isDevelopmentMode && !isFirebaseConnected) {
      return {
        label: "Mock Auth",
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: Shield,
      };
    } else if (isFirebaseConnected) {
      return {
        label: "Firebase",
        color: "bg-green-100 text-green-700 border-green-200",
        icon: Check,
      };
    } else {
      return {
        label: "Offline Mode",
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: Shield,
      };
    }
  };

  const authMode = getAuthMode();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 p-2 hover:bg-white/60"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            {/* Connection Status */}
            <div className="flex justify-center mb-2">
              <Badge
                variant="secondary"
                className={`flex items-center gap-1 ${authMode.color}`}
              >
                <authMode.icon className="h-3 w-3" />
                {authMode.label}
              </Badge>
            </div>

            <div className="flex justify-center mb-4">
              <div className="bg-emergency-info/10 p-3 rounded-full">
                <UserPlus className="h-8 w-8 text-emergency-info" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              Create Account
            </CardTitle>
            <CardDescription className="text-slate-600">
              Join the emergency response network
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Mode Info */}
            {isDevelopmentMode && !isFirebaseConnected && (
              <Alert className="mb-4 border-blue-200 bg-blue-50">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  <strong>Development Mode:</strong> Using secure mock
                  authentication. All features are fully functional for testing.
                </AlertDescription>
              </Alert>
            )}

            {isFirebaseConnected && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  <strong>Firebase Connected:</strong> Using real Firebase
                  authentication and database.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <X className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  className={
                    hasFieldError("name")
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }
                  required
                />
                {hasFieldError("name") && (
                  <p className="text-sm text-red-600">
                    {getFieldError("name")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                  className={
                    hasFieldError("email")
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }
                  required
                />
                {hasFieldError("email") && (
                  <p className="text-sm text-red-600">
                    {getFieldError("email")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <span>{option.icon}</span>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-slate-500">
                              {option.description}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder="Create a password (min 6 characters)"
                  className={
                    hasFieldError("password")
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }
                  required
                  minLength={6}
                />
                {hasFieldError("password") && (
                  <p className="text-sm text-red-600">
                    {getFieldError("password")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  placeholder="Confirm your password"
                  className={
                    hasFieldError("confirmPassword")
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }
                  required
                />
                {hasFieldError("confirmPassword") && (
                  <p className="text-sm text-red-600">
                    {getFieldError("confirmPassword")}
                  </p>
                )}
              </div>

              {(formData.role === "police" ||
                formData.role === "admin" ||
                formData.role === "fire" ||
                formData.role === "ambulance") && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Emergency service roles require additional verification in
                    production environments.
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Button
                  variant="link"
                  onClick={() => navigate("/login")}
                  className="p-0 h-auto text-primary hover:text-primary/80"
                >
                  Login here
                </Button>
              </p>
            </div>

            {/* Development/Testing Info */}
            {isDevelopmentMode && !isFirebaseConnected && (
              <div className="mt-6 p-4 bg-slate-50 rounded-lg border">
                <h4 className="text-sm font-medium text-slate-900 mb-2">
                  🧪 Testing Mode
                </h4>
                <p className="text-xs text-slate-600 mb-2">
                  Create accounts instantly with any email and password (min 6
                  characters).
                </p>
                <p className="text-xs text-slate-500">
                  Example: <code>test@example.com</code> with password{" "}
                  <code>123456</code>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
