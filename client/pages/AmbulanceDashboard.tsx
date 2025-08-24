import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, MapPin, Heart, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function AmbulanceDashboard() {
  const navigate = useNavigate();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('ready');
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentStatus(newStatus);
      setShowStatusDialog(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusColor = () => {
    switch (currentStatus) {
      case 'ready': return 'text-emergency-resolved';
      case 'dispatched': return 'text-emergency-warning';
      case 'picked_up': return 'text-emergency-info';
      case 'at_hospital': return 'text-emergency-danger';
      default: return 'text-slate-600';
    }
  };
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center">
            <Truck className="mr-3 h-8 w-8 text-emergency-resolved" />
            Ambulance Service Command
          </h2>
          <p className="text-slate-600">Respond to medical emergencies and transport patients.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="bg-emergency-resolved/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Heart className="h-8 w-8 text-emergency-resolved" />
              </div>
              <CardTitle>Medical Incidents</CardTitle>
              <CardDescription>View medical/injury incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="success" onClick={() => navigate('/ambulance/incidents')}>View Incidents</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="bg-emergency-info/10 p-4 rounded-full w-fit mx-auto mb-3">
                <MapPin className="h-8 w-8 text-emergency-info" />
              </div>
              <CardTitle>Patient Location</CardTitle>
              <CardDescription>Navigate to patient locations</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="info" onClick={() => navigate('/ambulance/incidents')}>Open Map</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="bg-emergency-warning/10 p-4 rounded-full w-fit mx-auto mb-3">
                <Truck className="h-8 w-8 text-emergency-warning" />
              </div>
              <CardTitle>Current Status</CardTitle>
              <CardDescription>
                <span className={`font-medium capitalize ${getStatusColor()}`}>
                  {currentStatus.replace('_', ' ')}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="warning" disabled={isUpdatingStatus}>
                    {isUpdatingStatus ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Status'
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Ambulance Status</DialogTitle>
                    <DialogDescription>
                      Select your current operational status
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Select onValueChange={handleStatusUpdate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ready">Ready - Available for dispatch</SelectItem>
                        <SelectItem value="dispatched">Dispatched - En route to patient</SelectItem>
                        <SelectItem value="picked_up">Picked Up - Patient in ambulance</SelectItem>
                        <SelectItem value="at_hospital">At Hospital - Delivering patient</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-12 text-center text-slate-500">
            <Truck className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">Ambulance Dashboard</p>
            <p>Current Status: <span className={`font-semibold capitalize ${getStatusColor()}`}>{currentStatus.replace('_', ' ')}</span></p>
            <p className="mt-2">Medical emergency response management and patient tracking</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
