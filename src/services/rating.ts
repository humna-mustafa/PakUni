/**
 * App Rating Service - Prompt users to rate the app
 */

import {Alert, Linking, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {logger} from '../utils/logger';

// ============================================================================
// CONFIG
// ============================================================================

const STORAGE_KEYS = {
  RATING_DATA: '@pakuni_rating_data',
};

const APP_CONFIG = {
  // Replace with your actual app IDs when published
  PLAY_STORE_ID: 'com.pakuni',
  APP_STORE_ID: '123456789', // Your App Store ID
  MIN_SESSIONS_BEFORE_PROMPT: 3,
  MIN_DAYS_BEFORE_PROMPT: 2,
  DAYS_BEFORE_REPROMPT: 30,
};

// ============================================================================
// TYPES
// ============================================================================

interface RatingData {
  sessionCount: number;
  firstSessionDate: string;
  lastPromptDate: string | null;
  hasRated: boolean;
  hasDeclined: boolean;
  declineCount: number;
}

const DEFAULT_RATING_DATA: RatingData = {
  sessionCount: 0,
  firstSessionDate: new Date().toISOString(),
  lastPromptDate: null,
  hasRated: false,
  hasDeclined: false,
  declineCount: 0,
};

// ============================================================================
// RATING SERVICE
// ============================================================================

class AppRatingService {
  private ratingData: RatingData = DEFAULT_RATING_DATA;
  private isInitialized: boolean = false;

  /**
   * Initialize the rating service - call on app startup
   */
  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.RATING_DATA);
      if (stored) {
        this.ratingData = JSON.parse(stored);
      } else {
        this.ratingData = DEFAULT_RATING_DATA;
        await this.saveData();
      }

      // Increment session count
      this.ratingData.sessionCount += 1;
      await this.saveData();
      
      this.isInitialized = true;
    } catch (error) {
      logger.error('Rating service init error', error, 'Rating');
      this.isInitialized = true;
    }
  }

  /**
   * Save rating data to storage
   */
  private async saveData(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.RATING_DATA,
        JSON.stringify(this.ratingData)
      );
    } catch (error) {
      logger.error('Save rating data error', error, 'Rating');
    }
  }

  /**
   * Check if we should show the rating prompt
   */
  shouldShowRatingPrompt(): boolean {
    if (!this.isInitialized) return false;

    // Already rated
    if (this.ratingData.hasRated) return false;

    // Declined too many times
    if (this.ratingData.declineCount >= 3) return false;

    // Check minimum sessions
    if (this.ratingData.sessionCount < APP_CONFIG.MIN_SESSIONS_BEFORE_PROMPT) {
      return false;
    }

    // Check minimum days since first session
    const firstSession = new Date(this.ratingData.firstSessionDate);
    const daysSinceFirst = Math.floor(
      (Date.now() - firstSession.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceFirst < APP_CONFIG.MIN_DAYS_BEFORE_PROMPT) {
      return false;
    }

    // Check days since last prompt
    if (this.ratingData.lastPromptDate) {
      const lastPrompt = new Date(this.ratingData.lastPromptDate);
      const daysSincePrompt = Math.floor(
        (Date.now() - lastPrompt.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSincePrompt < APP_CONFIG.DAYS_BEFORE_REPROMPT) {
        return false;
      }
    }

    return true;
  }

  /**
   * Show the rating prompt
   */
  async showRatingPrompt(): Promise<void> {
    // Update last prompt date
    this.ratingData.lastPromptDate = new Date().toISOString();
    await this.saveData();

    Alert.alert(
      '⭐ Enjoying PakUni?',
      'Your feedback helps us improve! Would you like to rate us on the app store?',
      [
        {
          text: 'Not Now',
          style: 'cancel',
          onPress: () => this.handleDecline(),
        },
        {
          text: 'Never Ask Again',
          style: 'destructive',
          onPress: () => this.handleNeverAsk(),
        },
        {
          text: 'Rate Now',
          onPress: () => this.openAppStore(),
        },
      ]
    );
  }

  /**
   * Show feedback prompt (alternative to rating)
   */
  showFeedbackPrompt(onFeedback?: () => void): void {
    Alert.alert(
      '💬 Help Us Improve',
      'We noticed you might be having some issues. Would you like to share feedback with us?',
      [
        {
          text: 'No Thanks',
          style: 'cancel',
        },
        {
          text: 'Send Feedback',
          onPress: onFeedback,
        },
      ]
    );
  }

  /**
   * Handle user declining to rate
   */
  private async handleDecline(): Promise<void> {
    this.ratingData.declineCount += 1;
    this.ratingData.hasDeclined = true;
    await this.saveData();
  }

  /**
   * Handle user choosing never ask again
   */
  private async handleNeverAsk(): Promise<void> {
    this.ratingData.hasRated = true; // Treat as rated to never show again
    this.ratingData.declineCount = 999;
    await this.saveData();
  }

  /**
   * Open the app store for rating
   */
  async openAppStore(): Promise<void> {
    try {
      const url = Platform.select({
        ios: `itms-apps://itunes.apple.com/app/id${APP_CONFIG.APP_STORE_ID}?action=write-review`,
        android: `market://details?id=${APP_CONFIG.PLAY_STORE_ID}`,
      });

      if (url) {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
          this.ratingData.hasRated = true;
          await this.saveData();
        } else {
          // Fallback to web URL
          const webUrl = Platform.select({
            ios: `https://apps.apple.com/app/id${APP_CONFIG.APP_STORE_ID}`,
            android: `https://play.google.com/store/apps/details?id=${APP_CONFIG.PLAY_STORE_ID}`,
          });
          if (webUrl) {
            await Linking.openURL(webUrl);
            this.ratingData.hasRated = true;
            await this.saveData();
          }
        }
      }
    } catch (error) {
      logger.error('Open app store error', error, 'Rating');
      Alert.alert('Error', 'Unable to open app store. Please try again later.');
    }
  }

  /**
   * Mark as rated (call after successful rating)
   */
  async markAsRated(): Promise<void> {
    this.ratingData.hasRated = true;
    await this.saveData();
  }

  /**
   * Reset rating data (for testing)
   */
  async resetRatingData(): Promise<void> {
    this.ratingData = DEFAULT_RATING_DATA;
    await this.saveData();
  }

  /**
   * Get current rating data (for debugging)
   */
  getRatingData(): RatingData {
    return {...this.ratingData};
  }

  /**
   * Check rating eligibility after positive action
   */
  async checkAfterPositiveAction(): Promise<boolean> {
    // Positive actions: saved item, completed calculation, etc.
    if (this.shouldShowRatingPrompt()) {
      // 30% chance to show after positive action
      if (Math.random() < 0.3) {
        await this.showRatingPrompt();
        return true;
      }
    }
    return false;
  }
}

// Singleton instance
export const appRatingService = new AppRatingService();

// ============================================================================
// HOOK
// ============================================================================

import {useEffect, useCallback} from 'react';

export const useAppRating = () => {
  useEffect(() => {
    appRatingService.initialize();
  }, []);

  const checkRating = useCallback(async () => {
    if (appRatingService.shouldShowRatingPrompt()) {
      await appRatingService.showRatingPrompt();
    }
  }, []);

  const checkAfterPositiveAction = useCallback(async () => {
    return appRatingService.checkAfterPositiveAction();
  }, []);

  const openAppStore = useCallback(async () => {
    await appRatingService.openAppStore();
  }, []);

  return {
    checkRating,
    checkAfterPositiveAction,
    openAppStore,
    shouldShowPrompt: appRatingService.shouldShowRatingPrompt.bind(appRatingService),
  };
};

export default appRatingService;
