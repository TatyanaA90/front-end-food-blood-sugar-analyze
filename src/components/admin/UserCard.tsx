import React from 'react';
import { 
  Shield, 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Key, 
  Trash2 
} from 'lucide-react';

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

interface UserCardProps {
  userData: UserData;
  currentUserId: number;
  onPasswordReset: (user: UserData) => void;
  onDeleteUser: (user: UserData) => void;
}

const UserCard: React.FC<UserCardProps> = ({ 
  userData, 
  currentUserId, 
  onPasswordReset, 
  onDeleteUser 
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <article className="admin-user-card">
      <header className="user-card-header">
        <div className="user-info">
          <UserIcon className="user-avatar" />
          <div className="user-details">
            <h3 className="user-name">{userData.name}</h3>
            <p className="user-username">@{userData.username}</p>
          </div>
        </div>
        {userData.is_admin && (
          <div className="user-admin-badge">
            <Shield className="badge-icon" />
            Admin
          </div>
        )}
      </header>

      <div className="user-card-content">
        <div className="user-meta">
          <div className="user-meta-item">
            <Mail className="meta-icon" />
            <span>{userData.email}</span>
          </div>
          <div className="user-meta-item">
            <Calendar className="meta-icon" />
            <span>Joined {formatDate(userData.created_at)}</span>
          </div>
          {userData.weight && (
            <div className="user-meta-item">
              <span>{userData.weight} {userData.weight_unit}</span>
            </div>
          )}
        </div>
      </div>

      <footer className="user-card-actions">
        <button 
          className="user-action-btn user-reset-btn"
          onClick={() => onPasswordReset(userData)}
          type="button"
        >
          <Key className="btn-icon" />
          Reset Password
        </button>
        {userData.id !== currentUserId && (
          <button 
            className="user-action-btn user-delete-btn"
            onClick={() => onDeleteUser(userData)}
            type="button"
          >
            <Trash2 className="btn-icon" />
            Delete
          </button>
        )}
      </footer>
    </article>
  );
};

export default UserCard;