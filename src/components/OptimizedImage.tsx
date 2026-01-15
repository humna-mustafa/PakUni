/**
 * OptimizedImage Component
 * Image component with loading states, error handling, and fallbacks
 */

import React, {useState, useCallback, memo} from 'react';
import {
  Image,
  View,
  StyleSheet,
  ImageProps,
  ImageSourcePropType,
  ActivityIndicator,
  ViewStyle,
  ImageStyle,
  Animated,
} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {RADIUS, ANIMATION} from '../constants/design';

// ============================================================================
// TYPES
// ============================================================================

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  /** Image source (uri or require) */
  source: ImageSourcePropType | undefined | null;
  /** Fallback image when source fails */
  fallback?: ImageSourcePropType;
  /** Placeholder while loading */
  placeholder?: ImageSourcePropType;
  /** Show loading indicator */
  showLoader?: boolean;
  /** Custom loader color */
  loaderColor?: string;
  /** Container style */
  containerStyle?: ViewStyle;
  /** Image style */
  imageStyle?: ImageStyle;
  /** Fade in animation duration */
  fadeInDuration?: number;
  /** Show shimmer effect while loading */
  showShimmer?: boolean;
  /** Border radius */
  borderRadius?: number;
  /** Callback when image loads */
  onImageLoad?: () => void;
  /** Callback when image fails */
  onImageError?: (error: any) => void;
}

// ============================================================================
// SHIMMER PLACEHOLDER
// ============================================================================

const ShimmerPlaceholder = memo(({
  style,
  borderRadius = 0,
}: {
  style?: ViewStyle;
  borderRadius?: number;
}) => {
  const {colors, isDark} = useTheme();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return (
    <View
      style={[
        styles.shimmerContainer,
        {
          backgroundColor: isDark ? colors.cardElevated : colors.border,
          borderRadius,
        },
        style,
      ]}>
      <Animated.View
        style={[
          styles.shimmerOverlay,
          {
            transform: [{translateX}],
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(255,255,255,0.5)',
          },
        ]}
      />
    </View>
  );
});

// ============================================================================
// FALLBACK PLACEHOLDER (Letter-based)
// ============================================================================

const FallbackPlaceholder = memo(({
  text,
  style,
  borderRadius = 0,
}: {
  text?: string;
  style?: ViewStyle;
  borderRadius?: number;
}) => {
  const {colors} = useTheme();
  const letter = text?.[0]?.toUpperCase() || '?';

  return (
    <View
      style={[
        styles.fallbackContainer,
        {
          backgroundColor: `${colors.primary}15`,
          borderRadius,
        },
        style,
      ]}>
      <Animated.Text style={[styles.fallbackText, {color: colors.primary}]}>
        {letter}
      </Animated.Text>
    </View>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const OptimizedImage = memo(({
  source,
  fallback,
  placeholder,
  showLoader = true,
  loaderColor,
  containerStyle,
  imageStyle,
  fadeInDuration = 200,
  showShimmer = true,
  borderRadius = 0,
  onImageLoad,
  onImageError,
  style,
  ...imageProps
}: OptimizedImageProps) => {
  const {colors} = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onImageLoad?.();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: fadeInDuration,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, fadeInDuration, onImageLoad]);

  const handleError = useCallback((error: any) => {
    setIsLoading(false);
    setHasError(true);
    onImageError?.(error);
  }, [onImageError]);

  // Determine the actual source to use
  const actualSource = React.useMemo(() => {
    if (hasError && fallback) {
      return fallback;
    }
    if (!source) {
      return fallback;
    }
    return source;
  }, [source, fallback, hasError]);

  // Check if source is valid
  const hasValidSource = React.useMemo(() => {
    if (!actualSource) return false;
    if (typeof actualSource === 'number') return true; // require() returns number
    if (typeof actualSource === 'object' && 'uri' in actualSource) {
      return Boolean(actualSource.uri);
    }
    return false;
  }, [actualSource]);

  // Get text for fallback (from alt text or imageProps)
  const fallbackText = imageProps.accessibilityLabel || '';

  const combinedContainerStyle = React.useMemo(
    () => [styles.container, {borderRadius}, containerStyle],
    [borderRadius, containerStyle],
  );

  const combinedImageStyle = React.useMemo(
    () => [styles.image, {borderRadius}, style, imageStyle],
    [borderRadius, style, imageStyle],
  );

  // Simple style for fallback placeholder
  const fallbackStyle: ViewStyle = React.useMemo(
    () => ({
      width: '100%',
      height: '100%',
      borderRadius,
    }),
    [borderRadius],
  );

  return (
    <View style={combinedContainerStyle}>
      {/* Loading state */}
      {isLoading && showShimmer && (
        <ShimmerPlaceholder
          style={StyleSheet.absoluteFill}
          borderRadius={borderRadius}
        />
      )}

      {/* Loading indicator */}
      {isLoading && showLoader && !showShimmer && (
        <View style={[styles.loaderContainer, StyleSheet.absoluteFill]}>
          <ActivityIndicator
            size="small"
            color={loaderColor || colors.primary}
          />
        </View>
      )}

      {/* Main image */}
      {hasValidSource ? (
        <Animated.Image
          {...imageProps}
          source={actualSource as ImageSourcePropType}
          style={[
            combinedImageStyle,
            {opacity: isLoading ? 0 : fadeAnim},
          ]}
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <FallbackPlaceholder
          text={fallbackText}
          style={fallbackStyle}
          borderRadius={borderRadius}
        />
      )}

      {/* Error state with fallback */}
      {hasError && !fallback && (
        <FallbackPlaceholder
          text={fallbackText}
          style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius}}
          borderRadius={borderRadius}
        />
      )}
    </View>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shimmerContainer: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '150%',
  },
  fallbackContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    fontSize: 24,
    fontWeight: '800',
  },
});

export default OptimizedImage;
export {ShimmerPlaceholder, FallbackPlaceholder};
