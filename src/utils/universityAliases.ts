/**
 * University Aliases - Common nicknames and abbreviations for Pakistani universities
 * This helps search work with informal names that students commonly use
 * 
 * IMPORTANT: Keys must match the actual short_name in universities.ts
 */

// Map of actual short_names (from universities.ts) -> array of aliases for search
export const UNIVERSITY_ALIASES: Record<string, string[]> = {
  // === TOP UNIVERSITIES (Verified short_names from universities.ts) ===
  
  // LUMS - Lahore University of Management Sciences (short_name: LMS)
  'LMS': ['lums', 'lahore university of management', 'management sciences', 'lahore management'],
  
  // NUST - National University of Sciences and Technology (short_name: NST)
  'NST': ['nust', 'national university', 'sciences and technology', 'national sciences'],
  
  // COMSATS University (short_name: CI)
  'CI': ['comsats', 'cui', 'comsats university', 'comsats islamabad', 'comsats uni'],
  
  // PIEAS (short_name: PEAS)
  'PEAS': ['pieas', 'pakistan institute of engineering', 'applied sciences'],
  
  // FAST-NU / NUCES (short_name: NCES)
  'NCES': ['fast', 'fast-nu', 'fast nu', 'nuces', 'nu', 'fast peshawar', 'fast karachi', 'fast lahore'],
  
  // GIKI (short_name: GIKEST)
  'GIKEST': ['giki', 'ghulam ishaq khan', 'gik institute', 'gik'],
  
  // IBA Karachi (short_name: BA)
  'BA': ['iba', 'iba karachi', 'institute of business administration', 'business administration'],
  
  // QAU (short_name: QUAID)
  'QUAID': ['qau', 'quaid e azam', 'quaid-e-azam', 'quaid azam', 'quaid university'],
  
  // NED (short_name: NET)
  'NET': ['ned', 'ned university', 'ned karachi', 'neduet'],
  
  // UET Lahore (short_name: ETL)
  'ETL': ['uet', 'uet lahore', 'engineering technology lahore', 'uet lhr'],
  
  // MUET (short_name: MET)
  'MET': ['muet', 'mehran', 'mehran university'],
  
  // UET Peshawar
  'UETP': ['uet peshawar', 'uet kpk', 'uet pesh'],
  
  // UET Taxila
  'UETT': ['uet taxila', 'uet tax'],
  
  // Aga Khan University (short_name: AK)
  'AK': ['aku', 'aga khan', 'aga khan university', 'ak'],
  
  // Air University (short_name: AIR)
  'AIR': ['au', 'air university', 'air uni'],
  
  // SZABIST (short_name: SZABST)
  'SZABST': ['szabist', 'iqbal science', 'szab'],
  
  // Punjab University (short_name: PUNJA)
  'PUNJA': ['pu', 'punjab university', 'university of punjab', 'punjab uni'],
  
  // University of Karachi
  'UOK': ['ku', 'karachi university', 'university of karachi', 'uok'],
  
  // ITU (short_name: IT)
  'IT': ['itu', 'information technology university'],
  
  // UCP (short_name: CP)
  'CP': ['ucp', 'central punjab', 'university of central punjab'],
  
  // UMT (short_name: MT)
  'MT': ['umt', 'management technology', 'university of management'],
  
  // LSE (short_name: LE)
  'LE': ['lse', 'lahore school of economics', 'lahore economics'],
  
  // BZU (short_name: BZ)
  'BZ': ['bzu', 'bahauddin zakariya', 'zakariya university'],
  
  // GCU Lahore (short_name: GCUL)
  'GCUL': ['gcu', 'gcu lahore', 'government college', 'government college lahore'],
  
  // BUITEMS (short_name: BITEMS)
  'BITEMS': ['buitems', 'balochistan uit'],
  
  // BNU (short_name: BN)
  'BN': ['bnu', 'beaconhouse', 'beaconhouse national'],
  
  // Kinnaird (short_name: KW)
  'KW': ['kinnaird', 'kinnaird college'],
  
  // UHS - University of Health Sciences
  'UHS': ['uhs', 'health sciences'],
  
  // King Edward Medical (short_name: KEM if exists)
  'KEM': ['kemu', 'king edward', 'king edward medical'],
  
  // Bahria (short_name: BAHRI)
  'BAHRI': ['bahria', 'bahria university', 'bahria uni'],
  
  // Forman Christian College
  'FCC': ['fcc', 'forman', 'forman christian'],
  
  // Virtual University
  'VU': ['vu', 'virtual university', 'virtual uni'],
  
  // AIOU (short_name: AIO)
  'AIO': ['aiou', 'allama iqbal', 'open university'],
  
  // Capital University (short_name: CST)
  'CST': ['cust', 'capital university', 'capital uni', 'capital science'],
  
  // Foundation University (short_name: FUI for Foundation University Islamabad)
  'FUI': ['fui', 'foundation university', 'foundation uni'],
  
  // Riphah International University
  'RIU': ['riphah', 'riphah university', 'riphah international'],
  
  // National Defence University (short_name: NDU)
  'NDU': ['ndu', 'defence university', 'national defence'],
  
  // Institute of Space Technology (short_name: IST)
  'IST': ['ist', 'space technology', 'space tech'],
  
  // PIDE (short_name: PIDE)
  'PIDE': ['pide', 'development economics', 'pakistan institute development'],
  
  // IIUI - Islamic University Islamabad (short_name: IIU or IIUI)
  'IIU': ['iiui', 'islamic university', 'international islamic'],
  
  // Shifa (short_name: STU)
  'STU': ['shifa', 'stmu', 'shifa tameer', 'shifa medical'],
};

// Map of program file short names to actual university short_names in universities.ts
// CRITICAL: This fixes the mismatch between programs.ts references and universities.ts short_names
// Without this mapping, AI Match and recommendations will fail to find universities!
export const PROGRAM_TO_UNIVERSITY_MAP: Record<string, string> = {
  // === TOP UNIVERSITIES (Verified against universities.ts) ===
  'LUMS': 'LMS',           // Lahore University of Management Sciences
  'NUST': 'NST',           // National University of Sciences and Technology
  'GIKI': 'GIKEST',        // Ghulam Ishaq Khan Institute
  'IBA': 'BA',             // Institute of Business Administration
  'PIEAS': 'PEAS',         // Pakistan Institute of Engineering and Applied Sciences
  'COMSATS': 'CI',         // COMSATS University Islamabad
  'FAST': 'NCES',          // National University of Computer and Emerging Sciences (FAST-NU)
  'QAU': 'QUAID',          // Quaid-i-Azam University
  'AKU': 'AK',             // Aga Khan University
  'NED': 'NET',            // NED University of Engineering and Technology
  'MUET': 'MET',           // Mehran University of Engineering and Technology
  'Mehran': 'MET',         // Mehran University alternate name
  'UET': 'ETL',            // University of Engineering and Technology, Lahore
  'UCP': 'CP',             // University of Central Punjab
  'UMT': 'MT',             // University of Management and Technology
  'LSE': 'LE',             // Lahore School of Economics
  'BZU': 'BZ',             // Bahauddin Zakariya University
  'SZABIST': 'SZABST',     // Shaheed Zulfiqar Ali Bhutto Institute
  'GCU': 'GCUL',           // Government College University, Lahore
  'BUITEMS': 'BITEMS',     // Balochistan UIT Engineering and Management Sciences
  'BNU': 'BN',             // Beaconhouse National University
  'Kinnaird': 'KW',        // Kinnaird College for Women
  
  // === UET VARIANTS ===
  'UET Peshawar': 'UETP',
  'UET Taxila': 'UETT',
  'UET Lahore': 'ETL',
  'UET Faisalabad': 'ETFA', // UET Faisalabad
  
  // === AIR / BAHRIA / MILITARY ===
  'AU': 'AIR',             // Air University
  'Bahria': 'BAHRI',       // Bahria University
  'NDU': 'NDU',            // National Defence University
  'IST': 'IST',            // Institute of Space Technology
  
  // === MEDICAL UNIVERSITIES ===
  'KEMU': 'KEM',           // King Edward Medical University
  'FJMU': 'FJW',           // Fatima Jinnah Medical University (mapped to FJW in db)
  'NMC': 'NM',             // Nishtar Medical College (mapped to NM in db)
  'AIMC': 'AIMC',          // Allama Iqbal Medical College
  'SMC': 'SM',             // Services Medical College
  'RMC': 'RM',             // Rawalpindi Medical College (mapped to RM in db)
  'CMH': 'CMHLMC',         // CMH Lahore Medical College
  'CMH Lahore': 'CMHLMC',
  'Shifa': 'ST',           // Shifa Tameer-e-Millat University (mapped to ST in db)
  'DUHS': 'DHS',           // Dow University (mapped to DHS in db)
  'UHS': 'UHS',            // University of Health Sciences
  'ISRA': 'ISRA',          // ISRA University
  'RIU': 'RI',             // Riphah International (mapped to RI in db)
  'FMH': 'FM',             // Fatima Memorial Hospital
  'Lahore Medical': 'AIMC',
  
  // === DENTAL ===
  'de Montmorency': 'AIMC', // de Montmorency mapped to medical college
  
  // === GENERAL UNIVERSITIES ===
  'UoK': 'KARAC',          // University of Karachi (KARAC in db)
  'UoL': 'UOL',            // University of Lahore
  'UoP': 'PESHA',          // University of Peshawar (PESHA in db)
  'UoS': 'SINDH',          // University of Sindh (SINDH in db)
  'UoB': 'BALU',           // University of Balochistan
  'PU': 'PUNJA',           // University of the Punjab
  'UVAS': 'UVAS',          // University of Veterinary
  'VU': 'VU',              // Virtual University
  'GCUF': 'GCUF',          // GCU Faisalabad
  'AIOU': 'AIO',           // Allama Iqbal Open University
  'ITU': 'IT',             // Information Technology University
  'NUML': 'NML',           // National University of Modern Languages
  'NCA': 'NA',             // National College of Arts
  'FC College': 'FCC',     // Forman Christian College
  'LCWU': 'LW',            // Lahore College for Women University
  'Indus Valley': 'IVAA',  // Indus Valley School
  'Beacon House': 'BN',    // Beaconhouse National University (alternate spelling)
  'FJWU': 'FJW',           // Fatima Jinnah Women University
  
  // === AGRICULTURE UNIVERSITIES ===
  'UAF': 'UOAF',           // University of Agriculture Faisalabad (UOAF in db)
  'SAU': 'SAU',            // Sindh Agriculture University
  'PMAS Arid': 'AP',       // PMAS Arid Agriculture (AP in db)
  'Sindh Agriculture': 'SAU',
  'UAP': 'AUOSAT',         // University of Agriculture Peshawar
  
  // === LAW SCHOOLS ===
  'PU Law': 'PUNJA',       // Punjab University Law College
  'UoK Law': 'KARAC',      // Karachi University Law
  'Islamia University': 'IUB', // Islamia University Bahawalpur
  
  // === OTHER ===
  'NTU': 'NTU',            // National Textile University
  'SKANS': 'SKANS',        // SKANS School of Accountancy
  'ACCA Pakistan': 'ACCA', // ACCA
  'CA Firms': 'CA',        // CA Firms
};

// Create reverse lookup: alias -> short_name
const reverseLookup: Record<string, string> = {};

Object.entries(UNIVERSITY_ALIASES).forEach(([shortName, aliases]) => {
  aliases.forEach(alias => {
    reverseLookup[alias.toLowerCase()] = shortName;
  });
});

/**
 * Normalize search term for comparison
 */
export const normalizeSearchTerm = (term: string): string => {
  return term.toLowerCase().trim();
};

/**
 * Find university short_names that match an alias
 * Used by recommendation engine to match program.universities to actual universities
 * @param alias - The alias to search for (e.g., 'COMSATS', 'FAST')
 * @returns Array of matching university short_names
 */
export const findUniversitiesByAlias = (alias: string): string[] => {
  const normalized = normalizeSearchTerm(alias);
  const results: string[] = [];
  
  // First check the program-to-university map (for programs.ts compatibility)
  if (PROGRAM_TO_UNIVERSITY_MAP[alias]) {
    results.push(PROGRAM_TO_UNIVERSITY_MAP[alias]);
  }
  
  // Then check reverse lookup (alias -> short_name)
  if (reverseLookup[normalized]) {
    if (!results.includes(reverseLookup[normalized])) {
      results.push(reverseLookup[normalized]);
    }
  }
  
  // Also do a partial match on aliases
  Object.entries(UNIVERSITY_ALIASES).forEach(([shortName, aliases]) => {
    // Check if the input matches any alias for this university
    const matches = aliases.some(a => 
      a.toLowerCase() === normalized ||
      a.toLowerCase().includes(normalized) ||
      normalized.includes(a.toLowerCase())
    );
    
    if (matches && !results.includes(shortName)) {
      results.push(shortName);
    }
  });
  
  return results;
};

/**
 * Expand a search query to include the actual university short_name if an alias is used
 * @param query - The search query
 * @returns The original query plus any matched real short_names
 */
export const expandSearchQuery = (query: string): string[] => {
  const normalizedQuery = query.toLowerCase().trim();
  const results: string[] = [normalizedQuery];
  
  // Check if query matches any alias
  if (reverseLookup[normalizedQuery]) {
    results.push(reverseLookup[normalizedQuery].toLowerCase());
  }
  
  // Also check for partial matches
  Object.entries(reverseLookup).forEach(([alias, shortName]) => {
    if (alias.includes(normalizedQuery) || normalizedQuery.includes(alias)) {
      if (!results.includes(shortName.toLowerCase())) {
        results.push(shortName.toLowerCase());
      }
    }
  });
  
  return results;
};

/**
 * Check if a university matches a search query (including aliases)
 * @param university - University object with name and short_name
 * @param query - Search query
 * @returns true if the university matches
 */
export const universityMatchesQuery = (
  university: { name: string; short_name: string; city?: string },
  query: string
): boolean => {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) return true;
  
  const name = university.name.toLowerCase();
  const shortName = university.short_name.toLowerCase();
  const city = university.city?.toLowerCase() || '';
  
  // Direct match on name, short_name, or city
  if (name.includes(normalizedQuery) || 
      shortName.includes(normalizedQuery) ||
      city.includes(normalizedQuery)) {
    return true;
  }
  
  // Check if query is an alias for this university
  const aliases = UNIVERSITY_ALIASES[university.short_name];
  if (aliases) {
    return aliases.some(alias => 
      alias.toLowerCase().includes(normalizedQuery) ||
      normalizedQuery.includes(alias.toLowerCase())
    );
  }
  
  // Check reverse lookup - if query is a known alias
  const matchedShortName = reverseLookup[normalizedQuery];
  if (matchedShortName && matchedShortName === university.short_name) {
    return true;
  }
  
  return false;
};

export default {
  UNIVERSITY_ALIASES,
  PROGRAM_TO_UNIVERSITY_MAP,
  expandSearchQuery,
  universityMatchesQuery,
  findUniversitiesByAlias,
  normalizeSearchTerm,
};
