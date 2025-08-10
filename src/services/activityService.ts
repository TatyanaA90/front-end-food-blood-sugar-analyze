import api from './api';

export interface Activity {
  id: number;
  type: string;
  duration_min: number; // in minutes
  calories_burned?: number;
  intensity?: 'low' | 'medium' | 'high';
  note?: string;
  timestamp?: string;
  user_id: number;
}

export interface ActivityCreate {
  type: string;
  duration_min: number;
  calories_burned?: number;
  intensity?: 'low' | 'medium' | 'high';
  note?: string;
  timestamp?: string;
}

export interface ActivityUpdate {
  type?: string;
  duration_min?: number;
  calories_burned?: number;
  intensity?: 'low' | 'medium' | 'high';
  note?: string;
  timestamp?: string;
}

export interface ActivityBasic {
  id: number;
  type: string;
  duration_min: number;
  calories_burned?: number;
  intensity?: 'low' | 'medium' | 'high';
  note?: string;
  timestamp?: string;
}

export const activityService = {
  getActivities: async (): Promise<ActivityBasic[]> => {
    const response = await api.get<ActivityBasic[]>('/activities');
    return response.data;
  },

  getActivity: async (activityId: number): Promise<Activity> => {
    const response = await api.get<Activity>(`/activities/${activityId}`);
    return response.data;
  },

  createActivity: async (activityData: ActivityCreate): Promise<Activity> => {
    const response = await api.post<Activity>('/activities', activityData);
    return response.data;
  },

  updateActivity: async (activityId: number, activityData: ActivityUpdate): Promise<Activity> => {
    const response = await api.put<Activity>(`/activities/${activityId}`, activityData);
    return response.data;
  },

  deleteActivity: async (activityId: number): Promise<void> => {
    await api.delete(`/activities/${activityId}`);
  },
};

export const activityUtils = {
  calculateCaloriesBurned: (activityType: string, duration: number, intensity: 'low' | 'medium' | 'high' = 'medium'): number => {
    // Basic calorie calculation based on activity type and intensity
    const baseCaloriesPerMinute: Record<string, number> = {
      'walking': 4,
      'running': 10,
      'cycling': 8,
      'swimming': 9,
      'weightlifting': 6,
      'yoga': 3,
      'dancing': 7,
      'basketball': 8,
      'tennis': 7,
      'soccer': 9,
      'hiking': 6,
      'gym': 6,
      'other': 5,
    };

    const intensityMultiplier: Record<string, number> = {
      'low': 0.7,
      'medium': 1.0,
      'high': 1.3,
    };

    const baseCalories = baseCaloriesPerMinute[activityType.toLowerCase()] || baseCaloriesPerMinute.other;
    const multiplier = intensityMultiplier[intensity];

    return Math.round(baseCalories * duration * multiplier);
  },

  formatDuration: (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  },

  formatTimestamp: (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  },

  getActivityType: (activity: ActivityBasic): string => {
    if (!activity.type) return 'Unknown';
    return activity.type.charAt(0).toUpperCase() + activity.type.slice(1);
  },

  getIntensityColor: (intensity?: string): string => {
    switch (intensity) {
      case 'low': return '#10b981'; // green
      case 'medium': return '#f59e0b'; // amber
      case 'high': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  },

  getIntensityLabel: (intensity?: string): string => {
    switch (intensity) {
      case 'low':
      case 'light':
        return 'Low';
      case 'medium':
      case 'moderate':
        return 'Medium';
      case 'high':
      case 'vigorous':
        return 'High';
      default: return 'Not specified';
    }
  },
};
