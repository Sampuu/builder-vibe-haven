import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
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
  const navigate = useNavigate();
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

  const handleNotificationItemClick = (newsId: string) => {
    navigate(`/news/${newsId}`);
    setNotificationCount(Math.max(0, notificationCount - 1));
  };

  // Enhanced notifications with news article links
  const mockNotifications = [
    {
      id: 1,
      title: 'Critical: Major Fire at Downtown Plaza',
      message: 'Fire outbreak requires immediate evacuation - Emergency response active',
      time: '15 min ago',
      newsId: '1',
      priority: 'critical',
      type: 'emergency'
    },
    {
      id: 2,
      title: 'Highway 101 Multi-Vehicle Accident',
      message: 'Medical teams responding to accident with injuries - Traffic delays expected',
      time: '1 hour ago',
      newsId: '2',
      priority: 'high',
      type: 'incident'
    },
    {
      id: 3,
      title: 'Storm Warning: Emergency Supplies Deployed',
      message: 'Severe weather alert - Emergency supplies available at community centers',
      time: '3 hours ago',
      newsId: '3',
      priority: 'medium',
      type: 'weather'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-emergency-danger';
      case 'high': return 'bg-emergency-warning';
      case 'medium': return 'bg-emergency-info';
      default: return 'bg-slate-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency': return '🚨';
      case 'incident': return '⚠️';
      case 'weather': return '🌧️';
      default: return 'ℹ️';
    }
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
                <DropdownMenuContent align="end" className="w-96">
                  <div className="p-3 border-b">
                    <h3 className="font-semibold text-sm">Emergency Notifications</h3>
                    <p className="text-xs text-slate-500">Click to view full details</p>
                  </div>
                  {mockNotifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="p-3 cursor-pointer hover:bg-slate-50 border-b last:border-b-0"
                      onClick={() => handleNotificationItemClick(notification.newsId)}
                    >
                      <div className="w-full space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2 flex-1">
                            <span className="text-lg">{getTypeIcon(notification.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {notification.title}
                              </p>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={`${getPriorityColor(notification.priority)} text-white text-xs ml-2 flex-shrink-0`}
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-500">{notification.time}</p>
                          <span className="text-xs text-emergency-info hover:underline">
                            Click to view details →
                          </span>
                        </div>
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
