/**
 * Merit Lists Service - Supabase Backend Integration
 * Historical merit data for universities
 */

import {supabase} from './supabase';
import {MERIT_RECORDS, AVAILABLE_YEARS, MERIT_CATEGORIES, MeritRecord} from '../data/meritArchive';
import {logger} from '../utils/logger';

export interface MeritListRecord {
  id: string;
  university_id: string;
  program_id: string | null;
  program_name: string;
  program_code: string | null;
  year: number;
  session: 'Fall' | 'Spring';
  merit_type: 'open' | 'self-finance' | 'reserved' | 'provincial';
  category: string;
  opening_merit: number | null;
  closing_merit: number;
  last_merit: number | null;
  total_seats: number | null;
  merit_seats: number | null;
  self_finance_seats: number | null;
  applicants: number | null;
  list_number: number;
  city: string | null;
  campus: string | null;
  created_at: string;
  // Joined fields
  university?: {
    name: string;
    short_name: string;
    type: string;
  };
}

export interface MeritTrendData {
  year: number;
  merit: number;
  listNumber?: number;
}

export interface UniversityMeritSummary {
  universityId: string;
  universityName: string;
  shortName: string;
  programs: {
    programName: string;
    category: string;
    years: MeritTrendData[];
    latestMerit: number;
    trend: 'up' | 'down' | 'stable';
    trendChange: number;
  }[];
}

/**
 * Fetch merit lists from Supabase with fallback to local data
 */
export async function fetchMeritLists(
  year?: number,
  category?: string
): Promise<{data: MeritRecord[]; error: Error | null; source: 'supabase' | 'local'}> {
  try {
    let query = supabase
      .from('merit_lists')
      .select(`
        *,
        university:universities(name, short_name, type)
      `)
      .order('closing_merit', {ascending: false});

    if (year) {
      query = query.eq('year', year);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const {data, error} = await query;

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      // Fallback to local data if Supabase is empty
      return {data: filterLocalMeritRecords(year, category), error: null, source: 'local'};
    }

    // Convert to MeritRecord format
    const records: MeritRecord[] = data.map(item => ({
      id: item.id,
      universityId: item.university_id,
      universityName: item.university?.name || '',
      universityShortName: item.university?.short_name || '',
      programName: item.program_name,
      programCode: item.program_code || undefined,
      year: item.year,
      session: item.session as 'Fall' | 'Spring',
      meritType: item.merit_type as 'open' | 'self-finance' | 'reserved',
      closingMerit: item.closing_merit,
      openingMerit: item.opening_merit || undefined,
      totalSeats: item.total_seats || 0,
      applicants: item.applicants || undefined,
      category: item.category,
      city: item.city || '',
      province: '',
    }));

    return {data: records, error: null, source: 'supabase'};
  } catch (error) {
    logger.error('Error fetching merit lists', error, 'MeritLists');
    // Fallback to local data
    return {data: filterLocalMeritRecords(year, category), error: error as Error, source: 'local'};
  }
}

/**
 * Filter local merit records
 */
function filterLocalMeritRecords(year?: number, category?: string): MeritRecord[] {
  let records = [...MERIT_RECORDS];

  if (year) {
    records = records.filter(r => r.year === year);
  }

  if (category && category !== 'all') {
    records = records.filter(r => r.category === category);
  }

  return records.sort((a, b) => b.closingMerit - a.closingMerit);
}

/**
 * Get merit trend for a specific university program
 */
export async function getMeritTrend(
  universityId: string,
  programName: string
): Promise<{data: MeritTrendData[]; error: Error | null}> {
  try {
    const {data, error} = await supabase
      .from('merit_lists')
      .select('year, closing_merit, list_number')
      .eq('university_id', universityId)
      .eq('program_name', programName)
      .order('year', {ascending: true});

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      // Fallback to local data
      const localTrend = MERIT_RECORDS
        .filter(r => r.universityId === universityId && r.programName === programName)
        .sort((a, b) => a.year - b.year)
        .map(r => ({year: r.year, merit: r.closingMerit}));

      return {data: localTrend, error: null};
    }

    return {
      data: data.map(item => ({
        year: item.year,
        merit: item.closing_merit,
        listNumber: item.list_number,
      })),
      error: null,
    };
  } catch (error) {
    logger.error('Error fetching merit trend', error, 'MeritLists');
    // Fallback to local data
    const localTrend = MERIT_RECORDS
      .filter(r => r.universityId === universityId && r.programName === programName)
      .sort((a, b) => a.year - b.year)
      .map(r => ({year: r.year, merit: r.closingMerit}));

    return {data: localTrend, error: error as Error};
  }
}

/**
 * Get merit summary for a university (all programs, all years)
 */
export async function getUniversityMeritSummary(
  universityId: string
): Promise<{data: UniversityMeritSummary | null; error: Error | null}> {
  try {
    const {data, error} = await supabase
      .from('merit_lists')
      .select(`
        *,
        university:universities(name, short_name)
      `)
      .eq('university_id', universityId)
      .order('year', {ascending: false});

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      // Fallback to local data
      return {data: getLocalUniversityMeritSummary(universityId), error: null};
    }

    // Group by program
    const programsMap = new Map<string, MeritListRecord[]>();
    data.forEach(item => {
      const existing = programsMap.get(item.program_name) || [];
      existing.push(item);
      programsMap.set(item.program_name, existing);
    });

    const programs = Array.from(programsMap.entries()).map(([programName, records]) => {
      const sortedRecords = records.sort((a, b) => b.year - a.year);
      const latestMerit = sortedRecords[0].closing_merit;
      const previousMerit = sortedRecords[1]?.closing_merit;
      const trendChange = previousMerit ? latestMerit - previousMerit : 0;

      return {
        programName,
        category: sortedRecords[0].category,
        years: sortedRecords.map(r => ({
          year: r.year,
          merit: r.closing_merit,
          listNumber: r.list_number,
        })).sort((a, b) => a.year - b.year),
        latestMerit,
        trend: (trendChange > 0.5 ? 'up' : trendChange < -0.5 ? 'down' : 'stable') as 'up' | 'down' | 'stable',
        trendChange,
      };
    });

    return {
      data: {
        universityId,
        universityName: data[0].university?.name || '',
        shortName: data[0].university?.short_name || '',
        programs,
      },
      error: null,
    };
  } catch (error) {
    logger.error('Error fetching university merit summary', error, 'MeritLists');
    return {data: getLocalUniversityMeritSummary(universityId), error: error as Error};
  }
}

/**
 * Get local university merit summary (fallback)
 */
function getLocalUniversityMeritSummary(universityId: string): UniversityMeritSummary | null {
  const records = MERIT_RECORDS.filter(r => r.universityId === universityId);

  if (records.length === 0) {
    return null;
  }

  // Group by program
  const programsMap = new Map<string, MeritRecord[]>();
  records.forEach(record => {
    const existing = programsMap.get(record.programName) || [];
    existing.push(record);
    programsMap.set(record.programName, existing);
  });

  const programs = Array.from(programsMap.entries()).map(([programName, programRecords]) => {
    const sortedRecords = programRecords.sort((a, b) => b.year - a.year);
    const latestMerit = sortedRecords[0].closingMerit;
    const previousMerit = sortedRecords[1]?.closingMerit;
    const trendChange = previousMerit ? latestMerit - previousMerit : 0;

    return {
      programName,
      category: sortedRecords[0].category,
      years: sortedRecords.map(r => ({
        year: r.year,
        merit: r.closingMerit,
      })).sort((a, b) => a.year - b.year),
      latestMerit,
      trend: (trendChange > 0.5 ? 'up' : trendChange < -0.5 ? 'down' : 'stable') as 'up' | 'down' | 'stable',
      trendChange,
    };
  });

  return {
    universityId,
    universityName: records[0].universityName,
    shortName: records[0].universityShortName,
    programs,
  };
}

/**
 * Get insights from merit data
 */
export function getMeritInsights(records: MeritRecord[], year: number) {
  const yearRecords = records.filter(r => r.year === year);

  if (yearRecords.length === 0) {
    return null;
  }

  const avgMerit = yearRecords.reduce((sum, r) => sum + r.closingMerit, 0) / yearRecords.length;
  const highestMerit = Math.max(...yearRecords.map(r => r.closingMerit));
  const lowestMerit = Math.min(...yearRecords.map(r => r.closingMerit));
  const totalPrograms = yearRecords.length;

  const highestProgram = yearRecords.find(r => r.closingMerit === highestMerit);
  const lowestProgram = yearRecords.find(r => r.closingMerit === lowestMerit);

  return {
    avgMerit,
    highestMerit,
    lowestMerit,
    totalPrograms,
    highestProgram,
    lowestProgram,
  };
}

/**
 * Get university merit summary by short name (synchronous, local data only)
 * Used for displaying merit history in university detail screen
 */
export function getUniversityMeritSummaryByShortName(
  records: MeritRecord[],
  universityShortName: string
): {
  programs: {
    programName: string;
    category: string;
    years: {year: number; closingMerit: number; list2Merit?: number; list3Merit?: number}[];
  }[];
  years: number[];
  totalRecords: number;
  trend: 'increasing' | 'decreasing' | 'stable' | null;
} {
  const uniRecords = records.filter(r => r.universityShortName === universityShortName);

  if (uniRecords.length === 0) {
    return {programs: [], years: [], totalRecords: 0, trend: null};
  }

  // Get all unique years
  const years = [...new Set(uniRecords.map(r => r.year))].sort((a, b) => b - a);

  // Group by program
  const programsMap = new Map<string, MeritRecord[]>();
  uniRecords.forEach(record => {
    const existing = programsMap.get(record.programName) || [];
    existing.push(record);
    programsMap.set(record.programName, existing);
  });

  const programs = Array.from(programsMap.entries()).map(([programName, programRecords]) => {
    const sortedRecords = programRecords.sort((a, b) => b.year - a.year);

    // Group by year to collect list merits
    const yearsMap = new Map<number, {closingMerit: number; list2Merit?: number; list3Merit?: number}>();
    sortedRecords.forEach(r => {
      const existing = yearsMap.get(r.year);
      if (!existing) {
        yearsMap.set(r.year, {closingMerit: r.closingMerit});
      }
      // If we have listNumber in data, use it for list2/list3
    });

    return {
      programName,
      category: sortedRecords[0].category,
      years: Array.from(yearsMap.entries())
        .map(([year, data]) => ({year, ...data}))
        .sort((a, b) => b.year - a.year),
    };
  });

  // Calculate overall trend
  let trend: 'increasing' | 'decreasing' | 'stable' | null = null;
  if (years.length >= 2) {
    const latestYearRecords = uniRecords.filter(r => r.year === years[0]);
    const prevYearRecords = uniRecords.filter(r => r.year === years[1]);

    if (latestYearRecords.length > 0 && prevYearRecords.length > 0) {
      const latestAvg = latestYearRecords.reduce((sum, r) => sum + r.closingMerit, 0) / latestYearRecords.length;
      const prevAvg = prevYearRecords.reduce((sum, r) => sum + r.closingMerit, 0) / prevYearRecords.length;
      const diff = latestAvg - prevAvg;

      if (diff > 1) trend = 'increasing';
      else if (diff < -1) trend = 'decreasing';
      else trend = 'stable';
    }
  }

  return {
    programs: programs.sort((a, b) => a.programName.localeCompare(b.programName)),
    years,
    totalRecords: uniRecords.length,
    trend,
  };
}

/**
 * Get yearly trend data (average merit by year)
 * Returns data sorted oldest-to-newest for chart display (left-to-right)
 */
export function getYearlyTrendData(records: MeritRecord[]) {
  // Sort years ascending (oldest to newest) for proper chart display
  const sortedYears = [...AVAILABLE_YEARS].sort((a, b) => a - b);
  
  return sortedYears.map(year => {
    const yearRecords = records.filter(r => r.year === year);
    if (yearRecords.length === 0) {
      return {year, merit: 0, count: 0};
    }

    const avgMerit = yearRecords.reduce((sum, r) => sum + r.closingMerit, 0) / yearRecords.length;
    return {year, merit: parseFloat(avgMerit.toFixed(1)), count: yearRecords.length};
  }).filter(d => d.count > 0);
}

// Re-export constants
export {AVAILABLE_YEARS, MERIT_CATEGORIES};
