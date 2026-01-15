/**
 * useImageLoader Hook
 * Handles image loading states with placeholders and error fallbacks
 */

import {useState, useCallback, useRef, useEffect} from 'react';
import {Image, ImageSourcePropType} from 'react-native';

export type ImageLoadState = 'idle' | 'loading' | 'loaded' | 'error';

interface UseImageLoaderOptions {
  /** Placeholder to show while loading */
  placeholder?: ImageSourcePropType;
  /** Fallback image on error */
  fallback?: ImageSourcePropType;
  /** Preload the image immediately */
  preload?: boolean;
  /** Callback when image loads successfully */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: (error: any) => void;
}

interface UseImageLoaderReturn {
  /** Current loading state */
  state: ImageLoadState;
  /** Whether image is currently loading */
  isLoading: boolean;
  /** Whether image has loaded successfully */
  isLoaded: boolean;
  /** Whether image failed to load */
  hasError: boolean;
  /** Props to spread on Image component */
  imageProps: {
    onLoadStart: () => void;
    onLoadEnd: () => void;
    onLoad: () => void;
    onError: (error: any) => void;
  };
  /** Current source to display (original, placeholder, or fallback) */
  currentSource: ImageSourcePropType | undefined;
  /** Retry loading the image */
  retry: () => void;
}

/**
 * Hook for managing image loading states
 * 
 * @example
 * const {imageProps, isLoading, currentSource} = useImageLoader(
 *   {uri: item.logo_url},
 *   {
 *     fallback: require('../assets/images/placeholder.png'),
 *     preload: true,
 *   }
 * );
 * 
 * return (
 *   <View>
 *     {isLoading && <ActivityIndicator />}
 *     <Image source={currentSource} {...imageProps} />
 *   </View>
 * );
 */
export function useImageLoader(
  source: ImageSourcePropType | undefined,
  options: UseImageLoaderOptions = {},
): UseImageLoaderReturn {
  const {
    placeholder,
    fallback,
    preload = false,
    onLoad: onLoadCallback,
    onError: onErrorCallback,
  } = options;

  const [state, setState] = useState<ImageLoadState>('idle');
  const [retryCount, setRetryCount] = useState(0);
  const mountedRef = useRef(true);

  // Preload image if requested
  useEffect(() => {
    if (preload && source && typeof source === 'object' && 'uri' in source && source.uri) {
      Image.prefetch(source.uri).catch(() => {
        // Prefetch failed, will try again when component renders
      });
    }
  }, [preload, source]);

  // Track mounted state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleLoadStart = useCallback(() => {
    if (mountedRef.current) {
      setState('loading');
    }
  }, []);

  const handleLoadEnd = useCallback(() => {
    // LoadEnd fires after either success or error
  }, []);

  const handleLoad = useCallback(() => {
    if (mountedRef.current) {
      setState('loaded');
      onLoadCallback?.();
    }
  }, [onLoadCallback]);

  const handleError = useCallback(
    (error: any) => {
      if (mountedRef.current) {
        setState('error');
        onErrorCallback?.(error);
      }
    },
    [onErrorCallback],
  );

  const retry = useCallback(() => {
    setState('idle');
    setRetryCount(prev => prev + 1);
  }, []);

  // Determine which source to show
  const currentSource = (() => {
    if (state === 'error' && fallback) {
      return fallback;
    }
    if (state === 'loading' && placeholder) {
      return placeholder;
    }
    return source;
  })();

  return {
    state,
    isLoading: state === 'loading',
    isLoaded: state === 'loaded',
    hasError: state === 'error',
    imageProps: {
      onLoadStart: handleLoadStart,
      onLoadEnd: handleLoadEnd,
      onLoad: handleLoad,
      onError: handleError,
    },
    currentSource,
    retry,
  };
}

/**
 * Preload multiple images
 * Returns a promise that resolves when all images are preloaded
 */
export async function preloadImages(urls: string[]): Promise<boolean[]> {
  const results = await Promise.allSettled(
    urls.map(url => Image.prefetch(url)),
  );
  return results.map(result => result.status === 'fulfilled');
}

/**
 * Hook to preload multiple images
 */
export function usePreloadImages(urls: string[]) {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadImages = async () => {
      const failedUrls: string[] = [];
      let loadedCount = 0;

      for (const url of urls) {
        try {
          await Image.prefetch(url);
        } catch {
          failedUrls.push(url);
        }
        loadedCount++;
        if (mounted) {
          setProgress(loadedCount / urls.length);
        }
      }

      if (mounted) {
        setErrors(failedUrls);
        setLoaded(true);
      }
    };

    if (urls.length > 0) {
      loadImages();
    } else {
      setLoaded(true);
    }

    return () => {
      mounted = false;
    };
  }, [urls]);

  return {loaded, progress, errors};
}

export default useImageLoader;
