import React from 'react';
import { Users, RefreshCw, Trash2 } from 'lucide-react';
import UserCard from './UserCard';

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

interface UserManagementSectionProps {
  users: UserData[];
  currentUserId: number;
  onRefresh: () => void;
  onTruncateUsers: () => void;
  onPasswordReset: (user: UserData) => void;
  onDeleteUser: (user: UserData) => void;
  onViewUserDetail: (user: UserData) => void;
}

const UserManagementSection: React.FC<UserManagementSectionProps> = ({
  users,
  currentUserId,
  onRefresh,
  onTruncateUsers,
  onPasswordReset,
  onDeleteUser,
  onViewUserDetail
}) => {
  return (
    <section className="admin-section">
      <header className="admin-section-header">
        <h2 className="admin-section-title">User Management</h2>
        <div className="admin-section-actions">
          <button 
            className="admin-refresh-btn"
            onClick={onRefresh}
            type="button"
          >
            <RefreshCw className="btn-icon" />
            Refresh
          </button>
          <button 
            className="admin-danger-btn"
            onClick={onTruncateUsers}
            type="button"
          >
            <Trash2 className="btn-icon" />
            Truncate All Users
          </button>
        </div>
      </header>

      {users.length > 0 ? (
        <div className="admin-users-grid">
          {users.map((userData) => (
            <UserCard
              key={userData.id}
              userData={userData}
              currentUserId={currentUserId}
              onPasswordReset={onPasswordReset}
              onDeleteUser={onDeleteUser}
              onViewUserDetail={onViewUserDetail}
            />
          ))}
        </div>
      ) : (
        <div className="admin-empty-state">
          <Users className="empty-icon" />
          <h3>No Users Found</h3>
          <p>There are currently no users in the system.</p>
        </div>
      )}
    </section>
  );
};

export default UserManagementSection;