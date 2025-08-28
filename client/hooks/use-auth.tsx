import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useFirebase } from "@/contexts/FirebaseContext";
import { UserRole } from "@shared/firebase-types";

export type { UserRole };

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  const firebase = useFirebase();

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    if (firebase.user && firebase.userProfile) {
      const user: User = {
        id: firebase.user.uid,
        email: firebase.user.email || "",
        name: firebase.userProfile.name,
        role: firebase.userProfile.role,
      };
      setUser(user);
    } else {
      setUser(null);
    }

    // Set loading to false when Firebase loading is complete
    setIsLoading(firebase.loading);
  }, [firebase.user, firebase.userProfile, firebase.loading]);

  const login = async (
    email: string,
    password: string,
    role?: UserRole,
  ): Promise<boolean> => {
    try {
      await firebase.signIn(email, password);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await firebase.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
