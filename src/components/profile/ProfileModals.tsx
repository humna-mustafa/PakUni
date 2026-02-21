/**
 * ProfileModals - Edit field modal + Theme selection modal
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, TextInput, Modal, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import {SPACING} from '../../constants/theme';
import {TYPOGRAPHY, RADIUS} from '../../constants/design';
import {Icon} from '../icons';
import type {ThemeMode} from '../../contexts/ThemeContext';
import type {UserProfile, EditField} from './constants';

// Fallback LinearGradient
let LinearGradient: React.ComponentType<any>;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch (e) {
  LinearGradient = ({children, colors: c, style, ...props}: any) => (
    <View style={[style, {backgroundColor: c?.[0] || '#4573DF'}]} {...props}>{children}</View>
  );
}

// ── Theme Modal ────────────────────────────────────────────────────────

interface ThemeModalProps {
  visible: boolean;
  onClose: () => void;
  colors: any;
  themeMode: ThemeMode;
  setThemeMode: (m: ThemeMode) => void;
}

export const ThemeModal = ({visible, onClose, colors, themeMode, setThemeMode}: ThemeModalProps) => (
  <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
    <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}
      accessibilityRole="button" accessibilityLabel="Close theme selection">
      <View style={[styles.content, {backgroundColor: colors.card}]} onStartShouldSetResponder={() => true}>
        <View style={[styles.handle, {backgroundColor: colors.border}]} />
        <Text style={[styles.title, {color: colors.text}]}>Choose Theme</Text>

        {([
          {mode: 'system' as ThemeMode, iconName: 'phone-portrait-outline', label: 'System', desc: 'Follow device settings'},
          {mode: 'light' as ThemeMode, iconName: 'sunny-outline', label: 'Light', desc: 'Always light'},
          {mode: 'dark' as ThemeMode, iconName: 'moon-outline', label: 'Dark', desc: 'Always dark'},
        ]).map(option => (
          <TouchableOpacity
            key={option.mode}
            style={[
              styles.themeOption, {backgroundColor: colors.background},
              themeMode === option.mode && {backgroundColor: colors.primaryLight, borderColor: colors.primary, borderWidth: 2},
            ]}
            onPress={() => {setThemeMode(option.mode); onClose();}}
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
);

// ── Edit Modal ─────────────────────────────────────────────────────────

interface EditModalProps {
  visible: boolean;
  onClose: () => void;
  colors: any;
  editField: EditField;
  profile: UserProfile;
  updateProfile: (key: string, value: any) => void;
}

export const EditModal = ({visible, onClose, colors, editField, profile, updateProfile}: EditModalProps) => (
  <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}
        accessibilityRole="button" accessibilityLabel="Close editor">
        <View style={[styles.content, {backgroundColor: colors.card}]} onStartShouldSetResponder={() => true}>
          <View style={[styles.handle, {backgroundColor: colors.border}]} />
          <View style={styles.headerRow}>
            <Text style={[styles.title, {color: colors.text}]}>{editField.label}</Text>
            <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close"
              hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
              <Icon name="close" family="Ionicons" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {editField.type === 'text' ? (
            <>
              <TextInput
                style={[styles.input, {backgroundColor: colors.background, color: colors.text}]}
                placeholder={`Enter ${editField.label.toLowerCase()}`}
                placeholderTextColor={colors.placeholder}
                value={profile[editField.key as keyof UserProfile]?.toString() || ''}
                onChangeText={text => updateProfile(editField.key, text)}
                autoFocus returnKeyType="done"
                onSubmitEditing={onClose}
                accessibilityLabel={`Enter your ${editField.label.toLowerCase()}`}
              />
              <TouchableOpacity style={styles.saveBtnWrapper} onPress={onClose}
                accessibilityRole="button" accessibilityLabel="Save changes">
                <LinearGradient colors={[colors.primary, '#3660C9']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <ScrollView style={styles.optionsList} keyboardShouldPersistTaps="handled">
              {editField.options?.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionItem, {backgroundColor: colors.background},
                    profile[editField.key as keyof UserProfile] === option && {backgroundColor: colors.primaryLight},
                  ]}
                  onPress={() => {updateProfile(editField.key, option); onClose();}}
                  accessibilityRole="radio"
                  accessibilityState={{checked: profile[editField.key as keyof UserProfile] === option}}
                  accessibilityLabel={option}>
                  <Text style={[
                    styles.optionText, {color: colors.text},
                    profile[editField.key as keyof UserProfile] === option && {color: colors.primary, fontWeight: TYPOGRAPHY.weight.semibold},
                  ]}>
                    {option}
                  </Text>
                  {profile[editField.key as keyof UserProfile] === option &&
                    <Icon name="checkmark-circle" family="Ionicons" size={20} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'},
  content: {borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl, padding: SPACING.lg, maxHeight: '80%'},
  handle: {width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.md},
  headerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md},
  title: {fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weight.bold},
  input: {borderRadius: RADIUS.lg, padding: SPACING.md, fontSize: TYPOGRAPHY.sizes.md, marginBottom: SPACING.md},
  saveBtnWrapper: {},
  saveBtn: {paddingVertical: SPACING.md, borderRadius: RADIUS.lg, alignItems: 'center'},
  saveBtnText: {color: '#FFFFFF', fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold},
  optionsList: {maxHeight: 350},
  optionItem: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.xs},
  optionText: {fontSize: TYPOGRAPHY.sizes.md},
  themeOption: {flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderRadius: RADIUS.lg, marginBottom: SPACING.sm, borderWidth: 1, borderColor: 'transparent'},
  themeInfo: {flex: 1, marginLeft: SPACING.md},
  themeLabel: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.semibold},
  themeDesc: {fontSize: TYPOGRAPHY.sizes.xs, marginTop: 2},
});
