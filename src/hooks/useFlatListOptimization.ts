/**
 * useFlatListOptimization Hook
 * Provides optimized FlatList props for better performance
 */

import {useCallback, useMemo, useRef} from 'react';
import {Platform, FlatListProps, ViewToken} from 'react-native';

interface UseFlatListOptimizationOptions<T> {
  /** Fixed item height (enables getItemLayout optimization) */
  itemHeight?: number;
  /** Header height for getItemLayout calculation */
  headerHeight?: number;
  /** Separator height for getItemLayout calculation */
  separatorHeight?: number;
  /** Number of items to render initially */
  initialNumToRender?: number;
  /** Maximum items to render per batch */
  maxToRenderPerBatch?: number;
  /** Window size (number of screens to keep rendered) */
  windowSize?: number;
  /** Update cell batch period in ms */
  updateCellsBatchingPeriod?: number;
  /** Callback when items become visible */
  onViewableItemsChanged?: (items: T[]) => void;
  /** Viewability config threshold */
  viewabilityThreshold?: number;
}

interface UseFlatListOptimizationReturn<T> {
  /** Optimized FlatList props to spread */
  optimizedProps: Partial<FlatListProps<T>>;
  /** getItemLayout function (if itemHeight provided) */
  getItemLayout?: (data: T[] | null | undefined, index: number) => {
    length: number;
    offset: number;
    index: number;
  };
  /** Viewability config for tracking visible items */
  viewabilityConfig: {
    itemVisiblePercentThreshold: number;
    minimumViewTime: number;
  };
  /** Viewability callback handler */
  onViewableItemsChanged: (info: {
    viewableItems: ViewToken[];
    changed: ViewToken[];
  }) => void;
}

/**
 * Hook to optimize FlatList performance
 * 
 * @example
 * const {optimizedProps, getItemLayout} = useFlatListOptimization({
 *   itemHeight: 120,
 *   headerHeight: 200,
 * });
 * 
 * <FlatList
 *   data={data}
 *   renderItem={renderItem}
 *   getItemLayout={getItemLayout}
 *   {...optimizedProps}
 * />
 */
export function useFlatListOptimization<T>(
  options: UseFlatListOptimizationOptions<T> = {},
): UseFlatListOptimizationReturn<T> {
  const {
    itemHeight,
    headerHeight = 0,
    separatorHeight = 0,
    initialNumToRender = 10,
    maxToRenderPerBatch = 10,
    windowSize = 5,
    updateCellsBatchingPeriod = 50,
    onViewableItemsChanged,
    viewabilityThreshold = 50,
  } = options;

  const viewableItemsRef = useRef<T[]>([]);

  // getItemLayout for fixed height items
  const getItemLayout = useMemo(() => {
    if (!itemHeight) return undefined;

    return (data: T[] | null | undefined, index: number) => ({
      length: itemHeight,
      offset: headerHeight + (itemHeight + separatorHeight) * index,
      index,
    });
  }, [itemHeight, headerHeight, separatorHeight]);

  // Viewability config
  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: viewabilityThreshold,
      minimumViewTime: 100,
    }),
    [viewabilityThreshold],
  );

  // Viewability change handler
  const handleViewableItemsChanged = useCallback(
    (info: {viewableItems: ViewToken[]; changed: ViewToken[]}) => {
      const visibleItems = info.viewableItems
        .filter(token => token.isViewable && token.item)
        .map(token => token.item as T);

      viewableItemsRef.current = visibleItems;
      onViewableItemsChanged?.(visibleItems);
    },
    [onViewableItemsChanged],
  );

  // Optimized FlatList props
  const optimizedProps = useMemo(
    (): Partial<FlatListProps<T>> => ({
      // Rendering optimization
      initialNumToRender,
      maxToRenderPerBatch,
      windowSize,
      updateCellsBatchingPeriod,
      
      // Memory optimization (Android-specific)
      removeClippedSubviews: Platform.OS === 'android',
      
      // Keyboard handling
      keyboardShouldPersistTaps: 'handled',
      keyboardDismissMode: 'on-drag',
      
      // Scroll optimization
      showsVerticalScrollIndicator: false,
      
      // Prevent re-renders
      scrollEventThrottle: 16,
      
      // Maintain scroll position
      maintainVisibleContentPosition: {
        minIndexForVisible: 0,
      },
    }),
    [initialNumToRender, maxToRenderPerBatch, windowSize, updateCellsBatchingPeriod],
  );

  return {
    optimizedProps,
    getItemLayout,
    viewabilityConfig,
    onViewableItemsChanged: handleViewableItemsChanged,
  };
}

/**
 * Create a stable keyExtractor function
 */
export function useKeyExtractor<T>(
  getKey: (item: T, index: number) => string,
): (item: T, index: number) => string {
  return useCallback(getKey, [getKey]);
}

/**
 * Create optimized item separators
 */
export function useItemSeparator(height: number, color: string) {
  return useCallback(
    () => ({
      height,
      backgroundColor: color,
    }),
    [height, color],
  );
}

export default useFlatListOptimization;
