/**
 * GroupDetailModal - Shows full details for a subject group (compulsory/elective subjects, careers, universities, entry tests, board exam).
 */
import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet} from 'react-native';
import {SPACING, FONTS, BORDER_RADIUS} from '../../constants/theme';
import {TYPOGRAPHY} from '../../constants/design';
import {useTheme} from '../../contexts/ThemeContext';
import {Icon} from '../icons';
import type {SubjectGroup} from './data';

interface GroupDetailModalProps {
  visible: boolean;
  group: SubjectGroup | null;
  onClose: () => void;
}

const GroupDetailModal: React.FC<GroupDetailModalProps> = ({visible, group, onClose}) => {
  const {colors} = useTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.content, {backgroundColor: colors.background}]}>
          {group && (
            <>
              <View style={[styles.header, {borderBottomColor: colors.border}]}>
                <TouchableOpacity onPress={onClose} style={styles.backRow}>
                  <Icon name="chevron-back" family="Ionicons" size={18} color={colors.primary} />
                  <Text style={[styles.backBtn, {color: colors.primary}]}>Back</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <View style={[styles.hero, {backgroundColor: group.color}]}>
                  <Icon name={group.iconName} family="Ionicons" size={48} color="#FFFFFF" />
                  <Text style={[styles.heroTitle, {color: colors.white}]}>{group.name}</Text>
                  <Text style={[styles.heroDesc, {color: colors.white}]}>{group.description}</Text>
                </View>

                {/* Compulsory Subjects */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Icon name="book-outline" family="Ionicons" size={18} color={colors.primary} />
                    <Text style={[styles.sectionTitle, {color: colors.text}]}>Compulsory Subjects</Text>
                  </View>
                  <View style={styles.tagContainer}>
                    {group.compulsory.map((subject, i) => (
                      <View key={i} style={[styles.subjectTag, {backgroundColor: group.color + '20'}]}>
                        <Text style={[styles.subjectTagText, {color: group.color}]}>{subject}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Elective Options */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Icon name="library-outline" family="Ionicons" size={18} color={colors.primary} />
                    <Text style={[styles.sectionTitle, {color: colors.text}]}>Elective Options</Text>
                  </View>
                  <View style={styles.tagContainer}>
                    {group.electives.map((subject, i) => (
                      <View key={i} style={[styles.electiveTag, {backgroundColor: colors.card, borderColor: colors.border}]}>
                        <Text style={[styles.electiveTagText, {color: colors.text}]}>{subject}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Career Options */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Icon name="ribbon-outline" family="Ionicons" size={18} color={colors.primary} />
                    <Text style={[styles.sectionTitle, {color: colors.text}]}>Career Options</Text>
                  </View>
                  <View style={styles.careerList}>
                    {group.careers.map((career, i) => (
                      <View key={i} style={styles.careerItem}>
                        <Text style={[styles.careerBullet, {color: colors.primary}]}>•</Text>
                        <Text style={[styles.careerText, {color: colors.textSecondary}]}>{career}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Top Universities */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Icon name="school-outline" family="Ionicons" size={18} color={colors.primary} />
                    <Text style={[styles.sectionTitle, {color: colors.text}]}>Top Universities</Text>
                  </View>
                  <View style={styles.tagContainer}>
                    {group.universities.map((uni, i) => (
                      <View key={i} style={[styles.uniTag, {backgroundColor: colors.info + '20'}]}>
                        <Text style={[styles.uniTagText, {color: colors.info}]}>{uni}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Entry Tests */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Icon name="document-text-outline" family="Ionicons" size={18} color={colors.primary} />
                    <Text style={[styles.sectionTitle, {color: colors.text}]}>Entry Tests Required</Text>
                  </View>
                  <View style={styles.tagContainer}>
                    {group.entryTests.map((test, i) => (
                      <View key={i} style={[styles.testTag, {backgroundColor: colors.warning + '20'}]}>
                        <Text style={[styles.testTagText, {color: colors.warning}]}>{test}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Board Exam */}
                <View style={[styles.boardExamCard, {backgroundColor: group.color + '10', borderColor: group.color + '30'}]}>
                  <View style={styles.sectionHeader}>
                    <Icon name="clipboard-outline" family="Ionicons" size={16} color={colors.text} />
                    <Text style={[styles.boardExamTitle, {color: colors.text}]}>Board Exam</Text>
                  </View>
                  <Text style={[styles.boardExamText, {color: group.color}]}>{group.boardExams}</Text>
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
  heroTitle: {fontSize: FONTS.sizes.xl, fontWeight: 'bold', marginBottom: SPACING.xs},
  heroDesc: {fontSize: FONTS.sizes.sm, textAlign: 'center', opacity: 0.9},
  section: {padding: SPACING.md},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', gap: 8},
  sectionTitle: {fontSize: FONTS.sizes.md, fontWeight: TYPOGRAPHY.weight.semibold, marginBottom: SPACING.sm},
  tagContainer: {flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs},
  subjectTag: {paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.md},
  subjectTagText: {fontSize: FONTS.sizes.sm, fontWeight: TYPOGRAPHY.weight.medium},
  electiveTag: {paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.md, borderWidth: 1},
  electiveTagText: {fontSize: FONTS.sizes.sm},
  careerList: {gap: SPACING.xs},
  careerItem: {flexDirection: 'row', alignItems: 'center'},
  careerBullet: {fontSize: 16, marginRight: SPACING.sm},
  careerText: {fontSize: FONTS.sizes.sm},
  uniTag: {paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.md},
  uniTagText: {fontSize: FONTS.sizes.sm, fontWeight: TYPOGRAPHY.weight.medium},
  testTag: {paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.md},
  testTagText: {fontSize: FONTS.sizes.sm, fontWeight: TYPOGRAPHY.weight.medium},
  boardExamCard: {margin: SPACING.md, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, alignItems: 'center', marginBottom: SPACING.xl, borderWidth: 1},
  boardExamTitle: {fontSize: FONTS.sizes.sm, marginBottom: 4},
  boardExamText: {fontSize: FONTS.sizes.lg, fontWeight: 'bold'},
});

export default GroupDetailModal;
