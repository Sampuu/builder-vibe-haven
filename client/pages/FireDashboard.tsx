import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useIncidents, useInitializeData } from '@/hooks/use-data';
import { useAuth } from '@/hooks/use-auth';
import { Flame, MapPin, AlertTriangle, RefreshCw, Truck, Navigation, Clock } from 'lucide-react';

export default function FireDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { incidents, loading, error, updateIncident, refresh } = useIncidents();
  const dataInitialized = useInitializeData();

  // Filter incidents relevant to fire brigade
  const fireIncidents = incidents.filter(incident => 
    incident.type === 'fire' || 
    incident.assignedRole === 'fire'
  );

  const handleDispatch = async (incidentId: string) => {
    try {
      await updateIncident(incidentId, { 
        status: 'in-progress',
        assignedTo: user?.name || 'Fire Station',
        assignedRole: 'fire'
      });
      toast({
        title: "Unit Dispatched",
        description: "Fire unit has been dispatched to the incident",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to dispatch unit",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (incidentId: string, newStatus: string) => {
    try {
      await updateIncident(incidentId, { status: newStatus as any });
      toast({
        title: "Status Updated",
        description: `Incident status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update incident status",
        variant: "destructive",
      });
    }
  };

  const handleNavigateToFire = (incident: any) => {
    toast({
      title: "Navigation Started",
      description: `Navigating to fire at ${incident.location}`,
    });
    
    if (incident.latitude && incident.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(incident.location)}`;
      window.open(url, '_blank');
    }
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      toast({
        title: "Dashboard Refreshed",
        description: "Latest fire incident data loaded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh dashboard",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-emergency-warning';
      case 'in-progress': return 'bg-emergency-info';
      case 'resolved': return 'bg-emergency-resolved';
      default: return 'bg-slate-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-emergency-danger';
      case 'high': return 'bg-emergency-warning';
      case 'medium': return 'bg-emergency-info';
      default: return 'bg-slate-500';
    }
  };

  useEffect(() => {
    if (dataInitialized) {
      console.log('Fire dashboard data loaded:', fireIncidents.length, 'fire incidents');
    }
  }, [dataInitialized, fireIncidents.length]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Fire Brigade Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center">
                <Flame className="mr-3 h-8 w-8 text-emergency-warning" />
                Fire Brigade Command
              </h2>
              <p className="text-slate-600">Monitor and respond to fire-related emergencies.</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emergency-warning">🚒</div>
              <div className="text-sm text-slate-500">Fire Station Ready</div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={loading}
                className="mt-2"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-danger">
                {fireIncidents.filter(i => i.status !== 'resolved').length}
              </div>
              <div className="text-sm text-slate-600">Active Fires</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-warning">
                {fireIncidents.filter(i => i.priority === 'critical').length}
              </div>
              <div className="text-sm text-slate-600">Critical Priority</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-info">
                {fireIncidents.filter(i => i.status === 'in-progress').length}
              </div>
              <div className="text-sm text-slate-600">Units Dispatched</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-resolved">
                {incidents.filter(i => i.type === 'fire' && i.status === 'resolved' && 
                  new Date(i.updatedAt).toDateString() === new Date().toDateString()).length}
              </div>
              <div className="text-sm text-slate-600">Controlled Today</div>
            </CardContent>
          </Card>
        </div>

        {/* Fire Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Flame className="mr-2 h-5 w-5 text-emergency-warning" />
                Active Fire Incidents ({fireIncidents.filter(i => i.status !== 'resolved').length})
              </span>
              <Button variant="warning" size="sm" onClick={() => navigate('/fire/incidents')}>
                <Flame className="mr-2 h-4 w-4" />
                View All
              </Button>
            </CardTitle>
            <CardDescription>
              Monitor and respond to fire emergencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-slate-400" />
                <p className="text-slate-600">Loading fire incidents...</p>
              </div>
            ) : fireIncidents.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Flame className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No active fire incidents</p>
              </div>
            ) : (
              <div className="space-y-4">
                {fireIncidents.slice(0, 3).map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(incident.status)}`}></div>
                      <div>
                        <div className="font-medium text-slate-900">{incident.title}</div>
                        <div className="text-sm text-slate-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {incident.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={`${getPriorityColor(incident.priority)} text-white`}>
                        {incident.priority}
                      </Badge>
                      <div className="text-sm text-slate-500 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(incident.createdAt).toLocaleTimeString()}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleNavigateToFire(incident)}
                      >
                        <Navigation className="mr-2 h-4 w-4" />
                        Navigate
                      </Button>
                      {incident.status === 'pending' && (
                        <Button 
                          variant="warning" 
                          size="sm"
                          onClick={() => handleDispatch(incident.id)}
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          Dispatch
                        </Button>
                      )}
                      <Select onValueChange={(value) => handleUpdateStatus(incident.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder={incident.status} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">Dispatched</SelectItem>
                          <SelectItem value="resolved">Controlled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="bg-emergency-warning/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Flame className="h-8 w-8 text-emergency-warning" />
              </div>
              <CardTitle>All Fire Incidents</CardTitle>
              <CardDescription>View and manage all fire emergencies</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="warning" onClick={() => navigate('/fire/incidents')}>
                <Flame className="mr-2 h-4 w-4" />
                View All Incidents
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="bg-emergency-info/10 p-4 rounded-full w-fit mx-auto mb-3">
                <MapPin className="h-8 w-8 text-emergency-info" />
              </div>
              <CardTitle>Emergency Map</CardTitle>
              <CardDescription>View fire locations on map</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="info" onClick={() => navigate('/user/map')}>
                <MapPin className="mr-2 h-4 w-4" />
                Open Map
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="bg-emergency-resolved/10 p-4 rounded-full w-fit mx-auto mb-3">
                <AlertTriangle className="h-8 w-8 text-emergency-resolved" />
              </div>
              <CardTitle>Unit Status</CardTitle>
              <CardDescription>Manage fire unit assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="success" onClick={() => navigate('/fire/incidents')}>
                <Truck className="mr-2 h-4 w-4" />
                Manage Units
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
