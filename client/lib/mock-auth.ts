import {
  User,
  UserRole,
  UserRegistrationRequest,
  UserProfileUpdateRequest,
  AuthResponse,
  DEFAULT_PERMISSIONS
} from '@shared/api';

// Mock user storage key
const USERS_STORAGE_KEY = 'mock_users';
const CURRENT_USER_KEY = 'mock_current_user';

// Helper to generate simple IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Get users from localStorage
const getStoredUsers = (): Record<string, User> => {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Save users to localStorage
const saveUsers = (users: Record<string, User>) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.warn('Failed to save users to localStorage:', error);
  }
};

// Get current user from localStorage
const getCurrentStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// Save current user to localStorage
const saveCurrentUser = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (error) {
    console.warn('Failed to save current user to localStorage:', error);
  }
};

// Auth state listeners
const authListeners: ((user: User | null) => void)[] = [];

const notifyAuthListeners = (user: User | null) => {
  authListeners.forEach(listener => listener(user));
};

/**
 * Register a new user (mock implementation)
 */
export const registerUser = async (
  registrationData: UserRegistrationRequest
): Promise<AuthResponse> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      try {
        const { email, password, role, ...additionalData } = registrationData;
        const users = getStoredUsers();

        // Check if email already exists
        const existingUser = Object.values(users).find(u => u.email === email);
        if (existingUser) {
          resolve({
            success: false,
            error: 'Email is already registered'
          });
          return;
        }

        // Create new user
        const userId = generateId();
        const now = new Date().toISOString();
        
        const user: User = {
          id: userId,
          email,
          displayName: additionalData.displayName || email.split('@')[0],
          role,
          status: 'active',
          permissions: DEFAULT_PERMISSIONS[role],
          createdAt: now,
          updatedAt: now,
          ...additionalData
        };

        // Save user
        users[userId] = user;
        saveUsers(users);
        saveCurrentUser(user);

        console.log('Mock registration successful for:', email);
        
        // Notify listeners
        notifyAuthListeners(user);

        resolve({
          success: true,
          user,
          requiresEmailVerification: false
        });
      } catch (error) {
        console.error('Mock registration error:', error);
        resolve({
          success: false,
          error: 'Registration failed'
        });
      }
    }, 500); // Simulate 500ms delay
  });
};

/**
 * Sign in user (mock implementation)
 */
export const signInUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      try {
        const users = getStoredUsers();
        const user = Object.values(users).find(u => u.email === email);

        if (!user) {
          resolve({
            success: false,
            error: 'No account found with this email'
          });
          return;
        }

        // In a real implementation, you'd verify the password
        // For mock purposes, we'll accept any password
        
        // Update last login
        const updatedUser = {
          ...user,
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        users[user.id] = updatedUser;
        saveUsers(users);
        saveCurrentUser(updatedUser);

        console.log('Mock login successful for:', email);
        
        // Notify listeners
        notifyAuthListeners(updatedUser);

        resolve({
          success: true,
          user: updatedUser,
          requiresEmailVerification: false
        });
      } catch (error) {
        console.error('Mock login error:', error);
        resolve({
          success: false,
          error: 'Sign in failed'
        });
      }
    }, 300); // Simulate 300ms delay
  });
};

/**
 * Sign out current user
 */
export const signOutUser = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      saveCurrentUser(null);
      notifyAuthListeners(null);
      console.log('Mock logout successful');
      resolve();
    }, 100);
  });
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  uid: string,
  updates: UserProfileUpdateRequest
): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const users = getStoredUsers();
        const user = users[uid];

        if (!user) {
          reject(new Error('User not found'));
          return;
        }

        const updatedUser = {
          ...user,
          ...updates,
          updatedAt: new Date().toISOString()
        };

        users[uid] = updatedUser;
        saveUsers(users);

        // Update current user if it's the same user
        const currentUser = getCurrentStoredUser();
        if (currentUser && currentUser.id === uid) {
          saveCurrentUser(updatedUser);
          notifyAuthListeners(updatedUser);
        }

        resolve();
      } catch (error) {
        reject(new Error('Failed to update profile'));
      }
    }, 200);
  });
};

/**
 * Get user document
 */
export const getUserDocument = async (uid: string): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getStoredUsers();
      resolve(users[uid] || null);
    }, 100);
  });
};

/**
 * Authentication state change listener
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  // Add listener
  authListeners.push(callback);

  // Call immediately with current user
  const currentUser = getCurrentStoredUser();
  callback(currentUser);

  // Return unsubscribe function
  return () => {
    const index = authListeners.indexOf(callback);
    if (index > -1) {
      authListeners.splice(index, 1);
    }
  };
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = (): Promise<User | null> => {
  return Promise.resolve(getCurrentStoredUser());
};

// Initialize with any existing current user
const existingUser = getCurrentStoredUser();
if (existingUser) {
  // Verify user still exists in storage
  const users = getStoredUsers();
  if (!users[existingUser.id]) {
    // User was deleted, clear current user
    saveCurrentUser(null);
  }
}
