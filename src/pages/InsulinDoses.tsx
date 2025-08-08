import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import NavigationHeader from '../components/layout/NavigationHeader';
import InsulinDoseList from '../components/insulin/InsulinDoseList';
import InsulinDoseForm from '../components/insulin/InsulinDoseForm';
import { useInsulinDoses, useCreateInsulinDose, useUpdateInsulinDose, useDeleteInsulinDose } from '../hooks/useInsulinDoseManagement';
import type { InsulinDoseBasic, InsulinDoseCreate, InsulinDoseUpdate } from '../services/insulinDoseService';
import './InsulinDoses.css';

const InsulinDoses: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingDose, setEditingDose] = useState<InsulinDoseBasic | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<InsulinDoseBasic | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const { data: doses = [], isLoading, error } = useInsulinDoses();
  const createDoseMutation = useCreateInsulinDose();
  const updateDoseMutation = useUpdateInsulinDose();
  const deleteDoseMutation = useDeleteInsulinDose();

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleFormSubmit = async (doseData: InsulinDoseCreate | InsulinDoseUpdate) => {
    try {
      if (editingDose) {
        await updateDoseMutation.mutateAsync({
          doseId: editingDose.id,
          doseData: doseData as InsulinDoseUpdate,
        });
        showNotification('success', 'Insulin dose updated successfully!');
      } else {
        await createDoseMutation.mutateAsync(doseData as InsulinDoseCreate);
        showNotification('success', 'Insulin dose added successfully!');
      }
      handleCloseForm();
    } catch (error: unknown) {
      console.error('Error saving insulin dose:', error);
      const errorMessage = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || (error as Error)?.message || 'Failed to save insulin dose';
      showNotification('error', errorMessage);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDose(null);
  };

  const handleEditDose = (dose: InsulinDoseBasic) => {
    setEditingDose(dose);
    setShowForm(true);
  };

  const handleDeleteDose = (dose: InsulinDoseBasic) => {
    setShowDeleteConfirm(dose);
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;

    try {
      await deleteDoseMutation.mutateAsync(showDeleteConfirm.id);
      showNotification('success', 'Insulin dose deleted successfully!');
      setShowDeleteConfirm(null);
    } catch (error: unknown) {
      console.error('Error deleting insulin dose:', error);
      const errorMessage = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || (error as Error)?.message || 'Failed to delete insulin dose';
      showNotification('error', errorMessage);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const handleAddDose = () => {
    setEditingDose(null);
    setShowForm(true);
  };

  if (error) {
    return (
      <div className="insulin-doses-error">
        <NavigationHeader title="Insulin Doses" />
        <div className="error-container">
          <XCircle className="error-icon" />
          <h2>Error Loading Insulin Doses</h2>
          <p>Failed to load insulin doses. Please try refreshing the page.</p>
          <p className="error-details">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="insulin-doses-page">
      <NavigationHeader title="Insulin Doses" />
      
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

      <main className="insulin-doses-main">
        {showForm ? (
          <InsulinDoseForm
            initialData={editingDose || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            isLoading={createDoseMutation.isPending || updateDoseMutation.isPending}
            isEdit={!!editingDose}
          />
        ) : (
          <InsulinDoseList
            doses={doses}
            onAddDose={handleAddDose}
            onEditDose={handleEditDose}
            onDeleteDose={handleDeleteDose}
            isLoading={isLoading}
          />
        )}
      </main>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="delete-confirmation-modal">
            <div className="modal-header">
              <AlertTriangle className="modal-icon" />
              <h3>Delete Insulin Dose</h3>
            </div>
            <div className="modal-content">
              <p>
                Are you sure you want to delete "{showDeleteConfirm.units} units"?
              </p>
              <p className="warning-text">
                This action cannot be undone. All insulin dose data will be permanently removed.
              </p>
            </div>
            <div className="modal-actions">
              <button
                onClick={cancelDelete}
                className="cancel-btn"
                disabled={deleteDoseMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="delete-btn"
                disabled={deleteDoseMutation.isPending}
              >
                {deleteDoseMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsulinDoses;
