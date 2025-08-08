import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAllUsers, useUsersDetailed, useUserStats, useDeleteUser, useTruncateUsers, useResetUserPassword, useUpdateUserAdmin } from '../hooks/useUserManagement';
import { authService } from '../services/authService';
import AdminHeader from '../components/admin/AdminHeader';
import UserManagementSection from '../components/admin/UserManagementSection';
import DeleteUserModal from '../components/admin/DeleteUserModal';
import TruncateUsersModal from '../components/admin/TruncateUsersModal';
import PasswordResetModal from '../components/admin/PasswordResetModal';
import UserDetailModal from '../components/admin/UserDetailModal';
import type { UserDetail } from '../services/userService';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTruncateModal, setShowTruncateModal] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // React Query hooks with better error handling
  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers, error: usersError } = useAllUsers();
  const { data: usersDetailed = [], isLoading: detailedLoading, refetch: refetchDetailed, error: detailedError } = useUsersDetailed();
  const { data: userStats = null, refetch: refetchStats, error: statsError } = useUserStats();
  const deleteUserMutation = useDeleteUser();
  const truncateUsersMutation = useTruncateUsers();
  const resetPasswordMutation = useResetUserPassword();
  const updateUserMutation = useUpdateUserAdmin();

  // Debug information
  useEffect(() => {
    console.log('🔍 Admin Dashboard Debug Info:');
    console.log('Current user:', user);
    console.log('Token present:', !!authService.getToken());
    console.log('Users loading:', usersLoading);
    console.log('Users error:', usersError);
    console.log('Detailed loading:', detailedLoading);
    console.log('Detailed error:', detailedError);
    console.log('Stats error:', statsError);
    console.log('Users count:', users.length);
    console.log('Detailed users count:', usersDetailed.length);
  }, [user, usersLoading, usersError, detailedLoading, detailedError, statsError, users.length, usersDetailed.length]);

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
      console.log('Attempting to delete user:', selectedUser);
      console.log('User ID:', selectedUser.id);
      console.log('Current user:', user);
      
      await deleteUserMutation.mutateAsync(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      
      // More detailed error handling
      let errorMessage = 'Failed to delete user';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again as admin.';
        } else if (error.response.status === 403) {
          errorMessage = 'Access denied. Admin privileges required.';
        } else if (error.response.status === 404) {
          errorMessage = 'User not found. The user may have already been deleted.';
        } else if (error.response.status === 400) {
          errorMessage = 'Cannot delete your own account.';
        } else {
          errorMessage = `Server error: ${error.response.status} - ${error.response.data?.detail || error.response.statusText}`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection.';
      } else {
        // Other error
        errorMessage = error.message || 'Unknown error occurred';
      }
      
      alert(`Failed to delete user: ${errorMessage}`);
    }
  };

  const handleTruncateAllUsers = async () => {
    try {
      const result = await truncateUsersMutation.mutateAsync();
      alert(result.message);
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

  const handlePasswordResetRequest = (userData: UserDetail) => {
    setSelectedUser(userData);
    setShowPasswordReset(true);
    generateRandomPassword();
  };

  const handleViewUserDetail = (userData: UserDetail) => {
    setSelectedUser(userData);
    setShowUserDetail(true);
  };

  const handleDeleteUserRequest = (userData: UserDetail) => {
    setSelectedUser(userData);
    setShowDeleteModal(true);
  };

  const handleRefreshData = () => {
    refetchUsers();
    refetchDetailed();
    refetchStats();
  };

  if (!user?.is_admin) {
    return (
      <div className="admin-unauthorized">
        <XCircle className="unauthorized-icon" />
        <h1>Access Denied</h1>
        <p>You don't have administrator privileges to access this page.</p>
        <p>Current user: {user?.username || 'Not logged in'}</p>
        <p>Is admin: {user?.is_admin ? 'Yes' : 'No'}</p>
      </div>
    );
  }

  if (usersLoading || detailedLoading) {
    return (
      <div className="admin-loading">
        <p>Loading admin dashboard...</p>
        <p>Current user: {user?.username}</p>
        <p>Is admin: {user?.is_admin ? 'Yes' : 'No'}</p>
        <p>Users loading: {usersLoading ? 'Yes' : 'No'}</p>
        <p>Detailed loading: {detailedLoading ? 'Yes' : 'No'}</p>
        <p>Users error: {usersError ? 'Yes' : 'No'}</p>
        <p>Detailed error: {detailedError ? 'Yes' : 'No'}</p>
        <p>Stats error: {statsError ? 'Yes' : 'No'}</p>
        {usersError && <p>Users Error: {JSON.stringify(usersError)}</p>}
        {detailedError && <p>Detailed Error: {JSON.stringify(detailedError)}</p>}
        {statsError && <p>Stats Error: {JSON.stringify(statsError)}</p>}
      </div>
    );
  }

  return (
    <main className="admin-container">
      <AdminHeader 
        userStats={userStats}
      />

      <div className="admin-content">
        {/* Debug information */}
        <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
          <h4>Debug Info:</h4>
          <p>Users count: {users.length}</p>
          <p>Users detailed count: {usersDetailed.length}</p>
          <p>User stats: {userStats ? JSON.stringify(userStats) : 'null'}</p>
          <p>Current user ID: {user.id}</p>
          <p>Token: {authService.getToken() ? 'Present' : 'Missing'}</p>
        </div>

        <UserManagementSection
          users={usersDetailed}
          currentUserId={user.id}
          onRefresh={handleRefreshData}
          onTruncateUsers={() => setShowTruncateModal(true)}
          onPasswordReset={handlePasswordResetRequest}
          onDeleteUser={handleDeleteUserRequest}
          onViewUserDetail={handleViewUserDetail}
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

      <UserDetailModal
        isOpen={showUserDetail}
        user={selectedUser}
        onClose={() => {
          setShowUserDetail(false);
          setSelectedUser(null);
        }}
        onRefresh={handleRefreshData}
      />
    </main>
  );
};

export default AdminDashboard;