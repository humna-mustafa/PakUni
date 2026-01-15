import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {TYPOGRAPHY, SPACING, RADIUS, ANIMATION} from '../constants/design';
import {useTheme, ThemeMode} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {Icon} from '../components/icons';
import {adminService, UserRole} from '../services/admin';
import {UNIVERSITIES, SCHOLARSHIPS} from '../data';

// Fallback LinearGradient
let LinearGradient: React.ComponentType<any>;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch (e) {
  LinearGradient = ({children, colors, style, ...props}: any) => (
    <View style={[style, {backgroundColor: colors?.[0] || '#1A7AEB'}]} {...props}>
      {children}
    </View>
  );
}

const {width} = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Interfaces
interface UserProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
  currentClass: string;
  board: string;
  school: string;
  matricMarks: number | null;
  interMarks: number | null;
  entryTestScore: number | null;
  targetField: string;
  targetUniversity: string;
  interests: string[];
}

interface SavedItem {
  id: string;
  type: 'university' | 'scholarship' | 'program';
  name: string;
  addedAt: string;
}

// Data
const EDUCATION_LEVELS = ['9th Class', '10th Class (Matric)', '1st Year (FSc/FA)', '2nd Year (FSc/FA)', 'Gap Year', 'University Student'];
const BOARDS = ['Federal Board', 'Punjab Board', 'Sindh Board', 'KPK Board', 'Balochistan Board', 'Cambridge O/A Levels'];
const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Other'];
const TARGET_FIELDS = ['Medical (MBBS/BDS)', 'Engineering', 'Computer Science', 'Business', 'Law', 'Arts & Design', 'Not Decided'];
const INTERESTS_DATA = [
  {label: 'Medicine', iconName: 'medkit-outline'},
  {label: 'Technology', iconName: 'laptop-outline'},
  {label: 'Engineering', iconName: 'construct-outline'},
  {label: 'Business', iconName: 'briefcase-outline'},
  {label: 'Law', iconName: 'document-text-outline'},
  {label: 'Arts', iconName: 'color-palette-outline'},
  {label: 'Teaching', iconName: 'school-outline'},
  {label: 'Science', iconName: 'flask-outline'},
  {label: 'Music', iconName: 'musical-notes-outline'},
  {label: 'Sports', iconName: 'football-outline'},
  {label: 'Reading', iconName: 'book-outline'},
  {label: 'Writing', iconName: 'create-outline'},
];

const INITIAL_PROFILE: UserProfile = {
  name: '',
  email: '',
  phone: '',
  city: 'Lahore',
  currentClass: '2nd Year (FSc/FA)',
  board: 'Punjab Board',
  school: '',
  matricMarks: null,
  interMarks: null,
  entryTestScore: null,
  targetField: 'Not Decided',
  targetUniversity: '',
  interests: [],
};

// No more sample data - we use real favorites from AuthContext

// Animated Tab Component
const AnimatedTab = ({
  tab,
  isActive,
  onPress,
  colors,
}: {
  tab: {id: string; iconName: string; label: string};
  isActive: boolean;
  onPress: () => void;
  colors: any;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {toValue: 0.9, duration: 80, useNativeDriver: true}),
      Animated.spring(scaleAnim, {toValue: 1, ...ANIMATION.spring.snappy, useNativeDriver: true}),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{flex: 1, transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        style={[styles.tab, isActive && {backgroundColor: colors.primaryLight}]}
        onPress={handlePress}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityState={{selected: isActive}}
        accessibilityLabel={`${tab.label} section`}>
        <Icon name={tab.iconName} family="Ionicons" size={20} color={isActive ? colors.primary : colors.textSecondary} />
        <Text style={[styles.tabLabel, {color: isActive ? colors.primary : colors.textSecondary}, isActive && styles.tabLabelActive]}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Stats Card Component
const StatsCard = ({
  value,
  label,
  iconName,
  gradient,
  delay,
}: {
  value: string;
  label: string;
  iconName: string;
  gradient: string[];
  delay: number;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay,
      ...ANIMATION.spring.bouncy,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.statsCard, {transform: [{scale: scaleAnim}]}]}>
      <LinearGradient colors={gradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.statsGradient}>
        <Icon name={iconName} family="Ionicons" size={24} color="#FFFFFF" />
        <Text style={styles.statsValue}>{value}</Text>
        <Text style={styles.statsLabel}>{label}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

const PremiumProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {colors, isDark, themeMode, setThemeMode} = useTheme();
  const {user, signOut, isGuest, isFavorite, removeFavorite} = useAuth();
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'marks' | 'saved' | 'settings'>('profile');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [editField, setEditField] = useState<{key: string; label: string; type: string; options?: string[]}>({key: '', label: '', type: 'text'});
  const [userRole, setUserRole] = useState<UserRole>('user');
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Build real saved items from user favorites
  const buildSavedItems = useCallback(() => {
    if (!user) return [];
    
    const items: SavedItem[] = [];
    
    // Add favorite universities
    (user.favoriteUniversities || []).forEach((shortName: string) => {
      const uni = UNIVERSITIES.find(u => u.short_name === shortName);
      if (uni) {
        items.push({
          id: shortName,
          type: 'university',
          name: uni.name,
          addedAt: new Date().toISOString(),
        });
      }
    });
    
    // Add favorite scholarships
    (user.favoriteScholarships || []).forEach((scholarshipId: string) => {
      const scholarship = SCHOLARSHIPS.find((s: any) => s.id === scholarshipId);
      if (scholarship) {
        items.push({
          id: scholarshipId,
          type: 'scholarship',
          name: scholarship.name,
          addedAt: new Date().toISOString(),
        });
      }
    });
    
    // Add favorite programs
    (user.favoritePrograms || []).forEach((programId: string) => {
      items.push({
        id: programId,
        type: 'program',
        name: programId, // Programs should have proper lookup
        addedAt: new Date().toISOString(),
      });
    });
    
    return items;
  }, [user]);

  useEffect(() => {
    Animated.spring(headerAnim, {toValue: 1, ...ANIMATION.spring.gentle, useNativeDriver: true}).start();
    // Load user profile from auth context
    if (user) {
      // Use the role from the user object (loaded from profiles table)
      if (user.role) {
        setUserRole(user.role as UserRole);
      } else {
        // Fallback: fetch from admin service if not in user object
        checkUserRole();
      }
      
      setProfile(prev => ({
        ...prev,
        name: user.fullName || '',  // Use fullName from AuthContext
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || 'Lahore',
        currentClass: user.currentClass || '2nd Year (FSc/FA)',
        board: user.board || 'Punjab Board',
        school: user.school || '',
        matricMarks: user.matricMarks || null,
        interMarks: user.interMarks || null,
        entryTestScore: user.entryTestScore || null,
        targetField: user.targetField || 'Not Decided',
        targetUniversity: user.targetUniversity || '',
        interests: user.interests || [],
      }));
      
      // Build real saved items from favorites
      setSavedItems(buildSavedItems());
      
      console.log('[Profile] User loaded:', user.email, 'Role:', user.role);
    }
  }, [user, buildSavedItems]);

  const checkUserRole = async () => {
    try {
      const role = await adminService.getCurrentUserRole();
      if (role) {
        setUserRole(role);
      }
    } catch (error) {
      console.log('Error checking user role:', error);
    }
  };

  const isAdminUser = () => {
    return ['admin', 'super_admin', 'moderator', 'content_editor'].includes(userRole);
  };

  const updateProfile = (key: string, value: any) => setProfile({...profile, [key]: value});
  
  const toggleInterest = (interest: string) => {
    if (profile.interests.includes(interest)) {
      updateProfile('interests', profile.interests.filter(i => i !== interest));
    } else {
      updateProfile('interests', [...profile.interests, interest]);
    }
  };

  const removeSavedItem = (item: SavedItem) => {
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
  };

  const getProfileCompletion = () => {
    let completed = 0;
    const fields = ['name', 'email', 'city', 'currentClass', 'board', 'targetField'];
    fields.forEach(field => { if (profile[field as keyof UserProfile]) completed++; });
    if (profile.matricMarks) completed++;
    if (profile.interests.length > 0) completed++;
    return Math.round((completed / 8) * 100);
  };

  const getTypeIconName = (type: SavedItem['type']) => {
    switch (type) {
      case 'university': return 'school-outline';
      case 'scholarship': return 'wallet-outline';
      case 'program': return 'library-outline';
    }
  };

  const tabs = [
    {id: 'profile', iconName: 'person-outline', label: 'Profile'},
    {id: 'marks', iconName: 'analytics-outline', label: 'Marks'},
    {id: 'saved', iconName: 'heart-outline', label: 'Saved'},
    {id: 'settings', iconName: 'settings-outline', label: 'Settings'},
  ];

  const renderProfileTab = () => (
    <>
      {/* Completion Card */}
      <View style={[styles.completionCard, {backgroundColor: colors.card}]}>
        <View style={styles.completionHeader}>
          <View>
            <Text style={[styles.completionTitle, {color: colors.text}]}>Profile Completion</Text>
            <Text style={[styles.completionHint, {color: colors.textSecondary}]}>Complete for better recommendations</Text>
          </View>
          <View style={[styles.completionBadge, {backgroundColor: colors.primaryLight}]}>
            <Text style={[styles.completionPercent, {color: colors.primary}]}>{getProfileCompletion()}%</Text>
          </View>
        </View>
        <View style={[styles.completionBar, {backgroundColor: colors.border}]}>
          <LinearGradient
            colors={[colors.primary, '#0D47A1']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={[styles.completionFill, {width: `${getProfileCompletion()}%`}]}
          />
        </View>
      </View>

      {/* Personal Info */}
      <View style={styles.section}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
          <Icon name="person-outline" family="Ionicons" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Personal Info</Text>
        </View>
        {[
          {key: 'name', label: 'Full Name', value: profile.name, type: 'text'},
          {key: 'email', label: 'Email', value: profile.email, type: 'text'},
          {key: 'phone', label: 'Phone', value: profile.phone, type: 'text'},
          {key: 'city', label: 'City', value: profile.city, type: 'select', options: CITIES},
        ].map(item => (
          <TouchableOpacity
            key={item.key}
            style={[styles.infoRow, {backgroundColor: colors.card}]}
            onPress={() => {
              setEditField({key: item.key, label: item.label, type: item.type, options: item.options});
              setShowEditModal(true);
            }}>
            <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>{item.label}</Text>
            <View style={styles.infoValueRow}>
              <Text style={[styles.infoValue, {color: item.value ? colors.text : colors.placeholder}]}>
                {item.value || 'Not set'}
              </Text>
              <Text style={[styles.infoArrow, {color: colors.primary}]}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Education */}
      <View style={styles.section}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
          <Icon name="school-outline" family="Ionicons" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Education</Text>
        </View>
        {[
          {key: 'currentClass', label: 'Current Class', value: profile.currentClass, type: 'select', options: EDUCATION_LEVELS},
          {key: 'board', label: 'Board', value: profile.board, type: 'select', options: BOARDS},
          {key: 'school', label: 'School/College', value: profile.school, type: 'text'},
        ].map(item => (
          <TouchableOpacity
            key={item.key}
            style={[styles.infoRow, {backgroundColor: colors.card}]}
            onPress={() => {
              setEditField({key: item.key, label: item.label, type: item.type, options: item.options});
              setShowEditModal(true);
            }}>
            <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>{item.label}</Text>
            <View style={styles.infoValueRow}>
              <Text style={[styles.infoValue, {color: item.value ? colors.text : colors.placeholder}]}>
                {item.value || 'Not set'}
              </Text>
              <Text style={[styles.infoArrow, {color: colors.primary}]}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Goals */}
      <View style={styles.section}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
          <Icon name="flag-outline" family="Ionicons" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Career Goals</Text>
        </View>
        {[
          {key: 'targetField', label: 'Target Field', value: profile.targetField, type: 'select', options: TARGET_FIELDS},
          {key: 'targetUniversity', label: 'Dream University', value: profile.targetUniversity, type: 'text'},
        ].map(item => (
          <TouchableOpacity
            key={item.key}
            style={[styles.infoRow, {backgroundColor: colors.card}]}
            onPress={() => {
              setEditField({key: item.key, label: item.label, type: item.type, options: item.options});
              setShowEditModal(true);
            }}>
            <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>{item.label}</Text>
            <View style={styles.infoValueRow}>
              <Text style={[styles.infoValue, {color: item.value ? colors.text : colors.placeholder}]}>
                {item.value || 'Not set'}
              </Text>
              <Text style={[styles.infoArrow, {color: colors.primary}]}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Interests */}
      <View style={styles.section}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
          <Icon name="heart-outline" family="Ionicons" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Interests</Text>
        </View>
        <Text style={[styles.sectionHint, {color: colors.textSecondary}]}>Select for personalized recommendations</Text>
        <View style={styles.interestsGrid}>
          {INTERESTS_DATA.map(interest => (
            <TouchableOpacity
              key={interest.label}
              style={[
                styles.interestTag,
                {backgroundColor: colors.card, borderColor: colors.border},
                profile.interests.includes(interest.label) && {backgroundColor: colors.primaryLight, borderColor: colors.primary},
              ]}
              onPress={() => toggleInterest(interest.label)}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                <Icon 
                  name={interest.iconName} 
                  family="Ionicons" 
                  size={14} 
                  color={profile.interests.includes(interest.label) ? colors.primary : colors.textSecondary} 
                />
                <Text style={[
                  styles.interestText,
                  {color: colors.textSecondary},
                  profile.interests.includes(interest.label) && {color: colors.primary, fontWeight: '600'},
                ]}>
                  {interest.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );

  const renderMarksTab = () => (
    <>
      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <StatsCard value={profile.matricMarks ? `${((profile.matricMarks / 1100) * 100).toFixed(0)}%` : '—'} label="Matric" iconName="book-outline" gradient={['#3B82F6', '#2563EB']} delay={0} />
        <StatsCard value={profile.interMarks ? `${((profile.interMarks / 1100) * 100).toFixed(0)}%` : '—'} label="Inter" iconName="library-outline" gradient={['#10B981', '#059669']} delay={100} />
        <StatsCard value={profile.entryTestScore ? `${((profile.entryTestScore / 200) * 100).toFixed(0)}%` : '—'} label="Test" iconName="create-outline" gradient={['#F59E0B', '#D97706']} delay={200} />
      </View>

      {/* Matric */}
      <View style={styles.section}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
          <Icon name="book-outline" family="Ionicons" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Matric / O-Levels</Text>
        </View>
        <View style={[styles.marksCard, {backgroundColor: colors.card}]}>
          <View style={styles.marksInputRow}>
            <View style={styles.marksInputGroup}>
              <Text style={[styles.marksLabel, {color: colors.textSecondary}]}>Obtained</Text>
              <TextInput
                style={[styles.marksInput, {backgroundColor: colors.background, color: colors.text}]}
                placeholder="950"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                value={profile.matricMarks?.toString() || ''}
                onChangeText={text => updateProfile('matricMarks', parseInt(text) || null)}
              />
            </View>
            <Text style={[styles.marksDivider, {color: colors.textSecondary}]}>/</Text>
            <View style={styles.marksInputGroup}>
              <Text style={[styles.marksLabel, {color: colors.textSecondary}]}>Total</Text>
              <View style={[styles.marksFixed, {backgroundColor: colors.background}]}>
                <Text style={[styles.marksFixedText, {color: colors.textSecondary}]}>1100</Text>
              </View>
            </View>
            <View style={[styles.percentBadge, {backgroundColor: colors.primaryLight}]}>
              <Text style={[styles.percentText, {color: colors.primary}]}>
                {profile.matricMarks ? ((profile.matricMarks / 1100) * 100).toFixed(1) : '0'}%
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Inter */}
      <View style={styles.section}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
          <Icon name="library-outline" family="Ionicons" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>FSc / A-Levels</Text>
        </View>
        <View style={[styles.marksCard, {backgroundColor: colors.card}]}>
          <View style={styles.marksInputRow}>
            <View style={styles.marksInputGroup}>
              <Text style={[styles.marksLabel, {color: colors.textSecondary}]}>Obtained</Text>
              <TextInput
                style={[styles.marksInput, {backgroundColor: colors.background, color: colors.text}]}
                placeholder="1050"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                value={profile.interMarks?.toString() || ''}
                onChangeText={text => updateProfile('interMarks', parseInt(text) || null)}
              />
            </View>
            <Text style={[styles.marksDivider, {color: colors.textSecondary}]}>/</Text>
            <View style={styles.marksInputGroup}>
              <Text style={[styles.marksLabel, {color: colors.textSecondary}]}>Total</Text>
              <View style={[styles.marksFixed, {backgroundColor: colors.background}]}>
                <Text style={[styles.marksFixedText, {color: colors.textSecondary}]}>1100</Text>
              </View>
            </View>
            <View style={[styles.percentBadge, {backgroundColor: colors.successLight}]}>
              <Text style={[styles.percentText, {color: colors.success}]}>
                {profile.interMarks ? ((profile.interMarks / 1100) * 100).toFixed(1) : '0'}%
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Entry Test */}
      <View style={styles.section}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
          <Icon name="create-outline" family="Ionicons" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Entry Test</Text>
        </View>
        <View style={[styles.marksCard, {backgroundColor: colors.card}]}>
          <View style={styles.marksInputRow}>
            <View style={styles.marksInputGroup}>
              <Text style={[styles.marksLabel, {color: colors.textSecondary}]}>Score</Text>
              <TextInput
                style={[styles.marksInput, {backgroundColor: colors.background, color: colors.text}]}
                placeholder="180"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                value={profile.entryTestScore?.toString() || ''}
                onChangeText={text => updateProfile('entryTestScore', parseInt(text) || null)}
              />
            </View>
            <Text style={[styles.marksDivider, {color: colors.textSecondary}]}>/</Text>
            <View style={styles.marksInputGroup}>
              <Text style={[styles.marksLabel, {color: colors.textSecondary}]}>Out of</Text>
              <View style={[styles.marksFixed, {backgroundColor: colors.background}]}>
                <Text style={[styles.marksFixedText, {color: colors.textSecondary}]}>200</Text>
              </View>
            </View>
            <View style={[styles.percentBadge, {backgroundColor: colors.warningLight}]}>
              <Text style={[styles.percentText, {color: colors.warning}]}>
                {profile.entryTestScore ? ((profile.entryTestScore / 200) * 100).toFixed(1) : '0'}%
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity style={styles.actionBtnWrapper} onPress={() => navigation.navigate('Calculator')}>
        <LinearGradient colors={[colors.primary, '#0D47A1']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.actionBtn}>
          <Icon name="analytics-outline" family="Ionicons" size={22} color="#FFFFFF" />
          <Text style={styles.actionBtnText}>Calculate My Merit</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.secondaryBtn, {backgroundColor: colors.card, borderColor: colors.primary}]} onPress={() => navigation.navigate('Recommendations')}>
        <Icon name="school-outline" family="Ionicons" size={22} color={colors.primary} />
        <Text style={[styles.secondaryBtnText, {color: colors.primary}]}>Find Matching Universities</Text>
      </TouchableOpacity>
    </>
  );

  const renderSavedTab = () => (
    <>
      <View style={[styles.savedHeader, {backgroundColor: colors.card}]}>
        <Text style={[styles.savedTitle, {color: colors.text}]}>Your Saved Items</Text>
        <View style={[styles.savedCount, {backgroundColor: colors.primaryLight}]}>
          <Text style={[styles.savedCountText, {color: colors.primary}]}>{savedItems.length}</Text>
        </View>
      </View>

      {savedItems.length === 0 ? (
        <View style={[styles.emptyState, {backgroundColor: colors.card}]}>
          <Icon name="bookmark-outline" family="Ionicons" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, {color: colors.text}]}>No Saved Items</Text>
          <Text style={[styles.emptyText, {color: colors.textSecondary}]}>Save universities, scholarships, and programs here</Text>
        </View>
      ) : (
        <View style={styles.savedList}>
          {savedItems.map((item, index) => (
            <Animated.View key={item.id} style={[styles.savedCard, {backgroundColor: colors.card}]}>
              <View style={[styles.savedIconBg, {backgroundColor: colors.primaryLight}]}>
                <Icon name={getTypeIconName(item.type)} family="Ionicons" size={20} color={colors.primary} />
              </View>
              <View style={styles.savedInfo}>
                <Text style={[styles.savedName, {color: colors.text}]}>{item.name}</Text>
                <Text style={[styles.savedType, {color: colors.textSecondary}]}>
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </Text>
              </View>
              <TouchableOpacity style={[styles.removeBtn, {backgroundColor: colors.error + '15'}]} onPress={() => removeSavedItem(item)}>
                <Icon name="close" family="Ionicons" size={16} color={colors.error} />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      )}
    </>
  );

  const renderSettingsTab = () => (
    <>
      {/* Admin Panel Access - Only for admin users */}
      {isAdminUser() && (
        <View style={styles.section}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
            <Icon name="shield-checkmark-outline" family="Ionicons" size={18} color="#EF4444" />
            <Text style={[styles.sectionTitle, {color: colors.text}]}>Admin Panel</Text>
            <View style={{backgroundColor: '#EF444420', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8}}>
              <Text style={{color: '#EF4444', fontSize: 10, fontWeight: '600'}}>
                {userRole.toUpperCase().replace('_', ' ')}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.settingRow, {backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: '#EF4444'}]} 
            onPress={() => navigation.navigate('AdminDashboard')}>
            <View style={[styles.settingIconBg, {backgroundColor: '#FEE2E2'}]}>
              <Icon name="grid-outline" family="Ionicons" size={20} color="#EF4444" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, {color: colors.text}]}>Admin Dashboard</Text>
              <Text style={[styles.settingValue, {color: colors.textSecondary}]}>Manage app content and users</Text>
            </View>
            <Icon name="chevron-forward" family="Ionicons" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}

      {/* User Features */}
      <View style={styles.section}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
          <Icon name="person-circle-outline" family="Ionicons" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>My Account</Text>
        </View>
        
        <TouchableOpacity style={[styles.settingRow, {backgroundColor: colors.card}]} onPress={() => navigation.navigate('Favorites')}>
          <View style={[styles.settingIconBg, {backgroundColor: '#FEE2E2'}]}>
            <Icon name="heart-outline" family="Ionicons" size={20} color="#EF4444" />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, {color: colors.text}]}>Favorites</Text>
            <Text style={[styles.settingValue, {color: colors.textSecondary}]}>Your saved universities & scholarships</Text>
          </View>
          <Icon name="chevron-forward" family="Ionicons" size={18} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingRow, {backgroundColor: colors.card}]} onPress={() => navigation.navigate('Notifications')}>
          <View style={[styles.settingIconBg, {backgroundColor: '#DBEAFE'}]}>
            <Icon name="notifications-outline" family="Ionicons" size={20} color="#3B82F6" />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, {color: colors.text}]}>Notifications</Text>
            <Text style={[styles.settingValue, {color: colors.textSecondary}]}>View all your alerts</Text>
          </View>
          <Icon name="chevron-forward" family="Ionicons" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
          <Icon name="settings-outline" family="Ionicons" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>App Settings</Text>
        </View>
        
        <TouchableOpacity style={[styles.settingRow, {backgroundColor: colors.card}]} onPress={() => setShowThemeModal(true)}>
          <View style={[styles.settingIconBg, {backgroundColor: isDark ? '#1E293B' : '#FEF3C7'}]}>
            <Icon name={isDark ? 'moon-outline' : 'sunny-outline'} family="Ionicons" size={20} color={isDark ? '#A5B4FC' : '#F59E0B'} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, {color: colors.text}]}>Theme</Text>
            <Text style={[styles.settingValue, {color: colors.textSecondary}]}>
              {themeMode === 'system' ? 'System' : themeMode === 'dark' ? 'Dark' : 'Light'}
            </Text>
          </View>
          <Icon name="chevron-forward" family="Ionicons" size={18} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingRow, {backgroundColor: colors.card}]} onPress={() => navigation.navigate('Settings')}>
          <View style={[styles.settingIconBg, {backgroundColor: '#D1FAE5'}]}>
            <Icon name="options-outline" family="Ionicons" size={20} color="#10B981" />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, {color: colors.text}]}>All Settings</Text>
            <Text style={[styles.settingValue, {color: colors.textSecondary}]}>Notifications, privacy & more</Text>
          </View>
          <Icon name="chevron-forward" family="Ionicons" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Help & Support Section */}
      <View style={styles.section}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
          <Icon name="chatbubbles-outline" family="Ionicons" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Help & Support</Text>
        </View>
        
        <TouchableOpacity style={[styles.settingRow, {backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: '#1A7AEB'}]} onPress={() => navigation.navigate('ContactSupport')}>
          <View style={[styles.settingIconBg, {backgroundColor: '#DBEAFE'}]}>
            <Icon name="headset-outline" family="Ionicons" size={20} color="#1A7AEB" />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, {color: colors.text}]}>Contact & Support</Text>
            <Text style={[styles.settingValue, {color: colors.textSecondary}]}>Report issues, suggest features, get help</Text>
          </View>
          <Icon name="chevron-forward" family="Ionicons" size={18} color="#1A7AEB" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingRow, {backgroundColor: colors.card}]} onPress={() => navigation.navigate('ContactSupport')}>
          <View style={[styles.settingIconBg, {backgroundColor: '#FEF3C7'}]}>
            <Icon name="bulb-outline" family="Ionicons" size={20} color="#F59E0B" />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, {color: colors.text}]}>Suggest a Feature</Text>
            <Text style={[styles.settingValue, {color: colors.textSecondary}]}>Help us improve PakUni</Text>
          </View>
          <Icon name="chevron-forward" family="Ionicons" size={18} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingRow, {backgroundColor: colors.card}]} onPress={() => navigation.navigate('ContactSupport')}>
          <View style={[styles.settingIconBg, {backgroundColor: '#D1FAE5'}]}>
            <Icon name="document-attach-outline" family="Ionicons" size={20} color="#10B981" />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, {color: colors.text}]}>Share Resources</Text>
            <Text style={[styles.settingValue, {color: colors.textSecondary}]}>Merit lists, past papers & more</Text>
          </View>
          <Icon name="chevron-forward" family="Ionicons" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
          <Icon name="flash-outline" family="Ionicons" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Quick Actions</Text>
        </View>
        
        {[
          {iconName: 'bulb-outline', label: 'Take Career Quiz', screen: 'InterestQuiz' as const},
          {iconName: 'flag-outline', label: 'Set Goals', screen: 'GoalSetting' as const},
          {iconName: 'library-outline', label: 'Subject Guide', screen: 'SubjectGuide' as const},
        ].map(action => (
          <TouchableOpacity key={action.screen} style={[styles.quickAction, {backgroundColor: colors.card}]} onPress={() => navigation.navigate(action.screen)}>
            <View style={[styles.quickActionIconBg, {backgroundColor: colors.primaryLight}]}>
              <Icon name={action.iconName} family="Ionicons" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.quickActionLabel, {color: colors.text}]}>{action.label}</Text>
            <Icon name="arrow-forward" family="Ionicons" size={18} color={colors.primary} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Legal Section */}
      <View style={styles.section}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
          <Icon name="document-text-outline" family="Ionicons" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Legal</Text>
        </View>
        
        <TouchableOpacity style={[styles.settingRow, {backgroundColor: colors.card}]} onPress={() => navigation.navigate('PrivacyPolicy')}>
          <View style={[styles.settingIconBg, {backgroundColor: '#E8F5E9'}]}>
            <Icon name="shield-checkmark-outline" family="Ionicons" size={20} color="#10B981" />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, {color: colors.text}]}>Privacy Policy</Text>
            <Text style={[styles.settingValue, {color: colors.textSecondary}]}>How we protect your data</Text>
          </View>
          <Icon name="chevron-forward" family="Ionicons" size={18} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingRow, {backgroundColor: colors.card}]} onPress={() => navigation.navigate('TermsOfService')}>
          <View style={[styles.settingIconBg, {backgroundColor: '#E3F2FD'}]}>
            <Icon name="document-outline" family="Ionicons" size={20} color="#3B82F6" />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, {color: colors.text}]}>Terms of Service</Text>
            <Text style={[styles.settingValue, {color: colors.textSecondary}]}>Usage terms and conditions</Text>
          </View>
          <Icon name="chevron-forward" family="Ionicons" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* About Card */}
      <View style={[styles.aboutCard, {backgroundColor: colors.card}]}>
        <Icon name="flag" family="Ionicons" size={40} color="#2E7D32" />
        <Text style={[styles.aboutTitle, {color: colors.text}]}>PakUni</Text>
        <Text style={[styles.aboutVersion, {color: colors.textSecondary}]}>Version 1.0.0</Text>
        <Text style={[styles.aboutDesc, {color: colors.textSecondary}]}>
          Your complete guide to Pakistani universities and scholarships
        </Text>
      </View>

      {/* Logout / Sign In */}
      {isGuest ? (
        <TouchableOpacity style={styles.logoutBtn} onPress={() => navigation.navigate('Auth')}>
          <LinearGradient colors={[colors.primary, '#0D47A1']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.logoutGradient}>
            <Icon name="log-in-outline" family="Ionicons" size={22} color="#FFFFFF" />
            <Text style={styles.logoutText}>Sign In / Create Account</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.logoutBtn} onPress={() => {
          Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Sign Out', style: 'destructive', onPress: () => signOut()},
          ]);
        }}>
          <LinearGradient colors={['#EF4444', '#DC2626']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.logoutGradient}>
            <Icon name="log-out-outline" family="Ionicons" size={22} color="#FFFFFF" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View style={{opacity: headerAnim, transform: [{translateY: headerAnim.interpolate({inputRange: [0, 1], outputRange: [-20, 0]})}]}}>
            <LinearGradient colors={isDark ? ['#0F172A', '#1E3A5F', '#1A7AEB'] : ['#1A7AEB', '#0D5BC4', '#0847A1']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.headerGradient}>
              <View style={styles.headerDecoCircle1} />
              <View style={styles.headerDecoCircle2} />
              <View style={styles.headerDecoCircle3} />
              
              {/* Notification Bell */}
              <TouchableOpacity 
                style={styles.notificationBell} 
                onPress={() => navigation.navigate('Notifications')}>
                <Icon name="notifications-outline" family="Ionicons" size={24} color="#FFFFFF" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
              
              <View style={[styles.avatarContainer, {backgroundColor: colors.card}]}>
                {(user?.name || profile.name) ? (
                  <Text style={[styles.avatarText, {color: colors.primary}]}>
                    {(user?.name || profile.name).charAt(0).toUpperCase()}
                  </Text>
                ) : isGuest ? (
                  <Icon name="person-outline" family="Ionicons" size={32} color={colors.primary} />
                ) : (
                  <Icon name="person" family="Ionicons" size={32} color={colors.primary} />
                )}
              </View>
              <Text style={styles.profileName}>
                {isGuest ? 'Guest User' : (user?.name || profile.name || 'Your Profile')}
              </Text>
              <Text style={styles.profileClass}>
                {isGuest ? 'Sign in for full features' : (user?.email || profile.currentClass)}
              </Text>
              {isGuest && (
                <TouchableOpacity 
                  style={styles.signInBadge}
                  onPress={() => navigation.navigate('Auth')}>
                  <Icon name="log-in-outline" family="Ionicons" size={14} color="#1A7AEB" />
                  <Text style={styles.signInBadgeText}>Sign In</Text>
                </TouchableOpacity>
              )}
            </LinearGradient>
          </Animated.View>

          {/* Tabs */}
          <View style={[styles.tabsContainer, {backgroundColor: colors.card}]}>
            {tabs.map(tab => (
              <AnimatedTab
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onPress={() => setActiveTab(tab.id as typeof activeTab)}
                colors={colors}
              />
            ))}
          </View>

          {/* Content */}
          <View style={styles.content}>
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'marks' && renderMarksTab()}
            {activeTab === 'saved' && renderSavedTab()}
            {activeTab === 'settings' && renderSettingsTab()}
          </View>

          <View style={{height: 120}} />
        </ScrollView>

        {/* Theme Modal */}
        <Modal visible={showThemeModal} animationType="slide" transparent onRequestClose={() => setShowThemeModal(false)}>
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowThemeModal(false)}
            accessibilityRole="button"
            accessibilityLabel="Close theme selection">
            <View style={[styles.modalContent, {backgroundColor: colors.card}]} onStartShouldSetResponder={() => true}>
              <View style={[styles.modalHandle, {backgroundColor: colors.border}]} />
              <Text style={[styles.modalTitle, {color: colors.text}]}>Choose Theme</Text>
              
              {([{mode: 'system' as ThemeMode, iconName: 'phone-portrait-outline', label: 'System', desc: 'Follow device settings'},
                {mode: 'light' as ThemeMode, iconName: 'sunny-outline', label: 'Light', desc: 'Always light'},
                {mode: 'dark' as ThemeMode, iconName: 'moon-outline', label: 'Dark', desc: 'Always dark'},
              ]).map(option => (
                <TouchableOpacity
                  key={option.mode}
                  style={[styles.themeOption, {backgroundColor: colors.background}, themeMode === option.mode && {backgroundColor: colors.primaryLight, borderColor: colors.primary, borderWidth: 2}]}
                  onPress={() => { setThemeMode(option.mode); setShowThemeModal(false); }}
                  accessibilityRole="radio"
                  accessibilityState={{checked: themeMode === option.mode}}
                  accessibilityLabel={`${option.label} theme - ${option.desc}`}>
                  <Icon name={option.iconName} family="Ionicons" size={24} color={colors.primary} />
                  <View style={styles.themeInfo}>
                    <Text style={[styles.themeLabel, {color: colors.text}]}>{option.label}</Text>
                    <Text style={[styles.themeDesc, {color: colors.textSecondary}]}>{option.desc}</Text>
                  </View>
                  {themeMode === option.mode && <Icon name="checkmark-circle" family="Ionicons" size={20} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Edit Modal */}
        <Modal visible={showEditModal} animationType="slide" transparent onRequestClose={() => setShowEditModal(false)}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={{flex: 1}}>
            <TouchableOpacity 
              style={styles.modalOverlay} 
              activeOpacity={1} 
              onPress={() => setShowEditModal(false)}
              accessibilityRole="button"
              accessibilityLabel="Close editor">
              <View style={[styles.modalContent, {backgroundColor: colors.card}]} onStartShouldSetResponder={() => true}>
                <View style={[styles.modalHandle, {backgroundColor: colors.border}]} />
                <View style={styles.modalHeaderRow}>
                  <Text style={[styles.modalTitle, {color: colors.text}]}>{editField.label}</Text>
                  <TouchableOpacity 
                    onPress={() => setShowEditModal(false)}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                    hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
                    <Icon name="close" family="Ionicons" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {editField.type === 'text' ? (
                  <>
                    <TextInput
                      style={[styles.modalInput, {backgroundColor: colors.background, color: colors.text}]}
                      placeholder={`Enter ${editField.label.toLowerCase()}`}
                      placeholderTextColor={colors.placeholder}
                      value={profile[editField.key as keyof UserProfile]?.toString() || ''}
                      onChangeText={text => updateProfile(editField.key, text)}
                      autoFocus
                      returnKeyType="done"
                      onSubmitEditing={() => setShowEditModal(false)}
                      accessibilityLabel={`Enter your ${editField.label.toLowerCase()}`}
                    />
                    <TouchableOpacity 
                      style={styles.saveBtnWrapper} 
                      onPress={() => setShowEditModal(false)}
                      accessibilityRole="button"
                      accessibilityLabel="Save changes">
                      <LinearGradient colors={[colors.primary, '#0D47A1']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.saveBtn}>
                        <Text style={styles.saveBtnText}>Save</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </>
                ) : (
                  <ScrollView style={styles.optionsList} keyboardShouldPersistTaps="handled">
                    {editField.options?.map(option => (
                      <TouchableOpacity
                        key={option}
                        style={[styles.optionItem, {backgroundColor: colors.background}, profile[editField.key as keyof UserProfile] === option && {backgroundColor: colors.primaryLight}]}
                        onPress={() => { updateProfile(editField.key, option); setShowEditModal(false); }}
                        accessibilityRole="radio"
                        accessibilityState={{checked: profile[editField.key as keyof UserProfile] === option}}
                        accessibilityLabel={option}>
                        <Text style={[styles.optionText, {color: colors.text}, profile[editField.key as keyof UserProfile] === option && {color: colors.primary, fontWeight: '600'}]}>
                          {option}
                        </Text>
                        {profile[editField.key as keyof UserProfile] === option && <Icon name="checkmark-circle" family="Ionicons" size={20} color={colors.primary} />}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  headerGradient: {
    paddingVertical: SPACING.xl + SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    borderBottomLeftRadius: RADIUS.xxl + 8,
    borderBottomRightRadius: RADIUS.xxl + 8,
    overflow: 'hidden',
  },
  headerDecoCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  headerDecoCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerDecoCircle3: {
    position: 'absolute',
    top: 20,
    left: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  notificationBell: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  signInBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
  },
  signInBadgeText: {
    color: '#1A7AEB',
    fontSize: 13,
    fontWeight: '700',
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: { fontSize: 38, fontWeight: '800', letterSpacing: -0.5 },
  profileName: { fontSize: TYPOGRAPHY.sizes.xxl, fontWeight: '800', color: '#FFFFFF', marginBottom: 4, letterSpacing: -0.5, textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  profileClass: { fontSize: TYPOGRAPHY.sizes.sm, color: 'rgba(255,255,255,0.95)', fontWeight: '600', letterSpacing: 0.3 },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginTop: -SPACING.xl,
    borderRadius: RADIUS.xl,
    padding: SPACING.xs,
    elevation: 12,
    shadowColor: '#1A7AEB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  tab: { alignItems: 'center', paddingVertical: SPACING.sm, borderRadius: RADIUS.lg },
  tabIcon: { fontSize: 20, marginBottom: 2 },
  tabLabel: { fontSize: TYPOGRAPHY.sizes.xs },
  tabLabelActive: { fontWeight: '600' },
  content: { paddingTop: SPACING.lg },
  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: '700', marginBottom: SPACING.sm },
  sectionHint: { fontSize: TYPOGRAPHY.sizes.xs, marginBottom: SPACING.sm },
  completionCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, borderRadius: RADIUS.xl, padding: SPACING.md },
  completionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  completionTitle: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: '700' },
  completionHint: { fontSize: TYPOGRAPHY.sizes.xs, marginTop: 2 },
  completionBadge: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  completionPercent: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: '800' },
  completionBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  completionFill: { height: '100%', borderRadius: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.xs },
  infoLabel: { fontSize: TYPOGRAPHY.sizes.sm },
  infoValueRow: { flexDirection: 'row', alignItems: 'center' },
  infoValue: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '500', marginRight: SPACING.xs },
  infoArrow: { fontSize: 18 },
  interestsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  interestTag: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderWidth: 1 },
  interestText: { fontSize: TYPOGRAPHY.sizes.xs },
  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, gap: SPACING.sm, marginBottom: SPACING.lg },
  statsCard: { flex: 1 },
  statsGradient: { borderRadius: RADIUS.xl, padding: SPACING.md, alignItems: 'center' },
  statsIcon: { fontSize: 24, marginBottom: SPACING.xs },
  statsValue: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: '800', color: '#FFFFFF' },
  statsLabel: { fontSize: TYPOGRAPHY.sizes.xs, color: 'rgba(255,255,255,0.9)' },
  marksCard: { borderRadius: RADIUS.xl, padding: SPACING.md },
  marksInputRow: { flexDirection: 'row', alignItems: 'center' },
  marksInputGroup: { flex: 1 },
  marksLabel: { fontSize: TYPOGRAPHY.sizes.xs, marginBottom: 4 },
  marksInput: { borderRadius: RADIUS.md, padding: SPACING.sm, fontSize: TYPOGRAPHY.sizes.md, textAlign: 'center', fontWeight: '600' },
  marksDivider: { fontSize: 24, marginHorizontal: SPACING.sm, marginTop: SPACING.md },
  marksFixed: { borderRadius: RADIUS.md, padding: SPACING.sm, alignItems: 'center' },
  marksFixedText: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: '500' },
  percentBadge: { marginLeft: SPACING.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.lg, marginTop: SPACING.md },
  percentText: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: '700' },
  actionBtnWrapper: { marginHorizontal: SPACING.lg, marginTop: SPACING.md },
  actionBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.md + 2, borderRadius: RADIUS.lg },
  actionBtnIcon: { fontSize: 20, marginRight: SPACING.sm },
  actionBtnText: { color: '#FFFFFF', fontSize: TYPOGRAPHY.sizes.md, fontWeight: '700' },
  secondaryBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginHorizontal: SPACING.lg, marginTop: SPACING.sm, paddingVertical: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 2 },
  secondaryBtnIcon: { fontSize: 18, marginRight: SPACING.sm },
  secondaryBtnText: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: '600' },
  savedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: SPACING.lg, marginBottom: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.xl },
  savedTitle: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: '700' },
  savedCount: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  savedCountText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '700' },
  savedList: { paddingHorizontal: SPACING.lg },
  savedCard: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.xl, padding: SPACING.md, marginBottom: SPACING.sm },
  savedIconBg: { width: 48, height: 48, borderRadius: RADIUS.lg, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  savedItemIcon: { fontSize: 24 },
  savedInfo: { flex: 1 },
  savedName: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: '600' },
  savedType: { fontSize: TYPOGRAPHY.sizes.xs, marginTop: 2 },
  removeBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  removeBtnText: { fontSize: 16, fontWeight: '600' },
  emptyState: { alignItems: 'center', padding: SPACING.xl, marginHorizontal: SPACING.lg, borderRadius: RADIUS.xl },
  emptyIcon: { fontSize: 60, marginBottom: SPACING.md },
  emptyTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '700', marginBottom: SPACING.xs },
  emptyText: { fontSize: TYPOGRAPHY.sizes.sm, textAlign: 'center' },
  settingRow: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.xs },
  settingIconBg: { width: 44, height: 44, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  settingIcon: { fontSize: 22 },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: '500' },
  settingValue: { fontSize: TYPOGRAPHY.sizes.xs, marginTop: 2 },
  settingArrow: { fontSize: 20 },
  quickAction: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.xs },
  quickActionIconBg: { width: 44, height: 44, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  quickActionIcon: { fontSize: 22 },
  quickActionLabel: { flex: 1, fontSize: TYPOGRAPHY.sizes.md, fontWeight: '500' },
  quickActionArrow: { fontSize: 18 },
  aboutCard: { marginHorizontal: SPACING.lg, borderRadius: RADIUS.xl, padding: SPACING.lg, alignItems: 'center', marginBottom: SPACING.lg },
  aboutIcon: { fontSize: 48, marginBottom: SPACING.sm },
  aboutTitle: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: '800', marginBottom: 4 },
  aboutVersion: { fontSize: TYPOGRAPHY.sizes.xs, marginBottom: SPACING.sm },
  aboutDesc: { fontSize: TYPOGRAPHY.sizes.sm, textAlign: 'center' },
  logoutBtn: { marginHorizontal: SPACING.lg },
  logoutGradient: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.md, borderRadius: RADIUS.lg },
  logoutIcon: { fontSize: 18, marginRight: SPACING.sm },
  logoutText: { color: '#FFFFFF', fontSize: TYPOGRAPHY.sizes.md, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl, padding: SPACING.lg, maxHeight: '80%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.md },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  modalTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '700' },
  modalClose: { fontSize: 24, padding: SPACING.xs },
  modalInput: { borderRadius: RADIUS.lg, padding: SPACING.md, fontSize: TYPOGRAPHY.sizes.md, marginBottom: SPACING.md },
  saveBtnWrapper: {},
  saveBtn: { paddingVertical: SPACING.md, borderRadius: RADIUS.lg, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: TYPOGRAPHY.sizes.md, fontWeight: '700' },
  optionsList: { maxHeight: 350 },
  optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.xs },
  optionText: { fontSize: TYPOGRAPHY.sizes.md },
  optionCheck: { fontSize: 18, fontWeight: '700' },
  themeOption: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderRadius: RADIUS.lg, marginBottom: SPACING.sm, borderWidth: 1, borderColor: 'transparent' },
  themeIcon: { fontSize: 28, marginRight: SPACING.md },
  themeInfo: { flex: 1 },
  themeLabel: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: '600' },
  themeDesc: { fontSize: TYPOGRAPHY.sizes.xs, marginTop: 2 },
  themeCheck: { fontSize: 20, fontWeight: '700' },
});

export default PremiumProfileScreen;
