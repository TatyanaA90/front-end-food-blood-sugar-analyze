import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { glucoseService } from '../services/glucoseService';
import type { GlucoseReadingFilters, CreateGlucoseReadingRequest, UpdateGlucoseReadingRequest } from '../types/glucose';

// Query keys
export const glucoseKeys = {
    all: ['glucose-readings'] as const,
    lists: () => [...glucoseKeys.all, 'list'] as const,
    list: (filters: GlucoseReadingFilters) => [...glucoseKeys.lists(), filters] as const,
    details: () => [...glucoseKeys.all, 'detail'] as const,
    detail: (id: number) => [...glucoseKeys.details(), id] as const,
    stats: (filters: GlucoseReadingFilters) => [...glucoseKeys.all, 'stats', filters] as const,
};

// Hook to get glucose readings with filters
export const useGlucoseReadings = (filters: GlucoseReadingFilters = {}) => {
    return useQuery({
        queryKey: glucoseKeys.list(filters),
        queryFn: () => glucoseService.getGlucoseReadings(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Hook to get a single glucose reading
export const useGlucoseReading = (id: number) => {
    return useQuery({
        queryKey: glucoseKeys.detail(id),
        queryFn: () => glucoseService.getGlucoseReading(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Hook to get glucose statistics
export const useGlucoseStats = (filters: GlucoseReadingFilters = {}) => {
    return useQuery({
        queryKey: glucoseKeys.stats(filters),
        queryFn: () => glucoseService.getGlucoseStats(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Hook to create a new glucose reading
export const useCreateGlucoseReading = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateGlucoseReadingRequest) => glucoseService.createGlucoseReading(data),
        onSuccess: () => {
            // Invalidate and refetch glucose readings
            queryClient.invalidateQueries({ queryKey: glucoseKeys.lists() });
            queryClient.invalidateQueries({ queryKey: glucoseKeys.all });
        },
    });
};

// Hook to update a glucose reading
export const useUpdateGlucoseReading = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateGlucoseReadingRequest }) =>
            glucoseService.updateGlucoseReading(id, data),
        onSuccess: (updatedReading) => {
            // Update the specific reading in cache
            queryClient.setQueryData(glucoseKeys.detail(updatedReading.id), updatedReading);
            // Invalidate and refetch lists
            queryClient.invalidateQueries({ queryKey: glucoseKeys.lists() });
            queryClient.invalidateQueries({ queryKey: glucoseKeys.all });
        },
    });
};

// Hook to delete a glucose reading
export const useDeleteGlucoseReading = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => glucoseService.deleteGlucoseReading(id),
        onSuccess: (_, deletedId) => {
            // Remove the specific reading from cache
            queryClient.removeQueries({ queryKey: glucoseKeys.detail(deletedId) });
            // Invalidate and refetch lists
            queryClient.invalidateQueries({ queryKey: glucoseKeys.lists() });
            queryClient.invalidateQueries({ queryKey: glucoseKeys.all });
        },
    });
}; 