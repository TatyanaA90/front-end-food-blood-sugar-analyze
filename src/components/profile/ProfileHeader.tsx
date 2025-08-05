import React from 'react';
import { User as UserIcon, Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../contexts/AuthContext';

interface ProfileHeaderProps {
  user: User;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <header className="profile-header">
      <div className="profile-header-content">
        <button
          onClick={handleBack}
          className="profile-back-button"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft className="back-icon" />
          <span>Back</span>
        </button>
        <div className="profile-title-group">
          <UserIcon className="profile-header-icon" />
          <h1 className="profile-title">User Profile</h1>
          {user.is_admin && (
            <div className="profile-admin-badge">
              <Shield className="admin-icon" />
              <span>Administrator</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default ProfileHeader;