import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import './AdminLogin.css';

interface AdminLoginFormData {
  username: string;
  password: string;
}

const AdminLogin: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { adminLogin, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>();

  const onSubmit = async (data: AdminLoginFormData) => {
    try {
      setError(null);
      await adminLogin(data.username, data.password);
      navigate('/admin');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Admin login failed');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <Shield className="admin-login-icon" />
          <h1>Admin Login</h1>
          <p>Access the administrative dashboard</p>
        </div>

        {error && (
          <div className="admin-login-error">
            <AlertCircle className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              {...register('username', {
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Username must be at least 3 characters',
                },
              })}
              className={errors.username ? 'error' : ''}
              placeholder="Enter admin username"
            />
            {errors.username && (
              <span className="error-message">{errors.username.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
                className={errors.password ? 'error' : ''}
                placeholder="Enter admin password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="admin-login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In as Admin'}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>
            <a href="/login" className="back-to-login">
              ← Back to regular login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 