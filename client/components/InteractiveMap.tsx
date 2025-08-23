import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, AlertTriangle, Phone } from "lucide-react";
import { mapsService, Coordinates } from "@/lib/maps";

export interface MapMarker {
  id: string;
  position: Coordinates;
  title: string;
  description?: string;
  type: "fire" | "medical" | "police" | "disaster" | "hospital" | "station";
  severity?: "low" | "medium" | "high" | "critical";
  status?: "active" | "responding" | "resolved";
  contactNumber?: string;
}

interface InteractiveMapProps {
  markers: MapMarker[];
  center?: Coordinates;
  userLocation?: Coordinates;
  onMarkerClick?: (marker: MapMarker) => void;
  onLocationSelect?: (coordinates: Coordinates) => void;
  showNavigation?: boolean;
  height?: string;
  className?: string;
}

export default function InteractiveMap({
  markers,
  center,
  userLocation,
  onMarkerClick,
  onLocationSelect,
  showNavigation = false,
  height = "400px",
  className = "",
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(
    userLocation || null,
  );

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    if (!currentLocation) {
      const location = await mapsService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
      }
    }
  };

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
    onMarkerClick?.(marker);
  };

  const getNavigationUrl = (destination: Coordinates) => {
    if (currentLocation) {
      return mapsService.getDirectionsUrl(currentLocation, destination);
    }
    return `https://www.google.com/maps/search/${destination.lat},${destination.lng}`;
  };

  const getMarkerColor = (marker: MapMarker) => {
    switch (marker.type) {
      case "fire":
        return "bg-orange-500";
      case "medical":
        return "bg-red-500";
      case "police":
        return "bg-blue-500";
      case "disaster":
        return "bg-yellow-500";
      case "hospital":
        return "bg-green-500";
      case "station":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-600 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-black";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map Container */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Interactive Map</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={getCurrentLocation}
                    className="flex items-center gap-1"
                  >
                    <MapPin className="h-3 w-3" />
                    My Location
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* OpenStreetMap Embed - Free alternative */}
              <div
                ref={mapRef}
                style={{ height }}
                className="w-full bg-slate-100 rounded-lg relative overflow-hidden border"
              >
                {/* Map markers overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <h3 className="font-medium mb-2">Interactive Map</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      {markers.length} incident{markers.length !== 1 ? "s" : ""}{" "}
                      on map
                    </p>
                    {currentLocation && (
                      <Badge variant="outline" className="mb-2">
                        Location: {currentLocation.lat.toFixed(4)},{" "}
                        {currentLocation.lng.toFixed(4)}
                      </Badge>
                    )}
                    <p className="text-xs text-slate-500">
                      Production version would show full interactive map with
                      Google Maps or OpenStreetMap
                    </p>
                  </div>
                </div>

                {/* Marker indicators */}
                <div className="absolute top-4 left-4 space-y-2">
                  {markers.slice(0, 5).map((marker, index) => (
                    <button
                      key={marker.id}
                      onClick={() => handleMarkerClick(marker)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-white text-xs font-medium ${getMarkerColor(marker)} hover:opacity-80 transition-opacity`}
                      style={{
                        transform: `translate(${index * 20}px, ${index * 30}px)`,
                      }}
                    >
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      {marker.title.slice(0, 15)}...
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Incident Details & List */}
        <div className="space-y-4">
          {/* Selected Marker Details */}
          {selectedMarker && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Selected Incident
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium">{selectedMarker.title}</h4>
                  {selectedMarker.description && (
                    <p className="text-sm text-slate-600 mt-1">
                      {selectedMarker.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      getMarkerColor(selectedMarker).replace("bg-", "bg-") +
                      " text-white"
                    }
                  >
                    {selectedMarker.type.toUpperCase()}
                  </Badge>
                  {selectedMarker.severity && (
                    <Badge
                      className={getSeverityColor(selectedMarker.severity)}
                    >
                      {selectedMarker.severity.toUpperCase()}
                    </Badge>
                  )}
                </div>

                {selectedMarker.contactNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3 w-3" />
                    <span>{selectedMarker.contactNumber}</span>
                  </div>
                )}

                {showNavigation && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      window.open(
                        getNavigationUrl(selectedMarker.position),
                        "_blank",
                      )
                    }
                  >
                    <Navigation className="h-3 w-3 mr-1" />
                    Get Directions
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Incidents List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                All Incidents ({markers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {markers.map((marker) => (
                  <button
                    key={marker.id}
                    onClick={() => handleMarkerClick(marker)}
                    className={`w-full text-left p-2 rounded-lg border transition-colors hover:bg-slate-50 ${
                      selectedMarker?.id === marker.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">
                        {marker.title}
                      </span>
                      <div className="flex items-center gap-1">
                        {marker.severity && (
                          <div
                            className={`w-2 h-2 rounded-full ${
                              marker.severity === "critical"
                                ? "bg-red-500"
                                : marker.severity === "high"
                                  ? "bg-orange-500"
                                  : marker.severity === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                            }`}
                          />
                        )}
                        <div
                          className={`w-2 h-2 rounded-full ${getMarkerColor(marker).replace("bg-", "bg-")}`}
                        />
                      </div>
                    </div>
                    {marker.description && (
                      <p className="text-xs text-slate-600 truncate">
                        {marker.description}
                      </p>
                    )}
                  </button>
                ))}

                {markers.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No incidents to display</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
