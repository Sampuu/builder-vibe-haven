import { Coordinates } from './openroute';

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLon = toRadians(coord2.lon - coord1.lon);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(coordinates: Coordinates, precision: number = 4): string {
  return `${coordinates.lat.toFixed(precision)}, ${coordinates.lon.toFixed(precision)}`;
}

/**
 * Get emergency service contact based on incident type
 */
export function getEmergencyContact(incidentType: string): { number: string; label: string } {
  switch (incidentType) {
    case 'fire':
      return { number: '911', label: 'Fire Department' };
    case 'medical':
      return { number: '911', label: 'Emergency Medical Services' };
    case 'police':
      return { number: '911', label: 'Police Department' };
    case 'accident':
      return { number: '911', label: 'Emergency Services' };
    default:
      return { number: '911', label: 'Emergency Services' };
  }
}

/**
 * Generate emergency response time estimate based on distance and severity
 */
export function estimateResponseTime(distance: number, severity: string, unitType: string = 'general'): string {
  let baseTime = 0;
  
  // Base time based on unit type (in minutes)
  switch (unitType) {
    case 'fire':
      baseTime = 4;
      break;
    case 'police':
      baseTime = 3;
      break;
    case 'ambulance':
      baseTime = 6;
      break;
    default:
      baseTime = 5;
  }
  
  // Adjust for distance (assume 30 km/h average speed in emergency)
  const travelTime = (distance / 30) * 60; // Convert to minutes
  
  // Adjust for severity
  const severityMultiplier = severity === 'critical' ? 0.7 : severity === 'high' ? 0.8 : 1.0;
  
  const totalTime = Math.ceil((baseTime + travelTime) * severityMultiplier);
  
  return `${totalTime} min`;
}

/**
 * Get incident priority score for sorting
 */
export function getIncidentPriority(severity: string, timestamp: Date): number {
  const severityScore = {
    'critical': 1000,
    'high': 500,
    'medium': 200,
    'low': 100
  }[severity] || 50;
  
  // Newer incidents get higher priority (subtract minutes since timestamp)
  const minutesAgo = Math.floor((Date.now() - timestamp.getTime()) / 60000);
  const timeScore = Math.max(0, 500 - minutesAgo);
  
  return severityScore + timeScore;
}

/**
 * Sort incidents by priority
 */
export function sortIncidentsByPriority(incidents: Array<{ severity?: string; timestamp?: Date }>): Array<{ severity?: string; timestamp?: Date }> {
  return incidents.sort((a, b) => {
    const priorityA = getIncidentPriority(a.severity || 'low', a.timestamp || new Date());
    const priorityB = getIncidentPriority(b.severity || 'low', b.timestamp || new Date());
    return priorityB - priorityA; // Higher priority first
  });
}

/**
 * Generate map bounds that include all given coordinates
 */
export function getMapBounds(coordinates: Coordinates[]): { 
  northEast: Coordinates; 
  southWest: Coordinates 
} {
  if (coordinates.length === 0) {
    return {
      northEast: { lat: 0, lon: 0 },
      southWest: { lat: 0, lon: 0 }
    };
  }
  
  const lats = coordinates.map(coord => coord.lat);
  const lons = coordinates.map(coord => coord.lon);
  
  return {
    northEast: {
      lat: Math.max(...lats),
      lon: Math.max(...lons)
    },
    southWest: {
      lat: Math.min(...lats),
      lon: Math.min(...lons)
    }
  };
}

/**
 * Check if coordinate is within bounds
 */
export function isWithinBounds(
  coordinate: Coordinates, 
  bounds: { northEast: Coordinates; southWest: Coordinates }
): boolean {
  return (
    coordinate.lat >= bounds.southWest.lat &&
    coordinate.lat <= bounds.northEast.lat &&
    coordinate.lon >= bounds.southWest.lon &&
    coordinate.lon <= bounds.northEast.lon
  );
}
