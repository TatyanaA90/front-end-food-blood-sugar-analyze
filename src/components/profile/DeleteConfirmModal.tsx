import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { User } from '../../contexts/AuthContext';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  user: User;
  isDeleting: boolean;
  onConfirm: () => void; /*void = "This function does something but doesn't give back any data"*/
  onCancel: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  user,
  isDeleting,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay" role="dialog" aria-labelledby="delete-account-title">
      <div className="profile-modal">
        <header className="profile-modal-header">
          <AlertTriangle className="modal-danger-icon" />
          <h2 className="profile-modal-title" id="delete-account-title">Confirm Account Deletion</h2>
        </header>
        <div className="profile-modal-content">
          <p className="profile-modal-text">
            Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
          </p>
          <div className="profile-modal-warning">
            <strong>Username:</strong> {user.username}<br />
            <strong>Email:</strong> {user.email}
          </div>
        </div>
        <footer className="profile-modal-actions">
          <button 
            className="profile-modal-cancel"
            onClick={onCancel}
            disabled={isDeleting}
            type="button"
          >
            Cancel
          </button>
          <button 
            className="profile-modal-confirm"
            onClick={onConfirm}
            disabled={isDeleting}
            type="button"
          >
            {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;