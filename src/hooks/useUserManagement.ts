import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, type UserUpdateData, type AdminUserUpdate } from '../services/userService';

// Query keys for consistent cache management
export const userQueryKeys = {
  all: ['users'] as const,
  profile: () => [...userQueryKeys.all, 'profile'] as const,
  list: () => [...userQueryKeys.all, 'list'] as const,
  detailed: () => [...userQueryKeys.all, 'detailed'] as const,
  stats: () => [...userQueryKeys.all, 'stats'] as const,
  data: (userId: number) => [...userQueryKeys.all, 'data', userId] as const,
};

// Get current user profile
export const useUserProfile = () => {
  return useQuery({
    queryKey: userQueryKeys.profile(),
    queryFn: userService.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Update user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UserUpdateData) => userService.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Immediately update the cache with the new data
      queryClient.setQueryData(userQueryKeys.profile(), updatedUser);
      // Force a refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile() });
      // Also invalidate any other user-related queries that might be affected
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  });
};

// Delete user account
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: number) => userService.deleteAccount(userId),
    onSuccess: () => {
      // Clear all user-related cache
      queryClient.removeQueries({ queryKey: userQueryKeys.all });
    },
  });
};

// Get all users (admin only)
export const useAllUsers = () => {
  return useQuery({
    queryKey: userQueryKeys.list(),
    queryFn: userService.getAllUsers,
    staleTime: 30 * 1000, // 30 seconds - admin data should be fresh
  });
};

// Get detailed user information (admin only)
export const useUsersDetailed = () => {
  return useQuery({
    queryKey: userQueryKeys.detailed(),
    queryFn: userService.getUsersDetailed,
    staleTime: 30 * 1000, // 30 seconds - admin data should be fresh
  });
};

// Get specific user data (admin only)
export const useUserData = (userId: number) => {
  return useQuery({
    queryKey: userQueryKeys.data(userId),
    queryFn: () => userService.getUserData(userId),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Get user statistics (admin only)
export const useUserStats = () => {
  return useQuery({
    queryKey: userQueryKeys.stats(),
    queryFn: userService.getUserStats,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Delete specific user (admin only)
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: number) => userService.deleteUser(userId),
    onSuccess: () => {
      // Refresh users list and stats
      queryClient.invalidateQueries({ queryKey: userQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.stats() });
    },
  });
};

// Truncate all users (admin only)
export const useTruncateUsers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userService.truncateAllUsers,
    onSuccess: () => {
      // Refresh all user-related data
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  });
};

// Reset user password (admin only)
export const useResetUserPassword = () => {
  return useMutation({
    mutationFn: ({ userId, newPassword }: { userId: number; newPassword: string }) =>
      userService.resetUserPassword(userId, newPassword),
  });
};

// Update user as admin
export const useUpdateUserAdmin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: AdminUserUpdate }) =>
      userService.updateUserAdmin(userId, data),
    onSuccess: () => {
      // Refresh all user-related data
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  });
};

// Change user's own password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      userService.changePassword(currentPassword, newPassword),
  });
};

// Request password reset
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => userService.requestPasswordReset(email),
  });
};

// Reset password with token
export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      userService.resetPassword(token, newPassword),
  });
};