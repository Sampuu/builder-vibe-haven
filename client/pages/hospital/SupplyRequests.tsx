import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  ArrowLeft,
  MapPin,
  Clock,
  Package,
  Truck
} from 'lucide-react';

const supplyRequests = [
  { id: 1, title: 'Emergency Blood Supply', status: 'pending', urgency: 'critical', location: 'City Hospital', time: '10 mins ago', items: 'O-negative blood, 5 units' },
  { id: 2, title: 'Medical Equipment Request', status: 'assigned', urgency: 'high', location: 'Emergency Clinic', time: '30 mins ago', items: 'Ventilator, oxygen tanks' },
];

export default function SupplyRequests() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard/hospital')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Hospital Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <Building2 className="mr-3 h-8 w-8 text-emergency-info" />
              Supply Requests
            </h1>
            <p className="text-slate-600">Manage medical equipment and supply requests</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Supply Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {supplyRequests.map((request) => (
                <div key={request.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{request.title}</h3>
                      <p className="text-sm text-slate-600 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {request.location}
                      </p>
                      <p className="text-sm text-slate-700 mt-1">
                        <span className="font-medium">Items: </span>
                        {request.items}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${request.urgency === 'critical' ? 'bg-emergency-danger' : 'bg-emergency-warning'} text-white`}>
                        {request.urgency}
                      </Badge>
                      <Badge className={`${request.status === 'pending' ? 'bg-emergency-warning' : 'bg-emergency-info'} text-white`}>
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {request.time}
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Button size="sm" variant="info">
                      <Truck className="mr-2 h-4 w-4" />
                      Assign Vehicle
                    </Button>
                    <Button size="sm" variant="outline">
                      <Package className="mr-2 h-4 w-4" />
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
