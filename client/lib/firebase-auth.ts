import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import type { User, DatabaseResponse } from '@shared/types';

export type UserRole = 'user' | 'police' | 'fire' | 'ambulance' | 'hospital' | 'admin';

export interface SignupData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

// Convert Firebase User to our User type
const createUserProfile = async (firebaseUser: FirebaseUser, role?: UserRole): Promise<User | null> => {
  try {
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: userData.name || firebaseUser.displayName || '',
        phone: userData.phone,
        role: userData.role as UserRole,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return null;
  }
};

// Firebase Authentication Service
export const firebaseAuth = {
  // Sign up new user
  async signup(data: SignupData): Promise<DatabaseResponse<User>> {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, {
        displayName: data.name
      });

      // Create user document in Firestore
      const userData: Omit<User, 'id'> = {
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: data.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);

      // Return complete user object
      const user: User = {
        id: firebaseUser.uid,
        ...userData
      };

      return { success: true, data: user };
    } catch (error: any) {
      let errorMessage = 'Failed to create account';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      return { success: false, error: errorMessage };
    }
  },

  // Sign in existing user
  async login(data: LoginData): Promise<DatabaseResponse<User>> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;

      // Get user profile from Firestore
      const user = await createUserProfile(firebaseUser);
      
      if (!user) {
        throw new Error('User profile not found');
      }

      return { success: true, data: user };
    } catch (error: any) {
      let errorMessage = 'Failed to login';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      return { success: false, error: errorMessage };
    }
  },

  // Sign out user
  async logout(): Promise<DatabaseResponse<void>> {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await createUserProfile(firebaseUser);
        callback(user);
      } else {
        callback(null);
      }
    });
  },

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<DatabaseResponse<void>> {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Check if user has specific role
  hasRole(user: User | null, requiredRole: UserRole | UserRole[]): boolean {
    if (!user) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    return user.role === requiredRole;
  },

  // Check if user is admin
  isAdmin(user: User | null): boolean {
    return user?.role === 'admin';
  },

  // Check if user can access emergency services
  isEmergencyResponder(user: User | null): boolean {
    if (!user) return false;
    return ['police', 'fire', 'ambulance', 'hospital', 'admin'].includes(user.role);
  }
};

export default firebaseAuth;
