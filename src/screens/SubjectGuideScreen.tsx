import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SPACING, FONTS, BORDER_RADIUS} from '../constants/theme';
import {TYPOGRAPHY} from '../constants/design';
import {useTheme} from '../contexts/ThemeContext';
import {Icon} from '../components/icons';

// Animated Card Component for staggered entrance
const AnimatedCard: React.FC<{
  children: React.ReactNode;
  index: number;
  style?: any;
  onPress?: () => void;
}> = ({children, index, style, onPress}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const delay = index * 60;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  if (onPress) {
    return (
      <Animated.View
        style={[
          style,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}, {scale: scaleAnim}],
          },
        ]}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}, {scale: scaleAnim}],
        },
      ]}>
      {children}
    </Animated.View>
  );
};

// Subject Types
interface Subject {
  id: string;
  name: string;
  iconName: string;
  description: string;
  category: 'science' | 'arts' | 'commerce' | 'technical';
  careers: string[];
  universities: string[];
  entryTests: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  tips: string[];
}

interface SubjectGroup {
  id: string;
  name: string;
  iconName: string;
  color: string;
  description: string;
  compulsory: string[];
  electives: string[];
  careers: string[];
  universities: string[];
  boardExams: string;
  entryTests: string[];
}

// Subject Groups for FSc/Intermediate
const SUBJECT_GROUPS: SubjectGroup[] = [
  {
    id: 'pre-medical',
    name: 'Pre-Medical',
    iconName: 'medkit',
    color: '#E53935',
    description: 'For students aspiring to become doctors, dentists, or work in healthcare',
    compulsory: ['Biology', 'Chemistry', 'Physics', 'English', 'Urdu/Islamiat/Pak Studies'],
    electives: ['Psychology', 'Health & Physical Education'],
    careers: ['Doctor (MBBS)', 'Dentist (BDS)', 'Pharmacist', 'Veterinarian', 'Physiotherapist', 'Nurse', 'Nutritionist'],
    universities: ['KE Lahore', 'AKU', 'DUHS', 'UHS', 'CMC Lahore', 'CMH Lahore'],
    boardExams: 'FSc Pre-Medical',
    entryTests: ['MDCAT', 'UHS Entry Test', 'AKU Entry Test'],
  },
  {
    id: 'pre-engineering',
    name: 'Pre-Engineering',
    iconName: 'construct',
    color: '#4573DF',
    description: 'For students interested in engineering, technology, and applied sciences',
    compulsory: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Urdu/Islamiat/Pak Studies'],
    electives: ['Computer Science', 'Statistics'],
    careers: ['Software Engineer', 'Electrical Engineer', 'Civil Engineer', 'Mechanical Engineer', 'Architect', 'Computer Scientist'],
    universities: ['NUST', 'GIKI', 'UET Lahore', 'NED', 'FAST-NU', 'COMSATS'],
    boardExams: 'FSc Pre-Engineering',
    entryTests: ['ECAT', 'NET', 'GIKI Test', 'FAST-NU Test', 'NED Test'],
  },
  {
    id: 'ics',
    name: 'ICS (Computer Science)',
    iconName: 'code-slash',
    color: '#4573DF',
    description: 'For students passionate about computers, programming, and IT',
    compulsory: ['Computer Science', 'Mathematics', 'Physics', 'English', 'Urdu/Islamiat/Pak Studies'],
    electives: ['Statistics', 'Economics'],
    careers: ['Software Developer', 'Data Scientist', 'Web Developer', 'Cybersecurity Analyst', 'AI Engineer', 'Game Developer'],
    universities: ['FAST-NU', 'LUMS', 'ITU', 'COMSATS', 'NUST', 'PUCIT'],
    boardExams: 'ICS',
    entryTests: ['FAST-NU Test', 'NET', 'LUMS SAT'],
  },
  {
    id: 'icom',
    name: 'I.Com (Commerce)',
    iconName: 'trending-up',
    color: '#6A1B9A',
    description: 'For students interested in business, finance, and commerce',
    compulsory: ['Principles of Accounting', 'Principles of Commerce', 'Economics', 'English', 'Urdu/Islamiat/Pak Studies'],
    electives: ['Business Mathematics', 'Computer Science', 'Statistics'],
    careers: ['Chartered Accountant (CA)', 'Banker', 'Financial Analyst', 'Tax Consultant', 'Business Manager', 'Auditor'],
    universities: ['LUMS', 'IBA Karachi', 'SZABIST', 'LSE', 'ICMAP', 'ICAP'],
    boardExams: 'I.Com',
    entryTests: ['LUMS SAT', 'IBA Test', 'NTS NAT-IE'],
  },
  {
    id: 'fa-arts',
    name: 'F.A (Arts/Humanities)',
    iconName: 'book',
    color: '#FF5722',
    description: 'For students interested in humanities, social sciences, and creative fields',
    compulsory: ['History', 'Pakistan Studies', 'English', 'Urdu', 'Islamiat'],
    electives: ['Civics', 'Economics', 'Psychology', 'Sociology', 'Fine Arts', 'Education'],
    careers: ['Lawyer', 'Journalist', 'Teacher', 'Psychologist', 'Civil Servant (CSS)', 'Diplomat', 'Social Worker'],
    universities: ['Punjab University', 'Karachi University', 'QAU', 'GCU', 'FC College'],
    boardExams: 'F.A',
    entryTests: ['LAT', 'NTS NAT-IE', 'CSS'],
  },
  {
    id: 'fa-general-science',
    name: 'F.A General Science',
    iconName: 'flask',
    color: '#FB8C00',
    description: 'Combination of science and arts for diverse career options',
    compulsory: ['Mathematics or Statistics', 'Economics', 'English', 'Urdu/Islamiat/Pak Studies'],
    electives: ['Geography', 'Computer Science', 'Psychology'],
    careers: ['Economist', 'Statistician', 'Teacher', 'Researcher', 'Data Analyst'],
    universities: ['Punjab University', 'QAU', 'PIDE', 'IBA'],
    boardExams: 'F.A General Science',
    entryTests: ['NTS NAT-IE', 'University Tests'],
  },
];

// Individual Subject Details
const SUBJECTS: Subject[] = [
  {
    id: 'biology',
    name: 'Biology',
    iconName: 'leaf',
    description: 'Study of living organisms, their structure, function, and evolution',
    category: 'science',
    careers: ['Doctor', 'Dentist', 'Pharmacist', 'Biotechnologist', 'Microbiologist'],
    universities: ['Medical Colleges', 'Pharmacy Schools', 'Biology Departments'],
    entryTests: ['MDCAT', 'HAT'],
    difficulty: 'hard',
    tips: [
      'Focus on understanding concepts, not just memorizing',
      'Use diagrams to remember complex processes',
      'Practice MDCAT past papers regularly',
      'Create mnemonics for long scientific names',
    ],
  },
  {
    id: 'physics',
    name: 'Physics',
    iconName: 'planet',
    description: 'Study of matter, energy, and the fundamental forces of nature',
    category: 'science',
    careers: ['Engineer', 'Physicist', 'Astronomer', 'Medical Physicist'],
    universities: ['Engineering Universities', 'Physics Departments'],
    entryTests: ['ECAT', 'NET', 'MDCAT'],
    difficulty: 'hard',
    tips: [
      'Master the formulas and when to use them',
      'Practice numerical problems daily',
      'Understand derivations, not just memorize',
      'Visualize concepts with real-world examples',
    ],
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    iconName: 'flask',
    description: 'Study of substances, their properties, and chemical reactions',
    category: 'science',
    careers: ['Chemist', 'Pharmacist', 'Chemical Engineer', 'Research Scientist'],
    universities: ['All Science Universities'],
    entryTests: ['MDCAT', 'ECAT', 'HAT'],
    difficulty: 'medium',
    tips: [
      'Learn organic reactions step by step',
      'Create reaction charts for revision',
      'Practice balancing equations',
      'Understand the periodic table trends',
    ],
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    iconName: 'calculator',
    description: 'Study of numbers, quantities, shapes, and patterns',
    category: 'science',
    careers: ['Engineer', 'Data Scientist', 'Actuary', 'Mathematician', 'Economist'],
    universities: ['All Engineering & IT Universities'],
    entryTests: ['ECAT', 'NET', 'GIKI Test', 'SAT'],
    difficulty: 'hard',
    tips: [
      'Practice problems daily - consistency is key',
      'Understand concepts before memorizing formulas',
      'Solve previous years entry test papers',
      'Focus on weak areas with extra practice',
    ],
  },
  {
    id: 'computer-science',
    name: 'Computer Science',
    iconName: 'code-slash',
    description: 'Study of computers, programming, and computational systems',
    category: 'technical',
    careers: ['Software Developer', 'Data Scientist', 'Cybersecurity Expert', 'AI Engineer'],
    universities: ['FAST-NU', 'NUST', 'ITU', 'LUMS', 'COMSATS'],
    entryTests: ['FAST Test', 'NET', 'NAT-CS'],
    difficulty: 'medium',
    tips: [
      'Practice coding problems on online platforms',
      'Build small projects to apply knowledge',
      'Learn flowcharts and algorithms well',
      'Understand both theory and practical applications',
    ],
  },
  {
    id: 'economics',
    name: 'Economics',
    iconName: 'trending-up',
    description: 'Study of production, distribution, and consumption of goods and services',
    category: 'commerce',
    careers: ['Economist', 'Banker', 'Policy Analyst', 'Business Consultant'],
    universities: ['LUMS', 'IBA', 'PIDE', 'QAU'],
    entryTests: ['NAT-IE', 'LUMS SAT', 'IBA Test'],
    difficulty: 'medium',
    tips: [
      'Relate concepts to real-world Pakistani economy',
      'Read business news regularly',
      'Practice graphs and calculations',
      'Understand micro and macro economics differences',
    ],
  },
  {
    id: 'accounting',
    name: 'Accounting',
    iconName: 'receipt',
    description: 'Recording, classifying, and summarizing financial transactions',
    category: 'commerce',
    careers: ['Chartered Accountant', 'Auditor', 'Financial Analyst', 'Tax Consultant'],
    universities: ['ICAP', 'ICMAP', 'Business Schools'],
    entryTests: ['ICAP CAF', 'NAT-IE'],
    difficulty: 'medium',
    tips: [
      'Practice journal entries daily',
      'Understand the accounting equation',
      'Learn to read financial statements',
      'Practice with real company examples',
    ],
  },
  {
    id: 'english',
    name: 'English',
    iconName: 'language',
    description: 'Study of English language, literature, and communication skills',
    category: 'arts',
    careers: ['Content Writer', 'Teacher', 'Journalist', 'Translator', 'Diplomat'],
    universities: ['All Universities'],
    entryTests: ['All Entry Tests', 'IELTS', 'SAT'],
    difficulty: 'easy',
    tips: [
      'Read English newspapers and novels',
      'Practice writing essays and summaries',
      'Learn grammar rules thoroughly',
      'Expand vocabulary through reading',
    ],
  },
  {
    id: 'psychology',
    name: 'Psychology',
    iconName: 'body',
    description: 'Study of mind, behavior, and mental processes',
    category: 'arts',
    careers: ['Psychologist', 'Counselor', 'HR Manager', 'Marketing Researcher'],
    universities: ['Punjab University', 'GCU', 'Bahria University'],
    entryTests: ['NAT-IA', 'University Tests'],
    difficulty: 'medium',
    tips: [
      'Relate concepts to everyday observations',
      'Learn key psychologists and their theories',
      'Understand research methods',
      'Practice case study analysis',
    ],
  },
];

const SubjectGuideScreen = () => {
  const {colors, isDark} = useTheme();
  const [selectedGroup, setSelectedGroup] = useState<SubjectGroup | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'groups' | 'subjects'>('groups');

  // Animation refs
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(-30)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const bookScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Header entrance animation
    Animated.parallel([
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Book icon pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(bookScaleAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bookScaleAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const floatTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const bookScale = bookScaleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1],
  });

  const getDifficultyColor = (difficulty: Subject['difficulty']) => {
    switch (difficulty) {
      case 'easy': return colors.success;
      case 'medium': return colors.warning;
      case 'hard': return colors.error;
    }
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['top']}>
      {/* Floating Decorations */}
      <Animated.View
        style={[
          styles.floatingDecor1,
          {
            opacity: 0.06,
            transform: [{translateY: floatTranslateY}, {scale: bookScale}],
          },
        ]}>
        <Icon name="book" family="Ionicons" size={70} color={colors.primary} />
      </Animated.View>
      <Animated.View
        style={[
          styles.floatingDecor2,
          {
            opacity: 0.04,
          },
        ]}>
        <Icon name="school" family="Ionicons" size={50} color={colors.primary} />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View 
          style={[
            styles.header, 
            {backgroundColor: colors.primary},
            {
              opacity: headerFadeAnim,
              transform: [{translateY: headerSlideAnim}],
            },
          ]}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            <Animated.View style={{transform: [{scale: bookScale}]}}>
              <Icon name="book-outline" family="Ionicons" size={28} color="#FFFFFF" />
            </Animated.View>
            <Text style={[styles.headerTitle, {color: colors.white}]}>Subject Selection Guide</Text>
          </View>
          <Text style={[styles.headerSubtitle, {color: colors.white}]}>
            Choose the right subjects for your dream career
          </Text>
        </Animated.View>

        {/* Tabs */}
        <View style={[styles.tabContainer, {backgroundColor: colors.card, borderColor: colors.border}]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'groups' && {backgroundColor: colors.primary}]}
            onPress={() => setActiveTab('groups')}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
              <Icon name="clipboard-outline" family="Ionicons" size={16} color={activeTab === 'groups' ? '#FFFFFF' : colors.textSecondary} />
              <Text style={[styles.tabText, {color: colors.textSecondary}, activeTab === 'groups' && {color: colors.white}]}>
                Subject Groups
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'subjects' && {backgroundColor: colors.primary}]}
            onPress={() => setActiveTab('subjects')}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
              <Icon name="library-outline" family="Ionicons" size={16} color={activeTab === 'subjects' ? '#FFFFFF' : colors.textSecondary} />
              <Text style={[styles.tabText, {color: colors.textSecondary}, activeTab === 'subjects' && {color: colors.white}]}>
                All Subjects
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {activeTab === 'groups' ? (
          <>
            {/* Info Card */}
            <AnimatedCard index={0}>
              <View style={[styles.infoCard, {backgroundColor: colors.info + '15', borderColor: colors.info + '30'}]}>
                <Animated.View style={{transform: [{translateY: floatTranslateY}]}}>
                  <Icon name="bulb-outline" family="Ionicons" size={24} color={colors.info} />
                </Animated.View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, {color: colors.text}]}>Choosing Your Group</Text>
                <Text style={[styles.infoText, {color: colors.textSecondary}]}>
                  After Matric, you'll choose FSc/FA subjects. This choice affects your career options. 
                  Choose based on your interests and goals!
                </Text>
              </View>
            </View>

            {/* Subject Groups */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>Available Subject Groups</Text>
              
              {SUBJECT_GROUPS.map((group, index) => (
                <AnimatedCard 
                  key={group.id} 
                  index={index + 1}
                  onPress={() => {
                    setSelectedGroup(group);
                    setShowGroupModal(true);
                  }}>
                  <View style={[styles.groupCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
                    <View style={[styles.groupIcon, {backgroundColor: group.color + '20'}]}>
                      <Icon name={group.iconName} family="Ionicons" size={28} color={group.color} />
                    </View>
                    <View style={styles.groupInfo}>
                      <Text style={[styles.groupName, {color: colors.text}]}>{group.name}</Text>
                      <Text style={[styles.groupDesc, {color: colors.textSecondary}]} numberOfLines={2}>{group.description}</Text>
                      <View style={styles.groupMeta}>
                        <View style={[styles.groupBadge, {backgroundColor: group.color + '20'}]}>
                          <Text style={[styles.groupBadgeText, {color: group.color}]}>
                            {group.careers.length}+ Careers
                          </Text>
                        </View>
                        <Text style={[styles.groupExam, {color: colors.textMuted}]}>{group.boardExams}</Text>
                      </View>
                    </View>
                    <Icon name="chevron-forward" family="Ionicons" size={20} color={colors.textMuted} />
                  </View>
                </AnimatedCard>
              ))}
            </View>
            </AnimatedCard>
          </>
        ) : (
          <>
            {/* Subjects Grid */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>Subject Details</Text>
              
              <View style={styles.subjectsGrid}>
                {SUBJECTS.map((subject, index) => (
                  <AnimatedCard 
                    key={subject.id} 
                    index={index}
                    style={styles.subjectCardWrapper}
                    onPress={() => {
                      setSelectedSubject(subject);
                      setShowSubjectModal(true);
                    }}>
                    <View style={[styles.subjectCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
                      <Icon name={subject.iconName} family="Ionicons" size={28} color={colors.primary} />
                      <Text style={[styles.subjectName, {color: colors.text}]}>{subject.name}</Text>
                      <View style={[
                        styles.difficultyBadge,
                        {backgroundColor: getDifficultyColor(subject.difficulty) + '20'},
                      ]}>
                        <Text style={[
                          styles.difficultyText,
                          {color: getDifficultyColor(subject.difficulty)},
                        ]}>
                          {subject.difficulty.charAt(0).toUpperCase() + subject.difficulty.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </AnimatedCard>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Career Path Tips */}
        <AnimatedCard index={8} style={styles.tipsSection}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.md}}>
            <Animated.View style={{transform: [{translateY: floatTranslateY}]}}>
              <Icon name="ribbon-outline" family="Ionicons" size={22} color={colors.primary} />
            </Animated.View>
            <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0}]}>Quick Career Paths</Text>
          </View>
          
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => {
              const group = SUBJECT_GROUPS.find(g => g.id === 'pre-medical');
              if (group) {
                setSelectedGroup(group);
                setShowGroupModal(true);
              }
            }}
            style={[styles.careerPathCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
            <Icon name="medkit-outline" family="Ionicons" size={24} color="#E53935" />
            <View style={styles.careerPathInfo}>
              <Text style={[styles.careerPathTitle, {color: colors.text}]}>Want to be a Doctor?</Text>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <Text style={[styles.careerPathSteps, {color: colors.textSecondary}]}>Pre-Medical</Text>
                <Icon name="arrow-forward" family="Ionicons" size={12} color={colors.textMuted} />
                <Text style={[styles.careerPathSteps, {color: colors.textSecondary}]}>MDCAT</Text>
                <Icon name="arrow-forward" family="Ionicons" size={12} color={colors.textMuted} />
                <Text style={[styles.careerPathSteps, {color: colors.textSecondary}]}>Medical</Text>
              </View>
            </View>
            <Icon name="chevron-forward" family="Ionicons" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => {
              const group = SUBJECT_GROUPS.find(g => g.id === 'ics');
              if (group) {
                setSelectedGroup(group);
                setShowGroupModal(true);
              }
            }}
            style={[styles.careerPathCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
            <Icon name="laptop-outline" family="Ionicons" size={24} color="#4573DF" />
            <View style={styles.careerPathInfo}>
              <Text style={[styles.careerPathTitle, {color: colors.text}]}>Want to be a Software Engineer?</Text>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <Text style={[styles.careerPathSteps, {color: colors.textSecondary}]}>ICS/Pre-Eng</Text>
                <Icon name="arrow-forward" family="Ionicons" size={12} color={colors.textMuted} />
                <Text style={[styles.careerPathSteps, {color: colors.textSecondary}]}>FAST/NET</Text>
                <Icon name="arrow-forward" family="Ionicons" size={12} color={colors.textMuted} />
                <Text style={[styles.careerPathSteps, {color: colors.textSecondary}]}>CS Degree</Text>
              </View>
            </View>
            <Icon name="chevron-forward" family="Ionicons" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => {
              const group = SUBJECT_GROUPS.find(g => g.id === 'icom');
              if (group) {
                setSelectedGroup(group);
                setShowGroupModal(true);
              }
            }}
            style={[styles.careerPathCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
            <Icon name="bar-chart-outline" family="Ionicons" size={24} color="#6A1B9A" />
            <View style={styles.careerPathInfo}>
              <Text style={[styles.careerPathTitle, {color: colors.text}]}>Want to be a CA?</Text>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <Text style={[styles.careerPathSteps, {color: colors.textSecondary}]}>I.Com</Text>
                <Icon name="arrow-forward" family="Ionicons" size={12} color={colors.textMuted} />
                <Text style={[styles.careerPathSteps, {color: colors.textSecondary}]}>CAF</Text>
                <Icon name="arrow-forward" family="Ionicons" size={12} color={colors.textMuted} />
                <Text style={[styles.careerPathSteps, {color: colors.textSecondary}]}>ICAP</Text>
              </View>
            </View>
            <Icon name="chevron-forward" family="Ionicons" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => {
              const group = SUBJECT_GROUPS.find(g => g.id === 'fa-arts');
              if (group) {
                setSelectedGroup(group);
                setShowGroupModal(true);
              }
            }}
            style={[styles.careerPathCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
            <Icon name="briefcase-outline" family="Ionicons" size={24} color="#FF5722" />
            <View style={styles.careerPathInfo}>
              <Text style={[styles.careerPathTitle, {color: colors.text}]}>Want to be a Lawyer?</Text>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <Text style={[styles.careerPathSteps, {color: colors.textSecondary}]}>F.A</Text>
                <Icon name="arrow-forward" family="Ionicons" size={12} color={colors.textMuted} />
                <Text style={[styles.careerPathSteps, {color: colors.textSecondary}]}>LAT</Text>
                <Icon name="arrow-forward" family="Ionicons" size={12} color={colors.textMuted} />
                <Text style={[styles.careerPathSteps, {color: colors.textSecondary}]}>LLB</Text>
              </View>
            </View>
            <Icon name="chevron-forward" family="Ionicons" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </AnimatedCard>

        <View style={{height: SPACING.xxl}} />
      </ScrollView>

      {/* Group Detail Modal */}
      <Modal
        visible={showGroupModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGroupModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: colors.background}]}>
            {selectedGroup && (
              <>
                <View style={[styles.modalHeader, {borderBottomColor: colors.border}]}>
                  <TouchableOpacity onPress={() => setShowGroupModal(false)} style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                    <Icon name="chevron-back" family="Ionicons" size={18} color={colors.primary} />
                    <Text style={[styles.backBtn, {color: colors.primary}]}>Back</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={[styles.modalHero, {backgroundColor: selectedGroup.color}]}>
                    <Icon name={selectedGroup.iconName} family="Ionicons" size={48} color="#FFFFFF" />
                    <Text style={[styles.modalHeroTitle, {color: colors.white}]}>{selectedGroup.name}</Text>
                    <Text style={[styles.modalHeroDesc, {color: colors.white}]}>{selectedGroup.description}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                      <Icon name="book-outline" family="Ionicons" size={18} color={colors.primary} />
                      <Text style={[styles.modalSectionTitle, {color: colors.text}]}>Compulsory Subjects</Text>
                    </View>
                    <View style={styles.tagContainer}>
                      {selectedGroup.compulsory.map((subject, i) => (
                        <View key={i} style={[styles.subjectTag, {backgroundColor: selectedGroup.color + '20'}]}>
                          <Text style={[styles.subjectTagText, {color: selectedGroup.color}]}>{subject}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                      <Icon name="library-outline" family="Ionicons" size={18} color={colors.primary} />
                      <Text style={[styles.modalSectionTitle, {color: colors.text}]}>Elective Options</Text>
                    </View>
                    <View style={styles.tagContainer}>
                      {selectedGroup.electives.map((subject, i) => (
                        <View key={i} style={[styles.electiveTag, {backgroundColor: colors.card, borderColor: colors.border}]}>
                          <Text style={[styles.electiveTagText, {color: colors.text}]}>{subject}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                      <Icon name="ribbon-outline" family="Ionicons" size={18} color={colors.primary} />
                      <Text style={[styles.modalSectionTitle, {color: colors.text}]}>Career Options</Text>
                    </View>
                    <View style={styles.careerList}>
                      {selectedGroup.careers.map((career, i) => (
                        <View key={i} style={styles.careerItem}>
                          <Text style={[styles.careerBullet, {color: colors.primary}]}>•</Text>
                          <Text style={[styles.careerText, {color: colors.textSecondary}]}>{career}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                      <Icon name="school-outline" family="Ionicons" size={18} color={colors.primary} />
                      <Text style={[styles.modalSectionTitle, {color: colors.text}]}>Top Universities</Text>
                    </View>
                    <View style={styles.tagContainer}>
                      {selectedGroup.universities.map((uni, i) => (
                        <View key={i} style={[styles.uniTag, {backgroundColor: colors.info + '20'}]}>
                          <Text style={[styles.uniTagText, {color: colors.info}]}>{uni}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                      <Icon name="document-text-outline" family="Ionicons" size={18} color={colors.primary} />
                      <Text style={[styles.modalSectionTitle, {color: colors.text}]}>Entry Tests Required</Text>
                    </View>
                    <View style={styles.tagContainer}>
                      {selectedGroup.entryTests.map((test, i) => (
                        <View key={i} style={[styles.testTag, {backgroundColor: colors.warning + '20'}]}>
                          <Text style={[styles.testTagText, {color: colors.warning}]}>{test}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={[styles.boardExamCard, {backgroundColor: selectedGroup.color + '10', borderColor: selectedGroup.color + '30'}]}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                      <Icon name="clipboard-outline" family="Ionicons" size={16} color={colors.text} />
                      <Text style={[styles.boardExamTitle, {color: colors.text}]}>Board Exam</Text>
                    </View>
                    <Text style={[styles.boardExamText, {color: selectedGroup.color}]}>
                      {selectedGroup.boardExams}
                    </Text>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Subject Detail Modal */}
      <Modal
        visible={showSubjectModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSubjectModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: colors.background}]}>
            {selectedSubject && (
              <>
                <View style={[styles.modalHeader, {borderBottomColor: colors.border}]}>
                  <TouchableOpacity onPress={() => setShowSubjectModal(false)} style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                    <Icon name="chevron-back" family="Ionicons" size={18} color={colors.primary} />
                    <Text style={[styles.backBtn, {color: colors.primary}]}>Back</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={[styles.subjectHero, {backgroundColor: colors.primary}]}>
                    <Icon name={selectedSubject.iconName} family="Ionicons" size={48} color="#FFFFFF" />
                    <Text style={[styles.subjectHeroTitle, {color: colors.white}]}>{selectedSubject.name}</Text>
                    <View style={[
                      styles.difficultyBadgeLarge,
                      {backgroundColor: getDifficultyColor(selectedSubject.difficulty) + '20'},
                    ]}>
                      <Text style={[
                        styles.difficultyTextLarge,
                        {color: getDifficultyColor(selectedSubject.difficulty)},
                      ]}>
                        Difficulty: {selectedSubject.difficulty.charAt(0).toUpperCase() + selectedSubject.difficulty.slice(1)}
                      </Text>
                    </View>
                    <Text style={[styles.subjectHeroDesc, {color: colors.white}]}>{selectedSubject.description}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                      <Icon name="ribbon-outline" family="Ionicons" size={18} color={colors.primary} />
                      <Text style={[styles.modalSectionTitle, {color: colors.text}]}>Career Options</Text>
                    </View>
                    <View style={styles.tagContainer}>
                      {selectedSubject.careers.map((career, i) => (
                        <View key={i} style={[styles.careerTag, {backgroundColor: colors.success + '20'}]}>
                          <Text style={[styles.careerTagText, {color: colors.success}]}>{career}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                      <Icon name="document-text-outline" family="Ionicons" size={18} color={colors.primary} />
                      <Text style={[styles.modalSectionTitle, {color: colors.text}]}>Entry Tests</Text>
                    </View>
                    <View style={styles.tagContainer}>
                      {selectedSubject.entryTests.map((test, i) => (
                        <View key={i} style={[styles.testTag, {backgroundColor: colors.warning + '20'}]}>
                          <Text style={[styles.testTagText, {color: colors.warning}]}>{test}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                      <Icon name="bulb-outline" family="Ionicons" size={18} color={colors.primary} />
                      <Text style={[styles.modalSectionTitle, {color: colors.text}]}>Study Tips</Text>
                    </View>
                    {selectedSubject.tips.map((tip, i) => (
                      <View key={i} style={[styles.tipItem, {backgroundColor: colors.card, borderColor: colors.border}]}>
                        <Text style={[styles.tipNumber, {backgroundColor: colors.primary, color: colors.white}]}>{i + 1}</Text>
                        <Text style={[styles.tipText, {color: colors.textSecondary}]}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingDecor1: {
    position: 'absolute',
    top: 120,
    right: -15,
    zIndex: -1,
  },
  floatingDecor2: {
    position: 'absolute',
    top: 280,
    left: -10,
    zIndex: -1,
  },
  header: {
    padding: SPACING.md,
    paddingBottom: 0,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.sm,
    opacity: 0.9,
  },
  tabContainer: {
    flexDirection: 'row',
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: 4,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  tabActive: {},
  tabText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  tabTextActive: {},
  infoCard: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
  },
  infoIcon: {
    fontSize: 28,
    marginRight: SPACING.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: 2,
  },
  infoText: {
    fontSize: FONTS.sizes.sm,
    opacity: 0.8,
    lineHeight: 18,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: SPACING.md,
  },
  groupCard: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  groupIcon: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  groupEmoji: {
    fontSize: 28,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: FONTS.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: 2,
  },
  groupDesc: {
    fontSize: FONTS.sizes.xs,
    marginBottom: SPACING.xs,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  groupBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  groupBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  groupExam: {
    fontSize: FONTS.sizes.xs,
  },
  arrowIcon: {
    fontSize: 20,
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  subjectCardWrapper: {
    width: '31%',
    marginBottom: SPACING.xs,
  },
  subjectCard: {
    width: '100%',
    minHeight: 100,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  subjectEmoji: {
    fontSize: 36,
    marginBottom: SPACING.sm,
  },
  subjectName: {
    fontSize: FONTS.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: SPACING.xs,
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  difficultyText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  tipsSection: {
    paddingHorizontal: SPACING.md,
  },
  careerPathCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  careerPathEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  careerPathInfo: {
    flex: 1,
  },
  careerPathTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  careerPathSteps: {
    fontSize: FONTS.sizes.sm,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    padding: SPACING.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    fontSize: FONTS.sizes.md,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  modalHero: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  modalHeroEmoji: {
    fontSize: 60,
    marginBottom: SPACING.sm,
  },
  modalHeroTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  modalHeroDesc: {
    fontSize: FONTS.sizes.sm,
    textAlign: 'center',
    opacity: 0.9,
  },
  modalSection: {
    padding: SPACING.md,
  },
  modalSectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: SPACING.sm,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  subjectTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  subjectTagText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  electiveTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  electiveTagText: {
    fontSize: FONTS.sizes.sm,
  },
  careerList: {
    gap: SPACING.xs,
  },
  careerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  careerBullet: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  careerText: {
    fontSize: FONTS.sizes.sm,
  },
  uniTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  uniTagText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  testTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  testTagText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  boardExamCard: {
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 1,
  },
  boardExamTitle: {
    fontSize: FONTS.sizes.sm,
    marginBottom: 4,
  },
  boardExamText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
  },
  subjectHero: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  subjectHeroEmoji: {
    fontSize: 60,
    marginBottom: SPACING.sm,
  },
  subjectHeroTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  difficultyBadgeLarge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  difficultyTextLarge: {
    fontSize: FONTS.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  subjectHeroDesc: {
    fontSize: FONTS.sizes.sm,
    textAlign: 'center',
  },
  careerTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  careerTagText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    borderWidth: 1,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold',
    marginRight: SPACING.sm,
    overflow: 'hidden',
  },
  tipText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    lineHeight: 20,
  },
});

export default SubjectGuideScreen;
