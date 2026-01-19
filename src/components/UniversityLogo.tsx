/**
 * UniversityLogo Component
 * Displays university logos with proper fallbacks and brand colors
 * Uses direct URLs from Wikipedia/university websites (no Supabase storage costs)
 */

import React, {useState, useCallback, memo, useMemo, useEffect} from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ViewStyle,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {getUniversityLogoUrl, getUniversityBrandColor, hasStaticLogo} from '../utils/universityLogos';

interface UniversityLogoProps {
  /** University short name (e.g., 'NUST', 'LUMS') */
  shortName?: string;
  /** Full university name (for fallback display) */
  universityName?: string;
  /** Direct logo URL (optional - overrides shortName lookup) */
  logoUrl?: string;
  /** Size of the logo container */
  size?: number;
  /** Border radius */
  borderRadius?: number;
  /** Container style override */
  style?: ViewStyle;
  /** Show loading indicator */
  showLoader?: boolean;
}

const UniversityLogo = memo(({
  shortName,
  universityName,
  logoUrl: directLogoUrl,
  size = 56,
  borderRadius = 12,
  style,
  showLoader = true,
}: UniversityLogoProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // External logos are now enabled with verified URLs from official sources
  // URLs validated from universities DATA.csv - January 2026
  const ENABLE_EXTERNAL_LOGOS = true;

  // Get logo URL - prefer direct URL, then lookup by shortName
  const logoUrl = useMemo(() => {
    if (!ENABLE_EXTERNAL_LOGOS) {
      return null; // Always show initials fallback
    }
    if (directLogoUrl) {
      return directLogoUrl;
    }
    return getUniversityLogoUrl(shortName || '');
  }, [shortName, directLogoUrl]);
  
  // Get brand color for fallback
  const brandColor = useMemo(
    () => getUniversityBrandColor(shortName || ''),
    [shortName]
  );

  // Get initials for fallback
  const initials = useMemo(() => {
    if (shortName && shortName.length <= 4) {
      return shortName;
    }
    if (universityName) {
      return universityName
        .split(' ')
        .filter(word => !['of', 'the', 'and', 'for'].includes(word.toLowerCase()))
        .slice(0, 2)
        .map(word => word[0])
        .join('')
        .toUpperCase();
    }
    return shortName?.[0] || '?';
  }, [shortName, universityName]);

  // Reset states when URL changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setImageReady(false);
    fadeAnim.setValue(0);
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

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    setImageReady(false);
  }, []);

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

  // Show fallback if no URL or if there's an error
  const showFallback = !logoUrl || hasError;

  return (
    <View style={containerStyle}>
      {/* Loading indicator - show while loading and not showing fallback */}
      {isLoading && !showFallback && showLoader && (
        <View style={[styles.loader, {borderRadius}]}>
          <ActivityIndicator size="small" color={brandColor} />
        </View>
      )}

      {/* Actual logo image - only render if we have a URL and no error */}
      {logoUrl && !hasError && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {opacity: fadeAnim},
          ]}>
          <Image
            source={{
              uri: logoUrl,
              // Add cache headers
              headers: {
                'Cache-Control': 'max-age=31536000',
              },
            }}
            style={[
              styles.logo,
              {
                width: size,
                height: size,
                borderRadius,
              },
            ]}
            resizeMode="cover"
            onLoad={handleLoad}
            onError={handleError}
            // Ensure image is rendered
            fadeDuration={0}
          />
        </Animated.View>
      )}

      {/* Fallback with gradient and initials - show when no URL or error */}
      {showFallback && (
        <LinearGradient
          colors={[brandColor, adjustBrightness(brandColor, -25)]}
          style={[
            styles.fallback,
            {
              width: size,
              height: size,
              borderRadius,
            },
          ]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          <Text
            style={[
              styles.initials,
              {
                fontSize: initials.length <= 2 ? size * 0.4 : initials.length <= 3 ? size * 0.32 : size * 0.26,
              },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}>
            {initials}
          </Text>
        </LinearGradient>
      )}
    </View>
  );
});

/**
 * Adjust brightness of a color
 */
function adjustBrightness(color: string, percent: number): string {
  // Handle HSL colors
  if (color.startsWith('hsl')) {
    const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      const h = parseInt(match[1], 10);
      const s = parseInt(match[2], 10);
      const l = Math.max(0, Math.min(100, parseInt(match[3], 10) + percent));
      return `hsl(${h}, ${s}%, ${l}%)`;
    }
  }

  // Handle hex colors
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + percent * 2.55));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + percent * 2.55));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + percent * 2.55));

  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

UniversityLogo.displayName = 'UniversityLogo';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
});

export default UniversityLogo;
