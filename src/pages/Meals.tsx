import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import NavigationHeader from '../components/layout/NavigationHeader';
import MealList from '../components/meals/MealList';
import MealForm from '../components/meals/MealForm';
import { useMeals, useCreateMeal, useUpdateMeal, useDeleteMeal } from '../hooks/useMealManagement';
import type { MealBasic, MealCreate, MealUpdate } from '../services/mealService';
import './Meals.css';

const Meals: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealBasic | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<MealBasic | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // React Query hooks
  const { data: meals = [], isLoading, error } = useMeals();
  const createMealMutation = useCreateMeal();
  const updateMealMutation = useUpdateMeal();
  const deleteMealMutation = useDeleteMeal();

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle form submission
  const handleFormSubmit = async (mealData: MealCreate | MealUpdate) => {
    try {
      if (editingMeal) {
        await updateMealMutation.mutateAsync({
          mealId: editingMeal.id,
          mealData: mealData as MealUpdate,
        });
        showNotification('success', 'Meal updated successfully!');
      } else {
        await createMealMutation.mutateAsync(mealData as MealCreate);
        showNotification('success', 'Meal added successfully!');
      }
      handleCloseForm();
    } catch (error: unknown) {
      console.error('Error saving meal:', error);
      const errorMessage = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || (error as Error)?.message || 'Failed to save meal';
      showNotification('error', errorMessage);
    }
  };

  // Handle form cancellation
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMeal(null);
  };

  // Handle edit meal
  const handleEditMeal = (meal: MealBasic) => {
    setEditingMeal(meal);
    setShowForm(true);
  };

  // Handle delete meal
  const handleDeleteMeal = (meal: MealBasic) => {
    setShowDeleteConfirm(meal);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;

    try {
      await deleteMealMutation.mutateAsync(showDeleteConfirm.id);
      showNotification('success', 'Meal deleted successfully!');
      setShowDeleteConfirm(null);
    } catch (error: unknown) {
      console.error('Error deleting meal:', error);
      const errorMessage = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || (error as Error)?.message || 'Failed to delete meal';
      showNotification('error', errorMessage);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  // Handle add meal
  const handleAddMeal = () => {
    setEditingMeal(null);
    setShowForm(true);
  };

  if (error) {
    return (
      <div className="meals-error">
        <NavigationHeader />
        <div className="error-container">
          <XCircle className="error-icon" />
          <h2>Error Loading Meals</h2>
          <p>Failed to load meals. Please try refreshing the page.</p>
          <p className="error-details">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="meals-page">
      <NavigationHeader />
      
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === 'success' ? (
            <CheckCircle className="notification-icon" />
          ) : (
            <AlertTriangle className="notification-icon" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Content */}
      <main className="meals-main">
        {showForm ? (
          <MealForm
            initialData={editingMeal || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            isLoading={createMealMutation.isPending || updateMealMutation.isPending}
            isEdit={!!editingMeal}
          />
        ) : (
          <MealList
            meals={meals}
            onAddMeal={handleAddMeal}
            onEditMeal={handleEditMeal}
            onDeleteMeal={handleDeleteMeal}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="delete-confirmation-modal">
            <div className="modal-header">
              <AlertTriangle className="modal-icon" />
              <h3>Delete Meal</h3>
            </div>
            <div className="modal-content">
              <p>
                Are you sure you want to delete "{showDeleteConfirm.description || 'this meal'}"?
              </p>
              <p className="warning-text">
                This action cannot be undone. All meal data and ingredients will be permanently removed.
              </p>
            </div>
            <div className="modal-actions">
              <button
                onClick={cancelDelete}
                className="cancel-btn"
                disabled={deleteMealMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="delete-btn"
                disabled={deleteMealMutation.isPending}
              >
                {deleteMealMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meals;
