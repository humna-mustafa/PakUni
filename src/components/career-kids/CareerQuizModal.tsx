import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView} from 'react-native';
import {SPACING, FONTS, BORDER_RADIUS} from '../../constants/theme';
import {TYPOGRAPHY} from '../../constants/design';
import {Icon} from '../icons';
import type {Career, QuizQuestion} from './data';

interface CareerQuizModalProps {
  visible: boolean;
  career: Career | null;
  questions: QuizQuestion[];
  currentQuestion: number;
  score: number;
  quizCompleted: boolean;
  selectedAnswerIndex: number | null;
  showAnswerFeedback: boolean;
  colors: any;
  onAnswer: (index: number) => void;
  onRetry: () => void;
  onClose: () => void;
}

const CareerQuizModal: React.FC<CareerQuizModalProps> = ({
  visible,
  career,
  questions,
  currentQuestion,
  score,
  quizCompleted,
  selectedAnswerIndex,
  showAnswerFeedback,
  colors,
  onAnswer,
  onRetry,
  onClose,
}) => {
  if (!career) return null;

  const currentQ = questions[currentQuestion];
  const percentage = questions.length > 0 ? (score / questions.length) * 100 : 0;

  const getResult = () => {
    if (percentage >= 80) {
      return {
        title: 'Perfect Match! 🎉',
        message: `You would make an AMAZING ${career.title}! You have all the right qualities!`,
        emoji: '🌟',
      };
    } else if (percentage >= 50) {
      return {
        title: 'Good Match! 👍',
        message: `${career.title} could be a good career for you! Keep exploring and learning!`,
        emoji: '✨',
      };
    }
    return {
      title: 'Keep Exploring! 🔍',
      message: 'Maybe try exploring other careers too! There might be something else perfect for you!',
      emoji: '🚀',
    };
  };

  const result = getResult();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.quizModalOverlay}>
        <View style={[styles.quizModalContent, {backgroundColor: colors.card}]}>
          {/* Header */}
          <View style={[styles.quizModalHeader, {backgroundColor: career.color}]}>
            <TouchableOpacity style={styles.quizCloseBtn} onPress={onClose}>
              <Icon name="close" family="Ionicons" size={24} color="#FFF" />
            </TouchableOpacity>
            <Icon name={career.iconName} family="Ionicons" size={40} color="#FFF" />
            <Text style={styles.quizModalTitle}>
              {quizCompleted ? 'Quiz Complete!' : `Question ${currentQuestion + 1}/${questions.length}`}
            </Text>
          </View>

          {/* Progress bar */}
          {!quizCompleted && (
            <View style={[styles.progressContainer, {backgroundColor: colors.background}]}>
              <View style={[styles.progressBar, {backgroundColor: colors.border}]}>
                <View
                  style={[
                    styles.progressFill,
                    {backgroundColor: career.color, width: `${((currentQuestion) / questions.length) * 100}%`},
                  ]}
                />
              </View>
              <Text style={[styles.progressText, {color: colors.textSecondary}]}>
                {currentQuestion + 1} / {questions.length}
              </Text>
            </View>
          )}

          {/* Body */}
          <ScrollView style={styles.quizBodyScroll} contentContainerStyle={styles.quizBody} showsVerticalScrollIndicator={false}>
            {quizCompleted ? (
              <View style={styles.quizResult}>
                <Text style={styles.resultEmoji}>{result.emoji}</Text>
                <Text style={[styles.resultTitle, {color: colors.text}]}>{result.title}</Text>
                {/* Score ring */}
                <View style={[styles.scoreRing, {borderColor: career.color}]}>
                  <Text style={[styles.scoreRingNumber, {color: career.color}]}>{score}/{questions.length}</Text>
                  <Text style={[styles.scoreRingLabel, {color: colors.textSecondary}]}>{Math.round(percentage)}%</Text>
                </View>
                <Text style={[styles.resultMessage, {color: colors.textSecondary}]}>{result.message}</Text>
                <TouchableOpacity style={[styles.retryBtn, {backgroundColor: career.color}]} onPress={onRetry}>
                  <Icon name="refresh" family="Ionicons" size={18} color="#FFF" />
                  <Text style={styles.retryBtnText}>Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.doneBtn, {borderColor: career.color}]} onPress={onClose}>
                  <Text style={[styles.doneBtnText, {color: career.color}]}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={[styles.quizQuestion, {color: colors.text}]}>{currentQ?.question}</Text>
                <View style={styles.quizOptions}>
                  {currentQ?.options.map((option, index) => {
                    const isSelected = selectedAnswerIndex === index;
                    const isCorrect = currentQ.correctIndex === index;
                    const showCorrectHighlight = showAnswerFeedback && isCorrect;
                    const showWrongHighlight = showAnswerFeedback && isSelected && !isCorrect;

                    let backgroundColor = colors.background;
                    let borderColor = colors.border;
                    let textColor = colors.text;

                    if (showCorrectHighlight) {
                      backgroundColor = '#10B98120';
                      borderColor = '#10B981';
                      textColor = '#10B981';
                    } else if (showWrongHighlight) {
                      backgroundColor = '#EF444420';
                      borderColor = '#EF4444';
                      textColor = '#EF4444';
                    } else if (isSelected) {
                      backgroundColor = career.color + '15';
                      borderColor = career.color;
                      textColor = career.color;
                    }

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[styles.quizOption, {backgroundColor, borderColor}]}
                        disabled={showAnswerFeedback}
                        onPress={() => onAnswer(index)}>
                        <View style={styles.optionLetterBubble}>
                          <Text style={[styles.optionLetter, {color: textColor === colors.text ? colors.primary : textColor}]}>
                            {String.fromCharCode(65 + index)}
                          </Text>
                        </View>
                        <Text style={[styles.quizOptionText, {color: textColor}]}>{option}</Text>
                        {showCorrectHighlight && <Icon name="checkmark-circle" family="Ionicons" size={20} color="#10B981" />}
                        {showWrongHighlight && <Icon name="close-circle" family="Ionicons" size={20} color="#EF4444" />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {/* Explanation */}
                {showAnswerFeedback && currentQ?.explanation ? (
                  <View style={[
                    styles.explanationBox,
                    {backgroundColor: selectedAnswerIndex === currentQ.correctIndex ? '#10B98115' : '#3B82F615'},
                  ]}>
                    <Icon
                      name="bulb-outline"
                      family="Ionicons"
                      size={16}
                      color={selectedAnswerIndex === currentQ.correctIndex ? '#10B981' : '#3B82F6'}
                    />
                    <Text style={[styles.explanationText, {color: colors.text}]}>{currentQ.explanation}</Text>
                  </View>
                ) : null}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  quizModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  quizModalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  quizModalHeader: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  quizCloseBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: 4,
  },
  quizModalTitle: {
    color: '#FFF',
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    marginTop: SPACING.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.semibold,
    minWidth: 36,
    textAlign: 'right',
  },
  quizBodyScroll: {
    maxHeight: 480,
  },
  quizBody: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  quizQuestion: {
    fontSize: FONTS.sizes.lg,
    fontWeight: TYPOGRAPHY.weight.semibold,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 28,
  },
  quizOptions: {
    gap: SPACING.md,
  },
  quizOption: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  optionLetterBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(128,128,128,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetter: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  quizOptionText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    flex: 1,
    lineHeight: 18,
  },
  explanationBox: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  explanationText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  quizResult: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  resultEmoji: {
    fontSize: 56,
    marginBottom: SPACING.sm,
  },
  resultTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  scoreRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  scoreRingNumber: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
  },
  scoreRingLabel: {
    fontSize: 12,
  },
  resultMessage: {
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
    width: '100%',
    marginBottom: SPACING.sm,
  },
  retryBtnText: {
    color: '#FFF',
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
  },
  doneBtn: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
  },
});

export default CareerQuizModal;
