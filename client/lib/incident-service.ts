import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, isFirebaseAvailable } from './firebase';
import { UserRole } from '@/hooks/use-auth';

// Incident types and interfaces
export type IncidentType = 'fire' | 'medical' | 'accident' | 'natural' | 'police' | 'other';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'submitted' | 'acknowledged' | 'assigned' | 'in-progress' | 'resolved' | 'closed';

export interface Incident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  reporterUserId: string;
  reporterName: string;
  reporterPhone: string;
  images?: string[];
  assignedDepartments: UserRole[];
  assignedPersonnel?: string[];
  timestamps: {
    reported: Date;
    acknowledged?: Date;
    assigned?: Date;
    inProgress?: Date;
    resolved?: Date;
    closed?: Date;
  };
  updates: IncidentUpdate[];
  notificationsSent: NotificationRecord[];
}

export interface IncidentUpdate {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  message: string;
  timestamp: Date;
  type: 'status_change' | 'assignment' | 'note' | 'resource_request';
}

export interface NotificationRecord {
  id: string;
  department: UserRole;
  sentAt: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

export interface HelpRequest {
  id: string;
  type: 'medical' | 'supplies' | 'transport' | 'other';
  urgency: IncidentSeverity;
  description: string;
  location: string;
  requesterUserId: string;
  requesterName: string;
  requesterPhone: string;
  status: 'submitted' | 'acknowledged' | 'dispatched' | 'completed';
  assignedTo?: string[];
  specialRequests?: string;
  timestamps: {
    requested: Date;
    acknowledged?: Date;
    dispatched?: Date;
    completed?: Date;
  };
}

// Department mapping for incident types
export const INCIDENT_DEPARTMENT_MAPPING: Record<IncidentType, UserRole[]> = {
  fire: ['fire', 'admin'],
  medical: ['ambulance', 'hospital', 'admin'],
  accident: ['police', 'ambulance', 'admin'],
  natural: ['fire', 'police', 'ambulance', 'admin'],
  police: ['police', 'admin'],
  other: ['police', 'fire', 'ambulance', 'admin']
};

// Fallback storage for when Firebase is not available
let localIncidents: Incident[] = [];
let localHelpRequests: HelpRequest[] = [];

/**
 * Create a new incident report
 */
export const createIncident = async (incidentData: Omit<Incident, 'id' | 'timestamps' | 'updates' | 'notificationsSent' | 'assignedDepartments'>): Promise<Incident> => {
  const assignedDepartments = INCIDENT_DEPARTMENT_MAPPING[incidentData.type] || ['admin'];
  
  const incident: Omit<Incident, 'id'> = {
    ...incidentData,
    assignedDepartments,
    timestamps: {
      reported: new Date()
    },
    updates: [],
    notificationsSent: []
  };

  if (isFirebaseAvailable() && db) {
    try {
      const docRef = await addDoc(collection(db, 'incidents'), {
        ...incident,
        timestamps: {
          reported: serverTimestamp()
        }
      });
      
      const createdIncident = { ...incident, id: docRef.id, timestamps: { reported: new Date() } };
      console.log('🔥 Incident stored in Firebase:', createdIncident.id);
      return createdIncident;
    } catch (error) {
      console.error('Failed to store incident in Firebase:', error);
      // Fall back to local storage
    }
  }
  
  // Fallback to local storage
  const localIncident = { ...incident, id: `local-${Date.now()}` };
  localIncidents.push(localIncident);
  localStorage.setItem('emergency-incidents', JSON.stringify(localIncidents));
  console.log('📱 Incident stored locally:', localIncident.id);
  return localIncident;
};

/**
 * Create a help request
 */
export const createHelpRequest = async (helpData: Omit<HelpRequest, 'id' | 'timestamps'>): Promise<HelpRequest> => {
  const helpRequest: Omit<HelpRequest, 'id'> = {
    ...helpData,
    timestamps: {
      requested: new Date()
    }
  };

  if (isFirebaseAvailable() && db) {
    try {
      const docRef = await addDoc(collection(db, 'help-requests'), {
        ...helpRequest,
        timestamps: {
          requested: serverTimestamp()
        }
      });
      
      const createdRequest = { ...helpRequest, id: docRef.id, timestamps: { requested: new Date() } };
      console.log('🔥 Help request stored in Firebase:', createdRequest.id);
      return createdRequest;
    } catch (error) {
      console.error('Failed to store help request in Firebase:', error);
      // Fall back to local storage
    }
  }
  
  // Fallback to local storage
  const localRequest = { ...helpRequest, id: `local-help-${Date.now()}` };
  localHelpRequests.push(localRequest);
  localStorage.setItem('emergency-help-requests', JSON.stringify(localHelpRequests));
  console.log('📱 Help request stored locally:', localRequest.id);
  return localRequest;
};

/**
 * Update incident status
 */
export const updateIncidentStatus = async (incidentId: string, status: IncidentStatus, updateMessage?: string, userId?: string, userRole?: UserRole): Promise<void> => {
  const timestamp = new Date();
  const timestampField = `timestamps.${status.replace('-', '')}` as keyof Incident['timestamps'];

  if (isFirebaseAvailable() && db) {
    try {
      const incidentRef = doc(db, 'incidents', incidentId);
      const updateData: any = {
        status,
        [timestampField]: serverTimestamp()
      };

      if (updateMessage && userId && userRole) {
        const update: IncidentUpdate = {
          id: `update-${Date.now()}`,
          userId,
          userName: 'User', // In real app, get from user data
          userRole,
          message: updateMessage,
          timestamp,
          type: 'status_change'
        };
        updateData.updates = [...(await getIncidentUpdates(incidentId)), update];
      }

      await updateDoc(incidentRef, updateData);
      console.log('🔥 Incident status updated in Firebase:', incidentId);
      return;
    } catch (error) {
      console.error('Failed to update incident in Firebase:', error);
      // Fall back to local storage
    }
  }

  // Fallback to local storage
  const incidents = JSON.parse(localStorage.getItem('emergency-incidents') || '[]');
  const incidentIndex = incidents.findIndex((i: Incident) => i.id === incidentId);
  
  if (incidentIndex !== -1) {
    incidents[incidentIndex].status = status;
    incidents[incidentIndex].timestamps[status.replace('-', '') as keyof Incident['timestamps']] = timestamp;
    
    if (updateMessage && userId && userRole) {
      const update: IncidentUpdate = {
        id: `update-${Date.now()}`,
        userId,
        userName: 'User',
        userRole,
        message: updateMessage,
        timestamp,
        type: 'status_change'
      };
      incidents[incidentIndex].updates.push(update);
    }
    
    localStorage.setItem('emergency-incidents', JSON.stringify(incidents));
    console.log('📱 Incident status updated locally:', incidentId);
  }
};

/**
 * Get incidents for a specific department
 */
export const getIncidentsForDepartment = async (department: UserRole): Promise<Incident[]> => {
  if (isFirebaseAvailable() && db) {
    try {
      const q = query(
        collection(db, 'incidents'),
        where('assignedDepartments', 'array-contains', department),
        orderBy('timestamps.reported', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const incidents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Incident[];
      
      console.log('🔥 Fetched incidents from Firebase for', department);
      return incidents;
    } catch (error) {
      console.error('Failed to fetch incidents from Firebase:', error);
      // Fall back to local storage
    }
  }

  // Fallback to local storage
  const incidents = JSON.parse(localStorage.getItem('emergency-incidents') || '[]') as Incident[];
  const departmentIncidents = incidents.filter(incident => 
    incident.assignedDepartments.includes(department)
  );
  
  console.log('📱 Fetched incidents locally for', department);
  return departmentIncidents.sort((a, b) => 
    new Date(b.timestamps.reported).getTime() - new Date(a.timestamps.reported).getTime()
  );
};

/**
 * Get all incidents (admin view)
 */
export const getAllIncidents = async (): Promise<Incident[]> => {
  if (isFirebaseAvailable() && db) {
    try {
      const q = query(collection(db, 'incidents'), orderBy('timestamps.reported', 'desc'));
      const querySnapshot = await getDocs(q);
      const incidents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Incident[];
      
      return incidents;
    } catch (error) {
      console.error('Failed to fetch all incidents from Firebase:', error);
    }
  }

  // Fallback to local storage
  const incidents = JSON.parse(localStorage.getItem('emergency-incidents') || '[]') as Incident[];
  return incidents.sort((a, b) => 
    new Date(b.timestamps.reported).getTime() - new Date(a.timestamps.reported).getTime()
  );
};

/**
 * Get help requests for medical departments
 */
export const getHelpRequestsForDepartment = async (department: UserRole): Promise<HelpRequest[]> => {
  if (!['ambulance', 'hospital', 'admin'].includes(department)) {
    return [];
  }

  if (isFirebaseAvailable() && db) {
    try {
      const q = query(collection(db, 'help-requests'), orderBy('timestamps.requested', 'desc'));
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HelpRequest[];
      
      return requests;
    } catch (error) {
      console.error('Failed to fetch help requests from Firebase:', error);
    }
  }

  // Fallback to local storage
  const requests = JSON.parse(localStorage.getItem('emergency-help-requests') || '[]') as HelpRequest[];
  return requests.sort((a, b) => 
    new Date(b.timestamps.requested).getTime() - new Date(a.timestamps.requested).getTime()
  );
};

/**
 * Get incident updates
 */
const getIncidentUpdates = async (incidentId: string): Promise<IncidentUpdate[]> => {
  if (isFirebaseAvailable() && db) {
    try {
      const incidentDoc = await getDoc(doc(db, 'incidents', incidentId));
      if (incidentDoc.exists()) {
        const data = incidentDoc.data() as Incident;
        return data.updates || [];
      }
    } catch (error) {
      console.error('Failed to fetch incident updates:', error);
    }
  }

  // Fallback to local storage
  const incidents = JSON.parse(localStorage.getItem('emergency-incidents') || '[]') as Incident[];
  const incident = incidents.find(i => i.id === incidentId);
  return incident?.updates || [];
};

/**
 * Listen to real-time incident updates (Firebase only)
 */
export const subscribeToIncidents = (department: UserRole, callback: (incidents: Incident[]) => void) => {
  if (!isFirebaseAvailable() || !db) {
    // For local storage, we'd need to implement polling or use other methods
    // For now, just return the current data
    getIncidentsForDepartment(department).then(callback);
    return () => {}; // No-op unsubscribe
  }

  try {
    const q = query(
      collection(db, 'incidents'),
      where('assignedDepartments', 'array-contains', department),
      orderBy('timestamps.reported', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const incidents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Incident[];
      
      callback(incidents);
    });
  } catch (error) {
    console.error('Failed to subscribe to incidents:', error);
    return () => {};
  }
};

// Initialize local storage on load
if (!isFirebaseAvailable()) {
  const storedIncidents = localStorage.getItem('emergency-incidents');
  const storedRequests = localStorage.getItem('emergency-help-requests');
  
  if (storedIncidents) {
    try {
      localIncidents = JSON.parse(storedIncidents);
    } catch (error) {
      console.error('Failed to parse stored incidents:', error);
      localIncidents = [];
    }
  }
  
  if (storedRequests) {
    try {
      localHelpRequests = JSON.parse(storedRequests);
    } catch (error) {
      console.error('Failed to parse stored help requests:', error);
      localHelpRequests = [];
    }
  }
}
