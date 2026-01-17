/**
 * EmptyState Component - Material Design 3 (2025) Compliant
 * 
 * Google & FAANG Empty State Best Practices:
 * - Clear, actionable messaging
 * - Subtle illustration/icon (not overwhelming)
 * - Primary action button when applicable
 * - Proper accessibility labels
 * - Animation support (reduced motion aware)
 * 
 * Material 3 Guidelines:
 * - Use secondary text colors
 * - Centered layout with proper spacing
 * - Button follows M3 specs
 */

import React, {useRef, useEffect, memo} from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  ViewStyle,
  TextStyle,
} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {
  CLEAN_SPACING,
  CLEAN_RADIUS,
  CLEAN_MOTION,
  CLEAN_A11Y,
  TEXT_STYLES,
  getSpringConfig,
} from '../constants/clean-design-2025';
import {Icon} from './icons';
import {IconFamily} from './icons/iconMappings';
import {PremiumButton} from './PremiumButton';

type EmptyStateVariant = 'default' | 'search' | 'error' | 'offline' | 'permission' | 'success';

interface EmptyStateProps {
  iconName?: string;
  iconFamily?: IconFamily;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  compact?: boolean;
  variant?: EmptyStateVariant;
  animated?: boolean;
  reducedMotion?: boolean;
  style?: ViewStyle;
  testID?: string;
}

// Preset icons and colors for common variants
const VARIANT_CONFIG: Record<EmptyStateVariant, {icon: string; iconFamily?: IconFamily}> = {
  default: {icon: 'mail-open-outline'},
  search: {icon: 'search-outline'},
  error: {icon: 'alert-circle-outline'},
  offline: {icon: 'cloud-offline-outline'},
  permission: {icon: 'lock-closed-outline'},
  success: {icon: 'checkmark-circle-outline'},
};

export const EmptyState: React.FC<EmptyStateProps> = memo(({
  iconName,
  iconFamily = 'Ionicons',
  title,
  subtitle,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  compact = false,
  variant = 'default',
  animated = true,
  reducedMotion = false,
  style,
  testID,
}) => {
  const {colors, isDark} = useTheme();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const iconBounce = useRef(new Animated.Value(0)).current;

  // Entry animation
  useEffect(() => {
    if (!animated || reducedMotion) {
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
      return;
    }

    const springConfig = getSpringConfig('gentle', reducedMotion);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: CLEAN_MOTION.duration.medium2,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...springConfig,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle icon bounce after entry
    Animated.sequence([
      Animated.delay(CLEAN_MOTION.duration.medium2),
      Animated.spring(iconBounce, {
        toValue: 1,
        ...getSpringConfig('bouncy', reducedMotion),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, iconBounce, animated, reducedMotion]);

  // Get icon from variant config or use prop
  const resolvedIcon = iconName || VARIANT_CONFIG[variant]?.icon || 'mail-open-outline';
  
  // Icon bounce interpolation
  const iconScale = iconBounce.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1],
  });

  // Variant-specific icon colors
  const getIconColor = () => {
    switch (variant) {
      case 'error':
        return colors.error;
      case 'success':
        return colors.success;
      case 'offline':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        compact && styles.compact,
        {
          opacity: fadeAnim,
          transform: [{scale: scaleAnim}],
        },
        style,
      ]}
      testID={testID}
      accessibilityRole="alert"
      accessibilityLabel={`${title}${subtitle ? `. ${subtitle}` : ''}`}
    >
      {/* Icon with background circle */}
      <Animated.View 
        style={[
          styles.iconContainer, 
          compact && styles.iconCompact,
          {
            backgroundColor: isDark 
              ? `${getIconColor()}15` 
              : `${getIconColor()}10`,
            transform: [{scale: iconScale}],
          },
        ]}
      >
        <Icon 
          name={resolvedIcon} 
          family={iconFamily} 
          size={compact ? 32 : 48} 
          color={getIconColor()} 
        />
      </Animated.View>
      
      {/* Title */}
      <Text 
        style={[
          styles.title, 
          compact && styles.titleCompact, 
          {color: colors.text}
        ]}
        accessibilityRole="header"
      >
        {title}
      </Text>
      
      {/* Subtitle */}
      {subtitle && (
        <Text 
          style={[
            styles.subtitle, 
            {color: colors.textSecondary}
          ]}
        >
          {subtitle}
        </Text>
      )}
      
      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <View style={styles.actionsContainer}>
          {actionLabel && onAction && (
            <PremiumButton
              title={actionLabel}
              onPress={onAction}
              variant="filled"
              size="md"
              color="primary"
              reducedMotion={reducedMotion}
              accessibilityLabel={actionLabel}
              accessibilityHint={`Tap to ${actionLabel.toLowerCase()}`}
            />
          )}
          
          {secondaryActionLabel && onSecondaryAction && (
            <PremiumButton
              title={secondaryActionLabel}
              onPress={onSecondaryAction}
              variant="text"
              size="md"
              color="primary"
              reducedMotion={reducedMotion}
              style={styles.secondaryAction}
            />
          )}
        </View>
      )}
    </Animated.View>
  );
});

EmptyState.displayName = 'EmptyState';

// Skeleton loader component for empty state
interface SkeletonEmptyStateProps {
  compact?: boolean;
  style?: ViewStyle;
}

export const SkeletonEmptyState: React.FC<SkeletonEmptyStateProps> = memo(({
  compact = false,
  style,
}) => {
  const {isDark} = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  const skeletonColor = isDark 
    ? 'rgba(148, 163, 184, 0.15)' 
    : 'rgba(148, 163, 184, 0.2)';

  return (
    <View style={[styles.container, compact && styles.compact, style]}>
      {/* Icon skeleton */}
      <Animated.View
        style={[
          styles.skeletonIcon,
          compact && styles.skeletonIconCompact,
          {backgroundColor: skeletonColor, opacity: shimmerOpacity},
        ]}
      />
      
      {/* Title skeleton */}
      <Animated.View
        style={[
          styles.skeletonTitle,
          {backgroundColor: skeletonColor, opacity: shimmerOpacity},
        ]}
      />
      
      {/* Subtitle skeleton */}
      <Animated.View
        style={[
          styles.skeletonSubtitle,
          {backgroundColor: skeletonColor, opacity: shimmerOpacity},
        ]}
      />
    </View>
  );
});

SkeletonEmptyState.displayName = 'SkeletonEmptyState';

const styles = StyleSheet.create({
  container: {
    padding: CLEAN_SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  compact: {
    padding: CLEAN_SPACING.md,
    minHeight: 150,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: CLEAN_SPACING.md,
  },
  iconCompact: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: CLEAN_SPACING.sm,
  },
  title: {
    ...TEXT_STYLES.titleMedium,
    textAlign: 'center',
    marginBottom: CLEAN_SPACING.xs,
  },
  titleCompact: {
    ...TEXT_STYLES.titleSmall,
  },
  subtitle: {
    ...TEXT_STYLES.bodySmall,
    textAlign: 'center',
    paddingHorizontal: CLEAN_SPACING.lg,
    lineHeight: 20,
    maxWidth: 300,
  },
  actionsContainer: {
    marginTop: CLEAN_SPACING.lg,
    alignItems: 'center',
    gap: CLEAN_SPACING.sm,
  },
  secondaryAction: {
    marginTop: CLEAN_SPACING.xs,
  },
  // Skeleton styles
  skeletonIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: CLEAN_SPACING.md,
  },
  skeletonIconCompact: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: CLEAN_SPACING.sm,
  },
  skeletonTitle: {
    width: 180,
    height: 20,
    borderRadius: CLEAN_RADIUS.extraSmall,
    marginBottom: CLEAN_SPACING.sm,
  },
  skeletonSubtitle: {
    width: 240,
    height: 16,
    borderRadius: CLEAN_RADIUS.extraSmall,
  },
});

export default EmptyState;
