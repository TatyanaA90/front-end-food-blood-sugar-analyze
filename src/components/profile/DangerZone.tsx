import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DangerZoneProps {
  isDeleting: boolean;
  onDeleteAccount: () => void;
}

const DangerZone: React.FC<DangerZoneProps> = ({ isDeleting, onDeleteAccount }) => {
  return (
    <section className="profile-card profile-danger-zone">
      <header className="profile-card-header">
        <h2 className="profile-card-title profile-danger-title">
          <AlertTriangle className="danger-icon" />
          Danger Zone
        </h2>
      </header>
      <div className="profile-danger-content">
        <div className="profile-danger-info">
          <h3 className="danger-action-title">Delete Account</h3>
          <p className="danger-action-description">
            Once you delete your account, there is no going back. This will permanently delete:
          </p>
          <ul className="danger-action-list">
            <li>Your profile and personal information</li>
            <li>All glucose readings and health data</li>
            <li>Meal logs and activity records</li>
            <li>Insulin dose records and analytics</li>
          </ul>
        </div>
        <button 
          className="profile-delete-btn"
          onClick={onDeleteAccount}
          disabled={isDeleting}
          type="button"
        >
          <Trash2 className="btn-icon" />
          {isDeleting ? 'Deleting...' : 'Delete Account'}
        </button>
      </div>
    </section>
  );
};

export default DangerZone;