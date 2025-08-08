import React, { useState, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc, Plus, Edit, Trash2, Syringe, Calendar, Zap } from 'lucide-react';
import type { InsulinDoseBasic } from '../../services/insulinDoseService';
import { insulinDoseUtils } from '../../services/insulinDoseService';
import './InsulinDoseList.css';

interface InsulinDoseListProps {
  doses: InsulinDoseBasic[];
  onAddDose: () => void;
  onEditDose: (dose: InsulinDoseBasic) => void;
  onDeleteDose: (dose: InsulinDoseBasic) => void;
  isLoading?: boolean;
}

type SortField = 'timestamp' | 'units';
type SortDirection = 'asc' | 'desc';

const InsulinDoseList: React.FC<InsulinDoseListProps> = ({
  doses,
  onAddDose,
  onEditDose,
  onDeleteDose,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedDoses = useMemo(() => {
    const filtered = doses.filter(dose => {
      const searchLower = searchTerm.toLowerCase();
      return (
        dose.note?.toLowerCase().includes(searchLower) ||
        insulinDoseUtils.formatUnits(dose.units).toLowerCase().includes(searchLower)
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
  }, [doses, searchTerm, sortField, sortDirection]);

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
      <div className="insulin-dose-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading insulin doses...</p>
      </div>
    );
  }

  return (
    <div className="insulin-dose-list-container">
      <div className="insulin-dose-list-header">
        <div className="header-content">
          <div className="header-title">
            <Syringe className="header-icon" />
            <h2>Insulin Doses</h2>
          </div>
          <button onClick={onAddDose} className="add-dose-btn">
            <Plus className="btn-icon" />
            Add Dose
          </button>
        </div>
      </div>

      <div className="insulin-dose-list-controls">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search doses by units or notes..."
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
                onClick={() => handleSort('units')}
                className={`sort-btn ${sortField === 'units' ? 'active' : ''}`}
              >
                Units {getSortIcon('units')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="insulin-doses-list">
        {filteredAndSortedDoses.length === 0 ? (
          <div className="empty-state">
            <Syringe className="empty-icon" />
            <h3>No insulin doses found</h3>
            <p>
              {searchTerm 
                ? `No doses match "${searchTerm}". Try adjusting your search.`
                : "You haven't logged any insulin doses yet. Add your first dose to get started!"
              }
            </p>
            {!searchTerm && (
              <button onClick={onAddDose} className="add-first-dose-btn">
                <Plus className="btn-icon" />
                Add Your First Dose
              </button>
            )}
          </div>
        ) : (
          filteredAndSortedDoses.map((dose) => (
            <div key={dose.id} className="insulin-dose-card">
              <div className="dose-header">
                <div className="dose-info">
                  <div className="dose-title">
                    <h3>{insulinDoseUtils.formatUnits(dose.units)}</h3>
                    <span 
                      className="dose-level-badge"
                      style={{ backgroundColor: insulinDoseUtils.getDoseLevelColor(dose.units) }}
                    >
                      {insulinDoseUtils.getDoseLevelLabel(dose.units)}
                    </span>
                  </div>
                  <div className="dose-time">
                    <Calendar className="time-icon" />
                    <span>{formatDate(dose.timestamp || '')}</span>
                    <span className="time-separator">•</span>
                    <span>{formatTime(dose.timestamp || '')}</span>
                  </div>
                </div>
                <div className="dose-actions">
                  <button
                    onClick={() => onEditDose(dose)}
                    className="action-btn edit-btn"
                    title="Edit dose"
                  >
                    <Edit className="btn-icon" />
                  </button>
                  <button
                    onClick={() => onDeleteDose(dose)}
                    className="action-btn delete-btn"
                    title="Delete dose"
                  >
                    <Trash2 className="btn-icon" />
                  </button>
                </div>
              </div>

              <div className="dose-content">
                <div className="dose-stats">
                  <div className="stat-item">
                    <Syringe className="stat-icon" />
                    <span className="stat-label">Units:</span>
                    <span className="stat-value">
                      {insulinDoseUtils.formatUnits(dose.units)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <Zap className="stat-icon" />
                    <span className="stat-label">Level:</span>
                    <span className="stat-value">
                      {insulinDoseUtils.getDoseLevelLabel(dose.units)}
                    </span>
                  </div>
                </div>

                {dose.note && (
                  <div className="dose-notes">
                    <p>{dose.note}</p>
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

export default InsulinDoseList;
