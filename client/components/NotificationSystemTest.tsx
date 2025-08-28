import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  TestTube, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Bell,
  Fire,
  Truck,
  Shield,
  Building2
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { createIncident, IncidentType, IncidentSeverity } from '@/lib/incident-service';
import { sendIncidentNotification, DEPARTMENT_CONTACTS, getNotificationRouting } from '@/lib/notification-service';

interface TestScenario {
  id: string;
  name: string;
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  location: string;
  expectedDepartments: string[];
}

const TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'fire-critical',
    name: 'Critical Fire Emergency',
    type: 'fire',
    severity: 'critical',
    title: 'Building Fire - Multi-Story Apartment',
    description: 'Large fire reported at residential building with people trapped on upper floors',
    location: '123 Main Street, Downtown',
    expectedDepartments: ['fire', 'admin']
  },
  {
    id: 'medical-high',
    name: 'High Priority Medical',
    type: 'medical',
    severity: 'high',
    title: 'Heart Attack - Public Location',
    description: 'Person collapsed with chest pain at shopping center',
    location: 'Central Mall, Food Court',
    expectedDepartments: ['ambulance', 'hospital', 'admin']
  },
  {
    id: 'accident-critical',
    name: 'Critical Vehicle Accident',
    type: 'accident',
    severity: 'critical',
    title: 'Multi-Vehicle Collision',
    description: 'Highway accident with multiple injuries and trapped victims',
    location: 'Interstate 95, Mile Marker 45',
    expectedDepartments: ['police', 'ambulance', 'fire', 'admin']
  },
  {
    id: 'natural-medium',
    name: 'Natural Disaster',
    type: 'natural',
    severity: 'medium',
    title: 'Flood Warning',
    description: 'Rising water levels threatening residential area',
    location: 'Riverside District',
    expectedDepartments: ['fire', 'police', 'ambulance', 'admin']
  },
  {
    id: 'police-high',
    name: 'Police Emergency',
    type: 'police',
    severity: 'high',
    title: 'Armed Suspect',
    description: 'Reports of armed individual at public location',
    location: 'City Park',
    expectedDepartments: ['police', 'admin']
  }
];

export default function NotificationSystemTest() {
  const { user } = useAuth();
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  const runSingleTest = async (scenario: TestScenario) => {
    if (!user) return;

    setTesting(true);
    const startTime = Date.now();

    try {
      console.log(`🧪 Testing scenario: ${scenario.name}`);
      console.log(`📋 Expected departments: ${scenario.expectedDepartments.join(', ')}`);

      // Step 1: Create incident
      const incident = await createIncident({
        type: scenario.type,
        severity: scenario.severity,
        status: 'submitted',
        title: scenario.title,
        description: scenario.description,
        location: scenario.location,
        reporterUserId: user.id,
        reporterName: user.name,
        reporterPhone: '+1-555-0123'
      });

      console.log(`✅ Incident created: ${incident.id}`);

      // Step 2: Send notifications
      const notification = await sendIncidentNotification(incident);
      
      console.log(`✅ Notifications sent to: ${notification.targetDepartments.join(', ')}`);

      // Step 3: Verify routing
      const expectedRouting = getNotificationRouting(scenario.type, scenario.severity);
      const actualRouting = notification.targetDepartments;
      
      const routingMatch = expectedRouting.length === actualRouting.length && 
        expectedRouting.every(dept => actualRouting.includes(dept));

      const endTime = Date.now();
      const duration = endTime - startTime;

      const testResult = {
        scenario: scenario.name,
        type: scenario.type,
        severity: scenario.severity,
        incidentId: incident.id,
        notificationId: notification.id,
        expectedDepartments: expectedRouting,
        actualDepartments: actualRouting,
        routingCorrect: routingMatch,
        duration: duration,
        timestamp: new Date().toISOString(),
        success: true
      };

      setTestResults(prev => [testResult, ...prev]);

      console.log(`✅ Test completed in ${duration}ms`);
      console.log(`📊 Routing ${routingMatch ? 'CORRECT' : 'INCORRECT'}`);
      
      return testResult;
    } catch (error) {
      console.error(`❌ Test failed:`, error);
      
      const failedResult = {
        scenario: scenario.name,
        type: scenario.type,
        severity: scenario.severity,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        success: false
      };

      setTestResults(prev => [failedResult, ...prev]);
      return failedResult;
    } finally {
      setTesting(false);
    }
  };

  const runAllTests = async () => {
    console.log('🧪 Running all notification system tests...');
    setTestResults([]);
    
    for (const scenario of TEST_SCENARIOS) {
      await runSingleTest(scenario);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('🎯 All tests completed!');
  };

  const getDepartmentIcon = (dept: string) => {
    switch (dept) {
      case 'fire': return <Fire className="h-4 w-4 text-orange-600" />;
      case 'police': return <Shield className="h-4 w-4 text-red-600" />;
      case 'ambulance': return <Truck className="h-4 w-4 text-green-600" />;
      case 'hospital': return <Building2 className="h-4 w-4 text-blue-600" />;
      case 'admin': return <Bell className="h-4 w-4 text-purple-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!user) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Please log in to test the notification system.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TestTube className="mr-2 h-5 w-5 text-blue-600" />
            Notification System Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <TestTube className="h-4 w-4" />
            <AlertDescription className="text-blue-800">
              This testing tool simulates emergency incidents and verifies that notifications are sent to the correct departments.
            </AlertDescription>
          </Alert>

          <div className="flex space-x-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Test Scenario</label>
              <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a test scenario" />
                </SelectTrigger>
                <SelectContent>
                  {TEST_SCENARIOS.map(scenario => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(scenario.severity)}>
                          {scenario.severity}
                        </Badge>
                        <span>{scenario.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-x-2">
              <Button
                onClick={() => {
                  const scenario = TEST_SCENARIOS.find(s => s.id === selectedScenario);
                  if (scenario) runSingleTest(scenario);
                }}
                disabled={!selectedScenario || testing}
                variant="outline"
              >
                {testing ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="mr-2 h-4 w-4" />
                    Run Test
                  </>
                )}
              </Button>
              
              <Button
                onClick={runAllTests}
                disabled={testing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Run All Tests
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success 
                      ? result.routingCorrect 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-orange-50 border-orange-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {result.success ? (
                        result.routingCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                        )
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="font-medium">{result.scenario}</span>
                      <Badge className={getSeverityColor(result.severity)}>
                        {result.severity}
                      </Badge>
                    </div>
                    {result.duration && (
                      <span className="text-sm text-slate-500">{result.duration}ms</span>
                    )}
                  </div>

                  {result.success ? (
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Incident ID:</span> {result.incidentId}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Notification ID:</span> {result.notificationId}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Departments Notified:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {result.actualDepartments.map((dept: string) => (
                            <Badge key={dept} variant="outline" className="flex items-center space-x-1">
                              {getDepartmentIcon(dept)}
                              <span>{DEPARTMENT_CONTACTS[dept]?.name || dept}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className={`font-medium ${result.routingCorrect ? 'text-green-700' : 'text-orange-700'}`}>
                          Routing: {result.routingCorrect ? 'CORRECT' : 'MISMATCH'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-red-700">
                      <span className="font-medium">Error:</span> {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
