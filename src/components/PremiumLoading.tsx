/**
 * PremiumLoading Component - Highest Quality Loading Animation
 * 
 * A stunning, education-themed loading animation designed specifically for PakUni.
 * Features:
 * - Animated graduation cap with book elements
 * - Pulsing orbs with brand colors
 * - Smooth wave animation
 * - Educational themed particles (stars, sparkles)
 * - Multiple variants for different use cases
 * - Full dark/light mode support
 * 
 * @author PakUni Team
 * @version 1.0.0
 */

import React, {useRef, useEffect, memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Platform,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../contexts/ThemeContext';
import {BRAND_COLORS} from './AppLogo';
import {SPACING, FONTS} from '../constants/theme';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type LoadingVariant = 
  | 'graduation' // Animated graduation cap
  | 'books'      // Stacked books animation
  | 'pulse'      // Pulsing logo effect
  | 'wave'       // Wave of dots
  | 'orbit'      // Orbiting particles
  | 'minimal';   // Simple, elegant loader

export type LoadingSize = 'small' | 'medium' | 'large';

export interface PremiumLoadingProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  transparent?: boolean;
  showLogo?: boolean;
  style?: ViewStyle;
}

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================

const SIZE_CONFIG = {
  small: {
    container: 60,
    icon: 32,
    text: 12,
    subText: 10,
  },
  medium: {
    container: 100,
    icon: 56,
    text: 14,
    subText: 12,
  },
  large: {
    container: 140,
    icon: 80,
    text: 16,
    subText: 14,
  },
};

// ============================================================================
// GRADUATION CAP LOADER - Premium Education Theme
// ============================================================================

const GraduationLoader = memo<{size: number; color: string}>(({size, color}) => {
  const bounce = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Bouncing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 600,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Subtle rotation for tassel
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotate, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Shimmer effect
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateY = bounce.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -size * 0.15],
  });

  const tasselRotate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '10deg'],
  });

  const shimmerTranslate = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-size, size],
  });

  return (
    <View style={[graduationStyles.container, {width: size, height: size}]}>
      <Animated.View
        style={[
          graduationStyles.capWrapper,
          {transform: [{translateY}]},
        ]}
      >
        {/* Cap Top (Mortarboard) */}
        <LinearGradient
          colors={[color, BRAND_COLORS.accent]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[
            graduationStyles.capTop,
            {
              width: size * 0.85,
              height: size * 0.25,
            },
          ]}
        >
          {/* Shimmer Effect */}
          <Animated.View
            style={[
              graduationStyles.shimmer,
              {
                transform: [{translateX: shimmerTranslate}],
              },
            ]}
          >
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </LinearGradient>

        {/* Cap Base */}
        <LinearGradient
          colors={[color, BRAND_COLORS.primaryDark || color]}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          style={[
            graduationStyles.capBase,
            {
              width: size * 0.4,
              height: size * 0.2,
              marginTop: -size * 0.02,
            },
          ]}
        />

        {/* Button on top */}
        <View
          style={[
            graduationStyles.button,
            {
              width: size * 0.1,
              height: size * 0.1,
              borderRadius: size * 0.05,
              backgroundColor: BRAND_COLORS.gold,
              top: -size * 0.02,
            },
          ]}
        />

        {/* Animated Tassel */}
        <Animated.View
          style={[
            graduationStyles.tasselContainer,
            {
              right: size * 0.05,
              top: 0,
              transform: [{rotate: tasselRotate}],
            },
          ]}
        >
          <View
            style={[
              graduationStyles.tasselString,
              {
                width: size * 0.25,
                height: 2,
                backgroundColor: BRAND_COLORS.gold,
              },
            ]}
          />
          <View
            style={[
              graduationStyles.tasselKnot,
              {
                width: size * 0.08,
                height: size * 0.08,
                borderRadius: size * 0.04,
                backgroundColor: BRAND_COLORS.goldLight,
                right: 0,
              },
            ]}
          />
          <View style={[graduationStyles.tasselFringe, {right: size * 0.02}]}>
            {[0.8, 1, 0.9, 1.1, 0.85].map((h, i) => (
              <View
                key={i}
                style={{
                  width: size * 0.02,
                  height: size * 0.2 * h,
                  backgroundColor: i % 2 ? BRAND_COLORS.gold : BRAND_COLORS.goldLight,
                  borderRadius: size * 0.01,
                  marginHorizontal: 1,
                }}
              />
            ))}
          </View>
        </Animated.View>
      </Animated.View>

      {/* Book base */}
      <View style={[graduationStyles.bookStack, {marginTop: size * 0.05}]}>
        <LinearGradient
          colors={[BRAND_COLORS.secondary, '#059669']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[
            graduationStyles.book,
            {
              width: size * 0.6,
              height: size * 0.12,
              borderRadius: size * 0.02,
            },
          ]}
        />
        <LinearGradient
          colors={['#059669', BRAND_COLORS.secondary]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[
            graduationStyles.book,
            {
              width: size * 0.55,
              height: size * 0.1,
              borderRadius: size * 0.02,
              marginTop: -size * 0.03,
            },
          ]}
        />
      </View>
    </View>
  );
});

const graduationStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  capWrapper: {
    alignItems: 'center',
  },
  capTop: {
    borderRadius: 4,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  capBase: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  button: {
    position: 'absolute',
    ...Platform.select({
      ios: {
        shadowColor: BRAND_COLORS.gold,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tasselContainer: {
    position: 'absolute',
  },
  tasselString: {
    position: 'absolute',
  },
  tasselKnot: {
    position: 'absolute',
    top: -2,
  },
  tasselFringe: {
    position: 'absolute',
    flexDirection: 'row',
    top: 8,
  },
  bookStack: {
    alignItems: 'center',
  },
  book: {
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
});

// ============================================================================
// ORBITING PARTICLES LOADER
// ============================================================================

const OrbitLoader = memo<{size: number; color: string}>(({size, color}) => {
  const rotation = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Main rotation
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Center pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const particles = [
    {delay: 0, size: size * 0.12, color: color},
    {delay: 0.33, size: size * 0.1, color: BRAND_COLORS.accent},
    {delay: 0.66, size: size * 0.08, color: BRAND_COLORS.secondary},
  ];

  return (
    <View style={[orbitStyles.container, {width: size, height: size}]}>
      {/* Orbit path */}
      <View
        style={[
          orbitStyles.orbitPath,
          {
            width: size * 0.8,
            height: size * 0.8,
            borderRadius: size * 0.4,
            borderColor: `${color}20`,
          },
        ]}
      />

      {/* Center glow */}
      <Animated.View
        style={[
          orbitStyles.centerGlow,
          {
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: size * 0.15,
            backgroundColor: `${color}30`,
            transform: [{scale: pulse}],
          },
        ]}
      />

      {/* Center dot */}
      <LinearGradient
        colors={[color, BRAND_COLORS.accent]}
        style={[
          orbitStyles.centerDot,
          {
            width: size * 0.15,
            height: size * 0.15,
            borderRadius: size * 0.075,
          },
        ]}
      />

      {/* Orbiting particles */}
      <Animated.View
        style={[
          orbitStyles.particlesContainer,
          {
            width: size * 0.8,
            height: size * 0.8,
            transform: [{rotate: spin}],
          },
        ]}
      >
        {particles.map((particle, i) => (
          <View
            key={i}
            style={[
              orbitStyles.particle,
              {
                width: particle.size,
                height: particle.size,
                borderRadius: particle.size / 2,
                backgroundColor: particle.color,
                top: 0,
                left: '50%',
                marginLeft: -particle.size / 2,
                marginTop: -particle.size / 2,
                transform: [{rotate: `${i * 120}deg`}, {translateY: size * 0.4 - particle.size / 2}],
              },
            ]}
          />
        ))}
      </Animated.View>
    </View>
  );
});

const orbitStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitPath: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  centerGlow: {
    position: 'absolute',
  },
  centerDot: {
    position: 'absolute',
  },
  particlesContainer: {
    position: 'absolute',
  },
  particle: {
    position: 'absolute',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});

// ============================================================================
// WAVE LOADER - Elegant Wave Animation
// ============================================================================

const WaveLoader = memo<{size: number; color: string}>(({size, color}) => {
  const waves = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    waves.forEach((wave, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.timing(wave, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(wave, {
            toValue: 0,
            duration: 400,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  const colors = [
    color,
    BRAND_COLORS.accent,
    BRAND_COLORS.secondary,
    BRAND_COLORS.accent,
    color,
  ];

  return (
    <View style={[waveStyles.container, {width: size, height: size}]}>
      {waves.map((wave, index) => {
        const scaleY = wave.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 1],
        });

        return (
          <Animated.View
            key={index}
            style={[
              waveStyles.bar,
              {
                width: size * 0.08,
                height: size * 0.5,
                backgroundColor: colors[index],
                borderRadius: size * 0.04,
                marginHorizontal: size * 0.02,
                transform: [{scaleY}],
              },
            ]}
          />
        );
      })}
    </View>
  );
});

const waveStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {},
});

// ============================================================================
// PULSE LOADER - Simple Pulsing Animation
// ============================================================================

const PulseLoader = memo<{size: number; color: string}>(({size, color}) => {
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulse = (value: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 1200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    createPulse(pulse1, 0).start();
    createPulse(pulse2, 400).start();
    createPulse(pulse3, 800).start();
  }, []);

  const pulses = [pulse1, pulse2, pulse3];

  return (
    <View style={[pulseStyles.container, {width: size, height: size}]}>
      {pulses.map((pulse, index) => {
        const scale = pulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 1.5],
        });

        const opacity = pulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0.6, 0],
        });

        return (
          <Animated.View
            key={index}
            style={[
              pulseStyles.ring,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderColor: color,
                transform: [{scale}],
                opacity,
              },
            ]}
          />
        );
      })}
      
      {/* Center dot */}
      <LinearGradient
        colors={[color, BRAND_COLORS.accent]}
        style={[
          pulseStyles.center,
          {
            width: size * 0.25,
            height: size * 0.25,
            borderRadius: size * 0.125,
          },
        ]}
      />
    </View>
  );
});

const pulseStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 3,
  },
  center: {
    position: 'absolute',
  },
});

// ============================================================================
// MINIMAL LOADER - Clean, Simple
// ============================================================================

const MinimalLoader = memo<{size: number; color: string}>(({size, color}) => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        minimalStyles.spinner,
        {
          width: size * 0.6,
          height: size * 0.6,
          borderRadius: size * 0.3,
          borderWidth: size * 0.05,
          borderTopColor: color,
          borderRightColor: `${color}40`,
          borderBottomColor: `${color}20`,
          borderLeftColor: `${color}60`,
          transform: [{rotate: spin}],
        },
      ]}
    />
  );
});

const minimalStyles = StyleSheet.create({
  spinner: {},
});

// ============================================================================
// BOOKS LOADER - Stacked Books Animation
// ============================================================================

const BooksLoader = memo<{size: number; color: string}>(({size, color}) => {
  const book1 = useRef(new Animated.Value(0)).current;
  const book2 = useRef(new Animated.Value(0)).current;
  const book3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateBook = (value: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 300,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.delay(600),
        ])
      );
    };

    animateBook(book1, 0).start();
    animateBook(book2, 200).start();
    animateBook(book3, 400).start();
  }, []);

  const books = [
    {anim: book1, color: color, width: 0.7},
    {anim: book2, color: BRAND_COLORS.accent, width: 0.6},
    {anim: book3, color: BRAND_COLORS.secondary, width: 0.5},
  ];

  return (
    <View style={[booksStyles.container, {width: size, height: size}]}>
      {books.map((book, index) => {
        const translateY = book.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -size * 0.15],
        });

        return (
          <Animated.View
            key={index}
            style={{transform: [{translateY}], zIndex: 3 - index}}
          >
            <LinearGradient
              colors={[book.color, `${book.color}CC`]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={[
                booksStyles.book,
                {
                  width: size * book.width,
                  height: size * 0.15,
                  borderRadius: size * 0.02,
                  marginBottom: -size * 0.05,
                },
              ]}
            >
              {/* Page lines */}
              <View style={[booksStyles.pageLines, {height: '60%'}]}>
                <View style={booksStyles.line} />
                <View style={booksStyles.line} />
              </View>
            </LinearGradient>
          </Animated.View>
        );
      })}
    </View>
  );
});

const booksStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  book: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  pageLines: {
    width: 6,
    justifyContent: 'space-evenly',
  },
  line: {
    height: 1.5,
    width: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
  },
});

// ============================================================================
// MAIN PREMIUM LOADING COMPONENT
// ============================================================================

export const PremiumLoading: React.FC<PremiumLoadingProps> = memo(({
  variant = 'graduation',
  size = 'medium',
  message,
  subMessage,
  fullScreen = false,
  overlay = false,
  transparent = false,
  showLogo = false,
  style,
}) => {
  const {colors, isDark} = useTheme();
  const config = SIZE_CONFIG[size];
  const primaryColor = colors.primary || BRAND_COLORS.primary;

  // Render the appropriate loader
  const renderLoader = () => {
    switch (variant) {
      case 'graduation':
        return <GraduationLoader size={config.container} color={primaryColor} />;
      case 'books':
        return <BooksLoader size={config.container} color={primaryColor} />;
      case 'pulse':
        return <PulseLoader size={config.container} color={primaryColor} />;
      case 'wave':
        return <WaveLoader size={config.container} color={primaryColor} />;
      case 'orbit':
        return <OrbitLoader size={config.container} color={primaryColor} />;
      case 'minimal':
      default:
        return <MinimalLoader size={config.container} color={primaryColor} />;
    }
  };

  const content = (
    <View style={[styles.contentContainer, style]}>
      {renderLoader()}
      
      {message && (
        <Text
          style={[
            styles.message,
            {
              color: colors.text,
              fontSize: config.text,
              marginTop: SPACING.md,
            },
          ]}
        >
          {message}
        </Text>
      )}
      
      {subMessage && (
        <Text
          style={[
            styles.subMessage,
            {
              color: colors.textSecondary,
              fontSize: config.subText,
            },
          ]}
        >
          {subMessage}
        </Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View
        style={[
          styles.fullScreen,
          {
            backgroundColor: transparent
              ? 'transparent'
              : colors.background,
          },
        ]}
      >
        {content}
      </View>
    );
  }

  if (overlay) {
    return (
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: isDark
              ? 'rgba(0, 0, 0, 0.85)'
              : 'rgba(255, 255, 255, 0.9)',
          },
        ]}
      >
        <View
          style={[
            styles.overlayCard,
            {
              backgroundColor: colors.card,
              ...Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 8},
                  shadowOpacity: 0.15,
                  shadowRadius: 24,
                },
                android: {
                  elevation: 12,
                },
              }),
            },
          ]}
        >
          {content}
        </View>
      </View>
    );
  }

  return content;
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  overlayCard: {
    borderRadius: 20,
    padding: SPACING.xl,
    minWidth: 180,
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  message: {
    fontWeight: FONTS.weight.semiBold,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subMessage: {
    marginTop: SPACING.xs,
    textAlign: 'center',
    opacity: 0.7,
  },
});

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export const FullScreenLoader: React.FC<Omit<PremiumLoadingProps, 'fullScreen'>> = (props) => (
  <PremiumLoading {...props} fullScreen />
);

export const OverlayLoader: React.FC<Omit<PremiumLoadingProps, 'overlay'>> = (props) => (
  <PremiumLoading {...props} overlay />
);

export default PremiumLoading;
