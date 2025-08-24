import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import authService from '../lib/auth-service';

export type UserRole = 'user' | 'police' | 'fire' | 'ambulance' | 'hospital' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  displayName?: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, userData: { displayName?: string; role: UserRole }) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  isLoading: boolean;
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
    // Listen for auth state changes
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Get additional user data from Firestore
        const userData = await authService.getUserData(firebaseUser.uid);
        if (userData.success) {
          const user: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: userData.data.displayName || firebaseUser.email?.split('@')[0] || '',
            role: userData.data.role || 'user',
            displayName: userData.data.displayName,
            photoURL: userData.data.photoURL,
          };
          setUser(user);
        } else {
          // If no user data in Firestore, create a basic user object
          const user: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.email?.split('@')[0] || '',
            role: 'user',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
          };
          setUser(user);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const result = await authService.signIn(email, password);
      setIsLoading(false);

      if (result.success) {
        return true;
      } else {
        console.error('Login failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  const signUp = async (email: string, password: string, userData: { displayName?: string; role: UserRole }): Promise<boolean> => {
    setIsLoading(true);

    try {
      const result = await authService.signUp(email, password, userData);
      setIsLoading(false);

      if (result.success) {
        return true;
      } else {
        console.error('Sign up failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Sign up failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.signOutUser();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const result = await authService.resetPassword(email);
      return result.success;
    } catch (error) {
      console.error('Password reset failed:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    signUp,
    logout,
    resetPassword,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
