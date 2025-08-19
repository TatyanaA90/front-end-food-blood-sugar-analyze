import React from 'react';
import { useForm } from 'react-hook-form';
import { Droplets, Clock, Utensils, FileText, X, Save } from 'lucide-react';
import type { GlucoseReading, CreateGlucoseReadingRequest, UpdateGlucoseReadingRequest } from '../../types/glucose';
import { MEAL_CONTEXT_OPTIONS } from '../../types/glucose';
import { useGlucoseUnitUtils } from '../../hooks/useGlucoseUnit';
import { toLocalDateTimeString, utcTimestampToLocalDateTimeString } from '../../utils/dateUtils';
import './GlucoseReadingForm.css';

interface GlucoseReadingFormProps {
  reading?: GlucoseReading;
  onSubmit: (data: CreateGlucoseReadingRequest | UpdateGlucoseReadingRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const GlucoseReadingForm: React.FC<GlucoseReadingFormProps> = ({
  reading,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const { preferredUnit, getValidationRanges } = useGlucoseUnitUtils();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue
  } = useForm<CreateGlucoseReadingRequest>({
    mode: 'onChange',
    defaultValues: {
      reading: reading?.reading || 0,
      unit: reading?.unit || preferredUnit,
      reading_time: reading?.reading_time
        ? utcTimestampToLocalDateTimeString(reading.reading_time)
        : toLocalDateTimeString(new Date()),
      meal_context: reading?.meal_context || 'other',
      notes: reading?.notes || ''
    }
  });

  const watchedUnit = watch('unit');
  const validationRanges = getValidationRanges();

  const handleFormSubmit = (data: CreateGlucoseReadingRequest) => {
    const payload: CreateGlucoseReadingRequest = {
      ...data,
      // Send the local datetime string directly, just like activities
      // No UTC conversion needed
    };
    onSubmit(payload);
  };

  return (
    <div className="glucose-form-overlay">
      <div className="glucose-form-modal">
        <div className="glucose-form-header">
          <h2 className="glucose-form-title">
            {reading ? 'Edit Glucose Reading' : 'Add New Glucose Reading'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="glucose-form-close-btn"
            aria-label="Close form"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="glucose-form">
          {/* Reading Value */}
          <div className="glucose-form-field">
            <label htmlFor="reading" className="glucose-form-label">
              <Droplets size={16} />
              Glucose Reading
            </label>
            <div className="glucose-form-input-group">
              <input
                id="reading"
                type="number"
                step={validationRanges.step}
                min={validationRanges.min}
                max={validationRanges.max}
                {...register('reading', {
                  required: 'Glucose reading is required',
                  min: { value: validationRanges.min, message: 'Reading must be positive' },
                  max: {
                    value: validationRanges.max,
                    message: `Reading must be less than ${validationRanges.max} ${watchedUnit}`
                  }
                })}
                className={`glucose-form-input ${errors.reading ? 'glucose-form-input-error' : ''}`}
                placeholder={`Enter reading in ${watchedUnit}`}
              />
              <select
                {...register('unit')}
                className="glucose-form-unit-select"
                onChange={(e) => {
                  const newUnit = e.target.value as 'mg/dL' | 'mmol/L';
                  setValue('unit', newUnit);
                }}
              >
                <option value="mg/dL">mg/dL</option>
                <option value="mmol/L">mmol/L</option>
              </select>
            </div>
            {errors.reading && (
              <p className="glucose-form-error">{errors.reading.message}</p>
            )}
          </div>

          {/* Reading Time */}
          <div className="glucose-form-field">
            <label htmlFor="reading_time" className="glucose-form-label">
              <Clock size={16} />
              Reading Time
            </label>
            <input
              id="reading_time"
              type="datetime-local"
              {...register('reading_time', {
                required: 'Reading time is required'
              })}
              className={`glucose-form-input ${errors.reading_time ? 'glucose-form-input-error' : ''}`}
            />
            {errors.reading_time && (
              <p className="glucose-form-error">{errors.reading_time.message}</p>
            )}
          </div>

          {/* Meal Context */}
          <div className="glucose-form-field">
            <label htmlFor="meal_context" className="glucose-form-label">
              <Utensils size={16} />
              Meal Context
            </label>
            <select
              id="meal_context"
              {...register('meal_context')}
              className={`glucose-form-select ${errors.meal_context ? 'glucose-form-input-error' : ''}`}
            >
              {MEAL_CONTEXT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.meal_context && (
              <p className="glucose-form-error">{errors.meal_context.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="glucose-form-field">
            <label htmlFor="notes" className="glucose-form-label">
              <FileText size={16} />
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              {...register('notes')}
              className="glucose-form-textarea"
              placeholder="Add any additional notes about this reading..."
              rows={3}
            />
            {errors.notes && (
              <p className="glucose-form-error">{errors.notes.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="glucose-form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="glucose-form-btn glucose-form-btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="glucose-form-btn glucose-form-btn-primary"
              disabled={!isValid || isLoading}
            >
              {isLoading ? (
                <span className="glucose-form-loading">Saving...</span>
              ) : (
                <>
                  <Save size={16} />
                  {reading ? 'Update Reading' : 'Add Reading'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GlucoseReadingForm;