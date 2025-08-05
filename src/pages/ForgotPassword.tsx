import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useForgotPassword } from '../hooks/useUserManagement';
import './ForgotPassword.css';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPasswordMutation.mutateAsync(data.email);
      setIsEmailSent(true);
    } catch (error) {
      console.error('Password reset request error:', error);
      // Don't reveal if email exists
      setIsEmailSent(true);
    }
  };

  if (isEmailSent) {
    return (
      <main className="forgot-password-main">
        <section className="forgot-password-section">
          <div className="forgot-password-success">
            <Mail className="forgot-password-icon success" />
            <h1 className="forgot-password-title">Check your email</h1>
            <p className="forgot-password-message">
              If an account exists with the email you provided, you will receive password reset instructions.
            </p>
            <Link to="/login" className="forgot-password-back-link">
              <ArrowLeft className="back-icon" />
              Return to login
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="forgot-password-main">
      <section className="forgot-password-section">
        <div className="forgot-password-header">
          <Mail className="forgot-password-icon" />
          <h1 className="forgot-password-title">Reset your password</h1>
          <p className="forgot-password-subtitle">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        <form className="forgot-password-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="forgot-password-field">
            <label htmlFor="email" className="forgot-password-label">
              Email address
            </label>
            <input
              id="email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              className={`forgot-password-input ${errors.email ? 'forgot-password-input-error' : ''}`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <span className="forgot-password-error">{errors.email.message}</span>
            )}
          </div>

          <div className="forgot-password-actions">
            <button
              type="submit"
              disabled={forgotPasswordMutation.isPending}
              className="forgot-password-submit"
            >
              {forgotPasswordMutation.isPending ? 'Sending...' : 'Send reset instructions'}
            </button>
            <Link to="/login" className="forgot-password-back-link">
              <ArrowLeft className="back-icon" />
              Return to login
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
};

export default ForgotPassword;