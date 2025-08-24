import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LocationBasedEmergency from '@/components/LocationBasedEmergency';
import { useEmergencyNumbers } from '@/hooks/use-emergency-numbers';
import { LocationData } from '@/hooks/use-location';
import { 
  MapPin, 
  ArrowLeft,
  Globe,
  Target,
  Navigation
} from 'lucide-react';

export default function ViewMap() {
  const navigate = useNavigate();
  const [simulatedLocation, setSimulatedLocation] = useState<LocationData | null>(null);
  const emergencyNumbers = useEmergencyNumbers(simulatedLocation);

  // Demo locations to show different emergency numbers
  const demoLocations = [
    {
      name: 'New York, USA',
      location: { latitude: 40.7128, longitude: -74.0060, city: 'New York', country: 'United States', countryCode: 'US' as const }
    },
    {
      name: 'London, UK',
      location: { latitude: 51.5074, longitude: -0.1278, city: 'London', country: 'United Kingdom', countryCode: 'GB' as const }
    },
    {
      name: 'Tokyo, Japan',
      location: { latitude: 35.6762, longitude: 139.6503, city: 'Tokyo', country: 'Japan', countryCode: 'JP' as const }
    },
    {
      name: 'Sydney, Australia',
      location: { latitude: -33.8688, longitude: 151.2093, city: 'Sydney', country: 'Australia', countryCode: 'AU' as const }
    },
    {
      name: 'Berlin, Germany',
      location: { latitude: 52.5200, longitude: 13.4050, city: 'Berlin', country: 'Germany', countryCode: 'DE' as const }
    },
    {
      name: 'Paris, France',
      location: { latitude: 48.8566, longitude: 2.3522, city: 'Paris', country: 'France', countryCode: 'FR' as const }
    }
  ];

  const handleLocationDemo = (locationName: string) => {
    const demo = demoLocations.find(loc => loc.name === locationName);
    if (demo) {
      setSimulatedLocation(demo.location);
    }
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
              <MapPin className="mr-3 h-8 w-8 text-emergency-info" />
              Emergency Map & Location Services
            </h1>
            <p className="text-slate-600">View emergency services in your area and test location-based emergency numbers</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Map Placeholder and Location Demo */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-5 w-5" />
                  Location Demo
                </CardTitle>
                <CardDescription>
                  Test how emergency numbers change based on your location
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Simulate Location
                  </label>
                  <Select onValueChange={handleLocationDemo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a city to test emergency numbers" />
                    </SelectTrigger>
                    <SelectContent>
                      {demoLocations.map((demo) => (
                        <SelectItem key={demo.name} value={demo.name}>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{demo.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {simulatedLocation && (
                  <div className="p-4 bg-slate-50 rounded-lg border">
                    <h3 className="font-semibold text-slate-900 mb-2">Current Simulated Location:</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>City:</span>
                        <span className="font-medium">{simulatedLocation.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Country:</span>
                        <span className="font-medium">{simulatedLocation.country}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Coordinates:</span>
                        <span className="font-medium">
                          {simulatedLocation.latitude.toFixed(4)}, {simulatedLocation.longitude.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {simulatedLocation && (
                  <div className="p-4 bg-emergency-info/5 rounded-lg border border-emergency-info/20">
                    <h3 className="font-semibold text-emergency-info mb-2">Emergency Numbers for this Location:</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>General Emergency:</span>
                        <Badge variant="destructive">{emergencyNumbers.general}</Badge>
                      </div>
                      {emergencyNumbers.police !== emergencyNumbers.general && (
                        <div className="flex justify-between">
                          <span>Police:</span>
                          <Badge variant="outline">{emergencyNumbers.police}</Badge>
                        </div>
                      )}
                      {emergencyNumbers.fire !== emergencyNumbers.general && (
                        <div className="flex justify-between">
                          <span>Fire:</span>
                          <Badge variant="outline">{emergencyNumbers.fire}</Badge>
                        </div>
                      )}
                      {emergencyNumbers.medical !== emergencyNumbers.general && (
                        <div className="flex justify-between">
                          <span>Medical:</span>
                          <Badge variant="outline">{emergencyNumbers.medical}</Badge>
                        </div>
                      )}
                      {emergencyNumbers.poison && (
                        <div className="flex justify-between">
                          <span>Poison Control:</span>
                          <Badge variant="outline">{emergencyNumbers.poison}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Interactive Emergency Map</CardTitle>
                <CardDescription>
                  Emergency services and incidents in your area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                  <div className="text-center text-slate-500">
                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-lg font-medium mb-1">Interactive Map</p>
                    <p className="text-sm">Emergency services map will be displayed here</p>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Target className="mr-2 h-4 w-4" />
                    Find Me
                  </Button>
                  <Button variant="outline" size="sm">
                    <Navigation className="mr-2 h-4 w-4" />
                    Directions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location-Based Emergency Panel */}
          <div className="space-y-6">
            <LocationBasedEmergency autoDetect={false} />
            
            <Card>
              <CardHeader>
                <CardTitle>How Location-Based Emergency Numbers Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-emergency-info rounded-full mt-2"></div>
                    <div>
                      <strong>Automatic Detection:</strong> We detect your location using GPS to show the correct emergency numbers for your area.
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-emergency-warning rounded-full mt-2"></div>
                    <div>
                      <strong>Country-Specific Numbers:</strong> Different countries have different emergency numbers (911 in US, 999 in UK, 112 in EU, etc.)
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-emergency-resolved rounded-full mt-2"></div>
                    <div>
                      <strong>One-Tap Calling:</strong> Tap any emergency number to immediately dial from your phone.
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-emergency-danger rounded-full mt-2"></div>
                    <div>
                      <strong>Specialized Services:</strong> Some countries have separate numbers for police, fire, and medical emergencies.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Global Emergency Numbers</CardTitle>
                <CardDescription>Examples from different countries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>🇺🇸 United States</span>
                    <span className="font-mono">911</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🇬🇧 United Kingdom</span>
                    <span className="font-mono">999</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🇪🇺 European Union</span>
                    <span className="font-mono">112</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🇦🇺 Australia</span>
                    <span className="font-mono">000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🇯🇵 Japan (Police)</span>
                    <span className="font-mono">110</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🇯🇵 Japan (Fire/Medical)</span>
                    <span className="font-mono">119</span>
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
