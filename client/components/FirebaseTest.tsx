import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Database, Plus } from 'lucide-react';
import { firebaseDb } from '@/lib/firebase-db';
import type { DisasterReport, HelpRequest, NewsUpdate } from '@shared/types';

export default function FirebaseTest() {
  const [reports, setReports] = useState<DisasterReport[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [news, setNews] = useState<NewsUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load recent disaster reports
      const reportsResult = await firebaseDb.disasterReports.getRecent(5);
      if (reportsResult.success) {
        setReports(reportsResult.data || []);
      }

      // Load public news
      const newsResult = await firebaseDb.news.getPublicNews(5);
      if (newsResult.success) {
        setNews(newsResult.data || []);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const createSampleData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create sample disaster report
      const sampleReport = await firebaseDb.disasterReports.create({
        userId: 'test-user-123',
        type: 'fire',
        severity: 'high',
        title: 'Building Fire on Main Street',
        description: 'Large fire reported at the shopping center on Main Street. Multiple fire trucks dispatched.',
        location: '123 Main Street, Downtown',
        contactName: 'John Doe',
        contactPhone: '+1-555-0123',
        status: 'submitted'
      });

      // Create sample help request
      const sampleHelpRequest = await firebaseDb.helpRequests.create({
        userId: 'test-user-456',
        type: 'medical',
        urgency: 'high',
        description: 'Need medical assistance for elderly person with chest pains',
        location: '456 Oak Avenue, Residential Area',
        contactPhone: '+1-555-0456',
        status: 'submitted'
      });

      // Create sample news update
      const sampleNews = await firebaseDb.news.create({
        title: 'Emergency Services Test Alert',
        content: 'This is a test news update to verify the Firebase integration is working correctly.',
        category: 'emergency',
        severity: 'info',
        authorId: 'admin-001',
        authorName: 'Emergency Admin',
        isPublic: true
      });

      if (sampleReport.success && sampleHelpRequest.success && sampleNews.success) {
        await loadData(); // Reload data to show new entries
      } else {
        throw new Error('Failed to create sample data');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Firebase Integration Test
          </CardTitle>
          <CardDescription>
            Test Firebase Firestore database integration and view stored data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button onClick={loadData} disabled={loading} variant="outline">
              <Database className="mr-2 h-4 w-4" />
              {loading ? 'Loading...' : 'Reload Data'}
            </Button>
            <Button onClick={createSampleData} disabled={loading}>
              <Plus className="mr-2 h-4 w-4" />
              Create Sample Data
            </Button>
          </div>

          {error && (
            <Alert className="border-emergency-danger bg-emergency-danger/5">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-emergency-danger">
                Error: {error}
              </AlertDescription>
            </Alert>
          )}

          {!error && !loading && (
            <Alert className="border-emergency-resolved bg-emergency-resolved/5">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-emergency-resolved">
                Firebase connection successful!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Disaster Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Disaster Reports ({reports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No disaster reports found</p>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{report.title}</h4>
                      <p className="text-sm text-slate-600">{report.description}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {report.location} • {new Date(report.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        report.severity === 'critical' ? 'bg-emergency-danger text-emergency-danger-foreground' :
                        report.severity === 'high' ? 'bg-emergency-warning text-emergency-warning-foreground' :
                        report.severity === 'medium' ? 'bg-emergency-info text-emergency-info-foreground' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {report.severity}
                      </span>
                      <p className="text-xs text-slate-500 mt-1 capitalize">{report.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* News Updates */}
      <Card>
        <CardHeader>
          <CardTitle>Recent News Updates ({news.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {news.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No news updates found</p>
          ) : (
            <div className="space-y-3">
              {news.map((item) => (
                <div key={item.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-slate-600">{item.content}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        By {item.authorName} • {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        item.severity === 'danger' ? 'bg-emergency-danger text-emergency-danger-foreground' :
                        item.severity === 'warning' ? 'bg-emergency-warning text-emergency-warning-foreground' :
                        'bg-emergency-info text-emergency-info-foreground'
                      }`}>
                        {item.severity}
                      </span>
                      <p className="text-xs text-slate-500 mt-1 capitalize">{item.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
