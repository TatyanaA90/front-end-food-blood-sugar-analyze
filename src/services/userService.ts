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

export interface UserDetail {
  id: number;
  username: string;
  email: string;
  name: string;
  is_admin: boolean;
  weight?: number;
  weight_unit?: string;
  created_at: string;
  updated_at: string;
  glucose_readings_count: number;
  meals_count: number;
  activities_count: number;
  insulin_doses_count: number;
  condition_logs_count: number;
}

export interface AdminUserUpdate {
  name?: string;
  email?: string;
  weight?: number | null;
  weight_unit?: string;
  is_admin?: boolean;
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

export interface UserDataResponse {
  user: {
    id: number;
    username: string;
    email: string;
    name: string;
    is_admin: boolean;
    weight?: number;
    weight_unit?: string;
    created_at: string;
    updated_at: string;
  };
  data_summary: {
    glucose_readings_count: number;
    meals_count: number;
    activities_count: number;
    insulin_doses_count: number;
    condition_logs_count: number;
  };
  glucose_readings: Array<{
    id: number;
    value: number;
    unit: string;
    timestamp: string;
  }>;
  meals: Array<{
    id: number;
    name: string;
    meal_type: string;
    timestamp: string;
  }>;
  activities: Array<{
    id: number;
    activity_type: string;
    duration_minutes: number;
    timestamp: string;
  }>;
  insulin_doses: Array<{
    id: number;
    insulin_type: string;
    units: number;
    timestamp: string;
  }>;
  condition_logs: Array<{
    id: number;
    condition_type: string;
    severity: string;
    timestamp: string;
  }>;
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
  deleteAccount: async (userId: number): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },

  // Admin operations
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  // Get detailed user information (admin only)
  getUsersDetailed: async (): Promise<UserDetail[]> => {
    const response = await api.get<UserDetail[]>('/admin/users/detailed');
    return response.data;
  },

  // Get user statistics
  getUserStats: async (): Promise<UserStats> => {
    const response = await api.get<UserStats>('/users/stats/count');
    return response.data;
  },

  // Get specific user data (admin only)
  getUserData: async (userId: number): Promise<UserDataResponse> => {
    const response = await api.get<UserDataResponse>(`/admin/users/${userId}/data`);
    return response.data;
  },

  // Update user as admin
  updateUserAdmin: async (userId: number, data: AdminUserUpdate): Promise<User> => {
    const response = await api.put<User>(`/admin/users/${userId}`, data);
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