/**
 * Merit Archive - Types, helpers, and data re-exports
 * Data is stored in JSON files for easier maintenance:
 *   - meritRecords.json (2255 records, 259 universities)
 *   - quotaMeritRecords.json (~130 quota/reserved seat records)
 *   - universityMeritInfo.json (259 universities)
 */

import meritRecordsJson from './meritRecords.json';
import quotaMeritRecordsJson from './quotaMeritRecords.json';
import universityMeritInfoJson from './universityMeritInfo.json';
export { ENTRY_TESTS_META, UNIVERSITY_FORMULAS, QUOTA_TYPES, calculateAggregate, assessChanceAgainstMerit, detectPotentialQuotas, getFormulaForUniversity } from '../utils/meritCalculator';
export { UNIVERSITY_FEES, getUniversityFees, getProgramFee, formatFeeShort, estimateTotalCost } from './feesData';

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
  /**
   * Sub-type for reserved/special seats.
   * 'women' | 'fata_pata' | 'balochistan' | 'ajk' | 'disabled' | 'hafiz' | 'sports' | 'army' | 'nrp'
   */
  quotaType?: string;
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

/** Open + self-finance merit records (all records) */
export const OPEN_MERIT_RECORDS: MeritRecord[] = (
  Array.isArray(meritRecordsJson)
    ? meritRecordsJson
    : (meritRecordsJson as { merit_records: MeritRecord[] }).merit_records
) as unknown as MeritRecord[];

/** Reserved / quota seat merit records (~130 records) */
export const QUOTA_MERIT_RECORDS: MeritRecord[] = (
  Array.isArray(quotaMeritRecordsJson)
    ? quotaMeritRecordsJson
    : (quotaMeritRecordsJson as { merit_records: MeritRecord[] }).merit_records
) as unknown as MeritRecord[];

/** All merit records combined (open + self-finance + reserved) */
export const MERIT_RECORDS: MeritRecord[] = [...OPEN_MERIT_RECORDS, ...QUOTA_MERIT_RECORDS];

export const UNIVERSITY_MERIT_INFO: Record<string, UniversityMeritInfo> =
  universityMeritInfoJson as Record<string, UniversityMeritInfo>;

// ============================================================================
// CONSTANTS
// ============================================================================

export const AVAILABLE_YEARS = [2025, 2024, 2023, 2022, 2021, 2020];

export const QUOTA_TYPE_LABELS: Record<string, string> = {
  open: 'Open Merit',
  'self-finance': 'Self-Finance',
  women: 'Women Quota',
  fata_pata: 'FATA/PATA Quota',
  balochistan: 'Balochistan Quota',
  ajk: 'AJK Quota',
  disabled: 'Special Persons',
  hafiz: 'Hafiz-e-Quran',
  sports: 'Sports Quota',
  army: 'Armed Forces',
  nrp: 'Overseas Pakistani (NRP)',
};

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

/**
 * Get all quota/reserved seat records for a university.
 * Returns records grouped by quotaType.
 */
export function getQuotaRecords(
  universityId: string,
  year?: number,
): Record<string, MeritRecord[]> {
  const filtered = QUOTA_MERIT_RECORDS.filter(
    r =>
      r.universityId.toLowerCase() === universityId.toLowerCase() &&
      (year === undefined || r.year === year),
  );

  const grouped: Record<string, MeritRecord[]> = {};
  filtered.forEach(r => {
    const key = r.quotaType ?? r.meritType;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  return grouped;
}

/**
 * Given a user's quota types (from detectPotentialQuotas) and a university,
 * find the best (lowest closing merit) record they may qualify for.
 */
export function getBestQuotaRecord(
  universityId: string,
  programKeyword: string,
  userQuotaIds: string[],
  year: number = 2025,
): MeritRecord | null {
  const candidates = MERIT_RECORDS.filter(r => {
    if (r.universityId.toLowerCase() !== universityId.toLowerCase()) return false;
    if (r.year !== year) return false;
    if (!r.programName.toLowerCase().includes(programKeyword.toLowerCase())) return false;
    const quotaId = r.quotaType ?? 'open';
    return userQuotaIds.includes(quotaId) || r.meritType === 'self-finance';
  });

  if (candidates.length === 0) return null;
  // Return the one with the lowest closing merit (easiest to get into)
  return candidates.sort((a, b) => a.closingMerit - b.closingMerit)[0];
}

/**
 * Get self-finance record for a program (if exists).
 */
export function getSelfFinanceRecord(
  universityId: string,
  programKeyword: string,
  year: number = 2025,
): MeritRecord | null {
  const records = MERIT_RECORDS.filter(
    r =>
      r.universityId.toLowerCase() === universityId.toLowerCase() &&
      r.meritType === 'self-finance' &&
      r.programName.toLowerCase().includes(programKeyword.toLowerCase()) &&
      r.year === year,
  );
  return records.length > 0 ? records.sort((a, b) => b.year - a.year)[0] : null;
}

export default MERIT_RECORDS;