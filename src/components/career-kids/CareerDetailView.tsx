import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {SPACING, FONTS, BORDER_RADIUS} from '../../constants/theme';
import {TYPOGRAPHY} from '../../constants/design';
import {Icon} from '../icons';
import type {Career} from './data';

interface CareerDetailViewProps {
  career: Career;
  colors: any;
  isDark: boolean;
  getDifficultyColor: (d: string) => string;
  onBack: () => void;
  onStartQuiz: () => void;
}

const CareerDetailView: React.FC<CareerDetailViewProps> = ({
  career,
  colors,
  isDark,
  getDifficultyColor,
  onBack,
  onStartQuiz,
}) => {
  return (
    <ScrollView style={[styles.detailContainer, {backgroundColor: colors.background}]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.detailHeader, {backgroundColor: career.color}]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon name="arrow-back" family="Ionicons" size={16} color={colors.white} />
            <Text style={[styles.backBtnText, {color: colors.white, marginLeft: 4}]}>Back</Text>
          </View>
        </TouchableOpacity>
        <Icon name={career.iconName} family="Ionicons" size={64} color={colors.white} />
        <Text style={[styles.detailTitle, {color: colors.white}]}>{career.title}</Text>
        <Text style={[styles.detailTagline, {color: colors.white}]}>{career.tagline}</Text>
      </View>

      {/* Description */}
      <View style={[styles.section, {backgroundColor: colors.card}]}>
        <View style={styles.sectionHeader}>
          <Icon name="reader-outline" family="Ionicons" size={18} color={colors.text} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>What is a {career.title}?</Text>
        </View>
        <Text style={[styles.sectionText, {color: colors.text}]}>{career.description}</Text>
      </View>

      {/* What They Do */}
      <View style={[styles.section, {backgroundColor: colors.card}]}>
        <View style={styles.sectionHeader}>
          <Icon name="flag-outline" family="Ionicons" size={18} color={colors.text} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>What They Do</Text>
        </View>
        <View style={styles.bulletList}>
          {career.whatTheyDo.map((item, idx) => (
            <View key={idx} style={styles.bulletItem}>
              <View style={{marginRight: SPACING.sm}}>
                <Icon name="checkmark" family="Ionicons" size={16} color={colors.success} />
              </View>
              <Text style={[styles.bulletText, {color: colors.text}]}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Superpowers */}
      <View style={[styles.section, {backgroundColor: colors.card}]}>
        <View style={styles.sectionHeader}>
          <Icon name="flash-outline" family="Ionicons" size={18} color={colors.text} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Superpowers Needed</Text>
        </View>
        <View style={styles.powerGrid}>
          {career.superpowers.map((power, idx) => (
            <View key={idx} style={[styles.powerChip, {backgroundColor: career.color + '20'}]}>
              <Text style={[styles.powerText, {color: career.color}]}>{power}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Cool Tools */}
      <View style={[styles.section, {backgroundColor: colors.card}]}>
        <View style={styles.sectionHeader}>
          <Icon name="hammer-outline" family="Ionicons" size={18} color={colors.text} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Cool Tools</Text>
        </View>
        <View style={styles.toolsRow}>
          {career.coolTools.map((tool, idx) => (
            <View key={idx} style={[styles.toolChip, {backgroundColor: isDark ? colors.surface : '#F5F5F5'}]}>
              <Text style={[styles.toolText, {color: colors.text}]}>{tool}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Fun Fact */}
      <View style={[styles.section, styles.funFactSection, {backgroundColor: isDark ? colors.warning + '20' : '#FFF9C4'}]}>
        <View style={styles.sectionHeader}>
          <Icon name="star-outline" family="Ionicons" size={18} color={colors.text} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Fun Fact!</Text>
        </View>
        <View style={[styles.funFactCard, {backgroundColor: isDark ? colors.warning + '10' : '#FFFDE7'}]}>
          <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
            <View style={{marginRight: 8, marginTop: 2}}>
              <Icon name="bulb-outline" family="Ionicons" size={16} color={isDark ? colors.warning : '#F57F17'} />
            </View>
            <Text style={[styles.funFactText, {color: colors.text, flex: 1}]}>{career.funFact}</Text>
          </View>
        </View>
      </View>

      {/* How to Become */}
      <View style={[styles.section, {backgroundColor: colors.card}]}>
        <View style={styles.sectionHeader}>
          <Icon name="rocket-outline" family="Ionicons" size={18} color={colors.text} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>How to Become One</Text>
        </View>
        <View style={[styles.becomeCard, {backgroundColor: colors.success + '15', borderLeftColor: colors.success}]}>
          <Text style={[styles.becomeText, {color: colors.text}]}>{career.becomeOne}</Text>
        </View>
      </View>

      {/* Salary & Difficulty */}
      <View style={[styles.section, {backgroundColor: colors.card}]}>
        <View style={styles.sectionHeader}>
          <Icon name="wallet-outline" family="Ionicons" size={18} color={colors.text} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>How Much They Earn</Text>
        </View>
        <View style={[styles.salaryCard, {backgroundColor: colors.primary + '15'}]}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
            <View style={{marginRight: 8}}>
              <Icon name="cash-outline" family="Ionicons" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.salaryText, {color: colors.primary}]}>{career.salary}</Text>
          </View>
        </View>
        <View style={styles.difficultyInfo}>
          <Text style={[styles.difficultyLabel, {color: colors.textSecondary}]}>Difficulty Level:</Text>
          <View style={[styles.difficultyBadgeLg, {backgroundColor: getDifficultyColor(career.difficulty)}]}>
            <Text style={[styles.difficultyTextLg, {color: colors.white}]}>{career.difficulty}</Text>
          </View>
        </View>
      </View>

      {/* Famous Pakistanis Role Models */}
      {career.famousPakistanis && career.famousPakistanis.length > 0 && (
        <View style={[styles.section, {backgroundColor: colors.card}]}>
          <View style={styles.sectionHeader}>
            <Icon name="people-outline" family="Ionicons" size={18} color={colors.text} />
            <Text style={[styles.sectionTitle, {color: colors.text}]}>Pakistani Role Models 🇵🇰</Text>
          </View>
          <View style={styles.roleModelsContainer}>
            {career.famousPakistanis.map((person, idx) => (
              <View key={idx} style={[styles.roleModelCard, {backgroundColor: career.color + '15', borderColor: career.color + '30'}]}>
                <View style={[styles.roleModelIcon, {backgroundColor: career.color + '20'}]}>
                  <Icon name="star" family="Ionicons" size={16} color={career.color} />
                </View>
                <Text style={[styles.roleModelText, {color: colors.text}]}>{person}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.inspirationText, {color: colors.textSecondary}]}>
            🌟 You can be like them too! Dream big!
          </Text>
        </View>
      )}

      {/* Quiz Button */}
      <TouchableOpacity
        style={[styles.quizBtn, {backgroundColor: career.color}]}
        onPress={onStartQuiz}>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
          <View style={{marginRight: 8}}>
            <Icon name="game-controller-outline" family="Ionicons" size={20} color={colors.white} />
          </View>
          <Text style={[styles.quizBtnText, {color: colors.white}]}>Take Quiz: Is this career right for me?</Text>
        </View>
      </TouchableOpacity>

      <View style={{height: SPACING.xxl * 2}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  detailContainer: {
    flex: 1,
  },
  detailHeader: {
    padding: SPACING.xl,
    paddingTop: SPACING.md,
    alignItems: 'center',
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  backBtnText: {
    fontSize: FONTS.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  detailTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
  },
  detailTagline: {
    fontSize: FONTS.sizes.md,
    opacity: 0.9,
    marginTop: 4,
  },
  section: {
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: 6,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
  },
  sectionText: {
    fontSize: FONTS.sizes.sm,
    lineHeight: 22,
  },
  bulletList: {
    gap: SPACING.xs,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
  },
  powerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  powerChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  powerText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  toolsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  toolChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  toolText: {
    fontSize: FONTS.sizes.sm,
  },
  funFactSection: {},
  funFactCard: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  funFactText: {
    fontSize: FONTS.sizes.sm,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  becomeCard: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
  },
  becomeText: {
    fontSize: FONTS.sizes.sm,
    lineHeight: 22,
  },
  salaryCard: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  salaryText: {
    fontSize: FONTS.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    textAlign: 'center',
  },
  difficultyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  difficultyLabel: {
    fontSize: FONTS.sizes.sm,
  },
  difficultyBadgeLg: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  difficultyTextLg: {
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold',
  },
  roleModelsContainer: {
    gap: SPACING.sm,
  },
  roleModelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  roleModelIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  roleModelText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    flex: 1,
  },
  inspirationText: {
    fontSize: FONTS.sizes.xs,
    textAlign: 'center',
    marginTop: SPACING.md,
    fontStyle: 'italic',
  },
  quizBtn: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  quizBtnText: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
  },
});

export default CareerDetailView;
