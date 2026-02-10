/**
 * Scholarship filter configuration constants
 */

import type {FilterConfig} from '../types/scholarships';

export const typeFilters: FilterConfig[] = [
  {value: 'all', label: 'All', iconName: 'list-outline', gradient: ['#4573DF', '#4573DF']},
  {value: 'need_based', label: 'Need Based', iconName: 'wallet-outline', gradient: ['#10B981', '#059669']},
  {value: 'merit_based', label: 'Merit', iconName: 'trophy-outline', gradient: ['#F59E0B', '#D97706']},
  {value: 'hafiz_e_quran', label: 'Hafiz', iconName: 'book-outline', gradient: ['#4573DF', '#3660C9']},
  {value: 'government', label: 'Govt', iconName: 'business-outline', gradient: ['#4573DF', '#3660C9']},
  {value: 'private', label: 'Private', iconName: 'briefcase-outline', gradient: ['#4573DF', '#4573DF']},
];
