import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, isFirebaseAvailable } from '@/lib/firebase';
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

// Mock authentication for when Firebase is not available
class MockAuthService {
  private users: Map<string, User> = new Map();
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  constructor() {
    // Load from localStorage
    const stored = localStorage.getItem('mock-auth-users');
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        this.users = new Map(userData.users || []);
        this.currentUser = userData.currentUser || null;
      } catch (e) {
        console.warn('Failed to load mock auth data');
      }
    }
  }

  private saveToStorage() {
    localStorage.setItem('mock-auth-users', JSON.stringify({
      users: Array.from(this.users.entries()),
      currentUser: this.currentUser
    }));
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    this.listeners.push(callback);
    // Immediately call with current user
    callback(this.currentUser);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  async signUp(email: string, password: string, name: string, role: UserRole, phoneNumber?: string): Promise<boolean> {
    if (this.users.has(email)) {
      throw new Error('User already exists');
    }

    const user: User = {
      id: `mock-${Date.now()}`,
      email,
      name,
      role,
      phoneNumber
    };

    this.users.set(email, user);
    this.currentUser = user;
    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  async signIn(email: string, password: string, expectedRole?: UserRole): Promise<boolean> {
    const user = this.users.get(email);
    if (!user) {
      throw new Error('User not found');
    }

    if (expectedRole && user.role !== expectedRole) {
      throw new Error('Role mismatch');
    }

    this.currentUser = user;
    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  async signOut(): Promise<void> {
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
    const firebaseAvailable = isFirebaseAvailable();
    setIsFirebaseConnected(firebaseAvailable);

    let unsubscribe: (() => void) | undefined;

    if (firebaseAvailable && auth) {
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
            } else {
              // If no profile exists, user might be incomplete
              setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email!,
                name: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
                role: 'user' // Default role
              });
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });
    } else {
      // Use mock authentication
      console.log('🔄 Using mock authentication (Firebase not available)');
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
            return false;
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
      console.error('Login failed:', error);
      setIsLoading(false);
      
      // Provide user-friendly error messages
      if (error.code === 'auth/network-request-failed') {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      } else if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Login failed. Please try again.');
      }
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
      console.error('Signup failed:', error);
      setIsLoading(false);
      
      // Provide user-friendly error messages
      if (error.code === 'auth/network-request-failed') {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      } else if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Account creation failed. Please try again.');
      }
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
