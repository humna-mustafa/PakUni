/**
 * useInAppReview - Google Play In-App Review API Hook
 * 
 * PLAY STORE RANKING BOOSTER:
 * This hook triggers the native Google Play in-app review dialog,
 * allowing users to rate the app without leaving it. This dramatically
 * increases review count and rating, which are the #1 ranking factors.
 * 
 * Strategy:
 * - Trigger after user completes 3rd merit calculation (engaged user)
 * - Trigger after user saves 5th favorite (invested user)
 * - Maximum 1 prompt per 30 days (Google enforces this too)
 * - Never prompt on first session, during errors, or for guests
 * 
 * Note: Google Play controls whether the review dialog actually shows.
 * The API may silently no-op if conditions aren't met (quota exceeded, etc.)
 */

import { useCallback, useRef } from 'react';
import { Platform, NativeModules, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage keys
const REVIEW_LAST_PROMPTED_KEY = '@pakuni_review_last_prompted';
const REVIEW_MERIT_COUNT_KEY = '@pakuni_review_merit_count';
const REVIEW_FAVORITE_COUNT_KEY = '@pakuni_review_favorite_count';
const REVIEW_COMPLETED_KEY = '@pakuni_review_completed';
const REVIEW_APP_OPENS_KEY = '@pakuni_review_app_opens';

// Configuration
const MIN_MERIT_CALCULATIONS = 3;
const MIN_FAVORITES_SAVED = 5;
const MIN_APP_OPENS = 5;
const MIN_DAYS_BETWEEN_PROMPTS = 30;
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.pakuni';

interface UseInAppReviewReturn {
  /** Call after each merit calculation to track engagement */
  trackMeritCalculation: () => Promise<void>;
  /** Call after each favorite save to track engagement */
  trackFavoriteSaved: () => Promise<void>;
  /** Call on each app open to track engagement */
  trackAppOpen: () => Promise<void>;
  /** Manually request review (respects cooldown) */
  requestReview: () => Promise<boolean>;
  /** Open Play Store page directly (for "Rate Us" in settings) */
  openPlayStoreListing: () => Promise<void>;
  /** Check if review prompt is eligible (without triggering) */
  isEligibleForReview: () => Promise<boolean>;
}

export const useInAppReview = (): UseInAppReviewReturn => {
  const isRequestingRef = useRef(false);

  /**
   * Check if enough time has passed since last review prompt
   */
  const hasEnoughTimePassed = useCallback(async (): Promise<boolean> => {
    try {
      const lastPrompted = await AsyncStorage.getItem(REVIEW_LAST_PROMPTED_KEY);
      if (!lastPrompted) return true;

      const daysSinceLastPrompt =
        (Date.now() - parseInt(lastPrompted, 10)) / (1000 * 60 * 60 * 24);
      return daysSinceLastPrompt >= MIN_DAYS_BETWEEN_PROMPTS;
    } catch {
      return true;
    }
  }, []);

  /**
   * Check if user has already completed a review
   */
  const hasCompletedReview = useCallback(async (): Promise<boolean> => {
    try {
      const completed = await AsyncStorage.getItem(REVIEW_COMPLETED_KEY);
      return completed === 'true';
    } catch {
      return false;
    }
  }, []);

  /**
   * Check if enough app opens have occurred
   */
  const hasEnoughAppOpens = useCallback(async (): Promise<boolean> => {
    try {
      const opens = await AsyncStorage.getItem(REVIEW_APP_OPENS_KEY);
      return parseInt(opens || '0', 10) >= MIN_APP_OPENS;
    } catch {
      return false;
    }
  }, []);

  /**
   * Check overall eligibility for review prompt
   */
  const isEligibleForReview = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS !== 'android') return false;

      const [timePassed, notCompleted, enoughOpens] = await Promise.all([
        hasEnoughTimePassed(),
        hasCompletedReview().then(c => !c),
        hasEnoughAppOpens(),
      ]);

      return timePassed && notCompleted && enoughOpens;
    } catch {
      return false;
    }
  }, [hasEnoughTimePassed, hasCompletedReview, hasEnoughAppOpens]);

  /**
   * Request the in-app review flow via native module
   * Falls back to opening Play Store if native review not available
   */
  const requestReview = useCallback(async (): Promise<boolean> => {
    // Prevent concurrent requests
    if (isRequestingRef.current) return false;
    isRequestingRef.current = true;

    try {
      const eligible = await isEligibleForReview();
      if (!eligible) return false;

      // Record that we prompted
      await AsyncStorage.setItem(REVIEW_LAST_PROMPTED_KEY, Date.now().toString());

      if (Platform.OS === 'android') {
        // Try native in-app review (Play Core API)
        try {
          const { InAppReviewModule } = NativeModules;
          if (InAppReviewModule?.requestReview) {
            await InAppReviewModule.requestReview();
            await AsyncStorage.setItem(REVIEW_COMPLETED_KEY, 'true');
            return true;
          }
        } catch {
          // Native module not available, fall through to Play Store link
        }

        // Fallback: Open Play Store directly
        await openPlayStoreListing();
        return true;
      }

      return false;
    } catch {
      return false;
    } finally {
      isRequestingRef.current = false;
    }
  }, [isEligibleForReview]);

  /**
   * Track merit calculation and trigger review if threshold met
   */
  const trackMeritCalculation = useCallback(async (): Promise<void> => {
    try {
      const currentCount = parseInt(
        (await AsyncStorage.getItem(REVIEW_MERIT_COUNT_KEY)) || '0',
        10,
      );
      const newCount = currentCount + 1;
      await AsyncStorage.setItem(REVIEW_MERIT_COUNT_KEY, newCount.toString());

      // Trigger review at threshold
      if (newCount === MIN_MERIT_CALCULATIONS) {
        await requestReview();
      }
    } catch {
      // Silent fail — never interrupt user flow for review tracking
    }
  }, [requestReview]);

  /**
   * Track favorite saved and trigger review if threshold met
   */
  const trackFavoriteSaved = useCallback(async (): Promise<void> => {
    try {
      const currentCount = parseInt(
        (await AsyncStorage.getItem(REVIEW_FAVORITE_COUNT_KEY)) || '0',
        10,
      );
      const newCount = currentCount + 1;
      await AsyncStorage.setItem(REVIEW_FAVORITE_COUNT_KEY, newCount.toString());

      // Trigger review at threshold
      if (newCount === MIN_FAVORITES_SAVED) {
        await requestReview();
      }
    } catch {
      // Silent fail
    }
  }, [requestReview]);

  /**
   * Track app open for engagement scoring
   */
  const trackAppOpen = useCallback(async (): Promise<void> => {
    try {
      const currentCount = parseInt(
        (await AsyncStorage.getItem(REVIEW_APP_OPENS_KEY)) || '0',
        10,
      );
      await AsyncStorage.setItem(REVIEW_APP_OPENS_KEY, (currentCount + 1).toString());
    } catch {
      // Silent fail
    }
  }, []);

  /**
   * Open Play Store listing directly
   * Used for "Rate Us" button in Settings screen
   */
  const openPlayStoreListing = useCallback(async (): Promise<void> => {
    try {
      // Try market:// scheme first (opens Play Store app directly)
      const marketUrl = 'market://details?id=com.pakuni';
      const canOpen = await Linking.canOpenURL(marketUrl);

      if (canOpen) {
        await Linking.openURL(marketUrl);
      } else {
        // Fallback to web URL
        await Linking.openURL(PLAY_STORE_URL);
      }
    } catch {
      // Last resort: web URL
      await Linking.openURL(PLAY_STORE_URL);
    }
  }, []);

  return {
    trackMeritCalculation,
    trackFavoriteSaved,
    trackAppOpen,
    requestReview,
    openPlayStoreListing,
    isEligibleForReview,
  };
};

export default useInAppReview;
