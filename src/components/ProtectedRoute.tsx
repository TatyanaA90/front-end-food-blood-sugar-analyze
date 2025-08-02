import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./ProtectedRoute.css";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
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

    return <>{children}</>;
};

export default ProtectedRoute;
