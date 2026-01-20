/**
 * SwipeableUniversityCard Component
 * University card with swipe-to-favorite and swipe-to-compare actions
 * 
 * Features:
 * - Swipe right to add to favorites (heart)
 * - Swipe left to add to compare list
 * - Smooth spring animations
 * - Haptic feedback
 */

import React, {useCallback, memo, useRef, useEffect} from 'react';
import {View, Text, StyleSheet, Image, Platform} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../../contexts/ThemeContext';
import {Icon} from '../icons';
import UniversityLogo from '../UniversityLogo';
import {getUniversityBrandColor} from '../../utils/universityLogos';
import {SwipeableCard} from '../gestures';
import {AnimatedPressable} from '../gestures';
import {SPRING_CONFIGS} from '../../hooks/useGestureAnimation';
import {Haptics} from '../../utils/haptics';
import type {UniversityData} from '../../data';

interface SwipeableUniversityCardProps {
  item: UniversityData;
  index: number;
  onPress: () => void;
  onToggleFavorite: (id: string) => void;
  onAddToCompare?: (id: string) => void;
  isFavorite: boolean;
  isInCompare?: boolean;
  enableSwipe?: boolean;
}

const SwipeableUniversityCard: React.FC<SwipeableUniversityCardProps> = memo(({
  item,
  index,
  onPress,
  onToggleFavorite,
  onAddToCompare,
  isFavorite,
  isInCompare = false,
  enableSwipe = true,
}) => {
  const {colors, isDark} = useTheme();
  
  // Entrance animation
  const entranceProgress = useSharedValue(0);
  
  useEffect(() => {
    const delay = Math.min(index * 50, 500);
    setTimeout(() => {
      entranceProgress.value = withSpring(1, SPRING_CONFIGS.gentle);
    }, delay);
  }, [index]);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: entranceProgress.value,
    transform: [
      {translateY: interpolate(entranceProgress.value, [0, 1], [30, 0])},
      {scale: interpolate(entranceProgress.value, [0, 1], [0.95, 1])},
    ],
  }));

  const handleFavoriteAction = useCallback(() => {
    onToggleFavorite(item.short_name);
  }, [item.short_name, onToggleFavorite]);

  const handleCompareAction = useCallback(() => {
    onAddToCompare?.(item.short_name);
  }, [item.short_name, onAddToCompare]);

  const getRankColors = (rank: number | undefined): [string, string] => {
    if (!rank) return [colors.primary, colors.primaryLight || colors.primary];
    if (rank === 1) return ['#FFD700', '#FFA500'];
    if (rank === 2) return ['#C0C0C0', '#A0A0A0'];
    if (rank === 3) return ['#CD7F32', '#8B4513'];
    if (rank <= 10) return [colors.primary, colors.secondary || colors.primary];
    return [colors.primary, colors.primaryLight || colors.primary];
  };

  const cardContent = (
    <AnimatedPressable
      onPress={onPress}
      hapticFeedback
      scaleOnPress={0.98}
      accessibilityLabel={`${item.name}, ${item.type} university in ${item.city}`}
      accessibilityHint="Double tap to view details, swipe right to favorite, swipe left to compare">
      <View style={[styles.card, {backgroundColor: colors.card}]}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, {backgroundColor: colors.background}]}>
            <UniversityLogo universityName={item.name} size={48} />
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={[styles.name, {color: colors.text}]} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.badgeRow}>
              <Text style={[styles.shortName, {color: getUniversityBrandColor(item.name) || colors.primary}]}>
                {item.short_name}
              </Text>
              <View style={[
                styles.typeBadge,
                {backgroundColor: item.type === 'public' ? `${colors.success}15` : `${colors.primary}15`}
              ]}>
                <Text style={[
                  styles.typeText,
                  {color: item.type === 'public' ? colors.success : colors.primary}
                ]}>
                  {item.type.toUpperCase()}
                </Text>
              </View>
              {item.is_hec_recognized && (
                <View style={[styles.hecBadge, {backgroundColor: `${colors.success}15`}]}>
                  <Icon name="checkmark-circle" family="Ionicons" size={10} color={colors.success} />
                  <Text style={[styles.hecText, {color: colors.success}]}>HEC</Text>
                </View>
              )}
            </View>
          </View>

          {/* Rank Badge */}
          <View style={styles.headerRight}>
            {item.ranking_national && (
              <LinearGradient
                colors={getRankColors(item.ranking_national)}
                style={styles.rankBadge}>
                <Text style={styles.rankText}>#{item.ranking_national}</Text>
              </LinearGradient>
            )}
            {isFavorite && (
              <View style={styles.favoriteIndicator}>
                <Icon name="heart" family="Ionicons" size={16} color="#EF4444" />
              </View>
            )}
          </View>
        </View>

        {/* Details Row */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Icon name="location" family="Ionicons" size={14} color={colors.primary} />
            <Text style={[styles.detailText, {color: colors.textSecondary}]}>{item.city}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="calendar" family="Ionicons" size={14} color={colors.primary} />
            <Text style={[styles.detailText, {color: colors.textSecondary}]}>{item.established_year}</Text>
          </View>
          {item.campuses.length > 1 && (
            <View style={styles.detailItem}>
              <Icon name="business" family="Ionicons" size={14} color={colors.primary} />
              <Text style={[styles.detailText, {color: colors.textSecondary}]}>
                {item.campuses.length} Campuses
              </Text>
            </View>
          )}
        </View>

        {/* Swipe Hint */}
        {enableSwipe && !isFavorite && (
          <View style={styles.swipeHint}>
            <Icon name="swap-horizontal" family="Ionicons" size={12} color={colors.textSecondary} />
            <Text style={[styles.swipeHintText, {color: colors.textSecondary}]}>Swipe for actions</Text>
          </View>
        )}
      </View>
    </AnimatedPressable>
  );

  if (!enableSwipe) {
    return <Animated.View style={entranceStyle}>{cardContent}</Animated.View>;
  }

  return (
    <Animated.View style={entranceStyle}>
      <SwipeableCard
        leftAction={{
          icon: isFavorite ? 'heart-dislike' : 'heart',
          color: '#FFFFFF',
          backgroundColor: isFavorite ? '#6B7280' : '#EF4444',
          onAction: handleFavoriteAction,
          label: isFavorite ? 'Remove' : 'Favorite',
        }}
        rightAction={onAddToCompare ? {
          icon: 'git-compare',
          color: '#FFFFFF',
          backgroundColor: isInCompare ? '#6B7280' : colors.primary,
          onAction: handleCompareAction,
          label: isInCompare ? 'Remove' : 'Compare',
        } : undefined}
        containerStyle={styles.swipeContainer}>
        {cardContent}
      </SwipeableCard>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  swipeContainer: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  shortName: {
    fontSize: 13,
    fontWeight: '700',
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  hecBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hecText: {
    fontSize: 9,
    fontWeight: '600',
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  rankBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  favoriteIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '500',
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
    opacity: 0.5,
  },
  swipeHintText: {
    fontSize: 10,
    fontWeight: '500',
  },
});

export default SwipeableUniversityCard;
