import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import './Login.css';

interface LoginFormData {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>();

  const watchedUsername = watch('username');
  const watchedPassword = watch('password');

  useEffect(() => {
    // Clear any prior error when the user edits the form fields
    setError('');
  }, [watchedUsername, watchedPassword]);



  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      await login(data.username, data.password);
      navigate('/dashboard');
    } catch {
      setError('Invalid username or password. Please check your credentials and try again.');
      // Prevent navigation on error - stay on the same page
    }
  };

  // Get today's date in ISO format
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="login-main">
      <section className="login-header-section">
        <h2 className="login-subtitle login-title-pill">
          Food & Blood Sugar Analyzer
        </h2>
        
        <p className="login-desc">
          A personal digital health diary that helps you set goals, track food, activity, and lifestyle factors via manual logs or CGMs and understand their impact on your health.
        </p>
        
        <header className="login-header">
          <LogIn className="login-header-icon" />
          <h1 className="login-title">
            Sign in to your account
          </h1>
        </header>
        
        <p className="login-subtitle">
          Or{' '}
          <Link
            to="/register"
            className="login-link"
          >
            create a new account
          </Link>
        </p>
      </section>

      <section className="login-form-section">
        <div className="login-form-container">
          <form id="loginForm" className="login-form" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="login-error">
                <p>{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="login-label"
              >
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  {...register('username', {
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'Username must be at least 3 characters',
                    },
                  })}
                  className={`login-input ${
                    errors.username
                      ? 'login-input-error'
                      : 'login-input-normal'
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
                htmlFor="password"
                className="login-label"
              >
                Password
              </label>
              <div className="login-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password', {
                    required: 'Password is required',
                  })}
                  className={`login-input pr-10 ${
                    errors.password
                      ? 'login-input-error'
                      : 'login-input-normal'
                  }`}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="login-password-icon" />
                  ) : (
                    <Eye className="login-password-icon" />
                  )}
                </button>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="login-actions">
              <button
                type="submit"
                disabled={isLoading}
                className="login-button"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
              <Link to="/forgot-password" className="login-forgot-link">
                Forgot your password?
              </Link>
            </div>
          </form>

          <footer className="login-footer">
            <div className="login-divider">
              <div className="login-divider-line">
                <div className="login-divider-border" />
              </div>
              <div className="login-divider-text">
                <span className="login-divider-content">
                  New to Blood Sugar Analyzer?
                </span>
              </div>
            </div>

            <Link
              to="/register"
              className="login-footer-button"
            >
              Create new account
            </Link>
          </footer>
        </div>
      </section>

      {/* Author + Date Badge */}
      <div className="login-meta">
        <span>Tatyana Ageyeva — Ada Developers Academy (C23)</span>
        <span className="mx-1">•</span>
        <span>{today}</span>
      </div>
    </main>
  );
};

export default Login; 