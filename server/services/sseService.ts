// Server-Sent Events service for real-time notifications
import { Response } from "express";
import { SSEEvent } from "../../shared/types";

interface SSEClient {
  id: string;
  response: Response;
  userRole: string;
  userId: string;
  connectedAt: Date;
}

// Store connected SSE clients
const sseClients: Map<string, SSEClient> = new Map();

export function addSSEClient(clientId: string, response: Response, userRole: string, userId: string): void {
  const client: SSEClient = {
    id: clientId,
    response,
    userRole,
    userId,
    connectedAt: new Date(),
  };

  sseClients.set(clientId, client);

  // Setup SSE headers
  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  // Send initial connection confirmation
  response.write(`data: ${JSON.stringify({ 
    type: 'connection', 
    message: 'Connected to notification stream',
    timestamp: new Date().toISOString()
  })}\n\n`);

  // Handle client disconnect
  response.on('close', () => {
    sseClients.delete(clientId);
    console.log(`📱 SSE client ${clientId} (${userRole}) disconnected`);
  });

  console.log(`📱 SSE client ${clientId} (${userRole}) connected`);
}

export function removeSSEClient(clientId: string): void {
  const client = sseClients.get(clientId);
  if (client) {
    client.response.end();
    sseClients.delete(clientId);
    console.log(`📱 SSE client ${clientId} removed`);
  }
}

export function notifyClients(event: SSEEvent): void {
  const eventData = JSON.stringify(event);
  let notifiedCount = 0;

  sseClients.forEach((client) => {
    try {
      // Check if notification should be sent to this client
      if (shouldSendNotificationToClient(event, client)) {
        client.response.write(`data: ${eventData}\n\n`);
        notifiedCount++;
      }
    } catch (error) {
      console.error(`❌ Error sending SSE to client ${client.id}:`, error);
      // Remove broken client connection
      sseClients.delete(client.id);
    }
  });

  if (notifiedCount > 0) {
    console.log(`📡 Sent SSE event to ${notifiedCount} clients: ${event.type}`);
  }
}

function shouldSendNotificationToClient(event: SSEEvent, client: SSEClient): boolean {
  if (event.type === 'incident_update') {
    // Send incident updates to assigned departments and admin
    const incident = event.data;
    return client.userRole === 'admin' || 
           incident.assignedDepartments.includes(client.userRole as any) ||
           incident.reporter.id === client.userId;
  }

  if (event.type === 'notification') {
    const notification = event.data;
    
    // If no target roles specified, send to all users (global notifications like news)
    if (!notification.targetRoles || notification.targetRoles.length === 0) {
      return true;
    }
    
    // If user is admin, send all notifications
    if (client.userRole === 'admin') {
      return true;
    }
    
    // Send only if user's role is in target roles
    return notification.targetRoles.includes(client.userRole as any);
  }

  return false;
}

export function getConnectedClients(): Array<{ id: string; userRole: string; userId: string; connectedAt: Date }> {
  return Array.from(sseClients.values()).map(client => ({
    id: client.id,
    userRole: client.userRole,
    userId: client.userId,
    connectedAt: client.connectedAt,
  }));
}

export function getClientCount(): number {
  return sseClients.size;
}

export function getClientCountByRole(): Record<string, number> {
  const counts: Record<string, number> = {};
  
  sseClients.forEach(client => {
    counts[client.userRole] = (counts[client.userRole] || 0) + 1;
  });
  
  return counts;
}

// Send heartbeat to keep connections alive
export function sendHeartbeat(): void {
  const heartbeatEvent = {
    type: 'heartbeat',
    timestamp: new Date().toISOString()
  };

  sseClients.forEach((client) => {
    try {
      client.response.write(`data: ${JSON.stringify(heartbeatEvent)}\n\n`);
    } catch (error) {
      console.error(`❌ Error sending heartbeat to client ${client.id}:`, error);
      sseClients.delete(client.id);
    }
  });
}

// Setup heartbeat interval (every 30 seconds)
setInterval(sendHeartbeat, 30000);

// Cleanup disconnected clients periodically
setInterval(() => {
  const now = Date.now();
  const timeout = 5 * 60 * 1000; // 5 minutes

  sseClients.forEach((client, clientId) => {
    if (now - client.connectedAt.getTime() > timeout) {
      try {
        client.response.write(`data: ${JSON.stringify({ type: 'timeout' })}\n\n`);
        client.response.end();
      } catch (error) {
        // Client already disconnected
      }
      sseClients.delete(clientId);
      console.log(`🧹 Cleaned up stale SSE client ${clientId}`);
    }
  });
}, 60000); // Check every minute
