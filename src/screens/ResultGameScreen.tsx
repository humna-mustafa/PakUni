/**
 * ResultGameScreen - Interactive Result Prediction Game
 * Fun gamified experience for students waiting for results
 * Offline-first - no Supabase dependency
 */

import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
  Easing,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../components/icons';
import {useTheme} from '../contexts/ThemeContext';
import {TYPOGRAPHY, RADIUS, SPACING} from '../constants/design';
import {ANIMATION_SCALES, SPRING_CONFIGS} from '../constants/ui';
import {shareResultPrediction} from '../services/share';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// ============================================================================
// CONFETTI COMPONENT
// ============================================================================

interface ConfettiPiece {
  id: number;
  translateY: Animated.Value;
  translateX: Animated.Value;
  rotate: Animated.Value;
  scale: Animated.Value;
  color: string;
}

const Confetti: React.FC<{show: boolean}> = ({show}) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (show) {
      const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
      const newPieces: ConfettiPiece[] = Array.from({length: 50}, (_, i) => ({
        id: i,
        translateY: new Animated.Value(-50),
        translateX: new Animated.Value(Math.random() * SCREEN_WIDTH),
        rotate: new Animated.Value(0),
        scale: new Animated.Value(0.5 + Math.random() * 0.5),
        color: colors[Math.floor(Math.random() * colors.length)],
      }));

      setPieces(newPieces);

      newPieces.forEach((piece, index) => {
        const delay = index * 50;
        Animated.parallel([
          Animated.timing(piece.translateY, {
            toValue: SCREEN_HEIGHT + 50,
            duration: 3000 + Math.random() * 2000,
            delay,
            useNativeDriver: true,
            easing: Easing.linear,
          }),
          Animated.timing(piece.rotate, {
            toValue: 720,
            duration: 3000,
            delay,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [show]);

  if (!show || pieces.length === 0) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {pieces.map(piece => (
        <Animated.View
          key={piece.id}
          style={[
            confettiStyles.piece,
            {
              backgroundColor: piece.color,
              transform: [
                {translateX: piece.translateX},
                {translateY: piece.translateY},
                {
                  rotate: piece.rotate.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
                {scale: piece.scale},
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const confettiStyles = StyleSheet.create({
  piece: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});

// ============================================================================
// PREDICTION GAME
// ============================================================================

interface PredictionOption {
  id: string;
  label: string;
  emoji: string;
  description: string;
  color: string;
}

const PREDICTION_OPTIONS: PredictionOption[] = [
  {
    id: 'flying',
    label: 'Flying Colors',
    emoji: '🚀',
    description: '90%+ - Topper material!',
    color: '#10B981',
  },
  {
    id: 'excellent',
    label: 'Excellent',
    emoji: '🌟',
    description: '80-90% - Outstanding!',
    color: '#4573DF',
  },
  {
    id: 'good',
    label: 'Good',
    emoji: '👍',
    description: '70-80% - Well done!',
    color: '#F59E0B',
  },
  {
    id: 'satisfactory',
    label: 'Satisfactory',
    emoji: '✅',
    description: '60-70% - Passed!',
    color: '#4573DF',
  },
  {
    id: 'surprise',
    label: 'Surprise Me!',
    emoji: '🎁',
    description: 'Random prediction',
    color: '#4573DF',
  },
];

const REVEAL_MESSAGES = [
  {emoji: '🎉', message: 'Congratulations! Your hard work paid off!'},
  {emoji: '🌟', message: 'Amazing! You did it!'},
  {emoji: '🚀', message: 'To the moon! Great result!'},
  {emoji: '💪', message: 'Strong effort! Be proud!'},
  {emoji: '🎊', message: 'Celebration time!'},
  {emoji: '👏', message: 'Round of applause for you!'},
];

const ResultGameScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [resultMessage, setResultMessage] = useState<{emoji: string; message: string} | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  // Animations
  const buttonScales = useRef(PREDICTION_OPTIONS.map(() => new Animated.Value(1))).current;
  const resultScale = useRef(new Animated.Value(0)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const loadingRotate = useRef(new Animated.Value(0)).current;

  const handleOptionPress = (optionId: string, index: number) => {
    // Animate button press
    Animated.sequence([
      Animated.timing(buttonScales[index], {
        toValue: ANIMATION_SCALES.ICON_PRESS,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScales[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedOption(optionId);
  };

  const handleReveal = () => {
    setIsRevealing(true);

    // Start loading animation
    Animated.loop(
      Animated.timing(loadingRotate, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();

    // Simulate suspenseful delay
    setTimeout(() => {
      const randomMessage = REVEAL_MESSAGES[Math.floor(Math.random() * REVEAL_MESSAGES.length)];
      setResultMessage(randomMessage);
      setShowResult(true);
      setIsRevealing(false);

      // Animate result appearance
      Animated.parallel([
        Animated.spring(resultScale, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(resultOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2500);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setShowResult(false);
    setResultMessage(null);
    resultScale.setValue(0);
    resultOpacity.setValue(0);
    loadingRotate.setValue(0);
  };

  const loadingRotation = loadingRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <Confetti show={showResult} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, {backgroundColor: colors.card}]}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, {color: colors.text}]}>Result Prediction</Text>
            <Text style={[styles.headerSubtitle, {color: colors.textSecondary}]}>
              Just for fun! 🎲
            </Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <LinearGradient
              colors={['#4573DF', '#4573DF']}
              style={styles.heroCard}>
              <View style={styles.heroEmoji}>
                <Text style={styles.heroEmojiText}>🎮</Text>
              </View>
              <Text style={styles.heroTitle}>Result Prediction Game</Text>
              <Text style={styles.heroSubtitle}>
                Waiting for results? Let's have some fun! Make a prediction and see what happens!
              </Text>
            </LinearGradient>
          </View>

          {/* Disclaimer */}
          <View style={[styles.disclaimerCard, {backgroundColor: '#F59E0B' + '15'}]}>
            <Icon name="warning-outline" size={20} color="#F59E0B" />
            <Text style={[styles.disclaimerText, {color: '#F59E0B'}]}>
              This is just for fun! Not actual result prediction. 😄
            </Text>
          </View>

          {/* Result Display */}
          {showResult && resultMessage ? (
            <Animated.View
              style={[
                styles.resultContainer,
                {
                  transform: [{scale: resultScale}],
                  opacity: resultOpacity,
                },
              ]}>
              <LinearGradient
                colors={['#10B981', '#34D399']}
                style={styles.resultCard}>
                <Text style={styles.resultEmoji}>{resultMessage.emoji}</Text>
                <Text style={styles.resultTitle}>Your Prediction</Text>
                <Text style={styles.resultMessage}>{resultMessage.message}</Text>
                <View style={styles.resultButtons}>
                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={() => shareResultPrediction('Your Dream University', 'Uni', 85)}>
                    <Icon name="share-social-outline" size={20} color="#FFF" />
                    <Text style={styles.shareButtonText}>Share Result</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.playAgainButton}
                    onPress={handleReset}>
                    <Icon name="refresh-outline" size={20} color="#10B981" />
                    <Text style={styles.playAgainText}>Play Again</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Animated.View>
          ) : isRevealing ? (
            <View style={styles.loadingContainer}>
              <Animated.View style={{transform: [{rotate: loadingRotation}]}}>
                <LinearGradient
                  colors={['#4573DF', '#4573DF']}
                  style={styles.loadingCircle}>
                  <Icon name="sparkles" size={40} color="#FFF" />
                </LinearGradient>
              </Animated.View>
              <Text style={[styles.loadingText, {color: colors.text}]}>
                Consulting the stars...
              </Text>
              <Text style={[styles.loadingSubtext, {color: colors.textSecondary}]}>
                Building suspense...
              </Text>
            </View>
          ) : (
            <>
              {/* Prediction Options */}
              <View style={styles.section}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                  <Icon name="analytics-outline" size={24} color="#4573DF" />
                  <Text style={[styles.sectionTitle, {color: colors.text, marginLeft: 8}]}>
                    Make Your Prediction
                  </Text>
                </View>
                <Text style={[styles.sectionSubtitle, {color: colors.textSecondary}]}>
                  What do you think your result will be?
                </Text>
                
                {PREDICTION_OPTIONS.map((option, index) => (
                  <Animated.View
                    key={option.id}
                    style={{transform: [{scale: buttonScales[index]}]}}>
                    <TouchableOpacity
                      style={[
                        styles.optionCard,
                        {
                          backgroundColor: selectedOption === option.id ? option.color + '20' : colors.card,
                          borderColor: selectedOption === option.id ? option.color : 'transparent',
                          borderWidth: 2,
                        },
                      ]}
                      onPress={() => handleOptionPress(option.id, index)}
                      activeOpacity={0.7}>
                      <View style={[styles.optionEmoji, {backgroundColor: option.color + '20'}]}>
                        <Text style={styles.optionEmojiText}>{option.emoji}</Text>
                      </View>
                      <View style={styles.optionContent}>
                        <Text style={[styles.optionLabel, {color: colors.text}]}>{option.label}</Text>
                        <Text style={[styles.optionDescription, {color: colors.textSecondary}]}>
                          {option.description}
                        </Text>
                      </View>
                      {selectedOption === option.id && (
                        <Icon name="checkmark-circle" size={24} color={option.color} />
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>

              {/* Reveal Button */}
              {selectedOption && (
                <TouchableOpacity onPress={handleReveal}>
                  <LinearGradient
                    colors={['#4573DF', '#4573DF']}
                    style={styles.revealButton}>
                    <Icon name="sparkles" size={24} color="#FFF" />
                    <Text style={styles.revealButtonText}>Reveal My Future!</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Fun Facts */}
          <View style={[styles.factsCard, {backgroundColor: colors.card}]}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
              <Icon name="bulb-outline" size={20} color="#F59E0B" />
              <Text style={[styles.factsTitle, {color: colors.text, marginLeft: 8}]}>Did You Know?</Text>
            </View>
            <View style={styles.factItem}>
              <Icon name="bulb-outline" size={16} color="#F59E0B" />
              <Text style={[styles.factText, {color: colors.textSecondary}]}>
                Most students score within 10% of their predicted score!
              </Text>
            </View>
            <View style={styles.factItem}>
              <Icon name="trending-up" size={16} color="#10B981" />
              <Text style={[styles.factText, {color: colors.textSecondary}]}>
                Positive thinking can improve actual performance by 5-10%!
              </Text>
            </View>
            <View style={styles.factItem}>
              <Icon name="heart" size={16} color="#4573DF" />
              <Text style={[styles.factText, {color: colors.textSecondary}]}>
                Your worth is not defined by your grades. You're amazing!
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
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  heroSection: {
    marginBottom: SPACING.lg,
  },
  heroCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  heroEmoji: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  heroEmojiText: {
    fontSize: 40,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  disclaimerText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  optionEmoji: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionEmojiText: {
    fontSize: 24,
  },
  optionContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  optionLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  optionDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
  revealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  revealButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: '#FFF',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  loadingCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    marginTop: SPACING.lg,
  },
  loadingSubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: SPACING.xs,
  },
  resultContainer: {
    marginBottom: SPACING.xl,
  },
  resultCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  resultTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
  },
  resultMessage: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  resultButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  shareButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#FFF',
  },
  playAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  playAgainText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: '#10B981',
  },
  factsCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  factsTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  factItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  factText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 18,
  },
});

export default ResultGameScreen;


