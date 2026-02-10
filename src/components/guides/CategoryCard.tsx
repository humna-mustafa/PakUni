/**
 * CategoryCard - Animated category card with glow effect
 */

import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
// LinearGradient with fallback
let LinearGradient: React.ComponentType<any>;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch {
  LinearGradient = ({children, style, colors}: any) => (
    <View style={[style, {backgroundColor: colors?.[0] || '#667eea'}]}>
      {children}
    </View>
  );
}
import {Icon} from '../../components/icons';
import {TYPOGRAPHY, RADIUS, SPACING} from '../../constants/design';
import {ANIMATION_SCALES, SPRING_CONFIGS} from '../../constants/ui';
import type {GuideCategory} from '../../types/guides';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface CategoryCardProps {
  category: GuideCategory;
  onPress: () => void;
  colors: any;
  index: number;
}

const CategoryCardComponent: React.FC<CategoryCardProps> = ({
  category,
  onPress,
  colors,
  index,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animation
    const delay = index * 80;
    const entranceAnim = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]);
    entranceAnim.start();

    // Subtle glow pulse for visual interest
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    );
    glowLoop.start();

    return () => {
      entranceAnim.stop();
      glowLoop.stop();
    };
  }, [index, fadeAnim, slideAnim, glowAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: ANIMATION_SCALES.CHIP_PRESS,
      useNativeDriver: true,
      ...SPRING_CONFIGS.snappy,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...SPRING_CONFIGS.responsive,
    }).start();
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15],
  });

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          transform: [{scale: scaleAnim}, {translateY: slideAnim}],
          opacity: fadeAnim,
        },
      ]}>
      <TouchableOpacity
        style={[styles.card, {backgroundColor: colors.card}]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}>
        {/* Animated glow overlay */}
        <Animated.View
          style={[
            styles.glowOverlay,
            {backgroundColor: category.color, opacity: glowOpacity},
          ]}
        />
        <View
          style={[
            styles.iconContainer,
            {backgroundColor: category.color + '15'},
          ]}>
          <Icon name={category.icon} size={24} color={category.color} />
        </View>
        <Text style={[styles.title, {color: colors.text}]}>
          {category.title}
        </Text>
        <Text
          style={[styles.description, {color: colors.textSecondary}]}
          numberOfLines={2}>
          {category.description}
        </Text>
        <View style={styles.countBadge}>
          <LinearGradient
            colors={[category.color + '20', category.color + '10']}
            style={styles.countGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}>
            <Text style={[styles.countText, {color: category.color}]}>
              {category.guideCount} Guides
            </Text>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: (SCREEN_WIDTH - 48 - 12) / 2,
    marginBottom: 12,
  },
  card: {
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    minHeight: 160,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: RADIUS.xl,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: 4,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: 16,
    marginBottom: SPACING.sm,
  },
  countBadge: {
    marginTop: 'auto',
  },
  countGradient: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  countText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

export const CategoryCard = React.memo(CategoryCardComponent);
