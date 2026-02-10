/**
 * GuideDetail - Full guide detail view with steps, tips, resources
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
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
import {GUIDE_CATEGORIES} from '../../data/guidesData';
import {calculateReadTime} from '../../utils/guideUtils';
import type {Guide} from '../../types/guides';

interface GuideDetailProps {
  guide: Guide;
  onClose: () => void;
  colors: any;
}

const GuideDetailComponent: React.FC<GuideDetailProps> = ({
  guide,
  onClose,
  colors,
}) => {
  const category = GUIDE_CATEGORIES.find(c => c.id === guide.categoryId);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const categoryColor = category?.color || '#4573DF';

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header */}
      <LinearGradient
        colors={[categoryColor, categoryColor + 'CC']}
        style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{category?.title}</Text>
          </View>
          <Text style={styles.headerTitle}>{guide.title}</Text>
          <View style={styles.headerMeta}>
            <Icon
              name="time-outline"
              size={14}
              color="rgba(255,255,255,0.8)"
            />
            <Text style={styles.headerMetaText}>
              {calculateReadTime(guide)}
            </Text>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>
                {guide.difficulty.charAt(0).toUpperCase() +
                  guide.difficulty.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Description */}
        <Text style={[styles.description, {color: colors.textSecondary}]}>
          {guide.description}
        </Text>

        {/* Steps */}
        {guide.steps && guide.steps.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: colors.text}]}>
              📝 Steps
            </Text>
            {guide.steps.map((step, index) => (
              <TouchableOpacity
                key={step.id}
                style={[styles.stepCard, {backgroundColor: colors.card}]}
                onPress={() => toggleStep(step.id)}
                activeOpacity={0.7}>
                <View style={styles.stepHeader}>
                  <View
                    style={[
                      styles.stepNumber,
                      {backgroundColor: categoryColor},
                    ]}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.stepHeaderContent}>
                    <Text style={[styles.stepTitle, {color: colors.text}]}>
                      {step.title}
                    </Text>
                    {step.important && (
                      <View
                        style={[
                          styles.importantBadge,
                          {backgroundColor: categoryColor + '15'},
                        ]}>
                        <Icon
                          name="star"
                          size={10}
                          color={categoryColor}
                        />
                        <Text
                          style={[
                            styles.importantText,
                            {color: categoryColor},
                          ]}>
                          Important
                        </Text>
                      </View>
                    )}
                  </View>
                  <Icon
                    name={
                      expandedSteps.has(step.id)
                        ? 'chevron-up'
                        : 'chevron-down'
                    }
                    size={18}
                    color={colors.textSecondary}
                  />
                </View>
                <Text
                  style={[
                    styles.stepDescription,
                    {color: colors.textSecondary},
                  ]}>
                  {step.description}
                </Text>
                {expandedSteps.has(step.id) && (
                  <View style={styles.stepExpanded}>
                    {step.tips && step.tips.length > 0 && (
                      <View style={styles.stepSection}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 8,
                          }}>
                          <Icon
                            name="bulb-outline"
                            size={16}
                            color="#F59E0B"
                          />
                          <Text
                            style={[
                              styles.stepSectionTitle,
                              {color: colors.text, marginLeft: 6},
                            ]}>
                            Tips
                          </Text>
                        </View>
                        {step.tips.map((tip, i) => (
                          <View key={i} style={styles.tipItem}>
                            <Icon
                              name="checkmark-circle"
                              size={14}
                              color="#10B981"
                            />
                            <Text
                              style={[
                                styles.tipText,
                                {color: colors.textSecondary},
                              ]}>
                              {tip}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                    {step.documents && step.documents.length > 0 && (
                      <View style={styles.stepSection}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 8,
                          }}>
                          <Icon
                            name="document-text-outline"
                            size={16}
                            color={categoryColor}
                          />
                          <Text
                            style={[
                              styles.stepSectionTitle,
                              {color: colors.text, marginLeft: 6},
                            ]}>
                            Documents
                          </Text>
                        </View>
                        {step.documents.map((doc, i) => (
                          <View key={i} style={styles.docItem}>
                            <Icon
                              name="document-outline"
                              size={14}
                              color={categoryColor}
                            />
                            <Text
                              style={[
                                styles.docText,
                                {color: colors.textSecondary},
                              ]}>
                              {doc}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Tips */}
        {guide.tips && guide.tips.length > 0 && (
          <View style={styles.section}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              }}>
              <Icon name="bulb-outline" size={20} color="#F59E0B" />
              <Text
                style={[
                  styles.sectionTitle,
                  {color: colors.text, marginLeft: 8},
                ]}>
                Key Tips
              </Text>
            </View>
            <View style={[styles.tipsCard, {backgroundColor: colors.card}]}>
              {guide.tips.map((tip, index) => (
                <View key={index} style={styles.tipRow}>
                  <View
                    style={[
                      styles.tipBullet,
                      {backgroundColor: categoryColor},
                    ]}>
                    <Text style={styles.tipBulletText}>{index + 1}</Text>
                  </View>
                  <Text style={[styles.tipContent, {color: colors.text}]}>
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Resources */}
        {guide.resources && guide.resources.length > 0 && (
          <View style={styles.section}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              }}>
              <Icon
                name="library-outline"
                size={20}
                color={categoryColor}
              />
              <Text
                style={[
                  styles.sectionTitle,
                  {color: colors.text, marginLeft: 8},
                ]}>
                Resources
              </Text>
            </View>
            {guide.resources.map((resource, index) => (
              <View
                key={index}
                style={[
                  styles.resourceCard,
                  {backgroundColor: colors.card},
                ]}>
                <Icon
                  name="link-outline"
                  size={18}
                  color={categoryColor}
                />
                <Text style={[styles.resourceText, {color: colors.text}]}>
                  {resource.title}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Tags */}
        <View style={styles.section}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}>
            <Icon
              name="pricetags-outline"
              size={20}
              color={categoryColor}
            />
            <Text
              style={[
                styles.sectionTitle,
                {color: colors.text, marginLeft: 8},
              ]}>
              Tags
            </Text>
          </View>
          <View style={styles.tagsGrid}>
            {guide.tags.map((tag, index) => (
              <View
                key={index}
                style={[
                  styles.tagChip,
                  {backgroundColor: categoryColor + '15'},
                ]}>
                <Text
                  style={[styles.tagChipText, {color: categoryColor}]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Suggest Guide CTA */}
        <View style={[styles.suggestCard, {backgroundColor: colors.card}]}>
          <Icon name="mail-outline" size={24} color={categoryColor} />
          <View style={styles.suggestContent}>
            <Text style={[styles.suggestTitle, {color: colors.text}]}>
              Have suggestions?
            </Text>
            <Text
              style={[styles.suggestText, {color: colors.textSecondary}]}>
              Contact us through the app settings
            </Text>
          </View>
        </View>

        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerContent: {},
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#FFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFF',
    marginBottom: SPACING.sm,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerMetaText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
    marginRight: SPACING.md,
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  difficultyText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: SPACING.md,
  },
  stepCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFF',
  },
  stepHeaderContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  importantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  importantText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginLeft: 2,
  },
  stepDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    marginLeft: 36,
  },
  stepExpanded: {
    marginTop: SPACING.md,
    marginLeft: 36,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  stepSection: {
    marginBottom: SPACING.md,
  },
  stepSectionTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: SPACING.xs,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  tipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginLeft: 6,
    flex: 1,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  docText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginLeft: 6,
  },
  tipsCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  tipBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  tipBulletText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFF',
  },
  tipContent: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xs,
  },
  resourceText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginLeft: SPACING.sm,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  tagChipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  suggestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
  },
  suggestContent: {
    marginLeft: SPACING.md,
  },
  suggestTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  suggestText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
});

export const GuideDetail = React.memo(GuideDetailComponent);
