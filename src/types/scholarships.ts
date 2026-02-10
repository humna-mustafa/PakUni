/**
 * Types for Scholarships Screen
 */

import type {ScholarshipData} from '../data/scholarships';

export type FilterType = 'all' | 'need_based' | 'merit_based' | 'hafiz_e_quran' | 'government' | 'private';

export interface FilterConfig {
  value: FilterType;
  label: string;
  iconName: string;
  gradient: string[];
}

export type {ScholarshipData};
