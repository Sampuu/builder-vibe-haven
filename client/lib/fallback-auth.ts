// Fallback authentication system using localStorage
// Used when Firebase is not configured
import { UserRole, User } from '@/hooks/use-auth';

const STORAGE_KEY = 'emergency-auth-user';
const USERS_KEY = 'emergency-auth-users';

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password: string; // Hashed in a real system
  createdAt: string;
  lastLogin?: string;
}

/**
 * Get all stored users from localStorage
 */
const getStoredUsers = (): StoredUser[] => {
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
};

/**
 * Save users to localStorage
 */
const saveStoredUsers = (users: StoredUser[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

/**
 * Create a new user account (fallback mode)
 */
export const createFallbackAccount = async (
  email: string, 
  password: string, 
  name: string, 
  role: UserRole
): Promise<User> => {
  try {
    const users = getStoredUsers();
    
    // Check if user already exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    // Create new user
    const newUser: StoredUser = {
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase(),
      name,
      role,
      password, // In real system, this would be hashed
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    // Save to localStorage
    users.push(newUser);
    saveStoredUsers(users);

    // Set current user
    const userSession = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(userSession));

    return userSession;
  } catch (error: any) {
    console.error('Error creating fallback account:', error);
    throw new Error(error.message || 'Failed to create account');
  }
};

/**
 * Sign in user (fallback mode)
 */
export const signInFallback = async (email: string, password: string): Promise<User> => {
  try {
    const users = getStoredUsers();
    
    // Find user by email
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('No account found with this email address');
    }

    // Check password (in real system, compare hashed passwords)
    if (user.password !== password) {
      throw new Error('Invalid password');
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    saveStoredUsers(users);

    // Set current user session
    const userSession = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(userSession));

    return userSession;
  } catch (error: any) {
    console.error('Error signing in fallback:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
};

/**
 * Sign out user (fallback mode)
 */
export const signOutFallback = async (): Promise<void> => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Get current user from localStorage
 */
export const getCurrentFallbackUser = (): User | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

/**
 * Listen to storage changes for auth state
 */
export const onFallbackAuthStateChange = (callback: (user: User | null) => void) => {
  // Initial check
  callback(getCurrentFallbackUser());

  // Listen for storage changes (for cross-tab sync)
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      try {
        const user = e.newValue ? JSON.parse(e.newValue) : null;
        callback(user);
      } catch {
        callback(null);
      }
    }
  };

  window.addEventListener('storage', handleStorageChange);

  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

/**
 * Debug function to see stored users
 */
export const debugFallbackAuth = () => {
  console.log('Fallback Auth Debug:');
  console.log('Current User:', getCurrentFallbackUser());
  console.log('All Users:', getStoredUsers());
  console.log('Storage Keys:', {
    currentUser: !!localStorage.getItem(STORAGE_KEY),
    allUsers: !!localStorage.getItem(USERS_KEY)
  });
};
