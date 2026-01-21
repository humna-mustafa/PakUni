/**
 * AnimatedList Component
 * Simple FlatList with entrance animations
 */

import React, {useCallback, useRef, useMemo, memo} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  FlatListProps,
  Platform,
  RefreshControl,
  Animated,
} from 'react-native';
import {useTheme} from '../../contexts/ThemeContext';
import {Haptics} from '../../utils/haptics';

interface AnimatedListItemProps {
  index: number;
  children: React.ReactNode;
  enableEntrance?: boolean;
  staggerDelay?: number;
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = memo(({
  index,
  children,
  enableEntrance = true,
  staggerDelay = 50,
}) => {
  const fadeAnim = useRef(new Animated.Value(enableEntrance ? 0 : 1)).current;
  const translateAnim = useRef(new Animated.Value(enableEntrance ? 30 : 0)).current;
  const hasAnimated = useRef(false);

  if (enableEntrance && !hasAnimated.current) {
    hasAnimated.current = true;
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateAnim, {
          toValue: 0,
          useNativeDriver: true,
          speed: 12,
          bounciness: 6,
        }),
      ]).start();
    }, Math.min(index * staggerDelay, 500));
  }

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{translateY: translateAnim}],
      }}>
      {children}
    </Animated.View>
  );
});

interface ParallaxHeaderProps {
  height: number;
  children: React.ReactNode;
  scrollY?: any;
}

export const ParallaxHeader: React.FC<ParallaxHeaderProps> = memo(({
  height,
  children,
}) => {
  return (
    <View style={[styles.parallaxHeader, {height}]}>
      {children}
    </View>
  );
});

interface AnimatedListProps<T> extends Omit<FlatListProps<T>, 'data' | 'renderItem'> {
  data: T[];
  renderItem: (info: {item: T; index: number; scrollY?: any}) => React.ReactElement | null;
  headerComponent?: React.ReactNode;
  headerHeight?: number;
  enableParallaxHeader?: boolean;
  enableStaggeredAnimation?: boolean;
  staggerDelay?: number;
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
  emptyComponent?: React.ReactNode;
}

function AnimatedListInner<T>(
  {
    data,
    renderItem,
    headerComponent,
    headerHeight = 200,
    enableParallaxHeader = false,
    enableStaggeredAnimation = true,
    staggerDelay = 50,
    onRefresh,
    refreshing = false,
    emptyComponent,
    ...flatListProps
  }: AnimatedListProps<T>,
  ref: React.Ref<FlatList<T>>
) {
  const {colors} = useTheme();

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    Haptics.medium();
    try {
      await onRefresh();
      Haptics.success();
    } catch (error) {
      Haptics.error();
    }
  }, [onRefresh]);

  const keyExtractor = useCallback((item: T, index: number) => {
    if (typeof item === 'object' && item !== null) {
      if ('id' in item) return String((item as any).id);
      if ('short_name' in item) return String((item as any).short_name);
    }
    return `item-${index}`;
  }, []);

  const renderItemWrapper = useCallback(
    ({item, index}: {item: T; index: number}) => {
      const element = renderItem({item, index});
      if (!element) return null;

      if (enableStaggeredAnimation) {
        return (
          <AnimatedListItem
            index={index}
            staggerDelay={staggerDelay}
            enableEntrance={index < 15}>
            {element}
          </AnimatedListItem>
        );
      }
      return element;
    },
    [renderItem, enableStaggeredAnimation, staggerDelay]
  );

  const ListHeaderComponent = useMemo(() => {
    if (!headerComponent) return null;
    if (enableParallaxHeader) {
      return <ParallaxHeader height={headerHeight}>{headerComponent}</ParallaxHeader>;
    }
    return <View style={{height: headerHeight}}>{headerComponent}</View>;
  }, [headerComponent, enableParallaxHeader, headerHeight]);

  const ListEmptyComponent = useMemo(() => {
    if (!emptyComponent) return null;
    return <View style={styles.emptyContainer}>{emptyComponent}</View>;
  }, [emptyComponent]);

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
    <FlatList
      ref={ref}
      data={data}
      renderItem={renderItemWrapper}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
      removeClippedSubviews={Platform.OS === 'android'}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      {...flatListProps}
    />
  );
}

const AnimatedList = React.forwardRef(AnimatedListInner) as <T>(
  props: AnimatedListProps<T> & {ref?: React.Ref<FlatList<T>>}
) => React.ReactElement | null;

const styles = StyleSheet.create({
  parallaxHeader: {
    overflow: 'hidden',
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
  },
});

export default AnimatedList;
