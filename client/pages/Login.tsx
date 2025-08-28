import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowLeft, Shield, Flame, Truck, Building2, User, Settings, Play } from 'lucide-react';
import { useAuth, UserRole } from '@/hooks/use-auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FirebaseStatus from '@/components/FirebaseStatus';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Demo accounts for testing
  const demoAccounts = [
    {
      role: 'user' as UserRole,
      email: 'user@demo.com',
      password: 'demo123',
      name: 'Regular User',
      icon: User,
      description: 'Report disasters & request help',
      color: 'text-emergency-info'
    },
    {
      role: 'police' as UserRole,
      email: 'police@demo.com',
      password: 'demo123',
      name: 'Police Officer',
      icon: Shield,
      description: 'Monitor & coordinate response',
      color: 'text-emergency-danger'
    },
    {
      role: 'fire' as UserRole,
      email: 'fire@demo.com',
      password: 'demo123',
      name: 'Fire Fighter',
      icon: Flame,
      description: 'Handle fire emergencies',
      color: 'text-emergency-warning'
    },
    {
      role: 'ambulance' as UserRole,
      email: 'ambulance@demo.com',
      password: 'demo123',
      name: 'Paramedic',
      icon: Truck,
      description: 'Medical emergency response',
      color: 'text-emergency-resolved'
    },
    {
      role: 'hospital' as UserRole,
      email: 'hospital@demo.com',
      password: 'demo123',
      name: 'Hospital Staff',
      icon: Building2,
      description: 'Medical supplies & dispatch',
      color: 'text-emergency-info'
    },
    {
      role: 'admin' as UserRole,
      email: 'admin@demo.com',
      password: 'demo123',
      name: 'System Admin',
      icon: Settings,
      description: 'Full system access',
      color: 'text-slate-700'
    }
  ];

  const handleDemoLogin = (demoAccount: typeof demoAccounts[0]) => {
    setEmail(demoAccount.email);
    setPassword(demoAccount.password);
    setError('');
  };

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
      // Navigation will be handled by auth state change
      // User will be redirected based on their stored role
    } else {
      setError('Invalid credentials. Please try again.');
      setIsSubmitting(false);
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

        {/* Demo Accounts Section */}
        <Card className="shadow-xl border-0 mb-6">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center items-center mb-2">
              <Play className="h-5 w-5 text-emergency-info mr-2" />
              <Badge variant="secondary" className="bg-emergency-info/10 text-emergency-info border-emergency-info/20">
                Demo Mode
              </Badge>
            </div>
            <CardTitle className="text-lg font-bold text-slate-900">Try Demo Accounts</CardTitle>
            <CardDescription className="text-slate-600">
              Click any role below to test the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {demoAccounts.map((account) => {
                const IconComponent = account.icon;
                return (
                  <Button
                    key={account.role}
                    variant="outline"
                    className="p-3 h-auto flex flex-col items-center space-y-2 hover:bg-slate-50"
                    onClick={() => handleDemoLogin(account)}
                  >
                    <IconComponent className={`h-5 w-5 ${account.color}`} />
                    <div className="text-center">
                      <div className="font-medium text-xs">{account.name}</div>
                      <div className="text-xs text-slate-500 capitalize">{account.role}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs text-slate-500">
                All demo accounts use password: <code className="bg-slate-100 px-1 rounded">demo123</code>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center mb-6">
          <Separator className="flex-1" />
          <span className="px-3 text-sm text-slate-500">Or login with your account</span>
          <Separator className="flex-1" />
        </div>

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

            <div className="mt-6 space-y-4">
              <div className="text-center">
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
              <FirebaseStatus />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
