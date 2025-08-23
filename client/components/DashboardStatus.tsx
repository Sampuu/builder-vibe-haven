import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDashboardIntegration } from "@/hooks/use-dashboard-integration";
import { Wifi, WifiOff, Users, RefreshCw, Clock } from "lucide-react";

export default function DashboardStatus() {
  const {
    connectionStatus,
    isConnected,
    connectedUsers,
    realtimeEvents,
    refreshStats,
  } = useDashboardIntegration();

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="h-4 w-4 text-green-500" />;
      case "connecting":
        return <RefreshCw className="h-4 w-4 animate-spin text-yellow-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-red-500" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Live";
      case "connecting":
        return "Connecting...";
      default:
        return "Offline";
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500";
      case "connecting":
        return "bg-yellow-500";
      default:
        return "bg-red-500";
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {getConnectionIcon()}
          <span className="ml-2 text-xs">{getConnectionText()}</span>
          {isConnected && (
            <div
              className={`absolute -top-1 -right-1 h-3 w-3 ${getStatusColor()} rounded-full animate-pulse`}
            ></div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              {getConnectionIcon()}
              <span className="ml-2">Dashboard Status</span>
            </CardTitle>
            <CardDescription>
              Real-time dashboard communication status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Connection</span>
              <Badge variant={isConnected ? "default" : "destructive"}>
                {getConnectionText()}
              </Badge>
            </div>

            {/* Connected Users */}
            {connectedUsers && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Active Users</span>
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    {connectedUsers.connectedUsers}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(connectedUsers.usersByRole || {}).map(
                    ([role, count]) => (
                      <div
                        key={role}
                        className="flex justify-between p-2 bg-slate-50 rounded"
                      >
                        <span className="capitalize">{role}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Recent Events */}
            {realtimeEvents.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Recent Events</span>
                  <Badge variant="outline">{realtimeEvents.length}</Badge>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {realtimeEvents.slice(0, 5).map((event, index) => (
                    <div
                      key={index}
                      className="text-xs p-2 bg-slate-50 rounded"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">
                          {event.type.replace("_", " ")}
                        </span>
                        <span className="text-slate-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {event.data.title && (
                        <div className="text-slate-600 mt-1 truncate">
                          {event.data.title}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={refreshStats}
                disabled={!isConnected}
                className="flex-1"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>

            {/* Debug Info */}
            {connectedUsers && (
              <div className="text-xs text-slate-500 border-t pt-2">
                Last updated:{" "}
                {new Date(connectedUsers.timestamp).toLocaleTimeString()}
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
