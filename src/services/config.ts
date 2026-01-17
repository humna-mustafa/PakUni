/**
 * App Configuration Service - Centralized configuration management
 * Feature flags, API endpoints, and app settings
 */

import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {logger} from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface AppConfig {
  // API Configuration
  api: {
    baseUrl: string;
    supabaseUrl: string;
    supabaseAnonKey: string;
    timeout: number;
    retryCount: number;
  };

  // Feature Flags
  features: {
    darkModeEnabled: boolean;
    analyticsEnabled: boolean;
    crashReportingEnabled: boolean;
    pushNotificationsEnabled: boolean;
    offlineModeEnabled: boolean;
    kidsHubEnabled: boolean;
    aiRecommendationsEnabled: boolean;
    premiumFeaturesEnabled: boolean;
    urduLanguageEnabled: boolean;
    biometricAuthEnabled: boolean;
  };

  // App Settings
  app: {
    name: string;
    version: string;
    buildNumber: string;
    environment: 'development' | 'staging' | 'production';
    minSupportedVersion: string;
    forceUpdateVersion: string | null;
  };

  // UI Configuration
  ui: {
    defaultTheme: 'light' | 'dark' | 'system';
    animationsEnabled: boolean;
    hapticsEnabled: boolean;
    maxSearchResults: number;
    paginationLimit: number;
    imageCacheDuration: number; // in milliseconds
  };

  // Content Configuration
  content: {
    supportEmail: string;
    privacyPolicyUrl: string;
    termsOfServiceUrl: string;
    appStoreUrl: string;
    playStoreUrl: string;
    websiteUrl: string;
    socialMedia: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
  };

  // Regional Settings
  regional: {
    defaultLanguage: 'en' | 'ur';
    supportedLanguages: ('en' | 'ur')[];
    defaultCurrency: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
  };

  // Cache Configuration
  cache: {
    universitiesTTL: number;
    scholarshipsTTL: number;
    entryTestsTTL: number;
    userProfileTTL: number;
    maxCacheSize: number; // in bytes
  };
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const defaultConfig: AppConfig = {
  api: {
    // App is offline-first with bundled data - no API dependency
    // API URL left empty as we're not using external domain
    baseUrl: '',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    timeout: 30000,
    retryCount: 3,
  },

  features: {
    darkModeEnabled: true,
    analyticsEnabled: !__DEV__,
    crashReportingEnabled: !__DEV__,
    pushNotificationsEnabled: true,
    offlineModeEnabled: true,
    kidsHubEnabled: true,
    aiRecommendationsEnabled: true,
    premiumFeaturesEnabled: false,
    urduLanguageEnabled: false, // Coming soon
    biometricAuthEnabled: false,
  },

  app: {
    name: 'PakUni',
    version: '1.0.0',
    buildNumber: '1',
    environment: __DEV__ ? 'development' : 'production',
    minSupportedVersion: '1.0.0',
    forceUpdateVersion: null,
  },

  ui: {
    defaultTheme: 'system',
    animationsEnabled: true,
    hapticsEnabled: true,
    maxSearchResults: 50,
    paginationLimit: 20,
    imageCacheDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
  },

  content: {
    supportEmail: '',
    privacyPolicyUrl: '',
    termsOfServiceUrl: '',
    appStoreUrl: '',
    playStoreUrl: '',
    websiteUrl: '',
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
    },
  },

  regional: {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'ur'],
    defaultCurrency: 'PKR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
  },

  cache: {
    universitiesTTL: 24 * 60 * 60 * 1000, // 24 hours
    scholarshipsTTL: 12 * 60 * 60 * 1000, // 12 hours
    entryTestsTTL: 24 * 60 * 60 * 1000, // 24 hours
    userProfileTTL: 5 * 60 * 1000, // 5 minutes
    maxCacheSize: 50 * 1024 * 1024, // 50MB
  },
};

// ============================================================================
// CONFIGURATION SERVICE
// ============================================================================

const CONFIG_STORAGE_KEY = '@pakuni_config';
const REMOTE_CONFIG_URL = ''; // No external config endpoint

class ConfigService {
  private config: AppConfig = defaultConfig;
  private isInitialized = false;
  private listeners: Set<(config: AppConfig) => void> = new Set();

  /**
   * Initialize configuration (load from storage or remote)
   */
  async initialize(): Promise<void> {
    try {
      // Load cached config from storage
      const cachedConfig = await this.loadFromStorage();
      if (cachedConfig) {
        this.config = this.mergeConfig(defaultConfig, cachedConfig);
      }

      // Fetch remote config in background (non-blocking)
      this.fetchRemoteConfig().catch(err => logger.warn('Failed to fetch remote config', err, 'Config'));

      this.isInitialized = true;
      this.notifyListeners();
    } catch (error) {
      logger.warn('Failed to initialize config', error, 'Config');
      this.isInitialized = true;
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): AppConfig {
    return this.config;
  }

  /**
   * Get specific config value
   */
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.config.features[feature];
  }

  /**
   * Update configuration locally
   */
  async updateConfig(updates: Partial<AppConfig>): Promise<void> {
    this.config = this.mergeConfig(this.config, updates);
    await this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Update a specific feature flag
   */
  async setFeatureFlag(
    feature: keyof AppConfig['features'],
    enabled: boolean,
  ): Promise<void> {
    this.config.features[feature] = enabled;
    await this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Subscribe to config changes
   */
  subscribe(listener: (config: AppConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Check if update is required
   */
  isUpdateRequired(): boolean {
    if (!this.config.app.forceUpdateVersion) return false;
    return this.compareVersions(
      this.config.app.version,
      this.config.app.forceUpdateVersion,
    ) < 0;
  }

  /**
   * Check if update is available
   */
  isUpdateAvailable(): boolean {
    return this.compareVersions(
      this.config.app.version,
      this.config.app.minSupportedVersion,
    ) < 0;
  }

  /**
   * Get platform-specific config
   */
  getPlatformConfig<T>(config: {ios: T; android: T; default?: T}): T {
    switch (Platform.OS) {
      case 'ios':
        return config.ios;
      case 'android':
        return config.android;
      default:
        return config.default ?? config.android;
    }
  }

  /**
   * Reset to default configuration
   */
  async resetToDefault(): Promise<void> {
    this.config = defaultConfig;
    await AsyncStorage.removeItem(CONFIG_STORAGE_KEY);
    this.notifyListeners();
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Load config from AsyncStorage
   */
  private async loadFromStorage(): Promise<Partial<AppConfig> | null> {
    try {
      const json = await AsyncStorage.getItem(CONFIG_STORAGE_KEY);
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  }

  /**
   * Save config to AsyncStorage
   */
  private async saveToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      logger.warn('Failed to save config', error, 'Config');
    }
  }

  /**
   * Fetch remote configuration
   */
  private async fetchRemoteConfig(): Promise<void> {
    try {
      const response = await fetch(REMOTE_CONFIG_URL, {
        headers: {
          'X-Platform': Platform.OS,
          'X-App-Version': this.config.app.version,
        },
      });

      if (response.ok) {
        const remoteConfig = await response.json();
        this.config = this.mergeConfig(this.config, remoteConfig);
        await this.saveToStorage();
        this.notifyListeners();
      }
    } catch (error) {
      // Silently fail - use cached/default config
    }
  }

  /**
   * Deep merge configurations
   */
  private mergeConfig(base: AppConfig, updates: Partial<AppConfig>): AppConfig {
    const merged = {...base};

    for (const key of Object.keys(updates) as (keyof AppConfig)[]) {
      if (updates[key] !== undefined) {
        if (typeof updates[key] === 'object' && !Array.isArray(updates[key])) {
          merged[key] = {
            ...(base[key] as any),
            ...(updates[key] as any),
          };
        } else {
          (merged as any)[key] = updates[key];
        }
      }
    }

    return merged;
  }

  /**
   * Compare semantic versions
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }

    return 0;
  }

  /**
   * Notify all listeners of config change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.config));
  }
}

// Export singleton instance
export const config = new ConfigService();

// ============================================================================
// REACT HOOKS
// ============================================================================

import {useState, useEffect} from 'react';

/**
 * Hook to access full configuration
 */
export const useConfig = (): AppConfig => {
  const [currentConfig, setCurrentConfig] = useState(config.getConfig());

  useEffect(() => {
    return config.subscribe(setCurrentConfig);
  }, []);

  return currentConfig;
};

/**
 * Hook to check if a feature is enabled
 */
export const useFeatureFlag = (feature: keyof AppConfig['features']): boolean => {
  const appConfig = useConfig();
  return appConfig.features[feature];
};

/**
 * Hook to get specific config section
 */
export const useConfigSection = <K extends keyof AppConfig>(key: K): AppConfig[K] => {
  const appConfig = useConfig();
  return appConfig[key];
};

export default config;
