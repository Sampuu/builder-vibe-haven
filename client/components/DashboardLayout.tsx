import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  AlertTriangle, 
  LogOut, 
  Shield, 
  Flame, 
  Truck, 
  Building2, 
  User, 
  Settings,
  Bell,
  Crown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: ReactNode;
}

const roleIcons = {
  user: User,
  police: Shield,
  fire: Flame,
  ambulance: Truck,
  hospital: Building2,
  admin: Settings,
};

const roleColors = {
  user: 'text-emergency-info',
  police: 'text-emergency-danger',
  fire: 'text-emergency-warning',
  ambulance: 'text-emergency-resolved',
  hospital: 'text-emergency-info',
  admin: 'text-slate-700',
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, checkIfAdmin, firebaseUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const navigate = useNavigate();
  
  if (!user) return null;

  // Check if user is admin when component mounts or user changes
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (firebaseUser) {
        setIsCheckingAdmin(true);
        try {
          const adminStatus = await checkIfAdmin(firebaseUser.uid);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
        setIsCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [firebaseUser, checkIfAdmin]);

  const RoleIcon = roleIcons[user.role];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      window.location.href = '/';
    }
  };

  const goToAdminPanel = () => {
    navigate('/admin/dashboards');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="bg-emergency-danger/10 p-2 rounded-lg mr-3">
                  <AlertTriangle className="h-6 w-6 text-emergency-danger" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">
                    Emergency Response System
                  </h1>
                  <p className="text-sm text-slate-500 capitalize">
                    {user.role} Dashboard
                  </p>
                </div>
              </div>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center space-x-4">
              {/* Admin Panel Access - Show for admin role or verified admin users */}
              {(user.role === 'admin' || isAdmin) && !isCheckingAdmin && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToAdminPanel}
                  className="bg-emergency-warning/10 hover:bg-emergency-warning/20 border-emergency-warning/30"
                >
                  <Crown className="h-4 w-4 mr-2 text-emergency-warning" />
                  Admin Panel
                </Button>
              )}

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-emergency-danger rounded-full"></div>
              </Button>

              {/* User Avatar and Info */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                    {(user.role === 'admin' || isAdmin) && (
                      <Crown className="h-3 w-3 text-emergency-warning" title="Admin User" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 capitalize flex items-center justify-end">
                    <RoleIcon className={`h-3 w-3 mr-1 ${roleColors[user.role]}`} />
                    {user.role}
                  </p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
                <Avatar>
                  <AvatarFallback className="bg-emergency-info/10 text-emergency-info font-semibold">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Logout */}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Firebase Auth Status Indicator (for development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border text-xs">
          <p className="font-medium text-slate-700">Firebase Auth Status:</p>
          <p className="text-slate-500">User ID: {firebaseUser?.uid || 'Not logged in'}</p>
          <p className="text-slate-500">Admin: {isCheckingAdmin ? 'Checking...' : (isAdmin ? 'Yes' : 'No')}</p>
        </div>
      )}
    </div>
  );
}
