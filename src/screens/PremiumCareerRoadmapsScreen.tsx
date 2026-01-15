import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../contexts/ThemeContext';
import {SPACING} from '../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../constants/design';
import {Icon} from '../components/icons';

const {width} = Dimensions.get('window');

// Career Roadmap Interface
interface RoadmapStep {
  id: number;
  title: string;
  duration: string;
  description: string;
  iconName: string;
  requirements?: string[];
  tips?: string[];
}

interface CareerRoadmap {
  id: string;
  title: string;
  iconName: string;
  color: string;
  gradient: string[];
  tagline: string;
  totalYears: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
  salaryRange: string;
  demandLevel: 'High' | 'Medium' | 'Low';
  steps: RoadmapStep[];
  funFact: string;
}

// Career Roadmaps Data
const CAREER_ROADMAPS: CareerRoadmap[] = [
  {
    id: 'doctor',
    title: 'Doctor (MBBS)',
    iconName: 'medkit',
    color: '#E53935',
    gradient: ['#E53935', '#EF5350'],
    tagline: 'Save lives, be a hero!',
    totalYears: '11-13 years',
    difficulty: 'Very Hard',
    salaryRange: '80K - 500K+ PKR/month',
    demandLevel: 'High',
    funFact: 'Dr. Ruth Pfau treated 50,000+ leprosy patients in Pakistan!',
    steps: [
      {id: 1, title: 'Complete Matric (Class 10)', duration: '2 years', iconName: 'book-outline', description: 'Focus on Science subjects - Biology, Chemistry, Physics', requirements: ['Get 80%+ marks', 'Science group (Biology)'], tips: ['Start learning medical terms', 'Watch health documentaries']},
      {id: 2, title: 'FSc Pre-Medical', duration: '2 years', iconName: 'flask-outline', description: 'Study Biology, Chemistry, Physics, English', requirements: ['Get 85%+ for good medical colleges', 'Join academy for MDCAT prep'], tips: ['Start MDCAT prep in 1st year', 'Practice MCQs daily']},
      {id: 3, title: 'Clear MDCAT Exam', duration: '1 year prep', iconName: 'create-outline', description: 'National Medical & Dental Admission Test', requirements: ['Score 180+ out of 200', 'Register on PMC portal'], tips: ['Solve 10,000+ MCQs', 'Take mock tests weekly']},
      {id: 4, title: 'MBBS Degree', duration: '5 years', iconName: 'school-outline', description: 'Study at medical college - theory + practicals', requirements: ['Pass professional exams', 'Complete rotations'], tips: ['Focus on clinical skills', 'Network with seniors']},
      {id: 5, title: 'House Job (Internship)', duration: '1 year', iconName: 'business-outline', description: 'Work in hospital under supervision', requirements: ['Complete all rotations', 'Get experience certificate'], tips: ['Learn from every case', 'Be humble and helpful']},
      {id: 6, title: 'FCPS / Specialization', duration: '4-5 years', iconName: 'star-outline', description: 'Become a specialist (optional but recommended)', requirements: ['Clear FCPS Part 1', 'Complete residency'], tips: ['Choose field you love', 'Cardiology & Surgery pay most']},
    ],
  },
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    iconName: 'code-slash',
    color: '#1565C0',
    gradient: ['#1565C0', '#1E88E5'],
    tagline: 'Build the future with code!',
    totalYears: '4-5 years',
    difficulty: 'Medium',
    salaryRange: '60K - 1M+ PKR/month',
    demandLevel: 'High',
    funFact: "Arfa Karim became world's youngest Microsoft Certified Professional at age 9!",
    steps: [
      {id: 1, title: 'Complete Matric', duration: '2 years', iconName: 'book-outline', description: 'Focus on Math, Physics, Computer Science', requirements: ['Get 75%+ marks', 'Learn basic computer skills'], tips: ['Start learning coding online', 'Try Scratch or Python']},
      {id: 2, title: 'FSc Pre-Engineering or ICS', duration: '2 years', iconName: 'calculator-outline', description: 'Study Math, Physics, Computer Science', requirements: ['Get 70%+ marks', 'Learn programming basics'], tips: ['Build small projects', 'Join coding communities']},
      {id: 3, title: 'Entry Test (ECAT/NET/FAST)', duration: '3-6 months prep', iconName: 'create-outline', description: 'University admission tests', requirements: ['Good scores in Math & IQ sections'], tips: ['Practice aptitude questions', 'Focus on logical reasoning']},
      {id: 4, title: 'BS Computer Science', duration: '4 years', iconName: 'school-outline', description: 'Learn programming, algorithms, software development', requirements: ['Complete degree with good CGPA', 'Do internships'], tips: ['Build portfolio projects', 'Learn React, Python, JavaScript']},
      {id: 5, title: 'Internships & Jobs', duration: 'Ongoing', iconName: 'briefcase-outline', description: 'Start your career as a developer', requirements: ['Strong portfolio', 'Problem-solving skills'], tips: ['Apply to top companies', 'Freelance for experience']},
    ],
  },
  {
    id: 'engineer',
    title: 'Engineer (Electrical/Civil)',
    iconName: 'construct',
    color: '#FF9800',
    gradient: ['#FF9800', '#FFB74D'],
    tagline: 'Design and build amazing things!',
    totalYears: '5-6 years',
    difficulty: 'Hard',
    salaryRange: '50K - 300K+ PKR/month',
    demandLevel: 'High',
    funFact: "Pakistan built the Karakoram Highway - one of world's highest paved roads!",
    steps: [
      {id: 1, title: 'Complete Matric', duration: '2 years', iconName: 'book-outline', description: 'Excel in Math and Physics', requirements: ['Get 80%+ marks', 'Science group'], tips: ['Love solving problems', 'Build things with your hands']},
      {id: 2, title: 'FSc Pre-Engineering', duration: '2 years', iconName: 'settings-outline', description: 'Study Math, Physics, Chemistry', requirements: ['Get 75%+ marks', 'Focus on Math'], tips: ['Practice numerical problems', 'Understand concepts deeply']},
      {id: 3, title: 'ECAT/NET Exam', duration: '6 months prep', iconName: 'create-outline', description: 'Engineering admission tests', requirements: ['Good scores for NUST, UET, GIKI'], tips: ['Solve past papers', 'Focus on speed and accuracy']},
      {id: 4, title: 'Engineering Degree (BE/BSc)', duration: '4 years', iconName: 'school-outline', description: 'Specialize in your chosen field', requirements: ['Complete with good CGPA', 'Final Year Project'], tips: ['Do summer internships', 'Join technical societies']},
      {id: 5, title: 'PEC Registration', duration: '1 year experience', iconName: 'document-outline', description: 'Get licensed by Pakistan Engineering Council', requirements: ['1 year practical experience', 'Pass PEC exam'], tips: ['Work on real projects', 'Learn from experienced engineers']},
    ],
  },
  {
    id: 'chartered-accountant',
    title: 'Chartered Accountant (CA)',
    iconName: 'calculator',
    color: '#6A1B9A',
    gradient: ['#6A1B9A', '#8E24AA'],
    tagline: 'Master of numbers and finance!',
    totalYears: '5-7 years',
    difficulty: 'Hard',
    salaryRange: '80K - 800K+ PKR/month',
    demandLevel: 'High',
    funFact: 'CAs can earn more than doctors in Pakistan! Many become CEOs!',
    steps: [
      {id: 1, title: 'Complete Matric', duration: '2 years', iconName: 'book-outline', description: 'Focus on Math and English', requirements: ['Get 70%+ marks', 'Any group works'], tips: ['Develop love for numbers', 'Learn spreadsheets']},
      {id: 2, title: 'I.Com or A-Levels', duration: '2 years', iconName: 'cash-outline', description: 'Study Commerce, Accounting, Economics', requirements: ['Get 70%+ marks', 'I.Com preferred'], tips: ['Master double-entry accounting', 'Understand business basics']},
      {id: 3, title: 'Register with ICAP', duration: '—', iconName: 'clipboard-outline', description: 'Join Institute of Chartered Accountants of Pakistan', requirements: ['Register as student member'], tips: ['Check eligibility criteria', 'Plan your timeline']},
      {id: 4, title: 'CAF Exams (Certificate)', duration: '1-2 years', iconName: 'create-outline', description: 'Pass 8 CAF papers', requirements: ['Clear all papers', 'Can attempt while studying'], tips: ['Study past papers', 'Join CA coaching']},
      {id: 5, title: 'CFAP Exams (Professional)', duration: '1-2 years', iconName: 'flag-outline', description: 'Pass 6 advanced papers', requirements: ['Clear all CFAP papers'], tips: ['Work at audit firm simultaneously', 'Get practical experience']},
      {id: 6, title: '3.5 Years Articleship', duration: '3.5 years', iconName: 'briefcase-outline', description: 'Work at chartered firm (required training)', requirements: ['Complete training contract', 'Learn audit & tax'], tips: ['Join Big 4 if possible', 'Learn everything you can']},
    ],
  },
  {
    id: 'pilot',
    title: 'Commercial Pilot',
    iconName: 'airplane',
    color: '#00BCD4',
    gradient: ['#00BCD4', '#4DD0E1'],
    tagline: 'Fly high in the sky!',
    totalYears: '3-5 years',
    difficulty: 'Hard',
    salaryRange: '300K - 1.5M+ PKR/month',
    demandLevel: 'Medium',
    funFact: 'Pakistan has produced female fighter pilots like Ayesha Farooq!',
    steps: [
      {id: 1, title: 'Complete Matric', duration: '2 years', iconName: 'book-outline', description: 'Focus on Math and Physics', requirements: ['Get 60%+ marks', 'Science group preferred'], tips: ['Learn about aviation', 'Stay physically fit']},
      {id: 2, title: 'FSc Pre-Engineering', duration: '2 years', iconName: 'calculator-outline', description: 'Study Math, Physics', requirements: ['Get 60%+ marks', 'Clear eyesight important'], tips: ['Apply to flying clubs', 'Research flight schools']},
      {id: 3, title: 'Medical Certificate', duration: '—', iconName: 'medkit-outline', description: 'Get Class 1 Medical from CAA', requirements: ['Perfect eyesight (or corrected)', 'No major health issues'], tips: ['Maintain health', 'No color blindness allowed']},
      {id: 4, title: 'Flight Training (PPL)', duration: '6 months', iconName: 'airplane-outline', description: 'Private Pilot License - 40 flying hours', requirements: ['Pass written + practical exams'], tips: ['Join flying club like Karachi Aero Club']},
      {id: 5, title: 'Commercial Pilot License (CPL)', duration: '1-2 years', iconName: 'ribbon-outline', description: '200+ flying hours with advanced training', requirements: ['Pass CPL exams', 'Night flying, instrument rating'], tips: ['Build hours gradually', 'Consider training abroad']},
      {id: 6, title: 'Airline Job', duration: 'Ongoing', iconName: 'airplane-outline', description: 'Join PIA, Airblue, or international airlines', requirements: ['Type rating on specific aircraft'], tips: ['Apply to all airlines', 'Network in aviation community']},
    ],
  },
  {
    id: 'army-officer',
    title: 'Pakistan Army Officer',
    iconName: 'shield',
    color: '#2E7D32',
    gradient: ['#2E7D32', '#43A047'],
    tagline: 'Serve your nation with pride!',
    totalYears: '2-4 years training',
    difficulty: 'Hard',
    salaryRange: '80K - 500K+ PKR/month',
    demandLevel: 'High',
    funFact: 'Pakistan Army is the 6th largest in the world!',
    steps: [
      {id: 1, title: 'Complete Matric', duration: '2 years', iconName: 'book-outline', description: 'Get good marks in all subjects', requirements: ['60%+ marks', 'Good physical fitness'], tips: ['Start exercising daily', 'Play sports']},
      {id: 2, title: 'FSc/FA (any subject)', duration: '2 years', iconName: 'school-outline', description: 'Complete intermediate education', requirements: ['60%+ marks', 'Physical fitness'], tips: ['Prepare for ISSB', 'Read about Pakistan defense']},
      {id: 3, title: 'Apply for PMA Long Course', duration: '—', iconName: 'clipboard-outline', description: 'Apply through Army website when ads appear', requirements: ['Age 17-22', 'Height 5\'4" for men'], tips: ['Apply early', 'Keep documents ready']},
      {id: 4, title: 'Initial Tests & Medical', duration: '1-2 months', iconName: 'fitness-outline', description: 'Physical test, written test, medical exam', requirements: ['Pass all physical tests', 'Clear medical'], tips: ['Practice running, push-ups, sit-ups', 'Be mentally prepared']},
      {id: 5, title: 'ISSB (Selection Board)', duration: '4 days', iconName: 'people-outline', description: 'Intelligence, psychological, group tasks, interview', requirements: ['Clear ISSB with good recommendation'], tips: ['Be confident and natural', 'Show leadership qualities']},
      {id: 6, title: 'PMA Kakul Training', duration: '2 years', iconName: 'star-outline', description: 'Intensive military training at Pakistan Military Academy', requirements: ['Complete training successfully'], tips: ['Give your best', 'Build lifelong friendships']},
    ],
  },
  {
    id: 'teacher',
    title: 'Teacher / Professor',
    iconName: 'school',
    color: '#9C27B0',
    gradient: ['#9C27B0', '#AB47BC'],
    tagline: 'Shape the future generations!',
    totalYears: '4-8 years',
    difficulty: 'Medium',
    salaryRange: '40K - 300K+ PKR/month',
    demandLevel: 'High',
    funFact: 'Malala Yousafzai won Nobel Prize for education advocacy!',
    steps: [
      {id: 1, title: 'Complete Matric', duration: '2 years', iconName: 'book-outline', description: 'Excel in the subject you want to teach', requirements: ['Good marks overall'], tips: ['Find what you love teaching']},
      {id: 2, title: 'FSc/FA in your subject', duration: '2 years', iconName: 'school-outline', description: 'Deep dive into your subject area', requirements: ['70%+ marks preferred'], tips: ['Help classmates - practice teaching!']},
      {id: 3, title: "Bachelor's Degree", duration: '4 years', iconName: 'reader-outline', description: 'BS/BA in your subject + B.Ed for teaching', requirements: ['Complete degree', 'B.Ed required for schools'], tips: ['Do teaching practice during B.Ed']},
      {id: 4, title: 'Start Teaching', duration: 'Ongoing', iconName: 'briefcase-outline', description: 'Join school, college, or start tutoring', requirements: ['Apply to schools', 'Build reputation'], tips: ['Government jobs have security', 'Private pays more initially']},
      {id: 5, title: "Master's / M.Phil (for college)", duration: '2-3 years', iconName: 'flag-outline', description: 'Required for teaching at college/university level', requirements: ['Clear GAT', 'Complete thesis'], tips: ['Specialize in your area', 'Publish research papers']},
      {id: 6, title: 'PhD (for university)', duration: '3-5 years', iconName: 'star-outline', description: 'Become a professor at university', requirements: ['Complete PhD', 'Publish in journals'], tips: ['Apply for HEC scholarships', 'Consider PhD abroad']},
    ],
  },
  {
    id: 'lawyer',
    title: 'Lawyer / Advocate',
    iconName: 'shield-checkmark',
    color: '#795548',
    gradient: ['#795548', '#8D6E63'],
    tagline: 'Fight for justice!',
    totalYears: '5-7 years',
    difficulty: 'Medium',
    salaryRange: '50K - 1M+ PKR/month',
    demandLevel: 'Medium',
    funFact: 'Pakistan\'s founder Quaid-e-Azam was a brilliant lawyer!',
    steps: [
      {id: 1, title: 'Complete Matric', duration: '2 years', iconName: 'book-outline', description: 'Focus on English, Urdu, Pakistan Studies', requirements: ['45%+ marks (minimum)'], tips: ['Read newspapers daily', 'Debate in class']},
      {id: 2, title: 'FSc/FA (Arts preferred)', duration: '2 years', iconName: 'reader-outline', description: 'Study humanities, English literature', requirements: ['45%+ marks (minimum)'], tips: ['Join debate clubs', 'Read about law cases']},
      {id: 3, title: 'Clear LAT Exam', duration: '6 months prep', iconName: 'create-outline', description: 'Law Admission Test by HEC', requirements: ['Pass LAT with good score'], tips: ['Practice English comprehension', 'Study reasoning']},
      {id: 4, title: 'LLB Degree', duration: '5 years', iconName: 'school-outline', description: 'Bachelor of Laws from recognized university', requirements: ['Complete degree', 'Pass bar exam'], tips: ['Intern at law firms', 'Attend court hearings']},
      {id: 5, title: 'Bar Council License', duration: '6 months', iconName: 'document-outline', description: 'Get license to practice law', requirements: ['Register with bar council', 'Complete requirements'], tips: ['Network with senior lawyers', 'Find a mentor']},
      {id: 6, title: 'Practice & Specialize', duration: 'Ongoing', iconName: 'star-outline', description: 'Build reputation, specialize in an area', requirements: ['Win cases', 'Build clientele'], tips: ['Corporate law pays most', 'Criminal law is exciting']},
    ],
  },
];

// Animated Roadmap Card
const RoadmapCard = ({
  roadmap,
  index,
  onPress,
  colors,
}: {
  roadmap: CareerRoadmap;
  index: number;
  onPress: () => void;
  colors: any;
}) => {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getDifficultyColor = (difficulty: CareerRoadmap['difficulty']) => {
    switch (difficulty) {
      case 'Easy': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Hard': return '#F44336';
      case 'Very Hard': return '#9C27B0';
    }
  };

  const getDemandColor = (demand: CareerRoadmap['demandLevel']) => {
    switch (demand) {
      case 'High': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Low': return '#F44336';
    }
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{translateX: slideAnim}, {scale: scaleAnim}],
          opacity: fadeAnim,
        },
      ]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}>
        <View style={[styles.roadmapCard, {backgroundColor: colors.card}]}>
          {/* Color accent */}
          <LinearGradient
            colors={roadmap.gradient}
            style={styles.cardAccent}
          />
          
          <View style={styles.cardContent}>
            {/* Header */}
            <View style={styles.roadmapHeader}>
              <View style={[styles.roadmapIcon, {backgroundColor: roadmap.color + '20'}]}>
                <Icon name={roadmap.iconName} family="Ionicons" size={32} color={roadmap.color} />
              </View>
              <View style={styles.roadmapInfo}>
                <Text style={[styles.roadmapTitle, {color: colors.text}]}>{roadmap.title}</Text>
                <Text style={[styles.roadmapTagline, {color: colors.textSecondary}]}>{roadmap.tagline}</Text>
              </View>
            </View>

            {/* Meta badges */}
            <View style={styles.roadmapMeta}>
              <View style={[styles.metaBadge, {backgroundColor: colors.background, flexDirection: 'row', alignItems: 'center', gap: 4}]}>
                <Icon name="time-outline" family="Ionicons" size={12} color={colors.textSecondary} />
                <Text style={[styles.metaText, {color: colors.textSecondary}]}>{roadmap.totalYears}</Text>
              </View>
              <View style={[styles.metaBadge, {backgroundColor: getDifficultyColor(roadmap.difficulty) + '20'}]}>
                <Text style={[styles.metaText, {color: getDifficultyColor(roadmap.difficulty)}]}>
                  {roadmap.difficulty}
                </Text>
              </View>
              <View style={[styles.metaBadge, {backgroundColor: getDemandColor(roadmap.demandLevel) + '20'}]}>
                <Text style={[styles.metaText, {color: getDemandColor(roadmap.demandLevel)}]}>
                  {roadmap.demandLevel}
                </Text>
              </View>
            </View>

            {/* Salary */}
            <View style={styles.salaryRow}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <Icon name="cash-outline" family="Ionicons" size={16} color={colors.success} />
                <Text style={[styles.salaryText, {color: colors.success}]}>{roadmap.salaryRange}</Text>
              </View>
            </View>

            {/* Steps preview */}
            <View style={[styles.stepsPreview, {backgroundColor: colors.background}]}>
              <View style={styles.stepsDotsContainer}>
                {roadmap.steps.slice(0, 5).map((_, i) => (
                  <View
                    key={i}
                    style={[styles.stepDotPreview, {backgroundColor: roadmap.color}]}
                  />
                ))}
                {roadmap.steps.length > 5 && (
                  <Text style={[styles.moreSteps, {color: roadmap.color}]}>+{roadmap.steps.length - 5}</Text>
                )}
              </View>
              <Text style={[styles.stepsPreviewText, {color: colors.primary}]}>
                {roadmap.steps.length} steps
              </Text>
              <Icon name="arrow-forward" family="Ionicons" size={14} color={colors.primary} containerStyle={{marginLeft: 4}} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Timeline Step Component
const TimelineStep = ({
  step,
  index,
  total,
  color,
  colors,
}: {
  step: RoadmapStep;
  index: number;
  total: number;
  color: string;
  colors: any;
}) => {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: 300 + index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: 300 + index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.stepItem,
        {
          transform: [{translateY: slideAnim}],
          opacity: fadeAnim,
        },
      ]}>
      {/* Timeline */}
      <View style={styles.stepTimeline}>
        <LinearGradient
          colors={[color, color + 'CC']}
          style={styles.stepDot}>
          <Text style={styles.stepNumber}>{index + 1}</Text>
        </LinearGradient>
        {index < total - 1 && (
          <View style={[styles.stepLine, {backgroundColor: color + '40'}]} />
        )}
      </View>

      {/* Content */}
      <View style={[styles.stepContent, {backgroundColor: colors.background}]}>
        <View style={styles.stepHeader}>
          <View style={{marginRight: SPACING.sm}}>
            <Icon name={step.iconName} family="Ionicons" size={32} color={color} />
          </View>
          <View style={styles.stepHeaderText}>
            <Text style={[styles.stepTitle, {color: colors.text}]}>{step.title}</Text>
            <View style={[styles.durationBadge, {backgroundColor: color + '20', flexDirection: 'row', alignItems: 'center', gap: 4}]}>
              <Icon name="time-outline" family="Ionicons" size={11} color={color} />
              <Text style={[styles.durationText, {color}]}>{step.duration}</Text>
            </View>
          </View>
        </View>
        
        <Text style={[styles.stepDescription, {color: colors.textSecondary}]}>
          {step.description}
        </Text>

        {step.requirements && (
          <View style={[styles.stepRequirements, {backgroundColor: colors.card}]}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4}}>
              <Icon name="clipboard-outline" family="Ionicons" size={12} color={colors.text} />
              <Text style={[styles.requirementsTitle, {color: colors.text, marginBottom: 0}]}>Requirements:</Text>
            </View>
            {step.requirements.map((req, i) => (
              <Text key={i} style={[styles.requirementItem, {color: colors.textSecondary}]}>• {req}</Text>
            ))}
          </View>
        )}

        {step.tips && (
          <View style={[styles.stepTips, {backgroundColor: '#FFF3E0'}]}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4}}>
              <Icon name="bulb-outline" family="Ionicons" size={12} color="#E65100" />
              <Text style={[styles.tipsTitle, {marginBottom: 0}]}>Tips:</Text>
            </View>
            {step.tips.map((tip, i) => (
              <Text key={i} style={styles.tipItem}>• {tip}</Text>
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const PremiumCareerRoadmapsScreen = () => {
  const {colors, isDark} = useTheme();
  const navigation = useNavigation();
  const [selectedRoadmap, setSelectedRoadmap] = useState<CareerRoadmap | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const openDetail = (roadmap: CareerRoadmap) => {
    setSelectedRoadmap(roadmap);
    setShowDetailModal(true);
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['top']}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}>
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
              <Text style={[styles.countText, {color: colors.primary}]}>{CAREER_ROADMAPS.length}</Text>
            </View>
          </View>

          {CAREER_ROADMAPS.map((roadmap, index) => (
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
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
            {selectedRoadmap && (
              <>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => setShowDetailModal(false)}>
                    <Icon name="arrow-back" family="Ionicons" size={16} color={colors.primary} />
                    <Text style={[styles.backBtnText, {color: colors.primary, marginLeft: 4}]}>Back</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Hero */}
                  <LinearGradient
                    colors={selectedRoadmap.gradient}
                    style={styles.modalHero}>
                    <View style={styles.heroDecoration1} />
                    <View style={styles.heroDecoration2} />
                    <Icon name={selectedRoadmap.iconName} family="Ionicons" size={80} color="#FFFFFF" />
                    <Text style={styles.modalHeroTitle}>{selectedRoadmap.title}</Text>
                    <Text style={styles.modalHeroTagline}>{selectedRoadmap.tagline}</Text>

                    <View style={styles.heroStats}>
                      <View style={styles.heroStat}>
                        <Text style={styles.heroStatValue}>{selectedRoadmap.totalYears}</Text>
                        <Text style={styles.heroStatLabel}>Duration</Text>
                      </View>
                      <View style={styles.heroStatDivider} />
                      <View style={styles.heroStat}>
                        <Text style={styles.heroStatValue}>{selectedRoadmap.difficulty}</Text>
                        <Text style={styles.heroStatLabel}>Difficulty</Text>
                      </View>
                      <View style={styles.heroStatDivider} />
                      <View style={styles.heroStat}>
                        <Text style={styles.heroStatValue}>{selectedRoadmap.demandLevel}</Text>
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
                    <Text style={[styles.funFactText, {color: colors.text}]}>{selectedRoadmap.funFact}</Text>
                  </View>

                  {/* Salary */}
                  <View style={[styles.salaryCard, {backgroundColor: isDark ? '#1B5E2030' : '#E8F5E9'}]}>
                    <View style={styles.salaryIcon}>
                      <Icon name="cash-outline" family="Ionicons" size={24} color="#27ae60" />
                    </View>
                    <View>
                      <Text style={[styles.salaryLabel, {color: colors.textSecondary}]}>Salary Range in Pakistan</Text>
                      <Text style={[styles.salaryValue, {color: colors.success}]}>{selectedRoadmap.salaryRange}</Text>
                    </View>
                  </View>

                  {/* Timeline Steps */}
                  <View style={styles.stepsSection}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.md}}>
                      <Icon name="navigate-outline" family="Ionicons" size={20} color={colors.text} />
                      <Text style={[styles.stepsSectionTitle, {color: colors.text, marginBottom: 0}]}>Your Journey</Text>
                    </View>

                    {selectedRoadmap.steps.map((step, index) => (
                      <TimelineStep
                        key={step.id}
                        step={step}
                        index={index}
                        total={selectedRoadmap.steps.length}
                        color={selectedRoadmap.color}
                        colors={colors}
                      />
                    ))}
                  </View>

                  {/* Motivation */}
                  <View style={[styles.motivationCard, {backgroundColor: selectedRoadmap.color + '15'}]}>
                    <View style={{marginBottom: SPACING.sm}}>
                      <Icon name="rocket-outline" family="Ionicons" size={48} color={selectedRoadmap.color} />
                    </View>
                    <Text style={[styles.motivationText, {color: selectedRoadmap.color}]}>
                      Every journey of a thousand miles begins with a single step. Start today!
                    </Text>
                  </View>

                  <View style={{height: 50}} />
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
    fontWeight: '800',
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
    fontWeight: '500',
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
    fontWeight: '700',
    marginRight: SPACING.sm,
  },
  countBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  countText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
  },
  roadmapCard: {
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardAccent: {
    height: 6,
  },
  cardContent: {
    padding: SPACING.md,
  },
  roadmapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  roadmapIcon: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  roadmapInfo: {
    flex: 1,
  },
  roadmapTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  roadmapTagline: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  roadmapMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
  },
  salaryRow: {
    marginBottom: SPACING.sm,
  },
  salaryText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  stepsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  stepsDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepDotPreview: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  moreSteps: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  stepsPreviewText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  // Modal Styles
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
    paddingVertical: SPACING.xs,
  },
  backBtnText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
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
    fontWeight: '800',
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
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  heroStat: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  heroStatValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: '#fff',
  },
  heroStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
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
    fontWeight: '700',
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
    fontWeight: '700',
  },
  stepsSection: {
    paddingHorizontal: SPACING.md,
  },
  stepsSectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  stepTimeline: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  stepDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontWeight: '700',
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#fff',
  },
  stepLine: {
    width: 3,
    flex: 1,
    marginVertical: 6,
    borderRadius: 2,
  },
  stepContent: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  stepHeaderText: {
    flex: 1,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    marginBottom: 4,
  },
  durationBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '600',
  },
  stepDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  stepRequirements: {
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  requirementsTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    marginBottom: 4,
  },
  requirementItem: {
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: 18,
  },
  stepTips: {
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    marginBottom: 4,
    color: '#E65100',
  },
  tipItem: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#BF360C',
    lineHeight: 18,
  },
  motivationCard: {
    margin: SPACING.md,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default PremiumCareerRoadmapsScreen;
