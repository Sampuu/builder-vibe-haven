import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

// Auth
import { AuthProvider } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthRedirect from "@/components/AuthRedirect";

// Demo setup
import { setupDemoAccounts, isDemoMode } from "@/lib/demoSetup";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

// Dashboards
import UserDashboard from "./pages/UserDashboard";
import PoliceDashboard from "./pages/PoliceDashboard";
import FireDashboard from "./pages/FireDashboard";
import AmbulanceDashboard from "./pages/AmbulanceDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// Admin Pages
import ManageUsers from "./pages/admin/ManageUsers";
import MissionControl from "./pages/admin/MissionControl";
import AuditLogs from "./pages/admin/AuditLogs";
import AllDashboards from "./pages/admin/AllDashboards";

// User Pages
import ReportDisaster from "./pages/user/ReportDisaster";
import RequestHelp from "./pages/user/RequestHelp";
import ViewMap from "./pages/user/ViewMap";
import News from "./pages/user/News";

// Police Pages
import AllIncidents from "./pages/police/AllIncidents";
import CommandMap from "./pages/police/CommandMap";

// Fire Pages
import FireIncidents from "./pages/fire/FireIncidents";

// Ambulance Pages
import MedicalIncidents from "./pages/ambulance/MedicalIncidents";

// Hospital Pages
import SupplyRequests from "./pages/hospital/SupplyRequests";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthRedirect />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Dashboard Routes */}
            <Route
              path="/dashboard/user"
              element={
                <ProtectedRoute requiredRole="user">
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/police"
              element={
                <ProtectedRoute requiredRole="police">
                  <PoliceDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/fire"
              element={
                <ProtectedRoute requiredRole="fire">
                  <FireDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/ambulance"
              element={
                <ProtectedRoute requiredRole="ambulance">
                  <AmbulanceDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/hospital"
              element={
                <ProtectedRoute requiredRole="hospital">
                  <HospitalDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Pages */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/missions"
              element={
                <ProtectedRoute requiredRole="admin">
                  <MissionControl />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/logs"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AuditLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboards"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AllDashboards />
                </ProtectedRoute>
              }
            />

            {/* User Pages */}
            <Route
              path="/user/report"
              element={
                <ProtectedRoute requiredRole="user">
                  <ReportDisaster />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/help"
              element={
                <ProtectedRoute requiredRole="user">
                  <RequestHelp />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/map"
              element={
                <ProtectedRoute requiredRole="user">
                  <ViewMap />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/news"
              element={
                <ProtectedRoute requiredRole="user">
                  <News />
                </ProtectedRoute>
              }
            />

            {/* Police Pages */}
            <Route
              path="/police/incidents"
              element={
                <ProtectedRoute requiredRole="police">
                  <AllIncidents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/police/map"
              element={
                <ProtectedRoute requiredRole="police">
                  <CommandMap />
                </ProtectedRoute>
              }
            />

            {/* Fire Pages */}
            <Route
              path="/fire/incidents"
              element={
                <ProtectedRoute requiredRole="fire">
                  <FireIncidents />
                </ProtectedRoute>
              }
            />

            {/* Ambulance Pages */}
            <Route
              path="/ambulance/incidents"
              element={
                <ProtectedRoute requiredRole="ambulance">
                  <MedicalIncidents />
                </ProtectedRoute>
              }
            />

            {/* Hospital Pages */}
            <Route
              path="/hospital/supplies"
              element={
                <ProtectedRoute requiredRole="hospital">
                  <SupplyRequests />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
