import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  ArrowLeft,
  MapPin,
  Clock,
  Heart
} from 'lucide-react';

const medicalIncidents = [
  { id: 1, title: 'Heart Attack - Oak Street', status: 'responding', urgency: 'critical', location: 'Oak Street 425', time: '5 mins ago', unit: 'Ambulance 7' },
  { id: 2, title: 'Car Accident Injuries', status: 'at-scene', urgency: 'high', location: 'Highway 101', time: '12 mins ago', unit: 'Ambulance 3' },
];

export default function MedicalIncidents() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard/ambulance')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Ambulance Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <Truck className="mr-3 h-8 w-8 text-emergency-resolved" />
              Medical Incidents
            </h1>
            <p className="text-slate-600">Respond to medical emergencies and transport patients</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Medical Emergencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {medicalIncidents.map((incident) => (
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
                      <Badge className={`${incident.urgency === 'critical' ? 'bg-emergency-danger' : 'bg-emergency-warning'} text-white`}>
                        {incident.urgency}
                      </Badge>
                      <Badge className="bg-emergency-info text-white">
                        {incident.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <div>
                      <span className="font-medium">Unit: </span>
                      {incident.unit}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {incident.time}
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Button size="sm" variant="success">
                      <Heart className="mr-2 h-4 w-4" />
                      Update Status
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
