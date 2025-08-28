import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell,
  CheckCircle,
  Users,
  Database,
  Zap,
  Shield,
  Eye,
  Settings,
  Heart,
  Fire,
  Truck,
  Building2
} from 'lucide-react';

export default function NotificationSystemSummary() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-500" />
            Emergency Notification System
          </CardTitle>
          <CardDescription>
            Comprehensive real-time notification system for emergency response coordination
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* System Overview */}
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>System Status: ACTIVE</strong> - The notification system is running and monitoring 
              all database collections for emergency events.
            </AlertDescription>
          </Alert>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-6 w-6 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-blue-900">Real-Time Monitoring</h4>
                    <p className="text-sm text-blue-700">
                      Instantly detects new emergencies and database changes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-purple-600" />
                  <div>
                    <h4 className="font-medium text-purple-900">Smart Routing</h4>
                    <p className="text-sm text-purple-700">
                      Automatically routes alerts to appropriate emergency teams
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-orange-600" />
                  <div>
                    <h4 className="font-medium text-orange-900">Priority System</h4>
                    <p className="text-sm text-orange-700">
                      Critical alerts get immediate attention and visibility
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Eye className="h-6 w-6 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-900">Live Dashboard</h4>
                    <p className="text-sm text-green-700">
                      Real-time notification center with read/unread tracking
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notification Routing Rules */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Automatic Notification Routing
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Heart className="h-5 w-5 text-red-500" />
                    <h4 className="font-medium">Medical Emergencies</h4>
                    <Badge variant="destructive" className="text-xs">Critical</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-blue-500" />
                      <span>Ambulance Services</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-green-500" />
                      <span>Hospital Staff</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      Includes: Medical help requests, critical health emergencies
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Fire className="h-5 w-5 text-orange-500" />
                    <h4 className="font-medium">Fire Emergencies</h4>
                    <Badge variant="destructive" className="text-xs">Critical</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Fire className="h-4 w-4 text-orange-500" />
                      <span>Fire Department</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span>Police Force</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      Includes: Building fires, wildfire reports, smoke alerts
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Truck className="h-5 w-5 text-blue-500" />
                    <h4 className="font-medium">Traffic & Accidents</h4>
                    <Badge variant="secondary" className="text-xs">High</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span>Police Force</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-blue-500" />
                      <span>Ambulance Services</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      Includes: Vehicle accidents, road incidents, traffic emergencies
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Database className="h-5 w-5 text-yellow-500" />
                    <h4 className="font-medium">Supply Requests</h4>
                    <Badge variant="secondary" className="text-xs">Medium</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-green-500" />
                      <span>Hospital Staff</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span>Administrative Team</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      Includes: Medical supplies, emergency equipment requests
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Technical Details */}
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              <strong>Technical Implementation:</strong>
              <div className="mt-2 space-y-1 text-sm">
                <div>• <strong>Real-time Listeners:</strong> Firebase onSnapshot for instant database monitoring</div>
                <div>• <strong>Smart Filtering:</strong> Only processes new entries (last 5 minutes)</div>
                <div>• <strong>Role-based Routing:</strong> Notifications sent based on user roles and incident types</div>
                <div>• <strong>Persistent Storage:</strong> All notifications stored in dedicated Firestore collection</div>
                <div>• <strong>Priority System:</strong> Critical, High, Medium, Low priority levels</div>
                <div>• <strong>Action Integration:</strong> Notifications link directly to relevant dashboards</div>
              </div>
            </AlertDescription>
          </Alert>

          {/* How to Use */}
          <Alert className="border-blue-500 bg-blue-50">
            <Bell className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>How to Use:</strong>
              <div className="mt-2 space-y-1 text-sm">
                <div>1. <strong>Bell Icon:</strong> Check the notification bell in the header for new alerts</div>
                <div>2. <strong>Badge Count:</strong> Red badge shows number of unread notifications</div>
                <div>3. <strong>Dropdown:</strong> Click bell to see recent notifications</div>
                <div>4. <strong>Full View:</strong> Click "View All" to see complete notification center</div>
                <div>5. <strong>Actions:</strong> Click notifications to navigate to relevant dashboard</div>
                <div>6. <strong>Testing:</strong> Use the demo scenarios below to test the system</div>
              </div>
            </AlertDescription>
          </Alert>

        </CardContent>
      </Card>
    </div>
  );
}
