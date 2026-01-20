/**
 * AnimatedList Component
 * High-performance animated FlatList with parallax, staggered items, and smooth scrolling
 * 
 * Features:
 * - Staggered entrance animations
 * - Header parallax effects
 * - Smooth scroll-linked animations
 * - Pull-to-refresh with custom animation
 * - Item press animations
 */

import React, {useCallback, useRef, useMemo, memo} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  FlatListProps,
  Platform,
  RefreshControl,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import {useTheme} from '../../contexts/ThemeContext';
import {SPRING_CONFIGS} from '../../hooks/useGestureAnimation';
import {Haptics} from '../../utils/haptics';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

interface ParallaxHeaderProps {
  height: number;
  children: React.ReactNode;
  scrollY: Animated.SharedValue<number>;
}

export const ParallaxHeader: React.FC<ParallaxHeaderProps> = memo(({
  height,
  children,
  scrollY,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [-height, 0, height],
      [-height / 2, 0, height * 0.4],
      Extrapolate.CLAMP
    );
    
    const scale = interpolate(
      scrollY.value,
      [-height, 0, height],
      [1.5, 1, 0.9],
      Extrapolate.CLAMP
    );
    
    const opacity = interpolate(
      scrollY.value,
      [0, height * 0.5, height],
      [1, 0.8, 0],
      Extrapolate.CLAMP
    );

    return {
      height,
      transform: [{translateY}, {scale}],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.parallaxHeader, animatedStyle]}>
      {children}
    </Animated.View>
  );
});

interface AnimatedListItemProps {
  index: number;
  children: React.ReactNode;
  scrollY: Animated.SharedValue<number>;
  enableEntrance?: boolean;
  staggerDelay?: number;
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = memo(({
  index,
  children,
  scrollY,
  enableEntrance = true,
  staggerDelay = 50,
}) => {
  const entranceProgress = useSharedValue(enableEntrance ? 0 : 1);
  const hasAnimated = useRef(false);

  // Trigger entrance animation
  if (enableEntrance && !hasAnimated.current) {
    hasAnimated.current = true;
    setTimeout(() => {
      entranceProgress.value = withSpring(1, SPRING_CONFIGS.gentle);
    }, index * staggerDelay);
  }

  const animatedStyle = useAnimatedStyle(() => {
    const baseOpacity = entranceProgress.value;
    const baseTranslateY = (1 - entranceProgress.value) * 30;
    const baseScale = 0.95 + entranceProgress.value * 0.05;

    return {
      opacity: baseOpacity,
      transform: [
        {translateY: baseTranslateY},
        {scale: baseScale},
      ],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
});

interface AnimatedListProps<T> extends Omit<FlatListProps<T>, 'data' | 'renderItem'> {
  data: T[];
  renderItem: (info: {item: T; index: number; scrollY: Animated.SharedValue<number>}) => React.ReactElement | null;
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
  const scrollY = useSharedValue(0);
  const isRefreshing = useSharedValue(false);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    
    isRefreshing.value = true;
    Haptics.refreshThreshold();
    
    try {
      await onRefresh();
      Haptics.success();
    } catch (error) {
      Haptics.error();
    } finally {
      isRefreshing.value = false;
    }
  }, [onRefresh]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const keyExtractor = useCallback((item: T, index: number) => {
    if (typeof item === 'object' && item !== null) {
      if ('id' in item) return String((item as any).id);
      if ('short_name' in item) return String((item as any).short_name);
    }
    return `item-${index}`;
  }, []);

  const renderItemWrapper = useCallback(
    ({item, index}: {item: T; index: number}) => {
      const element = renderItem({item, index, scrollY});
      
      if (!element) return null;

      if (enableStaggeredAnimation) {
        return (
          <AnimatedListItem
            index={index}
            scrollY={scrollY}
            staggerDelay={staggerDelay}
            enableEntrance={index < 15} // Only animate first 15 items
          >
            {element}
          </AnimatedListItem>
        );
      }

      return element;
    },
    [renderItem, scrollY, enableStaggeredAnimation, staggerDelay]
  );

  const ListHeaderComponent = useMemo(() => {
    if (!headerComponent) return null;

    if (enableParallaxHeader) {
      return (
        <ParallaxHeader height={headerHeight} scrollY={scrollY}>
          {headerComponent}
        </ParallaxHeader>
      );
    }

    return <View style={{height: headerHeight}}>{headerComponent}</View>;
  }, [headerComponent, enableParallaxHeader, headerHeight, scrollY]);

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
    <AnimatedFlatList
      data={data as any}
      renderItem={renderItemWrapper as any}
      keyExtractor={keyExtractor as any}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
      removeClippedSubviews={Platform.OS === 'android'}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      {...(flatListProps as any)}
    />
  );
}

// Forward ref with generic type support
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
