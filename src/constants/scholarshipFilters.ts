/**
 * Scholarship filter configuration constants
 */

import type {FilterConfig} from '../types/scholarships';

export const typeFilters: FilterConfig[] = [
  {value: 'all', label: 'All', iconName: 'list-outline', gradient: ['#4573DF', '#4573DF']},
  {value: 'need_based', label: 'Need Based', iconName: 'wallet-outline', gradient: ['#10B981', '#059669']},
  {value: 'merit_based', label: 'Merit', iconName: 'trophy-outline', gradient: ['#F59E0B', '#D97706']},
  {value: 'international', label: 'International', iconName: 'globe-outline', gradient: ['#DC2626', '#B91C1C']},
  {value: 'hafiz_e_quran', label: 'Hafiz', iconName: 'book-outline', gradient: ['#4573DF', '#3660C9']},
  {value: 'government', label: 'Govt', iconName: 'business-outline', gradient: ['#4573DF', '#3660C9']},
  {value: 'institutional', label: 'University', iconName: 'school-outline', gradient: ['#2563EB', '#1D4ED8']},
  {value: 'sports', label: 'Sports', iconName: 'football-outline', gradient: ['#EF4444', '#DC2626']},
  {value: 'disabled', label: 'Disabled', iconName: 'accessibility-outline', gradient: ['#6366F1', '#4F46E5']},
  {value: 'private', label: 'Private', iconName: 'briefcase-outline', gradient: ['#4573DF', '#4573DF']},
];
