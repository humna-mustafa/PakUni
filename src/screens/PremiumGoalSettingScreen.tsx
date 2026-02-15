import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../constants/design';
import {useTheme} from '../contexts/ThemeContext';
import {Icon} from '../components/icons';
import {GOAL_TEMPLATES} from '../constants/goalTemplates';
import {useGoals} from '../hooks/useGoals';
import {
  GoalCard,
  GoalDetailModal,
  AddGoalModal,
  EditGoalModal,
  TemplateDeadlineModal,
  GoalStatsCard,
  EmptyGoalsState,
} from '../components/goals';

const PremiumGoalSettingScreen = () => {
  const {colors, isDark} = useTheme();
  const navigation = useNavigation();
  const {
    goals,
    showAddModal,
    showDetailModal,
    selectedGoal,
    newGoalTitle,
    newGoalDeadline,
    customMilestones,
    showTemplateDeadlineModal,
    selectedTemplate,
    templateDeadline,
    showEditModal,
    editGoalTitle,
    editGoalDeadline,
    newMilestoneText,
    editGoalMilestones,
    totalProgress,
    headerAnim,
    modalAnim,
    setNewGoalTitle,
    setNewGoalDeadline,
    setCustomMilestones,
    setTemplateDeadline,
    setEditGoalTitle,
    setEditGoalDeadline,
    setEditGoalMilestones,
    setNewMilestoneText,
    setShowTemplateDeadlineModal,
    setSelectedTemplate,
    openAddModal,
    closeAddModal,
    openDetailModal,
    closeDetailModal,
    toggleMilestone,
    handleSelectTemplate,
    handleCreateFromTemplate,
    handleCreateCustomGoal,
    openEditModal,
    closeEditModal,
    handleSaveEdit,
    toggleGoalCompleted,
    handleDeleteGoal,
    addMilestoneToGoal,
    removeMilestoneFromGoal,
  } = useGoals();

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['top']}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Header */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}>
        <LinearGradient
          colors={isDark ? ['#e74c3c', '#c0392b'] : ['#e74c3c', '#c0392b']}
          style={styles.header}>
          <View style={styles.headerDecoration1} />
          <View style={styles.headerDecoration2} />
          <View style={styles.headerIconContainer}>
            <Icon name="flag-outline" family="Ionicons" size={50} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>My Goals</Text>
          <Text style={styles.headerSubtitle}>
            Track your progress & achieve your dreams!
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Stats Card */}
      <GoalStatsCard goals={goals} totalProgress={totalProgress} colors={colors} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Quick Start Templates Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
              <Icon name="flash-outline" family="Ionicons" size={20} color="#f39c12" />
              <Text style={[styles.sectionTitle, {color: colors.text}]}>Quick Start</Text>
            </View>
          </View>
          <Text style={[styles.quickStartSubtitle, {color: colors.textSecondary}]}>
            Tap a template to create a goal instantly
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.templatesContainer}>
            {GOAL_TEMPLATES.slice(0, 5).map((template, index) => (
              <TouchableOpacity
                key={template.id}
                style={[styles.templateCard, {backgroundColor: template.color + '15', borderColor: template.color + '40'}]}
                onPress={() => handleSelectTemplate(template)}
                activeOpacity={0.7}>
                <View style={[styles.templateIconBg, {backgroundColor: template.color}]}>
                  <Icon name={template.iconName} family="Ionicons" size={24} color="#FFFFFF" />
                </View>
                <Text style={[styles.templateTitle, {color: colors.text}]} numberOfLines={2}>
                  {template.title}
                </Text>
                <View style={styles.templateMeta}>
                  <Icon name="flag-outline" family="Ionicons" size={12} color={colors.textSecondary} />
                  <Text style={[styles.templateMetaText, {color: colors.textSecondary}]}>
                    {template.milestones.length} steps
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            {/* Custom Goal Card */}
            <TouchableOpacity
              style={[styles.templateCard, styles.customTemplateCard, {backgroundColor: colors.card, borderColor: colors.border}]}
              onPress={openAddModal}
              activeOpacity={0.7}>
              <View style={[styles.templateIconBg, {backgroundColor: colors.primary}]}>
                <Icon name="add" family="Ionicons" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.templateTitle, {color: colors.text}]} numberOfLines={2}>
                Custom Goal
              </Text>
              <View style={styles.templateMeta}>
                <Icon name="create-outline" family="Ionicons" size={12} color={colors.textSecondary} />
                <Text style={[styles.templateMetaText, {color: colors.textSecondary}]}>
                  Create your own
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* My Goals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
              <Icon name="clipboard-outline" family="Ionicons" size={20} color={colors.text} />
              <Text style={[styles.sectionTitle, {color: colors.text}]}>My Goals ({goals.length})</Text>
            </View>
          </View>

          {goals.map((goal, index) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onPress={() => openDetailModal(goal)}
              onEdit={() => openEditModal(goal)}
              index={index}
              colors={colors}
            />
          ))}

          {goals.length === 0 && <EmptyGoalsState colors={colors} />}
        </View>

        {/* Motivation Card */}
        <View style={[styles.motivationCard, {backgroundColor: isDark ? '#27ae6020' : '#E8F8F5'}]}>
          <Icon name="fitness-outline" family="Ionicons" size={40} color={isDark ? '#2ecc71' : '#27ae60'} />
          <Text style={[styles.motivationText, {color: isDark ? '#2ecc71' : '#27ae60'}]}>
            "A goal without a plan is just a wish. Keep pushing forward!"
          </Text>
        </View>

        <View style={{height: SPACING.xxl * 2}} />
      </ScrollView>

      {/* Modals */}
      <AddGoalModal
        visible={showAddModal}
        onClose={closeAddModal}
        templates={GOAL_TEMPLATES}
        onSelectTemplate={handleSelectTemplate}
        newGoalTitle={newGoalTitle}
        onTitleChange={setNewGoalTitle}
        newGoalDeadline={newGoalDeadline}
        onDeadlineChange={setNewGoalDeadline}
        customMilestones={customMilestones}
        onMilestonesChange={setCustomMilestones}
        onCreateCustomGoal={handleCreateCustomGoal}
        colors={colors}
        isDark={isDark}
        modalAnim={modalAnim}
      />

      <GoalDetailModal
        visible={showDetailModal}
        goal={selectedGoal}
        onClose={closeDetailModal}
        onToggleMilestone={toggleMilestone}
        onEdit={openEditModal}
        onToggleCompleted={toggleGoalCompleted}
        onDelete={handleDeleteGoal}
        onAddMilestone={addMilestoneToGoal}
        onRemoveMilestone={removeMilestoneFromGoal}
        newMilestoneText={newMilestoneText}
        onNewMilestoneTextChange={setNewMilestoneText}
        colors={colors}
        isDark={isDark}
      />

      <TemplateDeadlineModal
        visible={showTemplateDeadlineModal}
        onClose={() => {
          setShowTemplateDeadlineModal(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
        templateDeadline={templateDeadline}
        onDeadlineChange={setTemplateDeadline}
        onConfirm={handleCreateFromTemplate}
        colors={colors}
        isDark={isDark}
      />

      <EditGoalModal
        visible={showEditModal}
        onClose={closeEditModal}
        editGoalTitle={editGoalTitle}
        onTitleChange={setEditGoalTitle}
        editGoalDeadline={editGoalDeadline}
        onDeadlineChange={setEditGoalDeadline}
        editGoalMilestones={editGoalMilestones}
        onMilestonesChange={setEditGoalMilestones}
        onSave={handleSaveEdit}
        colors={colors}
        isDark={isDark}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backBtn: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerContainer: {},
  header: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
    overflow: 'hidden',
  },
  headerDecoration1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerDecoration2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerIconContainer: {
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  section: {
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  addBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  addBtnText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  motivationCard: {
    marginHorizontal: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.weight.medium,
    fontStyle: 'italic',
  },
  quickStartSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.sm,
  },
  templatesContainer: {
    paddingRight: SPACING.md,
    gap: SPACING.sm,
  },
  templateCard: {
    width: 120,
    padding: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  customTemplateCard: {
    borderStyle: 'dashed',
  },
  templateIconBg: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  templateTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    height: 36,
  },
  templateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  templateMetaText: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
});

export default PremiumGoalSettingScreen;
