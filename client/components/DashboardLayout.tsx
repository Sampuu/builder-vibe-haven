import { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth-firebase';
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
  Bell
} from 'lucide-react';

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
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const RoleIcon = roleIcons[user.role];

  const handleLogout = () => {
    logout();
    window.location.href = '/';
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
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-emergency-danger rounded-full"></div>
              </Button>

              {/* User Avatar and Info */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{user.displayName}</p>
                  <p className="text-xs text-slate-500 capitalize flex items-center">
                    <RoleIcon className={`h-3 w-3 mr-1 ${roleColors[user.role]}`} />
                    {user.role}
                  </p>
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
    </div>
  );
}
