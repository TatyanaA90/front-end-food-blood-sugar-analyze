import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useResetPassword } from '../hooks/useUserManagement';
import './ResetPassword.css';

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const resetPasswordMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      alert('Invalid or missing reset token');
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        token,
        newPassword: data.newPassword,
      });
      
      navigate('/login', {
        state: { message: 'Password reset successful. Please log in with your new password.' }
      });
    } catch (error) {
      console.error('Password reset error:', error);
      alert('Failed to reset password. The link may be invalid or expired.');
    }
  };

  if (!token) {
    return (
      <main className="reset-password-main">
        <section className="reset-password-section">
          <div className="reset-password-error">
            <Lock className="reset-password-icon error" />
            <h1 className="reset-password-title">Invalid Reset Link</h1>
            <p className="reset-password-message">
              This password reset link is invalid or has expired.
              Please request a new password reset link.
            </p>
            <button
              onClick={() => navigate('/forgot-password')}
              className="reset-password-button"
            >
              Request New Reset Link
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="reset-password-main">
      <section className="reset-password-section">
        <div className="reset-password-header">
          <Lock className="reset-password-icon" />
          <h1 className="reset-password-title">Reset Your Password</h1>
          <p className="reset-password-subtitle">
            Please enter your new password below.
          </p>
        </div>

        <form className="reset-password-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="reset-password-field">
            <label htmlFor="newPassword" className="reset-password-label">
              New Password
            </label>
            <div className="password-input-wrapper">
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    message: 'Password must include uppercase, lowercase, number and special character',
                  },
                })}
                className={`reset-password-input ${errors.newPassword ? 'reset-password-input-error' : ''}`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.newPassword && (
              <span className="reset-password-error">{errors.newPassword.message}</span>
            )}
          </div>

          <div className="reset-password-field">
            <label htmlFor="confirmPassword" className="reset-password-label">
              Confirm New Password
            </label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value =>
                    value === newPassword || 'The passwords do not match',
                })}
                className={`reset-password-input ${errors.confirmPassword ? 'reset-password-input-error' : ''}`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="reset-password-error">{errors.confirmPassword.message}</span>
            )}
          </div>

          <div className="reset-password-actions">
            <button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="reset-password-submit"
            >
              {resetPasswordMutation.isPending ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default ResetPassword;