import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { GlucoseUnitProvider } from './contexts/GlucoseUnitContext.tsx';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLoginRoute from './components/AdminLoginRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import GlucoseReadings from './pages/GlucoseReadings';
import Meals from './pages/Meals';
import Activities from './pages/Activities';
import InsulinDoses from './pages/InsulinDoses';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GlucoseUnitProvider>
          <Router>
        <main className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin/login" element={<AdminLoginRoute><AdminLogin /></AdminLoginRoute>} />
            <Route path="/login/admin" element={<Navigate to="/admin/login" replace />} />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UserProfile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/glucose-readings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <GlucoseReadings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/meals"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Meals />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/activities"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Activities />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/insulin-doses"
              element={
                <ProtectedRoute>
                  <Layout>
                    <InsulinDoses />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
        </Router>
        </GlucoseUnitProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
