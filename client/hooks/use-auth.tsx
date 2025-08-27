import { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react';
import {
  signInUser,
  registerUser,
  signOutUser,
  onAuthStateChange,
  updateUserProfile
} from '@/lib/firebase-auth';
import {
  User,
  UserRole,
  UserRegistrationRequest,
  UserProfileUpdateRequest,
  AuthResponse
} from '@shared/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: UserRegistrationRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateProfile: (updates: UserProfileUpdateRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await signInUser(email, password);

      if (response.success && response.user) {
        setUser(response.user);
      } else {
        setError(response.error || 'Login failed');
      }

      setIsLoading(false);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = 'Login failed. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (data: UserRegistrationRequest): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await registerUser(data);

      if (response.success && response.user) {
        setUser(response.user);
      } else {
        setError(response.error || 'Registration failed');
      }

      setIsLoading(false);
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMessage = 'Registration failed. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await signOutUser();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      setError('Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: UserProfileUpdateRequest): Promise<void> => {
    if (!user) {
      throw new Error('No authenticated user');
    }

    setIsLoading(true);
    setError(null);

    try {
      await updateUserProfile(user.id, updates);

      // Update local user state
      setUser(prev => prev ? { ...prev, ...updates } : prev);
    } catch (error) {
      console.error('Profile update failed:', error);
      setError('Failed to update profile');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateProfile,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
