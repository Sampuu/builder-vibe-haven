import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
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

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string, role?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    
    try {
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
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
      return false;
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
    } catch (error) {
      console.error('Signup failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
