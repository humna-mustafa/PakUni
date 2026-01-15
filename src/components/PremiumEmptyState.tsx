/**
 * Premium Empty State Component
 * Silicon Valley-grade empty state with animations
 */

import React, {useRef, useEffect} from 'react';
import {View, Text, StyleSheet, Animated, ViewStyle} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../contexts/ThemeContext';
import {TYPOGRAPHY, SPACING, RADIUS, ANIMATION} from '../constants/design';
import {PremiumButton} from './PremiumButton';
import {FeatureIcon} from './icons';

type EmptyStateVariant = 'default' | 'search' | 'error' | 'network' | 'favorites' | 'success';

interface PremiumEmptyStateProps {
  variant?: EmptyStateVariant;
  title: string;
  description?: string;
  iconName?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  style?: ViewStyle;
  animated?: boolean;
}

const VARIANT_CONFIG: Record<EmptyStateVariant, {iconName: string; color: string; gradient: string[]}> = {
  default: {
    iconName: 'albums-outline',
    color: '#64748B',
    gradient: ['#F1F5F9', '#E2E8F0'],
  },
  search: {
    iconName: 'search',
    color: '#3B82F6',
    gradient: ['#DBEAFE', '#BFDBFE'],
  },
  error: {
    iconName: 'alert-circle',
    color: '#EF4444',
    gradient: ['#FEE2E2', '#FECACA'],
  },
  network: {
    iconName: 'wifi',
    color: '#F59E0B',
    gradient: ['#FEF3C7', '#FDE68A'],
  },
  favorites: {
    iconName: 'heart',
    color: '#EC4899',
    gradient: ['#FCE7F3', '#FBCFE8'],
  },
  success: {
    iconName: 'checkmark-circle',
    color: '#10B981',
    gradient: ['#D1FAE5', '#A7F3D0'],
  },
};

export const PremiumEmptyState: React.FC<PremiumEmptyStateProps> = ({
  variant = 'default',
  title,
  description,
  iconName,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  style,
  animated = true,
}) => {
  const {colors, isDark} = useTheme();
  const config = VARIANT_CONFIG[variant];
  
  // Animation values
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      // Entry animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          ...ANIMATION.spring.bouncy,
          useNativeDriver: true,
        }),
      ]).start();

      // Floating emoji animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -8,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
    }
  }, [animated]);

  const displayIcon = iconName || config.iconName;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{scale: scaleAnim}],
        },
        style,
      ]}>
      {/* Decorative background circles */}
      <View style={styles.decorationContainer}>
        <View
          style={[
            styles.decorCircle1,
            {backgroundColor: isDark ? `${config.color}10` : `${config.color}15`},
          ]}
        />
        <View
          style={[
            styles.decorCircle2,
            {backgroundColor: isDark ? `${config.color}08` : `${config.color}10`},
          ]}
        />
      </View>

      {/* Icon Container */}
      <Animated.View
        style={[
          styles.emojiContainer,
          {transform: [{translateY: floatAnim}]},
        ]}>
        <FeatureIcon
          name={displayIcon}
          family="Ionicons"
          size={48}
          variant="gradient"
          gradientColors={isDark ? [`${config.color}40`, `${config.color}20`] : config.gradient}
          containerSize={100}
          color={config.color}
        />
      </Animated.View>

      {/* Content */}
      <Text style={[styles.title, {color: colors.text}]}>{title}</Text>
      
      {description && (
        <Text style={[styles.description, {color: colors.textSecondary}]}>
          {description}
        </Text>
      )}

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <View style={styles.actionsContainer} accessibilityRole="none">
          {actionLabel && onAction && (
            <PremiumButton
              title={actionLabel}
              onPress={onAction}
              variant="solid"
              size="md"
              fullWidth
              style={styles.primaryAction}
              accessibilityLabel={actionLabel}
            />
          )}
          
          {secondaryActionLabel && onSecondaryAction && (
            <PremiumButton
              title={secondaryActionLabel}
              onPress={onSecondaryAction}
              variant="ghost"
              size="md"
              fullWidth
              accessibilityLabel={secondaryActionLabel}
            />
          )}
        </View>
      )}
    </Animated.View>
  );
};

/**
 * Preset empty states for common use cases
 */
export const NoSearchResults: React.FC<{
  query: string;
  onClearFilters?: () => void;
}> = ({query, onClearFilters}) => (
  <PremiumEmptyState
    variant="search"
    title="No Results Found"
    description={`We couldn't find anything matching "${query}". Try adjusting your search or filters.`}
    actionLabel="Clear Filters"
    onAction={onClearFilters}
  />
);

export const NoFavorites: React.FC<{onBrowse?: () => void}> = ({onBrowse}) => (
  <PremiumEmptyState
    variant="favorites"
    title="No Favorites Yet"
    description="Save universities, scholarships, and programs to access them quickly."
    actionLabel="Browse Universities"
    onAction={onBrowse}
  />
);

export const NetworkError: React.FC<{onRetry?: () => void}> = ({onRetry}) => (
  <PremiumEmptyState
    variant="network"
    title="Connection Issue"
    description="Please check your internet connection and try again."
    actionLabel="Retry"
    onAction={onRetry}
  />
);

export const GenericError: React.FC<{onRetry?: () => void}> = ({onRetry}) => (
  <PremiumEmptyState
    variant="error"
    title="Something Went Wrong"
    description="We encountered an unexpected error. Please try again."
    actionLabel="Try Again"
    onAction={onRetry}
  />
);

export const SuccessState: React.FC<{
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({title, description, actionLabel, onAction}) => (
  <PremiumEmptyState
    variant="success"
    title={title}
    description={description}
    actionLabel={actionLabel}
    onAction={onAction}
  />
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: SPACING[6],
    position: 'relative',
  },
  decorationContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -20,
  },
  decorCircle2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  emojiContainer: {
    marginBottom: SPACING[4],
    zIndex: 1,
  },
  emojiBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: TYPOGRAPHY.scale.title3,
    fontWeight: TYPOGRAPHY.weight.bold,
    textAlign: 'center',
    marginBottom: SPACING[2],
    letterSpacing: -0.3,
    zIndex: 1,
  },
  description: {
    fontSize: TYPOGRAPHY.scale.body,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
    marginBottom: SPACING[4],
    zIndex: 1,
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 240,
    gap: SPACING[2],
    zIndex: 1,
  },
  primaryAction: {
    marginBottom: SPACING[1],
  },
});

export default PremiumEmptyState;
