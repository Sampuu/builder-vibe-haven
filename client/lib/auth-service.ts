import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserRole } from '../hooks/use-auth';

interface UserData {
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  [key: string]: any;
}

class AuthService {
  // Sign up new user
  async signUp(email: string, password: string, userData: UserData) {
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile with additional data
      await updateProfile(user, {
        displayName: userData.displayName || '',
        photoURL: userData.photoURL || ''
      });

      // Save additional user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: userData.displayName || '',
        photoURL: userData.photoURL || '',
        role: userData.role,
        createdAt: new Date(),
        ...userData
      });

      return { success: true, user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Sign in existing user
  async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Sign out current user
  async signOutUser() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Password reset
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get user data from Firestore
  async getUserData(uid: string) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return { success: true, data: userDoc.data() };
      } else {
        return { success: false, error: 'User data not found' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Listen for auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }
}

export default new AuthService();
