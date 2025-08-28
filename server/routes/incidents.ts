import { RequestHandler } from "express";
import {
  CreateIncidentRequest,
  CreateIncidentResponse,
  Incident,
  Notification,
  User
} from "@shared/api";
import { broadcastNotification, broadcastIncidentUpdate } from "../websocket";

// In-memory storage (in production, use a database)
const incidents: Incident[] = [];
const notifications: Notification[] = [];

// Notification routing logic - determines which roles should be notified for each incident type
function getTargetRoles(incident: CreateIncidentRequest): User['role'][] {
  const roleMap: Record<string, User['role'][]> = {
    medical: ['ambulance', 'hospital', 'police', 'admin'],
    fire: ['fire', 'police', 'admin'],
    accident: ['police', 'ambulance', 'fire', 'admin'],
    natural: ['police', 'fire', 'ambulance', 'hospital', 'admin'],
    supplies: ['hospital', 'ambulance', 'admin'],
    transport: ['ambulance', 'hospital', 'admin'],
    other: ['police', 'admin']
  };

  let roles = roleMap[incident.type] || ['police', 'admin'];

  // Add more roles for critical incidents
  if (incident.urgency === 'critical') {
    roles = [...new Set([...roles, 'admin'])];
  }

  return roles;
}

function createNotifications(incident: Incident): Notification[] {
  const notifications: Notification[] = [];
  
  for (const role of incident.targetRoles) {
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      incidentId: incident.id,
      targetRole: role,
      type: 'incident_created',
      title: getNotificationTitle(incident),
      message: getNotificationMessage(incident),
      priority: incident.urgency,
      read: false,
      acknowledged: false,
      timestamp: new Date().toISOString(),
      data: {
        incidentType: incident.type,
        location: incident.location,
        urgency: incident.urgency
      }
    };
    notifications.push(notification);
  }

  return notifications;
}

function getNotificationTitle(incident: Incident): string {
  const typeLabels = {
    medical: 'Medical Emergency',
    fire: 'Fire Emergency',
    accident: 'Traffic Accident',
    natural: 'Natural Disaster',
    supplies: 'Supply Request',
    transport: 'Transport Request',
    other: 'Emergency Report'
  };

  const urgencyPrefix = incident.urgency === 'critical' ? '🚨 CRITICAL: ' : 
                       incident.urgency === 'high' ? '⚠️ HIGH: ' : '';

  return `${urgencyPrefix}${typeLabels[incident.type] || 'Emergency'}`;
}

function getNotificationMessage(incident: Incident): string {
  return `${incident.title} at ${incident.location}. Contact: ${incident.contactPhone}`;
}

export const createIncident: RequestHandler = (req, res) => {
  try {
    const incidentData: CreateIncidentRequest = req.body;
    
    // Get user info from request (in real app, from JWT token)
    const reportedBy = req.headers['x-user-id'] as string || 'user_unknown';
    const reportedByRole = (req.headers['x-user-role'] as User['role']) || 'user';

    // Validate required fields
    if (!incidentData.type || !incidentData.title || !incidentData.description || 
        !incidentData.location || !incidentData.contactPhone) {
      return res.status(400).json({ 
        error: 'Missing required fields: type, title, description, location, contactPhone' 
      });
    }

    // Create incident
    const incident: Incident = {
      id: `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...incidentData,
      severity: incidentData.severity || incidentData.urgency,
      reportedBy,
      reportedByRole,
      status: 'submitted',
      timestamp: new Date().toISOString(),
      targetRoles: getTargetRoles(incidentData)
    };

    // Save incident
    incidents.push(incident);

    // Create notifications for target roles
    const newNotifications = createNotifications(incident);
    notifications.push(...newNotifications);

    // Broadcast notifications via WebSocket
    newNotifications.forEach(notification => {
      broadcastNotification(notification);
    });

    console.log(`Created incident ${incident.id} for roles:`, incident.targetRoles);
    console.log(`Created ${newNotifications.length} notifications`);

    const response: CreateIncidentResponse = {
      incident,
      notifications: newNotifications
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: 'Failed to create incident' });
  }
};

export const getIncidents: RequestHandler = (req, res) => {
  try {
    const userRole = req.headers['x-user-role'] as User['role'];
    
    // Filter incidents based on user role
    let filteredIncidents = incidents;
    
    if (userRole && userRole !== 'admin') {
      filteredIncidents = incidents.filter(incident => 
        incident.targetRoles.includes(userRole) || 
        incident.reportedByRole === userRole
      );
    }

    // Sort by timestamp (newest first)
    filteredIncidents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({ incidents: filteredIncidents });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
};

export const updateIncidentStatus: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;
    
    const incident = incidents.find(i => i.id === id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    // Update incident
    if (status) incident.status = status;
    if (assignedTo) incident.assignedTo = assignedTo;

    // Create update notification
    const updateNotification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      incidentId: incident.id,
      targetRole: 'user', // Notify the original reporter
      type: 'incident_updated',
      title: 'Incident Status Updated',
      message: `Your ${incident.type} report has been ${status}`,
      priority: 'medium',
      read: false,
      acknowledged: false,
      timestamp: new Date().toISOString(),
      data: { newStatus: status }
    };

    notifications.push(updateNotification);

    // Broadcast update to all relevant parties
    broadcastNotification(updateNotification);
    broadcastIncidentUpdate(incident.id, { status, assignedTo }, incident.targetRoles);

    res.json({ incident, notification: updateNotification });
  } catch (error) {
    console.error('Error updating incident:', error);
    res.status(500).json({ error: 'Failed to update incident' });
  }
};

// Export storage for other modules (notifications route)
export { incidents, notifications };
