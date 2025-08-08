import api from './api';

export interface InsulinDose {
  id: number;
  units: number;
  timestamp?: string;
  note?: string;
  user_id: number;
}

export interface InsulinDoseCreate {
  units: number;
  timestamp?: string;
  note?: string;
}

export interface InsulinDoseUpdate {
  units?: number;
  timestamp?: string;
  note?: string;
}

export interface InsulinDoseBasic {
  id: number;
  units: number;
  timestamp?: string;
  note?: string;
}

export const insulinDoseService = {
  getInsulinDoses: async (): Promise<InsulinDoseBasic[]> => {
    const response = await api.get<InsulinDoseBasic[]>('/insulin-doses');
    return response.data;
  },

  getInsulinDose: async (doseId: number): Promise<InsulinDose> => {
    const response = await api.get<InsulinDose>(`/insulin-doses/${doseId}`);
    return response.data;
  },

  createInsulinDose: async (doseData: InsulinDoseCreate): Promise<InsulinDose> => {
    const response = await api.post<InsulinDose>('/insulin-doses', doseData);
    return response.data;
  },

  updateInsulinDose: async (doseId: number, doseData: InsulinDoseUpdate): Promise<InsulinDose> => {
    const response = await api.put<InsulinDose>(`/insulin-doses/${doseId}`, doseData);
    return response.data;
  },

  deleteInsulinDose: async (doseId: number): Promise<void> => {
    await api.delete(`/insulin-doses/${doseId}`);
  },
};

export const insulinDoseUtils = {
  formatUnits: (units: number): string => {
    return `${units} units`;
  },

  formatTimestamp: (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  },

  formatDate: (timestamp: string): string => {
    return new Date(timestamp).toLocaleDateString();
  },

  formatTime: (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  },

  getDoseLevel: (units: number): 'low' | 'medium' | 'high' => {
    if (units < 5) return 'low';
    if (units < 15) return 'medium';
    return 'high';
  },

  getDoseLevelColor: (units: number): string => {
    const level = insulinDoseUtils.getDoseLevel(units);
    switch (level) {
      case 'low': return '#10b981'; // green
      case 'medium': return '#f59e0b'; // amber
      case 'high': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  },

  getDoseLevelLabel: (units: number): string => {
    const level = insulinDoseUtils.getDoseLevel(units);
    switch (level) {
      case 'low': return 'Low';
      case 'medium': return 'Medium';
      case 'high': return 'High';
      default: return 'Not specified';
    }
  },
};
