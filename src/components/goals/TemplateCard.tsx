import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import type {GoalTemplate} from '../../types/goals';

interface TemplateCardProps {
  template: GoalTemplate;
  onSelect: () => void;
  colors: any;
}

const TemplateCard = React.memo(
  ({template, onSelect, colors}: TemplateCardProps) => {
    return (
      <TouchableOpacity
        style={[styles.templateCard, {backgroundColor: template.color}]}
        onPress={onSelect}>
        <View style={styles.templateBadgeRow}>
          <View
            style={[
              styles.difficultyBadge,
              {backgroundColor: 'rgba(255,255,255,0.2)'},
            ]}>
            <Text style={styles.difficultyText}>{template.difficulty}</Text>
          </View>
        </View>
        <Icon
          name={template.iconName}
          family="Ionicons"
          size={32}
          color="#FFFFFF"
        />
        <Text style={styles.templateTitle}>{template.title}</Text>
        <View style={styles.templateMeta}>
          <View style={styles.templateMetaItem}>
            <Icon
              name="list-outline"
              family="Ionicons"
              size={12}
              color="rgba(255,255,255,0.8)"
            />
            <Text style={styles.templateMilestones}>
              {template.milestones.length} steps
            </Text>
          </View>
          <View style={styles.templateMetaItem}>
            <Icon
              name="time-outline"
              family="Ionicons"
              size={12}
              color="rgba(255,255,255,0.8)"
            />
            <Text style={styles.templateMilestones}>
              {template.estimatedDays}d
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  templateCard: {
    width: 140,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  templateBadgeRow: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  templateTitle: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: 4,
  },
  templateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  templateMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  templateMilestones: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
  },
});

export default TemplateCard;
