import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useIncidents, useMissions, useInitializeData } from '@/hooks/use-data';
import { useCreateNotification } from '@/components/NotificationCenter';
import { useAuth } from '@/hooks/use-auth';
import {
  Activity,
  ArrowLeft,
  CheckCircle,
  RefreshCw,
  Trash2,
  MapPin,
  Clock,
  AlertTriangle,
  User,
  Phone,
  Edit,
  Plus
} from 'lucide-react';


export default function MissionControl() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { incidents, loading: incidentsLoading, error: incidentsError, updateIncident, deleteIncident, refresh: refreshIncidents } = useIncidents();
  const { missions, loading: missionsLoading, error: missionsError, createMission, updateMission, deleteMission, refresh: refreshMissions } = useMissions();
  const { notify } = useCreateNotification();
  const dataInitialized = useInitializeData();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [createMissionDialog, setCreateMissionDialog] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<string>('');

  // Convert incidents to missions format for display
  const incidentMissions = incidents.map(incident => ({
    id: incident.id,
    title: incident.title,
    type: incident.type,
    status: incident.status,
    priority: incident.priority,
    location: incident.location,
    assignedTo: incident.assignedTo || 'Unassigned',
    assignedRole: incident.assignedRole || 'none',
    createdAt: incident.createdAt,
    updatedAt: incident.updatedAt,
    description: incident.description,
    resources: incident.resources,
    isIncident: true
  }));

  // Combine incidents and missions
  const allMissions = [...incidentMissions, ...missions.map(m => ({ ...m, isIncident: false }))];
  const loading = incidentsLoading || missionsLoading;
  const error = incidentsError || missionsError;

  const filteredMissions = allMissions.filter(mission => {
    const matchesSearch = mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mission.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || mission.status === selectedStatus;
    const matchesType = selectedType === 'all' || mission.type === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleMarkComplete = async (missionId: string, isIncident: boolean) => {
    try {
      if (isIncident) {
        await updateIncident(missionId, { status: 'resolved' });
      } else {
        await updateMission(missionId, { status: 'resolved' });
      }

      await notify('Mission Completed', `Mission has been marked as complete`, 'success');
      toast({
        title: "Mission Completed",
        description: "Mission has been marked as complete",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark mission as complete",
        variant: "destructive",
      });
    }
  };

  const handleRefreshMission = async () => {
    try {
      await Promise.all([refreshIncidents(), refreshMissions()]);
      toast({
        title: "Missions Refreshed",
        description: "All mission data has been refreshed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh missions",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMission = async (missionId: string, isIncident: boolean) => {
    if (!window.confirm('Are you sure you want to delete this mission?')) return;

    try {
      if (isIncident) {
        await deleteIncident(missionId);
      } else {
        await deleteMission(missionId);
      }

      toast({
        title: "Mission Deleted",
        description: "Mission has been deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete mission",
        variant: "destructive",
      });
    }
  };

  const handleCreateMissionFromIncident = async () => {
    if (!selectedIncident) {
      toast({
        title: "No Incident Selected",
        description: "Please select an incident to create a mission from",
        variant: "destructive",
      });
      return;
    }

    const incident = incidents.find(i => i.id === selectedIncident);
    if (!incident) return;

    try {
      await createMission({
        incidentId: incident.id,
        title: `Mission: ${incident.title}`,
        type: incident.type,
        status: 'pending',
        priority: incident.priority,
        assignedTo: incident.assignedTo || 'Unassigned',
        assignedRole: incident.assignedRole || 'none',
        resources: incident.resources,
        notes: `Created from incident: ${incident.description}`
      });

      toast({
        title: "Mission Created",
        description: "New mission has been created from incident",
      });

      setCreateMissionDialog(false);
      setSelectedIncident('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create mission",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (dataInitialized) {
      console.log('Mission control data loaded:', allMissions.length, 'total missions');
    }
  }, [dataInitialized, allMissions.length]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-emergency-warning';
      case 'in-progress': return 'bg-emergency-info';
      case 'resolved': return 'bg-emergency-resolved';
      case 'cancelled': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-emergency-danger';
      case 'high': return 'bg-emergency-warning';
      case 'medium': return 'bg-emergency-info';
      case 'low': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fire': return AlertTriangle;
      case 'medical': return Phone;
      case 'accident': return AlertTriangle;
      case 'rescue': return User;
      default: return Activity;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard/admin')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                <Activity className="mr-3 h-8 w-8 text-emergency-info" />
                Mission Control Center
              </h1>
              <p className="text-slate-600">Monitor and manage all active emergency missions</p>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-warning">
                {allMissions.filter(m => m.status === 'pending').length}
              </div>
              <div className="text-sm text-slate-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-info">
                {allMissions.filter(m => m.status === 'in-progress').length}
              </div>
              <div className="text-sm text-slate-600">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-resolved">
                {allMissions.filter(m => m.status === 'resolved').length}
              </div>
              <div className="text-sm text-slate-600">Resolved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-danger">
                {allMissions.filter(m => m.priority === 'critical').length}
              </div>
              <div className="text-sm text-slate-600">Critical</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-slate-700">
                {incidents.length}
              </div>
              <div className="text-sm text-slate-600">Total Incidents</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search Missions</Label>
                <Input
                  id="search"
                  placeholder="Search by title or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="statusFilter">Filter by Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="typeFilter">Filter by Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="fire">Fire</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="accident">Accident</SelectItem>
                    <SelectItem value="rescue">Rescue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Missions List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Active Missions ({filteredMissions.length})</span>
              <div className="flex space-x-2">
                <Dialog open={createMissionDialog} onOpenChange={setCreateMissionDialog}>
                  <DialogTrigger asChild>
                    <Button variant="info" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Mission
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Mission from Incident</DialogTitle>
                      <DialogDescription>
                        Select an incident to create a formal mission assignment
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="incident">Select Incident</Label>
                        <Select value={selectedIncident} onValueChange={setSelectedIncident}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an incident" />
                          </SelectTrigger>
                          <SelectContent>
                            {incidents.filter(i => i.status !== 'resolved').map(incident => (
                              <SelectItem key={incident.id} value={incident.id}>
                                {incident.title} - {incident.location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handleCreateMissionFromIncident} className="flex-1">
                          Create Mission
                        </Button>
                        <Button onClick={() => setCreateMissionDialog(false)} variant="outline" className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm" onClick={handleRefreshMission} disabled={loading}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardTitle>
            <CardDescription>All emergency missions across all departments</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-slate-400" />
                <p className="text-slate-600">Loading missions...</p>
              </div>
            ) : filteredMissions.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No missions match your filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMissions.map((mission) => {
                  const TypeIcon = getTypeIcon(mission.type);
                  return (
                    <div key={mission.id} className="border border-slate-200 rounded-lg p-6 bg-slate-50">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-white p-2 rounded-lg">
                            <TypeIcon className="h-5 w-5 text-slate-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {mission.title}
                              {(mission as any).isIncident && (
                                <Badge variant="outline" className="ml-2">Incident</Badge>
                              )}
                            </h3>
                            <p className="text-sm text-slate-600 flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {mission.location}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getPriorityColor(mission.priority)} text-white`}>
                            {mission.priority}
                          </Badge>
                          <Badge className={`${getStatusColor(mission.status)} text-white`}>
                            {mission.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-slate-600">{mission.description}</p>
                          <div className="mt-2">
                            <span className="text-sm font-medium text-slate-700">Resources: </span>
                            <span className="text-sm text-slate-600">{mission.resources.join(', ')}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium text-slate-700">Assigned to: </span>
                            <span className="text-slate-600">{mission.assignedTo} ({mission.assignedRole})</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-slate-700">Created: </span>
                            <span className="text-slate-600">{new Date(mission.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-slate-700">Updated: </span>
                            <span className="text-slate-600">{new Date(mission.updatedAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <div className="flex items-center space-x-1 text-sm text-slate-500">
                          <Clock className="h-4 w-4" />
                          <span>Last updated: {new Date(mission.updatedAt).toLocaleString()}</span>
                        </div>
                        <div className="flex space-x-2">
                          {mission.status !== 'resolved' && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleMarkComplete(mission.id, (mission as any).isIncident)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Complete
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMission(mission.id, (mission as any).isIncident)}
                            className="text-emergency-danger hover:text-emergency-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
