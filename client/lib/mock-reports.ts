import {
  AnyReport,
  ReportProblemType,
  getCollectionName,
  HospitalReport,
  FireReport,
  PoliceReport,
  AmbulanceRequest,
  GeneralUserReport,
} from "@shared/api";

// Mock reports storage key
const REPORTS_STORAGE_KEY = "mock_reports";

// Helper to generate simple IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Report listeners
const reportListeners: { [key: string]: (reports: AnyReport[]) => void } = {};

// Get reports from localStorage
const getStoredReports = (): Record<string, AnyReport[]> => {
  try {
    const stored = localStorage.getItem(REPORTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Save reports to localStorage
const saveReports = (reports: Record<string, AnyReport[]>) => {
  try {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  } catch (error) {
    console.warn("Failed to save reports to localStorage:", error);
  }
};

// Notify listeners for a specific collection
const notifyListeners = (collectionName: string) => {
  const reports = getStoredReports();
  const collectionReports = reports[collectionName] || [];

  Object.keys(reportListeners).forEach((listenerId) => {
    if (listenerId.startsWith(collectionName)) {
      reportListeners[listenerId](collectionReports);
    }
  });
};

/**
 * Save a report to the appropriate collection based on problem type
 */
export const saveReport = async (
  report: Omit<AnyReport, "id" | "timestamp" | "status">,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Determine the correct collection name based on problem type
        const collectionName = getCollectionName(report.problemType);

        // Create the complete report object
        const reportId = generateId();
        const completeReport: AnyReport = {
          ...report,
          id: reportId,
          status: "submitted",
          timestamp: new Date().toISOString(),
        } as AnyReport;

        // Get existing reports
        const allReports = getStoredReports();
        if (!allReports[collectionName]) {
          allReports[collectionName] = [];
        }

        // Add the new report
        allReports[collectionName].push(completeReport);

        // Save back to storage
        saveReports(allReports);

        console.log(
          `Mock report saved to ${collectionName} with ID:`,
          reportId,
        );

        // Notify listeners
        notifyListeners(collectionName);

        resolve(reportId);
      } catch (error) {
        console.error("Error saving mock report:", error);
        reject(new Error("Failed to save report. Please try again."));
      }
    }, 300); // Simulate network delay
  });
};

/**
 * Create a real-time listener for a specific report collection
 */
export const createReportListener = (
  problemType: ReportProblemType,
  callback: (reports: AnyReport[]) => void,
  orderByField: "timestamp" | "severity" = "timestamp",
  orderDirection: "asc" | "desc" = "desc",
): (() => void) => {
  const collectionName = getCollectionName(problemType);
  const listenerId = `${collectionName}_${Date.now()}_${Math.random()}`;

  // Store the callback
  reportListeners[listenerId] = (reports: AnyReport[]) => {
    // Sort reports based on the specified criteria
    const sortedReports = [...reports].sort((a, b) => {
      let aValue, bValue;

      if (orderByField === "timestamp") {
        aValue = new Date(a.timestamp).getTime();
        bValue = new Date(b.timestamp).getTime();
      } else if (orderByField === "severity") {
        const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
        aValue = severityOrder[a.severity as keyof typeof severityOrder] || 0;
        bValue = severityOrder[b.severity as keyof typeof severityOrder] || 0;
      } else {
        aValue = 0;
        bValue = 0;
      }

      return orderDirection === "desc" ? bValue - aValue : aValue - bValue;
    });

    callback(sortedReports);
  };

  // Initial data load
  const reports = getStoredReports();
  const collectionReports = reports[collectionName] || [];
  reportListeners[listenerId](collectionReports);

  // Return unsubscribe function
  return () => {
    delete reportListeners[listenerId];
  };
};

/**
 * Create a listener for reports with specific status
 */
export const createStatusListener = (
  problemType: ReportProblemType,
  status: "submitted" | "acknowledged" | "in-progress" | "resolved",
  callback: (reports: AnyReport[]) => void,
): (() => void) => {
  const collectionName = getCollectionName(problemType);
  const listenerId = `${collectionName}_status_${status}_${Date.now()}_${Math.random()}`;

  reportListeners[listenerId] = (reports: AnyReport[]) => {
    const filteredReports = reports.filter(
      (report) => report.status === status,
    );
    const sortedReports = filteredReports.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    callback(sortedReports);
  };

  // Initial data load
  const reports = getStoredReports();
  const collectionReports = reports[collectionName] || [];
  reportListeners[listenerId](collectionReports);

  return () => {
    delete reportListeners[listenerId];
  };
};

/**
 * Create a listener for high-priority reports across all collections
 */
export const createHighPriorityListener = (
  callback: (reports: AnyReport[]) => void,
): (() => void)[] => {
  const unsubscribeFunctions: (() => void)[] = [];
  const allReports: { [key: string]: AnyReport[] } = {};

  const problemTypes: ReportProblemType[] = [
    "hospital",
    "fire",
    "police",
    "ambulance",
    "general",
  ];

  problemTypes.forEach((problemType) => {
    const unsubscribe = createReportListener(problemType, (reports) => {
      // Filter for high priority reports
      const highPriorityReports = reports.filter(
        (report) =>
          report.severity === "high" || report.severity === "critical",
      );

      allReports[problemType] = highPriorityReports;

      // Combine all high-priority reports and sort by timestamp
      const combinedReports = Object.values(allReports)
        .flat()
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );

      callback(combinedReports);
    });

    unsubscribeFunctions.push(unsubscribe);
  });

  return unsubscribeFunctions;
};

/**
 * Create listeners for all report types (for admin dashboard)
 */
export const createAllReportsListener = (
  callback: (reportsByType: {
    [key in ReportProblemType]: AnyReport[];
  }) => void,
): (() => void)[] => {
  const unsubscribeFunctions: (() => void)[] = [];
  const reportsByType: { [key in ReportProblemType]: AnyReport[] } = {
    hospital: [],
    fire: [],
    police: [],
    ambulance: [],
    general: [],
  };

  const problemTypes: ReportProblemType[] = [
    "hospital",
    "fire",
    "police",
    "ambulance",
    "general",
  ];

  problemTypes.forEach((problemType) => {
    const unsubscribe = createReportListener(problemType, (reports) => {
      reportsByType[problemType] = reports;
      callback({ ...reportsByType });
    });
    unsubscribeFunctions.push(unsubscribe);
  });

  return unsubscribeFunctions;
};

/**
 * Type-safe report creation helpers
 */
export const createHospitalReport = (
  data: Omit<HospitalReport, "id" | "timestamp" | "status" | "problemType">,
): Omit<HospitalReport, "id" | "timestamp" | "status"> => ({
  ...data,
  problemType: "hospital",
});

export const createFireReport = (
  data: Omit<FireReport, "id" | "timestamp" | "status" | "problemType">,
): Omit<FireReport, "id" | "timestamp" | "status"> => ({
  ...data,
  problemType: "fire",
});

export const createPoliceReport = (
  data: Omit<PoliceReport, "id" | "timestamp" | "status" | "problemType">,
): Omit<PoliceReport, "id" | "timestamp" | "status"> => ({
  ...data,
  problemType: "police",
});

export const createAmbulanceRequest = (
  data: Omit<AmbulanceRequest, "id" | "timestamp" | "status" | "problemType">,
): Omit<AmbulanceRequest, "id" | "timestamp" | "status"> => ({
  ...data,
  problemType: "ambulance",
});

export const createGeneralUserReport = (
  data: Omit<GeneralUserReport, "id" | "timestamp" | "status" | "problemType">,
): Omit<GeneralUserReport, "id" | "timestamp" | "status"> => ({
  ...data,
  problemType: "general",
});

/**
 * Utility function to map legacy report types to new problem types
 */
export const mapLegacyTypeToProbleType = (
  legacyType: string,
): ReportProblemType => {
  switch (legacyType) {
    case "fire":
      return "fire";
    case "medical":
      return "ambulance";
    case "accident":
      return "police";
    case "natural":
      return "general";
    default:
      return "general";
  }
};
