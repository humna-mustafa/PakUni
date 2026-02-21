/**
 * Profile screen constants, types, and data
 */

import {TYPOGRAPHY} from '../../constants/design';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
  currentClass: string;
  board: string;
  school: string;
  matricMarks: number | null;
  matricTotal: number;
  interMarks: number | null;
  interTotal: number;
  entryTestScore: number | null;
  entryTestTotal: number;
  targetField: string;
  targetUniversity: string;
  interests: string[];
}

export interface SavedItem {
  id: string;
  type: 'university' | 'scholarship' | 'program';
  name: string;
  addedAt: string;
}

export interface EditField {
  key: string;
  label: string;
  type: string;
  options?: string[];
}

export const EDUCATION_LEVELS = [
  '9th Class',
  '10th Class (Matric)',
  '1st Year (FSc/FA)',
  '2nd Year (FSc/FA)',
  'Gap Year',
  'University Student',
];

export const BOARDS = [
  'Federal Board',
  'Punjab Board',
  'Sindh Board',
  'KPK Board',
  'Balochistan Board',
  'Cambridge O/A Levels',
];

export const CITIES = [
  'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi',
  'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Other',
];

export const TARGET_FIELDS = [
  'Medical (MBBS/BDS)', 'Engineering', 'Computer Science',
  'Business', 'Law', 'Arts & Design', 'Not Decided',
];

export const INTERESTS_DATA = [
  {label: 'Medicine', iconName: 'medkit-outline'},
  {label: 'Technology', iconName: 'laptop-outline'},
  {label: 'Engineering', iconName: 'construct-outline'},
  {label: 'Business', iconName: 'briefcase-outline'},
  {label: 'Law', iconName: 'document-text-outline'},
  {label: 'Arts', iconName: 'color-palette-outline'},
  {label: 'Teaching', iconName: 'school-outline'},
  {label: 'Science', iconName: 'flask-outline'},
  {label: 'Music', iconName: 'musical-notes-outline'},
  {label: 'Sports', iconName: 'football-outline'},
  {label: 'Reading', iconName: 'book-outline'},
  {label: 'Writing', iconName: 'create-outline'},
];

export const INITIAL_PROFILE: UserProfile = {
  name: '',
  email: '',
  phone: '',
  city: 'Lahore',
  currentClass: '2nd Year (FSc/FA)',
  board: 'Punjab Board',
  school: '',
  matricMarks: null,
  matricTotal: 1100,
  interMarks: null,
  interTotal: 1100,
  entryTestScore: null,
  entryTestTotal: 200,
  targetField: 'Not Decided',
  targetUniversity: '',
  interests: [],
};

export const TABS = [
  {id: 'profile', iconName: 'person-outline', label: 'Profile'},
  {id: 'marks', iconName: 'analytics-outline', label: 'Marks'},
  {id: 'saved', iconName: 'heart-outline', label: 'Saved'},
  {id: 'settings', iconName: 'settings-outline', label: 'Settings'},
];

export const getTypeIconName = (type: SavedItem['type']) => {
  switch (type) {
    case 'university': return 'school-outline';
    case 'scholarship': return 'wallet-outline';
    case 'program': return 'library-outline';
  }
};
