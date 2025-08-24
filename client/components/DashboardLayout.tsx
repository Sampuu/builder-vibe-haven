import { ReactNode, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  const [notificationCount, setNotificationCount] = useState(3);

  if (!user) return null;

  const RoleIcon = roleIcons[user.role];

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleNotificationClick = () => {
    // Mark notifications as read
    setNotificationCount(0);
  };

  const mockNotifications = [
    { id: 1, message: 'New emergency report filed', time: '5 min ago' },
    { id: 2, message: 'System backup completed', time: '1 hour ago' },
    { id: 3, message: 'User permissions updated', time: '2 hours ago' }
  ];

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
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && (
                      <div className="absolute -top-1 -right-1 h-4 w-4 bg-emergency-danger rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">
                          {notificationCount > 9 ? '9+' : notificationCount}
                        </span>
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-2 border-b">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                  </div>
                  {mockNotifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="p-3 cursor-pointer">
                      <div className="w-full">
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-slate-500 mt-1">{notification.time}</p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={handleNotificationClick}
                    >
                      Mark all as read
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Avatar and Info */}
              <div className="hidden md:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{user.name}</p>
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

              {/* Mobile User Menu */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-emergency-info/10 text-emergency-info font-semibold text-xs">
                          {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="p-2 border-b">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-slate-500 capitalize flex items-center">
                        <RoleIcon className={`h-3 w-3 mr-1 ${roleColors[user.role]}`} />
                        {user.role}
                      </p>
                    </div>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Desktop Logout */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hidden md:flex"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {children}
      </main>
    </div>
  );
}
