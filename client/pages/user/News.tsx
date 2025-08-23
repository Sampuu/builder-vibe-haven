import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import NewsPortal from '@/components/NewsPortal';
import { 
  Newspaper, 
  ArrowLeft
} from 'lucide-react';

export default function News() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
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

        <NewsPortal />
      </div>
    </DashboardLayout>
  );
}
