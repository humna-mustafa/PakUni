/**
 * useProfileScreen - All state & logic for PremiumProfileScreen
 */

import {useState, useRef, useEffect, useCallback} from 'react';
import {Animated, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {ANIMATION} from '../constants/design';
import {useTheme, ThemeMode} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {logger} from '../utils/logger';
import {adminService, UserRole} from '../services/admin';
import {UNIVERSITIES, SCHOLARSHIPS} from '../data';
import {
  UserProfile,
  SavedItem,
  EditField,
  INITIAL_PROFILE,
} from '../components/profile/constants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const useProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {colors, isDark, themeMode, setThemeMode} = useTheme();
  const {user, signOut, isGuest, isFavorite, removeFavorite, updateProfile: updateAuthProfile} = useAuth();

  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'marks' | 'saved' | 'settings'>('profile');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [editField, setEditField] = useState<EditField>({key: '', label: '', type: 'text'});
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [marksSaved, setMarksSaved] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Build real saved items from user favorites
  const buildSavedItems = useCallback(() => {
    if (!user) return [];
    const items: SavedItem[] = [];

    (user.favoriteUniversities || []).forEach((shortName: string) => {
      const uni = UNIVERSITIES.find(u => u.short_name === shortName);
      if (uni) {
        items.push({id: shortName, type: 'university', name: uni.name, addedAt: new Date().toISOString()});
      }
    });

    (user.favoriteScholarships || []).forEach((scholarshipId: string) => {
      const scholarship = SCHOLARSHIPS.find((s: any) => s.id === scholarshipId);
      if (scholarship) {
        items.push({id: scholarshipId, type: 'scholarship', name: scholarship.name, addedAt: new Date().toISOString()});
      }
    });

    (user.favoritePrograms || []).forEach((programId: string) => {
      items.push({id: programId, type: 'program', name: programId, addedAt: new Date().toISOString()});
    });

    return items;
  }, [user]);

  useEffect(() => {
    Animated.spring(headerAnim, {toValue: 1, ...ANIMATION.spring.gentle, useNativeDriver: true}).start();
    if (user) {
      if (user.role) {
        setUserRole(user.role as UserRole);
      } else {
        checkUserRole();
      }
      setProfile(prev => ({
        ...prev,
        name: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || 'Lahore',
        currentClass: user.currentClass || '2nd Year (FSc/FA)',
        board: user.board || 'Punjab Board',
        school: user.school || '',
        matricMarks: user.matricMarks || null,
        matricTotal: user.matricTotal || 1100,
        interMarks: user.interMarks || null,
        interTotal: user.interTotal || 1100,
        entryTestScore: user.entryTestScore || null,
        entryTestTotal: user.entryTestTotal || 200,
        targetField: user.targetField || 'Not Decided',
        targetUniversity: user.targetUniversity || '',
        interests: user.interests || [],
      }));
      setSavedItems(buildSavedItems());
      logger.debug('User loaded', {email: user.email, role: user.role}, 'Profile');
    }
  }, [user, buildSavedItems]);

  const checkUserRole = async () => {
    try {
      const role = await adminService.getCurrentUserRole();
      if (role) setUserRole(role);
    } catch (error) {
      logger.debug('Error checking user role', error, 'Profile');
    }
  };

  const isAdminUser = useCallback(
    () => ['admin', 'super_admin', 'moderator', 'content_editor'].includes(userRole),
    [userRole],
  );

  const updateProfile = useCallback(
    (key: string, value: any) => {
      setProfile(prev => ({...prev, [key]: value}));
      const keyMapping: Record<string, string> = {
        name: 'fullName', phone: 'phone', city: 'city',
        currentClass: 'currentClass', board: 'board', school: 'school',
        matricMarks: 'matricMarks', matricTotal: 'matricTotal',
        interMarks: 'interMarks', interTotal: 'interTotal',
        entryTestScore: 'entryTestScore', entryTestTotal: 'entryTestTotal',
        targetField: 'targetField', targetUniversity: 'targetUniversity',
        interests: 'interests',
      };
      if (!isGuest && keyMapping[key]) {
        updateAuthProfile({[keyMapping[key]]: value});
      }
    },
    [isGuest, updateAuthProfile],
  );

  const toggleInterest = useCallback(
    (interest: string) => {
      if (profile.interests.includes(interest)) {
        updateProfile('interests', profile.interests.filter(i => i !== interest));
      } else {
        updateProfile('interests', [...profile.interests, interest]);
      }
    },
    [profile.interests, updateProfile],
  );

  const removeSavedItem = useCallback(
    (item: SavedItem) => {
      Alert.alert('Remove Item', `Remove ${item.name} from favorites?`, [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeFavorite(item.id, item.type);
            setSavedItems(prev => prev.filter(i => i.id !== item.id));
          },
        },
      ]);
    },
    [removeFavorite],
  );

  const getProfileCompletion = useCallback(() => {
    let completed = 0;
    const total = 8;
    if (profile.name && profile.name.trim() !== '' && profile.name !== 'Student') completed++;
    if (profile.email && profile.email.trim() !== '') completed++;
    if (profile.city && !isGuest) completed++;
    if (profile.matricMarks && profile.matricMarks > 0) completed++;
    if (profile.interMarks && profile.interMarks > 0) completed++;
    if (profile.entryTestScore && profile.entryTestScore > 0) completed++;
    if (profile.targetField && profile.targetField !== 'Not Decided') completed++;
    if (profile.interests && profile.interests.length > 0) completed++;
    return Math.round((completed / total) * 100);
  }, [profile, isGuest]);

  const openEditModal = useCallback((field: EditField) => {
    setEditField(field);
    setShowEditModal(true);
  }, []);

  const saveMarks = useCallback(() => {
    setMarksSaved(true);
    setTimeout(() => setMarksSaved(false), 2500);
  }, []);

  const navigateToCalculator = useCallback(() => navigation.navigate('Calculator'), [navigation]);
  const navigateToRecommendations = useCallback(() => navigation.navigate('Recommendations'), [navigation]);
  const navigateToNotifications = useCallback(() => navigation.navigate('Notifications'), [navigation]);
  const navigateToSettings = useCallback(() => navigation.navigate('Settings'), [navigation]);
  const navigateToContactSupport = useCallback(() => navigation.navigate('ContactSupport'), [navigation]);
  const navigateToAdmin = useCallback(
    () => navigation.navigate('Admin', {screen: 'AdminDashboard'}),
    [navigation],
  );

  return {
    // Theme & auth
    colors, isDark, themeMode, setThemeMode,
    user, signOut, isGuest,
    // Profile data
    profile, savedItems, activeTab, setActiveTab,
    userRole, isAdminUser, marksSaved,
    // Modals
    showEditModal, setShowEditModal, showThemeModal, setShowThemeModal,
    editField, openEditModal,
    // Actions
    updateProfile, toggleInterest, removeSavedItem,
    getProfileCompletion, saveMarks,
    // Navigation
    navigateToCalculator, navigateToRecommendations,
    navigateToNotifications, navigateToSettings,
    navigateToContactSupport, navigateToAdmin,
    // Animation
    headerAnim,
  };
};
