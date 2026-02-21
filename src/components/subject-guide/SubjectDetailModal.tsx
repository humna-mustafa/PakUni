/**
 * SubjectDetailModal - Shows full details for an individual subject (difficulty, careers, entry tests, tips).
 */
import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet} from 'react-native';
import {SPACING, FONTS, BORDER_RADIUS} from '../../constants/theme';
import {TYPOGRAPHY} from '../../constants/design';
import {useTheme} from '../../contexts/ThemeContext';
import {Icon} from '../icons';
import type {Subject} from './data';

interface SubjectDetailModalProps {
  visible: boolean;
  subject: Subject | null;
  onClose: () => void;
}

const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({visible, subject, onClose}) => {
  const {colors} = useTheme();

  const getDifficultyColor = (difficulty: Subject['difficulty']) => {
    switch (difficulty) {
      case 'easy': return colors.success;
      case 'medium': return colors.warning;
      case 'hard': return colors.error;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.content, {backgroundColor: colors.background}]}>
          {subject && (
            <>
              <View style={[styles.header, {borderBottomColor: colors.border}]}>
                <TouchableOpacity onPress={onClose} style={styles.backRow}>
                  <Icon name="chevron-back" family="Ionicons" size={18} color={colors.primary} />
                  <Text style={[styles.backBtn, {color: colors.primary}]}>Back</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <View style={[styles.hero, {backgroundColor: colors.primary}]}>
                  <Icon name={subject.iconName} family="Ionicons" size={48} color="#FFFFFF" />
                  <Text style={[styles.heroTitle, {color: colors.white}]}>{subject.name}</Text>
                  <View style={[styles.difficultyBadge, {backgroundColor: getDifficultyColor(subject.difficulty) + '20'}]}>
                    <Text style={[styles.difficultyText, {color: getDifficultyColor(subject.difficulty)}]}>
                      Difficulty: {subject.difficulty.charAt(0).toUpperCase() + subject.difficulty.slice(1)}
                    </Text>
                  </View>
                  <Text style={[styles.heroDesc, {color: colors.white}]}>{subject.description}</Text>
                </View>

                {/* Career Options */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Icon name="ribbon-outline" family="Ionicons" size={18} color={colors.primary} />
                    <Text style={[styles.sectionTitle, {color: colors.text}]}>Career Options</Text>
                  </View>
                  <View style={styles.tagContainer}>
                    {subject.careers.map((career, i) => (
                      <View key={i} style={[styles.careerTag, {backgroundColor: colors.success + '20'}]}>
                        <Text style={[styles.careerTagText, {color: colors.success}]}>{career}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Entry Tests */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Icon name="document-text-outline" family="Ionicons" size={18} color={colors.primary} />
                    <Text style={[styles.sectionTitle, {color: colors.text}]}>Entry Tests</Text>
                  </View>
                  <View style={styles.tagContainer}>
                    {subject.entryTests.map((test, i) => (
                      <View key={i} style={[styles.testTag, {backgroundColor: colors.warning + '20'}]}>
                        <Text style={[styles.testTagText, {color: colors.warning}]}>{test}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Study Tips */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Icon name="bulb-outline" family="Ionicons" size={18} color={colors.primary} />
                    <Text style={[styles.sectionTitle, {color: colors.text}]}>Study Tips</Text>
                  </View>
                  {subject.tips.map((tip, i) => (
                    <View key={i} style={[styles.tipItem, {backgroundColor: colors.card, borderColor: colors.border}]}>
                      <Text style={[styles.tipNumber, {backgroundColor: colors.primary, color: colors.white}]}>{i + 1}</Text>
                      <Text style={[styles.tipText, {color: colors.textSecondary}]}>{tip}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'},
  content: {borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl, maxHeight: '90%'},
  header: {padding: SPACING.md, borderBottomWidth: 1},
  backRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  backBtn: {fontSize: FONTS.sizes.md, fontWeight: TYPOGRAPHY.weight.medium},
  hero: {padding: SPACING.xl, alignItems: 'center'},
  heroTitle: {fontSize: FONTS.sizes.xl, fontWeight: 'bold', marginBottom: SPACING.sm},
  difficultyBadge: {paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.sm},
  difficultyText: {fontSize: FONTS.sizes.sm, fontWeight: TYPOGRAPHY.weight.semibold},
  heroDesc: {fontSize: FONTS.sizes.sm, textAlign: 'center'},
  section: {padding: SPACING.md},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', gap: 8},
  sectionTitle: {fontSize: FONTS.sizes.md, fontWeight: TYPOGRAPHY.weight.semibold, marginBottom: SPACING.sm},
  tagContainer: {flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs},
  careerTag: {paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.md},
  careerTagText: {fontSize: FONTS.sizes.sm, fontWeight: TYPOGRAPHY.weight.medium},
  testTag: {paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.md},
  testTagText: {fontSize: FONTS.sizes.sm, fontWeight: TYPOGRAPHY.weight.medium},
  tipItem: {flexDirection: 'row', alignItems: 'flex-start', borderRadius: BORDER_RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.xs, borderWidth: 1},
  tipNumber: {width: 24, height: 24, borderRadius: 12, textAlign: 'center', lineHeight: 24, fontSize: FONTS.sizes.sm, fontWeight: 'bold', marginRight: SPACING.sm, overflow: 'hidden'},
  tipText: {flex: 1, fontSize: FONTS.sizes.sm, lineHeight: 20},
});

export default SubjectDetailModal;
