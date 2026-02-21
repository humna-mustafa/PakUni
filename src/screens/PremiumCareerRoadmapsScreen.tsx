import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../constants/design';
import {Icon} from '../components/icons';
import {RoadmapCard, RoadmapDetailModal} from '../components/career-roadmaps';
import {useCareerRoadmaps} from '../hooks/useCareerRoadmaps';

const PremiumCareerRoadmapsScreen = () => {
  const {
    colors,
    isDark,
    selectedRoadmap,
    showDetailModal,
    headerAnim,
    roadmaps,
    totalRoadmaps,
    openDetail,
    closeDetail,
    goBack,
  } = useCareerRoadmaps();

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['top']}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={goBack}>
        <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
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
            colors={['#9C27B0', '#7B1FA2', '#6A1B9A']}
            style={styles.header}>
            <View style={styles.headerDecoration1} />
            <View style={styles.headerDecoration2} />
            <View style={styles.headerIconContainer}>
              <Icon name="map-outline" family="Ionicons" size={56} color="#FFFFFF" />
            </View>
            <Text style={styles.headerTitle}>Career Roadmaps</Text>
            <Text style={styles.headerSubtitle}>
              Step-by-step paths to your dream career!
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Info Card */}
        <View style={[styles.infoCard, {backgroundColor: isDark ? '#B8860B30' : '#FFF9E0'}]}>
          <LinearGradient
            colors={['rgba(255,217,61,0.2)', 'transparent']}
            style={StyleSheet.absoluteFillObject}
          />
          <Icon name="bulb-outline" family="Ionicons" size={28} color={isDark ? '#FFD93D' : '#F57F17'} />
          <Text style={[styles.infoText, {color: isDark ? '#FFD93D' : '#666'}]}>
            Tap any career to see the complete journey from school to success!
          </Text>
        </View>

        {/* Roadmaps Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <Icon name="flag-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text}]}>Career Paths</Text>
            </View>
            <View style={[styles.countBadge, {backgroundColor: colors.primary + '20'}]}>
              <Text style={[styles.countText, {color: colors.primary}]}>{totalRoadmaps}</Text>
            </View>
          </View>

          {roadmaps.map((roadmap, index) => (
            <RoadmapCard
              key={roadmap.id}
              roadmap={roadmap}
              index={index}
              onPress={() => openDetail(roadmap)}
              colors={colors}
            />
          ))}
        </View>

        <View style={{height: SPACING.xxl * 2}} />
      </ScrollView>

      {/* Detail Modal */}
      <RoadmapDetailModal
        visible={showDetailModal}
        roadmap={selectedRoadmap}
        colors={colors}
        isDark={isDark}
        onClose={closeDetail}
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
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
    borderBottomLeftRadius: RADIUS.xxxl,
    borderBottomRightRadius: RADIUS.xxxl,
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
    fontSize: 30,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255,255,255,0.9)',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    overflow: 'hidden',
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    lineHeight: 20,
  },
  section: {
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginRight: SPACING.sm,
  },
  countBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  countText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
});

export default PremiumCareerRoadmapsScreen;
