import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  ArrowLeft,
  AlertTriangle,
  MapPin,
  Clock,
  Users,
  Filter
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
          <Button variant="danger">
            <Users className="mr-2 h-4 w-4" />
            Request Backup
          </Button>
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
                  <div className="flex space-x-2 mt-3">
                    <Button size="sm" variant="outline">
                      <MapPin className="mr-2 h-4 w-4" />
                      Navigate
                    </Button>
                    <Button size="sm" variant="outline">
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
    </DashboardLayout>
  );
}
