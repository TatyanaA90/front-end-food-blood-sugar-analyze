import React from 'react';
import { AlertTriangle } from 'lucide-react';

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

interface DeleteUserModalProps {
  isOpen: boolean;
  user: UserData | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  isOpen,
  user,
  isDeleting,
  onConfirm,
  onCancel
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="admin-modal-overlay" role="dialog" aria-labelledby="delete-user-title">
      <div className="admin-modal">
        <header className="admin-modal-header">
          <AlertTriangle className="modal-danger-icon" />
          <h2 className="admin-modal-title" id="delete-user-title">Delete User</h2>
        </header>
        <div className="admin-modal-content">
          <p className="admin-modal-text">
            Are you sure you want to delete <strong>{user.name}</strong>? 
            This will permanently remove their account and all associated data.
          </p>
          <div className="admin-modal-warning">
            <strong>Username:</strong> {user.username}<br />
            <strong>Email:</strong> {user.email}
          </div>
        </div>
        <footer className="admin-modal-actions">
          <button 
            className="admin-modal-cancel"
            onClick={onCancel}
            disabled={isDeleting}
            type="button"
          >
            Cancel
          </button>
          <button 
            className="admin-modal-confirm"
            onClick={onConfirm}
            disabled={isDeleting}
            type="button"
          >
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default DeleteUserModal;