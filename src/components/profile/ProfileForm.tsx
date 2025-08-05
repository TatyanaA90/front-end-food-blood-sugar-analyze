import React from 'react';
import { useForm } from 'react-hook-form';
import { User as UserIcon, Edit3, Save, X, Mail, Scale } from 'lucide-react';
import type { User } from '../../contexts/AuthContext';

interface FormData {
  name: string;
  email: string;
  weight: string;
  weight_unit: string;
}

interface ProfileFormProps {
  user: User;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (data: FormData) => void;
  onCancel: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  user,
  isEditing,
  onStartEdit,
  onSave,
  onCancel
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<FormData>({
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
      weight: user.weight ? user.weight.toFixed(2) : '',
      weight_unit: user.weight_unit || 'kg'
    },
    mode: 'onChange'
  });

  const handleSave = (data: FormData) => {
    onSave(data);
  };

  const handleCancel = () => {
    reset({
      name: user.name || '',
      email: user.email || '',
      weight: user.weight ? user.weight.toFixed(2) : '',
      weight_unit: user.weight_unit || 'kg'
    });
    onCancel();
  };

  return (
    <section className="profile-card">
      <header className="profile-card-header">
        <h2 className="profile-card-title">Personal Information</h2>
        {!isEditing ? (
          <button 
            className="profile-edit-btn"
            onClick={onStartEdit}
            type="button"
          >
            <Edit3 className="btn-icon" />
            Edit Profile
          </button>
        ) : (
          <div className="profile-edit-actions">
            <button 
              className="profile-save-btn"
              onClick={handleSubmit(handleSave)}
              disabled={!isValid}
              type="button"
            >
              <Save className="btn-icon" />
              Save
            </button>
            <button 
              className="profile-cancel-btn"
              onClick={handleCancel}
              type="button"
            >
              <X className="btn-icon" />
              Cancel
            </button>
          </div>
        )}
      </header>

      <form className="profile-form" onSubmit={handleSubmit(handleSave)}>
        <div className="profile-field">
          <label className="profile-label" htmlFor="name">
            <UserIcon className="field-icon" />
            Name
          </label>
          {isEditing ? (
            <>
              <input
                id="name"
                type="text"
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  maxLength: { value: 50, message: 'Name must be less than 50 characters' }
                })}
                className={`profile-input ${errors.name ? 'profile-input-error' : ''}`}
                placeholder="Enter your name"
              />
              {errors.name && (
                <span className="profile-error">{errors.name.message}</span>
              )}
            </>
          ) : (
            <div className="profile-value">{user.name}</div>
          )}
        </div>

        <div className="profile-field">
          <label className="profile-label" htmlFor="email">
            <Mail className="field-icon" />
            Email
          </label>
          {isEditing ? (
            <>
              <input
                id="email"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className={`profile-input ${errors.email ? 'profile-input-error' : ''}`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <span className="profile-error">{errors.email.message}</span>
              )}
            </>
          ) : (
            <div className="profile-value">{user.email}</div>
          )}
        </div>

        <div className="profile-field">
          <label className="profile-label">Username</label>
          <div className="profile-value profile-readonly">
            {user.username}
            <span className="profile-readonly-note">(Cannot be changed)</span>
          </div>
        </div>

        <div className="profile-field">
          <label className="profile-label" htmlFor="weight">
            <Scale className="field-icon" />
            Weight
          </label>
          {isEditing ? (
            <>
              <div className="profile-weight-group">
                <input
                  id="weight"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1000"
                  {...register('weight', {
                    valueAsNumber: true,
                    validate: {
                      positive: (value: string) => {
                        if (!value) return true;
                        const num = Number(value);
                        return num >= 1 || 'Weight must be positive';
                      },
                      reasonable: (value: string) => {
                        if (!value) return true;
                        const num = Number(value);
                        return num <= 1000 || 'Weight must be reasonable';
                      },
                      format: (value: string) => {
                        if (!value) return true;
                        const num = Number(value);
                        if (isNaN(num)) return 'Please enter a valid number';
                        const formatted = Number(num.toFixed(2));
                        return formatted === num || 'Please enter a number with up to 2 decimal places';
                      }
                    }
                  })}
                  className={`profile-weight-input ${errors.weight ? 'profile-input-error' : ''}`}
                  placeholder="72.50"
                />
                <span className="profile-weight-unit">kg</span>
              </div>
              <input
                type="hidden"
                {...register('weight_unit')}
                value="kg"
              />
              {errors.weight && (
                <span className="profile-error">{errors.weight.message}</span>
              )}
            </>
          ) : (
            <div className="profile-value">
              {user.weight ? `${user.weight.toFixed(2)} ${user.weight_unit}` : 'Not set'}
            </div>
          )}
        </div>
      </form>
    </section>
  );
};

export default ProfileForm;