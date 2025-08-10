import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, FileText, Activity, Zap, Clock, Calculator } from 'lucide-react';
import type { ActivityCreate, ActivityUpdate } from '../../services/activityService';
import { activityUtils } from '../../services/activityService';
import { toLocalDateTimeString } from '../../utils/dateUtils';
import './ActivityForm.css';

interface ActivityFormProps {
  initialData?: ActivityCreate | ActivityUpdate;
  onSubmit: (data: ActivityCreate | ActivityUpdate) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

interface ActivityFormData {
  type: string;
  duration_min: number;
  intensity: 'low' | 'medium' | 'high';
  note: string;
  timestamp: string;
}

const ActivityForm: React.FC<ActivityFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false,
}) => {
  const [showCalorieCalculation, setShowCalorieCalculation] = useState(false);
  const [calculatedCalories, setCalculatedCalories] = useState<number>(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ActivityFormData>({
    defaultValues: {
      type: initialData?.type || '',
      duration_min: initialData?.duration_min || 30,
      intensity: initialData?.intensity || 'medium',
      note: initialData?.note || '',
      timestamp: initialData?.timestamp
        ? toLocalDateTimeString(new Date(initialData.timestamp))
        : toLocalDateTimeString(new Date()),
    },
  });

  const watchedActivityType = watch('type');
  const watchedDuration = watch('duration_min');
  const watchedIntensity = watch('intensity');

  useEffect(() => {
    if (watchedActivityType && watchedDuration && watchedIntensity) {
      const calories = activityUtils.calculateCaloriesBurned(
        watchedActivityType,
        watchedDuration,
        watchedIntensity
      );
      setCalculatedCalories(calories);
    }
  }, [watchedActivityType, watchedDuration, watchedIntensity]);

  const handleFormSubmit = (data: ActivityFormData) => {
    const activityData = {
      ...data,
      timestamp: data.timestamp ? new Date(data.timestamp).toISOString() : undefined,
      calories_burned: calculatedCalories,
    };

    onSubmit(activityData as ActivityCreate | ActivityUpdate);
  };

  const activityTypes = [
    'walking',
    'running',
    'cycling',
    'swimming',
    'weightlifting',
    'yoga',
    'dancing',
    'basketball',
    'tennis',
    'soccer',
    'hiking',
    'gym',
    'other',
  ];

  return (
    <div className="activity-form-container">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="activity-form">
        <div className="form-header">
          <Activity className="form-icon" />
          <h2>{isEdit ? 'Edit Activity' : 'Add New Activity'}</h2>
        </div>

        <div className="form-section">
          <h3>Activity Information</h3>

          <div className="form-group">
            <label htmlFor="type">
              <Activity className="input-icon" />
              Activity Type
            </label>
            <select
              id="type"
              {...register('type', {
                required: 'Activity type is required',
              })}
              className={errors.type ? 'error' : ''}
            >
              <option value="">Select activity type</option>
              {activityTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            {errors.type && (
              <span className="error-message">{errors.type.message}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration_min">
                <Clock className="input-icon" />
                Duration (minutes)
              </label>
              <input
                id="duration_min"
                type="number"
                min="1"
                max="1440"
                step="1"
                placeholder="30"
                {...register('duration_min', {
                  required: 'Duration is required',
                  min: { value: 1, message: 'Duration must be at least 1 minute' },
                  max: { value: 1440, message: 'Duration cannot exceed 24 hours' },
                  valueAsNumber: true,
                })}
                className={errors.duration_min ? 'error' : ''}
              />
              {errors.duration_min && (
                <span className="error-message">{errors.duration_min.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="intensity">
                <Zap className="input-icon" />
                Intensity
              </label>
              <select
                id="intensity"
                {...register('intensity', {
                  required: 'Intensity is required',
                })}
                className={errors.intensity ? 'error' : ''}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              {errors.intensity && (
                <span className="error-message">{errors.intensity.message}</span>
              )}
            </div>
          </div>

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

          <div className="form-group">
            <label htmlFor="note">
              <FileText className="input-icon" />
              Notes (Optional)
            </label>
            <textarea
              id="note"
              placeholder="Additional notes about the activity..."
              {...register('note')}
              rows={3}
            />
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3>Calorie Calculation</h3>
            <button
              type="button"
              onClick={() => setShowCalorieCalculation(!showCalorieCalculation)}
              className="toggle-calculation-btn"
            >
              <Calculator className="btn-icon" />
              {showCalorieCalculation ? 'Hide' : 'Show'} Calculation
            </button>
          </div>

          {showCalorieCalculation && (
            <div className="calorie-calculation">
              <div className="calculation-item">
                <span className="calculation-label">Activity Type:</span>
                <span className="calculation-value">
                  {watchedActivityType ? watchedActivityType.charAt(0).toUpperCase() + watchedActivityType.slice(1) : 'Not selected'}
                </span>
              </div>
              <div className="calculation-item">
                <span className="calculation-label">Duration:</span>
                <span className="calculation-value">
                  {watchedDuration ? activityUtils.formatDuration(watchedDuration) : '0m'}
                </span>
              </div>
              <div className="calculation-item">
                <span className="calculation-label">Intensity:</span>
                <span className="calculation-value">
                  {watchedIntensity ? activityUtils.getIntensityLabel(watchedIntensity) : 'Not selected'}
                </span>
              </div>
              <div className="calculation-item">
                <span className="calculation-label">Estimated Calories Burned:</span>
                <span className="calculation-value calories">
                  {calculatedCalories > 0 ? `${calculatedCalories} cal` : 'N/A'}
                </span>
              </div>
            </div>
          )}
        </div>

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
            {isLoading ? 'Saving...' : (isEdit ? 'Update Activity' : 'Add Activity')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActivityForm;
