import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell,
  Heart,
  Fire,
  AlertTriangle,
  Truck,
  Users,
  Settings,
  Play,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { firebaseDb } from '@/lib/firebase-db';
import NotificationService from '@/lib/notification-service';

interface DemoScenario {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  action: () => Promise<void>;
}

export default function NotificationDemo() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');

  const scenarios: DemoScenario[] = [
    {
      id: 'medical_emergency',
      title: 'Medical Emergency',
      description: 'Simulate a critical medical help request',
      icon: Heart,
      color: 'text-red-500',
      action: async () => {
        const result = await firebaseDb.helpRequests.create({
          userId: user?.id || 'demo-user',
          type: 'medical',
          urgency: 'critical',
          description: '🚨 DEMO: Elderly person experiencing chest pain and difficulty breathing',
          location: '456 Emergency Ave, Crisis City',
          contactPhone: '+1-555-DEMO',
          status: 'submitted'
        });
        
        if (result.success) {
          setLastAction('Medical emergency alert sent to ambulance and hospital staff');
        }
      }
    },
    {
      id: 'fire_emergency',
      title: 'Fire Emergency',
      description: 'Simulate a fire disaster report',
      icon: Fire,
      color: 'text-orange-500',
      action: async () => {
        const result = await firebaseDb.disasterReports.create({
          userId: user?.id || 'demo-user',
          type: 'fire',
          severity: 'high',
          title: '🔥 DEMO: Building Fire',
          description: 'Large fire reported at residential building with possible people trapped',
          location: '789 Flame Street, Blaze District',
          contactName: 'Demo Reporter',
          contactPhone: '+1-555-FIRE',
          status: 'submitted'
        });
        
        if (result.success) {
          setLastAction('Fire emergency alert sent to fire department and police');
        }
      }
    },
    {
      id: 'accident_report',
      title: 'Traffic Accident',
      description: 'Simulate a serious traffic accident',
      icon: Truck,
      color: 'text-blue-500',
      action: async () => {
        const result = await firebaseDb.disasterReports.create({
          userId: user?.id || 'demo-user',
          type: 'accident',
          severity: 'medium',
          title: '🚗 DEMO: Multi-Vehicle Accident',
          description: 'Three-car collision on highway with injuries reported',
          location: 'Highway 101, Mile Marker 45',
          contactName: 'Demo Witness',
          contactPhone: '+1-555-CRASH',
          status: 'submitted'
        });
        
        if (result.success) {
          setLastAction('Accident alert sent to police and ambulance services');
        }
      }
    },
    {
      id: 'supply_request',
      title: 'Supply Request',
      description: 'Simulate emergency supplies needed',
      icon: AlertTriangle,
      color: 'text-yellow-500',
      action: async () => {
        const result = await firebaseDb.helpRequests.create({
          userId: user?.id || 'demo-user',
          type: 'supplies',
          urgency: 'medium',
          description: '📦 DEMO: Urgent medical supplies needed for disaster response',
          location: '321 Relief Center, Aid Town',
          contactPhone: '+1-555-HELP',
          status: 'submitted',
          specialRequests: 'Insulin, bandages, and oxygen tanks needed immediately'
        });
        
        if (result.success) {
          setLastAction('Supply request sent to hospital and admin staff');
        }
      }
    },
    {
      id: 'custom_notification',
      title: 'Custom Alert',
      description: 'Send a direct notification to yourself',
      icon: Bell,
      color: 'text-purple-500',
      action: async () => {
        if (!user?.id) return;
        
        await NotificationService.sendCustomNotification(
          user.id,
          '📢 Demo Custom Alert',
          'This is a custom notification sent directly to you as a demonstration of the notification system.',
          'high',
          '/notifications'
        );
        
        setLastAction('Custom notification sent to your notification center');
      }
    }
  ];

  const handleRunScenario = async (scenario: DemoScenario) => {
    setIsLoading(true);
    try {
      await scenario.action();
      console.log(`✅ Demo scenario "${scenario.title}" executed successfully`);
    } catch (error) {
      console.error(`❌ Failed to run scenario "${scenario.title}":`, error);
      setLastAction(`Error running ${scenario.title}: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runAllScenarios = async () => {
    setIsLoading(true);
    setLastAction('Running all demo scenarios...');
    
    for (const scenario of scenarios) {
      try {
        await scenario.action();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between scenarios
      } catch (error) {
        console.error(`Failed to run scenario ${scenario.title}:`, error);
      }
    }
    
    setLastAction('All demo scenarios completed! Check your notification bell for alerts.');
    setIsLoading(false);
  };

  if (!user) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Please log in to test the notification system.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification System Demo
        </CardTitle>
        <CardDescription>
          Test the notification system by triggering different emergency scenarios. 
          Each scenario will create real database entries and send notifications to appropriate roles.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Demo Scenarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((scenario) => {
            const IconComponent = scenario.icon;
            return (
              <Card key={scenario.id} className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <IconComponent className={`h-6 w-6 ${scenario.color} flex-shrink-0`} />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {scenario.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {scenario.description}
                      </p>
                      <Button
                        onClick={() => handleRunScenario(scenario)}
                        disabled={isLoading}
                        size="sm"
                        className="w-full"
                        variant="outline"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Run Scenario
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Run All Button */}
        <div className="text-center">
          <Button
            onClick={runAllScenarios}
            disabled={isLoading}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Run All Demo Scenarios
          </Button>
        </div>

        {/* Last Action Status */}
        {lastAction && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Action Completed:</strong> {lastAction}
            </AlertDescription>
          </Alert>
        )}

        {/* How It Works */}
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            <strong>How it works:</strong>
            <div className="mt-2 space-y-1 text-sm">
              <div>• Creates real entries in the database (helpRequests, disasterReports)</div>
              <div>• Triggers real-time listeners that detect new data</div>
              <div>• Routes notifications to appropriate user roles automatically</div>
              <div>• Displays notifications in the notification bell and center</div>
            </div>
            <div className="mt-3 text-sm">
              <strong>Notification Routing:</strong>
              <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                <div>🩺 Medical → Ambulance, Hospital</div>
                <div>🔥 Fire → Fire Dept, Police</div>
                <div>🚗 Accident → Police, Ambulance</div>
                <div>📦 Supplies → Hospital, Admin</div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
