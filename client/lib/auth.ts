import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db, isFirebaseAvailable } from './firebase';
import {
  createFallbackAccount,
  signInFallback,
  signOutFallback,
  onFallbackAuthStateChange
} from './fallback-auth';
import { UserRole, User } from '@/hooks/use-auth';

// User data interface for Firestore
export interface UserData {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  lastLogin?: Date;
}

/**
 * Create a new user account with Firebase Auth and store user data in Firestore
 * Falls back to localStorage if Firebase is not configured
 */
export const createUserAccount = async (
  email: string,
  password: string,
  name: string,
  role: UserRole
): Promise<User> => {
  // Use fallback authentication if Firebase is not available
  if (!isFirebaseAvailable()) {
    console.log('📱 Using fallback authentication for account creation');
    return await createFallbackAccount(email, password, name, role);
  }

  try {
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update the user's display name
    await updateProfile(firebaseUser, {
      displayName: name
    });

    // Create user data for Firestore
    const userData: UserData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      name,
      role,
      createdAt: new Date(),
      lastLogin: new Date()
    };

    // Store user data in Firestore
    await setDoc(doc(db, 'users', firebaseUser.uid), userData);

    console.log('🔥 Firebase account created successfully');

    // Return the user object for our app
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name,
      role
    };
  } catch (error: any) {
    console.error('Error creating Firebase user account:', error);
    console.log('📱 Falling back to local storage authentication');

    // Fallback to localStorage on Firebase error
    return await createFallbackAccount(email, password, name, role);
  }
};

/**
 * Sign in user with email and password
 * Falls back to localStorage if Firebase is not configured
 */
export const signInUser = async (email: string, password: string): Promise<User> => {
  // Use fallback authentication if Firebase is not available
  if (!isFirebaseAvailable()) {
    console.log('📱 Using fallback authentication for sign in');
    return await signInFallback(email, password);
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    const userData = userDoc.data() as UserData;

    // Update last login time
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...userData,
      lastLogin: new Date()
    }, { merge: true });

    console.log('🔥 Firebase sign in successful');

    return {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name: userData.name,
      role: userData.role
    };
  } catch (error: any) {
    console.error('Error signing in with Firebase:', error);
    console.log('📱 Falling back to local storage authentication');

    // Fallback to localStorage on Firebase error
    return await signInFallback(email, password);
  }
};

/**
 * Sign out the current user
 * Falls back to localStorage if Firebase is not configured
 */
export const signOutUser = async (): Promise<void> => {
  // Use fallback authentication if Firebase is not available
  if (!isFirebaseAvailable()) {
    console.log('📱 Using fallback authentication for sign out');
    return await signOutFallback();
  }

  try {
    await signOut(auth);
    console.log('🔥 Firebase sign out successful');
  } catch (error: any) {
    console.error('Error signing out with Firebase:', error);
    console.log('📱 Falling back to local storage sign out');

    // Fallback to localStorage on Firebase error
    await signOutFallback();
  }
};

/**
 * Get user data from Firestore by Firebase user
 */
export const getUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data() as UserData;
    
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name: userData.name,
      role: userData.role
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Listen to authentication state changes
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userData = await getUserData(firebaseUser);
      callback(userData);
    } else {
      callback(null);
    }
  });
};

/**
 * Check if email is already registered
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
  }
};
