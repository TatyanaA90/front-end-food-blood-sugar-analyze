import api from './api';

// TypeScript interfaces for meal data
export interface MealIngredient {
  id?: number;
  name: string;
  weight?: number; // in grams
  carbs: number; // grams of carbs
  glycemic_index?: number;
  note?: string;
}

export interface Meal {
  id: number;
  description?: string;
  total_weight?: number;
  total_carbs?: number;
  glycemic_index?: number;
  note?: string;
  photo_url?: string;
  timestamp?: string;
  ingredients: MealIngredient[];
}

export interface MealCreate {
  description?: string;
  total_weight?: number;
  total_carbs?: number;
  glycemic_index?: number;
  note?: string;
  photo_url?: string;
  timestamp?: string;
  ingredients: MealIngredient[];
}

export interface MealUpdate {
  description?: string;
  total_weight?: number;
  total_carbs?: number;
  glycemic_index?: number;
  note?: string;
  photo_url?: string;
  timestamp?: string;
  ingredients?: MealIngredient[];
}

export interface MealBasic {
  id: number;
  description?: string;
  total_weight?: number;
  total_carbs?: number;
  glycemic_index?: number;
  note?: string;
  photo_url?: string;
  timestamp?: string;
}

// Meal service functions
export const mealService = {
  // Get all meals for the current user
  getMeals: async (): Promise<MealBasic[]> => {
    const response = await api.get<MealBasic[]>('/meals');
    return response.data;
  },

  // Get a specific meal by ID
  getMeal: async (mealId: number): Promise<Meal> => {
    const response = await api.get<Meal>(`/meals/${mealId}`);
    return response.data;
  },

  // Create a new meal
  createMeal: async (mealData: MealCreate): Promise<Meal> => {
    const response = await api.post<Meal>('/meals', mealData);
    return response.data;
  },

  // Update an existing meal
  updateMeal: async (mealId: number, mealData: MealUpdate): Promise<Meal> => {
    const response = await api.put<Meal>(`/meals/${mealId}`, mealData);
    return response.data;
  },

  // Delete a meal
  deleteMeal: async (mealId: number): Promise<void> => {
    await api.delete(`/meals/${mealId}`);
  },
};

// Utility functions for meal calculations
export const mealUtils = {
  // Calculate total carbs from ingredients
  calculateTotalCarbs: (ingredients: MealIngredient[]): number => {
    return ingredients.reduce((total, ingredient) => total + (ingredient.carbs || 0), 0);
  },

  // Calculate total weight from ingredients
  calculateTotalWeight: (ingredients: MealIngredient[]): number => {
    return ingredients.reduce((total, ingredient) => total + (ingredient.weight || 0), 0);
  },

  // Calculate average glycemic index
  calculateAverageGlycemicIndex: (ingredients: MealIngredient[]): number | undefined => {
    const validGIs = ingredients
      .map(ing => ing.glycemic_index)
      .filter(gi => gi !== undefined && gi !== null) as number[];
    
    if (validGIs.length === 0) return undefined;
    
    return validGIs.reduce((sum, gi) => sum + gi, 0) / validGIs.length;
  },

  // Format timestamp for display
  formatTimestamp: (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  },

  // Get meal type from description or timestamp
  getMealType: (meal: MealBasic): string => {
    if (meal.description) {
      const desc = meal.description.toLowerCase();
      if (desc.includes('breakfast')) return 'Breakfast';
      if (desc.includes('lunch')) return 'Lunch';
      if (desc.includes('dinner')) return 'Dinner';
      if (desc.includes('snack')) return 'Snack';
    }
    
    // Fallback to time-based meal type
    if (meal.timestamp) {
      const hour = new Date(meal.timestamp).getHours();
      if (hour >= 5 && hour < 11) return 'Breakfast';
      if (hour >= 11 && hour < 16) return 'Lunch';
      if (hour >= 16 && hour < 22) return 'Dinner';
      return 'Snack';
    }
    
    return 'Meal';
  },
};
