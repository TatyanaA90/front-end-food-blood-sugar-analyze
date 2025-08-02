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
  apiBaseUrl: 'https://back-end-food-blood-sugar-analyzer.onrender.com',
  apiTimeout: 10000,
  
  // Application Configuration
  appName: 'Food & Blood Sugar Analyzer',
  appVersion: '1.0.0',
  
  // Authentication Configuration
  jwtStorageKey: 'blood_sugar_token',
  
  // Feature Flags
  enableAnalytics: true,
  debugMode: false,
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