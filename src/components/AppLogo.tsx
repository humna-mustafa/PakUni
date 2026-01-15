/**
 * AppLogo Component - Premium PakUni Branding
 * 
 * A beautiful, pixel-perfect logo featuring:
 * - Graduation cap (mortarboard) as the main symbol
 * - Modern gradient effects
 * - Multiple size variants
 * - Animated and static versions
 * - Dark/light mode support
 * 
 * @author PakUni Team
 * @version 2.0.0
 */

import React, {useRef, useEffect, memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../contexts/ThemeContext';
import {roundToPixel, PP_SHADOWS} from '../constants/pixel-perfect';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'hero';
export type LogoVariant = 'full' | 'icon' | 'text' | 'compact' | 'horizontal';

interface AppLogoProps {
  size?: LogoSize;
  variant?: LogoVariant;
  animated?: boolean;
  showTagline?: boolean;
  color?: string;
  style?: ViewStyle;
  onLayout?: () => void;
}

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================

const LOGO_SIZES: Record<LogoSize, {
  icon: number;
  text: number;
  tagline: number;
  gap: number;
  containerPadding: number;
}> = {
  xs: {icon: 24, text: 14, tagline: 8, gap: 4, containerPadding: 2},
  sm: {icon: 32, text: 18, tagline: 10, gap: 6, containerPadding: 4},
  md: {icon: 48, text: 24, tagline: 12, gap: 8, containerPadding: 6},
  lg: {icon: 64, text: 32, tagline: 14, gap: 10, containerPadding: 8},
  xl: {icon: 80, text: 40, tagline: 16, gap: 12, containerPadding: 10},
  xxl: {icon: 100, text: 48, tagline: 18, gap: 14, containerPadding: 12},
  hero: {icon: 140, text: 56, tagline: 20, gap: 16, containerPadding: 16},
};

// Brand Colors
const BRAND_COLORS = {
  primary: '#6366F1',       // Indigo
  primaryDark: '#4F46E5',   // Darker indigo
  secondary: '#10B981',     // Emerald
  accent: '#8B5CF6',        // Violet
  gold: '#F59E0B',          // Amber
  goldLight: '#FBBF24',     // Light amber
  pakistanGreen: '#01411C', // Pakistan flag green
  white: '#FFFFFF',
};

// Premium gradients
const GRADIENT_PRESETS = {
  primary: ['#6366F1', '#8B5CF6'],
  emerald: ['#10B981', '#059669'],
  golden: ['#F59E0B', '#D97706'],
  royal: ['#6366F1', '#4F46E5', '#7C3AED'],
  pakistan: ['#01411C', '#115740'],
  premium: ['#6366F1', '#8B5CF6', '#EC4899'],
};

// ============================================================================
// PREMIUM GRADUATION CAP ICON - Pure React Native (No SVG dependency)
// Beautiful icon built with View components and gradients
// ============================================================================

interface GraduationCapIconProps {
  size: number;
  primaryColor?: string;
  secondaryColor?: string;
  animated?: boolean;
}

const GraduationCapIcon = memo<GraduationCapIconProps>(({
  size,
  primaryColor = BRAND_COLORS.primary,
  secondaryColor = BRAND_COLORS.accent,
  animated = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      // Subtle breathing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.03,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Tassel swing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated, scaleAnim, bounceAnim]);

  const tasselSwing = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '5deg'],
  });

  // Calculate proportions based on size
  const capTopWidth = size * 0.9;
  const capTopHeight = size * 0.35;
  const capBaseWidth = size * 0.5;
  const capBaseHeight = size * 0.25;
  const buttonSize = size * 0.12;
  const tasselWidth = size * 0.08;
  const tasselLength = size * 0.35;
  const bookWidth = size * 0.7;
  const bookHeight = size * 0.18;

  return (
    <Animated.View
      style={[
        iconStyles.container,
        {
          width: size,
          height: size,
          transform: [{scale: scaleAnim}],
        },
      ]}
    >
      {/* Glow Effect Behind */}
      <View
        style={[
          iconStyles.glowOuter,
          {
            width: size * 0.8,
            height: size * 0.8,
            borderRadius: size * 0.4,
            backgroundColor: primaryColor,
            opacity: 0.1,
          },
        ]}
      />

      {/* Open Book Base */}
      <View style={[iconStyles.bookContainer, {bottom: size * 0.05}]}>
        {/* Left Book Page */}
        <LinearGradient
          colors={['#10B981', '#059669']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[
            iconStyles.bookPage,
            {
              width: bookWidth * 0.5,
              height: bookHeight,
              borderTopLeftRadius: size * 0.02,
              borderBottomLeftRadius: size * 0.06,
              transform: [{rotateY: '-15deg'}, {skewY: '-3deg'}],
            },
          ]}
        >
          {/* Page Lines */}
          <View style={[iconStyles.pageLine, {width: '70%', top: '30%'}]} />
          <View style={[iconStyles.pageLine, {width: '50%', top: '55%'}]} />
        </LinearGradient>
        
        {/* Right Book Page */}
        <LinearGradient
          colors={['#059669', '#10B981']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[
            iconStyles.bookPage,
            {
              width: bookWidth * 0.5,
              height: bookHeight,
              borderTopRightRadius: size * 0.02,
              borderBottomRightRadius: size * 0.06,
              transform: [{rotateY: '15deg'}, {skewY: '3deg'}],
            },
          ]}
        >
          {/* Page Lines */}
          <View style={[iconStyles.pageLine, {width: '70%', top: '30%', alignSelf: 'flex-end'}]} />
          <View style={[iconStyles.pageLine, {width: '50%', top: '55%', alignSelf: 'flex-end'}]} />
        </LinearGradient>
      </View>

      {/* Cap Shadow */}
      <View
        style={[
          iconStyles.capShadow,
          {
            width: capTopWidth * 0.85,
            height: capTopHeight * 0.4,
            borderRadius: capTopHeight * 0.2,
            backgroundColor: primaryColor,
            bottom: size * 0.22,
          },
        ]}
      />

      {/* Cap Base (Crown) */}
      <LinearGradient
        colors={[primaryColor, secondaryColor]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[
          iconStyles.capBase,
          {
            width: capBaseWidth,
            height: capBaseHeight,
            borderRadius: size * 0.04,
            borderBottomLeftRadius: size * 0.08,
            borderBottomRightRadius: size * 0.08,
            bottom: size * 0.25,
          },
        ]}
      >
        {/* Cap Band */}
        <View
          style={[
            iconStyles.capBand,
            {
              height: size * 0.03,
              backgroundColor: secondaryColor,
              bottom: size * 0.02,
            },
          ]}
        />
      </LinearGradient>

      {/* Cap Top (Mortarboard) */}
      <LinearGradient
        colors={[primaryColor, secondaryColor, primaryColor]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[
          iconStyles.capTop,
          {
            width: capTopWidth,
            height: capTopHeight,
            top: size * 0.15,
            transform: [{rotateX: '60deg'}],
          },
        ]}
      >
        {/* Shine Effect */}
        <LinearGradient
          colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)', 'transparent']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[iconStyles.shine, {borderRadius: size * 0.02}]}
        />
      </LinearGradient>

      {/* Button on Top */}
      <LinearGradient
        colors={[BRAND_COLORS.goldLight, BRAND_COLORS.gold]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[
          iconStyles.button,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            top: size * 0.12,
          },
        ]}
      >
        {/* Button Highlight */}
        <View
          style={[
            iconStyles.buttonHighlight,
            {
              width: buttonSize * 0.4,
              height: buttonSize * 0.4,
              borderRadius: buttonSize * 0.2,
              top: buttonSize * 0.15,
              left: buttonSize * 0.15,
            },
          ]}
        />
      </LinearGradient>

      {/* Tassel */}
      <Animated.View
        style={[
          iconStyles.tasselContainer,
          {
            right: size * 0.08,
            top: size * 0.18,
            transform: [{rotate: tasselSwing}],
          },
        ]}
      >
        {/* Tassel String */}
        <View
          style={[
            iconStyles.tasselString,
            {
              width: size * 0.25,
              height: tasselWidth * 0.6,
              backgroundColor: BRAND_COLORS.gold,
              borderRadius: tasselWidth * 0.3,
            },
          ]}
        />
        
        {/* Tassel Knot */}
        <LinearGradient
          colors={[BRAND_COLORS.goldLight, BRAND_COLORS.gold]}
          style={[
            iconStyles.tasselKnot,
            {
              width: tasselWidth * 1.5,
              height: tasselWidth * 1.5,
              borderRadius: tasselWidth * 0.75,
              right: 0,
              top: tasselWidth * 0.2,
            },
          ]}
        />

        {/* Tassel Fringe */}
        <View
          style={[
            iconStyles.tasselFringe,
            {
              right: tasselWidth * 0.25,
              top: tasselWidth * 1.5,
            },
          ]}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                iconStyles.fringeStrand,
                {
                  width: tasselWidth * 0.3,
                  height: tasselLength * (0.8 + Math.random() * 0.4),
                  backgroundColor: i % 2 === 0 ? BRAND_COLORS.gold : BRAND_COLORS.goldLight,
                  borderRadius: tasselWidth * 0.15,
                  marginHorizontal: tasselWidth * 0.05,
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>

      {/* Decorative Stars */}
      <View style={[iconStyles.star, {left: size * 0.08, top: size * 0.12}]}>
        <Text style={[iconStyles.starText, {fontSize: size * 0.08, color: BRAND_COLORS.gold}]}>✦</Text>
      </View>
      <View style={[iconStyles.star, {right: size * 0.35, top: size * 0.08}]}>
        <Text style={[iconStyles.starText, {fontSize: size * 0.06, color: BRAND_COLORS.gold}]}>✦</Text>
      </View>
      <View style={[iconStyles.star, {left: size * 0.15, bottom: size * 0.08}]}>
        <Text style={[iconStyles.starText, {fontSize: size * 0.05, color: secondaryColor, opacity: 0.6}]}>•</Text>
      </View>
      <View style={[iconStyles.star, {right: size * 0.1, bottom: size * 0.12}]}>
        <Text style={[iconStyles.starText, {fontSize: size * 0.04, color: secondaryColor, opacity: 0.5}]}>•</Text>
      </View>
    </Animated.View>
  );
});

const iconStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowOuter: {
    position: 'absolute',
  },
  bookContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bookPage: {
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  pageLine: {
    position: 'absolute',
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
    left: 4,
  },
  capShadow: {
    position: 'absolute',
    opacity: 0.15,
  },
  capBase: {
    position: 'absolute',
    overflow: 'hidden',
  },
  capBand: {
    position: 'absolute',
    width: '100%',
    opacity: 0.7,
  },
  capTop: {
    position: 'absolute',
    borderRadius: 4,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  button: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#F59E0B',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonHighlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  tasselContainer: {
    position: 'absolute',
  },
  tasselString: {
    position: 'absolute',
    left: 0,
  },
  tasselKnot: {
    position: 'absolute',
  },
  tasselFringe: {
    position: 'absolute',
    flexDirection: 'row',
  },
  fringeStrand: {
    // Style applied inline
  },
  star: {
    position: 'absolute',
  },
  starText: {
    fontWeight: '600',
  },
});

// ============================================================================
// LOGO TEXT COMPONENT
// ============================================================================

interface LogoTextProps {
  size: number;
  color?: string;
  weight?: 'normal' | 'bold' | 'heavy';
}

const LogoText = memo<LogoTextProps>(({size, color, weight = 'bold'}) => {
  const {colors, isDark} = useTheme();
  const textColor = color || colors.text;

  const fontWeight: TextStyle['fontWeight'] = 
    weight === 'heavy' ? '900' : 
    weight === 'bold' ? '700' : '500';

  return (
    <View style={styles.textContainer}>
      <Text
        style={[
          styles.logoText,
          {
            fontSize: roundToPixel(size),
            color: textColor,
            fontWeight,
          },
        ]}
        accessibilityRole="header"
      >
        Pak
        <Text style={{color: BRAND_COLORS.primary}}>Uni</Text>
      </Text>
    </View>
  );
});

// ============================================================================
// TAGLINE COMPONENT
// ============================================================================

interface TaglineProps {
  size: number;
  color?: string;
}

const Tagline = memo<TaglineProps>(({size, color}) => {
  const {colors} = useTheme();
  const textColor = color || colors.textSecondary;

  return (
    <Text
      style={[
        styles.tagline,
        {
          fontSize: roundToPixel(size),
          color: textColor,
        },
      ]}
    >
      Your Gateway to Pakistani Universities
    </Text>
  );
});

// ============================================================================
// MAIN APP LOGO COMPONENT
// ============================================================================

export const AppLogo: React.FC<AppLogoProps> = memo(({
  size = 'md',
  variant = 'full',
  animated = false,
  showTagline = false,
  color,
  style,
  onLayout,
}) => {
  const {colors, isDark} = useTheme();
  const config = LOGO_SIZES[size];

  // Render based on variant
  const renderLogo = () => {
    switch (variant) {
      case 'icon':
        return (
          <GraduationCapIcon
            size={config.icon}
            primaryColor={color || BRAND_COLORS.primary}
            animated={animated}
          />
        );

      case 'text':
        return (
          <LogoText
            size={config.text}
            color={color}
            weight="bold"
          />
        );

      case 'compact':
        return (
          <View style={styles.compactContainer}>
            <GraduationCapIcon
              size={config.icon * 0.6}
              primaryColor={color || BRAND_COLORS.primary}
              animated={animated}
            />
            <LogoText
              size={config.text * 0.8}
              color={color}
              weight="bold"
            />
          </View>
        );

      case 'horizontal':
        return (
          <View style={styles.horizontalContainer}>
            <GraduationCapIcon
              size={config.icon}
              primaryColor={color || BRAND_COLORS.primary}
              animated={animated}
            />
            <View style={{width: config.gap}} />
            <View>
              <LogoText
                size={config.text}
                color={color}
                weight="bold"
              />
              {showTagline && (
                <Tagline
                  size={config.tagline}
                  color={colors.textSecondary}
                />
              )}
            </View>
          </View>
        );

      case 'full':
      default:
        return (
          <View style={styles.fullContainer}>
            <GraduationCapIcon
              size={config.icon}
              primaryColor={color || BRAND_COLORS.primary}
              animated={animated}
            />
            <View style={{height: config.gap}} />
            <LogoText
              size={config.text}
              color={color}
              weight="bold"
            />
            {showTagline && (
              <>
                <View style={{height: config.gap / 2}} />
                <Tagline
                  size={config.tagline}
                  color={colors.textSecondary}
                />
              </>
            )}
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, style]} onLayout={onLayout}>
      {renderLogo()}
    </View>
  );
});

// ============================================================================
// ANIMATED SPLASH LOGO - For Splash Screens
// ============================================================================

interface SplashLogoProps {
  onAnimationComplete?: () => void;
}

export const SplashLogo: React.FC<SplashLogoProps> = memo(({onAnimationComplete}) => {
  const {colors, isDark} = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onAnimationComplete?.();
    });
  }, [fadeAnim, scaleAnim, slideAnim, onAnimationComplete]);

  return (
    <View style={styles.splashContainer}>
      <Animated.View
        style={[
          styles.splashLogoWrapper,
          {
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}],
          },
        ]}
      >
        <AppLogo size="hero" variant="full" showTagline animated />
      </Animated.View>
    </View>
  );
});

// ============================================================================
// LOGO BADGE - For Headers/Nav
// ============================================================================

interface LogoBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showGlow?: boolean;
}

export const LogoBadge: React.FC<LogoBadgeProps> = memo(({size = 'md', showGlow = false}) => {
  const {colors, isDark} = useTheme();
  
  const badgeSizes = {
    sm: 36,
    md: 44,
    lg: 56,
  };

  const badgeSize = badgeSizes[size];

  return (
    <View style={[styles.badgeContainer, {width: badgeSize, height: badgeSize}]}>
      {showGlow && (
        <View
          style={[
            styles.badgeGlow,
            {
              width: badgeSize + 16,
              height: badgeSize + 16,
              borderRadius: (badgeSize + 16) / 2,
              backgroundColor: isDark 
                ? 'rgba(99, 102, 241, 0.2)' 
                : 'rgba(99, 102, 241, 0.15)',
            },
          ]}
        />
      )}
      <LinearGradient
        colors={GRADIENT_PRESETS.primary}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[
          styles.badgeGradient,
          {
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
          },
        ]}
      >
        <GraduationCapIcon
          size={badgeSize * 0.65}
          primaryColor="#FFFFFF"
          secondaryColor="rgba(255,255,255,0.8)"
        />
      </LinearGradient>
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  textContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
    }),
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif',
    }),
    textAlign: 'center',
    opacity: 0.8,
    letterSpacing: 0.2,
  },
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeGlow: {
    position: 'absolute',
  },
  badgeGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    ...PP_SHADOWS.primary(BRAND_COLORS.primary),
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export default AppLogo;
export {
  GraduationCapIcon,
  LogoText,
  Tagline,
  BRAND_COLORS,
  GRADIENT_PRESETS,
  LOGO_SIZES,
};
