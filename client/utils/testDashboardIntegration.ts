// Utility to test dashboard integration functionality
import { dashboardService } from '@/lib/dashboardService';

export function testDashboardIntegration() {
  console.log('🧪 Testing Dashboard Integration...');
  
  // Test connection status
  const connectionStatus = dashboardService.getConnectionStatus();
  console.log('📊 Connection Status:', connectionStatus);
  
  // Test user info
  const currentUser = dashboardService.getCurrentUser();
  console.log('👤 Current User:', currentUser);
  
  // Test event broadcasting
  const testEvent = {
    type: 'test_event',
    data: {
      message: 'Dashboard integration test',
      timestamp: new Date().toISOString()
    }
  };
  
  dashboardService.broadcastEvent('test_event', testEvent.data);
  console.log('📡 Test event broadcasted:', testEvent);
  
  // Test backup request functionality
  if (currentUser) {
    const testBackupRequest = {
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterRole: currentUser.role,
      targetRole: 'ambulance' as const,
      reason: 'Integration test - please ignore',
      priority: 'low' as const
    };
    
    // Don't actually send the test request to avoid spam
    console.log('🚨 Test backup request prepared (not sent):', testBackupRequest);
  }
  
  return {
    connectionStatus,
    currentUser,
    isIntegrationWorking: connectionStatus === 'connected' && currentUser !== null
  };
}

// Function to demonstrate cross-dashboard communication
export function demonstrateRealTimeUpdates() {
  console.log('🔄 Demonstrating real-time updates...');
  
  // Simulate incident creation
  const mockIncident = {
    id: `test-${Date.now()}`,
    title: 'Test Emergency Incident',
    type: 'fire',
    status: 'pending',
    priority: 'medium',
    location: 'Test Location',
    description: 'This is a test incident for dashboard integration',
    timestamp: new Date().toISOString()
  };
  
  dashboardService.broadcastEvent('incident_created', mockIncident);
  console.log('🔥 Mock incident broadcasted:', mockIncident);
  
  // Simulate status update after 2 seconds
  setTimeout(() => {
    const updatedIncident = {
      ...mockIncident,
      status: 'in-progress',
      assignedTo: 'Fire Unit 1',
      timestamp: new Date().toISOString()
    };
    
    dashboardService.broadcastEvent('incident_updated', updatedIncident);
    console.log('📋 Mock incident updated:', updatedIncident);
  }, 2000);
  
  // Simulate resolution after 5 seconds
  setTimeout(() => {
    const resolvedIncident = {
      ...mockIncident,
      status: 'resolved',
      timestamp: new Date().toISOString()
    };
    
    dashboardService.broadcastEvent('incident_updated', resolvedIncident);
    console.log('✅ Mock incident resolved:', resolvedIncident);
  }, 5000);
}

// Add to window for easy testing in browser console
if (typeof window !== 'undefined') {
  (window as any).testDashboardIntegration = testDashboardIntegration;
  (window as any).demonstrateRealTimeUpdates = demonstrateRealTimeUpdates;
  (window as any).dashboardService = dashboardService;
}
