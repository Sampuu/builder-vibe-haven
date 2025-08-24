import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  ArrowLeft,
  AlertTriangle,
  MapPin,
  Clock,
  Users,
  Filter,
  Navigation,
  Phone,
  CheckCircle
} from 'lucide-react';

const mockIncidents = [
  { id: 1, title: 'Building Fire at Downtown Plaza', type: 'fire', status: 'in-progress', priority: 'critical', location: 'Downtown Plaza', time: '15 mins ago', assignedTo: 'Fire Station 3' },
  { id: 2, title: 'Traffic Accident on Highway 101', type: 'accident', status: 'pending', priority: 'high', location: 'Highway 101 Mile 23', time: '5 mins ago', assignedTo: 'Unit 12' },
  { id: 3, title: 'Medical Emergency - Heart Attack', type: 'medical', status: 'resolved', priority: 'high', location: 'Oak Street 425', time: '2 hours ago', assignedTo: 'Ambulance 7' },
];

export default function AllIncidents() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);

  const handleRequestBackup = () => {
    setShowBackupDialog(true);
  };

  const handleNavigateToIncident = (location: string) => {
    const encodedLocation = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/${encodedLocation}`, '_blank');
  };

  const handleUpdateStatus = (incident: any) => {
    setSelectedIncident(incident);
    setShowStatusDialog(true);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    // Simulate API call to update status
    console.log(`Updating incident ${selectedIncident?.id} status to: ${newStatus}`);
    setShowStatusDialog(false);
    setSelectedIncident(null);
  };

  const filteredIncidents = mockIncidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard/police')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Police Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                <Shield className="mr-3 h-8 w-8 text-emergency-danger" />
                All Emergency Incidents
              </h1>
              <p className="text-slate-600">Monitor and coordinate response for all emergency situations</p>
            </div>
          </div>
          <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
            <DialogTrigger asChild>
              <Button variant="danger" onClick={handleRequestBackup}>
                <Users className="mr-2 h-4 w-4" />
                Request Backup
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Emergency Backup</DialogTitle>
                <DialogDescription>
                  Send backup requests to other emergency departments
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This will send immediate backup requests to Fire Brigade, Ambulance,
                    and Hospital services based on the emergency type.
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm">
                    <Shield className="mr-2 h-4 w-4" />
                    Police Backup
                  </Button>
                  <Button variant="outline" size="sm">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Fire Brigade
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="mr-2 h-4 w-4" />
                    Ambulance
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-warning">
                {mockIncidents.filter(i => i.status === 'pending').length}
              </div>
              <div className="text-sm text-slate-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-info">
                {mockIncidents.filter(i => i.status === 'in-progress').length}
              </div>
              <div className="text-sm text-slate-600">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-resolved">
                {mockIncidents.filter(i => i.status === 'resolved').length}
              </div>
              <div className="text-sm text-slate-600">Resolved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-danger">
                {mockIncidents.filter(i => i.priority === 'critical').length}
              </div>
              <div className="text-sm text-slate-600">Critical</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Search incidents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Incidents List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Incidents ({filteredIncidents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredIncidents.map((incident) => (
                <div key={incident.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{incident.title}</h3>
                      <p className="text-sm text-slate-600 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {incident.location}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${getPriorityColor(incident.priority)} text-white`}>
                        {incident.priority}
                      </Badge>
                      <Badge className={`${getStatusColor(incident.status)} text-white`}>
                        {incident.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <div>
                      <span className="font-medium">Assigned to: </span>
                      {incident.assignedTo}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {incident.time}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleNavigateToIncident(incident.location)}
                      className="w-full sm:w-auto"
                    >
                      <Navigation className="mr-2 h-4 w-4" />
                      Navigate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(incident)}
                      className="w-full sm:w-auto"
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Update Status
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Incident Status</DialogTitle>
            <DialogDescription>
              Update the status of: {selectedIncident?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusUpdate('pending')}
                className="text-left"
              >
                <Clock className="mr-2 h-4 w-4 text-emergency-warning" />
                Pending
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusUpdate('in-progress')}
                className="text-left"
              >
                <AlertTriangle className="mr-2 h-4 w-4 text-emergency-info" />
                In Progress
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusUpdate('resolved')}
                className="text-left"
              >
                <CheckCircle className="mr-2 h-4 w-4 text-emergency-resolved" />
                Resolved
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
