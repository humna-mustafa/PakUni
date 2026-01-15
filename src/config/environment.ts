/**
 * Environment Configuration
 * Manages app configuration with environment variables support
 */

import Config from 'react-native-config';

// ============================================================================
// TYPES
// ============================================================================

interface AppConfig {
  // API
  apiUrl: string;
  apiTimeout: number;
  
  // App Info
  appName: string;
  appVersion: string;
  buildNumber: string;
  
  // Feature Flags
  enableAnalytics: boolean;
  enableCrashReporting: boolean;
  enableDebugMode: boolean;
  enableOfflineMode: boolean;
  enablePremiumFeatures: boolean;
  
  // Cache
  cacheMaxAge: number; // in milliseconds
  cacheMaxSize: number; // in bytes
  
  // Performance
  enablePerformanceMonitoring: boolean;
  animationsEnabled: boolean;
  
  // Development
  isDevelopment: boolean;
  isProduction: boolean;
  isStaging: boolean;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULTS: AppConfig = {
  apiUrl: 'https://api.pakuni.app',
  apiTimeout: 30000,
  
  appName: 'PakUni',
  appVersion: '1.0.0',
  buildNumber: '1',
  
  enableAnalytics: !__DEV__,
  enableCrashReporting: !__DEV__,
  enableDebugMode: __DEV__,
  enableOfflineMode: true,
  enablePremiumFeatures: false,
  
  cacheMaxAge: 24 * 60 * 60 * 1000, // 24 hours
  cacheMaxSize: 50 * 1024 * 1024, // 50MB
  
  enablePerformanceMonitoring: !__DEV__,
  animationsEnabled: true,
  
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
  isStaging: false,
};

// ============================================================================
// CONFIG CLASS
// ============================================================================

class ConfigManager {
  private config: AppConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfig(): AppConfig {
    return {
      // API
      apiUrl: Config.API_URL || DEFAULTS.apiUrl,
      apiTimeout: parseInt(Config.API_TIMEOUT || '', 10) || DEFAULTS.apiTimeout,
      
      // App Info
      appName: Config.APP_NAME || DEFAULTS.appName,
      appVersion: Config.APP_VERSION || DEFAULTS.appVersion,
      buildNumber: Config.BUILD_NUMBER || DEFAULTS.buildNumber,
      
      // Feature Flags
      enableAnalytics: this.parseBoolean(Config.ENABLE_ANALYTICS, DEFAULTS.enableAnalytics),
      enableCrashReporting: this.parseBoolean(Config.ENABLE_CRASH_REPORTING, DEFAULTS.enableCrashReporting),
      enableDebugMode: this.parseBoolean(Config.ENABLE_DEBUG_MODE, DEFAULTS.enableDebugMode),
      enableOfflineMode: this.parseBoolean(Config.ENABLE_OFFLINE_MODE, DEFAULTS.enableOfflineMode),
      enablePremiumFeatures: this.parseBoolean(Config.ENABLE_PREMIUM_FEATURES, DEFAULTS.enablePremiumFeatures),
      
      // Cache
      cacheMaxAge: parseInt(Config.CACHE_MAX_AGE || '', 10) || DEFAULTS.cacheMaxAge,
      cacheMaxSize: parseInt(Config.CACHE_MAX_SIZE || '', 10) || DEFAULTS.cacheMaxSize,
      
      // Performance
      enablePerformanceMonitoring: this.parseBoolean(Config.ENABLE_PERFORMANCE_MONITORING, DEFAULTS.enablePerformanceMonitoring),
      animationsEnabled: this.parseBoolean(Config.ANIMATIONS_ENABLED, DEFAULTS.animationsEnabled),
      
      // Development
      isDevelopment: __DEV__,
      isProduction: !__DEV__ && Config.ENV === 'production',
      isStaging: !__DEV__ && Config.ENV === 'staging',
    };
  }

  /**
   * Parse boolean from string
   */
  private parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
  }

  /**
   * Get a config value
   */
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  /**
   * Get all config values
   */
  getAll(): AppConfig {
    return {...this.config};
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature: 'analytics' | 'crashReporting' | 'debugMode' | 'offlineMode' | 'premiumFeatures'): boolean {
    switch (feature) {
      case 'analytics':
        return this.config.enableAnalytics;
      case 'crashReporting':
        return this.config.enableCrashReporting;
      case 'debugMode':
        return this.config.enableDebugMode;
      case 'offlineMode':
        return this.config.enableOfflineMode;
      case 'premiumFeatures':
        return this.config.enablePremiumFeatures;
      default:
        return false;
    }
  }

  /**
   * Get environment name
   */
  getEnvironment(): 'development' | 'staging' | 'production' {
    if (this.config.isDevelopment) return 'development';
    if (this.config.isStaging) return 'staging';
    return 'production';
  }

  /**
   * Override config value (for testing)
   */
  override<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    if (__DEV__) {
      this.config[key] = value;
    }
  }

  /**
   * Reset to default config (for testing)
   */
  reset(): void {
    if (__DEV__) {
      this.config = {...DEFAULTS};
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const appConfig = new ConfigManager();

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export const getConfig = <K extends keyof AppConfig>(key: K): AppConfig[K] => appConfig.get(key);
export const isFeatureEnabled = appConfig.isFeatureEnabled.bind(appConfig);
export const getEnvironment = appConfig.getEnvironment.bind(appConfig);

export default appConfig;
