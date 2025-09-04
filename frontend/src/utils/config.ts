/**
 * Application Configuration
 * Centralized configuration management for environment variables
 */

export interface AppConfig {
  // API Configuration
  api: {
    baseUrl: string;
    version: string;
  };
  
  // Assets Configuration
  assets: {
    baseUrl: string;
    cdnUrl: string;
  };
  
  // Encryption Configuration
  encryption: {
    key: string;
    algorithm: string;
  };
  
  // Application Configuration
  app: {
    name: string;
    version: string;
    environment: string;
  };
  
  // Feature Flags
  features: {
    analytics: boolean;
    debugMode: boolean;
    devMode: boolean;
    mockApi: boolean;
  };
  
  // External Services
  services: {
    sentryDsn?: string;
    googleAnalyticsId?: string;
  };
}

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, fallback: string = ''): string {
  return process.env[key] || fallback;
}

/**
 * Get boolean environment variable
 */
function getBoolEnvVar(key: string, fallback: boolean = false): boolean {
  const value = process.env[key];
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
}

/**
 * Application configuration object
 */
export const config: AppConfig = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    version: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  },
  
  assets: {
    baseUrl: getEnvVar('NEXT_PUBLIC_ASSETS_URL', 'http://localhost:3002/assets'),
    cdnUrl: getEnvVar('NEXT_PUBLIC_CDN_URL', 'http://localhost:3002'),
  },
  
  encryption: {
    key: getEnvVar('NEXT_PUBLIC_ENCRYPTION_KEY', 'zoe-flock-admin-dev-key-2024'),
    algorithm: getEnvVar('NEXT_PUBLIC_ENCRYPTION_ALGORITHM', 'AES-256-GCM'),
  },
  
  app: {
    name: getEnvVar('NEXT_PUBLIC_APP_NAME', 'ZoeFlock Admin'),
    version: getEnvVar('NEXT_PUBLIC_APP_VERSION', '1.0.0'),
    environment: getEnvVar('NEXT_PUBLIC_APP_ENV', 'development'),
  },
  
  features: {
    analytics: getBoolEnvVar('NEXT_PUBLIC_ENABLE_ANALYTICS', false),
    debugMode: getBoolEnvVar('NEXT_PUBLIC_ENABLE_DEBUG_MODE', true),
    devMode: getBoolEnvVar('NEXT_PUBLIC_DEV_MODE', true),
    mockApi: getBoolEnvVar('NEXT_PUBLIC_MOCK_API', false),
  },
  
  services: {
    sentryDsn: getEnvVar('NEXT_PUBLIC_SENTRY_DSN', ''),
    googleAnalyticsId: getEnvVar('NEXT_PUBLIC_GOOGLE_ANALYTICS_ID', ''),
  },
};

// Debug logs to verify environment variable loading


/**
 * Helper function to get API URL with version
 */
export function getApiUrl(endpoint: string = ''): string {
  const baseUrl = config.api.baseUrl.replace(/\/$/, '');
  const version = config.api.version;
  const cleanEndpoint = endpoint.replace(/^\//, '');
  
  return `${baseUrl}/${version}/${cleanEndpoint}`.replace(/\/+$/, '');
}

/**
 * Helper function to get asset URL
 */
export function getAssetUrl(path: string): string {
  const baseUrl = config.assets.baseUrl.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  return `${baseUrl}/${cleanPath}`;
}

/**
 * Helper function to get CDN URL
 */
export function getCdnUrl(path: string): string {
  const cdnUrl = config.assets.cdnUrl.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  return `${cdnUrl}/${cleanPath}`;
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return config.app.environment === 'development' || config.features.devMode;
}

/**
 * Check if debug mode is enabled
 */
export function isDebugMode(): boolean {
  return config.features.debugMode || isDevelopment();
}

/**
 * Check if analytics is enabled
 */
export function isAnalyticsEnabled(): boolean {
  return config.features.analytics && Boolean(config.services.googleAnalyticsId);
}

export default config; 