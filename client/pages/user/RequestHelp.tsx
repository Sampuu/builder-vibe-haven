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
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  ArrowLeft,
  Heart,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Shield,
  Flame,
  Building2,
  AlertTriangle,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useIncidents, Incident } from '@/hooks/use-incidents';

const helpCategories = [
  { 
    value: 'medical', 
    label: 'Medical Emergency', 
    description: 'Injuries, illness, medical assistance needed',
    icon: Heart,
    color: 'text-emergency-danger',
    departments: ['Ambulance', 'Hospital']
  },
  { 
    value: 'supplies', 
    label: 'Emergency Supplies', 
    description: 'Food, water, shelter, basic necessities',
    icon: Package,
    color: 'text-emergency-info',
    departments: ['Hospital', 'Admin']
  },
  { 
    value: 'transport', 
    label: 'Medical Transport', 
    description: 'Need transportation to medical facility',
    icon: Truck,
    color: 'text-emergency-warning',
    departments: ['Ambulance', 'Police']
  },
  { 
    value: 'fire', 
    label: 'Fire Emergency', 
    description: 'Fire-related incidents requiring immediate help',
    icon: Flame,
    color: 'text-emergency-danger',
    departments: ['Fire Department', 'Police']
  },
  { 
    value: 'police', 
    label: 'Security/Safety', 
    description: 'Safety concerns, security issues, crowd control',
    icon: Shield,
    color: 'text-emergency-warning',
    departments: ['Police']
  },
  { 
    value: 'accident', 
    label: 'Accident Response', 
    description: 'Vehicle accidents, injuries from accidents',
    icon: AlertTriangle,
    color: 'text-emergency-danger',
    departments: ['Police', 'Ambulance']
  }
];

const urgencyLevels = [
  { value: 'low', label: 'Low Priority', description: 'Can wait, non-urgent', color: 'text-slate-600' },
  { value: 'medium', label: 'Medium Priority', description: 'Needed within hours', color: 'text-emergency-info' },
  { value: 'high', label: 'High Priority', description: 'Urgent, needed soon', color: 'text-emergency-warning' },
  { value: 'critical', label: 'Critical', description: 'Life-threatening, immediate response', color: 'text-emergency-danger' }
];

export default function RequestHelp() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { submitIncident } = useIncidents();
  
  const [formData, setFormData] = useState({
    category: '',
    urgency: 'medium',
    title: '',
    description: '',
    location: '',
    contactPhone: '',
    specialRequests: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedIncidentId, setSubmittedIncidentId] = useState<string>('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) newErrors.category = 'Please select the type of help needed';
    if (!formData.title.trim()) newErrors.title = 'Please provide a brief title';
    if (!formData.description.trim()) newErrors.description = 'Please describe what help you need';
    if (!formData.location.trim()) newErrors.location = 'Please provide your location';
    if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Please provide a contact phone number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;

    setIsSubmitting(true);

    try {
      const incidentData: Omit<Incident, 'id' | 'assignedDepartments' | 'status' | 'timestamps'> = {
        type: 'help_request',
        category: formData.category as Incident['category'],
        urgency: formData.urgency as Incident['urgency'],
        title: formData.title,
        description: formData.description,
        location: formData.location,
        reporter: {
          id: user.id,
          name: user.name,
          phone: formData.contactPhone,
          role: user.role,
        },
        priority: formData.urgency as Incident['priority'],
        metadata: {
          specialRequests: formData.specialRequests,
        }
      };

      const incidentId = await submitIncident(incidentData);
      setSubmittedIncidentId(incidentId);
      setSubmitted(true);
      
      // Reset form
      setFormData({
        category: '',
        urgency: 'medium',
        title: '',
        description: '',
        location: '',
        contactPhone: '',
        specialRequests: ''
      });
    } catch (error) {
      console.error('Failed to submit help request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = helpCategories.find(cat => cat.value === formData.category);

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto mt-12">
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-emergency-resolved mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">Help Request Submitted</h2>
              <p className="text-slate-600 mb-4">
                Your help request has been submitted and the appropriate emergency departments have been notified.
              </p>
              <div className="bg-emergency-info/10 p-4 rounded-lg mb-6">
                <p className="text-sm text-emergency-info">
                  <strong>Request ID:</strong> {submittedIncidentId}
                </p>
                {selectedCategory && (
                  <div className="mt-2">
                    <p className="text-sm text-slate-600">
                      <strong>Departments notified:</strong>
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedCategory.departments.map(dept => (
                        <Badge key={dept} variant="secondary" className="text-xs">
                          {dept}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Button onClick={() => navigate('/dashboard/user')} className="w-full">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard/user')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <Phone className="mr-3 h-8 w-8 text-emergency-resolved" />
              Request Emergency Help
            </h1>
            <p className="text-slate-600">Request assistance from emergency services</p>
          </div>
        </div>

        <Alert className="border-emergency-danger bg-emergency-danger/5">
          <Heart className="h-4 w-4" />
          <AlertDescription className="text-emergency-danger font-medium">
            For life-threatening emergencies, call 911 immediately before submitting this form.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Help Request Form</CardTitle>
              <CardDescription>
                Submit a request for emergency assistance. Your request will be automatically routed to the appropriate departments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Help Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Type of Help Needed *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className={errors.category ? 'border-emergency-danger' : ''}>
                      <SelectValue placeholder="Select type of help" />
                    </SelectTrigger>
                    <SelectContent>
                      {helpCategories.map(category => {
                        const Icon = category.icon;
                        return (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${category.color}`} />
                              <div>
                                <div className="font-medium">{category.label}</div>
                                <div className="text-xs text-slate-500">{category.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-emergency-danger">{errors.category}</p>}
                  
                  {/* Show which departments will be notified */}
                  {selectedCategory && (
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-slate-700 mb-1">
                        Departments that will be notified:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedCategory.departments.map(dept => (
                          <Badge key={dept} variant="secondary" className="text-xs">
                            {dept}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Urgency Level */}
                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {urgencyLevels.map(level => (
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
                  <Label htmlFor="title">Brief Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Brief description of help needed"
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
                    placeholder="Describe what help you need, current situation, number of people affected, etc."
                    rows={4}
                    className={errors.description ? 'border-emergency-danger' : ''}
                  />
                  {errors.description && <p className="text-sm text-emergency-danger">{errors.description}</p>}
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Your Location *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Your current address or location"
                      className={`flex-1 ${errors.location ? 'border-emergency-danger' : ''}`}
                    />
                    <Button type="button" variant="outline" onClick={getCurrentLocation}>
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                  {errors.location && <p className="text-sm text-emergency-danger">{errors.location}</p>}
                </div>

                {/* Contact Phone */}
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

                {/* Special Requests */}
                <div className="space-y-2">
                  <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                  <Textarea
                    id="specialRequests"
                    value={formData.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    placeholder="Any special considerations, accessibility needs, or specific requests"
                    rows={2}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  variant="success" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <Phone className="mr-2 h-4 w-4" />
                      Submit Help Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* Help Categories Info */}
            <Card>
              <CardHeader>
                <CardTitle>Types of Emergency Help</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {helpCategories.slice(0, 3).map(category => {
                  const Icon = category.icon;
                  return (
                    <div key={category.value} className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${category.color}`} />
                      <div>
                        <h4 className="font-medium text-slate-900">{category.label}</h4>
                        <p className="text-sm text-slate-600">{category.description}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="mr-2 h-5 w-5 text-emergency-danger" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-emergency-danger/5 rounded-lg">
                  <div>
                    <div className="font-medium text-emergency-danger">Emergency Services</div>
                    <div className="text-sm text-slate-600">Police, Fire, Medical</div>
                  </div>
                  <Button size="sm" variant="danger">
                    <Phone className="mr-2 h-4 w-4" />
                    911
                  </Button>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-700">Non-Emergency Police</div>
                    <div className="text-sm text-slate-600">For non-urgent situations</div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Phone className="mr-2 h-4 w-4" />
                    311
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Response Time Info */}
            <Card>
              <CardHeader>
                <CardTitle>Expected Response Times</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-emergency-danger font-medium">Critical:</span>
                  <span>Immediate response</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emergency-warning font-medium">High:</span>
                  <span>Within 15 minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emergency-info font-medium">Medium:</span>
                  <span>Within 1 hour</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Low:</span>
                  <span>Within 4 hours</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
