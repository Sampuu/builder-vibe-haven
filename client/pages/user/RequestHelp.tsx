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
import {
  Phone,
  ArrowLeft,
  Heart,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { firebaseDb } from '@/lib/firebase-db';
import type { HelpRequest } from '@shared/types';

export default function RequestHelp() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: '',
    urgency: 'medium',
    description: '',
    location: '',
    contactPhone: '',
    specialRequests: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.type) newErrors.type = 'Please select the type of help needed';
    if (!formData.description.trim()) newErrors.description = 'Please describe what help you need';
    if (!formData.location.trim()) newErrors.location = 'Please provide your location';
    if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Please provide a contact phone number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!user?.id) {
      setErrors({ general: 'Please log in to submit a help request' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create help request in Firebase
      const requestData: Omit<HelpRequest, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.id,
        type: formData.type as HelpRequest['type'],
        urgency: formData.urgency as HelpRequest['urgency'],
        description: formData.description,
        location: formData.location,
        contactPhone: formData.contactPhone,
        specialRequests: formData.specialRequests || undefined,
        status: 'submitted'
      };

      const result = await firebaseDb.helpRequests.create(requestData);

      if (result.success) {
        console.log('Help request submitted successfully:', result.data);
        setSubmitted(true);
        setErrors({});
      } else {
        setErrors({ general: result.error || 'Failed to submit help request' });
      }
    } catch (error) {
      console.error('Failed to submit help request:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto mt-12">
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-emergency-resolved mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">Help Request Submitted</h2>
              <p className="text-slate-600 mb-6">Medical assistance has been requested. Help is on the way.</p>
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
              Request Medical Help
            </h1>
            <p className="text-slate-600">Request medical assistance and emergency supplies</p>
          </div>
        </div>

        <Alert className="border-emergency-danger bg-emergency-danger/5">
          <Heart className="h-4 w-4" />
          <AlertDescription className="text-emergency-danger font-medium">
            For life-threatening emergencies, call 911 immediately.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Help Request Form</CardTitle>
              <CardDescription>Request medical assistance or emergency supplies</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* General Error */}
                {errors.general && (
                  <Alert className="border-emergency-danger bg-emergency-danger/5">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-emergency-danger">
                      {errors.general}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="type">Type of Help Needed</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger className={errors.type ? 'border-emergency-danger' : ''}>
                      <SelectValue placeholder="Select help type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medical">Medical Assistance</SelectItem>
                      <SelectItem value="supplies">Emergency Supplies</SelectItem>
                      <SelectItem value="transport">Medical Transport</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-sm text-emergency-danger">{errors.type}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select value={formData.urgency} onValueChange={(value) => setFormData({...formData, urgency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Can wait</SelectItem>
                      <SelectItem value="medium">Medium - Needed soon</SelectItem>
                      <SelectItem value="high">High - Urgent</SelectItem>
                      <SelectItem value="critical">Critical - Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe what help you need..."
                    rows={3}
                    className={errors.description ? 'border-emergency-danger' : ''}
                  />
                  {errors.description && <p className="text-sm text-emergency-danger">{errors.description}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Your current address"
                    className={errors.location ? 'border-emergency-danger' : ''}
                  />
                  {errors.location && <p className="text-sm text-emergency-danger">{errors.location}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    placeholder="Your phone number"
                    className={errors.contactPhone ? 'border-emergency-danger' : ''}
                  />
                  {errors.contactPhone && <p className="text-sm text-emergency-danger">{errors.contactPhone}</p>}
                </div>

                <Button type="submit" className="w-full" variant="success" disabled={isSubmitting}>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="mr-2 h-5 w-5 text-emergency-resolved" />
                  Medical Assistance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• First aid and medical care</li>
                  <li>• Emergency medical evaluation</li>
                  <li>• Medication assistance</li>
                  <li>• Medical equipment</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5 text-emergency-info" />
                  Emergency Supplies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Food and water</li>
                  <li>• Blankets and shelter</li>
                  <li>• Basic medical supplies</li>
                  <li>• Emergency equipment</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="mr-2 h-5 w-5 text-emergency-warning" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Emergency Services</span>
                  <Button size="sm" variant="danger">911</Button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Poison Control</span>
                  <Button size="sm" variant="outline">1-800-222-1222</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
