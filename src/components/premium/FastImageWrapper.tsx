/**
 * FastImage Component Wrapper
 * Uses react-native-fast-image - Performant image loading with caching
 * 
 * Why FastImage?
 * - Uses SDWebImage (iOS) and Glide (Android) under the hood
 * - Aggressive caching strategies
 * - Priority loading
 * - Preloading support
 * - Progress tracking
 * - GIF support
 */

import React, {useState, useCallback, memo} from 'react';
import {View, StyleSheet, ActivityIndicator, ViewStyle, ImageStyle} from 'react-native';
import FastImage, {
  FastImageProps,
  Source,
  ResizeMode,
  Priority,
  OnLoadEvent,
  OnProgressEvent,
} from 'react-native-fast-image';
import {useTheme} from '../../contexts/ThemeContext';

// Re-export types and constants
export {ResizeMode, Priority};
export type {Source, OnLoadEvent, OnProgressEvent};

// Preload images utility
export const preloadImages = (sources: Source[]) => {
  FastImage.preload(sources);
};

// Clear cache utility
export const clearImageCache = () => {
  FastImage.clearMemoryCache();
  FastImage.clearDiskCache();
};

interface PremiumFastImageProps extends Omit<FastImageProps, 'source'> {
  /** Image source (URI or require) */
  source: Source | number;
  /** Fallback source if main fails */
  fallbackSource?: Source | number;
  /** Show loading indicator */
  showLoader?: boolean;
  /** Loader color */
  loaderColor?: string;
  /** Container style */
  containerStyle?: ViewStyle;
  /** Image style */
  imageStyle?: ImageStyle;
  /** Border radius for container */
  borderRadius?: number;
  /** Aspect ratio (width/height) */
  aspectRatio?: number;
  /** On load callback */
  onLoad?: (event: OnLoadEvent) => void;
  /** On error callback */
  onError?: () => void;
  /** On progress callback */
  onProgress?: (event: OnProgressEvent) => void;
}

const PremiumFastImage: React.FC<PremiumFastImageProps> = memo(({
  source,
  fallbackSource,
  showLoader = true,
  loaderColor,
  containerStyle,
  imageStyle,
  borderRadius = 0,
  aspectRatio,
  onLoad,
  onError,
  onProgress,
  resizeMode = FastImage.resizeMode.cover,
  priority = FastImage.priority.normal,
  ...props
}) => {
  const {colors} = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Normalize source
  const normalizedSource: Source = typeof source === 'number'
    ? source as any
    : {
        ...source,
        priority,
        cache: FastImage.cacheControl.immutable,
      };

  // Fallback source
  const normalizedFallback: Source | undefined = fallbackSource
    ? typeof fallbackSource === 'number'
      ? fallbackSource as any
      : {
          ...fallbackSource,
          priority: FastImage.priority.low,
          cache: FastImage.cacheControl.immutable,
        }
    : undefined;

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
  }, []);

  const handleLoad = useCallback((event: OnLoadEvent) => {
    setIsLoading(false);
    onLoad?.(event);
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  const handleProgress = useCallback((event: OnProgressEvent) => {
    onProgress?.(event);
  }, [onProgress]);

  // Determine which source to use
  const activeSource = hasError && normalizedFallback
    ? normalizedFallback
    : normalizedSource;

  // Container style with aspect ratio support
  const containerStyles: ViewStyle[] = [
    styles.container,
    {borderRadius},
    aspectRatio ? {aspectRatio} : undefined,
    containerStyle,
  ].filter(Boolean) as ViewStyle[];

  return (
    <View style={containerStyles}>
      <FastImage
        source={activeSource}
        style={[styles.image, {borderRadius}, imageStyle]}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoad={handleLoad}
        onError={handleError}
        onProgress={handleProgress}
        {...props}
      />
      
      {/* Loading indicator */}
      {showLoader && isLoading && (
        <View style={[styles.loaderContainer, {borderRadius}]}>
          <ActivityIndicator
            size="small"
            color={loaderColor || colors.primary}
          />
        </View>
      )}
    </View>
  );
});

// Avatar variant with circular shape
export const AvatarImage: React.FC<
  Omit<PremiumFastImageProps, 'borderRadius'> & {size?: number}
> = memo(({size = 48, containerStyle, imageStyle, ...props}) => (
  <PremiumFastImage
    {...props}
    borderRadius={size / 2}
    containerStyle={[{width: size, height: size}, containerStyle]}
    imageStyle={[{width: size, height: size}, imageStyle]}
  />
));

// Thumbnail variant with fixed aspect ratio
export const ThumbnailImage: React.FC<
  Omit<PremiumFastImageProps, 'aspectRatio'> & {width?: number}
> = memo(({width = 100, containerStyle, ...props}) => (
  <PremiumFastImage
    {...props}
    aspectRatio={16 / 9}
    borderRadius={8}
    containerStyle={[{width}, containerStyle]}
  />
));

// Hero image variant for full-width images
export const HeroImage: React.FC<
  Omit<PremiumFastImageProps, 'aspectRatio'> & {height?: number}
> = memo(({height = 200, containerStyle, ...props}) => (
  <PremiumFastImage
    {...props}
    aspectRatio={undefined}
    priority={FastImage.priority.high}
    containerStyle={[{width: '100%', height}, containerStyle]}
  />
));

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
});

export default PremiumFastImage;
