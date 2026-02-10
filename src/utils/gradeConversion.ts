/**
 * Grade Conversion Utilities
 * CGPA to Percentage, Percentage to CGPA, O/A Level Equivalence
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ConversionResult {
  value: number;
  grade: string;
  remarks: string;
}

export interface OLevelGrade {
  grade: string;
  points: number;
  percentage: number;
}

export interface ALevelGrade {
  grade: string;
  points: number;
  percentage: number;
}

// ============================================================================
// CGPA SYSTEMS
// ============================================================================

export type CGPAScale = '4.0' | '5.0' | 'hec';

// Standard 4.0 Scale (Most Pakistani universities)
const CGPA_4_0_TABLE = [
  {minCGPA: 3.70, maxCGPA: 4.00, grade: 'A+', remarks: 'Exceptional'},
  {minCGPA: 3.30, maxCGPA: 3.69, grade: 'A', remarks: 'Excellent'},
  {minCGPA: 3.00, maxCGPA: 3.29, grade: 'A-', remarks: 'Very Good'},
  {minCGPA: 2.70, maxCGPA: 2.99, grade: 'B+', remarks: 'Good'},
  {minCGPA: 2.30, maxCGPA: 2.69, grade: 'B', remarks: 'Above Average'},
  {minCGPA: 2.00, maxCGPA: 2.29, grade: 'B-', remarks: 'Average'},
  {minCGPA: 1.70, maxCGPA: 1.99, grade: 'C+', remarks: 'Below Average'},
  {minCGPA: 1.30, maxCGPA: 1.69, grade: 'C', remarks: 'Satisfactory'},
  {minCGPA: 1.00, maxCGPA: 1.29, grade: 'C-', remarks: 'Pass'},
  {minCGPA: 0.00, maxCGPA: 0.99, grade: 'F', remarks: 'Fail'},
];

// HEC Pakistan Official Formula
const HEC_CONVERSION_FACTOR = 20; // Percentage = CGPA × 20 + 10

// ============================================================================
// CGPA TO PERCENTAGE CONVERSIONS
// ============================================================================

/**
 * Convert CGPA to Percentage using different methods
 */
export const cgpaToPercentage = (
  cgpa: number,
  scale: CGPAScale = '4.0',
  totalCGPA: number = 4.0
): ConversionResult => {
  if (cgpa < 0 || cgpa > totalCGPA) {
    throw new Error(`CGPA must be between 0 and ${totalCGPA}`);
  }

  let percentage: number;
  let grade: string;
  let remarks: string;

  switch (scale) {
    case 'hec':
      // HEC Pakistan Formula: Percentage = CGPA × 20 + 10
      // For 4.0 scale: 4.0 × 20 + 10 = 90%
      percentage = cgpa * 20 + 10;
      break;
    
    case '5.0':
      // 5.0 Scale: Percentage = CGPA × 20
      percentage = cgpa * 20;
      break;
    
    default:
      // Standard 4.0 Scale: Linear conversion
      // 4.0 = 100%, 0.0 = 0%
      percentage = (cgpa / totalCGPA) * 100;
  }

  // Ensure percentage is within bounds
  percentage = Math.min(100, Math.max(0, percentage));

  // Get grade
  const gradeInfo = CGPA_4_0_TABLE.find(
    g => cgpa >= g.minCGPA && cgpa <= g.maxCGPA
  );
  grade = gradeInfo?.grade || 'N/A';
  remarks = gradeInfo?.remarks || '';

  return {
    value: Math.round(percentage * 100) / 100,
    grade,
    remarks,
  };
};

// ============================================================================
// PERCENTAGE TO CGPA CONVERSIONS
// ============================================================================

/**
 * Convert Percentage to CGPA using different methods
 */
export const percentageToCGPA = (
  percentage: number,
  scale: CGPAScale = '4.0',
  totalCGPA: number = 4.0
): ConversionResult => {
  if (percentage < 0 || percentage > 100) {
    throw new Error('Percentage must be between 0 and 100');
  }

  let cgpa: number;
  let grade: string;
  let remarks: string;

  switch (scale) {
    case 'hec':
      // HEC Reverse: CGPA = (Percentage - 10) / 20
      cgpa = (percentage - 10) / 20;
      break;
    
    case '5.0':
      // 5.0 Scale: CGPA = Percentage / 20
      cgpa = percentage / 20;
      break;
    
    default:
      // Standard 4.0 Scale: Linear conversion
      cgpa = (percentage / 100) * totalCGPA;
  }

  // Ensure CGPA is within bounds
  cgpa = Math.min(totalCGPA, Math.max(0, cgpa));

  // Get grade
  const gradeInfo = CGPA_4_0_TABLE.find(
    g => cgpa >= g.minCGPA && cgpa <= g.maxCGPA
  );
  grade = gradeInfo?.grade || 'N/A';
  remarks = gradeInfo?.remarks || '';

  return {
    value: Math.round(cgpa * 100) / 100,
    grade,
    remarks,
  };
};

// ============================================================================
// O-LEVEL EQUIVALENCE
// ============================================================================

// Cambridge O-Level Grade Points and Equivalence
const O_LEVEL_GRADES: OLevelGrade[] = [
  {grade: 'A*', points: 8, percentage: 90},
  {grade: 'A', points: 7, percentage: 85},
  {grade: 'B', points: 6, percentage: 75},
  {grade: 'C', points: 5, percentage: 65},
  {grade: 'D', points: 4, percentage: 55},
  {grade: 'E', points: 3, percentage: 45},
  {grade: 'F', points: 2, percentage: 35},
  {grade: 'G', points: 1, percentage: 25},
  {grade: 'U', points: 0, percentage: 0},
];

/**
 * Convert O-Level grades to Pakistani Matric (SSC) equivalent
 * Using official IBCC (Inter Board Committee of Chairmen) formula
 * 
 * IBCC Grade → Marks mapping (per subject out of 100):
 *   A* = 90, A = 85, B = 75, C = 65, D = 55, E = 45, F/G/U = Fail
 * 
 * Best 8 subjects are considered
 * Matric (SSC) total = 1100 marks
 * Equivalent = (Sum of grade marks / Max possible) × 1100
 */
export const convertOLevelToMatric = (
  grades: string[],
): {
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  equivalentMarks: number;
  totalMarks: number;
  grade: string;
} => {
  // Convert each grade to IBCC marks (out of 100 per subject)
  const gradeMarks: number[] = [];

  for (const gradeStr of grades) {
    const gradeInfo = O_LEVEL_GRADES.find(
      g => g.grade.toLowerCase() === gradeStr.toLowerCase()
    );
    if (gradeInfo) {
      gradeMarks.push(gradeInfo.percentage); // percentage = IBCC marks out of 100
    }
  }

  if (gradeMarks.length === 0) {
    return { totalPoints: 0, maxPoints: 0, percentage: 0, equivalentMarks: 0, totalMarks: 1100, grade: 'F' };
  }

  // IBCC considers best 8 subjects for O-Level → Matric equivalence
  // Sort descending to pick best grades first
  gradeMarks.sort((a, b) => b - a);
  const bestGrades = gradeMarks.slice(0, 8);

  const totalMarksEarned = bestGrades.reduce((sum, m) => sum + m, 0);
  const maxPossible = bestGrades.length * 100; // Each subject out of 100
  const percentage = (totalMarksEarned / maxPossible) * 100;

  // IBCC Matric (SSC) total = 1100 marks
  const totalMarks = 1100;
  const equivalentMarks = Math.round((totalMarksEarned / maxPossible) * totalMarks);

  // Pakistani board grading
  let grade = 'F';
  if (percentage >= 80) grade = 'A-1';
  else if (percentage >= 70) grade = 'A';
  else if (percentage >= 60) grade = 'B';
  else if (percentage >= 50) grade = 'C';
  else if (percentage >= 40) grade = 'D';
  else if (percentage >= 33) grade = 'E';

  return {
    totalPoints: totalMarksEarned,
    maxPoints: maxPossible,
    percentage: Math.round(percentage * 100) / 100,
    equivalentMarks,
    totalMarks,
    grade,
  };
};

// ============================================================================
// A-LEVEL EQUIVALENCE
// ============================================================================

// Cambridge A-Level Grade Points and Equivalence
const A_LEVEL_GRADES: ALevelGrade[] = [
  {grade: 'A*', points: 8, percentage: 90},
  {grade: 'A', points: 7, percentage: 85},
  {grade: 'B', points: 6, percentage: 75},
  {grade: 'C', points: 5, percentage: 65},
  {grade: 'D', points: 4, percentage: 55},
  {grade: 'E', points: 3, percentage: 45},
  {grade: 'U', points: 0, percentage: 0},
];

/**
 * Convert A-Level grades to Pakistani Intermediate (HSSC) equivalent
 * Using official IBCC formula
 * 
 * IBCC Grade → Marks mapping (per subject out of 100):
 *   A* = 90, A = 85, B = 75, C = 65, D = 55, E = 45, U = Fail
 * 
 * Best 3 principal subjects are considered
 * Inter (HSSC) total = 1100 marks
 * Equivalent = (Sum of grade marks / Max possible) × 1100
 */
export const convertALevelToInter = (
  grades: string[],
): {
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  equivalentMarks: number;
  totalMarks: number;
  grade: string;
} => {
  // Convert each grade to IBCC marks (out of 100 per subject)
  const gradeMarks: number[] = [];

  for (const gradeStr of grades) {
    const gradeInfo = A_LEVEL_GRADES.find(
      g => g.grade.toLowerCase() === gradeStr.toLowerCase()
    );
    if (gradeInfo) {
      gradeMarks.push(gradeInfo.percentage); // percentage = IBCC marks out of 100
    }
  }

  if (gradeMarks.length === 0) {
    return { totalPoints: 0, maxPoints: 0, percentage: 0, equivalentMarks: 0, totalMarks: 1100, grade: 'F' };
  }

  // IBCC considers best 3 principal subjects for A-Level → Inter equivalence
  // Sort descending to pick best grades first
  gradeMarks.sort((a, b) => b - a);
  const bestGrades = gradeMarks.slice(0, 3);

  const totalMarksEarned = bestGrades.reduce((sum, m) => sum + m, 0);
  const maxPossible = bestGrades.length * 100; // Each subject out of 100
  const percentage = (totalMarksEarned / maxPossible) * 100;

  // IBCC Inter (HSSC) total = 1100 marks
  const totalMarks = 1100;
  const equivalentMarks = Math.round((totalMarksEarned / maxPossible) * totalMarks);

  // Pakistani board grading
  let grade = 'F';
  if (percentage >= 80) grade = 'A-1';
  else if (percentage >= 70) grade = 'A';
  else if (percentage >= 60) grade = 'B';
  else if (percentage >= 50) grade = 'C';
  else if (percentage >= 40) grade = 'D';
  else if (percentage >= 33) grade = 'E';

  return {
    totalPoints: totalMarksEarned,
    maxPoints: maxPossible,
    percentage: Math.round(percentage * 100) / 100,
    equivalentMarks,
    totalMarks,
    grade,
  };
};

// ============================================================================
// COMBINED CONVERSION UTILITY
// ============================================================================

export interface CambridgeConversionInput {
  oLevelGrades?: string[];
  aLevelGrades?: string[];
}

export interface CambridgeConversionResult {
  oLevel?: {
    totalPoints: number;
    maxPoints: number;
    percentage: number;
    equivalentMarks: number;
    totalMarks: number;
    grade: string;
  };
  aLevel?: {
    totalPoints: number;
    maxPoints: number;
    percentage: number;
    equivalentMarks: number;
    totalMarks: number;
    grade: string;
  };
  combinedPercentage?: number;
}

export const convertCambridgeToLocal = (
  input: CambridgeConversionInput
): CambridgeConversionResult => {
  const result: CambridgeConversionResult = {};

  if (input.oLevelGrades && input.oLevelGrades.length > 0) {
    result.oLevel = convertOLevelToMatric(input.oLevelGrades);
  }

  if (input.aLevelGrades && input.aLevelGrades.length > 0) {
    result.aLevel = convertALevelToInter(input.aLevelGrades);
  }

  // Calculate combined percentage if both available
  if (result.oLevel && result.aLevel) {
    result.combinedPercentage = Math.round(
      ((result.oLevel.percentage + result.aLevel.percentage) / 2) * 100
    ) / 100;
  }

  return result;
};

// ============================================================================
// QUICK REFERENCE DATA
// ============================================================================

export const CGPA_REFERENCE_TABLE = [
  {cgpa: '4.00', percentage4: '100%', percentageHEC: '90%', grade: 'A+'},
  {cgpa: '3.70', percentage4: '92.5%', percentageHEC: '84%', grade: 'A+'},
  {cgpa: '3.50', percentage4: '87.5%', percentageHEC: '80%', grade: 'A'},
  {cgpa: '3.30', percentage4: '82.5%', percentageHEC: '76%', grade: 'A'},
  {cgpa: '3.00', percentage4: '75%', percentageHEC: '70%', grade: 'A-'},
  {cgpa: '2.70', percentage4: '67.5%', percentageHEC: '64%', grade: 'B+'},
  {cgpa: '2.50', percentage4: '62.5%', percentageHEC: '60%', grade: 'B'},
  {cgpa: '2.30', percentage4: '57.5%', percentageHEC: '56%', grade: 'B'},
  {cgpa: '2.00', percentage4: '50%', percentageHEC: '50%', grade: 'B-'},
  {cgpa: '1.70', percentage4: '42.5%', percentageHEC: '44%', grade: 'C+'},
  {cgpa: '1.50', percentage4: '37.5%', percentageHEC: '40%', grade: 'C'},
  {cgpa: '1.00', percentage4: '25%', percentageHEC: '30%', grade: 'C-'},
];

export const O_LEVEL_REFERENCE = O_LEVEL_GRADES;
export const A_LEVEL_REFERENCE = A_LEVEL_GRADES;

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  cgpaToPercentage,
  percentageToCGPA,
  convertOLevelToMatric,
  convertALevelToInter,
  convertCambridgeToLocal,
  CGPA_REFERENCE_TABLE,
  O_LEVEL_REFERENCE,
  A_LEVEL_REFERENCE,
};
