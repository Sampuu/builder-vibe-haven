import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  width?: string;
  markers?: Array<{
    position: { lat: number; lng: number };
    title?: string;
    info?: string;
    type?: "fire" | "medical" | "police" | "hospital" | "user" | "general";
  }>;
  onMapClick?: (location: { lat: number; lng: number }) => void;
  directions?: {
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
  };
  className?: string;
}

// Default center to a central location (can be overridden)
const DEFAULT_CENTER = { lat: 40.7128, lng: -74.006 }; // New York City

const getMarkerColor = (type?: string) => {
  switch (type) {
    case "fire":
      return "#ef4444"; // red
    case "medical":
      return "#f59e0b"; // yellow
    case "police":
      return "#3b82f6"; // blue
    case "hospital":
      return "#10b981"; // green
    case "user":
      return "#8b5cf6"; // purple
    default:
      return "#6b7280"; // gray
  }
};

export default function GoogleMap({
  center = DEFAULT_CENTER,
  zoom = 10,
  height = "400px",
  width = "100%",
  markers = [],
  onMapClick,
  directions,
  className = "",
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: "AIzaSyAPGnT4qxz8YHGmXujEsN_w1nPtetdCa8s",
          version: "weekly",
          libraries: ["places", "geometry"],
        });

        const google = await loader.load();

        if (!mapRef.current) return;

        const mapInstance = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });

        // Handle map clicks
        if (onMapClick) {
          mapInstance.addListener(
            "click",
            (event: google.maps.MapMouseEvent) => {
              if (event.latLng) {
                onMapClick({
                  lat: event.latLng.lat(),
                  lng: event.latLng.lng(),
                });
              }
            },
          );
        }

        setMap(mapInstance);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading Google Maps:", err);
        setError("Failed to load Google Maps");
        setIsLoading(false);
      }
    };

    initMap();
  }, [center.lat, center.lng, zoom, onMapClick]);

  // Add markers when map is ready
  useEffect(() => {
    if (!map || !window.google) return;

    // Clear existing markers (in a real app, you'd track these)
    const currentMarkers: google.maps.Marker[] = [];

    markers.forEach((marker) => {
      const mapMarker = new window.google.maps.Marker({
        position: marker.position,
        map,
        title: marker.title,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: getMarkerColor(marker.type),
          fillOpacity: 0.8,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      if (marker.info) {
        const infoWindow = new window.google.maps.InfoWindow({
          content: marker.info,
        });

        mapMarker.addListener("click", () => {
          infoWindow.open(map, mapMarker);
        });
      }

      currentMarkers.push(mapMarker);
    });

    // Cleanup function
    return () => {
      currentMarkers.forEach((marker) => marker.setMap(null));
    };
  }, [map, markers]);

  // Add directions when map is ready
  useEffect(() => {
    if (!map || !directions || !window.google) return;

    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: "#3b82f6",
        strokeWeight: 4,
        strokeOpacity: 0.8,
      },
    });

    directionsRenderer.setMap(map);

    directionsService.route(
      {
        origin: directions.origin,
        destination: directions.destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          directionsRenderer.setDirections(result);
        } else {
          console.error("Directions request failed due to " + status);
        }
      },
    );

    // Cleanup function
    return () => {
      directionsRenderer.setMap(null);
    };
  }, [map, directions]);

  if (error) {
    return (
      <div
        style={{ height, width }}
        className={`flex items-center justify-center bg-slate-100 border rounded-lg ${className}`}
      >
        <div className="text-center text-slate-600">
          <p className="font-medium">Map Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapRef}
        style={{ height, width }}
        className="rounded-lg border border-slate-200"
      />
      {isLoading && (
        <div
          style={{ height, width }}
          className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded-lg"
        >
          <div className="text-center text-slate-600">
            <div className="animate-spin w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
