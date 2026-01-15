/**
 * useMeritCalculation Hook
 * Handles merit calculation logic with multiple formula support
 */

import {useState, useMemo, useCallback} from 'react';
import {MERIT_FORMULAS, MeritFormulaData} from '../data/meritFormulas';
import {EDUCATION_SYSTEMS} from '../data';

export interface MarksInput {
  matricPercentage: number;
  intermediatePercentage: number;
  testScore: number;
}

export interface CalculationResult {
  formulaId: string;
  formulaName: string;
  merit: number;
  breakdown: {
    matricContribution: number;
    intermediateContribution: number;
    testContribution: number;
  };
}

interface EducationSystemOption {
  value: string;
  label: string;
  shortLabel: string;
}

interface UseMeritCalculationReturn {
  marks: MarksInput;
  setMarks: (marks: Partial<MarksInput>) => void;
  selectedEducationSystem: string;
  setSelectedEducationSystem: (system: string) => void;
  selectedFormulaId: string | null;
  setSelectedFormulaId: (id: string | null) => void;
  applicableFormulas: MeritFormulaData[];
  allFormulas: MeritFormulaData[];
  calculateMerit: (formulaId: string) => CalculationResult | null;
  calculateAllMerits: () => CalculationResult[];
  educationSystems: EducationSystemOption[];
  isValid: boolean;
  validationErrors: string[];
  resetCalculator: () => void;
}

const INITIAL_MARKS: MarksInput = {
  matricPercentage: 0,
  intermediatePercentage: 0,
  testScore: 0,
};

export const useMeritCalculation = (): UseMeritCalculationReturn => {
  const [marks, setMarksState] = useState<MarksInput>(INITIAL_MARKS);
  const [selectedEducationSystem, setSelectedEducationSystem] = useState('fsc_pre_medical');
  const [selectedFormulaId, setSelectedFormulaId] = useState<string | null>(null);

  const educationSystems = useMemo(() => EDUCATION_SYSTEMS, []);

  const applicableFormulas = useMemo(() => {
    // Filter formulas based on selected education system's applicable fields
    const systemLabel = educationSystems.find(s => s.value === selectedEducationSystem)?.label || '';
    return MERIT_FORMULAS.filter(formula => {
      // Match based on applicable_fields
      if (systemLabel.includes('Medical') || systemLabel.includes('Pre-Med')) {
        return formula.applicable_fields.some(f => 
          f.toLowerCase().includes('medical') || f.toLowerCase().includes('mbbs')
        );
      }
      if (systemLabel.includes('Engineering') || systemLabel.includes('Pre-Eng')) {
        return formula.applicable_fields.some(f => 
          f.toLowerCase().includes('engineering')
        );
      }
      if (systemLabel.includes('Computer') || systemLabel.includes('ICS')) {
        return formula.applicable_fields.some(f => 
          f.toLowerCase().includes('computer') || f.toLowerCase().includes('it') || f.toLowerCase().includes('cs')
        );
      }
      // Default: return all formulas
      return true;
    });
  }, [selectedEducationSystem, educationSystems]);

  const setMarks = useCallback((newMarks: Partial<MarksInput>) => {
    setMarksState(prev => ({...prev, ...newMarks}));
  }, []);

  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    if (marks.matricPercentage < 0 || marks.matricPercentage > 100) {
      errors.push('Matric percentage must be between 0 and 100');
    }
    if (marks.intermediatePercentage < 0 || marks.intermediatePercentage > 100) {
      errors.push('Intermediate percentage must be between 0 and 100');
    }
    if (marks.testScore < 0 || marks.testScore > 100) {
      errors.push('Test score must be between 0 and 100');
    }

    return errors;
  }, [marks]);

  const isValid = useMemo(() => {
    return (
      validationErrors.length === 0 &&
      marks.matricPercentage > 0 &&
      marks.intermediatePercentage > 0 &&
      marks.testScore > 0
    );
  }, [validationErrors, marks]);

  const calculateMerit = useCallback(
    (formulaId: string): CalculationResult | null => {
      const formula = MERIT_FORMULAS.find(f => f.id === formulaId);
      if (!formula) return null;

      const matricContribution =
        (marks.matricPercentage * formula.matric_weightage) / 100;
      const intermediateContribution =
        (marks.intermediatePercentage * formula.inter_weightage) / 100;
      const testContribution =
        (marks.testScore * formula.entry_test_weightage) / 100;

      const merit = matricContribution + intermediateContribution + testContribution;

      return {
        formulaId: formula.id,
        formulaName: formula.name,
        merit: Math.round(merit * 100) / 100,
        breakdown: {
          matricContribution: Math.round(matricContribution * 100) / 100,
          intermediateContribution: Math.round(intermediateContribution * 100) / 100,
          testContribution: Math.round(testContribution * 100) / 100,
        },
      };
    },
    [marks],
  );

  const calculateAllMerits = useCallback((): CalculationResult[] => {
    return applicableFormulas
      .map(formula => calculateMerit(formula.id))
      .filter((result): result is CalculationResult => result !== null)
      .sort((a, b) => b.merit - a.merit);
  }, [applicableFormulas, calculateMerit]);

  const resetCalculator = useCallback(() => {
    setMarksState(INITIAL_MARKS);
    setSelectedFormulaId(null);
  }, []);

  return {
    marks,
    setMarks,
    selectedEducationSystem,
    setSelectedEducationSystem,
    selectedFormulaId,
    setSelectedFormulaId,
    applicableFormulas,
    allFormulas: MERIT_FORMULAS,
    calculateMerit,
    calculateAllMerits,
    educationSystems,
    isValid,
    validationErrors,
    resetCalculator,
  };
};

export default useMeritCalculation;
