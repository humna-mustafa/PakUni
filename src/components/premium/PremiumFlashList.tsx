/**
 * FlashList Component Wrapper
 * Uses @shopify/flash-list - 10x faster than FlatList
 * 
 * Why FlashList?
 * - Shopify developed it to handle their massive product catalogs
 * - Uses cell recycling (like native iOS/Android lists)
 * - 10x better scroll performance
 * - Automatic layout caching
 * - Better memory management
 */

import React, {useCallback, useMemo, memo} from 'react';
import {View, StyleSheet, RefreshControl, Platform} from 'react-native';
import {FlashList, FlashListProps, ListRenderItem} from '@shopify/flash-list';
import {useTheme} from '../../contexts/ThemeContext';
import {Haptics} from '../../utils/haptics';

// Use regular FlashList instead of animated version
const AnimatedFlashList = FlashList;

interface PremiumFlashListProps<T> extends Omit<FlashListProps<T>, 'renderItem'> {
  /** Data array */
  data: T[];
  /** Render function for each item */
  renderItem: ListRenderItem<T>;
  /** Pull to refresh handler */
  onRefresh?: () => Promise<void>;
  /** Is currently refreshing */
  refreshing?: boolean;
  /** Empty state component */
  emptyComponent?: React.ReactNode;
  /** Header component */
  headerComponent?: React.ReactNode;
  /** Footer component */
  footerComponent?: React.ReactNode;
  /** Item separator */
  itemSeparator?: React.ReactNode;
  /** Enable scroll animation tracking */
  onScrollY?: (scrollY: number) => void;
}

function PremiumFlashListInner<T>({
  data,
  renderItem,
  onRefresh,
  refreshing = false,
  emptyComponent,
  headerComponent,
  footerComponent,
  itemSeparator,
  onScrollY,
  ...props
}: PremiumFlashListProps<T>) {
  const {colors} = useTheme();

  // Handle refresh with haptic
  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    
    Haptics.refreshThreshold();
    try {
      await onRefresh();
      Haptics.success();
    } catch (error) {
      Haptics.error();
    }
  }, [onRefresh]);

  // Key extractor
  const keyExtractor = useCallback((item: T, index: number) => {
    if (typeof item === 'object' && item !== null) {
      if ('id' in item) return String((item as any).id);
      if ('short_name' in item) return String((item as any).short_name);
      if ('_id' in item) return String((item as any)._id);
    }
    return `item-${index}`;
  }, []);

  // Memoized components
  const ListEmptyComponent = useMemo(() => {
    if (!emptyComponent) return null;
    return <View style={styles.emptyContainer}>{emptyComponent}</View>;
  }, [emptyComponent]);

  const ListHeaderComponent = useMemo(() => {
    if (!headerComponent) return null;
    return <View>{headerComponent}</View>;
  }, [headerComponent]);

  const ListFooterComponent = useMemo(() => {
    if (!footerComponent) return null;
    return <View>{footerComponent}</View>;
  }, [footerComponent]);

  const ItemSeparatorComponent = useMemo(() => {
    if (!itemSeparator) return undefined;
    return () => <View>{itemSeparator}</View>;
  }, [itemSeparator]);

  // Refresh control
  const refreshControl = useMemo(() => {
    if (!onRefresh) return undefined;

    return (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        tintColor={colors.primary}
        colors={[colors.primary]}
        progressBackgroundColor={colors.card}
      />
    );
  }, [onRefresh, refreshing, handleRefresh, colors]);

  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ItemSeparatorComponent={ItemSeparatorComponent}
      refreshControl={refreshControl}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      // Performance optimizations
      estimatedItemSize={120}
      drawDistance={500}
      {...props}
    />
  );
}

// Memoized export with generic support
const PremiumFlashList = memo(PremiumFlashListInner) as typeof PremiumFlashListInner;

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
  },
});

export default PremiumFlashList;
export {FlashList, AnimatedFlashList};
export type {FlashListProps, ListRenderItem};
