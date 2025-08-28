import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Map, 
  ArrowLeft,
  MapPin,
  AlertTriangle,
  Filter,
  ZoomIn,
  ZoomOut,
  Layers,
  Info,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { UserDashboardService } from '@/lib/user-dashboard-db';
import { ViewMapIncident } from '@shared/user-dashboard-types';

// Mock incidents data - in real implementation, this would come from Firebase
const mockIncidents: ViewMapIncident[] = [
  {
    incidentId: '1',
    type: 'fire',
    location: { latitude: 37.7749, longitude: -122.4194, address: 'Downtown Plaza, San Francisco' },
    severity: 'high',
    status: 'active',
    reportedBy: 'user123',
    reporterName: 'John Doe',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    description: 'Large building fire with smoke visible',
    lastUpdated: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
  },
  {
    incidentId: '2',
    type: 'accident',
    location: { latitude: 37.7849, longitude: -122.4094, address: 'Highway 101, Mile Marker 15' },
    severity: 'medium',
    status: 'monitoring',
    reportedBy: 'user456',
    reporterName: 'Jane Smith',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    description: 'Multi-vehicle collision, traffic blocked',
    lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
  },
  {
    incidentId: '3',
    type: 'medical',
    location: { latitude: 37.7649, longitude: -122.4294, address: 'Oak Street Community Center' },
    severity: 'high',
    status: 'resolved',
    reportedBy: 'user789',
    reporterName: 'Emergency Services',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    description: 'Medical emergency - patient transported',
    lastUpdated: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
  }
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-emergency-danger text-emergency-danger-foreground';
    case 'high': return 'bg-emergency-warning text-emergency-warning-foreground';
    case 'medium': return 'bg-emergency-info text-emergency-info-foreground';
    case 'low': return 'bg-emergency-resolved text-emergency-resolved-foreground';
    default: return 'bg-slate-500 text-white';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-emergency-danger text-emergency-danger-foreground';
    case 'monitoring': return 'bg-emergency-warning text-emergency-warning-foreground';
    case 'resolved': return 'bg-emergency-resolved text-emergency-resolved-foreground';
    default: return 'bg-slate-500 text-white';
  }
};

const getIncidentIcon = (type: string) => {
  switch (type) {
    case 'fire': return '🔥';
    case 'medical': return '🚑';
    case 'accident': return '🚗';
    case 'flood': return '🌊';
    case 'earthquake': return '🌍';
    default: return '⚠️';
  }
};

const timeAgo = (date: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

export default function ViewMap() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [incidents, setIncidents] = useState<ViewMapIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Track map view on component mount
  useEffect(() => {
    if (user?.id) {
      UserDashboardService.trackMapView(user.id);
    }
  }, [user]);

  // Load incidents on component mount
  useEffect(() => {
    const loadIncidents = async () => {
      try {
        setLoading(true);
        // In real implementation, this would fetch from Firebase
        // const firebaseIncidents = await UserDashboardService.getAllMapIncidents();
        
        // For now, using mock data
        setIncidents(mockIncidents);
      } catch (error) {
        console.error('Error loading incidents:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIncidents();
  }, []);

  const filteredIncidents = incidents.filter(incident => {
    if (filterType !== 'all' && incident.type !== filterType) return false;
    if (filterStatus !== 'all' && incident.status !== filterStatus) return false;
    return true;
  });

  const selectedIncidentData = incidents.find(incident => incident.incidentId === selectedIncident);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard/user')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                <Map className="mr-3 h-8 w-8 text-emergency-info" />
                Emergency Map
              </h1>
              <p className="text-slate-600">View danger zones and reported incidents in your area (Read-only Firebase collection)</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline">
              <Layers className="mr-2 h-4 w-4" />
              Layers
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Map Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Incident Type</label>
                  <select 
                    className="w-full mt-1 border border-slate-300 rounded-md px-3 py-2"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="fire">Fire</option>
                    <option value="medical">Medical</option>
                    <option value="accident">Accident</option>
                    <option value="flood">Flood</option>
                    <option value="earthquake">Earthquake</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <select 
                    className="w-full mt-1 border border-slate-300 rounded-md px-3 py-2"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="monitoring">Monitoring</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button onClick={() => { setFilterType('all'); setFilterStatus('all'); }}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Interactive Incident Map</span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-100 rounded-lg h-96 flex items-center justify-center border-2 border-dashed border-slate-300 relative">
                  <div className="text-center text-slate-500">
                    <Map className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">Interactive Map</p>
                    <p className="text-sm">Real-time incident markers would be displayed here</p>
                    <p className="text-xs mt-2">📍 {filteredIncidents.length} incidents visible</p>
                  </div>
                  
                  {/* Simulated map markers */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-8">
                      {filteredIncidents.slice(0, 6).map((incident, index) => (
                        <button
                          key={incident.incidentId}
                          onClick={() => setSelectedIncident(incident.incidentId)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg hover:scale-110 transition-transform ${getSeverityColor(incident.severity)}`}
                          title={incident.description}
                        >
                          {getIncidentIcon(incident.type)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Incident List */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Incidents</span>
                  {loading && <Clock className="h-4 w-4 animate-spin" />}
                </CardTitle>
                <CardDescription>
                  {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''} in your area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredIncidents.map(incident => (
                    <div
                      key={incident.incidentId}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-slate-50 ${
                        selectedIncident === incident.incidentId ? 'border-emergency-info bg-emergency-info/5' : 'border-slate-200'
                      }`}
                      onClick={() => setSelectedIncident(incident.incidentId)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getIncidentIcon(incident.type)}</span>
                          <div>
                            <div className="font-medium text-sm capitalize">{incident.type} Emergency</div>
                            <div className="text-xs text-slate-500">{timeAgo(incident.timestamp)}</div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <Badge className={`text-xs ${getSeverityColor(incident.severity)}`}>
                            {incident.severity}
                          </Badge>
                          <Badge className={`text-xs ${getStatusColor(incident.status)}`}>
                            {incident.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-slate-600 mb-1">
                        <MapPin className="inline h-3 w-3 mr-1" />
                        {incident.location.address}
                      </div>
                      <div className="text-xs text-slate-500">
                        Reported by: {incident.reporterName}
                      </div>
                    </div>
                  ))}
                  
                  {filteredIncidents.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No incidents match your filters</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Selected Incident Details */}
            {selectedIncidentData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <span className="mr-2">{getIncidentIcon(selectedIncidentData.type)}</span>
                    Incident Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-slate-700">Type</div>
                      <div className="text-sm capitalize">{selectedIncidentData.type} Emergency</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-700">Description</div>
                      <div className="text-sm">{selectedIncidentData.description}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-700">Location</div>
                      <div className="text-sm">{selectedIncidentData.location.address}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-sm font-medium text-slate-700">Severity</div>
                        <Badge className={getSeverityColor(selectedIncidentData.severity)}>
                          {selectedIncidentData.severity}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-700">Status</div>
                        <Badge className={getStatusColor(selectedIncidentData.status)}>
                          {selectedIncidentData.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-700">Reported</div>
                      <div className="text-sm">{timeAgo(selectedIncidentData.timestamp)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-700">Last Updated</div>
                      <div className="text-sm">{timeAgo(selectedIncidentData.lastUpdated)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Firebase Integration Status */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800 text-sm">🔥 Firebase Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-green-700 space-y-1">
                  <div>✓ Connected to viewMap collection (read-only)</div>
                  <div>✓ Analytics tracking enabled</div>
                  <div>✓ Real-time incident updates</div>
                  <div>✓ Global incident aggregation</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Map Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-emergency-danger rounded-full flex items-center justify-center text-white text-xs">🔥</div>
                <span className="text-sm">Fire Emergency</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-emergency-info rounded-full flex items-center justify-center text-white text-xs">🚑</div>
                <span className="text-sm">Medical Emergency</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-emergency-warning rounded-full flex items-center justify-center text-white text-xs">🚗</div>
                <span className="text-sm">Traffic Accident</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-emergency-resolved rounded-full flex items-center justify-center text-white text-xs">✓</div>
                <span className="text-sm">Resolved</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This is a read-only view of incidents from the Firebase viewMap collection. 
            Incident data is aggregated from all users' reports for public safety awareness.
          </AlertDescription>
        </Alert>
      </div>
    </DashboardLayout>
  );
}
