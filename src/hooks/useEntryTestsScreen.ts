/**
 * useEntryTestsScreen - All state & logic for PremiumEntryTestsScreen
 */

import {useState, useRef, useEffect, useCallback, useMemo} from 'react';
import {Animated, Alert, Linking} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from '../contexts/ThemeContext';
import {ENTRY_TESTS_DATA, EntryTestData, EntryTestVariant} from '../data';
import {useDebouncedValue} from './useDebounce';
import {logger} from '../utils/logger';
import {getTestCategory} from '../components/entryTests/helpers';

const CUSTOM_TEST_DATES_KEY = '@pakuni_custom_test_dates';

export const useEntryTestsScreen = () => {
  const {colors, isDark} = useTheme();

  // State
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
  const [selectedTest, setSelectedTest] = useState<EntryTestData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [customDates, setCustomDates] = useState<{[key: string]: string}>({});
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [dateInput, setDateInput] = useState('');

  // Animations
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
        logger.error('Error loading custom dates', error, 'EntryTests');
      }
    };
    loadCustomDates();
  }, []);

  // Header entrance animation
  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Save custom date
  const saveCustomDate = useCallback(
    async (testId: string, date: string) => {
      try {
        const newDates = {...customDates, [testId]: date};
        setCustomDates(newDates);
        await AsyncStorage.setItem(CUSTOM_TEST_DATES_KEY, JSON.stringify(newDates));
      } catch (error) {
        logger.error('Error saving custom date', error, 'EntryTests');
      }
    },
    [customDates],
  );

  // Clear custom date
  const clearCustomDate = useCallback(
    async (testId: string) => {
      try {
        const newDates = {...customDates};
        delete newDates[testId];
        setCustomDates(newDates);
        await AsyncStorage.setItem(CUSTOM_TEST_DATES_KEY, JSON.stringify(newDates));
      } catch (error) {
        logger.error('Error clearing custom date', error, 'EntryTests');
      }
    },
    [customDates],
  );

  // Open date edit modal
  const openDateModal = useCallback((testId: string, currentDate?: string) => {
    setEditingTestId(testId);
    setDateInput(currentDate || '');
    setDateModalVisible(true);
  }, []);

  // Handle date save
  const handleSaveDate = useCallback(() => {
    if (!editingTestId) return;
    if (dateInput.trim()) {
      saveCustomDate(editingTestId, dateInput.trim());
      Alert.alert('Date Saved! ✅', `Your test countdown will now use: ${dateInput.trim()}`);
    }
    setDateModalVisible(false);
    setEditingTestId(null);
    setDateInput('');
  }, [editingTestId, dateInput, saveCustomDate]);

  // Handle clear date
  const handleClearDate = useCallback(() => {
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
      ],
    );
  }, [editingTestId, clearCustomDate]);

  // Filtered tests
  const filteredTests = useMemo(() => {
    return ENTRY_TESTS_DATA.filter(test => {
      const matchesCategory = activeFilter === 'All' || getTestCategory(test) === activeFilter;
      if (!matchesCategory) return false;

      const query = debouncedSearchQuery.toLowerCase().trim();
      if (!query) return true;

      const nameLower = test.name.toLowerCase();
      const fullNameLower = (test.full_name || '').toLowerCase();
      const bodyLower = test.conducting_body.toLowerCase();
      const descLower = (test.description || '').toLowerCase();
      const applicableLower = (test.applicable_for || []).join(' ').toLowerCase();

      if (
        nameLower.includes(query) ||
        fullNameLower.includes(query) ||
        bodyLower.includes(query) ||
        descLower.includes(query) ||
        applicableLower.includes(query)
      )
        return true;

      const nameWords = nameLower.split(/[\s,\-()]+/);
      if (nameWords.some(w => w.startsWith(query))) return true;

      const bodyWords = bodyLower.split(/[\s,\-()]+/);
      if (bodyWords.some(w => w.startsWith(query))) return true;

      const fullNameWords = fullNameLower.split(/[\s,\-()]+/).filter(w => w.length > 0);
      const abbr = fullNameWords.map(w => w[0]).join('');
      if (abbr.startsWith(query)) return true;

      if (test.variants && test.variants.length > 0) {
        const variantMatch = test.variants.some((variant: EntryTestVariant) => {
          const variantNameLower = variant.name.toLowerCase();
          const variantFullNameLower = (variant.full_name || '').toLowerCase();
          const variantApplicableLower = (variant.applicable_for || []).join(' ').toLowerCase();
          return (
            variantNameLower.includes(query) ||
            variantFullNameLower.includes(query) ||
            variantApplicableLower.includes(query) ||
            variantNameLower.split(/[\s,\-()]+/).some(w => w.startsWith(query))
          );
        });
        if (variantMatch) return true;
      }

      return false;
    });
  }, [activeFilter, debouncedSearchQuery]);

  // Open test detail modal
  const openModal = useCallback(
    (test: EntryTestData) => {
      setSelectedTest(test);
      setModalVisible(true);
      Animated.spring(modalAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    },
    [modalAnim],
  );

  // Close test detail modal
  const closeModal = useCallback(() => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedTest(null);
    });
  }, [modalAnim]);

  // Open test registration website
  const openRegistrationUrl = useCallback((test: EntryTestData) => {
    if (test.website) {
      Linking.openURL(test.website).catch(err => {
        logger.error('Error opening registration URL', err, 'EntryTests');
        Alert.alert('Error', 'Unable to open registration website. Please visit: ' + test.website);
      });
    } else {
      Alert.alert('Website Not Available', 'Registration website is not available for this test.');
    }
  }, []);

  return {
    // Theme
    colors,
    isDark,
    // Filters
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    // Test list
    filteredTests,
    // Detail modal
    selectedTest,
    modalVisible,
    modalAnim,
    openModal,
    closeModal,
    openRegistrationUrl,
    // Custom dates
    customDates,
    dateModalVisible,
    editingTestId,
    dateInput,
    setDateInput,
    setDateModalVisible,
    openDateModal,
    handleSaveDate,
    handleClearDate,
    // Animations
    headerAnim,
  };
};
