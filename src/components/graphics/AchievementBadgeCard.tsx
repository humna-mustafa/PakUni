/**
 * Achievement Badge Card Component
 * Beautiful shareable badge cards for social media
 */

import React, {forwardRef} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {TYPOGRAPHY, RADIUS, SPACING} from '../../constants/design';
import type {Badge, BadgeRarity} from '../../services/achievements';

// ============================================================================
// TYPES
// ============================================================================

interface AchievementBadgeCardProps {
  badge: Badge;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  onShare?: () => void;
  isLocked?: boolean;
  showShareButton?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getRarityInfo = (rarity: BadgeRarity) => {
  switch (rarity) {
    case 'legendary':
      return {label: 'LEGENDARY', colors: ['#FFD700', '#FFA500'], textColor: '#000'};
    case 'epic':
      return {label: 'EPIC', colors: ['#9333EA', '#7C3AED'], textColor: '#FFF'};
    case 'rare':
      return {label: 'RARE', colors: ['#3B82F6', '#2563EB'], textColor: '#FFF'};
    default:
      return {label: 'COMMON', colors: ['#6B7280', '#4B5563'], textColor: '#FFF'};
  }
};

// ============================================================================
// SMALL BADGE - For grids and lists
// ============================================================================

const SmallBadge = forwardRef<View, AchievementBadgeCardProps>(
  ({badge, onPress, isLocked}, ref) => {
    const rarityInfo = getRarityInfo(badge.rarity);

    return (
      <TouchableOpacity
        activeOpacity={onPress ? 0.8 : 1}
        onPress={onPress}
        style={[styles.smallContainer, isLocked && styles.lockedContainer]}>
        <LinearGradient
          colors={isLocked ? ['#374151', '#1F2937'] : badge.gradientColors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.smallGradient}>
          <Text style={styles.smallIcon}>{isLocked ? '🔒' : badge.icon}</Text>
        </LinearGradient>
        <Text style={[styles.smallName, isLocked && styles.lockedText]} numberOfLines={2}>
          {badge.name}
        </Text>
      </TouchableOpacity>
    );
  },
);

// ============================================================================
// MEDIUM BADGE - For lists with more detail
// ============================================================================

const MediumBadge = forwardRef<View, AchievementBadgeCardProps>(
  ({badge, onPress, onShare, isLocked, showShareButton}, ref) => {
    const rarityInfo = getRarityInfo(badge.rarity);

    return (
      <TouchableOpacity
        activeOpacity={onPress ? 0.8 : 1}
        onPress={onPress}
        style={[styles.mediumContainer, isLocked && styles.lockedContainer]}>
        <LinearGradient
          colors={isLocked ? ['#374151', '#1F2937'] : badge.gradientColors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.mediumIconContainer}>
          <Text style={styles.mediumIcon}>{isLocked ? '🔒' : badge.icon}</Text>
        </LinearGradient>

        <View style={styles.mediumContent}>
          <View style={styles.mediumHeader}>
            <Text style={[styles.mediumName, isLocked && styles.lockedText]} numberOfLines={1}>
              {badge.name}
            </Text>
            <View style={[styles.rarityBadge, {backgroundColor: rarityInfo.colors[0]}]}>
              <Text style={[styles.rarityText, {color: rarityInfo.textColor}]}>
                {rarityInfo.label}
              </Text>
            </View>
          </View>
          <Text style={[styles.mediumDescription, isLocked && styles.lockedText]} numberOfLines={2}>
            {isLocked ? badge.condition : badge.description}
          </Text>
        </View>

        {showShareButton && !isLocked && onShare && (
          <TouchableOpacity style={styles.shareBtn} onPress={onShare}>
            <Text style={styles.shareBtnIcon}>📤</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  },
);

// ============================================================================
// LARGE BADGE - Shareable card for social media
// ============================================================================

const LargeBadge = forwardRef<View, AchievementBadgeCardProps>(
  ({badge, onShare, isLocked}, ref) => {
    const rarityInfo = getRarityInfo(badge.rarity);

    return (
      <View ref={ref} style={styles.largeContainer} collapsable={false}>
        <LinearGradient
          colors={isLocked ? ['#1F2937', '#111827', '#030712'] : [...badge.gradientColors, badge.gradientColors[1]]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.largeGradient}>
          {/* Decorative Elements */}
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />
          <View style={styles.decoCircle3} />
          <View style={styles.decoLines} />

          {/* Header */}
          <View style={styles.largeHeader}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🎓</Text>
            </View>
            <Text style={styles.appBrand}>PakUni</Text>
          </View>

          {/* Badge Icon */}
          <View style={styles.iconWrapper}>
            <View style={styles.iconGlow} />
            <View style={styles.largeIconCircle}>
              <Text style={styles.largeIcon}>{isLocked ? '🔒' : badge.icon}</Text>
            </View>
          </View>

          {/* Badge Info */}
          <View style={styles.badgeInfo}>
            <Text style={styles.achievementLabel}>ACHIEVEMENT UNLOCKED!</Text>
            <Text style={styles.largeName}>{badge.name}</Text>
            <Text style={styles.largeDescription}>{badge.description}</Text>
          </View>

          {/* Rarity Badge */}
          <LinearGradient
            colors={rarityInfo.colors}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.rarityBanner}>
            <View style={styles.rarityBannerContent}>
              <Text style={styles.rarityBannerText}>⭐ {rarityInfo.label} BADGE ⭐</Text>
            </View>
          </LinearGradient>

          {/* Footer */}
          <View style={styles.largeFooter}>
            <Text style={styles.footerText}>🚀 Download PakUni App - Your University Guide!</Text>
          </View>
        </LinearGradient>
      </View>
    );
  },
);

// ============================================================================
// ACCEPTANCE CELEBRATION CARD - "I got into FAST! 🎉"
// ============================================================================

interface AcceptanceCelebrationCardProps {
  universityName: string;
  universityShortName: string;
  programName?: string;
  studentName?: string;
}

export const AcceptanceCelebrationCard = forwardRef<View, AcceptanceCelebrationCardProps>(
  ({universityName, universityShortName, programName, studentName}, ref) => {
    return (
      <View ref={ref} style={styles.celebrationContainer} collapsable={false}>
        <LinearGradient
          colors={['#10B981', '#059669', '#047857']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.celebrationGradient}>
          {/* Confetti Decorations */}
          <View style={[styles.confetti, {top: '10%', left: '5%'}]}>
            <Text style={styles.confettiEmoji}>🎊</Text>
          </View>
          <View style={[styles.confetti, {top: '15%', right: '10%'}]}>
            <Text style={styles.confettiEmoji}>✨</Text>
          </View>
          <View style={[styles.confetti, {top: '25%', left: '15%'}]}>
            <Text style={styles.confettiEmoji}>🌟</Text>
          </View>
          <View style={[styles.confetti, {bottom: '30%', right: '5%'}]}>
            <Text style={styles.confettiEmoji}>🎉</Text>
          </View>

          {/* Header */}
          <View style={styles.celebrationHeader}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🎓</Text>
            </View>
            <Text style={styles.appBrand}>PakUni</Text>
          </View>

          {/* Main Content */}
          <View style={styles.celebrationContent}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationTitle}>ADMISSION SECURED!</Text>
            
            {studentName && (
              <Text style={styles.studentName}>{studentName}</Text>
            )}
            
            <Text style={styles.gotIntoText}>just got into</Text>
            
            <View style={styles.universityBadge}>
              <Text style={styles.universityShortName}>{universityShortName}</Text>
            </View>
            
            <Text style={styles.universityFullName}>{universityName}</Text>
            
            {programName && (
              <View style={styles.programBadge}>
                <Text style={styles.programText}>📚 {programName}</Text>
              </View>
            )}
          </View>

          {/* Celebration Message */}
          <View style={styles.celebrationMessage}>
            <Text style={styles.messageText}>
              🌟 Dreams do come true! Congratulations! 🌟
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.celebrationFooter}>
            <Text style={styles.ctaText}>Calculate your chances on PakUni App! 📱</Text>
          </View>
        </LinearGradient>
      </View>
    );
  },
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AchievementBadgeCard = forwardRef<View, AchievementBadgeCardProps>(
  ({badge, size = 'medium', onPress, onShare, isLocked = false, showShareButton = true}, ref) => {
    switch (size) {
      case 'small':
        return <SmallBadge ref={ref} badge={badge} onPress={onPress} isLocked={isLocked} />;
      case 'large':
        return <LargeBadge ref={ref} badge={badge} onShare={onShare} isLocked={isLocked} />;
      default:
        return (
          <MediumBadge
            ref={ref}
            badge={badge}
            onPress={onPress}
            onShare={onShare}
            isLocked={isLocked}
            showShareButton={showShareButton}
          />
        );
    }
  },
);

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Small Badge Styles
  smallContainer: {
    width: 80,
    alignItems: 'center',
  },
  smallGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  smallIcon: {
    fontSize: 28,
  },
  smallName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1F2937',
  },
  lockedContainer: {
    opacity: 0.6,
  },
  lockedText: {
    color: '#6B7280',
  },

  // Medium Badge Styles
  mediumContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.sm,
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
  mediumIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  mediumIcon: {
    fontSize: 24,
  },
  mediumContent: {
    flex: 1,
  },
  mediumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  mediumName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: '#1F2937',
    marginRight: SPACING.sm,
    flex: 1,
  },
  mediumDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#6B7280',
    lineHeight: 18,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  rarityText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  shareBtnIcon: {
    fontSize: 16,
  },

  // Large Badge Styles
  largeContainer: {
    width: 320,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 10},
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  largeGradient: {
    padding: SPACING.xl,
    paddingBottom: SPACING.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  decoCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decoCircle2: {
    position: 'absolute',
    bottom: 100,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decoCircle3: {
    position: 'absolute',
    top: '40%',
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  decoLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  largeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 18,
  },
  appBrand: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  largeIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  largeIcon: {
    fontSize: 50,
  },
  badgeInfo: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  achievementLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },
  largeName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.xs,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  largeDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  rarityBanner: {
    marginHorizontal: -SPACING.xl,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  rarityBannerContent: {
    alignItems: 'center',
  },
  rarityBannerText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 1,
  },
  largeFooter: {
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  footerText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },

  // Celebration Card Styles
  celebrationContainer: {
    width: 320,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: {width: 0, height: 10},
        shadowOpacity: 0.4,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  celebrationGradient: {
    padding: SPACING.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
  },
  confettiEmoji: {
    fontSize: 24,
  },
  celebrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  celebrationContent: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  celebrationEmoji: {
    fontSize: 60,
    marginBottom: SPACING.sm,
  },
  celebrationTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 3,
    marginBottom: SPACING.md,
  },
  studentName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  gotIntoText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.sm,
  },
  universityBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  universityShortName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  universityFullName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  programBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  programText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  celebrationMessage: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  messageText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  celebrationFooter: {
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  ctaText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
});

export default AchievementBadgeCard;
