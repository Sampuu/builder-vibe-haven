import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

export default function AuthRedirect() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      // If user is logged in and on auth pages, redirect to their dashboard
      if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/') {
        navigate(`/dashboard/${user.role}`, { replace: true });
      }
    }
  }, [user, isLoading, navigate, location.pathname]);

  return null;
}
