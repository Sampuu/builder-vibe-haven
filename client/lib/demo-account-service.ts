import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { 
  DEMO_ACCOUNTS,
  DemoAccount,
  UserProfile,
  PoliceProfile,
  AmbulanceProfile,
  FireBrigadeProfile,
  HospitalProfile,
  AdminProfile
} from '@shared/role-based-database-types';

export class DemoAccountService {
  
  /**
   * Create all 6 demo accounts with their respective roles and data
   * NOTE: In a real implementation, custom claims would be set using Firebase Admin SDK on the server
   */
  static async createAllDemoAccounts(): Promise<{
    success: boolean;
    created: string[];
    failed: { email: string; error: string }[];
  }> {
    const created: string[] = [];
    const failed: { email: string; error: string }[] = [];

    for (const account of DEMO_ACCOUNTS) {
      try {
        const result = await this.createDemoAccount(account);
        if (result.success) {
          created.push(account.email);
        } else {
          failed.push({ email: account.email, error: result.error || 'Unknown error' });
        }
      } catch (error) {
        failed.push({ 
          email: account.email, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      success: failed.length === 0,
      created,
      failed
    };
  }

  /**
   * Create a single demo account with role-specific profile
   */
  static async createDemoAccount(account: DemoAccount): Promise<{
    success: boolean;
    uid?: string;
    error?: string;
  }> {
    try {
      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        account.email, 
        account.password
      );
      
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, {
        displayName: this.getDisplayNameForRole(account.role)
      });

      // Create role-specific profile in Firestore
      await this.createRoleProfile(user.uid, account);

      // NOTE: In a real implementation, you would set custom claims here using Firebase Admin SDK
      // For demo purposes, we're storing role info in the user profile
      console.log(`Demo account created: ${account.email} with role: ${account.role}`);

      return {
        success: true,
        uid: user.uid
      };

    } catch (error: any) {
      console.error(`Error creating demo account ${account.email}:`, error);
      
      // Handle specific Firebase Auth errors
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Create role-specific profile in Firestore
   */
  private static async createRoleProfile(uid: string, account: DemoAccount): Promise<void> {
    const baseProfile = {
      uid,
      name: this.getDisplayNameForRole(account.role),
      email: account.email,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    switch (account.role) {
      case 'user':
        await this.createUserProfile(uid, baseProfile);
        break;
      case 'police':
        await this.createPoliceProfile(uid, baseProfile);
        break;
      case 'ambulance':
        await this.createAmbulanceProfile(uid, baseProfile);
        break;
      case 'fireBrigade':
        await this.createFireBrigadeProfile(uid, baseProfile);
        break;
      case 'hospital':
        await this.createHospitalProfile(uid, baseProfile);
        break;
      case 'admin':
        await this.createAdminProfile(uid, baseProfile);
        break;
      default:
        throw new Error(`Unknown role: ${account.role}`);
    }
  }

  /**
   * Create user profile
   */
  private static async createUserProfile(uid: string, baseProfile: any): Promise<void> {
    const userProfile: UserProfile = {
      ...baseProfile,
      role: 'user',
      contact: '+1-555-0001',
      isActive: true,
      profilePicture: 'https://via.placeholder.com/150/007bff/ffffff?text=U'
    };

    await setDoc(doc(db, 'users', uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Create police profile
   */
  private static async createPoliceProfile(uid: string, baseProfile: any): Promise<void> {
    const policeProfile: PoliceProfile = {
      ...baseProfile,
      badgeNumber: 'P-12345',
      rank: 'Officer',
      station: 'Central Police Station',
      contact: '+1-555-0002',
      isOnDuty: true,
      specializations: ['Traffic Control', 'Emergency Response']
    };

    // Create main police profile
    await setDoc(doc(db, 'police', uid), {
      ...policeProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Also create user profile for authentication purposes
    const userProfile: UserProfile = {
      ...baseProfile,
      role: 'police',
      contact: policeProfile.contact,
      isActive: true
    };

    await setDoc(doc(db, 'users', uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Create ambulance profile
   */
  private static async createAmbulanceProfile(uid: string, baseProfile: any): Promise<void> {
    const ambulanceProfile: AmbulanceProfile = {
      ...baseProfile,
      employeeId: 'AMB-67890',
      vehicleNumber: 'AMB-001',
      currentLocation: {
        latitude: 37.7749,
        longitude: -122.4194,
        address: 'San Francisco General Hospital'
      },
      isAvailable: true,
      specializations: ['Emergency Medical Technician', 'Advanced Life Support'],
      contact: '+1-555-0003'
    };

    // Create main ambulance profile
    await setDoc(doc(db, 'ambulance', uid), {
      ...ambulanceProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Also create user profile for authentication purposes
    const userProfile: UserProfile = {
      ...baseProfile,
      role: 'ambulance',
      contact: ambulanceProfile.contact,
      isActive: true
    };

    await setDoc(doc(db, 'users', uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Create fire brigade profile
   */
  private static async createFireBrigadeProfile(uid: string, baseProfile: any): Promise<void> {
    const fireProfile: FireBrigadeProfile = {
      ...baseProfile,
      firefighterId: 'FF-54321',
      rank: 'Firefighter',
      station: 'Fire Station 19',
      isOnDuty: true,
      specializations: ['Fire Suppression', 'Rescue Operations', 'Hazmat Response'],
      contact: '+1-555-0004'
    };

    // Create main fire brigade profile
    await setDoc(doc(db, 'fireBrigade', uid), {
      ...fireProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Also create user profile for authentication purposes
    const userProfile: UserProfile = {
      ...baseProfile,
      role: 'fireBrigade',
      contact: fireProfile.contact,
      isActive: true
    };

    await setDoc(doc(db, 'users', uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Create hospital profile
   */
  private static async createHospitalProfile(uid: string, baseProfile: any): Promise<void> {
    const hospitalProfile: HospitalProfile = {
      ...baseProfile,
      hospitalName: 'City General Hospital',
      department: 'Emergency Department',
      position: 'Emergency Physician',
      contact: '+1-555-0005',
      isOnDuty: true,
      specializations: ['Emergency Medicine', 'Trauma Surgery', 'Critical Care']
    };

    // Create main hospital profile
    await setDoc(doc(db, 'hospital', uid), {
      ...hospitalProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Also create user profile for authentication purposes
    const userProfile: UserProfile = {
      ...baseProfile,
      role: 'hospital',
      contact: hospitalProfile.contact,
      isActive: true
    };

    await setDoc(doc(db, 'users', uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Create admin profile
   */
  private static async createAdminProfile(uid: string, baseProfile: any): Promise<void> {
    const adminProfile: AdminProfile = {
      ...baseProfile,
      adminLevel: 'system',
      permissions: ['full_access', 'role_management', 'system_logs', 'user_management'],
      contact: '+1-555-0006',
      lastLogin: new Date()
    };

    // Create main admin profile
    await setDoc(doc(db, 'admin', uid), {
      ...adminProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Also create user profile for authentication purposes
    const userProfile: UserProfile = {
      ...baseProfile,
      role: 'admin',
      contact: adminProfile.contact,
      isActive: true
    };

    await setDoc(doc(db, 'users', uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Get display name for role
   */
  private static getDisplayNameForRole(role: string): string {
    const roleNames = {
      user: 'Demo User',
      police: 'Officer Demo',
      ambulance: 'Paramedic Demo',
      fireBrigade: 'Firefighter Demo',
      hospital: 'Dr. Demo',
      admin: 'System Admin'
    };
    return roleNames[role as keyof typeof roleNames] || 'Demo User';
  }

  /**
   * Test login with demo account
   */
  static async testDemoLogin(email: string, password: string): Promise<{
    success: boolean;
    user?: any;
    role?: string;
    error?: string;
  }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user profile to determine role
      const userDoc = await import('firebase/firestore').then(({ doc, getDoc }) => 
        getDoc(doc(db, 'users', user.uid))
      );

      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          success: true,
          user: user,
          role: userData.role
        };
      } else {
        return {
          success: false,
          error: 'User profile not found'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all demo account credentials for testing
   */
  static getDemoCredentials(): { role: string; email: string; password: string }[] {
    return DEMO_ACCOUNTS.map(account => ({
      role: account.role,
      email: account.email,
      password: account.password
    }));
  }

  /**
   * Delete all demo accounts (for cleanup)
   */
  static async deleteAllDemoAccounts(): Promise<{
    success: boolean;
    deleted: string[];
    failed: { email: string; error: string }[];
  }> {
    const deleted: string[] = [];
    const failed: { email: string; error: string }[] = [];

    for (const account of DEMO_ACCOUNTS) {
      try {
        // Sign in first to delete the account
        const result = await signInWithEmailAndPassword(auth, account.email, account.password);
        await result.user.delete();
        deleted.push(account.email);
      } catch (error) {
        failed.push({
          email: account.email,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      success: failed.length === 0,
      deleted,
      failed
    };
  }

  /**
   * Setup initial demo data for each role
   */
  static async setupDemoData(): Promise<void> {
    // This would create sample incidents, reports, etc. for demonstration
    // Implementation would depend on specific demo requirements
    console.log('Demo data setup completed');
  }
}

// =================== DEMO ACCOUNT CREDENTIALS ===================
export const DEMO_CREDENTIALS = {
  USER: { email: 'user_demo@test.com', password: 'password123', role: 'user' },
  POLICE: { email: 'police_demo@test.com', password: 'password123', role: 'police' },
  AMBULANCE: { email: 'ambulance_demo@test.com', password: 'password123', role: 'ambulance' },
  FIRE: { email: 'fire_demo@test.com', password: 'password123', role: 'fireBrigade' },
  HOSPITAL: { email: 'hospital_demo@test.com', password: 'password123', role: 'hospital' },
  ADMIN: { email: 'admin_demo@test.com', password: 'password123', role: 'admin' }
};

/**
 * Quick access function to create demo accounts for presentation
 */
export const setupDemoEnvironment = async (): Promise<{
  success: boolean;
  message: string;
  accounts?: { role: string; email: string; password: string }[];
}> => {
  try {
    const result = await DemoAccountService.createAllDemoAccounts();
    
    if (result.success) {
      await DemoAccountService.setupDemoData();
      
      return {
        success: true,
        message: `Successfully created ${result.created.length} demo accounts`,
        accounts: Object.values(DEMO_CREDENTIALS)
      };
    } else {
      return {
        success: false,
        message: `Created ${result.created.length} accounts, ${result.failed.length} failed`,
        accounts: Object.values(DEMO_CREDENTIALS)
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to setup demo environment: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};
