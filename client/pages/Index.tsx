import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Users, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { getRoleDashboardPath } from "@/lib/navigation-utils";

export default function Index() {
  const navigate = useNavigate();

  // Use try-catch to handle potential auth context issues
  let user = null;
  let isLoading = true;

  try {
    const authContext = useAuth();
    user = authContext.user;
    isLoading = authContext.isLoading;
  } catch (error) {
    console.warn('Auth context not available:', error);
    // If auth context is not available, treat as logged out
    isLoading = false;
  }

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect authenticated users to their dashboard
      const dashboardPath = getRoleDashboardPath(user.role);
      navigate(dashboardPath);
    }
  }, [user, isLoading, navigate]);

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Icon and Title */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-emergency-danger/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-white p-4 rounded-full shadow-lg border border-emergency-danger/20">
                <AlertTriangle className="h-12 w-12 text-emergency-danger" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Disaster Management &amp;
            <span className="block text-emergency-danger">
              Emergency Response System
            </span>
          </h1>

          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            A comprehensive platform connecting emergency responders, healthcare
            facilities, and citizens for rapid disaster response and coordinated
            emergency management.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              variant="danger"
              onClick={handleSignUp}
              className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Users className="mr-2 h-5 w-5" />
              Sign Up
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleLogin}
              className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2"
            >
              <Shield className="mr-2 h-5 w-5" />
              Login
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-emergency-danger/10 p-3 rounded-lg w-fit mb-4">
              <AlertTriangle className="h-6 w-6 text-emergency-danger" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Emergency Reporting
            </h3>
            <p className="text-slate-600">
              Quick incident reporting and real-time updates for all emergency
              situations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-emergency-info/10 p-3 rounded-lg w-fit mb-4">
              <Shield className="h-6 w-6 text-emergency-info" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Coordinated Response
            </h3>
            <p className="text-slate-600">
              Multi-agency coordination between police, fire, medical, and
              administrative teams.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-emergency-resolved/10 p-3 rounded-lg w-fit mb-4">
              <MapPin className="h-6 w-6 text-emergency-resolved" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Real-time Tracking
            </h3>
            <p className="text-slate-600">
              GPS-enabled incident tracking and resource deployment monitoring.
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mt-16 flex justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <div className="flex items-center gap-6 text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emergency-danger rounded-full"></div>
                <span className="text-slate-700">Danger</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emergency-warning rounded-full"></div>
                <span className="text-slate-700">Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emergency-resolved rounded-full"></div>
                <span className="text-slate-700">Resolved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emergency-info rounded-full"></div>
                <span className="text-slate-700">Info</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
