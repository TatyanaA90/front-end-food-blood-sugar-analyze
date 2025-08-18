import api from './api';
import type {
    GlucoseReading,
    CreateGlucoseReadingRequest,
    UpdateGlucoseReadingRequest,
    GlucoseReadingFilters
} from '../types/glucose';
import { localDateTimeToUtcIso } from '../utils/dateUtils';
// Note: timestamps returned by backend should already be ISO with timezone

// Backend response interface
interface BackendGlucoseReading {
    id: number;
    user_id: number;
    value: number;
    unit: string;
    timestamp: string;
    meal_context?: string;
    note?: string;
    created_at: string;
    updated_at: string;
}

interface BackendCreateRequest {
    value: number;
    unit: string;
    timestamp?: string;
    meal_context?: string;
    note?: string;
}

interface BackendUpdateRequest {
    value?: number;
    unit?: string;
    timestamp?: string;
    meal_context?: string;
    note?: string;
}

export const glucoseService = {
    // Get all glucose readings for the current user
    getGlucoseReadings: async (filters?: GlucoseReadingFilters): Promise<GlucoseReading[]> => {
        const params = new URLSearchParams();
        if (filters?.start_datetime) params.append('start_datetime', filters.start_datetime);
        if (filters?.end_datetime) params.append('end_datetime', filters.end_datetime);
        else {
            if (filters?.start_date) params.append('start_date', filters.start_date);
            if (filters?.end_date) params.append('end_date', filters.end_date);
        }
        if (filters?.meal_context) params.append('meal_context', filters.meal_context);
        if (filters?.unit) params.append('unit', filters.unit);
        if (filters?.search) params.append('search', filters.search);

        const response = await api.get<BackendGlucoseReading[]>(`/glucose-readings?${params.toString()}`);
        // Map backend fields to frontend fields
        const mappedReadings = response.data.map(item => ({
            id: item.id,
            user_id: item.user_id,
            reading: item.value,
            unit: (item.unit?.toLowerCase() === 'mmol/l' ? 'mmol/L' : 'mg/dL') as 'mg/dL' | 'mmol/L',
            reading_time: item.timestamp,
            meal_context: item.meal_context as GlucoseReading['meal_context'],
            notes: item.note,
            created_at: item.created_at,
            updated_at: item.updated_at
        }));

        // Apply frontend search filter if no backend search was provided
        if (filters?.search && !params.has('search')) {
            const searchLower = filters.search.toLowerCase();
            return mappedReadings.filter(reading =>
                reading.reading.toString().includes(searchLower) ||
                reading.unit.toLowerCase().includes(searchLower) ||
                reading.meal_context?.toLowerCase().includes(searchLower) ||
                reading.notes?.toLowerCase().includes(searchLower)
            );
        }

        return mappedReadings;
    },

    // Get a single glucose reading by ID
    getGlucoseReading: async (id: number): Promise<GlucoseReading> => {
        const response = await api.get<BackendGlucoseReading>(`/glucose-readings/${id}`);
        // Map backend fields to frontend fields
        return {
            id: response.data.id,
            user_id: response.data.user_id,
            reading: response.data.value,
            unit: (response.data.unit?.toLowerCase() === 'mmol/l' ? 'mmol/L' : 'mg/dL') as 'mg/dL' | 'mmol/L',
            reading_time: response.data.timestamp,
            meal_context: response.data.meal_context as GlucoseReading['meal_context'],
            notes: response.data.note,
            created_at: response.data.created_at,
            updated_at: response.data.updated_at
        };
    },

    // Create a new glucose reading
    createGlucoseReading: async (data: CreateGlucoseReadingRequest): Promise<GlucoseReading> => {
        // Map frontend fields to backend fields
        const backendData: BackendCreateRequest = {
            value: data.reading,
            unit: data.unit === 'mmol/L' ? 'mmol/l' : 'mg/dl',
            timestamp: data.reading_time ? localDateTimeToUtcIso(data.reading_time) : undefined,
            meal_context: data.meal_context,
            note: data.notes
        };
        const response = await api.post<BackendGlucoseReading>('/glucose-readings', backendData);
        // Map backend fields to frontend fields
        return {
            id: response.data.id,
            user_id: response.data.user_id,
            reading: response.data.value,
            unit: (response.data.unit?.toLowerCase() === 'mmol/l' ? 'mmol/L' : 'mg/dL') as 'mg/dL' | 'mmol/L',
            reading_time: response.data.timestamp,
            meal_context: response.data.meal_context as GlucoseReading['meal_context'],
            notes: response.data.note,
            created_at: response.data.created_at,
            updated_at: response.data.updated_at
        };
    },

    // Update an existing glucose reading
    updateGlucoseReading: async (id: number, data: UpdateGlucoseReadingRequest): Promise<GlucoseReading> => {
        // Map frontend fields to backend fields
        const backendData: BackendUpdateRequest = {};
        if (data.reading !== undefined) backendData.value = data.reading;
        if (data.unit !== undefined) backendData.unit = data.unit === 'mmol/L' ? 'mmol/l' : 'mg/dl';
        if (data.reading_time !== undefined) backendData.timestamp = data.reading_time ? localDateTimeToUtcIso(data.reading_time) : undefined;
        if (data.meal_context !== undefined) backendData.meal_context = data.meal_context;
        if (data.notes !== undefined) backendData.note = data.notes;

        const response = await api.put<BackendGlucoseReading>(`/glucose-readings/${id}`, backendData);
        // Map backend fields to frontend fields
        return {
            id: response.data.id,
            user_id: response.data.user_id,
            reading: response.data.value,
            unit: (response.data.unit?.toLowerCase() === 'mmol/l' ? 'mmol/L' : 'mg/dL') as 'mg/dL' | 'mmol/L',
            reading_time: response.data.timestamp,
            meal_context: response.data.meal_context as GlucoseReading['meal_context'],
            notes: response.data.note,
            created_at: response.data.created_at,
            updated_at: response.data.updated_at
        };
    },

    // Delete a glucose reading
    deleteGlucoseReading: async (id: number): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`/glucose-readings/${id}`);
        return response.data;
    },

    // Get glucose reading statistics
    getGlucoseStats: async (filters?: GlucoseReadingFilters): Promise<{
        average: number | null;
        min: number | null;
        max: number | null;
        std_dev?: number | null;
        num_readings: number;
        in_target_percent?: number | null;
    }> => {
        const params = new URLSearchParams();
        if (filters?.start_date) params.append('start_date', filters.start_date);
        if (filters?.end_date) params.append('end_date', filters.end_date);

        // Align with backend analytics endpoint
        const response = await api.get(`/analytics/glucose-summary?${params.toString()}`);
        // Backend returns either whole-range summary or grouped summary
        if ('summary' in response.data) {
            const items = response.data.summary as Array<{
                num_readings: number;
                average: number;
                min: number;
                max: number;
            }>;
            const totals = items.reduce((acc, it) => {
                acc.num += it.num_readings || 0;
                acc.sum += (it.average || 0) * (it.num_readings || 0);
                acc.min = Math.min(acc.min, it.min ?? acc.min);
                acc.max = Math.max(acc.max, it.max ?? acc.max);
                return acc;
            }, { num: 0, sum: 0, min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY });
            return {
                average: totals.num ? totals.sum / totals.num : null,
                min: totals.num ? totals.min : null,
                max: totals.num ? totals.max : null,
                num_readings: totals.num || 0,
            };
        }
        return {
            average: response.data.average ?? null,
            min: response.data.min ?? null,
            max: response.data.max ?? null,
            std_dev: response.data.std_dev ?? null,
            num_readings: response.data.num_readings ?? 0,
            in_target_percent: response.data.in_target_percent ?? null,
        };
    }
};