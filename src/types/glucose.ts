// Glucose Reading Types
export interface GlucoseReading {
    id: number;
    user_id: number;
    reading: number;
    unit: 'mg/dL' | 'mmol/L';
    reading_time: string;
    meal_context?: 'before_breakfast' | 'after_breakfast' | 'before_lunch' | 'after_lunch' | 'before_dinner' | 'after_dinner' | 'bedtime' | 'other';
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateGlucoseReadingRequest {
    reading: number;
    unit: 'mg/dL' | 'mmol/L';
    reading_time: string;
    meal_context?: 'before_breakfast' | 'after_breakfast' | 'before_lunch' | 'after_lunch' | 'before_dinner' | 'after_dinner' | 'bedtime' | 'other';
    notes?: string;
}

export interface UpdateGlucoseReadingRequest {
    reading?: number;
    unit?: 'mg/dL' | 'mmol/L';
    reading_time?: string;
    meal_context?: 'before_breakfast' | 'after_breakfast' | 'before_lunch' | 'after_lunch' | 'before_dinner' | 'after_dinner' | 'bedtime' | 'other';
    notes?: string;
}

export interface GlucoseReadingFilters {
    start_date?: string;
    end_date?: string;
    meal_context?: string;
    unit?: 'mg/dL' | 'mmol/L';
    search?: string;
}

// Meal Context Options
export const MEAL_CONTEXT_OPTIONS = [
    { value: 'before_breakfast', label: 'Before Breakfast' },
    { value: 'after_breakfast', label: 'After Breakfast' },
    { value: 'before_lunch', label: 'Before Lunch' },
    { value: 'after_lunch', label: 'After Lunch' },
    { value: 'before_dinner', label: 'Before Dinner' },
    { value: 'after_dinner', label: 'After Dinner' },
    { value: 'bedtime', label: 'Bedtime' },
    { value: 'other', label: 'Other' }
] as const;

// Unit Conversion Functions
export const convertMgDlToMmolL = (mgDl: number): number => {
    return Math.round((mgDl / 18) * 10) / 10;
};

export const convertMmolLToMgDl = (mmolL: number): number => {
    return Math.round(mmolL * 18);
}; 