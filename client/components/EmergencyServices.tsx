import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import SimpleTabs from "./SimpleTabs";
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Hospital,
  ShieldCheck,
  Flame,
  TruckIcon,
  Crosshair,
} from "lucide-react";
import {
  emergencyEntities,
  currentIncidents,
  EmergencyEntity,
  Incident,
  getSeverityColor,
  getIncidentTypeColor,
  getEntityTypeColor,
} from "@/lib/emergency-data";
import {
  getCurrentLocation,
  LocationCoordinates,
  calculateDistance,
  formatDistance,
  getDirectionsUrl,
} from "@/lib/geolocation";

interface EmergencyServicesProps {
  height?: string;
  onEntityClick?: (entity: EmergencyEntity) => void;
  onIncidentClick?: (incident: Incident) => void;
  className?: string;
}

export default function EmergencyServices({
  height = "500px",
  onEntityClick,
  onIncidentClick,
  className = "",
}: EmergencyServicesProps) {
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(
    null,
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "hospital" | "police" | "fire" | "ambulance"
  >("all");
  const [selectedEntity, setSelectedEntity] = useState<EmergencyEntity | null>(
    null,
  );
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null,
  );
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Get user location
  useEffect(() => {
    getCurrentLocation().then((result) => {
      if (result.success && result.coordinates) {
        setUserLocation(result.coordinates);
        setLocationError(null);
      } else {
        setLocationError(result.error?.message || "Location unavailable");
      }
    });
  }, []);

  // Filter and sort entities
  const filteredEntities = emergencyEntities
    .filter((entity) => {
      const matchesFilter = filterType === "all" || entity.type === filterType;
      const matchesSearch =
        !searchTerm ||
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.address.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .map((entity) => ({
      ...entity,
      distance: userLocation
        ? calculateDistance(userLocation, entity.coordinates)
        : 0,
    }))
    .sort((a, b) => (userLocation ? a.distance - b.distance : 0));

  // Sort incidents by distance and severity
  const sortedIncidents = currentIncidents
    .map((incident) => ({
      ...incident,
      distance: userLocation
        ? calculateDistance(userLocation, incident.coordinates)
        : 0,
    }))
    .sort((a, b) => {
      // Sort by severity first, then distance
      const severityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff =
        severityWeight[b.severity] - severityWeight[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return userLocation ? a.distance - b.distance : 0;
    });

  const handleEntityClick = (entity: EmergencyEntity) => {
    setSelectedEntity(entity);
    setSelectedIncident(null);
    onEntityClick?.(entity);
  };

  const handleIncidentClick = (incident: Incident) => {
    setSelectedIncident(incident);
    setSelectedEntity(null);
    onIncidentClick?.(incident);
  };

  const updateLocation = async () => {
    setIsLoadingLocation(true);
    const result = await getCurrentLocation();
    if (result.success && result.coordinates) {
      setUserLocation(result.coordinates);
      setLocationError(null);
    } else {
      setLocationError(result.error?.message || "Failed to get location");
    }
    setIsLoadingLocation(false);
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "hospital":
        return <Hospital className="h-4 w-4" />;
      case "police":
        return <ShieldCheck className="h-4 w-4" />;
      case "fire":
        return <Flame className="h-4 w-4" />;
      case "ambulance":
        return <TruckIcon className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className={`${className}`} style={{ height }}>
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-emergency-info" />
                <span>Emergency Services</span>
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Find nearby emergency services and active incidents
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={updateLocation}
              disabled={isLoadingLocation}
            >
              <Crosshair className="h-4 w-4 mr-2" />
              {isLoadingLocation ? "Updating..." : "Update Location"}
            </Button>
          </div>

          {/* Location Status */}
          {userLocation && (
            <div className="text-xs text-green-600 flex items-center mt-2">
              <MapPin className="h-3 w-3 mr-1" />
              Location: {userLocation.lat.toFixed(4)},{" "}
              {userLocation.lng.toFixed(4)}
            </div>
          )}
          {locationError && (
            <div className="text-xs text-amber-600 flex items-center mt-2">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {locationError}
            </div>
          )}

          {/* Search and Filter */}
          <div className="flex space-x-2 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search emergency services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm"
            >
              <option value="all">All Services</option>
              <option value="hospital">Hospitals</option>
              <option value="police">Police</option>
              <option value="fire">Fire Stations</option>
              <option value="ambulance">Ambulance</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <SimpleTabs
            defaultTab="services"
            className="h-full"
            items={[
              {
                id: "services",
                label: `Emergency Services (${filteredEntities.length})`,
                content: (
                  <div className="h-full overflow-y-auto space-y-3">
                    {filteredEntities.map((entity) => (
                      <Card
                        key={entity.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedEntity?.id === entity.id
                            ? "ring-2 ring-emergency-info bg-emergency-info/5"
                            : ""
                        }`}
                        onClick={() => handleEntityClick(entity)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div
                                className="p-2 rounded-full text-white"
                                style={{
                                  backgroundColor: getEntityTypeColor(
                                    entity.type,
                                  ),
                                }}
                              >
                                {getEntityIcon(entity.type)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-slate-900">
                                  {entity.name}
                                </h3>
                                <p className="text-sm text-slate-600 capitalize">
                                  {entity.type}
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={`${
                                entity.status === "active"
                                  ? "bg-green-500"
                                  : entity.status === "busy"
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              } text-white`}
                            >
                              {entity.status}
                            </Badge>
                          </div>

                          <div className="space-y-2 text-sm text-slate-600 mb-3">
                            <p className="flex items-center">
                              <MapPin className="h-3 w-3 mr-2" />
                              {entity.address}
                            </p>
                            <p className="flex items-center">
                              <Phone className="h-3 w-3 mr-2" />
                              {entity.phone}
                            </p>
                            {userLocation && (
                              <p className="text-blue-600 font-medium">
                                {formatDistance(entity.distance)} away
                              </p>
                            )}
                          </div>

                          {entity.specialties && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-slate-700 mb-1">
                                Specialties:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {entity.specialties.map((specialty, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {specialty}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`tel:${entity.phone}`, "_self");
                              }}
                              className="flex-1"
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              Call
                            </Button>
                            {userLocation && (
                              <Button
                                size="sm"
                                variant="info"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const url = getDirectionsUrl(
                                    userLocation,
                                    entity.coordinates,
                                  );
                                  window.open(url, "_blank");
                                }}
                                className="flex-1"
                              >
                                <Navigation className="h-3 w-3 mr-1" />
                                Directions
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ),
              },
              {
                id: "incidents",
                label: `Active Incidents (${sortedIncidents.length})`,
                content: (
                  <div className="h-full overflow-y-auto space-y-3">
                    {sortedIncidents.map((incident) => (
                      <Card
                        key={incident.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedIncident?.id === incident.id
                            ? "ring-2 ring-emergency-danger bg-emergency-danger/5"
                            : ""
                        }`}
                        onClick={() => handleIncidentClick(incident)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div
                                className="p-2 rounded-full text-white"
                                style={{
                                  backgroundColor: getIncidentTypeColor(
                                    incident.type,
                                  ),
                                }}
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-slate-900">
                                  {incident.title}
                                </h3>
                                <p className="text-sm text-slate-600 capitalize">
                                  {incident.type}
                                </p>
                              </div>
                            </div>
                            <Badge
                              style={{
                                backgroundColor: getSeverityColor(
                                  incident.severity,
                                ),
                              }}
                              className="text-white"
                            >
                              {incident.severity}
                            </Badge>
                          </div>

                          <p className="text-sm text-slate-600 mb-3">
                            {incident.description}
                          </p>

                          <div className="space-y-2 text-sm text-slate-600 mb-3">
                            <p className="flex items-center">
                              <MapPin className="h-3 w-3 mr-2" />
                              {incident.address}
                            </p>
                            <p className="flex items-center">
                              <Clock className="h-3 w-3 mr-2" />
                              Reported{" "}
                              {new Date(incident.reportedAt).toLocaleString()}
                            </p>
                            {userLocation && (
                              <p className="text-blue-600 font-medium">
                                {formatDistance(incident.distance)} away
                              </p>
                            )}
                          </div>

                          {incident.respondingUnits &&
                            incident.respondingUnits.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs font-medium text-slate-700 mb-1">
                                  Responding Units:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {incident.respondingUnits.map(
                                    (unit, index) => (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {unit}
                                      </Badge>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                          {incident.estimatedResolution && (
                            <p className="text-xs text-green-600 mb-3">
                              Estimated resolution:{" "}
                              {incident.estimatedResolution}
                            </p>
                          )}

                          {userLocation && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                const url = getDirectionsUrl(
                                  userLocation,
                                  incident.coordinates,
                                );
                                window.open(url, "_blank");
                              }}
                              className="w-full"
                            >
                              <Navigation className="h-3 w-3 mr-1" />
                              Get Directions
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
