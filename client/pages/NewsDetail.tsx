import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { NewsArticle, CrisisAction } from '@/types/news';
import { useAuth } from '@/hooks/use-auth';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Phone,
  Truck,
  Package,
  Users,
  Calendar,
  Target
} from 'lucide-react';

// Mock news articles database
const mockNewsArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'Major Fire Outbreak at Downtown Plaza - Immediate Evacuation Required',
    content: `A significant fire has broken out at the Downtown Plaza shopping complex at approximately 2:30 PM today. The fire appears to have started in the food court area and has rapidly spread to adjacent stores.

**Current Situation:**
- Fire Brigade Unit 3 and Unit 7 are on scene
- Building evacuation is in progress
- No casualties reported at this time
- Estimated 200+ people affected

**Immediate Actions Required:**
- All residents within 2-block radius should remain indoors
- Main Street and Oak Avenue are closed to traffic
- Emergency shelters set up at Community Center and High School

**Resources Deployed:**
- 6 Fire trucks
- 3 Ambulances
- 2 Police units for crowd control
- Emergency medical team standing by

The situation is being closely monitored. Updates will be provided every 30 minutes until resolved.`,
    summary: 'Major fire at Downtown Plaza requires immediate evacuation. Fire Brigade and emergency services responding.',
    author: 'Fire Chief Johnson',
    authorRole: 'fire',
    timestamp: '2024-01-20T14:30:00Z',
    category: 'emergency',
    priority: 'critical',
    location: 'Downtown Plaza, Main Street',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    affectedAreas: ['Downtown District', 'Main Street', 'Oak Avenue'],
    relatedIncidents: ['incident-001', 'evacuation-002'],
    status: 'active',
    tags: ['fire', 'evacuation', 'emergency', 'downtown'],
    views: 156,
    lastUpdated: '2024-01-20T15:45:00Z'
  },
  {
    id: '2',
    title: 'Medical Emergency Response - Highway 101 Multi-Vehicle Accident',
    content: `A multi-vehicle accident involving 4 cars has occurred on Highway 101 northbound near Mile Marker 23. Emergency medical teams are on site providing immediate care.

**Incident Details:**
- Time: 1:15 PM
- Location: Highway 101 NB, Mile 23
- Vehicles involved: 4 passenger cars
- Injuries: 3 people with minor injuries, 1 serious but stable

**Current Response:**
- 2 Ambulances dispatched
- Life Flight helicopter on standby
- Police directing traffic
- Tow trucks en route

**Traffic Impact:**
- Right two lanes closed
- Expect 45-minute delays
- Alternative routes: Highway 99 or State Route 5

Medical teams report all patients are receiving appropriate care. The highway is expected to reopen fully by 4:00 PM.`,
    summary: 'Multi-vehicle accident on Highway 101. Emergency medical response in progress.',
    author: 'EMT Supervisor Williams',
    authorRole: 'ambulance',
    timestamp: '2024-01-20T13:15:00Z',
    category: 'incident',
    priority: 'high',
    location: 'Highway 101, Mile Marker 23',
    coordinates: { lat: 40.7589, lng: -73.9851 },
    affectedAreas: ['Highway 101', 'North County'],
    relatedIncidents: ['traffic-001'],
    status: 'active',
    tags: ['accident', 'medical', 'highway', 'traffic'],
    views: 89,
    lastUpdated: '2024-01-20T14:20:00Z'
  },
  {
    id: '3',
    title: 'Weather Alert: Severe Storm Warning - Emergency Supplies Deployment',
    content: `The National Weather Service has issued a severe storm warning for our region. Heavy rainfall and strong winds expected through tomorrow evening.

**Weather Forecast:**
- Rain: 3-5 inches expected
- Winds: 45-60 mph gusts
- Duration: Next 18 hours
- Flood risk: Moderate in low-lying areas

**Emergency Supplies Available:**
Hospital and Emergency Services are deploying supplies to affected areas:

- Sandbags available at Community Center
- Emergency food kits for families
- Medical supplies for chronic conditions
- Generators for power outages
- Blankets and temporary shelter supplies

**Shelter Locations:**
- Roosevelt Elementary School
- Community Center Main Hall
- Methodist Church Fellowship Hall

**Safety Recommendations:**
- Avoid driving through flooded roads
- Keep emergency kits ready
- Stay indoors during peak storm hours
- Report power outages to utility company

Emergency supply teams will be operating 24/7 during the storm period.`,
    summary: 'Severe storm warning issued. Emergency supplies being deployed to community centers.',
    author: 'Emergency Coordinator Martinez',
    authorRole: 'admin',
    timestamp: '2024-01-20T10:00:00Z',
    category: 'weather',
    priority: 'high',
    location: 'Citywide',
    affectedAreas: ['Entire City', 'Low-lying areas', 'Coastal regions'],
    relatedIncidents: ['weather-001'],
    status: 'active',
    tags: ['weather', 'storm', 'supplies', 'shelter'],
    views: 234,
    lastUpdated: '2024-01-20T12:30:00Z'
  }
];

// Mock crisis actions based on entity role
const mockCrisisActions: Record<string, CrisisAction[]> = {
  fire: [
    {
      id: 'f1',
      title: 'Deploy Fire Suppression Team',
      description: 'Send additional fire trucks and personnel to Downtown Plaza',
      type: 'deployment',
      assignedTo: 'fire',
      status: 'in-progress',
      priority: 'critical',
      location: 'Downtown Plaza',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      resources: {
        personnel: 12,
        vehicles: ['Fire Truck 3', 'Fire Truck 7', 'Ladder 2'],
        equipment: ['Hoses', 'Breathing Apparatus', 'Thermal Camera']
      },
      estimatedTime: '45 minutes',
      timestamp: '2024-01-20T14:35:00Z'
    }
  ],
  ambulance: [
    {
      id: 'a1',
      title: 'Medical Team Deployment',
      description: 'Deploy medical team and ambulances to Highway 101 accident',
      type: 'medical',
      assignedTo: 'ambulance',
      status: 'completed',
      priority: 'high',
      location: 'Highway 101, Mile 23',
      coordinates: { lat: 40.7589, lng: -73.9851 },
      resources: {
        personnel: 6,
        vehicles: ['Ambulance 4', 'Ambulance 7'],
        equipment: ['Medical kits', 'Stretchers', 'Defibrillator']
      },
      actualTime: '20 minutes',
      timestamp: '2024-01-20T13:20:00Z',
      completedAt: '2024-01-20T13:40:00Z'
    }
  ],
  hospital: [
    {
      id: 'h1',
      title: 'Emergency Supply Distribution',
      description: 'Deploy emergency food, medical supplies, and shelter materials',
      type: 'supply',
      assignedTo: 'hospital',
      status: 'in-progress',
      priority: 'high',
      location: 'Community Center',
      coordinates: { lat: 40.7505, lng: -73.9934 },
      resources: {
        personnel: 8,
        vehicles: ['Supply Truck 1', 'Mobile Clinic'],
        supplies: ['Food kits (100)', 'Medical supplies', 'Blankets (50)', 'Water bottles (200)']
      },
      estimatedTime: '2 hours',
      timestamp: '2024-01-20T11:00:00Z'
    }
  ],
  police: [
    {
      id: 'p1',
      title: 'Traffic Control & Evacuation Support',
      description: 'Coordinate traffic management and assist with building evacuation',
      type: 'coordination',
      assignedTo: 'police',
      status: 'in-progress',
      priority: 'high',
      location: 'Downtown Plaza area',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      resources: {
        personnel: 8,
        vehicles: ['Police Unit 12', 'Police Unit 18', 'Mobile Command']
      },
      estimatedTime: 'ongoing',
      timestamp: '2024-01-20T14:40:00Z'
    }
  ]
};

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [crisisActions, setCrisisActions] = useState<CrisisAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch article
    const fetchArticle = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
      
      const foundArticle = mockNewsArticles.find(a => a.id === id);
      if (foundArticle) {
        setArticle(foundArticle);
        // Increment view count
        foundArticle.views += 1;
        
        // Get crisis actions for user's role
        if (user?.role && mockCrisisActions[user.role]) {
          setCrisisActions(mockCrisisActions[user.role]);
        }
      }
      setIsLoading(false);
    };

    if (id) {
      fetchArticle();
    }
  }, [id, user?.role]);

  const handleNavigateToLocation = () => {
    if (article?.coordinates) {
      const { lat, lng } = article.coordinates;
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
    }
  };

  const handleExecuteAction = async (actionId: string) => {
    // Simulate executing crisis action
    const action = crisisActions.find(a => a.id === actionId);
    if (action) {
      action.status = 'in-progress';
      setCrisisActions([...crisisActions]);
      
      // Simulate completion after some time
      setTimeout(() => {
        action.status = 'completed';
        action.completedAt = new Date().toISOString();
        setCrisisActions([...crisisActions]);
      }, 3000);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-emergency-danger text-white';
      case 'high': return 'bg-emergency-warning text-white';
      case 'medium': return 'bg-emergency-info text-white';
      case 'low': return 'bg-slate-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emergency-resolved';
      case 'in-progress': return 'bg-emergency-info';
      case 'pending': return 'bg-emergency-warning';
      case 'cancelled': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emergency-info mx-auto mb-4"></div>
            <p className="text-slate-600">Loading article...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!article) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Article Not Found</h2>
          <p className="text-slate-600 mb-4">The requested news article could not be found.</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Badge className={getPriorityColor(article.priority)}>
                {article.priority.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                {article.category}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{article.title}</h1>
          </div>
        </div>

        {/* Article Metadata */}
        <Card>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-slate-500" />
                <span>{article.author} ({article.authorRole})</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-slate-500" />
                <span>{new Date(article.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-slate-500" />
                <span>{article.views} views</span>
              </div>
            </div>
            
            {article.location && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">{article.location}</span>
                </div>
                {article.coordinates && (
                  <Button variant="outline" size="sm" onClick={handleNavigateToLocation}>
                    <Navigation className="mr-2 h-4 w-4" />
                    Navigate
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Article Content */}
        <Card>
          <CardContent className="p-6">
            <div className="prose max-w-none">
              {article.content.split('\n').map((paragraph, index) => {
                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                  return <h3 key={index} className="text-lg font-semibold mt-6 mb-3 text-slate-900">{paragraph.slice(2, -2)}</h3>;
                }
                if (paragraph.trim() === '') {
                  return <br key={index} />;
                }
                if (paragraph.startsWith('-')) {
                  return <li key={index} className="ml-4 text-slate-700">{paragraph.slice(1).trim()}</li>;
                }
                return <p key={index} className="mb-4 text-slate-700 leading-relaxed">{paragraph}</p>;
              })}
            </div>
          </CardContent>
        </Card>

        {/* Crisis Actions for Entity */}
        {crisisActions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5 text-emergency-warning" />
                {user?.role?.toUpperCase()} Crisis Actions
              </CardTitle>
              <CardDescription>
                Available actions and deployments for your department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {crisisActions.map((action) => (
                  <div key={action.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-900">{action.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{action.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(action.priority)}>
                          {action.priority}
                        </Badge>
                        <Badge className={`${getStatusColor(action.status)} text-white`}>
                          {action.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600 mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{action.location}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Calendar className="h-4 w-4" />
                          <span>{action.estimatedTime || action.actualTime || 'TBD'}</span>
                        </div>
                      </div>
                      
                      {action.resources && (
                        <div className="text-sm">
                          <h5 className="font-medium text-slate-900 mb-2">Resources:</h5>
                          <div className="space-y-1">
                            {action.resources.personnel && (
                              <div className="flex items-center space-x-2">
                                <Users className="h-3 w-3 text-slate-500" />
                                <span>{action.resources.personnel} personnel</span>
                              </div>
                            )}
                            {action.resources.vehicles && (
                              <div className="flex items-center space-x-2">
                                <Truck className="h-3 w-3 text-slate-500" />
                                <span>{action.resources.vehicles.join(', ')}</span>
                              </div>
                            )}
                            {action.resources.supplies && (
                              <div className="flex items-center space-x-2">
                                <Package className="h-3 w-3 text-slate-500" />
                                <span>{action.resources.supplies.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      {action.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleExecuteAction(action.id)}
                          className="bg-emergency-warning hover:bg-emergency-warning/90"
                        >
                          Execute Action
                        </Button>
                      )}
                      {action.status === 'in-progress' && (
                        <Button size="sm" variant="outline" disabled>
                          In Progress...
                        </Button>
                      )}
                      {action.status === 'completed' && (
                        <Button size="sm" variant="outline" disabled>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Completed
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={handleNavigateToLocation}>
                        <Navigation className="mr-2 h-4 w-4" />
                        Navigate to Location
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Affected Areas */}
        {article.affectedAreas && article.affectedAreas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Affected Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {article.affectedAreas.map((area, index) => (
                  <Badge key={index} variant="outline">
                    {area}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency Status */}
        {article.status === 'active' && (
          <Alert className="border-emergency-warning bg-emergency-warning/5">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-emergency-warning font-medium">
              This is an active emergency situation. Stay alert for updates.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  );
}
