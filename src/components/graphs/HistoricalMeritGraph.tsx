/**
 * Historical Merit Graph
 * 5-year merit visualization with trends
 * Shows merit progression over years for different programs
 */

import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '../icons';
import {TYPOGRAPHY, RADIUS, SPACING} from '../../constants/design';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

interface MeritDataPoint {
  year: number;
  merit: number;
  seats?: number;
}

interface ProgramMeritData {
  program: string;
  shortName: string;
  data: MeritDataPoint[];
  color: string;
}

interface UniversityMeritHistory {
  id: string;
  name: string;
  shortName: string;
  color: string;
  programs: ProgramMeritData[];
}

interface HistoricalMeritGraphProps {
  onDataPointPress?: (data: MeritDataPoint, program: string) => void;
}

// ============================================================================
// SAMPLE DATA (Would come from API/database in production)
// ============================================================================

const MERIT_HISTORY_DATA: UniversityMeritHistory[] = [
  {
    id: 'nust',
    name: 'NUST',
    shortName: 'NUST',
    color: '#4573DF',
    programs: [
      {
        program: 'Computer Science',
        shortName: 'CS',
        color: '#4573DF',
        data: [
          {year: 2019, merit: 82.5, seats: 200},
          {year: 2020, merit: 84.2, seats: 200},
          {year: 2021, merit: 85.8, seats: 220},
          {year: 2022, merit: 86.5, seats: 220},
          {year: 2023, merit: 87.1, seats: 250},
        ],
      },
      {
        program: 'Electrical Engineering',
        shortName: 'EE',
        color: '#F59E0B',
        data: [
          {year: 2019, merit: 78.2, seats: 180},
          {year: 2020, merit: 79.5, seats: 180},
          {year: 2021, merit: 80.3, seats: 200},
          {year: 2022, merit: 81.2, seats: 200},
          {year: 2023, merit: 82.0, seats: 200},
        ],
      },
      {
        program: 'Mechanical Engineering',
        shortName: 'ME',
        color: '#10B981',
        data: [
          {year: 2019, merit: 74.5, seats: 150},
          {year: 2020, merit: 75.8, seats: 150},
          {year: 2021, merit: 76.5, seats: 160},
          {year: 2022, merit: 77.2, seats: 160},
          {year: 2023, merit: 78.0, seats: 170},
        ],
      },
      {
        program: 'Civil Engineering',
        shortName: 'Civil',
        color: '#4573DF',
        data: [
          {year: 2019, merit: 68.5, seats: 120},
          {year: 2020, merit: 69.8, seats: 120},
          {year: 2021, merit: 70.5, seats: 130},
          {year: 2022, merit: 71.2, seats: 130},
          {year: 2023, merit: 72.0, seats: 140},
        ],
      },
    ],
  },
  {
    id: 'fast',
    name: 'FAST-NUCES',
    shortName: 'FAST',
    color: '#DC2626',
    programs: [
      {
        program: 'Computer Science',
        shortName: 'CS',
        color: '#EF4444',
        data: [
          {year: 2019, merit: 73.2, seats: 350},
          {year: 2020, merit: 74.5, seats: 350},
          {year: 2021, merit: 76.0, seats: 400},
          {year: 2022, merit: 77.2, seats: 400},
          {year: 2023, merit: 78.0, seats: 450},
        ],
      },
      {
        program: 'Software Engineering',
        shortName: 'SE',
        color: '#F97316',
        data: [
          {year: 2019, merit: 70.5, seats: 200},
          {year: 2020, merit: 71.8, seats: 200},
          {year: 2021, merit: 73.2, seats: 220},
          {year: 2022, merit: 74.0, seats: 220},
          {year: 2023, merit: 75.0, seats: 250},
        ],
      },
      {
        program: 'Data Science',
        shortName: 'DS',
        color: '#4573DF',
        data: [
          {year: 2020, merit: 68.0, seats: 100},
          {year: 2021, merit: 70.5, seats: 120},
          {year: 2022, merit: 72.0, seats: 150},
          {year: 2023, merit: 73.5, seats: 180},
        ],
      },
    ],
  },
  {
    id: 'giki',
    name: 'GIKI',
    shortName: 'GIKI',
    color: '#059669',
    programs: [
      {
        program: 'Computer Science',
        shortName: 'CS',
        color: '#10B981',
        data: [
          {year: 2019, merit: 78.0, seats: 150},
          {year: 2020, merit: 79.2, seats: 150},
          {year: 2021, merit: 80.5, seats: 160},
          {year: 2022, merit: 81.5, seats: 160},
          {year: 2023, merit: 82.0, seats: 170},
        ],
      },
      {
        program: 'Electrical Engineering',
        shortName: 'EE',
        color: '#14B8A6',
        data: [
          {year: 2019, merit: 74.5, seats: 120},
          {year: 2020, merit: 75.5, seats: 120},
          {year: 2021, merit: 76.8, seats: 130},
          {year: 2022, merit: 77.5, seats: 130},
          {year: 2023, merit: 78.0, seats: 140},
        ],
      },
    ],
  },
  {
    id: 'comsats',
    name: 'COMSATS',
    shortName: 'COMSATS',
    color: '#0891B2',
    programs: [
      {
        program: 'Computer Science',
        shortName: 'CS',
        color: '#06B6D4',
        data: [
          {year: 2019, merit: 65.5, seats: 400},
          {year: 2020, merit: 67.0, seats: 400},
          {year: 2021, merit: 69.2, seats: 450},
          {year: 2022, merit: 70.5, seats: 450},
          {year: 2023, merit: 72.0, seats: 500},
        ],
      },
      {
        program: 'Software Engineering',
        shortName: 'SE',
        color: '#4573DF',
        data: [
          {year: 2019, merit: 62.0, seats: 200},
          {year: 2020, merit: 64.0, seats: 200},
          {year: 2021, merit: 65.5, seats: 220},
          {year: 2022, merit: 67.0, seats: 220},
          {year: 2023, merit: 68.0, seats: 250},
        ],
      },
    ],
  },
];

// ============================================================================
// LINE GRAPH COMPONENT
// ============================================================================

interface LineGraphProps {
  data: ProgramMeritData[];
  selectedPrograms: string[];
  minYear: number;
  maxYear: number;
  onPointPress?: (data: MeritDataPoint, program: string) => void;
}

const LineGraph: React.FC<LineGraphProps> = ({
  data,
  selectedPrograms,
  minYear,
  maxYear,
  onPointPress,
}) => {
  const graphWidth = SCREEN_WIDTH - 80;
  const graphHeight = 200;
  const paddingTop = 20;
  const paddingBottom = 30;
  const paddingLeft = 40;
  const paddingRight = 20;

  const drawableWidth = graphWidth - paddingLeft - paddingRight;
  const drawableHeight = graphHeight - paddingTop - paddingBottom;

  // Calculate min/max merit for Y-axis
  const allMerits = data
    .filter(p => selectedPrograms.includes(p.shortName))
    .flatMap(p => p.data.map(d => d.merit));
  
  const minMerit = Math.floor(Math.min(...allMerits) / 5) * 5 - 5;
  const maxMerit = Math.ceil(Math.max(...allMerits) / 5) * 5 + 5;
  const meritRange = maxMerit - minMerit;

  // Calculate point position
  const getX = (year: number) => {
    const yearRange = maxYear - minYear;
    return paddingLeft + ((year - minYear) / yearRange) * drawableWidth;
  };

  const getY = (merit: number) => {
    return paddingTop + drawableHeight - ((merit - minMerit) / meritRange) * drawableHeight;
  };

  // Year labels
  const years = Array.from({length: maxYear - minYear + 1}, (_, i) => minYear + i);
  
  // Merit labels
  const meritLabels = [];
  for (let m = minMerit; m <= maxMerit; m += 5) {
    meritLabels.push(m);
  }

  return (
    <View style={lineStyles.container}>
      {/* Y-axis labels */}
      <View style={[lineStyles.yAxis, {height: graphHeight}]}>
        {meritLabels.map(merit => (
          <Text
            key={merit}
            style={[
              lineStyles.yLabel,
              {
                position: 'absolute',
                top: getY(merit) - 6,
                right: 4,
              },
            ]}>
            {merit}
          </Text>
        ))}
      </View>

      {/* Graph Area */}
      <View style={[lineStyles.graphArea, {width: graphWidth, height: graphHeight}]}>
        {/* Grid Lines */}
        {meritLabels.map(merit => (
          <View
            key={merit}
            style={[
              lineStyles.gridLine,
              {
                position: 'absolute',
                top: getY(merit),
                left: paddingLeft,
                width: drawableWidth,
              },
            ]}
          />
        ))}

        {/* Data Lines and Points */}
        {data
          .filter(p => selectedPrograms.includes(p.shortName))
          .map(program => (
            <View key={program.shortName} style={StyleSheet.absoluteFill}>
              {/* Lines */}
              {program.data.slice(0, -1).map((point, index) => {
                const nextPoint = program.data[index + 1];
                const x1 = getX(point.year);
                const y1 = getY(point.merit);
                const x2 = getX(nextPoint.year);
                const y2 = getY(nextPoint.merit);
                
                const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

                return (
                  <View
                    key={`${point.year}-${nextPoint.year}`}
                    style={[
                      lineStyles.line,
                      {
                        position: 'absolute',
                        left: x1,
                        top: y1,
                        width: length,
                        backgroundColor: program.color,
                        transform: [{rotate: `${angle}deg`}],
                        transformOrigin: 'left center',
                      },
                    ]}
                  />
                );
              })}

              {/* Points */}
              {program.data.map(point => (
                <TouchableOpacity
                  key={point.year}
                  onPress={() => onPointPress?.(point, program.program)}
                  style={[
                    lineStyles.point,
                    {
                      position: 'absolute',
                      left: getX(point.year) - 6,
                      top: getY(point.merit) - 6,
                      backgroundColor: program.color,
                    },
                  ]}
                  activeOpacity={0.7}>
                  <View style={lineStyles.pointInner} />
                </TouchableOpacity>
              ))}
            </View>
          ))}

        {/* X-axis labels */}
        <View style={[lineStyles.xAxis, {top: graphHeight - paddingBottom + 10}]}>
          {years.map(year => (
            <Text
              key={year}
              style={[
                lineStyles.xLabel,
                {
                  position: 'absolute',
                  left: getX(year) - 15,
                },
              ]}>
              {year}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const lineStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: SPACING.md,
  },
  yAxis: {
    width: 36,
    position: 'relative',
  },
  yLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  graphArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  gridLine: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  line: {
    height: 3,
    borderRadius: 1.5,
  },
  point: {
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  pointInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFF',
  },
  xAxis: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 20,
  },
  xLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const HistoricalMeritGraph: React.FC<HistoricalMeritGraphProps> = ({
  onDataPointPress,
}) => {
  // State
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityMeritHistory>(
    MERIT_HISTORY_DATA[0]
  );
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(['CS', 'EE']);
  const [selectedPoint, setSelectedPoint] = useState<{
    data: MeritDataPoint;
    program: string;
  } | null>(null);

  // Calculate year range
  const {minYear, maxYear} = useMemo(() => {
    const allYears = selectedUniversity.programs.flatMap(p =>
      p.data.map(d => d.year)
    );
    return {
      minYear: Math.min(...allYears),
      maxYear: Math.max(...allYears),
    };
  }, [selectedUniversity]);

  // Calculate trend for a program
  const calculateTrend = (data: MeritDataPoint[]) => {
    if (data.length < 2) return {trend: 0, direction: 'stable' as const};
    
    const lastTwo = data.slice(-2);
    const change = lastTwo[1].merit - lastTwo[0].merit;
    const direction = change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'stable';
    
    return {trend: change, direction};
  };

  // Toggle program selection
  const toggleProgram = (shortName: string) => {
    setSelectedPrograms(prev =>
      prev.includes(shortName)
        ? prev.filter(p => p !== shortName)
        : [...prev, shortName]
    );
  };

  // Handle point press
  const handlePointPress = (data: MeritDataPoint, program: string) => {
    setSelectedPoint({data, program});
    onDataPointPress?.(data, program);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#4573DF', '#F472B6']}
          style={styles.headerIcon}>
          <Icon name="stats-chart-outline" size={24} color="#FFF" />
        </LinearGradient>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Merit History</Text>
          <Text style={styles.headerSubtitle}>5-year merit trends</Text>
        </View>
      </View>

      {/* University Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.universityTabs}>
        {MERIT_HISTORY_DATA.map(uni => (
          <TouchableOpacity
            key={uni.id}
            onPress={() => {
              setSelectedUniversity(uni);
              setSelectedPrograms(
                uni.programs.slice(0, 2).map(p => p.shortName)
              );
              setSelectedPoint(null);
            }}
            style={[
              styles.universityTab,
              selectedUniversity.id === uni.id && {
                backgroundColor: uni.color,
              },
            ]}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.universityTabText,
                selectedUniversity.id === uni.id && {color: '#FFF'},
              ]}>
              {uni.shortName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Program Selection */}
      <View style={styles.programSection}>
        <Text style={styles.sectionLabel}>Select Programs to Compare</Text>
        <View style={styles.programChips}>
          {selectedUniversity.programs.map(program => {
            const isSelected = selectedPrograms.includes(program.shortName);
            const trend = calculateTrend(program.data);
            
            return (
              <TouchableOpacity
                key={program.shortName}
                onPress={() => toggleProgram(program.shortName)}
                style={[
                  styles.programChip,
                  isSelected && {
                    backgroundColor: program.color + '20',
                    borderColor: program.color,
                  },
                ]}
                activeOpacity={0.7}>
                <View
                  style={[
                    styles.programDot,
                    {backgroundColor: program.color},
                  ]}
                />
                <Text
                  style={[
                    styles.programChipText,
                    isSelected && {color: program.color},
                  ]}>
                  {program.shortName}
                </Text>
                <Icon
                  name={
                    trend.direction === 'up'
                      ? 'trending-up'
                      : trend.direction === 'down'
                      ? 'trending-down'
                      : 'remove'
                  }
                  size={14}
                  color={
                    trend.direction === 'up'
                      ? '#EF4444'
                      : trend.direction === 'down'
                      ? '#10B981'
                      : '#94A3B8'
                  }
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Graph */}
      {selectedPrograms.length > 0 ? (
        <LineGraph
          data={selectedUniversity.programs}
          selectedPrograms={selectedPrograms}
          minYear={minYear}
          maxYear={maxYear}
          onPointPress={handlePointPress}
        />
      ) : (
        <View style={styles.emptyGraph}>
          <Icon name="bar-chart-outline" size={40} color="#CBD5E1" />
          <Text style={styles.emptyText}>Select programs to view trends</Text>
        </View>
      )}

      {/* Selected Point Detail */}
      {selectedPoint && (
        <Animated.View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailProgram}>{selectedPoint.program}</Text>
            <Text style={styles.detailYear}>{selectedPoint.data.year}</Text>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Closing Merit</Text>
              <Text style={styles.detailValue}>
                {selectedPoint.data.merit.toFixed(1)}%
              </Text>
            </View>
            {selectedPoint.data.seats && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Total Seats</Text>
                <Text style={styles.detailValue}>
                  {selectedPoint.data.seats}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Icon name="trending-up" size={16} color="#EF4444" />
          <Text style={styles.legendText}>Merit increasing (harder)</Text>
        </View>
        <View style={styles.legendItem}>
          <Icon name="trending-down" size={16} color="#10B981" />
          <Text style={styles.legendText}>Merit decreasing (easier)</Text>
        </View>
      </View>

      {/* Insights */}
      <View style={styles.insightsSection}>
        <Text style={styles.insightsTitle}>📊 Key Insights</Text>
        {selectedUniversity.programs
          .filter(p => selectedPrograms.includes(p.shortName))
          .map(program => {
            const trend = calculateTrend(program.data);
            const latestMerit = program.data[program.data.length - 1]?.merit || 0;
            const firstMerit = program.data[0]?.merit || 0;
            const totalChange = latestMerit - firstMerit;

            return (
              <View key={program.shortName} style={styles.insightRow}>
                <View
                  style={[styles.insightDot, {backgroundColor: program.color}]}
                />
                <Text style={styles.insightText}>
                  <Text style={{fontWeight: '700'}}>{program.program}:</Text>{' '}
                  Merit has {totalChange > 0 ? 'increased' : 'decreased'} by{' '}
                  {Math.abs(totalChange).toFixed(1)}% over{' '}
                  {program.data.length} years.
                  {trend.direction === 'up' && ' Competition is rising! 📈'}
                  {trend.direction === 'down' && ' Getting more accessible! 📉'}
                </Text>
              </View>
            );
          })}
      </View>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
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
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    marginTop: 2,
  },
  universityTabs: {
    marginBottom: SPACING.md,
    marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  universityTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.md,
    marginRight: SPACING.sm,
  },
  universityTabText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#64748B',
  },
  programSection: {
    marginBottom: SPACING.sm,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    marginBottom: SPACING.sm,
  },
  programChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  programChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  programDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  programChipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#64748B',
    marginRight: 4,
  },
  emptyGraph: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    marginVertical: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#94A3B8',
    marginTop: SPACING.sm,
  },
  detailCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailProgram: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: '#1E293B',
  },
  detailYear: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#64748B',
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94A3B8',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '800',
    color: '#4573DF',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  legendText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#64748B',
    marginLeft: 4,
  },
  insightsSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  insightsTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING.sm,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  insightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 8,
  },
  insightText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#475569',
    lineHeight: 18,
  },
});

export default HistoricalMeritGraph;


