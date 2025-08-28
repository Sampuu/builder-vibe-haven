// In-memory database store - can be replaced with real database later
import { Incident, Notification, UserRole } from "../../shared/types";

// In-memory storage
let incidents: Incident[] = [];
let notifications: Notification[] = [];

// Department routing logic
export function getDepartmentRouting(category: Incident['category'], urgency: Incident['urgency']): UserRole[] {
  const routing: Record<string, UserRole[]> = {
    fire: ['fire', 'police'], // Fire department primary, police for coordination
    medical: ['ambulance', 'hospital'], // Ambulance for response, hospital for preparation
    accident: ['police', 'ambulance'], // Police for traffic control, ambulance for injuries
    natural: ['police', 'fire', 'ambulance'], // All emergency services for major disasters
    police: ['police'], // Police-specific incidents
    supplies: ['hospital', 'admin'], // Hospital for medical supplies, admin for coordination
    transport: ['ambulance', 'police'], // Ambulance for medical transport, police for route clearing
    other: ['police', 'admin'], // Default routing for unclear incidents
  };

  let departments = routing[category] || ['police', 'admin'];

  // Add admin for critical incidents to ensure oversight
  if (urgency === 'critical' && !departments.includes('admin')) {
    departments.push('admin');
  }

  return departments;
}

// Incident CRUD operations
export function createIncident(incidentData: Omit<Incident, 'id' | 'assignedDepartments' | 'status' | 'timestamps'>): Incident {
  const incidentId = `incident-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const assignedDepartments = getDepartmentRouting(incidentData.category, incidentData.urgency);
  
  const newIncident: Incident = {
    ...incidentData,
    id: incidentId,
    assignedDepartments,
    status: 'submitted',
    timestamps: {
      submitted: new Date().toISOString(),
    },
    priority: incidentData.urgency, // Map urgency to priority
  };

  incidents.unshift(newIncident); // Add to beginning
  return newIncident;
}

export function getIncidentById(id: string): Incident | undefined {
  return incidents.find(incident => incident.id === id);
}

export function getAllIncidents(): Incident[] {
  return [...incidents]; // Return copy
}

export function getIncidentsForDepartment(department: UserRole): Incident[] {
  return incidents.filter(incident => 
    incident.assignedDepartments.includes(department) ||
    department === 'admin' // Admin can see all incidents
  );
}

export function getUserIncidents(userId: string): Incident[] {
  return incidents.filter(incident => incident.reporter.id === userId);
}

export function updateIncidentStatus(incidentId: string, status: Incident['status']): Incident | null {
  const incidentIndex = incidents.findIndex(incident => incident.id === incidentId);
  if (incidentIndex === -1) return null;

  const updatedTimestamps = { ...incidents[incidentIndex].timestamps };
  
  switch (status) {
    case 'acknowledged':
      updatedTimestamps.acknowledged = new Date().toISOString();
      break;
    case 'assigned':
      updatedTimestamps.assigned = new Date().toISOString();
      break;
    case 'in_progress':
      updatedTimestamps.inProgress = new Date().toISOString();
      break;
    case 'resolved':
      updatedTimestamps.resolved = new Date().toISOString();
      break;
  }

  incidents[incidentIndex] = {
    ...incidents[incidentIndex],
    status,
    timestamps: updatedTimestamps,
  };

  return incidents[incidentIndex];
}

export function acknowledgeIncident(incidentId: string): Incident | null {
  return updateIncidentStatus(incidentId, 'acknowledged');
}

// Notification CRUD operations
export function createNotification(notificationData: Omit<Notification, 'id' | 'timestamp'>): Notification {
  const notificationId = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const newNotification: Notification = {
    ...notificationData,
    id: notificationId,
    timestamp: new Date().toISOString(),
  };

  notifications.unshift(newNotification); // Add to beginning
  return newNotification;
}

export function getNotificationsForUser(userRole: UserRole): Notification[] {
  return notifications.filter(notification => {
    // If no target roles specified, show to all users (global notifications like news)
    if (!notification.targetRoles) return true;
    
    // If user is admin, show all notifications
    if (userRole === 'admin') return true;
    
    // Show only if user's role is in target roles
    return notification.targetRoles.includes(userRole);
  });
}

export function getAllNotifications(): Notification[] {
  return [...notifications]; // Return copy
}

export function markNotificationAsRead(notificationId: string): boolean {
  const notificationIndex = notifications.findIndex(n => n.id === notificationId);
  if (notificationIndex === -1) return false;

  notifications[notificationIndex] = {
    ...notifications[notificationIndex],
    read: true,
  };
  return true;
}

export function markAllNotificationsAsReadForUser(userRole: UserRole): number {
  const userNotifications = getNotificationsForUser(userRole);
  let markedCount = 0;

  userNotifications.forEach(notification => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
      markedCount++;
    }
  });

  return markedCount;
}

export function deleteNotification(notificationId: string): boolean {
  const initialLength = notifications.length;
  notifications = notifications.filter(n => n.id !== notificationId);
  return notifications.length < initialLength;
}

export function clearNotificationsForUser(userRole: UserRole): number {
  const userNotifications = getNotificationsForUser(userRole);
  let deletedCount = 0;

  userNotifications.forEach(notification => {
    if (deleteNotification(notification.id)) {
      deletedCount++;
    }
  });

  return deletedCount;
}

// Utility functions
export function getIncidentStats() {
  const total = incidents.length;
  const active = incidents.filter(i => ['submitted', 'acknowledged', 'assigned', 'in_progress'].includes(i.status)).length;
  const resolved = incidents.filter(i => i.status === 'resolved').length;
  const critical = incidents.filter(i => i.urgency === 'critical' && i.status !== 'resolved').length;

  return { total, active, resolved, critical };
}

export function getRecentIncidents(limit: number = 10): Incident[] {
  return incidents
    .sort((a, b) => new Date(b.timestamps.submitted).getTime() - new Date(a.timestamps.submitted).getTime())
    .slice(0, limit);
}

// Initialize with some sample data for testing
export function initializeSampleData() {
  // Clear existing data
  incidents = [];
  notifications = [];

  console.log('Initialized empty database store');
}

// Initialize on module load
initializeSampleData();
