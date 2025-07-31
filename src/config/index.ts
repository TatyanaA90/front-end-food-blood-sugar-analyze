// Frontend Configuration Management
// This file provides type-safe access to environment variables

interface Config {
  // API Configuration
  apiBaseUrl: string;
  apiTimeout: number;
  
  // Application Configuration
  appName: string;
  appVersion: string;
  appDescription: string;
  
  // Authentication Configuration
  jwtStorageKey: string;
  refreshTokenKey: string;
  
  // Feature Flags
  enableAnalytics: boolean;
  enableNotifications: boolean;
  enableOfflineMode: boolean;
  
  // Environment Configuration
  debugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableMockData: boolean;
  
  // Environment Detection
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
}

// Helper function to parse boolean environment variables
const parseBoolean = (value: string | undefined, defaultValue: boolean = false): boolean => {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

// Helper function to parse number environment variables
const parseNumber = (value: string | undefined, defaultValue: number = 0): number => {
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Helper function to validate log level
const parseLogLevel = (value: string | undefined): 'debug' | 'info' | 'warn' | 'error' => {
  const validLevels = ['debug', 'info', 'warn', 'error'] as const;
  if (value && validLevels.includes(value as 'debug' | 'info' | 'warn' | 'error')) {
    return value as 'debug' | 'info' | 'warn' | 'error';
  }
  return 'info';
};

// Configuration object with type-safe environment variable access
export const config: Config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  apiTimeout: parseNumber(import.meta.env.VITE_API_TIMEOUT, 10000),
  
  // Application Configuration
  appName: import.meta.env.VITE_APP_NAME || 'Blood Sugar Analyzer',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  appDescription: import.meta.env.VITE_APP_DESCRIPTION || 'Modern blood sugar tracking and analytics application',
  
  // Authentication Configuration
  jwtStorageKey: import.meta.env.VITE_JWT_STORAGE_KEY || 'blood_sugar_token',
  refreshTokenKey: import.meta.env.VITE_REFRESH_TOKEN_KEY || 'blood_sugar_refresh_token',
  
  // Feature Flags
  enableAnalytics: parseBoolean(import.meta.env.VITE_ENABLE_ANALYTICS, true),
  enableNotifications: parseBoolean(import.meta.env.VITE_ENABLE_NOTIFICATIONS, true),
  enableOfflineMode: parseBoolean(import.meta.env.VITE_ENABLE_OFFLINE_MODE, false),
  
  // Environment Configuration
  debugMode: parseBoolean(import.meta.env.VITE_DEBUG_MODE, import.meta.env.DEV),
  logLevel: parseLogLevel(import.meta.env.VITE_LOG_LEVEL),
  enableMockData: parseBoolean(import.meta.env.VITE_ENABLE_MOCK_DATA, false),
  
  // Environment Detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isTest: import.meta.env.MODE === 'test',
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

// Logger utility that respects the configured log level
export const logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (config.debugMode && config.logLevel === 'debug') {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: unknown[]) => {
    if (['debug', 'info'].includes(config.logLevel)) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: unknown[]) => {
    if (['debug', 'info', 'warn'].includes(config.logLevel)) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  error: (message: string, ...args: unknown[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
};

// Configuration validation on import
if (config.isDevelopment) {
  validateConfig();
  logger.info('Configuration loaded successfully', config);
}

export default config; 