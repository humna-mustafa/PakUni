/**
 * SwipeableUniversityCard Component
 * University card with favorite button
 */

import React, {useCallback, memo, useRef, useEffect} from 'react';
import {View, Text, StyleSheet, Animated, Platform, Pressable} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../../contexts/ThemeContext';
import {Icon} from '../icons';
import UniversityLogo from '../UniversityLogo';
import {getUniversityBrandColor} from '../../utils/universityLogos';
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
  isFavorite,
}) => {
  const {colors} = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const delay = Math.min(index * 50, 500);
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
    }, delay);
  }, [index, fadeAnim, translateAnim]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    Haptics.light();
    onPress();
  }, [onPress]);

  const handleFavoritePress = useCallback(() => {
    Haptics.medium();
    onToggleFavorite(item.short_name);
  }, [item.short_name, onToggleFavorite]);

  const getRankColors = (rank: number | undefined): [string, string] => {
    if (!rank) return [colors.primary, colors.primaryLight || colors.primary];
    if (rank === 1) return ['#FFD700', '#FFA500'];
    if (rank === 2) return ['#C0C0C0', '#A0A0A0'];
    if (rank === 3) return ['#CD7F32', '#8B4513'];
    if (rank <= 10) return [colors.primary, colors.secondary || colors.primary];
    return [colors.primary, colors.primaryLight || colors.primary];
  };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: fadeAnim,
          transform: [{translateY: translateAnim}, {scale: scaleAnim}],
        },
      ]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityLabel={`${item.name}, ${item.type} university in ${item.city}`}
        accessibilityHint="Double tap to view details">
        <View style={[styles.card, {backgroundColor: colors.card}]}>
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

            <View style={styles.headerRight}>
              {item.ranking_national && (
                <LinearGradient
                  colors={getRankColors(item.ranking_national)}
                  style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{item.ranking_national}</Text>
                </LinearGradient>
              )}
              <Pressable
                onPress={handleFavoritePress}
                style={[
                  styles.favoriteButton,
                  {backgroundColor: isFavorite ? '#FEE2E2' : colors.background}
                ]}
                hitSlop={8}>
                <Icon
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  family="Ionicons"
                  size={18}
                  color={isFavorite ? '#EF4444' : colors.textSecondary}
                />
              </Pressable>
            </View>
          </View>

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
        </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginVertical: 6,
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
  favoriteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
});

export default SwipeableUniversityCard;
