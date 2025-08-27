import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const storedUser = localStorage.getItem('disaster-auth-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('disaster-auth-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call - in real app this would be a server request
    try {
      // Simple validation for demo purposes
      if (email && password.length >= 6) {
        const user: User = {
          id: `${role}-${Date.now()}`,
          email,
          name: email.split('@')[0],
          role,
        };
        
        setUser(user);
        localStorage.setItem('disaster-auth-user', JSON.stringify(user));
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('disaster-auth-user');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
