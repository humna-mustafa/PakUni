/**
 * Calculator Components Index
 * Export all calculator-related components
 */

export {GradeConverterCard, CompactGradeConverter} from './GradeConverterCard';
export {TargetCalculator} from './TargetCalculator';
export {WhatIfSimulator} from './WhatIfSimulator';
export {CustomFormulaBuilder} from './CustomFormulaBuilder';
export type {CustomFormula} from './CustomFormulaBuilder';

// Re-export utility functions
export {
  cgpaToPercentage,
  percentageToCGPA,
  convertOLevelToMatric,
  convertALevelToInter,
  convertCambridgeToLocal,
  CGPA_REFERENCE_TABLE,
  O_LEVEL_REFERENCE,
  A_LEVEL_REFERENCE,
} from '../../utils/gradeConversion';
