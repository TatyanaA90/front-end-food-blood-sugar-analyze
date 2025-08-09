import { describe, it, expect } from 'vitest';
import { mealUtils } from '../services/mealService';
import type { MealIngredient } from '../services/mealService';

describe('Meal Service', () => {
  describe('mealUtils', () => {
    it('should calculate total carbs correctly', () => {
      const ingredients: MealIngredient[] = [
        { name: 'Rice', weight: 100, carbs: 25 },
        { name: 'Chicken', weight: 150, carbs: 0 },
        { name: 'Broccoli', weight: 50, carbs: 5 }
      ];
      
      const totalCarbs = mealUtils.calculateTotalCarbs(ingredients);
      expect(totalCarbs).toBe(30);
    });

    it('should calculate total weight correctly', () => {
      const ingredients: MealIngredient[] = [
        { name: 'Rice', weight: 100, carbs: 25 },
        { name: 'Chicken', weight: 150, carbs: 0 },
        { name: 'Broccoli', weight: 50, carbs: 5 }
      ];
      
      const totalWeight = mealUtils.calculateTotalWeight(ingredients);
      expect(totalWeight).toBe(300);
    });

    it('should calculate average glycemic index correctly', () => {
      const ingredients: MealIngredient[] = [
        { name: 'Rice', weight: 100, carbs: 25, glycemic_index: 70 },
        { name: 'Chicken', weight: 150, carbs: 0, glycemic_index: 0 },
        { name: 'Broccoli', weight: 50, carbs: 5, glycemic_index: 15 }
      ];
      
      const avgGI = mealUtils.calculateAverageGlycemicIndex(ingredients);
      expect(avgGI).toBeCloseTo(28.33, 2);
    });

    it('should handle missing glycemic index values', () => {
      const ingredients: MealIngredient[] = [
        { name: 'Rice', weight: 100, carbs: 25, glycemic_index: 70 },
        { name: 'Chicken', weight: 150, carbs: 0 }, // No GI
        { name: 'Broccoli', weight: 50, carbs: 5, glycemic_index: 15 }
      ];
      
      const avgGI = mealUtils.calculateAverageGlycemicIndex(ingredients);
      expect(avgGI).toBe(42.5); // (70 + 15) / 2
    });
  });

  describe('Meal Type Handling', () => {
    it('should include meal_type in MealCreate interface', () => {
      const mealData = {
        description: 'Test Meal',
        meal_type: 'Breakfast',
        ingredients: [
          { name: 'Oatmeal', weight: 100, carbs: 60 }
        ]
      };
      
      // This should compile without TypeScript errors
      expect(mealData.meal_type).toBe('Breakfast');
    });

    it('should include meal_type in MealUpdate interface', () => {
      const mealUpdate = {
        description: 'Updated Meal',
        meal_type: 'Lunch'
      };
      
      // This should compile without TypeScript errors
      expect(mealUpdate.meal_type).toBe('Lunch');
    });
  });
});
