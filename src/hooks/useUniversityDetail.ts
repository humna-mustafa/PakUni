/**
 * Hook for University Detail Screen
 * Manages all state, data fetching, and handlers
 */

import {useState, useMemo, useRef, useEffect, useCallback} from 'react';
import {Animated, Alert, Linking} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {UNIVERSITIES, PROGRAMS, MERIT_FORMULAS, getScholarshipsForUniversity, MERIT_RECORDS} from '../data';
import {getUniversityMeritSummaryByShortName} from '../services/meritLists';
import {findUniversitiesByAlias} from '../utils/universityAliases';
import {analytics} from '../services/analytics';
import {logger} from '../utils/logger';
import type {RootStackParamList} from '../navigation/AppNavigator';
import type {TabType, MeritSummary} from '../types/universityDetail';

type UniversityDetailRouteProp = RouteProp<RootStackParamList, 'UniversityDetail'>;

const HEADER_MAX_HEIGHT = 280;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export const useUniversityDetail = () => {
  const route = useRoute<UniversityDetailRouteProp>();
  const navigation = useNavigation();
  const {universityId} = route.params;
  const {colors, isDark} = useTheme();
  const {addFavorite, removeFavorite, isFavorite, isGuest} = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isFav, setIsFav] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  // Check if university is favorited
  useEffect(() => {
    setIsFav(isFavorite(universityId, 'university'));
  }, [universityId, isFavorite]);

  // Toggle favorite handler
  const handleToggleFavorite = useCallback(async () => {
    if (isGuest) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to save universities to your favorites.',
        [{text: 'OK'}],
      );
      return;
    }

    try {
      if (isFav) {
        await removeFavorite(universityId, 'university');
        setIsFav(false);
      } else {
        await addFavorite(universityId, 'university');
        setIsFav(true);
      }
    } catch (error) {
      logger.error('Error toggling favorite', error, 'UniversityDetail');
    }
  }, [isGuest, isFav, universityId, addFavorite, removeFavorite]);

  // Track university view for analytics
  useEffect(() => {
    let found = UNIVERSITIES.find(u => u.short_name === universityId);
    if (!found && universityId) {
      const aliasMatches = findUniversitiesByAlias(universityId);
      if (aliasMatches.length > 0) {
        found = UNIVERSITIES.find(u => aliasMatches.includes(u.short_name));
      }
    }
    if (found) {
      analytics.trackUniversityView(found.short_name, found.name);
    }
  }, [universityId]);

  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const university = useMemo(() => {
    let found = UNIVERSITIES.find(u => u.short_name === universityId);

    if (!found && universityId) {
      const aliasMatches = findUniversitiesByAlias(universityId);
      if (aliasMatches.length > 0) {
        found = UNIVERSITIES.find(u => aliasMatches.includes(u.short_name));
      }
    }

    if (!found && universityId) {
      found = UNIVERSITIES.find(
        u =>
          u.short_name.toLowerCase() === universityId.toLowerCase() ||
          u.name.toLowerCase().includes(universityId.toLowerCase()),
      );
    }

    return found;
  }, [universityId]);

  const universityPrograms = useMemo(() => {
    if (!university) return [];
    return PROGRAMS.filter(p => 
      p.universities?.some(u => 
        u.toLowerCase() === university.short_name.toLowerCase()
      )
    ).slice(0, 20);
  }, [university]);

  const universityScholarships = useMemo(() => {
    if (!university) return [];
    return getScholarshipsForUniversity(university.short_name);
  }, [university]);

  const meritFormulas = useMemo(() => {
    if (!university) return [];
    try {
      return MERIT_FORMULAS.filter(f => {
        const uniLower = f.university?.toLowerCase() || '';
        const shortName = university?.short_name?.toLowerCase() || '';
        const province = university?.province?.toLowerCase() || '';
        return (
          uniLower.includes(shortName) ||
          uniLower.includes('general') ||
          uniLower.includes(province)
        );
      }).slice(0, 3);
    } catch (error) {
      logger.error('Error computing merit formulas', error, 'UniversityDetail');
      return [];
    }
  }, [university]);

  const openLink = useCallback(async (url?: string) => {
    if (!url) {
      Alert.alert(
        'Link Not Available',
        'This link is not available at the moment. Please try again later or visit the university website directly.',
        [{text: 'OK'}],
      );
      return;
    }

    try {
      let formattedUrl = url;
      if (
        !url.startsWith('http://') &&
        !url.startsWith('https://') &&
        !url.startsWith('mailto:') &&
        !url.startsWith('tel:')
      ) {
        formattedUrl = 'https://' + url;
      }

      const canOpen = await Linking.canOpenURL(formattedUrl);
      if (canOpen) {
        await Linking.openURL(formattedUrl);
      } else {
        Alert.alert(
          'Unable to Open Link',
          'Could not open this link. Please try copying it manually or check your internet connection.',
          [{text: 'OK'}],
        );
      }
    } catch (error) {
      logger.error('Error opening URL', error, 'UniversityDetail');
      Alert.alert(
        'Error Opening Link',
        'There was a problem opening this link. Please try again.',
        [{text: 'OK'}],
      );
    }
  }, []);

  const meritSummary: MeritSummary = useMemo(() => {
    if (!university?.short_name)
      return {programs: [], years: [], totalRecords: 0, trend: null, campuses: []};
    try {
      return (
        getUniversityMeritSummaryByShortName(
          MERIT_RECORDS,
          university.short_name,
        ) || {programs: [], years: [], totalRecords: 0, trend: null, campuses: []}
      );
    } catch (error) {
      logger.error('Error computing merit summary', error, 'UniversityDetail');
      return {programs: [], years: [], totalRecords: 0, trend: null, campuses: []};
    }
  }, [university?.short_name]);

  // Scroll interpolations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return {
    navigation,
    colors,
    isDark,
    activeTab,
    setActiveTab,
    isFav,
    university,
    universityPrograms,
    universityScholarships,
    meritFormulas,
    meritSummary,
    scrollY,
    headerHeight,
    headerTitleOpacity,
    heroOpacity,
    handleToggleFavorite,
    openLink,
  };
};
