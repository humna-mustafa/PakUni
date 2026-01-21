/**
 * OnboardingAnimations - Animation Components for Onboarding
 * 
 * Features:
 * - Particle systems and floating shapes
 * - Gradient orbs with pulse effects
 * - Animated icon containers
 * - Progress indicators and sparkles
 * 
 * @author PakUni Team
 * @version 2.0.0
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Platform,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// ============================================================================
// PARTICLE SYSTEM - Floating particles background
// ============================================================================

interface ParticleSystemProps {
  colors: string[];
  count?: number;
  minSize?: number;
  maxSize?: number;
}

interface ParticleData {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  animY: Animated.Value;
  animOpacity: Animated.Value;
}

export class ParticleSystem extends React.Component<ParticleSystemProps> {
  private particles: ParticleData[] = [];
  private animations: Animated.CompositeAnimation[] = [];

  constructor(props: ParticleSystemProps) {
    super(props);
    const count = props.count || 15;
    const minSize = props.minSize || 4;
    const maxSize = props.maxSize || 10;

    this.particles = Array.from({length: count}, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      y: SCREEN_HEIGHT * 0.6 + Math.random() * SCREEN_HEIGHT * 0.4,
      size: minSize + Math.random() * (maxSize - minSize),
      color: props.colors[i % props.colors.length],
      animY: new Animated.Value(0),
      animOpacity: new Animated.Value(0),
    }));
  }

  componentDidMount() {
    this.particles.forEach((p, i) => {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.parallel([
            Animated.timing(p.animOpacity, {
              toValue: 0.7,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(p.animY, {
              toValue: -300,
              duration: 4000 + Math.random() * 2000,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(p.animOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(p.animY, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      this.animations.push(anim);
      anim.start();
    });
  }

  componentWillUnmount() {
    this.animations.forEach(a => a.stop());
  }

  render() {
    return (
      <View style={styles.particleContainer}>
        {this.particles.map(p => (
          <Animated.View
            key={p.id}
            style={[
              styles.particle,
              {
                width: p.size,
                height: p.size,
                borderRadius: p.size / 2,
                backgroundColor: p.color,
                left: p.x,
                top: p.y,
                opacity: p.animOpacity,
                transform: [{translateY: p.animY}],
              },
            ]}
          />
        ))}
      </View>
    );
  }
}

// ============================================================================
// GRADIENT ORB - Pulsing gradient circle
// ============================================================================

interface GradientOrbProps {
  colors: string[];
  size: number;
  animated?: boolean;
  pulseScale?: number;
  duration?: number;
}

export class GradientOrb extends React.Component<GradientOrbProps> {
  private scale = new Animated.Value(1);
  private opacity = new Animated.Value(0.6);
  private animation: Animated.CompositeAnimation | null = null;

  componentDidMount() {
    const {animated = true, pulseScale = 1.15, duration = 3000} = this.props;
    if (!animated) return;

    this.animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(this.scale, {
            toValue: pulseScale,
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(this.opacity, {
            toValue: 0.3,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(this.scale, {
            toValue: 1,
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(this.opacity, {
            toValue: 0.6,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    this.animation.start();
  }

  componentWillUnmount() {
    this.animation?.stop();
  }

  render() {
    const {colors, size} = this.props;
    return (
      <Animated.View
        style={[
          styles.orbContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{scale: this.scale}],
            opacity: this.opacity,
          },
        ]}
      >
        <LinearGradient
          colors={colors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[styles.orbGradient, {borderRadius: size / 2}]}
        />
      </Animated.View>
    );
  }
}

// ============================================================================
// FLOATING SHAPES - Decorative background shapes
// ============================================================================

interface FloatingShapesProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export class FloatingShapes extends React.Component<FloatingShapesProps> {
  private float1 = new Animated.Value(0);
  private float2 = new Animated.Value(0);
  private float3 = new Animated.Value(0);
  private rotate1 = new Animated.Value(0);
  private animations: Animated.CompositeAnimation[] = [];

  componentDidMount() {
    // Float animations
    const float1Anim = Animated.loop(
      Animated.sequence([
        Animated.timing(this.float1, {
          toValue: 20,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(this.float1, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const float2Anim = Animated.loop(
      Animated.sequence([
        Animated.timing(this.float2, {
          toValue: -25,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(this.float2, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const float3Anim = Animated.loop(
      Animated.sequence([
        Animated.timing(this.float3, {
          toValue: 15,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(this.float3, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const rotateAnim = Animated.loop(
      Animated.timing(this.rotate1, {
        toValue: 360,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    this.animations = [float1Anim, float2Anim, float3Anim, rotateAnim];
    this.animations.forEach(a => a.start());
  }

  componentWillUnmount() {
    this.animations.forEach(a => a.stop());
  }

  render() {
    const {primaryColor, secondaryColor, accentColor} = this.props;

    const rotation = this.rotate1.interpolate({
      inputRange: [0, 360],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <View style={styles.floatingContainer}>
        {/* Large orb top-right */}
        <Animated.View
          style={[
            styles.floatingShape,
            {
              top: -60,
              right: -40,
              transform: [{translateY: this.float1}, {rotate: rotation}],
            },
          ]}
        >
          <GradientOrb
            colors={[primaryColor, `${primaryColor}80`]}
            size={180}
            pulseScale={1.1}
          />
        </Animated.View>

        {/* Medium orb left */}
        <Animated.View
          style={[
            styles.floatingShape,
            {
              top: SCREEN_HEIGHT * 0.25,
              left: -50,
              transform: [{translateY: this.float2}],
            },
          ]}
        >
          <GradientOrb
            colors={[secondaryColor, `${secondaryColor}60`]}
            size={120}
            duration={4000}
          />
        </Animated.View>

        {/* Small orb bottom-right */}
        <Animated.View
          style={[
            styles.floatingShape,
            {
              bottom: SCREEN_HEIGHT * 0.15,
              right: -30,
              transform: [{translateY: this.float3}],
            },
          ]}
        >
          <GradientOrb
            colors={[accentColor, `${accentColor}50`]}
            size={80}
            duration={2500}
          />
        </Animated.View>

        {/* Decorative dots */}
        <Animated.View
          style={[
            styles.floatingShape,
            {
              top: SCREEN_HEIGHT * 0.4,
              right: 40,
              transform: [{translateY: this.float1}],
            },
          ]}
        >
          <View style={[styles.dotShape, {backgroundColor: primaryColor}]} />
        </Animated.View>

        <Animated.View
          style={[
            styles.floatingShape,
            {
              bottom: SCREEN_HEIGHT * 0.35,
              left: 50,
              transform: [{translateY: this.float2}],
            },
          ]}
        >
          <View style={[styles.dotShape, {backgroundColor: secondaryColor, width: 8, height: 8}]} />
        </Animated.View>
      </View>
    );
  }
}

// ============================================================================
// ANIMATED ICON CONTAINER - Icon with entry animation and glow
// ============================================================================

interface AnimatedIconContainerProps {
  children: React.ReactNode;
  colors: string[];
  size: number;
  isActive: boolean;
  delay?: number;
}

export class AnimatedIconContainer extends React.Component<AnimatedIconContainerProps> {
  private scale = new Animated.Value(0.5);
  private opacity = new Animated.Value(0);
  private rotate = new Animated.Value(-10);
  private float = new Animated.Value(0);
  private floatAnimation: Animated.CompositeAnimation | null = null;

  componentDidMount() {
    if (this.props.isActive) {
      this.animateIn();
    }
  }

  componentDidUpdate(prevProps: AnimatedIconContainerProps) {
    if (this.props.isActive && !prevProps.isActive) {
      this.animateIn();
    } else if (!this.props.isActive && prevProps.isActive) {
      this.animateOut();
    }
  }

  componentWillUnmount() {
    this.floatAnimation?.stop();
  }

  private animateIn() {
    const {delay = 0} = this.props;

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(this.scale, {
          toValue: 1,
          tension: 50,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(this.opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(this.rotate, {
          toValue: 0,
          tension: 40,
          friction: 5,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Start float animation
    this.floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(this.float, {
          toValue: -8,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(this.float, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    this.floatAnimation.start();
  }

  private animateOut() {
    this.floatAnimation?.stop();
    this.scale.setValue(0.5);
    this.opacity.setValue(0);
    this.rotate.setValue(-10);
    this.float.setValue(0);
  }

  render() {
    const {children, colors, size} = this.props;

    const rotation = this.rotate.interpolate({
      inputRange: [-10, 0],
      outputRange: ['-10deg', '0deg'],
    });

    return (
      <Animated.View
        style={[
          styles.iconContainer,
          {
            width: size,
            height: size,
            opacity: this.opacity,
            transform: [
              {scale: this.scale},
              {rotate: rotation},
              {translateY: this.float},
            ],
          },
        ]}
      >
        {/* Glow */}
        <View style={[styles.iconGlow, {backgroundColor: colors[0]}]} />

        {/* Gradient background */}
        <LinearGradient
          colors={colors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[styles.iconGradient, {borderRadius: size * 0.28}]}
        >
          {/* Decorative elements */}
          <View style={[styles.iconDeco1, {backgroundColor: 'rgba(255,255,255,0.15)'}]} />
          <View style={[styles.iconDeco2, {backgroundColor: 'rgba(255,255,255,0.1)'}]} />

          {/* Icon */}
          <View style={styles.iconInner}>
            {children}
          </View>
        </LinearGradient>
      </Animated.View>
    );
  }
}

// ============================================================================
// SPARKLE EFFECT - Twinkling stars
// ============================================================================

interface SparkleSystemProps {
  color: string;
  count?: number;
  area?: {width: number; height: number};
}

interface SparkleData {
  id: number;
  x: number;
  y: number;
  size: number;
  scale: Animated.Value;
  opacity: Animated.Value;
}

export class SparkleSystem extends React.Component<SparkleSystemProps> {
  private sparkles: SparkleData[] = [];
  private animations: Animated.CompositeAnimation[] = [];

  constructor(props: SparkleSystemProps) {
    super(props);
    const count = props.count || 8;
    const area = props.area || {width: SCREEN_WIDTH, height: 200};

    this.sparkles = Array.from({length: count}, (_, i) => ({
      id: i,
      x: Math.random() * area.width,
      y: Math.random() * area.height,
      size: 6 + Math.random() * 6,
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }));
  }

  componentDidMount() {
    this.sparkles.forEach((s, i) => {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.delay(i * 400 + Math.random() * 1000),
          Animated.parallel([
            Animated.timing(s.scale, {
              toValue: 1,
              duration: 300,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(s.opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(s.scale, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(s.opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(1000 + Math.random() * 2000),
        ])
      );
      this.animations.push(anim);
      anim.start();
    });
  }

  componentWillUnmount() {
    this.animations.forEach(a => a.stop());
  }

  render() {
    const {color} = this.props;
    return (
      <View style={styles.sparkleContainer}>
        {this.sparkles.map(s => (
          <Animated.View
            key={s.id}
            style={[
              styles.sparkle,
              {
                left: s.x,
                top: s.y,
                opacity: s.opacity,
                transform: [{scale: s.scale}],
              },
            ]}
          >
            <View style={[styles.sparkleArm, styles.sparkleHorizontal, {backgroundColor: color, width: s.size}]} />
            <View style={[styles.sparkleArm, styles.sparkleVertical, {backgroundColor: color, height: s.size}]} />
          </Animated.View>
        ))}
      </View>
    );
  }
}

// ============================================================================
// WAVE ANIMATION
// ============================================================================

interface WaveAnimationProps {
  color: string;
  height: number;
}

export class WaveAnimation extends React.Component<WaveAnimationProps> {
  private wave1 = new Animated.Value(0);
  private wave2 = new Animated.Value(0);
  private wave3 = new Animated.Value(0);
  private animations: Animated.CompositeAnimation[] = [];

  componentDidMount() {
    const createWave = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    this.animations = [
      createWave(this.wave1, 0),
      createWave(this.wave2, 400),
      createWave(this.wave3, 800),
    ];
    this.animations.forEach(a => a.start());
  }

  componentWillUnmount() {
    this.animations.forEach(a => a.stop());
  }

  render() {
    const {color, height} = this.props;

    const translateY1 = this.wave1.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -15],
    });
    const translateY2 = this.wave2.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -20],
    });
    const translateY3 = this.wave3.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -10],
    });

    return (
      <View style={[styles.waveContainer, {height}]}>
        <Animated.View
          style={[styles.wave, {backgroundColor: `${color}30`, transform: [{translateY: translateY1}]}]}
        />
        <Animated.View
          style={[styles.wave, {backgroundColor: `${color}20`, transform: [{translateY: translateY2}]}]}
        />
        <Animated.View
          style={[styles.wave, {backgroundColor: `${color}10`, transform: [{translateY: translateY3}]}]}
        />
      </View>
    );
  }
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Particles
  particleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
  },

  // Orb
  orbContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbGradient: {
    width: '100%',
    height: '100%',
  },

  // Floating shapes
  floatingContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: -1,
  },
  floatingShape: {
    position: 'absolute',
  },
  dotShape: {
    width: 12,
    height: 12,
    borderRadius: 999,
    opacity: 0.5,
  },

  // Icon container
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    borderRadius: 999,
    opacity: 0.2,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 12},
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  iconDeco1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  iconDeco2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  iconInner: {
    width: '55%',
    height: '55%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sparkles
  sparkleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'visible',
  },
  sparkle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleArm: {
    position: 'absolute',
    borderRadius: 2,
  },
  sparkleHorizontal: {
    height: 2,
  },
  sparkleVertical: {
    width: 2,
  },

  // Wave
  waveContainer: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  wave: {
    position: 'absolute',
    width: '200%',
    height: '100%',
    borderTopLeftRadius: 1000,
    borderTopRightRadius: 1000,
    left: '-50%',
  },
});

export default {
  ParticleSystem,
  GradientOrb,
  FloatingShapes,
  AnimatedIconContainer,
  SparkleSystem,
  WaveAnimation,
};
