import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import { Toaster } from "react-hot-toast";
import { PageLayout } from "./components/PageLayout";
import { Login, Register } from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import Payroll from "./pages/Payroll";
import Reports from "./pages/Reports";
import "./App.css";

const ProtectedRoute = ({ children, title }) => {
  const { token, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <PageLayout title={title}>{children}</PageLayout>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Main Routes */}
      <Route path="/" element={
        <ProtectedRoute title="Dashboard">
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/employees" element={
        <ProtectedRoute title="Employee Management">
          <Employees />
        </ProtectedRoute>
      } />
      
      <Route path="/attendance" element={
        <ProtectedRoute title="Attendance Tracking">
          <Attendance />
        </ProtectedRoute>
      } />
      
      <Route path="/leave" element={
        <ProtectedRoute title="Leave Requests">
          <Leave />
        </ProtectedRoute>
      } />
      
      <Route path="/payroll" element={
        <ProtectedRoute title="Payroll Processing">
          <Payroll />
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute title="Analytics & Reports">
          <Reports />
        </ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'glass !bg-card !text-foreground !border-border',
              duration: 4000,
            }}
          />
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}