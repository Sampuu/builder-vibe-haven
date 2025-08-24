import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import EmergencyMap from '@/components/EmergencyMap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Map,
  ArrowLeft,
  MapPin,
  AlertTriangle,
  Filter,
  Phone,
  Navigation,
  Clock,
  Crosshair
} from 'lucide-react';
import {
  currentIncidents,
  emergencyEntities,
  EmergencyEntity,
  Incident,
  getSeverityColor,
  getIncidentTypeColor,
  getEntityTypeColor
} from '@/lib/emergency-data';
import {
  getCurrentLocation,
  LocationCoordinates,
  calculateDistance,
  formatDistance
} from '@/lib/geolocation';

export default function ViewMap() {
  const navigate = useNavigate();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<EmergencyEntity | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'incidents' | 'entities'>('all');
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);

  // Get user location for distance calculations
  useEffect(() => {
    getCurrentLocation().then((result) => {
      if (result.success && result.coordinates) {
        setUserLocation(result.coordinates);
      }
    });
  }, []);

  // Filter incidents and entities based on user location
  const nearbyIncidents = userLocation
    ? currentIncidents
        .map(incident => ({
          ...incident,
          distance: calculateDistance(userLocation, incident.coordinates)
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10) // Show closest 10
    : currentIncidents;

  const nearbyEntities = userLocation
    ? emergencyEntities
        .map(entity => ({
          ...entity,
          distance: calculateDistance(userLocation, entity.coordinates)
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 8) // Show closest 8
    : emergencyEntities;

  const handleEntityClick = (entity: EmergencyEntity) => {
    setSelectedEntity(entity);
    setSelectedIncident(null);
  };

  const handleIncidentClick = (incident: Incident) => {
    setSelectedIncident(incident);
    setSelectedEntity(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
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
              <p className="text-slate-600">Interactive map with real-time incidents and emergency services</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <Card>
            <CardContent className="p-4">
              <div className="flex space-x-4">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('all')}
                >
                  Show All
                </Button>
                <Button
                  variant={filterType === 'incidents' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('incidents')}
                >
                  Incidents Only
                </Button>
                <Button
                  variant={filterType === 'entities' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('entities')}
                >
                  Services Only
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Interactive Map Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                <EmergencyMap
                  height="500px"
                  showUserLocation={true}
                  showEntities={filterType === 'all' || filterType === 'entities'}
                  showIncidents={filterType === 'all' || filterType === 'incidents'}
                  onEntityClick={handleEntityClick}
                  onIncidentClick={handleIncidentClick}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with Details */}
          <div className="space-y-6">
            {/* Selected Item Details */}
            {(selectedIncident || selectedEntity) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedIncident ? 'Incident Details' : 'Service Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedIncident && (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold">{selectedIncident.title}</h3>
                        <Badge
                          style={{ backgroundColor: getSeverityColor(selectedIncident.severity) }}
                          className="text-white text-xs"
                        >
                          {selectedIncident.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{selectedIncident.description}</p>
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {selectedIncident.address}
                        </p>
                        <p className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(selectedIncident.reportedAt).toLocaleString()}
                        </p>
                        {userLocation && (
                          <p className="text-blue-600 font-medium">
                            {formatDistance(calculateDistance(userLocation, selectedIncident.coordinates))} away
                          </p>
                        )}
                      </div>
                      {selectedIncident.respondingUnits && (
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Responding:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedIncident.respondingUnits.map((unit, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {unit}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedEntity && (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold">{selectedEntity.name}</h3>
                        <Badge
                          className={`text-xs ${
                            selectedEntity.status === 'active' ? 'bg-green-500' :
                            selectedEntity.status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                          } text-white`}
                        >
                          {selectedEntity.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {selectedEntity.address}
                        </p>
                        <p className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {selectedEntity.phone}
                        </p>
                        {userLocation && (
                          <p className="text-blue-600 font-medium">
                            {formatDistance(calculateDistance(userLocation, selectedEntity.coordinates))} away
                          </p>
                        )}
                      </div>
                      {selectedEntity.specialties && (
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Specialties:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedEntity.specialties.map((specialty, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`tel:${selectedEntity.phone}`, '_self')}
                          className="flex-1"
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                        {userLocation && (
                          <Button
                            size="sm"
                            variant="info"
                            onClick={() => {
                              const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${selectedEntity.coordinates.lat},${selectedEntity.coordinates.lng}`;
                              window.open(url, '_blank');
                            }}
                            className="flex-1"
                          >
                            <Navigation className="h-3 w-3 mr-1" />
                            Navigate
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Nearby Incidents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nearby Incidents</CardTitle>
                <CardDescription>Active emergencies in your area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {nearbyIncidents.map((incident) => (
                    <div
                      key={incident.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedIncident?.id === incident.id ? 'border-emergency-info bg-emergency-info/5' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                      onClick={() => handleIncidentClick(incident)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg" role="img" aria-label={incident.type}>
                            {incident.type === 'fire' ? '🔥' :
                             incident.type === 'medical' ? '🚨' :
                             incident.type === 'accident' ? '🚗' :
                             incident.type === 'crime' ? '⚠️' : '❗'}
                          </span>
                          <span className="text-sm font-medium capitalize">{incident.type}</span>
                        </div>
                        <Badge
                          style={{ backgroundColor: getSeverityColor(incident.severity) }}
                          className="text-xs text-white"
                        >
                          {incident.severity}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-600 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {incident.address}
                      </div>
                      {userLocation && 'distance' in incident && (
                        <div className="text-xs text-slate-500 mt-1">
                          {formatDistance(incident.distance)} away
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Nearby Services */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emergency Services</CardTitle>
                <CardDescription>Hospitals, police, fire stations nearby</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {nearbyEntities.map((entity) => (
                    <div
                      key={entity.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedEntity?.id === entity.id ? 'border-emergency-info bg-emergency-info/5' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                      onClick={() => handleEntityClick(entity)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg" role="img" aria-label={entity.type}>
                            {entity.type === 'hospital' ? '🏥' :
                             entity.type === 'police' ? '🚔' :
                             entity.type === 'fire' ? '🚒' :
                             entity.type === 'ambulance' ? '🚑' : '📍'}
                          </span>
                          <span className="text-sm font-medium">{entity.name}</span>
                        </div>
                        <Badge
                          className={`text-xs ${
                            entity.status === 'active' ? 'bg-green-500' :
                            entity.status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                          } text-white`}
                        >
                          {entity.status}
                        </Badge>
                      </div>
                      {userLocation && 'distance' in entity && (
                        <div className="text-xs text-slate-500">
                          {formatDistance(entity.distance)} away
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate('/user/report')}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Report Emergency
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate('/user/help')}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Request Help
                </Button>
                {userLocation && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => getCurrentLocation()}
                  >
                    <Crosshair className="mr-2 h-4 w-4" />
                    Update Location
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
