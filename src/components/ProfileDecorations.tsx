/**
 * ProfileHeaderDecorations - Animated decorations for Profile Screen
 * 
 * Lightweight animation overlay for the profile header section
 * 
 * @author PakUni Team
 * @version 1.0.0
 */

import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {
  SubtleFloatingShapes,
  SparkleDecoration,
  PulseRing,
} from '../components/animations';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface ProfileHeaderDecorationsProps {
  primaryColor: string;
  isDark: boolean;
}

/**
 * Animated decorations overlay for profile header
 * Place this as the first child inside the header gradient
 */
export class ProfileHeaderDecorations extends React.Component<ProfileHeaderDecorationsProps> {
  render() {
    const {primaryColor} = this.props;

    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Subtle floating shapes */}
        <SubtleFloatingShapes
          colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.1)']}
          opacity={0.1}
          count={3}
        />
        
        {/* Sparkles near avatar area */}
        <SparkleDecoration
          color="#FFFFFF"
          count={4}
          size={3}
          area={{top: 20, height: 100}}
        />
      </View>
    );
  }
}

/**
 * Pulse ring decoration for avatar area
 */
export class AvatarPulseRing extends React.Component<{color: string; size?: number}> {
  render() {
    const {color, size = 100} = this.props;
    
    return (
      <View style={styles.pulseContainer}>
        <PulseRing color={color} size={size} delay={0} />
        <PulseRing color={color} size={size + 20} delay={500} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  pulseContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default {
  ProfileHeaderDecorations,
  AvatarPulseRing,
};
