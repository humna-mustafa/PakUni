import React, {useRef, useEffect} from 'react';
import {Text, StyleSheet, TouchableOpacity, Animated, View} from 'react-native';
import {SPACING, FONTS, BORDER_RADIUS} from '../../constants/theme';
import {TYPOGRAPHY} from '../../constants/design';
import {Icon} from '../icons';
import type {Career} from './data';

interface AnimatedCareerCardProps {
  career: Career;
  index: number;
  colors: any;
  isDark: boolean;
  getDifficultyColor: (d: string) => string;
  onPress: (career: Career) => void;
}

const AnimatedCareerCard: React.FC<AnimatedCareerCardProps> = ({
  career,
  index,
  colors,
  isDark,
  getDifficultyColor,
  onPress,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const delay = index * 60;
    Animated.parallel([
      Animated.timing(fadeAnim, {toValue: 1, duration: 400, delay, useNativeDriver: true}),
      Animated.spring(slideAnim, {toValue: 0, tension: 50, friction: 8, delay, useNativeDriver: true}),
      Animated.spring(scaleAnim, {toValue: 1, tension: 50, friction: 8, delay, useNativeDriver: true}),
    ]).start();
  }, [index]);

  const handlePressIn = () => {
    Animated.spring(bounceAnim, {toValue: 0.96, useNativeDriver: true, tension: 100, friction: 10}).start();
  };

  const handlePressOut = () => {
    Animated.spring(bounceAnim, {toValue: 1, useNativeDriver: true, tension: 100, friction: 10}).start();
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{translateY: slideAnim}, {scale: Animated.multiply(scaleAnim, bounceAnim)}],
      }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(career)}
        style={[styles.careerCard, {backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: career.color}]}>
        <View style={[styles.emojiCircle, {backgroundColor: career.color + '20'}]}>
          <Icon name={career.iconName} family="Ionicons" size={28} color={career.color} />
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.careerTitle, {color: colors.text}]}>{career.title}</Text>
          <Text style={[styles.tagline, {color: colors.textSecondary}]}>{career.tagline}</Text>
          <View style={styles.difficultyRow}>
            <View style={[styles.difficultyBadge, {backgroundColor: getDifficultyColor(career.difficulty) + '20'}]}>
              <Text style={[styles.difficultyText, {color: getDifficultyColor(career.difficulty)}]}>
                {career.difficulty}
              </Text>
            </View>
            <View style={[styles.categoryBadge, {backgroundColor: colors.primaryLight}]}>
              <Text style={[styles.categoryChipText, {color: colors.primary}]}>
                {career.category}
              </Text>
            </View>
          </View>
        </View>
        <Icon name="arrow-forward" family="Ionicons" size={24} color={colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  careerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emojiCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardContent: {
    flex: 1,
  },
  careerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
  },
  difficultyRow: {
    marginTop: SPACING.xs,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  difficultyText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.xs,
    marginBottom: 2,
  },
  categoryChipText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
    textTransform: 'capitalize',
  },
});

export default AnimatedCareerCard;
