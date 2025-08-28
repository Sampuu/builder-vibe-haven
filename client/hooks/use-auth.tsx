import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseFirestore, isFirebaseAvailable } from '@/lib/firebase';
import { checkFirebaseAvailability } from '@/lib/serviceDetector';
import { offlineUserService } from '@/lib/offlineStorage';

export type UserRole = 'user' | 'police' | 'fire' | 'ambulance' | 'hospital' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  firebaseUser?: FirebaseUser;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
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
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const firebaseAvailable = await checkFirebaseAvailability();
        setIsOfflineMode(!firebaseAvailable);

        if (!firebaseAvailable) {
          // Use offline mode
          const currentUser = offlineUserService.getCurrentUser();
          setUser(currentUser);
          setIsLoading(false);
          return;
        }

        // Use Firebase mode
        const firebaseAuth = getFirebaseAuth();
        if (!firebaseAuth) {
          console.log('Firebase Auth not available, falling back to offline mode');
          setIsOfflineMode(true);
          const currentUser = offlineUserService.getCurrentUser();
          setUser(currentUser);
          setIsLoading(false);
          return;
        }

        const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
          try {
            if (firebaseUser) {
              // Get user data from Firestore
            const firebaseDb = getFirebaseFirestore();
            if (!firebaseDb) {
              throw new Error('Firestore not available');
            }
            const userDoc = await getDoc(doc(firebaseDb, 'users', firebaseUser.uid));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                setUser({
                  id: firebaseUser.uid,
                  email: firebaseUser.email!,
                  name: userData.name,
                  role: userData.role,
                  firebaseUser
                });
              } else {
                // Handle case where Firestore document doesn't exist
                console.error('User document not found in Firestore');
                if (firebaseAuth) {
                  await signOut(firebaseAuth);
                }
              }
            } else {
              setUser(null);
            }
          } catch (error) {
            console.error('Error in auth state change:', error);
            setUser(null);
          } finally {
            setIsLoading(false);
          }
        });

        return () => {
          if (unsubscribe) {
            unsubscribe();
          }
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false);
      }
    };

    initAuth().catch(console.error);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      if (isOfflineMode) {
        // Use offline authentication
        const result = await offlineUserService.signIn(email, password);
        if (result) {
          const userData = await offlineUserService.getUserData(result.uid);
          setUser({
            id: result.uid,
            email: result.email,
            name: userData.name,
            role: userData.role
          });
          setIsLoading(false);
          return true;
        } else {
          setIsLoading(false);
          return false;
        }
      } else {
        // Use Firebase authentication
        const firebaseAuth = getFirebaseAuth();
        if (!firebaseAuth) {
          throw new Error('Firebase Auth not available');
        }
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        // User state will be updated via onAuthStateChanged
        return true;
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);

    try {
      if (isOfflineMode) {
        // Use offline user creation
        const result = await offlineUserService.createUser(email, password, name, role);
        const userData = await offlineUserService.getUserData(result.uid);
        setUser({
          id: result.uid,
          email: result.email,
          name: userData.name,
          role: userData.role
        });
        setIsLoading(false);
        return true;
      } else {
        // Create Firebase user
        const firebaseAuth = getFirebaseAuth();
        const firebaseDb = getFirebaseFirestore();

        if (!firebaseAuth || !firebaseDb) {
          throw new Error('Firebase Auth or Firestore not available');
        }

        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);

        // Save additional user data to Firestore
        await setDoc(doc(firebaseDb, 'users', userCredential.user.uid), {
          name,
          email,
          role,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });

        // User state will be updated via onAuthStateChanged
        return true;
      }
    } catch (error: any) {
      console.error('Signup failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (isOfflineMode) {
        await offlineUserService.signOut();
        setUser(null);
      } else {
        const firebaseAuth = getFirebaseAuth();
        if (firebaseAuth) {
          await signOut(firebaseAuth);
          // User state will be updated via onAuthStateChanged
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Update last login when user logs in
  useEffect(() => {
    if (user && user.firebaseUser && !isOfflineMode) {
      const firebaseDb = getFirebaseFirestore();
      if (firebaseDb) {
        updateDoc(doc(firebaseDb, 'users', user.id), {
          lastLogin: new Date().toISOString()
        }).catch(console.error);
      }
    }
  }, [user, isOfflineMode]);

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
