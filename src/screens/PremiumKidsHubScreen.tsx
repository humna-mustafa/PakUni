import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../constants/design';
import {ANIMATION_SCALES, SPRING_CONFIGS} from '../constants/ui';
import {useTheme} from '../contexts/ThemeContext';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {Icon} from '../components/icons';

const {width} = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Kids Hub Features
const KIDS_FEATURES = [
  {
    id: 'careers',
    title: 'Explore Careers',
    iconName: 'color-palette-outline',
    color: '#FF6B6B',
    gradient: ['#FF6B6B', '#FF8E8E'],
    description: 'Discover cool jobs!',
    tagline: 'What do you want to be?',
    screen: 'CareerExplorerKids',
  },
  {
    id: 'quiz',
    title: 'Career Quiz',
    iconName: 'bulb-outline',
    color: '#4ECDC4',
    gradient: ['#4ECDC4', '#6EE5DD'],
    description: 'Find your perfect career!',
    tagline: 'Take the fun quiz',
    screen: 'InterestQuiz',
  },
  {
    id: 'goals',
    title: 'My Goals',
    iconName: 'flag-outline',
    color: '#45B7D1',
    gradient: ['#45B7D1', '#67CFE6'],
    description: 'Set & track goals!',
    tagline: 'Dream big, start small',
    screen: 'GoalSetting',
  },
  {
    id: 'subjects',
    title: 'Subject Guide',
    iconName: 'library-outline',
    color: '#96CEB4',
    gradient: ['#96CEB4', '#B2DEC8'],
    description: 'Choose right subjects!',
    tagline: 'FSc, FA, ICS or I.Com?',
    screen: 'SubjectGuide',
  },
  {
    id: 'roadmaps',
    title: 'Career Paths',
    iconName: 'map-outline',
    color: '#DDA0DD',
    gradient: ['#DDA0DD', '#E9C0E9'],
    description: 'Step-by-step journeys!',
    tagline: 'From school to dream job',
    screen: 'CareerRoadmaps',
  },
  {
    id: 'tips',
    title: 'Study Tips',
    iconName: 'flash-outline',
    color: '#FFD93D',
    gradient: ['#FFD93D', '#FFE56D'],
    description: 'Learn smarter!',
    tagline: 'Top student secrets',
    screen: 'StudyTips',
  },
];

// Fun Facts for Kids
const FUN_FACTS = [
  {iconName: 'rocket-outline', text: 'Pakistan has over 200 universities!'},
  {iconName: 'flask-outline', text: 'Dr. Nergis Mavalvala discovered gravitational waves!'},
  {iconName: 'laptop-outline', text: 'Arfa Karim became MCP at just 9 years old!'},
  {iconName: 'trophy-outline', text: 'Work hard today, shine tomorrow!'},
  {iconName: 'book-outline', text: 'Reading 20 mins daily = 1.8 million words/year!'},
  {iconName: 'school-outline', text: 'Pakistan produces 445,000+ university graduates yearly!'},
  {iconName: 'bulb-outline', text: 'Dr. Abdus Salam won Nobel Prize in Physics!'},
  {iconName: 'globe-outline', text: 'Pakistani engineers built Karakoram Highway!'},
  {iconName: 'musical-notes-outline', text: 'Learning music improves math skills by 23%!'},
  {iconName: 'fitness-outline', text: 'Jahangir Khan won 555 squash matches in a row!'},
  {iconName: 'heart-outline', text: 'Helping others makes you happier & smarter!'},
  {iconName: 'star-outline', text: 'Malala is the youngest Nobel Peace Prize winner!'},
];

// Motivational quotes for kids
const KIDS_QUOTES = [
  { text: 'Every expert was once a beginner!', emoji: '🌱' },
  { text: 'Your dreams don\'t have an expiry date!', emoji: '✨' },
  { text: 'Mistakes help you learn faster!', emoji: '🚀' },
  { text: 'You are braver than you believe!', emoji: '💪' },
  { text: 'Big journeys start with small steps!', emoji: '👣' },
  { text: 'Your only limit is your mind!', emoji: '🧠' },
];

// Feature Card Component with animations
const FeatureCard = ({
  feature,
  index,
  onPress,
}: {
  feature: any;
  index: number;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(bounceAnim, {
      toValue: ANIMATION_SCALES.CHIP_PRESS,
      useNativeDriver: true,
      ...SPRING_CONFIGS.snappy,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(bounceAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...SPRING_CONFIGS.responsive,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.featureCardContainer,
        {
          transform: [{scale: Animated.multiply(scaleAnim, bounceAnim)}],
          opacity: scaleAnim,
        },
      ]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}>
        <LinearGradient
          colors={feature.gradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.featureCard}>
          {/* Decorative bubbles */}
          <View style={styles.bubble1} />
          <View style={styles.bubble2} />
          
          <Icon name={feature.iconName} family="Ionicons" size={48} color="#FFFFFF" />
          <Text style={styles.featureTitle}>{feature.title}</Text>
          <Text style={styles.featureDesc}>{feature.description}</Text>
          <View style={styles.featureTagline}>
            <Text style={styles.featureTaglineText}>{feature.tagline}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Stat Card with animation
const StatCard = ({
  iconName,
  value,
  label,
  index,
  colors,
}: {
  iconName: string;
  value: string;
  label: string;
  index: number;
  colors: any;
}) => {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: 500 + index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: 500 + index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          transform: [{translateY: slideAnim}],
          opacity: fadeAnim,
        },
      ]}>
      <Icon name={iconName} family="Ionicons" size={24} color={colors.primary} />
      <Text style={[styles.statValue, {color: colors.text}]}>{value}</Text>
      <Text style={[styles.statLabel, {color: colors.textSecondary}]}>{label}</Text>
    </Animated.View>
  );
};

const PremiumKidsHubScreen = () => {
  const {colors, isDark} = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  
  const headerAnim = useRef(new Animated.Value(0)).current;
  const welcomeAnim = useRef(new Animated.Value(50)).current;
  const factAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const quoteAnim = useRef(new Animated.Value(0)).current;
  
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    // Header animation
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Welcome card animation
    Animated.spring(welcomeAnim, {
      toValue: 0,
      tension: 50,
      friction: 8,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // Fact card animation
    Animated.timing(factAnim, {
      toValue: 1,
      duration: 500,
      delay: 400,
      useNativeDriver: true,
    }).start();

    // Star rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }),
    ).start();

    // Cycle through facts
    const factInterval = setInterval(() => {
      setCurrentFactIndex(prev => (prev + 1) % FUN_FACTS.length);
    }, 5000);

    // Cycle through quotes
    const quoteInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(quoteAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(quoteAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      setCurrentQuoteIndex(prev => (prev + 1) % KIDS_QUOTES.length);
    }, 6000);

    // Initial quote animation
    Animated.timing(quoteAnim, {
      toValue: 1,
      duration: 500,
      delay: 800,
      useNativeDriver: true,
    }).start();

    return () => {
      clearInterval(factInterval);
      clearInterval(quoteInterval);
    };
  }, []);

  const handleFeaturePress = (screen: string) => {
    if (screen === 'CareerExplorerKids') {
      navigation.navigate('CareerExplorerKids');
    } else if (screen === 'InterestQuiz') {
      navigation.navigate('InterestQuiz');
    } else if (screen === 'GoalSetting') {
      navigation.navigate('GoalSetting');
    } else if (screen === 'SubjectGuide') {
      navigation.navigate('SubjectGuide');
    } else if (screen === 'CareerRoadmaps') {
      navigation.navigate('CareerRoadmaps');
    } else if (screen === 'StudyTips') {
      navigation.navigate('StudyTips');
    }
  };

  const starRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const currentFact = FUN_FACTS[currentFactIndex];
  const currentQuote = KIDS_QUOTES[currentQuoteIndex];

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
        {/* Animated Header */}
        <Animated.View
          style={[
            styles.headerContainer,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            },
          ]}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E8E', '#FFA07A']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.header}>
            <View style={styles.headerDecoration1} />
            <View style={styles.headerDecoration2} />
            <View style={styles.headerDecoration3} />
            
            <Animated.View
              style={[styles.headerEmoji, {transform: [{rotate: starRotate}]}]}>
              <Icon name="star" family="Ionicons" size={48} color="#FFFFFF" />
            </Animated.View>
            <Text style={styles.headerTitle}>Kids Zone</Text>
            <Text style={styles.headerSubtitle}>
              Your journey to success starts here!
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Welcome Card */}
        <Animated.View
          style={[
            styles.welcomeCard,
            {
              backgroundColor: colors.card,
              transform: [{translateY: welcomeAnim}],
            },
          ]}>
          <LinearGradient
            colors={['rgba(255,107,107,0.1)', 'transparent']}
            style={styles.welcomeGradient}
          />
          <View style={styles.welcomeContent}>
            <View style={styles.welcomeEmojiContainer}>
              <Icon name="hand-left-outline" family="Ionicons" size={32} color={colors.primary} />
            </View>
            <View style={styles.welcomeText}>
              <Text style={[styles.welcomeTitle, {color: colors.text}]}>
                Welcome, Future Star!
              </Text>
              <Text style={[styles.welcomeDesc, {color: colors.textSecondary}]}>
                Ready to explore careers and plan your future? Let's go!
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Animated Fun Fact */}
        <Animated.View
          style={[
            styles.factCard,
            {
              backgroundColor: isDark ? '#FFD93D20' : '#FFF9E0',
              borderColor: '#FFD93D50',
              opacity: factAnim,
            },
          ]}>
          <View style={styles.factBadge}>
            <Text style={styles.factBadgeText}>FUN FACT</Text>
          </View>
          <Icon name={currentFact.iconName} family="Ionicons" size={48} color={colors.primary} />
          <Text style={[styles.factText, {color: colors.text}]}>
            {currentFact.text}
          </Text>
          <View style={styles.factDots}>
            {FUN_FACTS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.factDot,
                  {
                    backgroundColor:
                      i === currentFactIndex ? '#FFD93D' : colors.border,
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Features Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <Icon name="color-palette-outline" family="Ionicons" size={22} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text}]}>Explore & Learn</Text>
            </View>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>6 Features</Text>
            </View>
          </View>

          <View style={styles.featuresGrid}>
            {KIDS_FEATURES.map((feature, index) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                index={index}
                onPress={() => handleFeaturePress(feature.screen)}
              />
            ))}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.md}}>
            <Icon name="analytics-outline" family="Ionicons" size={22} color={colors.primary} />
            <Text style={[styles.sectionTitle, {color: colors.text}]}>Your Progress</Text>
          </View>

          <View style={styles.statsGrid}>
            <StatCard
              iconName="flag-outline"
              value="0"
              label="Goals Set"
              index={0}
              colors={colors}
            />
            <StatCard
              iconName="bulb-outline"
              value="—"
              label="Quiz Result"
              index={1}
              colors={colors}
            />
            <StatCard
              iconName="star-outline"
              value="0"
              label="Badges"
              index={2}
              colors={colors}
            />
          </View>
        </View>

        {/* Motivation Section */}
        <Animated.View
          style={[
            styles.motivationCard,
            {
              backgroundColor: isDark ? '#27ae6020' : '#E8F8F5',
              opacity: quoteAnim,
              transform: [{
                scale: quoteAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1],
                }),
              }],
            },
          ]}>
          <LinearGradient
            colors={['rgba(39,174,96,0.15)', 'transparent']}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.quoteEmoji}>{currentQuote.emoji}</Text>
          <Text style={[styles.motivationQuote, {color: colors.text}]}>
            "{currentQuote.text}"
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
            <Text style={[styles.motivationAuthor, {color: colors.success}]}>
              — Believe in yourself!
            </Text>
            <Icon name="star" family="Ionicons" size={16} color={colors.success} />
          </View>
          {/* Quote dots */}
          <View style={styles.quoteDots}>
            {KIDS_QUOTES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.quoteDot,
                  { backgroundColor: i === currentQuoteIndex ? colors.success : colors.border },
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Age Selector */}
        <View style={styles.ageSection}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <Icon name="person-outline" family="Ionicons" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, {color: colors.text}]}>I am in...</Text>
          </View>
          <View style={styles.ageGrid}>
            {['Class 5-8', 'Class 9-10', 'Class 11-12', 'Gap Year'].map(age => (
              <TouchableOpacity
                key={age}
                style={[
                  styles.ageCard,
                  {
                    backgroundColor:
                      selectedAge === age ? colors.primary : colors.card,
                    borderColor:
                      selectedAge === age ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedAge(age)}>
                <Text
                  style={[
                    styles.ageText,
                    {color: selectedAge === age ? '#fff' : colors.text},
                  ]}>
                  {age}
                </Text>
                {selectedAge === age && (
                  <Icon name="checkmark" family="Ionicons" size={14} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom CTA */}
        <View style={styles.ctaContainer}>
          <LinearGradient
            colors={['#4ECDC4', '#45B7D1']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.ctaCard}>
            <View style={styles.ctaDecoration1} />
            <View style={styles.ctaDecoration2} />
            
            <Icon name="game-controller-outline" family="Ionicons" size={48} color="#FFFFFF" />
            <Text style={styles.ctaTitle}>Take the Career Quiz!</Text>
            <Text style={styles.ctaDesc}>
              Answer 10 fun questions and discover your perfect career match!
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('InterestQuiz')}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <Text style={styles.ctaButtonText}>Start Quiz</Text>
                <Icon name="rocket-outline" family="Ionicons" size={18} color="#4ECDC4" />
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={{height: SPACING.xxl * 2}} />
      </ScrollView>
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
    top: -40,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  headerDecoration2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerDecoration3: {
    position: 'absolute',
    top: 20,
    left: 50,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerEmoji: {
    fontSize: 60,
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  welcomeCard: {
    marginHorizontal: SPACING.md,
    marginTop: -25,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    elevation: 6,
    shadowColor: '#FF6B6B',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  welcomeGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeEmojiContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  welcomeEmoji: {
    fontSize: 36,
  },
  welcomeText: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  welcomeDesc: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 4,
    lineHeight: 20,
  },
  factCard: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  factBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#FFD93D',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  factBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#333',
  },
  factEmoji: {
    fontSize: 36,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  factText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    textAlign: 'center',
    lineHeight: 22,
  },
  factDots: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: 6,
  },
  factDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  sectionBadge: {
    backgroundColor: '#FF6B6B20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  sectionBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#FF6B6B',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  featureCardContainer: {
    width: (width - SPACING.md * 2 - SPACING.sm) / 2,
  },
  featureCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    minHeight: 160,
    overflow: 'hidden',
  },
  bubble1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  bubble2: {
    position: 'absolute',
    bottom: -10,
    left: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  featureEmoji: {
    fontSize: 44,
    marginBottom: SPACING.xs,
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  featureTagline: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  featureTaglineText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#fff',
  },
  statsSection: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  motivationCard: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    overflow: 'hidden',
  },
  motivationEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  quoteEmoji: {
    fontSize: 40,
    marginBottom: SPACING.xs,
  },
  motivationQuote: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SPACING.xs,
    lineHeight: 24,
  },
  motivationAuthor: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  quoteDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    gap: 4,
  },
  quoteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  ageSection: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  ageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  ageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 2,
    gap: SPACING.xs,
  },
  ageText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  ageCheck: {
    color: '#fff',
    fontWeight: 'bold',
  },
  ctaContainer: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  ctaCard: {
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    alignItems: 'center',
    overflow: 'hidden',
  },
  ctaDecoration1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  ctaDecoration2: {
    position: 'absolute',
    bottom: -20,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  ctaEmoji: {
    fontSize: 56,
    marginBottom: SPACING.sm,
  },
  ctaTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  ctaDesc: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  ctaButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#45B7D1',
  },
});

export default PremiumKidsHubScreen;
