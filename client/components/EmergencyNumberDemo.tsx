import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Phone,
  Globe,
  Info
} from 'lucide-react';
import { useEmergencyNumbers } from '@/hooks/use-emergency-numbers';
import { LocationData } from '@/hooks/use-location';

interface EmergencyNumberDemoProps {
  className?: string;
}

export default function EmergencyNumberDemo({ className = '' }: EmergencyNumberDemoProps) {
  const [currentDemo, setCurrentDemo] = useState('US');
  
  // Demo locations with different emergency numbers
  const demoLocations: Record<string, LocationData> = {
    'US': { latitude: 40.7128, longitude: -74.0060, city: 'New York', country: 'United States', countryCode: 'US' },
    'UK': { latitude: 51.5074, longitude: -0.1278, city: 'London', country: 'United Kingdom', countryCode: 'GB' },
    'DE': { latitude: 52.5200, longitude: 13.4050, city: 'Berlin', country: 'Germany', countryCode: 'DE' },
    'FR': { latitude: 48.8566, longitude: 2.3522, city: 'Paris', country: 'France', countryCode: 'FR' },
    'JP': { latitude: 35.6762, longitude: 139.6503, city: 'Tokyo', country: 'Japan', countryCode: 'JP' },
    'AU': { latitude: -33.8688, longitude: 151.2093, city: 'Sydney', country: 'Australia', countryCode: 'AU' }
  };

  const emergencyNumbers = useEmergencyNumbers(demoLocations[currentDemo]);

  const locationButtons = [
    { key: 'US', label: '🇺🇸 USA', description: 'Single emergency number' },
    { key: 'UK', label: '🇬🇧 UK', description: 'Single emergency number' },
    { key: 'DE', label: '🇩🇪 Germany', description: 'Separate numbers by service' },
    { key: 'FR', label: '🇫🇷 France', description: 'Multiple specialized numbers' },
    { key: 'JP', label: '🇯🇵 Japan', description: 'Police vs Fire/Medical' },
    { key: 'AU', label: '🇦🇺 Australia', description: 'Triple zero system' }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="mr-2 h-5 w-5 text-emergency-info" />
          Location-Based Emergency Numbers Demo
        </CardTitle>
        <CardDescription>
          See how emergency numbers change based on your location around the world
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Click different countries below to see how emergency numbers automatically adapt to your location.
          </AlertDescription>
        </Alert>

        {/* Country Selection */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {locationButtons.map((location) => (
            <Button
              key={location.key}
              variant={currentDemo === location.key ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentDemo(location.key)}
              className="h-auto p-3 flex flex-col items-start"
            >
              <div className="font-medium text-left">{location.label}</div>
              <div className="text-xs opacity-70 text-left">{location.description}</div>
            </Button>
          ))}
        </div>

        {/* Current Location Display */}
        <div className="p-3 bg-slate-50 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-slate-900">Current Location:</span>
            <Badge variant="outline">{emergencyNumbers.countryName}</Badge>
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <MapPin className="h-4 w-4 mr-1" />
            {demoLocations[currentDemo].city}, {demoLocations[currentDemo].country}
          </div>
        </div>

        {/* Emergency Numbers Display */}
        <div className="space-y-2">
          <h4 className="font-medium text-slate-900">Emergency Numbers for this Location:</h4>
          
          {/* General Emergency */}
          <div className="flex items-center justify-between p-3 bg-emergency-danger/5 rounded-lg border border-emergency-danger/20">
            <div>
              <div className="font-medium text-emergency-danger">General Emergency</div>
              <div className="text-sm text-slate-600">All emergency services</div>
            </div>
            <Button variant="danger" size="sm" asChild>
              <a href={`tel:${emergencyNumbers.general}`}>
                <Phone className="mr-1 h-3 w-3" />
                {emergencyNumbers.general}
              </a>
            </Button>
          </div>

          {/* Specialized Numbers (if different) */}
          {emergencyNumbers.police !== emergencyNumbers.general && (
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded border">
              <div className="text-sm">
                <span className="font-medium">Police: </span>
                <span className="text-slate-600">Law enforcement</span>
              </div>
              <Badge variant="outline">{emergencyNumbers.police}</Badge>
            </div>
          )}

          {emergencyNumbers.fire !== emergencyNumbers.general && (
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded border">
              <div className="text-sm">
                <span className="font-medium">Fire: </span>
                <span className="text-slate-600">Fire department</span>
              </div>
              <Badge variant="outline">{emergencyNumbers.fire}</Badge>
            </div>
          )}

          {emergencyNumbers.medical !== emergencyNumbers.general && (
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded border">
              <div className="text-sm">
                <span className="font-medium">Medical: </span>
                <span className="text-slate-600">Ambulance/medical</span>
              </div>
              <Badge variant="outline">{emergencyNumbers.medical}</Badge>
            </div>
          )}

          {emergencyNumbers.poison && (
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded border">
              <div className="text-sm">
                <span className="font-medium">Poison Control: </span>
                <span className="text-slate-600">Poison emergencies</span>
              </div>
              <Badge variant="outline">{emergencyNumbers.poison}</Badge>
            </div>
          )}
        </div>

        <div className="text-xs text-slate-500 pt-2 border-t">
          💡 In a real app, your location would be detected automatically via GPS, and the appropriate emergency numbers would be displayed based on your current location.
        </div>
      </CardContent>
    </Card>
  );
}
