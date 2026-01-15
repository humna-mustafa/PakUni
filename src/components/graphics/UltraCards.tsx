/**
 * Ultra Premium Cards
 * World-class card components with advanced visual effects
 * Features: Glass morphism, gradient borders, glow effects, premium shadows
 */

import React, { useRef, useCallback, memo } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { RADIUS, SPACING, SHADOWS, ANIMATION } from '../../constants/design';

// Try to import LinearGradient
let LinearGradient: React.ComponentType<any>;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch (e) {
  LinearGradient = ({ children, colors, style, ...props }: any) => (
    <View style={[style, { backgroundColor: colors?.[0] || '#1A7AEB' }]} {...props}>
      {children}
    </View>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

type CardVariant = 
  | 'elevated'      // Standard elevated card with shadow
  | 'glass'         // Glassmorphism effect
  | 'gradient'      // Gradient background
  | 'outlined'      // Subtle border
  | 'glowing'       // Glow effect around card
  | 'aurora'        // Aurora glass effect
  | 'premium'       // Premium gradient border
  | 'floating';     // Floating 3D effect

type CardSize = 'compact' | 'default' | 'spacious' | 'hero';

interface UltraCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  
  // Visual customization
  glowColor?: string;
  gradientColors?: string[];
  borderGradient?: string[];
  shadowIntensity?: 'light' | 'medium' | 'heavy';
  
  // Features
  animated?: boolean;
  showShine?: boolean;
  borderRadius?: keyof typeof RADIUS | number;
}

// Size configurations
const SIZE_CONFIG = {
  compact: { padding: SPACING[3], radius: RADIUS.lg },
  default: { padding: SPACING[4], radius: RADIUS.xl },
  spacious: { padding: SPACING[6], radius: RADIUS.xxl },
  hero: { padding: SPACING[8], radius: RADIUS.xxxl },
};

// ============================================================================
// ULTRA PREMIUM CARD
// ============================================================================

export const UltraCard = memo(({
  children,
  variant = 'elevated',
  size = 'default',
  onPress,
  onLongPress,
  disabled = false,
  style,
  contentStyle,
  glowColor,
  gradientColors,
  borderGradient,
  shadowIntensity = 'medium',
  animated = true,
  showShine = false,
  borderRadius,
}: UltraCardProps) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;

  const sizeConfig = SIZE_CONFIG[size];
  const resolvedRadius = typeof borderRadius === 'number' 
    ? borderRadius 
    : borderRadius 
      ? RADIUS[borderRadius] 
      : sizeConfig.radius;

  // Shine animation
  React.useEffect(() => {
    if (showShine) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.delay(3000),
          Animated.timing(shineAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [showShine, shineAnim]);

  const handlePressIn = useCallback(() => {
    if (!animated || !onPress || disabled) return;
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
        ...ANIMATION.spring.snappy,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animated, onPress, disabled, scaleAnim, opacityAnim]);

  const handlePressOut = useCallback(() => {
    if (!animated || !onPress || disabled) return;
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...ANIMATION.spring.default,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animated, onPress, disabled, scaleAnim, opacityAnim]);

  // Get shadow based on intensity
  const getShadow = (): ViewStyle => {
    const shadowMap = {
      light: SHADOWS.soft.sm,
      medium: SHADOWS.soft.lg,
      heavy: SHADOWS.soft.xl,
    };
    return shadowMap[shadowIntensity];
  };

  // Get variant-specific styles
  const getVariantStyles = (): { container: ViewStyle; inner?: ViewStyle } => {
    switch (variant) {
      case 'glass':
        return {
          container: {
            backgroundColor: isDark
              ? 'rgba(15, 23, 42, 0.85)'
              : 'rgba(255, 255, 255, 0.88)',
            borderWidth: 1.5,
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.12)'
              : 'rgba(255, 255, 255, 0.7)',
            ...(Platform.OS === 'ios' && getShadow()),
          },
        };
        
      case 'aurora':
        return {
          container: {
            backgroundColor: isDark
              ? 'rgba(30, 41, 59, 0.75)'
              : 'rgba(255, 255, 255, 0.9)',
            borderWidth: 1,
            borderColor: isDark
              ? 'rgba(103, 126, 234, 0.25)'
              : 'rgba(103, 126, 234, 0.2)',
            shadowColor: '#667eea',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 8,
          },
        };
        
      case 'gradient':
        return {
          container: {},
        };
        
      case 'glowing':
        const glow = glowColor || colors.primary;
        return {
          container: {
            backgroundColor: colors.card,
            shadowColor: glow,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 20,
            elevation: 10,
            borderWidth: 1,
            borderColor: `${glow}30`,
          },
        };
        
      case 'outlined':
        return {
          container: {
            backgroundColor: colors.card,
            borderWidth: 1.5,
            borderColor: colors.border,
          },
        };
        
      case 'premium':
        return {
          container: {
            padding: 2,
          },
          inner: {
            backgroundColor: colors.card,
            borderRadius: resolvedRadius - 2,
            padding: sizeConfig.padding,
          },
        };
        
      case 'floating':
        return {
          container: {
            backgroundColor: colors.card,
            shadowColor: isDark ? '#000' : '#64748B',
            shadowOffset: { width: 0, height: 20 },
            shadowOpacity: isDark ? 0.4 : 0.2,
            shadowRadius: 30,
            elevation: 12,
            borderWidth: 1,
            borderColor: isDark 
              ? 'rgba(255,255,255,0.08)' 
              : 'rgba(255,255,255,0.8)',
          },
        };
        
      case 'elevated':
      default:
        return {
          container: {
            backgroundColor: colors.card,
            ...getShadow(),
          },
        };
    }
  };

  const variantStyles = getVariantStyles();

  // Build container style
  const containerStyle: ViewStyle = {
    borderRadius: resolvedRadius,
    padding: variant === 'premium' ? 0 : sizeConfig.padding,
    overflow: 'hidden',
    opacity: disabled ? 0.5 : 1,
    ...variantStyles.container,
  };

  // Shine effect overlay
  const shineTranslateX = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH * 2],
  });

  const renderShine = () => {
    if (!showShine) return null;
    return (
      <Animated.View
        style={[
          styles.shineOverlay,
          { transform: [{ translateX: shineTranslateX }] },
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.15)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shineLine}
        />
      </Animated.View>
    );
  };

  // Content wrapper
  const renderContent = () => (
    <View style={[styles.content, contentStyle]}>
      {children}
      {renderShine()}
    </View>
  );

  // Gradient variant
  if (variant === 'gradient') {
    const colors_gradient = gradientColors || (isDark 
      ? ['#1E293B', '#0F172A']
      : ['#FFFFFF', '#F8FAFC']);
    
    return (
      <Animated.View
        style={[
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          style,
        ]}
      >
        {onPress ? (
          <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
          >
            <LinearGradient
              colors={colors_gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[containerStyle, getShadow()]}
            >
              {renderContent()}
            </LinearGradient>
          </Pressable>
        ) : (
          <LinearGradient
            colors={colors_gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[containerStyle, getShadow()]}
          >
            {renderContent()}
          </LinearGradient>
        )}
      </Animated.View>
    );
  }

  // Premium variant with gradient border
  if (variant === 'premium') {
    const borderColors = borderGradient || ['#667eea', '#764ba2', '#f093fb'];
    
    return (
      <Animated.View
        style={[
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          style,
        ]}
      >
        {onPress ? (
          <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
          >
            <LinearGradient
              colors={borderColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[containerStyle, getShadow()]}
            >
              <View style={variantStyles.inner}>
                {renderContent()}
              </View>
            </LinearGradient>
          </Pressable>
        ) : (
          <LinearGradient
            colors={borderColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[containerStyle, getShadow()]}
          >
            <View style={variantStyles.inner}>
              {renderContent()}
            </View>
          </LinearGradient>
        )}
      </Animated.View>
    );
  }

  // Standard variants
  if (onPress) {
    return (
      <Animated.View
        style={[
          containerStyle,
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          style,
        ]}
      >
        <Pressable
          onPress={onPress}
          onLongPress={onLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={styles.pressable}
          android_ripple={{ color: `${colors.primary}15`, borderless: false }}
        >
          {renderContent()}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View style={[containerStyle, style]}>
      {renderContent()}
    </View>
  );
});

// ============================================================================
// FEATURE CARD - For showcasing features with icons
// ============================================================================

interface FeatureCardProps {
  children: React.ReactNode;
  gradient?: string[];
  iconBg?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export const FeatureCard = memo(({
  children,
  gradient = ['#1A7AEB', '#0F62CC'],
  iconBg,
  onPress,
  style,
}: FeatureCardProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        ...ANIMATION.spring.snappy,
      }).start();
    }
  }, [onPress, scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...ANIMATION.spring.default,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.featureCard,
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.featureCardGradient}
        >
          {/* Decorative elements */}
          <View style={styles.featureCardDeco1} />
          <View style={styles.featureCardDeco2} />
          
          {/* Content */}
          <View style={styles.featureCardContent}>
            {iconBg}
            {children}
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
});

// ============================================================================
// STAT CARD - For displaying statistics
// ============================================================================

interface StatCardProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
  trend?: { value: string; positive: boolean };
  gradient?: string[];
  style?: ViewStyle;
}

export const StatCard = memo(({
  value,
  label,
  icon,
  trend,
  gradient,
  style,
}: StatCardProps) => {
  const { colors, isDark } = useTheme();

  const content = (
    <>
      <View style={styles.statCardHeader}>
        {icon && <View style={styles.statCardIcon}>{icon}</View>}
        {trend && (
          <View
            style={[
              styles.statTrend,
              { backgroundColor: trend.positive ? '#22C55E20' : '#EF444420' },
            ]}
          >
            <View
              style={[
                styles.statTrendArrow,
                {
                  borderColor: trend.positive ? '#22C55E' : '#EF4444',
                  transform: [{ rotate: trend.positive ? '-45deg' : '135deg' }],
                },
              ]}
            />
          </View>
        )}
      </View>
      <View style={styles.statCardValue}>
        <LinearGradient
          colors={gradient || [colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.statValueGradient}
        >
          {/* Value text would need MaskedView for true gradient text */}
        </LinearGradient>
        {/* Fallback solid color */}
        {!gradient && (
          <View>
            {/* Value rendered by parent */}
          </View>
        )}
      </View>
    </>
  );

  if (gradient) {
    return (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.statCard, style]}
      >
        {content}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: isDark ? colors.card : '#FFFFFF',
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {content}
    </View>
  );
});

// ============================================================================
// LIST ITEM CARD - Optimized for list items
// ============================================================================

interface ListItemCardProps {
  children: React.ReactNode;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  style?: ViewStyle;
}

export const ListItemCard = memo(({
  children,
  leftContent,
  rightContent,
  onPress,
  showChevron = false,
  style,
}: ListItemCardProps) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        ...ANIMATION.spring.snappy,
      }).start();
    }
  }, [onPress, scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...ANIMATION.spring.default,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.listItemCard, { backgroundColor: colors.card }]}
        android_ripple={onPress ? { color: `${colors.primary}15`, borderless: false } : undefined}
      >
        {leftContent && <View style={styles.listItemLeft}>{leftContent}</View>}
        <View style={styles.listItemContent}>{children}</View>
        {(rightContent || showChevron) && (
          <View style={styles.listItemRight}>
            {rightContent}
            {showChevron && (
              <View style={[styles.chevron, { borderColor: colors.textSecondary }]} />
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  content: {
    position: 'relative',
    zIndex: 1,
  },
  pressable: {
    flex: 1,
  },
  shineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  shineLine: {
    position: 'absolute',
    top: -50,
    width: 60,
    height: 400,
    transform: [{ rotate: '-20deg' }],
  },
  featureCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    shadowColor: '#1A7AEB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  featureCardGradient: {
    padding: SPACING[5],
    overflow: 'hidden',
  },
  featureCardDeco1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  featureCardDeco2: {
    position: 'absolute',
    bottom: -20,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  featureCardContent: {
    position: 'relative',
    zIndex: 1,
  },
  statCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING[4],
    minWidth: 100,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING[2],
  },
  statCardIcon: {
    marginBottom: SPACING[2],
  },
  statTrend: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTrendArrow: {
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  statCardValue: {},
  statValueGradient: {
    height: 30,
  },
  listItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING[3],
    borderRadius: RADIUS.lg,
    ...SHADOWS.soft.xs,
  },
  listItemLeft: {
    marginRight: SPACING[3],
  },
  listItemContent: {
    flex: 1,
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING[2],
  },
  chevron: {
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    transform: [{ rotate: '45deg' }],
    marginLeft: SPACING[2],
  },
});

export default {
  UltraCard,
  FeatureCard,
  StatCard,
  ListItemCard,
};
