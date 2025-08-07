import api from './api';
import type {
    GlucoseReading,
    CreateGlucoseReadingRequest,
    UpdateGlucoseReadingRequest,
    GlucoseReadingFilters
} from '../types/glucose';

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
    note?: string;
}

interface BackendUpdateRequest {
    value?: number;
    unit?: string;
    timestamp?: string;
    note?: string;
}

export const glucoseService = {
    // Get all glucose readings for the current user
    getGlucoseReadings: async (filters?: GlucoseReadingFilters): Promise<GlucoseReading[]> => {
        const params = new URLSearchParams();
        if (filters?.start_date) params.append('start_date', filters.start_date);
        if (filters?.end_date) params.append('end_date', filters.end_date);
        if (filters?.meal_context) params.append('meal_context', filters.meal_context);
        if (filters?.unit) params.append('unit', filters.unit);
        if (filters?.search) params.append('search', filters.search);

        const response = await api.get<BackendGlucoseReading[]>(`/glucose-readings?${params.toString()}`);
        // Map backend fields to frontend fields
        const mappedReadings = response.data.map(item => ({
            id: item.id,
            user_id: item.user_id,
            reading: item.value,
            unit: item.unit as 'mg/dL' | 'mmol/L',
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
            unit: response.data.unit as 'mg/dL' | 'mmol/L',
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
            unit: data.unit,
            timestamp: data.reading_time,
            note: data.notes
        };
        const response = await api.post<BackendGlucoseReading>('/glucose-readings', backendData);
        // Map backend fields to frontend fields
        return {
            id: response.data.id,
            user_id: response.data.user_id,
            reading: response.data.value,
            unit: response.data.unit as 'mg/dL' | 'mmol/L',
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
        if (data.unit !== undefined) backendData.unit = data.unit;
        if (data.reading_time !== undefined) backendData.timestamp = data.reading_time;
        if (data.notes !== undefined) backendData.note = data.notes;
        
        const response = await api.put<BackendGlucoseReading>(`/glucose-readings/${id}`, backendData);
        // Map backend fields to frontend fields
        return {
            id: response.data.id,
            user_id: response.data.user_id,
            reading: response.data.value,
            unit: response.data.unit as 'mg/dL' | 'mmol/L',
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
        average: number;
        min: number;
        max: number;
        count: number;
        in_range_percentage: number;
    }> => {
        const params = new URLSearchParams();
        if (filters?.start_date) params.append('start_date', filters.start_date);
        if (filters?.end_date) params.append('end_date', filters.end_date);
        if (filters?.meal_context) params.append('meal_context', filters.meal_context);
        if (filters?.unit) params.append('unit', filters.unit);

        const response = await api.get(`/glucose-readings/stats?${params.toString()}`);
        return response.data;
    }
}; 