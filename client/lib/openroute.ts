// OpenRouteService API configuration
export const OPENROUTE_API_KEY = "efad1bde70af4c3f9659a8b91f235dce";

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface RouteData {
  features: Array<{
    geometry: {
      coordinates: number[][];
    };
    properties: {
      segments: Array<{
        distance: number;
        duration: number;
      }>;
    };
  }>;
}

export interface GeocodingResult {
  features: Array<{
    geometry: {
      coordinates: [number, number]; // [lon, lat]
    };
    properties: {
      label: string;
      name: string;
    };
  }>;
}

// Function to geocode address to coordinates (lat, lon)
export async function geocodeAddress(address: string): Promise<Coordinates> {
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${OPENROUTE_API_KEY}&text=${encodeURIComponent(address)}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }
    
    const data: GeocodingResult = await response.json();
    
    if (!data.features || data.features.length === 0) {
      throw new Error("Address not found");
    }
    
    const coordinates = data.features[0].geometry.coordinates;
    return {
      lat: coordinates[1], // Latitude
      lon: coordinates[0]  // Longitude
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error(`Failed to geocode address: ${address}`);
  }
}

// Function to get route between two coordinates
export async function getRoute(startCoords: Coordinates, endCoords: Coordinates): Promise<RouteData> {
  const directionsUrl = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';
  
  const body = {
    coordinates: [
      [startCoords.lon, startCoords.lat], // [lon, lat]
      [endCoords.lon, endCoords.lat]
    ]
  };

  try {
    const response = await fetch(directionsUrl, {
      method: 'POST',
      headers: {
        'Authorization': OPENROUTE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Routing failed: ${response.statusText}`);
    }

    const routeData: RouteData = await response.json();
    
    if (!routeData.features || routeData.features.length === 0) {
      throw new Error("No route found");
    }
    
    return routeData;
  } catch (error) {
    console.error('Routing error:', error);
    throw new Error('Failed to calculate route');
  }
}

// Function to reverse geocode coordinates to address
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url = `https://api.openrouteservice.org/geocode/reverse?api_key=${OPENROUTE_API_KEY}&point.lat=${lat}&point.lon=${lon}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.statusText}`);
    }
    
    const data: GeocodingResult = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    }
    
    return data.features[0].properties.label || data.features[0].properties.name || `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  }
}

// Emergency incident types and their corresponding colors
export const INCIDENT_TYPES = {
  fire: { color: '#dc2626', label: 'Fire Emergency' },
  medical: { color: '#2563eb', label: 'Medical Emergency' },
  accident: { color: '#ea580c', label: 'Traffic Accident' },
  police: { color: '#7c3aed', label: 'Police Incident' },
  safe: { color: '#16a34a', label: 'Safe Zone' },
  unit: { color: '#0891b2', label: 'Emergency Unit' }
} as const;

export type IncidentType = keyof typeof INCIDENT_TYPES;
