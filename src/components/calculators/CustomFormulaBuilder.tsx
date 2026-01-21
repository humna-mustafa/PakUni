/**
 * Custom Formula Builder
 * Allow users to enter custom university weightages
 * For universities not in our database or with different formulas
 */

import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Alert,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TYPOGRAPHY, RADIUS, SPACING} from '../../constants/design';
import {useTheme} from '../../contexts/ThemeContext';

// ============================================================================
// TYPES
// ============================================================================

export interface CustomFormula {
  id: string;
  name: string;
  shortName: string;
  matricWeight: number;
  interWeight: number;
  testWeight: number;
  testName: string;
  createdAt: number;
  color: string;
}

interface FormulaBuilderProps {
  onFormulaCreated?: (formula: CustomFormula) => void;
  onFormulaSelected?: (formula: CustomFormula) => void;
}

// Storage key
const STORAGE_KEY = '@pakuni_custom_formulas';

// Preset colors for custom formulas
const FORMULA_COLORS = [
  '#4573DF',
  '#3660C9',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#4573DF',
  '#0891B2',
  '#84CC16',
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateId = () => `formula_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const loadFormulas = async (): Promise<CustomFormula[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading formulas:', error);
    return [];
  }
};

const saveFormulas = async (formulas: CustomFormula[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(formulas));
  } catch (error) {
    console.error('Error saving formulas:', error);
  }
};

// ============================================================================
// WEIGHT SLIDER COMPONENT
// ============================================================================

interface WeightSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
  icon: string;
  themeColors?: {
    text: string;
    textSecondary: string;
    border: string;
    card: string;
  };
}

const WeightSlider: React.FC<WeightSliderProps> = ({
  label,
  value,
  onChange,
  color,
  icon,
  themeColors,
}) => {
  const handleIncrement = () => {
    if (value < 100) onChange(value + 5);
  };

  const handleDecrement = () => {
    if (value > 0) onChange(value - 5);
  };

  const buttonBg = themeColors?.card || '#F1F5F9';
  const trackBg = themeColors?.border || '#E2E8F0';
  const labelColor = themeColors?.textSecondary || '#475569';
  const iconColor = themeColors?.textSecondary || '#64748B';

  return (
    <View style={weightStyles.container}>
      <View style={weightStyles.header}>
        <Icon name={icon} size={18} color={color} />
        <Text style={[weightStyles.label, {color: labelColor}]}>{label}</Text>
        <Text style={[weightStyles.value, {color}]}>{value}%</Text>
      </View>
      <View style={weightStyles.sliderRow}>
        <TouchableOpacity
          onPress={handleDecrement}
          style={[weightStyles.button, {backgroundColor: buttonBg}]}
          activeOpacity={0.7}>
          <Icon name="remove" size={20} color={iconColor} />
        </TouchableOpacity>
        <View style={[weightStyles.track, {backgroundColor: trackBg}]}>
          <Animated.View
            style={[
              weightStyles.fill,
              {width: `${value}%`, backgroundColor: color},
            ]}
          />
        </View>
        <TouchableOpacity
          onPress={handleIncrement}
          style={[weightStyles.button, {backgroundColor: buttonBg}]}
          activeOpacity={0.7}>
          <Icon name="add" size={20} color={iconColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const weightStyles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  value: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '800',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    marginHorizontal: SPACING.sm,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 6,
  },
});

// ============================================================================
// FORMULA CARD COMPONENT
// ============================================================================

interface FormulaCardProps {
  formula: CustomFormula;
  onSelect: () => void;
  onDelete: () => void;
  isSelected?: boolean;
  themeColors?: {
    text: string;
    textSecondary: string;
    textMuted: string;
    card: string;
  };
}

const FormulaCard: React.FC<FormulaCardProps> = ({
  formula,
  onSelect,
  onDelete,
  isSelected,
  themeColors,
}) => {
  const cardBg = themeColors?.card || '#FFF';
  const nameColor = themeColors?.text || '#1E293B';
  const labelColor = themeColors?.textMuted || '#94A3B8';
  
  return (
    <TouchableOpacity
      onPress={onSelect}
      style={[
        cardStyles.container,
        {backgroundColor: cardBg},
        isSelected && {borderColor: formula.color, borderWidth: 2},
      ]}
      activeOpacity={0.8}>
      <LinearGradient
        colors={[formula.color, formula.color + 'CC']}
        style={cardStyles.colorStrip}
      />
      <View style={cardStyles.content}>
        <View style={cardStyles.header}>
          <Text style={[cardStyles.name, {color: nameColor}]}>{formula.name}</Text>
          <TouchableOpacity
            onPress={onDelete}
            style={cardStyles.deleteButton}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
        <View style={cardStyles.weights}>
          <View style={cardStyles.weightItem}>
            <Text style={[cardStyles.weightLabel, {color: labelColor}]}>Matric</Text>
            <Text style={[cardStyles.weightValue, {color: formula.color}]}>
              {formula.matricWeight}%
            </Text>
          </View>
          <View style={cardStyles.weightItem}>
            <Text style={[cardStyles.weightLabel, {color: labelColor}]}>Inter</Text>
            <Text style={[cardStyles.weightValue, {color: formula.color}]}>
              {formula.interWeight}%
            </Text>
          </View>
          <View style={cardStyles.weightItem}>
            <Text style={[cardStyles.weightLabel, {color: labelColor}]}>{formula.testName}</Text>
            <Text style={[cardStyles.weightValue, {color: formula.color}]}>
              {formula.testWeight}%
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const cardStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  colorStrip: {
    width: 6,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  name: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  deleteButton: {
    padding: 4,
  },
  weights: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weightItem: {
    alignItems: 'center',
  },
  weightLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: 2,
  },
  weightValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CustomFormulaBuilder: React.FC<FormulaBuilderProps> = ({
  onFormulaCreated,
  onFormulaSelected,
}) => {
  // Theme
  const {colors, isDark} = useTheme();
  
  // State
  const [formulas, setFormulas] = useState<CustomFormula[]>([]);
  const [selectedFormula, setSelectedFormula] = useState<CustomFormula | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New formula state
  const [newName, setNewName] = useState('');
  const [newShortName, setNewShortName] = useState('');
  const [newTestName, setNewTestName] = useState('');
  const [matricWeight, setMatricWeight] = useState(10);
  const [interWeight, setInterWeight] = useState(40);
  const [testWeight, setTestWeight] = useState(50);
  const [selectedColor, setSelectedColor] = useState(FORMULA_COLORS[0]);

  // Total weight calculation
  const totalWeight = matricWeight + interWeight + testWeight;
  const isValidTotal = totalWeight === 100;

  // Load formulas on mount
  useEffect(() => {
    loadFormulas().then(data => {
      setFormulas(data);
      setIsLoading(false);
    });
  }, []);

  // Reset form
  const resetForm = () => {
    setNewName('');
    setNewShortName('');
    setNewTestName('');
    setMatricWeight(10);
    setInterWeight(40);
    setTestWeight(50);
    setSelectedColor(FORMULA_COLORS[Math.floor(Math.random() * FORMULA_COLORS.length)]);
  };

  // Create formula
  const handleCreateFormula = useCallback(async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Please enter a formula name');
      return;
    }

    if (!newTestName.trim()) {
      Alert.alert('Error', 'Please enter the entry test name');
      return;
    }

    if (!isValidTotal) {
      Alert.alert('Error', 'Weights must add up to 100%');
      return;
    }

    const newFormula: CustomFormula = {
      id: generateId(),
      name: newName.trim(),
      shortName: newShortName.trim() || newName.trim().substring(0, 4).toUpperCase(),
      matricWeight,
      interWeight,
      testWeight,
      testName: newTestName.trim(),
      createdAt: Date.now(),
      color: selectedColor,
    };

    const updatedFormulas = [...formulas, newFormula];
    await saveFormulas(updatedFormulas);
    setFormulas(updatedFormulas);
    setShowModal(false);
    resetForm();

    onFormulaCreated?.(newFormula);
  }, [
    newName,
    newShortName,
    newTestName,
    matricWeight,
    interWeight,
    testWeight,
    selectedColor,
    isValidTotal,
    formulas,
    onFormulaCreated,
  ]);

  // Delete formula
  const handleDeleteFormula = useCallback(
    async (formulaId: string) => {
      Alert.alert(
        'Delete Formula',
        'Are you sure you want to delete this custom formula?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              const updatedFormulas = formulas.filter(f => f.id !== formulaId);
              await saveFormulas(updatedFormulas);
              setFormulas(updatedFormulas);
              if (selectedFormula?.id === formulaId) {
                setSelectedFormula(null);
              }
            },
          },
        ]
      );
    },
    [formulas, selectedFormula]
  );

  // Select formula
  const handleSelectFormula = (formula: CustomFormula) => {
    setSelectedFormula(formula);
    onFormulaSelected?.(formula);
  };

  // Render modal
  const renderModal = () => (
    <Modal
      visible={showModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowModal(false)}>
      <View style={[modalStyles.container, {backgroundColor: colors.background}]}>
        {/* Modal Header */}
        <View style={[modalStyles.header, {backgroundColor: colors.card, borderBottomColor: colors.border}]}>
          <TouchableOpacity
            onPress={() => {
              setShowModal(false);
              resetForm();
            }}
            style={modalStyles.closeButton}>
            <Icon name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[modalStyles.title, {color: colors.text}]}>Create Custom Formula</Text>
          <View style={{width: 24}} />
        </View>

        <ScrollView style={modalStyles.content}>
          {/* Name Input */}
          <View style={modalStyles.inputGroup}>
            <Text style={modalStyles.inputLabel}>University / Formula Name</Text>
            <TextInput
              style={modalStyles.textInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g., My University"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Short Name */}
          <View style={modalStyles.inputGroup}>
            <Text style={modalStyles.inputLabel}>Short Name (Optional)</Text>
            <TextInput
              style={modalStyles.textInput}
              value={newShortName}
              onChangeText={setNewShortName}
              placeholder="e.g., MYUNI"
              placeholderTextColor="#94A3B8"
              maxLength={6}
              autoCapitalize="characters"
            />
          </View>

          {/* Test Name */}
          <View style={modalStyles.inputGroup}>
            <Text style={modalStyles.inputLabel}>Entry Test Name</Text>
            <TextInput
              style={modalStyles.textInput}
              value={newTestName}
              onChangeText={setNewTestName}
              placeholder="e.g., University Test, NTS, etc."
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Color Picker */}
          <View style={modalStyles.inputGroup}>
            <Text style={modalStyles.inputLabel}>Color Theme</Text>
            <View style={modalStyles.colorPicker}>
              {FORMULA_COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    modalStyles.colorOption,
                    {backgroundColor: color},
                    selectedColor === color && modalStyles.colorOptionSelected,
                  ]}>
                  {selectedColor === color && (
                    <Icon name="checkmark" size={16} color="#FFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Weight Sliders */}
          <View style={modalStyles.weightsSection}>
            <View style={modalStyles.weightHeader}>
              <Text style={modalStyles.weightsTitle}>Set Weights</Text>
              <View
                style={[
                  modalStyles.totalBadge,
                  isValidTotal
                    ? {backgroundColor: isDark ? '#064E3B' : '#DCFCE7'}
                    : {backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2'},
                ]}>
                <Text
                  style={[
                    modalStyles.totalText,
                    {color: isValidTotal ? '#10B981' : '#EF4444'},
                  ]}>
                  Total: {totalWeight}%
                </Text>
              </View>
            </View>

            <WeightSlider
              label="Matric Weight"
              value={matricWeight}
              onChange={setMatricWeight}
              color="#4573DF"
              icon="school-outline"
              themeColors={colors}
            />

            <WeightSlider
              label="Intermediate Weight"
              value={interWeight}
              onChange={setInterWeight}
              color="#10B981"
              icon="book-outline"
              themeColors={colors}
            />

            <WeightSlider
              label="Entry Test Weight"
              value={testWeight}
              onChange={setTestWeight}
              color="#F59E0B"
              icon="create-outline"
              themeColors={colors}
            />

            {!isValidTotal && (
              <View style={modalStyles.warningBox}>
                <Icon name="warning-outline" size={16} color="#F59E0B" />
                <Text style={modalStyles.warningText}>
                  Weights must add up to exactly 100%
                </Text>
              </View>
            )}
          </View>

          {/* Preview */}
          <View style={modalStyles.previewSection}>
            <Text style={modalStyles.previewTitle}>Formula Preview</Text>
            <View
              style={[
                modalStyles.previewCard,
                {borderLeftColor: selectedColor},
              ]}>
              <Text style={modalStyles.previewFormula}>
                Aggregate = (Matric × {matricWeight}%) + (Inter × {interWeight}%) +
                ({newTestName || 'Test'} × {testWeight}%)
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Create Button */}
        <View style={modalStyles.footer}>
          <TouchableOpacity
            onPress={handleCreateFormula}
            disabled={!isValidTotal || !newName.trim() || !newTestName.trim()}
            activeOpacity={0.8}>
            <LinearGradient
              colors={
                isValidTotal && newName.trim() && newTestName.trim()
                  ? [selectedColor, selectedColor + 'CC']
                  : ['#CBD5E1', '#94A3B8']
              }
              style={modalStyles.createButton}>
              <Icon name="add-circle-outline" size={20} color="#FFF" />
              <Text style={modalStyles.createButtonText}>Create Formula</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const modalStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: SPACING.lg,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    closeButton: {
      padding: 4,
    },
    title: {
      fontSize: TYPOGRAPHY.sizes.lg,
      fontWeight: '700',
      color: colors.text,
    },
    content: {
      flex: 1,
      padding: SPACING.lg,
    },
    inputGroup: {
      marginBottom: SPACING.lg,
    },
    inputLabel: {
      fontSize: TYPOGRAPHY.sizes.sm,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: SPACING.xs,
    },
    textInput: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      fontSize: TYPOGRAPHY.sizes.md,
      color: colors.text,
    },
    colorPicker: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    colorOption: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: SPACING.sm,
      marginBottom: SPACING.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    colorOptionSelected: {
      borderWidth: 3,
      borderColor: colors.card,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    weightsSection: {
      backgroundColor: colors.card,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.lg,
    },
    weightHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    weightsTitle: {
      fontSize: TYPOGRAPHY.sizes.md,
      fontWeight: '700',
      color: colors.text,
    },
    totalBadge: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: 4,
      borderRadius: RADIUS.sm,
    },
    totalText: {
      fontSize: TYPOGRAPHY.sizes.sm,
      fontWeight: '700',
    },
    warningBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#422006' : '#FEF3C7',
      borderRadius: RADIUS.md,
      padding: SPACING.sm,
      marginTop: SPACING.sm,
    },
    warningText: {
      fontSize: TYPOGRAPHY.sizes.sm,
      color: isDark ? '#FCD34D' : '#92400E',
      marginLeft: SPACING.sm,
    },
    previewSection: {
      marginBottom: SPACING.lg,
    },
    previewTitle: {
      fontSize: TYPOGRAPHY.sizes.sm,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: SPACING.sm,
    },
    previewCard: {
      backgroundColor: colors.card,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      borderLeftWidth: 4,
    },
    previewFormula: {
      fontSize: TYPOGRAPHY.sizes.sm,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    footer: {
      padding: SPACING.lg,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.md,
    },
    createButtonText: {
      fontSize: TYPOGRAPHY.sizes.md,
      fontWeight: '700',
      color: '#FFF',
      marginLeft: SPACING.sm,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#4573DF', '#4573DF']}
          style={styles.headerIcon}>
          <Icon name="construct-outline" size={24} color="#FFF" />
        </LinearGradient>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Custom Formula Builder</Text>
          <Text style={styles.headerSubtitle}>
            Create your own university formula
          </Text>
        </View>
      </View>

      {/* Saved Formulas */}
      {formulas.length > 0 && (
        <View style={styles.savedSection}>
          <Text style={styles.sectionTitle}>
            Your Formulas ({formulas.length})
          </Text>
          {formulas.map(formula => (
            <FormulaCard
              key={formula.id}
              formula={formula}
              onSelect={() => handleSelectFormula(formula)}
              onDelete={() => handleDeleteFormula(formula.id)}
              isSelected={selectedFormula?.id === formula.id}
              themeColors={colors}
            />
          ))}
        </View>
      )}

      {/* Empty State */}
      {formulas.length === 0 && !isLoading && (
        <View style={styles.emptyState}>
          <Icon name="flask-outline" size={48} color={colors.border} />
          <Text style={styles.emptyTitle}>No Custom Formulas</Text>
          <Text style={styles.emptyText}>
            Create a custom formula for universities not in our database
          </Text>
        </View>
      )}

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          resetForm();
          setShowModal(true);
        }}
        activeOpacity={0.8}>
        <LinearGradient
          colors={['#4573DF', '#4573DF']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.addButtonGradient}>
          <Icon name="add-outline" size={20} color="#FFF" />
          <Text style={styles.addButtonText}>Create Custom Formula</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Modal */}
      {renderModal()}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    // backgroundColor set dynamically via colors.card
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    // color set dynamically via colors.text
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    // color set dynamically via colors.textSecondary
    marginTop: 2,
  },
  savedSection: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    // color set dynamically via colors.textSecondary
    marginBottom: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    // color set dynamically via colors.textSecondary
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    // color set dynamically via colors.textMuted
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  addButton: {
    marginTop: SPACING.sm,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  addButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: SPACING.sm,
  },
});

export default CustomFormulaBuilder;



