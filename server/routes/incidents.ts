import { RequestHandler } from "express";
import { 
  CreateIncidentRequest, 
  CreateIncidentResponse,
  GetIncidentsResponse,
  UpdateIncidentStatusRequest,
  UpdateIncidentStatusResponse,
  AcknowledgeIncidentRequest,
  AcknowledgeIncidentResponse,
  UserRole
} from "../../shared/types";
import { 
  createIncident, 
  getIncidentsForDepartment, 
  getUserIncidents,
  getAllIncidents,
  updateIncidentStatus,
  acknowledgeIncident,
  getIncidentById,
  getIncidentStats,
  getRecentIncidents
} from "../database/store";
import { 
  sendIncidentNotification, 
  sendIncidentStatusNotification, 
  sendIncidentAcknowledgmentNotification 
} from "../services/notificationService";

// POST /api/incidents - Create new incident
export const handleCreateIncident: RequestHandler = async (req, res) => {
  try {
    const incidentData: CreateIncidentRequest = req.body;

    // Validate required fields
    if (!incidentData.type || !incidentData.category || !incidentData.title || !incidentData.description || !incidentData.location || !incidentData.reporter) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Create incident in database
    const incident = createIncident({
      type: incidentData.type,
      category: incidentData.category,
      urgency: incidentData.urgency,
      title: incidentData.title,
      description: incidentData.description,
      location: incidentData.location,
      coordinates: incidentData.coordinates,
      reporter: incidentData.reporter,
      priority: incidentData.urgency, // Map urgency to priority
      metadata: incidentData.metadata,
    });

    // Send notifications to relevant departments
    sendIncidentNotification(incident);

    const response: CreateIncidentResponse = {
      success: true,
      incidentId: incident.id,
      assignedDepartments: incident.assignedDepartments,
      message: `Incident created successfully. Notified departments: ${incident.assignedDepartments.join(', ')}`
    };

    console.log(`✅ Created incident ${incident.id}: ${incident.title}`);
    res.status(201).json(response);
  } catch (error) {
    console.error("❌ Error creating incident:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// GET /api/incidents?department=police&userId=123 - Get incidents
export const handleGetIncidents: RequestHandler = async (req, res) => {
  try {
    const { department, userId, all } = req.query;
    let incidents;

    if (all === 'true') {
      // Admin can get all incidents
      incidents = getAllIncidents();
    } else if (department) {
      // Get incidents for specific department
      incidents = getIncidentsForDepartment(department as UserRole);
    } else if (userId) {
      // Get incidents for specific user
      incidents = getUserIncidents(userId as string);
    } else {
      return res.status(400).json({
        success: false,
        message: "Must specify department, userId, or all=true"
      });
    }

    const response: GetIncidentsResponse = {
      success: true,
      incidents
    };

    res.json(response);
  } catch (error) {
    console.error("❌ Error getting incidents:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// GET /api/incidents/:id - Get specific incident
export const handleGetIncident: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const incident = getIncidentById(id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found"
      });
    }

    res.json({
      success: true,
      incident
    });
  } catch (error) {
    console.error("❌ Error getting incident:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// PUT /api/incidents/:id/status - Update incident status
export const handleUpdateIncidentStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData: UpdateIncidentStatusRequest = req.body;

    if (!updateData.status || !updateData.updatedBy) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: status, updatedBy"
      });
    }

    const incident = updateIncidentStatus(id, updateData.status);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found"
      });
    }

    // Send status update notifications
    sendIncidentStatusNotification(incident, updateData.updatedBy);

    const response: UpdateIncidentStatusResponse = {
      success: true,
      incident,
      message: `Incident status updated to: ${updateData.status.replace('_', ' ')}`
    };

    console.log(`✅ Updated incident ${id} status to: ${updateData.status}`);
    res.json(response);
  } catch (error) {
    console.error("❌ Error updating incident status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// PUT /api/incidents/:id/acknowledge - Acknowledge incident
export const handleAcknowledgeIncident: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const acknowledgeData: AcknowledgeIncidentRequest = req.body;

    if (!acknowledgeData.department || !acknowledgeData.acknowledgedBy) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: department, acknowledgedBy"
      });
    }

    const incident = acknowledgeIncident(id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found"
      });
    }

    // Send acknowledgment notifications
    sendIncidentAcknowledgmentNotification(incident, acknowledgeData.department);

    const response: AcknowledgeIncidentResponse = {
      success: true,
      incident,
      message: `Incident acknowledged by ${acknowledgeData.department}`
    };

    console.log(`✅ Incident ${id} acknowledged by ${acknowledgeData.department}`);
    res.json(response);
  } catch (error) {
    console.error("❌ Error acknowledging incident:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// GET /api/incidents/stats - Get incident statistics
export const handleGetIncidentStats: RequestHandler = async (req, res) => {
  try {
    const stats = getIncidentStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("❌ Error getting incident stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// GET /api/incidents/recent?limit=10 - Get recent incidents
export const handleGetRecentIncidents: RequestHandler = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const incidents = getRecentIncidents(limit);
    
    res.json({
      success: true,
      incidents
    });
  } catch (error) {
    console.error("❌ Error getting recent incidents:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
