import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell,
  CheckCheck,
  Trash2,
  Volume2,
  VolumeX,
  AlertTriangle,
  Clock,
  MapPin,
} from "lucide-react";
import {
  useRealtimeNotifications,
  NotificationData,
} from "@/hooks/use-realtime-notifications";
import { formatDistanceToNow } from "date-fns";

const severityColors = {
  low: "text-slate-600",
  medium: "text-blue-600",
  high: "text-orange-600",
  critical: "text-red-600",
};

const typeIcons = {
  emergency: AlertTriangle,
  high_priority: AlertTriangle,
  general: Bell,
};

const typeColors = {
  emergency: "text-red-600",
  high_priority: "text-orange-600",
  general: "text-blue-600",
};

interface NotificationItemProps {
  notification: NotificationData;
  onMarkAsRead: (id: string) => void;
}

function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const { report, type, read, timestamp } = notification;
  const TypeIcon = typeIcons[type];

  return (
    <div
      className={`p-3 rounded-lg border transition-colors cursor-pointer ${
        read ? "bg-slate-50" : "bg-white border-blue-200"
      }`}
      onClick={() => !read && onMarkAsRead(notification.id)}
    >
      <div className="flex items-start space-x-3">
        <TypeIcon className={`h-4 w-4 mt-1 ${typeColors[type]}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p
              className={`text-sm font-medium ${read ? "text-slate-600" : "text-slate-900"}`}
            >
              {report.title}
            </p>
            {!read && <div className="h-2 w-2 bg-blue-500 rounded-full"></div>}
          </div>

          <p
            className={`text-xs mt-1 ${read ? "text-slate-500" : "text-slate-700"}`}
          >
            {report.description.length > 100
              ? `${report.description.substring(0, 100)}...`
              : report.description}
          </p>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-3 text-xs text-slate-500">
              <span
                className={`font-medium ${severityColors[report.severity]}`}
              >
                {report.severity.toUpperCase()}
              </span>
              <span className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {report.location}
              </span>
            </div>

            <span className="text-xs text-slate-400 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    soundEnabled,
    setSoundEnabled,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useRealtimeNotifications();

  const recentNotifications = notifications.slice(0, 10);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" side="bottom" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="h-8 w-8 p-0"
                >
                  {soundEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </Button>

                {notifications.length > 0 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="h-8 px-2"
                    >
                      <CheckCheck className="h-4 w-4 mr-1" />
                      All
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAll}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {unreadCount > 0 && (
              <p className="text-sm text-slate-600">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </CardHeader>

          <Separator />

          <CardContent className="p-0">
            {recentNotifications.length > 0 ? (
              <ScrollArea className="h-96">
                <div className="p-3 space-y-3">
                  {recentNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                    />
                  ))}
                </div>

                {notifications.length > 10 && (
                  <div className="p-3 pt-0">
                    <p className="text-xs text-center text-slate-500">
                      {notifications.length - 10} more notification
                      {notifications.length - 10 !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </ScrollArea>
            ) : (
              <div className="p-6 text-center">
                <Bell className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Emergency reports will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
