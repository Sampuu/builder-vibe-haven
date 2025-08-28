import { RequestHandler } from "express";
import {
  AccidentZone,
  CreateAccidentZoneRequest,
  TrackedEntity,
  UpdateEntityLocationRequest,
  RouteRequest,
  RouteResponse
} from "@shared/api";
import { RoutingService } from "../services/routing";

// In-memory storage (in production, use a database)
const accidentZones: AccidentZone[] = [
  {
    id: 'zone_delhi_001',
    name: 'Delhi Traffic Accident',
    description: 'Major traffic accident on Ring Road',
    latitude: 28.6139,
    longitude: 77.2090,
    radius: 1000,
    severity: 'high',
    type: 'accident',
    isActive: true,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'zone_mumbai_001',
    name: 'Mumbai Construction Zone',
    description: 'Road construction causing traffic delays',
    latitude: 19.0760,
    longitude: 72.8777,
    radius: 800,
    severity: 'medium',
    type: 'construction',
    isActive: true,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
  }
];

const trackedEntities: TrackedEntity[] = [
  {
    id: 'police_001',
    name: 'Police Unit Alpha',
    type: 'police',
    latitude: 28.6129,
    longitude: 77.2295,
    heading: 45,
    speed: 0,
    status: 'idle',
    lastUpdate: new Date().toISOString(),
  },
  {
    id: 'ambulance_001',
    name: 'Ambulance Red Cross 1',
    type: 'ambulance',
    latitude: 19.0860,
    longitude: 72.8777,
    heading: 180,
    speed: 25,
    status: 'responding',
    lastUpdate: new Date().toISOString(),
  }
];

export const getAccidentZones: RequestHandler = (req, res) => {
  try {
    const { active } = req.query;
    
    let zones = accidentZones;
    
    // Filter by active status if requested
    if (active !== undefined) {
      const isActive = active === 'true';
      zones = zones.filter(zone => zone.isActive === isActive);
    }

    // Remove expired zones
    const now = new Date();
    zones = zones.filter(zone => {
      if (zone.expiresAt) {
        return new Date(zone.expiresAt) > now;
      }
      return true;
    });

    res.json({ zones });
  } catch (error) {
    console.error('Error fetching accident zones:', error);
    res.status(500).json({ error: 'Failed to fetch accident zones' });
  }
};

export const createAccidentZone: RequestHandler = (req, res) => {
  try {
    const zoneData: CreateAccidentZoneRequest = req.body;
    const userId = req.headers['x-user-id'] as string || 'unknown';

    // Validate required fields
    if (!zoneData.name || !zoneData.latitude || !zoneData.longitude || !zoneData.radius) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, latitude, longitude, radius' 
      });
    }

    const zone: AccidentZone = {
      id: `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...zoneData,
      isActive: true,
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };

    accidentZones.push(zone);

    console.log(`Created accident zone: ${zone.name} at [${zone.latitude}, ${zone.longitude}]`);

    res.status(201).json({ zone });
  } catch (error) {
    console.error('Error creating accident zone:', error);
    res.status(500).json({ error: 'Failed to create accident zone' });
  }
};

export const updateAccidentZone: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const zoneIndex = accidentZones.findIndex(zone => zone.id === id);
    if (zoneIndex === -1) {
      return res.status(404).json({ error: 'Accident zone not found' });
    }

    // Update zone
    accidentZones[zoneIndex] = { ...accidentZones[zoneIndex], ...updates };

    res.json({ zone: accidentZones[zoneIndex] });
  } catch (error) {
    console.error('Error updating accident zone:', error);
    res.status(500).json({ error: 'Failed to update accident zone' });
  }
};

export const deleteAccidentZone: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;

    const zoneIndex = accidentZones.findIndex(zone => zone.id === id);
    if (zoneIndex === -1) {
      return res.status(404).json({ error: 'Accident zone not found' });
    }

    // Mark as inactive instead of deleting
    accidentZones[zoneIndex].isActive = false;

    res.json({ message: 'Accident zone deactivated' });
  } catch (error) {
    console.error('Error deleting accident zone:', error);
    res.status(500).json({ error: 'Failed to delete accident zone' });
  }
};

export const getTrackedEntities: RequestHandler = (req, res) => {
  try {
    const { type, status } = req.query;
    
    let entities = trackedEntities;
    
    // Filter by type if requested
    if (type) {
      entities = entities.filter(entity => entity.type === type);
    }

    // Filter by status if requested  
    if (status) {
      entities = entities.filter(entity => entity.status === status);
    }

    res.json({ entities });
  } catch (error) {
    console.error('Error fetching tracked entities:', error);
    res.status(500).json({ error: 'Failed to fetch tracked entities' });
  }
};

export const updateEntityLocation: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const locationData: UpdateEntityLocationRequest = req.body;

    const entityIndex = trackedEntities.findIndex(entity => entity.id === id);
    if (entityIndex === -1) {
      return res.status(404).json({ error: 'Entity not found' });
    }

    // Update entity location and status
    trackedEntities[entityIndex] = {
      ...trackedEntities[entityIndex],
      ...locationData,
      lastUpdate: new Date().toISOString(),
    };

    res.json({ entity: trackedEntities[entityIndex] });
  } catch (error) {
    console.error('Error updating entity location:', error);
    res.status(500).json({ error: 'Failed to update entity location' });
  }
};

export const calculateRoute: RequestHandler = async (req, res) => {
  try {
    const routeRequest: RouteRequest = req.body;

    if (!routeRequest.start || !routeRequest.end) {
      return res.status(400).json({ error: 'Start and end coordinates are required' });
    }

    // Use OpenRouteService for intelligent routing
    const routeResponse = await RoutingService.calculateRoute(
      routeRequest,
      accidentZones.filter(zone => zone.isActive)
    );

    res.json(routeResponse);
  } catch (error) {
    console.error('Error calculating route:', error);
    res.status(500).json({ error: 'Failed to calculate route' });
  }
};

// Export storage for other modules
export { accidentZones, trackedEntities };
