import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth-simple';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserRole } from '@shared/api';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    firstName: '',
    lastName: '',
    role: 'user' as UserRole,
    phoneNumber: '',
    department: '',
    badgeNumber: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const roleOptions = [
    { value: 'user', label: 'User', description: 'Report disasters & request help', requiresApproval: false },
    { value: 'police', label: 'Police', description: 'Monitor & coordinate response', requiresApproval: true },
    { value: 'fire', label: 'Fire Brigade', description: 'Handle fire emergencies', requiresApproval: true },
    { value: 'ambulance', label: 'Ambulance', description: 'Medical emergency response', requiresApproval: true },
    { value: 'hospital', label: 'Hospital', description: 'Medical supplies & dispatch', requiresApproval: true },
    { value: 'admin', label: 'Admin', description: 'Full system access', requiresApproval: true }
  ];

  const selectedRole = roleOptions.find(r => r.value === formData.role);
  const requiresOfficialInfo = selectedRole?.requiresApproval && formData.role !== 'user';

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Display name validation
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    // Role-specific validations
    if (requiresOfficialInfo) {
      if (!formData.department.trim()) {
        newErrors.department = 'Department is required for official roles';
      }
      if (!formData.badgeNumber.trim()) {
        newErrors.badgeNumber = 'Badge/ID number is required for official roles';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const registrationData = {
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        role: formData.role,
        phoneNumber: formData.phoneNumber || undefined,
        department: formData.department || undefined,
        badgeNumber: formData.badgeNumber || undefined
      };

      const response = await register(registrationData);
      
      if (response.success) {
        setShowSuccess(true);
      }
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    if (formData.role === 'user') {
      navigate('/dashboard/user');
    } else {
      navigate('/login'); // Redirect to login for approval-required roles
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back to Home */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6 p-2 hover:bg-white/60"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-emergency-info/10 p-3 rounded-full">
                <AlertTriangle className="h-8 w-8 text-emergency-info" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Create Account</CardTitle>
            <CardDescription className="text-slate-600">
              Join the emergency response system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-slate-500">{option.description}</div>
                          {option.requiresApproval && (
                            <div className="text-xs text-emergency-warning">Requires approval</div>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {requiresOfficialInfo && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-emergency-warning">
                    Official roles require verification. Your account will be pending approval until verified by an administrator.
                  </AlertDescription>
                </Alert>
              )}

              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    className={errors.email ? 'border-emergency-danger' : ''}
                  />
                  {errors.email && <p className="text-sm text-emergency-danger">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    placeholder="How others will see you"
                    className={errors.displayName ? 'border-emergency-danger' : ''}
                  />
                  {errors.displayName && <p className="text-sm text-emergency-danger">{errors.displayName}</p>}
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="First name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter password"
                    className={errors.password ? 'border-emergency-danger' : ''}
                  />
                  {errors.password && <p className="text-sm text-emergency-danger">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm password"
                    className={errors.confirmPassword ? 'border-emergency-danger' : ''}
                  />
                  {errors.confirmPassword && <p className="text-sm text-emergency-danger">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Your phone number"
                />
              </div>

              {/* Official Role Fields */}
              {requiresOfficialInfo && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      placeholder="Department/Agency"
                      className={errors.department ? 'border-emergency-danger' : ''}
                    />
                    {errors.department && <p className="text-sm text-emergency-danger">{errors.department}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="badgeNumber">Badge/ID Number *</Label>
                    <Input
                      id="badgeNumber"
                      value={formData.badgeNumber}
                      onChange={(e) => handleInputChange('badgeNumber', e.target.value)}
                      placeholder="Badge or ID number"
                      className={errors.badgeNumber ? 'border-emergency-danger' : ''}
                    />
                    {errors.badgeNumber && <p className="text-sm text-emergency-danger">{errors.badgeNumber}</p>}
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                variant="default"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <Button 
                  variant="link" 
                  onClick={() => navigate('/login')}
                  className="p-0 h-auto text-emergency-info hover:text-emergency-info/80"
                >
                  Sign in here
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Success Dialog */}
        <Dialog open={showSuccess} onOpenChange={handleSuccessClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center text-emergency-resolved">
                <CheckCircle className="mr-2 h-6 w-6" />
                Account Created Successfully
              </DialogTitle>
              <DialogDescription>
                {requiresOfficialInfo ? 
                  'Your account has been created and is pending approval. You will receive an email once your account is verified.' :
                  'Your account has been created successfully!'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-emergency-info/10 p-4 rounded-lg">
                <div className="flex items-center text-emergency-info">
                  <Mail className="mr-2 h-4 w-4" />
                  <div className="text-sm">
                    <strong>Check your email:</strong> A verification email has been sent to {formData.email}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSuccessClose}>
                  {requiresOfficialInfo ? 'Go to Login' : 'Go to Dashboard'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
