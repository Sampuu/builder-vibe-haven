import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertTriangle,
  MapPin,
  Phone,
  Plus,
  Newspaper,
  Map
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { UserDashboardService } from '@/lib/user-dashboard-db';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Track dashboard access on component mount
  useEffect(() => {
    if (user?.id) {
      UserDashboardService.trackDashboardAccess(user.id);
    }
  }, [user]);

  const handleReportDisaster = () => {
    navigate('/user/report');
  };

  const handleRequestHelp = () => {
    navigate('/user/help');
  };

  const handleViewMap = async () => {
    if (user?.id) {
      await UserDashboardService.trackMapView(user.id);
    }
    navigate('/user/map');
  };

  const handleNews = () => {
    navigate('/user/news');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Welcome to Your Dashboard, {user?.name || 'User'}
          </h2>
          <p className="text-slate-600">
            Report emergencies, request help, and stay informed about incidents in your area.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Report Disaster */}
          <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={handleReportDisaster}>
            <CardHeader className="text-center pb-3">
              <div className="bg-emergency-danger/10 p-4 rounded-full w-fit mx-auto mb-3">
                <AlertTriangle className="h-8 w-8 text-emergency-danger" />
              </div>
              <CardTitle className="text-lg text-slate-900">Report Disaster</CardTitle>
              <CardDescription>
                Report fires, accidents, or medical emergencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="danger">
                <Plus className="mr-2 h-4 w-4" />
                Report Now
              </Button>
            </CardContent>
          </Card>

          {/* Request Help */}
          <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={handleRequestHelp}>
            <CardHeader className="text-center pb-3">
              <div className="bg-emergency-resolved/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Phone className="h-8 w-8 text-emergency-resolved" />
              </div>
              <CardTitle className="text-lg text-slate-900">Request Help</CardTitle>
              <CardDescription>
                Request medical help or supplies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="success">
                <Phone className="mr-2 h-4 w-4" />
                Get Help
              </Button>
            </CardContent>
          </Card>

          {/* View Map */}
          <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={handleViewMap}>
            <CardHeader className="text-center pb-3">
              <div className="bg-emergency-info/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Map className="h-8 w-8 text-emergency-info" />
              </div>
              <CardTitle className="text-lg text-slate-900">View Map</CardTitle>
              <CardDescription>
                See danger zones and incidents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="info">
                <MapPin className="mr-2 h-4 w-4" />
                Open Map
              </Button>
            </CardContent>
          </Card>

          {/* Disaster News */}
          <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={handleNews}>
            <CardHeader className="text-center pb-3">
              <div className="bg-emergency-warning/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Newspaper className="h-8 w-8 text-emergency-warning" />
              </div>
              <CardTitle className="text-lg text-slate-900">Disaster News</CardTitle>
              <CardDescription>
                Read and post disaster updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="warning">
                <Newspaper className="mr-2 h-4 w-4" />
                View News
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Incidents Map Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-emergency-info" />
              Incidents Near You
            </CardTitle>
            <CardDescription>
              Interactive map showing reported incidents and danger zones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-100 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-slate-300">
              <div className="text-center text-slate-500">
                <Map className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="font-medium">Interactive Map</p>
                <p className="text-sm">Click "Open Map" above to view incidents and submit reports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Status Legend */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Status Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emergency-danger rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Critical Emergency</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emergency-warning rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Warning Alert</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emergency-resolved rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Resolved/Safe</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emergency-info rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Information</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Firebase Integration Status */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">🔥 Firebase Integration Active</CardTitle>
            <CardDescription className="text-green-700">
              Your data is now securely stored in Firebase Firestore with role-based access control and analytics tracking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-green-800">Report Disaster</div>
                <div className="text-green-600">Sub-collection active</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-green-800">Request Help</div>
                <div className="text-green-600">Sub-collection active</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-green-800">View Map</div>
                <div className="text-green-600">Read-only access</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-green-800">Disaster News</div>
                <div className="text-green-600">Sub-collection active</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
