import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, MapPin, Package, Users, Truck, Clock, Navigation, CheckCircle, AlertTriangle, Heart, Utensils, Shield } from 'lucide-react';

interface SupplyDeployment {
  id: string;
  type: 'medical' | 'food' | 'staff' | 'equipment';
  location: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  items: string[];
  personnel?: number;
  estimatedTime: string;
  timestamp: string;
}

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const [activeDeployments, setActiveDeployments] = useState<SupplyDeployment[]>([
    {
      id: 'dep-1',
      type: 'medical',
      location: 'Downtown Plaza Fire',
      status: 'in-progress',
      priority: 'critical',
      items: ['Medical kits (10)', 'Burn treatment supplies', 'Oxygen tanks (5)'],
      personnel: 4,
      estimatedTime: '45 min',
      timestamp: '2024-01-20T14:30:00Z'
    },
    {
      id: 'dep-2',
      type: 'food',
      location: 'Community Center Storm Shelter',
      status: 'pending',
      priority: 'high',
      items: ['Emergency food kits (100)', 'Water bottles (200)', 'Baby formula (20)'],
      personnel: 2,
      estimatedTime: '1.5 hours',
      timestamp: '2024-01-20T12:00:00Z'
    }
  ]);
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [newDeployment, setNewDeployment] = useState({
    type: 'medical' as const,
    location: '',
    priority: 'medium' as const,
    items: '',
    personnel: 2
  });

  const handleDeploySupplies = async () => {
    const deployment: SupplyDeployment = {
      id: `dep-${Date.now()}`,
      type: newDeployment.type,
      location: newDeployment.location,
      status: 'pending',
      priority: newDeployment.priority,
      items: newDeployment.items.split(',').map(item => item.trim()),
      personnel: newDeployment.personnel,
      estimatedTime: '1 hour',
      timestamp: new Date().toISOString()
    };
    
    setActiveDeployments([deployment, ...activeDeployments]);
    setShowDeployDialog(false);
    setNewDeployment({
      type: 'medical',
      location: '',
      priority: 'medium',
      items: '',
      personnel: 2
    });

    // Simulate deployment progress
    setTimeout(() => {
      setActiveDeployments(prev => 
        prev.map(dep => 
          dep.id === deployment.id 
            ? { ...dep, status: 'in-progress' as const }
            : dep
        )
      );
    }, 2000);
  };

  const handleNavigateToDeployment = (coordinates?: { lat: number; lng: number }) => {
    // In real app, would use actual coordinates
    const defaultCoords = '40.7128,-74.0060';
    window.open(`https://www.google.com/maps/search/?api=1&query=${defaultCoords}`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emergency-resolved';
      case 'in-progress': return 'bg-emergency-info';
      case 'pending': return 'bg-emergency-warning';
      default: return 'bg-slate-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-emergency-danger';
      case 'high': return 'text-emergency-warning';
      case 'medium': return 'text-emergency-info';
      case 'low': return 'text-slate-600';
      default: return 'text-slate-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medical': return Heart;
      case 'food': return Utensils;
      case 'staff': return Users;
      case 'equipment': return Package;
      default: return Package;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center">
            <Building2 className="mr-3 h-8 w-8 text-emergency-info" />
            Hospital Emergency Management Center
          </h2>
          <p className="text-slate-600">Deploy medical supplies, food, staff, and coordinate emergency response in Nepal and globally.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="bg-emergency-info/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Package className="h-8 w-8 text-emergency-info" />
              </div>
              <CardTitle>Supply Requests</CardTitle>
              <CardDescription>Medical equipment/supplies requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="info" onClick={() => navigate('/hospital/supplies')}>View Requests</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="bg-emergency-resolved/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Truck className="h-8 w-8 text-emergency-resolved" />
              </div>
              <CardTitle>Deploy Supplies</CardTitle>
              <CardDescription>Send emergency supplies & staff</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="success">Deploy Now</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Deploy Emergency Supplies</DialogTitle>
                    <DialogDescription>
                      Deploy medical supplies, food, or staff to emergency locations
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Deployment Type</Label>
                      <Select value={newDeployment.type} onValueChange={(value: any) => setNewDeployment({...newDeployment, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medical">Medical Supplies</SelectItem>
                          <SelectItem value="food">Food & Water</SelectItem>
                          <SelectItem value="staff">Medical Staff</SelectItem>
                          <SelectItem value="equipment">Medical Equipment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={newDeployment.location}
                        onChange={(e) => setNewDeployment({...newDeployment, location: e.target.value})}
                        placeholder="Emergency location address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select value={newDeployment.priority} onValueChange={(value: any) => setNewDeployment({...newDeployment, priority: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Items (comma-separated)</Label>
                      <Input
                        value={newDeployment.items}
                        onChange={(e) => setNewDeployment({...newDeployment, items: e.target.value})}
                        placeholder="Medical kits, Water bottles, Food kits"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Personnel Count</Label>
                      <Input
                        type="number"
                        value={newDeployment.personnel}
                        onChange={(e) => setNewDeployment({...newDeployment, personnel: parseInt(e.target.value) || 0})}
                        placeholder="Number of staff"
                      />
                    </div>
                    <Button onClick={handleDeploySupplies} className="w-full">
                      Deploy Supplies & Staff
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="bg-emergency-warning/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Navigation className="h-8 w-8 text-emergency-warning" />
              </div>
              <CardTitle>Navigation</CardTitle>
              <CardDescription>Navigate to emergency locations</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="warning" onClick={() => handleNavigateToDeployment()}>Open Maps</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="bg-emergency-danger/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Users className="h-8 w-8 text-emergency-danger" />
              </div>
              <CardTitle>Staff Coordination</CardTitle>
              <CardDescription>Coordinate medical staff deployment</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="danger" onClick={() => navigate('/hospital/supplies')}>Manage Staff</Button>
            </CardContent>
          </Card>
        </div>

        {/* Active Deployments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Truck className="mr-2 h-5 w-5 text-emergency-info" />
                Active Deployments ({activeDeployments.length})
              </span>
              <Badge variant="outline">{activeDeployments.filter(d => d.status === 'in-progress').length} in progress</Badge>
            </CardTitle>
            <CardDescription>
              Track current supply and staff deployments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeDeployments.map((deployment) => {
                const TypeIcon = getTypeIcon(deployment.type);
                return (
                  <div key={deployment.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="bg-slate-100 p-2 rounded-lg">
                          <TypeIcon className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 capitalize">{deployment.type} Deployment</h4>
                          <p className="text-sm text-slate-600">{deployment.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getStatusColor(deployment.status)} text-white`}>
                          {deployment.status}
                        </Badge>
                        <Badge className={`${getPriorityColor(deployment.priority)} border-current`} variant="outline">
                          {deployment.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="font-medium text-slate-900 mb-2">Items:</h5>
                        <ul className="text-sm text-slate-600 space-y-1">
                          {deployment.items.map((item, index) => (
                            <li key={index}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        {deployment.personnel && (
                          <div className="flex items-center space-x-2 text-sm text-slate-600">
                            <Users className="h-4 w-4" />
                            <span>{deployment.personnel} personnel assigned</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Clock className="h-4 w-4" />
                          <span>ETA: {deployment.estimatedTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleNavigateToDeployment()}>
                        <Navigation className="mr-2 h-4 w-4" />
                        Navigate
                      </Button>
                      {deployment.status === 'pending' && (
                        <Button size="sm" variant="info">
                          Start Deployment
                        </Button>
                      )}
                      {deployment.status === 'in-progress' && (
                        <Button size="sm" variant="success">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Supply Inventory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5 text-emergency-info" />
              Emergency Supply Inventory
            </CardTitle>
            <CardDescription>Current available emergency supplies for Nepal and regional deployment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <Heart className="h-8 w-8 text-emergency-danger mx-auto mb-2" />
                <p className="font-semibold">Medical Kits</p>
                <p className="text-2xl font-bold text-emergency-danger">47</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <Utensils className="h-8 w-8 text-emergency-warning mx-auto mb-2" />
                <p className="font-semibold">Food Kits</p>
                <p className="text-2xl font-bold text-emergency-warning">156</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <Shield className="h-8 w-8 text-emergency-info mx-auto mb-2" />
                <p className="font-semibold">PPE Sets</p>
                <p className="text-2xl font-bold text-emergency-info">89</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <Users className="h-8 w-8 text-emergency-resolved mx-auto mb-2" />
                <p className="font-semibold">Available Staff</p>
                <p className="text-2xl font-bold text-emergency-resolved">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
