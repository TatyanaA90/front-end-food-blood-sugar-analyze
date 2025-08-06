import React, { useState } from 'react';
import { X, User, Mail, Calendar, Shield, Activity, Utensils, Droplets, FileText, Edit3, Save, XCircle } from 'lucide-react';
import { useUserData, useUpdateUserAdmin } from '../../hooks/useUserManagement';
import type { UserDetail } from '../../services/userService';

interface UserDetailModalProps {
  isOpen: boolean;
  user: UserDetail | null;
  onClose: () => void;
  onRefresh: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  user,
  onClose,
  onRefresh
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UserDetail>>({});
  
  const { data: userData, isLoading } = useUserData(user?.id || 0);
  const updateUserMutation = useUpdateUserAdmin();

  if (!isOpen || !user) return null;

  const handleEdit = () => {
    setEditData({
      name: user.name,
      email: user.email,
      weight: user.weight,
      weight_unit: user.weight_unit,
      is_admin: user.is_admin
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!user.id) return;

    try {
      await updateUserMutation.mutateAsync({
        userId: user.id,
        data: editData
      });
      setIsEditing(false);
      onRefresh();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal user-detail-modal" onClick={(e) => e.stopPropagation()}>
        <header className="admin-modal-header">
          <div className="modal-header-content">
            <User className="modal-user-icon" />
            <h2 className="admin-modal-title">
              {isEditing ? 'Edit User' : 'User Details'}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X className="close-icon" />
          </button>
        </header>

        <div className="admin-modal-content">
          {isLoading ? (
            <div className="modal-loading">
              <p>Loading user data...</p>
            </div>
          ) : (
            <>
              {/* Basic User Information */}
              <section className="user-detail-section">
                <h3 className="section-title">Basic Information</h3>
                <div className="user-detail-grid">
                  <div className="detail-item">
                    <label className="detail-label">Username</label>
                    <span className="detail-value">{user.username}</span>
                  </div>
                  <div className="detail-item">
                    <label className="detail-label">Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.name || ''}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="detail-input"
                      />
                    ) : (
                      <span className="detail-value">{user.name}</span>
                    )}
                  </div>
                  <div className="detail-item">
                    <label className="detail-label">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editData.email || ''}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="detail-input"
                      />
                    ) : (
                      <span className="detail-value">{user.email}</span>
                    )}
                  </div>
                  <div className="detail-item">
                    <label className="detail-label">Weight</label>
                    {isEditing ? (
                      <div className="weight-input-group">
                        <input
                          type="number"
                          step="0.1"
                          value={editData.weight || ''}
                          onChange={(e) => setEditData({ ...editData, weight: parseFloat(e.target.value) || null })}
                          className="detail-input"
                        />
                        <select
                          value={editData.weight_unit || 'kg'}
                          onChange={(e) => setEditData({ ...editData, weight_unit: e.target.value })}
                          className="detail-select"
                        >
                          <option value="kg">kg</option>
                          <option value="lb">lb</option>
                        </select>
                      </div>
                    ) : (
                      <span className="detail-value">
                        {user.weight ? `${user.weight} ${user.weight_unit}` : 'Not set'}
                      </span>
                    )}
                  </div>
                  <div className="detail-item">
                    <label className="detail-label">Admin Status</label>
                    {isEditing ? (
                      <select
                        value={editData.is_admin ? 'true' : 'false'}
                        onChange={(e) => setEditData({ ...editData, is_admin: e.target.value === 'true' })}
                        className="detail-select"
                      >
                        <option value="false">Regular User</option>
                        <option value="true">Administrator</option>
                      </select>
                    ) : (
                      <span className="detail-value">
                        {user.is_admin ? (
                          <span className="admin-badge">
                            <Shield className="badge-icon" />
                            Administrator
                          </span>
                        ) : (
                          'Regular User'
                        )}
                      </span>
                    )}
                  </div>
                  <div className="detail-item">
                    <label className="detail-label">Joined</label>
                    <span className="detail-value">{formatDate(user.created_at)}</span>
                  </div>
                  <div className="detail-item">
                    <label className="detail-label">Last Updated</label>
                    <span className="detail-value">{formatDate(user.updated_at)}</span>
                  </div>
                </div>
              </section>

              {/* Data Summary */}
              <section className="user-detail-section">
                <h3 className="section-title">Data Summary</h3>
                <div className="data-summary-cards">
                  <div className="data-summary-card">
                    <Droplets className="data-card-icon" />
                    <div className="data-card-content">
                      <span className="data-card-count">{user.glucose_readings_count}</span>
                      <span className="data-card-label">Glucose Readings</span>
                    </div>
                  </div>
                  <div className="data-summary-card">
                    <Utensils className="data-card-icon" />
                    <div className="data-card-content">
                      <span className="data-card-count">{user.meals_count}</span>
                      <span className="data-card-label">Meals</span>
                    </div>
                  </div>
                  <div className="data-summary-card">
                    <Activity className="data-card-icon" />
                    <div className="data-card-content">
                      <span className="data-card-count">{user.activities_count}</span>
                      <span className="data-card-label">Activities</span>
                    </div>
                  </div>
                  <div className="data-summary-card">
                    <FileText className="data-card-icon" />
                    <div className="data-card-content">
                      <span className="data-card-count">{user.condition_logs_count}</span>
                      <span className="data-card-label">Condition Logs</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Recent Data Preview */}
              {userData && (
                <section className="user-detail-section">
                  <h3 className="section-title">Recent Data</h3>
                  <div className="recent-data-tabs">
                    <div className="data-tab">
                      <h4>Recent Glucose Readings</h4>
                      <div className="data-list">
                        {userData.glucose_readings?.slice(0, 5).map((reading: any) => (
                          <div key={reading.id} className="data-item">
                            <span className="data-value">{reading.value} {reading.unit}</span>
                            <span className="data-time">{new Date(reading.timestamp).toLocaleString()}</span>
                          </div>
                        ))}
                        {(!userData.glucose_readings || userData.glucose_readings.length === 0) && (
                          <p className="no-data">No glucose readings found</p>
                        )}
                      </div>
                    </div>
                    <div className="data-tab">
                      <h4>Recent Meals</h4>
                      <div className="data-list">
                        {userData.meals?.slice(0, 5).map((meal: any) => (
                          <div key={meal.id} className="data-item">
                            <span className="data-value">{meal.name} ({meal.meal_type})</span>
                            <span className="data-time">{new Date(meal.timestamp).toLocaleString()}</span>
                          </div>
                        ))}
                        {(!userData.meals || userData.meals.length === 0) && (
                          <p className="no-data">No meals found</p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        <footer className="admin-modal-actions">
          {isEditing ? (
            <>
              <button
                className="admin-modal-cancel"
                onClick={handleCancel}
                disabled={updateUserMutation.isPending}
              >
                <XCircle className="btn-icon" />
                Cancel
              </button>
              <button
                className="admin-modal-confirm"
                onClick={handleSave}
                disabled={updateUserMutation.isPending}
              >
                <Save className="btn-icon" />
                {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <button className="admin-modal-cancel" onClick={onClose}>
                Close
              </button>
              <button className="admin-modal-confirm" onClick={handleEdit}>
                <Edit3 className="btn-icon" />
                Edit User
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
};

export default UserDetailModal; 