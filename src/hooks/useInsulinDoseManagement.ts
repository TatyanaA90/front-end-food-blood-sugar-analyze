import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { insulinDoseService, type InsulinDoseCreate, type InsulinDoseUpdate } from '../services/insulinDoseService';

export const insulinDoseQueryKeys = {
  all: ['insulin-doses'] as const,
  lists: () => [...insulinDoseQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...insulinDoseQueryKeys.lists(), { filters }] as const,
  details: () => [...insulinDoseQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...insulinDoseQueryKeys.details(), id] as const,
};

export const useInsulinDoses = () => {
  return useQuery({
    queryKey: insulinDoseQueryKeys.lists(),
    queryFn: insulinDoseService.getInsulinDoses,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInsulinDose = (doseId: number) => {
  return useQuery({
    queryKey: insulinDoseQueryKeys.detail(doseId),
    queryFn: () => insulinDoseService.getInsulinDose(doseId),
    enabled: !!doseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateInsulinDose = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (doseData: InsulinDoseCreate) => insulinDoseService.createInsulinDose(doseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: insulinDoseQueryKeys.lists() });
    },
  });
};

export const useUpdateInsulinDose = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ doseId, doseData }: { doseId: number; doseData: InsulinDoseUpdate }) =>
      insulinDoseService.updateInsulinDose(doseId, doseData),
    onSuccess: (updatedDose) => {
      queryClient.setQueryData(insulinDoseQueryKeys.detail(updatedDose.id), updatedDose);
      queryClient.invalidateQueries({ queryKey: insulinDoseQueryKeys.lists() });
    },
  });
};

export const useDeleteInsulinDose = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (doseId: number) => insulinDoseService.deleteInsulinDose(doseId),
    onSuccess: (_, deletedDoseId) => {
      queryClient.removeQueries({ queryKey: insulinDoseQueryKeys.detail(deletedDoseId) });
      queryClient.invalidateQueries({ queryKey: insulinDoseQueryKeys.lists() });
    },
  });
};
