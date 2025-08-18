import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Calendar, FileText, Utensils, Calculator, BookOpen } from 'lucide-react';
import type { MealCreate, MealUpdate, MealIngredient, PredefinedMeal } from '../../services/mealService';
import { mealUtils, mealService } from '../../services/mealService';
import PredefinedMealSelector from './PredefinedMealSelector';
import { localDateTimeToUtcIso } from '../../utils/dateUtils';
import './MealForm.css';

interface MealFormProps {
  initialData?: MealCreate | MealUpdate;
  onSubmit: (data: MealCreate | MealUpdate, options?: { saveAsTemplate?: boolean }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

interface MealFormData {
  description: string;
  meal_type: string;
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
  const [showPredefinedSelector, setShowPredefinedSelector] = useState(false);
  const [descriptionType, setDescriptionType] = useState<'custom' | 'predefined'>('custom');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  const toLocalInputValue = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Meal type options
  const mealTypes = [
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snack',
    'Dessert',
    'Beverage'
  ];

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MealFormData>({
    defaultValues: {
      description: initialData?.description || '',
      meal_type: initialData?.meal_type ?? '',
      timestamp: initialData?.timestamp
        ? toLocalInputValue(new Date(initialData.timestamp))
        : toLocalInputValue(new Date()),
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
      timestamp: data.timestamp ? localDateTimeToUtcIso(data.timestamp) : undefined,
      ingredients: data.ingredients.filter(ing => ing.name.trim() !== ''),
    };

    onSubmit(mealData as MealCreate | MealUpdate, { saveAsTemplate });
  };

  const addIngredient = () => {
    append({ name: '', carbs: 0, weight: 0 });
  };

  const removeIngredient = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handlePredefinedMealSelected = async (
    meal: PredefinedMeal,
    quantity: number,
    ingredientAdjustments: Array<{ingredient_id: number, adjusted_weight: number}>
  ) => {
    try {
      const mealData = {
        predefined_meal_id: meal.id,
        quantity,
        timestamp: new Date().toISOString(),
        ingredient_adjustments: ingredientAdjustments
      };

      const createdMeal = await mealService.createMealFromPredefined(mealData);
      onSubmit(createdMeal as MealCreate | MealUpdate);
    } catch (error) {
      console.error('Error creating meal from predefined:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleLoadPredefinedIntoForm = (data: { description: string; ingredients: MealIngredient[]; meal_type?: string }) => {
    // Set description using react-hook-form to keep form state in sync
    setValue('description', data.description, { shouldValidate: true, shouldDirty: true });
    if (data.meal_type) {
      setValue('meal_type', data.meal_type, { shouldValidate: true, shouldDirty: true });
    }

    // Reset ingredient fields to match provided list
    // Remove existing fields
    for (let i = fields.length - 1; i >= 0; i--) {
      remove(i);
    }
    // Append new ingredients
    data.ingredients.forEach((ing) => {
      append({
        name: ing.name,
        weight: ing.weight ?? 0,
        carbs: ing.carbs ?? 0,
        glycemic_index: ing.glycemic_index,
        note: ing.note ?? ''
      });
    });

    setShowPredefinedSelector(false);
  };

  return (
    <>
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
                Meal Description
              </label>

              <div className="description-type-toggle">
                <button
                  type="button"
                  className={`toggle-btn ${descriptionType === 'predefined' ? 'active' : ''}`}
                  onClick={() => setDescriptionType('predefined')}
                >
                  Predefined Template
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${descriptionType === 'custom' ? 'active' : ''}`}
                  onClick={() => setDescriptionType('custom')}
                >
                  Custom
                </button>
              </div>

              {descriptionType === 'predefined' ? (
                <div className="preset-description-container">
                  {/* Predefined selection UX */}
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={() => setShowPredefinedSelector(true)}
                      className="predefined-meal-btn"
                    >
                      <BookOpen className="btn-icon" />
                      Choose Predefined Meal
                    </button>
                  )}

                  <div className="form-group" style={{ marginTop: 12 }}>
                    <label htmlFor="meal-type">Meal Type</label>
                    <select
                      id="meal-type"
                      {...register('meal_type', {
                        required: 'Meal type is required',
                      })}
                      className={errors.meal_type ? 'error' : ''}
                    >
                      <option value="">Select meal type...</option>
                      {mealTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.meal_type && (
                      <span className="error-message">{errors.meal_type.message}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <input
                      id="description"
                      type="text"
                      placeholder="Choose a template or type description"
                      {...register('description', {
                        required: 'Description is required',
                        minLength: {
                          value: 2,
                          message: 'Description must be at least 2 characters',
                        },
                      })}
                      className={errors.description ? 'error' : ''}
                    />
                  </div>
                </div>
              ) : (
                <div className="custom-description-container">
                  <div className="form-group">
                    <label htmlFor="meal-type-custom">Meal Type</label>
                    <select
                      id="meal-type-custom"
                      {...register('meal_type', {
                        required: 'Meal type is required',
                      })}
                      className={errors.meal_type ? 'error' : ''}
                    >
                      <option value="">Select meal type...</option>
                      {mealTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.meal_type && (
                      <span className="error-message">{errors.meal_type.message}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Custom Description</label>
                    <input
                      id="description"
                      type="text"
                      placeholder="e.g., Grilled Chicken with Vegetables, Homemade Pizza, etc."
                      {...register('description', {
                        required: 'Description is required',
                        minLength: {
                          value: 2,
                          message: 'Description must be at least 2 characters',
                        },
                      })}
                      className={errors.description ? 'error' : ''}
                    />
                  </div>
                </div>
              )}

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
                    <label htmlFor={`ingredients.${index}.weight`}>Weight (g)</label>
                    <input
                      id={`ingredients.${index}.weight`}
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0"
                      {...register(`ingredients.${index}.weight` as const, {
                        valueAsNumber: true,
                        min: {
                          value: 0,
                          message: 'Weight must be >= 0',
                        },
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
                    <label htmlFor={`ingredients.${index}.carbs`}>Carbs (g)</label>
                    <input
                      id={`ingredients.${index}.carbs`}
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0"
                      {...register(`ingredients.${index}.carbs` as const, {
                        required: 'Carbs is required',
                        valueAsNumber: true,
                        min: {
                          value: 0,
                          message: 'Carbs must be >= 0',
                        },
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
                    <label htmlFor={`ingredients.${index}.glycemic_index`}>Glycemic Index</label>
                    <input
                      id={`ingredients.${index}.glycemic_index`}
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="0-100"
                      {...register(`ingredients.${index}.glycemic_index` as const, {
                        valueAsNumber: true,
                        min: {
                          value: 0,
                          message: 'GI must be >= 0',
                        },
                        max: {
                          value: 100,
                          message: 'GI must be <= 100',
                        },
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
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                onChange={(e) => setSaveAsTemplate(e.target.checked)}
              />
              Save as template (personal)
            </label>
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

      {/* Predefined Meal Selector Modal */}
      {showPredefinedSelector && (
        <div className="modal-overlay">
          <div className="modal-content">
            <PredefinedMealSelector
              onMealSelected={handlePredefinedMealSelected}
              onCancel={() => setShowPredefinedSelector(false)}
              onLoadIntoForm={(payload) => handleLoadPredefinedIntoForm({
                description: payload.description,
                ingredients: payload.ingredients,
                meal_type: payload.meal_type
              })}
              autoLoadOnSelect
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MealForm;
