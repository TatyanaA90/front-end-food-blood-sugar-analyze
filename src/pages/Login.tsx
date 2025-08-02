import React, { useState } from 'react';
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
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      await login(data.username, data.password);
      navigate('/dashboard');
    } catch {
      setError('Invalid username or password');
    }
  };

  return (
    <main className="login-main">
      <section className="login-header-section">
        <header className="login-header">
          <LogIn className="login-header-icon" />
        </header>
        <h1 className="login-title">
          Sign in to your account
        </h1>
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
          <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
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
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
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

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="login-button"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
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

            <div className="mt-6">
              <Link
                to="/register"
                className="login-footer-button"
              >
                Create new account
              </Link>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
};

export default Login; 