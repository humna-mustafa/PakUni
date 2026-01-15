/**
 * Ultra Premium List Components
 * Silky Smooth, Pixel-Perfect List Rendering
 */

import React, { useRef, memo, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  ListRenderItem,
  SectionListData,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import {
  ULTRA_TYPOGRAPHY,
  ULTRA_SPACING,
  ULTRA_RADIUS,
  ULTRA_SHADOWS,
  ULTRA_MOTION,
  ULTRA_A11Y,
  pixelPerfect,
} from '../../constants/ultra-design';
import { UltraSkeletonCard, UltraPulseDots } from './UltraVisualEffects';
import { Haptics } from '../../utils/haptics';

// ============================================================================
// ULTRA LIST ITEM - Professional List Item Component
// ============================================================================

interface UltraListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  chevron?: boolean;
  variant?: 'default' | 'card' | 'inset';
  selected?: boolean;
  highlighted?: boolean;
  compact?: boolean;
  style?: ViewStyle;
}

export const UltraListItem = memo<UltraListItemProps>(({
  title,
  subtitle,
  description,
  leftContent,
  rightContent,
  onPress,
  onLongPress,
  disabled = false,
  chevron = false,
  variant = 'default',
  selected = false,
  highlighted = false,
  compact = false,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowStyle = isDark ? ULTRA_SHADOWS.dark : ULTRA_SHADOWS.light;

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      ...ULTRA_MOTION.spring.snappy,
    }).start();
  }, [disabled, scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...ULTRA_MOTION.spring.default,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    Haptics.light();
    onPress?.();
  }, [disabled, onPress]);

  const handleLongPress = useCallback(() => {
    if (disabled) return;
    Haptics.medium();
    onLongPress?.();
  }, [disabled, onLongPress]);

  const containerStyle = useMemo((): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: compact ? ULTRA_SPACING[3] : ULTRA_SPACING[4],
      paddingHorizontal: ULTRA_SPACING[4],
      opacity: disabled ? 0.5 : 1,
    };

    switch (variant) {
      case 'card':
        return {
          ...base,
          backgroundColor: colors.card,
          borderRadius: ULTRA_RADIUS.lg,
          marginHorizontal: ULTRA_SPACING[4],
          marginBottom: ULTRA_SPACING[2],
          ...shadowStyle.sm,
        };
      case 'inset':
        return {
          ...base,
          backgroundColor: colors.background,
          marginHorizontal: ULTRA_SPACING[4],
          borderRadius: ULTRA_RADIUS.md,
        };
      default:
        return {
          ...base,
          backgroundColor: highlighted ? colors.primaryLight : 'transparent',
        };
    }
  }, [variant, colors, shadowStyle, disabled, highlighted, compact]);

  const content = (
    <Animated.View
      style={[
        containerStyle,
        selected && { backgroundColor: colors.primaryLight },
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      {/* Left Content */}
      {leftContent && (
        <View style={styles.leftContent}>
          {leftContent}
        </View>
      )}

      {/* Main Content */}
      <View style={styles.mainContent}>
        <Text
          style={[
            styles.itemTitle,
            {
              color: colors.text,
              fontSize: compact
                ? ULTRA_TYPOGRAPHY.scale.subhead
                : ULTRA_TYPOGRAPHY.scale.body,
            },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        
        {subtitle && (
          <Text
            style={[
              styles.itemSubtitle,
              { color: colors.textSecondary },
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
        
        {description && (
          <Text
            style={[
              styles.itemDescription,
              { color: colors.textMuted },
            ]}
            numberOfLines={2}
          >
            {description}
          </Text>
        )}
      </View>

      {/* Right Content */}
      {rightContent && (
        <View style={styles.rightContent}>
          {rightContent}
        </View>
      )}

      {/* Chevron */}
      {chevron && onPress && (
        <View style={styles.chevron}>
          <Text style={{ color: colors.textMuted, fontSize: ULTRA_TYPOGRAPHY.scale.body }}>
            ›
          </Text>
        </View>
      )}
    </Animated.View>
  );

  if (onPress || onLongPress) {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled, selected }}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
});

// ============================================================================
// ULTRA SECTION HEADER - Clean Section Headers
// ============================================================================

interface UltraSectionHeaderProps {
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'large' | 'compact';
  style?: ViewStyle;
}

export const UltraSectionHeader = memo<UltraSectionHeaderProps>(({
  title,
  subtitle,
  rightContent,
  actionLabel,
  onAction,
  variant = 'default',
  style,
}) => {
  const { colors } = useTheme();

  const titleSize = useMemo(() => {
    switch (variant) {
      case 'large':
        return ULTRA_TYPOGRAPHY.scale.title2;
      case 'compact':
        return ULTRA_TYPOGRAPHY.scale.subhead;
      default:
        return ULTRA_TYPOGRAPHY.scale.title3;
    }
  }, [variant]);

  const handleAction = useCallback(() => {
    Haptics.light();
    onAction?.();
  }, [onAction]);

  return (
    <View
      style={[
        styles.sectionHeader,
        variant === 'compact' && styles.sectionHeaderCompact,
        style,
      ]}
    >
      <View style={styles.sectionHeaderLeft}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
              fontSize: titleSize,
            },
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              styles.sectionSubtitle,
              { color: colors.textSecondary },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {(rightContent || actionLabel) && (
        <View style={styles.sectionHeaderRight}>
          {rightContent}
          {actionLabel && onAction && (
            <TouchableOpacity onPress={handleAction}>
              <Text
                style={[
                  styles.sectionAction,
                  { color: colors.primary },
                ]}
              >
                {actionLabel}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
});

// ============================================================================
// ULTRA ANIMATED LIST - Smooth Animated FlatList
// ============================================================================

interface UltraAnimatedListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  onRefresh?: () => void;
  refreshing?: boolean;
  loading?: boolean;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement;
  ItemSeparatorComponent?: React.ComponentType<any>;
  contentContainerStyle?: ViewStyle;
  numColumns?: number;
  showsVerticalScrollIndicator?: boolean;
  style?: ViewStyle;
}

export function UltraAnimatedList<T>({
  data,
  renderItem,
  keyExtractor,
  onRefresh,
  refreshing = false,
  loading = false,
  onEndReached,
  onEndReachedThreshold = 0.5,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  ItemSeparatorComponent,
  contentContainerStyle,
  numColumns,
  showsVerticalScrollIndicator = false,
  style,
}: UltraAnimatedListProps<T>) {
  const { colors } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Animated render item wrapper
  const animatedRenderItem = useCallback<ListRenderItem<T>>(
    (info) => {
      const inputRange = [
        -1,
        0,
        info.index * pixelPerfect(100),
        (info.index + 2) * pixelPerfect(100),
      ];

      const opacity = scrollY.interpolate({
        inputRange,
        outputRange: [1, 1, 1, 0.8],
        extrapolate: 'clamp',
      });

      const scale = scrollY.interpolate({
        inputRange,
        outputRange: [1, 1, 1, 0.98],
        extrapolate: 'clamp',
      });

      return (
        <Animated.View
          style={{
            opacity,
            transform: [{ scale }],
          }}
        >
          {renderItem(info)}
        </Animated.View>
      );
    },
    [renderItem, scrollY]
  );

  // Footer with loading indicator
  const FooterComponent = useMemo(() => {
    if (loading && !refreshing) {
      return (
        <View style={styles.footerLoading}>
          <UltraPulseDots />
        </View>
      );
    }
    return ListFooterComponent || null;
  }, [loading, refreshing, ListFooterComponent]);

  // Empty component with skeleton
  const EmptyComponent = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.emptyLoading}>
          {[1, 2, 3].map((i) => (
            <UltraSkeletonCard key={i} style={{ marginBottom: ULTRA_SPACING[3] }} />
          ))}
        </View>
      );
    }
    return ListEmptyComponent || null;
  }, [loading, ListEmptyComponent]);

  return (
    <Animated.FlatList
      data={data}
      renderItem={animatedRenderItem}
      keyExtractor={keyExtractor}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
      scrollEventThrottle={16}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={FooterComponent}
      ListEmptyComponent={EmptyComponent}
      ItemSeparatorComponent={ItemSeparatorComponent}
      contentContainerStyle={[
        styles.listContent,
        contentContainerStyle,
      ]}
      numColumns={numColumns}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      style={style}
      removeClippedSubviews
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={21}
    />
  );
}

// ============================================================================
// ULTRA SECTION LIST - Professional Section List
// ============================================================================

interface UltraSectionListSection<T> {
  title: string;
  subtitle?: string;
  data: T[];
}

interface UltraSectionListProps<T> {
  sections: ReadonlyArray<SectionListData<T>>;
  renderItem: ({ item, index, section }: { item: T; index: number; section: SectionListData<T> }) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  onRefresh?: () => void;
  refreshing?: boolean;
  loading?: boolean;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement;
  ItemSeparatorComponent?: React.ComponentType<any>;
  SectionSeparatorComponent?: React.ComponentType<any>;
  stickySectionHeadersEnabled?: boolean;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
}

export function UltraSectionList<T>({
  sections,
  renderItem,
  keyExtractor,
  onRefresh,
  refreshing = false,
  loading = false,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  ItemSeparatorComponent,
  SectionSeparatorComponent,
  stickySectionHeadersEnabled = true,
  contentContainerStyle,
  style,
}: UltraSectionListProps<T>) {
  const { colors, isDark } = useTheme();

  // Render section header
  const renderSectionHeader = useCallback(
    ({ section }: { section: SectionListData<T> & { subtitle?: string } }) => (
      <View
        style={[
          styles.sectionListHeader,
          { backgroundColor: isDark ? colors.background : colors.card },
        ]}
      >
        <UltraSectionHeader
          title={section.title || ''}
          subtitle={section.subtitle}
          variant="compact"
        />
      </View>
    ),
    [colors, isDark]
  );

  // Footer with loading indicator
  const FooterComponent = useMemo(() => {
    if (loading && !refreshing) {
      return (
        <View style={styles.footerLoading}>
          <UltraPulseDots />
        </View>
      );
    }
    return ListFooterComponent || null;
  }, [loading, refreshing, ListFooterComponent]);

  return (
    <SectionList
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={keyExtractor}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={FooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      ItemSeparatorComponent={ItemSeparatorComponent}
      SectionSeparatorComponent={SectionSeparatorComponent}
      stickySectionHeadersEnabled={stickySectionHeadersEnabled}
      contentContainerStyle={[
        styles.listContent,
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      style={style}
    />
  );
}

// ============================================================================
// ULTRA LIST SEPARATOR - Clean Divider for Lists
// ============================================================================

interface UltraListSeparatorProps {
  inset?: boolean;
  insetLeft?: number;
  style?: ViewStyle;
}

export const UltraListSeparator = memo<UltraListSeparatorProps>(({
  inset = true,
  insetLeft = ULTRA_SPACING[16],
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.separator,
        {
          backgroundColor: colors.border,
          marginLeft: inset ? insetLeft : 0,
        },
        style,
      ]}
    />
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // List Item
  leftContent: {
    marginRight: ULTRA_SPACING[3],
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
  },
  rightContent: {
    marginLeft: ULTRA_SPACING[3],
  },
  chevron: {
    marginLeft: ULTRA_SPACING[2],
  },
  itemTitle: {
    fontWeight: ULTRA_TYPOGRAPHY.weight.medium,
  },
  itemSubtitle: {
    fontSize: ULTRA_TYPOGRAPHY.scale.footnote,
    marginTop: ULTRA_SPACING[0.5],
  },
  itemDescription: {
    fontSize: ULTRA_TYPOGRAPHY.scale.caption,
    marginTop: ULTRA_SPACING[1],
    lineHeight: ULTRA_TYPOGRAPHY.scale.caption * ULTRA_TYPOGRAPHY.lineHeight.relaxed,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: ULTRA_SPACING[4],
    paddingTop: ULTRA_SPACING[6],
    paddingBottom: ULTRA_SPACING[3],
  },
  sectionHeaderCompact: {
    paddingTop: ULTRA_SPACING[4],
    paddingBottom: ULTRA_SPACING[2],
  },
  sectionHeaderLeft: {
    flex: 1,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: ULTRA_TYPOGRAPHY.weight.bold,
    letterSpacing: ULTRA_TYPOGRAPHY.tracking.tight,
  },
  sectionSubtitle: {
    fontSize: ULTRA_TYPOGRAPHY.scale.footnote,
    marginTop: ULTRA_SPACING[0.5],
  },
  sectionAction: {
    fontSize: ULTRA_TYPOGRAPHY.scale.subhead,
    fontWeight: ULTRA_TYPOGRAPHY.weight.semibold,
  },

  // List
  listContent: {
    flexGrow: 1,
  },
  footerLoading: {
    paddingVertical: ULTRA_SPACING[6],
    alignItems: 'center',
  },
  emptyLoading: {
    padding: ULTRA_SPACING[4],
  },

  // Section List
  sectionListHeader: {
    paddingVertical: ULTRA_SPACING[1],
  },

  // Separator
  separator: {
    height: pixelPerfect(1),
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  UltraListItem,
  UltraSectionHeader,
  UltraAnimatedList,
  UltraSectionList,
  UltraListSeparator,
};
