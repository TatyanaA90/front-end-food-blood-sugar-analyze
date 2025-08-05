import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./ProtectedRoute.css";

interface ProtectedRouteProps {
    children: React.ReactNode;
    adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <main className="protected-loading-main">
                <section className="protected-loading-section">
                    <div className="protected-loading-spinner" aria-label="Loading"></div>
                    <p className="protected-loading-text">Loading...</p>
                </section>
            </main>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login page with the return url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (adminOnly && !user?.is_admin) {
        // Redirect non-admin users to dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
