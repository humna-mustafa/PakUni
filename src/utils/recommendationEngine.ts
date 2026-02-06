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

export interface MatchBreakdown {
  cityMatch: boolean;
  programMatch: boolean;
  typeMatch: boolean;
  academicTier: string;
  meetsMinimum: boolean;
}

export interface UniversityRecommendation extends UniversityData {
  matchScore: number;
  matchedPrograms: ProgramData[];
  matchReasons: string[];
  estimatedFeeRange: string; // e.g., "75k - 90k PKR / Semester"
  tier: number;
  matchBreakdown: MatchBreakdown;
  isReachSchool: boolean;
}

// === UNIVERSITY TIER DEFINITIONS ===
// Tier 1: Elite universities (90%+ marks recommended)
const TIER_1_UNIVERSITIES = [
  'NUST', 'LUMS', 'GIKI', 'AKU', 'PIEAS', 'IBA', 'QAU', 'GCU', 'KEMU', 'AIMC',
  'ITU', 'NCA', 'DUHS', 'IST', 'NDU', 'UET', 'NEDUET'
];

// Tier 2: Highly reputable universities (75-89% marks)
const TIER_2_UNIVERSITIES = [
  'COMSATS', 'NU', 'FAST', 'UCP', 'BAHRIA', 'BNU', 'SZABIST', 'UMT', 'PU',
  'UOK', 'NUML', 'MUET', 'LSE', 'FCC', 'LCWU', 'FJWU', 'GCUF', 'STMU',
  'RIPHAH', 'BUITEMS', 'KMU', 'UHS', 'UAF', 'NTU', 'PIDE', 'FUI', 'CUST'
];

// Tier 3: Good regional universities (60-74% marks)
const TIER_3_UNIVERSITIES = [
  'UOL', 'IQRA', 'BZU', 'UOS', 'IUB', 'UOP', 'ISRA', 'VU', 'AIOU',
  'FUUAST', 'USINDH', 'UOB', 'AWKUM', 'AUST', 'UETP', 'UETT', 'KINNAIRD',
  'CMH', 'CMHLMC', 'FMH', 'RIU', 'ABASYN'
];

// Tier 4: Entry-level universities (<60% marks)
// All remaining universities

// Program categories for broader matching
const PROGRAM_CATEGORIES: Record<string, string[]> = {
  'Engineering': ['engineering', 'electrical', 'mechanical', 'civil', 'chemical', 'software', 'computer engineering', 'mechatronics', 'aerospace', 'automotive'],
  'Computer Science': ['computer science', 'software', 'it', 'information technology', 'data science', 'ai', 'artificial intelligence', 'cyber security', 'computing'],
  'Medical': ['medical', 'mbbs', 'bds', 'pharmacy', 'pharm', 'nursing', 'physiotherapy', 'dpt', 'health'],
  'Business': ['business', 'bba', 'mba', 'commerce', 'accounting', 'finance', 'marketing', 'management', 'economics'],
  'Law': ['law', 'llb', 'legal', 'jurisprudence'],
  'Arts': ['arts', 'fine arts', 'design', 'architecture', 'media', 'journalism', 'mass communication']
};

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
 * Get university tier (1-4) based on short_name
 */
const getUniversityTier = (shortName: string): number => {
  const normalized = shortName.toUpperCase();
  if (TIER_1_UNIVERSITIES.includes(normalized)) return 1;
  if (TIER_2_UNIVERSITIES.includes(normalized)) return 2;
  if (TIER_3_UNIVERSITIES.includes(normalized)) return 3;
  return 4;
};

/**
 * Get academic tier based on percentage
 */
const getAcademicTier = (percentage: number): { tier: number; label: string } => {
  if (percentage >= 90) return { tier: 1, label: 'Excellent (90%+)' };
  if (percentage >= 75) return { tier: 2, label: 'Very Good (75-89%)' };
  if (percentage >= 60) return { tier: 3, label: 'Good (60-74%)' };
  return { tier: 4, label: 'Needs Improvement (<60%)' };
};

/**
 * Check if university offers programs in given categories
 */
const universityOffersProgram = (uniShortName: string, programCategories: string[]): boolean => {
  if (programCategories.length === 0) return true;
  
  const normalizedUni = uniShortName.toUpperCase();
  
  // Check if any program lists this university and matches categories
  return PROGRAMS.some(program => {
    const programUnis = program.universities.map(u => {
      const mapped = PROGRAM_TO_UNIVERSITY_MAP[u];
      return mapped ? mapped.toUpperCase() : u.toUpperCase();
    });
    
    if (!programUnis.includes(normalizedUni)) return false;
    
    // Check if program matches any of the selected categories
    return programCategories.some(cat => {
      const keywords = PROGRAM_CATEGORIES[cat] || [normalize(cat)];
      return keywords.some(keyword => 
        normalize(program.field).includes(keyword) ||
        normalize(program.name).includes(keyword) ||
        normalize(program.degree_title).includes(keyword)
      );
    });
  });
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
 * IMPROVED: Tiered recommendations, better scoring, expanded results
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
  const academicLevel = getAcademicTier(currentPercentage);
  
  // Helper to find university by short name, name, or alias
  const findUniversity = (shortName: string): UniversityData | undefined => {
    const normalized = normalize(shortName);
    
    // First check the program-to-university mapping
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
    
    // If not found, try alias lookup
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

  // ============================================
  // STEP 1: Build program-to-university mapping
  // ============================================
  const universityMap = new Map<string, {
    uni: UniversityData;
    programs: ProgramData[];
    reasons: Set<string>;
  }>();

  // Find programs matching user preferences AND eligibility
  const relevantPrograms = PROGRAMS.filter((program) => {
    // Must meet minimum percentage with some flexibility for reach schools
    const meetsMinimum = currentPercentage >= program.min_percentage;
    const isReachSchool = currentPercentage >= (program.min_percentage - 10) && !meetsMinimum;
    
    if (!meetsMinimum && !isReachSchool) return false;

    // Check program preference match
    if (preferredPrograms.length === 0) return true;
    
    return preferredPrograms.some(pref => {
      const keywords = PROGRAM_CATEGORIES[pref] || [normalize(pref)];
      return keywords.some(keyword =>
        normalize(program.field).includes(keyword) ||
        normalize(program.name).includes(keyword) ||
        normalize(program.degree_title).includes(keyword)
      );
    });
  });

  // Map programs to universities
  relevantPrograms.forEach((program) => {
    program.universities.forEach((uniShortName) => {
      const university = findUniversity(uniShortName);
      if (!university) return;

      if (!universityMap.has(university.short_name)) {
        universityMap.set(university.short_name, {
          uni: university,
          programs: [],
          reasons: new Set(),
        });
      }

      const entry = universityMap.get(university.short_name)!;
      if (!entry.programs.find(p => p.id === program.id)) {
        entry.programs.push(program);
      }
    });
  });

  // ============================================
  // STEP 2: Add tier-based universities for excellent marks
  // ============================================
  // For students with excellent marks, ensure all top-tier universities appear
  
  const addTieredUniversities = (tierList: string[], label: string) => {
    tierList.forEach(shortName => {
      const uni = UNIVERSITIES.find(u => 
        u.short_name.toUpperCase() === shortName ||
        normalize(u.short_name) === normalize(shortName)
      );
      
      if (!uni) return;
      
      // Check if already in map
      if (universityMap.has(uni.short_name)) return;
      
      // Check type filter
      if (universityType !== 'Both') {
        if (universityType === 'Public' && uni.type !== 'public') return;
        if (universityType === 'Private' && uni.type !== 'private') return;
      }
      
      // Check if university offers any of the preferred programs
      const hasRelevantPrograms = universityOffersProgram(uni.short_name, preferredPrograms);
      
      if (hasRelevantPrograms) {
        universityMap.set(uni.short_name, {
          uni,
          programs: [],
          reasons: new Set([`${label} university`]),
        });
      }
    });
  };

  // Add universities based on academic tier
  if (academicLevel.tier === 1) {
    // 90%+ marks: Show ALL Tier 1 and Tier 2 universities
    addTieredUniversities(TIER_1_UNIVERSITIES, 'Top-tier');
    addTieredUniversities(TIER_2_UNIVERSITIES, 'Highly reputable');
  } else if (academicLevel.tier === 2) {
    // 75-89%: Show Tier 2 + some Tier 1 as reach
    addTieredUniversities(TIER_2_UNIVERSITIES, 'Highly reputable');
    addTieredUniversities(TIER_1_UNIVERSITIES, 'Reach school'); // Added as reach
  } else if (academicLevel.tier === 3) {
    // 60-74%: Show Tier 3 + some Tier 2 as reach
    addTieredUniversities(TIER_3_UNIVERSITIES, 'Good regional');
    addTieredUniversities(TIER_2_UNIVERSITIES, 'Reach school');
  }

  // ============================================
  // STEP 3: Score and build recommendations
  // ============================================
  const recommendations: UniversityRecommendation[] = [];

  universityMap.forEach((entry) => {
    const { uni, programs, reasons } = entry;
    const uniTier = getUniversityTier(uni.short_name);
    
    // Calculate match breakdown
    const cityMatch = preferredCities.length === 0 || preferredCities.some(
      city => normalize(city) === normalize(uni.city) ||
              normalize(uni.city).includes(normalize(city)) ||
              normalize(city).includes(normalize(uni.city))
    );
    
    const programMatch = programs.length > 0 || universityOffersProgram(uni.short_name, preferredPrograms);
    
    const typeMatch = universityType === 'Both' || 
                     (universityType === 'Public' && uni.type === 'public') ||
                     (universityType === 'Private' && uni.type === 'private');
    
    // Skip if type doesn't match
    if (!typeMatch) return;
    
    const isReachSchool = uniTier < academicLevel.tier;
    const meetsAcademicReq = uniTier >= academicLevel.tier || academicLevel.tier === 1;
    
    // Calculate score (0-100)
    let score = 40; // Base score
    
    // Academic tier bonus (+30 max)
    if (academicLevel.tier === 1 && uniTier <= 2) score += 30;
    else if (academicLevel.tier === 2 && uniTier === 2) score += 25;
    else if (academicLevel.tier <= uniTier) score += 20;
    else score += 10; // Reach school
    
    // City match bonus (+20)
    if (cityMatch && preferredCities.length > 0) {
      score += 20;
      reasons.add(`📍 Located in ${uni.city}`);
    }
    
    // Program match bonus (+15)
    if (programMatch && programs.length > 0) {
      score += 15;
      const programNames = programs.slice(0, 2).map(p => p.degree_title).join(', ');
      reasons.add(`🎓 Offers: ${programNames}${programs.length > 2 ? '...' : ''}`);
    } else if (programMatch) {
      score += 10;
      reasons.add(`🎓 Offers programs in your field`);
    }
    
    // Type match bonus (+10)
    if (universityType !== 'Both' && typeMatch) {
      score += 10;
      reasons.add(`✓ ${uni.type.charAt(0).toUpperCase() + uni.type.slice(1)} university`);
    }
    
    // HEC ranking bonus (+10)
    if (uni.ranking_hec === 'W4' || (uni.ranking_national && uni.ranking_national <= 10)) {
      score += 5;
      reasons.add('⭐ HEC Top Ranked');
    }
    
    // Multiple programs bonus (+5)
    if (programs.length > 2) {
      score += 5;
      reasons.add(`📚 ${programs.length} matching programs available`);
    }
    
    // Tier indicator
    if (uniTier === 1) {
      reasons.add('🏆 Tier 1 - Elite University');
    } else if (uniTier === 2) {
      reasons.add('🥇 Tier 2 - Highly Reputable');
    } else if (uniTier === 3) {
      reasons.add('🥈 Tier 3 - Good Regional University');
    }
    
    // Reach school indicator
    if (isReachSchool) {
      reasons.add('🎯 Reach School - Competitive Admission');
    }
    
    // Cap score
    score = Math.min(score, 100);
    
    const matchBreakdown: MatchBreakdown = {
      cityMatch,
      programMatch,
      typeMatch,
      academicTier: academicLevel.label,
      meetsMinimum: meetsAcademicReq,
    };

    recommendations.push({
      ...uni,
      matchScore: score,
      matchedPrograms: programs,
      matchReasons: Array.from(reasons),
      estimatedFeeRange: formatFeeRange(programs),
      tier: uniTier,
      matchBreakdown,
      isReachSchool,
    });
  });

  // ============================================
  // STEP 4: Sort by score, tier, then alphabetically
  // ============================================
  return recommendations.sort((a, b) => {
    // Primary: Higher score first
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    // Secondary: Lower tier (better) first
    if (a.tier !== b.tier) {
      return a.tier - b.tier;
    }
    // Tertiary: Alphabetical
    return a.name.localeCompare(b.name);
  });
};
