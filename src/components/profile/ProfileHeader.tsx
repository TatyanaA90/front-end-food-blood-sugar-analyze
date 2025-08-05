import React from 'react';
import { User as UserIcon, Shield } from 'lucide-react';
import type { User } from '../../contexts/AuthContext';

interface ProfileHeaderProps {
  user: User;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  return (
    <header className="profile-header">
      <div className="profile-header-content">
        <UserIcon className="profile-header-icon" />
        <h1 className="profile-title">User Profile</h1>
        {user.is_admin && (
          <div className="profile-admin-badge">
            <Shield className="admin-icon" />
            <span>Administrator</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default ProfileHeader;