/**
 * PremiumSplashScreen - Beautiful Animated Splash Screen
 * 
 * Features:
 * - Premium animated PakUni logo
 * - Smooth entry animations
 * - Brand colors and gradients
 * - Professional loading indicator
 * 
 * @author PakUni Team
 * @version 1.0.0
 */

import React, {useEffect, useRef, memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {AppLogo, GraduationCapIcon, BRAND_COLORS} from '../components/AppLogo';
import {PremiumLoading} from '../components/PremiumLoading';
import {useTheme} from '../contexts/ThemeContext';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

interface PremiumSplashScreenProps {
  onAnimationComplete?: () => void;
  duration?: number;
}

const PremiumSplashScreen: React.FC<PremiumSplashScreenProps> = memo(({
  onAnimationComplete,
  duration = 2500,
}) => {
  const {colors, isDark} = useTheme();
  
  // Animation values
  const logoFade = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const textSlide = useRef(new Animated.Value(30)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const loadingFade = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // Phase 1: Logo appears with scale and fade
      Animated.parallel([
        Animated.timing(logoFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      
      // Phase 2: App name slides in
      Animated.parallel([
        Animated.timing(textSlide, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(textFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),

      // Phase 3: Tagline fades in
      Animated.timing(taglineFade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),

      // Phase 4: Loading indicator
      Animated.timing(loadingFade, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsing animation for loading
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Call completion callback
    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onAnimationComplete]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background Gradient */}
      <LinearGradient
        colors={isDark 
          ? ['#0F172A', '#1E293B', '#0F172A'] 
          : ['#F8FAFC', '#EEF2FF', '#F8FAFC']
        }
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative Background Elements */}
      <View style={styles.decorContainer}>
        <View style={[
          styles.decorCircle,
          styles.decorCircle1,
          {backgroundColor: BRAND_COLORS.primary, opacity: isDark ? 0.1 : 0.05}
        ]} />
        <View style={[
          styles.decorCircle,
          styles.decorCircle2,
          {backgroundColor: BRAND_COLORS.accent, opacity: isDark ? 0.08 : 0.04}
        ]} />
        <View style={[
          styles.decorCircle,
          styles.decorCircle3,
          {backgroundColor: BRAND_COLORS.secondary, opacity: isDark ? 0.06 : 0.03}
        ]} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Animated Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoFade,
              transform: [{scale: logoScale}],
            },
          ]}
        >
          {/* Glow behind logo */}
          <View style={[
            styles.logoGlow,
            {backgroundColor: BRAND_COLORS.primary}
          ]} />
          
          <GraduationCapIcon
            size={120}
            primaryColor={BRAND_COLORS.primary}
            secondaryColor={BRAND_COLORS.accent}
            animated
          />
        </Animated.View>

        {/* App Name */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textFade,
              transform: [{translateY: textSlide}],
            },
          ]}
        >
          <Text style={[styles.appName, {color: colors.text}]}>
            Pak<Text style={{color: BRAND_COLORS.primary}}>Uni</Text>
          </Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={{opacity: taglineFade}}>
          <Text style={[styles.tagline, {color: colors.textSecondary}]}>
            Your Gateway to Pakistani Universities
          </Text>
        </Animated.View>

        {/* Pakistan Flag Emoji */}
        <Animated.View style={[styles.flagContainer, {opacity: taglineFade}]}>
          <Text style={styles.flag}>🇵🇰</Text>
        </Animated.View>
      </View>

      {/* Loading Indicator - Premium Animated */}
      <Animated.View
        style={[
          styles.loadingContainer,
          {opacity: loadingFade}
        ]}
      >
        <PremiumLoading
          variant="wave"
          size="small"
          message="Loading..."
        />
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, {color: colors.textSecondary}]}>
          Powered by AI Recommendations
        </Text>
        <Text style={[styles.versionText, {color: colors.textSecondary}]}>
          Version 2.0
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
  decorCircle1: {
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_WIDTH * 1.5,
    top: -SCREEN_WIDTH * 0.5,
    right: -SCREEN_WIDTH * 0.5,
  },
  decorCircle2: {
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_WIDTH * 1.2,
    bottom: -SCREEN_WIDTH * 0.4,
    left: -SCREEN_WIDTH * 0.4,
  },
  decorCircle3: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    top: SCREEN_HEIGHT * 0.3,
    left: -SCREEN_WIDTH * 0.3,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.15,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  appName: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
    }),
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  flagContainer: {
    marginTop: 16,
  },
  flag: {
    fontSize: 32,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 120,
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  versionText: {
    fontSize: 10,
    opacity: 0.6,
  },
});

export default PremiumSplashScreen;
