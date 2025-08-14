import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import NavigationHeader from '../components/layout/NavigationHeader';
import ActivityList from '../components/activities/ActivityList';
import ActivityForm from '../components/activities/ActivityForm';
import { useActivities, useCreateActivity, useUpdateActivity, useDeleteActivity } from '../hooks/useActivityManagement';
import type { ActivityBasic, ActivityCreate, ActivityUpdate } from '../services/activityService';
import { useUserData } from '../hooks/useUserManagement';
import { useAuth } from '../hooks/useAuth';
import './Activities.css';

const Activities: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityBasic | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<ActivityBasic | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const { data: activities = [], isLoading, error } = useActivities();
  const location = useLocation();
  const urlUserParam = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const v = params.get('user');
    return v ? Number(v) : undefined;
  }, [location.search]);
  const { user } = useAuth();
  const isAdmin = !!user?.is_admin;
  const { data: selectedUserData } = useUserData(isAdmin ? (urlUserParam || 0) : 0);
  const createActivityMutation = useCreateActivity();
  const updateActivityMutation = useUpdateActivity();
  const deleteActivityMutation = useDeleteActivity();

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleFormSubmit = async (activityData: ActivityCreate | ActivityUpdate) => {
    try {
      if (editingActivity) {
        await updateActivityMutation.mutateAsync({
          activityId: editingActivity.id,
          activityData: activityData as ActivityUpdate,
        });
        showNotification('success', 'Activity updated successfully!');
      } else {
        await createActivityMutation.mutateAsync(activityData as ActivityCreate);
        showNotification('success', 'Activity added successfully!');
      }
      handleCloseForm();
    } catch (error: unknown) {
      console.error('Error saving activity:', error);
      const errorMessage = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || (error as Error)?.message || 'Failed to save activity';
      showNotification('error', errorMessage);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingActivity(null);
  };

  const handleEditActivity = (activity: ActivityBasic) => {
    setEditingActivity(activity);
    setShowForm(true);
  };

  const handleDeleteActivity = (activity: ActivityBasic) => {
    setShowDeleteConfirm(activity);
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;

    try {
      await deleteActivityMutation.mutateAsync(showDeleteConfirm.id);
      showNotification('success', 'Activity deleted successfully!');
      setShowDeleteConfirm(null);
    } catch (error: unknown) {
      console.error('Error deleting activity:', error);
      const errorMessage = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || (error as Error)?.message || 'Failed to delete activity';
      showNotification('error', errorMessage);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const handleAddActivity = () => {
    setEditingActivity(null);
    setShowForm(true);
  };

  if (error) {
    return (
      <div className="activities-error">
        <NavigationHeader title="Activities" />
        <div className="error-container">
          <XCircle className="error-icon" />
          <h2>Error Loading Activities</h2>
          <p>Failed to load activities. Please try refreshing the page.</p>
          <p className="error-details">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="activities-page">
      <NavigationHeader title="Activities" />
      
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

      <main className="activities-main">
        {showForm ? (
          <ActivityForm
            initialData={editingActivity || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            isLoading={createActivityMutation.isPending || updateActivityMutation.isPending}
            isEdit={!!editingActivity}
          />
        ) : (
          <ActivityList
            activities={isAdmin && urlUserParam
              ? (() => {
                  const withUserId = activities.filter(a => Object.prototype.hasOwnProperty.call(a, 'user_id')) as Array<ActivityBasic & { user_id?: number }>;
                  if (withUserId.length > 0) {
                    return withUserId.filter(a => a.user_id === urlUserParam);
                  }
                  // Fallback to admin user data if list items lack user_id
                  if (selectedUserData?.activities && selectedUserData.activities.length > 0) {
                    return selectedUserData.activities.map(a => ({
                      id: a.id,
                      // type: (a as any).activity_type || 'activity',
                      // duration_min: (a as any).duration_minutes ?? 0,
                      type: (a as { activity_type?: string }).activity_type || 'activity',
                      duration_min: (a as { duration_minutes?: number }).duration_minutes ?? 0,
                      timestamp: a.timestamp,
                      user_id: urlUserParam,
                    } as ActivityBasic));
                  }
                  return [] as ActivityBasic[];
                })()
              : activities}
            onAddActivity={handleAddActivity}
            onEditActivity={handleEditActivity}
            onDeleteActivity={handleDeleteActivity}
            isLoading={isLoading}
          />
        )}
      </main>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="delete-confirmation-modal">
            <div className="modal-header">
              <AlertTriangle className="modal-icon" />
              <h3>Delete Activity</h3>
            </div>
            <div className="modal-content">
              <p>
                Are you sure you want to delete "{showDeleteConfirm.type}"?
              </p>
              <p className="warning-text">
                This action cannot be undone. All activity data will be permanently removed.
              </p>
            </div>
            <div className="modal-actions">
              <button
                onClick={cancelDelete}
                className="cancel-btn"
                disabled={deleteActivityMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="delete-btn"
                disabled={deleteActivityMutation.isPending}
              >
                {deleteActivityMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;
