/**
 * UniversityCard - Card showing university info with logo, ranking, favorite
 */

import React, {useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS, ANIMATION} from '../../constants/design';
import {ANIMATION_SCALES} from '../../constants/ui';
import {Icon} from '../icons';
import UniversityLogo from '../UniversityLogo';
import {getUniversityBrandColor} from '../../utils/universityLogos';
import type {UniversityData} from '../../data';

interface Props {
  item: UniversityData;
  onPress: () => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
  colors: any;
  isDark: boolean;
  index: number;
}

const UniversityCard = ({item, onPress, onToggleFavorite, isFavorite, colors, isDark, index}: Props) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: index * 50,
        ...ANIMATION.spring.gentle,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: ANIMATION_SCALES.PRESS,
      ...ANIMATION.spring.snappy,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      ...ANIMATION.spring.snappy,
      useNativeDriver: true,
    }).start();
  };

  const getRankColor = (rank: number | undefined) => {
    if (!rank) return [colors.primary, colors.primaryLight];
    if (rank === 1) return ['#FFD700', '#FFA500'];
    if (rank === 2) return ['#C0C0C0', '#A0A0A0'];
    if (rank === 3) return ['#CD7F32', '#8B4513'];
    if (rank <= 10) return [colors.primary, colors.secondary];
    return [colors.primary, colors.primaryLight];
  };

  const handleWebsitePress = useCallback(
    (e: any) => {
      e.stopPropagation();
      if (item.website) {
        const url = item.website.startsWith('http') ? item.website : `https://${item.website}`;
        Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open website'));
      }
    },
    [item.website],
  );

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{scale: scaleAnim}, {translateY: slideAnim}],
      }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${item.type} university in ${item.city}${
          item.ranking_national ? `, ranked number ${item.ranking_national} nationally` : ''
        }`}
        accessibilityHint="Double tap to view university details">
        <View style={[styles.card, {backgroundColor: colors.card}]}>
          {/* Header Row */}
          <View style={styles.header}>
            {item.logo_url ? (
              <View style={[styles.logoContainer, {backgroundColor: colors.background}]}>
                <UniversityLogo
                  shortName={item.short_name}
                  universityName={item.name}
                  logoUrl={item.logo_url}
                  size={44}
                  style={styles.logo}
                />
              </View>
            ) : null}

            <View style={styles.info}>
              <Text style={[styles.name, {color: colors.text}]} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.shortNameRow}>
                <Text
                  style={[
                    styles.shortName,
                    {color: getUniversityBrandColor(item.name) || colors.primary},
                  ]}>
                  {item.short_name}
                </Text>
                {item.type ? (
                  <View
                    style={[
                      styles.typeBadge,
                      {backgroundColor: item.type === 'public' ? `${colors.success}15` : `${colors.primary}15`},
                    ]}>
                    <Text
                      style={[
                        styles.typeBadgeText,
                        {color: item.type === 'public' ? colors.success : colors.primary},
                      ]}>
                      {item.type.toUpperCase()}
                    </Text>
                  </View>
                ) : null}
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
                <LinearGradient colors={getRankColor(item.ranking_national)} style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{item.ranking_national}</Text>
                </LinearGradient>
              )}
              <TouchableOpacity
                style={[styles.favoriteBtn, {backgroundColor: isFavorite ? '#FEE2E2' : colors.background}]}
                onPress={e => {
                  e.stopPropagation();
                  onToggleFavorite(item.short_name);
                }}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                accessibilityRole="button"
                accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                <Icon
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  family="Ionicons"
                  size={18}
                  color={isFavorite ? '#EF4444' : colors.textSecondary}
                />
              </TouchableOpacity>
              <Icon name="chevron-forward" family="Ionicons" size={20} color={colors.textSecondary} />
            </View>
          </View>

          {/* Details Row */}
          <View style={styles.details}>
            {item.city ? (
              <View style={styles.detailItem}>
                <Icon name="location" family="Ionicons" size={12} color={colors.primary} />
                <Text style={[styles.detailText, {color: colors.text}]}>{item.city}</Text>
              </View>
            ) : null}
            {item.established_year ? (
              <View style={styles.detailItem}>
                <Icon name="calendar" family="Ionicons" size={12} color={colors.primary} />
                <Text style={[styles.detailText, {color: colors.text}]}>{item.established_year}</Text>
              </View>
            ) : null}
            {item.campuses && item.campuses.length > 1 && (
              <View style={styles.detailItem}>
                <Icon name="business" family="Ionicons" size={12} color={colors.primary} />
                <Text style={[styles.detailText, {color: colors.text}]}>
                  {item.campuses.length} Campuses
                </Text>
              </View>
            )}
          </View>

          {/* Website */}
          {item.website && (
            <View style={styles.websiteRow}>
              <TouchableOpacity
                style={[styles.websiteButton, {backgroundColor: `${colors.primary}10`}]}
                onPress={handleWebsitePress}
                accessibilityRole="link"
                accessibilityLabel={`Visit ${item.name} website`}>
                <Icon name="globe-outline" family="Ionicons" size={12} color={colors.primary} />
                <Text style={[styles.websiteText, {color: colors.primary}]} numberOfLines={1}>
                  {item.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  logo: {
    borderRadius: RADIUS.md,
  },
  info: {
    flex: 1,
    marginLeft: SPACING.xs,
  },
  name: {
    fontSize: TYPOGRAPHY.sizes.md - 1,
    fontWeight: TYPOGRAPHY.weight.semibold,
    lineHeight: 20,
  },
  shortNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: 2,
  },
  shortName: {
    fontSize: TYPOGRAPHY.sizes.sm - 1,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  typeBadge: {
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 1,
    borderRadius: RADIUS.xs,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  hecBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 1,
    borderRadius: RADIUS.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  hecText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  rankBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.sm,
  },
  rankText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFFFFF',
  },
  favoriteBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.xs + 2,
    paddingTop: SPACING.xs,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  detailText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  websiteRow: {
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  websiteText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
});

export default UniversityCard;
