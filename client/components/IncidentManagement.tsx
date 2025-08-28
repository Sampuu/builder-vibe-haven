import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  Phone,
  MapPin,
  User,
  Calendar,
  FileText,
  AlertCircle,
  Shield,
  Flame,
  Heart,
  Truck,
  Package,
  Building2
} from 'lucide-react';
import { useIncidents, Incident, getIncidentStatusColor, getUrgencyColor } from '@/hooks/use-incidents';
import { useAuth, UserRole } from '@/hooks/use-auth';

const categoryIcons = {
  fire: Flame,
  medical: Heart,
  accident: AlertTriangle,
  natural: AlertCircle,
  police: Shield,
  supplies: Package,
  transport: Truck,
  other: FileText,
};

const statusLabels = {
  submitted: 'New',
  acknowledged: 'Acknowledged',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  cancelled: 'Cancelled',
};

interface IncidentCardProps {
  incident: Incident;
  onAcknowledge: (incidentId: string) => void;
  onUpdateStatus: (incidentId: string, status: Incident['status']) => void;
  canManage: boolean;
}

function IncidentCard({ incident, onAcknowledge, onUpdateStatus, canManage }: IncidentCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const CategoryIcon = categoryIcons[incident.category];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <CategoryIcon className="h-5 w-5 text-emergency-info" />
            </div>
            <div>
              <CardTitle className="text-lg">{incident.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={getUrgencyColor(incident.urgency)}>
                  {incident.urgency.toUpperCase()}
                </Badge>
                <Badge variant="secondary" className={getIncidentStatusColor(incident.status)}>
                  {statusLabels[incident.status]}
                </Badge>
              </CardDescription>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(incident.timestamps.submitted, { addSuffix: true })}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{incident.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{incident.reporter.name}</span>
          </div>
        </div>

        <p className="text-sm text-slate-600 line-clamp-2">{incident.description}</p>

        <div className="flex justify-between items-center pt-2">
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CategoryIcon className="h-5 w-5" />
                  {incident.title}
                </DialogTitle>
                <DialogDescription>
                  {incident.type === 'help_request' ? 'Help Request' : 'Emergency Report'} • ID: {incident.id}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Status & Priority</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant="secondary" className={getIncidentStatusColor(incident.status)}>
                          {statusLabels[incident.status]}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Urgency:</span>
                        <Badge variant="outline" className={getUrgencyColor(incident.urgency)}>
                          {incident.urgency.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Category:</span>
                        <span className="text-sm font-medium">{incident.category}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Contact Info</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{incident.reporter.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{incident.reporter.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{incident.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded">{incident.description}</p>
                </div>

                {incident.metadata?.specialRequests && (
                  <div>
                    <h4 className="font-medium mb-2">Special Requests</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded">{incident.metadata.specialRequests}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Submitted:</span>
                      <span>{incident.timestamps.submitted.toLocaleString()}</span>
                    </div>
                    {incident.timestamps.acknowledged && (
                      <div className="flex justify-between">
                        <span>Acknowledged:</span>
                        <span>{incident.timestamps.acknowledged.toLocaleString()}</span>
                      </div>
                    )}
                    {incident.timestamps.assigned && (
                      <div className="flex justify-between">
                        <span>Assigned:</span>
                        <span>{incident.timestamps.assigned.toLocaleString()}</span>
                      </div>
                    )}
                    {incident.timestamps.inProgress && (
                      <div className="flex justify-between">
                        <span>In Progress:</span>
                        <span>{incident.timestamps.inProgress.toLocaleString()}</span>
                      </div>
                    )}
                    {incident.timestamps.resolved && (
                      <div className="flex justify-between">
                        <span>Resolved:</span>
                        <span>{incident.timestamps.resolved.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {canManage && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Actions</h4>
                    <div className="flex gap-2">
                      {incident.status === 'submitted' && (
                        <Button size="sm" onClick={() => {
                          onAcknowledge(incident.id);
                          setIsDetailsOpen(false);
                        }}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Acknowledge
                        </Button>
                      )}
                      
                      {incident.status !== 'resolved' && incident.status !== 'cancelled' && (
                        <Select onValueChange={(value) => {
                          onUpdateStatus(incident.id, value as Incident['status']);
                          setIsDetailsOpen(false);
                        }}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Update Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="cancelled">Cancel</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex gap-2">
            {canManage && incident.status === 'submitted' && (
              <Button size="sm" variant="outline" onClick={() => onAcknowledge(incident.id)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Acknowledge
              </Button>
            )}
            
            {canManage && incident.status !== 'resolved' && incident.status !== 'cancelled' && (
              <Select onValueChange={(value) => onUpdateStatus(incident.id, value as Incident['status'])}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Update" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface IncidentManagementProps {
  department: UserRole;
  title?: string;
  description?: string;
}

export default function IncidentManagement({ 
  department, 
  title = "Incident Management", 
  description = "Manage and respond to incidents assigned to your department" 
}: IncidentManagementProps) {
  const { user } = useAuth();
  const { getIncidentsForDepartment, acknowledgeIncident, updateIncidentStatus } = useIncidents();
  
  const incidents = getIncidentsForDepartment(department);
  const canManage = user?.role === department || user?.role === 'admin';

  const newIncidents = incidents.filter(i => i.status === 'submitted');
  const activeIncidents = incidents.filter(i => ['acknowledged', 'assigned', 'in_progress'].includes(i.status));
  const resolvedIncidents = incidents.filter(i => ['resolved', 'cancelled'].includes(i.status));

  const handleAcknowledge = (incidentId: string) => {
    acknowledgeIncident(incidentId, department);
  };

  const handleUpdateStatus = (incidentId: string, status: Incident['status']) => {
    updateIncidentStatus(incidentId, status);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <div className="flex gap-2">
            {newIncidents.length > 0 && (
              <Badge variant="destructive">{newIncidents.length} New</Badge>
            )}
            {activeIncidents.length > 0 && (
              <Badge variant="secondary">{activeIncidents.length} Active</Badge>
            )}
          </div>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="new" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="new" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              New ({newIncidents.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Active ({activeIncidents.length})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Resolved ({resolvedIncidents.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="new" className="space-y-4">
            <ScrollArea className="h-96">
              {newIncidents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No new incidents</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {newIncidents.map(incident => (
                    <IncidentCard
                      key={incident.id}
                      incident={incident}
                      onAcknowledge={handleAcknowledge}
                      onUpdateStatus={handleUpdateStatus}
                      canManage={canManage}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="active" className="space-y-4">
            <ScrollArea className="h-96">
              {activeIncidents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No active incidents</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeIncidents.map(incident => (
                    <IncidentCard
                      key={incident.id}
                      incident={incident}
                      onAcknowledge={handleAcknowledge}
                      onUpdateStatus={handleUpdateStatus}
                      canManage={canManage}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="resolved" className="space-y-4">
            <ScrollArea className="h-96">
              {resolvedIncidents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No resolved incidents</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {resolvedIncidents.map(incident => (
                    <IncidentCard
                      key={incident.id}
                      incident={incident}
                      onAcknowledge={handleAcknowledge}
                      onUpdateStatus={handleUpdateStatus}
                      canManage={canManage}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
