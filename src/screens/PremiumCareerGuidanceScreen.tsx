/**
 * PremiumCareerGuidanceScreen - Career exploration with filtering and detail modal
 * Thin composition using extracted components and hook
 */

import React, {useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../constants/design';
import {Icon} from '../components/icons';
import {CareerCard, CATEGORIES, getCareerCategory, getCareerDuration, getCategoryColor} from '../components/career-guidance';
import {CAREER_PATHS, CareerField} from '../data';
import {useCareerGuidanceScreen} from '../hooks/useCareerGuidanceScreen';

// Salary bar sub-component
const SalaryBar = ({min, max, label, colors}: {min: number; max: number; label: string; colors: any}) => {
  const animWidth = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(animWidth, {toValue: (max / 500000) * 100, duration: 800, delay: 200, useNativeDriver: false}).start();
  }, [max]);
  return (
    <View style={{marginBottom: SPACING.sm}}>
      <Text style={{fontSize: TYPOGRAPHY.sizes.xs, color: colors.textSecondary, marginBottom: 4}}>{label}</Text>
      <View style={styles.salaryTrack}>
        <Animated.View style={{height: '100%', borderRadius: 4, overflow: 'hidden', width: animWidth.interpolate({inputRange: [0, 100], outputRange: ['0%', '100%']})}}>
          <LinearGradient colors={['#27ae60', '#2ecc71']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={{flex: 1}} />
        </Animated.View>
      </View>
      <Text style={{fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weight.semibold, color: colors.success}}>
        {min / 1000}K - {max / 1000}K
      </Text>
    </View>
  );
};

const PremiumCareerGuidanceScreen = () => {
  const {
    navigation, colors, isDark,
    activeFilter, setActiveFilter,
    selectedCareer, modalVisible,
    headerAnim, modalAnim,
    filteredCareers, openModal, closeModal,
  } = useCareerGuidanceScreen();

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['top']}>
      {/* Header */}
      <Animated.View style={{opacity: headerAnim, transform: [{translateY: headerAnim.interpolate({inputRange: [0, 1], outputRange: [-20, 0]})}]}}>
        <LinearGradient
          colors={isDark ? ['#1D2127', '#134E4A', '#10B981'] : ['#10B981', '#059669', '#047857']}
          start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.header}>
          <View style={styles.headerDecoration1} />
          <View style={styles.headerDecoration2} />
          <View style={styles.headerDecoration3} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerEmojiContainer}>
            <Icon name="compass-outline" family="Ionicons" size={48} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Career Guidance</Text>
          <Text style={styles.headerSubtitle}>Find your perfect career path</Text>
        </LinearGradient>
      </Animated.View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
          {CATEGORIES.map(category => {
            const isActive = activeFilter === category;
            return (
              <TouchableOpacity key={category} onPress={() => setActiveFilter(category)}>
                {isActive ? (
                  <LinearGradient colors={['#1abc9c', '#16a085']} style={styles.filterChip}>
                    <Text style={styles.filterChipTextActive}>{category}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.filterChip, {backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1}]}>
                    <Text style={{fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.medium, color: colors.textSecondary}}>{category}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results Count */}
      <View style={styles.resultsBar}>
        <Text style={[styles.resultsText, {color: colors.text}]}>
          <Text style={{fontWeight: TYPOGRAPHY.weight.bold}}>{filteredCareers.length}</Text> careers found
        </Text>
      </View>

      {/* Careers List */}
      <FlatList<CareerField>
        data={filteredCareers}
        keyExtractor={item => item.id}
        renderItem={({item, index}) => (
          <CareerCard key={item.id} career={item} onPress={() => openModal(item)} index={index} colors={colors} />
        )}
        contentContainerStyle={styles.careersContainer}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="compass-outline" family="Ionicons" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, {color: colors.textSecondary}]}>No careers found</Text>
          </View>
        }
      />

      {/* Career Detail Modal */}
      <Modal visible={modalVisible} transparent animationType="none" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeModal} />
          <Animated.View style={[styles.modalContent, {backgroundColor: colors.card, transform: [{translateY: modalAnim.interpolate({inputRange: [0, 1], outputRange: [600, 0]})}]}]}>
            <View style={styles.modalHandle} />
            {selectedCareer && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Modal Header */}
                <LinearGradient
                  colors={getCategoryColor(getCareerCategory(selectedCareer)) === '#4573DF' ? ['#4573DF', '#3660C9'] : getCategoryColor(getCareerCategory(selectedCareer)) === '#e74c3c' ? ['#e74c3c', '#c0392b'] : getCategoryColor(getCareerCategory(selectedCareer)) === '#9b59b6' ? ['#9b59b6', '#8e44ad'] : ['#1abc9c', '#16a085']}
                  style={styles.modalHeader}>
                  <View style={{marginBottom: SPACING.sm}}>
                    <Icon name="briefcase-outline" family="Ionicons" size={60} color="#fff" />
                  </View>
                  <Text style={styles.modalTitle}>{selectedCareer.name}</Text>
                  <View style={{flexDirection: 'row', gap: SPACING.sm}}>
                    <View style={styles.modalBadge}>
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Icon name="flame-outline" family="Ionicons" size={11} color="#fff" />
                        <Text style={styles.modalBadgeText}> {selectedCareer.demand_trend || 'High'} Demand</Text>
                      </View>
                    </View>
                    <View style={styles.modalBadge}>
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Icon name="star-outline" family="Ionicons" size={11} color="#fff" />
                        <Text style={styles.modalBadgeText}> Popular</Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>

                {/* Quick Stats */}
                <View style={styles.statsRow}>
                  <View style={[styles.statCard, {backgroundColor: colors.background}]}>
                    <Icon name="school-outline" family="Ionicons" size={24} color={colors.primary} />
                    <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Education</Text>
                    <Text style={[styles.statValue, {color: colors.text}]}>{selectedCareer.required_education?.[0] || "Bachelor's"}</Text>
                  </View>
                  <View style={[styles.statCard, {backgroundColor: colors.background}]}>
                    <Icon name="time-outline" family="Ionicons" size={24} color={colors.primary} />
                    <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Duration</Text>
                    <Text style={[styles.statValue, {color: colors.text}]}>{getCareerDuration(selectedCareer)}</Text>
                  </View>
                  <View style={[styles.statCard, {backgroundColor: colors.background}]}>
                    <Icon name="wallet-outline" family="Ionicons" size={24} color={colors.success} />
                    <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Avg Salary</Text>
                    <Text style={[styles.statValue, {color: colors.success}]}>{(((selectedCareer as any).average_mid_career_salary || (selectedCareer as any).maxSalary || 150000) / 1000).toFixed(0)}K</Text>
                  </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                  <View style={styles.sectionTitleRow}>
                    <Icon name="reader-outline" family="Ionicons" size={18} color={colors.text} />
                    <Text style={[styles.sectionTitle, {color: colors.text}]}> About This Career</Text>
                  </View>
                  <Text style={{fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 22, color: colors.textSecondary}}>{selectedCareer.description}</Text>
                </View>

                {/* Career Roadmap */}
                <View style={styles.section}>
                  <View style={styles.sectionTitleRow}>
                    <Icon name="map-outline" family="Ionicons" size={18} color={colors.text} />
                    <Text style={[styles.sectionTitle, {color: colors.text}]}> Career Roadmap</Text>
                  </View>
                  {(() => {
                    const careerPath = CAREER_PATHS.find(p => p.field_id === selectedCareer.id);
                    const steps = careerPath?.steps?.map((s, idx) => ({step: idx + 1, title: s.stage, duration: s.duration})) || [
                      {step: 1, title: 'Complete Matric', duration: '2 years'},
                      {step: 2, title: 'FSc / Intermediate', duration: '2 years'},
                      {step: 3, title: "Bachelor's Degree", duration: getCareerDuration(selectedCareer)},
                      {step: 4, title: 'Entry Level Job', duration: 'Ongoing'},
                    ];
                    return steps.map((step: any, i: number) => (
                      <View key={i} style={styles.roadmapStep}>
                        <View style={{alignItems: 'center', marginRight: SPACING.sm}}>
                          <LinearGradient colors={['#1abc9c', '#16a085']} style={styles.stepDot}>
                            <Text style={{color: '#fff', fontSize: 12, fontWeight: TYPOGRAPHY.weight.bold}}>{step.step || i + 1}</Text>
                          </LinearGradient>
                          {i < steps.length - 1 && <View style={{width: 3, flex: 1, marginVertical: 4, borderRadius: 2, backgroundColor: '#1abc9c'}} />}
                        </View>
                        <View style={[styles.stepContent, {backgroundColor: colors.background}]}>
                          <Text style={{fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.semibold, color: colors.text, marginBottom: 2}}>{step.title}</Text>
                          <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Icon name="time-outline" family="Ionicons" size={12} color={colors.textSecondary} />
                            <Text style={{fontSize: TYPOGRAPHY.sizes.xs, color: colors.textSecondary}}> {step.duration}</Text>
                          </View>
                        </View>
                      </View>
                    ));
                  })()}
                </View>

                {/* Skills */}
                <View style={styles.section}>
                  <View style={styles.sectionTitleRow}>
                    <Icon name="hammer-outline" family="Ionicons" size={18} color={colors.text} />
                    <Text style={[styles.sectionTitle, {color: colors.text}]}> Skills Required</Text>
                  </View>
                  <View style={styles.skillsGrid}>
                    {(selectedCareer.key_skills || ['Problem Solving', 'Communication', 'Technical Skills', 'Teamwork', 'Creativity']).map((skill: string, i: number) => (
                      <View key={i} style={[styles.skillItem, {backgroundColor: colors.background}]}>
                        <Icon name="checkmark-outline" family="Ionicons" size={14} color={colors.success} />
                        <Text style={{fontSize: TYPOGRAPHY.sizes.sm, color: colors.text}}> {skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Motivation */}
                <View style={[styles.motivationCard, {backgroundColor: isDark ? '#F39C1220' : '#FFF8E1'}]}>
                  <Icon name="bulb-outline" family="Ionicons" size={32} color={isDark ? '#FFD54F' : '#F57F17'} />
                  <Text style={{fontSize: TYPOGRAPHY.sizes.sm, textAlign: 'center', fontWeight: TYPOGRAPHY.weight.medium, color: isDark ? '#FFD54F' : '#F57F17'}}>
                    Success in {selectedCareer.name} requires dedication and continuous learning. Start today!
                  </Text>
                </View>

                <View style={{height: SPACING.xxl}} />
              </ScrollView>
            )}
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {margin: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.xl + SPACING.sm, paddingHorizontal: SPACING.lg, alignItems: 'center', borderRadius: RADIUS.xxl, overflow: 'hidden', elevation: 8, shadowColor: '#10B981', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.25, shadowRadius: 12},
  headerDecoration1: {position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.12)'},
  headerDecoration2: {position: 'absolute', bottom: -30, left: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.08)'},
  headerDecoration3: {position: 'absolute', top: 30, left: 40, width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.06)'},
  backBtn: {position: 'absolute', top: SPACING.md, left: SPACING.md, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', zIndex: 10},
  headerEmojiContainer: {width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)'},
  headerTitle: {fontSize: TYPOGRAPHY.sizes.xxl, fontWeight: TYPOGRAPHY.weight.heavy, color: '#fff', marginBottom: 6, letterSpacing: -0.5, textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 4},
  headerSubtitle: {fontSize: TYPOGRAPHY.sizes.sm, color: 'rgba(255,255,255,0.95)', fontWeight: TYPOGRAPHY.weight.medium, letterSpacing: 0.2},
  filtersContainer: {marginTop: SPACING.sm, zIndex: 10},
  filtersContent: {paddingHorizontal: SPACING.md, gap: SPACING.sm, flexDirection: 'row'},
  filterChip: {paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full},
  filterChipTextActive: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.semibold, color: '#fff'},
  resultsBar: {paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm},
  resultsText: {fontSize: TYPOGRAPHY.sizes.sm},
  careersContainer: {padding: SPACING.md, paddingTop: 0, paddingBottom: 120},
  emptyContainer: {alignItems: 'center', paddingVertical: SPACING.xxl * 2},
  emptyText: {fontSize: TYPOGRAPHY.sizes.md, marginTop: SPACING.md},
  salaryTrack: {height: 8, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 4, overflow: 'hidden', marginBottom: 4},
  modalOverlay: {flex: 1, justifyContent: 'flex-end'},
  modalBackdrop: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)'},
  modalContent: {maxHeight: '90%', borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl, paddingTop: SPACING.sm},
  modalHandle: {width: 40, height: 4, backgroundColor: '#ccc', borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.sm},
  modalHeader: {padding: SPACING.xl, alignItems: 'center'},
  modalTitle: {fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weight.bold, color: '#fff', marginBottom: SPACING.sm},
  modalBadge: {backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full},
  modalBadgeText: {color: '#fff', fontSize: 11, fontWeight: TYPOGRAPHY.weight.semibold},
  statsRow: {flexDirection: 'row', padding: SPACING.md, gap: SPACING.sm},
  statCard: {flex: 1, alignItems: 'center', padding: SPACING.sm, borderRadius: RADIUS.md, gap: 4},
  statLabel: {fontSize: TYPOGRAPHY.sizes.xs},
  statValue: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.semibold},
  section: {paddingHorizontal: SPACING.md, marginBottom: SPACING.md},
  sectionTitleRow: {flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm},
  sectionTitle: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold},
  roadmapStep: {flexDirection: 'row', marginBottom: SPACING.sm},
  stepDot: {width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center'},
  stepContent: {flex: 1, padding: SPACING.sm, borderRadius: RADIUS.md},
  skillsGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm},
  skillItem: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: RADIUS.md},
  motivationCard: {marginHorizontal: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.lg, alignItems: 'center', gap: SPACING.xs},
});

export default PremiumCareerGuidanceScreen;
