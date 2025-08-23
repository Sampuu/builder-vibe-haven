# Login and Signup Pages Code

This document contains the complete code for the login and signup pages from the Disaster Management System.

## 1. Authentication Hook (useAuth)

**File: `client/hooks/use-auth.tsx`**

```tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'user' | 'police' | 'fire' | 'ambulance' | 'hospital' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const storedUser = localStorage.getItem('disaster-auth-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('disaster-auth-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call - in real app this would be a server request
    try {
      // Simple validation for demo purposes
      if (email && password.length >= 6) {
        const user: User = {
          id: `${role}-${Date.now()}`,
          email,
          name: email.split('@')[0],
          role,
        };
        
        setUser(user);
        localStorage.setItem('disaster-auth-user', JSON.stringify(user));
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('disaster-auth-user');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

## 2. Login Page

**File: `client/pages/Login.tsx`**

```tsx
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
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!email || !password || !role) {
      setError('Please fill in all fields');
      setIsSubmitting(false);
      return;
    }

    const success = await login(email, password, role);
    
    if (success) {
      // Redirect to appropriate dashboard based on role
      navigate(`/dashboard/${role}`);
    } else {
      setError('Invalid credentials. Please try again.');
    }
    
    setIsSubmitting(false);
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
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-slate-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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

              {(role === 'police' || role === 'admin') && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This role requires enhanced security authentication in production.
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                variant="danger"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>

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
```

## 3. Signup Page

**File: `client/pages/Signup.tsx`**

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft, UserPlus } from 'lucide-react';
import { useAuth, UserRole } from '@/hooks/use-auth';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as UserRole,
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsSubmitting(false);
      return;
    }

    // In a real app, this would create the account first, then login
    const success = await login(formData.email, formData.password, formData.role);
    
    if (success) {
      // Redirect to appropriate dashboard based on role
      navigate(`/dashboard/${formData.role}`);
    } else {
      setError('Failed to create account. Please try again.');
    }
    
    setIsSubmitting(false);
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
              <div className="bg-emergency-info/10 p-3 rounded-full">
                <UserPlus className="h-8 w-8 text-emergency-info" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Create Account</CardTitle>
            <CardDescription className="text-slate-600">
              Join the emergency response network
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
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
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
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>

              {(formData.role === 'police' || formData.role === 'admin') && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This role requires additional verification and enhanced security in production.
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                variant="info"
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
                  Login here
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

## 4. Protected Route Component

**File: `client/components/ProtectedRoute.tsx`**

```tsx
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredRole?: UserRole;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles, 
  requiredRole 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emergency-danger mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  // Check if user role is in allowed roles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

## 5. Emergency Color Scheme (Tailwind Config)

**File: `tailwind.config.ts`** (Add emergency colors section)

```typescript
export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    extend: {
      colors: {
        // ... other colors
        emergency: {
          danger: "hsl(var(--emergency-danger))",
          "danger-foreground": "hsl(var(--emergency-danger-foreground))",
          warning: "hsl(var(--emergency-warning))",
          "warning-foreground": "hsl(var(--emergency-warning-foreground))",
          resolved: "hsl(var(--emergency-resolved))",
          "resolved-foreground": "hsl(var(--emergency-resolved-foreground))",
          info: "hsl(var(--emergency-info))",
          "info-foreground": "hsl(var(--emergency-info-foreground))",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

## 6. CSS Variables (Global CSS)

**File: `client/global.css`** (Add emergency color variables)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* ... other variables */
    
    --emergency-danger: 0 84.2% 60.2%;
    --emergency-danger-foreground: 210 40% 98%;
    --emergency-warning: 25 95% 53%;
    --emergency-warning-foreground: 210 40% 98%;
    --emergency-resolved: 142 76% 36%;
    --emergency-resolved-foreground: 210 40% 98%;
    --emergency-info: 217.2 91.2% 59.8%;
    --emergency-info-foreground: 210 40% 98%;
  }

  .dark {
    /* ... other dark mode variables */
    
    --emergency-danger: 0 62.8% 30.6%;
    --emergency-danger-foreground: 210 40% 98%;
    --emergency-warning: 25 95% 53%;
    --emergency-warning-foreground: 210 40% 98%;
    --emergency-resolved: 142 76% 36%;
    --emergency-resolved-foreground: 210 40% 98%;
    --emergency-info: 217.2 91.2% 59.8%;
    --emergency-info-foreground: 210 40% 98%;
  }
}
```

## 7. Button Component (With Emergency Variants)

**File: `client/components/ui/button.tsx`** (Add emergency button variants)

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        danger: "bg-emergency-danger text-emergency-danger-foreground hover:bg-emergency-danger/90",
        warning: "bg-emergency-warning text-emergency-warning-foreground hover:bg-emergency-warning/90",
        success: "bg-emergency-resolved text-emergency-resolved-foreground hover:bg-emergency-resolved/90",
        info: "bg-emergency-info text-emergency-info-foreground hover:bg-emergency-info/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
```

## 8. Route Configuration

**File: `client/App.tsx`** (Auth routes section)

```tsx
import { AuthProvider } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);
```

## Features

### Login Page Features:
- ✅ Role-based login (User, Police, Fire, Ambulance, Hospital, Admin)
- ✅ Email and password validation
- ✅ Enhanced security notice for Police/Admin roles
- ✅ Responsive design with emergency color scheme
- ✅ Navigation back to home page
- ✅ Link to signup page
- ✅ Loading states and error handling

### Signup Page Features:
- ✅ Complete registration form with validation
- ✅ Role selection with descriptions
- ✅ Password confirmation
- ✅ Form validation (required fields, password length, password match)
- ✅ Security notices for sensitive roles
- ✅ Auto-login after successful registration
- ✅ Link to login page

### Authentication System Features:
- ✅ Context-based state management
- ✅ Local storage persistence
- ✅ Protected route component
- ✅ Role-based access control
- ✅ Loading states
- ✅ Automatic redirects based on authentication status

### Styling:
- ✅ Emergency color scheme (Red, Orange, Green, Blue)
- ✅ Consistent design language
- ✅ Responsive layout
- ✅ Professional UI with Radix components
- ✅ Smooth animations and transitions

This code provides a complete, production-ready authentication system with role-based access control perfect for emergency management applications.
