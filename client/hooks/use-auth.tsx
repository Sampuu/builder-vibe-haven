import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, isFirebaseAvailable, isUsingMockAuth, isDevelopmentMode, devUtils } from '@/lib/firebase';
import { firestoreService, UserProfile } from '@/lib/firestore';

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

// Enhanced mock authentication service
class MockAuthService {
  private users: Map<string, User & { password: string }> = new Map();
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  constructor() {
    // Load from localStorage
    this.loadFromStorage();
    
    // Add demo users if they don't exist
    this.initializeDemoUsers();
    
    if (isDevelopmentMode()) {
      devUtils.log('Mock authentication service initialized');
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('mock-auth-users');
      if (stored) {
        const userData = JSON.parse(stored);
        this.users = new Map(userData.users || []);
        this.currentUser = userData.currentUser || null;
      }
    } catch (e) {
      console.warn('Failed to load mock auth data');
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('mock-auth-users', JSON.stringify({
        users: Array.from(this.users.entries()),
        currentUser: this.currentUser
      }));
    } catch (e) {
      console.warn('Failed to save mock auth data');
    }
  }

  private initializeDemoUsers() {
    const demoUsers = [
      { email: 'user@demo.com', password: 'demo123', name: 'Demo User', role: 'user' as UserRole },
      { email: 'police@demo.com', password: 'demo123', name: 'Police Officer', role: 'police' as UserRole },
      { email: 'fire@demo.com', password: 'demo123', name: 'Fire Fighter', role: 'fire' as UserRole },
      { email: 'ambulance@demo.com', password: 'demo123', name: 'Paramedic', role: 'ambulance' as UserRole },
      { email: 'hospital@demo.com', password: 'demo123', name: 'Hospital Staff', role: 'hospital' as UserRole },
      { email: 'admin@demo.com', password: 'demo123', name: 'System Admin', role: 'admin' as UserRole },
    ];

    demoUsers.forEach(demoUser => {
      if (!this.users.has(demoUser.email)) {
        const user: User & { password: string } = {
          id: `demo-${demoUser.role}`,
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
          password: demoUser.password
        };
        this.users.set(demoUser.email, user);
      }
    });

    this.saveToStorage();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentUser);
      } catch (e) {
        console.error('Error in auth listener:', e);
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

  async signUp(email: string, password: string, name: string, role: UserRole, phoneNumber?: string): Promise<boolean> {
    if (isDevelopmentMode()) {
      devUtils.log(`Mock signup attempt: ${email}, role: ${role}`);
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (this.users.has(email)) {
      throw new Error('An account with this email already exists');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const user: User & { password: string } = {
      id: `mock-${Date.now()}`,
      email,
      name,
      role,
      phoneNumber,
      password
    };

    this.users.set(email, user);
    this.currentUser = { ...user };
    delete (this.currentUser as any).password; // Remove password from current user
    this.saveToStorage();
    this.notifyListeners();
    
    if (isDevelopmentMode()) {
      devUtils.log(`Mock signup successful: ${email}`);
    }
    
    return true;
  }

  async signIn(email: string, password: string, expectedRole?: UserRole): Promise<boolean> {
    if (isDevelopmentMode()) {
      devUtils.log(`Mock login attempt: ${email}, expected role: ${expectedRole}`);
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = this.users.get(email);
    if (!user) {
      throw new Error('No account found with this email address');
    }

    if (user.password !== password) {
      throw new Error('Incorrect password');
    }

    if (expectedRole && user.role !== expectedRole) {
      throw new Error(`Role mismatch. This account is registered as ${user.role}, not ${expectedRole}`);
    }

    this.currentUser = { ...user };
    delete (this.currentUser as any).password; // Remove password from current user
    this.saveToStorage();
    this.notifyListeners();
    
    if (isDevelopmentMode()) {
      devUtils.log(`Mock login successful: ${email}, role: ${user.role}`);
    }
    
    return true;
  }

  async signOut(): Promise<void> {
    if (isDevelopmentMode()) {
      devUtils.log('Mock logout');
    }
    
    this.currentUser = null;
    this.saveToStorage();
    this.notifyListeners();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}

const mockAuth = new MockAuthService();

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  useEffect(() => {
    // Check if we should use Firebase or mock auth
    const shouldUseFirebase = isFirebaseAvailable() && !isUsingMockAuth();
    setIsFirebaseConnected(shouldUseFirebase);

    if (isDevelopmentMode()) {
      devUtils.log(`Auth provider initialized - Firebase: ${shouldUseFirebase}, Mock: ${!shouldUseFirebase}`);
    }

    let unsubscribe: (() => void) | undefined;

    if (shouldUseFirebase && auth) {
      if (isDevelopmentMode()) {
        devUtils.log('Using Firebase authentication');
      }
      
      // Use Firebase authentication
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          try {
            // Get user profile from Firestore
            const profileDoc = await firestoreService.getUserProfile(firebaseUser.uid);
            
            if (profileDoc.exists()) {
              const profileData = profileDoc.data() as UserProfile;
              setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email!,
                name: profileData.name,
                role: profileData.role,
                phoneNumber: profileData.phoneNumber,
                department: profileData.department
              });
              
              if (isDevelopmentMode()) {
                devUtils.log(`Firebase user loaded: ${firebaseUser.email}, role: ${profileData.role}`);
              }
            } else {
              // If no profile exists, user might be incomplete
              setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email!,
                name: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
                role: 'user' // Default role
              });
              
              if (isDevelopmentMode()) {
                devUtils.log(`Firebase user loaded without profile: ${firebaseUser.email}`);
              }
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            setUser(null);
          }
        } else {
          setUser(null);
          if (isDevelopmentMode()) {
            devUtils.log('Firebase user signed out');
          }
        }
        setIsLoading(false);
      });
    } else {
      if (isDevelopmentMode()) {
        devUtils.log('Using mock authentication');
      }
      
      // Use mock authentication
      unsubscribe = mockAuth.onAuthStateChanged((mockUser) => {
        setUser(mockUser);
        setIsLoading(false);
      });
    }

    return () => unsubscribe?.();
  }, []);

  const login = async (email: string, password: string, role?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      if (isFirebaseConnected && auth) {
        if (isDevelopmentMode()) {
          devUtils.log(`Firebase login attempt: ${email}`);
        }
        
        // Firebase authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Get or create user profile
        const profileDoc = await firestoreService.getUserProfile(firebaseUser.uid);
        
        if (profileDoc.exists()) {
          const profileData = profileDoc.data() as UserProfile;
          
          // If role is provided, verify it matches the stored role
          if (role && profileData.role !== role) {
            await signOut(auth);
            setIsLoading(false);
            throw new Error(`Role mismatch. This account is registered as ${profileData.role}, not ${role}`);
          }

          // Update last login
          await firestoreService.updateUserProfile(firebaseUser.uid, {
            lastLoginAt: new Date() as any
          });
        }

        setIsLoading(false);
        return true;
      } else {
        // Mock authentication
        await mockAuth.signIn(email, password, role);
        setIsLoading(false);
        return true;
      }
    } catch (error: any) {
      if (isDevelopmentMode()) {
        devUtils.log(`Login failed: ${error.message}`);
      }
      
      setIsLoading(false);
      throw error; // Re-throw to let the UI handle the error message
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    name: string, 
    role: UserRole,
    phoneNumber?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      if (isFirebaseConnected && auth) {
        if (isDevelopmentMode()) {
          devUtils.log(`Firebase signup attempt: ${email}, role: ${role}`);
        }
        
        // Firebase authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Create user profile in Firestore
        await firestoreService.createUserProfile(firebaseUser.uid, {
          email: firebaseUser.email!,
          name,
          role,
          phoneNumber,
          isActive: true
        });

        setIsLoading(false);
        return true;
      } else {
        // Mock authentication
        await mockAuth.signUp(email, password, name, role, phoneNumber);
        setIsLoading(false);
        return true;
      }
    } catch (error: any) {
      if (isDevelopmentMode()) {
        devUtils.log(`Signup failed: ${error.message}`);
      }
      
      setIsLoading(false);
      throw error; // Re-throw to let the UI handle the error message
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (isFirebaseConnected && auth) {
        await signOut(auth);
      } else {
        await mockAuth.signOut();
      }
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
    isFirebaseConnected,
    isDevelopmentMode: isDevelopmentMode(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
