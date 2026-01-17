import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../constants/design';
import {ANIMATION_SCALES, SPRING_CONFIGS} from '../constants/ui';
import {useTheme} from '../contexts/ThemeContext';
import {Icon} from '../components/icons';

const {width} = Dimensions.get('window');

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Study Tips Interfaces
interface StudyTip {
  id: string;
  title: string;
  iconName: string;
  description: string;
  steps: string[];
  funFact?: string;
}

interface StudyCategory {
  id: string;
  title: string;
  iconName: string;
  color: string;
  gradient: string[];
  tips: StudyTip[];
}

// Study Tips Data
const STUDY_CATEGORIES: StudyCategory[] = [
  {
    id: 'time-management',
    title: 'Time Management',
    iconName: 'time-outline',
    color: '#FF6B6B',
    gradient: ['#FF6B6B', '#FF8E8E'],
    tips: [
      {id: 'pomodoro', title: 'Pomodoro Technique', iconName: 'timer-outline', description: 'Study in short bursts with breaks!', steps: ['Study for 25 minutes straight', 'Take a 5-minute break', 'After 4 sessions, take a 15-30 minute break', 'Repeat! This keeps your brain fresh'], funFact: 'Invented by Francesco Cirillo using a tomato-shaped kitchen timer!'},
      {id: 'schedule', title: 'Daily Study Schedule', iconName: 'calendar-outline', description: 'Plan your day like a champion!', steps: ['Wake up at the same time daily', "Study hardest subjects when you're most alert", 'Take breaks for Namaz/prayers', 'Review what you learned before sleeping']},
      {id: 'no-procrastination', title: 'Beat Procrastination', iconName: 'flash-outline', description: 'Stop saying "I\'ll do it later"!', steps: ['Start with just 2 minutes of studying', 'Put your phone in another room', 'Tell yourself: "Just this one page"', 'Reward yourself after completing tasks'], funFact: 'Your brain releases dopamine when you complete tasks! Feel good by doing work!'},
    ],
  },
  {
    id: 'memory-tricks',
    title: 'Memory Tricks',
    iconName: 'bulb-outline',
    color: '#4ECDC4',
    gradient: ['#4ECDC4', '#6EE5DD'],
    tips: [
      {id: 'mnemonics', title: 'Memory Tricks (Mnemonics)', iconName: 'text-outline', description: 'Remember things with fun tricks!', steps: ['Make sentences: "My Very Educated Mother Just Served Us Nachos" = Planets', 'Create rhymes: "In 1492, Columbus sailed the ocean blue"', 'Use mental pictures for vocabulary', 'Link new info to things you already know']},
      {id: 'spaced-repetition', title: 'Spaced Repetition', iconName: 'repeat-outline', description: 'Review at the right times!', steps: ['Review new material after 1 day', 'Then after 3 days', 'Then after 1 week', 'Finally after 2 weeks'], funFact: 'This is how top students memorize Quran and textbooks!'},
      {id: 'mind-maps', title: 'Mind Maps', iconName: 'git-network-outline', description: 'Draw your notes like a spider web!', steps: ['Write main topic in the center', 'Draw branches for subtopics', 'Use colors and pictures', 'Connect related ideas with lines']},
      {id: 'teach-others', title: 'Teach Someone Else', iconName: 'people-outline', description: 'The best way to learn is to teach!', steps: ['Explain the topic to your sibling/friend', "Pretend you're the teacher", 'Answer their questions', "If you can't explain it simply, review again!"], funFact: 'Einstein said: "If you can\'t explain it simply, you don\'t understand it well enough!"'},
    ],
  },
  {
    id: 'exam-prep',
    title: 'Exam Preparation',
    iconName: 'document-text-outline',
    color: '#45B7D1',
    gradient: ['#45B7D1', '#67CFE6'],
    tips: [
      {id: 'past-papers', title: 'Solve Past Papers', iconName: 'documents-outline', description: 'Practice with real exam questions!', steps: ['Get past 5-10 years papers', 'Time yourself like real exam', 'Check answers honestly', 'Focus on repeated questions - they appear again!'], funFact: 'Board exams often repeat 30-40% questions from past papers!'},
      {id: 'active-recall', title: 'Active Recall', iconName: 'chatbubble-ellipses-outline', description: 'Test yourself instead of just reading!', steps: ['Close your book after reading', 'Write down everything you remember', 'Check what you missed', 'Focus on what you forgot']},
      {id: 'exam-day', title: 'Exam Day Tips', iconName: 'ribbon-outline', description: 'Be prepared for the big day!', steps: ['Sleep 7-8 hours the night before', 'Eat a good breakfast (eggs, paratha, chai)', 'Reach venue 30 mins early', 'Read all questions first before answering', 'Start with questions you know best']},
    ],
  },
  {
    id: 'healthy-habits',
    title: 'Healthy Habits',
    iconName: 'sunny-outline',
    color: '#96CEB4',
    gradient: ['#96CEB4', '#B2DEC8'],
    tips: [
      {id: 'sleep', title: 'Power of Sleep', iconName: 'moon-outline', description: 'Your brain needs rest to learn!', steps: ['Sleep 7-9 hours every night', 'Go to bed at same time daily', 'No phones 1 hour before bed', 'Your brain processes learning during sleep!'], funFact: 'Staying up all night before exams actually HURTS your performance!'},
      {id: 'exercise', title: 'Exercise & Sports', iconName: 'fitness-outline', description: 'Move your body, boost your brain!', steps: ['Play cricket, football, or badminton daily', 'Even a 20-minute walk helps', 'Do stretches between study sessions', 'Exercise increases blood flow to brain!']},
      {id: 'brain-food', title: 'Brain Food', iconName: 'nutrition-outline', description: 'Eat foods that make you smarter!', steps: ['Eggs - best for memory', 'Almonds & walnuts - brain boosters', 'Bananas - energy for exams', 'Water - stay hydrated always!', 'Green tea - better than too much chai'], funFact: 'Your brain is 75% water! Dehydration makes you forget things!'},
      {id: 'breaks', title: 'Take Good Breaks', iconName: 'cafe-outline', description: 'Rest is part of studying!', steps: ['Take 5-10 min break every hour', 'Do NOT use phone during breaks (it tires brain more)', 'Walk around, drink water, do stretches', 'Chat with family briefly']},
    ],
  },
  {
    id: 'focus-tips',
    title: 'Stay Focused',
    iconName: 'eye-outline',
    color: '#DDA0DD',
    gradient: ['#DDA0DD', '#E9C0E9'],
    tips: [
      {id: 'study-space', title: 'Perfect Study Space', iconName: 'desktop-outline', description: 'Create your study corner!', steps: ['Find a quiet spot away from TV', 'Good lighting - protect your eyes', 'Keep only study materials on desk', 'Make it YOUR dedicated study zone']},
      {id: 'phone-control', title: 'Control Your Phone', iconName: 'phone-portrait-outline', description: "Don't let phone distract you!", steps: ['Put phone in different room', 'Use "Do Not Disturb" mode', "Tell friends you're studying", 'Check messages only during breaks'], funFact: 'It takes 23 minutes to refocus after a phone notification!'},
      {id: 'one-thing', title: 'One Subject at a Time', iconName: 'apps-outline', description: 'Multitasking is a myth!', steps: ['Focus on ONE subject per session', 'Finish chapter before switching', 'Your brain works best on one thing', 'Quality > Quantity']},
    ],
  },
  {
    id: 'smart-notes',
    title: 'Smart Note-Taking',
    iconName: 'journal-outline',
    color: '#FFD93D',
    gradient: ['#FFD93D', '#FFE56D'],
    tips: [
      {id: 'cornell-method', title: 'Cornell Note Method', iconName: 'clipboard-outline', description: 'Organize notes like a pro!', steps: ['Divide page into 3 sections', 'Right side: Main notes during class', 'Left side: Key questions/keywords', 'Bottom: Summary after class']},
      {id: 'colors', title: 'Use Colors', iconName: 'color-palette-outline', description: 'Make notes colorful and memorable!', steps: ['Use different colors for headings', 'Highlight key definitions', 'Draw diagrams with colors', 'Your brain remembers colors better!']},
      {id: 'abbreviations', title: 'Quick Abbreviations', iconName: 'pencil-outline', description: 'Write faster, study smarter!', steps: ['b/c = because, w/ = with', 'Create your own shortcuts', 'Use arrows for "leads to"', 'Use symbols for "therefore"']},
    ],
  },
];

// Fun encouragement messages
const ENCOURAGEMENTS = [
  {iconName: 'star-outline', text: 'You can do this!'},
  {iconName: 'flash-outline', text: 'Pakistan ka mustaqbil aap hain!'},
  {iconName: 'rocket-outline', text: 'Dream big, study hard!'},
  {iconName: 'book-outline', text: 'Every page you read is progress!'},
  {iconName: 'ribbon-outline', text: 'Focus today, succeed tomorrow!'},
  {iconName: 'moon-outline', text: 'Mehnat ka phal meetha hota hai!'},
];

// Animated Category Card
const CategoryCard = ({
  category,
  index,
  onPress,
}: {
  category: StudyCategory;
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
        styles.categoryCardContainer,
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
          colors={category.gradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.categoryCard}>
          <View style={styles.categoryBubble1} />
          <View style={styles.categoryBubble2} />
          <Icon name={category.iconName} family="Ionicons" size={36} color="#FFFFFF" />
          <Text style={styles.categoryTitle}>{category.title}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryCount}>{category.tips.length} tips</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Expandable Tip Card
const TipCard = ({
  tip,
  index,
  categoryColor,
  expanded,
  onPress,
  colors,
}: {
  tip: StudyTip;
  index: number;
  categoryColor: string;
  expanded: boolean;
  onPress: () => void;
  colors: any;
}) => {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [expanded]);

  const chevronRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const handlePress = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onPress();
  };

  return (
    <Animated.View
      style={[
        styles.tipCard,
        {
          backgroundColor: colors.card,
          transform: [{translateY: slideAnim}],
          opacity: fadeAnim,
        },
      ]}>
      <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
        <View style={styles.tipHeader}>
          <View style={[styles.tipIconContainer, {backgroundColor: categoryColor + '20'}]}>
            <Icon name={tip.iconName} family="Ionicons" size={24} color={categoryColor} />
          </View>
          <View style={styles.tipHeaderText}>
            <Text style={[styles.tipTitle, {color: colors.text}]}>{tip.title}</Text>
            <Text style={[styles.tipDescription, {color: colors.textSecondary}]}>
              {tip.description}
            </Text>
          </View>
          <Animated.View style={{transform: [{rotate: chevronRotate}]}}>
            <Icon name={expanded ? 'chevron-up' : 'chevron-down'} family="Ionicons" size={20} color={categoryColor} />
          </Animated.View>
        </View>

        {expanded && (
          <View style={[styles.tipContent, {borderTopColor: colors.border}]}>
            {/* Steps */}
            <View style={styles.stepsContainer}>
              {tip.steps.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <LinearGradient
                    colors={[categoryColor, categoryColor + 'CC']}
                    style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{i + 1}</Text>
                  </LinearGradient>
                  <Text style={[styles.stepText, {color: colors.text}]}>{step}</Text>
                </View>
              ))}
            </View>

            {/* Fun Fact */}
            {tip.funFact && (
              <View style={[styles.funFactBox, {backgroundColor: '#FFF9E0'}]}>
                <View style={styles.funFactBadge}>
                  <Text style={styles.funFactBadgeText}>FUN FACT</Text>
                </View>
                <Text style={styles.funFactText}>{tip.funFact}</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const PremiumStudyTipsScreen = () => {
  const {colors, isDark} = useTheme();
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState<StudyCategory | null>(null);
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [encouragementIndex] = useState(Math.floor(Math.random() * ENCOURAGEMENTS.length));

  const headerAnim = useRef(new Animated.Value(0)).current;
  const motivationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(motivationAnim, {
        toValue: 1,
        duration: 500,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const selectCategory = (category: StudyCategory) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedCategory(category);
    setExpandedTip(null);
  };

  const goBack = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedCategory(null);
    setExpandedTip(null);
  };

  const randomEncouragement = ENCOURAGEMENTS[encouragementIndex];

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
            colors={['#3498db', '#2980b9', '#1565C0']}
            style={styles.header}>
            <View style={styles.headerDecoration1} />
            <View style={styles.headerDecoration2} />
            <Icon name="book" family="Ionicons" size={36} color="#FFFFFF" />
            <Text style={styles.headerTitle}>Study Tips</Text>
            <Text style={styles.headerSubtitle}>
              Learn how to study smarter, not harder!
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Motivation Card */}
        <Animated.View
          style={[
            styles.motivationCard,
            {
              backgroundColor: colors.card,
              opacity: motivationAnim,
              transform: [
                {
                  scale: motivationAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            },
          ]}>
          <LinearGradient
            colors={[colors.primary + '15', 'transparent']}
            style={StyleSheet.absoluteFillObject}
          />
          <Icon name={randomEncouragement.iconName} family="Ionicons" size={28} color={colors.primary} />
          <Text style={[styles.motivationText, {color: colors.text}]}>
            {randomEncouragement.text}
          </Text>
        </Animated.View>

        {!selectedCategory ? (
          // Category Selection View
          <View style={styles.section}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>Choose a Topic</Text>
              <Icon name="arrow-down" family="Ionicons" size={18} color={colors.primary} />
            </View>

            <View style={styles.categoriesGrid}>
              {STUDY_CATEGORIES.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  index={index}
                  onPress={() => selectCategory(category)}
                />
              ))}
            </View>

            {/* Quick Tips */}
            <View style={[styles.quickTipsCard, {backgroundColor: colors.card}]}>
              <LinearGradient
                colors={['rgba(52,152,219,0.1)', 'transparent']}
                style={StyleSheet.absoluteFillObject}
              />
              <Text style={[styles.quickTipsTitle, {color: colors.text}]}>
                <Icon name="flash-outline" family="Ionicons" size={18} color={colors.primary} /> Quick Study Tips
              </Text>
              {[
                {num: 1, text: 'Study in daylight - better for eyes & focus'},
                {num: 2, text: 'Read out loud - helps memory by 50%!'},
                {num: 3, text: 'Drink water, not too much chai'},
                {num: 4, text: 'Take notes by hand, not typing'},
                {num: 5, text: 'Teach concepts to others to master them'},
              ].map((item, i) => (
                <View key={i} style={styles.quickTipItem}>
                  <View style={[styles.quickTipNumber, {backgroundColor: colors.primary}]}>
                    <Text style={styles.quickTipNumberText}>{item.num}</Text>
                  </View>
                  <Text style={[styles.quickTipText, {color: colors.textSecondary}]}>
                    {item.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          // Tips Detail View
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.backButton, {backgroundColor: colors.card}]}
              onPress={goBack}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <Icon name="arrow-back" family="Ionicons" size={18} color={colors.primary} />
                <Text style={[styles.backButtonText, {color: colors.primary}]}>Back to Topics</Text>
              </View>
            </TouchableOpacity>

            <LinearGradient
              colors={selectedCategory.gradient}
              style={styles.categoryHeader}>
              <View style={styles.categoryHeaderDecor1} />
              <View style={styles.categoryHeaderDecor2} />
              <Icon name={selectedCategory.iconName} family="Ionicons" size={40} color="#FFFFFF" />
              <Text style={styles.categoryHeaderTitle}>{selectedCategory.title}</Text>
              <View style={styles.categoryHeaderBadge}>
                <Text style={styles.categoryHeaderBadgeText}>
                  {selectedCategory.tips.length} tips
                </Text>
              </View>
            </LinearGradient>

            {selectedCategory.tips.map((tip, index) => (
              <TipCard
                key={tip.id}
                tip={tip}
                index={index}
                categoryColor={selectedCategory.color}
                expanded={expandedTip === tip.id}
                onPress={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
                colors={colors}
              />
            ))}
          </View>
        )}

        {/* Bottom Motivation */}
        <View style={[styles.bottomCard, {backgroundColor: isDark ? '#27ae6020' : '#E8F8F5'}]}>
          <Text style={styles.bottomEmoji}>🇵🇰</Text>
          <Text style={[styles.bottomText, {color: colors.text}]}>
            "The ink of a scholar is more sacred than the blood of a martyr."
          </Text>
          <Text style={[styles.bottomAuthor, {color: colors.success}]}>
            - Prophet Muhammad (PBUH)
          </Text>
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
  headerEmoji: {
    fontSize: 56,
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
    textAlign: 'center',
  },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.md,
    marginTop: -20,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  motivationEmoji: {
    fontSize: 32,
    marginRight: SPACING.sm,
  },
  motivationText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  section: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  categoryCardContainer: {
    width: (width - SPACING.md * 2 - SPACING.sm) / 2,
  },
  categoryCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    minHeight: 140,
    overflow: 'hidden',
  },
  categoryBubble1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  categoryBubble2: {
    position: 'absolute',
    bottom: -10,
    left: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  categoryEmoji: {
    fontSize: 44,
    marginBottom: SPACING.xs,
  },
  categoryTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  categoryCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  quickTipsCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  quickTipsTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  quickTipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  quickTipNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  quickTipNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quickTipText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  // Detail View
  backButton: {
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    alignSelf: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  categoryHeader: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  categoryHeaderDecor1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  categoryHeaderDecor2: {
    position: 'absolute',
    bottom: -20,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  categoryHeaderEmoji: {
    fontSize: 60,
    marginBottom: SPACING.sm,
  },
  categoryHeaderTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: SPACING.sm,
  },
  categoryHeaderBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  categoryHeaderBadgeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#fff',
  },
  tipCard: {
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  tipIconContainer: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  tipEmoji: {
    fontSize: 28,
  },
  tipHeaderText: {
    flex: 1,
  },
  tipTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  tipDescription: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  chevron: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipContent: {
    padding: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
  },
  stepsContainer: {
    marginTop: SPACING.xs,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  stepNumberText: {
    fontWeight: '700',
    fontSize: 12,
    color: '#fff',
  },
  stepText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 22,
  },
  funFactBox: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  funFactBadge: {
    position: 'absolute',
    top: -10,
    left: SPACING.md,
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
    color: '#666',
    marginTop: SPACING.xs,
    lineHeight: 20,
  },
  bottomCard: {
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  bottomEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  bottomText: {
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  bottomAuthor: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: SPACING.sm,
    fontWeight: '500',
  },
});

export default PremiumStudyTipsScreen;
