import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Database, Key } from 'lucide-react';
import { auth, db } from '@/config/firebase';
import { firebaseAuth } from '@/lib/firebase-auth';
import { collection, addDoc } from 'firebase/firestore';

export default function FirebaseDebug() {
  const [configStatus, setConfigStatus] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [authStatus, setAuthStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [firestoreStatus, setFirestoreStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isCreatingTestUser, setIsCreatingTestUser] = useState(false);

  useEffect(() => {
    checkFirebaseConfig();
    checkAuthConnection();
    checkFirestoreConnection();
  }, []);

  const checkFirebaseConfig = () => {
    setConfigStatus('checking');
    
    const requiredEnvVars = [
      'VITE_PUBLIC_FIREBASE_API_KEY',
      'VITE_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'VITE_PUBLIC_FIREBASE_PROJECT_ID',
      'VITE_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_PUBLIC_FIREBASE_APP_ID'
    ];

    const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
    
    if (missingVars.length > 0) {
      setConfigStatus('invalid');
      addTestResult(`❌ Missing environment variables: ${missingVars.join(', ')}`);
    } else {
      setConfigStatus('valid');
      addTestResult('✅ All Firebase environment variables are configured');
    }
  };

  const checkAuthConnection = async () => {
    setAuthStatus('checking');
    try {
      // Try to get current auth state
      const currentUser = auth.currentUser;
      addTestResult(`🔐 Auth instance created successfully. Current user: ${currentUser ? currentUser.email : 'none'}`);
      setAuthStatus('connected');
    } catch (error) {
      addTestResult(`❌ Auth connection failed: ${error}`);
      setAuthStatus('error');
    }
  };

  const checkFirestoreConnection = async () => {
    setFirestoreStatus('checking');
    try {
      // Try to reference a collection (doesn't actually query)
      const testCollection = collection(db, 'test');
      addTestResult('🗄️ Firestore instance created successfully');
      setFirestoreStatus('connected');
    } catch (error) {
      addTestResult(`❌ Firestore connection failed: ${error}`);
      setFirestoreStatus('error');
    }
  };

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const createTestUser = async () => {
    setIsCreatingTestUser(true);
    addTestResult('🧪 Creating test user...');
    
    try {
      const result = await firebaseAuth.signup({
        email: 'test@rescue.com',
        password: 'test123',
        name: 'Test User',
        role: 'user'
      });

      if (result.success) {
        addTestResult('✅ Test user created successfully!');
        addTestResult(`📧 Email: test@rescue.com | Password: test123`);
      } else {
        addTestResult(`❌ Failed to create test user: ${result.error}`);
      }
    } catch (error) {
      addTestResult(`❌ Error creating test user: ${error}`);
    } finally {
      setIsCreatingTestUser(false);
    }
  };

  const testLogin = async () => {
    addTestResult('🔑 Testing login...');
    
    try {
      const result = await firebaseAuth.login({
        email: 'test@rescue.com',
        password: 'test123'
      });

      if (result.success) {
        addTestResult('✅ Login test successful!');
        addTestResult(`👤 Logged in as: ${result.data?.name} (${result.data?.email})`);
      } else {
        addTestResult(`❌ Login test failed: ${result.error}`);
      }
    } catch (error) {
      addTestResult(`❌ Login test error: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800">✓ Connected</Badge>;
      case 'invalid':
      case 'error':
        return <Badge variant="destructive">✗ Error</Badge>;
      default:
        return <Badge variant="secondary">⏳ Checking...</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Firebase Debug Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Key className="h-6 w-6 text-blue-500 mb-2" />
                    <p className="text-sm font-medium">Configuration</p>
                  </div>
                  {getStatusBadge(configStatus)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
                    <p className="text-sm font-medium">Authentication</p>
                  </div>
                  {getStatusBadge(authStatus)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Database className="h-6 w-6 text-purple-500 mb-2" />
                    <p className="text-sm font-medium">Firestore</p>
                  </div>
                  {getStatusBadge(firestoreStatus)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <Button onClick={createTestUser} disabled={isCreatingTestUser} size="sm">
                {isCreatingTestUser ? '⏳ Creating...' : '👤 Create Test User'}
              </Button>
              <Button onClick={testLogin} size="sm" variant="outline">
                🔑 Test Login
              </Button>
              <Button onClick={clearResults} size="sm" variant="ghost">
                🗑️ Clear Results
              </Button>
            </div>
          </div>

          {testResults.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <strong>Debug Results:</strong>
                  {testResults.map((result, index) => (
                    <div key={index} className="text-xs font-mono">{result}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Debug Info:</strong> This component helps diagnose Firebase connectivity issues. 
              Use it to test configuration, create test users, and verify authentication flow.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
