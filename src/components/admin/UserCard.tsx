import React from 'react';
import { 
  Shield, 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Key, 
  Trash2,
  Activity,
  Utensils,
  Droplets,
  FileText,
  Eye
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
  glucose_readings_count?: number;
  meals_count?: number;
  activities_count?: number;
  insulin_doses_count?: number;
  condition_logs_count?: number;
}

interface UserCardProps {
  userData: UserData;
  currentUserId: number;
  onPasswordReset: (user: UserData) => void;
  onDeleteUser: (user: UserData) => void;
  onViewUserDetail: (user: UserData) => void;
}

const UserCard: React.FC<UserCardProps> = ({ 
  userData, 
  currentUserId, 
  onPasswordReset, 
  onDeleteUser,
  onViewUserDetail
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

        {/* User Data Summary */}
        <div className="user-data-summary">
          <h4 className="data-summary-title">Data Summary</h4>
          <div className="data-summary-grid">
            <div className="data-summary-item">
              <Droplets className="data-icon" />
              <span className="data-label">Glucose</span>
              <span className="data-count">{userData.glucose_readings_count || 0}</span>
            </div>
            <div className="data-summary-item">
              <Utensils className="data-icon" />
              <span className="data-label">Meals</span>
              <span className="data-count">{userData.meals_count || 0}</span>
            </div>
            <div className="data-summary-item">
              <Activity className="data-icon" />
              <span className="data-label">Activities</span>
              <span className="data-count">{userData.activities_count || 0}</span>
            </div>
            <div className="data-summary-item">
              <FileText className="data-icon" />
              <span className="data-label">Logs</span>
              <span className="data-count">{userData.condition_logs_count || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="user-card-actions">
        <button 
          className="user-action-btn user-view-btn"
          onClick={() => onViewUserDetail(userData)}
          type="button"
          aria-label={`View details for ${userData.name}`}
        >
          <Eye className="btn-icon" />
          View Details
        </button>
        <button 
          className="user-action-btn user-reset-btn"
          onClick={() => onPasswordReset(userData)}
          type="button"
          aria-label={`Reset password for ${userData.name}`}
        >
          <Key className="btn-icon" />
          Reset Password
        </button>
        {userData.id !== currentUserId && (
          <button 
            className="user-action-btn user-delete-btn"
            onClick={() => onDeleteUser(userData)}
            type="button"
            aria-label={`Delete user ${userData.name}`}
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