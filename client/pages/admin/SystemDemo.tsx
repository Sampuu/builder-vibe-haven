import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Play,
  Users,
  Database,
  Route,
  Bell,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Copy,
  TestTube,
  Settings
} from 'lucide-react';
import { 
  DemoAccountService, 
  DEMO_CREDENTIALS, 
  setupDemoEnvironment 
} from '@/lib/demo-account-service';
import { EmergencyRoutingService } from '@/lib/emergency-routing-service';
import { RealTimeNotificationService } from '@/lib/real-time-notification-service';
import { useRoleBasedFirebase } from '@/contexts/RoleBasedFirebaseContext';

interface DemoStatus {
  accounts: {
    created: boolean;
    total: number;
    success: number;
    failed: number;
  };
  routing: {
    tested: boolean;
    successful: number;
    failed: number;
  };
  notifications: {
    active: boolean;
    sent: number;
    received: number;
  };
}

export default function SystemDemo() {
  const navigate = useNavigate();
  const { user, getUserRole, isAdmin } = useRoleBasedFirebase();
  const [isSetupRunning, setIsSetupRunning] = useState(false);
  const [setupResult, setSetupResult] = useState<any>(null);
  const [demoStatus, setDemoStatus] = useState<DemoStatus>({
    accounts: { created: false, total: 6, success: 0, failed: 0 },
    routing: { tested: false, successful: 0, failed: 0 },
    notifications: { active: false, sent: 0, received: 0 }
  });
  const [testResults, setTestResults] = useState<any[]>([]);

  // Check if user has admin access
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard/user');
    }
  }, [isAdmin, navigate]);

  const runFullDemoSetup = async () => {
    setIsSetupRunning(true);
    setTestResults([]);

    try {
      // Step 1: Create demo accounts
      addTestResult('Creating demo accounts...', 'info');
      const accountResult = await DemoAccountService.createAllDemoAccounts();
      
      setDemoStatus(prev => ({
        ...prev,
        accounts: {
          created: accountResult.success,
          total: 6,
          success: accountResult.created.length,
          failed: accountResult.failed.length
        }
      }));

      if (accountResult.success) {
        addTestResult(`✅ Successfully created ${accountResult.created.length} demo accounts`, 'success');
      } else {
        addTestResult(`⚠️ Created ${accountResult.created.length} accounts, ${accountResult.failed.length} failed`, 'warning');
      }

      // Step 2: Test emergency routing
      addTestResult('Testing emergency routing system...', 'info');
      await testEmergencyRouting();

      // Step 3: Test notification system
      addTestResult('Testing notification system...', 'info');
      await testNotificationSystem();

      // Step 4: Final status
      addTestResult('🎉 Demo setup completed successfully!', 'success');
      setSetupResult({
        success: true,
        message: 'Demo environment is ready for presentation',
        accounts: Object.values(DEMO_CREDENTIALS)
      });

    } catch (error) {
      addTestResult(`❌ Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      setSetupResult({
        success: false,
        message: 'Demo setup failed'
      });
    } finally {
      setIsSetupRunning(false);
    }
  };

  const testEmergencyRouting = async () => {
    let successful = 0;
    let failed = 0;

    const testCases = [
      { type: 'fire', expectedTargets: ['fireBrigade'] },
      { type: 'medical', expectedTargets: ['hospital', 'ambulance'] },
      { type: 'traffic_accident', expectedTargets: ['police', 'ambulance'] },
      { type: 'flood', expectedTargets: ['fireBrigade', 'police'] },
      { type: 'earthquake', expectedTargets: ['police', 'fireBrigade', 'ambulance', 'hospital'] },
      { type: 'other', expectedTargets: ['admin'] }
    ];

    for (const testCase of testCases) {
      try {
        const config = EmergencyRoutingService.getRoutingConfiguration(testCase.type as any);
        const actualTargets = EmergencyRoutingService.getTargetRoles(testCase.type as any);
        
        const isCorrect = testCase.expectedTargets.every(target => actualTargets.includes(target));
        
        if (isCorrect) {
          successful++;
          addTestResult(`✅ ${testCase.type} → ${actualTargets.join(', ')}`, 'success');
        } else {
          failed++;
          addTestResult(`❌ ${testCase.type} routing mismatch`, 'error');
        }
      } catch (error) {
        failed++;
        addTestResult(`❌ ${testCase.type} routing error`, 'error');
      }
    }

    setDemoStatus(prev => ({
      ...prev,
      routing: { tested: true, successful, failed }
    }));

    addTestResult(`Emergency routing test: ${successful}/${successful + failed} passed`, successful === testCases.length ? 'success' : 'warning');
  };

  const testNotificationSystem = async () => {
    try {
      // Send test notifications to all roles
      const roles = ['user', 'police', 'ambulance', 'fireBrigade', 'hospital', 'admin'];
      await RealTimeNotificationService.sendTestNotification(roles);
      
      setDemoStatus(prev => ({
        ...prev,
        notifications: { active: true, sent: roles.length, received: 0 }
      }));

      addTestResult(`✅ Test notifications sent to ${roles.length} roles`, 'success');
    } catch (error) {
      addTestResult(`❌ Notification test failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const addTestResult = (message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const copyCredentials = () => {
    const credentialsText = Object.values(DEMO_CREDENTIALS)
      .map(cred => `${cred.role.toUpperCase()}: ${cred.email} / ${cred.password}`)
      .join('\n');
    
    navigator.clipboard.writeText(credentialsText);
    addTestResult('📋 Demo credentials copied to clipboard', 'info');
  };

  const testLogin = async (credentials: typeof DEMO_CREDENTIALS.USER) => {
    try {
      addTestResult(`Testing login for ${credentials.role}...`, 'info');
      const result = await DemoAccountService.testDemoLogin(credentials.email, credentials.password);
      
      if (result.success) {
        addTestResult(`✅ ${credentials.role} login successful`, 'success');
        // Sign out immediately after test
        await import('firebase/auth').then(({ signOut }) => signOut(import('../lib/firebase').then(f => f.auth)));
      } else {
        addTestResult(`❌ ${credentials.role} login failed: ${result.error}`, 'error');
      }
    } catch (error) {
      addTestResult(`❌ ${credentials.role} login error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <TestTube className="mr-3 h-8 w-8 text-blue-600" />
              Role-Based Emergency System Demo
            </h1>
            <p className="text-slate-600">
              Complete testing and demonstration environment for the 6-role emergency management system
            </p>
          </div>
          <Button 
            onClick={runFullDemoSetup}
            disabled={isSetupRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSetupRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting Up...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Full Demo Setup
              </>
            )}
          </Button>
        </div>

        {/* Demo Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Demo Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{demoStatus.accounts.success}/{demoStatus.accounts.total}</div>
                  <div className="text-xs text-slate-500">Accounts Created</div>
                </div>
                {demoStatus.accounts.created ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-slate-400" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Route className="mr-2 h-4 w-4" />
                Emergency Routing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{demoStatus.routing.successful}/{demoStatus.routing.successful + demoStatus.routing.failed}</div>
                  <div className="text-xs text-slate-500">Tests Passed</div>
                </div>
                {demoStatus.routing.tested ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-slate-400" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{demoStatus.notifications.sent}</div>
                  <div className="text-xs text-slate-500">Test Notifications</div>
                </div>
                {demoStatus.notifications.active ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-slate-400" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different demo sections */}
        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="accounts">Demo Accounts</TabsTrigger>
            <TabsTrigger value="routing">Emergency Routing</TabsTrigger>
            <TabsTrigger value="testing">System Testing</TabsTrigger>
            <TabsTrigger value="logs">Test Results</TabsTrigger>
          </TabsList>

          {/* Demo Accounts Tab */}
          <TabsContent value="accounts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Demo Account Credentials</CardTitle>
                <CardDescription>
                  Use these accounts to test different role dashboards and functionality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {Object.values(DEMO_CREDENTIALS).map(cred => (
                    <div key={cred.role} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="capitalize">
                          {cred.role.replace('Brigade', ' Brigade')}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => testLogin(cred)}
                        >
                          Test Login
                        </Button>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div><strong>Email:</strong> {cred.email}</div>
                        <div><strong>Password:</strong> {cred.password}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={copyCredentials} variant="outline" className="w-full">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy All Credentials
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emergency Routing Tab */}
          <TabsContent value="routing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Type Routing Rules</CardTitle>
                <CardDescription>
                  How different emergency types are automatically routed to role collections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'fire', icon: '🔥', targets: ['Fire Brigade'] },
                    { type: 'medical', icon: '🚑', targets: ['Hospital', 'Ambulance'] },
                    { type: 'traffic_accident', icon: '🚗', targets: ['Police', 'Ambulance'] },
                    { type: 'flood', icon: '🌊', targets: ['Fire Brigade', 'Police'] },
                    { type: 'earthquake', icon: '🌍', targets: ['Police', 'Fire Brigade', 'Ambulance', 'Hospital'] },
                    { type: 'other', icon: '⚠️', targets: ['Admin'] }
                  ].map(emergency => (
                    <div key={emergency.type} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{emergency.icon}</span>
                        <div>
                          <div className="font-medium capitalize">{emergency.type.replace('_', ' ')}</div>
                          <div className="text-sm text-slate-500">Emergency Type</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {emergency.targets.map(target => (
                          <Badge key={target} variant="secondary">
                            {target}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Testing Tab */}
          <TabsContent value="testing" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Database Collections</CardTitle>
                  <CardDescription>Test role-based database access</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['users', 'police', 'ambulance', 'fireBrigade', 'hospital', 'admin'].map(collection => (
                      <div key={collection} className="flex items-center justify-between p-2 border rounded">
                        <span className="capitalize">{collection.replace('Brigade', ' Brigade')}</span>
                        <Badge variant="outline">Ready</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Real-time Features</CardTitle>
                  <CardDescription>Test notification and live updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => testNotificationSystem()} 
                      variant="outline" 
                      className="w-full"
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      Send Test Notifications
                    </Button>
                    <Button 
                      onClick={() => testEmergencyRouting()} 
                      variant="outline" 
                      className="w-full"
                    >
                      <Route className="mr-2 h-4 w-4" />
                      Test Emergency Routing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Test Results Tab */}
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Results & Logs</CardTitle>
                <CardDescription>
                  Real-time feedback from system tests and setup procedures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {testResults.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">
                      <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No test results yet. Run the demo setup to see logs.</p>
                    </div>
                  ) : (
                    testResults.map(result => (
                      <div key={result.id} className={`p-3 rounded-lg border-l-4 ${
                        result.type === 'success' ? 'bg-green-50 border-green-500' :
                        result.type === 'error' ? 'bg-red-50 border-red-500' :
                        result.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                        'bg-blue-50 border-blue-500'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{result.message}</span>
                          <span className="text-xs text-slate-500">{result.timestamp}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Setup Result */}
        {setupResult && (
          <Alert className={setupResult.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{setupResult.success ? 'Success' : 'Error'}:</strong> {setupResult.message}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  );
}
