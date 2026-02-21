/**
 * ToolsScreen - Tools & Calculators Hub (thin composition)
 */
import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../components/icons';
import {useTheme} from '../contexts/ThemeContext';
import {TYPOGRAPHY, RADIUS, SPACING} from '../constants/design';
import {ToolCard, SimpleMeritCalculator, TOOLS} from '../components/tools';
import {GradeConverterCard, TargetCalculator, WhatIfSimulator, CustomFormulaBuilder} from '../components/calculators';

const ToolsScreen: React.FC = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const renderToolWrapper = (title: string, children: React.ReactNode) => (
    <SafeAreaView style={[styles.toolScreen, {backgroundColor: colors.background}]} edges={['top']}>
      <View style={styles.toolScreenHeader}>
        <TouchableOpacity style={[styles.closeButton, {backgroundColor: colors.card}]} onPress={() => setActiveTool(null)}>
          <Icon name="arrow-back" family="Ionicons" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.calculatorTitle, {color: colors.text}]}>{title}</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={{flex: 1, paddingHorizontal: SPACING.lg}}>
        {children}
        <View style={{height: 100}} />
      </ScrollView>
    </SafeAreaView>
  );

  if (activeTool) {
    switch (activeTool) {
      case 'meritCalculator':
        return <SimpleMeritCalculator onClose={() => setActiveTool(null)} colors={colors} />;
      case 'gradeConverter':
        return renderToolWrapper('Grade Converter', <GradeConverterCard />);
      case 'targetCalculator':
        return renderToolWrapper('Target Calculator', <TargetCalculator />);
      case 'whatIf':
        return renderToolWrapper('What-If Simulator', <WhatIfSimulator />);
      case 'customFormula':
        return renderToolWrapper('Custom Formula', <CustomFormulaBuilder />);
      default:
        break;
    }
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      <SafeAreaView style={{flex: 1}}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={[styles.backButton, {backgroundColor: colors.card}]} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" family="Ionicons" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{flex: 1}}>
            <Text style={[styles.headerTitle, {color: colors.text}]}>Tools</Text>
            <Text style={[styles.headerSubtitle, {color: colors.textSecondary}]}>Calculators & Simulators</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={{paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg}}>
            <LinearGradient colors={['#4573DF', '#3660C9']} style={styles.heroCard}>
              <View style={{alignItems: 'center', paddingVertical: SPACING.xl}}>
                <Icon name="calculator" family="Ionicons" size={40} color="rgba(255,255,255,0.9)" />
                <Text style={styles.heroTitle}>Merit Calculation Tools</Text>
                <Text style={styles.heroSubtitle}>Calculate, convert, simulate & plan your academic journey</Text>
              </View>
              <View style={styles.heroStats}>
                <View style={{alignItems: 'center'}}>
                  <Text style={styles.heroStatValue}>5</Text>
                  <Text style={styles.heroStatLabel}>Tools</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={{alignItems: 'center'}}>
                  <Text style={styles.heroStatValue}>∞</Text>
                  <Text style={styles.heroStatLabel}>Calculations</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Tools List */}
          <View style={styles.section}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4}}>
              <Icon name="construct-outline" family="Ionicons" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text}]}>Available Tools</Text>
            </View>
            {TOOLS.map((tool, index) => (
              <ToolCard key={tool.id} tool={tool} index={index} onPress={() => setActiveTool(tool.component)} colors={colors} />
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <Icon name="flash-outline" family="Ionicons" size={20} color="#F59E0B" />
              <Text style={[styles.sectionTitle, {color: colors.text}]}>Quick Actions</Text>
            </View>
            <View style={styles.quickGrid}>
              <TouchableOpacity style={[styles.quickButton, {backgroundColor: '#4573DF15'}]} onPress={() => setActiveTool('meritCalculator')}>
                <Icon name="calculator-outline" family="Ionicons" size={24} color="#4573DF" />
                <Text style={[styles.quickText, {color: '#4573DF'}]}>Calculate Merit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickButton, {backgroundColor: '#10B98115'}]} onPress={() => setActiveTool('gradeConverter')}>
                <Icon name="swap-horizontal-outline" family="Ionicons" size={24} color="#10B981" />
                <Text style={[styles.quickText, {color: '#10B981'}]}>Convert Grade</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Info Card */}
          <View style={[styles.infoCard, {backgroundColor: colors.card}]}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm}}>
              <Icon name="information-circle-outline" family="Ionicons" size={24} color="#4573DF" />
              <Text style={[styles.infoTitle, {color: colors.text}]}>About Merit Formulas</Text>
            </View>
            <Text style={[styles.infoText, {color: colors.textSecondary}]}>
              Each university has its own merit calculation formula. Common components include:
            </Text>
            {[
              {color: '#4573DF', text: 'Matric/O-Level marks (10-20%)'},
              {color: '#10B981', text: 'Inter/A-Level marks (40-60%)'},
              {color: '#F59E0B', text: 'Entry Test marks (30-50%)'},
              {color: '#4573DF', text: 'Hafiz-e-Quran bonus (2-5%)'},
            ].map((item, i) => (
              <View key={i} style={styles.infoItem}>
                <View style={[styles.infoBullet, {backgroundColor: item.color}]} />
                <Text style={[styles.infoItemText, {color: colors.textSecondary}]}>{item.text}</Text>
              </View>
            ))}
          </View>
          <View style={{height: 100}} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md},
  backButton: {width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md},
  headerTitle: {fontSize: 24, fontWeight: TYPOGRAPHY.weight.heavy},
  headerSubtitle: {fontSize: TYPOGRAPHY.sizes.sm, marginTop: 2},
  heroCard: {borderRadius: RADIUS.xl, overflow: 'hidden'},
  heroTitle: {fontSize: 22, fontWeight: TYPOGRAPHY.weight.heavy, color: '#FFF', marginTop: SPACING.md, textAlign: 'center'},
  heroSubtitle: {fontSize: TYPOGRAPHY.sizes.sm, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 4, paddingHorizontal: SPACING.xl},
  heroStats: {flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.md, gap: SPACING.xl, backgroundColor: 'rgba(0,0,0,0.1)'},
  heroStatValue: {fontSize: 24, fontWeight: TYPOGRAPHY.weight.heavy, color: '#FFF'},
  heroStatLabel: {fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2},
  heroStatDivider: {width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)'},
  section: {paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg},
  sectionTitle: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold},
  quickGrid: {flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md},
  quickButton: {flex: 1, alignItems: 'center', paddingVertical: SPACING.lg, borderRadius: RADIUS.lg, gap: SPACING.sm},
  quickText: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.semibold},
  infoCard: {marginHorizontal: SPACING.lg, borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.lg},
  infoTitle: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold},
  infoText: {fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 20, marginBottom: SPACING.md},
  infoItem: {flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, gap: SPACING.sm},
  infoBullet: {width: 8, height: 8, borderRadius: 4},
  infoItemText: {fontSize: TYPOGRAPHY.sizes.sm, flex: 1},
  toolScreen: {flex: 1},
  toolScreenHeader: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: Platform.OS === 'android' ? SPACING.lg : SPACING.md, paddingBottom: SPACING.sm, minHeight: 56},
  closeButton: {width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md},
  calculatorTitle: {fontSize: 20, fontWeight: TYPOGRAPHY.weight.bold},
});

export default ToolsScreen;
