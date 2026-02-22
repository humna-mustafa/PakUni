/**
 * University Aliases - Common nicknames and abbreviations for Pakistani universities
 * This helps search work with informal names that students commonly use
 * 
 * IMPORTANT: Keys must match the actual short_name in universities.ts
 * Updated to match the CSV data file abbreviations (2026-06-18)
 */

// Map of actual short_names (from CSV) -> array of aliases for search
export const UNIVERSITY_ALIASES: Record<string, string[]> = {
  // === TOP UNIVERSITIES (From CSV Abbreviation column) ===
  
  // LUMS - Lahore University of Management Sciences
  'LUMS': ['lums', 'lahore university of management', 'management sciences', 'lahore management'],
  
  // AKU - Aga Khan University
  'AKU': ['aku', 'aga khan', 'aga khan university', 'agha khan'],
  
  // NUST - National University of Sciences and Technology
  'NUST': ['nust', 'national university', 'sciences and technology', 'national sciences'],
  
  // COMSATS University Islamabad
  'COMSATS': ['comsats', 'cui', 'comsats university', 'comsats islamabad', 'comsats uni'],
  
  // IBA - Institute of Business Administration
  'IBA': ['iba', 'iba karachi', 'institute of business administration', 'business administration'],
  
  // UCP - University of Central Punjab
  'UCP': ['ucp', 'central punjab', 'university of central punjab'],
  
  // NU - National University of Computer and Emerging Sciences (FAST-NU)
  'NU': ['nu', 'fast', 'fast-nu', 'fast nu', 'nuces', 'fast peshawar', 'fast karachi', 'fast lahore'],
  
  // UMT - University of Management and Technology
  'UMT': ['umt', 'management technology', 'university of management'],
  
  // QAU - Quaid-i-Azam University
  'QAU': ['qau', 'quaid e azam', 'quaid-e-azam', 'quaid azam', 'quaid university'],
  
  // BAHRIA - Bahria University
  'BAHRIA': ['bahria', 'bahria university', 'bahria uni'],
  
  // UET - University of Engineering and Technology, Lahore
  'UET': ['uet', 'uet lahore', 'engineering technology lahore', 'uet lhr'],
  
  // IIU - International Islamic University
  'IIU': ['iiu', 'iiui', 'islamic university', 'international islamic'],
  
  // UHS - University of Health Sciences
  'UHS': ['uhs', 'health sciences', 'health sciences lahore'],
  
  // UOL - The University of Lahore
  'UOL': ['uol', 'university of lahore', 'lahore uni', 'lahore university'],
  
  // USINDH - University of Sindh
  'USINDH': ['usindh', 'sindh university', 'university of sindh', 'sindh'],
  
  // GCU - Government College University, Lahore
  'GCU': ['gcu', 'gcu lahore', 'government college', 'government college university', 'government college lahore'],
  
  // RIPHAH - Riphah International University
  'RIPHAH': ['riphah', 'riphah university', 'riphah international'],
  
  // UOP - University of Peshawar
  'UOP': ['uop', 'peshawar university', 'university of peshawar'],
  
  // NEDUET - NED University of Engineering and Technology
  'NEDUET': ['neduet', 'ned', 'ned university', 'ned karachi'],
  
  // UAF - University of Agriculture, Faisalabad
  'UAF': ['uaf', 'agriculture faisalabad', 'faisalabad agriculture'],
  
  // BZU - Bahauddin Zakariya University
  'BZU': ['bzu', 'bahauddin zakariya', 'zakariya university', 'multan university'],
  
  // PIDE - Pakistan Institute of Development Economics
  'PIDE': ['pide', 'development economics', 'pakistan institute development'],
  
  // NUML - National University of Modern Languages
  'NUML': ['numl', 'modern languages', 'national university modern languages'],
  
  // IUB - The Islamia University of Bahawalpur
  'IUB': ['iub', 'islamia university', 'bahawalpur university', 'islamia bahawalpur'],
  
  // IQRA - Iqra University
  'IQRA': ['iqra', 'iqra university', 'iqra karachi'],
  
  // MUET - Mehran University of Engineering and Technology
  'MUET': ['muet', 'mehran', 'mehran university', 'mehran engineering'],
  
  // UOS - University of Sargodha
  'UOS': ['uos', 'sargodha university', 'university of sargodha'],
  
  // GIKI - Ghulam Ishaq Khan Institute
  'GIKI': ['giki', 'ghulam ishaq khan', 'gik institute', 'gik'],
  
  // KMU - Khyber Medical University
  'KMU': ['kmu', 'khyber medical', 'khyber medical university'],
  
  // PIEAS - Pakistan Institute of Engineering and Applied Sciences
  'PIEAS': ['pieas', 'pakistan institute of engineering', 'applied sciences'],
  
  // PU - University of the Punjab
  'PU': ['pu', 'punjab university', 'university of punjab', 'punjab uni'],
  
  // AIR - Air University
  'AIR': ['au', 'air university', 'air uni', 'air'],
  
  // SZABIST - Shaheed Zulfikar Ali Bhutto Institute
  'SZABIST': ['szabist', 'szabist karachi', 'zulfiqar bhutto'],
  
  // IST - Institute of Space Technology
  'IST': ['ist', 'space technology', 'space tech'],
  
  // NDU - National Defence University
  'NDU': ['ndu', 'defence university', 'national defence'],
  
  // NCA - National College of Arts
  'NCA': ['nca', 'national college of arts', 'arts college'],
  
  // LCWU - Lahore College for Women University
  'LCWU': ['lcwu', 'lahore college women', 'women university lahore'],
  
  // ITU - Information Technology University
  'ITU': ['itu', 'information technology university', 'it university'],
  
  // FCC - Forman Christian College
  'FCC': ['fcc', 'forman', 'forman christian', 'forman college'],
  
  // BNU - Beaconhouse National University
  'BNU': ['bnu', 'beaconhouse', 'beaconhouse national'],
  
  // VU - Virtual University
  'VU': ['vu', 'virtual university', 'virtual uni'],
  
  // LSE - Lahore School of Economics
  'LSE': ['lse', 'lahore school of economics', 'lahore economics'],
  
  // KEMU - King Edward Medical University
  'KEMU': ['kemu', 'king edward', 'king edward medical'],
  
  // FMH - Fatima Memorial Hospital College
  'FMH': ['fmh', 'fatima memorial', 'fatima hospital'],
  
  // DUHS - Dow University of Health Sciences
  'DUHS': ['duhs', 'dow', 'dow university', 'dow medical'],
  
  // UOK - University of Karachi
  'UOK': ['uok', 'ku', 'karachi university', 'university of karachi'],
  
  // AIOU - Allama Iqbal Open University
  'AIOU': ['aiou', 'allama iqbal', 'open university', 'allama iqbal open'],
  
  // NTU - National Textile University
  'NTU': ['ntu', 'national textile', 'textile university'],
  
  // GCUF - Government College University Faisalabad
  'GCUF': ['gcuf', 'gcu faisalabad', 'government college faisalabad'],
  
  // FJWU - Fatima Jinnah Women University
  'FJWU': ['fjwu', 'fatima jinnah', 'fatima jinnah women'],
  
  // UVAS - University of Veterinary and Animal Sciences
  'UVAS': ['uvas', 'veterinary lahore', 'animal sciences'],
  
  // UOB - University of Balochistan
  'UOB': ['uob', 'balochistan university', 'university of balochistan'],
  
  // BUITEMS - Balochistan University of IT, Engineering and Management Sciences
  'BUITEMS': ['buitems', 'balochistan uit', 'buitems quetta'],
  
  // Kinnaird - Kinnaird College for Women
  'KINNAIRD': ['kinnaird', 'kinnaird college', 'kinnaird lahore'],
  
  // CMH - Combined Military Hospital
  'CMHLMC': ['cmh', 'cmh lahore', 'cmh medical'],
  
  // ISRA - ISRA University
  'ISRA': ['isra', 'isra university', 'isra karachi'],
  
  // STMU - Shifa Tameer-e-Millat University
  'STMU': ['stmu', 'shifa', 'shifa tameer', 'shifa medical'],
  
  // FUUAST - Federal Urdu University of Arts, Science and Technology
  'FUUAST': ['fuuast', 'federal urdu', 'urdu university'],
  
  // CUST - Capital University of Science and Technology
  'CUST': ['cust', 'capital university', 'capital science'],
  
  // FUI - Foundation University Islamabad
  'FUI': ['fui', 'foundation university', 'foundation uni'],
  
  // IIUI - International Islamic University Islamabad
  'IIUI': ['iiui', 'islamic university', 'international islamic'],
  
  // AU - Air University (alternate entry)
  'AU': ['air university'],
  
};

// Map of alternate names/aliases to actual university short_names in universities.ts
// CRITICAL: Maps common names and old references to the CORRECT short_names from CSV
// Universities.ts now has correct short_names like LUMS, NUST, COMSATS, etc.
export const PROGRAM_TO_UNIVERSITY_MAP: Record<string, string> = {
  // === TOP UNIVERSITIES - Identity mappings (already correct in programs.ts) ===
  'LUMS': 'LUMS',          // Lahore University of Management Sciences
  'NUST': 'NUST',          // National University of Sciences and Technology
  'GIKI': 'GIKI',          // Ghulam Ishaq Khan Institute
  'IBA': 'IBA',            // Institute of Business Administration
  'PIEAS': 'PIEAS',        // Pakistan Institute of Engineering and Applied Sciences
  'COMSATS': 'COMSATS',    // COMSATS University Islamabad
  'QAU': 'QAU',            // Quaid-i-Azam University
  'AKU': 'AKU',            // Aga Khan University
  'UET': 'UET',            // University of Engineering and Technology, Lahore
  'BZU': 'BZU',            // Bahauddin Zakariya University
  'SZABIST': 'SZABIST',    // Shaheed Zulfiqar Ali Bhutto Institute
  'GCU': 'GCU',            // Government College University, Lahore
  'BUITEMS': 'BUITEMS',    // Balochistan UIT Engineering and Management Sciences
  'BNU': 'BNU',            // Beaconhouse National University
  'NDU': 'NDU',            // National Defence University
  'IST': 'IST',            // Institute of Space Technology
  'NCA': 'NCA',            // National College of Arts
  'VU': 'VU',              // Virtual University
  'GCUF': 'GCUF',          // GCU Faisalabad
  'NTU': 'NTU',            // National Textile University
  'FJWU': 'FJWU',          // Fatima Jinnah Women University
  'PIDE': 'PIDE',          // Pakistan Institute of Development Economics
  'NUML': 'NUML',          // National University of Modern Languages
  'ITU': 'ITU',            // Information Technology University
  'LCWU': 'LCWU',          // Lahore College for Women University
  'FCC': 'FCC',            // Forman Christian College
  'LSE': 'LSE',            // Lahore School of Economics
  'KEMU': 'KEMU',          // King Edward Medical University
  'DUHS': 'DUHS',          // Dow University of Health Sciences
  'AIOU': 'AIOU',          // Allama Iqbal Open University
  'ISRA': 'ISRA',          // ISRA University
  'STMU': 'STMU',          // Shifa Tameer-e-Millat University
  'MUET': 'MUET',          // Mehran University of Engineering and Technology
  'NEDUET': 'NEDUET',      // NED University of Engineering and Technology
  'UOK': 'UOK',            // University of Karachi
  'PU': 'PU',              // University of the Punjab
  'UVAS': 'UVAS',          // University of Veterinary
  'IUB': 'IUB',            // Islamia University Bahawalpur
  'UOS': 'UOS',            // University of Sargodha
  'KMU': 'KMU',            // Khyber Medical University
  'UOB': 'UOB',            // University of Balochistan
  'IQRA': 'IQRA',          // Iqra University
  'FMH': 'FMH',            // Fatima Memorial Hospital
  'FUUAST': 'FUUAST',      // Federal Urdu University
  
  // === ALTERNATE NAMES AND SPELLINGS ===
  'FAST': 'NU',            // FAST-NU -> National University (NU in CSV)
  'FAST-NU': 'NU',         // FAST-NU alternate
  'NU': 'NU',              // National University
  'NED': 'NEDUET',         // NED -> NEDUET
  'Mehran': 'MUET',        // Mehran -> MUET
  'UCP': 'UCP',            // University of Central Punjab
  'UMT': 'UMT',            // University of Management and Technology
  'Kinnaird': 'KINNAIRD',  // Kinnaird College
  'AU': 'AIR',             // Air University
  'Air': 'AIR',            // Air University
  'Bahria': 'BAHRIA',      // Bahria University
  'BAHRIA': 'BAHRIA',      // Bahria University
  'Shifa': 'STMU',         // Shifa -> STMU
  'CMH': 'CMHLMC',         // CMH Lahore Medical College
  'CMH Lahore': 'CMHLMC',  // CMH alternate
  'UHS': 'UHS',            // University of Health Sciences
  'Riphah': 'RIPHAH',      // Riphah International
  'RIU': 'RIPHAH',         // Riphah alternate
  
  // === CITY-BASED ALIASES ===
  'UoK': 'UOK',            // University of Karachi
  'UoL': 'UOL',            // University of Lahore
  'UoP': 'UOP',            // University of Peshawar
  'UoS': 'UOS',            // University of Sargodha
  'UoB': 'UOB',            // University of Balochistan
  
  // === UET VARIANTS ===
  'UET Peshawar': 'UETP',
  'UET Taxila': 'UETT',
  'UET Lahore': 'UET',
  
  // === OLD INCORRECT MAPPINGS (for backward compatibility) ===
  'LMS': 'LUMS',           // Old wrong -> correct
  'NST': 'NUST',           // Old wrong -> correct
  'CI': 'COMSATS',         // Old wrong -> correct
  'QUAID': 'QAU',          // Old wrong -> correct
  'NET': 'NEDUET',         // Old wrong -> correct
  'ETL': 'UET',            // Old wrong -> correct
  'BA': 'IBA',             // Old wrong -> correct
  'NCES': 'NU',            // Old wrong -> correct
  'GIKEST': 'GIKI',        // Old wrong -> correct
  'PEAS': 'PIEAS',         // Old wrong -> correct
  
  // === AGRICULTURE ===
  'UAF': 'UAF',            // University of Agriculture Faisalabad
  'Sindh Agriculture': 'SAU', // Sindh Agriculture University
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
