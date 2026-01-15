/**
 * GuidesScreen - Comprehensive Guides Hub
 * Categories: Admission, Study Tips, Career, Test Prep, University Life, etc.
 * All guides stored locally - no Supabase dependency
 */

import React, {useState, useRef, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  FlatList,
  Dimensions,
  StatusBar,
  Platform,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../contexts/ThemeContext';
import {TYPOGRAPHY, RADIUS, SPACING} from '../constants/design';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

interface GuideCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  guideCount: number;
}

interface Guide {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  readTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  steps?: GuideStep[];
  content?: string;
  tips?: string[];
  resources?: {title: string; url?: string}[];
}

interface GuideStep {
  id: string;
  title: string;
  description: string;
  tips?: string[];
  documents?: string[];
  important?: boolean;
}

// ============================================================================
// GUIDE CATEGORIES
// ============================================================================

const GUIDE_CATEGORIES: GuideCategory[] = [
  {
    id: 'admission',
    title: 'Admission',
    icon: 'school-outline',
    color: '#6366F1',
    description: 'University application process & requirements',
    guideCount: 12,
  },
  {
    id: 'test-prep',
    title: 'Test Prep',
    icon: 'document-text-outline',
    color: '#10B981',
    description: 'Entry test preparation strategies',
    guideCount: 8,
  },
  {
    id: 'career',
    title: 'Career',
    icon: 'briefcase-outline',
    color: '#F59E0B',
    description: 'Career paths & job market insights',
    guideCount: 10,
  },
  {
    id: 'study-tips',
    title: 'Study Tips',
    icon: 'bulb-outline',
    color: '#EC4899',
    description: 'Effective study techniques & habits',
    guideCount: 15,
  },
  {
    id: 'scholarships',
    title: 'Scholarships',
    icon: 'ribbon-outline',
    color: '#8B5CF6',
    description: 'Finding & applying for scholarships',
    guideCount: 7,
  },
  {
    id: 'uni-life',
    title: 'University Life',
    icon: 'people-outline',
    color: '#0891B2',
    description: 'Campus life, hostels & activities',
    guideCount: 9,
  },
  {
    id: 'financial',
    title: 'Financial',
    icon: 'wallet-outline',
    color: '#059669',
    description: 'Budgeting, loans & financial planning',
    guideCount: 6,
  },
  {
    id: 'mental-health',
    title: 'Mental Health',
    icon: 'heart-outline',
    color: '#DC2626',
    description: 'Stress management & wellbeing tips',
    guideCount: 8,
  },
  {
    id: 'parents',
    title: 'For Parents',
    icon: 'people-circle-outline',
    color: '#7C3AED',
    description: 'Guidance for supporting your child',
    guideCount: 5,
  },
  {
    id: 'international',
    title: 'Study Abroad',
    icon: 'globe-outline',
    color: '#0284C7',
    description: 'Foreign university admission guide',
    guideCount: 7,
  },
];

// ============================================================================
// COMPREHENSIVE GUIDES DATA
// ============================================================================

const GUIDES_DATA: Guide[] = [
  // ADMISSION GUIDES
  {
    id: 'adm-nust',
    categoryId: 'admission',
    title: 'NUST Admission Complete Guide',
    description: 'Step-by-step process for NUST undergraduate admissions including NET registration, preparation, and merit list.',
    readTime: '15 min',
    difficulty: 'intermediate',
    tags: ['NUST', 'NET', 'Engineering', 'Islamabad'],
    steps: [
      {id: '1', title: 'Create NET Account', description: 'Visit ugadmissions.nust.edu.pk and create your account with valid email.', tips: ['Use personal email', 'Save credentials'], important: true},
      {id: '2', title: 'Fill Application Form', description: 'Complete online form with academic details. Select up to 6 program preferences.', documents: ['Matric certificate', 'Inter marks', 'CNIC'], important: true},
      {id: '3', title: 'Pay Application Fee', description: 'Pay Rs. 4,500 via bank or online payment.', tips: ['Keep receipt safe']},
      {id: '4', title: 'Download Admit Card', description: 'Print admit card showing test center and date.', tips: ['Print multiple copies', 'Visit center beforehand'], important: true},
      {id: '5', title: 'Appear for NET', description: 'Take the NUST Entry Test (Physics, Math, Chemistry, English, IQ).', tips: ['Arrive 1 hour early', 'Bring CNIC original', 'No electronics'], important: true},
      {id: '6', title: 'Check Result & Merit', description: 'Check NET result and monitor merit lists.', tips: ['Download result', 'Check multiple merit lists']},
      {id: '7', title: 'Accept Admission', description: 'Accept offer and pay fee within deadline.', documents: ['Original certificates', 'Medical fitness'], important: true},
    ],
  },
  {
    id: 'adm-fast',
    categoryId: 'admission',
    title: 'FAST-NUCES Admission Guide',
    description: 'Complete guide for FAST university admissions across all campuses.',
    readTime: '12 min',
    difficulty: 'intermediate',
    tags: ['FAST', 'Computing', 'Lahore', 'Islamabad', 'Karachi'],
    steps: [
      {id: '1', title: 'Register Online', description: 'Create account on FAST admissions portal.', tips: ['Choose preferred test center']},
      {id: '2', title: 'Fill Application', description: 'Select up to 5 programs and campus preferences.', documents: ['Matric marks', 'Inter marks'], important: true},
      {id: '3', title: 'Pay Test Fee', description: 'Submit Rs. 5,500 via bank challan.'},
      {id: '4', title: 'Take Entrance Test', description: 'MCQ test: Math, English, Analytical (2.5-3 hours).', tips: ['Focus on Math', 'Practice past papers'], important: true},
      {id: '5', title: 'Check Merit Lists', description: 'Monitor campus-specific merit lists.'},
      {id: '6', title: 'Confirm Admission', description: 'Pay semester dues within deadline.', documents: ['Original certificates', 'Migration'], important: true},
    ],
  },
  {
    id: 'adm-general',
    categoryId: 'admission',
    title: 'University Admission Basics',
    description: 'General guide for understanding Pakistani university admission process.',
    readTime: '10 min',
    difficulty: 'beginner',
    tags: ['Basics', 'HEC', 'Documents'],
    content: 'Understanding the admission process in Pakistani universities...',
    tips: [
      'Start preparing at least 6 months before',
      'Keep all documents ready and attested',
      'Apply to multiple universities for backup',
      'Track all application deadlines carefully',
      'Prepare for both test and interview',
    ],
  },
  {
    id: 'adm-documents',
    categoryId: 'admission',
    title: 'Required Documents Checklist',
    description: 'Complete list of documents needed for university admissions.',
    readTime: '5 min',
    difficulty: 'beginner',
    tags: ['Documents', 'Checklist'],
    tips: [
      'Matric/O-Level Certificate & Marks Sheet (Attested)',
      'Intermediate/A-Level Certificate & Marks Sheet (Attested)',
      'CNIC/B-Form Copy',
      'Passport Size Photographs (White background)',
      'Character Certificate from last institution',
      'Domicile Certificate',
      'Migration Certificate',
      'Medical Fitness Certificate',
      'Income Certificate (for scholarships)',
      'Bank Statement (for financial aid)',
    ],
  },
  // TEST PREP GUIDES
  {
    id: 'test-net',
    categoryId: 'test-prep',
    title: 'NET Preparation Strategy',
    description: 'Comprehensive preparation guide for NUST Entry Test.',
    readTime: '20 min',
    difficulty: 'intermediate',
    tags: ['NET', 'NUST', 'Strategy'],
    tips: [
      'Start 3-4 months before test date',
      'Cover FSc/A-Level syllabus thoroughly',
      'Practice past papers daily',
      'Focus on weak areas',
      'Take timed mock tests weekly',
      'Review incorrect answers carefully',
    ],
    resources: [
      {title: 'Official NUST Past Papers'},
      {title: 'Dogar Brothers NET Book'},
      {title: 'Online MCQ Banks'},
    ],
  },
  {
    id: 'test-ecat',
    categoryId: 'test-prep',
    title: 'ECAT Preparation Guide',
    description: 'Strategy for Engineering College Admission Test.',
    readTime: '18 min',
    difficulty: 'intermediate',
    tags: ['ECAT', 'UET', 'Engineering'],
    tips: [
      'Cover complete FSc Part 1 & 2',
      'Focus on Physics numerical problems',
      'Practice Math formulas daily',
      'Solve previous 10 years papers',
      'Time management is crucial',
    ],
  },
  {
    id: 'test-mdcat',
    categoryId: 'test-prep',
    title: 'MDCAT Complete Guide',
    description: 'Medical & Dental College Admission Test preparation.',
    readTime: '25 min',
    difficulty: 'advanced',
    tags: ['MDCAT', 'Medical', 'PMC'],
    tips: [
      'Follow PMC syllabus strictly',
      'Biology needs most time investment',
      'Practice Chemistry MCQs daily',
      'Understand Physics concepts deeply',
      'English and Logical Reasoning matter',
    ],
  },
  // CAREER GUIDES
  {
    id: 'career-software',
    categoryId: 'career',
    title: 'Software Engineering Career Path',
    description: 'Complete roadmap for becoming a software engineer in Pakistan.',
    readTime: '15 min',
    difficulty: 'beginner',
    tags: ['Software', 'IT', 'Tech', 'Programming'],
    tips: [
      'Learn programming fundamentals first',
      'Build projects for portfolio',
      'Contribute to open source',
      'Network with professionals',
      'Keep learning new technologies',
    ],
    resources: [
      {title: 'FreeCodeCamp'},
      {title: 'LeetCode'},
      {title: 'GitHub'},
    ],
  },
  {
    id: 'career-doctor',
    categoryId: 'career',
    title: 'Becoming a Doctor in Pakistan',
    description: 'Complete journey from MBBS to specialization.',
    readTime: '20 min',
    difficulty: 'intermediate',
    tags: ['MBBS', 'Medical', 'Doctor'],
    steps: [
      {id: '1', title: 'Pass MDCAT', description: 'Clear the Medical College Admission Test', important: true},
      {id: '2', title: 'Complete MBBS', description: '5 years of medical education'},
      {id: '3', title: 'House Job', description: '1 year mandatory internship'},
      {id: '4', title: 'PMDC Registration', description: 'Get licensed to practice'},
      {id: '5', title: 'Specialization', description: 'FCPS or other postgraduate degrees'},
    ],
  },
  {
    id: 'career-ca',
    categoryId: 'career',
    title: 'Chartered Accountant (CA) Path',
    description: 'Guide to becoming a CA through ICAP.',
    readTime: '15 min',
    difficulty: 'intermediate',
    tags: ['CA', 'ICAP', 'Accounting', 'Finance'],
    steps: [
      {id: '1', title: 'Complete Inter/A-Level', description: 'Preferably with Commerce'},
      {id: '2', title: 'Register with ICAP', description: 'Join as a student member'},
      {id: '3', title: 'Pass CAF Exams', description: 'Certificate in Accounting & Finance'},
      {id: '4', title: 'Complete CFAP', description: 'Certified Finance & Accounting Professional'},
      {id: '5', title: 'Practical Training', description: '3.5 years with a firm'},
      {id: '6', title: 'MSA Exams', description: 'Multi-Subject Assessment'},
    ],
  },
  // STUDY TIPS
  {
    id: 'study-techniques',
    categoryId: 'study-tips',
    title: 'Effective Study Techniques',
    description: 'Proven methods to study smarter, not harder.',
    readTime: '12 min',
    difficulty: 'beginner',
    tags: ['Study', 'Techniques', 'Productivity'],
    tips: [
      'Use Active Recall - test yourself regularly',
      'Spaced Repetition - review at intervals',
      'Pomodoro Technique - 25 min focus sessions',
      'Teach others what you learn',
      'Create mind maps for complex topics',
      'Study in a distraction-free environment',
    ],
  },
  {
    id: 'study-time-management',
    categoryId: 'study-tips',
    title: 'Time Management for Students',
    description: 'Balance studies, tests, and life effectively.',
    readTime: '10 min',
    difficulty: 'beginner',
    tags: ['Time', 'Management', 'Planning'],
    tips: [
      'Create a weekly study schedule',
      'Prioritize tasks using importance matrix',
      'Set specific goals for each study session',
      'Take regular breaks to avoid burnout',
      'Use apps like Forest or Todoist',
      'Review and adjust your schedule weekly',
    ],
  },
  {
    id: 'study-exam-prep',
    categoryId: 'study-tips',
    title: 'Board Exam Preparation',
    description: 'Strategies for Matric and Inter board exams.',
    readTime: '15 min',
    difficulty: 'intermediate',
    tags: ['Board', 'Exams', 'Matric', 'Inter'],
    tips: [
      'Start preparation 3 months before',
      'Solve past papers from last 10 years',
      'Focus on important questions and chapters',
      'Make short notes for quick revision',
      'Practice writing answers within time limit',
      'Get enough sleep before exams',
    ],
  },
  // SCHOLARSHIPS
  {
    id: 'scholarship-hec',
    categoryId: 'scholarships',
    title: 'HEC Scholarships Guide',
    description: 'Complete guide to HEC scholarship programs.',
    readTime: '15 min',
    difficulty: 'intermediate',
    tags: ['HEC', 'Government', 'Merit'],
    tips: [
      'Maintain high CGPA for merit scholarships',
      'Apply early - slots are limited',
      'Prepare strong application essays',
      'Get good recommendation letters',
      'Keep financial documents ready',
    ],
    resources: [
      {title: 'HEC USAID Scholarship'},
      {title: 'PEEF Scholarship'},
      {title: 'EHSAAS Scholarship'},
    ],
  },
  {
    id: 'scholarship-application',
    categoryId: 'scholarships',
    title: 'Writing Scholarship Essays',
    description: 'How to write compelling scholarship applications.',
    readTime: '12 min',
    difficulty: 'intermediate',
    tags: ['Essays', 'Application', 'Writing'],
    tips: [
      'Start with a strong opening hook',
      'Be specific about your achievements',
      'Show genuine passion and goals',
      'Proofread multiple times',
      'Get feedback from teachers',
      'Meet all deadlines',
    ],
  },
  // UNIVERSITY LIFE
  {
    id: 'unilife-hostel',
    categoryId: 'uni-life',
    title: 'Hostel Life Survival Guide',
    description: 'Tips for adapting to hostel life in Pakistan.',
    readTime: '10 min',
    difficulty: 'beginner',
    tags: ['Hostel', 'Accommodation', 'Tips'],
    tips: [
      'Pack essential items from home',
      'Respect roommates and their space',
      'Manage your finances carefully',
      'Maintain good hygiene',
      'Stay connected with family',
      'Join hostel activities and events',
    ],
  },
  {
    id: 'unilife-balance',
    categoryId: 'uni-life',
    title: 'Balancing Studies & Social Life',
    description: 'How to enjoy university while maintaining grades.',
    readTime: '8 min',
    difficulty: 'beginner',
    tags: ['Balance', 'Social', 'Grades'],
    tips: [
      'Set clear priorities',
      'Join clubs relevant to your career',
      'Dont skip classes for fun',
      'Study in groups when helpful',
      'Take care of your mental health',
      'Build meaningful friendships',
    ],
  },
  // FINANCIAL GUIDES (NEW)
  {
    id: 'financial-budget',
    categoryId: 'financial',
    title: 'Student Budgeting 101',
    description: 'Learn to manage your money effectively as a student.',
    readTime: '12 min',
    difficulty: 'beginner',
    tags: ['Budget', 'Money', 'Finance', 'Savings'],
    tips: [
      'Track all your expenses for a month',
      'Create a monthly budget plan',
      'Separate needs from wants',
      'Use student discounts everywhere',
      'Save at least 10% of any money you get',
      'Use budgeting apps like Money Manager',
      'Cook at home instead of eating out',
      'Buy used textbooks or share with friends',
    ],
  },
  {
    id: 'financial-loans',
    categoryId: 'financial',
    title: 'Education Loans in Pakistan',
    description: 'Understanding student loans and how to apply.',
    readTime: '15 min',
    difficulty: 'intermediate',
    tags: ['Loans', 'Banks', 'Education Finance'],
    tips: [
      'Research all loan options before applying',
      'Compare interest rates across banks',
      'Understand repayment terms clearly',
      'Keep guarantor documents ready',
      'Apply early - processing takes time',
    ],
    resources: [
      {title: 'HBL Education Loan'},
      {title: 'MCB Student Finance'},
      {title: 'HEC Qarz-e-Hasna Scheme'},
    ],
  },
  {
    id: 'financial-parttime',
    categoryId: 'financial',
    title: 'Part-Time Jobs for Students',
    description: 'Ways to earn while studying in Pakistan.',
    readTime: '10 min',
    difficulty: 'beginner',
    tags: ['Jobs', 'Earning', 'Part-time', 'Income'],
    tips: [
      'Freelancing on Fiverr/Upwork',
      'Tutoring younger students',
      'Content writing for websites',
      'Social media management',
      'Campus jobs (library, IT support)',
      'Internships with stipends',
      'Online teaching platforms',
    ],
  },
  // MENTAL HEALTH GUIDES (NEW)
  {
    id: 'mental-stress',
    categoryId: 'mental-health',
    title: 'Managing Exam Stress',
    description: 'Techniques to handle academic pressure effectively.',
    readTime: '10 min',
    difficulty: 'beginner',
    tags: ['Stress', 'Anxiety', 'Exams', 'Wellbeing'],
    tips: [
      'Practice deep breathing exercises',
      'Exercise regularly - even 20 min walk helps',
      'Get 7-8 hours of sleep',
      'Talk to friends and family',
      'Break study sessions into chunks',
      'Take breaks and do activities you enjoy',
      'Avoid comparing yourself to others',
      'Remember: one exam doesnt define you',
    ],
  },
  {
    id: 'mental-anxiety',
    categoryId: 'mental-health',
    title: 'Dealing with Test Anxiety',
    description: 'Overcome fear and perform your best in exams.',
    readTime: '12 min',
    difficulty: 'beginner',
    tags: ['Anxiety', 'Fear', 'Performance', 'Confidence'],
    tips: [
      'Prepare thoroughly - preparation builds confidence',
      'Practice with mock tests',
      'Arrive at exam center early',
      'Use positive self-talk',
      'Focus on one question at a time',
      'If stuck, move to next question',
      'Breathing exercises before exam',
      'Visualize success',
    ],
  },
  {
    id: 'mental-motivation',
    categoryId: 'mental-health',
    title: 'Staying Motivated During Studies',
    description: 'How to maintain focus and drive throughout the year.',
    readTime: '8 min',
    difficulty: 'beginner',
    tags: ['Motivation', 'Focus', 'Goals', 'Inspiration'],
    tips: [
      'Set clear, achievable goals',
      'Celebrate small victories',
      'Find a study buddy or group',
      'Visualize your future success',
      'Remember why you started',
      'Take breaks when needed',
      'Reward yourself for milestones',
      'Connect with successful role models',
    ],
  },
  {
    id: 'mental-burnout',
    categoryId: 'mental-health',
    title: 'Preventing Student Burnout',
    description: 'Recognize signs and recover from academic exhaustion.',
    readTime: '12 min',
    difficulty: 'intermediate',
    tags: ['Burnout', 'Recovery', 'Self-care', 'Balance'],
    tips: [
      'Recognize warning signs early',
      'Dont skip meals or sleep',
      'Schedule regular downtime',
      'Pursue hobbies outside studies',
      'Learn to say no to extra commitments',
      'Seek help if overwhelmed',
      'Physical exercise is essential',
      'Connect with friends regularly',
    ],
  },
  // PARENTS GUIDES (NEW)
  {
    id: 'parents-support',
    categoryId: 'parents',
    title: 'Supporting Your Child\'s Education',
    description: 'How parents can help without pressuring their children.',
    readTime: '10 min',
    difficulty: 'beginner',
    tags: ['Parenting', 'Support', 'Guidance', 'Communication'],
    tips: [
      'Listen to your childs interests',
      'Avoid comparing with other children',
      'Celebrate effort, not just results',
      'Create a supportive study environment',
      'Be involved but not controlling',
      'Research career options together',
      'Manage your own expectations',
      'Support their chosen path',
    ],
  },
  {
    id: 'parents-admissions',
    categoryId: 'parents',
    title: 'Parents Guide to Admissions',
    description: 'Understanding the admission process to help your child.',
    readTime: '15 min',
    difficulty: 'intermediate',
    tags: ['Admissions', 'Process', 'Timeline', 'Preparation'],
    tips: [
      'Understand different entry tests',
      'Help track application deadlines',
      'Assist with document preparation',
      'Visit universities together',
      'Discuss financial aspects openly',
      'Support backup plans',
      'Dont pressure for specific choices',
    ],
  },
  // INTERNATIONAL/STUDY ABROAD (NEW)
  {
    id: 'intl-basics',
    categoryId: 'international',
    title: 'Study Abroad: Getting Started',
    description: 'Everything you need to know about studying overseas.',
    readTime: '20 min',
    difficulty: 'intermediate',
    tags: ['Study Abroad', 'International', 'Visa', 'Process'],
    tips: [
      'Start planning 1-2 years in advance',
      'Research destination countries',
      'Check language requirements',
      'Prepare for standardized tests (IELTS, SAT)',
      'Research visa requirements early',
      'Explore scholarship opportunities',
      'Connect with Pakistani students abroad',
    ],
  },
  {
    id: 'intl-scholarships',
    categoryId: 'international',
    title: 'International Scholarships for Pakistanis',
    description: 'Funded opportunities to study abroad.',
    readTime: '15 min',
    difficulty: 'intermediate',
    tags: ['Scholarships', 'Funding', 'Fulbright', 'Chevening'],
    resources: [
      {title: 'Fulbright Scholarship (USA)'},
      {title: 'Chevening Scholarship (UK)'},
      {title: 'DAAD Scholarship (Germany)'},
      {title: 'Australia Awards'},
      {title: 'Erasmus+ (Europe)'},
      {title: 'Chinese Government Scholarship'},
      {title: 'Turkish Government Scholarship'},
    ],
    tips: [
      'Each scholarship has specific requirements',
      'Applications are highly competitive',
      'Start preparing essays months ahead',
      'Get strong recommendation letters',
      'Demonstrate leadership and community work',
    ],
  },
];

// ============================================================================
// CATEGORY CARD COMPONENT
// ============================================================================

interface CategoryCardProps {
  category: GuideCategory;
  onPress: () => void;
  colors: any;
}

const CategoryCard: React.FC<CategoryCardProps> = ({category, onPress, colors}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[categoryStyles.cardWrapper, {transform: [{scale: scaleAnim}]}]}>
      <TouchableOpacity
        style={[categoryStyles.card, {backgroundColor: colors.card}]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}>
        <View style={[categoryStyles.iconContainer, {backgroundColor: category.color + '15'}]}>
          <Icon name={category.icon} size={24} color={category.color} />
        </View>
        <Text style={[categoryStyles.title, {color: colors.text}]}>{category.title}</Text>
        <Text style={[categoryStyles.description, {color: colors.textSecondary}]} numberOfLines={2}>
          {category.description}
        </Text>
        <View style={categoryStyles.countBadge}>
          <Text style={[categoryStyles.countText, {color: category.color}]}>
            {category.guideCount} Guides
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const categoryStyles = StyleSheet.create({
  cardWrapper: {
    width: (SCREEN_WIDTH - 48 - 12) / 2,
    marginBottom: 12,
  },
  card: {
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    minHeight: 160,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: 16,
    marginBottom: SPACING.sm,
  },
  countBadge: {
    marginTop: 'auto',
  },
  countText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
});

// ============================================================================
// GUIDE LIST ITEM
// ============================================================================

interface GuideListItemProps {
  guide: Guide;
  onPress: () => void;
  colors: any;
}

const GuideListItem: React.FC<GuideListItemProps> = ({guide, onPress, colors}) => {
  const category = GUIDE_CATEGORIES.find(c => c.id === guide.categoryId);

  return (
    <TouchableOpacity
      style={[guideItemStyles.container, {backgroundColor: colors.card}]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={guideItemStyles.content}>
        <View style={guideItemStyles.header}>
          <View style={[guideItemStyles.categoryBadge, {backgroundColor: (category?.color || '#6366F1') + '15'}]}>
            <Text style={[guideItemStyles.categoryText, {color: category?.color || '#6366F1'}]}>
              {category?.title}
            </Text>
          </View>
          <View style={guideItemStyles.meta}>
            <Icon name="time-outline" size={12} color={colors.textSecondary} />
            <Text style={[guideItemStyles.metaText, {color: colors.textSecondary}]}>
              {guide.readTime}
            </Text>
          </View>
        </View>
        <Text style={[guideItemStyles.title, {color: colors.text}]}>{guide.title}</Text>
        <Text style={[guideItemStyles.description, {color: colors.textSecondary}]} numberOfLines={2}>
          {guide.description}
        </Text>
        <View style={guideItemStyles.tagsContainer}>
          {guide.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={[guideItemStyles.tag, {backgroundColor: colors.background}]}>
              <Text style={[guideItemStyles.tagText, {color: colors.textSecondary}]}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
      <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
};

const guideItemStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  categoryBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    marginLeft: 4,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginRight: 4,
  },
  tagText: {
    fontSize: 10,
  },
});

// ============================================================================
// GUIDE DETAIL MODAL CONTENT
// ============================================================================

interface GuideDetailProps {
  guide: Guide;
  onClose: () => void;
  colors: any;
}

const GuideDetail: React.FC<GuideDetailProps> = ({guide, onClose, colors}) => {
  const category = GUIDE_CATEGORIES.find(c => c.id === guide.categoryId);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  return (
    <View style={[detailStyles.container, {backgroundColor: colors.background}]}>
      {/* Header */}
      <LinearGradient
        colors={[category?.color || '#6366F1', (category?.color || '#6366F1') + 'CC']}
        style={detailStyles.header}>
        <TouchableOpacity style={detailStyles.backButton} onPress={onClose}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={detailStyles.headerContent}>
          <View style={detailStyles.headerBadge}>
            <Text style={detailStyles.headerBadgeText}>{category?.title}</Text>
          </View>
          <Text style={detailStyles.headerTitle}>{guide.title}</Text>
          <View style={detailStyles.headerMeta}>
            <Icon name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={detailStyles.headerMetaText}>{guide.readTime}</Text>
            <View style={detailStyles.difficultyBadge}>
              <Text style={detailStyles.difficultyText}>
                {guide.difficulty.charAt(0).toUpperCase() + guide.difficulty.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={detailStyles.content} showsVerticalScrollIndicator={false}>
        {/* Description */}
        <Text style={[detailStyles.description, {color: colors.textSecondary}]}>
          {guide.description}
        </Text>

        {/* Steps (if available) */}
        {guide.steps && guide.steps.length > 0 && (
          <View style={detailStyles.section}>
            <Text style={[detailStyles.sectionTitle, {color: colors.text}]}>📝 Steps</Text>
            {guide.steps.map((step, index) => (
              <TouchableOpacity
                key={step.id}
                style={[detailStyles.stepCard, {backgroundColor: colors.card}]}
                onPress={() => toggleStep(step.id)}
                activeOpacity={0.7}>
                <View style={detailStyles.stepHeader}>
                  <View style={[detailStyles.stepNumber, {backgroundColor: category?.color || '#6366F1'}]}>
                    <Text style={detailStyles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <View style={detailStyles.stepHeaderContent}>
                    <Text style={[detailStyles.stepTitle, {color: colors.text}]}>{step.title}</Text>
                    {step.important && (
                      <View style={[detailStyles.importantBadge, {backgroundColor: (category?.color || '#6366F1') + '15'}]}>
                        <Icon name="star" size={10} color={category?.color || '#6366F1'} />
                        <Text style={[detailStyles.importantText, {color: category?.color || '#6366F1'}]}>Important</Text>
                      </View>
                    )}
                  </View>
                  <Icon
                    name={expandedSteps.has(step.id) ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </View>
                <Text style={[detailStyles.stepDescription, {color: colors.textSecondary}]}>
                  {step.description}
                </Text>
                {expandedSteps.has(step.id) && (
                  <View style={detailStyles.stepExpanded}>
                    {step.tips && step.tips.length > 0 && (
                      <View style={detailStyles.stepSection}>
                        <Text style={[detailStyles.stepSectionTitle, {color: colors.text}]}>💡 Tips</Text>
                        {step.tips.map((tip, i) => (
                          <View key={i} style={detailStyles.tipItem}>
                            <Icon name="checkmark-circle" size={14} color="#10B981" />
                            <Text style={[detailStyles.tipText, {color: colors.textSecondary}]}>{tip}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    {step.documents && step.documents.length > 0 && (
                      <View style={detailStyles.stepSection}>
                        <Text style={[detailStyles.stepSectionTitle, {color: colors.text}]}>📄 Documents</Text>
                        {step.documents.map((doc, i) => (
                          <View key={i} style={detailStyles.docItem}>
                            <Icon name="document-outline" size={14} color={category?.color || '#6366F1'} />
                            <Text style={[detailStyles.docText, {color: colors.textSecondary}]}>{doc}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Tips (if available) */}
        {guide.tips && guide.tips.length > 0 && (
          <View style={detailStyles.section}>
            <Text style={[detailStyles.sectionTitle, {color: colors.text}]}>💡 Key Tips</Text>
            <View style={[detailStyles.tipsCard, {backgroundColor: colors.card}]}>
              {guide.tips.map((tip, index) => (
                <View key={index} style={detailStyles.tipRow}>
                  <View style={[detailStyles.tipBullet, {backgroundColor: category?.color || '#6366F1'}]}>
                    <Text style={detailStyles.tipBulletText}>{index + 1}</Text>
                  </View>
                  <Text style={[detailStyles.tipContent, {color: colors.text}]}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Resources (if available) */}
        {guide.resources && guide.resources.length > 0 && (
          <View style={detailStyles.section}>
            <Text style={[detailStyles.sectionTitle, {color: colors.text}]}>📚 Resources</Text>
            {guide.resources.map((resource, index) => (
              <View key={index} style={[detailStyles.resourceCard, {backgroundColor: colors.card}]}>
                <Icon name="link-outline" size={18} color={category?.color || '#6366F1'} />
                <Text style={[detailStyles.resourceText, {color: colors.text}]}>{resource.title}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tags */}
        <View style={detailStyles.section}>
          <Text style={[detailStyles.sectionTitle, {color: colors.text}]}>🏷️ Tags</Text>
          <View style={detailStyles.tagsGrid}>
            {guide.tags.map((tag, index) => (
              <View key={index} style={[detailStyles.tagChip, {backgroundColor: (category?.color || '#6366F1') + '15'}]}>
                <Text style={[detailStyles.tagChipText, {color: category?.color || '#6366F1'}]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Suggest Guide CTA */}
        <View style={[detailStyles.suggestCard, {backgroundColor: colors.card}]}>
          <Icon name="mail-outline" size={24} color={category?.color || '#6366F1'} />
          <View style={detailStyles.suggestContent}>
            <Text style={[detailStyles.suggestTitle, {color: colors.text}]}>Have suggestions?</Text>
            <Text style={[detailStyles.suggestText, {color: colors.textSecondary}]}>
              Email us at guides@pakuni.com
            </Text>
          </View>
        </View>

        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );
};

const detailStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerContent: {},
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: SPACING.sm,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerMetaText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
    marginRight: SPACING.md,
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  difficultyText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  stepCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  stepHeaderContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  importantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  importantText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  stepDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    marginLeft: 36,
  },
  stepExpanded: {
    marginTop: SPACING.md,
    marginLeft: 36,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  stepSection: {
    marginBottom: SPACING.md,
  },
  stepSectionTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  tipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginLeft: 6,
    flex: 1,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  docText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginLeft: 6,
  },
  tipsCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  tipBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  tipBulletText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  tipContent: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xs,
  },
  resourceText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  tagChipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  suggestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
  },
  suggestContent: {
    marginLeft: SPACING.md,
  },
  suggestTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  suggestText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
});

// ============================================================================
// MAIN SCREEN COMPONENT
// ============================================================================

const GuidesScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter guides based on category and search
  const filteredGuides = useMemo(() => {
    let guides = GUIDES_DATA;
    
    if (selectedCategory) {
      guides = guides.filter(g => g.categoryId === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      guides = guides.filter(g =>
        g.title.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query) ||
        g.tags.some(t => t.toLowerCase().includes(query))
      );
    }
    
    return guides;
  }, [selectedCategory, searchQuery]);

  // If a guide is selected, show detail view
  if (selectedGuide) {
    return (
      <GuideDetail
        guide={selectedGuide}
        onClose={() => setSelectedGuide(null)}
        colors={colors}
      />
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, {backgroundColor: colors.card}]}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, {color: colors.text}]}>Guides</Text>
            <Text style={[styles.headerSubtitle, {color: colors.textSecondary}]}>
              Learn everything about admissions
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, {backgroundColor: colors.card}]}>
            <Icon name="search-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, {color: colors.text}]}
              placeholder="Search guides..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Categories Section */}
          {!selectedCategory && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>📚 Categories</Text>
              <View style={styles.categoriesGrid}>
                {GUIDE_CATEGORIES.map(category => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onPress={() => setSelectedCategory(category.id)}
                    colors={colors}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Selected Category Header */}
          {selectedCategory && (
            <View style={styles.categoryHeader}>
              <TouchableOpacity
                style={[styles.backCategoryButton, {backgroundColor: colors.card}]}
                onPress={() => setSelectedCategory(null)}>
                <Icon name="arrow-back" size={18} color={colors.text} />
                <Text style={[styles.backCategoryText, {color: colors.text}]}>All Categories</Text>
              </TouchableOpacity>
              <Text style={[styles.categoryTitle, {color: colors.text}]}>
                {GUIDE_CATEGORIES.find(c => c.id === selectedCategory)?.title} Guides
              </Text>
            </View>
          )}

          {/* Guides List */}
          <View style={styles.section}>
            {!selectedCategory && (
              <Text style={[styles.sectionTitle, {color: colors.text}]}>
                📖 {searchQuery ? 'Search Results' : 'Popular Guides'}
              </Text>
            )}
            {filteredGuides.length > 0 ? (
              filteredGuides.map(guide => (
                <GuideListItem
                  key={guide.id}
                  guide={guide}
                  onPress={() => setSelectedGuide(guide)}
                  colors={colors}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Icon name="search-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyStateText, {color: colors.textSecondary}]}>
                  No guides found
                </Text>
              </View>
            )}
          </View>

          {/* Suggest Guide Card */}
          <View style={[styles.suggestSection, {backgroundColor: colors.card}]}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.suggestIcon}>
              <Icon name="bulb-outline" size={24} color="#FFF" />
            </LinearGradient>
            <View style={styles.suggestContent}>
              <Text style={[styles.suggestTitle, {color: colors.text}]}>
                Missing a guide?
              </Text>
              <Text style={[styles.suggestText, {color: colors.textSecondary}]}>
                Email us at guides@pakuni.com and we'll create it!
              </Text>
            </View>
          </View>

          <View style={{height: 100}} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    marginLeft: SPACING.sm,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryHeader: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  backCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  backCategoryText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    marginLeft: 6,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.sizes.md,
    marginTop: SPACING.md,
  },
  suggestSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
  },
  suggestIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  suggestTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  suggestText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
});

export default GuidesScreen;
