import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../icons';
import {TYPOGRAPHY, SPACING, RADIUS} from '../../constants/design';

interface CalculatorHeaderProps {
  isDark: boolean;
  onBack: () => void;
}

const CalculatorHeader = React.memo(({isDark, onBack}: CalculatorHeaderProps) => {
  return (
    <LinearGradient
      colors={isDark ? ['#1D2127', '#1A2540', '#4573DF'] : ['#4573DF', '#3660C9', '#2A4FA8']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.headerGradient}>
      <View style={styles.headerDecoCircle1} />
      <View style={styles.headerDecoCircle2} />
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        accessibilityLabel="Go back"
        accessibilityRole="button">
        <Icon name="chevron-back" family="Ionicons" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>
            Merit Calculator
          </Text>
          <Text style={styles.subtitle}>
            Calculate your aggregate for university admissions
          </Text>
        </View>
        <View style={styles.headerIcon}>
          <Icon name="bar-chart-outline" family="Ionicons" size={32} color="#FFFFFF" />
        </View>
      </View>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  headerGradient: {
    margin: SPACING.lg,
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#4573DF',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  headerDecoCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  headerDecoCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weight.heavy,
    letterSpacing: -0.5,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 6,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.2,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});

export default CalculatorHeader;
