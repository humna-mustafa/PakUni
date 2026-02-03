/**
 * UniversityLogo Component
 * Displays university logos with premium fallbacks and brand colors
 * Uses FastImage for aggressive caching - logos load once and cached locally
 * No more re-loading on every scroll or view change
 */

import React, {useState, useCallback, memo, useMemo, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Animated,
  ActivityIndicator,
  Text,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import {getLogo, getUniversityBrandColor} from '../utils/universityLogos';
import {UNIVERSITIES} from '../data/universities';
import {Icon} from './icons';
import {TYPOGRAPHY} from '../constants/design';

// Preload logos utility - call this at app startup for common universities
export const preloadUniversityLogos = (universityIds: number[]) => {
  const sources = universityIds
    .map(id => {
      const url = getLogo(id);
      return url ? {uri: url, priority: 'low'} : null;
    })
    .filter(Boolean) as {uri: string; priority: 'low' | 'normal' | 'high'}[];
  
  if (sources.length > 0) {
    FastImage.preload(sources as any);
  }
};

// Clear logo cache utility (for debugging/testing)
export const clearLogoCache = () => {
  FastImage.clearMemoryCache();
  FastImage.clearDiskCache();
};

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
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Get logo URL - prefer direct URL, then lookup by ID, then shortName
  const logoUrl = useMemo(() => {
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

  // Reset animation when URL changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    fadeAnim.setValue(0);
  }, [logoUrl, fadeAnim]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleError = useCallback(() => {
    console.log(`[UniversityLogo] Cache failed for: ${logoUrl}`);
    setIsLoading(false);
    setHasError(true);
  }, [logoUrl]);

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

  // If no logo URL at all, return fallback with initials (better UX than null)
  if (!logoUrl || logoUrl === '') {
    return <LogoFallback universityName={universityName || shortName || 'University'} size={size} borderRadius={borderRadius} style={style} />;
  }

  // If logo failed to load, render fallback with initials
  if (hasError && !isLoading) {
    return <LogoFallback universityName={universityName || shortName || 'University'} size={size} borderRadius={borderRadius} style={style} />;
  }

  return (
    <View style={containerStyle}>
      {/* Loading indicator - show while loading */}
      {isLoading && showLoader && (
        <View style={[styles.loader, {borderRadius}]}>
          <ActivityIndicator size="small" color={brandColor} />
        </View>
      )}

      {/* Actual logo image - FastImage with aggressive caching */}
      {logoUrl && !hasError && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {opacity: fadeAnim},
          ]}>
          <FastImage
            source={{
              uri: logoUrl,
              priority: FastImage.priority.normal,
              cache: FastImage.cacheControl.immutable, // Permanent cache - never re-download
            }}
            style={[
              styles.logo,
              {
                width: size,
                height: size,
                borderRadius,
              },
            ]}
            resizeMode={FastImage.resizeMode.contain}
            onLoad={handleLoad}
            onError={handleError}
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
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  initialsText: {
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

// Fallback component when logo is not available
const LogoFallback = memo(({
  universityName,
  size = 56,
  borderRadius = 12,
  style,
}: {
  universityName: string;
  size?: number;
  borderRadius?: number;
  style?: ViewStyle;
}) => {
  const brandColor = useMemo(
    () => getUniversityBrandColor(universityName),
    [universityName]
  );

  // Get initials from university name (first 2 letters)
  const initials = useMemo(() => {
    const parts = universityName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return universityName.substring(0, 2).toUpperCase();
  }, [universityName]);

  // Calculate font size based on logo size
  const fontSize = Math.floor(size * 0.35);

  return (
    <LinearGradient
      colors={[brandColor, `${brandColor}CC`]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={[
        styles.container,
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius,
        },
        style,
      ]}>
      <Text style={[styles.initialsText, {fontSize}]}>
        {initials}
      </Text>
    </LinearGradient>
  );
});

LogoFallback.displayName = 'LogoFallback';

export default UniversityLogo;
