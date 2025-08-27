import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { firebaseAuth } from "@/lib/firebase-auth";
import type { User, UserRole } from "@shared/types";

interface AuthContextType {
  user: User | null;
  logout: () => Promise<void>;
  isLoading: boolean;
  hasRole: (requiredRole: UserRole | UserRole[]) => boolean;
  isAdmin: () => boolean;
  isEmergencyResponder: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Named export for better HMR compatibility
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mounted && isLoading) {
        console.warn("Firebase auth initialization timeout");
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    // Listen for authentication state changes
    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      if (mounted) {
        clearTimeout(timeoutId);
        setUser(user);
        setIsLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [isLoading]);

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await firebaseAuth.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
    return firebaseAuth.hasRole(user, requiredRole);
  };

  const isAdmin = (): boolean => {
    return firebaseAuth.isAdmin(user);
  };

  const isEmergencyResponder = (): boolean => {
    return firebaseAuth.isEmergencyResponder(user);
  };

  const value: AuthContextType = {
    user,
    logout,
    isLoading,
    hasRole,
    isAdmin,
    isEmergencyResponder,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export named functions for better HMR compatibility
export { useAuth, AuthProvider };

// Export types for components
export type { User, UserRole };
