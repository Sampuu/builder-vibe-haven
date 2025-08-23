import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userDatabase, UserRecord } from '@/lib/userDatabase';
import { isDevelopmentMode } from '@/lib/firebase';

export type UserRole = 'user' | 'police' | 'fire' | 'ambulance' | 'hospital' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phoneNumber?: string;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: UserRole, phoneNumber?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isFirebaseConnected: boolean;
  isDevelopmentMode: boolean;
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

// Convert UserRecord to User interface
const userRecordToUser = (record: UserRecord): User => ({
  id: record.id,
  email: record.email,
  name: record.name,
  role: record.role,
  phoneNumber: record.phoneNumber,
  department: record.department
});

// Session management
class SessionManager {
  private static instance: SessionManager;
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];
  private sessionKey = 'disaster-management-session';

  constructor() {
    this.loadSession();
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private loadSession() {
    try {
      const stored = localStorage.getItem(this.sessionKey);
      if (stored) {
        const sessionData = JSON.parse(stored);
        
        // Check if session is still valid (24 hours)
        const expiresAt = new Date(sessionData.expiresAt);
        if (expiresAt > new Date()) {
          this.currentUser = sessionData.user;
          console.log('📋 Session restored:', this.currentUser?.email);
        } else {
          this.clearSession();
          console.log('⏰ Session expired, cleared');
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      this.clearSession();
    }
  }

  private saveSession() {
    try {
      if (this.currentUser) {
        const sessionData = {
          user: this.currentUser,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };
        localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
      } else {
        this.clearSession();
      }
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  private clearSession() {
    localStorage.removeItem(this.sessionKey);
    this.currentUser = null;
  }

  setUser(user: User | null) {
    this.currentUser = user;
    this.saveSession();
    this.notifyListeners();
  }

  getUser(): User | null {
    return this.currentUser;
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentUser);
      } catch (error) {
        console.error('Error in auth listener:', error);
      }
    });
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    this.listeners.push(callback);
    // Immediately call with current user
    setTimeout(() => callback(this.currentUser), 0);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  logout() {
    this.setUser(null);
    console.log('👋 User logged out');
  }
}

const sessionManager = SessionManager.getInstance();

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = sessionManager.onAuthStateChanged((user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (
    email: string, 
    password: string, 
    name: string, 
    role: UserRole,
    phoneNumber?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('🔄 Starting instant signup process...');
      
      // Validate input immediately
      if (!email || !password || !name || !role) {
        throw new Error('All required fields must be filled');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Create user in database (instant)
      const userRecord = userDatabase.createUser({
        email,
        password,
        name,
        role,
        phoneNumber
      });

      // Set current user (instant)
      const newUser = userRecordToUser(userRecord);
      sessionManager.setUser(newUser);

      console.log('✅ Instant signup completed:', email);
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error('❌ Signup failed:', error.message);
      setIsLoading(false);
      throw error;
    }
  };

  const login = async (email: string, password: string, role?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('🔄 Starting instant login process...');
      
      // Validate input immediately
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Authenticate user (instant)
      const userRecord = userDatabase.authenticateUser(email, password, role);

      // Set current user (instant)
      const loginUser = userRecordToUser(userRecord);
      sessionManager.setUser(loginUser);

      console.log('✅ Instant login completed:', email);
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error('❌ Login failed:', error.message);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      sessionManager.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isLoading,
    isFirebaseConnected: false, // Always use local database
    isDevelopmentMode: isDevelopmentMode(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export user database for admin functions
export { userDatabase };
