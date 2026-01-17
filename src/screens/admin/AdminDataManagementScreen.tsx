/**
 * Admin Data Management Screen
 * Comprehensive data management including:
 * - Export all data (Universities, Scholarships, Users, Programs)
 * - Merit Lists management
 * - Entry Test Dates management
 * - Admission Dates management
 */

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  Platform,
  Share,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../contexts/ThemeContext';
import {adminService} from '../../services/admin';
import {Icon} from '../../components/icons';
import {logger} from '../../utils/logger';
import {PremiumLoading} from '../../components/PremiumLoading';
import RNFS from 'react-native-fs';

// Fallback LinearGradient
let LinearGradient: React.ComponentType<any>;
try {
  LinearGradient = require('react-native-linear-gradient').default;
} catch (e) {
  LinearGradient = ({children, colors, style, ...props}: any) => (
    <View style={[style, {backgroundColor: colors?.[0] || '#4573DF'}]} {...props}>
      {children}
    </View>
  );
}

type TabKey = 'export' | 'merit_lists' | 'entry_tests' | 'admission_dates';

interface MeritList {
  id: string;
  university_id: string;
  university_name: string;
  program_name: string;
  merit_percentage: number;
  year: number;
  round: number;
  seats_available?: number;
  closing_date?: string;
  created_at: string;
}

interface EntryTestDate {
  id: string;
  test_name: string;
  conducting_body: string;
  test_date: string;
  registration_start: string;
  registration_end: string;
  result_date?: string;
  fee?: number;
  website?: string;
  is_active: boolean;
}

interface AdmissionDate {
  id: string;
  university_id: string;
  university_name: string;
  program_type: string;
  admission_start: string;
  admission_end: string;
  classes_start?: string;
  fee_deadline?: string;
  year: number;
  is_active: boolean;
}

const AdminDataManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>('export');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  // Data states
  const [meritLists, setMeritLists] = useState<MeritList[]>([]);
  const [entryTests, setEntryTests] = useState<EntryTestDate[]>([]);
  const [admissionDates, setAdmissionDates] = useState<AdmissionDate[]>([]);

  // Modal states
  const [showMeritModal, setShowMeritModal] = useState(false);
  const [showEntryTestModal, setShowEntryTestModal] = useState(false);
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [meritForm, setMeritForm] = useState({
    university_name: '',
    program_name: '',
    merit_percentage: '',
    year: new Date().getFullYear().toString(),
    round: '1',
    seats_available: '',
    closing_date: '',
  });

  const [entryTestForm, setEntryTestForm] = useState({
    test_name: '',
    conducting_body: '',
    test_date: '',
    registration_start: '',
    registration_end: '',
    result_date: '',
    fee: '',
    website: '',
  });

  const [admissionForm, setAdmissionForm] = useState({
    university_name: '',
    program_type: 'undergraduate',
    admission_start: '',
    admission_end: '',
    classes_start: '',
    fee_deadline: '',
    year: new Date().getFullYear().toString(),
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'merit_lists') {
        const data = await adminService.getMeritLists();
        setMeritLists(data);
      } else if (activeTab === 'entry_tests') {
        const data = await adminService.getEntryTestDates();
        setEntryTests(data);
      } else if (activeTab === 'admission_dates') {
        const data = await adminService.getAdmissionDates();
        setAdmissionDates(data);
      }
    } catch (error) {
      logger.error('Error loading data', error, 'AdminDataManagement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [activeTab]);

  // ============ EXPORT FUNCTIONS ============
  
  const handleExport = async (dataType: string) => {
    try {
      setExporting(dataType);
      
      let csvContent = '';
      let fileName = '';

      switch (dataType) {
        case 'universities':
          csvContent = await adminService.exportUniversitiesCSV();
          fileName = `pakuni_universities_${getDateString()}.csv`;
          break;
        case 'scholarships':
          csvContent = await adminService.exportScholarshipsCSV();
          fileName = `pakuni_scholarships_${getDateString()}.csv`;
          break;
        case 'users':
          csvContent = await adminService.exportUsersCSV();
          fileName = `pakuni_users_${getDateString()}.csv`;
          break;
        case 'programs':
          csvContent = await adminService.exportProgramsCSV();
          fileName = `pakuni_programs_${getDateString()}.csv`;
          break;
        case 'feedback':
          csvContent = await adminService.exportFeedbackCSV();
          fileName = `pakuni_feedback_${getDateString()}.csv`;
          break;
        case 'analytics':
          csvContent = await adminService.exportAnalyticsCSV(
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            new Date().toISOString()
          );
          fileName = `pakuni_analytics_${getDateString()}.csv`;
          break;
        case 'merit_lists':
          csvContent = await adminService.exportMeritListsCSV();
          fileName = `pakuni_merit_lists_${getDateString()}.csv`;
          break;
        case 'all':
          csvContent = await adminService.exportAllDataCSV();
          fileName = `pakuni_complete_export_${getDateString()}.csv`;
          break;
        default:
          throw new Error('Unknown data type');
      }

      // Save to file
      const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      await RNFS.writeFile(filePath, csvContent, 'utf8');

      // Share the file
      await Share.share({
        title: `PakUni ${dataType} Export`,
        url: Platform.OS === 'ios' ? filePath : `file://${filePath}`,
        message: `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} data exported on ${new Date().toLocaleDateString()}`,
      });

      Alert.alert('Success', `${dataType} exported successfully!`);
    } catch (error) {
      logger.error('Export error', error, 'AdminDataManagement');
      Alert.alert('Error', `Failed to export ${dataType}`);
    } finally {
      setExporting(null);
    }
  };

  const getDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  // ============ MERIT LIST FUNCTIONS ============

  const handleSaveMeritList = async () => {
    if (!meritForm.university_name || !meritForm.program_name || !meritForm.merit_percentage) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    try {
      const data = {
        university_name: meritForm.university_name,
        program_name: meritForm.program_name,
        merit_percentage: parseFloat(meritForm.merit_percentage),
        year: parseInt(meritForm.year),
        round: parseInt(meritForm.round),
        seats_available: meritForm.seats_available ? parseInt(meritForm.seats_available) : undefined,
        closing_date: meritForm.closing_date || undefined,
      };

      if (editingItem) {
        await adminService.updateMeritList(editingItem.id, data);
        Alert.alert('Success', 'Merit list updated');
      } else {
        await adminService.createMeritList(data);
        Alert.alert('Success', 'Merit list created');
      }

      setShowMeritModal(false);
      resetMeritForm();
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to save merit list');
    }
  };

  const handleDeleteMeritList = async (id: string) => {
    Alert.alert('Delete', 'Are you sure you want to delete this merit list?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminService.deleteMeritList(id);
            Alert.alert('Success', 'Merit list deleted');
            loadData();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const resetMeritForm = () => {
    setMeritForm({
      university_name: '',
      program_name: '',
      merit_percentage: '',
      year: new Date().getFullYear().toString(),
      round: '1',
      seats_available: '',
      closing_date: '',
    });
    setEditingItem(null);
  };

  // ============ ENTRY TEST FUNCTIONS ============

  const handleSaveEntryTest = async () => {
    if (!entryTestForm.test_name || !entryTestForm.test_date || !entryTestForm.registration_end) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    try {
      const data = {
        test_name: entryTestForm.test_name,
        conducting_body: entryTestForm.conducting_body,
        test_date: entryTestForm.test_date,
        registration_start: entryTestForm.registration_start,
        registration_end: entryTestForm.registration_end,
        result_date: entryTestForm.result_date || undefined,
        fee: entryTestForm.fee ? parseInt(entryTestForm.fee) : undefined,
        website: entryTestForm.website || undefined,
        is_active: true,
      };

      if (editingItem) {
        await adminService.updateEntryTestDate(editingItem.id, data);
        Alert.alert('Success', 'Entry test date updated');
      } else {
        await adminService.createEntryTestDate(data);
        Alert.alert('Success', 'Entry test date created');
      }

      setShowEntryTestModal(false);
      resetEntryTestForm();
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to save entry test date');
    }
  };

  const handleDeleteEntryTest = async (id: string) => {
    Alert.alert('Delete', 'Are you sure you want to delete this entry test date?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminService.deleteEntryTestDate(id);
            Alert.alert('Success', 'Entry test date deleted');
            loadData();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const resetEntryTestForm = () => {
    setEntryTestForm({
      test_name: '',
      conducting_body: '',
      test_date: '',
      registration_start: '',
      registration_end: '',
      result_date: '',
      fee: '',
      website: '',
    });
    setEditingItem(null);
  };

  // ============ ADMISSION DATES FUNCTIONS ============

  const handleSaveAdmissionDate = async () => {
    if (!admissionForm.university_name || !admissionForm.admission_start || !admissionForm.admission_end) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    try {
      const data = {
        university_name: admissionForm.university_name,
        program_type: admissionForm.program_type,
        admission_start: admissionForm.admission_start,
        admission_end: admissionForm.admission_end,
        classes_start: admissionForm.classes_start || undefined,
        fee_deadline: admissionForm.fee_deadline || undefined,
        year: parseInt(admissionForm.year),
        is_active: true,
      };

      if (editingItem) {
        await adminService.updateAdmissionDate(editingItem.id, data);
        Alert.alert('Success', 'Admission date updated');
      } else {
        await adminService.createAdmissionDate(data);
        Alert.alert('Success', 'Admission date created');
      }

      setShowAdmissionModal(false);
      resetAdmissionForm();
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to save admission date');
    }
  };

  const handleDeleteAdmissionDate = async (id: string) => {
    Alert.alert('Delete', 'Are you sure you want to delete this admission date?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminService.deleteAdmissionDate(id);
            Alert.alert('Success', 'Admission date deleted');
            loadData();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const resetAdmissionForm = () => {
    setAdmissionForm({
      university_name: '',
      program_type: 'undergraduate',
      admission_start: '',
      admission_end: '',
      classes_start: '',
      fee_deadline: '',
      year: new Date().getFullYear().toString(),
    });
    setEditingItem(null);
  };

  // ============ RENDER TAB ============

  const renderTab = (key: TabKey, label: string, iconName: string) => (
    <TouchableOpacity
      key={key}
      style={[
        styles.tab,
        {backgroundColor: activeTab === key ? colors.primary : colors.card},
      ]}
      onPress={() => setActiveTab(key)}>
      <Icon
        name={iconName}
        family="Ionicons"
        size={16}
        color={activeTab === key ? '#FFFFFF' : colors.textSecondary}
      />
      <Text style={[styles.tabText, {color: activeTab === key ? '#FFFFFF' : colors.textSecondary}]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // ============ RENDER EXPORT TAB ============

  const renderExportTab = () => {
    const exportOptions = [
      {key: 'universities', label: 'Universities', icon: 'school-outline', color: '#4573DF'},
      {key: 'scholarships', label: 'Scholarships', icon: 'wallet-outline', color: '#10B981'},
      {key: 'programs', label: 'Programs', icon: 'library-outline', color: '#4573DF'},
      {key: 'users', label: 'Users', icon: 'people-outline', color: '#F59E0B'},
      {key: 'feedback', label: 'Feedback', icon: 'chatbubbles-outline', color: '#4573DF'},
      {key: 'analytics', label: 'Analytics', icon: 'analytics-outline', color: '#06B6D4'},
      {key: 'merit_lists', label: 'Merit Lists', icon: 'ribbon-outline', color: '#EF4444'},
      {key: 'all', label: 'Export All Data', icon: 'download-outline', color: '#4573DF'},
    ];

    return (
      <View style={styles.exportContainer}>
        <View style={[styles.infoCard, {backgroundColor: colors.card}]}>
          <Icon name="information-circle" family="Ionicons" size={24} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, {color: colors.text}]}>Data Export</Text>
            <Text style={[styles.infoText, {color: colors.textSecondary}]}>
              Export app data in CSV format. Files will be saved and can be shared via email, cloud storage, etc.
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, {color: colors.text}]}>Select Data to Export</Text>
        
        <View style={styles.exportGrid}>
          {exportOptions.map(option => (
            <TouchableOpacity
              key={option.key}
              style={[styles.exportCard, {backgroundColor: colors.card}]}
              onPress={() => handleExport(option.key)}
              disabled={exporting !== null}>
              <View style={[styles.exportIcon, {backgroundColor: option.color + '20'}]}>
                {exporting === option.key ? (
                  <ActivityIndicator size="small" color={option.color} />
                ) : (
                  <Icon name={option.icon} family="Ionicons" size={24} color={option.color} />
                )}
              </View>
              <Text style={[styles.exportLabel, {color: colors.text}]}>{option.label}</Text>
              <Icon name="download-outline" family="Ionicons" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // ============ RENDER MERIT LISTS TAB ============

  const renderMeritListsTab = () => (
    <View style={styles.listContainer}>
      <TouchableOpacity
        style={[styles.addButton, {backgroundColor: colors.primary}]}
        onPress={() => {
          resetMeritForm();
          setShowMeritModal(true);
        }}>
        <Icon name="add" family="Ionicons" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add Merit List</Text>
      </TouchableOpacity>

      {loading ? (
        <PremiumLoading variant="minimal" size="small" />
      ) : meritLists.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="ribbon-outline" family="Ionicons" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, {color: colors.textSecondary}]}>No merit lists added yet</Text>
        </View>
      ) : (
        meritLists.map(item => (
          <View key={item.id} style={[styles.listCard, {backgroundColor: colors.card}]}>
            <View style={styles.listHeader}>
              <View style={styles.listInfo}>
                <Text style={[styles.listTitle, {color: colors.text}]}>{item.university_name}</Text>
                <Text style={[styles.listSubtitle, {color: colors.textSecondary}]}>
                  {item.program_name}
                </Text>
              </View>
              <View style={[styles.meritBadge, {backgroundColor: '#10B98120'}]}>
                <Text style={[styles.meritText, {color: '#10B981'}]}>{item.merit_percentage}%</Text>
              </View>
            </View>
            <View style={styles.listMeta}>
              <Text style={[styles.metaText, {color: colors.textSecondary}]}>
                Year: {item.year} • Round {item.round}
              </Text>
              {item.seats_available && (
                <Text style={[styles.metaText, {color: colors.textSecondary}]}>
                  • {item.seats_available} seats
                </Text>
              )}
            </View>
            <View style={styles.listActions}>
              <TouchableOpacity
                style={[styles.actionBtn, {backgroundColor: colors.background}]}
                onPress={() => {
                  setEditingItem(item);
                  setMeritForm({
                    university_name: item.university_name,
                    program_name: item.program_name,
                    merit_percentage: item.merit_percentage.toString(),
                    year: item.year.toString(),
                    round: item.round.toString(),
                    seats_available: item.seats_available?.toString() || '',
                    closing_date: item.closing_date || '',
                  });
                  setShowMeritModal(true);
                }}>
                <Icon name="create-outline" family="Ionicons" size={16} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, {backgroundColor: '#EF444420'}]}
                onPress={() => handleDeleteMeritList(item.id)}>
                <Icon name="trash-outline" family="Ionicons" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );

  // ============ RENDER ENTRY TESTS TAB ============

  const renderEntryTestsTab = () => (
    <View style={styles.listContainer}>
      <TouchableOpacity
        style={[styles.addButton, {backgroundColor: colors.primary}]}
        onPress={() => {
          resetEntryTestForm();
          setShowEntryTestModal(true);
        }}>
        <Icon name="add" family="Ionicons" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add Entry Test Date</Text>
      </TouchableOpacity>

      {loading ? (
        <PremiumLoading variant="minimal" size="small" />
      ) : entryTests.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="calendar-outline" family="Ionicons" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, {color: colors.textSecondary}]}>No entry test dates added yet</Text>
        </View>
      ) : (
        entryTests.map(item => (
          <View key={item.id} style={[styles.listCard, {backgroundColor: colors.card}]}>
            <View style={styles.listHeader}>
              <View style={styles.listInfo}>
                <Text style={[styles.listTitle, {color: colors.text}]}>{item.test_name}</Text>
                <Text style={[styles.listSubtitle, {color: colors.textSecondary}]}>
                  {item.conducting_body}
                </Text>
              </View>
              <View style={[styles.dateBadge, {backgroundColor: '#F59E0B20'}]}>
                <Icon name="calendar" family="Ionicons" size={12} color="#F59E0B" />
                <Text style={[styles.dateText, {color: '#F59E0B'}]}>
                  {new Date(item.test_date).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <View style={styles.listMeta}>
              <Text style={[styles.metaText, {color: colors.textSecondary}]}>
                Registration: {new Date(item.registration_start).toLocaleDateString()} - {new Date(item.registration_end).toLocaleDateString()}
              </Text>
              {item.fee && (
                <Text style={[styles.metaText, {color: colors.primary}]}>Fee: Rs. {item.fee}</Text>
              )}
            </View>
            <View style={styles.listActions}>
              <TouchableOpacity
                style={[styles.actionBtn, {backgroundColor: colors.background}]}
                onPress={() => {
                  setEditingItem(item);
                  setEntryTestForm({
                    test_name: item.test_name,
                    conducting_body: item.conducting_body,
                    test_date: item.test_date,
                    registration_start: item.registration_start,
                    registration_end: item.registration_end,
                    result_date: item.result_date || '',
                    fee: item.fee?.toString() || '',
                    website: item.website || '',
                  });
                  setShowEntryTestModal(true);
                }}>
                <Icon name="create-outline" family="Ionicons" size={16} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, {backgroundColor: '#EF444420'}]}
                onPress={() => handleDeleteEntryTest(item.id)}>
                <Icon name="trash-outline" family="Ionicons" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );

  // ============ RENDER ADMISSION DATES TAB ============

  const renderAdmissionDatesTab = () => (
    <View style={styles.listContainer}>
      <TouchableOpacity
        style={[styles.addButton, {backgroundColor: colors.primary}]}
        onPress={() => {
          resetAdmissionForm();
          setShowAdmissionModal(true);
        }}>
        <Icon name="add" family="Ionicons" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add Admission Date</Text>
      </TouchableOpacity>

      {loading ? (
        <PremiumLoading variant="minimal" size="small" />
      ) : admissionDates.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="school-outline" family="Ionicons" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, {color: colors.textSecondary}]}>No admission dates added yet</Text>
        </View>
      ) : (
        admissionDates.map(item => (
          <View key={item.id} style={[styles.listCard, {backgroundColor: colors.card}]}>
            <View style={styles.listHeader}>
              <View style={styles.listInfo}>
                <Text style={[styles.listTitle, {color: colors.text}]}>{item.university_name}</Text>
                <Text style={[styles.listSubtitle, {color: colors.textSecondary}]}>
                  {item.program_type.charAt(0).toUpperCase() + item.program_type.slice(1)} Programs
                </Text>
              </View>
              <View style={[styles.yearBadge, {backgroundColor: '#4573DF20'}]}>
                <Text style={[styles.yearText, {color: '#4573DF'}]}>{item.year}</Text>
              </View>
            </View>
            <View style={styles.listMeta}>
              <Text style={[styles.metaText, {color: colors.textSecondary}]}>
                Admissions: {new Date(item.admission_start).toLocaleDateString()} - {new Date(item.admission_end).toLocaleDateString()}
              </Text>
              {item.classes_start && (
                <Text style={[styles.metaText, {color: '#10B981'}]}>
                  Classes: {new Date(item.classes_start).toLocaleDateString()}
                </Text>
              )}
            </View>
            <View style={styles.listActions}>
              <TouchableOpacity
                style={[styles.actionBtn, {backgroundColor: colors.background}]}
                onPress={() => {
                  setEditingItem(item);
                  setAdmissionForm({
                    university_name: item.university_name,
                    program_type: item.program_type,
                    admission_start: item.admission_start,
                    admission_end: item.admission_end,
                    classes_start: item.classes_start || '',
                    fee_deadline: item.fee_deadline || '',
                    year: item.year.toString(),
                  });
                  setShowAdmissionModal(true);
                }}>
                <Icon name="create-outline" family="Ionicons" size={16} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, {backgroundColor: '#EF444420'}]}
                onPress={() => handleDeleteAdmissionDate(item.id)}>
                <Icon name="trash-outline" family="Ionicons" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );

  // ============ MAIN RENDER ============

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#1E3A5F', '#1E1E2E'] : ['#4573DF', '#3660C9']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" family="Ionicons" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Data Management</Text>
            <Text style={styles.headerSubtitle}>Export data, manage merit lists & dates</Text>
          </View>
        </LinearGradient>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}>
          {renderTab('export', 'Export', 'download-outline')}
          {renderTab('merit_lists', 'Merit Lists', 'ribbon-outline')}
          {renderTab('entry_tests', 'Entry Tests', 'calendar-outline')}
          {renderTab('admission_dates', 'Admissions', 'school-outline')}
        </ScrollView>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }>
          {activeTab === 'export' && renderExportTab()}
          {activeTab === 'merit_lists' && renderMeritListsTab()}
          {activeTab === 'entry_tests' && renderEntryTestsTab()}
          {activeTab === 'admission_dates' && renderAdmissionDatesTab()}
        </ScrollView>

        {/* Merit List Modal */}
        <Modal visible={showMeritModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, {color: colors.text}]}>
                  {editingItem ? 'Edit' : 'Add'} Merit List
                </Text>
                <TouchableOpacity onPress={() => setShowMeritModal(false)}>
                  <Icon name="close" family="Ionicons" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody}>
                <Text style={[styles.formLabel, {color: colors.text}]}>University Name *</Text>
                <TextInput
                  style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                  placeholder="e.g., LUMS, NUST, FAST"
                  placeholderTextColor={colors.placeholder}
                  value={meritForm.university_name}
                  onChangeText={text => setMeritForm({...meritForm, university_name: text})}
                />

                <Text style={[styles.formLabel, {color: colors.text}]}>Program Name *</Text>
                <TextInput
                  style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                  placeholder="e.g., BS Computer Science, MBBS"
                  placeholderTextColor={colors.placeholder}
                  value={meritForm.program_name}
                  onChangeText={text => setMeritForm({...meritForm, program_name: text})}
                />

                <Text style={[styles.formLabel, {color: colors.text}]}>Merit Percentage *</Text>
                <TextInput
                  style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                  placeholder="e.g., 85.5"
                  placeholderTextColor={colors.placeholder}
                  value={meritForm.merit_percentage}
                  onChangeText={text => setMeritForm({...meritForm, merit_percentage: text})}
                  keyboardType="decimal-pad"
                />

                <View style={styles.formRow}>
                  <View style={styles.formHalf}>
                    <Text style={[styles.formLabel, {color: colors.text}]}>Year *</Text>
                    <TextInput
                      style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                      placeholder="2024"
                      placeholderTextColor={colors.placeholder}
                      value={meritForm.year}
                      onChangeText={text => setMeritForm({...meritForm, year: text})}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={styles.formHalf}>
                    <Text style={[styles.formLabel, {color: colors.text}]}>Round *</Text>
                    <TextInput
                      style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                      placeholder="1"
                      placeholderTextColor={colors.placeholder}
                      value={meritForm.round}
                      onChangeText={text => setMeritForm({...meritForm, round: text})}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                <Text style={[styles.formLabel, {color: colors.text}]}>Seats Available</Text>
                <TextInput
                  style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                  placeholder="Optional"
                  placeholderTextColor={colors.placeholder}
                  value={meritForm.seats_available}
                  onChangeText={text => setMeritForm({...meritForm, seats_available: text})}
                  keyboardType="number-pad"
                />

                <Text style={[styles.formLabel, {color: colors.text}]}>Closing Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                  placeholder="2024-09-30"
                  placeholderTextColor={colors.placeholder}
                  value={meritForm.closing_date}
                  onChangeText={text => setMeritForm({...meritForm, closing_date: text})}
                />

                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, {borderColor: colors.border}]}
                    onPress={() => setShowMeritModal(false)}>
                    <Text style={[styles.cancelBtnText, {color: colors.text}]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSaveMeritList}>
                    <Text style={styles.saveBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Entry Test Modal */}
        <Modal visible={showEntryTestModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, {color: colors.text}]}>
                  {editingItem ? 'Edit' : 'Add'} Entry Test Date
                </Text>
                <TouchableOpacity onPress={() => setShowEntryTestModal(false)}>
                  <Icon name="close" family="Ionicons" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody}>
                <Text style={[styles.formLabel, {color: colors.text}]}>Test Name *</Text>
                <TextInput
                  style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                  placeholder="e.g., MDCAT, ECAT, NAT, GAT"
                  placeholderTextColor={colors.placeholder}
                  value={entryTestForm.test_name}
                  onChangeText={text => setEntryTestForm({...entryTestForm, test_name: text})}
                />

                <Text style={[styles.formLabel, {color: colors.text}]}>Conducting Body *</Text>
                <TextInput
                  style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                  placeholder="e.g., HEC, PMC, NUMS"
                  placeholderTextColor={colors.placeholder}
                  value={entryTestForm.conducting_body}
                  onChangeText={text => setEntryTestForm({...entryTestForm, conducting_body: text})}
                />

                <Text style={[styles.formLabel, {color: colors.text}]}>Test Date * (YYYY-MM-DD)</Text>
                <TextInput
                  style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                  placeholder="2024-08-25"
                  placeholderTextColor={colors.placeholder}
                  value={entryTestForm.test_date}
                  onChangeText={text => setEntryTestForm({...entryTestForm, test_date: text})}
                />

                <View style={styles.formRow}>
                  <View style={styles.formHalf}>
                    <Text style={[styles.formLabel, {color: colors.text}]}>Reg. Start</Text>
                    <TextInput
                      style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                      placeholder="2024-06-01"
                      placeholderTextColor={colors.placeholder}
                      value={entryTestForm.registration_start}
                      onChangeText={text => setEntryTestForm({...entryTestForm, registration_start: text})}
                    />
                  </View>
                  <View style={styles.formHalf}>
                    <Text style={[styles.formLabel, {color: colors.text}]}>Reg. End *</Text>
                    <TextInput
                      style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                      placeholder="2024-07-31"
                      placeholderTextColor={colors.placeholder}
                      value={entryTestForm.registration_end}
                      onChangeText={text => setEntryTestForm({...entryTestForm, registration_end: text})}
                    />
                  </View>
                </View>

                <Text style={[styles.formLabel, {color: colors.text}]}>Result Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                  placeholder="2024-09-15"
                  placeholderTextColor={colors.placeholder}
                  value={entryTestForm.result_date}
                  onChangeText={text => setEntryTestForm({...entryTestForm, result_date: text})}
                />

                <View style={styles.formRow}>
                  <View style={styles.formHalf}>
                    <Text style={[styles.formLabel, {color: colors.text}]}>Fee (PKR)</Text>
                    <TextInput
                      style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                      placeholder="5500"
                      placeholderTextColor={colors.placeholder}
                      value={entryTestForm.fee}
                      onChangeText={text => setEntryTestForm({...entryTestForm, fee: text})}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={styles.formHalf}>
                    <Text style={[styles.formLabel, {color: colors.text}]}>Website</Text>
                    <TextInput
                      style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                      placeholder="https://..."
                      placeholderTextColor={colors.placeholder}
                      value={entryTestForm.website}
                      onChangeText={text => setEntryTestForm({...entryTestForm, website: text})}
                    />
                  </View>
                </View>

                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, {borderColor: colors.border}]}
                    onPress={() => setShowEntryTestModal(false)}>
                    <Text style={[styles.cancelBtnText, {color: colors.text}]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEntryTest}>
                    <Text style={styles.saveBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Admission Date Modal */}
        <Modal visible={showAdmissionModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, {color: colors.text}]}>
                  {editingItem ? 'Edit' : 'Add'} Admission Date
                </Text>
                <TouchableOpacity onPress={() => setShowAdmissionModal(false)}>
                  <Icon name="close" family="Ionicons" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody}>
                <Text style={[styles.formLabel, {color: colors.text}]}>University Name *</Text>
                <TextInput
                  style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                  placeholder="e.g., LUMS, NUST, FAST"
                  placeholderTextColor={colors.placeholder}
                  value={admissionForm.university_name}
                  onChangeText={text => setAdmissionForm({...admissionForm, university_name: text})}
                />

                <Text style={[styles.formLabel, {color: colors.text}]}>Program Type *</Text>
                <View style={styles.typeSelector}>
                  {['undergraduate', 'graduate', 'phd', 'diploma'].map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeOption,
                        {backgroundColor: colors.background},
                        admissionForm.program_type === type && {
                          backgroundColor: colors.primary + '20',
                          borderColor: colors.primary,
                          borderWidth: 1,
                        },
                      ]}
                      onPress={() => setAdmissionForm({...admissionForm, program_type: type})}>
                      <Text
                        style={[
                          styles.typeText,
                          {color: admissionForm.program_type === type ? colors.primary : colors.textSecondary},
                        ]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.formRow}>
                  <View style={styles.formHalf}>
                    <Text style={[styles.formLabel, {color: colors.text}]}>Adm. Start *</Text>
                    <TextInput
                      style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                      placeholder="2024-07-01"
                      placeholderTextColor={colors.placeholder}
                      value={admissionForm.admission_start}
                      onChangeText={text => setAdmissionForm({...admissionForm, admission_start: text})}
                    />
                  </View>
                  <View style={styles.formHalf}>
                    <Text style={[styles.formLabel, {color: colors.text}]}>Adm. End *</Text>
                    <TextInput
                      style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                      placeholder="2024-08-31"
                      placeholderTextColor={colors.placeholder}
                      value={admissionForm.admission_end}
                      onChangeText={text => setAdmissionForm({...admissionForm, admission_end: text})}
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={styles.formHalf}>
                    <Text style={[styles.formLabel, {color: colors.text}]}>Classes Start</Text>
                    <TextInput
                      style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                      placeholder="2024-09-15"
                      placeholderTextColor={colors.placeholder}
                      value={admissionForm.classes_start}
                      onChangeText={text => setAdmissionForm({...admissionForm, classes_start: text})}
                    />
                  </View>
                  <View style={styles.formHalf}>
                    <Text style={[styles.formLabel, {color: colors.text}]}>Year *</Text>
                    <TextInput
                      style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                      placeholder="2024"
                      placeholderTextColor={colors.placeholder}
                      value={admissionForm.year}
                      onChangeText={text => setAdmissionForm({...admissionForm, year: text})}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                <Text style={[styles.formLabel, {color: colors.text}]}>Fee Deadline (YYYY-MM-DD)</Text>
                <TextInput
                  style={[styles.formInput, {backgroundColor: colors.background, color: colors.text}]}
                  placeholder="2024-09-10"
                  placeholderTextColor={colors.placeholder}
                  value={admissionForm.fee_deadline}
                  onChangeText={text => setAdmissionForm({...admissionForm, fee_deadline: text})}
                />

                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, {borderColor: colors.border}]}
                    onPress={() => setShowAdmissionModal(false)}>
                    <Text style={[styles.cancelBtnText, {color: colors.text}]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAdmissionDate}>
                    <Text style={styles.saveBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  tabsContainer: {
    flexGrow: 0,
  },
  tabsContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  // Export tab styles
  exportContainer: {
    gap: 16,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  exportGrid: {
    gap: 10,
  },
  exportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  exportIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  // List styles
  listContainer: {
    gap: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  listCard: {
    padding: 14,
    borderRadius: 12,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listInfo: {
    flex: 1,
    marginRight: 12,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  listSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  listMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
  },
  listActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Badges
  meritBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  meritText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  yearBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  yearText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    padding: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  formInput: {
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formHalf: {
    flex: 1,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4573DF',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AdminDataManagementScreen;


