import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';

export default function FirebaseConfigTool() {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  });

  const currentConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'Not set',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'Not set',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Not set',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'Not set',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'Not set',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || 'Not set'
  };

  const isDemoMode = import.meta.env.VITE_FIREBASE_PROJECT_ID === 'demo-project';

  const generateEnvContent = () => {
    return `# Firebase Configuration
VITE_FIREBASE_API_KEY=${config.apiKey}
VITE_FIREBASE_AUTH_DOMAIN=${config.authDomain}
VITE_FIREBASE_PROJECT_ID=${config.projectId}
VITE_FIREBASE_STORAGE_BUCKET=${config.storageBucket}
VITE_FIREBASE_MESSAGING_SENDER_ID=${config.messagingSenderId}
VITE_FIREBASE_APP_ID=${config.appId}`;
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfigChange = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const parseFirebaseConfig = (configText: string) => {
    try {
      // Try to extract config from Firebase console copy-paste
      const lines = configText.split('\n');
      const newConfig = { ...config };
      
      lines.forEach(line => {
        if (line.includes('apiKey:')) {
          newConfig.apiKey = line.split('"')[1] || line.split("'")[1] || '';
        } else if (line.includes('authDomain:')) {
          newConfig.authDomain = line.split('"')[1] || line.split("'")[1] || '';
        } else if (line.includes('projectId:')) {
          newConfig.projectId = line.split('"')[1] || line.split("'")[1] || '';
        } else if (line.includes('storageBucket:')) {
          newConfig.storageBucket = line.split('"')[1] || line.split("'")[1] || '';
        } else if (line.includes('messagingSenderId:')) {
          newConfig.messagingSenderId = line.split('"')[1] || line.split("'")[1] || '';
        } else if (line.includes('appId:')) {
          newConfig.appId = line.split('"')[1] || line.split("'")[1] || '';
        }
      });
      
      setConfig(newConfig);
    } catch (error) {
      console.error('Failed to parse config:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Firebase Config
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Firebase Configuration</DialogTitle>
          <DialogDescription>
            Set up your Firebase project connection
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">Current Config</TabsTrigger>
            <TabsTrigger value="setup">Setup New</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Configuration</CardTitle>
                <CardDescription>
                  {isDemoMode ? 'Currently using demo mode' : 'Current Firebase project settings'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(currentConfig).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="font-medium text-sm">{key}:</span>
                    <span className="text-sm text-slate-600 truncate max-w-xs">
                      {value.length > 40 ? `${value.substring(0, 40)}...` : value}
                    </span>
                  </div>
                ))}
                {isDemoMode && (
                  <Alert className="mt-4">
                    <AlertDescription>
                      You are currently in demo mode. Set up a real Firebase project to enable cloud functionality.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="setup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Firebase Configuration</CardTitle>
                <CardDescription>
                  Enter your Firebase project configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="configPaste">Paste Firebase Config (Optional)</Label>
                  <textarea
                    id="configPaste"
                    className="w-full p-2 border rounded-md text-sm"
                    rows={6}
                    placeholder="Paste your firebaseConfig object from Firebase console here..."
                    onChange={(e) => parseFirebaseConfig(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(config).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>{key}</Label>
                      <Input
                        id={key}
                        value={value}
                        onChange={(e) => handleConfigChange(key, e.target.value)}
                        placeholder={`Enter ${key}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Environment Variables</Label>
                  <div className="relative">
                    <pre className="bg-slate-100 p-3 rounded-md text-sm overflow-x-auto">
                      {generateEnvContent()}
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(generateEnvContent())}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Alert>
                  <RefreshCw className="h-4 w-4" />
                  <AlertDescription>
                    After updating environment variables, restart your development server for changes to take effect.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Setup Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">1</div>
                    <div>
                      <h4 className="font-medium">Create Firebase Project</h4>
                      <p className="text-sm text-slate-600">Go to Firebase Console and create a new project</p>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto"
                        onClick={() => window.open('https://console.firebase.google.com', '_blank')}
                      >
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Open Firebase Console
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">2</div>
                    <div>
                      <h4 className="font-medium">Enable Authentication</h4>
                      <p className="text-sm text-slate-600">Enable Email/Password sign-in method</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">3</div>
                    <div>
                      <h4 className="font-medium">Create Firestore Database</h4>
                      <p className="text-sm text-slate-600">Set up Firestore in test mode</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">4</div>
                    <div>
                      <h4 className="font-medium">Get Web App Config</h4>
                      <p className="text-sm text-slate-600">Add a web app and copy the configuration</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">5</div>
                    <div>
                      <h4 className="font-medium">Update Environment Variables</h4>
                      <p className="text-sm text-slate-600">Use the "Setup New" tab to generate the environment variables</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">6</div>
                    <div>
                      <h4 className="font-medium">Restart Server</h4>
                      <p className="text-sm text-slate-600">Restart your development server to apply changes</p>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>Note:</strong> The signup and signin pages will automatically switch from offline mode to Firebase mode once proper credentials are configured.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
