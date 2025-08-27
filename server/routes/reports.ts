import { RequestHandler } from "express";
import { adminDb } from "../lib/firebase-admin";
import { 
  SubmitReportRequest, 
  SubmitReportResponse, 
  AnyReport,
  getCollectionName,
  ReportProblemType
} from "@shared/api";

/**
 * Validate report data before submission
 */
const validateReportData = (report: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields validation
  if (!report.title?.trim()) errors.push('Title is required');
  if (!report.description?.trim()) errors.push('Description is required');
  if (!report.location?.trim()) errors.push('Location is required');
  if (!report.contactPhone?.trim()) errors.push('Contact phone is required');
  if (!report.problemType) errors.push('Problem type is required');
  if (!report.severity) errors.push('Severity is required');

  // Problem type validation
  const validProblemTypes: ReportProblemType[] = ['hospital', 'fire', 'police', 'ambulance', 'general'];
  if (report.problemType && !validProblemTypes.includes(report.problemType)) {
    errors.push('Invalid problem type');
  }

  // Severity validation
  const validSeverities = ['low', 'medium', 'high', 'critical'];
  if (report.severity && !validSeverities.includes(report.severity)) {
    errors.push('Invalid severity level');
  }

  // Basic sanitization
  if (report.title && report.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }
  
  if (report.description && report.description.length > 2000) {
    errors.push('Description must be less than 2000 characters');
  }

  if (report.contactPhone && !/^[\+]?[\d\s\-\(\)]{7,15}$/.test(report.contactPhone)) {
    errors.push('Invalid phone number format');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Sanitize report data
 */
const sanitizeReportData = (report: any) => {
  return {
    ...report,
    title: report.title?.trim(),
    description: report.description?.trim(),
    location: report.location?.trim(),
    contactName: report.contactName?.trim() || '',
    contactPhone: report.contactPhone?.trim(),
    images: Array.isArray(report.images) ? report.images.slice(0, 10) : [] // Limit to 10 images
  };
};

/**
 * Submit a report to the appropriate Firestore collection
 */
export const handleSubmitReport: RequestHandler = async (req, res) => {
  try {
    const { report } = req.body as SubmitReportRequest;

    if (!report) {
      const response: SubmitReportResponse = {
        success: false,
        error: 'Report data is required'
      };
      return res.status(400).json(response);
    }

    // Validate the report data
    const { isValid, errors } = validateReportData(report);
    if (!isValid) {
      const response: SubmitReportResponse = {
        success: false,
        error: `Validation failed: ${errors.join(', ')}`
      };
      return res.status(400).json(response);
    }

    // Sanitize the data
    const sanitizedReport = sanitizeReportData(report);

    // Determine the collection based on problem type
    const collectionName = getCollectionName(report.problemType);

    // Create the complete report object
    const completeReport: Omit<AnyReport, 'id'> = {
      ...sanitizedReport,
      status: 'submitted',
      timestamp: new Date().toISOString(),
    };

    // Save to Firestore using Admin SDK
    const docRef = await adminDb.collection(collectionName).add(completeReport);

    console.log(`Report saved to ${collectionName} with ID: ${docRef.id}`);

    // Return success response
    const response: SubmitReportResponse = {
      success: true,
      reportId: docRef.id
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Error submitting report:', error);
    
    const response: SubmitReportResponse = {
      success: false,
      error: 'Internal server error. Please try again later.'
    };
    
    res.status(500).json(response);
  }
};

/**
 * Get reports for a specific problem type (with pagination)
 */
export const handleGetReports: RequestHandler = async (req, res) => {
  try {
    const { problemType } = req.params;
    const { limit = '50', offset = '0', status, severity } = req.query;

    // Validate problem type
    const validProblemTypes: ReportProblemType[] = ['hospital', 'fire', 'police', 'ambulance', 'general'];
    if (!validProblemTypes.includes(problemType as ReportProblemType)) {
      return res.status(400).json({ error: 'Invalid problem type' });
    }

    const collectionName = getCollectionName(problemType as ReportProblemType);
    let query = adminDb.collection(collectionName).orderBy('timestamp', 'desc');

    // Add filters if provided
    if (status) {
      query = query.where('status', '==', status);
    }
    if (severity) {
      query = query.where('severity', '==', severity);
    }

    // Add pagination
    const limitNum = Math.min(parseInt(limit as string) || 50, 100); // Max 100 items
    const offsetNum = parseInt(offset as string) || 0;
    
    if (offsetNum > 0) {
      query = query.offset(offsetNum);
    }
    query = query.limit(limitNum);

    const snapshot = await query.get();
    const reports: AnyReport[] = [];

    snapshot.forEach(doc => {
      reports.push({
        id: doc.id,
        ...doc.data()
      } as AnyReport);
    });

    res.json({
      reports,
      total: reports.length,
      hasMore: reports.length === limitNum
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update report status (for emergency responders)
 */
export const handleUpdateReportStatus: RequestHandler = async (req, res) => {
  try {
    const { problemType, reportId } = req.params;
    const { status, updatedBy } = req.body;

    // Validate inputs
    const validStatuses = ['submitted', 'acknowledged', 'in-progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const validProblemTypes: ReportProblemType[] = ['hospital', 'fire', 'police', 'ambulance', 'general'];
    if (!validProblemTypes.includes(problemType as ReportProblemType)) {
      return res.status(400).json({ error: 'Invalid problem type' });
    }

    const collectionName = getCollectionName(problemType as ReportProblemType);
    
    // Update the document
    await adminDb.collection(collectionName).doc(reportId).update({
      status,
      lastUpdated: new Date().toISOString(),
      ...(updatedBy && { updatedBy })
    });

    console.log(`Report ${reportId} status updated to ${status} in ${collectionName}`);

    res.json({ success: true });

  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
