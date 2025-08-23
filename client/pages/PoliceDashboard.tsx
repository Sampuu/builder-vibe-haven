import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import BackupRequestDialog from '@/components/BackupRequestDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useIncidents, useNotifications, useInitializeData } from '@/hooks/use-data';
import { useAuth } from '@/hooks/use-auth';
import {
  Shield,
  AlertTriangle,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  RefreshCw,
  Siren,
  Phone
} from 'lucide-react';

export default function PoliceDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { incidents, loading, error, updateIncident, refresh } = useIncidents();
  const { createNotification } = useNotifications(user?.id || '');
  const dataInitialized = useInitializeData();
  const [backupRequestOpen, setBackupRequestOpen] = useState(false);
  const [backupType, setBackupType] = useState('');
  const [backupReason, setBackupReason] = useState('');
  const [statusUpdateIncident, setStatusUpdateIncident] = useState<string | null>(null);

  // Filter incidents relevant to police
  const policeIncidents = incidents.filter(incident =>
    incident.type === 'accident' ||
    incident.type === 'police' ||
    incident.status === 'pending' ||
    incident.assignedRole === 'police'
  );

  const handleRequestBackup = async () => {
    if (!backupType || !backupReason) {
      toast({
        title: "Missing Information",
        description: "Please select backup type and provide reason",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create notification for the requested backup entity
      await createNotification({
        userId: `${backupType}-dispatch`, // This would be the actual user ID in real app
        title: `Police Backup Request`,
        message: `Police requesting ${backupType} backup: ${backupReason}`,
        type: 'warning',
        isRead: false,
        actionRequired: true,
      });

      toast({
        title: "Backup Requested",
        description: `${backupType} backup has been notified`,
      });

      setBackupRequestOpen(false);
      setBackupType('');
      setBackupReason('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request backup",
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

  const handleNavigateToIncident = (incident: any) => {
    // In a real app, this would open navigation app
    toast({
      title: "Navigation Started",
      description: `Navigating to ${incident.location}`,
    });

    // For demo, open Google Maps
    if (incident.latitude && incident.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`;
      window.open(url, '_blank');
    } else {
      // Use location name if coordinates not available
      const url = `https://www.google.com/maps/search/${encodeURIComponent(incident.location)}`;
      window.open(url, '_blank');
    }
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      toast({
        title: "Dashboard Refreshed",
        description: "Latest incident data loaded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh dashboard",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (dataInitialized) {
      console.log('Police dashboard data loaded:', policeIncidents.length, 'relevant incidents');
    }
  }, [dataInitialized, policeIncidents.length]);

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Police Control Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center">
                <Shield className="mr-3 h-8 w-8 text-emergency-danger" />
                Police Command Center
              </h2>
              <p className="text-slate-600">
                Monitor all incidents and coordinate emergency response across all departments.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emergency-danger">24/7</div>
              <div className="text-sm text-slate-500">Active Monitoring</div>
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
                {policeIncidents.filter(i => i.status !== 'resolved').length}
              </div>
              <div className="text-sm text-slate-600">Active Incidents</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-warning">
                {policeIncidents.filter(i => i.priority === 'critical').length}
              </div>
              <div className="text-sm text-slate-600">Critical Priority</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-info">
                {policeIncidents.filter(i => i.status === 'in-progress').length}
              </div>
              <div className="text-sm text-slate-600">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-resolved">
                {incidents.filter(i => i.status === 'resolved' &&
                  new Date(i.updatedAt).toDateString() === new Date().toDateString()).length}
              </div>
              <div className="text-sm text-slate-600">Resolved Today</div>
            </CardContent>
          </Card>
        </div>

        {/* All Incidents View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-emergency-danger" />
                All Active Incidents
              </span>
              <Button variant="danger" size="sm" onClick={() => navigate('/police/incidents')}>
                <Users className="mr-2 h-4 w-4" />
                View All
              </Button>
            </CardTitle>
            <CardDescription>
              Monitor and coordinate response for all emergency incidents
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-slate-400" />
                <p className="text-slate-600">Loading incidents...</p>
              </div>
            ) : policeIncidents.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Shield className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No active incidents requiring police response</p>
              </div>
            ) : (
              <div className="space-y-4">
                {policeIncidents.slice(0, 5).map((incident) => (
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
                        onClick={() => handleNavigateToIncident(incident)}
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        Navigate
                      </Button>
                      <Select onValueChange={(value) => handleUpdateStatus(incident.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder={incident.status} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
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
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="bg-emergency-danger/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Users className="h-8 w-8 text-emergency-danger" />
              </div>
              <CardTitle>Request Backup</CardTitle>
              <CardDescription>Send requests to Fire Brigade, Ambulance, or Hospital</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="danger"
                onClick={() => setBackupRequestOpen(true)}
              >
                <Siren className="mr-2 h-4 w-4" />
                Request Backup
              </Button>

              <BackupRequestDialog
                open={backupRequestOpen}
                onOpenChange={setBackupRequestOpen}
              />
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="bg-emergency-info/10 p-4 rounded-full w-fit mx-auto mb-3">
                <MapPin className="h-8 w-8 text-emergency-info" />
              </div>
              <CardTitle>Command Map</CardTitle>
              <CardDescription>View all incidents on interactive map</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="info" onClick={() => navigate('/police/map')}>Open Map</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="bg-emergency-resolved/10 p-4 rounded-full w-fit mx-auto mb-3">
                <CheckCircle className="h-8 w-8 text-emergency-resolved" />
              </div>
              <CardTitle>Status Management</CardTitle>
              <CardDescription>Update incident status and dispatch resources</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="success"
                onClick={() => navigate('/police/incidents')}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Manage Status
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
