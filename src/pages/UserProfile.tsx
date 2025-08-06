import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useUserProfile, useUpdateProfile, useDeleteAccount, useChangePassword } from '../hooks/useUserManagement';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileForm from '../components/profile/ProfileForm';
import AdminSection from '../components/profile/AdminSection';
import DangerZone from '../components/profile/DangerZone';
import DeleteConfirmModal from '../components/profile/DeleteConfirmModal';
import PasswordChangeSection from '../components/profile/PasswordChangeSection';
import './UserProfile.css';

interface FormData {
    name: string;
    email: string;
    weight: string;
    weight_unit: string;
}

const UserProfile: React.FC = () => {
    const { logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // React Query hooks
    const { data: user, isLoading } = useUserProfile();
    const updateProfileMutation = useUpdateProfile();
    const deleteAccountMutation = useDeleteAccount();
    const changePasswordMutation = useChangePassword();

    const handleSaveProfile = async (formData: FormData) => {
        try {
            const updatedUser = await updateProfileMutation.mutateAsync({
                name: formData.name,
                email: formData.email,
                weight: formData.weight ? parseFloat(formData.weight) : null,
                weight_unit: formData.weight_unit
            });

            updateUser(updatedUser);
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Profile update error:', error);
            alert('Failed to update profile. Please try again.');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await deleteAccountMutation.mutateAsync(user.id);

            // Account deleted successfully - logout and redirect
            logout();
            navigate('/login', {
                state: { message: 'Your account has been successfully deleted.' }
            });
        } catch (error: unknown) {
            console.error('Account deletion error:', error);
            const errorMessage = (error as { response?: { data?: { detail?: string; message?: string } } })?.response?.data?.detail || 
                               (error as { response?: { data?: { detail?: string; message?: string } } })?.response?.data?.message || 
                               'Failed to delete account. Please try again.';
            alert(errorMessage);
            setShowDeleteConfirm(false); // Close the modal on error
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    if (isLoading) {
        return (
            <div className="profile-loading">
                <p>Loading profile...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="profile-error">
                <p>Unable to load profile. Please try logging in again.</p>
                <button 
                    onClick={() => navigate('/login')}
                    className="profile-login-btn"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <main className="profile-container">
            <ProfileHeader user={user} />

            <div className="profile-content">
                <ProfileForm
                    user={user}
                    isEditing={isEditing}
                    onStartEdit={() => setIsEditing(true)}
                    onSave={handleSaveProfile}
                    onCancel={handleCancelEdit}
                />

                <PasswordChangeSection
                    onChangePassword={async (currentPassword, newPassword) => {
                        try {
                            await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
                            alert('Password changed successfully!');
                        } catch (error) {
                            console.error('Password change error:', error);
                            alert('Failed to change password. Please check your current password and try again.');
                        }
                    }}
                    isChangingPassword={changePasswordMutation.isPending}
                />

                <AdminSection user={user} />

                <DangerZone
                    isDeleting={deleteAccountMutation.isPending}
                    onDeleteAccount={() => setShowDeleteConfirm(true)}
                />
            </div>

            <DeleteConfirmModal
                isOpen={showDeleteConfirm}
                user={user}
                isDeleting={deleteAccountMutation.isPending}
                onConfirm={handleDeleteAccount}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </main>
    );
};

export default UserProfile;