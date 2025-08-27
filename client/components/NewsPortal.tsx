import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Newspaper, 
  Plus, 
  Clock, 
  AlertTriangle,
  Info,
  CheckCircle,
  User
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  author: string;
  role: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'fire' | 'medical' | 'accident' | 'weather' | 'general';
}

// Mock news data
const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Major Fire Incident at Downtown Plaza - Contained',
    content: 'Fire department has successfully contained the fire at Downtown Plaza. All residents have been evacuated safely. Investigation ongoing.',
    author: 'Fire Chief Johnson',
    role: 'fire',
    timestamp: '2 hours ago',
    priority: 'high',
    category: 'fire'
  },
  {
    id: '2',
    title: 'Traffic Accident on Highway 101 - Lane Closure',
    content: 'Multi-vehicle accident on Highway 101 northbound. Right two lanes closed. Ambulance on scene, minor injuries reported.',
    author: 'Officer Martinez',
    role: 'police',
    timestamp: '30 minutes ago',
    priority: 'medium',
    category: 'accident'
  },
  {
    id: '3',
    title: 'Weather Alert: Heavy Rain Expected',
    content: 'National Weather Service issues heavy rain warning for the region. Possible flooding in low-lying areas. Stay alert.',
    author: 'Admin System',
    role: 'admin',
    timestamp: '1 hour ago',
    priority: 'medium',
    category: 'weather'
  }
];

const priorityColors = {
  low: 'bg-slate-500',
  medium: 'bg-emergency-info',
  high: 'bg-emergency-warning',
  critical: 'bg-emergency-danger',
};

const categoryIcons = {
  fire: AlertTriangle,
  medical: Plus,
  accident: AlertTriangle,
  weather: Info,
  general: Newspaper,
};

export default function NewsPortal() {
  const [news, setNews] = useState<NewsItem[]>(mockNews);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    priority: 'medium' as NewsItem['priority'],
    category: 'general' as NewsItem['category'],
  });
  
  const { user } = useAuth();

  const handlePostNews = () => {
    if (!newPost.title || !newPost.content || !user) return;

    const newsItem: NewsItem = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      author: user.displayName,
      role: user.role,
      timestamp: 'Just now',
      priority: newPost.priority,
      category: newPost.category,
    };

    setNews([newsItem, ...news]);
    setNewPost({ title: '', content: '', priority: 'medium', category: 'general' });
    setIsPostDialogOpen(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'police': return 'text-emergency-danger';
      case 'fire': return 'text-emergency-warning';
      case 'ambulance': return 'text-emergency-resolved';
      case 'hospital': return 'text-emergency-info';
      case 'admin': return 'text-slate-700';
      default: return 'text-emergency-info';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Newspaper className="mr-2 h-5 w-5 text-emergency-warning" />
            <div>
              <CardTitle>Disaster News Portal</CardTitle>
              <CardDescription>Latest updates and emergency information</CardDescription>
            </div>
          </div>
          <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="warning">
                <Plus className="mr-2 h-4 w-4" />
                Post News
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Post Emergency News</DialogTitle>
                <DialogDescription>
                  Share important information with all emergency responders and citizens.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="Emergency update title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Detailed information about the situation..."
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <select
                      id="priority"
                      value={newPost.priority}
                      onChange={(e) => setNewPost({ ...newPost, priority: e.target.value as NewsItem['priority'] })}
                      className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={newPost.category}
                      onChange={(e) => setNewPost({ ...newPost, category: e.target.value as NewsItem['category'] })}
                      className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                    >
                      <option value="general">General</option>
                      <option value="fire">Fire</option>
                      <option value="medical">Medical</option>
                      <option value="accident">Accident</option>
                      <option value="weather">Weather</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsPostDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handlePostNews} variant="warning">
                    Post News
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {news.map((item) => {
            const CategoryIcon = categoryIcons[item.category];
            return (
              <div key={item.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <CategoryIcon className="h-4 w-4 text-slate-600" />
                    <h3 className="font-semibold text-slate-900 text-sm">{item.title}</h3>
                  </div>
                  <Badge className={`${priorityColors[item.priority]} text-white text-xs`}>
                    {item.priority}
                  </Badge>
                </div>
                <p className="text-sm text-slate-700 mb-3">{item.content}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-2">
                    <User className="h-3 w-3" />
                    <span className={`font-medium ${getRoleColor(item.role)}`}>
                      {item.author} ({item.role})
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{item.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
