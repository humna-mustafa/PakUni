import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SPACING, FONTS, BORDER_RADIUS} from '../constants/theme';
import {TYPOGRAPHY} from '../constants/design';
import {Icon} from '../components/icons';
import {AnimatedCard, GroupDetailModal, SubjectDetailModal, SUBJECT_GROUPS, SUBJECTS, CAREER_PATHS} from '../components/subject-guide';
import {useSubjectGuideScreen} from '../hooks/useSubjectGuideScreen';

const SubjectGuideScreen = () => {
  const {
    colors, activeTab, setActiveTab,
    selectedGroup, selectedSubject,
    showGroupModal, showSubjectModal,
    setShowGroupModal, setShowSubjectModal,
    openGroupModal, openSubjectModal, openGroupById,
    headerFadeAnim, headerSlideAnim, floatTranslateY, bookScale,
    getDifficultyColor,
  } = useSubjectGuideScreen();

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['top']}>
      {/* Floating Decorations */}
      <Animated.View style={[styles.floatingDecor1, {opacity: 0.06, transform: [{translateY: floatTranslateY}, {scale: bookScale}]}]}>
        <Icon name="book" family="Ionicons" size={70} color={colors.primary} />
      </Animated.View>
      <Animated.View style={[styles.floatingDecor2, {opacity: 0.04}]}>
        <Icon name="school" family="Ionicons" size={50} color={colors.primary} />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={[styles.header, {backgroundColor: colors.primary, opacity: headerFadeAnim, transform: [{translateY: headerSlideAnim}]}]}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            <Animated.View style={{transform: [{scale: bookScale}]}}>
              <Icon name="book-outline" family="Ionicons" size={28} color="#FFFFFF" />
            </Animated.View>
            <Text style={[styles.headerTitle, {color: colors.white}]}>Subject Selection Guide</Text>
          </View>
          <Text style={[styles.headerSubtitle, {color: colors.white}]}>Choose the right subjects for your dream career</Text>
        </Animated.View>

        {/* Tabs */}
        <View style={[styles.tabContainer, {backgroundColor: colors.card, borderColor: colors.border}]}>
          <TouchableOpacity style={[styles.tab, activeTab === 'groups' && {backgroundColor: colors.primary}]} onPress={() => setActiveTab('groups')}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
              <Icon name="clipboard-outline" family="Ionicons" size={16} color={activeTab === 'groups' ? '#FFFFFF' : colors.textSecondary} />
              <Text style={[styles.tabText, {color: colors.textSecondary}, activeTab === 'groups' && {color: colors.white}]}>Subject Groups</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'subjects' && {backgroundColor: colors.primary}]} onPress={() => setActiveTab('subjects')}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
              <Icon name="library-outline" family="Ionicons" size={16} color={activeTab === 'subjects' ? '#FFFFFF' : colors.textSecondary} />
              <Text style={[styles.tabText, {color: colors.textSecondary}, activeTab === 'subjects' && {color: colors.white}]}>All Subjects</Text>
            </View>
          </TouchableOpacity>
        </View>

        {activeTab === 'groups' ? (
          <>
            {/* Info Card */}
            <AnimatedCard index={0}>
              <View style={[styles.infoCard, {backgroundColor: colors.info + '15', borderColor: colors.info + '30'}]}>
                <Animated.View style={{transform: [{translateY: floatTranslateY}]}}>
                  <Icon name="bulb-outline" family="Ionicons" size={24} color={colors.info} />
                </Animated.View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoTitle, {color: colors.text}]}>Choosing Your Group</Text>
                  <Text style={[styles.infoText, {color: colors.textSecondary}]}>
                    After Matric, you'll choose FSc/FA subjects. This choice affects your career options. Choose based on your interests and goals!
                  </Text>
                </View>
              </View>

              {/* Subject Groups */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, {color: colors.text}]}>Available Subject Groups</Text>
                {SUBJECT_GROUPS.map((group, index) => (
                  <AnimatedCard key={group.id} index={index + 1} onPress={() => openGroupModal(group)}>
                    <View style={[styles.groupCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
                      <View style={[styles.groupIcon, {backgroundColor: group.color + '20'}]}>
                        <Icon name={group.iconName} family="Ionicons" size={28} color={group.color} />
                      </View>
                      <View style={styles.groupInfo}>
                        <Text style={[styles.groupName, {color: colors.text}]}>{group.name}</Text>
                        <Text style={[styles.groupDesc, {color: colors.textSecondary}]} numberOfLines={2}>{group.description}</Text>
                        <View style={styles.groupMeta}>
                          <View style={[styles.groupBadge, {backgroundColor: group.color + '20'}]}>
                            <Text style={[styles.groupBadgeText, {color: group.color}]}>{group.careers.length}+ Careers</Text>
                          </View>
                          <Text style={[styles.groupExam, {color: colors.textMuted}]}>{group.boardExams}</Text>
                        </View>
                      </View>
                      <Icon name="chevron-forward" family="Ionicons" size={20} color={colors.textMuted} />
                    </View>
                  </AnimatedCard>
                ))}
              </View>
            </AnimatedCard>
          </>
        ) : (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: colors.text}]}>Subject Details</Text>
            <View style={styles.subjectsGrid}>
              {SUBJECTS.map((subject, index) => (
                <AnimatedCard key={subject.id} index={index} style={styles.subjectCardWrapper} onPress={() => openSubjectModal(subject)}>
                  <View style={[styles.subjectCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
                    <Icon name={subject.iconName} family="Ionicons" size={36} color={colors.primary} />
                    <Text style={[styles.subjectName, {color: colors.text}]} numberOfLines={1}>{subject.name}</Text>
                    <View style={[styles.difficultyBadge, {backgroundColor: getDifficultyColor(subject.difficulty) + '20'}]}>
                      <Text style={[styles.difficultyText, {color: getDifficultyColor(subject.difficulty)}]}>
                        {subject.difficulty.charAt(0).toUpperCase() + subject.difficulty.slice(1)}
                      </Text>
                    </View>
                  </View>
                </AnimatedCard>
              ))}
            </View>
          </View>
        )}

        {/* Career Path Tips */}
        <AnimatedCard index={8} style={styles.tipsSection}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.md}}>
            <Animated.View style={{transform: [{translateY: floatTranslateY}]}}>
              <Icon name="ribbon-outline" family="Ionicons" size={22} color={colors.primary} />
            </Animated.View>
            <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0}]}>Quick Career Paths</Text>
          </View>
          {CAREER_PATHS.map((path) => (
            <TouchableOpacity
              key={path.groupId}
              activeOpacity={0.8}
              onPress={() => openGroupById(path.groupId, SUBJECT_GROUPS)}
              style={[styles.careerPathCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <Icon name={path.icon} family="Ionicons" size={24} color={path.color} />
              <View style={styles.careerPathInfo}>
                <Text style={[styles.careerPathTitle, {color: colors.text}]}>{path.title}</Text>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                  {path.steps.map((step, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <Icon name="arrow-forward" family="Ionicons" size={12} color={colors.textMuted} />}
                      <Text style={[styles.careerPathSteps, {color: colors.textSecondary}]}>{step}</Text>
                    </React.Fragment>
                  ))}
                </View>
              </View>
              <Icon name="chevron-forward" family="Ionicons" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </AnimatedCard>

        <View style={{height: SPACING.xxl}} />
      </ScrollView>

      <GroupDetailModal visible={showGroupModal} group={selectedGroup} onClose={() => setShowGroupModal(false)} />
      <SubjectDetailModal visible={showSubjectModal} subject={selectedSubject} onClose={() => setShowSubjectModal(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  floatingDecor1: {position: 'absolute', top: 120, right: -15, zIndex: -1},
  floatingDecor2: {position: 'absolute', top: 280, left: -10, zIndex: -1},
  header: {padding: SPACING.md, paddingBottom: 0},
  headerTitle: {fontSize: FONTS.sizes.xl, fontWeight: 'bold', marginBottom: 4},
  headerSubtitle: {fontSize: FONTS.sizes.sm, opacity: 0.9},
  tabContainer: {flexDirection: 'row', margin: SPACING.md, borderRadius: BORDER_RADIUS.lg, padding: 4, borderWidth: 1},
  tab: {flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderRadius: BORDER_RADIUS.md},
  tabText: {fontSize: FONTS.sizes.sm, fontWeight: TYPOGRAPHY.weight.medium},
  infoCard: {flexDirection: 'row', marginHorizontal: SPACING.md, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1},
  infoContent: {flex: 1},
  infoTitle: {fontSize: FONTS.sizes.md, fontWeight: TYPOGRAPHY.weight.semibold, marginBottom: 2},
  infoText: {fontSize: FONTS.sizes.sm, opacity: 0.8, lineHeight: 18},
  section: {paddingHorizontal: SPACING.md, marginBottom: SPACING.lg},
  sectionTitle: {fontSize: FONTS.sizes.lg, fontWeight: TYPOGRAPHY.weight.semibold, marginBottom: SPACING.md},
  groupCard: {flexDirection: 'row', borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, alignItems: 'center', borderWidth: 1},
  groupIcon: {width: 50, height: 50, borderRadius: BORDER_RADIUS.lg, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md},
  groupInfo: {flex: 1},
  groupName: {fontSize: FONTS.sizes.md, fontWeight: TYPOGRAPHY.weight.semibold, marginBottom: 2},
  groupDesc: {fontSize: FONTS.sizes.xs, marginBottom: SPACING.xs},
  groupMeta: {flexDirection: 'row', alignItems: 'center', gap: SPACING.sm},
  groupBadge: {paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: BORDER_RADIUS.sm},
  groupBadgeText: {fontSize: FONTS.sizes.xs, fontWeight: TYPOGRAPHY.weight.semibold},
  groupExam: {fontSize: FONTS.sizes.xs},
  subjectsGrid: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: SPACING.md, paddingHorizontal: SPACING.xs},
  subjectCardWrapper: {width: '47%', marginBottom: SPACING.xs},
  subjectCard: {width: '100%', minHeight: 130, borderRadius: BORDER_RADIUS.xl, padding: SPACING.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2},
  subjectName: {fontSize: FONTS.sizes.lg, fontWeight: TYPOGRAPHY.weight.bold, marginBottom: SPACING.xs, textAlign: 'center'},
  difficultyBadge: {paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: BORDER_RADIUS.sm},
  difficultyText: {fontSize: FONTS.sizes.xs, fontWeight: TYPOGRAPHY.weight.semibold},
  tipsSection: {paddingHorizontal: SPACING.md},
  careerPathCard: {flexDirection: 'row', alignItems: 'center', borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1},
  careerPathInfo: {flex: 1},
  careerPathTitle: {fontSize: FONTS.sizes.md, fontWeight: TYPOGRAPHY.weight.semibold},
  careerPathSteps: {fontSize: FONTS.sizes.sm},
});

export default SubjectGuideScreen;
