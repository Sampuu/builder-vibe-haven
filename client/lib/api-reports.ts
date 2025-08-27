import { AnyReport, SubmitReportRequest, SubmitReportResponse, ReportProblemType } from '@shared/api';

/**
 * API client for server-side report operations
 * This provides an alternative to direct Firebase client calls
 */

const API_BASE = '/api';

/**
 * Submit a report via server API
 */
export const submitReportAPI = async (report: Omit<AnyReport, 'id' | 'timestamp' | 'status'>): Promise<string> => {
  try {
    const requestData: SubmitReportRequest = { report };
    
    const response = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data: SubmitReportResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.reportId) {
      throw new Error('No report ID returned from server');
    }

    return data.reportId;
  } catch (error) {
    console.error('Error submitting report via API:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to submit report');
  }
};

/**
 * Get reports for a specific problem type via server API
 */
export const getReportsAPI = async (
  problemType: ReportProblemType,
  options: {
    limit?: number;
    offset?: number;
    status?: 'submitted' | 'acknowledged' | 'in-progress' | 'resolved';
    severity?: 'low' | 'medium' | 'high' | 'critical';
  } = {}
): Promise<{
  reports: AnyReport[];
  total: number;
  hasMore: boolean;
}> => {
  try {
    const params = new URLSearchParams();
    
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    if (options.status) params.append('status', options.status);
    if (options.severity) params.append('severity', options.severity);

    const url = `${API_BASE}/reports/${problemType}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching reports via API:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch reports');
  }
};

/**
 * Update report status via server API
 */
export const updateReportStatusAPI = async (
  problemType: ReportProblemType,
  reportId: string,
  status: 'submitted' | 'acknowledged' | 'in-progress' | 'resolved',
  updatedBy?: string
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/reports/${problemType}/${reportId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, updatedBy }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error('Failed to update report status');
    }
  } catch (error) {
    console.error('Error updating report status via API:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update report status');
  }
};

/**
 * Utility to check if server API is available
 */
export const checkAPIHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/ping`);
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

/**
 * Hybrid submission function that tries server API first, falls back to client Firebase
 */
export const submitReportHybrid = async (
  report: Omit<AnyReport, 'id' | 'timestamp' | 'status'>,
  preferServerAPI: boolean = true
): Promise<{ reportId: string; method: 'server' | 'client' }> => {
  if (preferServerAPI) {
    try {
      // Try server API first
      const reportId = await submitReportAPI(report);
      return { reportId, method: 'server' };
    } catch (serverError) {
      console.warn('Server API submission failed, falling back to client Firebase:', serverError);
      
      // Fall back to client Firebase
      try {
        const { saveReport } = await import('./mock-reports');
        const reportId = await saveReport(report);
        return { reportId, method: 'client' };
      } catch (clientError) {
        console.error('Both server and client submission failed:', clientError);
        throw new Error('Failed to submit report via both server and client methods');
      }
    }
  } else {
    try {
      // Try client Firebase first
      const { saveReport } = await import('./mock-reports');
      const reportId = await saveReport(report);
      return { reportId, method: 'client' };
    } catch (clientError) {
      console.warn('Client Firebase submission failed, falling back to server API:', clientError);
      
      // Fall back to server API
      try {
        const reportId = await submitReportAPI(report);
        return { reportId, method: 'server' };
      } catch (serverError) {
        console.error('Both client and server submission failed:', serverError);
        throw new Error('Failed to submit report via both client and server methods');
      }
    }
  }
};
