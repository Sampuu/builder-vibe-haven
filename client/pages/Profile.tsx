import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User,
  Settings,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { UserProfileUpdateRequest } from '@shared/api';

export default function Profile() {
  const { user, updateProfile, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    displayName: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    department: '',
    metadata: {
      preferences: {
        notifications: true,
        darkMode: false,
        language: 'en'
      }
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        department: user.department || '',
        metadata: {
          preferences: {
            notifications: user.metadata?.preferences?.notifications ?? true,
            darkMode: user.metadata?.preferences?.darkMode ?? false,
            language: user.metadata?.preferences?.language ?? 'en'
          }
        }
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.startsWith('preferences.')) {
      const prefField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          preferences: {
            ...prev.metadata.preferences,
            [prefField]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const updates: UserProfileUpdateRequest = {
        displayName: formData.displayName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        department: formData.department,
        metadata: formData.metadata
      };

      await updateProfile(updates);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMessage(null);
    // Reset form data to original values
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        department: user.department || '',
        metadata: {
          preferences: {
            notifications: user.metadata?.preferences?.notifications ?? true,
            darkMode: user.metadata?.preferences?.darkMode ?? false,
            language: user.metadata?.preferences?.language ?? 'en'
          }
        }
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emergency-resolved text-emergency-resolved-foreground';
      case 'pending': return 'bg-emergency-warning text-emergency-warning-foreground';
      case 'suspended': return 'bg-emergency-danger text-emergency-danger-foreground';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'user': return 'User';
      case 'police': return 'Police Officer';
      case 'fire': return 'Fire Fighter';
      case 'ambulance': return 'Ambulance Personnel';
      case 'hospital': return 'Hospital Staff';
      case 'admin': return 'Administrator';
      default: return role;
    }
  };

  if (isLoading || !user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-600">Loading profile...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate(`/dashboard/${user.role}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                <User className="mr-3 h-8 w-8 text-emergency-info" />
                Profile Settings
              </h1>
              <p className="text-slate-600">Manage your account information and preferences</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="text-lg">
                      {user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{user.displayName}</h3>
                    <p className="text-slate-600">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                      <Badge variant="outline">
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600">Email:</span>
                    <span>{user.email}</span>
                  </div>
                  
                  {user.phoneNumber && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-600">Phone:</span>
                      <span>{user.phoneNumber}</span>
                    </div>
                  )}
                  
                  {user.department && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Shield className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-600">Department:</span>
                      <span>{user.department}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600">Joined:</span>
                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            {user.metadata?.statistics && (
              <Card>
                <CardHeader>
                  <CardTitle>Activity Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emergency-info">
                        {user.metadata.statistics.reportsSubmitted}
                      </div>
                      <div className="text-sm text-slate-600">Reports Submitted</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emergency-warning">
                        {user.metadata.statistics.helpRequestsCreated}
                      </div>
                      <div className="text-sm text-slate-600">Help Requests</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emergency-resolved">
                        {user.metadata.statistics.incidentsResolved}
                      </div>
                      <div className="text-sm text-slate-600">Incidents Resolved</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="bg-slate-50"
                    />
                    <p className="text-xs text-slate-500">Email cannot be changed</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  {(user.role !== 'user') && (
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Customize your experience and notification settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications">Email Notifications</Label>
                    <p className="text-sm text-slate-500">Receive updates about incidents and reports</p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={formData.metadata.preferences.notifications}
                    onCheckedChange={(checked) => handleInputChange('preferences.notifications', checked)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="darkMode">Dark Mode</Label>
                    <p className="text-sm text-slate-500">Use dark theme for the interface</p>
                  </div>
                  <Switch
                    id="darkMode"
                    checked={formData.metadata.preferences.darkMode}
                    onCheckedChange={(checked) => handleInputChange('preferences.darkMode', checked)}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
