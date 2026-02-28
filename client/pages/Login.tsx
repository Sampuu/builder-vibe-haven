import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, LogIn, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { firebaseAuth, LoginData } from "@/lib/firebase-auth";
import FirebaseDebug from "@/components/FirebaseDebug";

export default function Login() {
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof LoginData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent, isRetry: boolean = false) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    if (isRetry) {
      setIsRetrying(true);
    } else {
      setIsSubmitting(true);
      setRetryCount(0);
    }

    try {
      const result = await firebaseAuth.login(formData);

      if (result.success && result.data) {
        // Login successful - redirect to appropriate dashboard based on user's role
        navigate(`/dashboard/${result.data.role}`);
      } else {
        const errorMsg = result.error || "Login failed";
        setError(errorMsg);

        // If it's a network error and we haven't retried too many times
        if (errorMsg.includes("Network") || errorMsg.includes("connection")) {
          setRetryCount((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg = "An unexpected error occurred. Please try again.";
      setError(errorMsg);
      setRetryCount((prev) => prev + 1);
    } finally {
      setIsSubmitting(false);
      setIsRetrying(false);
    }
  };

  const handleRetry = () => {
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(fakeEvent, true);
  };

  // Role is now determined from the user's account, not selected during login

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
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="border-emergency-danger bg-emergency-danger/5">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-emergency-danger">
                    <div className="space-y-2">
                      <div>{error}</div>
                      {(error.includes("Network") ||
                        error.includes("connection")) &&
                        retryCount < 3 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRetry}
                            disabled={isRetrying}
                            className="text-xs"
                          >
                            {isRetrying ? (
                              <>
                                <div className="mr-1 h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                                Retrying...
                              </>
                            ) : (
                              "Try Again"
                            )}
                          </Button>
                        )}
                      {retryCount >= 3 && (
                        <div className="text-xs text-emergency-danger/80">
                          Multiple attempts failed. Please check your internet
                          connection or try again later.
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email address"
                  className={
                    validationErrors.email ? "border-emergency-danger" : ""
                  }
                />
                {validationErrors.email && (
                  <p className="text-sm text-emergency-danger">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="Enter your password"
                    className={`pr-10 ${validationErrors.password ? "border-emergency-danger" : ""}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {validationErrors.password && (
                  <p className="text-sm text-emergency-danger">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div>
                    <div>Your role and permissions are determined by your account.</div>
                    <div className="mt-2 text-xs">
                      <strong>Test Account:</strong><br/>
                      Email: test@rescue.com<br/>
                      Password: test123
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full"
                  variant="danger"
                  disabled={isSubmitting || isRetrying}
                >
                  {isSubmitting || isRetrying ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {isRetrying ? "Retrying..." : "Signing In..."}
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    console.log('Testing Firebase auth directly...');
                    setError('');
                    setIsSubmitting(true);
                    try {
                      const result = await firebaseAuth.login({
                        email: 'test@rescue.com',
                        password: 'test123'
                      });
                      console.log('Test login result:', result);
                      if (result.success) {
                        alert('Login successful! Redirecting...');
                        navigate('/dashboard/user');
                      } else {
                        setError(`Test failed: ${result.error}`);
                      }
                    } catch (err) {
                      console.error('Test login error:', err);
                      setError(`Test error: ${err}`);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting}
                >
                  🧪 Test Login (Debug)
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Button
                  variant="link"
                  onClick={() => navigate("/signup")}
                  className="p-0 h-auto text-emergency-danger hover:text-emergency-danger/80"
                >
                  Sign up here
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Temporary Debug Component */}
        <div className="mt-8">
          <FirebaseDebug />
        </div>
      </div>
    </div>
  );
}
