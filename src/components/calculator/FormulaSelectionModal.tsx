import React from 'react';
import {View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet} from 'react-native';
import {Icon} from '../icons';
import {TYPOGRAPHY, SPACING, RADIUS} from '../../constants/design';
import type {MeritFormulaData} from '../../data';
import {MERIT_FORMULAS} from '../../data';

interface FormulaSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  customFormulas: MeritFormulaData[];
  selectedFormula: MeritFormulaData | null;
  onSelectFormula: (formula: MeritFormulaData | null) => void;
  colors: any;
  isDark: boolean;
}

// Internal reusable component for rendering a single formula option
const FormulaOptionItem = React.memo(({
  formula,
  isSelected,
  iconName,
  iconColor,
  colors,
  onPress,
}: {
  formula: MeritFormulaData;
  isSelected: boolean;
  iconName: string;
  iconColor: string;
  colors: any;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[
      styles.formulaOption,
      {
        backgroundColor: isSelected ? `${colors.primary}10` : colors.background,
        borderColor: isSelected ? colors.primary : 'transparent',
      },
    ]}
    onPress={onPress}>
    <Icon name={iconName} family="Ionicons" size={28} color={iconColor} />
    <View style={styles.formulaOptionInfo}>
      <Text style={[styles.formulaName, {color: colors.text}]}>
        {formula.name}
      </Text>
      <Text style={[styles.formulaUniversity, {color: colors.textSecondary}]}>
        {formula.university}
      </Text>
      <View style={styles.formulaWeights}>
        <View style={[styles.weightBadge, {backgroundColor: `${colors.primary}15`}]}>
          <Text style={[styles.weightText, {color: colors.primary}]}>
            {formula.matric_weightage}% Matric
          </Text>
        </View>
        <View style={[styles.weightBadge, {backgroundColor: `${colors.success}15`}]}>
          <Text style={[styles.weightText, {color: colors.success}]}>
            {formula.inter_weightage}% Inter
          </Text>
        </View>
        {formula.entry_test_weightage > 0 && (
          <View style={[styles.weightBadge, {backgroundColor: `${colors.warning}15`}]}>
            <Text style={[styles.weightText, {color: colors.warning}]}>
              {formula.entry_test_weightage}% {formula.entry_test_name}
            </Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
));

// Internal reusable component for a category section header
const CategoryHeader = React.memo(({
  iconName,
  iconColor,
  title,
  colors,
  useEmoji,
}: {
  iconName?: string;
  iconColor?: string;
  title: string;
  colors: any;
  useEmoji?: boolean;
}) => {
  if (useEmoji) {
    return (
      <Text style={[styles.formulaCategoryTitle, {color: colors.text}]}>{title}</Text>
    );
  }
  return (
    <View style={styles.categoryHeaderRow}>
      <Icon name={iconName!} family="Ionicons" size={18} color={iconColor!} />
      <Text style={[styles.formulaCategoryTitleInline, {color: colors.text}]}>{title}</Text>
    </View>
  );
});

// Category configuration for DRY rendering
const CATEGORIES = [
  {
    key: 'medical',
    title: 'Medical Colleges',
    iconName: 'medkit-outline',
    iconColor: '#EF4444',
    filter: (f: MeritFormulaData) =>
      f.applicable_fields.some(field =>
        field.toLowerCase().includes('medical') ||
        field.toLowerCase().includes('mbbs') ||
        field.toLowerCase().includes('bds'),
      ),
  },
  {
    key: 'engineering',
    title: 'Engineering Universities',
    iconName: 'construct-outline',
    iconColor: '#F59E0B',
    filter: (f: MeritFormulaData) =>
      f.applicable_fields.some(field =>
        field.toLowerCase().includes('engineering') ||
        field.toLowerCase().includes('bsc engineering') ||
        field.toLowerCase().includes('be'),
      ) && !f.applicable_fields.some(field => field.toLowerCase().includes('medical')),
  },
  {
    key: 'cs',
    title: '💻 Computer Science & IT',
    iconName: 'code-slash-outline',
    iconColor: '#4573DF',
    useEmoji: true,
    filter: (f: MeritFormulaData) =>
      f.applicable_fields.some(field =>
        field.toLowerCase().includes('computer') ||
        field.toLowerCase().includes('software') ||
        field.toLowerCase().includes('data'),
      ),
  },
  {
    key: 'business',
    title: 'Business Schools',
    iconName: 'briefcase-outline',
    iconColor: '#F59E0B',
    itemIconName: 'briefcase-outline',
    itemIconColor: '#10B981',
    filter: (f: MeritFormulaData) =>
      f.applicable_fields.some(field =>
        field.toLowerCase().includes('business') ||
        field.toLowerCase().includes('bba') ||
        field.toLowerCase().includes('accounting') ||
        field.toLowerCase().includes('economics'),
      ),
  },
  {
    key: 'general',
    title: 'General Universities',
    iconName: 'school-outline',
    iconColor: '#4573DF',
    filter: (f: MeritFormulaData) =>
      f.applicable_fields.some(field =>
        field.toLowerCase().includes('general') ||
        field.toLowerCase().includes('arts') ||
        field.toLowerCase().includes('all programs') ||
        field.toLowerCase().includes('bs programs'),
      ),
  },
];

const FormulaSelectionModal = React.memo(({
  visible,
  onClose,
  customFormulas,
  selectedFormula,
  onSelectFormula,
  colors,
  isDark,
}: FormulaSelectionModalProps) => {
  const handleSelect = (formula: MeritFormulaData | null) => {
    onSelectFormula(formula);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
          <View style={[styles.modalHeader, {borderBottomColor: colors.border}]}>
            <Text style={[styles.modalTitle, {color: colors.text}]}>
              Select University Formula
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.modalCloseBtn, {backgroundColor: colors.background}]}>
              <Icon name="close" family="Ionicons" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            {/* Calculate All Option */}
            <TouchableOpacity
              style={[
                styles.formulaOption,
                {
                  backgroundColor: !selectedFormula ? `${colors.primary}10` : colors.background,
                  borderColor: !selectedFormula ? colors.primary : 'transparent',
                },
              ]}
              onPress={() => handleSelect(null)}>
              <Icon name="bar-chart-outline" family="Ionicons" size={28} color={colors.primary} />
              <View style={styles.formulaOptionInfo}>
                <Text style={[styles.formulaName, {color: colors.text}]}>
                  Calculate All Formulas
                </Text>
                <Text style={[styles.formulaDesc, {color: colors.textSecondary}]}>
                  Compare across MDCAT, ECAT, NET & all university formulas
                </Text>
              </View>
            </TouchableOpacity>

            {/* Render each category */}
            {CATEGORIES.map(cat => {
              const formulas = MERIT_FORMULAS.filter(cat.filter);
              if (formulas.length === 0) return null;

              return (
                <React.Fragment key={cat.key}>
                  <CategoryHeader
                    iconName={cat.iconName}
                    iconColor={cat.iconColor}
                    title={cat.title}
                    colors={colors}
                    useEmoji={cat.useEmoji}
                  />
                  {formulas.map(formula => (
                    <FormulaOptionItem
                      key={formula.id}
                      formula={formula}
                      isSelected={selectedFormula?.id === formula.id}
                      iconName={cat.key === 'business' ? 'briefcase-outline' : cat.key === 'general' ? 'school-outline' : cat.iconName}
                      iconColor={cat.key === 'business' ? '#10B981' : cat.key === 'general' ? '#4573DF' : cat.iconColor}
                      colors={colors}
                      onPress={() => handleSelect(formula)}
                    />
                  ))}
                </React.Fragment>
              );
            })}

            {/* Custom Formulas Section */}
            {customFormulas.length > 0 && (
              <>
                <CategoryHeader
                  iconName="construct-outline"
                  iconColor="#10B981"
                  title="Your Custom Formulas"
                  colors={colors}
                />
                {customFormulas.map(formula => (
                  <FormulaOptionItem
                    key={formula.id}
                    formula={formula}
                    isSelected={selectedFormula?.id === formula.id}
                    iconName="flask-outline"
                    iconColor="#10B981"
                    colors={colors}
                    onPress={() => handleSelect(formula)}
                  />
                ))}
              </>
            )}

            <View style={{height: 50}} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    padding: SPACING.lg,
  },
  formulaOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    gap: SPACING.md,
  },
  formulaOptionInfo: {
    flex: 1,
  },
  formulaName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  formulaDesc: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    marginTop: 2,
  },
  formulaUniversity: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    marginTop: 2,
  },
  formulaWeights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  weightBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  weightText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  formulaCategoryTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  formulaCategoryTitleInline: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    paddingHorizontal: SPACING.xs,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
});

export default FormulaSelectionModal;
