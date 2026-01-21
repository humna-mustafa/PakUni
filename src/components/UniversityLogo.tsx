/**
 * UniversityLogo Component
 * Displays university logos with premium fallbacks and brand colors
 * Uses direct URLs from Wikipedia/university websites (no Supabase storage costs)
 */

import React, {useState, useCallback, memo, useMemo, useEffect} from 'react';
import {
  View,
  Image,
  StyleSheet,
  ViewStyle,
  Animated,
  ActivityIndicator,
} from 'react-native';
import {getLogo, getUniversityBrandColor} from '../utils/universityLogos';
import {UNIVERSITIES} from '../data/universities';

interface UniversityLogoProps {
  /** University ID (Preferred for accurate logo lookup) */
  universityId?: number;
  /** University short name (e.g., 'NUST', 'LUMS') - Fallback lookup */
  shortName?: string;
  /** Full university name (for fallback display) */
  universityName?: string;
  /** Direct logo URL (optional - overrides lookup) */
  logoUrl?: string;
  /** Size of the logo container */
  size?: number;
  /** Border radius */
  borderRadius?: number;
  /** Container style override */
  style?: ViewStyle;
  /** Show loading indicator */
  showLoader?: boolean;
  /** Theme mode for fallback styling */
  isDark?: boolean;
}

const UniversityLogo = memo(({
  universityId,
  shortName,
  universityName,
  logoUrl: directLogoUrl,
  size = 56,
  borderRadius = 12,
  style,
  showLoader = true,
  isDark = false,
}: UniversityLogoProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const retryTimeoutRef = React.useRef<number | null>(null);

  // External logos ENABLED - with timeout fallback for slow URLs
  const ENABLE_EXTERNAL_LOGOS = true;
  const LOAD_TIMEOUT_MS = 20000; // 20 seconds before showing fallback (increased for slow networks)
  const MAX_RETRIES = 2;
  const RETRY_DELAY_MS = 2000; // base retry delay

  // Get logo URL - prefer direct URL, then lookup by ID, then shortName
  const logoUrl = useMemo(() => {
    if (!ENABLE_EXTERNAL_LOGOS) {
      return null; // Always show initials fallback
    }
    if (directLogoUrl) {
      return directLogoUrl;
    }
    
    // 1. Try ID if provided
    if (universityId) {
      return getLogo(universityId);
    }

    // 2. Try lookup by shortName if ID missing
    if (shortName) {
      const uni = UNIVERSITIES.find(u => u.short_name === shortName);
      if (uni?.id) {
        return getLogo(uni.id);
      }
    }

    return '';
  }, [universityId, shortName, directLogoUrl]);
  
  // Get brand color for loader indicator
  const brandColor = useMemo(
    () => getUniversityBrandColor(shortName || universityName || ''),
    [shortName, universityName]
  );

  // Reset states when URL changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setImageReady(false);
    setTimedOut(false);
    fadeAnim.setValue(0);
    
    // Set timeout - if image doesn't load in time, show fallback
    const timeoutId = setTimeout(() => {
      if (!imageReady && !hasError) {
        setTimedOut(true);
      }
    }, LOAD_TIMEOUT_MS);
    
    return () => clearTimeout(timeoutId);
  }, [logoUrl, fadeAnim]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    setImageReady(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleError = useCallback((error: any) => {
    console.log(`[UniversityLogo] Error loading: ${logoUrl}`, error?.nativeEvent?.error || 'Unknown error');
    setIsLoading(false);
    setHasError(true);
    setImageReady(false);

    // Retry logic: attempt to reload with small backoff
    if (retryCount < MAX_RETRIES) {
      const nextRetry = retryCount + 1;
      setRetryCount(nextRetry);
      const delay = RETRY_DELAY_MS * nextRetry;
      retryTimeoutRef.current = (setTimeout(() => {
        setHasError(false);
        setIsLoading(true);
        setReloadKey(prev => prev + 1);
      }, delay) as unknown) as number;
    }
  }, [logoUrl, retryCount]);

  const containerStyle = useMemo(
    () => [
      styles.container,
      {
        width: size,
        height: size,
        borderRadius,
      },
      style,
    ],
    [size, borderRadius, style]
  );

  // If no logo URL at all, return null immediately (no loading spinner for empty URLs)
  if (!logoUrl || logoUrl === '') {
    return null;
  }

  // No logo available = don't render anything (no distracting fallbacks)
  const hasNoLogo = hasError || timedOut;

  // If logo failed to load or timed out, render nothing (clean UI - no placeholders)
  if (hasNoLogo && !isLoading) {
    return null;
  }

  return (
    <View style={containerStyle}>
      {/* Loading indicator - show while loading */}
      {isLoading && showLoader && (
        <View style={[styles.loader, {borderRadius}]}>
          <ActivityIndicator size="small" color={brandColor} />
        </View>
      )}

      {/* Actual logo image - only render if we have a URL and no error/timeout */}
      {logoUrl && !hasError && !timedOut && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {opacity: fadeAnim},
          ]}>
          <Image
            source={{
              uri: logoUrl,
              cache: 'force-cache',
            }}
            style={[
              styles.logo,
              {
                width: size,
                height: size,
                borderRadius,
              },
            ]}
            resizeMode="contain"
            onLoad={handleLoad}
            onError={handleError}
            fadeDuration={300}
            progressiveRenderingEnabled={true}
          />
        </Animated.View>
      )}
    </View>
  );
});

UniversityLogo.displayName = 'UniversityLogo';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  logo: {
    backgroundColor: '#FFFFFF',
  },
});

export default UniversityLogo;
