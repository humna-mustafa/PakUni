/**
 * ScreenDecorations - Lightweight Animation Components for All Screens
 * 
 * These are optimized versions of onboarding animations,
 * designed for subtle background decorations across the app.
 * 
 * @author PakUni Team
 * @version 1.0.0
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// ============================================================================
// SUBTLE FLOATING SHAPES - Light background decoration
// ============================================================================

interface SubtleFloatingShapesProps {
  colors: string[];
  opacity?: number;
  count?: number;
}

interface ShapeData {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
  animX: Animated.Value;
  animY: Animated.Value;
  animRotate: Animated.Value;
}

export class SubtleFloatingShapes extends React.Component<SubtleFloatingShapesProps> {
  private shapes: ShapeData[] = [];
  private animations: Animated.CompositeAnimation[] = [];

  constructor(props: SubtleFloatingShapesProps) {
    super(props);
    const count = props.count || 6;

    this.shapes = Array.from({length: count}, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT * 0.5,
      size: 30 + Math.random() * 50,
      rotation: Math.random() * 360,
      color: props.colors[i % props.colors.length],
      animX: new Animated.Value(0),
      animY: new Animated.Value(0),
      animRotate: new Animated.Value(0),
    }));
  }

  componentDidMount() {
    this.shapes.forEach((shape) => {
      const anim = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(shape.animX, {
              toValue: 20,
              duration: 4000 + Math.random() * 2000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(shape.animX, {
              toValue: -20,
              duration: 4000 + Math.random() * 2000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(shape.animX, {
              toValue: 0,
              duration: 4000 + Math.random() * 2000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(shape.animY, {
              toValue: -15,
              duration: 3000 + Math.random() * 2000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(shape.animY, {
              toValue: 15,
              duration: 3000 + Math.random() * 2000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(shape.animY, {
              toValue: 0,
              duration: 3000 + Math.random() * 2000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(shape.animRotate, {
            toValue: 1,
            duration: 20000 + Math.random() * 10000,
            easing: Easing.linear,
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
    const opacity = this.props.opacity || 0.08;
    
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {this.shapes.map(shape => {
          const rotate = shape.animRotate.interpolate({
            inputRange: [0, 1],
            outputRange: [`${shape.rotation}deg`, `${shape.rotation + 360}deg`],
          });

          return (
            <Animated.View
              key={shape.id}
              style={[
                styles.shape,
                {
                  width: shape.size,
                  height: shape.size,
                  borderRadius: shape.size / 2,
                  backgroundColor: shape.color,
                  opacity: opacity,
                  left: shape.x,
                  top: shape.y,
                  transform: [
                    {translateX: shape.animX},
                    {translateY: shape.animY},
                    {rotate},
                  ],
                },
              ]}
            />
          );
        })}
      </View>
    );
  }
}

// ============================================================================
// AMBIENT GLOW - Soft gradient orbs in background
// ============================================================================

interface AmbientGlowProps {
  primaryColor: string;
  secondaryColor?: string;
  position?: 'top' | 'bottom' | 'center';
  intensity?: number;
}

export class AmbientGlow extends React.Component<AmbientGlowProps> {
  private pulseAnim = new Animated.Value(0);
  private animation: Animated.CompositeAnimation | null = null;

  componentDidMount() {
    this.animation = Animated.loop(
      Animated.sequence([
        Animated.timing(this.pulseAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(this.pulseAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    this.animation.start();
  }

  componentWillUnmount() {
    this.animation?.stop();
  }

  render() {
    const {primaryColor, secondaryColor, position = 'top', intensity = 0.15} = this.props;
    
    const scale = this.pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.1],
    });

    const opacity = this.pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [intensity, intensity * 0.7],
    });

    const positionStyle: ViewStyle = 
      position === 'top' ? {top: -100} :
      position === 'bottom' ? {bottom: -100} :
      {top: SCREEN_HEIGHT * 0.3};

    return (
      <Animated.View
        style={[
          styles.ambientGlow,
          positionStyle,
          {
            opacity,
            transform: [{scale}],
          },
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={[primaryColor, secondaryColor || primaryColor, 'transparent']}
          style={styles.glowGradient}
          start={{x: 0.5, y: 0.5}}
          end={{x: 0.5, y: 1}}
        />
      </Animated.View>
    );
  }
}

// ============================================================================
// SPARKLE DECORATION - Twinkling star effect
// ============================================================================

interface SparkleDecorationProps {
  color: string;
  count?: number;
  size?: number;
  area?: {top: number; height: number};
}

interface SparkleData {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  animOpacity: Animated.Value;
  animScale: Animated.Value;
}

export class SparkleDecoration extends React.Component<SparkleDecorationProps> {
  private sparkles: SparkleData[] = [];
  private animations: Animated.CompositeAnimation[] = [];

  constructor(props: SparkleDecorationProps) {
    super(props);
    const count = props.count || 8;
    const size = props.size || 4;
    const area = props.area || {top: 0, height: 300};

    this.sparkles = Array.from({length: count}, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      y: area.top + Math.random() * area.height,
      size: size + Math.random() * 3,
      delay: Math.random() * 3000,
      animOpacity: new Animated.Value(0),
      animScale: new Animated.Value(0),
    }));
  }

  componentDidMount() {
    this.sparkles.forEach(sparkle => {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.delay(sparkle.delay),
          Animated.parallel([
            Animated.timing(sparkle.animOpacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(sparkle.animScale, {
              toValue: 1,
              duration: 500,
              easing: Easing.out(Easing.back(2)),
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(800),
          Animated.parallel([
            Animated.timing(sparkle.animOpacity, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(sparkle.animScale, {
              toValue: 0,
              duration: 500,
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
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {this.sparkles.map(sparkle => (
          <Animated.View
            key={sparkle.id}
            style={[
              styles.sparkle,
              {
                left: sparkle.x,
                top: sparkle.y,
                width: sparkle.size,
                height: sparkle.size,
                backgroundColor: color,
                opacity: sparkle.animOpacity,
                transform: [{scale: sparkle.animScale}],
              },
            ]}
          >
            <View style={[styles.sparkleCore, {backgroundColor: '#FFFFFF'}]} />
          </Animated.View>
        ))}
      </View>
    );
  }
}

// ============================================================================
// CELEBRATION PARTICLES - For achievement moments
// ============================================================================

interface CelebrationParticlesProps {
  colors: string[];
  active: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

interface CelebrationParticleData {
  id: number;
  x: number;
  color: string;
  animY: Animated.Value;
  animOpacity: Animated.Value;
  animRotate: Animated.Value;
  size: number;
}

export class CelebrationParticles extends React.Component<CelebrationParticlesProps> {
  private particles: CelebrationParticleData[] = [];
  private animations: Animated.CompositeAnimation[] = [];
  private mounted = false;

  constructor(props: CelebrationParticlesProps) {
    super(props);
    const count = props.intensity === 'high' ? 30 : props.intensity === 'medium' ? 20 : 12;

    this.particles = Array.from({length: count}, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      color: props.colors[i % props.colors.length],
      animY: new Animated.Value(SCREEN_HEIGHT + 100),
      animOpacity: new Animated.Value(0),
      animRotate: new Animated.Value(0),
      size: 6 + Math.random() * 8,
    }));
  }

  componentDidMount() {
    this.mounted = true;
    if (this.props.active) {
      this.startAnimation();
    }
  }

  componentDidUpdate(prevProps: CelebrationParticlesProps) {
    if (!prevProps.active && this.props.active) {
      this.startAnimation();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    this.animations.forEach(a => a.stop());
  }

  startAnimation = () => {
    this.particles.forEach((particle, i) => {
      particle.animY.setValue(SCREEN_HEIGHT + 100);
      particle.animOpacity.setValue(0);
      particle.animRotate.setValue(0);

      const anim = Animated.sequence([
        Animated.delay(i * 50),
        Animated.parallel([
          Animated.timing(particle.animY, {
            toValue: -100,
            duration: 2500 + Math.random() * 1000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(particle.animOpacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.delay(1500),
            Animated.timing(particle.animOpacity, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(particle.animRotate, {
            toValue: 2,
            duration: 2500,
            useNativeDriver: true,
          }),
        ]),
      ]);
      this.animations.push(anim);
      anim.start();
    });
  };

  render() {
    if (!this.props.active) return null;

    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {this.particles.map(particle => {
          const rotate = particle.animRotate.interpolate({
            inputRange: [0, 2],
            outputRange: ['0deg', '720deg'],
          });

          return (
            <Animated.View
              key={particle.id}
              style={[
                styles.celebrationParticle,
                {
                  left: particle.x,
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  opacity: particle.animOpacity,
                  transform: [
                    {translateY: particle.animY},
                    {rotate},
                  ],
                },
              ]}
            />
          );
        })}
      </View>
    );
  }
}

// ============================================================================
// ANIMATED HEADER BACKGROUND - Gradient with floating elements
// ============================================================================

interface AnimatedHeaderBgProps {
  colors: string[];
  children?: React.ReactNode;
  height?: number;
}

export class AnimatedHeaderBg extends React.Component<AnimatedHeaderBgProps> {
  private gradientShift = new Animated.Value(0);
  private animation: Animated.CompositeAnimation | null = null;

  componentDidMount() {
    this.animation = Animated.loop(
      Animated.sequence([
        Animated.timing(this.gradientShift, {
          toValue: 1,
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(this.gradientShift, {
          toValue: 0,
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );
    this.animation.start();
  }

  componentWillUnmount() {
    this.animation?.stop();
  }

  render() {
    const {colors, children, height = 200} = this.props;

    const startX = this.gradientShift.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.3],
    });

    return (
      <Animated.View style={{height}}>
        <LinearGradient
          colors={colors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={StyleSheet.absoluteFill}
        />
        <SubtleFloatingShapes 
          colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']} 
          opacity={0.1}
          count={4}
        />
        {children}
      </Animated.View>
    );
  }
}

// ============================================================================
// PULSE RING - Expanding ring animation
// ============================================================================

interface PulseRingProps {
  color: string;
  size: number;
  delay?: number;
}

export class PulseRing extends React.Component<PulseRingProps> {
  private scale = new Animated.Value(0.3);
  private opacity = new Animated.Value(1);
  private animation: Animated.CompositeAnimation | null = null;

  componentDidMount() {
    const {delay = 0} = this.props;
    
    this.animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(this.scale, {
            toValue: 1.5,
            duration: 2000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(this.opacity, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(this.scale, {
            toValue: 0.3,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(this.opacity, {
            toValue: 1,
            duration: 0,
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
    const {color, size} = this.props;

    return (
      <Animated.View
        style={[
          styles.pulseRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            opacity: this.opacity,
            transform: [{scale: this.scale}],
          },
        ]}
        pointerEvents="none"
      />
    );
  }
}

// ============================================================================
// FLOATING ICON - Icon with subtle float animation
// ============================================================================

interface FloatingIconProps {
  children: React.ReactNode;
  amplitude?: number;
  duration?: number;
}

export class FloatingIcon extends React.Component<FloatingIconProps> {
  private translateY = new Animated.Value(0);
  private animation: Animated.CompositeAnimation | null = null;

  componentDidMount() {
    const {amplitude = 6, duration = 2000} = this.props;
    
    this.animation = Animated.loop(
      Animated.sequence([
        Animated.timing(this.translateY, {
          toValue: -amplitude,
          duration: duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(this.translateY, {
          toValue: amplitude,
          duration: duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    this.animation.start();
  }

  componentWillUnmount() {
    this.animation?.stop();
  }

  render() {
    return (
      <Animated.View style={{transform: [{translateY: this.translateY}]}}>
        {this.props.children}
      </Animated.View>
    );
  }
}

// ============================================================================
// SHIMMER EFFECT - Loading shimmer decoration
// ============================================================================

interface ShimmerProps {
  width: number;
  height: number;
  baseColor?: string;
  highlightColor?: string;
}

export class Shimmer extends React.Component<ShimmerProps> {
  private translateX = new Animated.Value(-1);
  private animation: Animated.CompositeAnimation | null = null;

  componentDidMount() {
    this.animation = Animated.loop(
      Animated.timing(this.translateX, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    this.animation.start();
  }

  componentWillUnmount() {
    this.animation?.stop();
  }

  render() {
    const {width, height, baseColor = '#E0E0E0', highlightColor = '#F5F5F5'} = this.props;

    const translateX = this.translateX.interpolate({
      inputRange: [-1, 1],
      outputRange: [-width, width],
    });

    return (
      <View style={[styles.shimmerContainer, {width, height, backgroundColor: baseColor}]}>
        <Animated.View
          style={[
            styles.shimmerHighlight,
            {
              transform: [{translateX}],
            },
          ]}
        >
          <LinearGradient
            colors={['transparent', highlightColor, 'transparent']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={{width: width * 0.5, height}}
          />
        </Animated.View>
      </View>
    );
  }
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  shape: {
    position: 'absolute',
  },
  ambientGlow: {
    position: 'absolute',
    left: -50,
    right: -50,
    height: 300,
  },
  glowGradient: {
    flex: 1,
    borderRadius: 150,
  },
  sparkle: {
    position: 'absolute',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleCore: {
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  celebrationParticle: {
    position: 'absolute',
    borderRadius: 2,
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 2,
  },
  shimmerContainer: {
    overflow: 'hidden',
    borderRadius: 4,
  },
  shimmerHighlight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
});

export default {
  SubtleFloatingShapes,
  AmbientGlow,
  SparkleDecoration,
  CelebrationParticles,
  AnimatedHeaderBg,
  PulseRing,
  FloatingIcon,
  Shimmer,
};
