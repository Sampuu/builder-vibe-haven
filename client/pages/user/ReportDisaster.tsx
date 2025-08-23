import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import DisasterReportForm from '@/components/DisasterReportForm';
import RealTimeAlerts from '@/components/RealTimeAlerts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  ArrowLeft,
  Phone,
  Shield,
  Clock,
  MapPin
} from 'lucide-react';

export default function ReportDisaster() {
  const navigate = useNavigate();

  const handleSubmitSuccess = () => {
    // Could navigate somewhere or show additional UI
    console.log('Report submitted successfully');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard/user')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <AlertTriangle className="mr-3 h-8 w-8 text-emergency-danger" />
              Report Emergency
            </h1>
            <p className="text-slate-600">Report fires, accidents, medical emergencies, and other incidents with real-time tracking</p>
          </div>
        </div>

        {/* Critical Emergency Notice */}
        <Alert className="border-emergency-danger bg-emergency-danger/5">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-emergency-danger font-medium">
            <strong>FOR LIFE-THREATENING EMERGENCIES:</strong> Call 911 immediately before filling out this form. This system provides additional coordination but should not replace emergency calls.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Report Form */}
          <div className="lg:col-span-2">
            <DisasterReportForm 
              onSubmitSuccess={handleSubmitSuccess}
              className="mb-6"
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Real-time Alerts */}
            <RealTimeAlerts 
              showDisasterRequests={true}
              showNewsAlerts={true}
              maxAlerts={3}
            />

            {/* Emergency Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-blue-600" />
                  Emergency Guidelines
                </CardTitle>
                <CardDescription>Important safety information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-emergency-danger rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-sm">
                      <strong className="text-emergency-danger">Life-threatening emergencies:</strong> Call 911 immediately and follow their instructions
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-emergency-warning rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-sm">
                      <strong className="text-emergency-warning">Location accuracy:</strong> Provide exact addresses, landmarks, or GPS coordinates when possible
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-emergency-info rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-sm">
                      <strong className="text-emergency-info">Personal safety:</strong> Only take photos or videos if it's completely safe to do so
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-emergency-resolved rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-sm">
                      <strong className="text-emergency-resolved">Follow up:</strong> Emergency responders may contact you for additional information
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium text-sm mb-2 flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    Response Times
                  </h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>Critical: &lt; 5 minutes</div>
                    <div>High: 5-15 minutes</div>
                    <div>Medium: 15-30 minutes</div>
                    <div>Low: 30+ minutes</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Phone className="mr-2 h-5 w-5 text-green-600" />
                  Emergency Contacts
                </CardTitle>
                <CardDescription>Quick access to emergency services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emergency-danger/5 rounded-lg border border-emergency-danger/20">
                  <div>
                    <div className="font-medium text-emergency-danger">Emergency Services</div>
                    <div className="text-sm text-slate-600">Police, Fire, Medical</div>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => window.open('tel:911')}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    911
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <div className="font-medium text-blue-700">Non-Emergency Police</div>
                    <div className="text-sm text-slate-600">For non-urgent situations</div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('tel:311')}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    311
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <div className="font-medium text-green-700">Poison Control</div>
                    <div className="text-sm text-slate-600">24/7 poison emergencies</div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('tel:1-800-222-1222')}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Location Services */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-purple-600" />
                  Location Services
                </CardTitle>
                <CardDescription>Improve response accuracy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    <strong>Enable location services</strong> in your browser to automatically populate your current location in emergency reports.
                  </p>
                  <p>
                    This helps emergency responders reach you faster and more accurately.
                  </p>
                  <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                    <strong>Privacy:</strong> Your location is only used during emergency reporting and is not stored permanently.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
