import React from 'react';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../contexts/AuthContext';

interface AdminSectionProps {
  user: User;
}

const AdminSection: React.FC<AdminSectionProps> = ({ user }) => {
  const navigate = useNavigate();

  if (!user.is_admin) return null;

  return (
    <section className="profile-card">
      <header className="profile-card-header">
        <h2 className="profile-card-title">Administrator</h2>
      </header>
      <div className="profile-admin-section">
        <p className="profile-admin-description">
          You have administrator privileges. Access the admin dashboard to manage users and system settings.
        </p>
        <button 
          className="profile-admin-btn"
          onClick={() => navigate('/admin')}
          type="button"
        >
          <Shield className="btn-icon" />
          Go to Admin Dashboard
        </button>
      </div>
    </section>
  );
};

export default AdminSection;