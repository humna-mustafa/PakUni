/**
 * GradientHeader Component
 * Professional header with gradient background
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import {COLORS, FONTS, SPACING} from '../constants/theme';

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  rightIcon?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  backgroundColor?: string;
  compact?: boolean;
}

export const GradientHeader: React.FC<GradientHeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  backgroundColor = COLORS.primary,
  compact = false,
}) => {
  return (
    <View style={[styles.container, {backgroundColor}, compact && styles.compact]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={backgroundColor}
        translucent={false}
      />
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {leftIcon && onLeftPress && (
            <TouchableOpacity style={styles.iconButton} onPress={onLeftPress}>
              <Text style={styles.iconText}>{leftIcon}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.centerSection}>
          <Text style={[styles.title, compact && styles.titleCompact]}>
            {title}
          </Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        <View style={styles.rightSection}>
          {rightIcon && onRightPress && (
            <TouchableOpacity style={styles.iconButton} onPress={onRightPress}>
              <Text style={styles.iconText}>{rightIcon}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  compact: {
    paddingBottom: 14,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  leftSection: {
    width: 40,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
  },
  iconButton: {
    padding: 4,
  },
  iconText: {
    fontSize: 22,
    color: COLORS.white,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  titleCompact: {
    fontSize: 17,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 3,
    textAlign: 'center',
  },
});

export default GradientHeader;
