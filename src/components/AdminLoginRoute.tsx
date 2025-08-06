import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./AdminLoginRoute.css";

interface AdminLoginRouteProps {
    children: React.ReactNode;
}

const AdminLoginRoute: React.FC<AdminLoginRouteProps> = ({ children }) => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <main className="admin-login-loading-main">
                <section className="admin-login-loading-section">
                    <div className="admin-login-loading-spinner" aria-label="Loading"></div>
                    <p className="admin-login-loading-text">Loading...</p>
                </section>
            </main>
        );
    }

    // Redirect if user is already authenticated as admin
    if (isAuthenticated && user?.is_admin) {
        return <Navigate to="/admin" replace />;
    }

    // Redirect non-admin users away from admin login
    if (isAuthenticated && !user?.is_admin) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default AdminLoginRoute; 