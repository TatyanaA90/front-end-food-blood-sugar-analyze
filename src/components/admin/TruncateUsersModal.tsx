import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface TruncateUsersModalProps {
  isOpen: boolean;
  userStats: { total_users: number } | null;
  isTruncating: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const TruncateUsersModal: React.FC<TruncateUsersModalProps> = ({
  isOpen,
  userStats,
  isTruncating,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" role="dialog" aria-labelledby="truncate-users-title">
      <div className="admin-modal">
        <header className="admin-modal-header">
          <AlertTriangle className="modal-danger-icon" />
          <h2 className="admin-modal-title" id="truncate-users-title">Truncate All Users</h2>
        </header>
        <div className="admin-modal-content">
          <p className="admin-modal-text">
            <strong>⚠️ DANGER:</strong> This will permanently delete ALL users and their data from the system.
            This action cannot be undone!
          </p>
          <div className="admin-modal-warning">
            <strong>Total Users:</strong> {userStats?.total_users || 0}<br />
            <strong>Including:</strong> All user profiles, health data, meals, activities, and analytics
          </div>
          <p className="admin-modal-text">
            This operation is intended for development/testing purposes only.
          </p>
        </div>
        <footer className="admin-modal-actions">
          <button 
            className="admin-modal-cancel"
            onClick={onCancel}
            disabled={isTruncating}
            type="button"
          >
            Cancel
          </button>
          <button 
            className="admin-modal-confirm"
            onClick={onConfirm}
            disabled={isTruncating}
            type="button"
          >
            {isTruncating ? 'Deleting All...' : 'Delete All Users'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default TruncateUsersModal;