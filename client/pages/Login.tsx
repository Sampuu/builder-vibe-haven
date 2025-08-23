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
import { AlertTriangle, ArrowLeft, Cloud, WifiOff } from "lucide-react";
import { useAuth, UserRole } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isFirebaseConnected } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!email || !password || !role) {
      setError("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const success = await login(email, password, role);

      if (success) {
        // Redirect to appropriate dashboard based on role
        navigate(`/dashboard/${role}`);
      } else {
        setError("Invalid credentials or role mismatch. Please try again.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    {
      value: "user",
      label: "User",
      description: "Report disasters & request help",
    },
    {
      value: "police",
      label: "Police",
      description: "Monitor & coordinate response",
    },
    {
      value: "fire",
      label: "Fire Brigade",
      description: "Handle fire emergencies",
    },
    {
      value: "ambulance",
      label: "Ambulance",
      description: "Medical emergency response",
    },
    {
      value: "hospital",
      label: "Hospital",
      description: "Medical supplies & dispatch",
    },
    { value: "admin", label: "Admin", description: "Full system access" },
  ];

  // Demo credentials for different roles
  const demoCredentials = [
    { role: "user", email: "user@demo.com", password: "demo123" },
    { role: "police", email: "police@demo.com", password: "demo123" },
    { role: "fire", email: "fire@demo.com", password: "demo123" },
    { role: "ambulance", email: "ambulance@demo.com", password: "demo123" },
    { role: "hospital", email: "hospital@demo.com", password: "demo123" },
    { role: "admin", email: "admin@demo.com", password: "demo123" },
  ];

  const fillDemoCredentials = (demoRole: UserRole) => {
    const creds = demoCredentials.find((c) => c.role === demoRole);
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password);
      setRole(demoRole);
    }
  };

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
                variant={isFirebaseConnected ? "secondary" : "outline"}
                className={`flex items-center gap-1 ${
                  isFirebaseConnected
                    ? "bg-green-100 text-green-700 border-green-200"
                    : "bg-yellow-100 text-yellow-700 border-yellow-200"
                }`}
              >
                {isFirebaseConnected ? (
                  <>
                    <Cloud className="h-3 w-3" />
                    Firebase Connected
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    Demo Mode
                  </>
                )}
              </Badge>
            </div>

            <div className="flex justify-center mb-4">
              <div className="bg-emergency-danger/10 p-3 rounded-full">
                <AlertTriangle className="h-8 w-8 text-emergency-danger" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              Login to System
            </CardTitle>
            <CardDescription className="text-slate-600">
              Access your emergency response dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Connection Info */}
            {!isFirebaseConnected && (
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Demo Mode:</strong> Use demo credentials below or
                  create a new account.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={role}
                  onValueChange={(value) => setRole(value as UserRole)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-slate-500">
                            {option.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {(role === "police" || role === "admin") && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This role requires enhanced security authentication in
                    production.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                variant="default"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>

            {/* Demo Credentials */}
            {!isFirebaseConnected && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-3">
                  Demo Credentials
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {demoCredentials.slice(0, 4).map((cred) => (
                    <Button
                      key={cred.role}
                      variant="outline"
                      size="sm"
                      onClick={() => fillDemoCredentials(cred.role as UserRole)}
                      className="text-xs h-8"
                    >
                      {cred.role}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {demoCredentials.slice(4).map((cred) => (
                    <Button
                      key={cred.role}
                      variant="outline"
                      size="sm"
                      onClick={() => fillDemoCredentials(cred.role as UserRole)}
                      className="text-xs h-8"
                    >
                      {cred.role}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  All demo accounts use password: <code>demo123</code>
                </p>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Button
                  variant="link"
                  onClick={() => navigate("/signup")}
                  className="p-0 h-auto text-primary hover:text-primary/80"
                >
                  Sign up here
                </Button>
              </p>
            </div>

            {/* Development Info */}
            {!isFirebaseConnected && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="text-sm font-medium text-yellow-900 mb-1">
                  Development Mode
                </h4>
                <p className="text-xs text-yellow-700">
                  To connect to Firebase, set up your project and run:{" "}
                  <code>firebase emulators:start</code>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
