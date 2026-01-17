/**
 * Enhanced Career Explorer
 * Salary insights, job market trends, career paths
 */

import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../icons';
import {TYPOGRAPHY, RADIUS, SPACING} from '../../constants/design';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

interface SalaryRange {
  min: number;
  max: number;
  currency: string;
}

interface JobDemand {
  level: 'very-high' | 'high' | 'medium' | 'low';
  trend: 'rising' | 'stable' | 'declining';
  openings: number;
}

interface CareerPath {
  title: string;
  yearsExperience: string;
  salary: SalaryRange;
}

interface Career {
  id: string;
  title: string;
  field: string;
  icon: string;
  color: string;
  description: string;
  requiredDegrees: string[];
  entryLevelSalary: SalaryRange;
  midLevelSalary: SalaryRange;
  seniorLevelSalary: SalaryRange;
  demand: JobDemand;
  topCompanies: string[];
  skills: string[];
  careerPath: CareerPath[];
  workEnvironment: string[];
  growthPotential: number; // 1-5
}

interface EnhancedCareerExplorerProps {
  onCareerSelect?: (career: Career) => void;
}

// ============================================================================
// CAREER DATA
// ============================================================================

const CAREERS_DATA: Career[] = [
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    field: 'Technology',
    icon: 'code-slash-outline',
    color: '#4573DF',
    description: 'Design, develop, and maintain software applications and systems.',
    requiredDegrees: ['BS Computer Science', 'BS Software Engineering', 'BS IT'],
    entryLevelSalary: {min: 60000, max: 120000, currency: 'PKR'},
    midLevelSalary: {min: 150000, max: 300000, currency: 'PKR'},
    seniorLevelSalary: {min: 400000, max: 800000, currency: 'PKR'},
    demand: {level: 'very-high', trend: 'rising', openings: 15000},
    topCompanies: ['Systems Limited', 'Netsol', 'Careem', 'Airlift', 'Jazz', 'Telenor'],
    skills: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'AWS'],
    careerPath: [
      {title: 'Junior Developer', yearsExperience: '0-2', salary: {min: 60000, max: 120000, currency: 'PKR'}},
      {title: 'Software Engineer', yearsExperience: '2-4', salary: {min: 150000, max: 250000, currency: 'PKR'}},
      {title: 'Senior Engineer', yearsExperience: '4-7', salary: {min: 300000, max: 500000, currency: 'PKR'}},
      {title: 'Tech Lead', yearsExperience: '7-10', salary: {min: 500000, max: 800000, currency: 'PKR'}},
      {title: 'Engineering Manager', yearsExperience: '10+', salary: {min: 800000, max: 1500000, currency: 'PKR'}},
    ],
    workEnvironment: ['Office', 'Remote', 'Hybrid'],
    growthPotential: 5,
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    field: 'Technology',
    icon: 'analytics-outline',
    color: '#4573DF',
    description: 'Analyze complex data to help organizations make better decisions.',
    requiredDegrees: ['BS Computer Science', 'BS Data Science', 'MS Statistics'],
    entryLevelSalary: {min: 80000, max: 150000, currency: 'PKR'},
    midLevelSalary: {min: 200000, max: 400000, currency: 'PKR'},
    seniorLevelSalary: {min: 500000, max: 1000000, currency: 'PKR'},
    demand: {level: 'very-high', trend: 'rising', openings: 5000},
    topCompanies: ['Jazz', 'Careem', 'Daraz', 'Systems Limited', 'Afiniti'],
    skills: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'TensorFlow', 'Tableau'],
    careerPath: [
      {title: 'Junior Data Analyst', yearsExperience: '0-2', salary: {min: 80000, max: 150000, currency: 'PKR'}},
      {title: 'Data Scientist', yearsExperience: '2-5', salary: {min: 200000, max: 400000, currency: 'PKR'}},
      {title: 'Senior Data Scientist', yearsExperience: '5-8', salary: {min: 500000, max: 800000, currency: 'PKR'}},
      {title: 'Lead Data Scientist', yearsExperience: '8+', salary: {min: 800000, max: 1500000, currency: 'PKR'}},
    ],
    workEnvironment: ['Office', 'Remote'],
    growthPotential: 5,
  },
  {
    id: 'electrical-engineer',
    title: 'Electrical Engineer',
    field: 'Engineering',
    icon: 'flash-outline',
    color: '#F59E0B',
    description: 'Design and develop electrical systems, equipment, and components.',
    requiredDegrees: ['BS Electrical Engineering'],
    entryLevelSalary: {min: 50000, max: 90000, currency: 'PKR'},
    midLevelSalary: {min: 100000, max: 200000, currency: 'PKR'},
    seniorLevelSalary: {min: 250000, max: 500000, currency: 'PKR'},
    demand: {level: 'high', trend: 'stable', openings: 8000},
    topCompanies: ['K-Electric', 'WAPDA', 'Siemens', 'ABB', 'Schneider'],
    skills: ['Circuit Design', 'PLC Programming', 'MATLAB', 'AutoCAD', 'Power Systems'],
    careerPath: [
      {title: 'Junior Engineer', yearsExperience: '0-2', salary: {min: 50000, max: 90000, currency: 'PKR'}},
      {title: 'Electrical Engineer', yearsExperience: '2-5', salary: {min: 100000, max: 200000, currency: 'PKR'}},
      {title: 'Senior Engineer', yearsExperience: '5-10', salary: {min: 250000, max: 400000, currency: 'PKR'}},
      {title: 'Chief Engineer', yearsExperience: '10+', salary: {min: 400000, max: 800000, currency: 'PKR'}},
    ],
    workEnvironment: ['Office', 'Field', 'Plant'],
    growthPotential: 4,
  },
  {
    id: 'doctor',
    title: 'Medical Doctor',
    field: 'Healthcare',
    icon: 'medical-outline',
    color: '#10B981',
    description: 'Diagnose and treat illnesses, prescribe medications, and provide patient care.',
    requiredDegrees: ['MBBS', 'MD'],
    entryLevelSalary: {min: 80000, max: 150000, currency: 'PKR'},
    midLevelSalary: {min: 200000, max: 400000, currency: 'PKR'},
    seniorLevelSalary: {min: 500000, max: 2000000, currency: 'PKR'},
    demand: {level: 'very-high', trend: 'stable', openings: 20000},
    topCompanies: ['Shaukat Khanum', 'Aga Khan Hospital', 'CMH', 'Shifa Hospital'],
    skills: ['Clinical Diagnosis', 'Patient Care', 'Medical Procedures', 'Communication'],
    careerPath: [
      {title: 'House Officer', yearsExperience: '0-1', salary: {min: 80000, max: 120000, currency: 'PKR'}},
      {title: 'Medical Officer', yearsExperience: '1-3', salary: {min: 150000, max: 250000, currency: 'PKR'}},
      {title: 'Specialist', yearsExperience: '5-10', salary: {min: 300000, max: 600000, currency: 'PKR'}},
      {title: 'Consultant', yearsExperience: '10+', salary: {min: 500000, max: 2000000, currency: 'PKR'}},
    ],
    workEnvironment: ['Hospital', 'Clinic', 'Private Practice'],
    growthPotential: 5,
  },
  {
    id: 'chartered-accountant',
    title: 'Chartered Accountant',
    field: 'Finance',
    icon: 'calculator-outline',
    color: '#0891B2',
    description: 'Manage financial records, conduct audits, and provide financial advice.',
    requiredDegrees: ['BBA/BCom', 'CA'],
    entryLevelSalary: {min: 60000, max: 100000, currency: 'PKR'},
    midLevelSalary: {min: 150000, max: 350000, currency: 'PKR'},
    seniorLevelSalary: {min: 500000, max: 1500000, currency: 'PKR'},
    demand: {level: 'high', trend: 'stable', openings: 6000},
    topCompanies: ['Deloitte', 'PwC', 'EY', 'KPMG', 'BDO'],
    skills: ['Financial Analysis', 'Auditing', 'Tax Planning', 'Excel', 'SAP'],
    careerPath: [
      {title: 'Audit Trainee', yearsExperience: '0-3', salary: {min: 40000, max: 80000, currency: 'PKR'}},
      {title: 'Senior Associate', yearsExperience: '3-5', salary: {min: 150000, max: 300000, currency: 'PKR'}},
      {title: 'Manager', yearsExperience: '5-8', salary: {min: 400000, max: 700000, currency: 'PKR'}},
      {title: 'Partner', yearsExperience: '10+', salary: {min: 1000000, max: 5000000, currency: 'PKR'}},
    ],
    workEnvironment: ['Office', 'Client Sites'],
    growthPotential: 5,
  },
  {
    id: 'civil-engineer',
    title: 'Civil Engineer',
    field: 'Engineering',
    icon: 'construct-outline',
    color: '#DC2626',
    description: 'Design and oversee construction of infrastructure projects.',
    requiredDegrees: ['BS Civil Engineering'],
    entryLevelSalary: {min: 45000, max: 80000, currency: 'PKR'},
    midLevelSalary: {min: 100000, max: 200000, currency: 'PKR'},
    seniorLevelSalary: {min: 250000, max: 600000, currency: 'PKR'},
    demand: {level: 'high', trend: 'rising', openings: 10000},
    topCompanies: ['NLC', 'FWO', 'NESPAK', 'Descon', 'Bahria Town'],
    skills: ['AutoCAD', 'Structural Design', 'Project Management', 'ETABS', 'Surveying'],
    careerPath: [
      {title: 'Site Engineer', yearsExperience: '0-2', salary: {min: 45000, max: 80000, currency: 'PKR'}},
      {title: 'Project Engineer', yearsExperience: '2-5', salary: {min: 100000, max: 200000, currency: 'PKR'}},
      {title: 'Project Manager', yearsExperience: '5-10', salary: {min: 250000, max: 500000, currency: 'PKR'}},
      {title: 'Director', yearsExperience: '10+', salary: {min: 500000, max: 1500000, currency: 'PKR'}},
    ],
    workEnvironment: ['Office', 'Construction Site', 'Field'],
    growthPotential: 4,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatSalary = (amount: number): string => {
  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(1)}L`;
  }
  return `${(amount / 1000).toFixed(0)}K`;
};

const getDemandColor = (level: JobDemand['level']): string => {
  switch (level) {
    case 'very-high':
      return '#10B981';
    case 'high':
      return '#22C55E';
    case 'medium':
      return '#F59E0B';
    case 'low':
      return '#EF4444';
  }
};

const getDemandLabel = (level: JobDemand['level']): string => {
  switch (level) {
    case 'very-high':
      return 'Very High';
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
  }
};

// ============================================================================
// SALARY BAR COMPONENT
// ============================================================================

interface SalaryBarProps {
  label: string;
  salary: SalaryRange;
  maxSalary: number;
  color: string;
}

const SalaryBar: React.FC<SalaryBarProps> = ({label, salary, maxSalary, color}) => {
  const widthPercent = (salary.max / maxSalary) * 100;
  const minWidthPercent = (salary.min / maxSalary) * 100;

  return (
    <View style={salaryBarStyles.container}>
      <Text style={salaryBarStyles.label}>{label}</Text>
      <View style={salaryBarStyles.barContainer}>
        <View
          style={[
            salaryBarStyles.barBackground,
            {width: `${widthPercent}%`},
          ]}>
          <LinearGradient
            colors={[color + '40', color]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={[
              salaryBarStyles.bar,
              {marginLeft: `${(minWidthPercent / widthPercent) * 100}%`},
            ]}
          />
        </View>
      </View>
      <Text style={salaryBarStyles.amount}>
        {formatSalary(salary.min)} - {formatSalary(salary.max)}
      </Text>
    </View>
  );
};

const salaryBarStyles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#64748B',
    marginBottom: 4,
  },
  barContainer: {
    height: 24,
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  barBackground: {
    height: '100%',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  bar: {
    flex: 1,
    borderRadius: RADIUS.md,
  },
  amount: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 4,
  },
});

// ============================================================================
// CAREER CARD COMPONENT
// ============================================================================

interface CareerCardProps {
  career: Career;
  onPress: () => void;
  isExpanded: boolean;
}

const CareerCard: React.FC<CareerCardProps> = ({career, onPress, isExpanded}) => {
  const maxSalary = career.seniorLevelSalary.max;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[cardStyles.container, isExpanded && cardStyles.containerExpanded]}
      activeOpacity={0.9}>
      {/* Header */}
      <View style={cardStyles.header}>
        <LinearGradient
          colors={[career.color, career.color + 'CC']}
          style={cardStyles.iconContainer}>
          <Icon name={career.icon} size={24} color="#FFF" />
        </LinearGradient>
        <View style={cardStyles.headerText}>
          <Text style={cardStyles.title}>{career.title}</Text>
          <Text style={cardStyles.field}>{career.field}</Text>
        </View>
        <View
          style={[
            cardStyles.demandBadge,
            {backgroundColor: getDemandColor(career.demand.level) + '20'},
          ]}>
          <View
            style={[
              cardStyles.demandDot,
              {backgroundColor: getDemandColor(career.demand.level)},
            ]}
          />
          <Text
            style={[
              cardStyles.demandText,
              {color: getDemandColor(career.demand.level)},
            ]}>
            {getDemandLabel(career.demand.level)}
          </Text>
        </View>
      </View>

      {/* Salary Preview */}
      <View style={cardStyles.salaryPreview}>
        <View style={cardStyles.salaryItem}>
          <Text style={cardStyles.salaryLabel}>Entry Level</Text>
          <Text style={[cardStyles.salaryValue, {color: career.color}]}>
            {formatSalary(career.entryLevelSalary.min)}-{formatSalary(career.entryLevelSalary.max)}
          </Text>
        </View>
        <Icon name="arrow-forward" size={16} color="#CBD5E1" />
        <View style={cardStyles.salaryItem}>
          <Text style={cardStyles.salaryLabel}>Senior Level</Text>
          <Text style={[cardStyles.salaryValue, {color: career.color}]}>
            {formatSalary(career.seniorLevelSalary.min)}-{formatSalary(career.seniorLevelSalary.max)}
          </Text>
        </View>
      </View>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={cardStyles.expandedContent}>
          {/* Description */}
          <Text style={cardStyles.description}>{career.description}</Text>

          {/* Salary Breakdown */}
          <View style={cardStyles.section}>
            <Text style={cardStyles.sectionTitle}>💰 Salary Ranges (Monthly)</Text>
            <SalaryBar
              label="Entry Level"
              salary={career.entryLevelSalary}
              maxSalary={maxSalary}
              color={career.color}
            />
            <SalaryBar
              label="Mid Level"
              salary={career.midLevelSalary}
              maxSalary={maxSalary}
              color={career.color}
            />
            <SalaryBar
              label="Senior Level"
              salary={career.seniorLevelSalary}
              maxSalary={maxSalary}
              color={career.color}
            />
          </View>

          {/* Career Path */}
          <View style={cardStyles.section}>
            <Text style={cardStyles.sectionTitle}>📈 Career Path</Text>
            <View style={cardStyles.careerPath}>
              {career.careerPath.map((step, index) => (
                <View key={step.title} style={cardStyles.careerStep}>
                  <View
                    style={[
                      cardStyles.stepDot,
                      {backgroundColor: career.color},
                    ]}
                  />
                  {index < career.careerPath.length - 1 && (
                    <View
                      style={[
                        cardStyles.stepLine,
                        {backgroundColor: career.color + '40'},
                      ]}
                    />
                  )}
                  <View style={cardStyles.stepContent}>
                    <Text style={cardStyles.stepTitle}>{step.title}</Text>
                    <Text style={cardStyles.stepYears}>{step.yearsExperience} years</Text>
                    <Text style={[cardStyles.stepSalary, {color: career.color}]}>
                      {formatSalary(step.salary.min)}-{formatSalary(step.salary.max)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Job Market */}
          <View style={cardStyles.section}>
            <Text style={cardStyles.sectionTitle}>📊 Job Market</Text>
            <View style={cardStyles.marketStats}>
              <View style={cardStyles.statBox}>
                <Icon
                  name={
                    career.demand.trend === 'rising'
                      ? 'trending-up'
                      : career.demand.trend === 'declining'
                      ? 'trending-down'
                      : 'remove'
                  }
                  size={24}
                  color={
                    career.demand.trend === 'rising'
                      ? '#10B981'
                      : career.demand.trend === 'declining'
                      ? '#EF4444'
                      : '#F59E0B'
                  }
                />
                <Text style={cardStyles.statLabel}>Trend</Text>
                <Text style={cardStyles.statValue}>
                  {career.demand.trend.charAt(0).toUpperCase() +
                    career.demand.trend.slice(1)}
                </Text>
              </View>
              <View style={cardStyles.statBox}>
                <Text style={cardStyles.statNumber}>
                  {career.demand.openings.toLocaleString()}+
                </Text>
                <Text style={cardStyles.statLabel}>Open Positions</Text>
              </View>
              <View style={cardStyles.statBox}>
                <View style={cardStyles.growthStars}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Icon
                      key={star}
                      name={star <= career.growthPotential ? 'star' : 'star-outline'}
                      size={14}
                      color={star <= career.growthPotential ? '#F59E0B' : '#CBD5E1'}
                    />
                  ))}
                </View>
                <Text style={cardStyles.statLabel}>Growth Potential</Text>
              </View>
            </View>
          </View>

          {/* Skills */}
          <View style={cardStyles.section}>
            <Text style={cardStyles.sectionTitle}>🛠️ Key Skills</Text>
            <View style={cardStyles.skillsContainer}>
              {career.skills.map(skill => (
                <View
                  key={skill}
                  style={[cardStyles.skillChip, {borderColor: career.color}]}>
                  <Text style={[cardStyles.skillText, {color: career.color}]}>
                    {skill}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Top Companies */}
          <View style={cardStyles.section}>
            <Text style={cardStyles.sectionTitle}>🏢 Top Employers</Text>
            <Text style={cardStyles.companiesList}>
              {career.topCompanies.join(' • ')}
            </Text>
          </View>

          {/* Required Degrees */}
          <View style={cardStyles.section}>
            <Text style={cardStyles.sectionTitle}>🎓 Required Degrees</Text>
            <View style={cardStyles.degreesContainer}>
              {career.requiredDegrees.map(degree => (
                <View key={degree} style={cardStyles.degreeChip}>
                  <Icon name="school-outline" size={14} color="#4573DF" />
                  <Text style={cardStyles.degreeText}>{degree}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Work Environment */}
          <View style={cardStyles.section}>
            <Text style={cardStyles.sectionTitle}>🏠 Work Environment</Text>
            <View style={cardStyles.envContainer}>
              {career.workEnvironment.map(env => (
                <View key={env} style={cardStyles.envChip}>
                  <Icon
                    name={
                      env === 'Remote'
                        ? 'home-outline'
                        : env === 'Hybrid'
                        ? 'git-merge-outline'
                        : 'business-outline'
                    }
                    size={14}
                    color="#64748B"
                  />
                  <Text style={cardStyles.envText}>{env}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Expand Indicator */}
      <View style={cardStyles.expandIndicator}>
        <Icon
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#94A3B8"
        />
      </View>
    </TouchableOpacity>
  );
};

const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  containerExpanded: {
    shadowOpacity: 0.1,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: '#1E293B',
  },
  field: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    marginTop: 2,
  },
  demandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  demandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  demandText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
  salaryPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  salaryItem: {
    flex: 1,
  },
  salaryLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94A3B8',
  },
  salaryValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    marginTop: 2,
  },
  expandedContent: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING.sm,
  },
  careerPath: {
    paddingLeft: SPACING.sm,
  },
  careerStep: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  stepLine: {
    position: 'absolute',
    left: 5,
    top: 16,
    width: 2,
    height: 40,
  },
  stepContent: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#1E293B',
  },
  stepYears: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94A3B8',
  },
  stepSalary: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    marginTop: 2,
  },
  marketStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    marginHorizontal: 2,
  },
  statNumber: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '800',
    color: '#4573DF',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#1E293B',
  },
  growthStars: {
    flexDirection: 'row',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  skillText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
  companiesList: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#475569',
    lineHeight: 20,
  },
  degreesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  degreeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  degreeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#4573DF',
    fontWeight: '500',
    marginLeft: 4,
  },
  envContainer: {
    flexDirection: 'row',
  },
  envChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.sm,
  },
  envText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#64748B',
    fontWeight: '500',
    marginLeft: 4,
  },
  expandIndicator: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const EnhancedCareerExplorer: React.FC<EnhancedCareerExplorerProps> = ({
  onCareerSelect,
}) => {
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [expandedCareer, setExpandedCareer] = useState<string | null>(null);

  // Get unique fields
  const fields = useMemo(() => {
    const fieldSet = new Set(CAREERS_DATA.map(c => c.field));
    return Array.from(fieldSet);
  }, []);

  // Filter careers by field
  const filteredCareers = useMemo(() => {
    if (!selectedField) return CAREERS_DATA;
    return CAREERS_DATA.filter(c => c.field === selectedField);
  }, [selectedField]);

  // Handle career press
  const handleCareerPress = (career: Career) => {
    setExpandedCareer(prev => (prev === career.id ? null : career.id));
    onCareerSelect?.(career);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.headerIcon}>
          <Icon name="briefcase-outline" size={28} color="#FFF" />
        </LinearGradient>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Career Explorer</Text>
          <Text style={styles.headerSubtitle}>
            Salary insights & job market trends
          </Text>
        </View>
      </View>

      {/* Field Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}>
        <TouchableOpacity
          onPress={() => setSelectedField(null)}
          style={[
            styles.filterChip,
            !selectedField && styles.filterChipActive,
          ]}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.filterText,
              !selectedField && styles.filterTextActive,
            ]}>
            All Fields
          </Text>
        </TouchableOpacity>
        {fields.map(field => (
          <TouchableOpacity
            key={field}
            onPress={() => setSelectedField(field)}
            style={[
              styles.filterChip,
              selectedField === field && styles.filterChipActive,
            ]}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.filterText,
                selectedField === field && styles.filterTextActive,
              ]}>
              {field}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Career Cards */}
      {filteredCareers.map(career => (
        <CareerCard
          key={career.id}
          career={career}
          onPress={() => handleCareerPress(career)}
          isExpanded={expandedCareer === career.id}
        />
      ))}

      {/* Footer Note */}
      <View style={styles.footer}>
        <Icon name="information-circle-outline" size={16} color="#94A3B8" />
        <Text style={styles.footerText}>
          Salary data is based on market research and may vary by location,
          company, and individual qualifications.
        </Text>
      </View>
    </ScrollView>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '800',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    marginTop: 2,
  },
  filterContainer: {
    marginBottom: SPACING.lg,
    marginHorizontal: -SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFF',
    borderRadius: RADIUS.md,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#4573DF',
    borderColor: '#4573DF',
  },
  filterText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFF',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  footerText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94A3B8',
    marginLeft: SPACING.sm,
    lineHeight: 16,
  },
});

export default EnhancedCareerExplorer;


