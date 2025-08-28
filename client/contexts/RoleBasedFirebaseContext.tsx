import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '@shared/role-based-database-types';
import { EmergencyRoutingService } from '../lib/emergency-routing-service';
import { UserService } from '../lib/role-based-database-service';
import { RealTimeNotificationService, useNotifications } from '../lib/real-time-notification-service';

interface RoleBasedFirebaseContextType {
  // Auth state
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  
  // Auth methods
  signIn: (email: string, password: string) => Promise<{ success: boolean; role?: string; error?: string }>;
  signUp: (email: string, password: string, name: string, role: UserProfile['role'], contact: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  
  // Role-based methods
  getUserRole: () => string | null;
  canAccess: (requiredRole: string) => boolean;
  canAccessAny: (roles: string[]) => boolean;
  isAdmin: () => boolean;
  
  // Emergency methods
  submitEmergencyReport: (reportData: any) => Promise<{ success: boolean; forwardedTo?: string[]; error?: string }>;
  
  // Notification methods
  notifications: any[];
  unreadNotificationCount: number;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
}

const RoleBasedFirebaseContext = createContext<RoleBasedFirebaseContextType | undefined>(undefined);

export const useRoleBasedFirebase = () => {
  const context = useContext(RoleBasedFirebaseContext);
  if (context === undefined) {
    throw new Error('useRoleBasedFirebase must be used within a RoleBasedFirebaseProvider');
  }
  return context;
};

interface RoleBasedFirebaseProviderProps {
  children: React.ReactNode;
}

export const RoleBasedFirebaseProvider: React.FC<RoleBasedFirebaseProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize notification system for current user
  const {
    notifications,
    unreadCount: unreadNotificationCount,
    markAsRead: markNotificationAsRead
  } = useNotifications(
    user?.uid || '',
    userProfile?.role || ''
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const profileData = userDoc.data() as UserProfile;
            setUserProfile(profileData);
          } else {
            // User exists in Auth but not in Firestore, this shouldn't happen in normal flow
            console.warn('User exists in Auth but not in Firestore');
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
        // Clean up notifications when user logs out
        RealTimeNotificationService.unsubscribeAll();
      }
      
      setLoading(false);
    });

    return () => {
      unsubscribe();
      RealTimeNotificationService.unsubscribeAll();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; role?: string; error?: string }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user profile to determine role
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfile;
        setUserProfile(profileData);
        
        return {
          success: true,
          role: profileData.role
        };
      } else {
        await signOut(auth);
        return {
          success: false,
          error: 'User profile not found. Please contact administrator.'
        };
      }
    } catch (error: any) {
      let errorMessage = 'Login failed';
      
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
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        default:
          errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    name: string, 
    role: UserProfile['role'], 
    contact: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Create Firebase Auth account
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(firebaseUser, { displayName: name });
      
      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        name,
        email,
        role,
        contact,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Create role-specific profile if needed
      if (role !== 'user') {
        await createRoleSpecificProfile(firebaseUser.uid, userProfile);
      }
      
      setUserProfile(userProfile);
      
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Signup failed';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        default:
          errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      // Clean up notifications before logout
      RealTimeNotificationService.unsubscribeAll();
      
      await signOut(auth);
      setUserProfile(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message);
    }
  };

  // Role-based access methods
  const getUserRole = (): string | null => {
    return userProfile?.role || null;
  };

  const canAccess = (requiredRole: string): boolean => {
    if (!userProfile) return false;
    if (userProfile.role === 'admin') return true; // Admin can access everything
    return userProfile.role === requiredRole;
  };

  const canAccessAny = (roles: string[]): boolean => {
    if (!userProfile) return false;
    if (userProfile.role === 'admin') return true; // Admin can access everything
    return roles.includes(userProfile.role);
  };

  const isAdmin = (): boolean => {
    return userProfile?.role === 'admin';
  };

  // Emergency methods
  const submitEmergencyReport = async (reportData: any): Promise<{ success: boolean; forwardedTo?: string[]; error?: string }> => {
    if (!user || !userProfile) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    try {
      // First create the report in user's collection
      const userReportId = await UserService.createDisasterReport(
        user.uid,
        reportData,
        userProfile.name
      );

      // Then forward to appropriate role collections
      const routingResult = await EmergencyRoutingService.processEmergencyReport(
        user.uid,
        userProfile.name,
        userReportId,
        reportData
      );

      if (routingResult.success) {
        // Send notifications to relevant roles
        const targetRoles = EmergencyRoutingService.getTargetRoles(reportData.type);
        if (targetRoles.length > 0) {
          // Get the created user report for notification
          const userReports = await UserService.getUserDisasterReports(user.uid);
          const createdReport = userReports.find(r => r.reportId === userReportId);
          
          if (createdReport) {
            await RealTimeNotificationService.sendEmergencyForwardedNotification(
              createdReport,
              targetRoles
            );
          }
        }

        return {
          success: true,
          forwardedTo: routingResult.forwardedTo
        };
      } else {
        return {
          success: false,
          error: routingResult.error
        };
      }
    } catch (error: any) {
      console.error('Error submitting emergency report:', error);
      return {
        success: false,
        error: error.message || 'Failed to submit emergency report'
      };
    }
  };

  const value: RoleBasedFirebaseContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    logout,
    getUserRole,
    canAccess,
    canAccessAny,
    isAdmin,
    submitEmergencyReport,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead
  };

  return (
    <RoleBasedFirebaseContext.Provider value={value}>
      {children}
    </RoleBasedFirebaseContext.Provider>
  );
};

// Helper function to create role-specific profiles
const createRoleSpecificProfile = async (uid: string, userProfile: UserProfile): Promise<void> => {
  const baseData = {
    uid,
    name: userProfile.name,
    email: userProfile.email,
    contact: userProfile.contact,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  switch (userProfile.role) {
    case 'police':
      await setDoc(doc(db, 'police', uid), {
        ...baseData,
        badgeNumber: `P-${Date.now()}`,
        rank: 'Officer',
        station: 'Central Station',
        isOnDuty: true,
        specializations: ['Emergency Response']
      });
      break;

    case 'ambulance':
      await setDoc(doc(db, 'ambulance', uid), {
        ...baseData,
        employeeId: `AMB-${Date.now()}`,
        vehicleNumber: `AMB-${Math.floor(Math.random() * 999)}`,
        isAvailable: true,
        specializations: ['Emergency Medical Technician']
      });
      break;

    case 'fireBrigade':
      await setDoc(doc(db, 'fireBrigade', uid), {
        ...baseData,
        firefighterId: `FF-${Date.now()}`,
        rank: 'Firefighter',
        station: 'Fire Station 1',
        isOnDuty: true,
        specializations: ['Fire Suppression', 'Rescue Operations']
      });
      break;

    case 'hospital':
      await setDoc(doc(db, 'hospital', uid), {
        ...baseData,
        hospitalName: 'General Hospital',
        department: 'Emergency Department',
        position: 'Emergency Physician',
        isOnDuty: true,
        specializations: ['Emergency Medicine']
      });
      break;

    case 'admin':
      await setDoc(doc(db, 'admin', uid), {
        ...baseData,
        adminLevel: 'system',
        permissions: ['full_access', 'role_management', 'system_logs'],
        lastLogin: serverTimestamp()
      });
      break;
  }
};

// Export for backward compatibility with existing components
export const useFirebase = useRoleBasedFirebase;
