import { UNIVERSITIES, UniversityData } from '../data/universities';
import { PROGRAMS, ProgramData } from '../data/programs';
import { findUniversitiesByAlias, normalizeSearchTerm, PROGRAM_TO_UNIVERSITY_MAP } from './universityAliases';

export interface RecommendationCriteria {
  matricMarks: number;
  matricTotal: number;
  interMarks: number;
  interTotal: number;
  entryTestScore?: number;
  entryTestTotal?: number;
  preferredPrograms: string[]; // e.g., ['Computer Science', 'Medical']
  preferredCities: string[]; // e.g., ['Lahore', 'Islamabad']
  universityType: 'Public' | 'Private' | 'Both';
}

export interface UniversityRecommendation extends UniversityData {
  matchScore: number;
  matchedPrograms: ProgramData[];
  matchReasons: string[];
  estimatedFeeRange: string; // e.g., "75k - 90k PKR / Semester"
}

/**
 * Normalizes text for comparison (lowercase, trimmed)
 */
const normalize = (text: string) => text.toLowerCase().trim();

/**
 * Calculates percentage
 */
const calculatePercentage = (obtained: number, total: number) => {
  if (total === 0) return 0;
  return (obtained / total) * 100;
};

/**
 * Helper to format fee range
 */
const formatFeeRange = (programs: ProgramData[]): string => {
  if (programs.length === 0) return 'Fee info unavailable';
  
  const fees = programs.map(p => p.avg_fee_per_semester).filter(f => f > 0);
  if (fees.length === 0) return 'Varies by program';

  const min = Math.min(...fees);
  const max = Math.max(...fees);

  const formatK = (num: number) => `${Math.round(num / 1000)}k`;

  // If only one fee or min equals max
  if (min === max) {
    return `${formatK(min)} PKR / Sem`;
  }

  return `${formatK(min)} - ${formatK(max)} PKR / Sem`;
};

/**
 * Generates university recommendations based on user criteria
 */
export const getRecommendations = (
  criteria: RecommendationCriteria
): UniversityRecommendation[] => {
  const {
    matricMarks,
    matricTotal,
    interMarks,
    interTotal,
    preferredPrograms,
    preferredCities,
    universityType,
  } = criteria;

  const currentPercentage = calculatePercentage(interMarks, interTotal);
  
  // 1. Find relevant programs based on preferences and eligibility
  const relevantPrograms = PROGRAMS.filter((program) => {
    // Check academic eligibility (min percentage)
    if (currentPercentage < program.min_percentage) {
      return false;
    }

    // Check if program matches user preferences
    if (preferredPrograms.length === 0) return true; // No preference implies all
    
    return preferredPrograms.some(pref => {
      const p = normalize(pref);
      return (
        normalize(program.field).includes(p) ||
        normalize(program.name).includes(p) ||
        normalize(program.degree_title).includes(p)
      );
    });
  });

  // 2. Map programs to universities
  const universityMap = new Map<string, {
    uni: UniversityData;
    programs: ProgramData[];
    reasons: Set<string>;
    score: number;
  }>();

  // Helper to find university by short name, name, or alias
  const findUniversity = (shortName: string) => {
    const normalized = normalize(shortName);
    
    // First check the program-to-university mapping (for programs.ts compatibility)
    const mappedShortName = PROGRAM_TO_UNIVERSITY_MAP[shortName];
    if (mappedShortName) {
      const found = UNIVERSITIES.find(u => normalize(u.short_name) === normalize(mappedShortName));
      if (found) return found;
    }
    
    // Then try direct match
    let found = UNIVERSITIES.find(
      (u) =>
        normalize(u.short_name) === normalized ||
        normalize(u.name) === normalized
    );
    
    // If not found, try alias lookup (e.g., "NUST" -> "NST")
    if (!found) {
      const possibleShortNames = findUniversitiesByAlias(shortName);
      if (possibleShortNames.length > 0) {
        found = UNIVERSITIES.find(u => 
          possibleShortNames.includes(u.short_name)
        );
      }
    }
    
    return found;
  };

  relevantPrograms.forEach((program) => {
    program.universities.forEach((uniShortName) => {
      const university = findUniversity(uniShortName);
      
      if (!university) {
        // console.warn(`Data Mismatch...`); // Silence generic warning
        return;
      }

      // Initialize map entry if new
      if (!universityMap.has(university.short_name)) {
        universityMap.set(university.short_name, {
          uni: university,
          programs: [],
          reasons: new Set(),
          score: 60, // Base score
        });
      }

      const entry = universityMap.get(university.short_name)!;
      
      // Add program if unique
      if (!entry.programs.find(p => p.id === program.id)) {
        entry.programs.push(program);
      }
    });
  });

  // 3. Filter and Score Universities
  const recommendations: UniversityRecommendation[] = [];

  universityMap.forEach((entry) => {
    const { uni, programs, reasons } = entry;
    let { score } = entry;

    // Filter by Type
    if (universityType !== 'Both') {
      if (normalize(uni.type) !== normalize(universityType)) {
        if (universityType === 'Public' && uni.type !== 'public') return;
        if (universityType === 'Private' && uni.type !== 'private') return;
      } else {
        score += 10;
        reasons.add(`Matches type preference (${universityType})`);
      }
    }

    // Filter/Boost by City
    if (preferredCities.length > 0) {
      const isPreferredCity = preferredCities.some(
        (city) => normalize(city) === normalize(uni.city)
      );
      
      if (isPreferredCity) {
        score += 20;
        reasons.add(`Located in preferred city (${uni.city})`);
      } else {
        // If cities are strictly enforced, we could filter out here. 
        // For now, we just don't give the bonus, or penalize slightly.
        // Let's keep it inclusive but lower ranked.
      }
    }

    // Boost by HEC Ranking
    if (uni.ranking_hec === 'W4' || (uni.ranking_national && uni.ranking_national <= 10)) {
      score += 10;
      reasons.add('Top Ranked / HEC W4 Category');
    }

    // Boost by Program Fit (if they have multiple matching programs)
    if (programs.length > 1) {
      score += 5;
      reasons.add(`Offers ${programs.length} programs matching your interests`);
    }

    // Add specific program names to reasons
    if (programs.length > 0) {
        reasons.add(`Offers: ${programs.map(p => p.degree_title).slice(0, 3).join(', ')}${programs.length > 3 ? '...' : ''}`);
    }

    // Verify fee availability
    const estimatedFeeRange = formatFeeRange(programs);

    // Cap score at 100
    score = Math.min(score, 100);

    recommendations.push({
      ...uni,
      matchScore: score,
      matchedPrograms: programs,
      matchReasons: Array.from(reasons),
      estimatedFeeRange,
    });
  });

  // Sort by match score
  return recommendations.sort((a, b) => b.matchScore - a.matchScore);
};
