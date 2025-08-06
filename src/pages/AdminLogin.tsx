import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { authService, type LoginRequest } from '../services/authService';
import { Eye, EyeOff, Shield, ArrowLeft } from 'lucide-react';
import './AdminLogin.css';

const AdminLogin: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginRequest>();

    const onSubmit = async (data: LoginRequest) => {
        try {
            setError('');
            setIsLoading(true);

            const response = await authService.login(data);

            // Check if user is admin - backend will handle validation
            if (!response.user.is_admin) {
                throw new Error('Insufficient privileges. Admin access required.');
            }

            // Navigate to admin dashboard
            navigate('/admin');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error 
                ? err.message 
                : 'Invalid admin credentials or insufficient privileges';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    return (
        <main className="admin-login-main">
            <section className="admin-login-header-section">
                <header className="admin-login-header">
                    <Shield className="admin-login-header-icon" />
                </header>
                <h1 className="admin-login-title">
                    Administrator Access
                </h1>
                <p className="admin-login-subtitle">
                    Secure admin portal for system management
                </p>
            </section>

            <section className="admin-login-form-section">
                <div className="admin-login-form-container">
                    <form id="adminLoginForm" className="admin-login-form" onSubmit={handleSubmit(onSubmit)}>
                        {error && (
                            <div className="admin-login-error">
                                <p>{error}</p>
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="admin-username"
                                className="admin-login-label"
                            >
                                Admin Username
                            </label>
                            <div className="mt-1">
                                <input
                                    id="admin-username"
                                    type="text"
                                    autoComplete="username"
                                    {...register('username', {
                                        required: 'Admin username is required',
                                        minLength: {
                                            value: 3,
                                            message: 'Username must be at least 3 characters',
                                        },
                                    })}
                                    className={`admin-login-input ${errors.username
                                            ? 'admin-login-input-error'
                                            : 'admin-login-input-normal'
                                        }`}
                                />
                                {errors.username && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.username.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="admin-password"
                                className="admin-login-label"
                            >
                                Admin Password
                            </label>
                            <div className="admin-login-input-wrapper">
                                <input
                                    id="admin-password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    {...register('password', {
                                        required: 'Admin password is required',
                                    })}
                                    className={`admin-login-input pr-10 ${errors.password
                                            ? 'admin-login-input-error'
                                            : 'admin-login-input-normal'
                                        }`}
                                />
                                <button
                                    type="button"
                                    className="admin-login-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <EyeOff className="admin-login-password-icon" />
                                    ) : (
                                        <Eye className="admin-login-password-icon" />
                                    )}
                                </button>
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="admin-login-actions">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="admin-login-button"
                            >
                                {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
                            </button>
                        </div>
                    </form>

                    <footer className="admin-login-footer">
                        <button
                            type="button"
                            onClick={handleBackToLogin}
                            className="admin-login-back-button"
                        >
                            <ArrowLeft className="admin-login-back-icon" />
                            Back to User Login
                        </button>
                    </footer>
                </div>
            </section>
        </main>
    );
};

export default AdminLogin; 