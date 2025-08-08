import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mealService, type MealCreate, type MealUpdate } from '../services/mealService';

// Query keys for meals
export const mealQueryKeys = {
  all: ['meals'] as const,
  lists: () => [...mealQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...mealQueryKeys.lists(), { filters }] as const,
  details: () => [...mealQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...mealQueryKeys.details(), id] as const,
};

// Get all meals
export const useMeals = () => {
  return useQuery({
    queryKey: mealQueryKeys.lists(),
    queryFn: mealService.getMeals,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get a specific meal
export const useMeal = (mealId: number) => {
  return useQuery({
    queryKey: mealQueryKeys.detail(mealId),
    queryFn: () => mealService.getMeal(mealId),
    enabled: !!mealId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create a new meal
export const useCreateMeal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (mealData: MealCreate) => mealService.createMeal(mealData),
    onSuccess: () => {
      // Invalidate and refetch meals list
      queryClient.invalidateQueries({ queryKey: mealQueryKeys.lists() });
    },
  });
};

// Update a meal
export const useUpdateMeal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ mealId, mealData }: { mealId: number; mealData: MealUpdate }) =>
      mealService.updateMeal(mealId, mealData),
    onSuccess: (updatedMeal) => {
      // Update the specific meal in cache
      queryClient.setQueryData(mealQueryKeys.detail(updatedMeal.id), updatedMeal);
      // Invalidate and refetch meals list
      queryClient.invalidateQueries({ queryKey: mealQueryKeys.lists() });
    },
  });
};

// Delete a meal
export const useDeleteMeal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (mealId: number) => mealService.deleteMeal(mealId),
    onSuccess: (_, deletedMealId) => {
      // Remove the meal from cache
      queryClient.removeQueries({ queryKey: mealQueryKeys.detail(deletedMealId) });
      // Invalidate and refetch meals list
      queryClient.invalidateQueries({ queryKey: mealQueryKeys.lists() });
    },
  });
};
