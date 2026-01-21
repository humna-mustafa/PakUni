import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../constants/design';
import {useTheme} from '../contexts/ThemeContext';
import {UNIVERSITIES} from '../data';
import {getRecommendations, UniversityRecommendation} from '../utils/recommendationEngine';
import {Icon} from '../components/icons';

const {width} = Dimensions.get('window');

// Step indicator component
const StepIndicator = ({
  currentStep,
  totalSteps,
  colors,
}: {
  currentStep: number;
  totalSteps: number;
  colors: any;
}) => {
  return (
    <View style={styles.stepIndicator}>
      {Array.from({length: totalSteps}).map((_, index) => {
        const isActive = index + 1 <= currentStep;
        const isCurrent = index + 1 === currentStep;
        return (
          <React.Fragment key={index}>
            <View
              style={[
                styles.stepDot,
                {
                  backgroundColor: isActive ? colors.primary : colors.border,
                  transform: [{scale: isCurrent ? 1.2 : 1}],
                },
              ]}>
              {isActive && <Icon name="checkmark" family="Ionicons" size={12} color="#FFFFFF" />}
            </View>
            {index < totalSteps - 1 && (
              <View
                style={[
                  styles.stepLine,
                  {backgroundColor: isActive ? colors.primary : colors.border},
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

// Input field component
const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  iconName,
  colors,
  keyboardType = 'default',
  suffix,
}: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const animValue = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(animValue, {
      toValue: 1,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(animValue, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.inputContainer}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
        <Icon name={iconName} family="Ionicons" size={16} color={colors.primary} />
        <Text style={[styles.inputLabel, {color: colors.text}]}>{label}</Text>
      </View>
      <Animated.View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.card,
            borderColor: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [colors.border, colors.primary],
            }),
            borderWidth: 2,
          },
        ]}>
        <TextInput
          style={[styles.input, {color: colors.text}]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {suffix && (
          <Text style={[styles.inputSuffix, {color: colors.textSecondary}]}>
            {suffix}
          </Text>
        )}
      </Animated.View>
    </View>
  );
};

// Chip selector component
const ChipSelector = ({
  options,
  selected,
  onSelect,
  colors,
  multiSelect = false,
}: any) => {
  const handleSelect = (option: string) => {
    if (multiSelect) {
      if (selected.includes(option)) {
        onSelect(selected.filter((s: string) => s !== option));
      } else {
        onSelect([...selected, option]);
      }
    } else {
      onSelect(option);
    }
  };

  return (
    <View style={styles.chipsContainer}>
      {options.map((option: string) => {
        const isSelected = multiSelect
          ? selected.includes(option)
          : selected === option;
        return (
          <TouchableOpacity key={option} onPress={() => handleSelect(option)}>
            {isSelected ? (
              <LinearGradient
                colors={['#4573DF', '#3660C9']}
                style={styles.chip}>
                <Text style={styles.chipTextActive}>{option}</Text>
              </LinearGradient>
            ) : (
              <View
                style={[
                  styles.chip,
                  {backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1},
                ]}>
                <Text style={[styles.chipText, {color: colors.textSecondary}]}>
                  {option}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// Result card component
const ResultCard = ({
  university,
  matchScore,
  matchReasons,
  index,
  colors,
  onViewDetails,
}: {
  university: any;
  matchScore: number;
  matchReasons: string[];
  index: number;
  colors: any;
  onViewDetails: () => void;
}) => {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getMatchColor = (score: number) => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <Animated.View
      style={[
        styles.resultCard,
        {
          backgroundColor: colors.card,
          transform: [{translateX: slideAnim}],
          opacity: fadeAnim,
        },
      ]}>
      <LinearGradient
        colors={[getMatchColor(matchScore) + '15', 'transparent']}
        style={styles.resultGradient}
      />
      
      {/* Rank Badge */}
      <View style={[styles.rankBadge, {backgroundColor: getMatchColor(matchScore)}]}>
        <Text style={styles.rankText}>#{index + 1}</Text>
      </View>

      <View style={styles.resultContent}>
        <View style={styles.resultHeader}>
          <View style={styles.resultInfo}>
            <Text style={[styles.resultName, {color: colors.text}]}>
              {university.name}
            </Text>
            <View style={styles.resultMeta}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <Icon name="location-outline" family="Ionicons" size={14} color={colors.textSecondary} />
                <Text style={[styles.resultCity, {color: colors.textSecondary}]}>
                  {university.city}
                </Text>
              </View>
              <View
                style={[
                  styles.resultType,
                  {
                    backgroundColor:
                      university.type === 'public'
                        ? colors.success + '20'
                        : colors.primary + '20',
                  },
                ]}>
                <Text
                  style={{
                    color:
                      university.type === 'public'
                        ? colors.success
                        : colors.primary,
                    fontSize: 10,
                    fontWeight: '600',
                  }}>
                  {university.type.toUpperCase()}
                </Text>
              </View>
            </View>
            
            {/* Fee Info - Verified Verification */}
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4}}>
               <Icon name="cash-outline" family="Ionicons" size={14} color={colors.success} />
               <Text style={{fontSize: 12, color: colors.textSecondary, fontWeight: '500'}}>
                  {university.estimatedFeeRange || 'Fee varies by program'}
               </Text>
            </View>
          </View>
          
          {/* Match Score Circle */}
          <View style={styles.matchContainer}>
            <View style={[styles.matchCircle, {borderColor: getMatchColor(matchScore)}]}>
              <Text style={[styles.matchScore, {color: getMatchColor(matchScore)}]}>
                {matchScore}%
              </Text>
            </View>
            <Text style={[styles.matchLabel, {color: colors.textSecondary}]}>
              Match
            </Text>
          </View>
        </View>

        {/* Why this matches */}
        <View style={[styles.matchReasons, {backgroundColor: colors.background}]}>
          <Text style={[styles.matchReasonsTitle, {color: colors.text}]}>
            Why this matches:
          </Text>
          {matchReasons.slice(0, 3).map((reason, idx) => (
            <View key={idx} style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2}}>
              <Icon name="checkmark-circle" family="Ionicons" size={14} color={colors.success} />
              <Text style={[styles.matchReason, {color: colors.textSecondary}]}>{reason}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.viewDetailBtn, {borderColor: colors.primary}]}
          onPress={onViewDetails}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6}}>
            <Text style={[styles.viewDetailText, {color: colors.primary}]}>View Details</Text>
            <Icon name="arrow-forward" family="Ionicons" size={16} color={colors.primary} />
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};


const PremiumRecommendationsScreen = () => {
  const {colors, isDark} = useTheme();
  const navigation = useNavigation<any>();
  const [currentStep, setCurrentStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  
  // Form state - now with customizable total marks (default 1200 as per 2024+ Pakistan)
  const [matricMarks, setMatricMarks] = useState('');
  const [matricTotal, setMatricTotal] = useState('1200');
  const [fscMarks, setFscMarks] = useState('');
  const [fscTotal, setFscTotal] = useState('1200');
  const [entryTestScore, setEntryTestScore] = useState('');
  const [entryTestTotal, setEntryTestTotal] = useState('200');
  const [preferredPrograms, setPreferredPrograms] = useState<string[]>([]);
  const [preferredCities, setPreferredCities] = useState<string[]>([]);
  const [preferredType, setPreferredType] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  // Validation helpers
  const validateNumericInput = (value: string) => {
    // Only allow numbers and decimals
    return /^[0-9]*\.?[0-9]*$/.test(value);
  };

  const handleMarksChange = (value: string, setter: (val: string) => void, total: string) => {
    if (!validateNumericInput(value)) return;
    
    const numValue = parseFloat(value) || 0;
    const numTotal = parseFloat(total) || 1200;
    
    if (numValue > numTotal) {
      setValidationError(`Marks cannot exceed total (${total})`);
      setTimeout(() => setValidationError(null), 3000);
      return;
    }
    
    setter(value);
    setValidationError(null);
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const programs = ['Engineering', 'Medical', 'Business', 'Computer Science', 'Law', 'Arts'];
  const cities = ['Lahore', 'Karachi', 'Islamabad', 'Peshawar', 'Multan', 'Faisalabad'];
  const types = ['Public', 'Private', 'Both'];

  const canProceed = () => {
    if (currentStep === 1) {
      return matricMarks && fscMarks;
    }
    if (currentStep === 2) {
      return preferredPrograms.length > 0 && preferredCities.length > 0;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (showResults) {
      setShowResults(false);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Generate recommendations using the real engine with city filtering
  const recommendations = React.useMemo(() => {
    if (!showResults) return [];
    
    const allRecommendations = getRecommendations({
      matricMarks: parseFloat(matricMarks) || 0,
      matricTotal: parseFloat(matricTotal) || 1200,
      interMarks: parseFloat(fscMarks) || 0,
      interTotal: parseFloat(fscTotal) || 1200,
      entryTestScore: parseFloat(entryTestScore) || undefined,
      entryTestTotal: parseFloat(entryTestTotal) || 200,
      preferredPrograms,
      preferredCities,
      universityType: preferredType === 'Public' ? 'Public' : preferredType === 'Private' ? 'Private' : 'Both',
    });
    
    // STRICT CITY FILTERING: Only show universities in selected cities
    if (preferredCities.length > 0) {
      return allRecommendations.filter(uni => 
        preferredCities.some(city => 
          uni.city.toLowerCase().includes(city.toLowerCase()) ||
          city.toLowerCase().includes(uni.city.toLowerCase())
        )
      );
    }
    
    return allRecommendations;
  }, [showResults, matricMarks, matricTotal, fscMarks, fscTotal, entryTestScore, entryTestTotal, preferredPrograms, preferredCities, preferredType]);

  // Handle navigation to university details
  const handleViewDetails = (universityId: string) => {
    navigation.navigate('UniversityDetail', {universityId});
  };

  if (showResults) {
    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: colors.background}]}
        edges={['top']}>
        {/* Results Header */}
        <LinearGradient
          colors={isDark ? ['#27ae60', '#219a52'] : ['#2ecc71', '#27ae60']}
          style={styles.resultsHeader}>
          <View style={styles.headerDecoration1} />
          <View style={styles.headerDecoration2} />
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
              <Icon name="chevron-back" family="Ionicons" size={18} color="#FFFFFF" />
              <Text style={styles.backButtonText}>Back</Text>
            </View>
          </TouchableOpacity>
          <Icon name="trophy" family="Ionicons" size={48} color="#FFFFFF" />
          <Text style={styles.resultsTitle}>Your Matches!</Text>
          <Text style={styles.resultsSubtitle}>
            Found {recommendations.length} universities matching your criteria
          </Text>
        </LinearGradient>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsContainer}>
          {recommendations.length > 0 ? (
            recommendations.map((uni, index) => (
              <ResultCard
                key={uni.short_name || uni.name}
                university={uni}
                matchScore={uni.matchScore}
                matchReasons={uni.matchReasons || []}
                index={index}
                colors={colors}
                onViewDetails={() => handleViewDetails(uni.short_name)}
              />
            ))
          ) : (
            <View style={[styles.noResultsCard, {backgroundColor: colors.card}]}>
              <Icon name="search-outline" family="Ionicons" size={48} color={colors.textSecondary} />
              <Text style={[styles.noResultsTitle, {color: colors.text}]}>No Matches Found</Text>
              <Text style={[styles.noResultsText, {color: colors.textSecondary}]}>
                Try selecting different cities or programs to find more universities.
              </Text>
            </View>
          )}

          {/* Tips Card */}
          <View style={[styles.tipsCard, {backgroundColor: colors.card}]}>
            <LinearGradient
              colors={['rgba(52, 152, 219, 0.1)', 'transparent']}
              style={styles.tipsGradient}>
              <Icon name="bulb-outline" family="Ionicons" size={32} color="#f1c40f" />
              <Text style={[styles.tipsTitle, {color: colors.text}]}>
                Next Steps
              </Text>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>1.</Text>
                <Text style={[styles.tipText, {color: colors.textSecondary}]}>
                  Check admission deadlines for your top picks
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>2.</Text>
                <Text style={[styles.tipText, {color: colors.textSecondary}]}>
                  Prepare for entry tests (ECAT, MDCAT, etc.)
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>3.</Text>
                <Text style={[styles.tipText, {color: colors.textSecondary}]}>
                  Gather required documents early
                </Text>
              </View>
            </LinearGradient>
          </View>

          <View style={{height: SPACING.xxl * 2}} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['top']}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
      </TouchableOpacity>
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
          colors={isDark ? ['#e67e22', '#d35400'] : ['#f39c12', '#e67e22']}
          style={styles.header}>
          <View style={styles.headerDecoration1} />
          <View style={styles.headerDecoration2} />
          <Icon name="flag" family="Ionicons" size={48} color="#FFFFFF" />
          <Text style={styles.headerTitle}>Get Recommendations</Text>
          <Text style={styles.headerSubtitle}>
            Tell us about yourself to find your perfect match
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Step Indicator */}
      <View style={[styles.stepContainer, {backgroundColor: colors.card}]}>
        <StepIndicator currentStep={currentStep} totalSteps={3} colors={colors} />
        <View style={styles.stepLabels}>
          <Text style={[styles.stepLabel, {color: currentStep >= 1 ? colors.primary : colors.textMuted}]}>
            Marks
          </Text>
          <Text style={[styles.stepLabel, {color: currentStep >= 2 ? colors.primary : colors.textMuted}]}>
            Preferences
          </Text>
          <Text style={[styles.stepLabel, {color: currentStep >= 3 ? colors.primary : colors.textMuted}]}>
            Review
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.formContainer}>
        <Animated.View
          style={[
            styles.formContent,
            {
              opacity: contentAnim,
              transform: [
                {
                  translateY: contentAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}>
          {/* Validation Error Banner */}
          {validationError && (
            <View style={[styles.validationError, {backgroundColor: colors.error + '20'}]}>
              <Icon name="warning" family="Ionicons" size={18} color={colors.error} />
              <Text style={[styles.validationErrorText, {color: colors.error}]}>
                {validationError}
              </Text>
            </View>
          )}

          {/* Step 1: Academic Info */}
          {currentStep === 1 && (
            <View style={styles.stepContent}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <Icon name="library-outline" family="Ionicons" size={22} color={colors.primary} />
                <Text style={[styles.stepTitle, {color: colors.text}]}>Academic Information</Text>
              </View>
              <Text style={[styles.stepDescription, {color: colors.textSecondary}]}>
                Enter your marks to calculate merit (new total marks: 1200 for 2024+)
              </Text>

              {/* Matric Marks Row */}
              <View style={styles.marksRow}>
                <View style={styles.marksObtained}>
                  <InputField
                    label="Matric Obtained"
                    value={matricMarks}
                    onChangeText={(val: string) => handleMarksChange(val, setMatricMarks, matricTotal)}
                    placeholder="Obtained"
                    iconName="document-text-outline"
                    colors={colors}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.marksTotal}>
                  <InputField
                    label="Total"
                    value={matricTotal}
                    onChangeText={setMatricTotal}
                    placeholder="1200"
                    iconName="calculator-outline"
                    colors={colors}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* FSc/Inter Marks Row */}
              <View style={styles.marksRow}>
                <View style={styles.marksObtained}>
                  <InputField
                    label="FSc / Inter Obtained"
                    value={fscMarks}
                    onChangeText={(val: string) => handleMarksChange(val, setFscMarks, fscTotal)}
                    placeholder="Obtained"
                    iconName="book-outline"
                    colors={colors}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.marksTotal}>
                  <InputField
                    label="Total"
                    value={fscTotal}
                    onChangeText={setFscTotal}
                    placeholder="1200"
                    iconName="calculator-outline"
                    colors={colors}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Entry Test Row */}
              <View style={styles.marksRow}>
                <View style={styles.marksObtained}>
                  <InputField
                    label="Entry Test (Optional)"
                    value={entryTestScore}
                    onChangeText={(val: string) => handleMarksChange(val, setEntryTestScore, entryTestTotal)}
                    placeholder="If taken"
                    iconName="create-outline"
                    colors={colors}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.marksTotal}>
                  <InputField
                    label="Total"
                    value={entryTestTotal}
                    onChangeText={setEntryTestTotal}
                    placeholder="200"
                    iconName="calculator-outline"
                    colors={colors}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          )}

          {/* Step 2: Preferences */}
          {currentStep === 2 && (
            <View style={styles.stepContent}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <Icon name="color-palette-outline" family="Ionicons" size={22} color={colors.primary} />
                <Text style={[styles.stepTitle, {color: colors.text}]}>Your Preferences</Text>
              </View>
              <Text style={[styles.stepDescription, {color: colors.textSecondary}]}>
                What are you looking for?
              </Text>

              <View style={styles.preferenceSection}>
                <Text style={[styles.preferenceLabel, {color: colors.text}]}>
                  Preferred Programs (select multiple)
                </Text>
                <ChipSelector
                  options={programs}
                  selected={preferredPrograms}
                  onSelect={setPreferredPrograms}
                  colors={colors}
                  multiSelect
                />
              </View>

              <View style={styles.preferenceSection}>
                <Text style={[styles.preferenceLabel, {color: colors.text}]}>
                  Preferred Cities (select multiple)
                </Text>
                <ChipSelector
                  options={cities}
                  selected={preferredCities}
                  onSelect={setPreferredCities}
                  colors={colors}
                  multiSelect
                />
              </View>

              <View style={styles.preferenceSection}>
                <Text style={[styles.preferenceLabel, {color: colors.text}]}>
                  University Type
                </Text>
                <ChipSelector
                  options={types}
                  selected={preferredType}
                  onSelect={setPreferredType}
                  colors={colors}
                />
              </View>
            </View>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <View style={styles.stepContent}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <Icon name="checkmark-circle" family="Ionicons" size={22} color={colors.success} />
                <Text style={[styles.stepTitle, {color: colors.text}]}>Review Your Information</Text>
              </View>
              <Text style={[styles.stepDescription, {color: colors.textSecondary}]}>
                Make sure everything looks correct
              </Text>

              <View style={[styles.reviewCard, {backgroundColor: colors.card}]}>
                <View style={styles.reviewSection}>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                    <Icon name="document-text-outline" family="Ionicons" size={16} color={colors.textSecondary} />
                    <Text style={[styles.reviewLabel, {color: colors.textSecondary}]}>Matric Marks</Text>
                  </View>
                  <Text style={[styles.reviewValue, {color: colors.text}]}>
                    {matricMarks} / {matricTotal}
                  </Text>
                </View>
                <View style={[styles.reviewDivider, {backgroundColor: colors.border}]} />
                
                <View style={styles.reviewSection}>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                    <Icon name="book-outline" family="Ionicons" size={16} color={colors.textSecondary} />
                    <Text style={[styles.reviewLabel, {color: colors.textSecondary}]}>FSc Marks</Text>
                  </View>
                  <Text style={[styles.reviewValue, {color: colors.text}]}>
                    {fscMarks} / {fscTotal}
                  </Text>
                </View>
                <View style={[styles.reviewDivider, {backgroundColor: colors.border}]} />

                {entryTestScore && (
                  <>
                    <View style={styles.reviewSection}>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                        <Icon name="create-outline" family="Ionicons" size={16} color={colors.textSecondary} />
                        <Text style={[styles.reviewLabel, {color: colors.textSecondary}]}>Entry Test</Text>
                      </View>
                      <Text style={[styles.reviewValue, {color: colors.text}]}>
                        {entryTestScore} / {entryTestTotal}
                      </Text>
                    </View>
                    <View style={[styles.reviewDivider, {backgroundColor: colors.border}]} />
                  </>
                )}
                
                <View style={styles.reviewSection}>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                    <Icon name="flag-outline" family="Ionicons" size={16} color={colors.textSecondary} />
                    <Text style={[styles.reviewLabel, {color: colors.textSecondary}]}>Programs</Text>
                  </View>
                  <Text style={[styles.reviewValue, {color: colors.text}]}>
                    {preferredPrograms.join(', ') || 'Not selected'}
                  </Text>
                </View>
                <View style={[styles.reviewDivider, {backgroundColor: colors.border}]} />
                
                <View style={styles.reviewSection}>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                    <Icon name="location-outline" family="Ionicons" size={16} color={colors.textSecondary} />
                    <Text style={[styles.reviewLabel, {color: colors.textSecondary}]}>Cities (Filter Active)</Text>
                  </View>
                  <Text style={[styles.reviewValue, {color: colors.text}]}>
                    {preferredCities.join(', ') || 'Not selected'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </Animated.View>

        <View style={{height: 100}} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, {backgroundColor: colors.card}]}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={[styles.navButton, styles.backNavBtn, {borderColor: colors.border}]}
            onPress={handleBack}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
              <Icon name="chevron-back" family="Ionicons" size={18} color={colors.text} />
              <Text style={[styles.navButtonText, {color: colors.text}]}>Back</Text>
            </View>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.nextNavBtn,
            {opacity: canProceed() ? 1 : 0.5},
          ]}
          onPress={handleNext}
          disabled={!canProceed()}>
          <LinearGradient
            colors={['#f39c12', '#e67e22']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.nextGradient}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
              <Text style={styles.nextButtonText}>
                {currentStep === 3 ? 'Get Results' : 'Next'}
              </Text>
              <Icon 
                name={currentStep === 3 ? 'trophy' : 'arrow-forward'} 
                family="Ionicons" 
                size={18} 
                color="#FFFFFF" 
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backBtn: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
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
  headerEmoji: {
    fontSize: 50,
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
  stepContainer: {
    marginHorizontal: SPACING.md,
    marginTop: -20,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCheck: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepLine: {
    width: 60,
    height: 3,
    borderRadius: 2,
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  formContainer: {
    padding: SPACING.md,
  },
  formContent: {},
  stepContent: {},
  stepTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.lg,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  inputSuffix: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  preferenceSection: {
    marginBottom: SPACING.lg,
  },
  preferenceLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  chipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  chipTextActive: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#fff',
  },
  reviewCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reviewSection: {
    paddingVertical: SPACING.sm,
  },
  reviewLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: 2,
  },
  reviewValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  reviewDivider: {
    height: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navButton: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  backNavBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    justifyContent: 'center',
  },
  nextNavBtn: {
    flex: 1,
  },
  navButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  nextGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  // Results styles
  resultsHeader: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
    overflow: 'hidden',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  backButtonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '500',
  },
  resultsEmoji: {
    fontSize: 60,
    marginBottom: SPACING.xs,
  },
  resultsTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  resultsSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  resultsContainer: {
    padding: SPACING.md,
  },
  resultCard: {
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  resultGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  rankBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  rankText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  resultContent: {
    padding: SPACING.md,
  },
  resultHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  resultCity: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  resultType: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  matchContainer: {
    alignItems: 'center',
  },
  matchCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchScore: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  matchLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  matchReasons: {
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  matchReasonsTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    marginBottom: 4,
  },
  matchReason: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: 2,
  },
  viewDetailBtn: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  viewDetailText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  tipsCard: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.md,
  },
  tipsGradient: {
    padding: SPACING.md,
  },
  tipsIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  tipBullet: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    marginRight: 6,
    color: '#4573DF',
  },
  tipText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  // New styles for marks input rows
  marksRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  marksObtained: {
    flex: 2,
  },
  marksTotal: {
    flex: 1,
  },
  // Validation error styles
  validationError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  validationErrorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
  },
  // No results styles
  noResultsCard: {
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    marginTop: SPACING.md,
  },
  noResultsText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});

export default PremiumRecommendationsScreen;
