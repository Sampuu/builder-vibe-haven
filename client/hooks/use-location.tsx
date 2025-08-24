import { useState, useEffect } from 'react';

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  region?: string;
  countryCode?: string;
  accuracy?: number;
}

export interface UseLocationResult {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => void;
}

export const useLocation = (): UseLocationResult => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get GPS coordinates
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes cache
          }
        );
      });

      const { latitude, longitude, accuracy } = position.coords;

      // Reverse geocoding to get city/country info
      try {
        // Using OpenStreetMap Nominatim API (free alternative to Google Maps)
        const geocodeResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'Emergency-Response-App/1.0'
            }
          }
        );

        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();
          const address = geocodeData.address || {};

          setLocation({
            latitude,
            longitude,
            accuracy,
            city: address.city || address.town || address.village || address.municipality,
            region: address.state || address.region || address.province,
            country: address.country,
            countryCode: address.country_code?.toUpperCase()
          });
        } else {
          // Fallback: just set coordinates without city/country info
          setLocation({
            latitude,
            longitude,
            accuracy
          });
        }
      } catch (geocodeError) {
        console.warn('Reverse geocoding failed:', geocodeError);
        // Fallback: just set coordinates
        setLocation({
          latitude,
          longitude,
          accuracy
        });
      }

    } catch (geoError: any) {
      let errorMessage = 'Unable to retrieve your location.';
      
      if (geoError.code === 1) {
        errorMessage = 'Location access denied. Please enable location services.';
      } else if (geoError.code === 2) {
        errorMessage = 'Location information is unavailable.';
      } else if (geoError.code === 3) {
        errorMessage = 'Location request timed out.';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-request location on first mount (optional)
  useEffect(() => {
    // Uncomment this if you want automatic location detection
    // requestLocation();
  }, []);

  return {
    location,
    isLoading,
    error,
    requestLocation
  };
};
