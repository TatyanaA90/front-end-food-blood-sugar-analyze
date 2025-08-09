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

// Predefined meal interfaces
export interface PredefinedMealIngredient {
  id: number;
  name: string;
  base_weight: number; // base weight in grams for 1 portion
  carbs_per_100g: number; // carbs per 100g of this ingredient
  glycemic_index?: number;
  note?: string;
}

export interface PredefinedMeal {
  id: number;
  name: string;
  description?: string;
  category?: string;
  ingredients: PredefinedMealIngredient[];
  total_carbs_per_portion: number;
  total_weight_per_portion: number;
  average_glycemic_index?: number;
}

export interface MealFromPredefinedCreate {
  predefined_meal_id: number;
  quantity: number; // number of portions (1-10)
  timestamp?: string;
  note?: string;
  photo_url?: string;
  ingredient_adjustments?: Array<{
    ingredient_id: number;
    adjusted_weight: number;
  }>;
}

export interface Meal {
  id: number;
  description?: string;
  meal_type?: string;
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
  meal_type?: string;
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
  meal_type?: string;
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
  meal_type?: string;
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

  // Predefined meal functions
  getPredefinedMeals: async (category?: string): Promise<PredefinedMeal[]> => {
    const params = category ? { category } : {};
    const response = await api.get<PredefinedMeal[]>('/predefined-meals', { params });
    return response.data;
  },

  getPredefinedMeal: async (mealId: number): Promise<PredefinedMeal> => {
    const response = await api.get<PredefinedMeal>(`/predefined-meals/${mealId}`);
    return response.data;
  },

  createMealFromPredefined: async (mealData: MealFromPredefinedCreate): Promise<Meal> => {
    const response = await api.post<Meal>('/meals/from-predefined', mealData);
    return response.data;
  },

  getMealCategories: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/predefined-meals/categories/list');
    return response.data;
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

  // Predefined meal utilities
  calculateScaledIngredient: (
    ingredient: PredefinedMealIngredient, 
    quantity: number, 
    adjustedWeight?: number
  ): MealIngredient => {
    const baseWeight = ingredient.base_weight * quantity;
    const finalWeight = adjustedWeight ?? baseWeight;
    const carbs = (finalWeight / 100) * ingredient.carbs_per_100g;
    
    return {
      name: ingredient.name,
      weight: finalWeight,
      carbs: Math.round(carbs * 100) / 100, // Round to 2 decimal places
      glycemic_index: ingredient.glycemic_index,
      note: ingredient.note
    };
  },

  calculateScaledMealNutrition: (
    predefinedMeal: PredefinedMeal, 
    quantity: number, 
    ingredientAdjustments?: Array<{ingredient_id: number, adjusted_weight: number}>
  ): { total_carbs: number; total_weight: number; ingredients: MealIngredient[] } => {
    const adjustments = ingredientAdjustments?.reduce((acc, adj) => {
      acc[adj.ingredient_id] = adj.adjusted_weight;
      return acc;
    }, {} as Record<number, number>) ?? {};

    let total_carbs = 0;
    let total_weight = 0;
    const ingredients: MealIngredient[] = [];

    for (const ingredient of predefinedMeal.ingredients) {
      const scaledIngredient = mealUtils.calculateScaledIngredient(
        ingredient, 
        quantity, 
        adjustments[ingredient.id]
      );
      
      total_carbs += scaledIngredient.carbs;
      total_weight += scaledIngredient.weight || 0;
      ingredients.push(scaledIngredient);
    }

    return {
      total_carbs: Math.round(total_carbs * 100) / 100,
      total_weight: Math.round(total_weight * 100) / 100,
      ingredients
    };
  },
};
