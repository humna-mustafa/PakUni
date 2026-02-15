/**
 * AppLogo Component — PakUni Branding
 *
 * Proper SVG-file-based logo system.
 * Artwork lives in `src/assets/svg/*.svg` as standalone files.
 * react-native-svg-transformer converts them to React components at
 * build time so they render as crisp vectors at every DPI.
 *
 * Exports the same public API consumed by the rest of the app:
 *   AppLogo, GraduationCapIcon, LogoBadge, SplashLogo,
 *   LogoText, Tagline, BRAND_COLORS, GRADIENT_PRESETS, LOGO_SIZES
 *
 * @author PakUni Team
 * @version 4.0.0 — SVG-file edition
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
import {TYPOGRAPHY} from '../constants/design';
import {useTheme} from '../contexts/ThemeContext';
import {roundToPixel, PP_SHADOWS} from '../constants/pixel-perfect';

// ---------------------------------------------------------------------------
// SVG file imports — each .svg is compiled to a React component by
// react-native-svg-transformer (configured in metro.config.js)
// ---------------------------------------------------------------------------
import PakUniIcon from '../assets/svg/pakuni-icon.svg';
import PakUniIconWhite from '../assets/svg/pakuni-icon-white.svg';
import PakUniLogoVertical from '../assets/svg/pakuni-logo.svg';
import PakUniLogoHorizontal from '../assets/svg/pakuni-logo-horizontal.svg';

// ============================================================================
// TYPES
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

const LOGO_SIZES: Record<
  LogoSize,
  {
    icon: number;
    text: number;
    tagline: number;
    gap: number;
    containerPadding: number;
  }
> = {
  xs: {icon: 24, text: 14, tagline: 8, gap: 4, containerPadding: 2},
  sm: {icon: 32, text: 18, tagline: 10, gap: 6, containerPadding: 4},
  md: {icon: 48, text: 24, tagline: 12, gap: 8, containerPadding: 6},
  lg: {icon: 64, text: 32, tagline: 14, gap: 10, containerPadding: 8},
  xl: {icon: 80, text: 40, tagline: 16, gap: 12, containerPadding: 10},
  xxl: {icon: 100, text: 48, tagline: 18, gap: 14, containerPadding: 12},
  hero: {icon: 140, text: 56, tagline: 20, gap: 16, containerPadding: 16},
};

// ============================================================================
// BRAND COLORS — Single source of truth
// ============================================================================

const BRAND_COLORS = {
  primary: '#4573DF',
  primaryDark: '#3660C9',
  primaryLight: '#6B93F0',
  secondary: '#10B981',
  accent: '#3660C9',
  gold: '#F59E0B',
  goldLight: '#FBBF24',
  goldDark: '#B45309',
  pakistanGreen: '#059669',
  white: '#FFFFFF',
};

const GRADIENT_PRESETS = {
  primary: ['#6B93F0', '#4573DF', '#3660C9'],
  emerald: ['#10B981', '#059669'],
  golden: ['#FBBF24', '#F59E0B'],
  royal: ['#4573DF', '#3660C9', '#2A4FA8'],
  pakistan: ['#10B981', '#059669'],
  premium: ['#6B93F0', '#4573DF', '#3660C9'],
};

// ============================================================================
// GRADUATION CAP ICON — Wrapper around imported SVG file
// ============================================================================

interface GraduationCapIconProps {
  size: number;
  primaryColor?: string;
  secondaryColor?: string;
  animated?: boolean;
}

/**
 * Renders the PakUni graduation-cap SVG at the requested pixel size.
 *
 * Two colour variants ship as separate `.svg` files:
 *   • Brand-colored (default) — pakuni-icon.svg
 *   • White — pakuni-icon-white.svg
 *
 * When `primaryColor` is white-ish the white variant is selected
 * automatically so callers don't need to change anything.
 */
const GraduationCapIcon = memo<GraduationCapIconProps>(
  ({
    size,
    primaryColor = BRAND_COLORS.primary,
    // secondaryColor kept for backward-compat with existing callers
    secondaryColor: _secondaryColor,
    animated = false,
  }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const bounceAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (!animated) {
        return;
      }

      const breathe = Animated.loop(
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
        ]),
      );
      breathe.start();

      const swing = Animated.loop(
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
        ]),
      );
      swing.start();

      return () => {
        breathe.stop();
        swing.stop();
      };
    }, [animated, scaleAnim, bounceAnim]);

    // Pick the correct SVG colour variant
    const isWhite =
      primaryColor === '#FFFFFF' ||
      primaryColor === '#FFF' ||
      primaryColor === '#fff' ||
      primaryColor === 'white' ||
      primaryColor?.toLowerCase() === '#ffffff';

    const SvgIcon = isWhite ? PakUniIconWhite : PakUniIcon;
    const svgElement = <SvgIcon width={size} height={size} />;

    if (!animated) {
      return (
        <View
          style={{
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {svgElement}
        </View>
      );
    }

    return (
      <Animated.View
        style={{
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{scale: scaleAnim}],
        }}
      >
        {svgElement}
      </Animated.View>
    );
  },
);

// ============================================================================
// LOGO TEXT
// ============================================================================

interface LogoTextProps {
  size: number;
  color?: string;
  weight?: 'normal' | 'bold' | 'heavy';
}

const LogoText = memo<LogoTextProps>(({size, color, weight = 'bold'}) => {
  const {colors} = useTheme();
  const textColor = color || colors.text;
  const fontWeight: TextStyle['fontWeight'] =
    weight === 'heavy' ? '900' : weight === 'bold' ? '700' : '500';

  return (
    <View style={styles.textContainer}>
      <Text
        style={[
          styles.logoText,
          {fontSize: roundToPixel(size), color: textColor, fontWeight},
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
// TAGLINE
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
      style={[styles.tagline, {fontSize: roundToPixel(size), color: textColor}]}
    >
      Your Gateway to Pakistani Universities
    </Text>
  );
});

// ============================================================================
// MAIN APP LOGO
// ============================================================================

export const AppLogo: React.FC<AppLogoProps> = memo(
  ({
    size = 'md',
    variant = 'full',
    animated = false,
    showTagline = false,
    color,
    style,
    onLayout,
  }) => {
    const {colors} = useTheme();
    const config = LOGO_SIZES[size];

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
          return <LogoText size={config.text} color={color} weight="bold" />;

        case 'compact':
          return (
            <View style={styles.compactContainer}>
              <GraduationCapIcon
                size={config.icon * 0.6}
                primaryColor={color || BRAND_COLORS.primary}
                animated={animated}
              />
              <LogoText size={config.text * 0.8} color={color} weight="bold" />
            </View>
          );

        case 'horizontal':
          // Use the perfect SVG file if default branding (no overrides)
          if (!color && !animated && showTagline) {
            return (
              <PakUniLogoHorizontal
                width={config.icon * 3.5} // Estimate width based on icon size
                height={config.icon}
              />
            );
          }
          return (
            <View style={styles.horizontalContainer}>
              <GraduationCapIcon
                size={config.icon}
                primaryColor={color || BRAND_COLORS.primary}
                animated={animated}
              />
              <View style={{width: config.gap}} />
              <View>
                <LogoText size={config.text} color={color} weight="bold" />
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
          // Use the perfect SVG file if default branding (no overrides)
          if (!color && !animated && showTagline) {
             return (
              <PakUniLogoVertical
                width={config.icon * 2.5} // Estimate width based on icon size
                height={config.icon * 3}
              />
            );
          }
          return (
            <View style={styles.fullContainer}>
              <GraduationCapIcon
                size={config.icon}
                primaryColor={color || BRAND_COLORS.primary}
                animated={animated}
              />
              <View style={{height: config.gap}} />
              <LogoText size={config.text} color={color} weight="bold" />
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
  },
);

// ============================================================================
// ANIMATED SPLASH LOGO
// ============================================================================

interface SplashLogoProps {
  onAnimationComplete?: () => void;
}

export const SplashLogo: React.FC<SplashLogoProps> = memo(
  ({onAnimationComplete}) => {
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
            {opacity: fadeAnim, transform: [{scale: scaleAnim}]},
          ]}
        >
          <AppLogo size="hero" variant="full" showTagline animated />
        </Animated.View>
      </View>
    );
  },
);

// ============================================================================
// LOGO BADGE — For Headers/Nav
// ============================================================================

interface LogoBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showGlow?: boolean;
}

export const LogoBadge: React.FC<LogoBadgeProps> = memo(
  ({size = 'md', showGlow = false}) => {
    const {isDark} = useTheme();

    const badgeSizes = {sm: 36, md: 44, lg: 56};
    const badgeSize = badgeSizes[size];

    return (
      <View
        style={[styles.badgeContainer, {width: badgeSize, height: badgeSize}]}
      >
        {showGlow && (
          <View
            style={[
              styles.badgeGlow,
              {
                width: badgeSize + 16,
                height: badgeSize + 16,
                borderRadius: (badgeSize + 16) / 2,
                backgroundColor: isDark
                  ? 'rgba(69, 115, 223, 0.2)'
                  : 'rgba(69, 115, 223, 0.15)',
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
          />
        </LinearGradient>
      </View>
    );
  },
);

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

