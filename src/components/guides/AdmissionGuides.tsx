/**
 * Admission Guides
 * Step-by-step university admission process guides
 */

import React, {useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../icons';
import {TYPOGRAPHY, RADIUS, SPACING} from '../../constants/design';

// ============================================================================
// TYPES
// ============================================================================

interface AdmissionStep {
  id: string;
  title: string;
  description: string;
  tips: string[];
  documents?: string[];
  deadline?: string;
  important?: boolean;
}

interface UniversityGuide {
  id: string;
  name: string;
  shortName: string;
  color: string;
  icon: string;
  steps: AdmissionStep[];
  timeline: {
    applicationsOpen: string;
    applicationsClose: string;
    testDate: string;
    resultDate: string;
    meritList: string;
  };
  requirements: {
    minPercentage: number;
    testRequired: boolean;
    testName?: string;
    interviewRequired: boolean;
  };
  fees: {
    applicationFee: number;
    testFee?: number;
    semesterFee: string;
  };
  helpfulLinks: {
    label: string;
    url: string;
  }[];
}

interface AdmissionGuidesProps {
  onLinkPress?: (url: string) => void;
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

const UNIVERSITY_GUIDES: UniversityGuide[] = [
  {
    id: 'nust',
    name: 'National University of Sciences & Technology',
    shortName: 'NUST',
    color: '#4573DF',
    icon: 'school-outline',
    steps: [
      {
        id: '1',
        title: 'Create NET Account',
        description: 'Visit the official NUST admissions portal and create your NET (NUST Entry Test) account with a valid email.',
        tips: [
          'Use a personal email you check regularly',
          'Save your login credentials securely',
          'Verify your email immediately',
        ],
        documents: ['CNIC/B-Form copy'],
      },
      {
        id: '2',
        title: 'Fill Application Form',
        description: 'Complete the online application form with accurate personal and academic details.',
        tips: [
          'Double-check all entries before submission',
          'Keep your marks ready for quick reference',
          'Select programs in order of preference (max 6)',
        ],
        documents: [
          'Matric certificate/marks sheet',
          'Intermediate marks sheet (if available)',
          'Passport size photograph',
        ],
        important: true,
      },
      {
        id: '3',
        title: 'Pay Application Fee',
        description: 'Pay the non-refundable application and test fee through designated bank branches or online payment.',
        tips: [
          'Keep payment receipt safe',
          'Fee varies by program choice',
          'Payment deadline is strict',
        ],
      },
      {
        id: '4',
        title: 'Download Admit Card',
        description: 'Download and print your NET admit card showing test center, date, and time.',
        tips: [
          'Print multiple copies',
          'Visit test center beforehand',
          'Check reporting time carefully',
        ],
        important: true,
      },
      {
        id: '5',
        title: 'Appear for NET',
        description: 'Take the NUST Entry Test (NET) at your assigned center. Test covers MCQs from Physics, Math, Chemistry, English, and IQ.',
        tips: [
          'Arrive 1 hour early',
          'Carry CNIC/B-Form original',
          'Bring pencils and erasers only',
          'No electronic devices allowed',
        ],
        important: true,
      },
      {
        id: '6',
        title: 'Check Result & Merit',
        description: 'Check your NET result online and monitor merit lists as they are published.',
        tips: [
          'Download result for records',
          'Merit lists are program-specific',
          'Keep checking for subsequent merit lists',
        ],
      },
      {
        id: '7',
        title: 'Accept Admission Offer',
        description: 'If selected, accept your admission offer online and proceed with fee payment.',
        tips: [
          'Accept within given deadline',
          'Pay dues immediately to secure seat',
          'Prepare for document verification',
        ],
        documents: [
          'Original certificates',
          'Character certificate',
          'Migration certificate',
          'Medical fitness certificate',
        ],
        important: true,
      },
    ],
    timeline: {
      applicationsOpen: 'December',
      applicationsClose: 'April',
      testDate: 'May-June',
      resultDate: 'July',
      meritList: 'August',
    },
    requirements: {
      minPercentage: 60,
      testRequired: true,
      testName: 'NET (NUST Entry Test)',
      interviewRequired: false,
    },
    fees: {
      applicationFee: 2500,
      testFee: 2000,
      semesterFee: '80,000 - 200,000',
    },
    helpfulLinks: [
      {label: 'Official Website', url: 'https://nust.edu.pk'},
      {label: 'Admissions Portal', url: 'https://ugadmissions.nust.edu.pk'},
      {label: 'Fee Structure', url: 'https://nust.edu.pk/fee-structure'},
    ],
  },
  {
    id: 'fast',
    name: 'FAST National University',
    shortName: 'FAST-NUCES',
    color: '#DC2626',
    icon: 'code-slash-outline',
    steps: [
      {
        id: '1',
        title: 'Register Online',
        description: 'Create an account on FAST NU admissions portal and register for the entrance test.',
        tips: [
          'Registration opens in March',
          'Choose your preferred test center',
          'Multiple campuses available',
        ],
        documents: ['CNIC/B-Form'],
      },
      {
        id: '2',
        title: 'Fill Online Application',
        description: 'Complete the application form with personal details, academic records, and program preferences.',
        tips: [
          'Select up to 5 program preferences',
          'Choose campus preferences wisely',
          'Lahore, Islamabad, Karachi most competitive',
        ],
        documents: [
          'Matric marks sheet',
          'Intermediate marks (if available)',
          'Passport photo',
        ],
        important: true,
      },
      {
        id: '3',
        title: 'Pay Test Fee',
        description: 'Submit the entrance test fee through bank challans or online payment.',
        tips: [
          'Keep challan copy safe',
          'Fee is non-refundable',
          'Pay before deadline',
        ],
      },
      {
        id: '4',
        title: 'Take Entrance Test',
        description: 'Appear for FAST NU entrance test covering Math, English, IQ/Analytical sections.',
        tips: [
          'Test duration: 2.5-3 hours',
          'Focus on Math and Analytical sections',
          'Practice past papers available online',
          'Calculator not allowed',
        ],
        important: true,
      },
      {
        id: '5',
        title: 'Check Merit Lists',
        description: 'Monitor merit lists published for each campus and program.',
        tips: [
          'Multiple merit lists are published',
          'Check regularly for updates',
          'Different cutoffs for different campuses',
        ],
      },
      {
        id: '6',
        title: 'Confirm Admission',
        description: 'Accept offer and pay semester dues within the given deadline.',
        tips: [
          'Bring original documents',
          'Complete medical checkup',
          'Pay full semester fee to confirm',
        ],
        documents: [
          'Original certificates',
          'Migration certificate',
          'Character certificate',
          '4 passport photos',
        ],
        important: true,
      },
    ],
    timeline: {
      applicationsOpen: 'March',
      applicationsClose: 'June',
      testDate: 'July',
      resultDate: 'July-August',
      meritList: 'August',
    },
    requirements: {
      minPercentage: 60,
      testRequired: true,
      testName: 'FAST NU Entrance Test',
      interviewRequired: false,
    },
    fees: {
      applicationFee: 3000,
      testFee: 2500,
      semesterFee: '150,000 - 180,000',
    },
    helpfulLinks: [
      {label: 'Official Website', url: 'https://nu.edu.pk'},
      {label: 'Admissions', url: 'https://admissions.nu.edu.pk'},
    ],
  },
  {
    id: 'giki',
    name: 'Ghulam Ishaq Khan Institute',
    shortName: 'GIKI',
    color: '#059669',
    icon: 'hardware-chip-outline',
    steps: [
      {
        id: '1',
        title: 'Apply Online',
        description: 'Submit online application through GIKI admissions portal.',
        tips: [
          'Applications open in January',
          'Limited seats available',
          'Campus in Topi, KPK',
        ],
        documents: ['CNIC/B-Form', 'Academic records'],
      },
      {
        id: '2',
        title: 'Pay Application Fee',
        description: 'Submit application processing fee through bank or online.',
        tips: [
          'Non-refundable fee',
          'Keep receipt for records',
        ],
      },
      {
        id: '3',
        title: 'GIKI Admission Test',
        description: 'Appear for the admission test held at designated centers.',
        tips: [
          'Focus on Physics, Math, English',
          'Test is MCQ-based',
          'High competition for CS program',
        ],
        important: true,
      },
      {
        id: '4',
        title: 'Interview (if required)',
        description: 'Shortlisted candidates may be called for interview.',
        tips: [
          'Not all programs require interview',
          'Prepare basic technical questions',
          'Show enthusiasm and clarity',
        ],
      },
      {
        id: '5',
        title: 'Merit & Selection',
        description: 'Check merit lists and await selection notification.',
        tips: [
          'Merit calculated from test + academic marks',
          'Hostel is mandatory for all students',
          'Limited seats fill quickly',
        ],
        important: true,
      },
      {
        id: '6',
        title: 'Enroll & Pay Fees',
        description: 'Complete enrollment by submitting documents and paying fees.',
        tips: [
          'Hostel fee included in package',
          'Prepare for campus life',
          'Session starts in September',
        ],
        documents: [
          'All original certificates',
          'Medical certificate',
          'Passport photos',
        ],
        important: true,
      },
    ],
    timeline: {
      applicationsOpen: 'January',
      applicationsClose: 'May',
      testDate: 'June',
      resultDate: 'July',
      meritList: 'August',
    },
    requirements: {
      minPercentage: 60,
      testRequired: true,
      testName: 'GIKI Admission Test',
      interviewRequired: true,
    },
    fees: {
      applicationFee: 2000,
      testFee: 2000,
      semesterFee: '200,000 - 250,000 (with hostel)',
    },
    helpfulLinks: [
      {label: 'Official Website', url: 'https://giki.edu.pk'},
      {label: 'Admissions', url: 'https://admissions.giki.edu.pk'},
    ],
  },
  {
    id: 'lums',
    name: 'Lahore University of Management Sciences',
    shortName: 'LUMS',
    color: '#3660C9',
    icon: 'business-outline',
    steps: [
      {
        id: '1',
        title: 'Start Application',
        description: 'Create account on LUMS admissions portal and begin application.',
        tips: [
          'Early applications encouraged',
          'Multiple application rounds',
          'Need-based financial aid available',
        ],
      },
      {
        id: '2',
        title: 'Submit SAT/LCAT Scores',
        description: 'LUMS accepts SAT scores or conducts its own LCAT test.',
        tips: [
          'SAT preferred for SBASSE programs',
          'LCAT for Business School',
          'Check specific program requirements',
        ],
        important: true,
      },
      {
        id: '3',
        title: 'Personal Statement',
        description: 'Write compelling essays as part of your application.',
        tips: [
          'Be authentic and specific',
          'Highlight unique experiences',
          'Proofread multiple times',
        ],
        important: true,
      },
      {
        id: '4',
        title: 'Recommendation Letters',
        description: 'Submit recommendation letters from teachers/counselors.',
        tips: [
          'Request well in advance',
          'Choose recommenders who know you well',
          'Usually 2 letters required',
        ],
      },
      {
        id: '5',
        title: 'Interview',
        description: 'Selected candidates are called for interview.',
        tips: [
          'Be prepared to discuss your application',
          'Show genuine interest in LUMS',
          'Ask thoughtful questions',
        ],
        important: true,
      },
      {
        id: '6',
        title: 'Admission Decision',
        description: 'Receive admission decision and accept offer if selected.',
        tips: [
          'Decisions sent via email and portal',
          'Financial aid decisions come together',
          'Deposit required to confirm seat',
        ],
        important: true,
      },
    ],
    timeline: {
      applicationsOpen: 'October',
      applicationsClose: 'March (multiple rounds)',
      testDate: 'Ongoing (SAT) / Feb-Mar (LCAT)',
      resultDate: 'Rolling basis',
      meritList: 'April-May',
    },
    requirements: {
      minPercentage: 70,
      testRequired: true,
      testName: 'SAT / LCAT',
      interviewRequired: true,
    },
    fees: {
      applicationFee: 5000,
      semesterFee: '300,000 - 400,000',
    },
    helpfulLinks: [
      {label: 'Official Website', url: 'https://lums.edu.pk'},
      {label: 'Admissions', url: 'https://admissions.lums.edu.pk'},
      {label: 'Financial Aid', url: 'https://lums.edu.pk/financial-aid'},
    ],
  },
];

// ============================================================================
// STEP CARD COMPONENT
// ============================================================================

interface StepCardProps {
  step: AdmissionStep;
  stepNumber: number;
  color: string;
  isLast: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

const StepCard: React.FC<StepCardProps> = ({
  step,
  stepNumber,
  color,
  isLast,
  isExpanded,
  onToggle,
}) => {
  const expandAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isExpanded, expandAnim]);

  return (
    <View style={stepCardStyles.container}>
      {/* Timeline Line */}
      {!isLast && <View style={[stepCardStyles.line, {backgroundColor: color + '30'}]} />}

      {/* Step Number Circle */}
      <View
        style={[
          stepCardStyles.circle,
          {backgroundColor: color},
          step.important && stepCardStyles.importantCircle,
        ]}>
        <Text style={stepCardStyles.circleText}>{stepNumber}</Text>
      </View>

      {/* Content */}
      <TouchableOpacity
        style={[
          stepCardStyles.content,
          step.important && {borderLeftColor: color, borderLeftWidth: 3},
        ]}
        onPress={onToggle}
        activeOpacity={0.7}>
        <View style={stepCardStyles.header}>
          <Text style={stepCardStyles.title}>{step.title}</Text>
          {step.important && (
            <View style={[stepCardStyles.importantBadge, {backgroundColor: color + '15'}]}>
              <Icon name="star" size={12} color={color} />
              <Text style={[stepCardStyles.importantText, {color}]}>Important</Text>
            </View>
          )}
        </View>

        <Text style={stepCardStyles.description}>{step.description}</Text>

        {isExpanded && (
          <Animated.View style={{opacity: expandAnim}}>
            {/* Tips */}
            {step.tips.length > 0 && (
              <View style={stepCardStyles.section}>
                <Text style={stepCardStyles.sectionTitle}>💡 Tips</Text>
                {step.tips.map((tip, index) => (
                  <View key={index} style={stepCardStyles.tipItem}>
                    <Icon name="checkmark-circle" size={14} color="#10B981" />
                    <Text style={stepCardStyles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Documents */}
            {step.documents && step.documents.length > 0 && (
              <View style={stepCardStyles.section}>
                <Text style={stepCardStyles.sectionTitle}>📄 Documents Needed</Text>
                {step.documents.map((doc, index) => (
                  <View key={index} style={stepCardStyles.docItem}>
                    <Icon name="document-outline" size={14} color="#4573DF" />
                    <Text style={stepCardStyles.docText}>{doc}</Text>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        )}

        <View style={stepCardStyles.expandIndicator}>
          <Icon
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#94A3B8"
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const stepCardStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    position: 'relative',
  },
  line: {
    position: 'absolute',
    left: 15,
    top: 40,
    bottom: -SPACING.md,
    width: 2,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    zIndex: 1,
  },
  importantCircle: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  circleText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#1E293B',
    flex: 1,
  },
  importantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginLeft: SPACING.sm,
  },
  importantText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginLeft: 4,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    lineHeight: 20,
  },
  section: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#1E293B',
    marginBottom: SPACING.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  tipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#475569',
    marginLeft: 8,
    flex: 1,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  docText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#475569',
    marginLeft: 8,
  },
  expandIndicator: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AdmissionGuides: React.FC<AdmissionGuidesProps> = ({
  onLinkPress,
}) => {
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityGuide | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [modalVisible, setModalVisible] = useState(false);

  const toggleStep = useCallback((stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  }, []);

  const openGuide = (guide: UniversityGuide) => {
    setSelectedUniversity(guide);
    setExpandedSteps(new Set());
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.headerIcon}>
          <Icon name="map-outline" size={24} color="#FFF" />
        </LinearGradient>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Admission Guides</Text>
          <Text style={styles.headerSubtitle}>
            Step-by-step admission process
          </Text>
        </View>
      </View>

      {/* University Cards */}
      <View style={styles.universityList}>
        {UNIVERSITY_GUIDES.map(guide => (
          <TouchableOpacity
            key={guide.id}
            style={styles.universityCard}
            onPress={() => openGuide(guide)}
            activeOpacity={0.8}>
            <LinearGradient
              colors={[guide.color, guide.color + 'CC']}
              style={styles.universityCardGradient}>
              <View style={styles.universityCardContent}>
                <Icon name={guide.icon} size={28} color="#FFF" />
                <Text style={styles.universityCardName}>{guide.shortName}</Text>
                <Text style={styles.universityCardSteps}>
                  {guide.steps.length} Steps
                </Text>
              </View>
              <Icon name="arrow-forward-circle" size={24} color="rgba(255,255,255,0.7)" />
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* University Guide Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}>
        {selectedUniversity && (
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <LinearGradient
              colors={[selectedUniversity.color, selectedUniversity.color + 'CC']}
              style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setModalVisible(false)}>
                <Icon name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.modalHeaderContent}>
                <Text style={styles.modalTitle}>{selectedUniversity.shortName}</Text>
                <Text style={styles.modalSubtitle}>{selectedUniversity.name}</Text>
              </View>
            </LinearGradient>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Quick Info Cards */}
              <View style={styles.quickInfoContainer}>
                <View style={styles.quickInfoCard}>
                  <Icon name="calendar-outline" size={20} color="#4573DF" />
                  <Text style={styles.quickInfoLabel}>Applications</Text>
                  <Text style={styles.quickInfoValue}>
                    {selectedUniversity.timeline.applicationsOpen} - {selectedUniversity.timeline.applicationsClose}
                  </Text>
                </View>
                <View style={styles.quickInfoCard}>
                  <Icon name="document-text-outline" size={20} color="#F59E0B" />
                  <Text style={styles.quickInfoLabel}>Test</Text>
                  <Text style={styles.quickInfoValue}>
                    {selectedUniversity.requirements.testName || 'None'}
                  </Text>
                </View>
                <View style={styles.quickInfoCard}>
                  <Icon name="school-outline" size={20} color="#10B981" />
                  <Text style={styles.quickInfoLabel}>Min %</Text>
                  <Text style={styles.quickInfoValue}>
                    {selectedUniversity.requirements.minPercentage}%
                  </Text>
                </View>
              </View>

              {/* Timeline Overview */}
              <View style={styles.timelineOverview}>
                <Text style={styles.sectionHeader}>📅 Timeline</Text>
                <View style={styles.timelineItems}>
                  {[
                    {label: 'Applications Open', value: selectedUniversity.timeline.applicationsOpen, icon: 'play-circle'},
                    {label: 'Applications Close', value: selectedUniversity.timeline.applicationsClose, icon: 'stop-circle'},
                    {label: 'Test Date', value: selectedUniversity.timeline.testDate, icon: 'document-text'},
                    {label: 'Result', value: selectedUniversity.timeline.resultDate, icon: 'checkmark-circle'},
                    {label: 'Merit List', value: selectedUniversity.timeline.meritList, icon: 'list'},
                  ].map((item, index) => (
                    <View key={index} style={styles.timelineItem}>
                      <Icon name={item.icon} size={18} color={selectedUniversity.color} />
                      <Text style={styles.timelineLabel}>{item.label}</Text>
                      <Text style={styles.timelineValue}>{item.value}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Fee Structure */}
              <View style={styles.feeSection}>
                <Text style={styles.sectionHeader}>💰 Fee Structure</Text>
                <View style={styles.feeCards}>
                  <View style={styles.feeCard}>
                    <Text style={styles.feeLabel}>Application</Text>
                    <Text style={styles.feeValue}>Rs. {selectedUniversity.fees.applicationFee.toLocaleString()}</Text>
                  </View>
                  {selectedUniversity.fees.testFee && (
                    <View style={styles.feeCard}>
                      <Text style={styles.feeLabel}>Test Fee</Text>
                      <Text style={styles.feeValue}>Rs. {selectedUniversity.fees.testFee.toLocaleString()}</Text>
                    </View>
                  )}
                  <View style={[styles.feeCard, styles.feeCardLarge]}>
                    <Text style={styles.feeLabel}>Semester Fee</Text>
                    <Text style={styles.feeValue}>Rs. {selectedUniversity.fees.semesterFee}</Text>
                  </View>
                </View>
              </View>

              {/* Admission Steps */}
              <View style={styles.stepsSection}>
                <Text style={styles.sectionHeader}>📝 Admission Steps</Text>
                {selectedUniversity.steps.map((step, index) => (
                  <StepCard
                    key={step.id}
                    step={step}
                    stepNumber={index + 1}
                    color={selectedUniversity.color}
                    isLast={index === selectedUniversity.steps.length - 1}
                    isExpanded={expandedSteps.has(step.id)}
                    onToggle={() => toggleStep(step.id)}
                  />
                ))}
              </View>

              {/* Helpful Links */}
              <View style={styles.linksSection}>
                <Text style={styles.sectionHeader}>🔗 Helpful Links</Text>
                {selectedUniversity.helpfulLinks.map((link, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.linkCard}
                    onPress={() => onLinkPress?.(link.url)}
                    activeOpacity={0.7}>
                    <Icon name="link-outline" size={18} color={selectedUniversity.color} />
                    <Text style={[styles.linkText, {color: selectedUniversity.color}]}>
                      {link.label}
                    </Text>
                    <Icon name="open-outline" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{height: SPACING.xl * 2}} />
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
};

// ============================================================================
// COMPACT GUIDE CARD
// ============================================================================

interface CompactGuideCardProps {
  universityId: string;
  onPress: () => void;
}

export const CompactGuideCard: React.FC<CompactGuideCardProps> = ({
  universityId,
  onPress,
}) => {
  const guide = UNIVERSITY_GUIDES.find(g => g.id === universityId);
  if (!guide) return null;

  return (
    <TouchableOpacity
      style={compactStyles.card}
      onPress={onPress}
      activeOpacity={0.8}>
      <LinearGradient
        colors={[guide.color + '15', guide.color + '05']}
        style={compactStyles.cardGradient}>
        <Icon name="map-outline" size={20} color={guide.color} />
        <Text style={compactStyles.cardText}>View {guide.shortName} Guide</Text>
        <Icon name="arrow-forward" size={18} color={guide.color} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const compactStyles = StyleSheet.create({
  card: {
    marginVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  cardText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#475569',
    marginLeft: SPACING.sm,
  },
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    marginTop: 2,
  },
  universityList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  universityCard: {
    width: '48%',
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  universityCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  universityCardContent: {
    alignItems: 'flex-start',
  },
  universityCardName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFF',
    marginTop: SPACING.sm,
  },
  universityCardSteps: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  backButton: {
    padding: SPACING.sm,
  },
  modalHeaderContent: {
    marginLeft: SPACING.md,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#FFF',
  },
  modalSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  modalScroll: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  quickInfoContainer: {
    flexDirection: 'row',
    marginVertical: SPACING.lg,
  },
  quickInfoCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickInfoLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94A3B8',
    marginTop: SPACING.xs,
  },
  quickInfoValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#1E293B',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#1E293B',
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  timelineOverview: {
    backgroundColor: '#FFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  timelineItems: {},
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  timelineLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    marginLeft: SPACING.sm,
  },
  timelineValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#1E293B',
  },
  feeSection: {
    backgroundColor: '#FFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  feeCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  feeCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    marginRight: '2%',
  },
  feeCardLarge: {
    width: '100%',
    marginRight: 0,
  },
  feeLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94A3B8',
  },
  feeValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#1E293B',
    marginTop: 4,
  },
  stepsSection: {
    marginTop: SPACING.lg,
  },
  linksSection: {
    backgroundColor: '#FFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  linkText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginLeft: SPACING.sm,
  },
});

export default AdmissionGuides;

