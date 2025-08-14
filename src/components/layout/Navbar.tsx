import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User, Settings, Shield, Droplets, Utensils, Activity, Syringe, ChevronDown, Home } from 'lucide-react';
import './Navbar.css';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mode, setMode] = React.useState<'dark' | 'light'>(() => (localStorage.getItem('theme-mode') as 'dark' | 'light') || 'light');
    const [isPagesOpen, setIsPagesOpen] = React.useState(false);
    const [isLogsOpen, setIsLogsOpen] = React.useState(false);
    const [isModeOpen, setIsModeOpen] = React.useState(false);

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
                        <img
                            src={mode === 'dark' ? '/assets/images/logo_light.png' : '/assets/images/Logo.png'}
                            alt="App logo"
                            className="navbar-logo-img"
                            width={28}
                            height={28}
                        />
                    </button>
                    <div className="navbar-user-info">
                        <User className="navbar-user-icon" />
                        <span className="navbar-username">{user?.username}</span>
                        <Home className="navbar-home-icon" />
                        {user?.is_admin && (
                            <div className="navbar-admin-badge">
                                <Shield className="admin-icon" />
                                Admin
                            </div>
                        )}
                    </div>
                </div>
                <nav className="navbar-nav">
                    <div className="navbar-actions">
                        <div
                            className="navbar-dropdown"
                            onMouseLeave={() => setIsModeOpen(false)}
                        >
                            <button
                                className="navbar-button navbar-dropdown-toggle"
                                aria-haspopup="menu"
                                aria-expanded={isModeOpen}
                                onClick={() => setIsModeOpen((prev) => !prev)}
                                aria-label="Theme mode selector"
                            >
                                <ChevronDown className={`button-icon navbar-dropdown-icon${isModeOpen ? ' open' : ''}`} />
                                <span>Mode</span>
                            </button>
                            {isModeOpen && (
                                <div className="navbar-dropdown-menu" role="menu">
                                    <button
                                        className="navbar-dropdown-item"
                                        role="menuitemradio"
                                        aria-checked={mode === 'light'}
                                        onClick={() => { setMode('light'); setIsModeOpen(false); }}
                                    >
                                        <span>Light</span>
                                    </button>
                                    <button
                                        className="navbar-dropdown-item"
                                        role="menuitemradio"
                                        aria-checked={mode === 'dark'}
                                        onClick={() => { setMode('dark'); setIsModeOpen(false); }}
                                    >
                                        <span>Dark</span>
                                    </button>
                                </div>
                            )}
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
                            <div
                                className="navbar-dropdown"
                                onMouseLeave={() => setIsLogsOpen(false)}
                            >
                                <button
                                    className="navbar-button navbar-dropdown-toggle"
                                    aria-haspopup="menu"
                                    aria-expanded={isLogsOpen}
                                    onClick={() => setIsLogsOpen((prev) => !prev)}
                                >
                                    <ChevronDown className={`button-icon navbar-dropdown-icon${isLogsOpen ? ' open' : ''}`} />
                                    <span>Logs</span>
                                </button>
                                {isLogsOpen && (
                                    <div className="navbar-dropdown-menu" role="menu">
                                        <button
                                            className="navbar-dropdown-item"
                                            role="menuitem"
                                            onClick={() => { setIsLogsOpen(false); navigate('/glucose-readings'); }}
                                        >
                                            <Droplets className="button-icon" />
                                            <span>Readings</span>
                                        </button>
                                        <button
                                            className="navbar-dropdown-item"
                                            role="menuitem"
                                            onClick={() => { setIsLogsOpen(false); navigate('/meals'); }}
                                        >
                                            <Utensils className="button-icon" />
                                            <span>Meals</span>
                                        </button>
                                        <button
                                            className="navbar-dropdown-item"
                                            role="menuitem"
                                            onClick={() => { setIsLogsOpen(false); navigate('/activities'); }}
                                        >
                                            <Activity className="button-icon" />
                                            <span>Activities</span>
                                        </button>
                                        <button
                                            className="navbar-dropdown-item"
                                            role="menuitem"
                                            onClick={() => { setIsLogsOpen(false); navigate('/insulin-doses'); }}
                                        >
                                            <Syringe className="button-icon" />
                                            <span>Insulin</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        <button onClick={() => navigate('/profile')} className="navbar-button" aria-label="User Profile">
                            <Settings className="button-icon" />
                            <span>Profile</span>
                        </button>
                        {user?.is_admin && (
                            <button onClick={() => navigate('/admin')} className="navbar-button navbar-admin-button" aria-label="Admin Dashboard">
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