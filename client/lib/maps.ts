import { Loader } from '@googlemaps/js-api-loader';

// Note: In production, you should get a Google Maps API key
// For now, we'll use OpenStreetMap with Leaflet as a free alternative
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with actual key

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationResult {
  address: string;
  coordinates: Coordinates;
  placeId?: string;
}

class MapsService {
  private loader: Loader | null = null;
  private isLoaded = false;

  constructor() {
    if (GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY') {
      this.loader = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['places', 'geometry']
      });
    }
  }

  async initializeGoogleMaps(): Promise<boolean> {
    if (!this.loader) {
      console.warn('Google Maps API key not configured, using fallback geocoding');
      return false;
    }

    try {
      await this.loader.load();
      this.isLoaded = true;
      return true;
    } catch (error) {
      console.error('Failed to load Google Maps:', error);
      return false;
    }
  }

  // Geocoding: Convert address to coordinates
  async geocodeAddress(address: string): Promise<LocationResult | null> {
    if (this.isLoaded && window.google) {
      return this.googleGeocode(address);
    } else {
      return this.fallbackGeocode(address);
    }
  }

  // Reverse Geocoding: Convert coordinates to address
  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    if (this.isLoaded && window.google) {
      return this.googleReverseGeocode(lat, lng);
    } else {
      return this.fallbackReverseGeocode(lat, lng);
    }
  }

  // Get user's current location
  async getCurrentLocation(): Promise<Coordinates | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  // Calculate distance between two points
  calculateDistance(point1: Coordinates, point2: Coordinates): number {
    if (this.isLoaded && window.google) {
      const service = new google.maps.DistanceMatrixService();
      // This would need to be implemented as a promise-based wrapper
    }
    
    // Fallback: Haversine formula
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Generate directions URL
  getDirectionsUrl(from: Coordinates, to: Coordinates): string {
    return `https://www.google.com/maps/dir/${from.lat},${from.lng}/${to.lat},${to.lng}`;
  }

  private async googleGeocode(address: string): Promise<LocationResult | null> {
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results) {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });

      const location = result[0];
      return {
        address: location.formatted_address,
        coordinates: {
          lat: location.geometry.location.lat(),
          lng: location.geometry.location.lng()
        },
        placeId: location.place_id
      };
    } catch (error) {
      console.error('Google geocoding failed:', error);
      return null;
    }
  }

  private async googleReverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results) {
            resolve(results);
          } else {
            reject(new Error(`Reverse geocoding failed: ${status}`));
          }
        });
      });

      return result[0]?.formatted_address || null;
    } catch (error) {
      console.error('Google reverse geocoding failed:', error);
      return null;
    }
  }

  // Fallback geocoding using free service (Nominatim)
  private async fallbackGeocode(address: string): Promise<LocationResult | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        return {
          address: result.display_name,
          coordinates: {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon)
          }
        };
      }
      return null;
    } catch (error) {
      console.error('Fallback geocoding failed:', error);
      return null;
    }
  }

  // Fallback reverse geocoding using free service
  private async fallbackReverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      return data?.display_name || null;
    } catch (error) {
      console.error('Fallback reverse geocoding failed:', error);
      return null;
    }
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const mapsService = new MapsService();

// Initialize on app load
mapsService.initializeGoogleMaps().catch(console.error);
