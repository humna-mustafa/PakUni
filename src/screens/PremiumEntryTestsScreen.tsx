import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SPACING, FONTS} from '../constants/theme';
import {TYPOGRAPHY, RADIUS, ANIMATION} from '../constants/design';
import {useTheme} from '../contexts/ThemeContext';
import {ENTRY_TESTS_DATA, EntryTestData} from '../data';
import {Icon} from '../components/icons';

// Storage key for custom test dates
const CUSTOM_TEST_DATES_KEY = '@pakuni_custom_test_dates';

const {width} = Dimensions.get('window');

// Filter options
const CATEGORIES = ['All', 'Engineering', 'Medical', 'Business', 'General'];

// Helper to get primary category from applicable_for array
const getTestCategory = (test: EntryTestData): string => {
  const applicableFor = test.applicable_for || [];
  if (applicableFor.some(a => a.toLowerCase().includes('engineering'))) return 'Engineering';
  if (applicableFor.some(a => a.toLowerCase().includes('medical') || a.toLowerCase().includes('mbbs'))) return 'Medical';
  if (applicableFor.some(a => a.toLowerCase().includes('business') || a.toLowerCase().includes('mba'))) return 'Business';
  return 'General';
};

// Helper to calculate days until test
const getDaysUntil = (dateString: string): number | null => {
  if (!dateString || dateString === 'TBA') return null;
  
  // Try to parse various date formats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Try parsing formats like "July 2025", "15 July 2025", "2025-07-15"
  let testDate = new Date(dateString);
  
  if (isNaN(testDate.getTime())) {
    // Try Month Year format
    const monthYearMatch = dateString.match(/(\w+)\s+(\d{4})/);
    if (monthYearMatch) {
      testDate = new Date(`${monthYearMatch[1]} 1, ${monthYearMatch[2]}`);
    }
  }
  
  if (isNaN(testDate.getTime())) return null;
  
  const diffTime = testDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Custom Test Countdown Component
const TestCountdownWidget = ({
  test,
  customDate,
  onEditDate,
  colors,
  isDark,
}: {
  test: EntryTestData;
  customDate?: string;
  onEditDate: () => void;
  colors: any;
  isDark: boolean;
}) => {
  const displayDate = customDate || test.test_date;
  const daysUntil = getDaysUntil(displayDate || '');
  
  if (daysUntil === null || daysUntil < 0) {
    return (
      <TouchableOpacity onPress={onEditDate}>
        <View style={[styles.countdownWidget, {backgroundColor: isDark ? 'rgba(52, 152, 219, 0.2)' : '#E3F2FD'}]}>
          <Icon name="calendar-outline" family="Ionicons" size={24} color={colors.primary} />
          <View style={styles.countdownContent}>
            <Text style={[styles.countdownLabel, {color: colors.textSecondary}]}>Test Date</Text>
            <Text style={[styles.countdownDate, {color: colors.text}]}>
              {customDate ? customDate : 'Tap to set date'}
            </Text>
          </View>
          <Icon name="pencil-outline" family="Ionicons" size={18} color={colors.primary} />
        </View>
      </TouchableOpacity>
    );
  }
  
  const urgencyColor = daysUntil <= 7 ? '#e74c3c' : daysUntil <= 30 ? '#f39c12' : '#27ae60';
  
  return (
    <TouchableOpacity onPress={onEditDate}>
      <View style={[styles.countdownWidget, {backgroundColor: urgencyColor + '15'}]}>
        <View style={[styles.countdownBadge, {backgroundColor: urgencyColor}]}>
          <Text style={styles.countdownDays}>{daysUntil}</Text>
          <Text style={styles.countdownDaysLabel}>days</Text>
        </View>
        <View style={styles.countdownContent}>
          <Text style={[styles.countdownLabel, {color: colors.textSecondary}]}>
            {daysUntil <= 7 ? 'Time is running out!' : daysUntil <= 30 ? 'Coming up soon!' : 'On track'}
          </Text>
          <Text style={[styles.countdownDate, {color: colors.text}]}>{displayDate}</Text>
          {customDate && (
            <Text style={[styles.customDateLabel, {color: urgencyColor}]}>Custom date</Text>
          )}
        </View>
        <Icon name="pencil-outline" family="Ionicons" size={18} color={urgencyColor} />
      </View>
    </TouchableOpacity>
  );
};

// Animated test card
const TestCard = ({
  test,
  onPress,
  index,
  colors,
}: {
  test: any;
  onPress: () => void;
  index: number;
  colors: any;
}) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

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

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Engineering':
        return '#3498db';
      case 'Medical':
        return '#e74c3c';
      case 'Business':
        return '#9b59b6';
      default:
        return '#27ae60';
    }
  };

  const category = getTestCategory(test);
  const categoryColor = getCategoryColor(category);

  return (
    <Animated.View
      style={[
        {
          transform: [{translateY: slideAnim}, {scale: scaleAnim}],
          opacity: fadeAnim,
        },
      ]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}>
        <View style={[styles.testCard, {backgroundColor: colors.card}]}>
          <LinearGradient
            colors={[categoryColor + '15', 'transparent']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.cardGradient}
          />
          <View style={[styles.categoryStrip, {backgroundColor: categoryColor}]} />
          
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, {backgroundColor: categoryColor + '20'}]}>
                <Icon name="document-text-outline" family="Ionicons" size={28} color={categoryColor} />
              </View>
              <View style={styles.cardTitleContainer}>
                <Text style={[styles.testName, {color: colors.text}]}>
                  {test.name}
                </Text>
                <View style={[styles.categoryBadge, {backgroundColor: categoryColor + '20'}]}>
                  <Text style={[styles.categoryText, {color: categoryColor}]}>
                    {category}
                  </Text>
                </View>
              </View>
            </View>

            <Text
              style={[styles.testDescription, {color: colors.textSecondary}]}
              numberOfLines={2}>
              {test.description}
            </Text>

            <View style={styles.cardFooter}>
              <View style={styles.metaItem}>
                <Icon name="calendar-outline" family="Ionicons" size={14} color={colors.textSecondary} />
                <Text style={[styles.metaText, {color: colors.textSecondary}]}>
                  {test.date || 'TBA'}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="cash-outline" family="Ionicons" size={14} color={colors.textSecondary} />
                <Text style={[styles.metaText, {color: colors.textSecondary}]}>
                  {test.fee || 'Varies'}
                </Text>
              </View>
              <View style={[styles.viewBtn, {backgroundColor: categoryColor}]}>
                <Text style={styles.viewBtnText}>Details</Text>
                <Icon name="arrow-forward" family="Ionicons" size={12} color="#FFFFFF" containerStyle={{marginLeft: 4}} />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Animated filter chip
const FilterChip = ({
  label,
  isActive,
  onPress,
  colors,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  colors: any;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity onPress={handlePress}>
        {isActive ? (
          <LinearGradient
            colors={['#3498db', '#2980b9']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.filterChip}>
            <Text style={styles.filterChipTextActive}>{label}</Text>
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.filterChip,
              {backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1},
            ]}>
            <Text style={[styles.filterChipText, {color: colors.textSecondary}]}>
              {label}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const PremiumEntryTestsScreen = () => {
  const {colors, isDark} = useTheme();
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [customDates, setCustomDates] = useState<{[key: string]: string}>({});
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [dateInput, setDateInput] = useState('');

  const headerAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  // Load custom dates from storage
  useEffect(() => {
    const loadCustomDates = async () => {
      try {
        const stored = await AsyncStorage.getItem(CUSTOM_TEST_DATES_KEY);
        if (stored) {
          setCustomDates(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading custom dates:', error);
      }
    };
    loadCustomDates();
  }, []);

  // Save custom date
  const saveCustomDate = useCallback(async (testId: string, date: string) => {
    try {
      const newDates = {...customDates, [testId]: date};
      setCustomDates(newDates);
      await AsyncStorage.setItem(CUSTOM_TEST_DATES_KEY, JSON.stringify(newDates));
    } catch (error) {
      console.error('Error saving custom date:', error);
    }
  }, [customDates]);

  // Clear custom date
  const clearCustomDate = useCallback(async (testId: string) => {
    try {
      const newDates = {...customDates};
      delete newDates[testId];
      setCustomDates(newDates);
      await AsyncStorage.setItem(CUSTOM_TEST_DATES_KEY, JSON.stringify(newDates));
    } catch (error) {
      console.error('Error clearing custom date:', error);
    }
  }, [customDates]);

  // Open date edit modal
  const openDateModal = (testId: string, currentDate?: string) => {
    setEditingTestId(testId);
    setDateInput(currentDate || '');
    setDateModalVisible(true);
  };

  // Handle date save
  const handleSaveDate = () => {
    if (!editingTestId) return;
    
    if (dateInput.trim()) {
      saveCustomDate(editingTestId, dateInput.trim());
      Alert.alert('Date Saved! ✅', `Your test countdown will now use: ${dateInput.trim()}`);
    }
    setDateModalVisible(false);
    setEditingTestId(null);
    setDateInput('');
  };

  // Handle clear date
  const handleClearDate = () => {
    if (!editingTestId) return;
    
    Alert.alert(
      'Reset to Default?',
      'This will remove your custom date and use the official test date.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            clearCustomDate(editingTestId);
            setDateModalVisible(false);
            setEditingTestId(null);
            setDateInput('');
          },
        },
      ]
    );
  };

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredTests = ENTRY_TESTS_DATA.filter(
    test => activeFilter === 'All' || getTestCategory(test) === activeFilter,
  );

  const openModal = (test: any) => {
    setSelectedTest(test);
    setModalVisible(true);
    Animated.spring(modalAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedTest(null);
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['top']}>
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
          colors={isDark ? ['#8e44ad', '#6c3483'] : ['#9b59b6', '#8e44ad']}
          style={styles.header}>
          <View style={styles.headerDecoration1} />
          <View style={styles.headerDecoration2} />
          <View style={styles.headerIconContainer}>
            <Icon name="clipboard-outline" family="Ionicons" size={50} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>Entry Tests</Text>
          <Text style={styles.headerSubtitle}>
            Prepare for university admission tests
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}>
          {CATEGORIES.map(category => (
            <FilterChip
              key={category}
              label={category}
              isActive={activeFilter === category}
              onPress={() => setActiveFilter(category)}
              colors={colors}
            />
          ))}
        </ScrollView>
      </View>

      {/* Stats Bar */}
      <View style={[styles.statsBar, {backgroundColor: colors.card}]}>
        <View style={styles.statItem}>
          <Icon name="library-outline" family="Ionicons" size={20} color={colors.primary} />
          <Text style={[styles.statValue, {color: colors.text}]}>
            {filteredTests.length}
          </Text>
          <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Tests</Text>
        </View>
        <View style={[styles.statDivider, {backgroundColor: colors.border}]} />
        <View style={styles.statItem}>
          <Icon name="construct-outline" family="Ionicons" size={20} color="#3498db" />
          <Text style={[styles.statValue, {color: colors.text}]}>
            {ENTRY_TESTS_DATA.filter(t => getTestCategory(t) === 'Engineering').length}
          </Text>
          <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Engineering</Text>
        </View>
        <View style={[styles.statDivider, {backgroundColor: colors.border}]} />
        <View style={styles.statItem}>
          <Icon name="medkit-outline" family="Ionicons" size={20} color="#e74c3c" />
          <Text style={[styles.statValue, {color: colors.text}]}>
            {ENTRY_TESTS_DATA.filter(t => getTestCategory(t) === 'Medical').length}
          </Text>
          <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Medical</Text>
        </View>
      </View>

      {/* Tests List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.testsContainer}>
        {filteredTests.map((test, index) => (
          <TestCard
            key={test.id}
            test={test}
            onPress={() => openModal(test)}
            index={index}
            colors={colors}
          />
        ))}
        <View style={{height: SPACING.xxl * 2}} />
      </ScrollView>

      {/* Test Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeModal}
          />
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.card,
                transform: [
                  {
                    translateY: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.modalHandle} />
            
            {selectedTest && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Modal Header */}
                <LinearGradient
                  colors={
                    getTestCategory(selectedTest) === 'Engineering'
                      ? ['#3498db', '#2980b9']
                      : getTestCategory(selectedTest) === 'Medical'
                      ? ['#e74c3c', '#c0392b']
                      : ['#9b59b6', '#8e44ad']
                  }
                  style={styles.modalHeader}>
                  <Icon name="document-text-outline" family="Ionicons" size={60} color="#FFFFFF" />
                  <Text style={styles.modalTitle}>{selectedTest.name}</Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedTest.full_name || selectedTest.name}
                  </Text>
                </LinearGradient>

                {/* Countdown Widget */}
                <View style={styles.countdownContainer}>
                  <TestCountdownWidget
                    test={selectedTest}
                    customDate={customDates[selectedTest.id]}
                    onEditDate={() => openDateModal(selectedTest.id, customDates[selectedTest.id])}
                    colors={colors}
                    isDark={isDark}
                  />
                </View>

                {/* Quick Info */}
                <View style={styles.quickInfo}>
                  <View style={[styles.infoCard, {backgroundColor: colors.background}]}>
                    <Icon name="calendar-outline" family="Ionicons" size={24} color={colors.primary} />
                    <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>Date</Text>
                    <Text style={[styles.infoValue, {color: colors.text}]}>
                      {selectedTest.test_date || 'TBA'}
                    </Text>
                  </View>
                  <View style={[styles.infoCard, {backgroundColor: colors.background}]}>
                    <Icon name="cash-outline" family="Ionicons" size={24} color={colors.primary} />
                    <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>Fee</Text>
                    <Text style={[styles.infoValue, {color: colors.text}]}>
                      {selectedTest.fee || 'Varies'}
                    </Text>
                  </View>
                  <View style={[styles.infoCard, {backgroundColor: colors.background}]}>
                    <Icon name="time-outline" family="Ionicons" size={24} color={colors.primary} />
                    <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>Duration</Text>
                    <Text style={[styles.infoValue, {color: colors.text}]}>
                      {selectedTest.duration || '3 hours'}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm}}>
                    <Icon name="reader-outline" family="Ionicons" size={18} color={colors.text} />
                    <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0}]}>About This Test</Text>
                  </View>
                  <Text style={[styles.sectionText, {color: colors.textSecondary}]}>
                    {selectedTest.description}
                  </Text>
                </View>

                {/* Test Format */}
                {selectedTest.format && (
                  <View style={styles.section}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm}}>
                      <Icon name="list-outline" family="Ionicons" size={18} color={colors.text} />
                      <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0}]}>Test Format</Text>
                    </View>
                    {selectedTest.format.map((item: string, i: number) => (
                      <View key={i} style={styles.formatItem}>
                        <View style={[styles.formatDot, {backgroundColor: colors.primary}]} />
                        <Text style={[styles.formatText, {color: colors.textSecondary}]}>
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Eligibility */}
                {selectedTest.eligibility && (
                  <View style={styles.section}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm}}>
                      <Icon name="checkmark-circle-outline" family="Ionicons" size={18} color={colors.text} />
                      <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0}]}>Eligibility</Text>
                    </View>
                    <View style={[styles.eligibilityCard, {backgroundColor: colors.background}]}>
                      <Text style={[styles.eligibilityText, {color: colors.textSecondary}]}>
                        {selectedTest.eligibility}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Tips */}
                <View style={[styles.tipsCard, {backgroundColor: isDark ? '#B8860B30' : '#FFF8E1'}]}>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.xs}}>
                    <Icon name="bulb-outline" family="Ionicons" size={20} color={isDark ? '#FFD54F' : '#F57F17'} />
                    <Text style={[styles.tipsTitle, {marginBottom: 0}]}>Preparation Tips</Text>
                  </View>
                  <Text style={[styles.tipsText, {color: isDark ? '#FFD54F' : '#F57F17'}]}>
                    {selectedTest.tips || 'Start preparing at least 3-6 months before the test. Practice previous papers and focus on weak areas.'}
                  </Text>
                </View>

                <TouchableOpacity style={styles.registerButton}>
                  <LinearGradient
                    colors={['#27ae60', '#219a52']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.registerGradient}>
                    <Text style={styles.registerText}>Register Now</Text>
                    <Icon name="arrow-forward" family="Ionicons" size={16} color="#FFFFFF" containerStyle={{marginLeft: 6}} />
                  </LinearGradient>
                </TouchableOpacity>

                <View style={{height: SPACING.xxl}} />
              </ScrollView>
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* Custom Date Picker Modal */}
      <Modal
        visible={dateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDateModalVisible(false)}>
        <View style={styles.dateModalOverlay}>
          <View style={[styles.dateModalContent, {backgroundColor: colors.card}]}>
            <View style={styles.dateModalHeader}>
              <Icon name="calendar-outline" family="Ionicons" size={32} color={colors.primary} />
              <Text style={[styles.dateModalTitle, {color: colors.text}]}>Set Custom Test Date</Text>
              <Text style={[styles.dateModalSubtitle, {color: colors.textSecondary}]}>
                Enter your expected test date (e.g., "July 15, 2025")
              </Text>
            </View>

            <TextInput
              style={[
                styles.dateInput,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter date (e.g., July 15, 2025)"
              placeholderTextColor={colors.textSecondary}
              value={dateInput}
              onChangeText={setDateInput}
              autoFocus
            />

            <Text style={[styles.dateHint, {color: colors.textSecondary}]}>
              Tip: Set your personal test date if official dates haven't been announced yet, or if you want to track a specific session.
            </Text>

            <View style={styles.dateModalButtons}>
              <TouchableOpacity
                style={[styles.dateModalButton, styles.cancelButton, {borderColor: colors.border}]}
                onPress={() => setDateModalVisible(false)}>
                <Text style={[styles.cancelButtonText, {color: colors.textSecondary}]}>Cancel</Text>
              </TouchableOpacity>

              {customDates[editingTestId || ''] && (
                <TouchableOpacity
                  style={[styles.dateModalButton, styles.clearButton]}
                  onPress={handleClearDate}>
                  <Text style={styles.clearButtonText}>Reset</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.dateModalButton, styles.saveButton]}
                onPress={handleSaveDate}>
                <LinearGradient
                  colors={['#27ae60', '#219a52']}
                  style={styles.saveButtonGradient}>
                  <Text style={styles.saveButtonText}>Save Date</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {},
  header: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
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
  headerIconContainer: {
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  filtersContainer: {
    marginTop: -15,
    zIndex: 10,
  },
  filtersContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  filterChipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
  },
  filterChipTextActive: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#fff',
  },
  statsBar: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  statDivider: {
    width: 1,
    height: '80%',
    alignSelf: 'center',
  },
  testsContainer: {
    padding: SPACING.md,
    paddingTop: SPACING.md,
  },
  testCard: {
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  categoryStrip: {
    height: 4,
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  cardTitleContainer: {
    flex: 1,
  },
  testName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  testDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
    gap: 4,
  },
  metaText: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  viewBtn: {
    marginLeft: 'auto',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  viewBtnText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    maxHeight: '90%',
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingTop: SPACING.sm,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  modalHeader: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  quickInfo: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  infoCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  sectionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 22,
  },
  formatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  formatDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.sm,
  },
  formatText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  eligibilityCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  eligibilityText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  tipsCard: {
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    color: '#F57F17',
  },
  tipsText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  registerButton: {
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  registerGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  registerText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  // Countdown Widget Styles
  countdownContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  countdownWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.md,
  },
  countdownBadge: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownDays: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  countdownDaysLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  countdownContent: {
    flex: 1,
  },
  countdownLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: 2,
  },
  countdownDate: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  customDateLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
    marginTop: 2,
  },
  // Date Modal Styles
  dateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  dateModalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  dateModalHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dateModalTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  dateModalSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    marginBottom: SPACING.md,
  },
  dateHint: {
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: 18,
    marginBottom: SPACING.lg,
  },
  dateModalButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  dateModalButton: {
    flex: 1,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  cancelButton: {
    borderWidth: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#e74c3c20',
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#e74c3c',
  },
  saveButton: {},
  saveButtonGradient: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PremiumEntryTestsScreen;
