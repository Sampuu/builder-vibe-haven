import { UserRole } from "@/hooks/use-auth";

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phoneNumber?: string;
  department?: string;
  password: string; // Encrypted in real implementation
  createdAt: string;
  lastLoginAt: string;
  isActive: boolean;
  loginCount: number;
  profilePicture?: string;
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };
}

export interface UserDatabaseStats {
  totalUsers: number;
  activeUsers: number;
  usersByRole: Record<UserRole, number>;
  recentSignups: number;
  lastBackup: string;
}

class UserDatabaseService {
  private static instance: UserDatabaseService;
  private users: Map<string, UserRecord> = new Map();
  private emailIndex: Map<string, string> = new Map(); // email -> userId mapping
  private storageKey = "disaster-management-users";
  private backupKey = "disaster-management-users-backup";

  constructor() {
    this.loadFromStorage();
    this.initializeDemoUsers();
    this.setupAutoBackup();
  }

  static getInstance(): UserDatabaseService {
    if (!UserDatabaseService.instance) {
      UserDatabaseService.instance = new UserDatabaseService();
    }
    return UserDatabaseService.instance;
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.users = new Map(data.users || []);
        this.emailIndex = new Map(data.emailIndex || []);

        console.log(`📊 Loaded ${this.users.size} users from database`);
      }
    } catch (error) {
      console.error("Failed to load user database:", error);
      this.createBackup();
    }
  }

  private saveToStorage() {
    try {
      const data = {
        users: Array.from(this.users.entries()),
        emailIndex: Array.from(this.emailIndex.entries()),
        lastSaved: new Date().toISOString(),
        version: "1.0",
      };

      localStorage.setItem(this.storageKey, JSON.stringify(data));

      // Create periodic backup
      if (Math.random() < 0.1) {
        // 10% chance to backup
        this.createBackup();
      }
    } catch (error) {
      console.error("Failed to save user database:", error);
    }
  }

  private createBackup() {
    try {
      const current = localStorage.getItem(this.storageKey);
      if (current) {
        localStorage.setItem(this.backupKey, current);
        console.log("📦 User database backup created");
      }
    } catch (error) {
      console.error("Failed to create backup:", error);
    }
  }

  private setupAutoBackup() {
    // Auto-backup every 5 minutes
    setInterval(
      () => {
        this.createBackup();
      },
      5 * 60 * 1000,
    );
  }

  private initializeDemoUsers() {
    const demoUsers = [
      {
        email: "user@demo.com",
        password: "demo123",
        name: "Demo User",
        role: "user" as UserRole,
      },
      {
        email: "police@demo.com",
        password: "demo123",
        name: "Police Officer",
        role: "police" as UserRole,
      },
      {
        email: "fire@demo.com",
        password: "demo123",
        name: "Fire Fighter",
        role: "fire" as UserRole,
      },
      {
        email: "ambulance@demo.com",
        password: "demo123",
        name: "Paramedic",
        role: "ambulance" as UserRole,
      },
      {
        email: "hospital@demo.com",
        password: "demo123",
        name: "Hospital Staff",
        role: "hospital" as UserRole,
      },
      {
        email: "admin@demo.com",
        password: "demo123",
        name: "System Admin",
        role: "admin" as UserRole,
      },
    ];

    let addedUsers = 0;
    demoUsers.forEach((demoUser) => {
      if (!this.emailIndex.has(demoUser.email)) {
        this.createUser({
          email: demoUser.email,
          password: demoUser.password,
          name: demoUser.name,
          role: demoUser.role,
        });
        addedUsers++;
      }
    });

    if (addedUsers > 0) {
      console.log(`👥 Added ${addedUsers} demo users to database`);
      this.saveToStorage();
    }
  }

  // Create a new user
  createUser(userData: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    phoneNumber?: string;
    department?: string;
  }): UserRecord {
    // Check if email already exists
    if (this.emailIndex.has(userData.email.toLowerCase())) {
      throw new Error("An account with this email already exists");
    }

    // Validate password
    if (userData.password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    const now = new Date().toISOString();
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const user: UserRecord = {
      id: userId,
      email: userData.email.toLowerCase(),
      name: userData.name.trim(),
      role: userData.role,
      phoneNumber: userData.phoneNumber?.trim() || undefined,
      department: userData.department?.trim() || undefined,
      password: userData.password, // In real app, this would be hashed
      createdAt: now,
      lastLoginAt: now,
      isActive: true,
      loginCount: 0,
      preferences: {
        notifications: true,
        darkMode: false,
        language: "en",
      },
    };

    this.users.set(userId, user);
    this.emailIndex.set(userData.email.toLowerCase(), userId);
    this.saveToStorage();

    console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    return user;
  }

  // Authenticate user
  authenticateUser(
    email: string,
    password: string,
    expectedRole?: UserRole,
  ): UserRecord {
    const userId = this.emailIndex.get(email.toLowerCase());
    if (!userId) {
      throw new Error("No account found with this email address");
    }

    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User data corrupted");
    }

    if (!user.isActive) {
      throw new Error("Account is disabled");
    }

    if (user.password !== password) {
      throw new Error("Incorrect password");
    }

    if (expectedRole && user.role !== expectedRole) {
      throw new Error(
        `Role mismatch. This account is registered as ${user.role}, not ${expectedRole}`,
      );
    }

    // Update login info
    user.lastLoginAt = new Date().toISOString();
    user.loginCount++;
    this.users.set(userId, user);
    this.saveToStorage();

    console.log(`🔐 User authenticated: ${email} (${user.role})`);
    return user;
  }

  // Get user by ID
  getUser(userId: string): UserRecord | null {
    return this.users.get(userId) || null;
  }

  // Get user by email
  getUserByEmail(email: string): UserRecord | null {
    const userId = this.emailIndex.get(email.toLowerCase());
    return userId ? this.users.get(userId) || null : null;
  }

  // Update user
  updateUser(userId: string, updates: Partial<UserRecord>): UserRecord {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Prevent changing critical fields
    const { id, email, createdAt, ...allowedUpdates } = updates;

    const updatedUser = { ...user, ...allowedUpdates };
    this.users.set(userId, updatedUser);
    this.saveToStorage();

    console.log(`🔄 Updated user: ${user.email}`);
    return updatedUser;
  }

  // Delete user
  deleteUser(userId: string): boolean {
    const user = this.users.get(userId);
    if (!user) {
      return false;
    }

    this.users.delete(userId);
    this.emailIndex.delete(user.email);
    this.saveToStorage();

    console.log(`🗑️ Deleted user: ${user.email}`);
    return true;
  }

  // Get all users (admin function)
  getAllUsers(): UserRecord[] {
    return Array.from(this.users.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  // Get users by role
  getUsersByRole(role: UserRole): UserRecord[] {
    return Array.from(this.users.values()).filter((user) => user.role === role);
  }

  // Search users
  searchUsers(query: string): UserRecord[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.users.values()).filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm),
    );
  }

  // Get database statistics
  getStats(): UserDatabaseStats {
    const allUsers = Array.from(this.users.values());
    const activeUsers = allUsers.filter((user) => user.isActive);

    const usersByRole = {
      user: 0,
      police: 0,
      fire: 0,
      ambulance: 0,
      hospital: 0,
      admin: 0,
    } as Record<UserRole, number>;

    allUsers.forEach((user) => {
      usersByRole[user.role]++;
    });

    const oneWeekAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const recentSignups = allUsers.filter(
      (user) => user.createdAt > oneWeekAgo,
    ).length;

    return {
      totalUsers: allUsers.length,
      activeUsers: activeUsers.length,
      usersByRole,
      recentSignups,
      lastBackup: localStorage.getItem(this.backupKey) ? "Available" : "None",
    };
  }

  // Export user data (for admin)
  exportUsers(): string {
    const data = {
      users: this.getAllUsers().map((user) => ({
        ...user,
        password: "[REDACTED]", // Don't export passwords
      })),
      stats: this.getStats(),
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  }

  // Import user data (for admin)
  importUsers(jsonData: string): number {
    try {
      const data = JSON.parse(jsonData);
      let imported = 0;

      if (data.users && Array.isArray(data.users)) {
        data.users.forEach((userData: any) => {
          try {
            if (!this.emailIndex.has(userData.email)) {
              this.createUser({
                email: userData.email,
                password: userData.password || "temp123",
                name: userData.name,
                role: userData.role,
                phoneNumber: userData.phoneNumber,
                department: userData.department,
              });
              imported++;
            }
          } catch (error) {
            console.warn(`Failed to import user ${userData.email}:`, error);
          }
        });
      }

      this.saveToStorage();
      return imported;
    } catch (error) {
      throw new Error("Invalid import data format");
    }
  }

  // Clear all data (for development)
  clearAllData(): void {
    this.users.clear();
    this.emailIndex.clear();
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.backupKey);
    console.log("🧹 User database cleared");

    // Re-initialize demo users
    this.initializeDemoUsers();
  }
}

// Export singleton instance
export const userDatabase = UserDatabaseService.getInstance();

// Export types and service for external use
export type { UserRecord, UserDatabaseStats };
export { UserDatabaseService };
