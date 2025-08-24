import { useMemo } from 'react';
import { LocationData } from './use-location';

export interface EmergencyNumbers {
  police: string;
  fire: string;
  medical: string;
  general: string; // Universal emergency number
  poison?: string;
  countryName: string;
  region?: string;
}

// Comprehensive emergency numbers database by country
const EMERGENCY_NUMBERS_DB: Record<string, EmergencyNumbers> = {
  // North America
  'US': {
    police: '911',
    fire: '911',
    medical: '911',
    general: '911',
    poison: '1-800-222-1222',
    countryName: 'United States'
  },
  'CA': {
    police: '911',
    fire: '911', 
    medical: '911',
    general: '911',
    poison: '1-844-764-7669',
    countryName: 'Canada'
  },
  'MX': {
    police: '911',
    fire: '911',
    medical: '911', 
    general: '911',
    countryName: 'Mexico'
  },

  // Europe
  'GB': {
    police: '999',
    fire: '999',
    medical: '999',
    general: '999',
    countryName: 'United Kingdom'
  },
  'DE': {
    police: '110',
    fire: '112',
    medical: '112',
    general: '112',
    countryName: 'Germany'
  },
  'FR': {
    police: '17',
    fire: '18',
    medical: '15',
    general: '112',
    countryName: 'France'
  },
  'IT': {
    police: '113',
    fire: '115',
    medical: '118',
    general: '112',
    countryName: 'Italy'
  },
  'ES': {
    police: '091',
    fire: '080',
    medical: '061',
    general: '112',
    countryName: 'Spain'
  },
  'NL': {
    police: '112',
    fire: '112',
    medical: '112',
    general: '112',
    countryName: 'Netherlands'
  },

  // Asia Pacific  
  'AU': {
    police: '000',
    fire: '000',
    medical: '000',
    general: '000',
    poison: '13-11-26',
    countryName: 'Australia'
  },
  'NZ': {
    police: '111',
    fire: '111',
    medical: '111',
    general: '111',
    countryName: 'New Zealand'
  },
  'JP': {
    police: '110',
    fire: '119',
    medical: '119',
    general: '110',
    countryName: 'Japan'
  },
  'KR': {
    police: '112',
    fire: '119',
    medical: '119',
    general: '112',
    countryName: 'South Korea'
  },
  'CN': {
    police: '110',
    fire: '119',
    medical: '120',
    general: '110',
    countryName: 'China'
  },
  'IN': {
    police: '100',
    fire: '101',
    medical: '102',
    general: '112',
    countryName: 'India'
  },
  'SG': {
    police: '999',
    fire: '995',
    medical: '995',
    general: '999',
    countryName: 'Singapore'
  },

  // Middle East & Africa
  'AE': {
    police: '999',
    fire: '997',
    medical: '998',
    general: '999',
    countryName: 'United Arab Emirates'
  },
  'SA': {
    police: '999',
    fire: '998',
    medical: '997',
    general: '999',
    countryName: 'Saudi Arabia'
  },
  'ZA': {
    police: '10111',
    fire: '10177',
    medical: '10177',
    general: '112',
    countryName: 'South Africa'
  },

  // South America
  'BR': {
    police: '190',
    fire: '193',
    medical: '192',
    general: '190',
    countryName: 'Brazil'
  },
  'AR': {
    police: '101',
    fire: '100',
    medical: '107',
    general: '911',
    countryName: 'Argentina'
  },
  'CL': {
    police: '133',
    fire: '132',
    medical: '131',
    general: '133',
    countryName: 'Chile'
  },

  // Default fallback for unknown countries
  'DEFAULT': {
    police: '911',
    fire: '911',
    medical: '911',
    general: '911',
    countryName: 'Unknown Location'
  }
};

// Special mappings for cities that might have different numbers
const CITY_SPECIFIC_NUMBERS: Record<string, Partial<EmergencyNumbers>> = {
  // Add city-specific overrides here if needed
  'new york': {
    poison: '1-800-222-1222',
    region: 'New York'
  },
  'london': {
    region: 'London'
  },
  'tokyo': {
    region: 'Tokyo'
  }
};

export const useEmergencyNumbers = (location: LocationData | null): EmergencyNumbers => {
  return useMemo(() => {
    if (!location?.countryCode) {
      return EMERGENCY_NUMBERS_DB.DEFAULT;
    }

    // Get base numbers for country
    let numbers = EMERGENCY_NUMBERS_DB[location.countryCode] || EMERGENCY_NUMBERS_DB.DEFAULT;

    // Apply city-specific overrides if available
    if (location.city) {
      const cityKey = location.city.toLowerCase();
      const cityOverrides = CITY_SPECIFIC_NUMBERS[cityKey];
      if (cityOverrides) {
        numbers = { ...numbers, ...cityOverrides };
      }
    }

    // Add region info if available
    if (location.region && !numbers.region) {
      numbers = { ...numbers, region: location.region };
    }

    return numbers;
  }, [location]);
};

// Utility function to format phone number for dialing
export const formatPhoneForDialing = (phoneNumber: string): string => {
  // Remove all non-digits except + at the beginning
  return phoneNumber.replace(/[^\d+]/g, '').replace(/^\+?/, '');
};

// Utility function to get display-friendly phone number
export const formatPhoneForDisplay = (phoneNumber: string): string => {
  return phoneNumber;
};
