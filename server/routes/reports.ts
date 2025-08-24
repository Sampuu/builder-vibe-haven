import { RequestHandler } from "express";

interface DisasterReport {
  id: string;
  type: 'fire' | 'medical' | 'accident' | 'natural' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  contactName: string;
  contactPhone: string;
  images?: string[];
  status: 'submitted' | 'acknowledged' | 'in-progress' | 'resolved';
  timestamp: string;
}

// In-memory storage for demo (in real app, use database)
const reports: DisasterReport[] = [];

export const handleCreateReport: RequestHandler = async (req, res) => {
  try {
    const report: DisasterReport = {
      id: `report-${Date.now()}`,
      ...req.body,
      status: 'submitted',
      timestamp: new Date().toISOString(),
    };

    // Validate required fields
    if (!report.type || !report.title || !report.description || !report.location || !report.contactPhone) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['type', 'title', 'description', 'location', 'contactPhone']
      });
    }

    // Store the report (in real app, save to database)
    reports.push(report);

    console.log(`📋 New ${report.severity} ${report.type} report:`, {
      id: report.id,
      title: report.title,
      location: report.location,
      timestamp: report.timestamp
    });

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    res.status(201).json({
      success: true,
      reportId: report.id,
      message: 'Emergency report submitted successfully',
      estimatedResponse: '5-15 minutes'
    });

  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      error: 'Failed to submit report',
      message: 'Please try again or contact emergency services directly'
    });
  }
};

export const handleGetReports: RequestHandler = (req, res) => {
  const { status, type, severity } = req.query;
  
  let filteredReports = [...reports];
  
  if (status) filteredReports = filteredReports.filter(r => r.status === status);
  if (type) filteredReports = filteredReports.filter(r => r.type === type);
  if (severity) filteredReports = filteredReports.filter(r => r.severity === severity);
  
  res.json({
    reports: filteredReports.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ),
    total: filteredReports.length
  });
};

export const handleGetReport: RequestHandler = (req, res) => {
  const { id } = req.params;
  const report = reports.find(r => r.id === id);
  
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  
  res.json({ report });
};
