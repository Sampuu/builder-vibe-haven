import React from 'react';
import { MapPin, Navigation, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface MapIncident {
  id: string;
  type: 'fire' | 'medical' | 'accident' | 'police';
  title: string;
  location: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  time: string;
  assignedTo?: string;
}

interface StaticMapPlaceholderProps {
  incidents: MapIncident[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onIncidentClick?: (incident: MapIncident) => void;
  showUserLocation?: boolean;
}

const StaticMapPlaceholder: React.FC<StaticMapPlaceholderProps> = ({
  incidents,
  height = '400px',
  onIncidentClick
}) => {
  const getIncidentColor = (type: string) => {
    switch (type) {
      case 'fire': return 'bg-red-500';
      case 'medical': return 'bg-blue-500';
      case 'accident': return 'bg-yellow-500';
      case 'police': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-600 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-blue-500 bg-blue-50';
      case 'low': return 'border-gray-400 bg-gray-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  const handleNavigate = (incident: MapIncident) => {
    if (incident.latitude && incident.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(incident.location)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div 
      style={{ height, width: '100%' }} 
      className="bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 relative overflow-hidden"
    >
      {/* Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-blue-50 to-green-50">
        {/* Grid pattern to simulate map */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="border border-slate-300"></div>
            ))}
          </div>
        </div>
        
        {/* Simulated roads */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-0 right-0 h-1 bg-gray-400 opacity-40"></div>
          <div className="absolute top-2/3 left-0 right-0 h-1 bg-gray-400 opacity-40"></div>
          <div className="absolute left-1/4 top-0 bottom-0 w-1 bg-gray-400 opacity-40"></div>
          <div className="absolute left-3/4 top-0 bottom-0 w-1 bg-gray-400 opacity-40"></div>
        </div>

        {/* User location indicator */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
          <div className="absolute -top-1 -left-1 w-6 h-6 bg-blue-600 rounded-full opacity-30 animate-ping"></div>
        </div>

        {/* Incident markers */}
        {incidents.map((incident, index) => {
          // Distribute incidents across the map area
          const x = 20 + (index * 60) % 260; // Spread horizontally
          const y = 40 + ((index * 37) % 3) * 80; // Distribute vertically
          
          return (
            <div
              key={incident.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: `${x}px`, top: `${y}px` }}
              onClick={() => onIncidentClick?.(incident)}
            >
              {/* Marker */}
              <div className={`w-6 h-6 ${getIncidentColor(incident.type)} rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform`}>
                <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                  {incident.type[0].toUpperCase()}
                </div>
              </div>
              
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-white p-2 rounded shadow-lg border text-xs whitespace-nowrap max-w-48">
                  <div className="font-semibold">{incident.title}</div>
                  <div className="text-gray-600">{incident.location}</div>
                  <div className="flex items-center space-x-1 mt-1">
                    <Badge className={`text-xs ${getPriorityColor(incident.priority)}`}>
                      {incident.priority}
                    </Badge>
                    <span className="text-gray-500">{incident.time}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <Button size="sm" variant="outline" className="bg-white shadow-md">
          <span className="text-lg">+</span>
        </Button>
        <Button size="sm" variant="outline" className="bg-white shadow-md">
          <span className="text-lg">−</span>
        </Button>
      </div>

      {/* Map attribution */}
      <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
        📍 Interactive Map View (Simplified)
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded shadow-lg text-xs">
        <div className="font-semibold mb-2">Incident Types</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Fire</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Medical</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Accident</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Police</span>
          </div>
        </div>
      </div>

      {/* Incident list overlay for mobile/small screens */}
      {incidents.length > 0 && (
        <div className="absolute top-4 left-4 bg-white rounded shadow-lg p-3 max-w-64 max-h-32 overflow-y-auto hidden sm:block">
          <div className="font-semibold text-sm mb-2">Nearby Incidents ({incidents.length})</div>
          <div className="space-y-2">
            {incidents.slice(0, 3).map((incident) => (
              <div 
                key={incident.id}
                className="text-xs p-2 border rounded cursor-pointer hover:bg-gray-50"
                onClick={() => onIncidentClick?.(incident)}
              >
                <div className="font-medium">{incident.title}</div>
                <div className="text-gray-600 flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {incident.location}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <Badge className={`text-xs ${getPriorityColor(incident.priority)}`}>
                    {incident.priority}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-6 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigate(incident);
                    }}
                  >
                    <Navigation className="w-3 h-3 mr-1" />
                    Nav
                  </Button>
                </div>
              </div>
            ))}
            {incidents.length > 3 && (
              <div className="text-xs text-gray-500 text-center py-1">
                +{incidents.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaticMapPlaceholder;
