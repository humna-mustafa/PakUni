/**
 * useDeadlinesScreen - Hook for PremiumDeadlinesScreen
 * Manages followed universities, filtering, and deadline actions
 * IMPROVED: Personalized filtering based on user profile
 */

import {useState, useRef, useEffect, useCallback, useMemo} from 'react';
import {Animated, Alert, Linking} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {logger} from '../utils/logger';
import {Haptics} from '../utils/haptics';
import {
  ADMISSION_DEADLINES,
  AdmissionDeadline,
  getDeadlineStatus,
} from '../data/deadlines';
import {ENTRY_TESTS_DATA} from '../data/entryTests';
import {RelatedEntryTest} from '../components/deadlines/DeadlineCard';

const FOLLOWED_UNIVERSITIES_KEY = '@pakuni_followed_universities';

/**
 * Map programCategory → relevant entry test IDs for that category.
 */
const CATEGORY_TO_ENTRY_TEST_IDS: Record<string, string[]> = {
  'medical':          ['mdcat-2026', 'nums-2026'],
  'engineering':      ['ecat-punjab-2026', 'nust-net-2026', 'etea-2026', 'giki-2026'],
  'computer-science': ['nust-net-2026', 'fast-nu-2026', 'nat-2026'],
  'business':         ['lums-lcat-2026', 'iba-test-2026', 'nat-2026'],
  'law':              ['hec-lat-2026', 'lums-lcat-2026'],
  'arts':             ['nca-test-2026', 'bnu-test-2026'],
  'general':          [],
  'all':              [],
};

/** Get related entry tests for a given deadline */
const getRelatedEntryTests = (deadline: AdmissionDeadline): RelatedEntryTest[] => {
  const ids = CATEGORY_TO_ENTRY_TEST_IDS[deadline.programCategory] ?? [];
  if (ids.length === 0) return [];
  const tests: RelatedEntryTest[] = [];
  ids.forEach(id => {
    const found = ENTRY_TESTS_DATA.find(t => t.id === id);
    if (found) {
      tests.push({id: found.id, name: found.name, programCategory: deadline.programCategory});
    }
  });
  return tests;
};

/**
 * Map user's targetField to relevant programCategory values for filtering.
 * Returns an array of categories to include (always includes 'general').
 */
const mapTargetFieldToCategories = (targetField: string | null | undefined): string[] => {
  if (!targetField) return ['general'];
  const field = targetField.toLowerCase();
  if (
    field.includes('software') || field.includes('computer') ||
    field.includes('cs') || field.includes('information technology') || field.includes(' it ') ||
    field.includes('artificial intelligence') || field.includes('data')
  ) {
    // CS/IT → show computer-science, engineering, and general
    return ['computer-science', 'engineering', 'general'];
  }
  if (
    field.includes('engineer') || field.includes('electrical') || field.includes('mechanical') ||
    field.includes('civil') || field.includes('chemical') || field.includes('telecom')
  ) {
    return ['engineering', 'general'];
  }
  if (
    field.includes('medicine') || field.includes('medical') || field.includes('doctor') ||
    field.includes('mbbs') || field.includes('health') || field.includes('pharma') ||
    field.includes('dentist') || field.includes('nursing') || field.includes('bds')
  ) {
    return ['medical', 'general'];
  }
  if (
    field.includes('business') || field.includes('commerce') || field.includes('mba') ||
    field.includes('finance') || field.includes('marketing') || field.includes('account') ||
    field.includes('economics') || field.includes('management')
  ) {
    return ['business', 'general'];
  }
  if (field.includes('law') || field.includes('legal') || field.includes('llb')) {
    return ['law', 'general'];
  }
  if (
    field.includes('art') || field.includes('design') || field.includes('architecture') ||
    field.includes('media') || field.includes('film') || field.includes('fashion')
  ) {
    return ['arts', 'general'];
  }
  return ['general'];
};

export const useDeadlinesScreen = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();
  const {user} = useAuth();

  // Auto-detect user's field for personalization
  const userCategories = useMemo(() => mapTargetFieldToCategories(user?.targetField), [user?.targetField]);
  // Primary display category (first non-general)
  const userCategory = useMemo(() => userCategories.find(c => c !== 'general') || 'all', [userCategories]);
  const isPersonalized = userCategory !== 'all';

  // Start with personalized category if user has a profile, otherwise 'all'
  const [selectedCategory, setSelectedCategory] = useState(isPersonalized ? userCategory : 'all');
  const [followedUniversities, setFollowedUniversities] = useState<string[]>([]);
  const [showFollowedOnly, setShowFollowedOnly] = useState(false);
  const [showPersonalized, setShowPersonalized] = useState(isPersonalized);

  // When personalization is toggled off, reset category to 'all'
  const handleSetShowPersonalized = useCallback((value: boolean) => {
    setShowPersonalized(value);
    if (!value) {
      setSelectedCategory('all');
    } else if (isPersonalized) {
      setSelectedCategory(userCategory);
    }
  }, [isPersonalized, userCategory]);

  const headerAnim = useRef(new Animated.Value(0)).current;

  // Load followed universities
  useEffect(() => {
    const loadFollowed = async () => {
      try {
        const saved = await AsyncStorage.getItem(FOLLOWED_UNIVERSITIES_KEY);
        if (saved) {
          const parsed: string[] = JSON.parse(saved);
          const validIds = new Set(ADMISSION_DEADLINES.map(d => d.universityId));
          const validated = parsed.filter(id => validIds.has(id));
          setFollowedUniversities(validated);
          if (validated.length !== parsed.length) {
            await AsyncStorage.setItem(FOLLOWED_UNIVERSITIES_KEY, JSON.stringify(validated));
          }
        }
      } catch (error) {
        logger.debug('Failed to load followed universities', error, 'Deadlines');
      }
    };
    loadFollowed();
  }, []);

  // Animate header
  useEffect(() => {
    Animated.timing(headerAnim, {toValue: 1, duration: 600, useNativeDriver: true}).start();
  }, []);

  // Filter deadlines with personalization
  const filteredDeadlines = useMemo(() => {
    let deadlines = [...ADMISSION_DEADLINES];

    // Personalization: filter by all relevant categories for user's field
    if (showPersonalized && isPersonalized) {
      deadlines = deadlines.filter(d => userCategories.includes(d.programCategory));
    } else if (selectedCategory !== 'all') {
      deadlines = deadlines.filter(d => d.programCategory === selectedCategory);
    }

    if (showFollowedOnly) {
      deadlines = deadlines.filter(d => followedUniversities.includes(d.universityId));
    }

    return deadlines.sort((a, b) => {
      const statusOrder: Record<string, number> = {'closing-soon': 0, 'open': 1, 'upcoming': 2, 'closed': 3};
      const aStatus = getDeadlineStatus(a);
      const bStatus = getDeadlineStatus(b);
      if (statusOrder[aStatus] !== statusOrder[bStatus]) {
        return statusOrder[aStatus] - statusOrder[bStatus];
      }
      return new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime();
    });
  }, [selectedCategory, showFollowedOnly, followedUniversities, showPersonalized, isPersonalized, userCategories]);

  // Handle follow toggle
  const handleFollowToggle = useCallback(async (universityId: string) => {
    Haptics.light();
    const isFollowed = followedUniversities.includes(universityId);
    let newFollowed: string[];

    if (isFollowed) {
      newFollowed = followedUniversities.filter(id => id !== universityId);
    } else {
      newFollowed = [...followedUniversities, universityId];
      if (followedUniversities.length === 0) {
        Alert.alert(
          'Enable Notifications?',
          'Would you like to receive notifications about admission deadlines for universities you follow?',
          [
            {text: 'Not Now', style: 'cancel'},
            {text: 'Enable', onPress: () => Alert.alert('Notifications Enabled', "You'll be notified about upcoming deadlines.")},
          ],
        );
      }
    }

    setFollowedUniversities(newFollowed);
    try {
      await AsyncStorage.setItem(FOLLOWED_UNIVERSITIES_KEY, JSON.stringify(newFollowed));
    } catch (error) {
      logger.debug('Failed to save followed universities', error, 'Deadlines');
    }
  }, [followedUniversities]);

  // Handle apply
  const handleApply = useCallback((deadline: AdmissionDeadline) => {
    Haptics.light();
    if (deadline.link) {
      Alert.alert(
        'Open Application Portal',
        `You'll be redirected to ${deadline.universityShortName}'s admission portal.`,
        [{text: 'Cancel', style: 'cancel'}, {text: 'Open', onPress: () => Linking.openURL(deadline.link!)}],
      );
    } else {
      Alert.alert('Visit University Website', `Please visit ${deadline.universityName}'s website for application details.`);
    }
  }, []);

  // Stats
  const stats = useMemo(() => {
    const openCount = filteredDeadlines.filter(d => getDeadlineStatus(d) === 'open').length;
    const closingSoonCount = filteredDeadlines.filter(d => getDeadlineStatus(d) === 'closing-soon').length;
    const upcomingCount = filteredDeadlines.filter(d => getDeadlineStatus(d) === 'upcoming').length;
    return {openCount, closingSoonCount, upcomingCount};
  }, [filteredDeadlines]);

  // Navigate to entry test detail
  const handleEntryTestPress = useCallback((testId: string) => {
    Haptics.light();
    (navigation as any).navigate('EntryTests', {preselectedTestId: testId});
  }, [navigation]);

  return {
    colors, isDark, navigation,
    selectedCategory, setSelectedCategory,
    followedUniversities, showFollowedOnly, setShowFollowedOnly,
    headerAnim, filteredDeadlines, stats,
    handleFollowToggle, handleApply,
    getRelatedEntryTests,
    handleEntryTestPress,
    // Personalization
    isPersonalized,
    showPersonalized,
    setShowPersonalized: handleSetShowPersonalized,
    userCategory,
    userCategories,
    // Human-readable label for the user's field (from profile or derived)
    userFieldLabel: user?.targetField
      ? user.targetField.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : userCategory.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    userName: user?.fullName?.split(' ')[0] || null,
  };
};
