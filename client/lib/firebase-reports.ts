import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where, 
  Timestamp,
  QuerySnapshot,
  DocumentData,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase-safe';
import { 
  AnyReport, 
  ReportProblemType, 
  getCollectionName,
  HospitalReport,
  FireReport,
  PoliceReport,
  AmbulanceRequest,
  GeneralUserReport
} from '@shared/api';

/**
 * Save a report to the appropriate Firestore collection based on problem type
 */
export const saveReport = async (report: Omit<AnyReport, 'id' | 'timestamp' | 'status'>): Promise<string> => {
  try {
    // Determine the correct collection name based on problem type
    const collectionName = getCollectionName(report.problemType);
    
    // Create the complete report object
    const completeReport: Omit<AnyReport, 'id'> = {
      ...report,
      status: 'submitted',
      timestamp: new Date().toISOString(),
    };

    // Add the document to the appropriate collection
    const docRef = await addDoc(collection(db, collectionName), completeReport);
    
    console.log(`Report saved to ${collectionName} with ID:`, docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving report:', error);
    throw new Error('Failed to save report. Please try again.');
  }
};

/**
 * Create a real-time listener for a specific report collection
 */
export const createReportListener = (
  problemType: ReportProblemType,
  callback: (reports: AnyReport[]) => void,
  orderByField: 'timestamp' | 'severity' = 'timestamp',
  orderDirection: 'asc' | 'desc' = 'desc'
): Unsubscribe => {
  const collectionName = getCollectionName(problemType);
  const q = query(
    collection(db, collectionName),
    orderBy(orderByField, orderDirection)
  );

  return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
    const reports: AnyReport[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp || new Date().toISOString()
      } as AnyReport);
    });
    callback(reports);
  }, (error) => {
    console.error(`Error listening to ${collectionName}:`, error);
  });
};

/**
 * Create a listener for reports with specific status
 */
export const createStatusListener = (
  problemType: ReportProblemType,
  status: 'submitted' | 'acknowledged' | 'in-progress' | 'resolved',
  callback: (reports: AnyReport[]) => void
): Unsubscribe => {
  const collectionName = getCollectionName(problemType);
  const q = query(
    collection(db, collectionName),
    where('status', '==', status),
    orderBy('timestamp', 'desc')
  );

  return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
    const reports: AnyReport[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp || new Date().toISOString()
      } as AnyReport);
    });
    callback(reports);
  }, (error) => {
    console.error(`Error listening to ${collectionName} with status ${status}:`, error);
  });
};

/**
 * Create a listener for high-priority reports across all collections
 */
export const createHighPriorityListener = (
  callback: (reports: AnyReport[]) => void
): Unsubscribe[] => {
  const unsubscribeFunctions: Unsubscribe[] = [];
  const allReports: { [key: string]: AnyReport[] } = {};

  // Listen to all collection types for high-priority reports
  const problemTypes: ReportProblemType[] = ['hospital', 'fire', 'police', 'ambulance', 'general'];
  
  problemTypes.forEach((problemType) => {
    const collectionName = getCollectionName(problemType);
    const q = query(
      collection(db, collectionName),
      where('severity', 'in', ['high', 'critical']),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const reports: AnyReport[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reports.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp || new Date().toISOString()
        } as AnyReport);
      });
      
      allReports[problemType] = reports;
      
      // Combine all high-priority reports and sort by timestamp
      const combinedReports = Object.values(allReports)
        .flat()
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      callback(combinedReports);
    }, (error) => {
      console.error(`Error listening to high-priority reports in ${collectionName}:`, error);
    });

    unsubscribeFunctions.push(unsubscribe);
  });

  return unsubscribeFunctions;
};

/**
 * Create listeners for all report types (for admin dashboard)
 */
export const createAllReportsListener = (
  callback: (reportsByType: { [key in ReportProblemType]: AnyReport[] }) => void
): Unsubscribe[] => {
  const unsubscribeFunctions: Unsubscribe[] = [];
  const reportsByType: { [key in ReportProblemType]: AnyReport[] } = {
    hospital: [],
    fire: [],
    police: [],
    ambulance: [],
    general: []
  };

  const problemTypes: ReportProblemType[] = ['hospital', 'fire', 'police', 'ambulance', 'general'];
  
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
export const createHospitalReport = (data: Omit<HospitalReport, 'id' | 'timestamp' | 'status' | 'problemType'>): Omit<HospitalReport, 'id' | 'timestamp' | 'status'> => ({
  ...data,
  problemType: 'hospital'
});

export const createFireReport = (data: Omit<FireReport, 'id' | 'timestamp' | 'status' | 'problemType'>): Omit<FireReport, 'id' | 'timestamp' | 'status'> => ({
  ...data,
  problemType: 'fire'
});

export const createPoliceReport = (data: Omit<PoliceReport, 'id' | 'timestamp' | 'status' | 'problemType'>): Omit<PoliceReport, 'id' | 'timestamp' | 'status'> => ({
  ...data,
  problemType: 'police'
});

export const createAmbulanceRequest = (data: Omit<AmbulanceRequest, 'id' | 'timestamp' | 'status' | 'problemType'>): Omit<AmbulanceRequest, 'id' | 'timestamp' | 'status'> => ({
  ...data,
  problemType: 'ambulance'
});

export const createGeneralUserReport = (data: Omit<GeneralUserReport, 'id' | 'timestamp' | 'status' | 'problemType'>): Omit<GeneralUserReport, 'id' | 'timestamp' | 'status'> => ({
  ...data,
  problemType: 'general'
});

/**
 * Utility function to map legacy report types to new problem types
 */
export const mapLegacyTypeToProbleType = (legacyType: string): ReportProblemType => {
  switch (legacyType) {
    case 'fire':
      return 'fire';
    case 'medical':
      return 'ambulance';
    case 'accident':
      return 'police';
    case 'natural':
      return 'general';
    default:
      return 'general';
  }
};
