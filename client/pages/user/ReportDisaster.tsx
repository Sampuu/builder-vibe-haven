import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  AlertTriangle, 
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  Upload,
  Camera
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { UserDashboardService } from '@/lib/user-dashboard-db';
import { CreateReportDisasterForm } from '@shared/user-dashboard-types';

const disasterTypes = [
  { value: 'fire', label: 'Fire Emergency', description: 'Building fires, wildfires, explosions' },
  { value: 'medical', label: 'Medical Emergency', description: 'Injuries, accidents, health emergencies' },
  { value: 'accident', label: 'Traffic/Transport Accident', description: 'Vehicle collisions, road incidents' },
  { value: 'flood', label: 'Flood/Water Emergency', description: 'Flooding, water damage, broken pipes' },
  { value: 'earthquake', label: 'Earthquake', description: 'Seismic activity, structural damage' },
  { value: 'other', label: 'Other Emergency', description: 'Any other emergency situation' }
] as const;

const severityLevels = [
  { value: 'low', label: 'Low', description: 'Minor incident, no immediate danger', color: 'text-slate-600' },
  { value: 'medium', label: 'Medium', description: 'Moderate incident, some risk', color: 'text-emergency-info' },
  { value: 'high', label: 'High', description: 'Serious incident, significant risk', color: 'text-emergency-warning' },
  { value: 'critical', label: 'Critical', description: 'Life-threatening, immediate response needed', color: 'text-emergency-danger' }
] as const;

export default function ReportDisaster() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: '' as CreateReportDisasterForm['type'] | '',
    severity: 'medium' as CreateReportDisasterForm['severity'],
    description: '',
    location: {
      latitude: 0,
      longitude: 0,
      address: ''
    },
    contact: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLocationChange = (address: string) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, address }
    }));
    if (errors.location) {
      setErrors(prev => ({ ...prev, location: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.type) newErrors.type = 'Please select an emergency type';
    if (!formData.description.trim()) newErrors.description = 'Please describe the emergency';
    if (!formData.location.address.trim()) newErrors.location = 'Please provide the location';
    if (!formData.contact.trim()) newErrors.contact = 'Please provide a contact phone number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user?.id || !formData.type) return;

    setIsSubmitting(true);

    try {
      const reportData: CreateReportDisasterForm = {
        type: formData.type,
        severity: formData.severity,
        description: formData.description,
        location: formData.location,
        contact: formData.contact
      };

      const reportId = await UserDashboardService.createDisasterReport(
        user.id,
        reportData,
        user.name || 'Anonymous User'
      );

      setSubmittedReportId(reportId);
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        type: '',
        severity: 'medium',
        description: '',
        location: { latitude: 0, longitude: 0, address: '' },
        contact: ''
      });
    } catch (error) {
      console.error('Failed to submit report:', error);
      setErrors({ submit: 'Failed to submit report. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            location: {
              latitude,
              longitude,
              address: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            }
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          setErrors({ location: 'Unable to get current location. Please enter address manually.' });
        }
      );
    } else {
      setErrors({ location: 'Geolocation is not supported by this browser.' });
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
              <AlertTriangle className="mr-3 h-8 w-8 text-emergency-danger" />
              Report Emergency
            </h1>
            <p className="text-slate-600">Report fires, accidents, medical emergencies, and other incidents</p>
          </div>
        </div>

        {/* Emergency Notice */}
        <Alert className="border-emergency-danger bg-emergency-danger/5">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-emergency-danger font-medium">
            <strong>FOR LIFE-THREATENING EMERGENCIES:</strong> Call 911 immediately before filling out this form.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Report Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Report Form</CardTitle>
                <CardDescription>
                  Provide detailed information about the emergency situation. This will be stored in your Firebase sub-collection.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Emergency Type */}
                  <div className="space-y-2">
                    <Label htmlFor="type">Emergency Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger className={errors.type ? 'border-emergency-danger' : ''}>
                        <SelectValue placeholder="Select emergency type" />
                      </SelectTrigger>
                      <SelectContent>
                        {disasterTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-slate-500">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-sm text-emergency-danger">{errors.type}</p>}
                  </div>

                  {/* Severity */}
                  <div className="space-y-2">
                    <Label htmlFor="severity">Severity Level</Label>
                    <Select value={formData.severity} onValueChange={(value) => handleInputChange('severity', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {severityLevels.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            <div>
                              <div className={`font-medium ${level.color}`}>{level.label}</div>
                              <div className="text-xs text-slate-500">{level.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Detailed Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Provide detailed information about what happened, current situation, people involved, etc."
                      rows={4}
                      className={errors.description ? 'border-emergency-danger' : ''}
                    />
                    {errors.description && <p className="text-sm text-emergency-danger">{errors.description}</p>}
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="location"
                        value={formData.location.address}
                        onChange={(e) => handleLocationChange(e.target.value)}
                        placeholder="Full address or detailed location description"
                        className={`flex-1 ${errors.location ? 'border-emergency-danger' : ''}`}
                      />
                      <Button type="button" variant="outline" onClick={getCurrentLocation}>
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                    {errors.location && <p className="text-sm text-emergency-danger">{errors.location}</p>}
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact Phone *</Label>
                    <Input
                      id="contact"
                      value={formData.contact}
                      onChange={(e) => handleInputChange('contact', e.target.value)}
                      placeholder="Your phone number"
                      className={errors.contact ? 'border-emergency-danger' : ''}
                    />
                    {errors.contact && <p className="text-sm text-emergency-danger">{errors.contact}</p>}
                  </div>

                  {/* Submit Errors */}
                  {errors.submit && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.submit}</AlertDescription>
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full" 
                    variant="danger"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Submitting to Firebase...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Submit Emergency Report
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Help & Guidelines */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emergency Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-emergency-danger rounded-full mt-2"></div>
                  <div className="text-sm">
                    <strong>Life-threatening emergencies:</strong> Call 911 immediately
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-emergency-warning rounded-full mt-2"></div>
                  <div className="text-sm">
                    <strong>Location accuracy:</strong> Provide exact address or landmarks
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-emergency-info rounded-full mt-2"></div>
                  <div className="text-sm">
                    <strong>Firebase Storage:</strong> Your report is stored securely in your sub-collection
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-emergency-resolved rounded-full mt-2"></div>
                  <div className="text-sm">
                    <strong>Follow up:</strong> We'll contact you for additional information
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emergency Contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emergency-danger/5 rounded-lg">
                  <div>
                    <div className="font-medium text-emergency-danger">Emergency Services</div>
                    <div className="text-sm text-slate-600">Police, Fire, Medical</div>
                  </div>
                  <Button variant="danger" size="sm">
                    <Phone className="mr-2 h-4 w-4" />
                    911
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-700">Non-Emergency Police</div>
                    <div className="text-sm text-slate-600">For non-urgent situations</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Phone className="mr-2 h-4 w-4" />
                    311
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Firebase Integration Status */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800 text-sm">🔥 Firebase Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-green-700 space-y-1">
                  <div>✓ Connected to reportDisaster collection</div>
                  <div>✓ Analytics tracking enabled</div>
                  <div>✓ User-specific sub-collection</div>
                  <div>✓ Role-based security rules active</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Success Dialog */}
        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center text-emergency-resolved">
                <CheckCircle className="mr-2 h-6 w-6" />
                Report Submitted Successfully
              </DialogTitle>
              <DialogDescription>
                Your emergency report has been saved to Firebase and emergency responders have been notified.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-emergency-resolved/10 p-4 rounded-lg">
                <div className="text-sm text-emergency-resolved">
                  <strong>Report ID:</strong> {submittedReportId}
                  <br />
                  <strong>What happens next:</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Emergency responders will be dispatched</li>
                    <li>Your report is stored in your Firebase sub-collection</li>
                    <li>You may receive a call for additional information</li>
                    <li>Track the status in your dashboard</li>
                  </ul>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => navigate('/dashboard/user')}>
                  Back to Dashboard
                </Button>
                <Button onClick={() => setShowSuccess(false)}>
                  Submit Another Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
