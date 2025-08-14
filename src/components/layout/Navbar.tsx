import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User, Settings, Shield, Droplets, Home, Utensils, Activity, Syringe, ChevronDown } from 'lucide-react';
import './Navbar.css';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mode, setMode] = React.useState<'dark' | 'light'>(() => (localStorage.getItem('theme-mode') as 'dark' | 'light') || 'light');
    const [isPagesOpen, setIsPagesOpen] = React.useState(false);

    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', mode);
        localStorage.setItem('theme-mode', mode);
    }, [mode]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isAdminDashboard = user?.is_admin && location.pathname === '/admin';

    return (
        <header className="navbar">
            <div className="navbar-content">
                <div className="navbar-brand">
                    <button 
                        className="navbar-brand-button"
                        onClick={() => navigate('/dashboard')}
                        aria-label="Go to Dashboard"
                    >
                        <Home className="navbar-home-icon" />
                        <h1 className="navbar-title">
                        🩸 Food & Blood Sugar Analyzer
                        </h1>
                    </button>
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
                        <div className="navbar-mode-switch">
                            <label htmlFor="theme-mode" className="sr-only">Theme mode</label>
                            <select
                                id="theme-mode"
                                className="navbar-mode-select"
                                value={mode}
                                onChange={(e) => setMode(e.target.value as 'dark' | 'light')}
                                aria-label="Theme mode selector"
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>
                        {isAdminDashboard ? (
                            <div
                                className="navbar-dropdown"
                                onMouseLeave={() => setIsPagesOpen(false)}
                            >
                                <button
                                    className="navbar-button navbar-dropdown-toggle"
                                    aria-haspopup="menu"
                                    aria-expanded={isPagesOpen}
                                    onClick={() => setIsPagesOpen((prev) => !prev)}
                                >
                                    <ChevronDown className={`button-icon navbar-dropdown-icon${isPagesOpen ? ' open' : ''}`} />
                                    <span>Pages</span>
                                </button>
                                {isPagesOpen && (
                                    <div className="navbar-dropdown-menu" role="menu">
                                        <button
                                            className="navbar-dropdown-item"
                                            role="menuitem"
                                            onClick={() => { setIsPagesOpen(false); navigate('/glucose-readings'); }}
                                        >
                                            <Droplets className="button-icon" />
                                            <span>Readings</span>
                                        </button>
                                        <button
                                            className="navbar-dropdown-item"
                                            role="menuitem"
                                            onClick={() => { setIsPagesOpen(false); navigate('/meals'); }}
                                        >
                                            <Utensils className="button-icon" />
                                            <span>Meals</span>
                                        </button>
                                        <button
                                            className="navbar-dropdown-item"
                                            role="menuitem"
                                            onClick={() => { setIsPagesOpen(false); navigate('/activities'); }}
                                        >
                                            <Activity className="button-icon" />
                                            <span>Activities</span>
                                        </button>
                                        <button
                                            className="navbar-dropdown-item"
                                            role="menuitem"
                                            onClick={() => { setIsPagesOpen(false); navigate('/insulin-doses'); }}
                                        >
                                            <Syringe className="button-icon" />
                                            <span>Insulin</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Keep individual buttons for non-admin or non-admin route */}
                                <button
                                    onClick={() => navigate('/glucose-readings')}
                                    className="navbar-button"
                                    aria-label="Glucose Readings"
                                >
                                    <Droplets className="button-icon" />
                                    <span>Readings</span>
                                </button>
                                <button
                                    onClick={() => navigate('/meals')}
                                    className="navbar-button"
                                    aria-label="Meals"
                                >
                                    <Utensils className="button-icon" />
                                    <span>Meals</span>
                                </button>
                                <button
                                    onClick={() => navigate('/activities')}
                                    className="navbar-button"
                                    aria-label="Activities"
                                >
                                    <Activity className="button-icon" />
                                    <span>Activities</span>
                                </button>
                                <button
                                    onClick={() => navigate('/insulin-doses')}
                                    className="navbar-button"
                                    aria-label="Insulin Doses"
                                >
                                    <Syringe className="button-icon" />
                                    <span>Insulin</span>
                                </button>
                            </>
                        )}
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