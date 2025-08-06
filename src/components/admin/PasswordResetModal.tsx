import React from 'react';
import { Key, Eye, EyeOff } from 'lucide-react';

interface UserData {
  id: number;
  username: string;
  email: string;
  name: string;
  is_admin: boolean;
  weight?: number;
  weight_unit?: string;
  created_at?: string;
}

interface PasswordResetModalProps {
  isOpen: boolean;
  user: UserData | null;
  newPassword: string;
  showPassword: boolean;
  onPasswordChange: (password: string) => void;
  onTogglePasswordVisibility: () => void;
  onGeneratePassword: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  isOpen,
  user,
  newPassword,
  showPassword,
  onPasswordChange,
  onTogglePasswordVisibility,
  onGeneratePassword,
  onConfirm,
  onCancel
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="admin-modal-overlay" role="dialog" aria-labelledby="password-reset-title">
      <div className="admin-modal">
        <header className="admin-modal-header">
          <Key className="modal-key-icon" />
          <h2 className="admin-modal-title" id="password-reset-title">Reset Password</h2>
        </header>
        <div className="admin-modal-content">
          <p className="admin-modal-text">
            Reset password for <strong>{user.name}</strong> (@{user.username})
          </p>
          <div className="password-reset-form">
            <label className="password-label" htmlFor="new-password">New Password:</label>
            <div className="password-input-group">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => onPasswordChange(e.target.value)}
                className="password-input"
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={onTogglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            <button
              type="button"
              className="generate-password-btn"
              onClick={onGeneratePassword}
            >
              Generate Secure Password
            </button>
            <div className="password-note">
              <strong>Note:</strong> This is a demonstration. In production, use secure password reset tokens sent via email.
            </div>
          </div>
        </div>
        <footer className="admin-modal-actions">
          <button 
            className="admin-modal-cancel"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button 
            className="admin-modal-confirm"
            onClick={onConfirm}
            disabled={!newPassword}
            type="button"
          >
            Reset Password
          </button>
        </footer>
      </div>
    </div>
  );
};

export default PasswordResetModal;