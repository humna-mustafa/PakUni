/**
 * Special Occasion Card Component
 * Displays birthday wishes, exam day messages, and motivational content
 */

import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../icons';
import {TYPOGRAPHY, RADIUS, SPACING} from '../../constants/design';
import type {SpecialOccasion} from '../../services/specialOccasions';

// ============================================================================
// TYPES
// ============================================================================

interface SpecialOccasionCardProps {
  occasion: SpecialOccasion;
  onDismiss?: () => void;
  onAction?: () => void;
}

// ============================================================================
// CONFETTI ANIMATION
// ============================================================================

const ConfettiPiece = ({
  delay,
  startX,
  emoji,
}: {
  delay: number;
  startX: number;
  emoji: string;
}) => {
  const fallAnim = useRef(new Animated.Value(-30)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(fallAnim, {
            toValue: 200,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 2500,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.timing(fallAnim, {
          toValue: -30,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          left: startX,
          transform: [
            {translateY: fallAnim},
            {
              rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
          opacity: opacityAnim,
        },
      ]}>
      <Text style={styles.confettiEmoji}>{emoji}</Text>
    </Animated.View>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SpecialOccasionCard: React.FC<SpecialOccasionCardProps> = ({
  occasion,
  onDismiss,
  onAction,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  const showConfetti = occasion.type === 'birthday';
  const confettiEmojis = ['🎉', '✨', '🎊', '⭐', '🌟', '🎈'];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{scale: scaleAnim}],
          opacity: opacityAnim,
        },
      ]}>
      <LinearGradient
        colors={occasion.gradientColors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradient}>
        {/* Confetti for birthday */}
        {showConfetti && (
          <>
            {confettiEmojis.map((emoji, i) => (
              <ConfettiPiece
                key={i}
                delay={i * 300}
                startX={20 + i * 50}
                emoji={emoji}
              />
            ))}
          </>
        )}

        {/* Decorative circles */}
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />

        {/* Close button */}
        {onDismiss && (
          <TouchableOpacity style={styles.closeBtn} onPress={handleDismiss}>
            <Icon name="close" family="Ionicons" size={18} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Main emoji */}
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>{occasion.emoji}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{occasion.title}</Text>

          {/* Message */}
          <Text style={styles.message}>{occasion.message}</Text>

          {/* Action button */}
          {occasion.actionLabel && onAction && (
            <TouchableOpacity style={styles.actionBtn} onPress={onAction}>
              <Text style={styles.actionBtnText}>{occasion.actionLabel}</Text>
              <Icon name="arrow-forward" family="Ionicons" size={16} color={occasion.gradientColors[0]} />
            </TouchableOpacity>
          )}
        </View>

        {/* PakUni branding */}
        <View style={styles.branding}>
          <Icon name="school-outline" family="Ionicons" size={14} color="rgba(255,255,255,0.6)" />
          <Text style={[styles.brandingText, {marginLeft: 4}]}>PakUni</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// ============================================================================
// COMPACT VARIANT
// ============================================================================

export const CompactOccasionBanner: React.FC<SpecialOccasionCardProps> = ({
  occasion,
  onDismiss,
  onAction,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 50,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDismiss?.();
    });
  };

  return (
    <Animated.View style={[styles.bannerContainer, {transform: [{translateY: slideAnim}]}]}>
      <LinearGradient
        colors={occasion.gradientColors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.bannerGradient}>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerEmoji}>{occasion.emoji}</Text>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>{occasion.title}</Text>
            <Text style={styles.bannerMessage} numberOfLines={1}>
              {occasion.message}
            </Text>
          </View>
        </View>

        {onAction && (
          <TouchableOpacity style={styles.bannerAction} onPress={onAction}>
            <Text style={styles.bannerActionText}>View</Text>
          </TouchableOpacity>
        )}

        {onDismiss && (
          <TouchableOpacity style={styles.bannerClose} onPress={handleDismiss}>
            <Icon name="close" family="Ionicons" size={16} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Main Card
  container: {
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  gradient: {
    padding: SPACING.xl,
    paddingTop: SPACING.xxl,
    position: 'relative',
    overflow: 'hidden',
  },
  decoCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  decoCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  confetti: {
    position: 'absolute',
    top: 0,
    zIndex: 10,
  },
  confettiEmoji: {
    fontSize: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  content: {
    alignItems: 'center',
  },
  emojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  emoji: {
    fontSize: 40,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
  },
  message: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  actionBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    color: '#1F2937',
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  brandingText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },

  // Banner variant
  bannerContainer: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  bannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerEmoji: {
    fontSize: 28,
    marginRight: SPACING.sm,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bannerMessage: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  bannerAction: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginRight: SPACING.xs,
  },
  bannerActionText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bannerClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SpecialOccasionCard;
