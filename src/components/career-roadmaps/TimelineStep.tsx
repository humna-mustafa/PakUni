import React, {useRef, useEffect} from 'react';
import {View, Text, StyleSheet, Animated, Dimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import type {RoadmapStep} from './data';

const {width} = Dimensions.get('window');

interface TimelineStepProps {
  step: RoadmapStep;
  index: number;
  total: number;
  color: string;
  colors: any;
}

const TimelineStep = ({step, index, total, color, colors}: TimelineStepProps) => {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: 300 + index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: 300 + index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.stepItem,
        {
          transform: [{translateY: slideAnim}],
          opacity: fadeAnim,
        },
      ]}>
      {/* Timeline */}
      <View style={styles.stepTimeline}>
        <LinearGradient colors={[color, color + 'CC']} style={styles.stepDot}>
          <Text style={styles.stepNumber}>{index + 1}</Text>
        </LinearGradient>
        {index < total - 1 && (
          <View style={[styles.stepLine, {backgroundColor: color + '40'}]} />
        )}
      </View>

      {/* Content */}
      <View style={[styles.stepContent, {backgroundColor: colors.background}]}>
        <View style={styles.stepHeader}>
          <View style={{marginRight: SPACING.sm}}>
            <Icon name={step.iconName} family="Ionicons" size={32} color={color} />
          </View>
          <View style={styles.stepHeaderText}>
            <Text style={[styles.stepTitle, {color: colors.text}]}>{step.title}</Text>
            <View style={[styles.durationBadge, {backgroundColor: color + '20', flexDirection: 'row', alignItems: 'center', gap: 4}]}>
              <Icon name="time-outline" family="Ionicons" size={11} color={color} />
              <Text style={[styles.durationText, {color}]}>{step.duration}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.stepDescription, {color: colors.textSecondary}]}>
          {step.description}
        </Text>

        {step.requirements && (
          <View style={[styles.stepRequirements, {backgroundColor: colors.card}]}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4}}>
              <Icon name="clipboard-outline" family="Ionicons" size={12} color={colors.text} />
              <Text style={[styles.requirementsTitle, {color: colors.text, marginBottom: 0}]}>Requirements:</Text>
            </View>
            {step.requirements.map((req, i) => (
              <Text key={i} style={[styles.requirementItem, {color: colors.textSecondary}]}>{'\u2022'} {req}</Text>
            ))}
          </View>
        )}

        {step.tips && (
          <View style={[styles.stepTips, {backgroundColor: '#FFF3E0'}]}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4}}>
              <Icon name="bulb-outline" family="Ionicons" size={12} color="#E65100" />
              <Text style={[styles.tipsTitle, {marginBottom: 0}]}>Tips:</Text>
            </View>
            {step.tips.map((tip, i) => (
              <Text key={i} style={styles.tipItem}>{'\u2022'} {tip}</Text>
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  stepItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  stepTimeline: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  stepDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontWeight: TYPOGRAPHY.weight.bold,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#fff',
  },
  stepLine: {
    width: 3,
    flex: 1,
    marginVertical: 6,
    borderRadius: 2,
  },
  stepContent: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    maxWidth: width - 80,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    flexWrap: 'wrap',
  },
  stepHeaderText: {
    flex: 1,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: 4,
  },
  durationBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  durationText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  stepDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  stepRequirements: {
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  requirementsTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: 4,
  },
  requirementItem: {
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: 18,
  },
  stepTips: {
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: 4,
    color: '#E65100',
  },
  tipItem: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#BF360C',
    lineHeight: 18,
  },
});

export default TimelineStep;
