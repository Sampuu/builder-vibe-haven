import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  BellRing, 
  Volume2, 
  VolumeX,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import NotificationCenter, { useNotificationCount } from './NotificationCenter';
import { useNavigate } from 'react-router-dom';

interface NotificationBellProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  enableSound?: boolean;
}

export default function NotificationBell({ 
  className = "", 
  size = 'md',
  showBadge = true,
  enableSound = true
}: NotificationBellProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(enableSound);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);
  const unreadCount = useNotificationCount();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound
  useEffect(() => {
    if (enableSound) {
      audioRef.current = new Audio('/notification-sound.mp3');
      audioRef.current.volume = 0.5;
    }
  }, [enableSound]);

  // Play sound for new notifications
  useEffect(() => {
    if (unreadCount > 0 && soundEnabled && !hasPlayedSound) {
      playNotificationSound();
      setHasPlayedSound(true);
    } else if (unreadCount === 0) {
      setHasPlayedSound(false);
    }
  }, [unreadCount, soundEnabled, hasPlayedSound]);

  const playNotificationSound = () => {
    if (audioRef.current && soundEnabled) {
      audioRef.current.play().catch(error => {
        console.log('Could not play notification sound:', error);
      });
    }
  };

  const getBellSize = () => {
    switch (size) {
      case 'sm': return 'h-4 w-4';
      case 'md': return 'h-5 w-5';
      case 'lg': return 'h-6 w-6';
      default: return 'h-5 w-5';
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'sm';
      case 'md': return 'sm';
      case 'lg': return 'default';
      default: return 'sm';
    }
  };

  const handleBellClick = () => {
    setIsOpen(!isOpen);
  };

  const handleViewAllNotifications = () => {
    setIsOpen(false);
    navigate('/notifications');
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  return (
    <div className={`relative ${className}`}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size={getButtonSize()}
            className="relative hover:bg-gray-100 focus:bg-gray-100"
            onClick={handleBellClick}
          >
            {unreadCount > 0 ? (
              <BellRing className={`${getBellSize()} text-blue-600 animate-pulse`} />
            ) : (
              <Bell className={`${getBellSize()} text-gray-600`} />
            )}
            
            {showBadge && unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-0"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          align="end" 
          className="w-80 max-h-96 overflow-hidden"
          side="bottom"
          sideOffset={5}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </h3>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSound}
                  className="p-1 h-6 w-6"
                  title={soundEnabled ? 'Disable sound' : 'Enable sound'}
                >
                  {soundEnabled ? (
                    <Volume2 className="h-3 w-3" />
                  ) : (
                    <VolumeX className="h-3 w-3" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/settings/notifications')}
                  className="p-1 h-6 w-6"
                  title="Notification settings"
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            <NotificationCenter 
              compact={true} 
              maxHeight="320px"
              className="border-0 shadow-none"
            />
          </div>

          {/* Footer */}
          {unreadCount > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewAllNotifications}
                  className="w-full text-center text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  View All Notifications
                </Button>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Notification Sound Element */}
      {enableSound && (
        <audio
          ref={audioRef}
          preload="auto"
          style={{ display: 'none' }}
        >
          <source src="/notification-sound.mp3" type="audio/mpeg" />
          <source src="/notification-sound.wav" type="audio/wav" />
        </audio>
      )}
    </div>
  );
}

// Notification badge component for showing count only
export function NotificationBadge({ 
  className = "",
  size = 'sm' 
}: { 
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const unreadCount = useNotificationCount();

  if (unreadCount === 0) return null;

  const sizeClasses = {
    sm: 'h-4 w-4 text-xs',
    md: 'h-5 w-5 text-xs',
    lg: 'h-6 w-6 text-sm'
  };

  return (
    <Badge 
      variant="destructive" 
      className={`${sizeClasses[size]} flex items-center justify-center p-0 min-w-0 ${className}`}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </Badge>
  );
}

// Simple notification count hook for other components
export { useNotificationCount };
