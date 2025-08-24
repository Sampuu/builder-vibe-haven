import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type UserRole =
  | "user"
  | "police"
  | "fire"
  | "ambulance"
  | "hospital"
  | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  checkIfAdmin: (uid: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to check if user is admin
  const checkIfAdmin = async (uid: string): Promise<boolean> => {
    try {
      const adminDoc = await getDoc(doc(db, "admins", uid));
      return adminDoc.exists();
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  };

  // Function to get user data from Firestore
  const getUserData = async (
    firebaseUser: FirebaseUser,
  ): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: userData.name || firebaseUser.displayName || "",
          role: userData.role || "user",
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        // Get user data from Firestore
        const userData = await getUserData(firebaseUser);
        setUser(userData);
      } else {
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const userData = await getUserData(userCredential.user);
      setUser(userData);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Create user document in Firestore
      const userData = {
        name,
        role,
        email,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", userCredential.user.uid), userData);

      // If admin role, also add to admins collection
      if (role === "admin") {
        await setDoc(doc(db, "admins", userCredential.user.uid), {
          email,
          name,
          createdAt: new Date().toISOString(),
        });
      }

      // Set local user state
      setUser({
        id: userCredential.user.uid,
        email,
        name,
        role,
      });

      return true;
    } catch (error) {
      console.error("Signup failed:", error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    login,
    signup,
    logout,
    isLoading,
    checkIfAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
