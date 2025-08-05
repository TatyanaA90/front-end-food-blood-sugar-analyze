import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { 
  useAllUsers, 
  useUserStats, 
  useDeleteUser, 
  useTruncateUsers, 
  useResetUserPassword 
} from '../hooks/useUserManagement';
import AdminHeader from '../components/admin/AdminHeader';
import UserManagementSection from '../components/admin/UserManagementSection';
import DeleteUserModal from '../components/admin/DeleteUserModal';
import TruncateUsersModal from '../components/admin/TruncateUsersModal';
import PasswordResetModal from '../components/admin/PasswordResetModal';
import './AdminDashboard.css';

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

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTruncateModal, setShowTruncateModal] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // React Query hooks
  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useAllUsers();
  const { data: userStats = null, refetch: refetchStats } = useUserStats();
  const deleteUserMutation = useDeleteUser();
  const truncateUsersMutation = useTruncateUsers();
  const resetPasswordMutation = useResetUserPassword();

  // Check admin access
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!user.is_admin) {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUserMutation.mutateAsync(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Failed to delete user: ${error}`);
    }
  };

  const handleTruncateAllUsers = async () => {
    try {
      const result = await truncateUsersMutation.mutateAsync();
      alert(`Successfully deleted ${result.users_deleted} users`);
      setShowTruncateModal(false);
    } catch (error) {
      console.error('Error truncating users:', error);
      alert(`Failed to truncate users: ${error}`);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  const handlePasswordReset = async () => {
    if (!selectedUser || !newPassword) return;

    try {
      await resetPasswordMutation.mutateAsync({
        userId: selectedUser.id,
        newPassword
      });

      alert('Password reset successfully');
      setShowPasswordReset(false);
      setSelectedUser(null);
      setNewPassword('');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Password reset functionality will be implemented in the backend. For now, this is a UI demonstration.');
    }
  };

  const handlePasswordResetRequest = (userData: UserData) => {
    setSelectedUser(userData);
    setShowPasswordReset(true);
    generateRandomPassword();
  };

  const handleDeleteUserRequest = (userData: UserData) => {
    setSelectedUser(userData);
    setShowDeleteModal(true);
  };

  const handleRefreshData = () => {
    refetchUsers();
    refetchStats();
  };

  if (!user?.is_admin) {
    return (
      <div className="admin-unauthorized">
        <XCircle className="unauthorized-icon" />
        <h1>Access Denied</h1>
        <p>You don't have administrator privileges to access this page.</p>
      </div>
    );
  }

  if (usersLoading) {
    return (
      <div className="admin-loading">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <main className="admin-container">
      <AdminHeader 
        userStats={userStats}
      />

      <div className="admin-content">
        <UserManagementSection
          users={users}
          currentUserId={user.id}
          onRefresh={handleRefreshData}
          onTruncateUsers={() => setShowTruncateModal(true)}
          onPasswordReset={handlePasswordResetRequest}
          onDeleteUser={handleDeleteUserRequest}
        />
      </div>

      <DeleteUserModal
        isOpen={showDeleteModal}
        user={selectedUser}
        isDeleting={deleteUserMutation.isPending}
        onConfirm={handleDeleteUser}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
      />

      <TruncateUsersModal
        isOpen={showTruncateModal}
        userStats={userStats}
        isTruncating={truncateUsersMutation.isPending}
        onConfirm={handleTruncateAllUsers}
        onCancel={() => setShowTruncateModal(false)}
      />

      <PasswordResetModal
        isOpen={showPasswordReset}
        user={selectedUser}
        newPassword={newPassword}
        showPassword={showPassword}
        onPasswordChange={setNewPassword}
        onTogglePasswordVisibility={() => setShowPassword(!showPassword)}
        onGeneratePassword={generateRandomPassword}
        onConfirm={handlePasswordReset}
        onCancel={() => {
          setShowPasswordReset(false);
          setSelectedUser(null);
          setNewPassword('');
          setShowPassword(false);
        }}
      />
    </main>
  );
};

export default AdminDashboard;