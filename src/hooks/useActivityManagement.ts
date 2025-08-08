import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activityService, type ActivityCreate, type ActivityUpdate } from '../services/activityService';

export const activityQueryKeys = {
  all: ['activities'] as const,
  lists: () => [...activityQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...activityQueryKeys.lists(), { filters }] as const,
  details: () => [...activityQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...activityQueryKeys.details(), id] as const,
};

export const useActivities = () => {
  return useQuery({
    queryKey: activityQueryKeys.lists(),
    queryFn: activityService.getActivities,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useActivity = (activityId: number) => {
  return useQuery({
    queryKey: activityQueryKeys.detail(activityId),
    queryFn: () => activityService.getActivity(activityId),
    enabled: !!activityId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (activityData: ActivityCreate) => activityService.createActivity(activityData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityQueryKeys.lists() });
    },
  });
};

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ activityId, activityData }: { activityId: number; activityData: ActivityUpdate }) =>
      activityService.updateActivity(activityId, activityData),
    onSuccess: (updatedActivity) => {
      queryClient.setQueryData(activityQueryKeys.detail(updatedActivity.id), updatedActivity);
      queryClient.invalidateQueries({ queryKey: activityQueryKeys.lists() });
    },
  });
};

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (activityId: number) => activityService.deleteActivity(activityId),
    onSuccess: (_, deletedActivityId) => {
      queryClient.removeQueries({ queryKey: activityQueryKeys.detail(deletedActivityId) });
      queryClient.invalidateQueries({ queryKey: activityQueryKeys.lists() });
    },
  });
};
