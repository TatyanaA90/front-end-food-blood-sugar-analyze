// Frontend Configuration Management
// This file provides type-safe access to environment variables

interface Config {
  // API Configuration
  apiBaseUrl: string;
  apiTimeout: number;
  
  // Application Configuration
  appName: string;
  appVersion: string;
  
  // Authentication Configuration
  jwtStorageKey: string;
  
  // Feature Flags
  enableAnalytics: boolean;
  debugMode: boolean;
}

// Configuration object with type-safe environment variable access
export const config: Config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://back-end-food-blood-sugar-analyzer.onrender.com',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  
  // Application Configuration
  appName: import.meta.env.VITE_APP_NAME || 'Food & Blood Sugar Analyzer',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Authentication Configuration
  jwtStorageKey: import.meta.env.VITE_JWT_STORAGE_KEY || 'blood_sugar_token',
  
  // Feature Flags
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
  debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
};

// Validation function to ensure all required configuration is present
export const validateConfig = (): void => {
  const requiredFields: (keyof Config)[] = [
    'apiBaseUrl',
    'appName',
    'jwtStorageKey',
  ];

  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required configuration fields: ${missingFields.join(', ')}`);
  }
}; 