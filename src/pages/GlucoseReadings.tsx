import React, { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Droplets,
    Clock,
    Utensils,
    FileText,
    ArrowUpDown,
    XCircle,
} from "lucide-react";
import {
    useGlucoseReadings,
    useCreateGlucoseReading,
    useUpdateGlucoseReading,
    useDeleteGlucoseReading,
    glucoseKeys,
} from "../hooks/useGlucoseReadings";
import { useQueryClient } from '@tanstack/react-query';
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
import { useUserData } from "../hooks/useUserManagement";
import { useAuth } from "../hooks/useAuth";
import GlucoseReadingForm from "../components/glucose/GlucoseReadingForm";
import NavigationHeader from "../components/layout/NavigationHeader";
import { uploadCsv } from "../services/api";
import "./GlucoseReadings.css";
import { ensureUtcIso } from "../utils/dateUtils";

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
    const [uploading, setUploading] = useState(false);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const queryClient = useQueryClient();

    // Glucose unit utilities
    const { convertReading, getReadingStatus } = useGlucoseUnitUtils();

    const location = useLocation();
    const urlUserParam = React.useMemo(() => {
        const params = new URLSearchParams(location.search);
        const val = params.get('user');
        return val ? Number(val) : undefined;
    }, [location.search]);

    const { user } = useAuth();
    const isAdmin = !!user?.is_admin;

    // React Query hooks
    const { data: readings = [], isLoading, error } = useGlucoseReadings({
        ...filters,
        search: searchTerm || undefined
    });

    // If an admin navigates with ?user=<id> and backend items lack user_id,
    // fall back to admin user-data endpoint to populate that user's readings.
    const { data: selectedUserData } = useUserData(isAdmin ? (urlUserParam || 0) : 0);
    const createMutation = useCreateGlucoseReading();
    const updateMutation = useUpdateGlucoseReading();
    const deleteMutation = useDeleteGlucoseReading();

    // Sort readings based on sortOrder
    const sortedReadings = React.useMemo(() => {
        if (!readings.length) return [];
        
        return [...readings].sort((a, b) => {
            const dateA = new Date(ensureUtcIso(a.reading_time)).getTime();
            const dateB = new Date(ensureUtcIso(b.reading_time)).getTime();
            
            if (sortOrder === 'newest') {
                return dateB - dateA; // Newest first
            } else {
                return dateA - dateB; // Oldest first
            }
        });
    }, [readings, sortOrder]);

    // If admin navigated with ?user=<id>, filter list client-side
    const filteredReadings = React.useMemo(() => {
        if (!(isAdmin && urlUserParam)) return sortedReadings;
        const withUserId = sortedReadings.filter(r => Object.prototype.hasOwnProperty.call(r, 'user_id')) as Array<GlucoseReading & { user_id?: number }>;
        if (withUserId.length > 0) {
            return withUserId.filter(r => r.user_id === urlUserParam);
        }
        // Fallback: build from admin user data if available
        if (selectedUserData?.glucose_readings && selectedUserData.glucose_readings.length > 0) {
            return selectedUserData.glucose_readings.map(gr => ({
                id: gr.id,
                user_id: urlUserParam!,
                reading: gr.value,
                unit: (gr.unit?.toLowerCase() === 'mmol/l' ? 'mmol/L' : 'mg/dL') as 'mg/dL' | 'mmol/L',
                reading_time: gr.timestamp, // Don't modify the timestamp - use it as-is
                meal_context: undefined,
                notes: (gr as { notes?: string }).notes || undefined,
                created_at: gr.timestamp, // Don't modify the timestamp - use it as-is
                updated_at: gr.timestamp, // Don't modify the timestamp - use it as-is
            }));
        }
        return [];
    }, [sortedReadings, urlUserParam, selectedUserData, isAdmin]);

    const handleSortToggle = () => {
        setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
    };

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

    const formatDate = (timestamp: string) => {
        // If timestamp already has Z or timezone offset, use it as-is
        // If not, assume it's UTC and add Z to prevent local time interpretation
        const utcTimestamp = timestamp.includes('Z') || timestamp.includes('+') || timestamp.includes('-') 
            ? timestamp 
            : timestamp + 'Z';
        return new Date(utcTimestamp).toLocaleDateString();
    };

    const formatTime = (timestamp: string) => {
        // If timestamp already has Z or timezone offset, use it as-is
        // If not, assume it's UTC and add Z to prevent local time interpretation
        const utcTimestamp = timestamp.includes('Z') || timestamp.includes('+') || timestamp.includes('-') 
            ? timestamp 
            : timestamp + 'Z';
        return new Date(utcTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                <NavigationHeader title="Glucose Readings" />
                <div className="error-container">
                    <XCircle className="error-icon" />
                    <h2>Error Loading Glucose Readings</h2>
                    <p>Failed to load glucose readings. Please try refreshing the page.</p>
                    <p className="error-details">{error.message}</p>
                </div>
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
            />

            {/* Add Reading / Import CSV */}
            <div className="glucose-readings-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                    onClick={() => setShowForm(true)}
                    className="glucose-readings-add-btn"
                    disabled={isLoading}
                >
                    <Plus size={16} />
                    Add Reading
                    </button>
                            <input
                    type="file"
                    accept=".csv,text/csv"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploading(true);
                        try {
                            const res = await uploadCsv(file);
                            alert(`Imported: ${res.imported}, Skipped: ${res.skipped}`);
                            // Refresh readings after import
                            queryClient.invalidateQueries({ queryKey: glucoseKeys.all });
                        } catch (err: unknown) {
                            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
                            alert(`Upload failed: ${errorMessage}`);
                        } finally {
                            setUploading(false);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                        }
                    }}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="glucose-readings-add-btn"
                    disabled={uploading}
                    title="Import CGM CSV"
                >
                    <FileText size={16} />
                    {uploading ? 'Importing...' : 'Import CSV'}
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
                    {/* Sort Button */}
                    <button
                        onClick={handleSortToggle}
                        className="glucose-readings-sort-btn"
                        title={`Sort by ${sortOrder === 'newest' ? 'newest' : 'oldest'} first`}
                    >
                        <ArrowUpDown size={16} />
                        {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                    </button>

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
                                                <span>{formatDate(reading.reading_time)}</span>
                                                <span className="time-separator">•</span>
                                                <span>{formatTime(reading.reading_time)}</span>
                                            </div>

                                            <div className="glucose-reading-detail">
                                                <Utensils size={14} />
                                                <span>
                                                    {getMealContextLabel(reading.meal_context || "other")}
                                                </span>
                    </div>

                                            {/* Show creator user_id for admins only */}
                                            {user?.is_admin && (
                                                <div className="glucose-reading-detail" title="Creator user_id">
                                                    <span>User ID: {reading.user_id ?? urlUserParam}</span>
                                                </div>
                                            )}

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
