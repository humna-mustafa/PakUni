// Data module exports
export { UNIVERSITIES } from './universities';
export type { UniversityData } from './universities';

export { MERIT_FORMULAS, ENTRY_TESTS } from './meritFormulas';
export type { MeritFormulaData } from './meritFormulas';

export { POLLS_DATA, POLL_CATEGORIES } from './polls';
export type { Poll, PollOption } from './polls';

export { 
  ADMISSION_DEADLINES, 
  PROGRAM_CATEGORIES,
  getUpcomingDeadlines,
  getDeadlinesByUniversity,
  getHighlightedDeadlines,
  getDeadlineStatus,
  getDaysUntilDeadline,
} from './deadlines';
export type { AdmissionDeadline, FollowedUniversity } from './deadlines';

export {
  MERIT_RECORDS,
  OPEN_MERIT_RECORDS,
  QUOTA_MERIT_RECORDS,
  MERIT_CATEGORIES,
  AVAILABLE_YEARS,
  QUOTA_TYPE_LABELS,
  getMeritTrend,
  getYearlyChange,
  searchMeritRecords,
  getHighestMeritPrograms,
  getLowestMeritPrograms,
  getQuotaRecords,
  getBestQuotaRecord,
  getSelfFinanceRecord,
} from './meritArchive';
export type { MeritRecord, YearlyTrend } from './meritArchive';

export {
  UNIVERSITY_FEES,
  getUniversityFees,
  getProgramFee,
  formatFeeShort,
  estimateTotalCost,
} from './feesData';
export type { UniversityFeeData, ProgramFee, ScholarshipSummary } from './feesData';

export { SCHOLARSHIPS, getScholarshipsForUniversity, isScholarshipAvailableAt } from './scholarships';
export type { ScholarshipData } from './scholarships';

export { PROGRAMS } from './programs';
export type { ProgramData } from './programs';

export { 
  ENTRY_TESTS_DATA, 
  getUpcomingTests, 
  getTestsByField, 
  getRegistrationOpenTests 
} from './entryTests';
export type { EntryTestData, EntryTestVariant } from './entryTests';

export { 
  CAREER_FIELDS, 
  CAREER_PATHS,
  getCareersByDemand,
  getCareersByScope,
  getHighPayingCareers,
  getCareerPath 
} from './careers';
export type { CareerField, CareerPath } from './careers';

// Fields of Study with semantic colors
export const FIELDS = [
  { id: 'medical', name: 'Medical & Health Sciences', iconName: 'medkit', iconColor: '#E53935', slug: 'medical' },
  { id: 'engineering', name: 'Engineering & Technology', iconName: 'construct', iconColor: '#FB8C00', slug: 'engineering' },
  { id: 'computer-science', name: 'Computer Science & IT', iconName: 'code-slash', iconColor: '#1E88E5', slug: 'computer-science' },
  { id: 'business', name: 'Business & Commerce', iconName: 'trending-up', iconColor: '#43A047', slug: 'business' },
  { id: 'arts', name: 'Arts & Humanities', iconName: 'book', iconColor: '#8E24AA', slug: 'arts' },
  { id: 'sciences', name: 'Natural Sciences', iconName: 'flask', iconColor: '#00ACC1', slug: 'sciences' },
  { id: 'social-sciences', name: 'Social Sciences', iconName: 'people', iconColor: '#5C6BC0', slug: 'social-sciences' },
  { id: 'law', name: 'Law & Legal Studies', iconName: 'shield-checkmark', iconColor: '#6D4C41', slug: 'law' },
  { id: 'agriculture', name: 'Agriculture & Veterinary', iconName: 'leaf', iconColor: '#66BB6A', slug: 'agriculture' },
  { id: 'architecture', name: 'Architecture & Design', iconName: 'layers', iconColor: '#78909C', slug: 'architecture' },
  { id: 'media', name: 'Media & Communication', iconName: 'videocam', iconColor: '#EC407A', slug: 'media' },
  { id: 'education', name: 'Education', iconName: 'school', iconColor: '#1976D2', slug: 'education' },
];

// Provinces
export const PROVINCES = [
  { value: 'all', label: 'All Provinces' },
  { value: 'punjab', label: 'Punjab' },
  { value: 'sindh', label: 'Sindh' },
  { value: 'kpk', label: 'Khyber Pakhtunkhwa' },
  { value: 'balochistan', label: 'Balochistan' },
  { value: 'islamabad', label: 'Islamabad Capital' },
  { value: 'azad_kashmir', label: 'Azad Kashmir' },
  { value: 'gilgit_baltistan', label: 'Gilgit-Baltistan' },
];

// Cities with universities
export const MAJOR_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Hyderabad',
  'Gujranwala',
  'Sialkot',
  'Bahawalpur',
  'Sargodha',
  'Abbottabad',
  'Mardan',
  'Sukkur',
  'Jamshoro',
  'Muzaffarabad',
];

// Education Systems
export const EDUCATION_SYSTEMS = [
  { value: 'fsc_pre_medical', label: 'FSc Pre-Medical', shortLabel: 'Pre-Med' },
  { value: 'fsc_pre_engineering', label: 'FSc Pre-Engineering', shortLabel: 'Pre-Eng' },
  { value: 'ics', label: 'ICS (Computer Science)', shortLabel: 'ICS' },
  { value: 'icom', label: 'I.Com (Commerce)', shortLabel: 'I.Com' },
  { value: 'fa', label: 'FA (Arts)', shortLabel: 'FA' },
  { value: 'dae', label: 'DAE (Diploma)', shortLabel: 'DAE' },
  { value: 'o_levels', label: 'O-Levels (Cambridge)', shortLabel: 'O-Levels' },
  { value: 'a_levels', label: 'A-Levels (Cambridge)', shortLabel: 'A-Levels' },
];

// HEC Rankings explanation
export const HEC_RANKINGS = {
  W4: { name: 'Category W4', description: 'Highest ranked universities with excellent research and teaching' },
  W3: { name: 'Category W3', description: 'Very good universities with strong academic programs' },
  W2: { name: 'Category W2', description: 'Good universities meeting HEC standards' },
  W1: { name: 'Category W1', description: 'Universities meeting minimum HEC requirements' },
  X: { name: 'Category X', description: 'Universities under observation or not ranked' },
};
