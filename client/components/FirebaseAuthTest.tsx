import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertTriangle,
  UserPlus,
  LogIn,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { firebaseAuth, SignupData } from "@/lib/firebase-auth";

export default function FirebaseAuthTest() {
  const { user, logout, isLoading } = useAuth();
  const [testEmail, setTestEmail] = useState("test@example.com");
  const [testPassword, setTestPassword] = useState("Test123!");
  const [testName, setTestName] = useState("Test User");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleTestSignup = async () => {
    setTesting(true);
    clearMessages();

    try {
      const signupData: SignupData = {
        email: testEmail,
        password: testPassword,
        name: testName,
        role: "user",
      };

      const result = await firebaseAuth.signup(signupData);

      if (result.success) {
        setSuccess("Test account created successfully!");
      } else {
        setError(result.error || "Failed to create test account");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setTesting(false);
    }
  };

  const handleTestLogin = async () => {
    setTesting(true);
    clearMessages();

    try {
      const result = await firebaseAuth.login({
        email: testEmail,
        password: testPassword,
      });

      if (result.success) {
        setSuccess("Login successful!");
      } else {
        setError(result.error || "Failed to login");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setTesting(false);
    }
  };

  const handleTestLogout = async () => {
    setTesting(true);
    clearMessages();

    try {
      await logout();
      setSuccess("Logout successful!");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Firebase Authentication Test
          </CardTitle>
          <CardDescription>
            Test Firebase authentication functionality with signup, login, and
            logout
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current User Status */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium mb-2">Current Authentication Status</h4>
            {isLoading ? (
              <p className="text-slate-600">Loading...</p>
            ) : user ? (
              <div className="space-y-2">
                <div className="flex items-center text-emergency-resolved">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  <span className="font-medium">Authenticated</span>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <p>
                    <strong>ID:</strong> {user.id}
                  </p>
                  <p>
                    <strong>Name:</strong> {user.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Role:</strong>{" "}
                    <span className="capitalize font-medium">{user.role}</span>
                  </p>
                  <p>
                    <strong>Phone:</strong> {user.phone || "Not provided"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center text-slate-500">
                <AlertTriangle className="mr-2 h-4 w-4" />
                <span>Not authenticated</span>
              </div>
            )}
          </div>

          {/* Test Controls */}
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="testEmail">Test Email</Label>
                <Input
                  id="testEmail"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="testPassword">Test Password</Label>
                <Input
                  id="testPassword"
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="Password123!"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="testName">Test Name</Label>
                <Input
                  id="testName"
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="Test User"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleTestSignup}
                disabled={testing || !!user}
                variant="success"
                size="sm"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {testing ? "Testing..." : "Test Signup"}
              </Button>

              <Button
                onClick={handleTestLogin}
                disabled={testing || !!user}
                variant="info"
                size="sm"
              >
                <LogIn className="mr-2 h-4 w-4" />
                {testing ? "Testing..." : "Test Login"}
              </Button>

              <Button
                onClick={handleTestLogout}
                disabled={testing || !user}
                variant="outline"
                size="sm"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {testing ? "Testing..." : "Test Logout"}
              </Button>
            </div>

            {error && (
              <Alert className="border-emergency-danger bg-emergency-danger/5">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-emergency-danger">
                  <strong>Error:</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-emergency-resolved bg-emergency-resolved/5">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-emergency-resolved">
                  <strong>Success:</strong> {success}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Instructions */}
          <div className="text-sm text-slate-600 space-y-2">
            <p>
              <strong>Testing Instructions:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Use "Test Signup" to create a new Firebase user account</li>
              <li>Use "Test Login" to authenticate with the created account</li>
              <li>Use "Test Logout" to sign out of the current session</li>
              <li>Check the browser's Network tab to see Firebase API calls</li>
              <li>Verify user data is stored in Firestore database</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
