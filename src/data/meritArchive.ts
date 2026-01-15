/**
 * Past Merit Lists Data
 * Historical closing merits for Pakistani universities (2020-2024)
 */

export interface MeritRecord {
  id: string;
  universityId: string;
  universityName: string;
  universityShortName: string;
  programName: string;
  programCode?: string;
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

// Sample historical merit data
export const MERIT_RECORDS: MeritRecord[] = [
  // NUST - Computer Science
  {
    id: 'nust-cs-2024',
    universityId: 'nust',
    universityName: 'National University of Sciences and Technology',
    universityShortName: 'NUST',
    programName: 'BS Computer Science',
    programCode: 'SEECS-CS',
    year: 2024,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 89.2,
    openingMerit: 96.5,
    totalSeats: 120,
    applicants: 8500,
    category: 'computer-science',
    city: 'Islamabad',
    province: 'Islamabad',
  },
  {
    id: 'nust-cs-2023',
    universityId: 'nust',
    universityName: 'National University of Sciences and Technology',
    universityShortName: 'NUST',
    programName: 'BS Computer Science',
    programCode: 'SEECS-CS',
    year: 2023,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 88.5,
    openingMerit: 95.8,
    totalSeats: 115,
    applicants: 7800,
    category: 'computer-science',
    city: 'Islamabad',
    province: 'Islamabad',
  },
  {
    id: 'nust-cs-2022',
    universityId: 'nust',
    universityName: 'National University of Sciences and Technology',
    universityShortName: 'NUST',
    programName: 'BS Computer Science',
    programCode: 'SEECS-CS',
    year: 2022,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 87.8,
    openingMerit: 95.2,
    totalSeats: 110,
    applicants: 7200,
    category: 'computer-science',
    city: 'Islamabad',
    province: 'Islamabad',
  },
  {
    id: 'nust-cs-2021',
    universityId: 'nust',
    universityName: 'National University of Sciences and Technology',
    universityShortName: 'NUST',
    programName: 'BS Computer Science',
    programCode: 'SEECS-CS',
    year: 2021,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 86.9,
    openingMerit: 94.5,
    totalSeats: 105,
    category: 'computer-science',
    city: 'Islamabad',
    province: 'Islamabad',
  },
  {
    id: 'nust-cs-2020',
    universityId: 'nust',
    universityName: 'National University of Sciences and Technology',
    universityShortName: 'NUST',
    programName: 'BS Computer Science',
    programCode: 'SEECS-CS',
    year: 2020,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 85.5,
    openingMerit: 93.8,
    totalSeats: 100,
    category: 'computer-science',
    city: 'Islamabad',
    province: 'Islamabad',
  },
  // NUST - Electrical Engineering
  {
    id: 'nust-ee-2024',
    universityId: 'nust',
    universityName: 'National University of Sciences and Technology',
    universityShortName: 'NUST',
    programName: 'BS Electrical Engineering',
    year: 2024,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 86.8,
    totalSeats: 150,
    category: 'engineering',
    city: 'Islamabad',
    province: 'Islamabad',
  },
  {
    id: 'nust-ee-2023',
    universityId: 'nust',
    universityName: 'National University of Sciences and Technology',
    universityShortName: 'NUST',
    programName: 'BS Electrical Engineering',
    year: 2023,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 85.5,
    totalSeats: 145,
    category: 'engineering',
    city: 'Islamabad',
    province: 'Islamabad',
  },
  // FAST - Computer Science Lahore
  {
    id: 'fast-lhr-cs-2024',
    universityId: 'fast',
    universityName: 'FAST National University',
    universityShortName: 'FAST',
    programName: 'BS Computer Science (Lahore)',
    year: 2024,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 84.5,
    totalSeats: 200,
    applicants: 5500,
    category: 'computer-science',
    city: 'Lahore',
    province: 'Punjab',
  },
  {
    id: 'fast-lhr-cs-2023',
    universityId: 'fast',
    universityName: 'FAST National University',
    universityShortName: 'FAST',
    programName: 'BS Computer Science (Lahore)',
    year: 2023,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 83.8,
    totalSeats: 190,
    category: 'computer-science',
    city: 'Lahore',
    province: 'Punjab',
  },
  {
    id: 'fast-lhr-cs-2022',
    universityId: 'fast',
    universityName: 'FAST National University',
    universityShortName: 'FAST',
    programName: 'BS Computer Science (Lahore)',
    year: 2022,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 82.5,
    totalSeats: 185,
    category: 'computer-science',
    city: 'Lahore',
    province: 'Punjab',
  },
  {
    id: 'fast-lhr-cs-2021',
    universityId: 'fast',
    universityName: 'FAST National University',
    universityShortName: 'FAST',
    programName: 'BS Computer Science (Lahore)',
    year: 2021,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 81.2,
    totalSeats: 180,
    category: 'computer-science',
    city: 'Lahore',
    province: 'Punjab',
  },
  // FAST - Islamabad
  {
    id: 'fast-isb-cs-2024',
    universityId: 'fast',
    universityName: 'FAST National University',
    universityShortName: 'FAST',
    programName: 'BS Computer Science (Islamabad)',
    year: 2024,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 86.2,
    totalSeats: 180,
    category: 'computer-science',
    city: 'Islamabad',
    province: 'Islamabad',
  },
  {
    id: 'fast-isb-cs-2023',
    universityId: 'fast',
    universityName: 'FAST National University',
    universityShortName: 'FAST',
    programName: 'BS Computer Science (Islamabad)',
    year: 2023,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 85.5,
    totalSeats: 175,
    category: 'computer-science',
    city: 'Islamabad',
    province: 'Islamabad',
  },
  // LUMS
  {
    id: 'lums-cs-2024',
    universityId: 'lums',
    universityName: 'Lahore University of Management Sciences',
    universityShortName: 'LUMS',
    programName: 'BSc Computer Science',
    year: 2024,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 91.5,
    totalSeats: 80,
    applicants: 4200,
    category: 'computer-science',
    city: 'Lahore',
    province: 'Punjab',
  },
  {
    id: 'lums-cs-2023',
    universityId: 'lums',
    universityName: 'Lahore University of Management Sciences',
    universityShortName: 'LUMS',
    programName: 'BSc Computer Science',
    year: 2023,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 90.8,
    totalSeats: 75,
    category: 'computer-science',
    city: 'Lahore',
    province: 'Punjab',
  },
  {
    id: 'lums-cs-2022',
    universityId: 'lums',
    universityName: 'Lahore University of Management Sciences',
    universityShortName: 'LUMS',
    programName: 'BSc Computer Science',
    year: 2022,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 89.5,
    totalSeats: 70,
    category: 'computer-science',
    city: 'Lahore',
    province: 'Punjab',
  },
  // GIKI
  {
    id: 'giki-cs-2024',
    universityId: 'giki',
    universityName: 'Ghulam Ishaq Khan Institute',
    universityShortName: 'GIKI',
    programName: 'BS Computer Science',
    year: 2024,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 88.5,
    totalSeats: 100,
    category: 'computer-science',
    city: 'Topi',
    province: 'KPK',
  },
  {
    id: 'giki-cs-2023',
    universityId: 'giki',
    universityName: 'Ghulam Ishaq Khan Institute',
    universityShortName: 'GIKI',
    programName: 'BS Computer Science',
    year: 2023,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 87.8,
    totalSeats: 95,
    category: 'computer-science',
    city: 'Topi',
    province: 'KPK',
  },
  {
    id: 'giki-ee-2024',
    universityId: 'giki',
    universityName: 'Ghulam Ishaq Khan Institute',
    universityShortName: 'GIKI',
    programName: 'BS Electrical Engineering',
    year: 2024,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 85.2,
    totalSeats: 120,
    category: 'engineering',
    city: 'Topi',
    province: 'KPK',
  },
  // PUCIT
  {
    id: 'pucit-cs-2024',
    universityId: 'pucit',
    universityName: 'Punjab University College of IT',
    universityShortName: 'PUCIT',
    programName: 'BS Computer Science',
    year: 2024,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 82.5,
    totalSeats: 250,
    applicants: 6800,
    category: 'computer-science',
    city: 'Lahore',
    province: 'Punjab',
  },
  {
    id: 'pucit-cs-2023',
    universityId: 'pucit',
    universityName: 'Punjab University College of IT',
    universityShortName: 'PUCIT',
    programName: 'BS Computer Science',
    year: 2023,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 81.8,
    totalSeats: 240,
    category: 'computer-science',
    city: 'Lahore',
    province: 'Punjab',
  },
  {
    id: 'pucit-cs-2022',
    universityId: 'pucit',
    universityName: 'Punjab University College of IT',
    universityShortName: 'PUCIT',
    programName: 'BS Computer Science',
    year: 2022,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 80.5,
    totalSeats: 230,
    category: 'computer-science',
    city: 'Lahore',
    province: 'Punjab',
  },
  // UET Lahore
  {
    id: 'uet-cs-2024',
    universityId: 'uet',
    universityName: 'University of Engineering and Technology',
    universityShortName: 'UET',
    programName: 'BS Computer Science',
    year: 2024,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 85.8,
    totalSeats: 180,
    category: 'computer-science',
    city: 'Lahore',
    province: 'Punjab',
  },
  {
    id: 'uet-ee-2024',
    universityId: 'uet',
    universityName: 'University of Engineering and Technology',
    universityShortName: 'UET',
    programName: 'BS Electrical Engineering',
    year: 2024,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 84.2,
    totalSeats: 200,
    category: 'engineering',
    city: 'Lahore',
    province: 'Punjab',
  },
  {
    id: 'uet-me-2024',
    universityId: 'uet',
    universityName: 'University of Engineering and Technology',
    universityShortName: 'UET',
    programName: 'BS Mechanical Engineering',
    year: 2024,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 82.5,
    totalSeats: 180,
    category: 'engineering',
    city: 'Lahore',
    province: 'Punjab',
  },
  // COMSATS
  {
    id: 'comsats-isb-cs-2024',
    universityId: 'comsats',
    universityName: 'COMSATS University Islamabad',
    universityShortName: 'COMSATS',
    programName: 'BS Computer Science (Islamabad)',
    year: 2024,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 78.5,
    totalSeats: 300,
    category: 'computer-science',
    city: 'Islamabad',
    province: 'Islamabad',
  },
  {
    id: 'comsats-lhr-cs-2024',
    universityId: 'comsats',
    universityName: 'COMSATS University Islamabad',
    universityShortName: 'COMSATS',
    programName: 'BS Computer Science (Lahore)',
    year: 2024,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 76.8,
    totalSeats: 280,
    category: 'computer-science',
    city: 'Lahore',
    province: 'Punjab',
  },
  // IBA
  {
    id: 'iba-cs-2024',
    universityId: 'iba',
    universityName: 'Institute of Business Administration',
    universityShortName: 'IBA',
    programName: 'BS Computer Science',
    year: 2024,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 90.2,
    totalSeats: 60,
    category: 'computer-science',
    city: 'Karachi',
    province: 'Sindh',
  },
  {
    id: 'iba-bba-2024',
    universityId: 'iba',
    universityName: 'Institute of Business Administration',
    universityShortName: 'IBA',
    programName: 'BBA',
    year: 2024,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 89.5,
    totalSeats: 120,
    category: 'business',
    city: 'Karachi',
    province: 'Sindh',
  },
  // Medical - King Edward
  {
    id: 'kemu-mbbs-2024',
    universityId: 'kemu',
    universityName: 'King Edward Medical University',
    universityShortName: 'KEMU',
    programName: 'MBBS',
    year: 2024,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 92.5,
    totalSeats: 350,
    applicants: 28000,
    category: 'medical',
    city: 'Lahore',
    province: 'Punjab',
  },
  {
    id: 'kemu-mbbs-2023',
    universityId: 'kemu',
    universityName: 'King Edward Medical University',
    universityShortName: 'KEMU',
    programName: 'MBBS',
    year: 2023,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 91.8,
    totalSeats: 340,
    category: 'medical',
    city: 'Lahore',
    province: 'Punjab',
  },
  // AKU
  {
    id: 'aku-mbbs-2024',
    universityId: 'aku',
    universityName: 'Aga Khan University',
    universityShortName: 'AKU',
    programName: 'MBBS',
    year: 2024,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 94.5,
    totalSeats: 100,
    category: 'medical',
    city: 'Karachi',
    province: 'Sindh',
  },
  // PIEAS
  {
    id: 'pieas-cs-2024',
    universityId: 'pieas',
    universityName: 'Pakistan Institute of Engineering & Applied Sciences',
    universityShortName: 'PIEAS',
    programName: 'BS Computer Science',
    year: 2024,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 90.5,
    totalSeats: 50,
    category: 'computer-science',
    city: 'Islamabad',
    province: 'Islamabad',
  },
  {
    id: 'pieas-ee-2024',
    universityId: 'pieas',
    universityName: 'Pakistan Institute of Engineering & Applied Sciences',
    universityShortName: 'PIEAS',
    programName: 'BS Electrical Engineering',
    year: 2024,
    session: 'Fall',
    meritType: 'open',
    closingMerit: 89.2,
    totalSeats: 60,
    category: 'engineering',
    city: 'Islamabad',
    province: 'Islamabad',
  },
];

// Categories for filtering
export const MERIT_CATEGORIES = [
  {id: 'all', name: 'All Programs', iconName: 'apps-outline'},
  {id: 'computer-science', name: 'Computer Science', iconName: 'code-slash-outline'},
  {id: 'engineering', name: 'Engineering', iconName: 'construct-outline'},
  {id: 'medical', name: 'Medical', iconName: 'medkit-outline'},
  {id: 'business', name: 'Business', iconName: 'briefcase-outline'},
];

// Years available
export const AVAILABLE_YEARS = [2024, 2023, 2022, 2021, 2020];

// Helper functions
export const getMeritTrend = (universityId: string, programName: string): YearlyTrend[] => {
  return MERIT_RECORDS
    .filter(r => r.universityId === universityId && r.programName === programName)
    .sort((a, b) => a.year - b.year)
    .map(r => ({year: r.year, merit: r.closingMerit}));
};

export const getYearlyChange = (universityId: string, programName: string): number | null => {
  const records = MERIT_RECORDS
    .filter(r => r.universityId === universityId && r.programName === programName)
    .sort((a, b) => b.year - a.year);
  
  if (records.length < 2) return null;
  return records[0].closingMerit - records[1].closingMerit;
};

export const searchMeritRecords = (query: string): MeritRecord[] => {
  const lowerQuery = query.toLowerCase();
  return MERIT_RECORDS.filter(r =>
    r.universityName.toLowerCase().includes(lowerQuery) ||
    r.universityShortName.toLowerCase().includes(lowerQuery) ||
    r.programName.toLowerCase().includes(lowerQuery) ||
    r.city.toLowerCase().includes(lowerQuery)
  );
};

export const getHighestMeritPrograms = (year: number = 2024): MeritRecord[] => {
  return MERIT_RECORDS
    .filter(r => r.year === year)
    .sort((a, b) => b.closingMerit - a.closingMerit)
    .slice(0, 10);
};

export const getLowestMeritPrograms = (year: number = 2024): MeritRecord[] => {
  return MERIT_RECORDS
    .filter(r => r.year === year)
    .sort((a, b) => a.closingMerit - b.closingMerit)
    .slice(0, 10);
};
