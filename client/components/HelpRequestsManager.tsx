import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Shield, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Heart,
  Clock,
  BarChart3
} from 'lucide-react';
import FirebaseBackupService from '@/lib/firebase-backup';
import { firebaseDb } from '@/lib/firebase-db';
import type { HelpRequest } from '@shared/types';

interface BackupStats {
  helpRequestsCount: number;
  backupCount: number;
  lastBackup?: Date;
}

interface IntegrityCheck {
  isValid: boolean;
  issues: string[];
  helpRequestsCount: number;
}

export default function HelpRequestsManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [backupStats, setBackupStats] = useState<BackupStats | null>(null);
  const [integrityCheck, setIntegrityCheck] = useState<IntegrityCheck | null>(null);
  const [recentRequests, setRecentRequests] = useState<HelpRequest[]>([]);
  const [operationResult, setOperationResult] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadInitialData();
    setupRealtimeListener();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Load backup stats
      const stats = await FirebaseBackupService.getBackupStats();
      setBackupStats(stats);

      // Verify collection integrity  
      const integrity = await FirebaseBackupService.verifyCollectionIntegrity();
      setIntegrityCheck(integrity);

      // Load recent help requests
      const result = await firebaseDb.helpRequests.getAll(10);
      if (result.success) {
        setRecentRequests(result.data || []);
      }
    } catch (error) {
      showResult('error', `Failed to load data: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeListener = () => {
    const unsubscribe = firebaseDb.helpRequests.subscribeToHelpRequests((requests) => {
      setRecentRequests(requests.slice(0, 10)); // Keep only 10 most recent
      
      // Update stats when data changes
      FirebaseBackupService.getBackupStats().then(setBackupStats);
      FirebaseBackupService.verifyCollectionIntegrity().then(setIntegrityCheck);
    });

    return unsubscribe;
  };

  const showResult = (type: 'success' | 'error' | 'info', message: string) => {
    setOperationResult({ type, message });
    setTimeout(() => setOperationResult(null), 5000);
  };

  const handleBackup = async () => {
    setIsLoading(true);
    try {
      const result = await FirebaseBackupService.backupHelpRequests();
      if (result.success) {
        showResult('success', result.message);
        await loadInitialData(); // Refresh stats
      } else {
        showResult('error', result.message);
      }
    } catch (error) {
      showResult('error', `Backup failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      const result = await FirebaseBackupService.restoreHelpRequests();
      if (result.success) {
        showResult('success', result.message);
        await loadInitialData(); // Refresh data
      } else {
        showResult('error', result.message);
      }
    } catch (error) {
      showResult('error', `Restore failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSampleData = async () => {
    setIsLoading(true);
    try {
      const result = await FirebaseBackupService.createSampleData();
      if (result.success) {
        showResult('success', result.message);
        await loadInitialData(); // Refresh data
      } else {
        showResult('error', result.message);
      }
    } catch (error) {
      showResult('error', `Failed to create sample data: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: HelpRequest['status']) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="secondary">📝 Submitted</Badge>;
      case 'acknowledged':
        return <Badge variant="default">👀 Acknowledged</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">🔄 In Progress</Badge>;
      case 'fulfilled':
        return <Badge variant="default" className="bg-green-100 text-green-800">✅ Fulfilled</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">❌ Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getUrgencyColor = (urgency: HelpRequest['urgency']) => {
    switch (urgency) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Help Requests Data Management
          </CardTitle>
          <CardDescription>
            Manage, backup, and monitor your helpRequests collection data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Operation Result Alert */}
          {operationResult && (
            <Alert className={`${
              operationResult.type === 'success' ? 'border-green-500 bg-green-50' :
              operationResult.type === 'error' ? 'border-red-500 bg-red-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              {operationResult.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
               operationResult.type === 'error' ? <AlertTriangle className="h-4 w-4 text-red-600" /> :
               <Database className="h-4 w-4 text-blue-600" />}
              <AlertDescription className={
                operationResult.type === 'success' ? 'text-green-800' :
                operationResult.type === 'error' ? 'text-red-800' :
                'text-blue-800'
              }>
                {operationResult.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Heart className="h-6 w-6 text-red-500 mb-2" />
                    <p className="text-sm font-medium">Active Requests</p>
                    <p className="text-2xl font-bold">{backupStats?.helpRequestsCount || 0}</p>
                  </div>
                  <Badge variant={backupStats?.helpRequestsCount ? "default" : "secondary"}>
                    {backupStats?.helpRequestsCount ? "Active" : "Empty"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Shield className="h-6 w-6 text-blue-500 mb-2" />
                    <p className="text-sm font-medium">Backup Entries</p>
                    <p className="text-2xl font-bold">{backupStats?.backupCount || 0}</p>
                  </div>
                  <Badge variant={backupStats?.backupCount ? "default" : "secondary"}>
                    {backupStats?.backupCount ? "Protected" : "None"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
                    <p className="text-sm font-medium">Data Integrity</p>
                    <p className="text-xs text-gray-600">
                      {integrityCheck?.isValid ? 'Healthy' : `${integrityCheck?.issues.length || 0} issues`}
                    </p>
                  </div>
                  <Badge variant={integrityCheck?.isValid ? "default" : "destructive"}>
                    {integrityCheck?.isValid ? "✓ Valid" : "⚠ Issues"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Management Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button onClick={handleBackup} disabled={isLoading} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Backup Data
            </Button>
            
            <Button onClick={handleRestore} disabled={isLoading} variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Restore Data
            </Button>
            
            <Button onClick={handleCreateSampleData} disabled={isLoading} variant="outline" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Add Sample Data
            </Button>
            
            <Button onClick={loadInitialData} disabled={isLoading} variant="ghost" className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Integrity Issues */}
          {integrityCheck && !integrityCheck.isValid && (
            <Alert className="border-yellow-500 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <div>
                  <strong>Data Integrity Issues Detected:</strong>
                  <ul className="mt-2 list-disc list-inside text-sm">
                    {integrityCheck.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Recent Help Requests */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Help Requests ({recentRequests.length})
            </h3>
            
            {recentRequests.length === 0 ? (
              <Alert>
                <Database className="h-4 w-4" />
                <AlertDescription>
                  No help requests found. The collection appears to be empty. 
                  You can create sample data or restore from backup if available.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {recentRequests.map((request) => (
                  <Card key={request.id} className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span className="font-medium capitalize">{request.type}</span>
                            <span className={`text-sm font-medium ${getUrgencyColor(request.urgency)}`}>
                              ({request.urgency})
                            </span>
                            {getStatusBadge(request.status)}
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{request.description}</p>
                          <div className="text-xs text-gray-500">
                            📍 {request.location} • 📞 {request.contactPhone}
                          </div>
                          {request.specialRequests && (
                            <div className="text-xs text-gray-600 mt-1">
                              <strong>Special:</strong> {request.specialRequests}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 text-right">
                          <div>{new Date(request.createdAt).toLocaleDateString()}</div>
                          <div>{new Date(request.createdAt).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Backup Info */}
          {backupStats?.lastBackup && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Last Backup:</strong> {backupStats.lastBackup.toLocaleString()}
                <br />
                Regular backups help prevent data loss. Consider backing up frequently, especially after important updates.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
