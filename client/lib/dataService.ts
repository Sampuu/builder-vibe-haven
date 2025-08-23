// Data service that handles both localStorage and Firebase integration
// This service provides offline-first functionality by saving to localStorage immediately
// and syncing with Firebase when available

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: 'user' | 'police' | 'fire' | 'ambulance' | 'hospital' | 'admin';
  phone?: string;
  isActive: boolean;
}

export interface Incident extends BaseEntity {
  title: string;
  type: 'fire' | 'medical' | 'accident' | 'police' | 'rescue';
  status: 'pending' | 'in-progress' | 'resolved' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  latitude?: number;
  longitude?: number;
  description: string;
  reportedBy: string; // user ID
  assignedTo?: string; // entity ID
  assignedRole?: string;
  resources: string[];
  images?: string[];
  contactInfo?: {
    name: string;
    phone: string;
  };
}

export interface Mission extends BaseEntity {
  incidentId: string;
  title: string;
  type: 'fire' | 'medical' | 'accident' | 'rescue';
  status: 'pending' | 'in-progress' | 'resolved' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  assignedRole: string;
  resources: string[];
  notes?: string;
  estimatedCompletion?: string;
}

export interface Notification extends BaseEntity {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  actionRequired?: boolean;
  relatedId?: string; // incident or mission ID
  relatedType?: 'incident' | 'mission';
}

export interface SupplyRequest extends BaseEntity {
  hospitalId: string;
  itemName: string;
  quantity: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  latitude?: number;
  longitude?: number;
  status: 'pending' | 'assigned' | 'in-transit' | 'delivered';
  assignedVehicle?: string;
  requestedBy: string;
  notes?: string;
}

// EventEmitter for real-time updates with debouncing
class EventEmitter {
  private events: { [key: string]: Function[] } = {};
  private debounceTimeouts: { [key: string]: number } = {};
  private debounceTime = 100; // 100ms debounce

  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event: string, data: any) {
    if (!this.events[event]) return;

    // Debounce rapid events to prevent excessive re-renders
    if (this.debounceTimeouts[event]) {
      clearTimeout(this.debounceTimeouts[event]);
    }

    this.debounceTimeouts[event] = window.setTimeout(() => {
      this.events[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
      delete this.debounceTimeouts[event];
    }, this.debounceTime);
  }

  // Immediate emit for critical events that shouldn't be debounced
  emitImmediate(event: string, data: any) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in immediate event callback for ${event}:`, error);
      }
    });
  }
}

class DataService {
  private eventEmitter = new EventEmitter();
  private firebaseInitialized = false;
  
  // Firebase will be initialized when MCP is connected
  private db: any = null;
  private auth: any = null;

  constructor() {
    // Check if Firebase is available
    this.checkFirebaseAvailability();
  }

  private checkFirebaseAvailability() {
    // This will be updated when Firebase MCP is connected
    try {
      // Check if Firebase SDK is available
      if (typeof window !== 'undefined' && (window as any).firebase) {
        this.firebaseInitialized = true;
        this.db = (window as any).firebase.firestore();
        this.auth = (window as any).firebase.auth();
        console.log('Firebase initialized');
      }
    } catch (error) {
      console.log('Firebase not available, using localStorage only');
    }
  }

  // Real-time event subscriptions
  on(event: string, callback: Function) {
    this.eventEmitter.on(event, callback);
  }

  off(event: string, callback: Function) {
    this.eventEmitter.off(event, callback);
  }

  private emit(event: string, data: any) {
    this.eventEmitter.emit(event, data);
  }

  // Generic CRUD operations
  private getLocalData<T>(collection: string): T[] {
    try {
      const data = localStorage.getItem(`disaster_${collection}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${collection} from localStorage:`, error);
      return [];
    }
  }

  private saveLocalData<T>(collection: string, data: T[]) {
    try {
      localStorage.setItem(`disaster_${collection}`, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${collection} to localStorage:`, error);
    }
  }

  private async saveToFirebase<T extends BaseEntity>(collection: string, item: T) {
    if (!this.firebaseInitialized || !this.db) return;
    
    try {
      await this.db.collection(collection).doc(item.id).set(item);
      console.log(`Saved ${collection} to Firebase:`, item.id);
    } catch (error) {
      console.error(`Error saving ${collection} to Firebase:`, error);
    }
  }

  private async deleteFromFirebase(collection: string, id: string) {
    if (!this.firebaseInitialized || !this.db) return;
    
    try {
      await this.db.collection(collection).doc(id).delete();
      console.log(`Deleted ${collection} from Firebase:`, id);
    } catch (error) {
      console.error(`Error deleting ${collection} from Firebase:`, error);
    }
  }

  // Incidents CRUD
  async getIncidents(): Promise<Incident[]> {
    return this.getLocalData<Incident>('incidents');
  }

  async createIncident(incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<Incident> {
    const newIncident: Incident = {
      ...incident,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to localStorage immediately
    const incidents = this.getLocalData<Incident>('incidents');
    incidents.push(newIncident);
    this.saveLocalData('incidents', incidents);

    // Save to Firebase
    await this.saveToFirebase('incidents', newIncident);

    // Emit real-time update
    this.emit('incidentCreated', newIncident);
    this.emit('incidentsUpdated', incidents);

    return newIncident;
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident | null> {
    const incidents = this.getLocalData<Incident>('incidents');
    const index = incidents.findIndex(incident => incident.id === id);
    
    if (index === -1) return null;

    const updatedIncident = {
      ...incidents[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    incidents[index] = updatedIncident;
    this.saveLocalData('incidents', incidents);

    // Save to Firebase
    await this.saveToFirebase('incidents', updatedIncident);

    // Emit real-time update
    this.emit('incidentUpdated', updatedIncident);
    this.emit('incidentsUpdated', incidents);

    return updatedIncident;
  }

  async deleteIncident(id: string): Promise<boolean> {
    const incidents = this.getLocalData<Incident>('incidents');
    const filteredIncidents = incidents.filter(incident => incident.id !== id);
    
    if (filteredIncidents.length === incidents.length) return false;

    this.saveLocalData('incidents', filteredIncidents);

    // Delete from Firebase
    await this.deleteFromFirebase('incidents', id);

    // Emit real-time update
    this.emit('incidentDeleted', id);
    this.emit('incidentsUpdated', filteredIncidents);

    return true;
  }

  // Missions CRUD
  async getMissions(): Promise<Mission[]> {
    return this.getLocalData<Mission>('missions');
  }

  async createMission(mission: Omit<Mission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Mission> {
    const newMission: Mission = {
      ...mission,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const missions = this.getLocalData<Mission>('missions');
    missions.push(newMission);
    this.saveLocalData('missions', missions);

    await this.saveToFirebase('missions', newMission);

    this.emit('missionCreated', newMission);
    this.emit('missionsUpdated', missions);

    return newMission;
  }

  async updateMission(id: string, updates: Partial<Mission>): Promise<Mission | null> {
    const missions = this.getLocalData<Mission>('missions');
    const index = missions.findIndex(mission => mission.id === id);
    
    if (index === -1) return null;

    const updatedMission = {
      ...missions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    missions[index] = updatedMission;
    this.saveLocalData('missions', missions);

    await this.saveToFirebase('missions', updatedMission);

    this.emit('missionUpdated', updatedMission);
    this.emit('missionsUpdated', missions);

    return updatedMission;
  }

  async deleteMission(id: string): Promise<boolean> {
    const missions = this.getLocalData<Mission>('missions');
    const filteredMissions = missions.filter(mission => mission.id !== id);
    
    if (filteredMissions.length === missions.length) return false;

    this.saveLocalData('missions', filteredMissions);
    await this.deleteFromFirebase('missions', id);

    this.emit('missionDeleted', id);
    this.emit('missionsUpdated', filteredMissions);

    return true;
  }

  // Notifications CRUD
  async getNotifications(userId: string): Promise<Notification[]> {
    const notifications = this.getLocalData<Notification>('notifications');
    return notifications.filter(notification => notification.userId === userId);
  }

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const notifications = this.getLocalData<Notification>('notifications');
    notifications.push(newNotification);
    this.saveLocalData('notifications', notifications);

    await this.saveToFirebase('notifications', newNotification);

    this.emit('notificationCreated', newNotification);
    this.emit('notificationsUpdated', notifications);

    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const notifications = this.getLocalData<Notification>('notifications');
    const index = notifications.findIndex(notification => notification.id === id);
    
    if (index === -1) return false;

    notifications[index].isRead = true;
    notifications[index].updatedAt = new Date().toISOString();
    
    this.saveLocalData('notifications', notifications);
    await this.saveToFirebase('notifications', notifications[index]);

    this.emit('notificationUpdated', notifications[index]);
    this.emit('notificationsUpdated', notifications);

    return true;
  }

  // Supply Requests CRUD
  async getSupplyRequests(): Promise<SupplyRequest[]> {
    return this.getLocalData<SupplyRequest>('supplyRequests');
  }

  async createSupplyRequest(request: Omit<SupplyRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupplyRequest> {
    const newRequest: SupplyRequest = {
      ...request,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const requests = this.getLocalData<SupplyRequest>('supplyRequests');
    requests.push(newRequest);
    this.saveLocalData('supplyRequests', requests);

    await this.saveToFirebase('supplyRequests', newRequest);

    this.emit('supplyRequestCreated', newRequest);
    this.emit('supplyRequestsUpdated', requests);

    return newRequest;
  }

  async updateSupplyRequest(id: string, updates: Partial<SupplyRequest>): Promise<SupplyRequest | null> {
    const requests = this.getLocalData<SupplyRequest>('supplyRequests');
    const index = requests.findIndex(request => request.id === id);
    
    if (index === -1) return null;

    const updatedRequest = {
      ...requests[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    requests[index] = updatedRequest;
    this.saveLocalData('supplyRequests', requests);

    await this.saveToFirebase('supplyRequests', updatedRequest);

    this.emit('supplyRequestUpdated', updatedRequest);
    this.emit('supplyRequestsUpdated', requests);

    return updatedRequest;
  }

  // Initialize sample data if none exists
  async initializeSampleData() {
    const incidents = this.getLocalData<Incident>('incidents');
    if (incidents.length === 0) {
      const sampleIncidents: Incident[] = [
        {
          id: '1',
          title: 'Building Fire at Downtown Plaza',
          type: 'fire',
          status: 'in-progress',
          priority: 'critical',
          location: 'Downtown Plaza, Building A',
          latitude: 40.7580,
          longitude: -73.9855,
          description: 'Large fire on 5th floor, evacuation in progress',
          reportedBy: 'user-1',
          assignedTo: 'Fire Station 3',
          assignedRole: 'fire',
          resources: ['Fire Truck', 'Ambulance', 'Police Unit'],
          createdAt: new Date(Date.now() - 900000).toISOString(), // 15 mins ago
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Medical Emergency - Heart Attack',
          type: 'medical',
          status: 'pending',
          priority: 'high',
          location: 'Oak Street 425',
          latitude: 40.7489,
          longitude: -73.9857,
          description: '67-year-old male, chest pain, difficulty breathing',
          reportedBy: 'user-2',
          assignedTo: 'Ambulance Unit 7',
          assignedRole: 'ambulance',
          resources: ['Ambulance', 'Paramedic Team'],
          createdAt: new Date(Date.now() - 300000).toISOString(), // 5 mins ago
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Traffic Accident - Highway 101',
          type: 'accident',
          status: 'resolved',
          priority: 'medium',
          location: 'Highway 101, Mile Marker 23',
          latitude: 40.7505,
          longitude: -73.9934,
          description: 'Multi-vehicle collision, no serious injuries',
          reportedBy: 'user-3',
          assignedTo: 'Officer Martinez',
          assignedRole: 'police',
          resources: ['Police Unit', 'Tow Truck'],
          createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          updatedAt: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
        },
      ];

      this.saveLocalData('incidents', sampleIncidents);
      
      // Save sample data to Firebase if available
      for (const incident of sampleIncidents) {
        await this.saveToFirebase('incidents', incident);
      }

      console.log('Sample incidents data initialized');
    }
  }

  // Utility method to refresh Firebase connection
  async refreshFirebaseConnection() {
    this.checkFirebaseAvailability();
    
    if (this.firebaseInitialized) {
      // Sync local data with Firebase
      await this.syncWithFirebase();
    }
  }

  private async syncWithFirebase() {
    if (!this.firebaseInitialized) return;

    try {
      // Sync incidents
      const localIncidents = this.getLocalData<Incident>('incidents');
      for (const incident of localIncidents) {
        await this.saveToFirebase('incidents', incident);
      }

      // Sync missions
      const localMissions = this.getLocalData<Mission>('missions');
      for (const mission of localMissions) {
        await this.saveToFirebase('missions', mission);
      }

      console.log('Data synced with Firebase');
    } catch (error) {
      console.error('Error syncing with Firebase:', error);
    }
  }
}

// Export singleton instance
export const dataService = new DataService();
