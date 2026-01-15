/**
 * Entry Test Countdown Widget
 * Shows countdown to upcoming entry tests with user-adjustable dates
 */

import React, {useState, useEffect, useMemo, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Icon} from '../icons';
import {TYPOGRAPHY, RADIUS, SPACING} from '../../constants/design';
import {useTheme} from '../../contexts/ThemeContext';
import {ENTRY_TESTS_DATA} from '../../data';

// ============================================================================
// TYPES
// ============================================================================

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

interface UserTestDate {
  testId: string;
  customDate: string; // ISO date string
}

interface EntryTestCountdownProps {
  testId?: string;
  variant?: 'card' | 'compact' | 'widget';
  showEditButton?: boolean;
  onPress?: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = '@pakuni_custom_test_dates';

const TEST_COLORS: Record<string, string[]> = {
  ECAT: ['#3B82F6', '#1D4ED8', '#1E40AF'],
  MDCAT: ['#EF4444', '#DC2626', '#B91C1C'],
  NET: ['#10B981', '#059669', '#047857'],
  GAT: ['#8B5CF6', '#7C3AED', '#6D28D9'],
  HAT: ['#F59E0B', '#D97706', '#B45309'],
  NTS: ['#EC4899', '#DB2777', '#BE185D'],
  DEFAULT: ['#6366F1', '#4F46E5', '#4338CA'],
};

// ============================================================================
// HELPERS
// ============================================================================

const calculateCountdown = (targetDate: Date): CountdownTime => {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) {
    return {days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true};
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {days, hours, minutes, seconds, isExpired: false};
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getTestColors = (testName: string): string[] => {
  const upperName = testName.toUpperCase();
  for (const key of Object.keys(TEST_COLORS)) {
    if (upperName.includes(key)) {
      return TEST_COLORS[key];
    }
  }
  return TEST_COLORS.DEFAULT;
};

// ============================================================================
// STORAGE FUNCTIONS
// ============================================================================

const loadCustomDates = async (): Promise<UserTestDate[]> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load custom dates:', error);
    return [];
  }
};

const saveCustomDate = async (testId: string, customDate: string): Promise<void> => {
  try {
    const dates = await loadCustomDates();
    const existingIndex = dates.findIndex(d => d.testId === testId);
    
    if (existingIndex >= 0) {
      dates[existingIndex].customDate = customDate;
    } else {
      dates.push({testId, customDate});
    }
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dates));
  } catch (error) {
    console.error('Failed to save custom date:', error);
  }
};

// ============================================================================
// COUNTDOWN DIGIT COMPONENT
// ============================================================================

const CountdownDigit = ({
  value,
  label,
  size = 'medium',
  colors,
}: {
  value: number;
  label: string;
  size?: 'small' | 'medium' | 'large';
  colors: any;
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [value]);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: {width: 42, padding: 6},
          value: {fontSize: 18},
          label: {fontSize: 8},
        };
      case 'large':
        return {
          container: {width: 70, padding: 12},
          value: {fontSize: 32},
          label: {fontSize: 11},
        };
      default:
        return {
          container: {width: 56, padding: 10},
          value: {fontSize: 24},
          label: {fontSize: 10},
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <Animated.View
      style={[
        styles.digitContainer,
        sizeStyles.container,
        {transform: [{scale: pulseAnim}]},
      ]}>
      <Text style={[styles.digitValue, sizeStyles.value]}>
        {value.toString().padStart(2, '0')}
      </Text>
      <Text style={[styles.digitLabel, sizeStyles.label]}>{label}</Text>
    </Animated.View>
  );
};

// ============================================================================
// DATE EDIT MODAL
// ============================================================================

const DateEditModal = ({
  visible,
  testName,
  currentDate,
  onClose,
  onSave,
  colors,
}: {
  visible: boolean;
  testName: string;
  currentDate: string;
  onClose: () => void;
  onSave: (date: string) => void;
  colors: any;
}) => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  useEffect(() => {
    if (currentDate) {
      const date = new Date(currentDate);
      setDay(date.getDate().toString());
      setMonth((date.getMonth() + 1).toString());
      setYear(date.getFullYear().toString());
    }
  }, [currentDate]);

  const handleSave = () => {
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (
      dayNum >= 1 && dayNum <= 31 &&
      monthNum >= 1 && monthNum <= 12 &&
      yearNum >= 2024 && yearNum <= 2030
    ) {
      const newDate = new Date(yearNum, monthNum - 1, dayNum);
      onSave(newDate.toISOString());
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, {color: colors.text}]}>
              Adjust Test Date
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Icon name="close" family="Ionicons" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.modalSubtitle, {color: colors.textSecondary}]}>
            Update the date for {testName} if the official date has changed
          </Text>

          <View style={styles.dateInputRow}>
            <View style={styles.dateInputGroup}>
              <Text style={[styles.dateInputLabel, {color: colors.textSecondary}]}>Day</Text>
              <TextInput
                style={[styles.dateInput, {backgroundColor: colors.background, color: colors.text}]}
                value={day}
                onChangeText={setDay}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="DD"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={styles.dateInputGroup}>
              <Text style={[styles.dateInputLabel, {color: colors.textSecondary}]}>Month</Text>
              <TextInput
                style={[styles.dateInput, {backgroundColor: colors.background, color: colors.text}]}
                value={month}
                onChangeText={setMonth}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="MM"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={styles.dateInputGroup}>
              <Text style={[styles.dateInputLabel, {color: colors.textSecondary}]}>Year</Text>
              <TextInput
                style={[styles.dateInput, {backgroundColor: colors.background, color: colors.text}]}
                value={year}
                onChangeText={setYear}
                keyboardType="number-pad"
                maxLength={4}
                placeholder="YYYY"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.infoBox}>
            <Icon name="information-circle-outline" family="Ionicons" size={18} color={colors.primary} />
            <Text style={[styles.infoText, {color: colors.textSecondary}]}>
              Dates may change. If our date differs from the official date, you can update it here.
              Send us updates at support@pakuni.app
            </Text>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.cancelBtn, {borderColor: colors.border}]}
              onPress={onClose}>
              <Text style={[styles.cancelBtnText, {color: colors.text}]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, {backgroundColor: colors.primary}]}
              onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Date</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const EntryTestCountdown: React.FC<EntryTestCountdownProps> = ({
  testId,
  variant = 'card',
  showEditButton = true,
  onPress,
}) => {
  const {colors, isDark} = useTheme();
  const [countdown, setCountdown] = useState<CountdownTime | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTestDate, setCurrentTestDate] = useState<string>('');
  const [selectedTest, setSelectedTest] = useState<typeof ENTRY_TESTS_DATA[0] | null>(null);

  // Find the test or get the nearest upcoming test
  useEffect(() => {
    const initTest = async () => {
      let test = testId 
        ? ENTRY_TESTS_DATA.find(t => t.id === testId)
        : ENTRY_TESTS_DATA.find(t => new Date(t.test_date) > new Date());

      if (!test) {
        test = ENTRY_TESTS_DATA[0];
      }

      setSelectedTest(test);

      // Check for custom date
      const customDates = await loadCustomDates();
      const customDate = customDates.find(d => d.testId === test!.id);
      
      setCurrentTestDate(customDate?.customDate || test.test_date);
    };

    initTest();
  }, [testId]);

  // Update countdown every second
  useEffect(() => {
    if (!currentTestDate) return;

    const updateCountdown = () => {
      const targetDate = new Date(currentTestDate);
      setCountdown(calculateCountdown(targetDate));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [currentTestDate]);

  const handleSaveDate = async (newDate: string) => {
    if (selectedTest) {
      await saveCustomDate(selectedTest.id, newDate);
      setCurrentTestDate(newDate);
      setShowEditModal(false);
    }
  };

  if (!selectedTest || !countdown) {
    return null;
  }

  const testColors = getTestColors(selectedTest.name);

  // ============================================================================
  // WIDGET VARIANT - Compact for home screen
  // ============================================================================
  if (variant === 'widget') {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <LinearGradient
          colors={testColors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.widgetContainer}>
          <View style={styles.widgetHeader}>
            <Icon name="alarm-outline" family="Ionicons" size={16} color="#FFF" />
            <Text style={styles.widgetTestName}>{selectedTest.name}</Text>
          </View>
          
          {countdown.isExpired ? (
            <Text style={styles.widgetExpired}>Test Completed!</Text>
          ) : (
            <View style={styles.widgetCountdown}>
              <Text style={styles.widgetDays}>{countdown.days}</Text>
              <Text style={styles.widgetDaysLabel}>days left</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // ============================================================================
  // COMPACT VARIANT - Single row
  // ============================================================================
  if (variant === 'compact') {
    return (
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={onPress}
        style={[styles.compactContainer, {backgroundColor: colors.card}]}>
        <View style={[styles.compactIcon, {backgroundColor: testColors[0]}]}>
          <Icon name="time-outline" family="Ionicons" size={18} color="#FFF" />
        </View>
        
        <View style={styles.compactInfo}>
          <Text style={[styles.compactTestName, {color: colors.text}]}>
            {selectedTest.name}
          </Text>
          <Text style={[styles.compactDate, {color: colors.textSecondary}]}>
            {formatDate(currentTestDate)}
          </Text>
        </View>

        {countdown.isExpired ? (
          <View style={[styles.compactBadge, {backgroundColor: '#10B981'}]}>
            <Text style={styles.compactBadgeText}>Done</Text>
          </View>
        ) : (
          <View style={[styles.compactBadge, {backgroundColor: testColors[0]}]}>
            <Text style={styles.compactBadgeText}>{countdown.days}d left</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // ============================================================================
  // CARD VARIANT - Full featured
  // ============================================================================
  return (
    <>
      <View style={[styles.cardContainer, {backgroundColor: colors.card}]}>
        <LinearGradient
          colors={testColors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.cardHeader}>
          {/* Decorative circles */}
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />

          <View style={styles.cardHeaderContent}>
            <View style={styles.testBadge}>
              <Icon name="document-text-outline" family="Ionicons" size={20} color="#FFF" />
              <Text style={styles.testName}>{selectedTest.name}</Text>
            </View>
            
            {showEditButton && (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setShowEditModal(true)}>
                <Icon name="calendar-outline" family="Ionicons" size={16} color="#FFF" />
                <Text style={styles.editBtnText}>Adjust Date</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.testFullName}>{selectedTest.full_name}</Text>
          <Text style={styles.testDate}>📅 {formatDate(currentTestDate)}</Text>
        </LinearGradient>

        <View style={styles.countdownSection}>
          {countdown.isExpired ? (
            <View style={styles.expiredContainer}>
              <Icon name="checkmark-circle" family="Ionicons" size={48} color="#10B981" />
              <Text style={[styles.expiredText, {color: colors.text}]}>
                Test Completed!
              </Text>
              <Text style={[styles.expiredSubtext, {color: colors.textSecondary}]}>
                Check results or update date if rescheduled
              </Text>
            </View>
          ) : (
            <>
              <Text style={[styles.countdownLabel, {color: colors.textSecondary}]}>
                TIME REMAINING
              </Text>
              <View style={styles.countdownRow}>
                <CountdownDigit value={countdown.days} label="DAYS" size="large" colors={colors} />
                <Text style={[styles.separator, {color: colors.textSecondary}]}>:</Text>
                <CountdownDigit value={countdown.hours} label="HOURS" size="large" colors={colors} />
                <Text style={[styles.separator, {color: colors.textSecondary}]}>:</Text>
                <CountdownDigit value={countdown.minutes} label="MINS" size="large" colors={colors} />
                <Text style={[styles.separator, {color: colors.textSecondary}]}>:</Text>
                <CountdownDigit value={countdown.seconds} label="SECS" size="large" colors={colors} />
              </View>
              
              {countdown.days <= 7 && (
                <View style={[styles.urgentBadge, {backgroundColor: '#FEE2E2'}]}>
                  <Icon name="warning-outline" family="Ionicons" size={14} color="#DC2626" />
                  <Text style={styles.urgentText}>Less than a week left!</Text>
                </View>
              )}
            </>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.actionBtn, {backgroundColor: colors.primary}]}
          onPress={onPress}>
          <Text style={styles.actionBtnText}>View Test Details</Text>
          <Icon name="arrow-forward" family="Ionicons" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      <DateEditModal
        visible={showEditModal}
        testName={selectedTest.name}
        currentDate={currentTestDate}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveDate}
        colors={colors}
      />
    </>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Widget Variant
  widgetContainer: {
    width: 120,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  widgetTestName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 4,
  },
  widgetCountdown: {
    alignItems: 'center',
  },
  widgetDays: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
  },
  widgetDaysLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  widgetExpired: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#FFF',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Compact Variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  compactIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  compactInfo: {
    flex: 1,
  },
  compactTestName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  compactDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  compactBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  compactBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
    color: '#FFF',
  },

  // Card Variant
  cardContainer: {
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 6},
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardHeader: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  decoCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decoCircle2: {
    position: 'absolute',
    bottom: -20,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cardHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  testBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  testName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '800',
    color: '#FFF',
    marginLeft: 6,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  editBtnText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: '#FFF',
  },
  testFullName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  testDate: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },

  // Countdown Section
  countdownSection: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  countdownLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: SPACING.md,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitValue: {
    fontWeight: '800',
    color: '#1F2937',
  },
  digitLabel: {
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  separator: {
    fontSize: 28,
    fontWeight: '300',
    marginHorizontal: 4,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginTop: SPACING.md,
    gap: 6,
  },
  urgentText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
    color: '#DC2626',
  },

  // Expired State
  expiredContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  expiredText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    marginTop: SPACING.sm,
  },
  expiredSubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 4,
  },

  // Action Button
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    margin: SPACING.md,
    marginTop: 0,
    borderRadius: RADIUS.xl,
    gap: SPACING.xs,
  },
  actionBtnText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: '#FFF',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: RADIUS.xxl,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  dateInputRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  dateInputGroup: {
    flex: 1,
  },
  dateInputLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    marginBottom: 6,
  },
  dateInput: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cancelBtn: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  cancelBtnText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default EntryTestCountdown;
