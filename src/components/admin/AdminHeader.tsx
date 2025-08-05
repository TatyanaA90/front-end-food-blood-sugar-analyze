import React from 'react';
import { Shield, Users } from 'lucide-react';

interface AdminHeaderProps {
  userStats: { total_users: number } | null;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ userStats }) => {
  return (
    <header className="admin-header">
      <div className="admin-header-content">
        <div className="admin-title-section">
          <Shield className="admin-header-icon" />
          <h1 className="admin-title">Admin Dashboard</h1>
        </div>
        <div className="admin-stats">
          <div className="admin-stat-card">
            <Users className="stat-icon" />
            <div className="stat-content">
              <span className="stat-number">{userStats?.total_users || 0}</span>
              <span className="stat-label">Total Users</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;