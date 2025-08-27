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
import { saveReport, mapLegacyTypeToProbleType, createGeneralUserReport } from '@/lib/firebase-reports';
import { ReportProblemType } from '@shared/api';

interface LegacyDisasterReport {
  id: string;
  type: 'fire' | 'medical' | 'accident' | 'natural' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  contactName: string;
  contactPhone: string;
  images?: string[];
  status: 'submitted' | 'acknowledged' | 'in-progress' | 'resolved';
  timestamp: string;
}

const disasterTypes = [
  { value: 'fire', label: 'Fire Emergency', description: 'Building fires, wildfires, explosions', problemType: 'fire' as ReportProblemType },
  { value: 'medical', label: 'Medical Emergency', description: 'Injuries, accidents, health emergencies', problemType: 'ambulance' as ReportProblemType },
  { value: 'accident', label: 'Traffic/Transport Accident', description: 'Vehicle collisions, road incidents', problemType: 'police' as ReportProblemType },
  { value: 'natural', label: 'Natural Disaster', description: 'Floods, storms, earthquakes', problemType: 'general' as ReportProblemType },
  { value: 'hospital', label: 'Hospital/Medical Facility', description: 'Hospital equipment, staff shortages, supplies', problemType: 'hospital' as ReportProblemType },
  { value: 'other', label: 'Other Emergency', description: 'Any other emergency situation', problemType: 'general' as ReportProblemType }
];

const severityLevels = [
  { value: 'low', label: 'Low', description: 'Minor incident, no immediate danger', color: 'text-slate-600' },
  { value: 'medium', label: 'Medium', description: 'Moderate incident, some risk', color: 'text-emergency-info' },
  { value: 'high', label: 'High', description: 'Serious incident, significant risk', color: 'text-emergency-warning' },
  { value: 'critical', label: 'Critical', description: 'Life-threatening, immediate response needed', color: 'text-emergency-danger' }
];

export default function ReportDisaster() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    severity: 'medium',
    title: '',
    description: '',
    location: '',
    contactName: user?.name || '',
    contactPhone: '',
    images: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.type) newErrors.type = 'Please select an emergency type';
    if (!formData.title.trim()) newErrors.title = 'Please provide a title';
    if (!formData.description.trim()) newErrors.description = 'Please describe the emergency';
    if (!formData.location.trim()) newErrors.location = 'Please provide the location';
    if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Please provide a contact phone number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Get the problem type from the selected disaster type
      const selectedType = disasterTypes.find(t => t.value === formData.type);
      const problemType = selectedType?.problemType || 'general';

      // Create the appropriate report based on problem type
      let reportData;

      if (problemType === 'general') {
        reportData = createGeneralUserReport({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          contactName: formData.contactName,
          contactPhone: formData.contactPhone,
          images: formData.images,
          severity: formData.severity as 'low' | 'medium' | 'high' | 'critical',
          category: 'other',
          urgencyLevel: formData.severity === 'critical' ? 'high' : formData.severity === 'high' ? 'high' : 'medium'
        });
      } else {
        // For other types, create a general report with the appropriate problem type
        // In a real implementation, you'd have specific forms for each type
        reportData = {
          problemType,
          title: formData.title,
          description: formData.description,
          location: formData.location,
          contactName: formData.contactName,
          contactPhone: formData.contactPhone,
          images: formData.images,
          severity: formData.severity as 'low' | 'medium' | 'high' | 'critical'
        };
      }

      // Save to Firebase
      const reportId = await saveReport(reportData);

      console.log('Report submitted successfully with ID:', reportId);
      setShowSuccess(true);

      // Reset form
      setFormData({
        type: '',
        severity: 'medium',
        title: '',
        description: '',
        location: '',
        contactName: user?.name || '',
        contactPhone: '',
        images: []
      });
    } catch (error) {
      console.error('Failed to submit report:', error);
      // You could add error state handling here
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In real app, would upload to server and get URLs
      const imageUrls = Array.from(files).map(file => URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, images: [...prev.images, ...imageUrls] }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // In real app, would reverse geocode to get address
          setFormData(prev => ({
            ...prev,
            location: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
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
                  Provide detailed information about the emergency situation
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
                              <div className="text-xs text-slate-400">→ {type.problemType} collection</div>
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

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Emergency Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Brief description of the emergency"
                      className={errors.title ? 'border-emergency-danger' : ''}
                    />
                    {errors.title && <p className="text-sm text-emergency-danger">{errors.title}</p>}
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
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
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
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Your Name</Label>
                      <Input
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) => handleInputChange('contactName', e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Contact Phone *</Label>
                      <Input
                        id="contactPhone"
                        value={formData.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        placeholder="Your phone number"
                        className={errors.contactPhone ? 'border-emergency-danger' : ''}
                      />
                      {errors.contactPhone && <p className="text-sm text-emergency-danger">{errors.contactPhone}</p>}
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label>Photos/Evidence (Optional)</Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
                      <div className="text-center">
                        <Camera className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <div className="text-sm text-slate-600 mb-2">
                          Upload photos of the emergency (if safe to do so)
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button type="button" variant="outline" asChild>
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />
                            Choose Files
                          </label>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Image Preview */}
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img 
                              src={image} 
                              alt={`Upload ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-emergency-danger text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

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
                        Submitting Report...
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
                    <strong>Stay safe:</strong> Only take photos if it's safe to do so
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
                Your emergency report has been submitted and emergency responders have been notified.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-emergency-resolved/10 p-4 rounded-lg">
                <div className="text-sm text-emergency-resolved">
                  <strong>What happens next:</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Emergency responders will be dispatched</li>
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
