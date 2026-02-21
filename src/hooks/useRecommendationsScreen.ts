/**
 * useRecommendationsScreen - All state and logic for PremiumRecommendationsScreen
 * IMPROVED: Subject group matching, better profile pre-fill, comprehensive filtering
 */

import {useState, useRef, useEffect, useMemo} from 'react';
import {Animated, BackHandler, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {getRecommendations, UniversityRecommendation} from '../utils/recommendationEngine';

// Subject group to program mapping for Pakistani education system
const SUBJECT_GROUP_TO_PROGRAMS: Record<string, string[]> = {
  'Pre-Medical': ['Medical'],
  'Pre-Engineering': ['Engineering', 'Computer Science'],
  'ICS': ['Computer Science'],
  'ICOM/Commerce': ['Business'],
  'Arts/Humanities': ['Arts', 'Law'],
};

const mapTargetFieldToPrograms = (targetField: string | null): string[] => {
  if (!targetField) return [];
  const fieldLower = targetField.toLowerCase();
  const mappings: Record<string, string[]> = {
    engineering: ['Engineering'],
    software: ['Computer Science', 'Engineering'],
    computer: ['Computer Science'],
    it: ['Computer Science'],
    medicine: ['Medical'],
    medical: ['Medical'],
    doctor: ['Medical'],
    mbbs: ['Medical'],
    dentist: ['Medical'],
    pharmacy: ['Medical'],
    business: ['Business'],
    commerce: ['Business'],
    mba: ['Business'],
    finance: ['Business'],
    accounting: ['Business'],
    law: ['Law'],
    legal: ['Law'],
    arts: ['Arts'],
    design: ['Arts'],
    humanities: ['Arts'],
    architecture: ['Arts'],
  };
  for (const [key, programs] of Object.entries(mappings)) {
    if (fieldLower.includes(key)) return programs;
  }
  return [];
};

// Detect subject group from target field or marks (heuristic)
const detectSubjectGroup = (targetField: string | null, programs: string[]): string => {
  if (programs.includes('Medical')) return 'Pre-Medical';
  if (programs.includes('Engineering') || programs.includes('Computer Science')) return 'Pre-Engineering';
  if (programs.includes('Business')) return 'ICOM/Commerce';
  if (programs.includes('Arts') || programs.includes('Law')) return 'Arts/Humanities';
  if (targetField) {
    const fl = targetField.toLowerCase();
    if (fl.includes('medic') || fl.includes('doctor') || fl.includes('mbbs') || fl.includes('pharma')) return 'Pre-Medical';
    if (fl.includes('engineer') || fl.includes('software') || fl.includes('computer') || fl.includes('it')) return 'Pre-Engineering';
    if (fl.includes('business') || fl.includes('commerce') || fl.includes('finance')) return 'ICOM/Commerce';
    if (fl.includes('arts') || fl.includes('law') || fl.includes('design')) return 'Arts/Humanities';
  }
  return '';
};

export const useRecommendationsScreen = () => {
  const {colors, isDark} = useTheme();
  const {user} = useAuth();
  const navigation = useNavigation<any>();
  const [currentStep, setCurrentStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [profileDataLoaded, setProfileDataLoaded] = useState(false);

  // Form state
  const [matricMarks, setMatricMarks] = useState('');
  const [matricTotal, setMatricTotal] = useState('1100');
  const [fscMarks, setFscMarks] = useState('');
  const [fscTotal, setFscTotal] = useState('1100');
  const [entryTestScore, setEntryTestScore] = useState('');
  const [entryTestTotal, setEntryTestTotal] = useState('200');
  const [subjectGroup, setSubjectGroup] = useState(''); // Pre-Med, Pre-Eng, ICS, Commerce, Arts
  const [preferredPrograms, setPreferredPrograms] = useState<string[]>([]);
  const [preferredCities, setPreferredCities] = useState<string[]>([]);
  const [preferredType, setPreferredType] = useState('');
  const [preferredSession, setPreferredSession] = useState<'Fall' | 'Spring' | 'Both'>('Both');
  const [validationError, setValidationError] = useState<string | null>(null);
  // Quota profile fields
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [userProvince, setUserProvince] = useState('');
  const [quotaFlags, setQuotaFlags] = useState<string[]>([]);  // 'Hafiz-e-Quran', 'Sports Player', etc.

  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  // Pre-fill from user profile - comprehensive loading
  useEffect(() => {
    if (user && !profileDataLoaded) {
      // Load marks from profile
      if (user.matricMarks) setMatricMarks(user.matricMarks.toString());
      // Use profile total OR standard 1100 - handles 1100/1200 boards correctly
      if (user.matricTotal && user.matricTotal > 0) {
        setMatricTotal(user.matricTotal.toString());
      }
      if (user.interMarks) setFscMarks(user.interMarks.toString());
      if (user.interTotal && user.interTotal > 0) {
        setFscTotal(user.interTotal.toString());
      }
      if (user.entryTestScore) setEntryTestScore(user.entryTestScore.toString());
      if (user.entryTestTotal && user.entryTestTotal > 0) {
        setEntryTestTotal(user.entryTestTotal.toString());
      }

      const matchedPrograms = mapTargetFieldToPrograms(user.targetField || null);
      if (matchedPrograms.length > 0) {
        setPreferredPrograms(matchedPrograms);
        // Auto-detect subject group from programs
        const group = detectSubjectGroup(user.targetField || null, matchedPrograms);
        if (group) setSubjectGroup(group);
      }

      if (user.city) {
        const cities = ['Lahore', 'Karachi', 'Islamabad', 'Peshawar', 'Multan', 'Faisalabad', 'Rawalpindi', 'Quetta'];
        const matched = cities.find(
          c => c.toLowerCase() === user.city?.toLowerCase() ||
               user.city?.toLowerCase().includes(c.toLowerCase()),
        );
        if (matched) setPreferredCities([matched]);
      }

      setProfileDataLoaded(true);
    }
  }, [user, profileDataLoaded]);

  // When subject group changes, auto-update program preferences for better matching
  const handleSubjectGroupChange = (group: string) => {
    setSubjectGroup(group);
    const programs = SUBJECT_GROUP_TO_PROGRAMS[group];
    if (programs) {
      setPreferredPrograms(programs);
    }
  };

  // Validate numeric input
  const validateNumericInput = (value: string) => /^[0-9]*\.?[0-9]*$/.test(value);

  const handleMarksChange = (value: string, setter: (val: string) => void, total: string) => {
    if (!validateNumericInput(value)) return;
    const numValue = parseFloat(value) || 0;
    const numTotal = parseFloat(total) || 1100;
    if (numValue > numTotal) {
      setValidationError(`Marks cannot exceed total (${total})`);
      setTimeout(() => setValidationError(null), 3000);
      return;
    }
    setter(value);
    setValidationError(null);
  };

  // Animate in
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, {toValue: 1, duration: 600, useNativeDriver: true}),
      Animated.timing(contentAnim, {toValue: 1, duration: 600, delay: 200, useNativeDriver: true}),
    ]).start();
  }, []);

  // Back button protection
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      const hasEnteredData =
        matricMarks || fscMarks || entryTestScore || preferredPrograms.length > 0 || preferredCities.length > 0;

      if (hasEnteredData && !showResults) {
        Alert.alert('Discard Changes?', 'You have entered recommendation criteria. Are you sure you want to go back?', [
          {text: 'Stay', style: 'cancel'},
          {text: 'Discard', style: 'destructive', onPress: () => navigation.goBack()},
        ]);
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [matricMarks, fscMarks, entryTestScore, preferredPrograms, preferredCities, showResults, navigation]);

  const canProceed = () => {
    if (currentStep === 1) return !!(matricMarks && fscMarks);
    if (currentStep === 2) return preferredPrograms.length > 0 && preferredCities.length > 0;
    return true;
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
    else setShowResults(true);
  };

  const handleBack = () => {
    if (showResults) setShowResults(false);
    else if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Generate recommendations
  const recommendations = useMemo(() => {
    if (!showResults) return [];

    const allRecs = getRecommendations({
      matricMarks: parseFloat(matricMarks) || 0,
      matricTotal: parseFloat(matricTotal) || 1100,
      interMarks: parseFloat(fscMarks) || 0,
      interTotal: parseFloat(fscTotal) || 1100,
      entryTestScore: parseFloat(entryTestScore) || undefined,
      entryTestTotal: parseFloat(entryTestTotal) || 200,
      preferredPrograms,
      preferredCities,
      universityType: preferredType === 'Public' ? 'Public' : preferredType === 'Private' ? 'Private' : 'Both',
      preferredSession,
      // Quota fields
      gender: gender || undefined,
      province: userProvince || undefined,
      isHafizQuran: quotaFlags.includes('Hafiz-e-Quran') || undefined,
      isSportsPlayer: quotaFlags.includes('Sports Player') || undefined,
      isDisabled: quotaFlags.includes('Disabled Person') || undefined,
      isArmyDependent: quotaFlags.includes('Army Dependent') || undefined,
      isNRP: quotaFlags.includes('Non-Resident Pakistani (NRP)') || undefined,
    });

    if (preferredCities.length > 0) {
      const inCity = allRecs.filter(u =>
        preferredCities.some(c => u.city.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(u.city.toLowerCase())),
      );
      const outCity = allRecs.filter(u =>
        !preferredCities.some(c => u.city.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(u.city.toLowerCase())),
      );
      return [...inCity, ...outCity];
    }
    return allRecs;
  }, [showResults, matricMarks, matricTotal, fscMarks, fscTotal, entryTestScore, entryTestTotal, preferredPrograms, preferredCities, preferredType, preferredSession, gender, userProvince, quotaFlags]);

  const recommendationStats = useMemo(() => {
    if (recommendations.length === 0) return null;
    return {
      tier1Count: recommendations.filter(r => r.tier === 1).length,
      tier2Count: recommendations.filter(r => r.tier === 2).length,
      reachCount: recommendations.filter(r => r.recommendedCategory === 'reach').length,
      targetCount: recommendations.filter(r => r.recommendedCategory === 'target').length,
      safetyCount: recommendations.filter(r => r.recommendedCategory === 'safety').length,
      total: recommendations.length,
    };
  }, [recommendations]);

  const handleViewDetails = (universityId: string) => {
    navigation.navigate('UniversityDetail', {universityId});
  };

  return {
    colors, isDark, navigation,
    currentStep, showResults,
    profileDataLoaded, validationError,
    // Marks
    matricMarks, matricTotal, fscMarks, fscTotal, entryTestScore, entryTestTotal,
    onMatricMarksChange: (val: string) => handleMarksChange(val, setMatricMarks, matricTotal),
    onMatricTotalChange: setMatricTotal,
    onFscMarksChange: (val: string) => handleMarksChange(val, setFscMarks, fscTotal),
    onFscTotalChange: setFscTotal,
    onEntryTestScoreChange: (val: string) => handleMarksChange(val, setEntryTestScore, entryTestTotal),
    onEntryTestTotalChange: setEntryTestTotal,
    // Subject group
    subjectGroup,
    onSubjectGroupChange: handleSubjectGroupChange,
    // Preferences
    preferredPrograms, preferredCities, preferredType, preferredSession,
    setPreferredPrograms, setPreferredCities, setPreferredType,
    setPreferredSession: (val: string) => setPreferredSession(val as 'Fall' | 'Spring' | 'Both'),
    // Quota Profile
    gender, setGender,
    userProvince, setUserProvince,
    quotaFlags, setQuotaFlags,
    // Actions
    canProceed, handleNext, handleBack,
    recommendations, recommendationStats, handleViewDetails,
    // Animations
    headerAnim, contentAnim,
  };
};
