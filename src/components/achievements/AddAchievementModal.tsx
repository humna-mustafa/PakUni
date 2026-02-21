/**
 * AddAchievementModal - Modal for adding/editing achievements with searchable dropdowns.
 */
import React, {useState, useEffect, useRef, useMemo} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal, Animated, TextInput,
  KeyboardAvoidingView, Platform, Alert, StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import SearchableDropdown, {
  createUniversityOptionsWithFullNames,
  createScholarshipOptions,
  createEntryTestOptions,
  createProgramOptions,
} from '../SearchableDropdown';
import DatePickerModal from './DatePickerModal';
import type {AchievementTemplate} from '../../services/achievements';

interface AddAchievementModalProps {
  visible: boolean;
  template: AchievementTemplate | null;
  onClose: () => void;
  onAdd: (data: Record<string, string>) => void;
  colors: any;
  initialData?: Record<string, string>;
  isEditing?: boolean;
}

const AddAchievementModal: React.FC<AddAchievementModalProps> = ({
  visible, template, onClose, onAdd, colors, initialData, isEditing,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDateField, setActiveDateField] = useState<string | null>(null);
  const modalAnim = useRef(new Animated.Value(0)).current;

  const universityOptions = useMemo(() => createUniversityOptionsWithFullNames(), []);
  const scholarshipOptions = useMemo(() => createScholarshipOptions(), []);
  const entryTestOptions = useMemo(() => createEntryTestOptions(), []);
  const programOptions = useMemo(() => createProgramOptions(), []);

  useEffect(() => {
    if (visible) {
      setFormData(initialData || {});
      Animated.spring(modalAnim, {toValue: 1, tension: 50, friction: 8, useNativeDriver: true}).start();
    } else {
      Animated.timing(modalAnim, {toValue: 0, duration: 200, useNativeDriver: true}).start();
    }
  }, [visible, modalAnim]);

  if (!template) return null;

  const handleAdd = () => {
    const required = template.fields.filter(f => f.required);
    const missing = required.find(f => !formData[f.key]?.trim());
    if (missing) {
      Alert.alert('Required Field', `Please fill in "${missing.label}"`);
      return;
    }
    const dateField = template.fields.find(f => f.key === 'date');
    if (dateField && formData.date && formData.date.trim()) {
      const dateRegex = /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/;
      if (!dateRegex.test(formData.date.trim())) {
        Alert.alert('Invalid Date Format', 'Please enter date in DD/MM/YYYY format.\n\nExample: 15/03/2025');
        return;
      }
    }
    onAdd(formData);
  };

  const getFieldComponent = (field: typeof template.fields[0]) => {
    const fieldKey = field.key.toLowerCase();

    if (fieldKey === 'universityname') {
      const currentOption = universityOptions.find(opt => opt.label === formData[field.key] || opt.metadata?.name === formData[field.key]);
      return (
        <SearchableDropdown label={field.label + (field.required ? ' *' : '')} placeholder={field.placeholder}
          options={universityOptions} value={currentOption?.value}
          onSelect={(option) => { setFormData(prev => ({...prev, [field.key]: option.metadata?.name || option.label})); }}
          allowCustom customPlaceholder="Type custom university name..."
          onCustomEntry={(text) => setFormData(prev => ({...prev, [field.key]: text}))} showLogos />
      );
    }

    if (fieldKey === 'testname' && (template.type === 'entry_test' || template.type === 'result')) {
      const currentOption = entryTestOptions.find(opt => opt.label === formData[field.key]);
      return (
        <SearchableDropdown label={field.label + (field.required ? ' *' : '')} placeholder={field.placeholder}
          options={entryTestOptions} value={currentOption?.value}
          onSelect={(option) => { setFormData(prev => ({...prev, [field.key]: option.label})); }}
          allowCustom customPlaceholder="Type custom test/exam name..."
          onCustomEntry={(text) => setFormData(prev => ({...prev, [field.key]: text}))} />
      );
    }

    if (fieldKey === 'programname') {
      return (
        <SearchableDropdown label={field.label + (field.required ? ' *' : '')} placeholder={field.placeholder}
          options={programOptions} value={formData[field.key]}
          onSelect={(option) => { setFormData(prev => ({...prev, [field.key]: option.value})); }}
          allowCustom customPlaceholder="Type custom program name..."
          onCustomEntry={(text) => setFormData(prev => ({...prev, [field.key]: text}))} />
      );
    }

    if (fieldKey === 'scholarshipname') {
      const currentOption = scholarshipOptions.find(opt => opt.label === formData[field.key]);
      return (
        <SearchableDropdown label={field.label + (field.required ? ' *' : '')} placeholder={field.placeholder}
          options={scholarshipOptions} value={currentOption?.value}
          onSelect={(option) => { setFormData(prev => ({...prev, [field.key]: option.label})); }}
          allowCustom customPlaceholder="Type custom scholarship name..."
          onCustomEntry={(text) => setFormData(prev => ({...prev, [field.key]: text}))} />
      );
    }

    const isDateField = fieldKey === 'date' || fieldKey === 'graduationdate' || fieldKey === 'testdate';

    if (isDateField) {
      const displayValue = formData[field.key]
        ? formData[field.key]
        : '';
      return (
        <View>
          <Text style={[styles.fieldLabel, {color: colors.text}]}>
            {field.label}
            {field.required && <Text style={{color: '#EF4444'}}> *</Text>}
          </Text>
          <TouchableOpacity
            style={[styles.datePickerButton, {backgroundColor: colors.background, borderColor: colors.border}]}
            onPress={() => {
              setActiveDateField(field.key);
              setShowDatePicker(true);
            }}
            activeOpacity={0.7}>
            <Icon name="calendar-outline" family="Ionicons" size={18} color={colors.primary} />
            <Text style={[styles.datePickerText, {color: displayValue ? colors.text : colors.textSecondary}]}>
              {displayValue || 'Tap to select date'}
            </Text>
            <Icon name="chevron-forward" family="Ionicons" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View>
        <Text style={[styles.fieldLabel, {color: colors.text}]}>
          {field.label}
          {field.required && <Text style={{color: '#EF4444'}}> *</Text>}
        </Text>
        <TextInput
          style={[styles.fieldInput, {backgroundColor: colors.background, color: colors.text, borderColor: colors.border}]}
          placeholder={field.placeholder} placeholderTextColor={colors.textSecondary}
          value={formData[field.key] || ''}
          onChangeText={(text) => setFormData(prev => ({...prev, [field.key]: text}))}
          keyboardType="default" />
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[styles.content, {backgroundColor: colors.card,
          transform: [{scale: modalAnim.interpolate({inputRange: [0, 1], outputRange: [0.9, 1]})}], opacity: modalAnim}]}>
          <LinearGradient colors={template.gradientColors} style={styles.header}>
            <View style={styles.headerDecor1} />
            <View style={styles.headerDecor2} />
            <View style={styles.headerDecor3} />
            <Text style={styles.emoji}>{template.icon}</Text>
            <Text style={styles.title}>{template.title}</Text>
            <View style={styles.sparkleContainer}>
              <Text style={styles.sparkle}>✨</Text>
              <Text style={[styles.sparkle, styles.sparkle2]}>⭐</Text>
              <Text style={[styles.sparkle, styles.sparkle3]}>💫</Text>
            </View>
          </LinearGradient>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Icon name="close" family="Ionicons" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={[styles.tipCard, {backgroundColor: colors.primaryLight + '20'}]}>
              <Icon name="bulb-outline" family="Ionicons" size={16} color={colors.primary} />
              <Text style={[styles.tipText, {color: colors.primary}]}>Search from list or type custom name</Text>
            </View>
            {template.fields.map(field => (
              <View key={field.key} style={styles.formField}>{getFieldComponent(field)}</View>
            ))}
          </ScrollView>

          <TouchableOpacity style={[styles.addBtn, {backgroundColor: template.gradientColors[0]}]} onPress={handleAdd}>
            <Icon name={isEditing ? 'checkmark-circle' : 'add-circle'} family="Ionicons" size={20} color="#FFF" />
            <Text style={styles.addBtnText}>{isEditing ? 'Save Changes' : 'Add Achievement'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={(dateStr) => {
          if (activeDateField) {
            setFormData(prev => ({...prev, [activeDateField]: dateStr}));
          }
          setActiveDateField(null);
        }}
        initialDate={activeDateField ? formData[activeDateField] : undefined}
        colors={colors}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {flex: 1, justifyContent: 'flex-end'},
  backdrop: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)'},
  content: {borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl, maxHeight: '85%'},
  header: {paddingTop: SPACING.xl, paddingBottom: SPACING.lg, alignItems: 'center', borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl, overflow: 'hidden', position: 'relative'},
  headerDecor1: {position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)'},
  headerDecor2: {position: 'absolute', bottom: -10, left: -10, width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.1)'},
  headerDecor3: {position: 'absolute', top: 20, left: 30, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)'},
  sparkleContainer: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none'},
  sparkle: {position: 'absolute', fontSize: 14, top: 15, right: 25},
  sparkle2: {top: 35, right: 50, fontSize: 10},
  sparkle3: {top: 20, left: 30, fontSize: 12},
  emoji: {fontSize: 48, marginBottom: SPACING.xs},
  title: {fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weight.bold, color: '#fff'},
  closeBtn: {position: 'absolute', top: SPACING.md, right: SPACING.md, padding: SPACING.xs, zIndex: 10},
  form: {padding: SPACING.md, maxHeight: 300},
  formField: {marginBottom: SPACING.md},
  fieldLabel: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.semibold, marginBottom: 6},
  fieldInput: {borderWidth: 1, borderRadius: RADIUS.md, padding: SPACING.sm, fontSize: TYPOGRAPHY.sizes.md},
  tipCard: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: RADIUS.md, gap: SPACING.xs, marginBottom: SPACING.md},
  tipText: {fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weight.medium},
  addBtn: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, margin: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.lg},
  addBtnText: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.semibold, color: '#fff'},
  datePickerButton: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, borderWidth: 1,
    borderRadius: RADIUS.md, padding: SPACING.sm,
  },
  datePickerText: {flex: 1, fontSize: TYPOGRAPHY.sizes.md},
});

export default AddAchievementModal;
