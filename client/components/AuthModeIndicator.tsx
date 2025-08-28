import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Database, Cloud } from 'lucide-react';
import { isFirebaseConfigured, getConfigStatus } from '@/lib/firebase-config';
import { isFirebaseAvailable } from '@/lib/firebase';

interface AuthModeIndicatorProps {
  showOnlyIfFallback?: boolean;
}

export default function AuthModeIndicator({ showOnlyIfFallback = false }: AuthModeIndicatorProps) {
  const [authMode, setAuthMode] = useState<'firebase' | 'fallback' | 'loading'>('loading');
  const [configStatus, setConfigStatus] = useState<any>(null);

  useEffect(() => {
    const checkAuthMode = () => {
      const configured = isFirebaseConfigured();
      const available = isFirebaseAvailable();
      const status = getConfigStatus();
      
      setConfigStatus(status);
      
      if (configured && available) {
        setAuthMode('firebase');
      } else {
        setAuthMode('fallback');
      }
    };

    checkAuthMode();
  }, []);

  if (authMode === 'loading') {
    return null;
  }

  if (showOnlyIfFallback && authMode === 'firebase') {
    return null;
  }

  const isFirebaseMode = authMode === 'firebase';

  return (
    <Alert className={`mb-4 ${isFirebaseMode ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
      <div className="flex items-center">
        {isFirebaseMode ? (
          <Cloud className="h-4 w-4 text-green-600" />
        ) : (
          <Database className="h-4 w-4 text-blue-600" />
        )}
        <AlertDescription className="ml-2">
          {isFirebaseMode ? (
            <span className="text-green-800">
              <strong>🔥 Firebase Mode:</strong> Your account data is securely stored in Firebase.
            </span>
          ) : (
            <span className="text-blue-800">
              <strong>📱 Demo Mode:</strong> Using local storage. Your data is only saved in this browser.
              <br />
              <span className="text-sm mt-1 block">
                To use Firebase, add your Firebase configuration to the .env file. 
                <a 
                  href="/FIREBASE_SETUP.md" 
                  target="_blank" 
                  className="underline ml-1 hover:text-blue-900"
                >
                  See setup guide
                </a>
              </span>
            </span>
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
}

// Debug component for development
export function AuthModeDebug() {
  const [configStatus, setConfigStatus] = useState<any>(null);

  useEffect(() => {
    setConfigStatus(getConfigStatus());
  }, []);

  if (!configStatus || process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <details className="mt-4 p-3 bg-gray-100 rounded text-xs">
      <summary className="cursor-pointer font-medium">🔧 Auth Debug Info (Dev Only)</summary>
      <pre className="mt-2 whitespace-pre-wrap">
        {JSON.stringify(configStatus, null, 2)}
      </pre>
    </details>
  );
}
