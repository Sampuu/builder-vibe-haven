import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { firestoreService } from '@/lib/firestore';
import { mapsService, Coordinates } from '@/lib/maps';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { GeoPoint } from 'firebase/firestore';

interface DisasterReportFormProps {
  onSubmitSuccess?: () => void;
  className?: string;
}

export default function DisasterReportForm({ onSubmitSuccess, className = "" }: DisasterReportFormProps) {
  const [formData, setFormData] = useState({
    type: '',
    severity: '',
    title: '',
    description: '',
    location: '',
    contactNumber: '',
    urgencyLevel: 5
  });
  
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  
  const { user } = useAuth();

  const disasterTypes = [
    { value: 'fire', label: 'Fire Emergency' },
    { value: 'medical', label: 'Medical Emergency' },
    { value: 'natural', label: 'Natural Disaster' },
    { value: 'accident', label: 'Traffic Accident' },
    { value: 'crime', label: 'Criminal Activity' },
    { value: 'other', label: 'Other Emergency' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low Priority', description: 'Non-urgent situation' },
    { value: 'medium', label: 'Medium Priority', description: 'Moderate emergency' },
    { value: 'high', label: 'High Priority', description: 'Serious emergency' },
    { value: 'critical', label: 'Critical', description: 'Life-threatening situation' }
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    setLocationError('');

    try {
      const location = await mapsService.getCurrentLocation();
      if (location) {
        setCoordinates(location);
        
        // Get address from coordinates
        const address = await mapsService.reverseGeocode(location.lat, location.lng);
        if (address) {
          setFormData(prev => ({ ...prev, location: address }));
        }
      } else {
        setLocationError('Unable to get your location. Please enter manually.');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Location access denied. Please enter manually.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleLocationSearch = async () => {
    if (!formData.location.trim()) return;

    try {
      const result = await mapsService.geocodeAddress(formData.location);
      if (result) {
        setCoordinates(result.coordinates);
        setFormData(prev => ({ ...prev, location: result.address }));
        setLocationError('');
      } else {
        setLocationError('Address not found. Please check and try again.');
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      setLocationError('Unable to find address. Please check and try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (!formData.type || !formData.severity || !formData.title || !formData.description || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!coordinates) {
      toast.error('Please set a valid location');
      return;
    }

    setIsSubmitting(true);

    try {
      await firestoreService.createDisasterRequest({
        userId: user.id,
        userEmail: user.email,
        type: formData.type as any,
        severity: formData.severity as any,
        title: formData.title,
        description: formData.description,
        location: {
          address: formData.location,
          coordinates: new GeoPoint(coordinates.lat, coordinates.lng)
        },
        status: 'pending',
        contactNumber: formData.contactNumber || undefined,
        urgencyLevel: formData.urgencyLevel
      });

      toast.success('Emergency report submitted successfully!', {
        description: 'Emergency responders have been notified.',
      });

      // Reset form
      setFormData({
        type: '',
        severity: '',
        title: '',
        description: '',
        location: '',
        contactNumber: '',
        urgencyLevel: 5
      });
      setCoordinates(null);
      
      onSubmitSuccess?.();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Report Emergency
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Emergency Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Emergency Type *</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select emergency type" />
              </SelectTrigger>
              <SelectContent>
                {disasterTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label htmlFor="severity">Severity Level *</Label>
            <Select value={formData.severity} onValueChange={(value) => handleInputChange('severity', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select severity level" />
              </SelectTrigger>
              <SelectContent>
                {severityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-xs text-muted-foreground">{level.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.severity && (
              <Badge className={getSeverityColor(formData.severity)}>
                {formData.severity.toUpperCase()} PRIORITY
              </Badge>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Emergency Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Brief description of the emergency"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Provide detailed information about the emergency..."
              rows={4}
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {formData.description.length}/500 characters
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <div className="flex gap-2">
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter address or location"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="px-3"
              >
                {isGettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
              </Button>
              {formData.location && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLocationSearch}
                  disabled={isGettingLocation}
                >
                  Verify
                </Button>
              )}
            </div>
            
            {coordinates && (
              <div className="text-xs text-muted-foreground">
                📍 {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </div>
            )}
            
            {locationError && (
              <Alert variant="destructive">
                <AlertDescription className="text-xs">{locationError}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Contact Number */}
          <div className="space-y-2">
            <Label htmlFor="contact">Contact Number (Optional)</Label>
            <div className="flex gap-2">
              <Phone className="h-4 w-4 mt-3 text-muted-foreground" />
              <Input
                id="contact"
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                placeholder="Phone number for contact"
                className="flex-1"
              />
            </div>
          </div>

          {/* Urgency Level */}
          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency Level: {formData.urgencyLevel}/10</Label>
            <input
              type="range"
              id="urgency"
              min="1"
              max="10"
              value={formData.urgencyLevel}
              onChange={(e) => handleInputChange('urgencyLevel', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Can wait</span>
              <span>Immediate action needed</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !coordinates}
            variant={formData.severity === 'critical' ? 'destructive' : 'default'}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Report...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Emergency Report
              </>
            )}
          </Button>

          {formData.severity === 'critical' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>CRITICAL EMERGENCY:</strong> This report will be prioritized and emergency responders will be immediately notified.
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
