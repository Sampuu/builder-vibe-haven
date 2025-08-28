// API client for communicating with the backend server
import {
  CreateIncidentRequest,
  CreateIncidentResponse,
  GetIncidentsResponse,
  UpdateIncidentStatusRequest,
  UpdateIncidentStatusResponse,
  AcknowledgeIncidentRequest,
  AcknowledgeIncidentResponse,
  GetNotificationsResponse,
  BroadcastNewsRequest,
  BroadcastNewsResponse,
  UserRole,
  Incident,
  Notification
} from '@shared/types';

const API_BASE_URL = '/api';

// Utility function for making API requests
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

// Incident API methods
export const incidentAPI = {
  async create(incidentData: CreateIncidentRequest): Promise<CreateIncidentResponse> {
    return apiRequest<CreateIncidentResponse>('/incidents', {
      method: 'POST',
      body: JSON.stringify(incidentData),
    });
  },

  async getAll(): Promise<GetIncidentsResponse> {
    return apiRequest<GetIncidentsResponse>('/incidents?all=true');
  },

  async getForDepartment(department: UserRole): Promise<GetIncidentsResponse> {
    return apiRequest<GetIncidentsResponse>(`/incidents?department=${department}`);
  },

  async getForUser(userId: string): Promise<GetIncidentsResponse> {
    return apiRequest<GetIncidentsResponse>(`/incidents?userId=${userId}`);
  },

  async getById(incidentId: string): Promise<{ success: boolean; incident: Incident }> {
    return apiRequest<{ success: boolean; incident: Incident }>(`/incidents/${incidentId}`);
  },

  async updateStatus(incidentId: string, status: Incident['status'], updatedBy: { userId: string; role: UserRole }): Promise<UpdateIncidentStatusResponse> {
    const requestData: UpdateIncidentStatusRequest = {
      incidentId,
      status,
      updatedBy,
    };

    return apiRequest<UpdateIncidentStatusResponse>(`/incidents/${incidentId}/status`, {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
  },

  async acknowledge(incidentId: string, department: UserRole, acknowledgedBy: { userId: string; role: UserRole }): Promise<AcknowledgeIncidentResponse> {
    const requestData: AcknowledgeIncidentRequest = {
      incidentId,
      department,
      acknowledgedBy,
    };

    return apiRequest<AcknowledgeIncidentResponse>(`/incidents/${incidentId}/acknowledge`, {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
  },

  async getStats(): Promise<{ success: boolean; stats: { total: number; active: number; resolved: number; critical: number } }> {
    return apiRequest<{ success: boolean; stats: { total: number; active: number; resolved: number; critical: number } }>('/incidents/stats');
  },

  async getRecent(limit: number = 10): Promise<{ success: boolean; incidents: Incident[] }> {
    return apiRequest<{ success: boolean; incidents: Incident[] }>(`/incidents/recent?limit=${limit}`);
  },
};

// Notification API methods
export const notificationAPI = {
  async getForUser(userRole: UserRole): Promise<GetNotificationsResponse> {
    return apiRequest<GetNotificationsResponse>(`/notifications?userRole=${userRole}`);
  },

  async getAll(): Promise<GetNotificationsResponse> {
    return apiRequest<GetNotificationsResponse>('/notifications?all=true');
  },

  async markAsRead(notificationId: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  async markAllAsRead(userRole: UserRole): Promise<{ success: boolean; message: string; markedCount: number }> {
    return apiRequest<{ success: boolean; message: string; markedCount: number }>('/notifications/mark-all-read', {
      method: 'PUT',
      body: JSON.stringify({ userRole }),
    });
  },

  async delete(notificationId: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },

  async clearAll(userRole: UserRole): Promise<{ success: boolean; message: string; deletedCount: number }> {
    return apiRequest<{ success: boolean; message: string; deletedCount: number }>('/notifications/clear', {
      method: 'DELETE',
      body: JSON.stringify({ userRole }),
    });
  },

  async broadcastNews(newsData: BroadcastNewsRequest): Promise<BroadcastNewsResponse> {
    return apiRequest<BroadcastNewsResponse>('/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(newsData),
    });
  },

  async sendTargeted(
    title: string,
    message: string,
    type: 'emergency' | 'warning' | 'info' | 'success',
    priority: 'high' | 'medium' | 'low',
    category: 'incident' | 'system' | 'update' | 'alert' | 'news',
    targetRoles: UserRole[],
    relatedIncidentId?: string
  ): Promise<{ success: boolean; notificationId: string; message: string }> {
    return apiRequest<{ success: boolean; notificationId: string; message: string }>('/notifications/targeted', {
      method: 'POST',
      body: JSON.stringify({
        title,
        message,
        type,
        priority,
        category,
        targetRoles,
        relatedIncidentId,
      }),
    });
  },

  async getConnectedClients(): Promise<{ success: boolean; clientCount: number; clients: any[] }> {
    return apiRequest<{ success: boolean; clientCount: number; clients: any[] }>('/notifications/clients');
  },
};

// Server-Sent Events for real-time notifications
export class SSEClient {
  private eventSource: EventSource | null = null;
  private userRole: UserRole;
  private userId: string;
  private onNotification?: (notification: Notification) => void;
  private onIncidentUpdate?: (incident: Incident) => void;
  private onConnection?: () => void;
  private onError?: (error: Event) => void;

  constructor(
    userRole: UserRole,
    userId: string,
    callbacks: {
      onNotification?: (notification: Notification) => void;
      onIncidentUpdate?: (incident: Incident) => void;
      onConnection?: () => void;
      onError?: (error: Event) => void;
    }
  ) {
    this.userRole = userRole;
    this.userId = userId;
    this.onNotification = callbacks.onNotification;
    this.onIncidentUpdate = callbacks.onIncidentUpdate;
    this.onConnection = callbacks.onConnection;
    this.onError = callbacks.onError;
  }

  connect(): void {
    if (this.eventSource) {
      this.disconnect();
    }

    const url = `${API_BASE_URL}/notifications/sse?userRole=${this.userRole}&userId=${this.userId}`;
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      console.log('📡 SSE connection established');
      this.onConnection?.();
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'connection') {
          console.log('✅ SSE connection confirmed:', data.message);
          return;
        }

        if (data.type === 'heartbeat') {
          // Heartbeat received, connection is alive
          return;
        }

        if (data.type === 'notification' && this.onNotification) {
          this.onNotification(data.data);
        }

        if (data.type === 'incident_update' && this.onIncidentUpdate) {
          this.onIncidentUpdate(data.data);
        }
      } catch (error) {
        console.error('❌ Error parsing SSE message:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('❌ SSE connection error:', error);
      this.onError?.(error);
    };
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('📡 SSE connection closed');
    }
  }

  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }
}

// Health check
export const healthAPI = {
  async ping(): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/ping');
  },
};
