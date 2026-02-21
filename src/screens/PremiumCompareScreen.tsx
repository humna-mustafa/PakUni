import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../constants/design';
import {Icon} from '../components/icons';
import {SearchableDropdown} from '../components/SearchableDropdown';
import {CompareSlot, ComparisonRow, COMPARISON_METRICS} from '../components/compare';
import {useCompareScreen} from '../hooks/useCompareScreen';

const PremiumCompareScreen = () => {
  const {
    colors, isDark, navigation,
    selectedUniversities, modalVisible, headerAnim,
    hasComparison, canShare, universityOptions,
    openModal, closeModal, selectUniversity, removeUniversity,
    handleShareComparison,
  } = useCompareScreen();

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['top']}>
      {/* Header */}
      <Animated.View style={[styles.headerContainer, {
        opacity: headerAnim,
        transform: [{translateY: headerAnim.interpolate({inputRange: [0, 1], outputRange: [-20, 0]})}],
      }]}>
        <LinearGradient
          colors={isDark ? ['#1E3A5F', '#1E1E2E'] : ['#4573DF', '#3660C9']}
          style={styles.header}>
          <View style={styles.headerDecoration1} />
          <View style={styles.headerDecoration2} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerIconContainer}>
            <Icon name="git-compare-outline" family="Ionicons" size={50} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>Compare Universities</Text>
          <Text style={styles.headerSubtitle}>Select up to 3 universities to compare side by side</Text>
        </LinearGradient>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Slots */}
        <View style={styles.slotsContainer}>
          {selectedUniversities.map((uni, index) => (
            <CompareSlot key={index} university={uni} onPress={() => openModal(index)}
              onRemove={() => removeUniversity(index)} index={index} colors={colors} />
          ))}
        </View>

        {/* Comparison Table */}
        {hasComparison ? (
          <View style={styles.comparisonContainer}>
            <View style={styles.sectionHeader}>
              <Icon name="analytics-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text}]}>Comparison Details</Text>
              {canShare && (
                <TouchableOpacity
                  style={[styles.shareCompareBtn, {backgroundColor: `${colors.primary}15`, borderColor: colors.primary}]}
                  onPress={handleShareComparison} activeOpacity={0.8}>
                  <Icon name="share-social-outline" family="Ionicons" size={16} color={colors.primary} />
                  <Text style={[styles.shareCompareBtnText, {color: colors.primary}]}>Share</Text>
                </TouchableOpacity>
              )}
            </View>
            {COMPARISON_METRICS.map((metric, index) => (
              <ComparisonRow key={metric.key} metric={metric} universities={selectedUniversities}
                colors={colors} index={index} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, {backgroundColor: colors.primary + '15'}]}>
              <Icon name="search-outline" family="Ionicons" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, {color: colors.text}]}>Start Comparing</Text>
            <Text style={[styles.emptyDescription, {color: colors.textSecondary}]}>
              Add universities above to see a detailed side-by-side comparison
            </Text>
          </View>
        )}

        {/* Tips Card */}
        <View style={[styles.tipsCard, {backgroundColor: colors.card}]}>
          <LinearGradient colors={['rgba(52, 152, 219, 0.1)', 'rgba(52, 152, 219, 0.05)']} style={styles.tipsGradient}>
            <Icon name="bulb-outline" family="Ionicons" size={28} color="#4573DF" />
            <Text style={[styles.tipsTitle, {color: colors.text}]}>Pro Tips</Text>
            {['Compare public vs private for fee differences',
              'Check scholarship availability before deciding',
              'Consider city location for living costs'].map((tip, i) => (
              <View key={i} style={styles.tipItem}>
                <Text style={styles.tipBullet}>{'\u2022'}</Text>
                <Text style={[styles.tipText, {color: colors.textSecondary}]}>{tip}</Text>
              </View>
            ))}
          </LinearGradient>
        </View>

        {/* Disclaimer */}
        <View style={[styles.disclaimerCard, {backgroundColor: colors.card, borderColor: colors.warning || '#F59E0B'}]}>
          <Icon name="information-circle" family="Ionicons" size={20} color={colors.warning || '#F59E0B'} />
          <Text style={[styles.disclaimerText, {color: colors.textSecondary}]}>
            Data shown is for reference only. Please verify with official university websites for the most accurate and up-to-date information.
          </Text>
        </View>
        <View style={{height: SPACING.xxl * 2}} />
      </ScrollView>

      {modalVisible && (
        <SearchableDropdown label="Select University" placeholder="Search for a university..."
          visible={modalVisible} options={universityOptions} showLogos={true}
          onSelect={(option, value) => selectUniversity(value)} onClose={closeModal} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  headerContainer: {},
  header: {
    paddingTop: SPACING.lg, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.md,
    alignItems: 'center', borderBottomLeftRadius: RADIUS.xxl, borderBottomRightRadius: RADIUS.xxl, overflow: 'hidden',
  },
  headerDecoration1: {
    position: 'absolute', top: -30, right: -30, width: 120, height: 120,
    borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerDecoration2: {
    position: 'absolute', bottom: -20, left: -20, width: 80, height: 80,
    borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    position: 'absolute', top: SPACING.md, left: SPACING.md, width: 40, height: 40,
    borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', zIndex: 10,
  },
  headerIconContainer: {marginBottom: SPACING.xs},
  headerTitle: {fontSize: TYPOGRAPHY.sizes.xxl, fontWeight: TYPOGRAPHY.weight.bold, color: '#fff', marginBottom: 4},
  headerSubtitle: {fontSize: TYPOGRAPHY.sizes.sm, color: 'rgba(255,255,255,0.9)', textAlign: 'center'},
  slotsContainer: {flexDirection: 'row', justifyContent: 'space-between', padding: SPACING.md, marginTop: -20},
  comparisonContainer: {marginHorizontal: SPACING.md, marginTop: SPACING.md, borderRadius: RADIUS.lg, overflow: 'hidden'},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm},
  sectionTitle: {fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weight.bold, flex: 1},
  shareCompareBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs + 2, borderRadius: RADIUS.md, borderWidth: 1, gap: 4,
  },
  shareCompareBtnText: {fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weight.semibold},
  emptyState: {alignItems: 'center', paddingVertical: SPACING.xl * 2, paddingHorizontal: SPACING.xl},
  emptyIconContainer: {width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md},
  emptyTitle: {fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weight.bold, marginBottom: SPACING.xs},
  emptyDescription: {fontSize: TYPOGRAPHY.sizes.sm, textAlign: 'center'},
  tipsCard: {
    marginHorizontal: SPACING.md, marginTop: SPACING.lg, borderRadius: RADIUS.lg, overflow: 'hidden',
    elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 4,
  },
  tipsGradient: {padding: SPACING.md},
  tipsTitle: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold, marginBottom: SPACING.sm},
  tipItem: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4},
  tipBullet: {fontSize: 14, marginRight: 6, color: '#4573DF'},
  tipText: {flex: 1, fontSize: TYPOGRAPHY.sizes.sm},
  disclaimerCard: {
    flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: SPACING.md, marginTop: SPACING.md,
    padding: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1, gap: SPACING.sm,
  },
  disclaimerText: {flex: 1, fontSize: TYPOGRAPHY.sizes.xs, lineHeight: 16},
});

export default PremiumCompareScreen;
