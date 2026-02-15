import { UNIVERSITIES, UniversityData } from '../data/universities';
import { PROGRAMS, ProgramData } from '../data/programs';
import { findUniversitiesByAlias, normalizeSearchTerm, PROGRAM_TO_UNIVERSITY_MAP } from './universityAliases';
import { MERIT_RECORDS, MeritRecord } from '../data/meritArchive';

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
  preferredSession?: 'Fall' | 'Spring' | 'Both'; // NEW: Session preference
}

export interface MatchBreakdown {
  cityMatch: boolean;
  programMatch: boolean;
  typeMatch: boolean;
  academicTier: string;
  meetsMinimum: boolean;
  meritBased: boolean; // NEW: Whether recommendation is based on merit data
  sessionMatch: boolean; // NEW: Whether session matches
}

export interface MeritInsight {
  closingMerit: number;
  openingMerit?: number;
  year: number;
  session: 'Fall' | 'Spring';
  trend: 'rising' | 'stable' | 'falling' | 'unknown';
  chanceLevel: 'excellent' | 'good' | 'moderate' | 'low' | 'very_low';
}

export interface UniversityRecommendation extends UniversityData {
  matchScore: number;
  matchedPrograms: ProgramData[];
  matchReasons: string[];
  estimatedFeeRange: string; // e.g., "75k - 90k PKR / Semester"
  tier: number;
  matchBreakdown: MatchBreakdown;
  isReachSchool: boolean;
  meritInsight?: MeritInsight; // NEW: Merit-based insight
  availableSessions: ('Fall' | 'Spring')[]; // NEW: Available sessions
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

// ============================================================================
// MERIT-BASED HELPER FUNCTIONS (NEW)
// ============================================================================

/**
 * Get recent merit records for a university (last 3 years, sorted by year desc)
 */
const getRecentMeritRecords = (
  universityShortName: string,
  session?: 'Fall' | 'Spring' | 'Both'
): MeritRecord[] => {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 3;
  
  return MERIT_RECORDS.filter(r => {
    const matchesUni = normalize(r.universityShortName) === normalize(universityShortName) ||
                       normalize(r.universityId) === normalize(universityShortName);
    const matchesYear = r.year >= minYear;
    const matchesSession = !session || session === 'Both' || r.session === session;
    return matchesUni && matchesYear && matchesSession;
  }).sort((a, b) => b.year - a.year);
};

/**
 * Get merit records for specific program at university
 */
const getProgramMeritRecords = (
  universityShortName: string,
  programKeywords: string[],
  session?: 'Fall' | 'Spring' | 'Both'
): MeritRecord[] => {
  const recentRecords = getRecentMeritRecords(universityShortName, session);
  
  if (programKeywords.length === 0) return recentRecords;
  
  return recentRecords.filter(r => {
    const programLower = normalize(r.programName);
    return programKeywords.some(kw => programLower.includes(normalize(kw)));
  });
};

/**
 * Calculate admission chance based on user marks vs historical merit
 */
const calculateAdmissionChance = (
  userPercentage: number,
  closingMerit: number
): MeritInsight['chanceLevel'] => {
  const diff = userPercentage - closingMerit;
  
  if (diff >= 5) return 'excellent';    // 5%+ above closing merit
  if (diff >= 0) return 'good';          // At or above closing merit
  if (diff >= -3) return 'moderate';     // Within 3% of closing merit
  if (diff >= -8) return 'low';          // 3-8% below closing merit
  return 'very_low';                      // More than 8% below
};

/**
 * Determine merit trend over years
 */
const calculateMeritTrend = (records: MeritRecord[]): MeritInsight['trend'] => {
  if (records.length < 2) return 'unknown';
  
  const sortedByYear = [...records].sort((a, b) => b.year - a.year);
  const recentMerit = sortedByYear[0].closingMerit;
  const olderMerit = sortedByYear[sortedByYear.length - 1].closingMerit;
  
  const change = recentMerit - olderMerit;
  
  if (change > 2) return 'rising';   // Merit increasing (harder to get in)
  if (change < -2) return 'falling'; // Merit decreasing (easier)
  return 'stable';
};

/**
 * Get available sessions for a university based on merit records
 */
const getAvailableSessions = (universityShortName: string): ('Fall' | 'Spring')[] => {
  const records = getRecentMeritRecords(universityShortName, 'Both');
  const sessions = new Set<'Fall' | 'Spring'>();
  records.forEach(r => sessions.add(r.session));
  return Array.from(sessions);
};

/**
 * Calculate merit-based score for a university/program combination
 */
const getMeritBasedScore = (
  userPercentage: number,
  universityShortName: string,
  programKeywords: string[],
  session?: 'Fall' | 'Spring' | 'Both'
): { score: number; insight?: MeritInsight } => {
  const meritRecords = getProgramMeritRecords(universityShortName, programKeywords, session);
  
  if (meritRecords.length === 0) {
    // No merit data available - return neutral score
    return { score: 50 };
  }
  
  // Get most recent record
  const latestRecord = meritRecords[0];
  const closingMerit = latestRecord.closingMerit;
  const chanceLevel = calculateAdmissionChance(userPercentage, closingMerit);
  const trend = calculateMeritTrend(meritRecords);
  
  // Calculate score based on chance level
  let score: number;
  switch (chanceLevel) {
    case 'excellent': score = 95; break;
    case 'good': score = 80; break;
    case 'moderate': score = 65; break;
    case 'low': score = 45; break;
    case 'very_low': score = 25; break;
  }
  
  // Adjust score based on trend
  if (trend === 'falling') score += 5; // Easier to get in
  if (trend === 'rising') score -= 5;  // Harder to get in
  
  const insight: MeritInsight = {
    closingMerit,
    openingMerit: latestRecord.openingMerit,
    year: latestRecord.year,
    session: latestRecord.session,
    trend,
    chanceLevel,
  };
  
  return { score: Math.min(100, Math.max(0, score)), insight };
};

// ============================================================================
// END MERIT HELPERS
// ============================================================================

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
 * IMPROVED: Merit-based recommendations using historical closing merits
 * Uses spring/fall session data, validates eligibility against merit history
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
    preferredSession = 'Both',
  } = criteria;

  const currentPercentage = calculatePercentage(interMarks, interTotal);
  const academicLevel = getAcademicTier(currentPercentage);
  
  // Build program keywords for merit matching
  const programKeywords: string[] = [];
  preferredPrograms.forEach(pref => {
    const keywords = PROGRAM_CATEGORIES[pref] || [normalize(pref)];
    programKeywords.push(...keywords);
  });
  
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
  // STEP 3: Score and build recommendations with MERIT DATA
  // ============================================
  const recommendations: UniversityRecommendation[] = [];

  universityMap.forEach((entry) => {
    const { uni, programs, reasons } = entry;
    const uniTier = getUniversityTier(uni.short_name);
    
    // Get available sessions for this university
    const availableSessions = getAvailableSessions(uni.short_name);
    
    // Check session match
    const sessionMatch = preferredSession === 'Both' || 
                         availableSessions.length === 0 || 
                         availableSessions.includes(preferredSession as 'Fall' | 'Spring');
    
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
    
    // ============================================
    // MERIT-BASED SCORING (NEW - Primary scoring method)
    // ============================================
    const meritResult = getMeritBasedScore(
      currentPercentage,
      uni.short_name,
      programKeywords,
      preferredSession === 'Both' ? undefined : preferredSession
    );
    
    const hasMeritData = !!meritResult.insight;
    let score = meritResult.score;
    let meritInsight = meritResult.insight;
    
    // Determine if reach school based on merit or tier
    let isReachSchool = false;
    if (meritInsight) {
      isReachSchool = meritInsight.chanceLevel === 'low' || meritInsight.chanceLevel === 'very_low';
    } else {
      isReachSchool = uniTier < academicLevel.tier;
    }
    
    const meetsAcademicReq = !isReachSchool || academicLevel.tier === 1;
    
    // ============================================
    // ADDITIONAL SCORING FACTORS
    // ============================================
    
    // City match bonus (+15)
    if (cityMatch && preferredCities.length > 0) {
      score += 15;
      reasons.add(`📍 Located in ${uni.city}`);
    }
    
    // Program match bonus (+10)
    if (programMatch && programs.length > 0) {
      score += 10;
      const programNames = programs.slice(0, 2).map(p => p.degree_title).join(', ');
      reasons.add(`🎓 Offers: ${programNames}${programs.length > 2 ? '...' : ''}`);
    } else if (programMatch) {
      score += 5;
      reasons.add(`🎓 Offers programs in your field`);
    }
    
    // Type match bonus (+5)
    if (universityType !== 'Both' && typeMatch) {
      score += 5;
      reasons.add(`✓ ${uni.type.charAt(0).toUpperCase() + uni.type.slice(1)} university`);
    }
    
    // Session match bonus (+5)
    if (preferredSession !== 'Both' && sessionMatch && availableSessions.length > 0) {
      score += 5;
      reasons.add(`📅 Offers ${preferredSession} admissions`);
    }
    
    // HEC ranking bonus (+5)
    if (uni.ranking_hec === 'W4' || (uni.ranking_national && uni.ranking_national <= 10)) {
      score += 5;
      reasons.add('⭐ HEC Top Ranked');
    }
    
    // ============================================
    // MERIT-BASED INSIGHTS (NEW)
    // ============================================
    if (meritInsight) {
      // Add merit-based reasons
      switch (meritInsight.chanceLevel) {
        case 'excellent':
          reasons.add(`✅ Excellent chance! Your ${currentPercentage.toFixed(1)}% exceeds ${meritInsight.closingMerit}% closing merit`);
          break;
        case 'good':
          reasons.add(`👍 Good chance! You meet the ${meritInsight.closingMerit}% closing merit`);
          break;
        case 'moderate':
          reasons.add(`⚠️ Moderate chance. Closing merit was ${meritInsight.closingMerit}%`);
          break;
        case 'low':
          reasons.add(`🎯 Reach school. Merit was ${meritInsight.closingMerit}% (${(meritInsight.closingMerit - currentPercentage).toFixed(1)}% higher)`);
          break;
        case 'very_low':
          reasons.add(`🔴 Competitive. Merit ${meritInsight.closingMerit}% significantly higher than your marks`);
          break;
      }
      
      // Add trend info
      if (meritInsight.trend === 'rising') {
        reasons.add('📈 Merit trending up (increasingly competitive)');
      } else if (meritInsight.trend === 'falling') {
        reasons.add('📉 Merit trending down (becoming easier)');
      }
      
      // Add session info
      reasons.add(`📊 Based on ${meritInsight.session} ${meritInsight.year} data`);
    } else {
      // Fallback to tier-based indicators when no merit data
      if (uniTier === 1) {
        reasons.add('🏆 Tier 1 - Elite University');
      } else if (uniTier === 2) {
        reasons.add('🥇 Tier 2 - Highly Reputable');
      } else if (uniTier === 3) {
        reasons.add('🥈 Tier 3 - Good Regional University');
      }
      
      if (isReachSchool) {
        reasons.add('🎯 Reach School - Competitive Admission');
      }
    }
    
    // Multiple programs bonus (+3)
    if (programs.length > 2) {
      score += 3;
      reasons.add(`📚 ${programs.length} matching programs available`);
    }
    
    // Cap score
    score = Math.min(score, 100);
    
    const matchBreakdown: MatchBreakdown = {
      cityMatch,
      programMatch,
      typeMatch,
      academicTier: academicLevel.label,
      meetsMinimum: meetsAcademicReq,
      meritBased: hasMeritData,
      sessionMatch,
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
      meritInsight,
      availableSessions,
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
