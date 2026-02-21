import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../contexts/ThemeContext';
import {SPACING} from '../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../constants/design';
import {Icon} from '../components/icons';
import {CAREER_FIELDS} from '../data';
import type {RootStackParamList} from '../navigation/AppNavigator';

const {width} = Dimensions.get('window');

type CareerDetailRouteProps = RouteProp<RootStackParamList, 'CareerDetail'>;

// Career icon mapping
const getCareerIcon = (careerId: string): string => {
  const iconMap: {[key: string]: string} = {
    'medicine': 'medkit',
    'dentistry': 'medical',
    'software-engineering': 'code-slash',
    'electrical-engineering': 'flash',
    'civil-engineering': 'construct',
    'business-finance': 'trending-up',
    'chartered-accountant': 'calculator',
    'law': 'briefcase',
    'graphic-design': 'color-palette',
    'teaching': 'school',
    'journalism': 'newspaper',
    'civil-services': 'flag',
    'aviation-pilot': 'airplane',
    'data-science-ai': 'analytics',
    'psychology': 'heart',
  };
  return iconMap[careerId] || 'briefcase';
};

// Career color mapping
const getCareerColor = (careerId: string): string => {
  const colorMap: {[key: string]: string} = {
    'medicine': '#E53935',
    'dentistry': '#F57C00',
    'software-engineering': '#4573DF',
    'electrical-engineering': '#FF9800',
    'civil-engineering': '#795548',
    'business-finance': '#2E7D32',
    'chartered-accountant': '#6A1B9A',
    'law': '#37474F',
    'graphic-design': '#E91E63',
    'teaching': '#00BCD4',
    'journalism': '#607D8B',
    'civil-services': '#3F51B5',
    'aviation-pilot': '#03A9F4',
    'data-science-ai': '#9C27B0',
    'psychology': '#EC407A',
  };
  return colorMap[careerId] || '#4573DF';
};

const CareerDetailScreen = () => {
  const {colors, isDark} = useTheme();
  const navigation = useNavigation();
  const route = useRoute<CareerDetailRouteProps>();
  const {careerId} = route.params;

  // Find career from CAREER_FIELDS
  const career = CAREER_FIELDS.find(c => c.id === careerId);

  if (!career) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['top']}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" family="Ionicons" size={64} color={colors.error} />
          <Text style={[styles.errorText, {color: colors.text}]}>Career not found</Text>
          <TouchableOpacity
            style={[styles.backButton, {backgroundColor: colors.primary}]}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const careerColor = getCareerColor(careerId);
  const careerIcon = getCareerIcon(careerId);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[careerColor, careerColor + 'CC']}
          style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Icon name={careerIcon} family="Ionicons" size={64} color="#FFFFFF" />
          <Text style={styles.headerTitle}>{career.name}</Text>
          <Text style={styles.headerSubtitle}>{career.scope_pakistan}</Text>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, {backgroundColor: colors.card}]}>
            <Icon name="trending-up" family="Ionicons" size={24} color="#27ae60" />
            <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Demand</Text>
            <Text style={[styles.statValue, {color: colors.text}]}>{career.demand_trend}</Text>
          </View>
          <View style={[styles.statCard, {backgroundColor: colors.card}]}>
            <Icon name="cash" family="Ionicons" size={24} color="#2E7D32" />
            <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Starting</Text>
            <Text style={[styles.statValue, {color: colors.text}]}>
              {career.average_starting_salary.toLocaleString()} PKR
            </Text>
          </View>
          <View style={[styles.statCard, {backgroundColor: colors.card}]}>
            <Icon name="star" family="Ionicons" size={24} color="#FF9800" />
            <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Senior</Text>
            <Text style={[styles.statValue, {color: colors.text}]}>
              {career.average_senior_salary.toLocaleString()} PKR
            </Text>
          </View>
        </View>

        {/* Salary Range */}
        <View style={[styles.section, {backgroundColor: colors.card}]}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>💰 Salary Range in Pakistan</Text>
          <View style={styles.salaryBars}>
            <SalaryBar label="Starting" value={career.average_starting_salary} max={500000} color="#4CAF50" />
            <SalaryBar label="Mid-level" value={career.average_mid_career_salary} max={500000} color="#2196F3" />
            <SalaryBar label="Senior" value={career.average_senior_salary} max={500000} color="#9C27B0" />
          </View>
        </View>

        {/* Education Requirements */}
        <View style={[styles.section, {backgroundColor: colors.card}]}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>📚 Education Required</Text>
          {career.required_education.map((edu, index) => (
            <View key={index} style={styles.listItem}>
              <Icon name="checkmark-circle" family="Ionicons" size={20} color="#27ae60" />
              <Text style={[styles.listText, {color: colors.textSecondary}]}>{edu}</Text>
            </View>
          ))}
        </View>

        {/* Key Skills */}
        <View style={[styles.section, {backgroundColor: colors.card}]}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>🎯 Key Skills</Text>
          <View style={styles.skillsContainer}>
            {career.key_skills.map((skill, index) => (
              <View key={index} style={[styles.skillChip, {backgroundColor: careerColor + '20', borderColor: careerColor}]}>
                <Text style={[styles.skillText, {color: careerColor}]}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Employers */}
        <View style={[styles.section, {backgroundColor: colors.card}]}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>🏢 Top Employers in Pakistan</Text>
          {career.top_employers.map((employer, index) => (
            <View key={index} style={styles.listItem}>
              <Icon name="business" family="Ionicons" size={20} color={careerColor} />
              <Text style={[styles.listText, {color: colors.textSecondary}]}>{employer}</Text>
            </View>
          ))}
        </View>

        {/* Job Titles */}
        <View style={[styles.section, {backgroundColor: colors.card}]}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>👔 Common Job Titles</Text>
          <View style={styles.skillsContainer}>
            {career.job_titles.map((title, index) => (
              <View key={index} style={[styles.jobChip, {backgroundColor: colors.background}]}>
                <Text style={[styles.jobText, {color: colors.text}]}>{title}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pros & Cons */}
        <View style={styles.prosConsContainer}>
          <View style={[styles.prosCard, {backgroundColor: '#E8F5E9'}]}>
            <Text style={styles.prosTitle}>✅ Pros</Text>
            {career.pros.map((pro, index) => (
              <Text key={index} style={styles.proItem}>• {pro}</Text>
            ))}
          </View>
          <View style={[styles.consCard, {backgroundColor: '#FFEBEE'}]}>
            <Text style={styles.consTitle}>⚠️ Cons</Text>
            {career.cons.map((con, index) => (
              <Text key={index} style={styles.conItem}>• {con}</Text>
            ))}
          </View>
        </View>

        {/* Future Outlook */}
        <View style={[styles.section, {backgroundColor: colors.card}]}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>🔮 Future Outlook</Text>
          <Text style={[styles.outlookText, {color: colors.textSecondary}]}>{career.future_outlook}</Text>
        </View>

        {/* Fix Data */}
        <TouchableOpacity
          onPress={() =>
            (navigation as any).navigate('DataCorrection', {
              entityType: 'career',
              entityId: career.id,
              entityName: career.name,
            })
          }
          style={[styles.fixDataRow, {borderColor: colors.border || '#E5E7EB', backgroundColor: colors.card}]}>
          <Icon name="create-outline" family="Ionicons" size={16} color={colors.textSecondary} />
          <Text style={[styles.fixDataText, {color: colors.textSecondary}]}>Found incorrect or outdated career data? Fix it</Text>
          <Icon name="chevron-forward" family="Ionicons" size={14} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={{height: 32}} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Salary bar component
const SalaryBar = ({label, value, max, color}: {label: string; value: number; max: number; color: string}) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <View style={styles.salaryBarContainer}>
      <Text style={styles.salaryLabel}>{label}</Text>
      <View style={styles.salaryBarTrack}>
        <View style={[styles.salaryBarFill, {width: `${percentage}%`, backgroundColor: color}]} />
      </View>
      <Text style={styles.salaryValue}>{(value / 1000).toFixed(0)}K</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  backButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: TYPOGRAPHY.weight.semibold,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  header: {
    padding: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl * 1.5,
    alignItems: 'center',
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
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.xs,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
    textTransform: 'capitalize',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
    marginTop: -SPACING.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.xs,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING.xs,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginTop: 2,
  },
  section: {
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: SPACING.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  listText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  skillChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  skillText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  jobChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  jobText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  prosConsContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  prosCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  consCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  prosTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#2E7D32',
    marginBottom: SPACING.sm,
  },
  consTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#C62828',
    marginBottom: SPACING.sm,
  },
  proItem: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#1B5E20',
    marginBottom: 4,
    lineHeight: 16,
  },
  conItem: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#B71C1C',
    marginBottom: 4,
    lineHeight: 16,
  },
  outlookText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 22,
  },
  salaryBars: {
    gap: SPACING.sm,
  },
  salaryBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  salaryLabel: {
    width: 60,
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#666',
  },
  salaryBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  salaryBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  salaryValue: {
    width: 50,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#333',
    textAlign: 'right',
  },
  fixDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  fixDataText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
});

export default CareerDetailScreen;
