// Backend API service for when Firebase is not available
import { DisasterReport, HelpRequest } from './firestore';

const API_BASE = '/api';

export const backendDisasterService = {
  async create(report: Omit<DisasterReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const response = await fetch(`${API_BASE}/disasters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(report),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create disaster report');
    }

    return result.id;
  },

  async getAll(): Promise<DisasterReport[]> {
    const response = await fetch(`${API_BASE}/disasters`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch disaster reports');
    }

    return result.reports || [];
  },

  async getByUser(userId: string): Promise<DisasterReport[]> {
    const response = await fetch(`${API_BASE}/disasters?userId=${encodeURIComponent(userId)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch user disaster reports');
    }

    return result.reports || [];
  },

  async updateStatus(id: string, status: DisasterReport['status'], assignedTo?: string): Promise<void> {
    // This would be implemented when we add update endpoints
    console.log('Backend updateStatus not implemented yet:', { id, status, assignedTo });
  }
};

export const backendHelpService = {
  async create(request: Omit<HelpRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const response = await fetch(`${API_BASE}/help-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create help request');
    }

    return result.id;
  },

  async getAll(): Promise<HelpRequest[]> {
    const response = await fetch(`${API_BASE}/help-requests`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch help requests');
    }

    return result.requests || [];
  },

  async getByUser(userId: string): Promise<HelpRequest[]> {
    const response = await fetch(`${API_BASE}/help-requests?userId=${encodeURIComponent(userId)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch user help requests');
    }

    return result.requests || [];
  }
};

// Test backend connectivity
export const testBackend = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/ping`);
    return response.ok;
  } catch (error) {
    console.error('Backend test failed:', error);
    return false;
  }
};
