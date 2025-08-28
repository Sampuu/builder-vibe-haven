import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import { useAuth, UserRole } from '@/hooks/use-auth';

export interface Incident {
  id: string;
  type: 'help_request' | 'disaster_report';
  category: 'fire' | 'medical' | 'accident' | 'natural' | 'police' | 'supplies' | 'transport' | 'other';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  reporter: {
    id: string;
    name: string;
    phone: string;
    role: UserRole;
  };
  assignedDepartments: UserRole[];
  status: 'submitted' | 'acknowledged' | 'assigned' | 'in_progress' | 'resolved' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamps: {
    submitted: Date;
    acknowledged?: Date;
    assigned?: Date;
    inProgress?: Date;
    resolved?: Date;
  };
  metadata?: {
    images?: string[];
    specialRequests?: string;
    supplies?: string[];
    injuries?: number;
    vehiclesInvolved?: number;
  };
}

interface IncidentContextType {
  incidents: Incident[];
  submitIncident: (incidentData: Omit<Incident, 'id' | 'assignedDepartments' | 'status' | 'timestamps'>) => Promise<string>;
  acknowledgeIncident: (incidentId: string, department: UserRole) => void;
  updateIncidentStatus: (incidentId: string, status: Incident['status']) => void;
  assignIncident: (incidentId: string, departments: UserRole[]) => void;
  getIncidentsForDepartment: (department: UserRole) => Incident[];
  getUserIncidents: (userId: string) => Incident[];
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (context === undefined) {
    throw new Error('useIncidents must be used within an IncidentProvider');
  }
  return context;
};

interface IncidentProviderProps {
  children: ReactNode;
}

// Routing logic to determine which departments should handle each incident type
const getDepartmentRouting = (category: Incident['category'], urgency: Incident['urgency']): UserRole[] => {
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
};

export const IncidentProvider: React.FC<IncidentProviderProps> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const { addNotification } = useNotifications();
  const { user } = useAuth();

  const submitIncident = async (incidentData: Omit<Incident, 'id' | 'assignedDepartments' | 'status' | 'timestamps'>): Promise<string> => {
    const incidentId = `incident-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine which departments should be notified
    const assignedDepartments = getDepartmentRouting(incidentData.category, incidentData.urgency);
    
    const newIncident: Incident = {
      ...incidentData,
      id: incidentId,
      assignedDepartments,
      status: 'submitted',
      timestamps: {
        submitted: new Date(),
      },
      priority: incidentData.urgency, // Map urgency to priority
    };

    setIncidents(prev => [newIncident, ...prev]);

    // Notify assigned departments
    assignedDepartments.forEach(department => {
      const notificationTitle = incidentData.type === 'help_request' 
        ? 'New Help Request' 
        : 'New Emergency Report';
      
      const notificationMessage = `${incidentData.category.toUpperCase()}: ${incidentData.title} at ${incidentData.location}`;
      
      addNotification({
        title: notificationTitle,
        message: notificationMessage,
        type: incidentData.urgency === 'critical' ? 'emergency' : 
              incidentData.urgency === 'high' ? 'warning' : 'info',
        priority: incidentData.urgency === 'critical' || incidentData.urgency === 'high' ? 'high' : 'medium',
        category: 'incident'
      });
    });

    // Also notify admin for high priority incidents
    if (incidentData.urgency === 'critical' || incidentData.urgency === 'high') {
      addNotification({
        title: `${incidentData.urgency.toUpperCase()} Incident Reported`,
        message: `${incidentData.category.toUpperCase()}: ${incidentData.title} - Departments notified: ${assignedDepartments.join(', ')}`,
        type: 'emergency',
        priority: 'high',
        category: 'incident'
      });
    }

    return incidentId;
  };

  const acknowledgeIncident = (incidentId: string, department: UserRole) => {
    setIncidents(prev => prev.map(incident => {
      if (incident.id === incidentId) {
        return {
          ...incident,
          status: 'acknowledged',
          timestamps: {
            ...incident.timestamps,
            acknowledged: new Date(),
          }
        };
      }
      return incident;
    }));

    // Notify the reporter that their incident has been acknowledged
    const incident = incidents.find(i => i.id === incidentId);
    if (incident) {
      addNotification({
        title: 'Incident Acknowledged',
        message: `Your ${incident.type === 'help_request' ? 'help request' : 'emergency report'} has been acknowledged by ${department}`,
        type: 'success',
        priority: 'medium',
        category: 'update'
      });
    }
  };

  const updateIncidentStatus = (incidentId: string, status: Incident['status']) => {
    setIncidents(prev => prev.map(incident => {
      if (incident.id === incidentId) {
        const updatedTimestamps = { ...incident.timestamps };
        
        switch (status) {
          case 'assigned':
            updatedTimestamps.assigned = new Date();
            break;
          case 'in_progress':
            updatedTimestamps.inProgress = new Date();
            break;
          case 'resolved':
            updatedTimestamps.resolved = new Date();
            break;
        }

        return {
          ...incident,
          status,
          timestamps: updatedTimestamps,
        };
      }
      return incident;
    }));

    // Notify relevant parties about status updates
    const incident = incidents.find(i => i.id === incidentId);
    if (incident) {
      addNotification({
        title: 'Incident Status Updated',
        message: `Incident "${incident.title}" status changed to: ${status.replace('_', ' ')}`,
        type: status === 'resolved' ? 'success' : 'info',
        priority: 'medium',
        category: 'update'
      });
    }
  };

  const assignIncident = (incidentId: string, departments: UserRole[]) => {
    setIncidents(prev => prev.map(incident => {
      if (incident.id === incidentId) {
        return {
          ...incident,
          assignedDepartments: departments,
          status: 'assigned',
          timestamps: {
            ...incident.timestamps,
            assigned: new Date(),
          }
        };
      }
      return incident;
    }));
  };

  const getIncidentsForDepartment = (department: UserRole): Incident[] => {
    return incidents.filter(incident => 
      incident.assignedDepartments.includes(department) ||
      (department === 'admin') // Admin can see all incidents
    );
  };

  const getUserIncidents = (userId: string): Incident[] => {
    return incidents.filter(incident => incident.reporter.id === userId);
  };

  const value: IncidentContextType = {
    incidents,
    submitIncident,
    acknowledgeIncident,
    updateIncidentStatus,
    assignIncident,
    getIncidentsForDepartment,
    getUserIncidents,
  };

  return (
    <IncidentContext.Provider value={value}>
      {children}
    </IncidentContext.Provider>
  );
};

// Helper function to get incident status color
export const getIncidentStatusColor = (status: Incident['status']): string => {
  const colors = {
    submitted: 'text-emergency-warning',
    acknowledged: 'text-emergency-info',
    assigned: 'text-emergency-info',
    in_progress: 'text-emergency-warning',
    resolved: 'text-emergency-resolved',
    cancelled: 'text-slate-500',
  };
  return colors[status] || 'text-slate-500';
};

// Helper function to get urgency color
export const getUrgencyColor = (urgency: Incident['urgency']): string => {
  const colors = {
    low: 'text-slate-600',
    medium: 'text-emergency-info',
    high: 'text-emergency-warning',
    critical: 'text-emergency-danger',
  };
  return colors[urgency] || 'text-slate-500';
};
