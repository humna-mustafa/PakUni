/**
 * PremiumCareerCenterScreen - Unified Career Hub
 * Consolidates Career Guidance, Roadmaps, and Quiz into one accessible screen
 * Eliminates redundancy between career-related features
 */

import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../contexts/ThemeContext';
import {SPACING} from '../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../constants/design';
import {ANIMATION_SCALES, SPRING_CONFIGS} from '../constants/ui';
import {Icon} from '../components/icons';
import {CAREER_FIELDS} from '../data';
import type {RootStackParamList} from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ============================================================================
// Feature Card Data
// ============================================================================

// Career-related screen names that can be navigated to
type CareerScreenName = 'InterestQuiz' | 'CareerRoadmaps' | 'CareerGuidance' | 'GoalSetting' | 'SubjectGuide' | 'Recommendations';

interface FeatureCard {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  color: string;
  gradient: string[];
  screen: CareerScreenName;
  highlight?: string;
}

const CAREER_FEATURES: FeatureCard[] = [
  {
    id: 'quiz',
    title: 'Career Quiz',
    subtitle: 'Find your perfect career match',
    iconName: 'analytics',
    color: '#9B59B6',
    gradient: ['#9B59B6', '#8E44AD'],
    screen: 'InterestQuiz',
    highlight: 'Popular',
  },
  {
    id: 'roadmaps',
    title: 'Career Roadmaps',
    subtitle: 'Step-by-step paths to success',
    iconName: 'map',
    color: '#9C27B0',
    gradient: ['#9C27B0', '#7B1FA2'],
    screen: 'CareerRoadmaps',
  },
  {
    id: 'explore',
    title: 'Explore Careers',
    subtitle: 'Browse all career options',
    iconName: 'compass',
    color: '#10B981',
    gradient: ['#10B981', '#059669'],
    screen: 'CareerGuidance',
  },
  {
    id: 'recommendations',
    title: 'AI Recommendations',
    subtitle: 'Personalized suggestions',
    iconName: 'sparkles',
    color: '#4573DF',
    gradient: ['#4573DF', '#3660C9'],
    screen: 'Recommendations',
    highlight: 'AI',
  },
];

// ============================================================================
// Animated Feature Card Component
// ============================================================================

interface FeatureCardProps {
  feature: FeatureCard;
  index: number;
  onPress: () => void;
  colors: any;
}

const AnimatedFeatureCard: React.FC<FeatureCardProps> = ({feature, index, onPress, colors}) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: ANIMATION_SCALES.BUTTON_PRESS,
      useNativeDriver: true,
      ...SPRING_CONFIGS.snappy,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...SPRING_CONFIGS.responsive,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.featureCardWrapper,
        {
          transform: [{translateY: slideAnim}, {scale: scaleAnim}],
          opacity: fadeAnim,
        },
      ]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}>
        <LinearGradient
          colors={feature.gradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.featureCard}>
          {/* Decorations */}
          <View style={styles.cardDecoration1} />
          <View style={styles.cardDecoration2} />
          
          {/* Badge */}
          {feature.highlight && (
            <View style={styles.highlightBadge}>
              <Text style={styles.highlightText}>{feature.highlight}</Text>
            </View>
          )}

          {/* Icon */}
          <View style={styles.featureIconContainer}>
            <Icon name={feature.iconName} family="Ionicons" size={32} color="#FFFFFF" />
          </View>

          {/* Text */}
          <Text style={styles.featureTitle}>{feature.title}</Text>
          <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>

          {/* Arrow */}
          <View style={styles.featureArrow}>
            <Icon name="arrow-forward" family="Ionicons" size={18} color="rgba(255,255,255,0.8)" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ============================================================================
// Quick Stats Component
// ============================================================================

interface QuickStatProps {
  iconName: string;
  value: string;
  label: string;
  color: string;
  colors: any;
}

const QuickStat: React.FC<QuickStatProps> = ({iconName, value, label, color, colors}) => (
  <View style={[styles.quickStat, {backgroundColor: colors.card}]}>
    <View style={[styles.quickStatIcon, {backgroundColor: color + '20'}]}>
      <Icon name={iconName} family="Ionicons" size={20} color={color} />
    </View>
    <Text style={[styles.quickStatValue, {color: colors.text}]}>{value}</Text>
    <Text style={[styles.quickStatLabel, {color: colors.textSecondary}]}>{label}</Text>
  </View>
);

// ============================================================================
// Popular Career Card
// ============================================================================

interface PopularCareerProps {
  career: any;
  onPress: () => void;
  colors: any;
}

const PopularCareerCard: React.FC<PopularCareerProps> = ({career, onPress, colors}) => (
  <TouchableOpacity
    style={[styles.popularCareer, {backgroundColor: colors.card}]}
    onPress={onPress}
    activeOpacity={0.8}>
    <View style={[styles.popularIcon, {backgroundColor: (career.iconColor || '#10B981') + '20'}]}>
      <Icon
        name={career.iconName || 'briefcase'}
        family="Ionicons"
        size={22}
        color={career.iconColor || '#10B981'}
      />
    </View>
    <View style={styles.popularInfo}>
      <Text style={[styles.popularName, {color: colors.text}]} numberOfLines={1}>
        {career.name}
      </Text>
      <Text style={[styles.popularDemand, {color: colors.success}]}>
        {career.demand_trend || 'High'} Demand
      </Text>
    </View>
    <Icon name="chevron-forward" family="Ionicons" size={18} color={colors.textSecondary} />
  </TouchableOpacity>
);

// ============================================================================
// Main Screen
// ============================================================================

const PremiumCareerCenterScreen: React.FC = () => {
  const {colors, isDark} = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Get popular careers (first 5)
  const popularCareers = CAREER_FIELDS.slice(0, 5);

  const handleNavigate = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen as any);
  };

  const handleCareerPress = (_career: any) => {
    // Navigate to career guidance - career selection happens on that screen
    navigation.navigate('CareerGuidance');
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={isDark ? '#1D2127' : '#10B981'}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <Animated.View
          style={[
            styles.headerWrapper,
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
            colors={isDark ? ['#1D2127', '#134E4A', '#10B981'] : ['#10B981', '#059669', '#047857']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.header}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Decorations */}
            <View style={styles.headerDecoration1} />
            <View style={styles.headerDecoration2} />
            <View style={styles.headerDecoration3} />

            <View style={styles.headerIconContainer}>
              <Icon name="compass" family="Ionicons" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.headerTitle}>Career Center</Text>
            <Text style={styles.headerSubtitle}>
              Discover your perfect career path
            </Text>
          </LinearGradient>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>

          {/* Quick Stats */}
          <View style={styles.quickStatsRow}>
            <QuickStat
              iconName="briefcase"
              value={`${CAREER_FIELDS.length}+`}
              label="Careers"
              color="#10B981"
              colors={colors}
            />
            <QuickStat
              iconName="map"
              value="8"
              label="Roadmaps"
              color="#9C27B0"
              colors={colors}
            />
            <QuickStat
              iconName="analytics"
              value="5"
              label="Quiz Q's"
              color="#9B59B6"
              colors={colors}
            />
          </View>

          {/* Feature Cards */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="rocket" family="Ionicons" size={18} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text}]}>Get Started</Text>
            </View>
            
            <View style={styles.featuresGrid}>
              {CAREER_FEATURES.map((feature, index) => (
                <AnimatedFeatureCard
                  key={feature.id}
                  feature={feature}
                  index={index}
                  onPress={() => handleNavigate(feature.screen)}
                  colors={colors}
                />
              ))}
            </View>
          </View>

          {/* Popular Careers */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="flame" family="Ionicons" size={18} color="#F59E0B" />
              <Text style={[styles.sectionTitle, {color: colors.text}]}>Popular Careers</Text>
              <TouchableOpacity
                style={styles.seeAllBtn}
                onPress={() => handleNavigate('CareerGuidance')}>
                <Text style={[styles.seeAllText, {color: colors.primary}]}>See All</Text>
                <Icon name="chevron-forward" family="Ionicons" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {popularCareers.map((career) => (
              <PopularCareerCard
                key={career.id}
                career={career}
                onPress={() => handleCareerPress(career)}
                colors={colors}
              />
            ))}
          </View>

          {/* Motivation Card */}
          <View style={[styles.motivationCard, {backgroundColor: isDark ? '#F39C1220' : '#FFF8E1'}]}>
            <Icon name="bulb" family="Ionicons" size={32} color={isDark ? '#FFD54F' : '#F57F17'} />
            <Text style={[styles.motivationTitle, {color: isDark ? '#FFD54F' : '#F57F17'}]}>
              Not sure where to start?
            </Text>
            <Text style={[styles.motivationText, {color: isDark ? '#FFCC80' : '#BF360C'}]}>
              Take our Career Quiz to discover careers that match your interests and skills!
            </Text>
            <TouchableOpacity
              style={[styles.motivationBtn, {backgroundColor: isDark ? '#FFD54F' : '#F57F17'}]}
              onPress={() => handleNavigate('InterestQuiz')}>
              <Text style={styles.motivationBtnText}>Take Quiz</Text>
              <Icon name="arrow-forward" family="Ionicons" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={{height: SPACING.xxl * 2}} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerWrapper: {},
  header: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
    overflow: 'hidden',
    position: 'relative',
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
  headerDecoration1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  headerDecoration2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerDecoration3: {
    position: 'absolute',
    top: 30,
    left: 40,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  // Quick Stats
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  quickStatValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
  },
  quickStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  // Sections
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    flex: 1,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  // Feature Cards Grid
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  featureCardWrapper: {
    width: (SCREEN_WIDTH - SPACING.md * 2 - SPACING.sm) / 2,
  },
  featureCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    minHeight: 140,
    overflow: 'hidden',
    position: 'relative',
  },
  cardDecoration1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cardDecoration2: {
    position: 'absolute',
    bottom: -15,
    left: -15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  highlightBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  highlightText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  featureIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 16,
  },
  featureArrow: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
  },
  // Popular Careers
  popularCareer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  popularIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  popularInfo: {
    flex: 1,
  },
  popularName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    marginBottom: 2,
  },
  popularDemand: {
    fontSize: 11,
    fontWeight: '500',
  },
  // Motivation Card
  motivationCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  motivationTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  motivationText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  motivationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  motivationBtnText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
});

export default PremiumCareerCenterScreen;


