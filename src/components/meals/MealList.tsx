import React, { useState, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc, Plus, Edit, Trash2, Utensils, Calendar, Calculator, ArrowUpDown } from 'lucide-react';
import type { MealBasic } from '../../services/mealService';
import { mealUtils, mealService } from '../../services/mealService';
import { useAuth } from '../../hooks/useAuth';
import './MealList.css';

interface MealListProps {
  meals: MealBasic[];
  onAddMeal: () => void;
  onEditMeal: (meal: MealBasic) => void;
  onDeleteMeal: (meal: MealBasic) => void;
  isLoading?: boolean;
}

type SortField = 'timestamp' | 'description' | 'total_carbs' | 'total_weight';
type SortDirection = 'asc' | 'desc';

const MealList: React.FC<MealListProps> = ({
  meals,
  onAddMeal,
  onEditMeal,
  onDeleteMeal,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort meals
  const filteredAndSortedMeals = useMemo(() => {
    const filtered = meals.filter(meal => {
      const searchLower = searchTerm.toLowerCase();
      return (
        meal.description?.toLowerCase().includes(searchLower) ||
        meal.note?.toLowerCase().includes(searchLower) ||
        mealUtils.getMealType(meal).toLowerCase().includes(searchLower)
      );
    });

    // Sort meals
    filtered.sort((a, b) => {
      let aValue: string | number | undefined = a[sortField];
      let bValue: string | number | undefined = b[sortField];

      // Handle timestamp sorting
      if (sortField === 'timestamp') {
        aValue = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        bValue = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      }

      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
      }
      if (typeof bValue === 'string') {
        bValue = bValue.toLowerCase();
      }

      // Handle null/undefined values
      if (aValue == null) aValue = sortDirection === 'asc' ? Infinity : -Infinity;
      if (bValue == null) bValue = sortDirection === 'asc' ? Infinity : -Infinity;

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [meals, searchTerm, sortField, sortDirection]);

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
      <div className="meal-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading meals...</p>
      </div>
    );
  }

  return (
    <div className="meal-list-container">
      {/* Admin-only placeholder (no UI change for users) */}
      {(() => { const { user } = useAuth(); return user?.is_admin ? null : null; })()}
      {/* Header */}
      <div className="meal-list-header">
        <div className="header-content">
          <div className="header-title">
            <Utensils className="header-icon" />
            <h2>Meals</h2>
            <span className="meal-count">({filteredAndSortedMeals.length})</span>
          </div>
          <button onClick={onAddMeal} className="add-meal-btn">
            <Plus className="btn-icon" />
            Add Meal
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="meal-list-controls">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search meals by description, notes, or meal type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Quick Sort Button */}
        <button
          onClick={() => handleSort('timestamp')}
          className="quick-sort-btn"
          title={`Sort by ${sortField === 'timestamp' ? (sortDirection === 'asc' ? 'oldest' : 'newest') : 'date'} first`}
        >
          <ArrowUpDown className="btn-icon" />
          {sortField === 'timestamp' 
            ? (sortDirection === 'asc' ? 'Oldest First' : 'Newest First')
            : 'Sort by Date'
          }
        </button>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
        >
          <Filter className="btn-icon" />
          Filters
        </button>
      </div>

      {/* Filters Panel */}
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
                onClick={() => handleSort('description')}
                className={`sort-btn ${sortField === 'description' ? 'active' : ''}`}
              >
                Description {getSortIcon('description')}
              </button>
              <button
                onClick={() => handleSort('total_carbs')}
                className={`sort-btn ${sortField === 'total_carbs' ? 'active' : ''}`}
              >
                Carbs {getSortIcon('total_carbs')}
              </button>
              <button
                onClick={() => handleSort('total_weight')}
                className={`sort-btn ${sortField === 'total_weight' ? 'active' : ''}`}
              >
                Weight {getSortIcon('total_weight')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meals List */}
      <div className="meals-list">
        {filteredAndSortedMeals.length === 0 ? (
          <div className="empty-state">
            <Utensils className="empty-icon" />
            <h3>No meals found</h3>
            <p>
              {searchTerm
                ? `No meals match "${searchTerm}". Try adjusting your search.`
                : "You haven't logged any meals yet. Add your first meal to get started!"
              }
            </p>
            {!searchTerm && (
              <button onClick={onAddMeal} className="add-first-meal-btn">
                <Plus className="btn-icon" />
                Add Your First Meal
              </button>
            )}
          </div>
        ) : (
          filteredAndSortedMeals.map((meal) => (
            <div key={meal.id} className="meal-card">
              <div className="meal-header">
                <div className="meal-info">
                  <div className="meal-title">
                    <h3>{meal.description || 'Untitled Meal'}</h3>
                    <span className="meal-type">{meal.meal_type || mealUtils.getMealType(meal)}</span>
                  </div>
                  <div className="meal-time">
                    <Calendar className="time-icon" />
                    <span>{formatDate(meal.timestamp || '')}</span>
                    <span className="time-separator">•</span>
                    <span>{formatTime(meal.timestamp || '')}</span>
                  </div>
                </div>
                <div className="meal-actions">
                  <button
                    onClick={() => onEditMeal(meal)}
                    className="action-btn edit-btn"
                    title="Edit meal"
                  >
                    <Edit className="btn-icon" />
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await mealService.createPredefinedFromMeal(meal.id);
                        alert('Saved as personal template');
                      } catch (e: unknown) {
                        const errorMessage = e instanceof Error ? e.message : 'Failed to save template';
                        alert(errorMessage);
                      }
                    }}
                    className="action-btn edit-btn"
                    title="Save as Template"
                  >
                    <Plus className="btn-icon" />
                  </button>
                  <button
                    onClick={() => onDeleteMeal(meal)}
                    className="action-btn delete-btn"
                    title="Delete meal"
                  >
                    <Trash2 className="btn-icon" />
                  </button>
                </div>
              </div>

              <div className="meal-content">
                <div className="nutrition-info">
                  <div className="nutrition-item">
                    <Calculator className="nutrition-icon" />
                    <span className="nutrition-label">Carbs:</span>
                    <span className="nutrition-value">
                      {meal.total_carbs ? `${meal.total_carbs.toFixed(1)}g` : 'N/A'}
                    </span>
                  </div>
                  <div className="nutrition-item">
                    <span className="nutrition-label">Weight:</span>
                    <span className="nutrition-value">
                      {meal.total_weight ? `${meal.total_weight.toFixed(1)}g` : 'N/A'}
                    </span>
                  </div>
                  {meal.glycemic_index && (
                    <div className="nutrition-item">
                      <span className="nutrition-label">GI:</span>
                      <span className="nutrition-value">{meal.glycemic_index.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Admin-only: show creator user_id when present or inferred via URL */}
                {(() => {
                  const { user } = useAuth();
                  if (!user?.is_admin) return null;
                  const userId = (meal as any).user_id as number | undefined;
                  const search = typeof window !== 'undefined' ? window.location.search : '';
                  const urlId = new URLSearchParams(search).get('user') || undefined;
                  const displayId = userId ?? (urlId ? Number(urlId) : undefined);
                  return displayId ? (
                    <div className="meal-note" style={{ marginTop: 8 }}>
                      <strong>User ID:</strong> {displayId}
                    </div>
                  ) : null;
                })()}

                {meal.note && (
                  <div className="meal-note">
                    <p>{meal.note}</p>
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

export default MealList;
