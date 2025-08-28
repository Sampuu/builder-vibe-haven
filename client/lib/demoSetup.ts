import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserRole } from '@/hooks/use-auth';
import { checkFirebaseAvailability } from './serviceDetector';
import { offlineDemoService } from './offlineStorage';

export interface DemoAccount {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export const demoAccounts: DemoAccount[] = [
  {
    email: 'user@demo.com',
    password: 'demo123',
    name: 'John Citizen',
    role: 'user'
  },
  {
    email: 'police@demo.com',
    password: 'demo123',
    name: 'Officer Smith',
    role: 'police'
  },
  {
    email: 'fire@demo.com',
    password: 'demo123',
    name: 'Chief Johnson',
    role: 'fire'
  },
  {
    email: 'ambulance@demo.com',
    password: 'demo123',
    name: 'Paramedic Davis',
    role: 'ambulance'
  },
  {
    email: 'hospital@demo.com',
    password: 'demo123',
    name: 'Dr. Wilson',
    role: 'hospital'
  },
  {
    email: 'admin@demo.com',
    password: 'demo123',
    name: 'System Admin',
    role: 'admin'
  }
];

export const createDemoAccount = async (account: DemoAccount): Promise<boolean> => {
  try {
    // Check if account already exists in Firestore
    const userDocRef = doc(db, 'demoUsers', account.email);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      console.log(`Demo account ${account.email} already exists`);
      return true;
    }

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, account.email, account.password);
    
    // Save user data to Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      name: account.name,
      email: account.email,
      role: account.role,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isDemo: true
    });

    // Mark as created in demo tracking
    await setDoc(userDocRef, {
      created: true,
      createdAt: new Date().toISOString(),
      uid: userCredential.user.uid
    });

    console.log(`Demo account created: ${account.email} (${account.role})`);
    return true;
  } catch (error: any) {
    // If user already exists in Firebase Auth, that's okay
    if (error.code === 'auth/email-already-in-use') {
      console.log(`Demo account ${account.email} already exists in Firebase Auth`);
      
      // Still mark as created in demo tracking if not already marked
      const userDocRef = doc(db, 'demoUsers', account.email);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          created: true,
          createdAt: new Date().toISOString(),
          existedBefore: true
        });
      }
      return true;
    }
    
    console.error(`Failed to create demo account ${account.email}:`, error);
    return false;
  }
};

export const setupDemoAccounts = async (): Promise<void> => {
  console.log('Setting up demo accounts...');

  const isFirebaseAvailable = await checkFirebaseAvailability();

  if (!isFirebaseAvailable) {
    // Use offline demo setup
    await offlineDemoService.setupDemoAccounts();
    return;
  }

  // Use Firebase demo setup
  for (const account of demoAccounts) {
    await createDemoAccount(account);
  }

  console.log('Demo accounts setup completed');
};

// Helper function to check if we're in demo mode (using demo Firebase config)
export const isDemoMode = (): boolean => {
  return import.meta.env.VITE_FIREBASE_PROJECT_ID === 'demo-project';
};
