import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordChangeFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordChangeSectionProps {
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isChangingPassword: boolean;
}

const PasswordChangeSection: React.FC<PasswordChangeSectionProps> = ({
  onChangePassword,
  isChangingPassword
}) => {
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<PasswordChangeFormData>();

  const newPassword = watch('newPassword');

  const handlePasswordChange = async (data: PasswordChangeFormData) => {
    try {
      await onChangePassword(data.currentPassword, data.newPassword);
      reset(); // Clear form on success
    } catch (error) {
      console.error('Password change error:', error);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <section className="profile-card">
      <header className="profile-card-header">
        <h2 className="profile-card-title">Change Password</h2>
      </header>
      <form className="profile-form" onSubmit={handleSubmit(handlePasswordChange)}>
        <div className="profile-field">
          <label className="profile-label" htmlFor="currentPassword">
            <Lock className="field-icon" />
            Current Password
          </label>
          <div className="password-input-wrapper">
            <input
              id="currentPassword"
              type={showPasswords.current ? 'text' : 'password'}
              autoComplete="current-password"
              {...register('currentPassword', {
                required: 'Current password is required'
              })}
              className={`profile-input ${errors.currentPassword ? 'profile-input-error' : ''}`}
              placeholder="Enter current password"
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => togglePasswordVisibility('current')}
            >
              {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.currentPassword && (
            <span className="profile-error">{errors.currentPassword.message}</span>
          )}
        </div>

        <div className="profile-field">
          <label className="profile-label" htmlFor="newPassword">
            <Lock className="field-icon" />
            New Password
          </label>
          <div className="password-input-wrapper">
            <input
              id="newPassword"
              type={showPasswords.new ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('newPassword', {
                required: 'New password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message: 'Password must include uppercase, lowercase, number and special character'
                }
              })}
              className={`profile-input ${errors.newPassword ? 'profile-input-error' : ''}`}
              placeholder="Enter new password"
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => togglePasswordVisibility('new')}
            >
              {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.newPassword && (
            <span className="profile-error">{errors.newPassword.message}</span>
          )}
        </div>

        <div className="profile-field">
          <label className="profile-label" htmlFor="confirmPassword">
            <Lock className="field-icon" />
            Confirm New Password
          </label>
          <div className="password-input-wrapper">
            <input
              id="confirmPassword"
              type={showPasswords.confirm ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value =>
                  value === newPassword || 'The passwords do not match'
              })}
              className={`profile-input ${errors.confirmPassword ? 'profile-input-error' : ''}`}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => togglePasswordVisibility('confirm')}
            >
              {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="profile-error">{errors.confirmPassword.message}</span>
          )}
        </div>

        <div className="profile-form-actions">
          <button
            type="submit"
            className="profile-save-btn"
            disabled={isChangingPassword}
          >
            {isChangingPassword ? 'Changing Password...' : 'Change Password'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default PasswordChangeSection;