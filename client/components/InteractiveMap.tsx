import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
const DefaultIcon = icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom icons for different incident types
const FireIcon = icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="#dc2626"/>
      <circle cx="12.5" cy="12.5" r="8" fill="white"/>
      <text x="12.5" y="17" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#dc2626">F</text>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

const MedicalIcon = icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="#2563eb"/>
      <circle cx="12.5" cy="12.5" r="8" fill="white"/>
      <text x="12.5" y="17" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#2563eb">M</text>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

const AccidentIcon = icon({
  iconUrl: 'data:image/svg+xml;base64=' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="#f59e0b"/>
      <circle cx="12.5" cy="12.5" r="8" fill="white"/>
      <text x="12.5" y="17" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#f59e0b">!</text>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

const PoliceIcon = icon({
  iconUrl: 'data:image/svg+xml;base64=' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="#059669"/>
      <circle cx="12.5" cy="12.5" r="8" fill="white"/>
      <text x="12.5" y="17" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#059669">P</text>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

export interface MapIncident {
  id: string;
  type: 'fire' | 'medical' | 'accident' | 'police';
  title: string;
  location: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  time: string;
  assignedTo?: string;
}

interface InteractiveMapProps {
  incidents: MapIncident[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onIncidentClick?: (incident: MapIncident) => void;
  showUserLocation?: boolean;
}

function UserLocationMarker() {
  const map = useMap();
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          map.flyTo([latitude, longitude], 13);
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    }
  }, [map]);

  return position ? (
    <Marker position={position} icon={DefaultIcon}>
      <Popup>Your current location</Popup>
    </Marker>
  ) : null;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  incidents,
  center = [40.7128, -74.0060], // Default to NYC
  zoom = 13,
  height = '400px',
  onIncidentClick,
  showUserLocation = true
}) => {
  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'fire': return FireIcon;
      case 'medical': return MedicalIcon;
      case 'accident': return AccidentIcon;
      case 'police': return PoliceIcon;
      default: return DefaultIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in-progress': return '#2563eb';
      case 'resolved': return '#059669';
      default: return '#6b7280';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return '🔴 Critical';
      case 'high': return '🟠 High';
      case 'medium': return '🟡 Medium';
      case 'low': return '🟢 Low';
      default: return priority;
    }
  };

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {showUserLocation && <UserLocationMarker />}
        
        {incidents.map((incident) => (
          <Marker
            key={incident.id}
            position={[incident.latitude, incident.longitude]}
            icon={getIncidentIcon(incident.type)}
            eventHandlers={{
              click: () => onIncidentClick?.(incident),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-lg mb-2">{incident.title}</h3>
                <div className="space-y-1 text-sm">
                  <div><strong>Type:</strong> {incident.type}</div>
                  <div><strong>Location:</strong> {incident.location}</div>
                  <div><strong>Priority:</strong> {getPriorityLabel(incident.priority)}</div>
                  <div>
                    <strong>Status:</strong> 
                    <span 
                      className="ml-1 px-2 py-1 rounded text-white text-xs"
                      style={{ backgroundColor: getStatusColor(incident.status) }}
                    >
                      {incident.status}
                    </span>
                  </div>
                  <div><strong>Time:</strong> {incident.time}</div>
                  {incident.assignedTo && (
                    <div><strong>Assigned to:</strong> {incident.assignedTo}</div>
                  )}
                  {incident.description && (
                    <div className="mt-2"><strong>Description:</strong> {incident.description}</div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;
