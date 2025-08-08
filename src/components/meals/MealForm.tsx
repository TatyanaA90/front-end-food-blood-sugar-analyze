import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Calendar, FileText, Utensils, Calculator } from 'lucide-react';
import type { MealCreate, MealUpdate, MealIngredient } from '../../services/mealService';
import { mealUtils } from '../../services/mealService';
import './MealForm.css';

interface MealFormProps {
  initialData?: MealCreate | MealUpdate;
  onSubmit: (data: MealCreate | MealUpdate) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

interface MealFormData {
  description: string;
  timestamp: string;
  note: string;
  photo_url: string;
  ingredients: MealIngredient[];
}

const MealForm: React.FC<MealFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false,
}) => {
  const [showNutritionSummary, setShowNutritionSummary] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<MealFormData>({
    defaultValues: {
      description: initialData?.description || '',
      timestamp: initialData?.timestamp 
        ? new Date(initialData.timestamp).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      note: initialData?.note || '',
      photo_url: initialData?.photo_url || '',
      ingredients: initialData?.ingredients || [{ name: '', carbs: 0, weight: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const watchedIngredients = watch('ingredients');

  // Calculate nutrition summary
  const nutritionSummary = {
    totalCarbs: mealUtils.calculateTotalCarbs(watchedIngredients),
    totalWeight: mealUtils.calculateTotalWeight(watchedIngredients),
    averageGI: mealUtils.calculateAverageGlycemicIndex(watchedIngredients),
  };

  const handleFormSubmit = (data: MealFormData) => {
    const mealData = {
      ...data,
      timestamp: data.timestamp ? new Date(data.timestamp).toISOString() : undefined,
      ingredients: data.ingredients.filter(ing => ing.name.trim() !== ''),
    };

    onSubmit(mealData as MealCreate | MealUpdate);
  };

  const addIngredient = () => {
    append({ name: '', carbs: 0, weight: 0 });
  };

  const removeIngredient = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className="meal-form-container">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="meal-form">
        <div className="form-header">
          <Utensils className="form-icon" />
          <h2>{isEdit ? 'Edit Meal' : 'Add New Meal'}</h2>
        </div>

        {/* Basic Meal Information */}
        <div className="form-section">
          <h3>Meal Information</h3>
          
          <div className="form-group">
            <label htmlFor="description">
              <FileText className="input-icon" />
              Description
            </label>
            <input
              id="description"
              type="text"
              placeholder="e.g., Breakfast, Lunch, Dinner, or specific meal name"
              {...register('description', {
                required: 'Description is required',
                minLength: {
                  value: 2,
                  message: 'Description must be at least 2 characters',
                },
              })}
              className={errors.description ? 'error' : ''}
            />
            {errors.description && (
              <span className="error-message">{errors.description.message}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="timestamp">
                <Calendar className="input-icon" />
                Date & Time
              </label>
              <input
                id="timestamp"
                type="datetime-local"
                {...register('timestamp', {
                  required: 'Date and time is required',
                })}
                className={errors.timestamp ? 'error' : ''}
              />
              {errors.timestamp && (
                <span className="error-message">{errors.timestamp.message}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="note">
              <FileText className="input-icon" />
              Notes (Optional)
            </label>
            <textarea
              id="note"
              placeholder="Additional notes about the meal..."
              {...register('note')}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="photo_url">
              <FileText className="input-icon" />
              Photo URL (Optional)
            </label>
            <input
              id="photo_url"
              type="url"
              placeholder="https://example.com/meal-photo.jpg"
              {...register('photo_url')}
            />
          </div>
        </div>

        {/* Ingredients Section */}
        <div className="form-section">
          <div className="section-header">
            <h3>Ingredients</h3>
            <button
              type="button"
              onClick={addIngredient}
              className="add-ingredient-btn"
            >
              <Plus className="btn-icon" />
              Add Ingredient
            </button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="ingredient-row">
              <div className="ingredient-inputs">
                <div className="form-group">
                  <label htmlFor={`ingredients.${index}.name`}>Ingredient Name</label>
                  <input
                    id={`ingredients.${index}.name`}
                    type="text"
                    placeholder="e.g., Rice, Chicken, Broccoli"
                    {...register(`ingredients.${index}.name` as const, {
                      required: 'Ingredient name is required',
                    })}
                    className={errors.ingredients?.[index]?.name ? 'error' : ''}
                  />
                  {errors.ingredients?.[index]?.name && (
                    <span className="error-message">
                      {errors.ingredients[index]?.name?.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor={`ingredients.${index}.carbs`}>Carbs (g)</label>
                  <input
                    id={`ingredients.${index}.carbs`}
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    {...register(`ingredients.${index}.carbs` as const, {
                      required: 'Carbs amount is required',
                      min: { value: 0, message: 'Carbs must be 0 or greater' },
                      valueAsNumber: true,
                    })}
                    className={errors.ingredients?.[index]?.carbs ? 'error' : ''}
                  />
                  {errors.ingredients?.[index]?.carbs && (
                    <span className="error-message">
                      {errors.ingredients[index]?.carbs?.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor={`ingredients.${index}.weight`}>Weight (g)</label>
                  <input
                    id={`ingredients.${index}.weight`}
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    {...register(`ingredients.${index}.weight` as const, {
                      min: { value: 0, message: 'Weight must be 0 or greater' },
                      valueAsNumber: true,
                    })}
                    className={errors.ingredients?.[index]?.weight ? 'error' : ''}
                  />
                  {errors.ingredients?.[index]?.weight && (
                    <span className="error-message">
                      {errors.ingredients[index]?.weight?.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor={`ingredients.${index}.glycemic_index`}>Glycemic Index</label>
                  <input
                    id={`ingredients.${index}.glycemic_index`}
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="0-100"
                    {...register(`ingredients.${index}.glycemic_index` as const, {
                      min: { value: 0, message: 'GI must be 0 or greater' },
                      max: { value: 100, message: 'GI must be 100 or less' },
                      valueAsNumber: true,
                    })}
                    className={errors.ingredients?.[index]?.glycemic_index ? 'error' : ''}
                  />
                  {errors.ingredients?.[index]?.glycemic_index && (
                    <span className="error-message">
                      {errors.ingredients[index]?.glycemic_index?.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor={`ingredients.${index}.note`}>Note</label>
                  <input
                    id={`ingredients.${index}.note`}
                    type="text"
                    placeholder="Optional note"
                    {...register(`ingredients.${index}.note` as const)}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="remove-ingredient-btn"
                  disabled={fields.length === 1}
                >
                  <Trash2 className="btn-icon" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Nutrition Summary */}
        <div className="form-section">
          <div className="section-header">
            <h3>Nutrition Summary</h3>
            <button
              type="button"
              onClick={() => setShowNutritionSummary(!showNutritionSummary)}
              className="toggle-summary-btn"
            >
              <Calculator className="btn-icon" />
              {showNutritionSummary ? 'Hide' : 'Show'} Summary
            </button>
          </div>

          {showNutritionSummary && (
            <div className="nutrition-summary">
              <div className="summary-item">
                <span className="summary-label">Total Carbs:</span>
                <span className="summary-value">{nutritionSummary.totalCarbs.toFixed(1)}g</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total Weight:</span>
                <span className="summary-value">{nutritionSummary.totalWeight.toFixed(1)}g</span>
              </div>
              {nutritionSummary.averageGI && (
                <div className="summary-item">
                  <span className="summary-label">Average GI:</span>
                  <span className="summary-value">{nutritionSummary.averageGI.toFixed(1)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-btn"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : (isEdit ? 'Update Meal' : 'Add Meal')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MealForm;
