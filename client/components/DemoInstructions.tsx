import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Shield, 
  Flame, 
  Truck, 
  Building2, 
  Settings, 
  AlertTriangle,
  Phone,
  MapPin,
  Bell,
  Users,
  Activity
} from 'lucide-react';

interface DemoInstructionsProps {
  onClose?: () => void;
}

export default function DemoInstructions({ onClose }: DemoInstructionsProps) {
  const roles = [
    {
      role: 'user',
      name: 'Citizen',
      icon: User,
      color: 'text-emergency-info',
      bgColor: 'bg-emergency-info/10',
      email: 'user@demo.com',
      features: [
        { icon: AlertTriangle, text: 'Report emergencies and disasters' },
        { icon: Phone, text: 'Request medical help and supplies' },
        { icon: MapPin, text: 'View incident maps and status' },
        { icon: Activity, text: 'Track your submitted reports' }
      ]
    },
    {
      role: 'police',
      name: 'Police Officer',
      icon: Shield,
      color: 'text-emergency-danger',
      bgColor: 'bg-emergency-danger/10',
      email: 'police@demo.com',
      features: [
        { icon: Bell, text: 'Receive real-time incident notifications' },
        { icon: Users, text: 'Manage and assign incidents' },
        { icon: MapPin, text: 'View command center maps' },
        { icon: Activity, text: 'Coordinate with other departments' }
      ]
    },
    {
      role: 'fire',
      name: 'Fire Fighter',
      icon: Flame,
      color: 'text-emergency-warning',
      bgColor: 'bg-emergency-warning/10',
      email: 'fire@demo.com',
      features: [
        { icon: Bell, text: 'Get fire emergency alerts' },
        { icon: AlertTriangle, text: 'Manage fire incidents' },
        { icon: Activity, text: 'Update incident status' },
        { icon: Users, text: 'Coordinate response teams' }
      ]
    },
    {
      role: 'ambulance',
      name: 'Paramedic',
      icon: Truck,
      color: 'text-emergency-resolved',
      bgColor: 'bg-emergency-resolved/10',
      email: 'ambulance@demo.com',
      features: [
        { icon: Bell, text: 'Receive medical emergency alerts' },
        { icon: Phone, text: 'Handle help requests' },
        { icon: Activity, text: 'Track medical incidents' },
        { icon: MapPin, text: 'Navigate to emergency locations' }
      ]
    },
    {
      role: 'hospital',
      name: 'Hospital Staff',
      icon: Building2,
      color: 'text-emergency-info',
      bgColor: 'bg-emergency-info/10',
      email: 'hospital@demo.com',
      features: [
        { icon: Bell, text: 'Monitor supply requests' },
        { icon: Activity, text: 'Manage medical resources' },
        { icon: Users, text: 'Coordinate with ambulance teams' },
        { icon: Phone, text: 'Handle patient transfers' }
      ]
    },
    {
      role: 'admin',
      name: 'System Admin',
      icon: Settings,
      color: 'text-slate-700',
      bgColor: 'bg-slate-100',
      email: 'admin@demo.com',
      features: [
        { icon: Users, text: 'Manage all system users' },
        { icon: Activity, text: 'Monitor system-wide activity' },
        { icon: Bell, text: 'Receive all notifications' },
        { icon: MapPin, text: 'Access all dashboards' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Demo Account Guide</h2>
        <p className="text-slate-600">
          Each role has different capabilities. Try logging in with different accounts to see how the system works.
        </p>
        <div className="mt-4">
          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
            All accounts use password: <code className="ml-1">demo123</code>
          </Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((roleData) => {
          const IconComponent = roleData.icon;
          return (
            <Card key={roleData.role} className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${roleData.bgColor}`}>
                    <IconComponent className={`h-5 w-5 ${roleData.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{roleData.name}</CardTitle>
                    <CardDescription className="text-xs font-mono">
                      {roleData.email}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {roleData.features.map((feature, index) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <div key={index} className="flex items-start space-x-2">
                        <FeatureIcon className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-600">{feature.text}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-slate-50 rounded-lg p-4">
        <h3 className="font-semibold text-slate-900 mb-2">How to Test:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
          <li>Start with the <strong>Citizen</strong> account to report an emergency</li>
          <li>Switch to a <strong>Police</strong> or <strong>Fire</strong> account to see the notification</li>
          <li>Try the <strong>Admin</strong> account to see all system activity</li>
          <li>Use the <strong>Hospital</strong> account to manage medical requests</li>
        </ol>
      </div>

      {onClose && (
        <div className="text-center">
          <Button onClick={onClose} variant="outline">
            Close Guide
          </Button>
        </div>
      )}
    </div>
  );
}
