import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Settings,
  Database,
  Zap,
  User,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
  Bug,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  devUtils,
  isDevelopmentMode,
  isUsingEmulators,
  isFirebaseAvailable,
} from "@/lib/firebase";

interface DevDebugPanelProps {
  className?: string;
}

export default function DevDebugPanel({ className = "" }: DevDebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(isDevelopmentMode());
  const [status, setStatus] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const { user, isFirebaseConnected } = useAuth();

  useEffect(() => {
    if (isDevelopmentMode()) {
      // Get initial status
      updateStatus();

      // Capture console logs for debugging
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;

      console.log = (...args) => {
        if (args[0]?.includes?.("[DEV]")) {
          setLogs((prev) => [...prev.slice(-19), args.join(" ")]);
        }
        originalLog(...args);
      };

      console.error = (...args) => {
        setLogs((prev) => [...prev.slice(-19), `ERROR: ${args.join(" ")}`]);
        originalError(...args);
      };

      console.warn = (...args) => {
        setLogs((prev) => [...prev.slice(-19), `WARN: ${args.join(" ")}`]);
        originalWarn(...args);
      };

      return () => {
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
      };
    }
  }, []);

  const updateStatus = async () => {
    if (devUtils.getStatus) {
      const newStatus = await devUtils.testConnections();
      setStatus(newStatus);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (!isDevelopmentMode() || !isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleVisibility}
          className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
        >
          <Bug className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 w-80 ${className}`}>
      <Card className="bg-slate-900 text-white border-yellow-400">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-2 cursor-pointer hover:bg-slate-800 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bug className="h-5 w-5 text-yellow-400" />
                  <CardTitle className="text-sm">Dev Debug Panel</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-yellow-400 text-yellow-400"
                  >
                    DEV
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility();
                    }}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  >
                    <EyeOff className="h-3 w-3" />
                  </Button>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="space-y-4">
              {/* Connection Status */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Connection Status
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={updateStatus}
                    className="h-6 w-6 p-0 ml-auto"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    {isFirebaseConnected ? (
                      <Wifi className="h-3 w-3 text-green-400" />
                    ) : (
                      <WifiOff className="h-3 w-3 text-red-400" />
                    )}
                    <span>Firebase</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isUsingEmulators() ? (
                      <Zap className="h-3 w-3 text-blue-400" />
                    ) : (
                      <WifiOff className="h-3 w-3 text-gray-400" />
                    )}
                    <span>Emulators</span>
                  </div>
                </div>
              </div>

              {/* Current User */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Current User
                </h4>
                {user ? (
                  <div className="text-xs bg-slate-800 p-2 rounded">
                    <div>
                      <strong>Email:</strong> {user.email}
                    </div>
                    <div>
                      <strong>Role:</strong> {user.role}
                    </div>
                    <div>
                      <strong>ID:</strong> {user.id}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400">No user logged in</div>
                )}
              </div>

              {/* System Status */}
              {status && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    System Status
                  </h4>
                  <div className="text-xs bg-slate-800 p-2 rounded space-y-1">
                    <div>
                      <strong>Mode:</strong> {status.mode}
                    </div>
                    <div>
                      <strong>Environment:</strong> {status.environment}
                    </div>
                    <div>
                      <strong>Firebase:</strong>{" "}
                      {status.firebaseInitialized ? "✅" : "❌"}
                    </div>
                    <div>
                      <strong>Emulators:</strong>{" "}
                      {status.emulatorsConnected ? "✅" : "❌"}
                    </div>
                  </div>
                </div>
              )}

              {/* Development Actions */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open("http://localhost:4000", "_blank")
                    }
                    className="text-xs h-8 bg-slate-800 border-slate-600 hover:bg-slate-700"
                  >
                    Emulator UI
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => devUtils.testConnections()}
                    className="text-xs h-8 bg-slate-800 border-slate-600 hover:bg-slate-700"
                  >
                    Test Conn.
                  </Button>
                </div>
              </div>

              {/* Debug Logs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Debug Logs</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearLogs}
                    className="text-xs h-6 px-2"
                  >
                    Clear
                  </Button>
                </div>
                <div className="text-xs bg-slate-800 p-2 rounded max-h-32 overflow-y-auto">
                  {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <div key={index} className="mb-1 font-mono">
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400">No debug logs</div>
                  )}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}
