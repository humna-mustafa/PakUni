/**
 * ResultGame data - University admission data and calculation logic.
 */

export interface ProgramAdmission {
  id: string;
  name: string;
  shortName: string;
  minMarks: number;
  entryTestWeight: number;
  marksWeight: number;
  minEntryTest: number;
  seats: number;
  lastYearCutoff: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
}

export interface UniversityAdmission {
  id: string;
  name: string;
  shortName: string;
  programs: ProgramAdmission[];
  color: string;
}

export interface CalculationResult {
  program: ProgramAdmission;
  university: UniversityAdmission;
  percentage: number;
  status: string;
  color: string;
  recommendations: string[];
}

export const UNIVERSITY_DATA: UniversityAdmission[] = [
  {
    id: 'nust', name: 'NUST (National University of Sciences & Technology)', shortName: 'NUST', color: '#1E40AF',
    programs: [
      {id: 'nust-cs', name: 'Computer Science', shortName: 'CS', minMarks: 80, entryTestWeight: 75, marksWeight: 25, minEntryTest: 140, seats: 150, lastYearCutoff: 168, difficulty: 'Very Hard'},
      {id: 'nust-ee', name: 'Electrical Engineering', shortName: 'EE', minMarks: 75, entryTestWeight: 75, marksWeight: 25, minEntryTest: 130, seats: 120, lastYearCutoff: 155, difficulty: 'Very Hard'},
      {id: 'nust-se', name: 'Software Engineering', shortName: 'SE', minMarks: 78, entryTestWeight: 75, marksWeight: 25, minEntryTest: 135, seats: 100, lastYearCutoff: 162, difficulty: 'Very Hard'},
      {id: 'nust-me', name: 'Mechanical Engineering', shortName: 'ME', minMarks: 70, entryTestWeight: 75, marksWeight: 25, minEntryTest: 120, seats: 100, lastYearCutoff: 145, difficulty: 'Hard'},
      {id: 'nust-bba', name: 'Business Administration', shortName: 'BBA', minMarks: 70, entryTestWeight: 70, marksWeight: 30, minEntryTest: 110, seats: 80, lastYearCutoff: 140, difficulty: 'Hard'},
    ],
  },
  {
    id: 'lums', name: 'LUMS (Lahore University of Management Sciences)', shortName: 'LUMS', color: '#DC2626',
    programs: [
      {id: 'lums-cs', name: 'Computer Science', shortName: 'CS', minMarks: 85, entryTestWeight: 50, marksWeight: 50, minEntryTest: 60, seats: 100, lastYearCutoff: 75, difficulty: 'Very Hard'},
      {id: 'lums-bba', name: 'Business Administration', shortName: 'BSc (Hons)', minMarks: 80, entryTestWeight: 50, marksWeight: 50, minEntryTest: 55, seats: 200, lastYearCutoff: 70, difficulty: 'Hard'},
      {id: 'lums-eco', name: 'Economics', shortName: 'Eco', minMarks: 75, entryTestWeight: 50, marksWeight: 50, minEntryTest: 50, seats: 80, lastYearCutoff: 65, difficulty: 'Hard'},
      {id: 'lums-law', name: 'Law (LLB)', shortName: 'LLB', minMarks: 75, entryTestWeight: 50, marksWeight: 50, minEntryTest: 50, seats: 60, lastYearCutoff: 68, difficulty: 'Hard'},
    ],
  },
  {
    id: 'fast', name: 'FAST-NUCES', shortName: 'FAST', color: '#059669',
    programs: [
      {id: 'fast-cs', name: 'Computer Science', shortName: 'CS', minMarks: 70, entryTestWeight: 70, marksWeight: 30, minEntryTest: 55, seats: 300, lastYearCutoff: 72, difficulty: 'Hard'},
      {id: 'fast-se', name: 'Software Engineering', shortName: 'SE', minMarks: 70, entryTestWeight: 70, marksWeight: 30, minEntryTest: 55, seats: 200, lastYearCutoff: 70, difficulty: 'Hard'},
      {id: 'fast-ds', name: 'Data Science', shortName: 'DS', minMarks: 65, entryTestWeight: 70, marksWeight: 30, minEntryTest: 50, seats: 100, lastYearCutoff: 65, difficulty: 'Medium'},
      {id: 'fast-ai', name: 'Artificial Intelligence', shortName: 'AI', minMarks: 68, entryTestWeight: 70, marksWeight: 30, minEntryTest: 52, seats: 80, lastYearCutoff: 68, difficulty: 'Hard'},
      {id: 'fast-ee', name: 'Electrical Engineering', shortName: 'EE', minMarks: 65, entryTestWeight: 70, marksWeight: 30, minEntryTest: 48, seats: 150, lastYearCutoff: 60, difficulty: 'Medium'},
    ],
  },
  {
    id: 'giki', name: 'GIKI (Ghulam Ishaq Khan Institute)', shortName: 'GIKI', color: '#7C3AED',
    programs: [
      {id: 'giki-cs', name: 'Computer Science', shortName: 'CS', minMarks: 75, entryTestWeight: 70, marksWeight: 30, minEntryTest: 65, seats: 80, lastYearCutoff: 78, difficulty: 'Very Hard'},
      {id: 'giki-ee', name: 'Electrical Engineering', shortName: 'EE', minMarks: 72, entryTestWeight: 70, marksWeight: 30, minEntryTest: 60, seats: 100, lastYearCutoff: 72, difficulty: 'Hard'},
      {id: 'giki-me', name: 'Mechanical Engineering', shortName: 'ME', minMarks: 70, entryTestWeight: 70, marksWeight: 30, minEntryTest: 55, seats: 100, lastYearCutoff: 68, difficulty: 'Hard'},
    ],
  },
  {
    id: 'comsats', name: 'COMSATS University', shortName: 'COMSATS', color: '#0891B2',
    programs: [
      {id: 'comsats-cs', name: 'Computer Science', shortName: 'CS', minMarks: 60, entryTestWeight: 50, marksWeight: 50, minEntryTest: 50, seats: 400, lastYearCutoff: 70, difficulty: 'Medium'},
      {id: 'comsats-se', name: 'Software Engineering', shortName: 'SE', minMarks: 60, entryTestWeight: 50, marksWeight: 50, minEntryTest: 50, seats: 300, lastYearCutoff: 68, difficulty: 'Medium'},
      {id: 'comsats-ee', name: 'Electrical Engineering', shortName: 'EE', minMarks: 55, entryTestWeight: 50, marksWeight: 50, minEntryTest: 45, seats: 250, lastYearCutoff: 62, difficulty: 'Easy'},
      {id: 'comsats-bba', name: 'Business Administration', shortName: 'BBA', minMarks: 50, entryTestWeight: 40, marksWeight: 60, minEntryTest: 40, seats: 200, lastYearCutoff: 58, difficulty: 'Easy'},
    ],
  },
  {
    id: 'uet', name: 'UET Lahore', shortName: 'UET', color: '#B45309',
    programs: [
      {id: 'uet-cs', name: 'Computer Science', shortName: 'CS', minMarks: 70, entryTestWeight: 80, marksWeight: 20, minEntryTest: 65, seats: 120, lastYearCutoff: 850, difficulty: 'Hard'},
      {id: 'uet-ee', name: 'Electrical Engineering', shortName: 'EE', minMarks: 65, entryTestWeight: 80, marksWeight: 20, minEntryTest: 60, seats: 200, lastYearCutoff: 800, difficulty: 'Hard'},
      {id: 'uet-me', name: 'Mechanical Engineering', shortName: 'ME', minMarks: 60, entryTestWeight: 80, marksWeight: 20, minEntryTest: 55, seats: 200, lastYearCutoff: 750, difficulty: 'Medium'},
      {id: 'uet-civil', name: 'Civil Engineering', shortName: 'Civil', minMarks: 60, entryTestWeight: 80, marksWeight: 20, minEntryTest: 50, seats: 180, lastYearCutoff: 700, difficulty: 'Medium'},
    ],
  },
  {
    id: 'pu', name: 'Punjab University', shortName: 'PU', color: '#4F46E5',
    programs: [
      {id: 'pu-cs', name: 'Computer Science', shortName: 'CS', minMarks: 55, entryTestWeight: 60, marksWeight: 40, minEntryTest: 50, seats: 300, lastYearCutoff: 65, difficulty: 'Medium'},
      {id: 'pu-it', name: 'Information Technology', shortName: 'IT', minMarks: 50, entryTestWeight: 60, marksWeight: 40, minEntryTest: 45, seats: 250, lastYearCutoff: 60, difficulty: 'Easy'},
      {id: 'pu-bba', name: 'Business Administration', shortName: 'BBA', minMarks: 50, entryTestWeight: 50, marksWeight: 50, minEntryTest: 45, seats: 200, lastYearCutoff: 58, difficulty: 'Easy'},
      {id: 'pu-law', name: 'Law (LLB)', shortName: 'LLB', minMarks: 50, entryTestWeight: 50, marksWeight: 50, minEntryTest: 45, seats: 150, lastYearCutoff: 55, difficulty: 'Easy'},
    ],
  },
  {
    id: 'iba', name: 'IBA Karachi', shortName: 'IBA', color: '#BE185D',
    programs: [
      {id: 'iba-bba', name: 'Business Administration', shortName: 'BBA', minMarks: 75, entryTestWeight: 60, marksWeight: 40, minEntryTest: 70, seats: 200, lastYearCutoff: 75, difficulty: 'Very Hard'},
      {id: 'iba-cs', name: 'Computer Science', shortName: 'CS', minMarks: 75, entryTestWeight: 60, marksWeight: 40, minEntryTest: 68, seats: 100, lastYearCutoff: 73, difficulty: 'Very Hard'},
      {id: 'iba-eco', name: 'Economics & Mathematics', shortName: 'Eco', minMarks: 70, entryTestWeight: 60, marksWeight: 40, minEntryTest: 65, seats: 80, lastYearCutoff: 70, difficulty: 'Hard'},
    ],
  },
];

export const calculateAdmissionChance = (
  marks: number, entryTestScore: number, entryTestMax: number, program: ProgramAdmission,
): {percentage: number; status: string; color: string; recommendations: string[]} => {
  const recommendations: string[] = [];
  const entryTestPercentage = (entryTestScore / entryTestMax) * 100;
  const aggregate = (marks * program.marksWeight / 100) + (entryTestPercentage * program.entryTestWeight / 100);

  const meetsMinMarks = marks >= program.minMarks;
  const meetsMinEntryTest = entryTestScore >= program.minEntryTest;

  if (!meetsMinMarks) recommendations.push(`Minimum ${program.minMarks}% marks required. You have ${marks}%.`);
  if (!meetsMinEntryTest) recommendations.push(`Entry test score needs improvement. Target: ${program.minEntryTest}+`);

  let percentage: number;
  let status: string;
  let color: string;

  const normalizedCutoff = program.lastYearCutoff > 100 ? program.lastYearCutoff / 2 : program.lastYearCutoff;
  const ratio = aggregate / normalizedCutoff;

  if (!meetsMinMarks || !meetsMinEntryTest) {
    percentage = 5; status = 'Not Eligible'; color = '#EF4444';
    recommendations.push('You do not meet minimum requirements for this program.');
  } else if (ratio >= 1.15) {
    percentage = 90; status = 'Strong Chances'; color = '#10B981';
    recommendations.push('Your profile is very strong! Focus on interview prep.');
  } else if (ratio >= 1.05) {
    percentage = 75; status = 'Building Momentum'; color = '#22C55E';
    recommendations.push('Good progress. Keep documents ready!');
  } else if (ratio >= 0.98) {
    percentage = 55; status = 'Room to Grow'; color = '#84CC16';
    recommendations.push('Competitive but needs work. Consider backup options too.');
  } else if (ratio >= 0.92) {
    percentage = 35; status = 'Needs Improvement'; color = '#F59E0B';
    recommendations.push('Borderline case. Focus on improving scores and apply to backup universities.');
  } else if (ratio >= 0.85) {
    percentage = 20; status = 'Significant Work Needed'; color = '#EF4444';
    recommendations.push('Consider easier programs or focus on improving your marks significantly.');
  } else {
    percentage = 10; status = 'Major Improvement Required'; color = '#EF4444';
    recommendations.push('Focus on fundamentals and backup options. Hard work can change outcomes!');
  }

  if (program.difficulty === 'Very Hard') {
    percentage = Math.max(5, percentage - 15);
    if (percentage < 40) recommendations.push(`${program.shortName} at this university is highly competitive.`);
  } else if (program.difficulty === 'Hard') {
    percentage = Math.max(5, percentage - 5);
  } else if (program.difficulty === 'Easy') {
    percentage = Math.min(95, percentage + 10);
  }

  percentage = Math.max(5, Math.min(95, percentage));
  return {percentage, status, color: color || '#3B82F6', recommendations};
};

export const getChanceColor = (percentage: number) => {
  if (percentage >= 80) return '#10B981';
  if (percentage >= 60) return '#22C55E';
  if (percentage >= 40) return '#F59E0B';
  if (percentage >= 20) return '#EF4444';
  return '#DC2626';
};
