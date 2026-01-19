import React, {useState, useMemo, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Dimensions,
  Animated,
  StatusBar,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute, useNavigation} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {TYPOGRAPHY, SPACING, RADIUS, ANIMATION, GRADIENTS} from '../constants/design';
import {ANIMATION_SCALES, SPRING_CONFIGS} from '../constants/ui';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {UNIVERSITIES, PROGRAMS, MERIT_FORMULAS, getScholarshipsForUniversity, MERIT_RECORDS} from '../data';
import {getUniversityMeritSummaryByShortName} from '../services/meritLists';
import type {ScholarshipData} from '../data';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {Icon, FeatureIcon} from '../components/icons';
import {logger} from '../utils/logger';
import UniversityLogo from '../components/UniversityLogo';
import {analytics} from '../services/analytics';

// Fallback LinearGradient component
let LinearGradient: React.ComponentType<any>;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch {
  LinearGradient = ({children, style, colors}: any) => (
    <View style={[style, {backgroundColor: colors?.[0] || '#667eea'}]}>
      {children}
    </View>
  );
}

type UniversityDetailRouteProp = RouteProp<RootStackParamList, 'UniversityDetail'>;

const {width, height} = Dimensions.get('window');
const HEADER_MAX_HEIGHT = 280;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

type TabType = 'overview' | 'programs' | 'admission' | 'scholarships' | 'merits';

// Animated Tab Component
const AnimatedTab = ({
  label,
  iconName,
  isActive,
  onPress,
  index,
  colors,
}: {
  label: string;
  iconName: string;
  isActive: boolean;
  onPress: () => void;
  index: number;
  colors: any;
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const indicatorWidth = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  
  useEffect(() => {
    Animated.spring(indicatorWidth, {
      toValue: isActive ? 1 : 0,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  }, [isActive]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: ANIMATION_SCALES.CHIP_PRESS,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        ...SPRING_CONFIGS.snappy,
      }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
      <Animated.View
        style={[
          styles.tab,
          {transform: [{scale}]},
        ]}>
        <View style={[styles.tabIconWrapper, isActive && {opacity: 1}]}>
          <Icon
            name={iconName}
            family="Ionicons"
            size={20}
            color={isActive ? colors.primary : colors.textSecondary}
          />
        </View>
        <Text
          style={[
            styles.tabLabel,
            {color: isActive ? colors.primary : colors.textSecondary},
          ]}>
          {label}
        </Text>
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              backgroundColor: colors.primary,
              transform: [{scaleX: indicatorWidth}],
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

// Animated Fact Card
const FactCard = ({
  iconName,
  label,
  value,
  index,
  colors,
  isDark,
}: {
  iconName: string;
  label: string;
  value: string;
  index: number;
  colors: any;
  isDark: boolean;
}) => {
  const animValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.spring(animValue, {
      toValue: 1,
      delay: index * 100,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.factCard,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.02)',
          opacity: animValue,
          transform: [
            {
              translateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
            {
              scale: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        },
      ]}>
      <View style={[styles.factIconContainer, {backgroundColor: `${colors.primary}15`}]}>
        <Icon
          name={iconName}
          family="Ionicons"
          size={22}
          color={colors.primary}
        />
      </View>
      <Text style={[styles.factLabel, {color: colors.textSecondary}]}>{label}</Text>
      <Text style={[styles.factValue, {color: colors.text}]}>{value}</Text>
    </Animated.View>
  );
};

// Timeline Item Component
const TimelineItem = ({
  title,
  date,
  isLast,
  index,
  colors,
}: {
  title: string;
  date: string;
  isLast: boolean;
  index: number;
  colors: any;
}) => {
  const animValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.spring(animValue, {
      toValue: 1,
      delay: index * 150,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.timelineItem,
        {
          opacity: animValue,
          transform: [{
            translateX: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [-30, 0],
            }),
          }],
        },
      ]}>
      <View style={styles.timelineLeft}>
        <LinearGradient
          colors={isLast ? ['#10B981', '#059669'] : [colors.primary, colors.primaryDark || colors.primary]}
          style={styles.timelineDot}
        />
        {!isLast && <View style={[styles.timelineLine, {backgroundColor: colors.border}]} />}
      </View>
      <View style={styles.timelineContent}>
        <Text style={[styles.timelineTitle, {color: colors.text}]}>{title}</Text>
        <Text style={[styles.timelineDate, {color: colors.textSecondary}]}>{date}</Text>
      </View>
    </Animated.View>
  );
};

const PremiumUniversityDetailScreen = () => {
  const route = useRoute<UniversityDetailRouteProp>();
  const navigation = useNavigation();
  const {universityId} = route.params;
  const {colors, isDark} = useTheme();
  const {addFavorite, removeFavorite, isFavorite, isGuest} = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isFav, setIsFav] = useState(false);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  // Check if university is favorited
  useEffect(() => {
    setIsFav(isFavorite(universityId, 'university'));
  }, [universityId, isFavorite]);

  // Toggle favorite handler
  const handleToggleFavorite = async () => {
    if (isGuest) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to save universities to your favorites.',
        [{text: 'OK'}]
      );
      return;
    }
    
    try {
      if (isFav) {
        await removeFavorite(universityId, 'university');
        setIsFav(false);
      } else {
        await addFavorite(universityId, 'university');
        setIsFav(true);
      }
    } catch (error) {
      logger.error('Error toggling favorite', error, 'UniversityDetail');
    }
  };

  // Track university view for analytics
  useEffect(() => {
    const university = UNIVERSITIES.find(u => u.short_name === universityId);
    if (university) {
      analytics.trackUniversityView(university.short_name, university.name);
    }
  }, [universityId]);

  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const university = useMemo(() => 
    UNIVERSITIES.find(u => u.short_name === universityId),
    [universityId]
  );

  const universityPrograms = useMemo(() => 
    PROGRAMS.slice(0, 10),
    []
  );

  const universityScholarships = useMemo(() => {
    if (!university) return [];
    return getScholarshipsForUniversity(university.short_name, university.type);
  }, [university]);

  const meritFormulas = useMemo(() => 
    MERIT_FORMULAS.filter(f => 
      f.university.toLowerCase().includes(university?.short_name?.toLowerCase() || '') ||
      f.university.toLowerCase().includes('general') ||
      f.university.toLowerCase().includes(university?.province?.toLowerCase() || '')
    ).slice(0, 3),
    [university]
  );

  const openLink = async (url?: string) => {
    if (!url) {
      Alert.alert(
        'Link Not Available',
        'This link is not available at the moment. Please try again later or visit the university website directly.',
        [{text: 'OK'}]
      );
      return;
    }
    
    try {
      // Ensure URL has proper protocol
      let formattedUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
        formattedUrl = 'https://' + url;
      }
      
      const canOpen = await Linking.canOpenURL(formattedUrl);
      if (canOpen) {
        await Linking.openURL(formattedUrl);
      } else {
        Alert.alert(
          'Unable to Open Link',
          'Could not open this link. Please try copying it manually or check your internet connection.',
          [{text: 'OK'}]
        );
      }
    } catch (error) {
      logger.error('Error opening URL', error, 'UniversityDetail');
      Alert.alert(
        'Error Opening Link',
        'There was a problem opening this link. Please try again.',
        [{text: 'OK'}]
      );
    }
  };

  // Get university merit summary for the Merits tab
  const meritSummary = useMemo(() => {
    if (!university) return { programs: [], years: [], totalRecords: 0, trend: null };
    return getUniversityMeritSummaryByShortName(MERIT_RECORDS, university.short_name);
  }, [university?.short_name]);

  if (!university) {
    return (
      <View style={[styles.errorContainer, {backgroundColor: colors.background}]}>
        <Icon name="search-outline" family="Ionicons" size={48} color={colors.textSecondary} />
        <Text style={[styles.errorText, {color: colors.text}]}>University not found</Text>
        <TouchableOpacity
          style={[styles.errorButton, {backgroundColor: colors.primary}]}
          onPress={() => navigation.goBack()}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const tabs: {key: TabType; label: string; iconName: string}[] = [
    {key: 'overview', label: 'Overview', iconName: 'clipboard-outline'},
    {key: 'programs', label: 'Programs', iconName: 'library-outline'},
    {key: 'merits', label: 'Merits', iconName: 'trending-up-outline'},
    {key: 'admission', label: 'Admission', iconName: 'document-text-outline'},
    {key: 'scholarships', label: 'Aid', iconName: 'wallet-outline'},
  ];

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* About Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="information-circle-outline" family="Ionicons" size={22} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>About</Text>
        </View>
        <View style={[styles.aboutCard, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card}]}>
          <Text style={[styles.description, {color: colors.textSecondary}]}>
            {university.description || `${university.name} is a prestigious ${university.type} university located in ${university.city}, ${university.province}. Established in ${university.established_year}, it offers various undergraduate and postgraduate programs with a commitment to excellence in education and research.`}
          </Text>
        </View>
      </View>

      {/* Quick Facts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="stats-chart-outline" family="Ionicons" size={22} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Quick Facts</Text>
        </View>
        <View style={styles.factsGrid}>
          <FactCard
            iconName="location-outline"
            label="Location"
            value={university.city}
            index={0}
            colors={colors}
            isDark={isDark}
          />
          <FactCard
            iconName="calendar-outline"
            label="Established"
            value={String(university.established_year)}
            index={1}
            colors={colors}
            isDark={isDark}
          />
          <FactCard
            iconName="trophy-outline"
            label="HEC Ranking"
            value={university.ranking_national ? `#${university.ranking_national}` : (university.ranking_hec || 'N/A')}
            index={2}
            colors={colors}
            isDark={isDark}
          />
          <FactCard
            iconName="business-outline"
            label="Type"
            value={university.type.toUpperCase()}
            index={3}
            colors={colors}
            isDark={isDark}
          />
        </View>
      </View>

      {/* Campuses */}
      {university.campuses && university.campuses.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="business-outline" family="Ionicons" size={22} color={colors.primary} />
            <Text style={[styles.sectionTitle, {color: colors.text}]}>Campuses</Text>
          </View>
          <View style={[styles.campusList, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card}]}>
            {university.campuses.map((campus: string, index: number) => (
              <View
                key={index}
                style={[
                  styles.campusItem,
                  index !== university.campuses!.length - 1 && {borderBottomWidth: 1, borderBottomColor: colors.border},
                ]}>
                <View style={[styles.campusIconContainer, {backgroundColor: `${colors.primary}15`}]}>
                  <Icon name="location" family="Ionicons" size={18} color={colors.primary} />
                </View>
                <Text style={[styles.campusName, {color: colors.text}]}>{campus}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Contact */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="call-outline" family="Ionicons" size={22} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Contact Information</Text>
        </View>
        <View style={[styles.contactList, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card}]}>
          {university.website && (
            <TouchableOpacity
              style={[styles.contactItem, {borderBottomColor: colors.border}]}
              onPress={() => openLink(university.website)}
              activeOpacity={0.7}>
              <View style={[styles.contactIconContainer, {backgroundColor: '#4573DF15'}]}>
                <Icon name="globe-outline" family="Ionicons" size={20} color="#4573DF" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, {color: colors.textSecondary}]}>Website</Text>
                <Text style={[styles.contactValue, {color: colors.primary}]} numberOfLines={1}>
                  {university.website}
                </Text>
              </View>
              <View style={[styles.contactArrowContainer, {backgroundColor: `${colors.primary}10`}]}>
                <Icon name="chevron-forward" family="Ionicons" size={18} color={colors.primary} />
              </View>
            </TouchableOpacity>
          )}
          {university.email && (
            <TouchableOpacity
              style={[styles.contactItem, {borderBottomColor: colors.border}]}
              onPress={() => openLink(`mailto:${university.email}`)}
              activeOpacity={0.7}>
              <View style={[styles.contactIconContainer, {backgroundColor: '#EF444415'}]}>
                <Icon name="mail-outline" family="Ionicons" size={20} color="#EF4444" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, {color: colors.textSecondary}]}>Email</Text>
                <Text style={[styles.contactValue, {color: colors.primary}]} numberOfLines={1}>
                  {university.email}
                </Text>
              </View>
              <View style={[styles.contactArrowContainer, {backgroundColor: `${colors.primary}10`}]}>
                <Icon name="chevron-forward" family="Ionicons" size={18} color={colors.primary} />
              </View>
            </TouchableOpacity>
          )}
          {university.phone && (
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => openLink(`tel:${university.phone}`)}
              activeOpacity={0.7}>
              <View style={[styles.contactIconContainer, {backgroundColor: '#10B98115'}]}>
                <Icon name="call-outline" family="Ionicons" size={20} color="#10B981" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, {color: colors.textSecondary}]}>Phone</Text>
                <Text style={[styles.contactValue, {color: colors.primary}]} numberOfLines={1}>
                  {university.phone}
                </Text>
              </View>
              <View style={[styles.contactArrowContainer, {backgroundColor: `${colors.primary}10`}]}>
                <Icon name="chevron-forward" family="Ionicons" size={18} color={colors.primary} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderProgramsTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.programsNote, {color: colors.textSecondary}]}>
        {universityPrograms.length} Programs at {university.short_name || university.name}
      </Text>
      {universityPrograms.map((program, index) => (
        <Animated.View
          key={program.id}
          style={[
            styles.programCard,
            {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card},
          ]}>
          <View style={styles.programHeader}>
            <LinearGradient
              colors={
                program.field === 'Medical' ? ['#EF4444', '#DC2626'] :
                program.field === 'Engineering' ? ['#F59E0B', '#D97706'] :
                program.field === 'Computer Science' ? ['#4573DF', '#3660C9'] :
                program.field === 'Business' ? ['#10B981', '#059669'] :
                GRADIENTS.primary
              }
              style={styles.programIcon}>
              <Icon
                name={
                  program.field === 'Medical' ? 'medkit' :
                  program.field === 'Engineering' ? 'construct' :
                  program.field === 'Computer Science' ? 'laptop' :
                  program.field === 'Business' ? 'briefcase' : 'library'
                }
                family="Ionicons"
                size={24}
                color="#FFFFFF"
              />
            </LinearGradient>
            <View style={styles.programInfo}>
              <Text style={[styles.programName, {color: colors.text}]}>{program.degree_title}</Text>
              <Text style={[styles.programFullName, {color: colors.textSecondary}]}>{program.name}</Text>
            </View>
          </View>

          <View style={[styles.programDetails, {backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'}]}>
            <View style={styles.programDetail}>
              <Icon name="time-outline" family="Ionicons" size={16} color={colors.textSecondary} />
              <Text style={[styles.detailValue, {color: colors.text}]}>{program.duration_years} Years</Text>
            </View>
            <View style={[styles.programDetailDivider, {backgroundColor: colors.border}]} />
            <View style={styles.programDetail}>
              <Icon name="cash-outline" family="Ionicons" size={16} color={colors.textSecondary} />
              <Text style={[styles.detailValue, {color: colors.text}]}>
                PKR {(program.avg_fee_per_semester / 1000).toFixed(0)}K/sem
              </Text>
            </View>
          </View>

          <View style={styles.eligibilitySection}>
            <View style={[styles.eligibilityChip, {backgroundColor: `${colors.success}15`}]}>
              <View style={styles.eligibilityContent}>
                <Icon name="checkmark" family="Ionicons" size={14} color={colors.success} />
                <Text style={[styles.eligibilityText, {color: colors.success}]}>{program.eligibility}</Text>
              </View>
            </View>
            {program.entry_test && (
              <View style={[styles.eligibilityChip, {backgroundColor: `${colors.primary}15`}]}>
                <View style={styles.eligibilityContent}>
                  <Icon name="document-text-outline" family="Ionicons" size={14} color={colors.primary} />
                  <Text style={[styles.eligibilityText, {color: colors.primary}]}>{program.entry_test}</Text>
                </View>
              </View>
            )}
          </View>
        </Animated.View>
      ))}
    </View>
  );

  const renderAdmissionTab = () => (
    <View style={styles.tabContent}>
      {/* Apply Banner */}
      {university.admission_url && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => openLink(university.admission_url)}>
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.admissionBanner}>
            <View style={styles.admissionBannerContent}>
              <View style={styles.admissionBannerIconContainer}>
                <Icon name="document-text" family="Ionicons" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.admissionBannerInfo}>
                <Text style={styles.admissionBannerTitle}>Apply Online</Text>
                <Text style={styles.admissionBannerSubtitle}>Visit official admission portal</Text>
              </View>
            </View>
            <View style={styles.admissionBannerArrow}>
              <Icon name="arrow-forward" family="Ionicons" size={24} color="#FFFFFF" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Admission Status Note */}
      {university.status_notes && (
        <View style={[styles.statusNoteCard, {backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF', borderColor: colors.primary}]}>
          <View style={styles.statusNoteHeader}>
            <Icon name="notifications-outline" family="Ionicons" size={20} color={colors.primary} />
            <Text style={[styles.statusNoteTitle, {color: colors.primary}]}>Latest Admission Status</Text>
          </View>
          <Text style={[styles.statusNoteText, {color: colors.text}]}>{university.status_notes}</Text>
        </View>
      )}

      {/* Application Steps */}
      {university.application_steps && university.application_steps.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="list-outline" family="Ionicons" size={22} color={colors.primary} />
            <Text style={[styles.sectionTitle, {color: colors.text}]}>How to Apply (Steps)</Text>
          </View>
          <View style={[styles.stepsContainer, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card}]}>
            {university.application_steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={[styles.stepNumber, {backgroundColor: colors.primary}]}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={[styles.stepText, {color: colors.textSecondary}]}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Merit Formulas */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="calculator-outline" family="Ionicons" size={22} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Merit Calculation</Text>
        </View>
        {meritFormulas.map((formula, index) => (
          <View
            key={formula.id}
            style={[styles.formulaCard, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card}]}>
            <Text style={[styles.formulaName, {color: colors.text}]}>{formula.name}</Text>
            <Text style={[styles.formulaUniversity, {color: colors.textSecondary}]}>{formula.university}</Text>

            <View style={styles.formulaWeights}>
              <View style={styles.weightItem}>
                <LinearGradient colors={['#4573DF', '#3660C9']} style={styles.weightCircle}>
                  <Text style={styles.weightValue}>{formula.matric_weightage}%</Text>
                </LinearGradient>
                <Text style={[styles.weightLabel, {color: colors.textSecondary}]}>Matric</Text>
              </View>
              <View style={styles.weightItem}>
                <LinearGradient colors={['#4573DF', '#3660C9']} style={styles.weightCircle}>
                  <Text style={styles.weightValue}>{formula.inter_weightage}%</Text>
                </LinearGradient>
                <Text style={[styles.weightLabel, {color: colors.textSecondary}]}>Inter</Text>
              </View>
              <View style={styles.weightItem}>
                <LinearGradient colors={['#10B981', '#059669']} style={styles.weightCircle}>
                  <Text style={styles.weightValue}>{formula.entry_test_weightage}%</Text>
                </LinearGradient>
                <Text style={[styles.weightLabel, {color: colors.textSecondary}]}>{formula.entry_test_name}</Text>
              </View>
            </View>

            {formula.hafiz_bonus > 0 && (
              <View style={styles.bonusBadge}>
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.bonusGradient}>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                    <Icon name="moon-outline" family="Ionicons" size={14} color="#FFFFFF" />
                    <Text style={styles.bonusText}>+{formula.hafiz_bonus} Hafiz Bonus</Text>
                  </View>
                </LinearGradient>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Admission Timeline */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="calendar-outline" family="Ionicons" size={22} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Admission Timeline</Text>
        </View>
        <View style={[styles.timeline, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card}]}>
          <TimelineItem title="Applications Open" date="June - July" isLast={false} index={0} colors={colors} />
          <TimelineItem title="Entry Test" date="July - August" isLast={false} index={1} colors={colors} />
          <TimelineItem title="Merit Lists" date="August - September" isLast={false} index={2} colors={colors} />
          <TimelineItem title="Classes Begin" date="September - October" isLast={true} index={3} colors={colors} />
        </View>
      </View>
    </View>
  );

  const renderMeritsTab = () => (
    <View style={styles.tabContent}>
      {/* Merit Summary Header */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="trending-up-outline" family="Ionicons" size={22} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Merit History</Text>
        </View>
        
        {meritSummary.programs.length === 0 ? (
          <View style={[styles.emptyScholarships, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card}]}>
            <Icon name="analytics-outline" family="Ionicons" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, {color: colors.text}]}>No merit data available</Text>
            <Text style={[styles.emptySubtext, {color: colors.textSecondary}]}>
              Merit records for this university are not yet in our database
            </Text>
          </View>
        ) : (
          <>
            {/* Overall Stats */}
            <View style={[styles.aboutCard, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card, marginBottom: SPACING.md}]}>
              <View style={styles.meritStatsRow}>
                <View style={styles.meritStatItem}>
                  <Text style={[styles.meritStatValue, {color: colors.primary}]}>{meritSummary.programs.length}</Text>
                  <Text style={[styles.meritStatLabel, {color: colors.textSecondary}]}>Programs</Text>
                </View>
                <View style={styles.meritStatItem}>
                  <Text style={[styles.meritStatValue, {color: colors.primary}]}>{meritSummary.years.length}</Text>
                  <Text style={[styles.meritStatLabel, {color: colors.textSecondary}]}>Years Data</Text>
                </View>
                <View style={styles.meritStatItem}>
                  <Text style={[styles.meritStatValue, {color: colors.primary}]}>{meritSummary.totalRecords}</Text>
                  <Text style={[styles.meritStatLabel, {color: colors.textSecondary}]}>Records</Text>
                </View>
              </View>
              
              {meritSummary.trend && (
                <View style={styles.trendBadgeContainer}>
                  <LinearGradient
                    colors={meritSummary.trend === 'increasing' ? ['#EF4444', '#F87171'] : meritSummary.trend === 'decreasing' ? ['#10B981', '#34D399'] : ['#6B7280', '#9CA3AF']}
                    style={styles.trendBadge}>
                    <Icon 
                      name={meritSummary.trend === 'increasing' ? 'trending-up' : meritSummary.trend === 'decreasing' ? 'trending-down' : 'remove'} 
                      family="Ionicons" 
                      size={14} 
                      color="#FFFFFF" 
                    />
                    <Text style={styles.trendBadgeText}>
                      {meritSummary.trend === 'increasing' ? 'Merit Rising' : meritSummary.trend === 'decreasing' ? 'Merit Dropping' : 'Stable'}
                    </Text>
                  </LinearGradient>
                </View>
              )}
            </View>

            {/* Program-wise Merit List */}
            {meritSummary.programs.map((program) => (
              <View 
                key={program.programName} 
                style={[styles.meritProgramCard, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card}]}>
                <View style={styles.meritProgramHeader}>
                  <View style={[styles.programIconBg, {backgroundColor: `${colors.primary}15`}]}>
                    <Icon name="school-outline" family="Ionicons" size={20} color={colors.primary} />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={[styles.meritProgramName, {color: colors.text}]}>{program.programName}</Text>
                    <Text style={[styles.meritProgramMeta, {color: colors.textSecondary}]}>
                      {program.category} • {program.years.length} years data
                    </Text>
                  </View>
                </View>
                
                {/* Year-wise merits */}
                <View style={styles.yearMeritsContainer}>
                  {program.years.sort((a, b) => b.year - a.year).slice(0, 5).map((yearData, idx) => (
                    <View key={yearData.year} style={styles.yearMeritRow}>
                      <Text style={[styles.yearLabel, {color: colors.textSecondary}]}>{yearData.year}</Text>
                      <View style={styles.meritValuesRow}>
                        <View style={styles.meritValueItem}>
                          <Text style={[styles.meritValueLabel, {color: colors.textMuted}]}>List 1</Text>
                          <Text style={[styles.meritValue, {color: colors.text}]}>{yearData.closingMerit.toFixed(1)}%</Text>
                        </View>
                        {yearData.list2Merit && (
                          <View style={styles.meritValueItem}>
                            <Text style={[styles.meritValueLabel, {color: colors.textMuted}]}>List 2</Text>
                            <Text style={[styles.meritValue, {color: colors.textSecondary}]}>{yearData.list2Merit.toFixed(1)}%</Text>
                          </View>
                        )}
                        {yearData.list3Merit && (
                          <View style={styles.meritValueItem}>
                            <Text style={[styles.meritValueLabel, {color: colors.textMuted}]}>List 3</Text>
                            <Text style={[styles.meritValue, {color: colors.textSecondary}]}>{yearData.list3Merit.toFixed(1)}%</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}
      </View>
    </View>
  );

  const renderScholarshipsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.scholarshipsHeader}>
        <Text style={[styles.scholarshipsNote, {color: colors.textSecondary}]}>
          {universityScholarships.length} scholarships available
        </Text>
      </View>

      {universityScholarships.length === 0 ? (
        <View style={[styles.emptyScholarships, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card}]}>
          <Icon name="clipboard-outline" family="Ionicons" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyText, {color: colors.text}]}>No specific scholarships found</Text>
          <Text style={[styles.emptySubtext, {color: colors.textSecondary}]}>
            Check HEC or university website for more options
          </Text>
        </View>
      ) : (
        universityScholarships.map((scholarship: ScholarshipData, index) => (
          <Animated.View
            key={scholarship.id}
            style={[styles.scholarshipCard, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card}]}>
            <View style={styles.scholarshipHeader}>
              <View style={[styles.scholarshipIconContainer, {backgroundColor: `${colors.primary}15`}]}>
                <Icon
                  name={
                    scholarship.type === 'government' ? 'business' :
                    scholarship.type === 'need_based' ? 'wallet' :
                    scholarship.type === 'merit_based' ? 'trophy' :
                    scholarship.type === 'hafiz_e_quran' ? 'book' :
                    scholarship.type === 'sports' ? 'football' :
                    scholarship.type === 'disabled' ? 'accessibility' : 'school'
                  }
                  family="Ionicons"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View style={styles.scholarshipInfo}>
                <Text style={[styles.scholarshipName, {color: colors.text}]}>{scholarship.name}</Text>
                <Text style={[styles.scholarshipProvider, {color: colors.textSecondary}]}>{scholarship.provider}</Text>
              </View>
              <LinearGradient
                colors={
                  scholarship.coverage_percentage === 100 ? ['#10B981', '#059669'] :
                  scholarship.coverage_percentage >= 75 ? ['#F59E0B', '#D97706'] :
                  GRADIENTS.primary
                }
                style={styles.coverageBadge}>
                <Text style={styles.coverageText}>{scholarship.coverage_percentage}%</Text>
              </LinearGradient>
            </View>

            <Text style={[styles.scholarshipDesc, {color: colors.textSecondary}]}>
              {scholarship.description}
            </Text>

            {/* Coverage Details */}
            <View style={styles.coverageDetails}>
              {scholarship.covers_tuition && (
                <View style={[styles.coverageChip, {backgroundColor: `${colors.success}10`, flexDirection: 'row', alignItems: 'center', gap: 4}]}>
                  <Icon name="checkmark-circle" family="Ionicons" size={14} color={colors.success} />
                  <Text style={[styles.coverageChipText, {color: colors.success}]}>Tuition</Text>
                </View>
              )}
              {scholarship.covers_hostel && (
                <View style={[styles.coverageChip, {backgroundColor: `${colors.success}10`, flexDirection: 'row', alignItems: 'center', gap: 4}]}>
                  <Icon name="checkmark-circle" family="Ionicons" size={14} color={colors.success} />
                  <Text style={[styles.coverageChipText, {color: colors.success}]}>Hostel</Text>
                </View>
              )}
              {scholarship.covers_books && (
                <View style={[styles.coverageChip, {backgroundColor: `${colors.success}10`, flexDirection: 'row', alignItems: 'center', gap: 4}]}>
                  <Icon name="checkmark-circle" family="Ionicons" size={14} color={colors.success} />
                  <Text style={[styles.coverageChipText, {color: colors.success}]}>Books</Text>
                </View>
              )}
            </View>

            {(scholarship.monthly_stipend || scholarship.max_family_income) && (
              <View style={[styles.scholarshipStats, {backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'}]}>
                {scholarship.monthly_stipend && (
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Monthly Stipend</Text>
                    <Text style={[styles.statValue, {color: colors.success}]}>
                      PKR {scholarship.monthly_stipend.toLocaleString()}
                    </Text>
                  </View>
                )}
                {scholarship.max_family_income && (
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Max Income</Text>
                    <Text style={[styles.statValue, {color: colors.text}]}>
                      PKR {scholarship.max_family_income.toLocaleString()}/mo
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.scholarshipFooter}>
              <View style={[styles.deadlineBadge, {backgroundColor: `${colors.warning}15`}]}>
                <View style={styles.deadlineRow}>
                  <Icon name="calendar-outline" family="Ionicons" size={14} color={colors.warning} />
                  <Text style={[styles.deadlineText, {color: colors.warning}]}>
                    {scholarship.application_deadline}
                  </Text>
                </View>
              </View>
              {scholarship.website && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => openLink(scholarship.website)}>
                  <LinearGradient
                    colors={GRADIENTS.primary}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.applyBtn}>
                    <Text style={styles.applyBtnText}>Apply</Text>
                    <Icon name="arrow-forward" family="Ionicons" size={16} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        ))
      )}
    </View>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, {height: headerHeight}]}>
        <LinearGradient
          colors={university.type === 'public' ? ['#10B981', '#059669', '#047857'] : GRADIENTS.primary}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={StyleSheet.absoluteFill}
        />
        
        {/* Decorative Elements */}
        <View style={styles.headerDecoration}>
          <View style={[styles.decorCircle, styles.decorCircle1]} />
          <View style={[styles.decorCircle, styles.decorCircle2]} />
          <View style={[styles.decorCircle, styles.decorCircle3]} />
        </View>

        {/* Back Button */}
        <SafeAreaView edges={['top']} style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <Icon name="chevron-back" family="Ionicons" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Animated.Text
            style={[styles.headerTitle, {opacity: headerTitleOpacity}]}
            numberOfLines={1}>
            {university.short_name || university.name}
          </Animated.Text>
          
          <TouchableOpacity
            style={styles.headerRight}
            onPress={handleToggleFavorite}
            activeOpacity={0.7}>
            <Icon 
              name={isFav ? "heart" : "heart-outline"} 
              family="Ionicons" 
              size={24} 
              color={isFav ? "#EF4444" : "#FFFFFF"} 
            />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Hero Content */}
        <Animated.View style={[styles.heroContent, {opacity: heroOpacity}]}>
          <View style={styles.logoContainer}>
            <UniversityLogo
              shortName={university.short_name}
              universityName={university.name}
              size={72}
              borderRadius={16}
              showLoader={false}
            />
          </View>
          <Text style={styles.universityName}>{university.name}</Text>
          <View style={styles.locationRow}>
            <Icon name="location" family="Ionicons" size={16} color="#FFFFFF" />
            <Text style={styles.universityLocation}>{university.city}, {university.province}</Text>
          </View>
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{university.type.toUpperCase()}</Text>
            </View>
            {(university.ranking_national || university.ranking_hec) && (
              <View style={styles.rankBadge}>
                <Icon name="trophy" family="Ionicons" size={12} color="#F59E0B" />
                <Text style={styles.rankBadgeText}>
                  HEC #{university.ranking_national || university.ranking_hec}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </Animated.View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, {backgroundColor: colors.card, borderBottomColor: colors.border}]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {tabs.map((tab, index) => (
            <AnimatedTab
              key={tab.key}
              label={tab.label}
              iconName={tab.iconName}
              isActive={activeTab === tab.key}
              onPress={() => setActiveTab(tab.key)}
              index={index}
              colors={colors}
            />
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false}
        )}
        scrollEventThrottle={16}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'programs' && renderProgramsTab()}
        {activeTab === 'merits' && renderMeritsTab()}
        {activeTab === 'admission' && renderAdmissionTab()}
        {activeTab === 'scholarships' && renderScholarshipsTab()}
        <View style={{height: 100}} />
      </Animated.ScrollView>
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
  errorIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    marginBottom: SPACING.lg,
  },
  errorButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  header: {
    overflow: 'hidden',
  },
  headerDecoration: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorCircle1: {
    width: 200,
    height: 200,
    top: -50,
    right: -50,
  },
  decorCircle2: {
    width: 150,
    height: 150,
    bottom: -30,
    left: -30,
  },
  decorCircle3: {
    width: 80,
    height: 80,
    top: 60,
    left: width * 0.6,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  logoPlaceholder: {
    fontSize: 40,
  },
  universityName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  universityLocation: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  typeBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  typeBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rankBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  rankBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tabsContainer: {
    borderBottomWidth: 1,
  },
  tabsScroll: {
    paddingHorizontal: SPACING.md,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginRight: SPACING.xs,
  },
  tabIconWrapper: {
    opacity: 0.7,
    marginBottom: 4,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
    opacity: 0.7,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: SPACING.sm,
    right: SPACING.sm,
    height: 3,
    borderRadius: 1.5,
  },
  tabContent: {
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
  },
  aboutCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 24,
  },
  factsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  factCard: {
    width: (width - SPACING.md * 3) / 2,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  factIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  factIcon: {
    fontSize: 24,
  },
  factLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: 2,
  },
  factValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  campusList: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  campusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  campusIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  campusIcon: {
    fontSize: 16,
  },
  campusName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '500',
  },
  contactList: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
  },
  contactIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  contactIcon: {
    fontSize: 20,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
  },
  contactArrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactArrow: {
    fontSize: 16,
    fontWeight: '600',
  },
  programsNote: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.md,
  },
  programCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  programHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  programIcon: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  programIconText: {
    fontSize: 26,
  },
  programInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  programName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  programFullName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
  programDetails: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  programDetail: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  programDetailDivider: {
    width: 1,
    height: 24,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  eligibilitySection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  eligibilityChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  eligibilityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eligibilityText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
  },
  admissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  admissionBannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  admissionBannerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  admissionBannerIcon: {
    fontSize: 28,
  },
  admissionBannerInfo: {
    flex: 1,
  },
  admissionBannerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  admissionBannerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  admissionBannerArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusNoteCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
  },
  statusNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statusNoteTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  statusNoteText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  stepsContainer: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  admissionArrowText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  formulaCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  formulaName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  formulaUniversity: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.md,
  },
  formulaWeights: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  weightItem: {
    alignItems: 'center',
  },
  weightCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  weightValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  weightLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
  },
  bonusBadge: {
    alignSelf: 'center',
  },
  bonusGradient: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  bonusText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timeline: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: SPACING.md,
  },
  timelineTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  timelineDate: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
  scholarshipsHeader: {
    marginBottom: SPACING.md,
  },
  scholarshipsNote: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  emptyScholarships: {
    alignItems: 'center',
    padding: SPACING.xxl,
    borderRadius: RADIUS.lg,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 4,
    textAlign: 'center',
  },
  scholarshipCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  scholarshipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  scholarshipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  scholarshipIcon: {
    fontSize: 24,
  },
  scholarshipInfo: {
    flex: 1,
  },
  scholarshipName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  scholarshipProvider: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
  coverageBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  coverageText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scholarshipDesc: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  coverageDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  coverageChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  coverageChipText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
  },
  scholarshipStats: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: 2,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  scholarshipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadlineBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
  },
  applyBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  applyBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Merit Tab Styles
  meritStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
  },
  meritStatItem: {
    alignItems: 'center',
  },
  meritStatValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
  },
  meritStatLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 4,
  },
  trendBadgeContainer: {
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.2)',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  trendBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  meritProgramCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  meritProgramHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  programIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  meritProgramName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  meritProgramMeta: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  yearMeritsContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.15)',
    paddingTop: SPACING.sm,
  },
  yearMeritRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  yearLabel: {
    width: 50,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  meritValuesRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
  },
  meritValueItem: {
    alignItems: 'center',
    minWidth: 50,
  },
  meritValueLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  meritValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
});

export default PremiumUniversityDetailScreen;


