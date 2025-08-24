import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  MapPin, 
  Loader2, 
  AlertTriangle, 
  Shield, 
  Flame,
  Heart,
  Skull,
  RefreshCw,
  Globe
} from 'lucide-react';
import { useLocation } from '@/hooks/use-location';
import { useEmergencyNumbers, formatPhoneForDialing } from '@/hooks/use-emergency-numbers';

interface LocationBasedEmergencyProps {
  variant?: 'compact' | 'full';
  className?: string;
  autoDetect?: boolean;
}

export default function LocationBasedEmergency({ 
  variant = 'full', 
  className = '',
  autoDetect = false 
}: LocationBasedEmergencyProps) {
  const { location, isLoading, error, requestLocation } = useLocation();
  const emergencyNumbers = useEmergencyNumbers(location);
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);

  // Auto-detect location if enabled
  useEffect(() => {
    if (autoDetect && !hasRequestedLocation) {
      requestLocation();
      setHasRequestedLocation(true);
    }
  }, [autoDetect, hasRequestedLocation, requestLocation]);

  const handleLocationRequest = () => {
    requestLocation();
    setHasRequestedLocation(true);
  };

  const getLocationDisplayText = () => {
    if (!location) return 'Location unknown';
    
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.region) parts.push(location.region);
    if (location.country) parts.push(location.country);
    
    return parts.length > 0 ? parts.join(', ') : `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  };

  const makeCall = (number: string) => {
    const dialNumber = formatPhoneForDialing(number);
    window.location.href = `tel:${dialNumber}`;
  };

  if (variant === 'compact') {
    return (
      <div className={`space-y-3 ${className}`}>
        {/* Location Status */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-slate-500" />
            <span className="text-slate-600">
              {isLoading ? 'Detecting location...' : getLocationDisplayText()}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLocationRequest}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
        </div>

        {/* Emergency Numbers */}
        <div className="space-y-2">
          <Button 
            variant="danger" 
            size="sm" 
            className="w-full"
            onClick={() => makeCall(emergencyNumbers.general)}
          >
            <Phone className="mr-2 h-4 w-4" />
            Emergency: {emergencyNumbers.general}
          </Button>
          
          {location?.countryCode !== 'US' && emergencyNumbers.poison && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => makeCall(emergencyNumbers.poison)}
            >
              <Skull className="mr-2 h-4 w-4" />
              Poison Control: {emergencyNumbers.poison}
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="text-xs">
            <AlertTriangle className="h-3 w-3" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Globe className="mr-2 h-5 w-5 text-emergency-warning" />
            Emergency Contacts
          </span>
          <Badge variant="outline" className="text-xs">
            {emergencyNumbers.countryName}
          </Badge>
        </CardTitle>
        <CardDescription>
          Emergency numbers for your current location
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Display */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-slate-500" />
            <div>
              <div className="text-sm font-medium text-slate-900">
                {isLoading ? 'Detecting your location...' : getLocationDisplayText()}
              </div>
              {location?.accuracy && (
                <div className="text-xs text-slate-500">
                  Accuracy: ±{Math.round(location.accuracy)}m
                </div>
              )}
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLocationRequest}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={handleLocationRequest}
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Emergency Numbers */}
        <div className="space-y-3">
          {/* General Emergency */}
          <div className="flex items-center justify-between p-3 bg-emergency-danger/5 rounded-lg">
            <div>
              <div className="font-medium text-emergency-danger">Emergency Services</div>
              <div className="text-sm text-slate-600">Police, Fire, Medical</div>
            </div>
            <Button 
              variant="danger" 
              size="sm"
              onClick={() => makeCall(emergencyNumbers.general)}
            >
              <Phone className="mr-2 h-4 w-4" />
              {emergencyNumbers.general}
            </Button>
          </div>

          {/* Specialized Numbers (if different from general) */}
          {emergencyNumbers.police !== emergencyNumbers.general && (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <div className="font-medium text-slate-700 flex items-center">
                  <Shield className="mr-2 h-4 w-4" />
                  Police
                </div>
                <div className="text-sm text-slate-600">Law enforcement</div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => makeCall(emergencyNumbers.police)}
              >
                <Phone className="mr-2 h-4 w-4" />
                {emergencyNumbers.police}
              </Button>
            </div>
          )}

          {emergencyNumbers.fire !== emergencyNumbers.general && (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <div className="font-medium text-slate-700 flex items-center">
                  <Flame className="mr-2 h-4 w-4" />
                  Fire Department
                </div>
                <div className="text-sm text-slate-600">Fire & rescue</div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => makeCall(emergencyNumbers.fire)}
              >
                <Phone className="mr-2 h-4 w-4" />
                {emergencyNumbers.fire}
              </Button>
            </div>
          )}

          {emergencyNumbers.medical !== emergencyNumbers.general && (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <div className="font-medium text-slate-700 flex items-center">
                  <Heart className="mr-2 h-4 w-4" />
                  Medical Emergency
                </div>
                <div className="text-sm text-slate-600">Ambulance & medical</div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => makeCall(emergencyNumbers.medical)}
              >
                <Phone className="mr-2 h-4 w-4" />
                {emergencyNumbers.medical}
              </Button>
            </div>
          )}

          {/* Poison Control */}
          {emergencyNumbers.poison && (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <div className="font-medium text-slate-700 flex items-center">
                  <Skull className="mr-2 h-4 w-4" />
                  Poison Control
                </div>
                <div className="text-sm text-slate-600">Poisoning emergencies</div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => makeCall(emergencyNumbers.poison)}
              >
                <Phone className="mr-2 h-4 w-4" />
                {emergencyNumbers.poison}
              </Button>
            </div>
          )}
        </div>

        {!hasRequestedLocation && (
          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              Click the location button to get emergency numbers for your area.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
