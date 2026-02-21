/**
 * My Achievements Screen - Simple User-Reported Achievement Cards
 * Decomposed: hook (useAchievementsScreen) + TemplateCard + AddAchievementModal
 */
import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../constants/design';
import {Icon} from '../components/icons';
import {PremiumAchievementCard} from '../components/PremiumAchievementCard';
import {
  MeritSuccessCard as UltraMeritCard,
  AdmissionCelebrationCard as UltraAdmissionCard,
  TestCompletionCard as UltraTestCard,
  ScholarshipWinCard as UltraScholarshipCard,
} from '../components/UltraPremiumCards';
import {TemplateCard, AddAchievementModal} from '../components/achievements';
import {useAchievementsScreen} from '../hooks/useAchievementsScreen';

const AchievementsScreen = () => {
  const {
    colors, isDark, navigation,
    achievements, stats, isLoading,
    showAddModal, selectedTemplate, editingAchievement,
    headerAnim, floatTranslateY, trophyRotateZ,
    handleSelectTemplate, handleAddAchievement, handleDeleteAchievement,
    handleEditAchievement, handleSaveEdit,
    getEditInitialData, closeModal,
    ACHIEVEMENT_TEMPLATES, TYPE_COLORS,
  } = useAchievementsScreen();

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, {color: colors.text}]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['top']}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Header */}
      <Animated.View style={{opacity: headerAnim, transform: [{translateY: headerAnim.interpolate({inputRange: [0, 1], outputRange: [-20, 0]})}]}}>
        <LinearGradient
          colors={isDark ? [colors.primary, colors.primaryDark] : [colors.primaryLight, colors.primary]}
          style={styles.header}>
          <View style={styles.headerDecoration1} />
          <View style={styles.headerDecoration2} />
          <Animated.View style={{transform: [{translateY: floatTranslateY}, {rotate: trophyRotateZ}]}}>
            <Icon name="ribbon" family="Ionicons" size={50} color="#FFFFFF" />
          </Animated.View>
          <Text style={styles.headerTitle}>My Achievements</Text>
          <Text style={styles.headerSubtitle}>Add your milestones & share with friends</Text>
          <Animated.View style={[styles.floatingSparkle1, {transform: [{translateY: floatTranslateY}]}]}>
            <Text style={{fontSize: 16}}>✨</Text>
          </Animated.View>
          <Animated.View style={[styles.floatingSparkle2, {transform: [{translateY: Animated.multiply(floatTranslateY, -1)}]}]}>
            <Text style={{fontSize: 14}}>⭐</Text>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats */}
        {stats.total > 0 && (
          <View style={[styles.statsCard, {backgroundColor: colors.card}]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, {color: colors.primary}]}>{stats.total}</Text>
              <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Total</Text>
            </View>
            {Object.entries(stats.byType).filter(([, count]) => count > 0).slice(0, 4).map(([type, count]) => (
              <View key={type} style={styles.statItem}>
                <Text style={[styles.statNumber, {color: TYPE_COLORS[type]?.primary || colors.text}]}>{count}</Text>
                <Text style={[styles.statLabel, {color: colors.textSecondary}]}>{type.replace('_', ' ')}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Add New */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>➕ Add Achievement</Text>
          <Text style={[styles.sectionSubtitle, {color: colors.textSecondary}]}>Select what you achieved, fill the details, and share!</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templatesContainer}>
            {ACHIEVEMENT_TEMPLATES.map((template, index) => (
              <TemplateCard key={template.type} template={template} onPress={() => handleSelectTemplate(template)} colors={colors} index={index} />
            ))}
          </ScrollView>
        </View>

        {/* Achievement List */}
        <View style={styles.section}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <Icon name="trophy" family="Ionicons" size={20} color="#F59E0B" />
            <Text style={[styles.sectionTitle, {color: colors.text}]}>My Achievements ({achievements.length})</Text>
          </View>

          {achievements.length === 0 ? (
            <View style={[styles.emptyState, {backgroundColor: colors.card}]}>
              <Icon name="ribbon-outline" family="Ionicons" size={48} color="#F59E0B" />
              <Text style={[styles.emptyTitle, {color: colors.text}]}>No achievements yet</Text>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, flexWrap: 'wrap'}}>
                <Text style={[styles.emptyText, {color: colors.textSecondary}]}>Add your first achievement above! Share your success with friends</Text>
                <Icon name="star" family="Ionicons" size={14} color="#F59E0B" />
              </View>
            </View>
          ) : (
            <View style={styles.achievementsList}>
              {achievements.map((achievement) => (
                <View key={achievement.id}>
                  {achievement.type === 'merit_list' && <UltraMeritCard achievement={achievement} showActions showCustomizer onShareComplete={() => {}} />}
                  {achievement.type === 'admission' && <UltraAdmissionCard achievement={achievement} showActions showCustomizer onShareComplete={() => {}} />}
                  {achievement.type === 'entry_test' && <UltraTestCard achievement={achievement} showActions showCustomizer onShareComplete={() => {}} />}
                  {achievement.type === 'scholarship' && <UltraScholarshipCard achievement={achievement} showActions showCustomizer onShareComplete={() => {}} />}
                  {!['merit_list', 'admission', 'entry_test', 'scholarship'].includes(achievement.type) && (
                    <PremiumAchievementCard achievement={achievement} showSaveButton onShareComplete={() => {}} />
                  )}
                  <View style={styles.cardActions}>
                    <TouchableOpacity style={[styles.editBtn, {backgroundColor: colors.primary || '#4573DF'}]} onPress={() => handleEditAchievement(achievement)}>
                      <Icon name="create-outline" family="Ionicons" size={18} color="#FFF" />
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.deleteBtn, {backgroundColor: colors.error || '#EF4444'}]} onPress={() => handleDeleteAchievement(achievement.id)}>
                      <Icon name="trash-outline" family="Ionicons" size={18} color="#FFF" />
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
          <Icon name="information-circle" family="Ionicons" size={24} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, {color: colors.text}]}>How it works</Text>
            <Text style={[styles.infoText, {color: colors.textSecondary}]}>
              1. Add your achievement when you accomplish something{'\n'}
              2. Fill in the details (university, score, etc.){'\n'}
              3. Share the card as an image on WhatsApp, Instagram, etc.{'\n'}
              4. Save cards to your device for later sharing{'\n'}
              5. All data is stored locally on your device
            </Text>
          </View>
        </View>

        <View style={{height: SPACING.xxl * 2}} />
      </ScrollView>

      <AddAchievementModal
        visible={showAddModal}
        template={selectedTemplate}
        onClose={closeModal}
        onAdd={editingAchievement ? handleSaveEdit : handleAddAchievement}
        colors={colors}
        initialData={getEditInitialData()}
        isEditing={!!editingAchievement}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  backBtn: {position: 'absolute', top: SPACING.md, left: SPACING.md, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', zIndex: 10},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loadingText: {fontSize: TYPOGRAPHY.sizes.md},
  header: {paddingTop: SPACING.lg, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.md, alignItems: 'center', borderBottomLeftRadius: RADIUS.xxl, borderBottomRightRadius: RADIUS.xxl, overflow: 'hidden'},
  headerDecoration1: {position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.1)'},
  headerDecoration2: {position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.08)'},
  floatingSparkle1: {position: 'absolute', top: 20, right: 30},
  floatingSparkle2: {position: 'absolute', bottom: 30, left: 40},
  headerTitle: {fontSize: TYPOGRAPHY.sizes.xxl, fontWeight: TYPOGRAPHY.weight.bold, color: '#fff', marginTop: SPACING.xs},
  headerSubtitle: {fontSize: TYPOGRAPHY.sizes.sm, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: 4},
  statsCard: {flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: SPACING.md, marginTop: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.lg},
  statItem: {alignItems: 'center', flex: 1},
  statNumber: {fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weight.bold},
  statLabel: {fontSize: TYPOGRAPHY.sizes.xs, textTransform: 'capitalize', marginTop: 2},
  section: {padding: SPACING.md},
  sectionTitle: {fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weight.bold, marginBottom: 4},
  sectionSubtitle: {fontSize: TYPOGRAPHY.sizes.sm, marginBottom: SPACING.md},
  templatesContainer: {gap: SPACING.sm, paddingVertical: SPACING.xs},
  achievementsList: {gap: SPACING.sm},
  emptyState: {alignItems: 'center', padding: SPACING.xl, borderRadius: RADIUS.lg},
  emptyTitle: {fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weight.semibold, marginBottom: SPACING.xs},
  emptyText: {fontSize: TYPOGRAPHY.sizes.sm, textAlign: 'center', lineHeight: 20},
  infoCard: {flexDirection: 'row', marginHorizontal: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, gap: SPACING.sm},
  infoContent: {flex: 1},
  infoTitle: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.semibold, marginBottom: 4},
  infoText: {fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 20},
  cardActions: {flexDirection: 'row', gap: SPACING.sm, marginHorizontal: SPACING.md, marginBottom: SPACING.lg},
  editBtn: {flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, paddingVertical: SPACING.sm, borderRadius: RADIUS.md},
  editBtnText: {color: '#fff', fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.semibold},
  deleteBtn: {flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, paddingVertical: SPACING.sm, borderRadius: RADIUS.md},
  deleteBtnText: {color: '#fff', fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.semibold},
});

export default AchievementsScreen;
