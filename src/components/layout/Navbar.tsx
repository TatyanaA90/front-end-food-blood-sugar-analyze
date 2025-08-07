import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User, Settings, Shield, Droplets } from 'lucide-react';
import './Navbar.css';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="navbar">
            <div className="navbar-content">
                <div className="navbar-brand">
                    <h1 className="navbar-title" onClick={() => navigate('/dashboard')}>
                        Food Blood Sugar Analyzer
                    </h1>
                </div>
                <nav className="navbar-nav">
                    <div className="navbar-user-info">
                        <User className="navbar-user-icon" />
                        <span className="navbar-username">{user?.username}</span>
                        {user?.is_admin && (
                            <div className="navbar-admin-badge">
                                <Shield className="admin-icon" />
                                Admin
                            </div>
                        )}
                    </div>
                    <div className="navbar-actions">
                        <button
                            onClick={() => navigate('/glucose-readings')}
                            className="navbar-button"
                            aria-label="Glucose Readings"
                        >
                            <Droplets className="button-icon" />
                            <span>Readings</span>
                        </button>
                        <button
                            onClick={() => navigate('/profile')}
                            className="navbar-button"
                            aria-label="User Profile"
                        >
                            <Settings className="button-icon" />
                            <span>Profile</span>
                        </button>
                        {user?.is_admin && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="navbar-button navbar-admin-button"
                                aria-label="Admin Dashboard"
                            >
                                <Shield className="button-icon" />
                                <span>Admin</span>
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="navbar-button navbar-logout-button"
                            aria-label="Logout"
                        >
                            <LogOut className="button-icon" />
                            <span>Logout</span>
                        </button>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;