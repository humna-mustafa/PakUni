/**
 * useResultGameScreen - State and handlers for admission calculator.
 */
import {useState, useRef, useCallback} from 'react';
import {Animated} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../contexts/ThemeContext';
import {ANIMATION_SCALES} from '../constants/ui';
import {UNIVERSITY_DATA, calculateAdmissionChance, getChanceColor} from '../components/result-game/data';
import type {CalculationResult} from '../components/result-game/data';
import {shareContent} from '../services/share';

export const useResultGameScreen = () => {
  const navigation = useNavigation();
  const {colors, isDark} = useTheme();

  const [marks, setMarks] = useState('');
  const [entryTestScore, setEntryTestScore] = useState('');
  const [entryTestMax, setEntryTestMax] = useState('200');
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<CalculationResult[]>([]);

  const resultScale = useRef(new Animated.Value(0)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const selectedUniData = UNIVERSITY_DATA.find(u => u.id === selectedUniversity);

  const handleCalculate = useCallback(() => {
    const marksNum = parseFloat(marks);
    const testScore = parseFloat(entryTestScore);
    const testMax = parseFloat(entryTestMax);
    if (isNaN(marksNum) || isNaN(testScore) || isNaN(testMax)) return;

    let programsToCalculate: {program: any; university: any}[] = [];

    if (selectedUniversity && selectedProgram) {
      const uni = UNIVERSITY_DATA.find(u => u.id === selectedUniversity);
      const prog = uni?.programs.find(p => p.id === selectedProgram);
      if (uni && prog) programsToCalculate = [{program: prog, university: uni}];
    } else if (selectedUniversity) {
      const uni = UNIVERSITY_DATA.find(u => u.id === selectedUniversity);
      if (uni) programsToCalculate = uni.programs.map(p => ({program: p, university: uni}));
    } else {
      UNIVERSITY_DATA.forEach(uni => {
        uni.programs.forEach(prog => programsToCalculate.push({program: prog, university: uni}));
      });
    }

    const calculated = programsToCalculate.map(({program, university}) => ({
      program, university, ...calculateAdmissionChance(marksNum, testScore, testMax, program),
    }));
    calculated.sort((a, b) => b.percentage - a.percentage);

    setResults(calculated);
    setShowResults(true);
    Animated.parallel([
      Animated.spring(resultScale, {toValue: 1, friction: 5, tension: 60, useNativeDriver: true}),
      Animated.timing(resultOpacity, {toValue: 1, duration: 300, useNativeDriver: true}),
    ]).start();
  }, [marks, entryTestScore, entryTestMax, selectedUniversity, selectedProgram]);

  const handleReset = () => {
    setShowResults(false);
    setResults([]);
    setSelectedUniversity(null);
    setSelectedProgram(null);
    resultScale.setValue(0);
    resultOpacity.setValue(0);
  };

  const handleButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {toValue: ANIMATION_SCALES.ICON_PRESS, duration: 100, useNativeDriver: true}),
      Animated.timing(buttonScale, {toValue: 1, duration: 100, useNativeDriver: true}),
    ]).start();
  };

  const handleShare = () => {
    if (results.length === 0) return;
    const displayed = results.slice(0, 10);
    const lines = displayed.map((r, i) => {
      const emoji = r.percentage >= 80 ? '🟢' : r.percentage >= 50 ? '🟡' : '🔴';
      return `${emoji} #${i + 1} ${r.university.shortName} - ${r.program.name}: ${r.percentage}% (${r.status})\n   Cutoff: ${r.program.lastYearCutoff} | ~${r.program.seats} seats | ${r.program.difficulty}`;
    }).join('\n\n');
    const top = displayed[0].percentage;
    const prefix = top >= 80 ? '🎉 Strong admission chances!' : top >= 60 ? '📊 Building momentum on my journey!' : top >= 40 ? '📈 Room to grow - working harder!' : '🎯 Starting my improvement journey!';
    shareContent({title: 'My Admission Chances - PakUni', message: `${prefix}\n\n${lines}\n\nCalculated on PakUni App`});
  };

  return {
    colors, isDark, navigation, marks, setMarks, entryTestScore, setEntryTestScore,
    entryTestMax, setEntryTestMax, selectedUniversity, setSelectedUniversity,
    selectedProgram, setSelectedProgram, showResults, results, selectedUniData,
    resultScale, resultOpacity, buttonScale,
    handleCalculate, handleReset, handleButtonPress, handleShare, getChanceColor,
    universityData: UNIVERSITY_DATA,
  };
};
