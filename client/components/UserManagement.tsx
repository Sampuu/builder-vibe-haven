import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Search,
  Download,
  Upload,
  Trash2,
  Eye,
  BarChart3,
  UserCheck,
  UserX,
  Shield,
  Clock,
} from "lucide-react";
import {
  userDatabase,
  UserRecord,
  UserDatabaseStats,
} from "@/lib/userDatabase";
import { UserRole } from "@/hooks/use-auth";

interface UserManagementProps {
  className?: string;
}

export default function UserManagement({
  className = "",
}: UserManagementProps) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [stats, setStats] = useState<UserDatabaseStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  const loadUsers = () => {
    try {
      const allUsers = userDatabase.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const loadStats = () => {
    try {
      const currentStats = userDatabase.getStats();
      setStats(currentStats);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === "all" || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const handleExportUsers = () => {
    try {
      const exportData = userDatabase.exportUsers();
      const blob = new Blob([exportData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        userDatabase.deleteUser(userId);
        loadUsers();
        loadStats();
        setSelectedUser(null);
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const toggleUserStatus = (userId: string) => {
    try {
      const user = userDatabase.getUser(userId);
      if (user) {
        userDatabase.updateUser(userId, { isActive: !user.isActive });
        loadUsers();
        loadStats();
      }
    } catch (error) {
      console.error("Failed to update user status:", error);
    }
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      user: "bg-blue-100 text-blue-800",
      police: "bg-purple-100 text-purple-800",
      fire: "bg-red-100 text-red-800",
      ambulance: "bg-green-100 text-green-800",
      hospital: "bg-cyan-100 text-cyan-800",
      admin: "bg-gray-100 text-gray-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    return (
      new Date(dateString).toLocaleDateString() +
      " " +
      new Date(dateString).toLocaleTimeString()
    );
  };

  const roles: (UserRole | "all")[] = [
    "all",
    "user",
    "police",
    "fire",
    "ambulance",
    "hospital",
    "admin",
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">
            Manage system users and view analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportUsers} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => {
              loadUsers();
              loadStats();
            }}
          >
            <Users className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Users
                  </p>
                  <p className="text-2xl font-bold">{stats.activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Recent Signups
                  </p>
                  <p className="text-2xl font-bold">{stats.recentSignups}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Admin Users
                  </p>
                  <p className="text-2xl font-bold">
                    {stats.usersByRole.admin}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedRole}
              onChange={(e) =>
                setSelectedRole(e.target.value as UserRole | "all")
              }
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role === "all"
                    ? "All Roles"
                    : role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No users found</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.name}</span>
                            {!user.isActive && (
                              <UserX className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {user.loginCount} logins
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Role Distribution */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Users by Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.usersByRole).map(([role, count]) => (
                      <div
                        key={role}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Badge className={getRoleColor(role as UserRole)}>
                            {role}
                          </Badge>
                        </div>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Database Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Users:</span>
                      <span className="font-medium">{stats.totalUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Users:</span>
                      <span className="font-medium">{stats.activeUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recent Signups:</span>
                      <span className="font-medium">{stats.recentSignups}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Backup Status:</span>
                      <span className="font-medium">{stats.lastBackup}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                User Details
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">{selectedUser.name}</h4>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Role:</span>
                  <Badge className={`ml-2 ${getRoleColor(selectedUser.role)}`}>
                    {selectedUser.role}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <Badge
                    className={`ml-2 ${selectedUser.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">Logins:</span>
                  <span className="ml-2">{selectedUser.loginCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <span className="ml-2">
                    {selectedUser.phoneNumber || "N/A"}
                  </span>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                <div>Created: {formatDate(selectedUser.createdAt)}</div>
                <div>Last Login: {formatDate(selectedUser.lastLoginAt)}</div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleUserStatus(selectedUser.id)}
                  className="flex-1"
                >
                  {selectedUser.isActive ? (
                    <>
                      <UserX className="h-4 w-4 mr-1" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-1" />
                      Activate
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteUser(selectedUser.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
