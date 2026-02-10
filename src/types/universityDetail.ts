/**
 * Types for University Detail Screen
 */

export type TabType = 'overview' | 'programs' | 'admission' | 'scholarships' | 'merits';

export interface TabConfig {
  key: TabType;
  label: string;
  iconName: string;
}

export interface MeritYearData {
  year: number;
  closingMerit: number;
  list2Merit?: number;
  list3Merit?: number;
}

export interface MeritProgramData {
  programName: string;
  category: string;
  years: MeritYearData[];
}

/** Campus-level grouping of programs and their merit data */
export interface MeritCampusData {
  campus: string;
  programs: MeritProgramData[];
}

export interface MeritSummary {
  programs: MeritProgramData[];
  /** Campus-based grouping: Campus → Programs → Years */
  campuses: MeritCampusData[];
  years: number[];
  totalRecords: number;
  trend: 'increasing' | 'decreasing' | 'stable' | null;
}

export interface UniversityDetailProps {
  colors: any;
  isDark: boolean;
}
