import { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple mock login for testing
  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email && password.length >= 6) {
        const mockUser: User = {
          id: 'test-' + Date.now(),
          email,
          displayName: email.split('@')[0],
          role: 'user',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setUser(mockUser);
        setIsLoading(false);
        return { success: true, user: mockUser };
      } else {
        setError('Invalid credentials');
        setIsLoading(false);
        return { success: false, error: 'Invalid credentials' };
      }
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: 'reg-' + Date.now(),
        email: data.email,
        displayName: data.displayName,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setUser(mockUser);
      setIsLoading(false);
      return { success: true, user: mockUser };
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMessage = 'Registration failed. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    setError(null);
  };

  const updateProfile = async (updates: UserProfileUpdateRequest): Promise<void> => {
    if (!user) {
      throw new Error('No authenticated user');
    }

    // Update local user state
    setUser(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : prev);
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
