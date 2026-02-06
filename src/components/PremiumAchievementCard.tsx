/**
 * Premium Achievement Card Component
 * 
 * Designer-grade visual cards for social media sharing
 * Features:
 * - Glassmorphism effects
 * - Dynamic gradient backgrounds
 * - Decorative patterns & confetti
 * - Premium typography hierarchy
 * - Social-media optimized (1080x1920 story format)
 * - Brand watermark integration
 * 
 * @version 3.0.0 - Senior Designer Quality
 * @author PakUni Design Team
 */

import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {MyAchievement} from '../services/achievements';
import {Icon} from './icons';
import {
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  PALETTE,
  SHADOWS,
  GRADIENTS,
} from '../constants/design';
import {
  captureAndShareCard,
  captureAndSaveCard,
} from '../services/cardCapture';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ============================================================================
// PREMIUM DESIGN TOKENS
// ============================================================================

const PREMIUM_CARD_CONFIG = {
  merit_list: {
    gradients: {
      primary: ['#FFD700', '#FFA500', '#FF8C00'],
      glow: ['rgba(255, 215, 0, 0.3)', 'rgba(255, 165, 0, 0.1)'],
      accent: '#FFC107',
    },
    icon: '🏆',
    badge: '📜',
    pattern: 'stars',
    title: 'MERIT SUCCESS',
    subtitle: 'Your Score is Ready!',
    accentColor: '#FF8C00',
    textColor: '#1D2127',
    glowColor: 'rgba(255, 193, 7, 0.4)',
  },
  admission: {
    gradients: {
      primary: ['#00D4AA', '#00B894', '#009973'],
      glow: ['rgba(0, 212, 170, 0.3)', 'rgba(0, 184, 148, 0.1)'],
      accent: '#00E5B0',
    },
    icon: '🎓',
    badge: '🎉',
    pattern: 'confetti',
    title: 'ADMISSION SECURED',
    subtitle: 'Dreams Coming True!',
    accentColor: '#00B894',
    textColor: '#1D2127',
    glowColor: 'rgba(0, 184, 148, 0.4)',
  },
  entry_test: {
    gradients: {
      primary: ['#667eea', '#764ba2', '#8E54E9'],
      glow: ['rgba(102, 126, 234, 0.3)', 'rgba(118, 75, 162, 0.1)'],
      accent: '#3660C9',
    },
    icon: '✅',
    badge: '📝',
    pattern: 'waves',
    title: 'TEST COMPLETED',
    subtitle: 'One Step Closer to Success!',
    accentColor: '#3660C9',
    textColor: '#1D2127',
    glowColor: 'rgba(124, 58, 237, 0.4)',
  },
  scholarship: {
    gradients: {
      primary: ['#F093FB', '#F5576C', '#FF6B6B'],
      glow: ['rgba(240, 147, 251, 0.3)', 'rgba(245, 87, 108, 0.1)'],
      accent: '#4573DF',
    },
    icon: '💎',
    badge: '🏅',
    pattern: 'diamonds',
    title: 'SCHOLARSHIP WON',
    subtitle: 'Financial Freedom Achieved!',
    accentColor: '#4573DF',
    textColor: '#1D2127',
    glowColor: 'rgba(236, 72, 153, 0.4)',
  },
  result: {
    gradients: {
      primary: ['#4573DF', '#3660C9', '#2A4FA8'],
      glow: ['rgba(69, 115, 223, 0.3)', 'rgba(54, 96, 201, 0.1)'],
      accent: '#4573DF',
    },
    icon: '📊',
    badge: '⭐',
    pattern: 'dots',
    title: 'RESULT ACHIEVED',
    subtitle: 'Excellence Unlocked!',
    accentColor: '#4573DF',
    textColor: '#1D2127',
    glowColor: 'rgba(69, 115, 223, 0.4)',
  },
  custom: {
    gradients: {
      primary: ['#667eea', '#764ba2'],
      glow: ['rgba(102, 126, 234, 0.3)', 'rgba(118, 75, 162, 0.1)'],
      accent: '#4573DF',
    },
    icon: '⭐',
    badge: '🌟',
    pattern: 'circles',
    title: 'ACHIEVEMENT',
    subtitle: 'Milestone Reached!',
    accentColor: '#4573DF',
    textColor: '#1D2127',
    glowColor: 'rgba(107, 147, 240, 0.4)',
  },
};

// ============================================================================
// DECORATIVE COMPONENTS
// ============================================================================

/**
 * Floating confetti/celebration particles
 */
const ConfettiPattern: React.FC<{color: string}> = ({color}) => (
  <View style={decorStyles.confettiContainer}>
    {/* Row 1 */}
    <View style={[decorStyles.confetti, {backgroundColor: color, top: 15, left: 20, transform: [{rotate: '25deg'}]}]} />
    <View style={[decorStyles.confetti, {backgroundColor: '#fff', opacity: 0.4, top: 30, left: 80, transform: [{rotate: '-15deg'}]}]} />
    <View style={[decorStyles.confettiCircle, {backgroundColor: color, top: 50, right: 40}]} />
    <View style={[decorStyles.confetti, {backgroundColor: '#fff', opacity: 0.5, top: 20, right: 90, transform: [{rotate: '45deg'}]}]} />
    
    {/* Row 2 */}
    <View style={[decorStyles.confettiCircle, {backgroundColor: '#fff', opacity: 0.3, top: 80, left: 45}]} />
    <View style={[decorStyles.confetti, {backgroundColor: color, top: 70, right: 25, transform: [{rotate: '-30deg'}]}]} />
    <View style={[decorStyles.confettiStar, {top: 55, left: 60}]}>
      <Text style={{fontSize: 12, color: '#fff', opacity: 0.6}}>✦</Text>
    </View>
    
    {/* Floating dots */}
    <View style={[decorStyles.glowDot, {backgroundColor: '#fff', top: 35, left: 50}]} />
    <View style={[decorStyles.glowDot, {backgroundColor: color, top: 60, right: 70, width: 6, height: 6}]} />
    <View style={[decorStyles.glowDot, {backgroundColor: '#fff', opacity: 0.4, top: 85, left: 30, width: 4, height: 4}]} />
  </View>
);

/**
 * Decorative star burst pattern
 */
const StarBurstPattern: React.FC<{color: string}> = ({color}) => (
  <View style={decorStyles.starBurstContainer}>
    <Text style={[decorStyles.starChar, {top: 10, left: 15, fontSize: 16}]}>✦</Text>
    <Text style={[decorStyles.starChar, {top: 40, right: 25, fontSize: 20, opacity: 0.6}]}>★</Text>
    <Text style={[decorStyles.starChar, {top: 70, left: 50, fontSize: 14, opacity: 0.4}]}>✧</Text>
    <Text style={[decorStyles.starChar, {top: 25, right: 80, fontSize: 12}]}>⭐</Text>
    <Text style={[decorStyles.starChar, {top: 60, right: 60, fontSize: 10, opacity: 0.5}]}>✦</Text>
    <View style={[decorStyles.glowDot, {backgroundColor: '#fff', top: 45, left: 25}]} />
    <View style={[decorStyles.glowDot, {backgroundColor: color, top: 80, right: 40, width: 6, height: 6}]} />
  </View>
);

/**
 * Diamond luxury pattern
 */
const DiamondPattern: React.FC<{color: string}> = ({color}) => (
  <View style={decorStyles.diamondContainer}>
    <Text style={[decorStyles.diamondChar, {top: 15, left: 20, fontSize: 18}]}>◆</Text>
    <Text style={[decorStyles.diamondChar, {top: 45, right: 30, fontSize: 14, opacity: 0.5}]}>◇</Text>
    <Text style={[decorStyles.diamondChar, {top: 20, right: 75, fontSize: 12}]}>✦</Text>
    <Text style={[decorStyles.diamondChar, {top: 65, left: 45, fontSize: 10, opacity: 0.4}]}>◆</Text>
    <View style={[decorStyles.glowDot, {backgroundColor: color, top: 35, left: 60}]} />
    <View style={[decorStyles.glowDot, {backgroundColor: '#fff', opacity: 0.5, top: 55, right: 55}]} />
  </View>
);

/**
 * Glassmorphism card background
 */
const GlassBackground: React.FC<{children: React.ReactNode}> = ({children}) => (
  <View style={glassStyles.glassCard}>
    <View style={glassStyles.glassInner}>
      {children}
    </View>
  </View>
);

/**
 * Premium stat box with glow effect
 */
const StatBox: React.FC<{
  label: string;
  value: string;
  color: string;
  icon?: string;
}> = ({label, value, color, icon}) => (
  <View style={[statStyles.container, {borderColor: `${color}40`}]}>
    <LinearGradient
      colors={[`${color}15`, `${color}05`]}
      style={statStyles.gradient}
    >
      {icon && <Text style={statStyles.icon}>{icon}</Text>}
      <Text style={statStyles.label}>{label}</Text>
      <Text style={[statStyles.value, {color}]}>{value}</Text>
    </LinearGradient>
  </View>
);

/**
 * Animated celebration badge
 */
const CelebrationBadge: React.FC<{emoji: string; text: string; color: string}> = ({
  emoji,
  text,
  color,
}) => (
  <View style={[badgeStyles.container, {backgroundColor: `${color}15`, borderColor: `${color}30`}]}>
    <Text style={badgeStyles.emoji}>{emoji}</Text>
    <Text style={[badgeStyles.text, {color}]}>{text}</Text>
  </View>
);

// ============================================================================
// MAIN PREMIUM CARD COMPONENT
// ============================================================================

interface PremiumAchievementCardProps {
  achievement: MyAchievement;
  onShareComplete?: (success: boolean) => void;
  onSaveComplete?: (success: boolean, path?: string) => void;
  showSaveButton?: boolean;
  variant?: 'standard' | 'story' | 'compact';
}

/**
 * Premium Designer-Quality Achievement Card
 * 
 * Creates stunning, social-media ready cards with:
 * - Cinematic gradient backgrounds
 * - Floating decorative elements
 * - Glassmorphism effects
 * - Premium typography
 * - Professional branding
 */
export const PremiumAchievementCard: React.FC<PremiumAchievementCardProps> = ({
  achievement,
  onShareComplete,
  onSaveComplete,
  showSaveButton = true,
  variant = 'standard',
}) => {
  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const config = PREMIUM_CARD_CONFIG[achievement.type] || PREMIUM_CARD_CONFIG.custom;

  // Build HONEST share message based on actual performance
  const buildShareMessage = (): string => {
    const baseMessage = (() => {
      switch (achievement.type) {
        case 'merit_list': {
          // Parse percentage for honest messaging
          const percentageStr = achievement.percentage?.replace('%', '') || '0';
          const percentageNum = parseFloat(percentageStr) || 0;
          
          if (percentageNum >= 85) {
            return `🎉 Great achievement at ${achievement.universityName || 'University'}!\n\n📊 Aggregate: ${achievement.percentage || 'Calculated'}\n\n✨ Hard work paying off!\n`;
          } else if (percentageNum >= 70) {
            return `📊 Merit calculated at ${achievement.universityName || 'University'}!\n\n📈 Score: ${achievement.percentage || 'Calculated'}\n\nStrong foundation, working towards my goals!\n`;
          } else if (percentageNum >= 50) {
            return `📈 My merit at ${achievement.universityName || 'University'}!\n\n🎯 Score: ${achievement.percentage || 'Calculated'}\n\nRoom for growth - time to work harder!\n`;
          } else {
            return `🎯 Starting my journey at ${achievement.universityName || 'University'}!\n\n📊 Score: ${achievement.percentage || 'Calculated'}\n\nEvery expert was once a beginner. Hard work ahead!\n`;
          }
        }
        case 'admission':
          return `🎓 ADMISSION SECURED! 🎉\n\n🏛️ ${achievement.universityName || 'University'}\n📚 ${achievement.programName || 'Program'}\n\nAlhamdulillah! Hard work paid off! ✨\n`;
        case 'entry_test':
          return `✅ ${achievement.testName || 'Entry Test'} COMPLETED!\n\n${achievement.score ? `📊 Score: ${achievement.score}\n` : ''}🎯 One step completed in my journey!\n`;
        case 'scholarship':
          return `💎 SCHOLARSHIP WON! 🏅\n\n📝 ${achievement.scholarshipName || 'Scholarship'}\n${achievement.percentage ? `💰 Coverage: ${achievement.percentage}\n` : ''}${achievement.universityName ? `🏛️ At: ${achievement.universityName}\n` : ''}\n`;
        default:
          return `🌟 ${achievement.title}\n\n${achievement.description || ''}\n`;
      }
    })();

    return `${baseMessage}\n#PakUni #Pakistan #Education #2026\n\n📱 Made with PakUni App`;
  };

  const handleShare = async () => {
    if (!cardRef.current) {
      Alert.alert('Please Wait', 'Card is still loading. Try again in a moment.');
      onShareComplete?.(false);
      return;
    }
    
    setIsSharing(true);
    try {
      const result = await captureAndShareCard(
        cardRef,
        achievement.title,
        buildShareMessage()
      );
      if (!result.success && result.error) {
        Alert.alert('Share Failed', result.error);
      }
      onShareComplete?.(result.shared);
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Share Error', 'Unable to share card. Please try again.');
      onShareComplete?.(false);
    } finally {
      setIsSharing(false);
    }
  };

  const handleSave = async () => {
    if (!cardRef.current) {
      Alert.alert('Please Wait', 'Card is still loading. Try again in a moment.');
      onSaveComplete?.(false);
      return;
    }
    
    setIsSaving(true);
    try {
      const fileName = `pakuni_${achievement.type}_${Date.now()}.png`;
      const result = await captureAndSaveCard(cardRef, fileName);
      
      if (result.success) {
        Alert.alert('✅ Saved!', 'Card saved to your gallery.', [{text: 'Great!'}]);
        onSaveComplete?.(true, result.uri);
      } else {
        Alert.alert('Save Failed', result.error || 'Failed to save card');
        onSaveComplete?.(false);
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Save Error', 'Unable to save card. Please try again.');
      onSaveComplete?.(false);
    } finally {
      setIsSaving(false);
    }
  };

  const renderDecoration = () => {
    switch (config.pattern) {
      case 'confetti':
        return <ConfettiPattern color={config.accentColor} />;
      case 'stars':
        return <StarBurstPattern color={config.accentColor} />;
      case 'diamonds':
        return <DiamondPattern color={config.accentColor} />;
      default:
        return <ConfettiPattern color={config.accentColor} />;
    }
  };

  return (
    <View style={premiumStyles.wrapper}>
      {/* Capturable Card */}
      <View ref={cardRef} collapsable={false} style={premiumStyles.cardOuter}>
        <LinearGradient
          colors={config.gradients.primary}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={premiumStyles.gradientBg}
        >
          {/* Decorative pattern overlay */}
          {renderDecoration()}

          {/* Glow overlay at top */}
          <LinearGradient
            colors={config.gradients.glow}
            style={premiumStyles.glowOverlay}
          />

          {/* Main card content */}
          <View style={premiumStyles.cardContent}>
            {/* Top celebration badge */}
            <CelebrationBadge 
              emoji={config.badge}
              text={achievement.title || config.title}
              color="#fff"
            />

            {/* Large icon */}
            <View style={premiumStyles.iconContainer}>
              <View style={premiumStyles.iconGlow}>
                <Text style={premiumStyles.mainIcon}>{config.icon}</Text>
              </View>
            </View>

            {/* Title section */}
            <Text style={premiumStyles.heroTitle}>{achievement.title || config.title}</Text>
            <Text style={premiumStyles.heroSubtitle}>
              {achievement.description || config.subtitle}
            </Text>

            {/* Glass content card */}
            <GlassBackground>
              <View style={premiumStyles.infoContent}>
                {/* Custom achievement description (if title and description both exist) */}
                {achievement.type === 'custom' && achievement.title && achievement.description && (
                  <View style={premiumStyles.infoRow}>
                    <Text style={premiumStyles.infoIcon}>✨</Text>
                    <View style={premiumStyles.infoText}>
                      <Text style={premiumStyles.infoLabel}>Achievement</Text>
                      <Text style={premiumStyles.infoValue}>{achievement.description}</Text>
                    </View>
                  </View>
                )}

                {/* University name */}
                {achievement.universityName && (
                  <View style={premiumStyles.infoRow}>
                    <Text style={premiumStyles.infoIcon}>🏛️</Text>
                    <View style={premiumStyles.infoText}>
                      <Text style={premiumStyles.infoLabel}>University</Text>
                      <Text style={premiumStyles.infoValue}>{achievement.universityName}</Text>
                    </View>
                  </View>
                )}

                {/* Program */}
                {achievement.programName && (
                  <View style={premiumStyles.infoRow}>
                    <Text style={premiumStyles.infoIcon}>📚</Text>
                    <View style={premiumStyles.infoText}>
                      <Text style={premiumStyles.infoLabel}>Program</Text>
                      <Text style={premiumStyles.infoValue}>{achievement.programName}</Text>
                    </View>
                  </View>
                )}

                {/* Test name */}
                {achievement.testName && (
                  <View style={premiumStyles.infoRow}>
                    <Text style={premiumStyles.infoIcon}>📝</Text>
                    <View style={premiumStyles.infoText}>
                      <Text style={premiumStyles.infoLabel}>Test</Text>
                      <Text style={premiumStyles.infoValue}>{achievement.testName}</Text>
                    </View>
                  </View>
                )}

                {/* Scholarship name */}
                {achievement.scholarshipName && (
                  <View style={premiumStyles.infoRow}>
                    <Text style={premiumStyles.infoIcon}>🎖️</Text>
                    <View style={premiumStyles.infoText}>
                      <Text style={premiumStyles.infoLabel}>Scholarship</Text>
                      <Text style={premiumStyles.infoValue}>{achievement.scholarshipName}</Text>
                    </View>
                  </View>
                )}

                {/* Score/Percentage highlight */}
                {(achievement.percentage || achievement.score) && (
                  <View style={premiumStyles.highlightContainer}>
                    <StatBox
                      label={achievement.score ? 'Score' : 'Aggregate'}
                      value={achievement.score || achievement.percentage || ''}
                      color={config.accentColor}
                      icon={achievement.score ? '📊' : '🎯'}
                    />
                  </View>
                )}

                {/* Achievement date */}
                <View style={premiumStyles.dateRow}>
                  <Text style={premiumStyles.dateIcon}>📅</Text>
                  <Text style={premiumStyles.dateText}>
                    {new Date(achievement.date || achievement.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            </GlassBackground>

            {/* Hashtags */}
            <View style={premiumStyles.hashtagRow}>
              <Text style={premiumStyles.hashtags}>
                #PakUni #Pakistan #Education #Success
              </Text>
            </View>

            {/* Branding footer */}
            <View style={premiumStyles.brandingFooter}>
              <View style={premiumStyles.brandingPill}>
                <Text style={premiumStyles.brandingEmoji}>📱</Text>
                <Text style={premiumStyles.brandingText}>PakUni</Text>
                <View style={premiumStyles.brandingDot} />
                <Text style={premiumStyles.brandingUrl}>PakUni App</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Action buttons */}
      <View style={premiumStyles.actionsRow}>
        <TouchableOpacity
          style={[premiumStyles.primaryBtn, {backgroundColor: config.accentColor}]}
          onPress={handleShare}
          disabled={isSharing}
          activeOpacity={0.8}
        >
          {isSharing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Icon name="share-social" family="Ionicons" size={20} color="#fff" />
              <Text style={premiumStyles.primaryBtnText}>Share to Stories</Text>
            </>
          )}
        </TouchableOpacity>

        {showSaveButton && (
          <TouchableOpacity
            style={[premiumStyles.secondaryBtn, {borderColor: config.accentColor}]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={config.accentColor} />
            ) : (
              <Icon name="download-outline" family="Ionicons" size={22} color={config.accentColor} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const decorStyles = StyleSheet.create({
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 14,
    borderRadius: 2,
  },
  confettiCircle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  confettiStar: {
    position: 'absolute',
  },
  glowDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  starBurstContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  starChar: {
    position: 'absolute',
    color: '#fff',
    opacity: 0.7,
  },
  diamondContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  diamondChar: {
    position: 'absolute',
    color: '#fff',
    opacity: 0.6,
  },
});

const glassStyles = StyleSheet.create({
  glassCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginTop: SPACING.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  glassInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    padding: SPACING.lg,
  },
});

const statStyles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 2,
  },
  gradient: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: PALETTE.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xxs,
  },
  value: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.weight.heavy,
    letterSpacing: -0.5,
  },
});

const badgeStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  emoji: {
    fontSize: 16,
  },
  text: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.bold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});

const premiumStyles = StyleSheet.create({
  wrapper: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  cardOuter: {
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    ...SHADOWS.soft.xl,
  },
  gradientBg: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    minHeight: 480,
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  cardContent: {
    flex: 1,
    zIndex: 10,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  iconGlow: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  mainIcon: {
    fontSize: 56,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: SPACING.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  infoContent: {
    gap: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  infoIcon: {
    fontSize: 22,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: PALETTE.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: PALETTE.neutral[800],
    lineHeight: 22,
  },
  highlightContainer: {
    marginTop: SPACING.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: PALETTE.neutral[200],
  },
  dateIcon: {
    fontSize: 16,
  },
  dateText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: PALETTE.neutral[500],
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  hashtagRow: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  hashtags: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: TYPOGRAPHY.weight.semibold,
    textAlign: 'center',
  },
  brandingFooter: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  brandingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  brandingEmoji: {
    fontSize: 14,
  },
  brandingText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#fff',
  },
  brandingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  brandingUrl: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.lg,
    ...SHADOWS.soft.md,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  secondaryBtn: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    backgroundColor: '#fff',
  },
});

// Export types
export type {PremiumAchievementCardProps};
export default PremiumAchievementCard;



