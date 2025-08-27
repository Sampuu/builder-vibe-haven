import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from './firebase-realtime';
import { 
  User, 
  UserRole, 
  UserRegistrationRequest, 
  UserProfileUpdateRequest, 
  AuthResponse,
  USER_COLLECTION,
  DEFAULT_PERMISSIONS
} from '@shared/api';

/**
 * Create user document in Firestore
 */
const createUserDocument = async (
  firebaseUser: FirebaseUser, 
  additionalData: Partial<User> = {}
): Promise<User> => {
  if (!firebaseUser) throw new Error('Firebase user is required');

  const userRef = doc(db, USER_COLLECTION, firebaseUser.uid);
  
  try {
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const { displayName, email } = firebaseUser;
      const now = new Date().toISOString();
      
      const userData: Omit<User, 'id'> = {
        email: email || '',
        displayName: displayName || email?.split('@')[0] || '',
        role: 'user', // Default role
        status: 'active',
        permissions: DEFAULT_PERMISSIONS.user,
        createdAt: now,
        updatedAt: now,
        ...additionalData
      };

      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { id: firebaseUser.uid, ...userData };
    }

    // Update last login time if user exists
    await updateDoc(userRef, { 
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    const userData = userDoc.data() as Omit<User, 'id'>;
    return { id: firebaseUser.uid, ...userData };
  } catch (error) {
    console.error('Error creating/fetching user document:', error);
    // Return a fallback user object if Firestore fails
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
      role: 'user',
      status: 'active',
      permissions: DEFAULT_PERMISSIONS.user,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...additionalData
    };
  }
};

/**
 * Get user document from Firestore
 */
export const getUserDocument = async (uid: string): Promise<User | null> => {
  try {
    const userRef = doc(db, USER_COLLECTION, uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as Omit<User, 'id'>;
      return { id: uid, ...userData };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user document:', error);
    return null;
  }
};

/**
 * Register a new user with email and password
 */
export const registerUser = async (
  registrationData: UserRegistrationRequest
): Promise<AuthResponse> => {
  try {
    const { email, password, role, ...additionalData } = registrationData;

    // Create Firebase Auth user
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth, 
      email, 
      password
    );

    // Update Firebase Auth profile
    if (additionalData.displayName) {
      await updateProfile(userCredential.user, {
        displayName: additionalData.displayName
      });
    }

    // Send email verification (optional for development)
    try {
      await sendEmailVerification(userCredential.user);
    } catch (verificationError) {
      console.warn('Email verification failed:', verificationError);
      // Continue without verification in development
    }

    // Create user document in Firestore
    const userData: Partial<User> = {
      ...additionalData,
      role,
      status: 'active',
      permissions: DEFAULT_PERMISSIONS[role]
    };

    const user = await createUserDocument(userCredential.user, userData);

    return {
      success: true,
      user,
      requiresEmailVerification: false // Simplified for development
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    
    let errorMessage = 'Registration failed';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Email is already registered';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network connection failed. Please check if Firebase emulators are running.';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Sign in user with email and password
 */
export const signInUser = async (
  email: string, 
  password: string
): Promise<AuthResponse> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = await createUserDocument(userCredential.user);

    return {
      success: true,
      user,
      requiresEmailVerification: false // Simplified for development
    };
  } catch (error: any) {
    console.error('Sign in error:', error);
    
    let errorMessage = 'Sign in failed';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network connection failed. Please check if Firebase emulators are running.';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Sign out current user
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out');
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  uid: string,
  updates: UserProfileUpdateRequest
): Promise<void> => {
  try {
    const userRef = doc(db, USER_COLLECTION, uid);
    
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    await updateDoc(userRef, updateData);

    // Update Firebase Auth profile if displayName changed
    if (updates.displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: updates.displayName
      });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update profile');
  }
};

/**
 * Authentication state change listener
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const user = await getUserDocument(firebaseUser.uid);
        if (user) {
          callback(user);
        } else {
          // Create user document if it doesn't exist
          const newUser = await createUserDocument(firebaseUser);
          callback(newUser);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      unsubscribe();
      if (firebaseUser) {
        try {
          const user = await getUserDocument(firebaseUser.uid);
          resolve(user);
        } catch (error) {
          console.error('Error getting current user:', error);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
};
