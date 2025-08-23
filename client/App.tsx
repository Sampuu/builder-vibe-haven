import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth
import { AuthProvider } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/ProtectedRoute";

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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
