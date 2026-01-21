/**
 * OnboardingIllustrations - Custom Illustrations for Onboarding
 * 
 * Beautiful animated illustrations for each onboarding slide.
 * Built with pure React Native components - no external dependencies.
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
  Text,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ============================================================================
// BASE ILLUSTRATION COMPONENT
// ============================================================================

interface IllustrationProps {
  size: number;
  isActive: boolean;
  primaryColor: string;
  secondaryColor: string;
}

// ============================================================================
// UNIVERSITY ILLUSTRATION - For "Welcome to PakUni"
// ============================================================================

export class UniversityIllustration extends React.Component<IllustrationProps> {
  private scale = new Animated.Value(0.8);
  private opacity = new Animated.Value(0);
  private bounce = new Animated.Value(0);
  private sparkle = new Animated.Value(0);
  private animation: Animated.CompositeAnimation | null = null;

  componentDidMount() {
    if (this.props.isActive) {
      this.animateIn();
    }
  }

  componentDidUpdate(prevProps: IllustrationProps) {
    if (this.props.isActive && !prevProps.isActive) {
      this.animateIn();
    } else if (!this.props.isActive && prevProps.isActive) {
      this.animateOut();
    }
  }

  componentWillUnmount() {
    this.animation?.stop();
  }

  private animateIn() {
    Animated.parallel([
      Animated.spring(this.scale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(this.opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Bounce animation
    this.animation = Animated.loop(
      Animated.sequence([
        Animated.timing(this.bounce, {
          toValue: -5,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(this.bounce, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    this.animation.start();

    // Sparkle animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.sparkle, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(this.sparkle, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }

  private animateOut() {
    this.animation?.stop();
    this.scale.setValue(0.8);
    this.opacity.setValue(0);
    this.bounce.setValue(0);
  }

  render() {
    const {size, primaryColor, secondaryColor} = this.props;

    return (
      <Animated.View
        style={[
          styles.illustrationContainer,
          {
            width: size,
            height: size,
            opacity: this.opacity,
            transform: [{scale: this.scale}, {translateY: this.bounce}],
          },
        ]}
      >
        {/* Main Building */}
        <View style={[styles.uniBuilding, {backgroundColor: primaryColor}]}>
          {/* Dome */}
          <View style={[styles.uniDome, {backgroundColor: secondaryColor}]} />
          
          {/* Pillars */}
          <View style={styles.uniPillars}>
            {[0, 1, 2].map(i => (
              <View key={i} style={[styles.uniPillar, {backgroundColor: 'white'}]} />
            ))}
          </View>
          
          {/* Windows */}
          <View style={styles.uniWindows}>
            {[0, 1, 2, 3].map(i => (
              <View key={i} style={[styles.uniWindow, {backgroundColor: secondaryColor}]} />
            ))}
          </View>
          
          {/* Door */}
          <View style={[styles.uniDoor, {backgroundColor: secondaryColor}]} />
        </View>

        {/* Graduation Cap */}
        <Animated.View style={[styles.gradCap, {opacity: this.sparkle}]}>
          <View style={[styles.capTop, {backgroundColor: primaryColor}]} />
          <View style={[styles.capTassel, {backgroundColor: secondaryColor}]} />
        </Animated.View>

        {/* Sparkles */}
        <Animated.View style={[styles.sparkle1, {opacity: this.sparkle}]}>
          <Text style={{color: secondaryColor, fontSize: 16}}>✦</Text>
        </Animated.View>
        <Animated.View style={[styles.sparkle2, {opacity: this.sparkle}]}>
          <Text style={{color: primaryColor, fontSize: 12}}>✦</Text>
        </Animated.View>
      </Animated.View>
    );
  }
}

// ============================================================================
// CALCULATOR ILLUSTRATION - For "Smart Calculators"
// ============================================================================

export class CalculatorIllustration extends React.Component<IllustrationProps> {
  private scale = new Animated.Value(0.8);
  private opacity = new Animated.Value(0);
  private floatY = new Animated.Value(0);
  private buttonPulse = new Animated.Value(1);
  private animation: Animated.CompositeAnimation | null = null;

  componentDidMount() {
    if (this.props.isActive) {
      this.animateIn();
    }
  }

  componentDidUpdate(prevProps: IllustrationProps) {
    if (this.props.isActive && !prevProps.isActive) {
      this.animateIn();
    } else if (!this.props.isActive && prevProps.isActive) {
      this.animateOut();
    }
  }

  componentWillUnmount() {
    this.animation?.stop();
  }

  private animateIn() {
    Animated.parallel([
      Animated.spring(this.scale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(this.opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Float animation
    this.animation = Animated.loop(
      Animated.sequence([
        Animated.timing(this.floatY, {
          toValue: -8,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(this.floatY, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    this.animation.start();

    // Button pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.buttonPulse, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(this.buttonPulse, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }

  private animateOut() {
    this.animation?.stop();
    this.scale.setValue(0.8);
    this.opacity.setValue(0);
    this.floatY.setValue(0);
  }

  render() {
    const {size, primaryColor, secondaryColor} = this.props;

    return (
      <Animated.View
        style={[
          styles.illustrationContainer,
          {
            width: size,
            height: size,
            opacity: this.opacity,
            transform: [{scale: this.scale}],
          },
        ]}
      >
        {/* Calculator Body */}
        <Animated.View
          style={[
            styles.calcBody,
            {
              backgroundColor: primaryColor,
              transform: [{translateY: this.floatY}],
            },
          ]}
        >
          {/* Screen */}
          <View style={[styles.calcScreen, {backgroundColor: secondaryColor}]}>
            <Text style={styles.calcScreenText}>99.9%</Text>
          </View>

          {/* Buttons */}
          <View style={styles.calcButtons}>
            {Array.from({length: 9}, (_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.calcButton,
                  {
                    backgroundColor: 'white',
                    transform: [{scale: i === 4 ? this.buttonPulse : 1}],
                  },
                ]}
              >
                <Text style={[styles.calcButtonText, {color: primaryColor}]}>
                  {i + 1}
                </Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Floating Numbers */}
        <Animated.View style={[styles.floatingNumber, {left: '10%', top: '15%', transform: [{translateY: this.floatY}]}]}>
          <Text style={{color: secondaryColor, fontSize: 14, fontWeight: 'bold'}}>+</Text>
        </Animated.View>
        <Animated.View style={[styles.floatingNumber, {right: '15%', top: '20%', transform: [{translateY: this.floatY}]}]}>
          <Text style={{color: primaryColor, fontSize: 14, fontWeight: 'bold'}}>%</Text>
        </Animated.View>
      </Animated.View>
    );
  }
}

// ============================================================================
// SCHOLARSHIP ILLUSTRATION - For "Scholarship Finder"
// ============================================================================

export class ScholarshipIllustration extends React.Component<IllustrationProps> {
  private scale = new Animated.Value(0.8);
  private opacity = new Animated.Value(0);
  private coinBounce = new Animated.Value(0);
  private shine = new Animated.Value(0);
  private animation: Animated.CompositeAnimation | null = null;

  componentDidMount() {
    if (this.props.isActive) {
      this.animateIn();
    }
  }

  componentDidUpdate(prevProps: IllustrationProps) {
    if (this.props.isActive && !prevProps.isActive) {
      this.animateIn();
    } else if (!this.props.isActive && prevProps.isActive) {
      this.animateOut();
    }
  }

  componentWillUnmount() {
    this.animation?.stop();
  }

  private animateIn() {
    Animated.parallel([
      Animated.spring(this.scale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(this.opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Coin bounce
    this.animation = Animated.loop(
      Animated.sequence([
        Animated.timing(this.coinBounce, {
          toValue: -10,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(this.coinBounce, {
          toValue: 0,
          duration: 800,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    this.animation.start();

    // Shine effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.shine, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(this.shine, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }

  private animateOut() {
    this.animation?.stop();
    this.scale.setValue(0.8);
    this.opacity.setValue(0);
    this.coinBounce.setValue(0);
  }

  render() {
    const {size, primaryColor, secondaryColor} = this.props;

    return (
      <Animated.View
        style={[
          styles.illustrationContainer,
          {
            width: size,
            height: size,
            opacity: this.opacity,
            transform: [{scale: this.scale}],
          },
        ]}
      >
        {/* Trophy */}
        <View style={[styles.trophy, {backgroundColor: secondaryColor}]}>
          <View style={[styles.trophyTop, {backgroundColor: secondaryColor}]} />
          <View style={[styles.trophyBase, {backgroundColor: primaryColor}]} />
        </View>

        {/* Coins */}
        <Animated.View
          style={[
            styles.coin,
            {
              backgroundColor: '#FFD700',
              left: '20%',
              bottom: '25%',
              transform: [{translateY: this.coinBounce}],
            },
          ]}
        >
          <Text style={styles.coinText}>$</Text>
        </Animated.View>
        <Animated.View
          style={[
            styles.coin,
            {
              backgroundColor: '#FFD700',
              right: '20%',
              bottom: '30%',
              transform: [{translateY: Animated.multiply(this.coinBounce, -0.8)}],
            },
          ]}
        >
          <Text style={styles.coinText}>$</Text>
        </Animated.View>

        {/* Shine */}
        <Animated.View style={[styles.shine, {opacity: this.shine}]}>
          <Text style={{color: '#FFD700', fontSize: 24}}>✨</Text>
        </Animated.View>
      </Animated.View>
    );
  }
}

// ============================================================================
// GUIDES ILLUSTRATION - For "Expert Guides"
// ============================================================================

export class GuidesIllustration extends React.Component<IllustrationProps> {
  private scale = new Animated.Value(0.8);
  private opacity = new Animated.Value(0);
  private pageFlip = new Animated.Value(0);
  private animation: Animated.CompositeAnimation | null = null;

  componentDidMount() {
    if (this.props.isActive) {
      this.animateIn();
    }
  }

  componentDidUpdate(prevProps: IllustrationProps) {
    if (this.props.isActive && !prevProps.isActive) {
      this.animateIn();
    } else if (!this.props.isActive && prevProps.isActive) {
      this.animateOut();
    }
  }

  componentWillUnmount() {
    this.animation?.stop();
  }

  private animateIn() {
    Animated.parallel([
      Animated.spring(this.scale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(this.opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Page flip animation
    this.animation = Animated.loop(
      Animated.sequence([
        Animated.timing(this.pageFlip, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(this.pageFlip, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    this.animation.start();
  }

  private animateOut() {
    this.animation?.stop();
    this.scale.setValue(0.8);
    this.opacity.setValue(0);
    this.pageFlip.setValue(0);
  }

  render() {
    const {size, primaryColor, secondaryColor} = this.props;

    const pageRotation = this.pageFlip.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '-5deg'],
    });

    return (
      <Animated.View
        style={[
          styles.illustrationContainer,
          {
            width: size,
            height: size,
            opacity: this.opacity,
            transform: [{scale: this.scale}],
          },
        ]}
      >
        {/* Book Stack */}
        <View style={styles.bookStack}>
          {/* Bottom book */}
          <View style={[styles.book, {backgroundColor: secondaryColor, bottom: 0}]} />
          {/* Middle book */}
          <View style={[styles.book, {backgroundColor: primaryColor, bottom: 15}]} />
          {/* Top book (open) */}
          <Animated.View
            style={[
              styles.openBook,
              {
                backgroundColor: 'white',
                bottom: 30,
                transform: [{rotateZ: pageRotation}],
              },
            ]}
          >
            {/* Lines */}
            <View style={[styles.bookLine, {backgroundColor: primaryColor}]} />
            <View style={[styles.bookLine, {backgroundColor: secondaryColor}]} />
            <View style={[styles.bookLine, {backgroundColor: primaryColor, width: '60%'}]} />
          </Animated.View>
        </View>

        {/* Lightbulb */}
        <Animated.View style={[styles.lightbulb, {opacity: this.pageFlip}]}>
          <Text style={{color: '#FFD700', fontSize: 24}}>💡</Text>
        </Animated.View>
      </Animated.View>
    );
  }
}

// ============================================================================
// TOOLS ILLUSTRATION - For "Career Tools"
// ============================================================================

export class ToolsIllustration extends React.Component<IllustrationProps> {
  private scale = new Animated.Value(0.8);
  private opacity = new Animated.Value(0);
  private gearRotate = new Animated.Value(0);
  private animation: Animated.CompositeAnimation | null = null;

  componentDidMount() {
    if (this.props.isActive) {
      this.animateIn();
    }
  }

  componentDidUpdate(prevProps: IllustrationProps) {
    if (this.props.isActive && !prevProps.isActive) {
      this.animateIn();
    } else if (!this.props.isActive && prevProps.isActive) {
      this.animateOut();
    }
  }

  componentWillUnmount() {
    this.animation?.stop();
  }

  private animateIn() {
    Animated.parallel([
      Animated.spring(this.scale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(this.opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Gear rotation
    this.animation = Animated.loop(
      Animated.timing(this.gearRotate, {
        toValue: 360,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    this.animation.start();
  }

  private animateOut() {
    this.animation?.stop();
    this.scale.setValue(0.8);
    this.opacity.setValue(0);
    this.gearRotate.setValue(0);
  }

  render() {
    const {size, primaryColor, secondaryColor} = this.props;

    const gearRotation = this.gearRotate.interpolate({
      inputRange: [0, 360],
      outputRange: ['0deg', '360deg'],
    });

    const gearRotationReverse = this.gearRotate.interpolate({
      inputRange: [0, 360],
      outputRange: ['0deg', '-360deg'],
    });

    return (
      <Animated.View
        style={[
          styles.illustrationContainer,
          {
            width: size,
            height: size,
            opacity: this.opacity,
            transform: [{scale: this.scale}],
          },
        ]}
      >
        {/* Large Gear */}
        <Animated.View
          style={[
            styles.gear,
            styles.gearLarge,
            {
              backgroundColor: primaryColor,
              transform: [{rotate: gearRotation}],
            },
          ]}
        >
          <View style={[styles.gearCenter, {backgroundColor: 'white'}]} />
        </Animated.View>

        {/* Small Gear */}
        <Animated.View
          style={[
            styles.gear,
            styles.gearSmall,
            {
              backgroundColor: secondaryColor,
              transform: [{rotate: gearRotationReverse}],
            },
          ]}
        >
          <View style={[styles.gearCenter, {backgroundColor: 'white', width: 15, height: 15}]} />
        </Animated.View>

        {/* Wrench */}
        <View style={[styles.wrench, {backgroundColor: '#888'}]}>
          <View style={[styles.wrenchHead, {backgroundColor: '#888'}]} />
        </View>
      </Animated.View>
    );
  }
}

// ============================================================================
// DEADLINE ILLUSTRATION - For "Never Miss a Date"
// ============================================================================

export class DeadlineIllustration extends React.Component<IllustrationProps> {
  private scale = new Animated.Value(0.8);
  private opacity = new Animated.Value(0);
  private tick = new Animated.Value(0);
  private bell = new Animated.Value(0);
  private animation: Animated.CompositeAnimation | null = null;

  componentDidMount() {
    if (this.props.isActive) {
      this.animateIn();
    }
  }

  componentDidUpdate(prevProps: IllustrationProps) {
    if (this.props.isActive && !prevProps.isActive) {
      this.animateIn();
    } else if (!this.props.isActive && prevProps.isActive) {
      this.animateOut();
    }
  }

  componentWillUnmount() {
    this.animation?.stop();
  }

  private animateIn() {
    Animated.parallel([
      Animated.spring(this.scale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(this.opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Tick animation (clock hand)
    this.animation = Animated.loop(
      Animated.timing(this.tick, {
        toValue: 360,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    this.animation.start();

    // Bell shake
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.bell, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(this.bell, {
          toValue: -1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(this.bell, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
      ])
    ).start();
  }

  private animateOut() {
    this.animation?.stop();
    this.scale.setValue(0.8);
    this.opacity.setValue(0);
    this.tick.setValue(0);
  }

  render() {
    const {size, primaryColor, secondaryColor} = this.props;

    const handRotation = this.tick.interpolate({
      inputRange: [0, 360],
      outputRange: ['0deg', '360deg'],
    });

    const bellRotation = this.bell.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: ['-10deg', '0deg', '10deg'],
    });

    return (
      <Animated.View
        style={[
          styles.illustrationContainer,
          {
            width: size,
            height: size,
            opacity: this.opacity,
            transform: [{scale: this.scale}],
          },
        ]}
      >
        {/* Clock */}
        <View style={[styles.clock, {backgroundColor: 'white', borderColor: primaryColor}]}>
          {/* Clock Face */}
          <View style={[styles.clockCenter, {backgroundColor: primaryColor}]} />
          {/* Hour hand */}
          <View style={[styles.clockHand, styles.hourHand, {backgroundColor: primaryColor}]} />
          {/* Minute hand */}
          <Animated.View
            style={[
              styles.clockHand,
              styles.minuteHand,
              {
                backgroundColor: secondaryColor,
                transform: [{rotate: handRotation}],
              },
            ]}
          />
        </View>

        {/* Bell */}
        <Animated.View
          style={[
            styles.bellIcon,
            {transform: [{rotate: bellRotation}]},
          ]}
        >
          <Text style={{fontSize: 28}}>🔔</Text>
        </Animated.View>

        {/* Calendar */}
        <View style={[styles.miniCalendar, {backgroundColor: secondaryColor}]}>
          <Text style={styles.calendarDay}>15</Text>
        </View>
      </Animated.View>
    );
  }
}

// ============================================================================
// ACHIEVEMENT ILLUSTRATION - For "Track Progress"
// ============================================================================

export class AchievementIllustration extends React.Component<IllustrationProps> {
  private scale = new Animated.Value(0.8);
  private opacity = new Animated.Value(0);
  private progress = new Animated.Value(0);
  private star = new Animated.Value(0);
  private animation: Animated.CompositeAnimation | null = null;

  componentDidMount() {
    if (this.props.isActive) {
      this.animateIn();
    }
  }

  componentDidUpdate(prevProps: IllustrationProps) {
    if (this.props.isActive && !prevProps.isActive) {
      this.animateIn();
    } else if (!this.props.isActive && prevProps.isActive) {
      this.animateOut();
    }
  }

  componentWillUnmount() {
    this.animation?.stop();
  }

  private animateIn() {
    Animated.parallel([
      Animated.spring(this.scale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(this.opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress fill
    this.animation = Animated.loop(
      Animated.sequence([
        Animated.timing(this.progress, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(this.progress, {
          toValue: 0.3,
          duration: 1500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );
    this.animation.start();

    // Star pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.star, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(this.star, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }

  private animateOut() {
    this.animation?.stop();
    this.scale.setValue(0.8);
    this.opacity.setValue(0);
    this.progress.setValue(0);
  }

  render() {
    const {size, primaryColor, secondaryColor} = this.props;

    const progressWidth = this.progress.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    const starScale = this.star.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.3],
    });

    return (
      <Animated.View
        style={[
          styles.illustrationContainer,
          {
            width: size,
            height: size,
            opacity: this.opacity,
            transform: [{scale: this.scale}],
          },
        ]}
      >
        {/* Progress Bars */}
        <View style={styles.progressBars}>
          {[0.8, 0.6, 0.9].map((fill, i) => (
            <View key={i} style={[styles.progressBar, {backgroundColor: '#E0E0E0'}]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: i === 1 ? secondaryColor : primaryColor,
                    width: progressWidth,
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* Medal */}
        <View style={[styles.medal, {backgroundColor: '#FFD700'}]}>
          <Text style={styles.medalText}>★</Text>
        </View>

        {/* Stars */}
        <Animated.View style={[styles.starIcon, {left: '15%', transform: [{scale: starScale}]}]}>
          <Text style={{color: '#FFD700', fontSize: 18}}>⭐</Text>
        </Animated.View>
        <Animated.View style={[styles.starIcon, {right: '15%', transform: [{scale: starScale}]}]}>
          <Text style={{color: '#FFD700', fontSize: 14}}>⭐</Text>
        </Animated.View>
      </Animated.View>
    );
  }
}

// ============================================================================
// AI ILLUSTRATION - For "AI-Powered"
// ============================================================================

export class AIIllustration extends React.Component<IllustrationProps> {
  private scale = new Animated.Value(0.8);
  private opacity = new Animated.Value(0);
  private pulse = new Animated.Value(1);
  private wave1 = new Animated.Value(0);
  private wave2 = new Animated.Value(0);
  private wave3 = new Animated.Value(0);
  private animation: Animated.CompositeAnimation | null = null;

  componentDidMount() {
    if (this.props.isActive) {
      this.animateIn();
    }
  }

  componentDidUpdate(prevProps: IllustrationProps) {
    if (this.props.isActive && !prevProps.isActive) {
      this.animateIn();
    } else if (!this.props.isActive && prevProps.isActive) {
      this.animateOut();
    }
  }

  componentWillUnmount() {
    this.animation?.stop();
  }

  private animateIn() {
    Animated.parallel([
      Animated.spring(this.scale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(this.opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Brain pulse
    this.animation = Animated.loop(
      Animated.sequence([
        Animated.timing(this.pulse, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(this.pulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    this.animation.start();

    // Wave animations
    const createWave = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
    };

    createWave(this.wave1, 0).start();
    createWave(this.wave2, 300).start();
    createWave(this.wave3, 600).start();
  }

  private animateOut() {
    this.animation?.stop();
    this.scale.setValue(0.8);
    this.opacity.setValue(0);
    this.pulse.setValue(1);
  }

  render() {
    const {size, primaryColor, secondaryColor} = this.props;

    return (
      <Animated.View
        style={[
          styles.illustrationContainer,
          {
            width: size,
            height: size,
            opacity: this.opacity,
            transform: [{scale: this.scale}],
          },
        ]}
      >
        {/* Brain/AI Icon */}
        <Animated.View
          style={[
            styles.brainContainer,
            {
              backgroundColor: primaryColor,
              transform: [{scale: this.pulse}],
            },
          ]}
        >
          <Text style={styles.brainEmoji}>🧠</Text>
        </Animated.View>

        {/* Signal waves */}
        {[this.wave1, this.wave2, this.wave3].map((wave, i) => (
          <Animated.View
            key={i}
            style={[
              styles.signalWave,
              {
                borderColor: secondaryColor,
                width: 80 + i * 25,
                height: 80 + i * 25,
                opacity: wave,
                transform: [{scale: wave}],
              },
            ]}
          />
        ))}

        {/* Neural nodes */}
        <View style={[styles.neuralNode, {backgroundColor: secondaryColor, left: '20%', top: '30%'}]} />
        <View style={[styles.neuralNode, {backgroundColor: primaryColor, right: '20%', top: '35%'}]} />
        <View style={[styles.neuralNode, {backgroundColor: secondaryColor, left: '30%', bottom: '25%'}]} />
        <View style={[styles.neuralNode, {backgroundColor: primaryColor, right: '25%', bottom: '30%'}]} />
      </Animated.View>
    );
  }
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  // University styles
  uniBuilding: {
    width: 120,
    height: 100,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
    position: 'relative',
  },
  uniDome: {
    position: 'absolute',
    top: -25,
    width: 50,
    height: 30,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  uniPillars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginTop: 10,
  },
  uniPillar: {
    width: 10,
    height: 40,
    borderRadius: 2,
  },
  uniWindows: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 5,
    width: '80%',
  },
  uniWindow: {
    width: 20,
    height: 15,
    margin: 3,
    borderRadius: 2,
  },
  uniDoor: {
    position: 'absolute',
    bottom: 0,
    width: 25,
    height: 30,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  gradCap: {
    position: 'absolute',
    top: '5%',
    right: '15%',
  },
  capTop: {
    width: 30,
    height: 8,
    borderRadius: 2,
  },
  capTassel: {
    width: 3,
    height: 15,
    marginLeft: 10,
    borderRadius: 1.5,
  },
  sparkle1: {
    position: 'absolute',
    top: '10%',
    left: '20%',
  },
  sparkle2: {
    position: 'absolute',
    bottom: '20%',
    right: '15%',
  },

  // Calculator styles
  calcBody: {
    width: 100,
    height: 140,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  calcScreen: {
    width: '100%',
    height: 35,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 8,
    marginBottom: 10,
  },
  calcScreenText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  calcButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  calcButton: {
    width: 22,
    height: 22,
    borderRadius: 6,
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calcButtonText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  floatingNumber: {
    position: 'absolute',
  },

  // Scholarship styles
  trophy: {
    width: 60,
    height: 80,
    borderRadius: 8,
    alignItems: 'center',
  },
  trophyTop: {
    width: 50,
    height: 40,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  trophyBase: {
    width: 30,
    height: 15,
    marginTop: 5,
  },
  coin: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinText: {
    color: '#8B6914',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shine: {
    position: 'absolute',
    top: '10%',
    right: '20%',
  },

  // Guides styles
  bookStack: {
    width: 100,
    height: 100,
    position: 'relative',
    alignItems: 'center',
  },
  book: {
    position: 'absolute',
    width: 80,
    height: 20,
    borderRadius: 3,
  },
  openBook: {
    position: 'absolute',
    width: 90,
    height: 50,
    borderRadius: 5,
    padding: 8,
  },
  bookLine: {
    width: '80%',
    height: 4,
    borderRadius: 2,
    marginBottom: 6,
  },
  lightbulb: {
    position: 'absolute',
    top: '5%',
    right: '15%',
  },

  // Tools styles
  gear: {
    position: 'absolute',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gearLarge: {
    width: 70,
    height: 70,
    left: '20%',
    top: '25%',
  },
  gearSmall: {
    width: 45,
    height: 45,
    right: '25%',
    bottom: '30%',
  },
  gearCenter: {
    width: 25,
    height: 25,
    borderRadius: 999,
  },
  wrench: {
    position: 'absolute',
    width: 60,
    height: 10,
    borderRadius: 5,
    bottom: '20%',
    left: '30%',
    transform: [{rotate: '45deg'}],
  },
  wrenchHead: {
    position: 'absolute',
    left: -10,
    width: 20,
    height: 20,
    borderRadius: 5,
  },

  // Deadline styles
  clock: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
  },
  clockHand: {
    position: 'absolute',
    bottom: '50%',
    transformOrigin: 'bottom',
  },
  hourHand: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  minuteHand: {
    width: 3,
    height: 28,
    borderRadius: 1.5,
  },
  bellIcon: {
    position: 'absolute',
    top: '5%',
    right: '15%',
  },
  miniCalendar: {
    position: 'absolute',
    bottom: '15%',
    left: '20%',
    width: 35,
    height: 35,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDay: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Achievement styles
  progressBars: {
    width: '80%',
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    marginVertical: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  medal: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medalText: {
    fontSize: 24,
    color: '#8B6914',
  },
  starIcon: {
    position: 'absolute',
    top: '20%',
  },

  // AI styles
  brainContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brainEmoji: {
    fontSize: 40,
  },
  signalWave: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2,
  },
  neuralNode: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default {
  UniversityIllustration,
  CalculatorIllustration,
  ScholarshipIllustration,
  GuidesIllustration,
  ToolsIllustration,
  DeadlineIllustration,
  AchievementIllustration,
  AIIllustration,
};
