/**
 * FAQScreen - Frequently Asked Questions
 * Dedicated FAQ page for common student questions about the app
 * Enhanced with premium animations
 */

import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  Easing,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../contexts/ThemeContext';
import {Icon} from '../components/icons';
import {TYPOGRAPHY, SPACING, RADIUS} from '../constants/design';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
}

const FAQ_CATEGORIES: FAQCategory[] = [
  {id: 'general', title: 'General', icon: 'help-circle-outline', color: '#4573DF'},
  {id: 'merit', title: 'Merit Calculator', icon: 'calculator-outline', color: '#10B981'},
  {id: 'universities', title: 'Universities', icon: 'school-outline', color: '#F59E0B'},
  {id: 'scholarships', title: 'Scholarships', icon: 'wallet-outline', color: '#EF4444'},
  {id: 'account', title: 'Account & Data', icon: 'person-outline', color: '#8B5CF6'},
];

const FAQ_ITEMS: FAQItem[] = [
  // General
  {
    id: '1',
    category: 'general',
    question: 'What is PakUni?',
    answer: 'PakUni is a comprehensive mobile app designed to help Pakistani students navigate their higher education journey. It provides information about universities, merit calculators, scholarships, entry tests, and career guidance all in one place.',
  },
  {
    id: '2',
    category: 'general',
    question: 'Is PakUni free to use?',
    answer: 'Yes! PakUni is completely free to use. All features including merit calculation, university search, scholarship information, and career guidance are available at no cost.',
  },
  {
    id: '3',
    category: 'general',
    question: 'How often is the data updated?',
    answer: 'We regularly update our database with the latest information from official university websites and HEC. Merit cutoffs are updated after each admission cycle, and scholarship deadlines are refreshed regularly.',
  },
  // Merit Calculator
  {
    id: '4',
    category: 'merit',
    question: 'How does the merit calculator work?',
    answer: 'The merit calculator uses official university formulas to calculate your aggregate/merit score. You enter your Matric percentage, FSc/Intermediate percentage, and entry test score. The calculator applies the specific weightage used by each university.',
  },
  {
    id: '5',
    category: 'merit',
    question: 'Which university formulas are available?',
    answer: 'We support merit formulas for major universities including NUST, FAST, COMSATS, UET, GIKI, Punjab University, LUMS, and many more. Each formula follows the official weightage announced by the respective university.',
  },
  {
    id: '6',
    category: 'merit',
    question: 'What is the Hafiz-e-Quran bonus?',
    answer: 'Some universities like FAST offer a 20-mark bonus for Hafiz-e-Quran students. This is added to your aggregate score. Make sure to enable this option in the calculator if applicable.',
  },
  {
    id: '7',
    category: 'merit',
    question: 'Are the merit cutoffs accurate?',
    answer: 'Merit cutoffs shown are based on previous admission cycles. Actual cutoffs may vary each year depending on the applicant pool. Use them as a reference, not a guarantee of admission.',
  },
  // Universities
  {
    id: '8',
    category: 'universities',
    question: 'How are universities ranked?',
    answer: 'Universities are ranked based on HEC (Higher Education Commission) Pakistan categories. W4 is the general category, and rankings are determined by factors like research output, faculty qualifications, facilities, and accreditation status.',
  },
  {
    id: '9',
    category: 'universities',
    question: 'Can I compare universities?',
    answer: 'Yes! Use the Compare tool to compare up to 3 universities side by side. You can compare rankings, fee structures, programs offered, facilities, and more to make an informed decision.',
  },
  {
    id: '10',
    category: 'universities',
    question: 'How do I find universities by location?',
    answer: 'Use the filter options on the Universities page. You can filter by province, city, university type (public/private), and specific programs offered.',
  },
  // Scholarships
  {
    id: '11',
    category: 'scholarships',
    question: 'How do I find scholarships I\'m eligible for?',
    answer: 'Browse the Scholarships section and use filters to find opportunities matching your profile. Filter by merit-based, need-based, university-specific, or government scholarships.',
  },
  {
    id: '12',
    category: 'scholarships',
    question: 'Are scholarship deadlines updated regularly?',
    answer: 'Yes, we update scholarship information regularly. However, always verify deadlines from official sources before applying, as dates may change.',
  },
  {
    id: '13',
    category: 'scholarships',
    question: 'Can I save scholarships to apply later?',
    answer: 'Absolutely! Tap the heart icon on any scholarship to add it to your Favorites. You can access all saved scholarships from Settings > My Favorites.',
  },
  // Account & Data
  {
    id: '14',
    category: 'account',
    question: 'Is my data secure?',
    answer: 'Yes, your data is securely stored and encrypted. We use industry-standard security practices. Your personal information is never shared with third parties without your consent.',
  },
  {
    id: '15',
    category: 'account',
    question: 'Can I use PakUni without an account?',
    answer: 'Yes, you can use most features as a guest. However, creating an account allows you to save favorites, track progress, sync across devices, and receive personalized recommendations.',
  },
  {
    id: '16',
    category: 'account',
    question: 'How do I delete my account?',
    answer: 'You can delete your account from Settings > Account > Delete Account. This will permanently remove all your data from our servers. This action cannot be undone.',
  },
];

// Animated FAQ Item Component
const AnimatedFAQItem: React.FC<{
  item: FAQItem;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  getCategoryColor: (categoryId: string) => string;
  colors: any;
}> = ({item, index, isExpanded, onToggle, getCategoryColor, colors}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  useEffect(() => {
    const delay = index * 50;
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
    ]).start();
  }, [index]);

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isExpanded]);

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

  const rotateZ = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{translateY: slideAnim}, {scale: scaleAnim}],
      }}>
      <TouchableOpacity
        style={[styles.faqItem, {backgroundColor: colors.card}]}
        onPress={onToggle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}>
        <View style={styles.faqHeader}>
          <View style={[styles.faqIcon, {backgroundColor: getCategoryColor(item.category) + '20'}]}>
            <Icon name="help" family="Ionicons" size={16} color={getCategoryColor(item.category)} />
          </View>
          <Text style={[styles.faqQuestion, {color: colors.text}]}>{item.question}</Text>
          <Animated.View style={{transform: [{rotate: rotateZ}]}}>
            <Icon 
              name="chevron-down" 
              family="Ionicons" 
              size={20} 
              color={colors.textSecondary} 
            />
          </Animated.View>
        </View>
        {isExpanded && (
          <View style={[styles.faqAnswer, {borderTopColor: colors.border}]}>
            <Text style={[styles.answerText, {color: colors.textSecondary}]}>
              {item.answer}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const FAQScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Animation refs
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(-30)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const questionMarkAnim = useRef(new Animated.Value(0)).current;

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
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Question mark bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(questionMarkAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(questionMarkAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const floatTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const questionMarkScale = questionMarkAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1],
  });

  const toggleExpand = (itemId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFAQs = selectedCategory === 'all' 
    ? FAQ_ITEMS 
    : FAQ_ITEMS.filter(item => item.category === selectedCategory);

  const getCategoryColor = (categoryId: string) => {
    return FAQ_CATEGORIES.find(c => c.id === categoryId)?.color || '#4573DF';
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['top']}>
      {/* Floating Decorations */}
      <Animated.View
        style={[
          styles.floatingQuestion1,
          {
            opacity: 0.06,
            transform: [{translateY: floatTranslateY}, {scale: questionMarkScale}],
          },
        ]}>
        <Icon name="help-circle" family="Ionicons" size={80} color={colors.primary} />
      </Animated.View>
      <Animated.View
        style={[
          styles.floatingQuestion2,
          {
            opacity: 0.04,
          },
        ]}>
        <Icon name="help" family="Ionicons" size={50} color={colors.primary} />
      </Animated.View>

      {/* Header */}
      <Animated.View
        style={{
          opacity: headerFadeAnim,
          transform: [{translateY: headerSlideAnim}],
        }}>
        <LinearGradient
          colors={['#4573DF', '#3660C9']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Help & FAQ</Text>
            <Text style={styles.headerSubtitle}>Find answers to common questions</Text>
          </View>
          <Animated.View 
            style={[
              styles.headerIconContainer,
              {transform: [{scale: questionMarkScale}]},
            ]}>
            <Icon name="help-circle" family="Ionicons" size={28} color="rgba(255,255,255,0.3)" />
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}>
          <TouchableOpacity
            style={[
              styles.categoryChip,
              {backgroundColor: selectedCategory === 'all' ? colors.primary : colors.card},
            ]}
            onPress={() => setSelectedCategory('all')}>
            <Text style={[
              styles.categoryText,
              {color: selectedCategory === 'all' ? '#FFFFFF' : colors.text},
            ]}>
              All
            </Text>
          </TouchableOpacity>
          {FAQ_CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                {backgroundColor: selectedCategory === category.id ? category.color : colors.card},
              ]}
              onPress={() => setSelectedCategory(category.id)}>
              <Icon 
                name={category.icon} 
                family="Ionicons" 
                size={16} 
                color={selectedCategory === category.id ? '#FFFFFF' : category.color} 
              />
              <Text style={[
                styles.categoryText,
                {color: selectedCategory === category.id ? '#FFFFFF' : colors.text},
              ]}>
                {category.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* FAQ List */}
      <FlatList
        data={filteredFAQs}
        keyExtractor={item => item.id}
        renderItem={({item, index}) => (
          <AnimatedFAQItem
            item={item}
            index={index}
            isExpanded={expandedItems.has(item.id)}
            onToggle={() => toggleExpand(item.id)}
            getCategoryColor={getCategoryColor}
            colors={colors}
          />
        )}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={
          <>
            {/* Contact Section */}
            <Animated.View 
              style={[
                styles.contactCard, 
                {backgroundColor: colors.card},
                {transform: [{translateY: floatTranslateY}]},
              ]}>
              <View style={[styles.contactIcon, {backgroundColor: '#4573DF20'}]}>
                <Icon name="chatbubbles" family="Ionicons" size={24} color="#4573DF" />
              </View>
              <Text style={[styles.contactTitle, {color: colors.text}]}>Still have questions?</Text>
              <Text style={[styles.contactText, {color: colors.textSecondary}]}>
                Can't find what you're looking for? Contact our support team.
              </Text>
              <TouchableOpacity
                style={[styles.contactButton, {backgroundColor: colors.primary}]}
                onPress={() => navigation.navigate('ContactSupport' as never)}>
                <Icon name="mail" family="Ionicons" size={18} color="#FFFFFF" />
                <Text style={styles.contactButtonText}>Contact Support</Text>
              </TouchableOpacity>
            </Animated.View>
            <View style={{height: 40}} />
          </>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Floating decorations
  floatingQuestion1: {
    position: 'absolute',
    top: 150,
    right: -25,
    zIndex: 0,
  },
  floatingQuestion2: {
    position: 'absolute',
    top: 350,
    left: -15,
    zIndex: 0,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginRight: 8,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  faqItem: {
    borderRadius: RADIUS.lg,
    marginBottom: 12,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  faqIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weight.semibold,
    lineHeight: 22,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    marginTop: 4,
    marginHorizontal: 16,
    borderTopWidth: 1,
  },
  answerText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 22,
  },
  contactCard: {
    borderRadius: RADIUS.lg,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  contactIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: 8,
  },
  contactText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    gap: 8,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

export default FAQScreen;
