import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Phone, 
  Navigation,
  X,
  User,
  FileText
} from 'lucide-react';
import { IncidentMarker } from './EmergencyMap';
import { INCIDENT_TYPES } from '@/lib/openroute';

interface IncidentDetailsProps {
  incident: IncidentMarker | null;
  onClose: () => void;
  onNavigate?: (incident: IncidentMarker) => void;
  onContact?: (incident: IncidentMarker) => void;
  showActions?: boolean;
}

export default function IncidentDetails({ 
  incident, 
  onClose, 
  onNavigate, 
  onContact,
  showActions = true 
}: IncidentDetailsProps) {
  if (!incident) return null;

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-emergency-danger text-white';
      case 'medium': return 'bg-emergency-warning text-white';
      case 'low': return 'bg-emergency-info text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getTimeAgo = (timestamp?: Date) => {
    if (!timestamp) return 'Unknown time';
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const incidentType = INCIDENT_TYPES[incident.type];

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" style={{ color: incidentType.color }} />
            <CardTitle className="text-lg">{incident.title}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <Badge className={`text-xs ${getSeverityColor(incident.severity)}`}>
            {incident.severity?.toUpperCase() || 'UNKNOWN'}
          </Badge>
          <div className="flex items-center text-sm text-slate-500">
            <Clock className="h-3 w-3 mr-1" />
            {getTimeAgo(incident.timestamp)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Incident Type */}
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium">Type:</span>
          <span className="text-sm">{incidentType.label}</span>
        </div>

        {/* Location */}
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium">Location:</span>
          <span className="text-sm">
            {incident.position.lat.toFixed(6)}, {incident.position.lon.toFixed(6)}
          </span>
        </div>

        {/* Description */}
        {incident.description && (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium">Details:</span>
            </div>
            <p className="text-sm text-slate-700 pl-6">{incident.description}</p>
          </div>
        )}

        {/* Incident ID */}
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium">ID:</span>
          <span className="text-sm font-mono">{incident.id}</span>
        </div>

        {/* Priority Status */}
        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="text-sm font-medium text-slate-700 mb-1">Priority Status</div>
          <div className="text-xs text-slate-600">
            {incident.severity === 'critical' && '🚨 Immediate response required'}
            {incident.severity === 'high' && '⚠️ High priority - respond within 5 minutes'}
            {incident.severity === 'medium' && '⏱️ Medium priority - respond within 15 minutes'}
            {incident.severity === 'low' && '📋 Low priority - respond when available'}
            {!incident.severity && '❓ Priority assessment pending'}
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex space-x-2 pt-2">
            {onNavigate && (
              <Button 
                size="sm" 
                variant="default" 
                className="flex-1"
                onClick={() => onNavigate(incident)}
              >
                <Navigation className="mr-2 h-4 w-4" />
                Navigate
              </Button>
            )}
            {onContact && (
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => onContact(incident)}
              >
                <Phone className="mr-2 h-4 w-4" />
                Contact
              </Button>
            )}
          </div>
        )}

        {/* Emergency Actions */}
        {incident.severity === 'critical' && (
          <div className="p-3 bg-emergency-danger/10 border border-emergency-danger/20 rounded-lg">
            <div className="text-sm font-medium text-emergency-danger mb-1">
              🚨 Critical Emergency
            </div>
            <div className="text-xs text-emergency-danger/80">
              All available units should respond immediately. 
              Establish command post and coordinate with other agencies.
            </div>
            <Button size="sm" variant="danger" className="w-full mt-2">
              <Phone className="mr-2 h-4 w-4" />
              Alert Command Center
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
