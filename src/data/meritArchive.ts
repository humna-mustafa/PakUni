/**
 * Merit Archive - Types, helpers, and data re-exports
 * Data is stored in JSON files for easier maintenance:
 *   - meritRecords.json (2255 records, 259 universities)
 *   - universityMeritInfo.json (259 universities)
 */

import meritRecordsJson from './meritRecords.json';
import universityMeritInfoJson from './universityMeritInfo.json';

// ============================================================================
// TYPES
// ============================================================================

export interface MeritRecord {
  id: string;
  universityId: string;
  universityName: string;
  universityShortName: string;
  programName: string;
  programCode?: string;
  campus: string;
  year: number;
  session: 'Fall' | 'Spring';
  meritType: 'open' | 'self-finance' | 'reserved';
  closingMerit: number;
  openingMerit?: number;
  totalSeats: number;
  applicants?: number;
  category: string;
  city: string;
  province: string;
}

export interface YearlyTrend {
  year: number;
  merit: number;
}

export type MeritDataStatus =
  | 'available'
  | 'portal_only'
  | 'not_available'
  | 'limited';

export interface UniversityMeritInfo {
  universityId: string;
  shortName: string;
  status: MeritDataStatus;
  portalUrl?: string;
  note?: string;
  admissionUrl?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };
}

// ============================================================================
// DATA (loaded from JSON)
// ============================================================================

export const MERIT_RECORDS: MeritRecord[] = meritRecordsJson as MeritRecord[];

export const UNIVERSITY_MERIT_INFO: Record<string, UniversityMeritInfo> =
  universityMeritInfoJson as Record<string, UniversityMeritInfo>;

// ============================================================================
// CONSTANTS
// ============================================================================

export const AVAILABLE_YEARS = [2025, 2024, 2023, 2022, 2021, 2020];

export const MERIT_CATEGORIES = [
  {id: 'all', name: 'All Fields', iconName: 'apps-outline'},
  {id: 'medical', name: 'Medical', iconName: 'medkit-outline'},
  {id: 'engineering', name: 'Engineering', iconName: 'construct-outline'},
  {id: 'computer-science', name: 'Computer Science', iconName: 'code-slash-outline'},
  {id: 'business', name: 'Business', iconName: 'briefcase-outline'},
  {id: 'general', name: 'General', iconName: 'school-outline'},
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Get merit trend for a specific university/program combination */
export function getMeritTrend(
  universityId: string,
  programName: string,
): YearlyTrend[] {
  return MERIT_RECORDS.filter(
    r => r.universityId === universityId && r.programName === programName,
  )
    .map(r => ({year: r.year, merit: r.closingMerit}))
    .sort((a, b) => a.year - b.year);
}

/** Get yearly change for a university/program (most recent year vs previous) */
export function getYearlyChange(
  universityId: string,
  programName: string,
): number | null {
  const records = MERIT_RECORDS.filter(
    r => r.universityId === universityId && r.programName === programName,
  ).sort((a, b) => b.year - a.year);

  if (records.length < 2) return null;
  return records[0].closingMerit - records[1].closingMerit;
}

/** Search merit records by query */
export function searchMeritRecords(query: string): MeritRecord[] {
  const lowerQuery = query.toLowerCase();
  return MERIT_RECORDS.filter(
    r =>
      r.universityName.toLowerCase().includes(lowerQuery) ||
      r.universityShortName.toLowerCase().includes(lowerQuery) ||
      r.programName.toLowerCase().includes(lowerQuery) ||
      r.city.toLowerCase().includes(lowerQuery),
  );
}

/** Get highest merit programs for a given year */
export function getHighestMeritPrograms(
  year: number,
  limit: number = 10,
): MeritRecord[] {
  return MERIT_RECORDS.filter(r => r.year === year)
    .sort((a, b) => b.closingMerit - a.closingMerit)
    .slice(0, limit);
}

/** Get lowest merit programs for a given year (easier admission) */
export function getLowestMeritPrograms(
  year: number,
  limit: number = 10,
): MeritRecord[] {
  return MERIT_RECORDS.filter(r => r.year === year)
    .sort((a, b) => a.closingMerit - b.closingMerit)
    .slice(0, limit);
}

export default MERIT_RECORDS;