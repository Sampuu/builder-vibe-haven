import { AccidentZone, RouteRequest, RouteResponse } from "@shared/api";

// OpenRouteService configuration
const ORS_API_KEY = process.env.OPENROUTESERVICE_API_KEY || 'demo'; // Get free API key from openrouteservice.org
const ORS_BASE_URL = 'https://api.openrouteservice.org/v2';

interface ORSRouteResponse {
  features: Array<{
    geometry: {
      coordinates: Array<[number, number]>;
    };
    properties: {
      summary: {
        distance: number;
        duration: number;
      };
      segments: Array<{
        steps: Array<{
          instruction: string;
          distance: number;
          duration: number;
        }>;
      }>;
    };
  }>;
}

export class RoutingService {
  static async calculateRoute(
    request: RouteRequest, 
    accidentZones: AccidentZone[]
  ): Promise<RouteResponse> {
    try {
      // Prepare avoid areas if requested
      const avoidAreas = request.avoidZones ? 
        accidentZones
          .filter(zone => zone.isActive)
          .map(zone => this.createAvoidPolygon(zone)) : [];

      // Build request body for OpenRouteService
      const orsRequest = {
        coordinates: [
          [request.start.lng, request.start.lat],
          [request.end.lng, request.end.lat]
        ],
        radiuses: [5000, 5000], // 5km radius tolerance for start/end points
        format: 'geojson',
        instructions: true,
        preference: request.priority === 'emergency' ? 'fastest' : 'recommended',
        ...(avoidAreas.length > 0 && { 
          options: { 
            avoid_polygons: {
              type: 'FeatureCollection',
              features: avoidAreas
            }
          }
        })
      };

      // Determine profile based on entity type
      const profile = this.getRoutingProfile(request.entityType);

      // Make request to OpenRouteService
      const response = await fetch(`${ORS_BASE_URL}/directions/${profile}/geojson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': ORS_API_KEY,
          'Accept': 'application/json'
        },
        body: JSON.stringify(orsRequest)
      });

      if (!response.ok) {
        // Fallback to mock route if ORS fails
        console.warn('OpenRouteService request failed, using fallback route');
        return this.createFallbackRoute(request, accidentZones);
      }

      const orsData: ORSRouteResponse = await response.json();
      
      if (!orsData.features || orsData.features.length === 0) {
        throw new Error('No route found');
      }

      const route = orsData.features[0];
      
      // Convert ORS response to our format
      const routeResponse: RouteResponse = {
        route: {
          coordinates: route.geometry.coordinates,
          distance: route.properties.summary.distance,
          duration: route.properties.summary.duration,
          instructions: this.extractInstructions(route.properties.segments)
        },
        avoidedZones: request.avoidZones ? 
          accidentZones.filter(zone => zone.isActive) : []
      };

      return routeResponse;

    } catch (error) {
      console.error('Error calculating route with OpenRouteService:', error);
      // Fallback to mock route
      return this.createFallbackRoute(request, accidentZones);
    }
  }

  private static getRoutingProfile(entityType?: string): string {
    switch (entityType) {
      case 'ambulance':
      case 'fire':
      case 'police':
        return 'driving-hgv'; // Heavy goods vehicle profile for emergency vehicles
      default:
        return 'driving-car'; // Default car profile
    }
  }

  private static createAvoidPolygon(zone: AccidentZone) {
    // Create a polygon around the accident zone
    const radiusInDegrees = zone.radius / 111320; // Rough conversion from meters to degrees
    const centerLat = zone.latitude;
    const centerLng = zone.longitude;

    // Create an octagon around the zone
    const points = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const lat = centerLat + (radiusInDegrees * Math.cos(angle));
      const lng = centerLng + (radiusInDegrees * Math.sin(angle) / Math.cos(centerLat * Math.PI / 180));
      points.push([lng, lat]);
    }
    // Close the polygon
    points.push(points[0]);

    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [points]
      },
      properties: {
        zoneId: zone.id,
        zoneName: zone.name
      }
    };
  }

  private static extractInstructions(segments: any[]): Array<{ instruction: string; distance: number; time: number }> {
    const instructions: Array<{ instruction: string; distance: number; time: number }> = [];
    
    for (const segment of segments) {
      for (const step of segment.steps) {
        instructions.push({
          instruction: step.instruction,
          distance: step.distance,
          time: step.duration
        });
      }
    }

    return instructions;
  }

  private static createFallbackRoute(
    request: RouteRequest, 
    accidentZones: AccidentZone[]
  ): RouteResponse {
    // Simple fallback route - straight line between points
    const distance = this.calculateDistance(request.start, request.end);
    const estimatedSpeed = 50; // 50 km/h average
    const duration = (distance / 1000) / estimatedSpeed * 3600; // Convert to seconds

    return {
      route: {
        coordinates: [
          [request.start.lng, request.start.lat],
          [request.end.lng, request.end.lat]
        ],
        distance,
        duration,
        instructions: [
          {
            instruction: `Head towards destination (${distance.toFixed(0)}m)`,
            distance,
            time: duration
          },
          {
            instruction: 'Arrive at destination',
            distance: 0,
            time: 0
          }
        ]
      },
      avoidedZones: request.avoidZones ? 
        accidentZones.filter(zone => zone.isActive) : []
    };
  }

  private static calculateDistance(
    start: { lat: number; lng: number }, 
    end: { lat: number; lng: number }
  ): number {
    // Haversine formula for calculating distance between two points
    const R = 6371e3; // Earth's radius in meters
    const φ1 = start.lat * Math.PI / 180;
    const φ2 = end.lat * Math.PI / 180;
    const Δφ = (end.lat - start.lat) * Math.PI / 180;
    const Δλ = (end.lng - start.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  // Geocoding service
  static async geocodeLocation(query: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const response = await fetch(
        `${ORS_BASE_URL}/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(query)}&size=1`
      );

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const coords = data.features[0].geometry.coordinates;
        return { lng: coords[0], lat: coords[1] };
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      
      // Fallback to predefined locations
      const fallbackLocations: Record<string, { lat: number; lng: number }> = {
        'mumbai': { lat: 19.0760, lng: 72.8777 },
        'delhi': { lat: 28.6139, lng: 77.2090 },
        'bangalore': { lat: 12.9716, lng: 77.5946 },
        'chennai': { lat: 13.0827, lng: 80.2707 },
        'kolkata': { lat: 22.5726, lng: 88.3639 },
        'hyderabad': { lat: 17.3850, lng: 78.4867 },
        'pune': { lat: 18.5204, lng: 73.8567 },
        'ahmedabad': { lat: 23.0225, lng: 72.5714 },
      };

      const key = query.toLowerCase().trim();
      return fallbackLocations[key] || null;
    }
  }
}
