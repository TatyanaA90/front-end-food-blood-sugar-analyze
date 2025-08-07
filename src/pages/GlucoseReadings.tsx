import React, { useState } from "react";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Droplets,
    Clock,
    Utensils,
    FileText,
} from "lucide-react";
import {
    useGlucoseReadings,
    useCreateGlucoseReading,
    useUpdateGlucoseReading,
    useDeleteGlucoseReading,
} from "../hooks/useGlucoseReadings";
import type {
    GlucoseReading,
    GlucoseReadingFilters,
    CreateGlucoseReadingRequest,
    UpdateGlucoseReadingRequest,
} from "../types/glucose";
import {
    MEAL_CONTEXT_OPTIONS,
} from "../types/glucose";
import { useGlucoseUnitUtils } from "../hooks/useGlucoseUnit";
import GlucoseReadingForm from "../components/glucose/GlucoseReadingForm";
import NavigationHeader from "../components/layout/NavigationHeader";
import "./GlucoseReadings.css";

const GlucoseReadings: React.FC = () => {
    const [filters, setFilters] = useState<GlucoseReadingFilters>({});
    const [showForm, setShowForm] = useState(false);
    const [editingReading, setEditingReading] = useState<GlucoseReading | null>(
        null
    );
    const [deletingReading, setDeletingReading] = useState<GlucoseReading | null>(
        null
    );
    const [searchTerm, setSearchTerm] = useState("");

    // Glucose unit utilities
    const { convertReading, getReadingStatus } = useGlucoseUnitUtils();

    // React Query hooks
    const { data: readings = [], isLoading, error } = useGlucoseReadings({
        ...filters,
        search: searchTerm || undefined
    });
    const createMutation = useCreateGlucoseReading();
    const updateMutation = useUpdateGlucoseReading();
    const deleteMutation = useDeleteGlucoseReading();

    // Use readings directly since filtering is handled by the service
    const filteredReadings = readings;

    const handleCreateReading = (data: CreateGlucoseReadingRequest) => {
        createMutation.mutate(data, {
            onSuccess: () => {
                setShowForm(false);
            },
        });
    };

    const handleUpdateReading = (data: UpdateGlucoseReadingRequest) => {
        if (editingReading) {
            updateMutation.mutate(
                { id: editingReading.id, data },
                {
                    onSuccess: () => {
                        setEditingReading(null);
                    },
                }
            );
        }
    };

    const handleDeleteReading = (reading: GlucoseReading) => {
        deleteMutation.mutate(reading.id, {
            onSuccess: () => {
                setDeletingReading(null);
            },
        });
    };

    const handleEditReading = (reading: GlucoseReading) => {
        setEditingReading(reading);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingReading(null);
    };

    const formatReadingTime = (timeString: string) => {
        return new Date(timeString).toLocaleString();
    };

    const getMealContextLabel = (context: string) => {
        return (
            MEAL_CONTEXT_OPTIONS.find((option) => option.value === context)?.label ||
            context
        );
    };

    if (error) {
        return (
            <div className="glucose-readings-error">
                <p>Error loading glucose readings. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="glucose-readings-container">
            {/* Navigation Header */}
            <NavigationHeader 
                title="Glucose Readings" 
                icon={<Droplets size={24} />}
                showBack={true}
                showDashboard={true}
            />
            
            {/* Add Reading Button */}
            <div className="glucose-readings-actions">
                <button
                    onClick={() => setShowForm(true)}
                    className="glucose-readings-add-btn"
                    disabled={isLoading}
                >
                    <Plus size={16} />
                    Add Reading
                </button>
            </div>

            {/* Filters and Search */}
            <div className="glucose-readings-filters">
                <div className="glucose-readings-search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search readings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="glucose-readings-search-input"
                    />
                </div>

                <div className="glucose-readings-filter-controls">
                    <select
                        value={filters.meal_context || ""}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                meal_context: e.target.value || undefined,
                            }))
                        }
                        className="glucose-readings-filter-select"
                    >
                        <option value="">All Meal Contexts</option>
                        {MEAL_CONTEXT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.unit || ""}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                unit: (e.target.value as "mg/dL" | "mmol/L") || undefined,
                            }))
                        }
                        className="glucose-readings-filter-select"
                    >
                        <option value="">All Units</option>
                        <option value="mg/dL">mg/dL</option>
                        <option value="mmol/L">mmol/L</option>
                    </select>

                    <input
                        type="date"
                        value={filters.start_date || ""}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                start_date: e.target.value || undefined,
                            }))
                        }
                        className="glucose-readings-date-input"
                        placeholder="Start Date"
                    />

                    <input
                        type="date"
                        value={filters.end_date || ""}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                end_date: e.target.value || undefined,
                            }))
                        }
                        className="glucose-readings-date-input"
                        placeholder="End Date"
                    />
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="glucose-readings-loading">
                    <div className="glucose-readings-loading-spinner"></div>
                    <p>Loading glucose readings...</p>
                </div>
            )}

            {/* Readings List */}
            {!isLoading && (
                <div className="glucose-readings-content">
                    {filteredReadings.length === 0 ? (
                        <div className="glucose-readings-empty">
                            <Droplets size={48} />
                            <h3>No glucose readings found</h3>
                            <p>
                                Start tracking your blood sugar by adding your first reading.
                            </p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="glucose-readings-empty-btn"
                            >
                                <Plus size={16} />
                                Add First Reading
                            </button>
                        </div>
                    ) : (
                        <div className="glucose-readings-list">
                            {filteredReadings.map((reading) => {
                                const convertedReading = convertReading(reading);
                                const status = getReadingStatus(reading);
                                return (
                                    <div key={reading.id} className="glucose-reading-card">
                                        <div className="glucose-reading-header">
                                            <div className="glucose-reading-value-section">
                                                <div className="glucose-reading-value">
                                                    <span className="glucose-reading-number">
                                                        {convertedReading.formattedValue}
                                                    </span>
                                                    <span className="glucose-reading-unit">
                                                        {convertedReading.displayUnit}
                                                        {convertedReading.converted && (
                                                            <span className="glucose-reading-converted-indicator" title={`Originally ${reading.reading} ${reading.unit}`}>
                                                                *
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                                <div
                                                    className="glucose-reading-status"
                                                    style={{ backgroundColor: status.color }}
                                                >
                                                    {status.label}
                                                </div>
                                            </div>

                                            <div className="glucose-reading-actions">
                                                <button
                                                    onClick={() => handleEditReading(reading)}
                                                    className="glucose-reading-action-btn"
                                                    title="Edit reading"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingReading(reading)}
                                                    className="glucose-reading-action-btn glucose-reading-action-btn-danger"
                                                    title="Delete reading"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="glucose-reading-details">
                                            <div className="glucose-reading-detail">
                                                <Clock size={14} />
                                                <span>{formatReadingTime(reading.reading_time)}</span>
                                            </div>

                                            <div className="glucose-reading-detail">
                                                <Utensils size={14} />
                                                <span>
                                                    {getMealContextLabel(reading.meal_context || "other")}
                                                </span>
                                            </div>

                                            {reading.notes && (
                                                <div className="glucose-reading-detail">
                                                    <FileText size={14} />
                                                    <span className="glucose-reading-notes">
                                                        {reading.notes}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Add/Edit Form Modal */}
            {(showForm || editingReading) && (
                <GlucoseReadingForm
                    reading={editingReading || undefined}
                    onSubmit={editingReading ? handleUpdateReading : handleCreateReading}
                    onCancel={handleCancelForm}
                    isLoading={createMutation.isPending || updateMutation.isPending}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deletingReading && (
                <div className="glucose-delete-overlay">
                    <div className="glucose-delete-modal">
                        <h3>Delete Glucose Reading</h3>
                        <p>
                            Are you sure you want to delete the reading of{" "}
                            <strong>
                                {deletingReading.reading} {deletingReading.unit}
                            </strong>
                            ?
                        </p>
                        <p>This action cannot be undone.</p>

                        <div className="glucose-delete-actions">
                            <button
                                onClick={() => setDeletingReading(null)}
                                className="glucose-delete-btn glucose-delete-btn-cancel"
                                disabled={deleteMutation.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteReading(deletingReading)}
                                className="glucose-delete-btn glucose-delete-btn-confirm"
                                disabled={deleteMutation.isPending}
                            >
                                {deleteMutation.isPending ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GlucoseReadings;
