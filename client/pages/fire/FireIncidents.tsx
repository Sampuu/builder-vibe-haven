import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Flame, 
  ArrowLeft,
  MapPin,
  Clock,
  Truck
} from 'lucide-react';

const fireIncidents = [
  { id: 1, title: 'Building Fire - Downtown Plaza', status: 'active', severity: 'critical', location: 'Downtown Plaza', time: '15 mins ago', units: 'Engine 3, Ladder 1' },
  { id: 2, title: 'Wildfire - Oak Hills', status: 'controlled', severity: 'high', location: 'Oak Hills Area', time: '2 hours ago', units: 'Engine 7, Engine 9' },
];

export default function FireIncidents() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard/fire')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Fire Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <Flame className="mr-3 h-8 w-8 text-emergency-warning" />
              Fire Incidents
            </h1>
            <p className="text-slate-600">Monitor and respond to fire emergencies</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Fire Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fireIncidents.map((incident) => (
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
                      <Badge className={`${incident.severity === 'critical' ? 'bg-emergency-danger' : 'bg-emergency-warning'} text-white`}>
                        {incident.severity}
                      </Badge>
                      <Badge className={`${incident.status === 'active' ? 'bg-emergency-danger' : 'bg-emergency-resolved'} text-white`}>
                        {incident.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <div>
                      <span className="font-medium">Units: </span>
                      {incident.units}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {incident.time}
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Button size="sm" variant="warning">
                      <Truck className="mr-2 h-4 w-4" />
                      Dispatch
                    </Button>
                    <Button size="sm" variant="outline">
                      <MapPin className="mr-2 h-4 w-4" />
                      Navigate
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
