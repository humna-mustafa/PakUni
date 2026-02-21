import React, {useRef, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {ANIMATION_SCALES, SPRING_CONFIGS} from '../../constants/ui';
import {Icon} from '../icons';
import type {CareerRoadmap} from './data';

interface RoadmapCardProps {
  roadmap: CareerRoadmap;
  index: number;
  onPress: () => void;
  colors: any;
}

export const getDifficultyColor = (difficulty: CareerRoadmap['difficulty']) => {
  switch (difficulty) {
    case 'Easy': return '#4CAF50';
    case 'Medium': return '#FF9800';
    case 'Hard': return '#F44336';
    case 'Very Hard': return '#9C27B0';
  }
};

export const getDemandColor = (demand: CareerRoadmap['demandLevel']) => {
  switch (demand) {
    case 'High': return '#4CAF50';
    case 'Medium': return '#FF9800';
    case 'Low': return '#F44336';
  }
};

const RoadmapCard = ({roadmap, index, onPress, colors}: RoadmapCardProps) => {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: ANIMATION_SCALES.PRESS,
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

  return (
    <Animated.View
      style={{
        transform: [{translateX: slideAnim}, {scale: scaleAnim}],
        opacity: fadeAnim,
      }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}>
        <View style={[styles.roadmapCard, {backgroundColor: colors.card}]}>
          <LinearGradient colors={roadmap.gradient} style={styles.cardAccent} />

          <View style={styles.cardContent}>
            {/* Header */}
            <View style={styles.roadmapHeader}>
              <View style={[styles.roadmapIcon, {backgroundColor: roadmap.color + '20'}]}>
                <Icon name={roadmap.iconName} family="Ionicons" size={32} color={roadmap.color} />
              </View>
              <View style={styles.roadmapInfo}>
                <Text style={[styles.roadmapTitle, {color: colors.text}]}>{roadmap.title}</Text>
                <Text style={[styles.roadmapTagline, {color: colors.textSecondary}]}>{roadmap.tagline}</Text>
              </View>
            </View>

            {/* Meta badges */}
            <View style={styles.roadmapMeta}>
              <View style={[styles.metaBadge, {backgroundColor: colors.background, flexDirection: 'row', alignItems: 'center', gap: 4}]}>
                <Icon name="time-outline" family="Ionicons" size={12} color={colors.textSecondary} />
                <Text style={[styles.metaText, {color: colors.textSecondary}]}>{roadmap.totalYears}</Text>
              </View>
              <View style={[styles.metaBadge, {backgroundColor: getDemandColor(roadmap.demandLevel) + '20', flexDirection: 'row', alignItems: 'center', gap: 4}]}>
                <View style={{width: 6, height: 6, borderRadius: 3, backgroundColor: getDemandColor(roadmap.demandLevel)}} />
                <Text style={[styles.metaText, {color: getDemandColor(roadmap.demandLevel)}]}>
                  {roadmap.demandLevel} Demand
                </Text>
              </View>
            </View>

            {/* Salary */}
            <View style={styles.salaryRow}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <Icon name="cash-outline" family="Ionicons" size={16} color={colors.success} />
                <Text style={[styles.salaryText, {color: colors.success}]}>{roadmap.salaryRange}</Text>
              </View>
            </View>

            {/* Steps preview */}
            <View style={[styles.stepsPreview, {backgroundColor: colors.background}]}>
              <View style={styles.stepsDotsContainer}>
                {roadmap.steps.slice(0, 5).map((_, i) => (
                  <View key={i} style={[styles.stepDotPreview, {backgroundColor: roadmap.color}]} />
                ))}
                {roadmap.steps.length > 5 && (
                  <Text style={[styles.moreSteps, {color: roadmap.color}]}>+{roadmap.steps.length - 5}</Text>
                )}
              </View>
              <Text style={[styles.stepsPreviewText, {color: colors.primary}]}>
                {roadmap.steps.length} steps
              </Text>
              <Icon name="arrow-forward" family="Ionicons" size={14} color={colors.primary} containerStyle={{marginLeft: 4}} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  roadmapCard: {
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardAccent: {
    height: 6,
  },
  cardContent: {
    padding: SPACING.md,
  },
  roadmapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  roadmapIcon: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  roadmapInfo: {
    flex: 1,
  },
  roadmapTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: 2,
  },
  roadmapTagline: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  roadmapMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  metaText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  salaryRow: {
    marginBottom: SPACING.sm,
  },
  salaryText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  stepsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  stepsDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepDotPreview: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  moreSteps: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginLeft: 4,
  },
  stepsPreviewText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

export default RoadmapCard;
