import { MapPin, Navigation, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { emergencyEntities, currentIncidents } from '@/lib/emergency-data';

interface SimpleMapFallbackProps {
  height?: string;
  onEntityClick?: (entity: any) => void;
  onIncidentClick?: (incident: any) => void;
}

export default function SimpleMapFallback({ 
  height = '400px',
  onEntityClick,
  onIncidentClick 
}: SimpleMapFallbackProps) {
  return (
    <div style={{ height }} className="bg-slate-50 rounded-lg border border-slate-200 p-4 overflow-y-auto">
      <div className="text-center mb-6">
        <MapPin className="h-12 w-12 mx-auto mb-2 text-slate-400" />
        <h3 className="font-semibold text-slate-700 mb-1">Map Not Available</h3>
        <p className="text-sm text-slate-500">
          Showing emergency information in list format
        </p>
      </div>

      <div className="space-y-4">
        {/* Emergency Services */}
        <div>
          <h4 className="font-medium text-slate-700 mb-3 flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Emergency Services Nearby
          </h4>
          <div className="grid gap-2">
            {emergencyEntities.slice(0, 6).map((entity) => (
              <Card 
                key={entity.id} 
                className="cursor-pointer hover:bg-slate-50"
                onClick={() => onEntityClick?.(entity)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">
                          {entity.type === 'hospital' ? '🏥' : 
                           entity.type === 'police' ? '🚔' : 
                           entity.type === 'fire' ? '🚒' : '🚑'}
                        </span>
                        <h5 className="font-medium text-sm">{entity.name}</h5>
                      </div>
                      <p className="text-xs text-slate-600">{entity.address}</p>
                    </div>
                    <div className="flex space-x-1">
                      <Badge 
                        className={`text-xs ${
                          entity.status === 'active' ? 'bg-green-500' :
                          entity.status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                        } text-white`}
                      >
                        {entity.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`tel:${entity.phone}`, '_self');
                      }}
                      className="flex-1 text-xs h-7"
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://www.google.com/maps/search/${encodeURIComponent(entity.address)}`, '_blank');
                      }}
                      className="flex-1 text-xs h-7"
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Active Incidents */}
        <div>
          <h4 className="font-medium text-slate-700 mb-3 flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Active Incidents
          </h4>
          <div className="grid gap-2">
            {currentIncidents.slice(0, 4).map((incident) => (
              <Card 
                key={incident.id}
                className="cursor-pointer hover:bg-slate-50"
                onClick={() => onIncidentClick?.(incident)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {incident.type === 'fire' ? '🔥' : 
                         incident.type === 'medical' ? '🚨' : 
                         incident.type === 'accident' ? '🚗' : 
                         incident.type === 'crime' ? '⚠️' : '❗'}
                      </span>
                      <h5 className="font-medium text-sm">{incident.title}</h5>
                    </div>
                    <Badge 
                      className={`text-xs ${
                        incident.severity === 'critical' ? 'bg-red-600' :
                        incident.severity === 'high' ? 'bg-red-500' :
                        incident.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      } text-white`}
                    >
                      {incident.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{incident.description}</p>
                  <p className="text-xs text-slate-500">{incident.address}</p>
                  <p className="text-xs text-slate-400">
                    Reported: {new Date(incident.reportedAt).toLocaleTimeString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
