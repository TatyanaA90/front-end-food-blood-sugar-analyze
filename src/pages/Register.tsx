import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import './Register.css';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  weight?: string;
  weight_unit?: string;
}

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');
      await registerUser(data.username, data.email, data.password, data.weight, data.weight_unit);
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <main className="register-main">
      <section className="register-header-section">
        <header className="register-header">
          <UserPlus className="register-header-icon" />
        </header>
        <h1 className="register-title">
          Create your account
        </h1>
        <p className="register-subtitle">
          Or{' '}
          <Link
            to="/login"
            className="register-link"
          >
            sign in to your existing account
          </Link>
        </p>
      </section>

      <section className="register-form-section">
        <div className="register-form-container">
          <form className="register-form" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="register-error">
                <p>{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="register-label"
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
                    maxLength: {
                      value: 50,
                      message: 'Username must be less than 50 characters',
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: 'Username can only contain letters, numbers, and underscores',
                    },
                  })}
                  className={`register-input ${
                    errors.username
                      ? 'register-input-error'
                      : 'register-input-normal'
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
                htmlFor="email"
                className="register-label"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className={`register-input ${
                    errors.email
                      ? 'register-input-error'
                      : 'register-input-normal'
                  }`}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="register-label"
              >
                Password
              </label>
              <div className="register-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                    },
                  })}
                  className={`register-input pr-10 ${
                    errors.password
                      ? 'register-input-error'
                      : 'register-input-normal'
                  }`}
                />
                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="register-password-icon" />
                  ) : (
                    <Eye className="register-password-icon" />
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
              <label
                htmlFor="confirmPassword"
                className="register-label"
              >
                Confirm Password
              </label>
              <div className="register-input-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                  className={`register-input pr-10 ${
                    errors.confirmPassword
                      ? 'register-input-error'
                      : 'register-input-normal'
                  }`}
                />
                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="register-password-icon" />
                  ) : (
                    <Eye className="register-password-icon" />
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="weight"
                className="register-label"
              >
                Weight (Optional)
              </label>
              <div className="register-weight-inputs">
                <input
                  id="weight"
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.]?[0-9]{0,2}"
                  {...register('weight', {
                    required: false,
                    validate: {
                      isValid: (value: string) => {
                        if (!value) return true;
                        const num = parseFloat(value);
                        if (isNaN(num)) return 'Please enter a valid number';
                        if (num <= 0) return 'Weight must be positive';
                        if (num > 1000) return 'Weight must be reasonable';
                        // Format to 2 decimal places
                        const formatted = num.toFixed(2);
                        // Ensure the value matches the formatted version
                        if (parseFloat(value).toFixed(2) !== formatted) {
                          return 'Please enter a number with up to 2 decimal places';
                        }
                        return true;
                      }
                    },
                    setValueAs: (value: string) => {
                      if (!value) return null;
                      const num = parseFloat(value);
                      return isNaN(num) ? null : parseFloat(num.toFixed(2));
                    }
                  })}
                  className={`register-input register-weight-input ${
                    errors.weight ? 'register-input-error' : 'register-input-normal'
                  }`}
                  placeholder="Enter weight (optional)"
                />
                <select
                  {...register('weight_unit')}
                  className="register-select"
                  defaultValue="kg"
                >
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                </select>
              </div>
              {errors.weight && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.weight.message}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="register-button"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>

          <footer className="register-footer">
            <div className="register-divider">
              <div className="register-divider-line">
                <div className="register-divider-border" />
              </div>
              <div className="register-divider-text">
                <span className="register-divider-content">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="register-footer-button"
              >
                Sign in to existing account
              </Link>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
};

export default Register; 