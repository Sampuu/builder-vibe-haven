export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export interface LocationResult {
  success: boolean;
  coordinates?: LocationCoordinates;
  error?: GeolocationError;
}

// Default location (San Francisco) if geolocation fails
export const DEFAULT_LOCATION: LocationCoordinates = {
  lat: 37.7749,
  lng: -122.4194,
};

/**
 * Get the user's current location using the browser's geolocation API
 */
export const getCurrentLocation = (): Promise<LocationResult> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        success: false,
        error: {
          code: 0,
          message: "Geolocation is not supported by this browser",
        },
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
      },
      (error) => {
        resolve({
          success: false,
          error: {
            code: error.code,
            message: getGeolocationErrorMessage(error.code),
          },
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000, // Cache for 10 minutes
      },
    );
  });
};

/**
 * Watch the user's location for real-time tracking
 */
export const watchLocation = (
  onSuccess: (coordinates: LocationCoordinates) => void,
  onError: (error: GeolocationError) => void,
): number | null => {
  if (!navigator.geolocation) {
    onError({
      code: 0,
      message: "Geolocation is not supported by this browser",
    });
    return null;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    },
    (error) => {
      onError({
        code: error.code,
        message: getGeolocationErrorMessage(error.code),
      });
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // Cache for 1 minute for real-time tracking
    },
  );
};

/**
 * Clear location watching
 */
export const clearLocationWatch = (watchId: number): void => {
  navigator.geolocation.clearWatch(watchId);
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (
  point1: LocationCoordinates,
  point2: LocationCoordinates,
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Format distance for display
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  } else {
    return `${Math.round(distanceKm)}km`;
  }
};

/**
 * Generate directions URL for navigation
 */
export const getDirectionsUrl = (
  from: LocationCoordinates,
  to: LocationCoordinates,
  mode: "driving" | "walking" | "transit" = "driving",
): string => {
  const modeParam =
    mode === "driving" ? "driving" : mode === "walking" ? "walking" : "transit";
  return `https://www.google.com/maps/dir/${from.lat},${from.lng}/${to.lat},${to.lng}/@${to.lat},${to.lng},15z/data=!3m1!4b1!4m2!4m1!3e${mode === "driving" ? "0" : mode === "walking" ? "2" : "3"}`;
};

/**
 * Convert degrees to radians
 */
const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

/**
 * Get human-readable error message for geolocation errors
 */
const getGeolocationErrorMessage = (code: number): string => {
  switch (code) {
    case 1:
      return "Location access denied by user";
    case 2:
      return "Location information unavailable";
    case 3:
      return "Location request timed out";
    default:
      return "An unknown error occurred while retrieving location";
  }
};
