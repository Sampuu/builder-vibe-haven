import { useState } from 'react';
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
  Edit
} from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  type: 'fire' | 'medical' | 'accident' | 'rescue';
  status: 'pending' | 'in-progress' | 'resolved' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  assignedTo: string;
  assignedRole: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  resources: string[];
}

const mockMissions: Mission[] = [
  {
    id: '1',
    title: 'Building Fire at Downtown Plaza',
    type: 'fire',
    status: 'in-progress',
    priority: 'critical',
    location: 'Downtown Plaza, Building A',
    assignedTo: 'Fire Station 3',
    assignedRole: 'fire',
    createdAt: '2024-01-20 14:30',
    updatedAt: '2024-01-20 14:45',
    description: 'Large fire on 5th floor, evacuation in progress',
    resources: ['Fire Truck', 'Ambulance', 'Police Unit']
  },
  {
    id: '2',
    title: 'Medical Emergency - Heart Attack',
    type: 'medical',
    status: 'pending',
    priority: 'high',
    location: 'Oak Street 425',
    assignedTo: 'Ambulance Unit 7',
    assignedRole: 'ambulance',
    createdAt: '2024-01-20 15:15',
    updatedAt: '2024-01-20 15:15',
    description: '67-year-old male, chest pain, difficulty breathing',
    resources: ['Ambulance', 'Paramedic Team']
  },
  {
    id: '3',
    title: 'Traffic Accident - Highway 101',
    type: 'accident',
    status: 'resolved',
    priority: 'medium',
    location: 'Highway 101, Mile Marker 23',
    assignedTo: 'Officer Martinez',
    assignedRole: 'police',
    createdAt: '2024-01-20 12:00',
    updatedAt: '2024-01-20 13:30',
    description: 'Multi-vehicle collision, no serious injuries',
    resources: ['Police Unit', 'Tow Truck']
  }
];

export default function MissionControl() {
  const navigate = useNavigate();
  const [missions, setMissions] = useState<Mission[]>(mockMissions);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [success, setSuccess] = useState('');

  const filteredMissions = missions.filter(mission => {
    const matchesSearch = mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mission.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || mission.status === selectedStatus;
    const matchesType = selectedType === 'all' || mission.type === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleMarkComplete = (missionId: string) => {
    const updatedMissions = missions.map(mission =>
      mission.id === missionId
        ? { ...mission, status: 'resolved' as const, updatedAt: new Date().toLocaleString() }
        : mission
    );
    setMissions(updatedMissions);
    setSuccess('Mission marked as complete');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleRefreshMission = (missionId: string) => {
    const updatedMissions = missions.map(mission =>
      mission.id === missionId
        ? { ...mission, updatedAt: new Date().toLocaleString() }
        : mission
    );
    setMissions(updatedMissions);
    setSuccess('Mission refreshed');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDeleteMission = (missionId: string) => {
    if (window.confirm('Are you sure you want to delete this mission?')) {
      setMissions(missions.filter(mission => mission.id !== missionId));
      setSuccess('Mission deleted');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

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

        {/* Success Messages */}
        {success && (
          <Alert className="border-emergency-resolved bg-emergency-resolved/10">
            <AlertDescription className="text-emergency-resolved">{success}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-warning">
                {missions.filter(m => m.status === 'pending').length}
              </div>
              <div className="text-sm text-slate-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-info">
                {missions.filter(m => m.status === 'in-progress').length}
              </div>
              <div className="text-sm text-slate-600">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-resolved">
                {missions.filter(m => m.status === 'resolved').length}
              </div>
              <div className="text-sm text-slate-600">Resolved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-danger">
                {missions.filter(m => m.priority === 'critical').length}
              </div>
              <div className="text-sm text-slate-600">Critical</div>
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
            <CardTitle>Active Missions ({filteredMissions.length})</CardTitle>
            <CardDescription>All emergency missions across all departments</CardDescription>
          </CardHeader>
          <CardContent>
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
                          <h3 className="font-semibold text-slate-900">{mission.title}</h3>
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
                          <span className="text-slate-600">{mission.createdAt}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-slate-700">Updated: </span>
                          <span className="text-slate-600">{mission.updatedAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <div className="flex items-center space-x-1 text-sm text-slate-500">
                        <Clock className="h-4 w-4" />
                        <span>Last updated: {mission.updatedAt}</span>
                      </div>
                      <div className="flex space-x-2">
                        {mission.status !== 'resolved' && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleMarkComplete(mission.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Complete
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRefreshMission(mission.id)}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Refresh
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMission(mission.id)}
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
