import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDashboardIntegration, useRealtimeIncidents, useRealtimeMissions } from '@/hooks/use-dashboard-integration';
import { Activity, Users, Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function RealTimeDashboardStats() {
  const { 
    isConnected, 
    connectedUsers, 
    realtimeEvents, 
    refreshStats 
  } = useDashboardIntegration();
  
  const realtimeIncidents = useRealtimeIncidents();
  const realtimeMissions = useRealtimeMissions();

  const getDashboardStats = () => {
    const stats = {
      police: realtimeIncidents.filter(i => i.type === 'accident' || i.type === 'police').length,
      fire: realtimeIncidents.filter(i => i.type === 'fire').length,
      ambulance: realtimeIncidents.filter(i => i.type === 'medical').length,
      hospital: 0, // Would be supply requests in real implementation
    };
    return stats;
  };

  const dashboardStats = getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Real-time Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              {isConnected ? (
                <Wifi className="mr-2 h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="mr-2 h-5 w-5 text-red-500" />
              )}
              Dashboard Network
            </span>
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? 'Live' : 'Offline'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Real-time dashboard communication and statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-slate-700">
                {connectedUsers?.connectedUsers || 0}
              </div>
              <div className="text-sm text-slate-600">Total Connected Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emergency-info">
                {realtimeEvents.length}
              </div>
              <div className="text-sm text-slate-600">Recent Events</div>
            </div>
          </div>
          
          {connectedUsers && (
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Active by Role:</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(connectedUsers.usersByRole || {}).map(([role, count]) => (
                  <div key={role} className="flex justify-between p-2 bg-slate-50 rounded text-sm">
                    <span className="capitalize">{role}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={refreshStats}
              disabled={!isConnected}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Stats
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Dashboard Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Live Dashboard Activity
          </CardTitle>
          <CardDescription>
            Real-time incident counts across all emergency services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{dashboardStats.police}</div>
              <div className="text-sm text-red-700">Police Incidents</div>
              <Badge variant="outline" className="mt-1">
                <Users className="h-3 w-3 mr-1" />
                {connectedUsers?.usersByRole?.police || 0} online
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">{dashboardStats.fire}</div>
              <div className="text-sm text-orange-700">Fire Incidents</div>
              <Badge variant="outline" className="mt-1">
                <Users className="h-3 w-3 mr-1" />
                {connectedUsers?.usersByRole?.fire || 0} online
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{dashboardStats.ambulance}</div>
              <div className="text-sm text-blue-700">Medical Incidents</div>
              <Badge variant="outline" className="mt-1">
                <Users className="h-3 w-3 mr-1" />
                {connectedUsers?.usersByRole?.ambulance || 0} online
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{dashboardStats.hospital}</div>
              <div className="text-sm text-green-700">Supply Requests</div>
              <Badge variant="outline" className="mt-1">
                <Users className="h-3 w-3 mr-1" />
                {connectedUsers?.usersByRole?.hospital || 0} online
              </Badge>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold text-slate-700">
              {realtimeIncidents.length + realtimeMissions.length}
            </div>
            <div className="text-sm text-slate-600">Total Active Items</div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      {realtimeEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent System Events</CardTitle>
            <CardDescription>
              Live events from all connected dashboards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {realtimeEvents.slice(0, 10).map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <div>
                    <div className="font-medium text-sm capitalize">
                      {event.type.replace('_', ' ')}
                    </div>
                    {event.data.title && (
                      <div className="text-xs text-slate-600 mt-1">
                        {event.data.title}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
