import api from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  is_admin: boolean;
  weight?: number;
  weight_unit?: string;
  created_at?: string;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  weight?: number | null;
  weight_unit?: string;
}

export interface UserStats {
  total_users: number;
}

export interface UserTruncateResponse {
  users_deleted: number;
  message: string;
}

// User profile operations
export const userService = {
  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: UserUpdateData): Promise<User> => {
    const response = await api.put<User>('/me', data);
    return response.data;
  },

  // Delete current user account
  deleteAccount: async (): Promise<void> => {
    await api.delete('/me');
  },

  // Admin operations
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  // Get user statistics
  getUserStats: async (): Promise<UserStats> => {
    const response = await api.get<UserStats>('/users/stats/count');
    return response.data;
  },

  // Delete specific user (admin only)
  deleteUser: async (userId: number): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },

  // Truncate all users (admin only)
  truncateAllUsers: async (): Promise<UserTruncateResponse> => {
    const response = await api.delete<UserTruncateResponse>('/users/truncate-all');
    return response.data;
  },

  // Reset user password (admin only) - placeholder for future implementation
  resetUserPassword: async (userId: number, newPassword: string): Promise<void> => {
    await api.post('/admin/reset-password', {
      user_id: userId,
      new_password: newPassword,
    });
  },

  // Change user's own password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/me/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<void> => {
    await api.post('/forgot-password', { email });
  },

  // Reset password with token
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/reset-password', {
      token,
      new_password: newPassword,
    });
  },
};