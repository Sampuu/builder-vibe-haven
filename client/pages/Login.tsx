import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth, UserRole } from '@/hooks/use-auth';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setIsSubmitting(false);
      return;
    }

    const success = await login(email, password);

    if (success) {
      // The auth provider will automatically redirect based on user role
      // For now, let's navigate to a general dashboard
      navigate('/');
    } else {
      setError('Invalid credentials. Please check your email and password.');
    }

    setIsSubmitting(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');

    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }

    const success = await resetPassword(resetEmail);

    if (success) {
      setResetMessage('Password reset email sent! Check your inbox.');
      setShowResetPassword(false);
      setResetEmail('');
    } else {
      setError('Failed to send reset email. Please check your email address.');
    }
  };

  const roleOptions = [
    { value: 'user', label: 'User', description: 'Report disasters & request help' },
    { value: 'police', label: 'Police', description: 'Monitor & coordinate response' },
    { value: 'fire', label: 'Fire Brigade', description: 'Handle fire emergencies' },
    { value: 'ambulance', label: 'Ambulance', description: 'Medical emergency response' },
    { value: 'hospital', label: 'Hospital', description: 'Medical supplies & dispatch' },
    { value: 'admin', label: 'Admin', description: 'Full system access' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
              <div className="bg-emergency-danger/10 p-3 rounded-full">
                <AlertTriangle className="h-8 w-8 text-emergency-danger" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Login to System</CardTitle>
            <CardDescription className="text-slate-600">
              Access your emergency response dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>


              <Button 
                type="submit" 
                className="w-full" 
                variant="danger"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            {!showResetPassword && (
              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={() => setShowResetPassword(true)}
                  className="p-0 h-auto text-sm text-slate-500 hover:text-slate-700"
                >
                  Forgot your password?
                </Button>
              </div>
            )}

            {showResetPassword && (
              <div className="mt-4 p-4 border rounded-lg bg-slate-50">
                <h3 className="text-sm font-medium mb-2">Reset Password</h3>
                <form onSubmit={handlePasswordReset} className="space-y-3">
                  <Input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" className="flex-1">
                      Send Reset Email
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowResetPassword(false);
                        setResetEmail('');
                        setError('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {resetMessage && (
              <Alert className="mt-4">
                <AlertDescription className="text-green-700">
                  {resetMessage}
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <Button
                  variant="link"
                  onClick={() => navigate('/signup')}
                  className="p-0 h-auto text-emergency-danger hover:text-emergency-danger/80"
                >
                  Sign up here
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
