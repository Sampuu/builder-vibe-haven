import { RequestHandler } from "express";

// In-memory storage for demo (in production, this would be a real database)
let disasterReports: any[] = [];
let helpRequests: any[] = [];

export const createDisasterReport: RequestHandler = (req, res) => {
  try {
    const reportData = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'submitted'
    };

    disasterReports.push(reportData);
    
    console.log('Disaster report created:', reportData);
    res.status(201).json({ 
      success: true, 
      id: reportData.id,
      message: 'Disaster report submitted successfully'
    });
  } catch (error) {
    console.error('Error creating disaster report:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create disaster report' 
    });
  }
};

export const getDisasterReports: RequestHandler = (req, res) => {
  try {
    const { userId } = req.query;
    
    let reports = disasterReports;
    if (userId) {
      reports = disasterReports.filter(report => report.userId === userId);
    }
    
    res.json({ 
      success: true, 
      reports: reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    });
  } catch (error) {
    console.error('Error fetching disaster reports:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch disaster reports' 
    });
  }
};

export const createHelpRequest: RequestHandler = (req, res) => {
  try {
    const requestData = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'submitted'
    };

    helpRequests.push(requestData);
    
    console.log('Help request created:', requestData);
    res.status(201).json({ 
      success: true, 
      id: requestData.id,
      message: 'Help request submitted successfully'
    });
  } catch (error) {
    console.error('Error creating help request:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create help request' 
    });
  }
};

export const getHelpRequests: RequestHandler = (req, res) => {
  try {
    const { userId } = req.query;
    
    let requests = helpRequests;
    if (userId) {
      requests = helpRequests.filter(request => request.userId === userId);
    }
    
    res.json({ 
      success: true, 
      requests: requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    });
  } catch (error) {
    console.error('Error fetching help requests:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch help requests' 
    });
  }
};

// Get all data for admin dashboard
export const getAllData: RequestHandler = (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        disasterReports: disasterReports.length,
        helpRequests: helpRequests.length,
        recentReports: disasterReports.slice(-5),
        recentRequests: helpRequests.slice(-5)
      }
    });
  } catch (error) {
    console.error('Error fetching all data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch data' 
    });
  }
};
