import { useState, useEffect } from 'react';
import { 
  AnyReport, 
  ReportProblemType 
} from '@shared/api';
import {
  createReportListener,
  createStatusListener,
  createHighPriorityListener,
  createAllReportsListener
} from '@/lib/mock-reports';

/**
 * Hook to listen to reports for a specific problem type
 */
export const useReports = (problemType: ReportProblemType) => {
  const [reports, setReports] = useState<AnyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = createReportListener(
      problemType,
      (newReports) => {
        setReports(newReports);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [problemType]);

  return { reports, loading, error };
};

/**
 * Hook to listen to reports with a specific status
 */
export const useReportsByStatus = (
  problemType: ReportProblemType, 
  status: 'submitted' | 'acknowledged' | 'in-progress' | 'resolved'
) => {
  const [reports, setReports] = useState<AnyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = createStatusListener(
      problemType,
      status,
      (newReports) => {
        setReports(newReports);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [problemType, status]);

  return { reports, loading, error };
};

/**
 * Hook to listen to high-priority reports across all collections
 */
export const useHighPriorityReports = () => {
  const [reports, setReports] = useState<AnyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribeFunctions = createHighPriorityListener((newReports) => {
      setReports(newReports);
      setLoading(false);
    });

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  return { reports, loading, error };
};

/**
 * Hook to listen to all reports across all collections (for admin)
 */
export const useAllReports = () => {
  const [reportsByType, setReportsByType] = useState<{ [key in ReportProblemType]: AnyReport[] }>({
    hospital: [],
    fire: [],
    police: [],
    ambulance: [],
    general: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribeFunctions = createAllReportsListener((newReportsByType) => {
      setReportsByType(newReportsByType);
      setLoading(false);
    });

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  // Helper to get total count
  const totalReports = Object.values(reportsByType).flat().length;
  
  // Helper to get reports by status across all types
  const getReportsByStatus = (status: 'submitted' | 'acknowledged' | 'in-progress' | 'resolved') => {
    return Object.values(reportsByType).flat().filter(report => report.status === status);
  };

  // Helper to get urgent reports (high/critical severity)
  const urgentReports = Object.values(reportsByType).flat().filter(
    report => report.severity === 'high' || report.severity === 'critical'
  );

  return { 
    reportsByType, 
    totalReports,
    urgentReports,
    getReportsByStatus,
    loading, 
    error 
  };
};

/**
 * Hook for Fire Department dashboard
 */
export const useFireReports = () => {
  const { reports, loading, error } = useReports('fire');
  
  // Fire-specific metrics
  const activeIncidents = reports.filter(r => r.status === 'in-progress');
  const newIncidents = reports.filter(r => r.status === 'submitted');
  const criticalIncidents = reports.filter(r => r.severity === 'critical');
  
  return {
    reports,
    activeIncidents,
    newIncidents, 
    criticalIncidents,
    loading,
    error
  };
};

/**
 * Hook for Police Department dashboard
 */
export const usePoliceReports = () => {
  const { reports, loading, error } = useReports('police');
  
  // Police-specific metrics
  const activeReports = reports.filter(r => r.status === 'in-progress');
  const newReports = reports.filter(r => r.status === 'submitted');
  const highPriorityReports = reports.filter(r => r.severity === 'high' || r.severity === 'critical');
  
  return {
    reports,
    activeReports,
    newReports,
    highPriorityReports,
    loading,
    error
  };
};

/**
 * Hook for Ambulance/Medical dashboard
 */
export const useAmbulanceRequests = () => {
  const { reports, loading, error } = useReports('ambulance');
  
  // Medical-specific metrics
  const pendingRequests = reports.filter(r => r.status === 'submitted');
  const activeRequests = reports.filter(r => r.status === 'in-progress');
  const emergencyRequests = reports.filter(r => r.severity === 'critical');
  
  return {
    reports,
    pendingRequests,
    activeRequests,
    emergencyRequests,
    loading,
    error
  };
};

/**
 * Hook for Hospital dashboard
 */
export const useHospitalReports = () => {
  const { reports, loading, error } = useReports('hospital');
  
  // Hospital-specific metrics
  const pendingReports = reports.filter(r => r.status === 'submitted');
  const activeReports = reports.filter(r => r.status === 'in-progress');
  const urgentReports = reports.filter(r => r.severity === 'high' || r.severity === 'critical');
  
  return {
    reports,
    pendingReports,
    activeReports,
    urgentReports,
    loading,
    error
  };
};

/**
 * Hook for general user reports dashboard
 */
export const useGeneralReports = () => {
  const { reports, loading, error } = useReports('general');
  
  // General reports metrics
  const pendingReports = reports.filter(r => r.status === 'submitted');
  const resolvedReports = reports.filter(r => r.status === 'resolved');
  const activeReports = reports.filter(r => r.status === 'in-progress');
  
  return {
    reports,
    pendingReports,
    resolvedReports,
    activeReports,
    loading,
    error
  };
};

/**
 * Hook to get real-time statistics for dashboard cards
 */
export const useReportStatistics = () => {
  const { reportsByType, loading, error } = useAllReports();
  
  const stats = {
    total: Object.values(reportsByType).flat().length,
    byType: {
      fire: reportsByType.fire.length,
      police: reportsByType.police.length,
      ambulance: reportsByType.ambulance.length,
      hospital: reportsByType.hospital.length,
      general: reportsByType.general.length
    },
    byStatus: {
      submitted: Object.values(reportsByType).flat().filter(r => r.status === 'submitted').length,
      acknowledged: Object.values(reportsByType).flat().filter(r => r.status === 'acknowledged').length,
      inProgress: Object.values(reportsByType).flat().filter(r => r.status === 'in-progress').length,
      resolved: Object.values(reportsByType).flat().filter(r => r.status === 'resolved').length
    },
    bySeverity: {
      low: Object.values(reportsByType).flat().filter(r => r.severity === 'low').length,
      medium: Object.values(reportsByType).flat().filter(r => r.severity === 'medium').length,
      high: Object.values(reportsByType).flat().filter(r => r.severity === 'high').length,
      critical: Object.values(reportsByType).flat().filter(r => r.severity === 'critical').length
    }
  };
  
  return { stats, loading, error };
};
