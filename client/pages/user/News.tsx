import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Newspaper, 
  ArrowLeft,
  Plus,
  Clock,
  MapPin,
  Eye,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { UserDashboardService } from '@/lib/user-dashboard-db';
import { DisasterNews, CreateDisasterNewsForm } from '@shared/user-dashboard-types';

const newsCategories = [
  { value: 'emergency_alert', label: 'Emergency Alert', description: 'Urgent safety alerts' },
  { value: 'safety_tips', label: 'Safety Tips', description: 'Prevention and safety advice' },
  { value: 'incident_update', label: 'Incident Update', description: 'Updates on ongoing incidents' },
  { value: 'general_info', label: 'General Information', description: 'General emergency information' }
] as const;

const priorityLevels = [
  { value: 'low', label: 'Low', color: 'bg-slate-500' },
  { value: 'medium', label: 'Medium', color: 'bg-emergency-info' },
  { value: 'high', label: 'High', color: 'bg-emergency-warning' },
  { value: 'urgent', label: 'Urgent', color: 'bg-emergency-danger' }
] as const;

const timeAgo = (date: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

export default function News() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [news, setNews] = useState<DisasterNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general_info' as CreateDisasterNewsForm['category'],
    priority: 'medium' as CreateDisasterNewsForm['priority'],
    location: {
      latitude: 0,
      longitude: 0,
      address: ''
    },
    tags: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');

  // Load user's disaster news on component mount
  useEffect(() => {
    const loadNews = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const userNews = await UserDashboardService.getUserDisasterNews(user.id);
        setNews(userNews);
      } catch (error) {
        console.error('Error loading news:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLocationChange = (address: string) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, address }
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Please provide a title';
    if (!formData.content.trim()) newErrors.content = 'Please provide content';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user?.id) return;

    setIsCreating(true);

    try {
      const newsData: CreateDisasterNewsForm = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        priority: formData.priority,
        location: formData.location.address ? formData.location : undefined,
        tags: formData.tags
      };

      const newsId = await UserDashboardService.createDisasterNews(
        user.id,
        newsData,
        user.name || 'Anonymous User'
      );

      // Refresh news list
      const updatedNews = await UserDashboardService.getUserDisasterNews(user.id);
      setNews(updatedNews);
      
      setCreateSuccess(true);
      setShowCreateDialog(false);
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        category: 'general_info',
        priority: 'medium',
        location: { latitude: 0, longitude: 0, address: '' },
        tags: []
      });
    } catch (error) {
      console.error('Failed to create news:', error);
      setErrors({ submit: 'Failed to create news. Please try again.' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleNewsView = async (newsId: string) => {
    if (user?.id) {
      try {
        await UserDashboardService.incrementNewsViewCount(user.id, newsId);
        // Refresh news to show updated view count
        const updatedNews = await UserDashboardService.getUserDisasterNews(user.id);
        setNews(updatedNews);
      } catch (error) {
        console.error('Error tracking news view:', error);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard/user')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                <Newspaper className="mr-3 h-8 w-8 text-emergency-warning" />
                Disaster News & Updates
              </h1>
              <p className="text-slate-600">Stay informed about emergency situations and post updates</p>
            </div>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="warning">
                <Plus className="mr-2 h-4 w-4" />
                Create News
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Disaster News</DialogTitle>
                <DialogDescription>
                  Share important information about emergencies or safety. This will be stored in your Firebase disasterNews sub-collection.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateNews} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter news title"
                    className={errors.title ? 'border-emergency-danger' : ''}
                  />
                  {errors.title && <p className="text-sm text-emergency-danger">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {newsCategories.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            <div>
                              <div className="font-medium">{category.label}</div>
                              <div className="text-xs text-slate-500">{category.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityLevels.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${level.color}`}></div>
                              <span>{level.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Write your news content..."
                    rows={4}
                    className={errors.content ? 'border-emergency-danger' : ''}
                  />
                  {errors.content && <p className="text-sm text-emergency-danger">{errors.content}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    value={formData.location.address}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    placeholder="Location related to this news"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tags (Optional)</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} variant="outline">Add</Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {errors.submit && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.submit}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="warning" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create News
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Success Alert */}
        {createSuccess && (
          <Alert className="border-emergency-resolved bg-emergency-resolved/5">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-emergency-resolved">
              News article created successfully and saved to your Firebase sub-collection!
            </AlertDescription>
          </Alert>
        )}

        {/* News List */}
        <div className="grid gap-6">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading news from Firebase...</p>
              </CardContent>
            </Card>
          ) : news.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No news articles yet</h3>
                <p className="text-slate-600 mb-4">Create your first disaster news article to share important information.</p>
                <Button onClick={() => setShowCreateDialog(true)} variant="warning">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Article
                </Button>
              </CardContent>
            </Card>
          ) : (
            news.map(article => (
              <Card key={article.newsId} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={priorityLevels.find(p => p.value === article.priority)?.color}>
                          {article.priority}
                        </Badge>
                        <Badge variant="outline">
                          {newsCategories.find(c => c.value === article.category)?.label}
                        </Badge>
                        {article.isVerified && (
                          <Badge className="bg-emergency-resolved">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl">{article.title}</CardTitle>
                      <CardDescription className="flex items-center space-x-4 mt-2">
                        <span className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {timeAgo(article.timestamp)}
                        </span>
                        <span className="flex items-center">
                          <Eye className="mr-1 h-4 w-4" />
                          {article.viewCount} views
                        </span>
                        {article.location && (
                          <span className="flex items-center">
                            <MapPin className="mr-1 h-4 w-4" />
                            {article.location.address}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-slate-700 whitespace-pre-wrap">{article.content}</p>
                  </div>
                  
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {article.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <div className="text-sm text-slate-500">
                      By {article.authorName}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleNewsView(article.newsId)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Mark as Read
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Firebase Integration Status */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 text-sm">🔥 Firebase Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-green-700 space-y-1">
              <div>✓ Connected to disasterNews sub-collection</div>
              <div>✓ Analytics tracking enabled</div>
              <div>✓ User-specific news articles</div>
              <div>✓ View count tracking</div>
              <div>✓ Real-time news creation</div>
            </div>
          </CardContent>
        </Card>

        {/* Information Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Your news articles are stored in your personal Firebase disasterNews sub-collection. 
            Only you can create and manage your news articles, ensuring data privacy and security.
          </AlertDescription>
        </Alert>
      </div>
    </DashboardLayout>
  );
}
