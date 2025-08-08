import React from 'react';
import { useForm } from 'react-hook-form';
import { Syringe, Clock, FileText, Save, X } from 'lucide-react';
import type { InsulinDoseCreate, InsulinDoseUpdate } from '../../services/insulinDoseService';
import './InsulinDoseForm.css';

interface InsulinDoseFormProps {
  initialData?: InsulinDoseCreate | InsulinDoseUpdate;
  onSubmit: (data: InsulinDoseCreate | InsulinDoseUpdate) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

interface InsulinDoseFormData {
  units: number;
  note: string;
  timestamp: string;
}

const InsulinDoseForm: React.FC<InsulinDoseFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InsulinDoseFormData>({
    defaultValues: {
      units: (initialData as any)?.units || 1,
      note: (initialData as any)?.note || '',
      timestamp: (initialData as any)?.timestamp 
        ? new Date((initialData as any).timestamp).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
    },
  });

  const handleFormSubmit = (data: InsulinDoseFormData) => {
    const doseData = {
      ...data,
      timestamp: data.timestamp ? new Date(data.timestamp).toISOString() : undefined,
    };

    onSubmit(doseData as InsulinDoseCreate | InsulinDoseUpdate);
  };

  return (
    <div className="insulin-dose-form-container">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="insulin-dose-form">
        <div className="form-header">
          <Syringe className="form-icon" />
          <h2>{isEdit ? 'Edit Insulin Dose' : 'Add New Insulin Dose'}</h2>
        </div>

        <div className="form-section">
          <h3>Dose Information</h3>
          
          <div className="form-group">
            <label htmlFor="units">
              <Syringe className="input-icon" />
              Units
            </label>
            <input
              id="units"
              type="number"
              min="0.1"
              max="100"
              step="0.1"
              placeholder="5.0"
              {...register('units', {
                required: 'Units are required',
                min: { value: 0.1, message: 'Units must be at least 0.1' },
                max: { value: 100, message: 'Units cannot exceed 100' },
                valueAsNumber: true,
              })}
              className={errors.units ? 'error' : ''}
            />
            {errors.units && (
              <span className="error-message">{errors.units.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="timestamp">
              <Clock className="input-icon" />
              Date & Time
            </label>
            <input
              id="timestamp"
              type="datetime-local"
              {...register('timestamp', {
                required: 'Date and time are required',
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
              placeholder="Additional notes about the insulin dose..."
              {...register('note')}
              rows={3}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-btn"
            disabled={isLoading}
          >
            <X className="btn-icon" />
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading}
          >
            <Save className="btn-icon" />
            {isLoading ? 'Saving...' : isEdit ? 'Update Dose' : 'Add Dose'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InsulinDoseForm;
