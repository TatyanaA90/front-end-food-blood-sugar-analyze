import React, { useState, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc, Plus, Edit, Trash2, Activity, Calendar, Zap, Flame, Clock } from 'lucide-react';
import type { ActivityBasic } from '../../services/activityService';
import { activityUtils } from '../../services/activityService';
import './ActivityList.css';

interface ActivityListProps {
  activities: ActivityBasic[];
  onAddActivity: () => void;
  onEditActivity: (activity: ActivityBasic) => void;
  onDeleteActivity: (activity: ActivityBasic) => void;
  isLoading?: boolean;
}

type SortField = 'timestamp' | 'type' | 'duration_min' | 'calories_burned';
type SortDirection = 'asc' | 'desc';

const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedActivities = useMemo(() => {
    const filtered = activities.filter(activity => {
      const searchLower = searchTerm.toLowerCase();
      return (
        activity.type.toLowerCase().includes(searchLower) ||
        activity.note?.toLowerCase().includes(searchLower) ||
        activityUtils.getActivityType(activity).toLowerCase().includes(searchLower)
      );
    });

    filtered.sort((a, b) => {
      let aValue: string | number | undefined = a[sortField];
      let bValue: string | number | undefined = b[sortField];

      if (sortField === 'timestamp') {
        aValue = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        bValue = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue == null) aValue = sortDirection === 'asc' ? Infinity : -Infinity;
      if (bValue == null) bValue = sortDirection === 'asc' ? Infinity : -Infinity;

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [activities, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <SortAsc className="sort-icon" /> : <SortDesc className="sort-icon" />;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="activity-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading activities...</p>
      </div>
    );
  }

  return (
    <div className="activity-list-container">
      <div className="activity-list-header">
        <div className="header-content">
          <div className="header-title">
            <Activity className="header-icon" />
            <h2>Activities</h2>
            <span className="activity-count">({filteredAndSortedActivities.length})</span>
          </div>
          <button onClick={onAddActivity} className="add-activity-btn">
            <Plus className="btn-icon" />
            Add Activity
          </button>
        </div>
      </div>

      <div className="activity-list-controls">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search activities by type, notes, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
        >
          <Filter className="btn-icon" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Sort by:</label>
            <div className="sort-buttons">
              <button
                onClick={() => handleSort('timestamp')}
                className={`sort-btn ${sortField === 'timestamp' ? 'active' : ''}`}
              >
                Date & Time {getSortIcon('timestamp')}
              </button>
              <button
                onClick={() => handleSort('type')}
                className={`sort-btn ${sortField === 'type' ? 'active' : ''}`}
              >
                Activity Type {getSortIcon('type')}
              </button>
              <button
                onClick={() => handleSort('duration_min')}
                className={`sort-btn ${sortField === 'duration_min' ? 'active' : ''}`}
              >
                Duration {getSortIcon('duration_min')}
              </button>
              <button
                onClick={() => handleSort('calories_burned')}
                className={`sort-btn ${sortField === 'calories_burned' ? 'active' : ''}`}
              >
                Calories {getSortIcon('calories_burned')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="activities-list">
        {filteredAndSortedActivities.length === 0 ? (
          <div className="empty-state">
            <Activity className="empty-icon" />
            <h3>No activities found</h3>
            <p>
              {searchTerm 
                ? `No activities match "${searchTerm}". Try adjusting your search.`
                : "You haven't logged any activities yet. Add your first activity to get started!"
              }
            </p>
            {!searchTerm && (
              <button onClick={onAddActivity} className="add-first-activity-btn">
                <Plus className="btn-icon" />
                Add Your First Activity
              </button>
            )}
          </div>
        ) : (
          filteredAndSortedActivities.map((activity) => (
            <div key={activity.id} className="activity-card">
              <div className="activity-header">
                <div className="activity-info">
                  <div className="activity-title">
                    <h3>{activityUtils.getActivityType(activity)}</h3>
                    <span 
                      className="intensity-badge"
                      style={{ backgroundColor: activityUtils.getIntensityColor(activity.intensity) }}
                    >
                      {activityUtils.getIntensityLabel(activity.intensity)}
                    </span>
                  </div>
                  <div className="activity-time">
                    <Calendar className="time-icon" />
                    <span>{formatDate(activity.timestamp || '')}</span>
                    <span className="time-separator">•</span>
                    <span>{formatTime(activity.timestamp || '')}</span>
                  </div>
                </div>
                <div className="activity-actions">
                  <button
                    onClick={() => onEditActivity(activity)}
                    className="action-btn edit-btn"
                    title="Edit activity"
                  >
                    <Edit className="btn-icon" />
                  </button>
                  <button
                    onClick={() => onDeleteActivity(activity)}
                    className="action-btn delete-btn"
                    title="Delete activity"
                  >
                    <Trash2 className="btn-icon" />
                  </button>
                </div>
              </div>

              <div className="activity-content">
                <div className="activity-stats">
                  <div className="stat-item">
                    <Clock className="stat-icon" />
                    <span className="stat-label">Duration:</span>
                    <span className="stat-value">
                      {activityUtils.formatDuration(activity.duration_min)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <Flame className="stat-icon" />
                    <span className="stat-label">Calories:</span>
                    <span className="stat-value">
                      {activity.calories_burned ? `${activity.calories_burned} cal` : 'N/A'}
                    </span>
                  </div>
                  <div className="stat-item">
                    <Zap className="stat-icon" />
                    <span className="stat-label">Intensity:</span>
                    <span className="stat-value">
                      {activityUtils.getIntensityLabel(activity.intensity)}
                    </span>
                  </div>
                </div>

                {activity.note && (
                  <div className="activity-notes">
                                          <p>{activity.note}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityList;
