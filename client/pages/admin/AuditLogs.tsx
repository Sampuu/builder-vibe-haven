import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  ArrowLeft,
  Download,
  Calendar,
  User,
  Activity,
  Shield,
  AlertTriangle,
  Settings,
  RefreshCw
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userRole: string;
  action: string;
  category: 'login' | 'user_management' | 'mission' | 'system' | 'security';
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    timestamp: '2024-01-20 15:30:25',
    user: 'admin@emergency.gov',
    userRole: 'admin',
    action: 'User Created',
    category: 'user_management',
    details: 'Created new user: john.doe@police.gov (Police role)',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    severity: 'medium'
  },
  {
    id: '2',
    timestamp: '2024-01-20 15:15:10',
    user: 'police@emergency.gov',
    userRole: 'police',
    action: 'Mission Updated',
    category: 'mission',
    details: 'Updated mission status: Building Fire Downtown (In Progress)',
    ipAddress: '192.168.1.50',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
    severity: 'low'
  },
  {
    id: '3',
    timestamp: '2024-01-20 14:45:33',
    user: 'admin@emergency.gov',
    userRole: 'admin',
    action: 'Failed Login Attempt',
    category: 'security',
    details: 'Multiple failed login attempts from suspicious IP',
    ipAddress: '203.45.67.89',
    userAgent: 'Automated Bot',
    severity: 'critical'
  },
  {
    id: '4',
    timestamp: '2024-01-20 14:30:15',
    user: 'fire.chief@emergency.gov',
    userRole: 'fire',
    action: 'Status Update',
    category: 'mission',
    details: 'Fire Brigade dispatched to Downtown Plaza incident',
    ipAddress: '192.168.1.75',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0)',
    severity: 'medium'
  },
  {
    id: '5',
    timestamp: '2024-01-20 14:00:42',
    user: 'system',
    userRole: 'system',
    action: 'System Backup',
    category: 'system',
    details: 'Daily automated backup completed successfully',
    ipAddress: '127.0.0.1',
    userAgent: 'System Daemon',
    severity: 'low'
  },
  {
    id: '6',
    timestamp: '2024-01-20 13:45:18',
    user: 'admin@emergency.gov',
    userRole: 'admin',
    action: 'User Deactivated',
    category: 'user_management',
    details: 'Deactivated user account: old.employee@hospital.gov',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    severity: 'high'
  },
  {
    id: '7',
    timestamp: '2024-01-20 13:30:05',
    user: 'ambulance@emergency.gov',
    userRole: 'ambulance',
    action: 'Login Success',
    category: 'login',
    details: 'Successful login from mobile device',
    ipAddress: '192.168.1.25',
    userAgent: 'Mobile App v2.1.0',
    severity: 'low'
  }
];

export default function AuditLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity;
    const matchesDate = !dateFilter || log.timestamp.startsWith(dateFilter);
    return matchesSearch && matchesCategory && matchesSeverity && matchesDate;
  });

  const handleExportLogs = async () => {
    setIsExporting(true);
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      const csvContent = [
        ['Timestamp', 'User', 'Role', 'Action', 'Category', 'Details', 'Severity', 'IP Address'].join(','),
        ...filteredLogs.map(log => [
          log.timestamp,
          log.user,
          log.userRole,
          log.action,
          log.category,
          `"${log.details}"`,
          log.severity,
          log.ipAddress
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefreshLogs = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call to fetch fresh data
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In real app, this would fetch from server:
      // const response = await fetch('/api/audit-logs');
      // const freshLogs = await response.json();

      // For demo, we'll add a new mock log entry
      const newLog: AuditLog = {
        id: `refresh-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        user: 'system',
        userRole: 'system',
        action: 'Logs Refreshed',
        category: 'system',
        details: 'Audit logs manually refreshed by admin',
        ipAddress: '127.0.0.1',
        userAgent: 'Web Browser',
        severity: 'low'
      };

      setLogs(prevLogs => [newLog, ...prevLogs]);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-emergency-danger';
      case 'high': return 'bg-emergency-warning';
      case 'medium': return 'bg-emergency-info';
      case 'low': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'login': return User;
      case 'user_management': return Settings;
      case 'mission': return Activity;
      case 'system': return Settings;
      case 'security': return Shield;
      default: return FileText;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'login': return 'text-emerald-600';
      case 'user_management': return 'text-blue-600';
      case 'mission': return 'text-purple-600';
      case 'system': return 'text-gray-600';
      case 'security': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard/admin')}
              className="w-full sm:w-auto justify-start"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Back to Admin Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                <FileText className="mr-3 h-8 w-8 text-emergency-warning" />
                Audit Logs
              </h1>
              <p className="text-slate-600">Monitor all system activities and security events</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={handleRefreshLogs}
              disabled={isRefreshing}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              variant="default"
              onClick={handleExportLogs}
              disabled={isExporting}
              className="w-full sm:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-danger">
                {logs.filter(l => l.severity === 'critical').length}
              </div>
              <div className="text-sm text-slate-600">Critical Events</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-warning">
                {logs.filter(l => l.category === 'security').length}
              </div>
              <div className="text-sm text-slate-600">Security Events</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-emergency-info">
                {logs.filter(l => l.category === 'user_management').length}
              </div>
              <div className="text-sm text-slate-600">User Changes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-slate-700">{logs.length}</div>
              <div className="text-sm text-slate-600">Total Events</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search Logs</Label>
                <Input
                  id="search"
                  placeholder="Search user, action, or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="categoryFilter">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="user_management">User Management</SelectItem>
                    <SelectItem value="mission">Mission</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="severityFilter">Severity</Label>
                <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateFilter">Date Filter</Label>
                <Input
                  id="dateFilter"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Logs ({filteredLogs.length})</CardTitle>
            <CardDescription>Chronological record of all system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredLogs.map((log) => {
                const CategoryIcon = getCategoryIcon(log.category);
                return (
                  <div key={log.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white p-2 rounded-lg">
                          <CategoryIcon className={`h-4 w-4 ${getCategoryColor(log.category)}`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-slate-900">{log.action}</h3>
                            <Badge className={`${getSeverityColor(log.severity)} text-white text-xs`}>
                              {log.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">{log.details}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-slate-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {log.timestamp}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-600 mt-3 pt-3 border-t border-slate-200">
                      <div>
                        <span className="font-medium">User: </span>
                        {log.user} ({log.userRole})
                      </div>
                      <div>
                        <span className="font-medium">IP Address: </span>
                        {log.ipAddress}
                      </div>
                      <div>
                        <span className="font-medium">Category: </span>
                        <Badge variant="outline" className="text-xs">
                          {log.category.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    {log.userAgent && (
                      <div className="text-xs text-slate-500 mt-2">
                        <span className="font-medium">User Agent: </span>
                        {log.userAgent}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
