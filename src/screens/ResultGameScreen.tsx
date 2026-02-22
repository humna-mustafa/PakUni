/**
 * ResultGameScreen - Admission Chance Calculator (thin composition)
 */
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, ScrollView, TextInput} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../components/icons';
import {TYPOGRAPHY, RADIUS, SPACING} from '../constants/design';
import {useResultGameScreen} from '../hooks/useResultGameScreen';

const ResultGameScreen: React.FC = () => {
  const h = useResultGameScreen();

  return (
    <View style={[styles.container, {backgroundColor: h.colors.background}]}>
      <StatusBar barStyle={h.isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      <SafeAreaView style={{flex: 1}}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={[styles.backBtn, {backgroundColor: h.colors.card}]} onPress={() => h.navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={h.colors.text} />
          </TouchableOpacity>
          <View style={{flex: 1}}>
            <Text style={[styles.headerTitle, {color: h.colors.text}]}>Admission Calculator</Text>
            <Text style={[{fontSize: TYPOGRAPHY.sizes.sm, marginTop: 2}, {color: h.colors.textSecondary}]}>Check your admission chances</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: SPACING.lg}}>
          {/* Hero */}
          <LinearGradient colors={['#4573DF', '#6366F1']} style={styles.heroCard}>
            <View style={styles.heroEmoji}><Icon name="school" family="Ionicons" size={40} color="#FFFFFF" /></View>
            <Text style={styles.heroTitle}>Admission Chance Calculator</Text>
            <Text style={styles.heroSub}>Enter your marks and entry test score to see your chances at top Pakistani universities!</Text>
          </LinearGradient>

          <View style={[styles.disclaimer, {backgroundColor: '#4573DF15'}]}>
            <Icon name="information-circle-outline" size={20} color="#4573DF" />
            <Text style={[styles.disclaimerText, {color: '#4573DF'}]}>Based on 2024 cutoffs & merit lists. Actual results may vary.</Text>
          </View>

          {h.showResults ? (
            <Animated.View style={{transform: [{scale: h.resultScale}], opacity: h.resultOpacity, marginBottom: SPACING.lg}}>
              {/* Summary */}
              <View style={[styles.card, {backgroundColor: h.colors.card, marginBottom: SPACING.lg}]}>
                <Text style={[styles.cardTitle, {color: h.colors.text}]}>Your Input</Text>
                <View style={styles.row}><Text style={{color: h.colors.textSecondary, fontSize: TYPOGRAPHY.sizes.sm}}>FSc/Matric:</Text><Text style={[styles.bold, {color: h.colors.text}]}>{h.marks}%</Text></View>
                <View style={styles.row}><Text style={{color: h.colors.textSecondary, fontSize: TYPOGRAPHY.sizes.sm}}>Entry Test:</Text><Text style={[styles.bold, {color: h.colors.text}]}>{h.entryTestScore}/{h.entryTestMax}</Text></View>
              </View>

              {/* Results */}
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
                <Icon name="stats-chart" size={24} color="#4573DF" />
                <Text style={[styles.sectionTitle, {color: h.colors.text, marginLeft: 8}]}>Your Admission Chances</Text>
              </View>
              {h.results.slice(0, 10).map((r, idx) => (
                <View key={r.program.id} style={[styles.resultItem, {backgroundColor: h.colors.card}]}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={[styles.rankBadge, {backgroundColor: h.getChanceColor(r.percentage) + '20'}]}>
                      <Text style={[styles.rankText, {color: h.getChanceColor(r.percentage)}]}>#{idx + 1}</Text>
                    </View>
                    <View style={{flex: 1, marginLeft: SPACING.sm}}>
                      <Text style={[{fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weight.bold}, {color: r.university.color}]}>{r.university.shortName}</Text>
                      <Text style={[{fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold}, {color: h.colors.text}]}>{r.program.name}</Text>
                    </View>
                    <View style={{alignItems: 'flex-end'}}>
                      <Text style={[{fontSize: 20, fontWeight: TYPOGRAPHY.weight.heavy}, {color: h.getChanceColor(r.percentage)}]}>{r.percentage}%</Text>
                      <Text style={{color: h.colors.textSecondary, fontSize: TYPOGRAPHY.sizes.xs}}>{r.status}</Text>
                    </View>
                  </View>
                  <View style={{marginTop: SPACING.sm}}><View style={[styles.barBg, {backgroundColor: h.colors.border}]}><View style={[styles.barFill, {width: `${r.percentage}%`, backgroundColor: h.getChanceColor(r.percentage)}]} /></View></View>
                  <View style={{flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: SPACING.md}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}><Icon name="school-outline" size={14} color={h.colors.textSecondary} /><Text style={{color: h.colors.textSecondary, fontSize: TYPOGRAPHY.sizes.xs}}>~{r.program.seats} seats</Text></View>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}><Icon name="trending-up-outline" size={14} color={h.colors.textSecondary} /><Text style={{color: h.colors.textSecondary, fontSize: TYPOGRAPHY.sizes.xs}}>Cutoff: {r.program.lastYearCutoff}</Text></View>
                    <View style={[styles.diffBadge, {backgroundColor: r.program.difficulty === 'Very Hard' ? '#EF444420' : r.program.difficulty === 'Hard' ? '#F59E0B20' : r.program.difficulty === 'Medium' ? '#4573DF20' : '#10B98120'}]}>
                      <Text style={{fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weight.semibold, color: r.program.difficulty === 'Very Hard' ? '#EF4444' : r.program.difficulty === 'Hard' ? '#F59E0B' : r.program.difficulty === 'Medium' ? '#4573DF' : '#10B981'}}>{r.program.difficulty}</Text>
                    </View>
                  </View>
                  {(r.recommendations?.length ?? 0) > 0 && (
                    <View style={{marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)'}}>
                      {(r.recommendations ?? []).slice(0, 2).map((rec, i) => (
                        <View key={i} style={{flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 4}}>
                          <Icon name="bulb-outline" size={12} color="#F59E0B" />
                          <Text style={{flex: 1, fontSize: TYPOGRAPHY.sizes.xs, lineHeight: 16, color: h.colors.textSecondary}}>{rec}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}

              <View style={{flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md}}>
                <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#4573DF'}]} onPress={h.handleShare}>
                  <Icon name="share-social-outline" size={20} color="#FFF" /><Text style={styles.actionBtnText}>Share Results</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, {backgroundColor: h.colors.card, borderWidth: 1, borderColor: h.colors.border}]} onPress={h.handleReset}>
                  <Icon name="refresh-outline" size={20} color={h.colors.text} /><Text style={[styles.actionBtnTextDark, {color: h.colors.text}]}>Calculate Again</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ) : (
            <>
              {/* Step 1: Marks */}
              <View style={{marginBottom: SPACING.xl}}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                  <View style={[styles.stepBadge, {backgroundColor: '#4573DF'}]}><Text style={styles.stepNum}>1</Text></View>
                  <Text style={[styles.sectionTitle, {color: h.colors.text, marginLeft: 8}]}>Enter Your Marks</Text>
                </View>
                <View style={[styles.card, {backgroundColor: h.colors.card, marginTop: SPACING.sm}]}>
                  <View style={{marginBottom: SPACING.md}}>
                    <Text style={[styles.inputLabel, {color: h.colors.text}]}>FSc/Matric Percentage</Text>
                    <View style={[styles.inputWrap, {backgroundColor: h.colors.background, borderColor: h.colors.border}]}>
                      <Icon name="school-outline" size={20} color={h.colors.textSecondary} />
                      <TextInput style={[styles.input, {color: h.colors.text}]} placeholder="e.g., 85" placeholderTextColor={h.colors.textSecondary} keyboardType="numeric" value={h.marks} onChangeText={h.setMarks} maxLength={5} />
                      <Text style={{color: h.colors.textSecondary, fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.semibold}}>%</Text>
                    </View>
                  </View>
                  <View>
                    <Text style={[styles.inputLabel, {color: h.colors.text}]}>Entry Test Score</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: SPACING.sm}}>
                      <View style={[styles.inputWrap, {flex: 1, backgroundColor: h.colors.background, borderColor: h.colors.border}]}>
                        <Icon name="document-text-outline" size={20} color={h.colors.textSecondary} />
                        <TextInput style={[styles.input, {color: h.colors.text}]} placeholder="Your score" placeholderTextColor={h.colors.textSecondary} keyboardType="numeric" value={h.entryTestScore} onChangeText={h.setEntryTestScore} maxLength={4} />
                      </View>
                      <Text style={{color: h.colors.textSecondary, fontSize: TYPOGRAPHY.sizes.sm}}>out of</Text>
                      <View style={[styles.inputWrap, {width: 80, backgroundColor: h.colors.background, borderColor: h.colors.border}]}>
                        <TextInput style={[styles.input, {color: h.colors.text, textAlign: 'center'}]} placeholder="200" placeholderTextColor={h.colors.textSecondary} keyboardType="numeric" value={h.entryTestMax} onChangeText={h.setEntryTestMax} maxLength={4} />
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Step 2: University */}
              <View style={{marginBottom: SPACING.xl}}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                  <View style={[styles.stepBadge, {backgroundColor: '#22C55E'}]}><Text style={styles.stepNum}>2</Text></View>
                  <Text style={[styles.sectionTitle, {color: h.colors.text, marginLeft: 8}]}>Select University (Optional)</Text>
                </View>
                <Text style={{color: h.colors.textSecondary, fontSize: TYPOGRAPHY.sizes.sm, marginBottom: SPACING.md}}>Leave empty to check all universities</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: SPACING.md}}>
                  <TouchableOpacity style={[styles.chip, {backgroundColor: !h.selectedUniversity ? '#4573DF' : h.colors.card, borderColor: !h.selectedUniversity ? '#4573DF' : h.colors.border}]}
                    onPress={() => { h.setSelectedUniversity(null); h.setSelectedProgram(null); }}>
                    <Text style={[styles.chipText, {color: !h.selectedUniversity ? '#FFF' : h.colors.text}]}>All Universities</Text>
                  </TouchableOpacity>
                  {h.universityData.map(uni => (
                    <TouchableOpacity key={uni.id} style={[styles.chip, {backgroundColor: h.selectedUniversity === uni.id ? uni.color : h.colors.card, borderColor: h.selectedUniversity === uni.id ? uni.color : h.colors.border}]}
                      onPress={() => { h.setSelectedUniversity(uni.id); h.setSelectedProgram(null); }}>
                      <Text style={[styles.chipText, {color: h.selectedUniversity === uni.id ? '#FFF' : h.colors.text}]}>{uni.shortName}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {h.selectedUniData && (
                  <View>
                    <Text style={{color: h.colors.textSecondary, fontSize: TYPOGRAPHY.sizes.sm, marginBottom: SPACING.sm}}>Select Program:</Text>
                    <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm}}>
                      <TouchableOpacity style={[styles.progChip, {backgroundColor: !h.selectedProgram ? '#4573DF20' : h.colors.card, borderColor: !h.selectedProgram ? '#4573DF' : h.colors.border}]}
                        onPress={() => h.setSelectedProgram(null)}>
                        <Text style={[styles.chipText, {color: !h.selectedProgram ? '#4573DF' : h.colors.text}]}>All Programs</Text>
                      </TouchableOpacity>
                      {h.selectedUniData.programs.map(prog => (
                        <TouchableOpacity key={prog.id} style={[styles.progChip, {backgroundColor: h.selectedProgram === prog.id ? '#4573DF20' : h.colors.card, borderColor: h.selectedProgram === prog.id ? '#4573DF' : h.colors.border}]}
                          onPress={() => h.setSelectedProgram(prog.id)}>
                          <Text style={[styles.chipText, {color: h.selectedProgram === prog.id ? '#4573DF' : h.colors.text}]}>{prog.shortName}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {h.marks && h.entryTestScore ? (
                <Animated.View style={{transform: [{scale: h.buttonScale}]}}>
                  <TouchableOpacity onPress={() => { h.handleButtonPress(); h.handleCalculate(); }}>
                    <LinearGradient colors={['#4573DF', '#6366F1']} style={styles.calcBtn}>
                      <Icon name="calculator" size={24} color="#FFF" />
                      <Text style={styles.calcBtnText}>Calculate My Chances</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              ) : null}

              <View style={[styles.card, {backgroundColor: h.colors.card, marginTop: SPACING.md}]}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
                  <Icon name="bulb-outline" size={20} color="#F59E0B" />
                  <Text style={[styles.cardTitle, {color: h.colors.text, marginLeft: 8}]}>Tips for Better Chances</Text>
                </View>
                {[
                  {icon: 'checkmark-circle', color: '#10B981', text: 'Focus on entry test prep - it carries 70-80% weight at most universities!'},
                  {icon: 'book-outline', color: '#4573DF', text: 'NUST NET, GIKI, FAST - each has different patterns. Practice past papers!'},
                  {icon: 'shield-checkmark', color: '#F59E0B', text: 'Always have 2-3 backup options. Apply to universities at different difficulty levels.'},
                  {icon: 'time-outline', color: '#EF4444', text: "Don't miss application deadlines! NUST opens in June, FAST in July."},
                ].map((tip, i) => (
                  <View key={i} style={{flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm, gap: SPACING.sm}}>
                    <Icon name={tip.icon} size={16} color={tip.color} />
                    <Text style={{flex: 1, fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 18, color: h.colors.textSecondary}}>{tip.text}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
          <View style={{height: 100}} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md},
  backBtn: {width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md},
  headerTitle: {fontSize: 24, fontWeight: TYPOGRAPHY.weight.heavy},
  heroCard: {borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center', marginBottom: SPACING.lg},
  heroEmoji: {width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md},
  heroTitle: {fontSize: 22, fontWeight: TYPOGRAPHY.weight.heavy, color: '#FFF', textAlign: 'center'},
  heroSub: {fontSize: TYPOGRAPHY.sizes.sm, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: SPACING.sm, lineHeight: 20},
  disclaimer: {flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.lg, gap: SPACING.sm},
  disclaimerText: {flex: 1, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.semibold},
  sectionTitle: {fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weight.bold},
  card: {borderRadius: RADIUS.xl, padding: SPACING.lg},
  cardTitle: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold},
  row: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs},
  bold: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.bold},
  resultItem: {borderRadius: RADIUS.xl, padding: SPACING.md, marginBottom: SPACING.md},
  rankBadge: {width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center'},
  rankText: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.heavy},
  barBg: {height: 8, borderRadius: 4, overflow: 'hidden'},
  barFill: {height: '100%', borderRadius: 4},
  diffBadge: {paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.sm},
  actionBtn: {flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.xl, paddingVertical: SPACING.md, gap: SPACING.sm},
  actionBtnText: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold, color: '#FFF'},
  actionBtnTextDark: {fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.bold},
  stepBadge: {width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center'},
  stepNum: {fontSize: 14, fontWeight: TYPOGRAPHY.weight.bold, color: '#FFF'},
  inputLabel: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.semibold, marginBottom: SPACING.sm},
  inputWrap: {flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.lg, borderWidth: 1, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm},
  input: {flex: 1, fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weight.semibold, paddingVertical: 4},
  chip: {paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, borderWidth: 1, marginRight: SPACING.sm},
  chipText: {fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weight.semibold},
  progChip: {paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.lg, borderWidth: 1},
  calcBtn: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.xl, paddingVertical: SPACING.lg, marginBottom: SPACING.lg, gap: SPACING.sm},
  calcBtnText: {fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weight.bold, color: '#FFF'},
});

export default ResultGameScreen;
