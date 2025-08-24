import { LocationCoordinates } from './geolocation';

export type EmergencyEntityType = 'hospital' | 'police' | 'fire' | 'ambulance';
export type IncidentType = 'fire' | 'medical' | 'accident' | 'crime' | 'natural-disaster';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface EmergencyEntity {
  id: string;
  name: string;
  type: EmergencyEntityType;
  coordinates: LocationCoordinates;
  address: string;
  phone: string;
  status: 'active' | 'busy' | 'unavailable';
  capacity?: number;
  specialties?: string[];
}

export interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  description: string;
  coordinates: LocationCoordinates;
  address: string;
  severity: SeverityLevel;
  status: 'active' | 'responding' | 'resolved';
  reportedAt: string;
  respondingUnits?: string[];
  estimatedResolution?: string;
}

// Mock emergency entities data (San Francisco area)
export const emergencyEntities: EmergencyEntity[] = [
  // Hospitals
  {
    id: 'hospital-1',
    name: 'San Francisco General Hospital',
    type: 'hospital',
    coordinates: { lat: 37.7565, lng: -122.4056 },
    address: '1001 Potrero Ave, San Francisco, CA 94110',
    phone: '(415) 206-8000',
    status: 'active',
    capacity: 150,
    specialties: ['Emergency', 'Trauma', 'Surgery']
  },
  {
    id: 'hospital-2',
    name: 'UCSF Medical Center',
    type: 'hospital',
    coordinates: { lat: 37.7629, lng: -122.4583 },
    address: '505 Parnassus Ave, San Francisco, CA 94143',
    phone: '(415) 476-1000',
    status: 'active',
    capacity: 200,
    specialties: ['Emergency', 'Cardiac', 'Neurology']
  },
  {
    id: 'hospital-3',
    name: 'California Pacific Medical Center',
    type: 'hospital',
    coordinates: { lat: 37.7886, lng: -122.4324 },
    address: '2333 Buchanan St, San Francisco, CA 94115',
    phone: '(415) 600-6000',
    status: 'busy',
    capacity: 120,
    specialties: ['Emergency', 'Pediatrics', 'Oncology']
  },
  
  // Police Stations
  {
    id: 'police-1',
    name: 'Central Police Station',
    type: 'police',
    coordinates: { lat: 37.7983, lng: -122.4059 },
    address: '766 Vallejo St, San Francisco, CA 94133',
    phone: '(415) 315-2400',
    status: 'active'
  },
  {
    id: 'police-2',
    name: 'Mission Police Station',
    type: 'police',
    coordinates: { lat: 37.7626, lng: -122.4267 },
    address: '630 Valencia St, San Francisco, CA 94110',
    phone: '(415) 558-5400',
    status: 'active'
  },
  {
    id: 'police-3',
    name: 'Richmond Police Station',
    type: 'police',
    coordinates: { lat: 37.7802, lng: -122.4647 },
    address: '461 6th Ave, San Francisco, CA 94118',
    phone: '(415) 666-8000',
    status: 'active'
  },
  
  // Fire Stations
  {
    id: 'fire-1',
    name: 'Fire Station 1',
    type: 'fire',
    coordinates: { lat: 37.7946, lng: -122.3999 },
    address: '676 Howard St, San Francisco, CA 94105',
    phone: '(415) 558-3200',
    status: 'active'
  },
  {
    id: 'fire-2',
    name: 'Fire Station 10',
    type: 'fire',
    coordinates: { lat: 37.7749, lng: -122.4330 },
    address: '3022 Washington St, San Francisco, CA 94115',
    phone: '(415) 558-3210',
    status: 'active'
  },
  {
    id: 'fire-3',
    name: 'Fire Station 16',
    type: 'fire',
    coordinates: { lat: 37.7399, lng: -122.4235 },
    address: '959 Connecticut St, San Francisco, CA 94107',
    phone: '(415) 558-3216',
    status: 'busy'
  },
  
  // Ambulance Services
  {
    id: 'ambulance-1',
    name: 'SF Ambulance Service - Central',
    type: 'ambulance',
    coordinates: { lat: 37.7853, lng: -122.4080 },
    address: '1145 Mission St, San Francisco, CA 94103',
    phone: '(415) 206-8900',
    status: 'active'
  },
  {
    id: 'ambulance-2',
    name: 'SF Ambulance Service - South',
    type: 'ambulance',
    coordinates: { lat: 37.7480, lng: -122.4189 },
    address: '2789 25th St, San Francisco, CA 94110',
    phone: '(415) 206-8901',
    status: 'active'
  }
];

// Mock incidents data
export const currentIncidents: Incident[] = [
  {
    id: 'incident-1',
    type: 'fire',
    title: 'Building Fire',
    description: 'Apartment building fire on the 3rd floor',
    coordinates: { lat: 37.7849, lng: -122.4094 },
    address: '123 Market St, San Francisco, CA',
    severity: 'high',
    status: 'responding',
    reportedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    respondingUnits: ['Fire Station 1', 'Ambulance Central'],
    estimatedResolution: '45 minutes'
  },
  {
    id: 'incident-2',
    type: 'accident',
    title: 'Vehicle Collision',
    description: 'Multi-vehicle accident blocking traffic',
    coordinates: { lat: 37.7849, lng: -122.4194 },
    address: 'Highway 101 & Mission St, San Francisco, CA',
    severity: 'medium',
    status: 'active',
    reportedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    respondingUnits: ['Central Police', 'SF Ambulance'],
    estimatedResolution: '30 minutes'
  },
  {
    id: 'incident-3',
    type: 'medical',
    title: 'Medical Emergency',
    description: 'Person collapsed, requires immediate medical attention',
    coordinates: { lat: 37.7749, lng: -122.4294 },
    address: '456 Oak St, San Francisco, CA',
    severity: 'critical',
    status: 'responding',
    reportedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    respondingUnits: ['UCSF Ambulance'],
    estimatedResolution: '20 minutes'
  },
  {
    id: 'incident-4',
    type: 'crime',
    title: 'Robbery in Progress',
    description: 'Armed robbery reported at convenience store',
    coordinates: { lat: 37.7599, lng: -122.4148 },
    address: '789 Valencia St, San Francisco, CA',
    severity: 'high',
    status: 'responding',
    reportedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    respondingUnits: ['Mission Police'],
    estimatedResolution: '25 minutes'
  }
];

// Helper functions
export const getEntityTypeColor = (type: EmergencyEntityType): string => {
  switch (type) {
    case 'hospital':
      return '#3B82F6'; // Blue
    case 'police':
      return '#EF4444'; // Red
    case 'fire':
      return '#F59E0B'; // Amber
    case 'ambulance':
      return '#10B981'; // Emerald
    default:
      return '#6B7280'; // Gray
  }
};

export const getIncidentTypeColor = (type: IncidentType): string => {
  switch (type) {
    case 'fire':
      return '#EF4444'; // Red
    case 'medical':
      return '#3B82F6'; // Blue
    case 'accident':
      return '#F59E0B'; // Amber
    case 'crime':
      return '#8B5CF6'; // Purple
    case 'natural-disaster':
      return '#10B981'; // Emerald
    default:
      return '#6B7280'; // Gray
  }
};

export const getSeverityColor = (severity: SeverityLevel): string => {
  switch (severity) {
    case 'low':
      return '#10B981'; // Emerald
    case 'medium':
      return '#F59E0B'; // Amber
    case 'high':
      return '#EF4444'; // Red
    case 'critical':
      return '#DC2626'; // Dark Red
    default:
      return '#6B7280'; // Gray
  }
};

export const getEntityIcon = (type: EmergencyEntityType): string => {
  switch (type) {
    case 'hospital':
      return '🏥';
    case 'police':
      return '🚔';
    case 'fire':
      return '🚒';
    case 'ambulance':
      return '🚑';
    default:
      return '📍';
  }
};

export const getIncidentIcon = (type: IncidentType): string => {
  switch (type) {
    case 'fire':
      return '🔥';
    case 'medical':
      return '🚨';
    case 'accident':
      return '🚗';
    case 'crime':
      return '⚠️';
    case 'natural-disaster':
      return '🌪️';
    default:
      return '❗';
  }
};
