/**
 * Admin Auto-Approval Rules Screen
 * 
 * Configure automatic approval rules for user submissions
 * Features:
 * - Create/edit auto-approval rules
 * - Set conditions (trust level, type, source required)
 * - Enable/disable rules
 * - View rule statistics
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { UniversalHeader } from '../../components';
import { 
  dataSubmissionsService, 
  AutoApprovalRule,
  SubmissionType,
} from '../../services/dataSubmissions';

const SUBMISSION_TYPES: { value: SubmissionType; label: string }[] = [
  { value: 'merit_update', label: '📊 Merit Updates' },
  { value: 'date_correction', label: '📅 Date Corrections' },
  { value: 'entry_test_update', label: '📝 Entry Test Updates' },
  { value: 'university_info', label: '🏛️ University Info' },
  { value: 'scholarship_info', label: '💰 Scholarship Info' },
  { value: 'program_info', label: '📚 Program Info' },
  { value: 'fee_update', label: '💵 Fee Updates' },
  { value: 'other', label: '📋 Other' },
];

type AuthProvider = 'google' | 'email' | 'guest';

const AUTH_PROVIDERS: { value: AuthProvider; label: string; icon: string; color: string }[] = [
  { value: 'google', label: 'Google', icon: 'logo-google', color: '#4285F4' },
  { value: 'email', label: 'Email', icon: 'mail', color: '#10B981' },
  { value: 'guest', label: 'Guest', icon: 'person-outline', color: '#9CA3AF' },
];

export const AdminAutoApprovalRulesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  
  const [rules, setRules] = useState<AutoApprovalRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Edit modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<AutoApprovalRule>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await dataSubmissionsService.getAutoApprovalRules();
      setRules(data);
    } catch (error) {
      console.error('Failed to load rules:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const openEditModal = (rule?: AutoApprovalRule) => {
    setEditingRule(rule ? { ...rule } : {
      name: '',
      description: '',
      enabled: true,
      submission_types: [],
      min_trust_level: 3,
      entity_types: [],
      max_value_change_percent: null,
      require_source: true,
      notify_admin: true,
      allowed_auth_providers: [],
      auto_approve_google_users: false,
      require_email_verified: false,
    });
    setModalVisible(true);
  };

  const toggleRuleEnabled = async (rule: AutoApprovalRule) => {
    const updatedRules = rules.map(r => 
      r.id === rule.id ? { ...r, enabled: !r.enabled } : r
    );
    setRules(updatedRules);
    await dataSubmissionsService.saveAutoApprovalRules(updatedRules);
  };

  const saveRule = async () => {
    if (!editingRule.name?.trim()) {
      Alert.alert('Error', 'Please enter a rule name');
      return;
    }
    
    setIsProcessing(true);
    try {
      await dataSubmissionsService.upsertAutoApprovalRule(editingRule);
      Alert.alert('Success', 'Rule saved successfully');
      setModalVisible(false);
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to save rule');
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteRule = async (ruleId: string) => {
    Alert.alert(
      'Delete Rule',
      'Are you sure you want to delete this rule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await dataSubmissionsService.deleteAutoApprovalRule(ruleId);
            loadData();
          },
        },
      ]
    );
  };

  const toggleSubmissionType = (type: SubmissionType) => {
    const current = editingRule.submission_types || [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    setEditingRule({ ...editingRule, submission_types: updated });
  };

  const toggleAuthProvider = (provider: AuthProvider) => {
    const current = editingRule.allowed_auth_providers || [];
    const updated = current.includes(provider)
      ? current.filter(p => p !== provider)
      : [...current, provider];
    setEditingRule({ ...editingRule, allowed_auth_providers: updated });
  };

  const renderRuleCard = (rule: AutoApprovalRule) => (
    <View
      key={rule.id}
      style={[styles.card, { backgroundColor: colors.card }]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Icon
            name={rule.enabled ? 'flash' : 'flash-outline'}
            size={20}
            color={rule.enabled ? '#F59E0B' : colors.textSecondary}
          />
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {rule.name}
          </Text>
        </View>
        <Switch
          value={rule.enabled}
          onValueChange={() => toggleRuleEnabled(rule)}
          trackColor={{ false: '#767577', true: '#F59E0B' }}
          thumbColor="#FFFFFF"
        />
      </View>
      
      <Text style={[styles.cardDescription, { color: colors.textSecondary }]} numberOfLines={2}>
        {rule.description}
      </Text>
      
      <View style={styles.conditionsContainer}>
        <View style={[styles.conditionChip, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
          <Icon name="shield" size={12} color={colors.primary} />
          <Text style={[styles.conditionText, { color: colors.text }]}>
            Trust ≥ {rule.min_trust_level}
          </Text>
        </View>
        
        {rule.require_source && (
          <View style={[styles.conditionChip, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
            <Icon name="document" size={12} color={colors.primary} />
            <Text style={[styles.conditionText, { color: colors.text }]}>Source required</Text>
          </View>
        )}
        
        {rule.max_value_change_percent !== null && (
          <View style={[styles.conditionChip, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
            <Icon name="trending-up" size={12} color={colors.primary} />
            <Text style={[styles.conditionText, { color: colors.text }]}>
              ≤ {rule.max_value_change_percent}% change
            </Text>
          </View>
        )}
        
        {rule.notify_admin && (
          <View style={[styles.conditionChip, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
            <Icon name="notifications" size={12} color={colors.primary} />
            <Text style={[styles.conditionText, { color: colors.text }]}>Notify admin</Text>
          </View>
        )}
        
        {rule.auto_approve_google_users && (
          <View style={[styles.conditionChip, { backgroundColor: '#E8F5E9' }]}>
            <Icon name="logo-google" size={12} color="#4285F4" />
            <Text style={[styles.conditionText, { color: '#2E7D32' }]}>Google auto-approve</Text>
          </View>
        )}
        
        {rule.require_email_verified && (
          <View style={[styles.conditionChip, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
            <Icon name="checkmark-circle" size={12} color="#10B981" />
            <Text style={[styles.conditionText, { color: colors.text }]}>Verified email only</Text>
          </View>
        )}
        
        {rule.allowed_auth_providers && rule.allowed_auth_providers.length > 0 && (
          <View style={[styles.conditionChip, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
            <Icon name="people" size={12} color={colors.primary} />
            <Text style={[styles.conditionText, { color: colors.text }]}>
              {rule.allowed_auth_providers.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
            </Text>
          </View>
        )}
      </View>
      
      {rule.submission_types.length > 0 && (
        <View style={styles.typesRow}>
          <Text style={[styles.typesLabel, { color: colors.textSecondary }]}>Types:</Text>
          <Text style={[styles.typesValue, { color: colors.text }]} numberOfLines={1}>
            {rule.submission_types.length === 8 
              ? 'All types'
              : rule.submission_types.join(', ').replace(/_/g, ' ')}
          </Text>
        </View>
      )}
      
      <View style={styles.cardFooter}>
        <View style={styles.statsRow}>
          <Icon name="checkmark-done" size={14} color="#10B981" />
          <Text style={[styles.statsText, { color: colors.textSecondary }]}>
            {rule.total_auto_approved} auto-approved
          </Text>
        </View>
        
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}
            onPress={() => openEditModal(rule)}
          >
            <Icon name="pencil" size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: '#FEE2E2' }]}
            onPress={() => deleteRule(rule.id)}
          >
            <Icon name="trash" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEditModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingRule.id ? 'Edit Rule' : 'New Auto-Approval Rule'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Rule Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6', color: colors.text }]}
              value={editingRule.name}
              onChangeText={(text) => setEditingRule({ ...editingRule, name: text })}
              placeholder="e.g., Trusted Users - Date Updates"
              placeholderTextColor={colors.textSecondary}
            />
            
            <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.multilineInput, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6', color: colors.text }]}
              value={editingRule.description}
              onChangeText={(text) => setEditingRule({ ...editingRule, description: text })}
              placeholder="Describe when this rule applies..."
              placeholderTextColor={colors.textSecondary}
              multiline
            />
            
            <Text style={[styles.inputLabel, { color: colors.text }]}>Minimum Trust Level (0-5)</Text>
            <View style={styles.trustLevelRow}>
              {[0, 1, 2, 3, 4, 5].map(level => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.trustLevelBtn,
                    { 
                      backgroundColor: editingRule.min_trust_level === level 
                        ? colors.primary 
                        : isDark ? '#1F2937' : '#F3F4F6'
                    }
                  ]}
                  onPress={() => setEditingRule({ ...editingRule, min_trust_level: level })}
                >
                  <Text style={[
                    styles.trustLevelText,
                    { color: editingRule.min_trust_level === level ? '#FFFFFF' : colors.text }
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={[styles.inputLabel, { color: colors.text }]}>Submission Types</Text>
            <View style={styles.typesGrid}>
              {SUBMISSION_TYPES.map(type => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor: editingRule.submission_types?.includes(type.value)
                        ? colors.primary
                        : isDark ? '#1F2937' : '#F3F4F6'
                    }
                  ]}
                  onPress={() => toggleSubmissionType(type.value)}
                >
                  <Text style={[
                    styles.typeChipText,
                    { color: editingRule.submission_types?.includes(type.value) ? '#FFFFFF' : colors.text }
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={[styles.inputLabel, { color: colors.text }]}>Max Value Change % (for numeric values)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6', color: colors.text }]}
              value={editingRule.max_value_change_percent?.toString() || ''}
              onChangeText={(text) => setEditingRule({ 
                ...editingRule, 
                max_value_change_percent: text ? parseInt(text) : null 
              })}
              placeholder="e.g., 10 (leave empty for no limit)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
            
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: colors.text }]}>Require Source/Proof</Text>
              <Switch
                value={editingRule.require_source ?? true}
                onValueChange={(value) => setEditingRule({ ...editingRule, require_source: value })}
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: colors.text }]}>Notify Admin After Auto-Approve</Text>
              <Switch
                value={editingRule.notify_admin ?? true}
                onValueChange={(value) => setEditingRule({ ...editingRule, notify_admin: value })}
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            {/* Auth Provider Section */}
            <View style={[styles.sectionDivider, { borderTopColor: isDark ? '#374151' : '#E5E7EB' }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                🔐 Authentication Provider Settings
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Control which user types can have submissions auto-approved
              </Text>
            </View>
            
            <Text style={[styles.inputLabel, { color: colors.text }]}>Allowed Auth Providers</Text>
            <Text style={[styles.inputHint, { color: colors.textSecondary }]}>
              Only users logged in via these methods can get auto-approval
            </Text>
            <View style={styles.authProvidersGrid}>
              {AUTH_PROVIDERS.map(provider => (
                <TouchableOpacity
                  key={provider.value}
                  style={[
                    styles.authProviderChip,
                    {
                      backgroundColor: editingRule.allowed_auth_providers?.includes(provider.value)
                        ? provider.color + '20'
                        : isDark ? '#1F2937' : '#F3F4F6',
                      borderColor: editingRule.allowed_auth_providers?.includes(provider.value)
                        ? provider.color
                        : 'transparent',
                      borderWidth: editingRule.allowed_auth_providers?.includes(provider.value) ? 2 : 0,
                    }
                  ]}
                  onPress={() => toggleAuthProvider(provider.value)}
                >
                  <Icon 
                    name={provider.icon} 
                    size={18} 
                    color={editingRule.allowed_auth_providers?.includes(provider.value) 
                      ? provider.color 
                      : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.authProviderText,
                    { 
                      color: editingRule.allowed_auth_providers?.includes(provider.value) 
                        ? provider.color 
                        : colors.text 
                    }
                  ]}>
                    {provider.label}
                  </Text>
                  {editingRule.allowed_auth_providers?.includes(provider.value) && (
                    <Icon name="checkmark-circle" size={16} color={provider.color} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={[styles.switchRow, styles.highlightedSwitch, { backgroundColor: '#E8F5E915' }]}>
              <View style={styles.switchLabelContainer}>
                <Icon name="logo-google" size={20} color="#4285F4" style={styles.switchIcon} />
                <View>
                  <Text style={[styles.switchLabel, { color: colors.text }]}>Auto-Approve Google Users</Text>
                  <Text style={[styles.switchHint, { color: colors.textSecondary }]}>
                    Fast-track all Google-authenticated users
                  </Text>
                </View>
              </View>
              <Switch
                value={editingRule.auto_approve_google_users ?? false}
                onValueChange={(value) => setEditingRule({ ...editingRule, auto_approve_google_users: value })}
                trackColor={{ false: '#767577', true: '#4285F4' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.switchRow}>
              <View style={styles.switchLabelContainer}>
                <Icon name="mail-open" size={20} color="#10B981" style={styles.switchIcon} />
                <View>
                  <Text style={[styles.switchLabel, { color: colors.text }]}>Require Verified Email</Text>
                  <Text style={[styles.switchHint, { color: colors.textSecondary }]}>
                    Email users must have verified their email
                  </Text>
                </View>
              </View>
              <Switch
                value={editingRule.require_email_verified ?? false}
                onValueChange={(value) => setEditingRule({ ...editingRule, require_email_verified: value })}
                trackColor={{ false: '#767577', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: colors.text }]}>Rule Enabled</Text>
              <Switch
                value={editingRule.enabled ?? true}
                onValueChange={(value) => setEditingRule({ ...editingRule, enabled: value })}
                trackColor={{ false: '#767577', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              onPress={saveRule}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.modalBtnText}>Save Rule</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <UniversalHeader
          title="Auto-Approval Rules"
          showBack
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <UniversalHeader
        title="Auto-Approval Rules"
        showBack
        onBack={() => navigation.goBack()}
        rightContent={
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.primary }]}
            onPress={() => openEditModal()}
          >
            <Icon name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />
      
      <View style={[styles.infoBox, { backgroundColor: isDark ? '#1F2937' : '#FEF3C7' }]}>
        <Icon name="information-circle" size={20} color="#F59E0B" />
        <Text style={[styles.infoText, { color: isDark ? '#FCD34D' : '#92400E' }]}>
          Auto-approval rules automatically approve user submissions when conditions are met.
          Use carefully to maintain data quality.
        </Text>
      </View>
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {rules.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="flash-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No auto-approval rules configured
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={() => openEditModal()}
            >
              <Icon name="add" size={20} color="#FFFFFF" />
              <Text style={styles.emptyBtnText}>Create First Rule</Text>
            </TouchableOpacity>
          </View>
        ) : (
          rules.map(renderRuleCard)
        )}
      </ScrollView>
      
      {renderEditModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  conditionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  conditionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  conditionText: {
    fontSize: 11,
  },
  typesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typesLabel: {
    fontSize: 12,
    marginRight: 6,
  },
  typesValue: {
    fontSize: 12,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.2)',
    paddingTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsText: {
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  trustLevelRow: {
    flexDirection: 'row',
    gap: 8,
  },
  trustLevelBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trustLevelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    flex: 1,
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  switchIcon: {
    marginRight: 4,
  },
  switchHint: {
    fontSize: 11,
    marginTop: 2,
  },
  highlightedSwitch: {
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  sectionDivider: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  inputHint: {
    fontSize: 11,
    marginBottom: 8,
    marginTop: -4,
  },
  authProvidersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  authProviderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 100,
  },
  authProviderText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.2)',
  },
  modalBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminAutoApprovalRulesScreen;
