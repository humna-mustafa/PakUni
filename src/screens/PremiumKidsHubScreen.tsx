/**
 * PremiumKidsHubScreen - Kids Zone hub with career exploration features
 * Thin composition using extracted components and hook
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../constants/design';
import {Icon} from '../components/icons';
import {FeatureCard, StatCard, KIDS_FEATURES, FUN_FACTS, KIDS_QUOTES} from '../components/kids-hub';
import {useKidsHubScreen} from '../hooks/useKidsHubScreen';

const PremiumKidsHubScreen = () => {
  const {
    navigation, colors, isDark,
    selectedAge, setSelectedAge,
    currentFactIndex, currentQuoteIndex,
    currentFact, currentQuote,
    headerAnim, welcomeAnim, factAnim, quoteAnim, starRotate,
    handleFeaturePress,
  } = useKidsHubScreen();

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['top']}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={{opacity: headerAnim, transform: [{translateY: headerAnim.interpolate({inputRange: [0, 1], outputRange: [-30, 0]})}]}}>
          <LinearGradient colors={['#FF6B6B', '#FF8E8E', '#FFA07A']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.header}>
            <View style={styles.headerDecoration1} />
            <View style={styles.headerDecoration2} />
            <View style={styles.headerDecoration3} />
            <Animated.View style={[styles.headerEmoji, {transform: [{rotate: starRotate}]}]}>
              <Icon name="star" family="Ionicons" size={48} color="#FFFFFF" />
            </Animated.View>
            <Text style={styles.headerTitle}>Kids Zone</Text>
            <Text style={styles.headerSubtitle}>Your journey to success starts here!</Text>
          </LinearGradient>
        </Animated.View>

        {/* Welcome Card */}
        <Animated.View style={[styles.welcomeCard, {backgroundColor: colors.card, transform: [{translateY: welcomeAnim}]}]}>
          <LinearGradient colors={['rgba(255,107,107,0.1)', 'transparent']} style={StyleSheet.absoluteFillObject} />
          <View style={styles.welcomeContent}>
            <View style={styles.welcomeEmojiContainer}>
              <Icon name="hand-left-outline" family="Ionicons" size={32} color={colors.primary} />
            </View>
            <View style={{flex: 1}}>
              <Text style={[styles.welcomeTitle, {color: colors.text}]}>Welcome, Future Star!</Text>
              <Text style={[styles.welcomeDesc, {color: colors.textSecondary}]}>
                Ready to explore careers and plan your future? Let's go!
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Fun Fact */}
        <Animated.View style={[styles.factCard, {backgroundColor: isDark ? '#FFD93D20' : '#FFF9E0', borderColor: '#FFD93D50', opacity: factAnim}]}>
          <View style={styles.factBadge}><Text style={styles.factBadgeText}>FUN FACT</Text></View>
          <Icon name={currentFact.iconName} family="Ionicons" size={48} color={colors.primary} />
          <Text style={[styles.factText, {color: colors.text}]}>{currentFact.text}</Text>
          <View style={styles.factDots}>
            {FUN_FACTS.map((_, i) => (
              <View key={i} style={[styles.dot, {backgroundColor: i === currentFactIndex ? '#FFD93D' : colors.border}]} />
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
            <View style={styles.sectionBadge}><Text style={styles.sectionBadgeText}>6 Features</Text></View>
          </View>
          <View style={styles.featuresGrid}>
            {KIDS_FEATURES.map((feature, index) => (
              <FeatureCard key={feature.id} feature={feature} index={index} onPress={() => handleFeaturePress(feature.screen)} />
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
            <StatCard iconName="flag-outline" value="0" label="Goals Set" index={0} colors={colors} />
            <StatCard iconName="bulb-outline" value="—" label="Quiz Result" index={1} colors={colors} />
            <StatCard iconName="star-outline" value="0" label="Badges" index={2} colors={colors} />
          </View>
        </View>

        {/* Motivation */}
        <Animated.View style={[styles.motivationCard, {backgroundColor: isDark ? '#27ae6020' : '#E8F8F5', opacity: quoteAnim, transform: [{scale: quoteAnim.interpolate({inputRange: [0, 1], outputRange: [0.95, 1]})}]}]}>
          <LinearGradient colors={['rgba(39,174,96,0.15)', 'transparent']} style={StyleSheet.absoluteFillObject} />
          <Text style={styles.quoteEmoji}>{currentQuote.emoji}</Text>
          <Text style={[styles.motivationQuote, {color: colors.text}]}>"{currentQuote.text}"</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
            <Text style={[styles.motivationAuthor, {color: colors.success}]}>— Believe in yourself!</Text>
            <Icon name="star" family="Ionicons" size={16} color={colors.success} />
          </View>
          <View style={styles.quoteDots}>
            {KIDS_QUOTES.map((_, i) => (
              <View key={i} style={[styles.dot, {backgroundColor: i === currentQuoteIndex ? colors.success : colors.border}]} />
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
                style={[styles.ageCard, {backgroundColor: selectedAge === age ? colors.primary : colors.card, borderColor: selectedAge === age ? colors.primary : colors.border}]}
                onPress={() => setSelectedAge(age)}>
                <Text style={[styles.ageText, {color: selectedAge === age ? '#fff' : colors.text}]}>{age}</Text>
                {selectedAge === age && <Icon name="checkmark" family="Ionicons" size={14} color="#FFFFFF" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom CTA */}
        <View style={styles.ctaContainer}>
          <LinearGradient colors={['#4ECDC4', '#45B7D1']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.ctaCard}>
            <View style={styles.ctaDecoration1} />
            <View style={styles.ctaDecoration2} />
            <Icon name="game-controller-outline" family="Ionicons" size={48} color="#FFFFFF" />
            <Text style={styles.ctaTitle}>Take the Career Quiz!</Text>
            <Text style={styles.ctaDesc}>Answer 10 fun questions and discover your perfect career match!</Text>
            <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('InterestQuiz')}>
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
  container: {flex: 1},
  backBtn: {position: 'absolute', top: SPACING.md, left: SPACING.md, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', zIndex: 10},
  header: {alignItems: 'center', paddingTop: SPACING.xl, paddingBottom: SPACING.xxl, borderBottomLeftRadius: RADIUS.xxxl, borderBottomRightRadius: RADIUS.xxxl, overflow: 'hidden'},
  headerDecoration1: {position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.12)'},
  headerDecoration2: {position: 'absolute', bottom: -30, left: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)'},
  headerDecoration3: {position: 'absolute', top: 20, left: 50, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)'},
  headerEmoji: {marginBottom: SPACING.xs},
  headerTitle: {fontSize: 36, fontWeight: TYPOGRAPHY.weight.heavy, color: '#fff', marginBottom: 4},
  headerSubtitle: {fontSize: TYPOGRAPHY.sizes.md, color: 'rgba(255,255,255,0.9)', fontWeight: TYPOGRAPHY.weight.medium},
  welcomeCard: {marginHorizontal: SPACING.md, marginTop: -25, borderRadius: RADIUS.xl, padding: SPACING.md, elevation: 6, shadowColor: '#FF6B6B', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8, overflow: 'hidden'},
  welcomeContent: {flexDirection: 'row', alignItems: 'center'},
  welcomeEmojiContainer: {width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFE5E5', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md},
  welcomeTitle: {fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weight.bold},
  welcomeDesc: {fontSize: TYPOGRAPHY.sizes.sm, marginTop: 4, lineHeight: 20},
  factCard: {marginHorizontal: SPACING.md, marginTop: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, alignItems: 'center'},
  factBadge: {position: 'absolute', top: -10, backgroundColor: '#FFD93D', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.sm},
  factBadgeText: {fontSize: 10, fontWeight: TYPOGRAPHY.weight.bold, color: '#333'},
  factText: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.semibold, textAlign: 'center', lineHeight: 22},
  factDots: {flexDirection: 'row', marginTop: SPACING.sm, gap: 6},
  dot: {width: 6, height: 6, borderRadius: 3},
  section: {paddingHorizontal: SPACING.md, marginTop: SPACING.lg},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md},
  sectionTitle: {fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weight.bold},
  sectionBadge: {backgroundColor: '#FF6B6B20', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full},
  sectionBadgeText: {fontSize: 10, fontWeight: TYPOGRAPHY.weight.semibold, color: '#FF6B6B'},
  featuresGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm},
  statsSection: {paddingHorizontal: SPACING.md, marginTop: SPACING.lg},
  statsGrid: {flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm},
  motivationCard: {marginHorizontal: SPACING.md, marginTop: SPACING.lg, borderRadius: RADIUS.xl, padding: SPACING.lg, alignItems: 'center', overflow: 'hidden'},
  quoteEmoji: {fontSize: 40, marginBottom: SPACING.xs},
  motivationQuote: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.semibold, textAlign: 'center', fontStyle: 'italic', marginBottom: SPACING.xs, lineHeight: 24},
  motivationAuthor: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.medium},
  quoteDots: {flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.sm, gap: 4},
  ageSection: {paddingHorizontal: SPACING.md, marginTop: SPACING.lg},
  ageGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.sm},
  ageCard: {flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderWidth: 2, gap: SPACING.xs},
  ageText: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.semibold},
  ctaContainer: {marginHorizontal: SPACING.md, marginTop: SPACING.lg},
  ctaCard: {borderRadius: RADIUS.xxl, padding: SPACING.xl, alignItems: 'center', overflow: 'hidden'},
  ctaDecoration1: {position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.15)'},
  ctaDecoration2: {position: 'absolute', bottom: -20, left: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.1)'},
  ctaTitle: {fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weight.heavy, color: '#fff', marginBottom: SPACING.xs},
  ctaDesc: {fontSize: TYPOGRAPHY.sizes.sm, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: SPACING.md, lineHeight: 20},
  ctaButton: {backgroundColor: '#fff', borderRadius: RADIUS.full, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, elevation: 4, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.15, shadowRadius: 6},
  ctaButtonText: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold, color: '#45B7D1'},
});

export default PremiumKidsHubScreen;
