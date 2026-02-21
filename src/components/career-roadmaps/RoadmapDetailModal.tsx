import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import TimelineStep from './TimelineStep';
import type {CareerRoadmap} from './data';

const {width} = Dimensions.get('window');

interface RoadmapDetailModalProps {
  visible: boolean;
  roadmap: CareerRoadmap | null;
  colors: any;
  isDark: boolean;
  onClose: () => void;
}

const RoadmapDetailModal = ({visible, roadmap, colors, isDark, onClose}: RoadmapDetailModalProps) => {
  if (!roadmap) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.backBtn} onPress={onClose}>
              <Icon name="arrow-back" family="Ionicons" size={16} color={colors.primary} />
              <Text style={[styles.backBtnText, {color: colors.primary, marginLeft: 4}]}>Back</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Hero */}
            <LinearGradient colors={roadmap.gradient} style={styles.modalHero}>
              <View style={styles.heroDecoration1} />
              <View style={styles.heroDecoration2} />
              <Icon name={roadmap.iconName} family="Ionicons" size={80} color="#FFFFFF" />
              <Text style={styles.modalHeroTitle}>{roadmap.title}</Text>
              <Text style={styles.modalHeroTagline}>{roadmap.tagline}</Text>

              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{roadmap.totalYears}</Text>
                  <Text style={styles.heroStatLabel}>Duration</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{roadmap.difficulty}</Text>
                  <Text style={styles.heroStatLabel}>Difficulty</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{roadmap.demandLevel}</Text>
                  <Text style={styles.heroStatLabel}>Demand</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Fun Fact */}
            <View style={[styles.funFactCard, {backgroundColor: isDark ? '#B8860B30' : '#FFF9E0'}]}>
              <View style={styles.funFactBadge}>
                <Text style={styles.funFactBadgeText}>FUN FACT</Text>
              </View>
              <View style={{marginTop: SPACING.sm, marginBottom: SPACING.xs}}>
                <Icon name="star-outline" family="Ionicons" size={32} color={isDark ? '#FFD93D' : '#F57F17'} />
              </View>
              <Text style={[styles.funFactText, {color: colors.text}]}>{roadmap.funFact}</Text>
            </View>

            {/* Salary */}
            <View style={[styles.salaryCard, {backgroundColor: isDark ? '#1B5E2030' : '#E8F5E9'}]}>
              <View style={styles.salaryIcon}>
                <Icon name="cash-outline" family="Ionicons" size={24} color="#27ae60" />
              </View>
              <View>
                <Text style={[styles.salaryLabel, {color: colors.textSecondary}]}>Salary Range in Pakistan</Text>
                <Text style={[styles.salaryValue, {color: colors.success}]}>{roadmap.salaryRange}</Text>
              </View>
            </View>

            {/* Timeline Steps */}
            <View style={styles.stepsSection}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.md}}>
                <Icon name="navigate-outline" family="Ionicons" size={20} color={colors.text} />
                <Text style={[styles.stepsSectionTitle, {color: colors.text, marginBottom: 0}]}>Your Journey</Text>
              </View>

              {roadmap.steps.map((step, index) => (
                <TimelineStep
                  key={step.id}
                  step={step}
                  index={index}
                  total={roadmap.steps.length}
                  color={roadmap.color}
                  colors={colors}
                />
              ))}
            </View>

            {/* Motivation */}
            <View style={[styles.motivationCard, {backgroundColor: roadmap.color + '15'}]}>
              <View style={{marginBottom: SPACING.sm}}>
                <Icon name="rocket-outline" family="Ionicons" size={48} color={roadmap.color} />
              </View>
              <Text style={[styles.motivationText, {color: roadmap.color}]}>
                Every journey of a thousand miles begins with a single step. Start today!
              </Text>
            </View>

            <View style={{height: 50}} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
  },
  modalHeader: {
    padding: SPACING.md,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  backBtnText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  modalHero: {
    padding: SPACING.xl,
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroDecoration1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroDecoration2: {
    position: 'absolute',
    bottom: -20,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  modalHeroTitle: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  modalHeroTagline: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.md,
  },
  heroStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    maxWidth: width - SPACING.md * 2,
    alignSelf: 'center',
  },
  heroStat: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
    minWidth: 70,
    maxWidth: (width - SPACING.md * 4) / 3,
    flexShrink: 1,
  },
  heroStatValue: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#fff',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  heroStatLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  heroStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  funFactCard: {
    margin: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  funFactBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#FFD93D',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  funFactBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#333',
  },
  funFactText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  salaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  salaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(39,174,96,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  salaryLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: 2,
  },
  salaryValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  stepsSection: {
    paddingHorizontal: SPACING.md,
  },
  stepsSectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: SPACING.md,
  },
  motivationCard: {
    margin: SPACING.md,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default RoadmapDetailModal;
