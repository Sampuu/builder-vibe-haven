import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from './firebase';
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

    await setDoc(userRef, userData);
    return { id: firebaseUser.uid, ...userData };
  }

  // Update last login time if user exists
  await updateDoc(userRef, { 
    lastLoginAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const userData = userDoc.data() as Omit<User, 'id'>;
  return { id: firebaseUser.uid, ...userData };
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
    await updateProfile(userCredential.user, {
      displayName: additionalData.displayName
    });

    // Send email verification
    await sendEmailVerification(userCredential.user);

    // Create user document in Firestore
    const userData: Partial<User> = {
      ...additionalData,
      role,
      status: 'pending', // Pending until email verification
      permissions: DEFAULT_PERMISSIONS[role]
    };

    const user = await createUserDocument(userCredential.user, userData);

    return {
      success: true,
      user,
      requiresEmailVerification: true
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
      requiresEmailVerification: !userCredential.user.emailVerified
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
      updatedAt: new Date().toISOString()
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
 * Check if email is already registered
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const usersRef = collection(db, USER_COLLECTION);
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
  }
};

/**
 * Authentication state change listener
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const user = await getUserDocument(firebaseUser.uid);
      callback(user);
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
        const user = await getUserDocument(firebaseUser.uid);
        resolve(user);
      } else {
        resolve(null);
      }
    });
  });
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (
  uid: string, 
  newRole: UserRole,
  updatedBy: string
): Promise<void> => {
  try {
    const userRef = doc(db, USER_COLLECTION, uid);
    
    await updateDoc(userRef, {
      role: newRole,
      permissions: DEFAULT_PERMISSIONS[newRole],
      updatedAt: new Date().toISOString(),
      updatedBy
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error('Failed to update user role');
  }
};

/**
 * Update user status (admin only)
 */
export const updateUserStatus = async (
  uid: string, 
  status: User['status'],
  updatedBy: string
): Promise<void> => {
  try {
    const userRef = doc(db, USER_COLLECTION, uid);
    
    await updateDoc(userRef, {
      status,
      updatedAt: new Date().toISOString(),
      updatedBy
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    throw new Error('Failed to update user status');
  }
};
