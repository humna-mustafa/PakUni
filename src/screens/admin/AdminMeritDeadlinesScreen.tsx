/**
 * Admin Merit & Deadlines Management Screen
 * 
 * Comprehensive management for:
 * - Merit records (closing merit, seats, etc.)
 * - Admission deadlines
 * - Entry test information
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {SafeAreaView} from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { UniversalHeader } from '../../components';
import { TYPOGRAPHY } from '../../constants/design';
import { 
  dataSubmissionsService, 
  MeritRecord,
  AdmissionDeadline,
  EntryTestInfo,
} from '../../services/dataSubmissions';

type TabType = 'merit' | 'deadlines' | 'entry_tests';

const DEADLINE_TYPES = [
  { value: 'application', label: 'Application', icon: 'document-text' },
  { value: 'fee_payment', label: 'Fee Payment', icon: 'card' },
  { value: 'document_submission', label: 'Documents', icon: 'folder' },
  { value: 'entry_test', label: 'Entry Test', icon: 'school' },
  { value: 'interview', label: 'Interview', icon: 'people' },
];

const MERIT_TYPES = [
  { value: 'open', label: 'Open Merit' },
  { value: 'self', label: 'Self Finance' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'sports', label: 'Sports Quota' },
  { value: 'disabled', label: 'Disabled Quota' },
];

export const AdminMeritDeadlinesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  
  const [activeTab, setActiveTab] = useState<TabType>('merit');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data
  const [meritRecords, setMeritRecords] = useState<MeritRecord[]>([]);
  const [deadlines, setDeadlines] = useState<AdmissionDeadline[]>([]);
  const [entryTests, setEntryTests] = useState<EntryTestInfo[]>([]);
  
  // Stats
  const [stats, setStats] = useState({
    merit: { total: 0, verified: 0, thisYear: 0 },
    deadlines: { total: 0, upcoming: 0, expired: 0 },
    entryTests: { total: 0, upcoming: 0 },
  });
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [merit, deadlinesData, tests, statsData] = await Promise.all([
        dataSubmissionsService.getMeritRecords(),
        dataSubmissionsService.getAdmissionDeadlines(),
        dataSubmissionsService.getEntryTestInfo(),
        dataSubmissionsService.getStatistics(),
      ]);
      
      setMeritRecords(merit);
      setDeadlines(deadlinesData);
      setEntryTests(tests);
      setStats({
        merit: statsData.merit,
        deadlines: statsData.deadlines,
        entryTests: statsData.entryTests,
      });
    } catch (error) {
      console.error('Failed to load data:', error);
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

  const openAddModal = () => {
    if (activeTab === 'merit') {
      setEditingItem({
        university_id: '',
        university_name: '',
        program_id: '',
        program_name: '',
        year: new Date().getFullYear(),
        round: 1,
        merit_type: 'open',
        closing_merit: 0,
        aggregate_formula: '',
        total_seats: 0,
        filled_seats: 0,
        source: '',
        verified: false,
      });
    } else if (activeTab === 'deadlines') {
      setEditingItem({
        university_id: '',
        university_name: '',
        program_type: 'undergraduate',
        deadline_type: 'application',
        deadline_date: new Date().toISOString().split('T')[0],
        description: '',
        is_extended: false,
        extension_date: '',
        source_url: '',
        verified: false,
      });
    } else {
      setEditingItem({
        test_name: '',
        conducting_body: '',
        test_date: new Date().toISOString().split('T')[0],
        registration_deadline: new Date().toISOString().split('T')[0],
        result_date: '',
        test_centers: '',
        eligibility: '',
        fee: 0,
        website: '',
        syllabus_url: '',
        verified: false,
      });
    }
    setModalVisible(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem({ ...item });
    setModalVisible(true);
  };

  const saveItem = async () => {
    setIsProcessing(true);
    try {
      if (activeTab === 'merit') {
        await dataSubmissionsService.upsertMeritRecord(editingItem);
      } else if (activeTab === 'deadlines') {
        await dataSubmissionsService.upsertAdmissionDeadline(editingItem);
      } else {
        const testCenters = typeof editingItem.test_centers === 'string'
          ? editingItem.test_centers.split(',').map((s: string) => s.trim())
          : editingItem.test_centers;
        await dataSubmissionsService.upsertEntryTestInfo({ ...editingItem, test_centers: testCenters });
      }
      
      Alert.alert('Success', 'Item saved successfully');
      setModalVisible(false);
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to save item');
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteItem = async (id: string) => {
    Alert.alert(
      'Delete',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (activeTab === 'merit') {
              await dataSubmissionsService.deleteMeritRecord(id);
            } else if (activeTab === 'deadlines') {
              await dataSubmissionsService.deleteAdmissionDeadline(id);
            } else {
              await dataSubmissionsService.deleteEntryTestInfo(id);
            }
            loadData();
          },
        },
      ]
    );
  };

  const renderTabs = () => (
    <View style={[styles.tabsContainer, { backgroundColor: isDark ? colors.card : '#F3F4F6' }]}>
      {[
        { key: 'merit', label: 'Merit Lists', icon: 'trophy', count: stats.merit.total },
        { key: 'deadlines', label: 'Deadlines', icon: 'calendar', count: stats.deadlines.total },
        { key: 'entry_tests', label: 'Entry Tests', icon: 'school', count: stats.entryTests.total },
      ].map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            { backgroundColor: activeTab === tab.key ? colors.primary : 'transparent' }
          ]}
          onPress={() => setActiveTab(tab.key as TabType)}
        >
          <Icon 
            name={tab.icon as any} 
            size={18} 
            color={activeTab === tab.key ? '#FFFFFF' : colors.textSecondary} 
          />
          <Text style={[
            styles.tabLabel,
            { color: activeTab === tab.key ? '#FFFFFF' : colors.textSecondary }
          ]}>
            {tab.label}
          </Text>
          <View style={[styles.tabBadge, { backgroundColor: activeTab === tab.key ? '#FFFFFF' : colors.primary }]}>
            <Text style={[styles.tabBadgeText, { color: activeTab === tab.key ? colors.primary : '#FFFFFF' }]}>
              {tab.count}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMeritCard = (record: MeritRecord) => (
    <TouchableOpacity
      key={record.id}
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => openEditModal(record)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Icon name="trophy" size={18} color="#F59E0B" />
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {record.program_name}
          </Text>
        </View>
        {record.verified && (
          <View style={[styles.verifiedBadge, { backgroundColor: '#10B981' }]}>
            <Icon name="checkmark-circle" size={12} color="#FFFFFF" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>
      
      <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
        {record.university_name}
      </Text>
      
      <View style={styles.meritDetails}>
        <View style={styles.meritItem}>
          <Text style={[styles.meritLabel, { color: colors.textSecondary }]}>Closing Merit</Text>
          <Text style={[styles.meritValue, { color: colors.primary }]}>{record.closing_merit}%</Text>
        </View>
        <View style={styles.meritItem}>
          <Text style={[styles.meritLabel, { color: colors.textSecondary }]}>Year</Text>
          <Text style={[styles.meritValue, { color: colors.text }]}>{record.year}</Text>
        </View>
        <View style={styles.meritItem}>
          <Text style={[styles.meritLabel, { color: colors.textSecondary }]}>Round</Text>
          <Text style={[styles.meritValue, { color: colors.text }]}>{record.round}</Text>
        </View>
        <View style={styles.meritItem}>
          <Text style={[styles.meritLabel, { color: colors.textSecondary }]}>Type</Text>
          <Text style={[styles.meritValue, { color: colors.text }]}>{record.merit_type}</Text>
        </View>
      </View>
      
      {record.total_seats && (
        <View style={[styles.seatsRow, { backgroundColor: isDark ? '#272C34' : '#F3F4F6' }]}>
          <Icon name="people" size={14} color={colors.textSecondary} />
          <Text style={[styles.seatsText, { color: colors.textSecondary }]}>
            {record.filled_seats || 0} / {record.total_seats} seats filled
          </Text>
        </View>
      )}
      
      <View style={styles.cardFooter}>
        <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
          Updated: {new Date(record.updated_at).toLocaleDateString()}
        </Text>
        <TouchableOpacity
          style={[styles.deleteBtn, { backgroundColor: '#FEE2E2' }]}
          onPress={(e) => { e.stopPropagation(); deleteItem(record.id); }}
        >
          <Icon name="trash" size={14} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderDeadlineCard = (deadline: AdmissionDeadline) => {
    const isPast = new Date(deadline.deadline_date) < new Date();
    const deadlineInfo = DEADLINE_TYPES.find(t => t.value === deadline.deadline_type);
    
    return (
      <TouchableOpacity
        key={deadline.id}
        style={[styles.card, { backgroundColor: colors.card, opacity: isPast ? 0.6 : 1 }]}
        onPress={() => openEditModal(deadline)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Icon name={deadlineInfo?.icon as any || 'calendar'} size={18} color={isPast ? '#6B7280' : '#4573DF'} />
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
              {deadlineInfo?.label || deadline.deadline_type}
            </Text>
          </View>
          {deadline.is_extended && (
            <View style={[styles.extendedBadge, { backgroundColor: '#F59E0B' }]}>
              <Text style={styles.extendedText}>Extended</Text>
            </View>
          )}
        </View>
        
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
          {deadline.university_name}
        </Text>
        
        <View style={[styles.dateRow, { backgroundColor: isDark ? '#272C34' : '#F3F4F6' }]}>
          <Icon name="calendar" size={16} color={isPast ? '#EF4444' : '#10B981'} />
          <Text style={[styles.dateText, { color: isPast ? '#EF4444' : colors.text }]}>
            {new Date(deadline.deadline_date).toLocaleDateString('en-US', {
              weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
            })}
          </Text>
          {isPast && <Text style={styles.pastLabel}>Expired</Text>}
        </View>
        
        {deadline.is_extended && deadline.extension_date && (
          <View style={[styles.extensionRow, { backgroundColor: '#FEF3C7' }]}>
            <Icon name="arrow-forward" size={14} color="#92400E" />
            <Text style={styles.extensionText}>
              Extended to: {new Date(deadline.extension_date).toLocaleDateString()}
            </Text>
          </View>
        )}
        
        {deadline.description && (
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
            {deadline.description}
          </Text>
        )}
        
        <View style={styles.cardFooter}>
          <View style={styles.footerLeft}>
            {deadline.verified && (
              <View style={[styles.verifiedSmall, { backgroundColor: '#D1FAE5' }]}>
                <Icon name="checkmark" size={10} color="#10B981" />
              </View>
            )}
            <Text style={[styles.programType, { color: colors.textSecondary }]}>
              {deadline.program_type}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.deleteBtn, { backgroundColor: '#FEE2E2' }]}
            onPress={(e) => { e.stopPropagation(); deleteItem(deadline.id); }}
          >
            <Icon name="trash" size={14} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEntryTestCard = (test: EntryTestInfo) => {
    const isPast = new Date(test.test_date) < new Date();
    const regClosed = new Date(test.registration_deadline) < new Date();
    
    return (
      <TouchableOpacity
        key={test.id}
        style={[styles.card, { backgroundColor: colors.card, opacity: isPast ? 0.6 : 1 }]}
        onPress={() => openEditModal(test)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Icon name="school" size={18} color={isPast ? '#6B7280' : '#4573DF'} />
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
              {test.test_name}
            </Text>
          </View>
          {test.verified && (
            <View style={[styles.verifiedBadge, { backgroundColor: '#10B981' }]}>
              <Icon name="checkmark-circle" size={12} color="#FFFFFF" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>
        
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
          {test.conducting_body}
        </Text>
        
        <View style={styles.testDates}>
          <View style={[styles.testDateItem, { backgroundColor: isDark ? '#272C34' : '#F3F4F6' }]}>
            <Icon name="calendar" size={14} color={isPast ? '#EF4444' : '#4573DF'} />
            <View>
              <Text style={[styles.testDateLabel, { color: colors.textSecondary }]}>Test Date</Text>
              <Text style={[styles.testDateValue, { color: isPast ? '#EF4444' : colors.text }]}>
                {new Date(test.test_date).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View style={[styles.testDateItem, { backgroundColor: isDark ? '#272C34' : '#F3F4F6' }]}>
            <Icon name="time" size={14} color={regClosed ? '#EF4444' : '#F59E0B'} />
            <View>
              <Text style={[styles.testDateLabel, { color: colors.textSecondary }]}>Registration</Text>
              <Text style={[styles.testDateValue, { color: regClosed ? '#EF4444' : colors.text }]}>
                {new Date(test.registration_deadline).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.testInfo}>
          <View style={[styles.testInfoItem, { backgroundColor: '#E8EFFC' }]}>
            <Text style={styles.testInfoText}>Fee: Rs. {test.fee.toLocaleString()}</Text>
          </View>
          {test.test_centers && test.test_centers.length > 0 && (
            <View style={[styles.testInfoItem, { backgroundColor: '#FEE2E2' }]}>
              <Text style={styles.testInfoText}>{test.test_centers.length} Centers</Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardFooter}>
          <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
            Updated: {new Date(test.updated_at).toLocaleDateString()}
          </Text>
          <TouchableOpacity
            style={[styles.deleteBtn, { backgroundColor: '#FEE2E2' }]}
            onPress={(e) => { e.stopPropagation(); deleteItem(test.id); }}
          >
            <Icon name="trash" size={14} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMeritForm = () => (
    <>
      <Text style={[styles.inputLabel, { color: colors.text }]}>University Name *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: isDark ? '#272C34' : '#F3F4F6', color: colors.text }]}
        value={editingItem?.university_name}
        onChangeText={(text) => setEditingItem({ ...editingItem, university_name: text })}
        placeholder="e.g., NUST"
        placeholderTextColor={colors.textSecondary}
      />
      
      <Text style={[styles.inputLabel, { color: colors.text }]}>Program Name *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: isDark ? '#272C34' : '#F3F4F6', color: colors.text }]}
        value={editingItem?.program_name}
        onChangeText={(text) => setEditingItem({ ...editingItem, program_name: text })}
        placeholder="e.g., BS Computer Science"
        placeholderTextColor={colors.textSecondary}
      />
      
      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Year</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#272C34' : '#F3F4F6', color: colors.text }]}
            value={editingItem?.year?.toString()}
            onChangeText={(text) => setEditingItem({ ...editingItem, year: parseInt(text) || new Date().getFullYear() })}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.halfInput}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Round</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#272C34' : '#F3F4F6', color: colors.text }]}
            value={editingItem?.round?.toString()}
            onChangeText={(text) => setEditingItem({ ...editingItem, round: parseInt(text) || 1 })}
            keyboardType="numeric"
          />
        </View>
      </View>
      
      <Text style={[styles.inputLabel, { color: colors.text }]}>Closing Merit %</Text>
      <TextInput
        style={[styles.input, { backgroundColor: isDark ? '#272C34' : '#F3F4F6', color: colors.text }]}
        value={editingItem?.closing_merit?.toString()}
        onChangeText={(text) => setEditingItem({ ...editingItem, closing_merit: parseFloat(text) || 0 })}
        keyboardType="decimal-pad"
        placeholder="e.g., 85.5"
        placeholderTextColor={colors.textSecondary}
      />
      
      <Text style={[styles.inputLabel, { color: colors.text }]}>Merit Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.typeChips}>
          {MERIT_TYPES.map(type => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeChip,
                { backgroundColor: editingItem?.merit_type === type.value ? colors.primary : isDark ? '#272C34' : '#F3F4F6' }
              ]}
              onPress={() => setEditingItem({ ...editingItem, merit_type: type.value })}
            >
              <Text style={[
                styles.typeChipText,
                { color: editingItem?.merit_type === type.value ? '#FFFFFF' : colors.text }
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Total Seats</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#272C34' : '#F3F4F6', color: colors.text }]}
            value={editingItem?.total_seats?.toString()}
            onChangeText={(text) => setEditingItem({ ...editingItem, total_seats: parseInt(text) || 0 })}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.halfInput}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Filled Seats</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#272C34' : '#F3F4F6', color: colors.text }]}
            value={editingItem?.filled_seats?.toString()}
            onChangeText={(text) => setEditingItem({ ...editingItem, filled_seats: parseInt(text) || 0 })}
            keyboardType="numeric"
          />
        </View>
      </View>
      
      <Text style={[styles.inputLabel, { color: colors.text }]}>Source URL</Text>
      <TextInput
        style={[styles.input, { backgroundColor: isDark ? '#272C34' : '#F3F4F6', color: colors.text }]}
        value={editingItem?.source}
        onChangeText={(text) => setEditingItem({ ...editingItem, source: text })}
        placeholder="https://..."
        placeholderTextColor={colors.textSecondary}
      />
    </>
  );

  const renderDeadlineForm = () => (
    <>
      <Text style={[styles.inputLabel, { color: colors.text }]}>University Name *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: isDark ? '#272C34' : '#F3F4F6', color: colors.text }]}
        value={editingItem?.university_name}
        onChangeText={(text) => setEditingItem({ ...editingItem, university_name: text })}
        placeholder="e.g., LUMS"
        placeholderTextColor={colors.textSecondary}
      />
      
      <Text style={[styles.inputLabel, { color: colors.text }]}>Deadline Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.typeChips}>
          {DEADLINE_TYPES.map(type => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeChip,
                { backgroundColor: editingItem?.deadline_type === type.value ? colors.primary : isDark ? '#272C34' : '#F3F4F6' }
              ]}
              onPress={() => setEditingItem({ ...editingItem, deadline_type: type.value })}
            >
              <Icon 
                name={type.icon as any} 
                size={14} 
                color={editingItem?.deadline_type === type.value ? '#FFFFFF' : colors.textSecondary} 
              />
              <Text style={[
                styles.typeChipText,
                { color: editingItem?.deadline_type === type.value ? '#FFFFFF' : colors.text }
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <Text style={[styles.inputLabel, { color: colors.text }]}>Deadline Date *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: isDark ? '#272C34' : '#F3F4F6', color: colors.text }]}
        value={editingItem?.deadline_date?.split('T')[0]}
        onChangeText={(text) => setEditingItem({ ...editingItem, deadline_date: text })}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.textSecondary}
      />
      
      <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
      <TextInput
        style={[styles.input, styles.multilineInput, { backgroundColor: isDark ? '#272C34' : '#F3F4F6', color: colors.text }]}
        value={editingItem?.description}
        onChangeText={(text) => setEditingItem({ ...editingItem, description: text })}
        placeholder="Additional details..."
        placeholderTextColor={colors.textSecondary}
        multiline
      />
      
      <Text style={[styles.inputLabel, { color: colors.text }]}>Source URL</Text>
      <TextInput
        style={[styles.input, { backgroundColor: isDark ? '#272C34' : '#F3F4F6', color: colors.text }]}
        value={editingItem?.source_url}
        onChangeText={(text) => setEditingItem({ ...editingItem, source_url: text })}
        placeholder="https://..."
        placeholderTextColor={colors.textSecondary}
      />
    </>
  );

  const renderEntryTestForm = () => (
    <>
      <Text style={[styles.inputLabel, { color: colors.text }]}>Test Name *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: isDark ? '#272C34' : '#F3F4F6', color: colors.text }]}
        value={editingItem?.test_name}
        onChangeText={(text) => setEditingItem({ ...editingItem, test_name: text })}
        placeholder="e.g., ECAT, MDCAT, NET"
        placeholderTextColor={colors.textSecondary}
      />
      
      <Text style={[styles.inputLabel, { color: colors.text }]}>Conducting Body *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: isDark ? '#272C34' : '#F3F4F6', color: colors.text }]}
        value={editingItem?.conducting_body}
        onChangeText={(text) => setEditingItem({ ...editingItem, conducting_body: text })}
        placeholder="e.g., NUST, HEC, PMC"
        placeholderTextColor={colors.textSecondary}
      />
      
      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Test Date *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#272C34' : '#F3F4F6', color: colors.text }]}
            value={editingItem?.test_date?.split('T')[0]}
            onChangeText={(text) => setEditingItem({ ...editingItem, test_date: text })}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <View style={styles.halfInput}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Reg. Deadline</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#272C34' : '#F3F4F6', color: colors.text }]}
            value={editingItem?.registration_deadline?.split('T')[0]}
            onChangeText={(text) => setEditingItem({ ...editingItem, registration_deadline: text })}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>
      
      <Text style={[styles.inputLabel, { color: colors.text }]}>Fee (PKR)</Text>
      <TextInput
        style={[styles.input, { backgroundColor: isDark ? '#272C34' : '#F3F4F6', color: colors.text }]}
        value={editingItem?.fee?.toString()}
        onChangeText={(text) => setEditingItem({ ...editingItem, fee: parseInt(text) || 0 })}
        keyboardType="numeric"
        placeholder="e.g., 5000"
        placeholderTextColor={colors.textSecondary}
      />
      
      <Text style={[styles.inputLabel, { color: colors.text }]}>Test Centers (comma separated)</Text>
      <TextInput
        style={[styles.input, styles.multilineInput, { backgroundColor: isDark ? '#272C34' : '#F3F4F6', color: colors.text }]}
        value={Array.isArray(editingItem?.test_centers) ? editingItem.test_centers.join(', ') : editingItem?.test_centers}
        onChangeText={(text) => setEditingItem({ ...editingItem, test_centers: text })}
        placeholder="Islamabad, Lahore, Karachi..."
        placeholderTextColor={colors.textSecondary}
        multiline
      />
      
      <Text style={[styles.inputLabel, { color: colors.text }]}>Eligibility</Text>
      <TextInput
        style={[styles.input, { backgroundColor: isDark ? '#272C34' : '#F3F4F6', color: colors.text }]}
        value={editingItem?.eligibility}
        onChangeText={(text) => setEditingItem({ ...editingItem, eligibility: text })}
        placeholder="FSc Pre-Engineering, etc."
        placeholderTextColor={colors.textSecondary}
      />
      
      <Text style={[styles.inputLabel, { color: colors.text }]}>Website</Text>
      <TextInput
        style={[styles.input, { backgroundColor: isDark ? '#272C34' : '#F3F4F6', color: colors.text }]}
        value={editingItem?.website}
        onChangeText={(text) => setEditingItem({ ...editingItem, website: text })}
        placeholder="https://..."
        placeholderTextColor={colors.textSecondary}
      />
    </>
  );

  const renderModal = () => (
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
              {editingItem?.id ? 'Edit' : 'Add'} {activeTab === 'merit' ? 'Merit Record' : activeTab === 'deadlines' ? 'Deadline' : 'Entry Test'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            {activeTab === 'merit' && renderMeritForm()}
            {activeTab === 'deadlines' && renderDeadlineForm()}
            {activeTab === 'entry_tests' && renderEntryTestForm()}
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: isDark ? '#272C34' : '#E5E7EB' }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              onPress={saveItem}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.modalBtnText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <UniversalHeader
          title="Merit & Deadlines"
          showBack
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <UniversalHeader
        title="Merit & Deadlines"
        showBack
        onBack={() => navigation.goBack()}
        rightContent={
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.primary }]}
            onPress={openAddModal}
          >
            <Icon name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />
      
      {renderTabs()}
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'merit' && meritRecords.map(renderMeritCard)}
        {activeTab === 'deadlines' && deadlines.map(renderDeadlineCard)}
        {activeTab === 'entry_tests' && entryTests.map(renderEntryTestCard)}
        
        {((activeTab === 'merit' && meritRecords.length === 0) ||
          (activeTab === 'deadlines' && deadlines.length === 0) ||
          (activeTab === 'entry_tests' && entryTests.length === 0)) && (
          <View style={styles.emptyState}>
            <Icon 
              name={activeTab === 'merit' ? 'trophy-outline' : activeTab === 'deadlines' ? 'calendar-outline' : 'school-outline'} 
              size={64} 
              color={colors.textSecondary} 
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No {activeTab === 'merit' ? 'merit records' : activeTab === 'deadlines' ? 'deadlines' : 'entry tests'} found
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={openAddModal}
            >
              <Icon name="add" size={20} color="#FFFFFF" />
              <Text style={styles.emptyBtnText}>Add First</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      {renderModal()}
    </SafeAreaView>
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
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.bold,
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
    marginBottom: 4,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weight.semibold,
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  extendedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  extendedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  meritDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  meritItem: {
    alignItems: 'center',
  },
  meritLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  meritValue: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  seatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  seatsText: {
    fontSize: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.semibold,
    flex: 1,
  },
  pastLabel: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  extensionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  extensionText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  testDates: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  testDateItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
  },
  testDateLabel: {
    fontSize: 10,
  },
  testDateValue: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  testInfo: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  testInfoItem: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  testInfoText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#4573DF',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.2)',
    paddingTop: 10,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedSmall: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  programType: {
    fontSize: 11,
    textTransform: 'capitalize',
  },
  timestamp: {
    fontSize: 11,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
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
    fontWeight: TYPOGRAPHY.weight.semibold,
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
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  modalBody: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weight.semibold,
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  typeChips: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weight.medium,
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
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});

export default AdminMeritDeadlinesScreen;


