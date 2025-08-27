import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Database,
  Users,
  AlertTriangle,
  Heart,
  Newspaper,
  Activity,
  CheckCircle,
  Clock,
} from "lucide-react";
import { firebaseDb } from "@/lib/firebase-db";
import type {
  User,
  DisasterReport,
  HelpRequest,
  NewsUpdate,
  Incident,
} from "@shared/types";

interface ConnectionStatus {
  users: boolean;
  disasterReports: boolean;
  helpRequests: boolean;
  newsUpdates: boolean;
  incidents: boolean;
}

export default function FirebaseRealTimeDemo() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    users: false,
    disasterReports: false,
    helpRequests: false,
    newsUpdates: false,
    incidents: false,
  });

  const [stats, setStats] = useState({
    users: 0,
    disasterReports: 0,
    helpRequests: 0,
    newsUpdates: 0,
    incidents: 0,
  });

  // Test real-time connections
  useEffect(() => {
    let unsubscribers: (() => void)[] = [];

    const setupListeners = () => {
      try {
        // Users listener
        const unsubUsers = firebaseDb.users.subscribeToUsers((users) => {
          setStats((prev) => ({ ...prev, users: users.length }));
          setConnectionStatus((prev) => ({ ...prev, users: true }));
        });
        unsubscribers.push(unsubUsers);

        // Disaster Reports listener
        const unsubReports = firebaseDb.disasterReports.subscribeToReports(
          (reports) => {
            setStats((prev) => ({ ...prev, disasterReports: reports.length }));
            setConnectionStatus((prev) => ({ ...prev, disasterReports: true }));
          },
        );
        unsubscribers.push(unsubReports);

        // Help Requests listener
        const unsubHelp = firebaseDb.helpRequests.subscribeToHelpRequests(
          (requests) => {
            setStats((prev) => ({ ...prev, helpRequests: requests.length }));
            setConnectionStatus((prev) => ({ ...prev, helpRequests: true }));
          },
        );
        unsubscribers.push(unsubHelp);

        // News Updates listener
        const unsubNews = firebaseDb.news.subscribeToNews((news) => {
          setStats((prev) => ({ ...prev, newsUpdates: news.length }));
          setConnectionStatus((prev) => ({ ...prev, newsUpdates: true }));
        });
        unsubscribers.push(unsubNews);

        // Incidents listener
        const unsubIncidents = firebaseDb.incidents.subscribeToIncidents(
          (incidents) => {
            setStats((prev) => ({ ...prev, incidents: incidents.length }));
            setConnectionStatus((prev) => ({ ...prev, incidents: true }));
          },
        );
        unsubscribers.push(unsubIncidents);

        setIsConnected(true);
      } catch (error) {
        console.error("Failed to setup Firebase listeners:", error);
      }
    };

    setupListeners();

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  const allConnected = Object.values(connectionStatus).every(
    (status) => status,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Firebase Real-Time Integration Status
          </CardTitle>
          <CardDescription>
            Live monitoring of Firebase Firestore collections and real-time
            listeners
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert
            className={`${allConnected ? "border-green-500 bg-green-50" : "border-yellow-500 bg-yellow-50"}`}
          >
            <Activity className="h-4 w-4" />
            <AlertDescription className="flex items-center gap-2">
              {allConnected ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  All Firebase collections are connected and synchronized
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-yellow-600" />
                  Establishing connections to Firebase collections...
                </>
              )}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Users Collection */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Users className="h-8 w-8 text-blue-500 mb-2" />
                    <p className="text-sm font-medium">Users</p>
                    <p className="text-2xl font-bold">{stats.users}</p>
                  </div>
                  <Badge
                    variant={connectionStatus.users ? "default" : "secondary"}
                  >
                    {connectionStatus.users ? "Live" : "Connecting"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Disaster Reports Collection */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
                    <p className="text-sm font-medium">Reports</p>
                    <p className="text-2xl font-bold">
                      {stats.disasterReports}
                    </p>
                  </div>
                  <Badge
                    variant={
                      connectionStatus.disasterReports ? "default" : "secondary"
                    }
                  >
                    {connectionStatus.disasterReports ? "Live" : "Connecting"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Help Requests Collection */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Heart className="h-8 w-8 text-pink-500 mb-2" />
                    <p className="text-sm font-medium">Help Requests</p>
                    <p className="text-2xl font-bold">{stats.helpRequests}</p>
                  </div>
                  <Badge
                    variant={
                      connectionStatus.helpRequests ? "default" : "secondary"
                    }
                  >
                    {connectionStatus.helpRequests ? "Live" : "Connecting"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* News Updates Collection */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Newspaper className="h-8 w-8 text-green-500 mb-2" />
                    <p className="text-sm font-medium">News</p>
                    <p className="text-2xl font-bold">{stats.newsUpdates}</p>
                  </div>
                  <Badge
                    variant={
                      connectionStatus.newsUpdates ? "default" : "secondary"
                    }
                  >
                    {connectionStatus.newsUpdates ? "Live" : "Connecting"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Incidents Collection */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Activity className="h-8 w-8 text-orange-500 mb-2" />
                    <p className="text-sm font-medium">Incidents</p>
                    <p className="text-2xl font-bold">{stats.incidents}</p>
                  </div>
                  <Badge
                    variant={
                      connectionStatus.incidents ? "default" : "secondary"
                    }
                  >
                    {connectionStatus.incidents ? "Live" : "Connecting"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Collection Details:</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>
                  <strong>users</strong> - User authentication profiles and
                  roles
                </span>
                <Badge
                  variant={connectionStatus.users ? "default" : "secondary"}
                  size="sm"
                >
                  {connectionStatus.users ? "🟢 Connected" : "🟡 Connecting"}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>
                  <strong>disasterReports</strong> - All disaster report
                  submissions
                </span>
                <Badge
                  variant={
                    connectionStatus.disasterReports ? "default" : "secondary"
                  }
                  size="sm"
                >
                  {connectionStatus.disasterReports
                    ? "🟢 Connected"
                    : "🟡 Connecting"}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>
                  <strong>helpRequests</strong> - All help or SOS requests
                </span>
                <Badge
                  variant={
                    connectionStatus.helpRequests ? "default" : "secondary"
                  }
                  size="sm"
                >
                  {connectionStatus.helpRequests
                    ? "🟢 Connected"
                    : "🟡 Connecting"}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>
                  <strong>newsUpdates</strong> - All news, alerts, and
                  announcements
                </span>
                <Badge
                  variant={
                    connectionStatus.newsUpdates ? "default" : "secondary"
                  }
                  size="sm"
                >
                  {connectionStatus.newsUpdates
                    ? "🟢 Connected"
                    : "🟡 Connecting"}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>
                  <strong>incidents</strong> - Active emergency incidents
                </span>
                <Badge
                  variant={connectionStatus.incidents ? "default" : "secondary"}
                  size="sm"
                >
                  {connectionStatus.incidents
                    ? "🟢 Connected"
                    : "🟡 Connecting"}
                </Badge>
              </div>
            </div>
          </div>

          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              <strong>Real-time synchronization active:</strong> All collections
              are monitored with Firebase onSnapshot listeners. Data updates
              automatically across all connected clients.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
