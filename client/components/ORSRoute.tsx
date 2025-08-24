import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { OPENROUTE_API_KEY } from '@/lib/openroute';

interface ORSRouteProps {
  start: [number, number];
  end: [number, number];
  apiKey?: string;
  onRouteCalculated?: (distance: number, duration: number) => void;
  onError?: (error: string) => void;
  routeColor?: string;
  routeWeight?: number;
  routeOpacity?: number;
}

const ORSRoute: React.FC<ORSRouteProps> = ({ 
  start, 
  end, 
  apiKey = OPENROUTE_API_KEY,
  onRouteCalculated,
  onError,
  routeColor = '#2563eb',
  routeWeight = 5,
  routeOpacity = 0.8
}) => {
  const map = useMap();
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    // Clear previous route
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
    }

    const fetchRoute = async () => {
      try {
        // Request body for OpenRouteService
        const body = {
          coordinates: [[start[1], start[0]], [end[1], end[0]]], // [lon, lat] format
          preference: 'fastest',
          format: 'geojson',
          instructions: true
        };

        const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
          method: 'POST',
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });

        if (!response.ok) {
          throw new Error(`Route calculation failed: ${response.statusText}`);
        }

        const geojson = await response.json();
        
        if (!geojson.features || geojson.features.length === 0) {
          throw new Error('No route found between the specified points');
        }

        const feature = geojson.features[0];
        const properties = feature.properties;

        // Create route layer
        const routeLayer = L.geoJSON(geojson, {
          style: {
            color: routeColor,
            weight: routeWeight,
            opacity: routeOpacity,
            dashArray: '0', // Solid line
            lineCap: 'round',
            lineJoin: 'round'
          }
        });

        // Add route to map
        routeLayerRef.current = routeLayer;
        routeLayer.addTo(map);

        // Fit map to route bounds with padding
        const bounds = routeLayer.getBounds();
        map.fitBounds(bounds, { 
          padding: [20, 20],
          maxZoom: 16 // Prevent zooming too close
        });

        // Extract route information
        const summary = properties.summary;
        const distance = summary?.distance ? summary.distance / 1000 : 0; // Convert to km
        const duration = summary?.duration ? summary.duration / 60 : 0; // Convert to minutes

        // Call callback with route information
        if (onRouteCalculated) {
          onRouteCalculated(distance, duration);
        }

        console.log('Route calculated successfully:', {
          distance: `${distance.toFixed(2)} km`,
          duration: `${Math.round(duration)} minutes`
        });

      } catch (error) {
        console.error('Route calculation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to calculate route';
        
        if (onError) {
          onError(errorMessage);
        }
      }
    };

    // Only fetch route if we have valid coordinates
    if (start && end && start.length === 2 && end.length === 2) {
      fetchRoute();
    }

    // Cleanup function
    return () => {
      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
    };
  }, [start, end, apiKey, map, onRouteCalculated, onError, routeColor, routeWeight, routeOpacity]);

  return null; // This component doesn't render anything directly
};

export default ORSRoute;
