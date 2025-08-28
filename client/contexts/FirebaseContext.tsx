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
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, UserRole } from '@shared/firebase-types';

interface FirebaseContextType {
  // Auth related
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  
  // Auth methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole, contact: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Firestore methods
  createDocument: (collectionName: string, data: any) => Promise<string>;
  getDocument: (collectionName: string, docId: string) => Promise<any>;
  updateDocument: (collectionName: string, docId: string, data: any) => Promise<void>;
  deleteDocument: (collectionName: string, docId: string) => Promise<void>;
  getDocuments: (collectionName: string, conditions?: any) => Promise<any[]>;
  
  // Role-based access
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isAdmin: () => boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

interface FirebaseProviderProps {
  children: React.ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole, contact: string) => {
    try {
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
        emergencyRequests: []
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
      setUserProfile(userProfile);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Firestore methods
  const createDocument = async (collectionName: string, data: any): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        timestamp: serverTimestamp()
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Error creating document: ${error.message}`);
    }
  };

  const getDocument = async (collectionName: string, docId: string) => {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Document not found');
      }
    } catch (error: any) {
      throw new Error(`Error getting document: ${error.message}`);
    }
  };

  const updateDocument = async (collectionName: string, docId: string, data: any) => {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      throw new Error(`Error updating document: ${error.message}`);
    }
  };

  const deleteDocument = async (collectionName: string, docId: string) => {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new Error(`Error deleting document: ${error.message}`);
    }
  };

  const getDocuments = async (collectionName: string, conditions?: any) => {
    try {
      let q = collection(db, collectionName);
      
      if (conditions) {
        if (conditions.where) {
          q = query(q as any, where(conditions.where.field, conditions.where.operator, conditions.where.value));
        }
        if (conditions.orderBy) {
          q = query(q as any, orderBy(conditions.orderBy.field, conditions.orderBy.direction || 'asc'));
        }
      }
      
      const querySnapshot = await getDocs(q as any);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
      throw new Error(`Error getting documents: ${error.message}`);
    }
  };

  // Role-based access methods
  const hasRole = (role: UserRole): boolean => {
    return userProfile?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return userProfile ? roles.includes(userProfile.role) : false;
  };

  const isAdmin = (): boolean => {
    return userProfile?.role === 'admin';
  };

  const value: FirebaseContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    logout,
    createDocument,
    getDocument,
    updateDocument,
    deleteDocument,
    getDocuments,
    hasRole,
    hasAnyRole,
    isAdmin
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
