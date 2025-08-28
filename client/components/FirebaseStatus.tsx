import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, CloudOff, Settings, ExternalLink } from 'lucide-react';
import { checkFirebaseAvailability, getFirebaseAvailability } from '@/lib/serviceDetector';

export default function FirebaseStatus() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      setIsChecking(true);
      const available = await checkFirebaseAvailability();
      setIsOnline(available);
      setIsChecking(false);
    };

    checkStatus();
  }, []);

  const isDemoMode = import.meta.env.VITE_FIREBASE_PROJECT_ID === 'demo-project';

  if (isChecking) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin h-4 w-4 border-2 border-slate-300 border-t-slate-600 rounded-full"></div>
        <span className="text-sm text-slate-600">Checking Firebase...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Badge */}
      <div className="flex items-center space-x-2">
        {isOnline ? (
          <>
            <Cloud className="h-4 w-4 text-green-600" />
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
              Firebase Connected
            </Badge>
          </>
        ) : (
          <>
            <CloudOff className="h-4 w-4 text-orange-600" />
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-300">
              Offline Mode
            </Badge>
          </>
        )}
      </div>

      {/* Demo Mode Alert */}
      {isDemoMode && (
        <Alert className="border-orange-200 bg-orange-50">
          <Settings className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p><strong>Demo Mode Active:</strong> Using offline storage for demonstration.</p>
              <p>To connect to real Firebase:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Create a Firebase project</li>
                <li>Enable Authentication & Firestore</li>
                <li>Update environment variables</li>
                <li>Restart the server</li>
              </ol>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open('/FIREBASE_SETUP.md', '_blank')}
                className="mt-2"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Setup Guide
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Status Details */}
      <Card className="bg-slate-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Connection Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Mode:</span>
              <span className="font-medium">
                {isOnline ? 'Firebase Cloud' : 'Local Storage'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Authentication:</span>
              <span className="font-medium">
                {isOnline ? 'Firebase Auth' : 'Simulated'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Database:</span>
              <span className="font-medium">
                {isOnline ? 'Firestore' : 'LocalStorage'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Real-time:</span>
              <span className="font-medium">
                {isOnline ? 'WebSocket' : 'Polling'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
