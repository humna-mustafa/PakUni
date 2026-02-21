import {useRef, useState, useCallback, useMemo} from 'react';
import {Animated} from 'react-native';
import {useNavigation, CompositeNavigationProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {useNotifications, LocalNotification} from '../services/notifications';
import {findUniversitiesByAlias} from '../utils/universityAliases';
import {UNIVERSITIES} from '../data/universities';
import {SCHOLARSHIPS} from '../data/scholarships';
import type {Notification} from '../components/NotificationBell';
import type {RootStackParamList, TabParamList} from '../navigation/AppNavigator';
import type {QuickAction} from '../components/home/QuickActionCard';

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList>,
  BottomTabNavigationProp<TabParamList>
>;

// Scholarship-related keywords for intelligent search routing
const SCHOLARSHIP_KEYWORDS = [
  'scholarship', 'scholarships', 'hec', 'ehsaas', 'peef', 'need-based', 'need based',
  'merit-based', 'merit based', 'stipend', 'financial aid', 'funding', 'grant',
  'fulbright', 'chevening', 'usaid', 'daad', 'commonwealth',
];

// Helper to convert local notifications to NotificationBell format
const convertToNotification = (local: LocalNotification): Notification => {
  const typeMap: Record<string, Notification['type']> = {
    scholarship: 'scholarship',
    admission: 'deadline',
    test: 'alert',
    tip: 'news',
    update: 'update',
    general: 'news',
  };
  return {
    id: local.id,
    type: typeMap[local.type] || 'news',
    title: local.title,
    message: local.body,
    timestamp: new Date(local.createdAt),
    read: local.read,
  };
};

export function useHomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {colors, isDark} = useTheme();
  const {user} = useAuth();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery] = useState('');

  // Real notifications from notification service
  const {notifications: localNotifications, markAsRead, clearAll} = useNotifications();

  // Convert to NotificationBell format
  const bellNotifications: Notification[] = useMemo(
    () => localNotifications.map(convertToNotification),
    [localNotifications],
  );

  // Handle search submission - intelligently routes to Universities or Scholarships
  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();

      // Check if search matches a university by abbreviation/alias
      const aliasMatches = findUniversitiesByAlias(query);
      const universityMatch =
        UNIVERSITIES.some(
          u =>
            u.short_name.toLowerCase().includes(query) ||
            u.name.toLowerCase().includes(query) ||
            u.name
              .toLowerCase()
              .split(/[\s,\-()]+/)
              .some(w => w.startsWith(query)),
        ) || aliasMatches.length > 0;

      // Check if search is scholarship-related
      const isScholarshipSearch = SCHOLARSHIP_KEYWORDS.some(keyword => query.includes(keyword));

      // Check if it matches a scholarship name
      const scholarshipMatch =
        typeof SCHOLARSHIPS !== 'undefined' &&
        Array.isArray(SCHOLARSHIPS) &&
        SCHOLARSHIPS.some(
          (s: any) =>
            s.name?.toLowerCase().includes(query) || s.short_name?.toLowerCase().includes(query),
        );

      if (isScholarshipSearch || (scholarshipMatch && !universityMatch)) {
        navigation.navigate('MainTabs', {
          screen: 'Scholarships',
          params: {searchQuery: searchQuery.trim()},
        });
      } else {
        navigation.navigate('MainTabs', {
          screen: 'Universities',
          params: {searchQuery: searchQuery.trim()},
        });
      }
    }
  }, [searchQuery, navigation]);

  const handleNavigate = useCallback(
    (screen: string) => {
      switch (screen) {
        case 'Calculator':
          navigation.navigate('Calculator');
          break;
        case 'EntryTests':
          navigation.navigate('EntryTests');
          break;
        case 'Compare':
          navigation.navigate('Compare');
          break;
        case 'CareerGuidance':
          navigation.navigate('CareerGuidance');
          break;
        case 'Recommendations':
          navigation.navigate('Recommendations');
          break;
        case 'Polls':
          navigation.navigate('Polls');
          break;
        case 'Deadlines':
          navigation.navigate('Deadlines');
          break;
        case 'MeritArchive':
          navigation.navigate('MeritArchive');
          break;
        case 'KidsHub':
          navigation.navigate('KidsHub');
          break;
        case 'InterestQuiz':
          navigation.navigate('InterestQuiz');
          break;
        case 'Guides':
          navigation.navigate('Guides');
          break;
        case 'Tools':
          navigation.navigate('Tools');
          break;
        case 'ResultGame':
          navigation.navigate('ResultGame');
          break;
        case 'Achievements':
          navigation.navigate('Achievements');
          break;
        case 'ContactSupport':
          navigation.navigate('ContactSupport');
          break;
        case 'Profile':
          navigation.navigate('Profile');
          break;
        case 'Favorites':
          navigation.navigate('Favorites');
          break;
        case 'Universities':
          navigation.navigate('MainTabs', {screen: 'Universities'});
          break;
        case 'Scholarships':
          navigation.navigate('MainTabs', {screen: 'Scholarships'});
          break;
        default:
          break;
      }
    },
    [navigation],
  );

  // Quick Actions - Essential tools not in main nav bar
  const quickActions: QuickAction[] = useMemo(
    () => [
      {id: '1', iconName: 'apps-outline', title: 'All Tools', color: colors.primary, screen: 'Tools'},
      {id: '2', iconName: 'clipboard-outline', title: 'Entry Tests', color: '#DC2626', screen: 'EntryTests'},
      {id: '3', iconName: 'compass-outline', title: 'Career Guide', color: '#059669', screen: 'CareerGuidance'},
      {id: '4', iconName: 'library-outline', title: 'Study Guides', color: colors.primary, screen: 'Guides'},
      {id: '5', iconName: 'time-outline', title: 'Deadlines', color: '#EF4444', screen: 'Deadlines'},
      {id: '6', iconName: 'game-controller-outline', title: 'Score Game', color: '#F59E0B', screen: 'ResultGame'},
    ],
    [colors.primary],
  );

  return {
    navigation,
    colors,
    isDark,
    user,
    scrollY,
    searchQuery,
    setSearchQuery,
    bellNotifications,
    markAsRead,
    clearAll,
    handleSearch,
    handleNavigate,
    quickActions,
  };
}
