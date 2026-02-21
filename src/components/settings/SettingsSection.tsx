/**
 * SettingsSection - Animated section container with title
 */

import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import {SPACING, FONTS} from '../../constants/theme';

export interface SectionProps {
  title: string;
  children: React.ReactNode;
  colors: any;
  index?: number;
}

const SettingsSection: React.FC<SectionProps> = ({title, children, colors, index = 0}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const delay = index * 80;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  return (
    <Animated.View
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        },
      ]}>
      <Text style={[styles.sectionTitle, {color: colors.textSecondary}]}>
        {title}
      </Text>
      <View style={[styles.sectionContent, {backgroundColor: colors.card}]}>
        {children}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: FONTS.weight.semiBold,
    letterSpacing: 0.8,
    marginLeft: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  sectionContent: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});

export default React.memo(SettingsSection);
