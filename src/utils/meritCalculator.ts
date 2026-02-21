/**
 * Merit Calculator Utility
 * Converts raw exam scores to aggregate percentages using official
 * Pakistani university admission formulas.
 *
 * Covers: MDCAT, ECAT, NET, FAT (FAST), NAT, ETEA, LCAT, IBA Test,
 *         GIKI Test, PIEAS Test, and NCA Aptitude Test.
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type EntryTestId =
  | 'mdcat'
  | 'ecat'
  | 'net'   // NUST NET
  | 'fat'   // FAST Admission Test
  | 'nat'   // NTS NAT (general)
  | 'nat_ie'// NTS NAT-IE (engineering)
  | 'etea'  // KPK ETEA
  | 'lcat'  // LUMS Admission Test / SAT
  | 'iba'   // IBA Karachi Own Test
  | 'giki'  // GIKI Own Test
  | 'pieas' // PIEAS Own Test
  | 'nca'   // NCA Aptitude Test
  | 'aku'   // AKU Test
  | 'nums'  // NUMS Entry Test
  | 'bzu'   // BZU Own Test
  | 'pu'    // Punjab University Own Test
  ;

export interface EntryTestMeta {
  id: EntryTestId;
  name: string;
  fullName: string;
  conductingBody: string;
  totalMarks: number;
  passingMarks: number;
  syllabus: string[];
  registrationFee: number;       // PKR
  testDate: string;              // Approximate schedule
  website: string;
  resultType: 'score' | 'percentile' | 'scaled'; // how the result is reported
  scaleNote?: string;            // e.g. "Score out of 210, used as % directly"
}

export interface UniversityFormula {
  universityId: string;       // matches meritRecords universityId
  universityShortName: string;
  programs: string[];         // which programs this formula applies to
  matric: number;             // weight 0–1
  inter: number;              // weight 0–1
  entryTest: number;          // weight 0–1
  hafizBonus: number;         // flat bonus marks added to aggregate
  entryTestId: EntryTestId | null;
  entryTestNote?: string;
  formulaLabel: string;       // human-readable formula string
  source: string;             // official URL
}

export interface QuotaType {
  id: string;
  name: string;
  description: string;
  typicalReduction: number;   // how many aggregate points lower than open merit
  eligibilityCriteria: string[];
}

export interface MeritCalculationInput {
  matricMarks: number;
  matricTotal: number;        // usually 1100 (9 subjects BISE) or 850/900 (some boards)
  interMarks: number;
  interTotal: number;         // usually 1100 (FSc BISE) or 1200 (some boards include prac)
  entryTestScore?: number;
  entryTestTotal?: number;
  universityId?: string;      // if specified, uses exact formula
  isHafiz?: boolean;
  quotaType?: string;         // 'open' | 'women' | 'fata' | 'self-finance' | 'sports'
}

export interface MeritCalculationResult {
  aggregate: number;          // final aggregate percentage (0–100)
  matricPercent: number;
  interPercent: number;
  entryTestPercent: number | null;
  formulaUsed: string;        // e.g. "Matric 10% + FSc 40% + MDCAT 50%"
  universityFormula?: UniversityFormula;
  breakdown: {
    matricContribution: number;
    interContribution: number;
    entryTestContribution: number;
    hafizBonus: number;
    total: number;
  };
  chanceLevel: 'excellent' | 'good' | 'moderate' | 'low' | 'very_low' | 'unknown';
  quotaNote?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTRY TEST METADATA
// ─────────────────────────────────────────────────────────────────────────────

export const ENTRY_TESTS_META: Record<EntryTestId, EntryTestMeta> = {
  mdcat: {
    id: 'mdcat',
    name: 'MDCAT',
    fullName: 'Medical & Dental College Admission Test',
    conductingBody: 'Pakistan Medical Commission (PMC)',
    totalMarks: 210,
    passingMarks: 110,           // 60% score threshold for most provinces
    syllabus: ['Biology 80 MCQs', 'Chemistry 60 MCQs', 'Physics 44 MCQs', 'English 18 MCQs', 'Logical Reasoning 8 MCQs'],
    registrationFee: 5500,
    testDate: 'August–September annually',
    website: 'https://www.pmc.gov.pk/mdcat',
    resultType: 'score',
    scaleNote: 'Scored out of 210; used as (score/210)×100 in aggregate formula',
  },
  ecat: {
    id: 'ecat',
    name: 'ECAT',
    fullName: 'Engineering College Admission Test',
    conductingBody: 'UET Lahore',
    totalMarks: 400,
    passingMarks: 200,
    syllabus: ['Mathematics 100 marks', 'Physics 100 marks', 'Chemistry 100 marks', 'English 100 marks'],
    registrationFee: 2500,
    testDate: 'July annually',
    website: 'https://uet.edu.pk/ecat',
    resultType: 'score',
    scaleNote: 'Scored out of 400; (score/400)×100 used in aggregate',
  },
  net: {
    id: 'net',
    name: 'NUST NET',
    fullName: 'NUST Entry Test',
    conductingBody: 'NUST (National University of Sciences & Technology)',
    totalMarks: 200,
    passingMarks: 60,
    syllabus: ['Subject MCQs based on program', 'IQ / Analytical', 'English'],
    registrationFee: 3500,
    testDate: 'November–December & April–May',
    website: 'https://nust.edu.pk/net',
    resultType: 'score',
    scaleNote: 'NET score /200 converted to percentage; NUST formula: Matric 10% + FSc 15% + NET 75%',
  },
  fat: {
    id: 'fat',
    name: 'FAST FAT',
    fullName: 'FAST-NU Admission Test',
    conductingBody: 'FAST National University',
    totalMarks: 100,
    passingMarks: 50,
    syllabus: ['Mathematics 40%', 'English 20%', 'IQ/Aptitude 20%', 'Physics/CS 20%'],
    registrationFee: 2500,
    testDate: 'April–July (multiple sessions)',
    website: 'https://www.nu.edu.pk/Admissions',
    resultType: 'score',
    scaleNote: 'Score out of 100 used directly as test percentage',
  },
  nat: {
    id: 'nat',
    name: 'NAT',
    fullName: 'National Aptitude Test',
    conductingBody: 'NTS (National Testing Service)',
    totalMarks: 100,
    passingMarks: 45,
    syllabus: ['Verbal 20%', 'Quantitative 20%', 'Analytical 20%', 'Subject-specific 40%'],
    registrationFee: 850,
    testDate: 'Monthly throughout the year',
    website: 'https://nts.org.pk/nat',
    resultType: 'score',
    scaleNote: 'NAT score /100 used directly. NAT-IM for medical, NAT-IE for engineering, NAT-ICS for CS',
  },
  nat_ie: {
    id: 'nat_ie',
    name: 'NAT-IE',
    fullName: 'National Aptitude Test – Engineering',
    conductingBody: 'NTS',
    totalMarks: 100,
    passingMarks: 45,
    syllabus: ['Mathematics', 'Physics', 'English', 'Analytical Reasoning'],
    registrationFee: 850,
    testDate: 'Monthly',
    website: 'https://nts.org.pk/nat',
    resultType: 'score',
    scaleNote: 'Score /100 used directly. Accepted by COMSATS, Bahria, UCP and many others',
  },
  etea: {
    id: 'etea',
    name: 'ETEA',
    fullName: 'Educational Testing & Evaluation Agency Test',
    conductingBody: 'KPK Government / ETEA',
    totalMarks: 200,
    passingMarks: 100,
    syllabus: ['Biology/Mathematics based on program', 'Physics', 'Chemistry', 'English'],
    registrationFee: 2000,
    testDate: 'July–August annually',
    website: 'https://etea.edu.pk',
    resultType: 'score',
    scaleNote: 'Score /200 × 100 for medical/engineering programs in KPK',
  },
  lcat: {
    id: 'lcat',
    name: 'LCAT / SAT',
    fullName: 'LUMS Common Admission Test / SAT',
    conductingBody: 'LUMS or College Board (SAT)',
    totalMarks: 100,
    passingMarks: 0,
    syllabus: ['Quantitative Reasoning', 'Verbal', 'Analytical Essay', 'Subject (ECAT/MDCAT score converted)'],
    registrationFee: 5000,
    testDate: 'October–March (multiple rounds)',
    website: 'https://lums.edu.pk/admissions',
    resultType: 'scaled',
    scaleNote: 'LUMS converts LCAT/SAT/ECAT/MDCAT to percentile. No fixed formula — holistic + test-heavy (100% weight on test+interview). SAT 1400+ ≈ 90 percentile.',
  },
  iba: {
    id: 'iba',
    name: 'IBA Test',
    fullName: 'IBA Karachi Admission Test',
    conductingBody: 'Institute of Business Administration, Karachi',
    totalMarks: 100,
    passingMarks: 50,
    syllabus: ['English 50%', 'Mathematics 35%', 'Analytical/IQ 15%'],
    registrationFee: 4000,
    testDate: 'January–April (multiple sessions)',
    website: 'https://iba.edu.pk/admissions',
    resultType: 'score',
    scaleNote: 'IBA Test /100. IBA uses test score entirely; academic marks have near-zero weight in shortlisting.',
  },
  giki: {
    id: 'giki',
    name: 'GIKI Test',
    fullName: 'GIK Institute Entry Test',
    conductingBody: 'Ghulam Ishaq Khan Institute',
    totalMarks: 200,
    passingMarks: 100,
    syllabus: ['Mathematics', 'Physics', 'English', 'Chemistry (where applicable)'],
    registrationFee: 3500,
    testDate: 'March–May',
    website: 'https://giki.edu.pk/admissions/',
    resultType: 'score',
    scaleNote: 'GIKI Test /200. Formula: Matric 10% + FSc 15% + GIKI Test 75%',
  },
  pieas: {
    id: 'pieas',
    name: 'PIEAS Test',
    fullName: 'PIEAS Admission Test (PAT)',
    conductingBody: 'Pakistan Institute of Engineering & Applied Sciences',
    totalMarks: 100,
    passingMarks: 50,
    syllabus: ['Mathematics', 'Physics', 'Chemistry', 'English'],
    registrationFee: 3000,
    testDate: 'March–May',
    website: 'https://www.pieas.edu.pk/admissions',
    resultType: 'score',
    scaleNote: 'PAT score /100. Formula: Matric 10% + FSc 20% + PAT 70%',
  },
  nca: {
    id: 'nca',
    name: 'NCA Test',
    fullName: 'National College of Arts Aptitude Test',
    conductingBody: 'National College of Arts',
    totalMarks: 100,
    passingMarks: 50,
    syllabus: ['Aptitude/Drawing', 'Color Theory', 'Portfolio (30%)', 'Interview'],
    registrationFee: 2000,
    testDate: 'February–April',
    website: 'https://www.nca.edu.pk/admissions/',
    resultType: 'score',
    scaleNote: 'NCA Test 50% + Portfolio 30% + Interview 20%. FSc/FA marks 20% weight',
  },
  aku: {
    id: 'aku',
    name: 'AKU-EB Test',
    fullName: 'Aga Khan University Examination Board Test',
    conductingBody: 'Aga Khan University',
    totalMarks: 100,
    passingMarks: 60,
    syllabus: ['Biology', 'Chemistry', 'Physics', 'English', 'Analytical'],
    registrationFee: 8000,
    testDate: 'October–November',
    website: 'https://www.aku.edu/admissions/',
    resultType: 'score',
    scaleNote: 'Formula: FSc/A-Level 30% + AKU Test 50% + Interview 20%. Very competitive.',
  },
  nums: {
    id: 'nums',
    name: 'NUMS Test',
    fullName: 'NUMS Entry Test',
    conductingBody: 'National University of Medical Sciences',
    totalMarks: 200,
    passingMarks: 110,
    syllabus: ['Biology', 'Chemistry', 'Physics', 'English', 'Logical Reasoning'],
    registrationFee: 4000,
    testDate: 'July–August',
    website: 'https://www.nums.edu.pk/admissions/',
    resultType: 'score',
    scaleNote: 'Score /200 × 100. Formula: Matric 10% + FSc 40% + NUMS Test 50%. For CMH and affiliated colleges.',
  },
  bzu: {
    id: 'bzu',
    name: 'BZU Test',
    fullName: 'Bahauddin Zakariya University Entry Test',
    conductingBody: 'BZU Multan',
    totalMarks: 100,
    passingMarks: 45,
    syllabus: ['Program-specific subject MCQs', 'English', 'General Knowledge'],
    registrationFee: 1500,
    testDate: 'September–October',
    website: 'https://www.bzu.edu.pk/admissions/',
    resultType: 'score',
    scaleNote: 'Score /100. Formula: Matric 30% + FSc 50% + BZU Test 20%',
  },
  pu: {
    id: 'pu',
    name: 'PU Test',
    fullName: 'University of the Punjab Entry Test',
    conductingBody: 'University of the Punjab, Lahore',
    totalMarks: 100,
    passingMarks: 45,
    syllabus: ['Program-specific: Science/Arts/Commerce', 'English', 'GK'],
    registrationFee: 1500,
    testDate: 'September–October',
    website: 'https://www.pu.edu.pk/admissions/',
    resultType: 'score',
    scaleNote: 'Score /100. PU formula: Matric 20% + FSc 50% + PU Test 30%',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// UNIVERSITY MERIT FORMULAS (comprehensive)
// ─────────────────────────────────────────────────────────────────────────────

export const UNIVERSITY_FORMULAS: UniversityFormula[] = [
  // ── MEDICAL ───────────────────────────────────────────────────────────────
  { universityId: 'uhs', universityShortName: 'UHS', programs: ['MBBS', 'BDS'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 20, entryTestId: 'mdcat', formulaLabel: 'Matric 10% + FSc 40% + MDCAT 50%', source: 'https://www.uhs.edu.pk/mdcat', entryTestNote: 'MDCAT score /210 × 100 used as test %' },
  { universityId: 'dow', universityShortName: 'DOW', programs: ['MBBS', 'BDS'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 20, entryTestId: 'mdcat', formulaLabel: 'Matric 10% + FSc 40% + MDCAT 50%', source: 'https://www.duhs.edu.pk/admissions', entryTestNote: 'Sindh MDCAT' },
  { universityId: 'duhs', universityShortName: 'DUHS', programs: ['MBBS', 'BDS'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 20, entryTestId: 'mdcat', formulaLabel: 'Matric 10% + FSc 40% + MDCAT 50%', source: 'https://www.duhs.edu.pk/admissions', entryTestNote: 'Sindh MDCAT' },
  { universityId: 'kemu', universityShortName: 'KEMU', programs: ['MBBS', 'BDS'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 20, entryTestId: 'mdcat', formulaLabel: 'Matric 10% + FSc 40% + MDCAT 50%', source: 'https://www.kemu.edu.pk', entryTestNote: 'Punjab MDCAT via UHS' },
  { universityId: 'aimc', universityShortName: 'AIMC', programs: ['MBBS', 'BDS'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 20, entryTestId: 'mdcat', formulaLabel: 'Matric 10% + FSc 40% + MDCAT 50%', source: 'https://www.aimc.edu.pk', entryTestNote: 'Punjab MDCAT via UHS' },
  { universityId: 'fjmu', universityShortName: 'FJMU', programs: ['MBBS', 'BDS'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 20, entryTestId: 'mdcat', formulaLabel: 'Matric 10% + FSc 40% + MDCAT 50%', source: 'https://www.fjmu.edu.pk', entryTestNote: 'Punjab MDCAT via UHS' },
  { universityId: 'nums', universityShortName: 'NUMS', programs: ['MBBS', 'BDS', 'Nursing'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 0, entryTestId: 'nums', formulaLabel: 'Matric 10% + FSc 40% + NUMS Test 50%', source: 'https://www.nums.edu.pk/admissions/', entryTestNote: 'NUMS Test /200' },
  { universityId: 'aku', universityShortName: 'AKU', programs: ['MBBS', 'Nursing'], matric: 0.00, inter: 0.30, entryTest: 0.50, hafizBonus: 0, entryTestId: 'aku', formulaLabel: 'FSc/A-Level 30% + AKU Test 50% + Interview 20%', source: 'https://www.aku.edu/admissions/', entryTestNote: 'Interview component 20%' },
  { universityId: 'kmu', universityShortName: 'KMU', programs: ['MBBS', 'BDS', 'Pharmacy'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 20, entryTestId: 'etea', formulaLabel: 'Matric 10% + FSc 40% + ETEA MDCAT 50%', source: 'https://www.kmu.edu.pk', entryTestNote: 'KPK uses ETEA MDCAT, not PMC' },
  { universityId: 'rmc', universityShortName: 'RMC', programs: ['MBBS', 'BDS'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 20, entryTestId: 'mdcat', formulaLabel: 'Matric 10% + FSc 40% + MDCAT 50%', source: 'https://www.rmc.edu.pk', entryTestNote: 'Punjab MDCAT via UHS' },
  { universityId: 'smbbmu', universityShortName: 'SMBBMU', programs: ['MBBS', 'BDS'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 20, entryTestId: 'mdcat', formulaLabel: 'Matric 10% + FSc 40% + MDCAT 50%', source: 'https://www.smbbmu.edu.pk', entryTestNote: 'Sindh MDCAT' },
  { universityId: 'isra', universityShortName: 'ISRA', programs: ['MBBS', 'BDS'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 0, entryTestId: 'mdcat', formulaLabel: 'Matric 10% + FSc 40% + MDCAT 50%', source: 'https://www.iuhs.edu.pk', entryTestNote: 'Private, uses PMC MDCAT' },
  { universityId: 'riphah', universityShortName: 'RIPHAH', programs: ['MBBS', 'BDS', 'Pharmacy', 'Physical Therapy'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 0, entryTestId: 'mdcat', formulaLabel: 'Matric 10% + FSc 40% + MDCAT 50%', source: 'https://riphah.edu.pk/admissions/', entryTestNote: 'PMC MDCAT for medical programs' },
  // ── ENGINEERING ───────────────────────────────────────────────────────────
  { universityId: 'nust', universityShortName: 'NUST', programs: ['BE', 'BS Engineering', 'BS CS'], matric: 0.10, inter: 0.15, entryTest: 0.75, hafizBonus: 0, entryTestId: 'net', formulaLabel: 'Matric 10% + FSc 15% + NET 75%', source: 'https://nust.edu.pk/admissions', entryTestNote: 'NET score /200; dominates admission outcome' },
  { universityId: 'uet', universityShortName: 'UET', programs: ['BE', 'BS Engineering'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 20, entryTestId: 'ecat', formulaLabel: 'Matric 10% + FSc 40% + ECAT 50%', source: 'https://uet.edu.pk/ecat', entryTestNote: 'ECAT /400' },
  { universityId: 'neduet', universityShortName: 'NEDUET', programs: ['BE', 'BS Engineering'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 20, entryTestId: 'ecat', formulaLabel: 'Matric 10% + FSc 40% + ECAT 50%', source: 'https://www.neduet.edu.pk', entryTestNote: 'Sindh ECAT' },
  { universityId: 'muet', universityShortName: 'MUET', programs: ['BE', 'BS Engineering'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 20, entryTestId: 'ecat', formulaLabel: 'Matric 10% + FSc 40% + ECAT 50%', source: 'https://www.muet.edu.pk', entryTestNote: 'Sindh ECAT or MUET local test' },
  { universityId: 'giki', universityShortName: 'GIKI', programs: ['BE', 'BS Engineering'], matric: 0.10, inter: 0.15, entryTest: 0.75, hafizBonus: 0, entryTestId: 'giki', formulaLabel: 'Matric 10% + FSc 15% + GIKI Test 75%', source: 'https://giki.edu.pk/admissions/', entryTestNote: 'GIKI own test /200' },
  { universityId: 'pieas', universityShortName: 'PIEAS', programs: ['BE', 'BS Engineering', 'BS Physics'], matric: 0.10, inter: 0.20, entryTest: 0.70, hafizBonus: 0, entryTestId: 'pieas', formulaLabel: 'Matric 10% + FSc 20% + PAT 70%', source: 'https://www.pieas.edu.pk/admissions', entryTestNote: 'PIEAS Aptitude Test (PAT) /100' },
  { universityId: 'comsats', universityShortName: 'COMSATS', programs: ['BE', 'BS CS', 'BS Engineering'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 0, entryTestId: 'nat_ie', formulaLabel: 'Matric 10% + FSc 40% + NAT/ECAT 50%', source: 'https://www.cuonline.edu.pk', entryTestNote: 'NAT-IE or ECAT accepted' },
  { universityId: 'uettaxila', universityShortName: 'UETTAXILA', programs: ['BE', 'BS Engineering'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 20, entryTestId: 'ecat', formulaLabel: 'Matric 10% + FSc 40% + ECAT 50%', source: 'https://web.uettaxila.edu.pk', entryTestNote: 'ECAT /400' },
  { universityId: 'kiet', universityShortName: 'KIET', programs: ['BE', 'BS Engineering'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 20, entryTestId: 'etea', formulaLabel: 'Matric 10% + FSc 40% + ETEA 50%', source: 'https://www.kiet.edu.pk', entryTestNote: 'KPK ETEA' },
  { universityId: 'uet-peshawar', universityShortName: 'UETPESHAWAR', programs: ['BE', 'BS Engineering'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 20, entryTestId: 'etea', formulaLabel: 'Matric 10% + FSc 40% + ETEA 50%', source: 'https://www.uetpeshawar.edu.pk', entryTestNote: 'KPK ETEA for engineering' },
  { universityId: 'bahria', universityShortName: 'BAHRIA', programs: ['BE', 'BS Engineering', 'BS CS', 'BBA'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 0, entryTestId: 'nat', formulaLabel: 'Matric 10% + FSc 40% + NAT/Bahria Test 50%', source: 'https://www.bahria.edu.pk/admissions/', entryTestNote: 'NAT or Bahria own entry test' },
  { universityId: 'ist', universityShortName: 'IST', programs: ['BE', 'BS Engineering', 'BS CS'], matric: 0.10, inter: 0.30, entryTest: 0.50, hafizBonus: 0, entryTestId: 'nat_ie', formulaLabel: 'Matric 10% + FSc 30% + IST Test 50% + Interview 10%', source: 'https://www.ist.edu.pk/admissions', entryTestNote: 'IST Test + Interview (10% combined)' },
  { universityId: 'ntu', universityShortName: 'NTU', programs: ['BE', 'BS Engineering'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 0, entryTestId: 'ecat', formulaLabel: 'Matric 10% + FSc 40% + ECAT 50%', source: 'https://www.ntu.edu.pk/admissions/', entryTestNote: 'ECAT Punjab' },
  { universityId: 'superior', universityShortName: 'SUPERIOR', programs: ['BE', 'BS Engineering'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 0, entryTestId: 'nat_ie', formulaLabel: 'Matric 10% + FSc 40% + NAT-IE 50%', source: 'https://superior.edu.pk', entryTestNote: 'NAT-IE accepted' },
  // ── COMPUTER SCIENCE / IT ─────────────────────────────────────────────────
  { universityId: 'fast', universityShortName: 'FAST', programs: ['BS CS', 'BS SE', 'BS DS', 'BS AI', 'BS EE'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 0, entryTestId: 'fat', formulaLabel: 'Matric 10% + FSc 40% + FAT 50%', source: 'https://nu.edu.pk/Admissions', entryTestNote: 'FAST own test (FAT) /100' },
  { universityId: 'itu', universityShortName: 'ITU', programs: ['BS CS', 'BS EE', 'BS DS'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 0, entryTestId: 'nat_ie', formulaLabel: 'Matric 10% + FSc 40% + NAT-IE/ITU Test 50%', source: 'https://itu.edu.pk/admissions/', entryTestNote: 'ITU Test or NAT-IE accepted' },
  { universityId: 'pucit', universityShortName: 'PUCIT', programs: ['BS CS', 'BS IT', 'BS SE'], matric: 0.20, inter: 0.50, entryTest: 0.30, hafizBonus: 20, entryTestId: 'pu', formulaLabel: 'Matric 20% + FSc 50% + PU Test 30%', source: 'https://www.pucit.edu.pk', entryTestNote: 'PU own test for PUCIT' },
  // ── BUSINESS / MANAGEMENT ─────────────────────────────────────────────────
  { universityId: 'lums', universityShortName: 'LUMS', programs: ['BS', 'BBA', 'LLB'], matric: 0.00, inter: 0.00, entryTest: 1.00, hafizBonus: 0, entryTestId: 'lcat', formulaLabel: 'LCAT/SAT Score 100% (holistic review)', source: 'https://lums.edu.pk/admissions', entryTestNote: 'Academic marks have minimal weight; LCAT/SAT + interview decides' },
  { universityId: 'iba', universityShortName: 'IBA', programs: ['BBA', 'BS Econ', 'BS Acct'], matric: 0.00, inter: 0.00, entryTest: 1.00, hafizBonus: 0, entryTestId: 'iba', formulaLabel: 'IBA Test 100% (test + interview shortlisting)', source: 'https://iba.edu.pk/admissions', entryTestNote: 'Academic marks used for initial screen only; IBA test /100 dominates' },
  { universityId: 'szabist', universityShortName: 'SZABIST', programs: ['BBA', 'BS CS', 'BS Telecom'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 0, entryTestId: 'nat', formulaLabel: 'Matric 10% + FSc 40% + NAT/SZABIST Test 50%', source: 'https://www.szabist-isb.edu.pk/admissions/', entryTestNote: 'NAT or SZABIST own test' },
  { universityId: 'ucp', universityShortName: 'UCP', programs: ['BBA', 'BS CS', 'BS Pharmacy'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 0, entryTestId: 'nat', formulaLabel: 'Matric 10% + FSc 40% + NAT 50%', source: 'https://ucp.edu.pk/admissions/', entryTestNote: 'NAT accepted' },
  { universityId: 'leads', universityShortName: 'LEADS', programs: ['BBA', 'BS CS', 'BS Engineering'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 0, entryTestId: 'nat', formulaLabel: 'Matric 10% + FSc 40% + NAT 50%', source: 'https://leads.edu.pk/admissions', entryTestNote: 'NAT or LEADS entry test' },
  // ── GENERAL / MULTI-PROGRAM ───────────────────────────────────────────────
  { universityId: 'pu', universityShortName: 'PU', programs: ['BS', 'BBA', 'LLB', 'BE', 'BPharm'], matric: 0.20, inter: 0.50, entryTest: 0.30, hafizBonus: 20, entryTestId: 'pu', formulaLabel: 'Matric 20% + FSc 50% + PU Test 30%', source: 'https://www.pu.edu.pk/admissions/', entryTestNote: 'PU test /100; Hafiz bonus 20 marks' },
  { universityId: 'bzu', universityShortName: 'BZU', programs: ['BS', 'BBA', 'BE', 'BPharm'], matric: 0.30, inter: 0.50, entryTest: 0.20, hafizBonus: 20, entryTestId: 'bzu', formulaLabel: 'Matric 30% + FSc 50% + BZU Test 20%', source: 'https://www.bzu.edu.pk/admissions/', entryTestNote: 'BZU test /100' },
  { universityId: 'qau', universityShortName: 'QAU', programs: ['BS', 'MS'], matric: 0.20, inter: 0.50, entryTest: 0.30, hafizBonus: 20, entryTestId: 'nat', formulaLabel: 'Matric 20% + FSc 50% + NAT 30%', source: 'https://www.qau.edu.pk/admissions/', entryTestNote: 'NAT required for QAU' },
  { universityId: 'uos', universityShortName: 'UOS', programs: ['BS', 'BBA', 'BE'], matric: 0.20, inter: 0.50, entryTest: 0.30, hafizBonus: 20, entryTestId: 'nat', formulaLabel: 'Matric 20% + FSc 50% + NAT 30%', source: 'https://www.uos.edu.pk/admissions/', entryTestNote: 'NAT or UOS own test' },
  { universityId: 'iub', universityShortName: 'IUB', programs: ['BS', 'BBA', 'BE'], matric: 0.20, inter: 0.50, entryTest: 0.30, hafizBonus: 20, entryTestId: 'nat', formulaLabel: 'Matric 20% + FSc 50% + NAT 30%', source: 'https://www.iub.edu.pk/admissions/', entryTestNote: 'NAT or IUB local test' },
  { universityId: 'uop', universityShortName: 'UOP', programs: ['BS', 'BBA', 'BE'], matric: 0.20, inter: 0.50, entryTest: 0.30, hafizBonus: 20, entryTestId: 'nat', formulaLabel: 'Matric 20% + FSc 50% + NAT 30%', source: 'https://www.uop.edu.pk/admissions/', entryTestNote: 'NAT or UOP own test' },
  { universityId: 'uog', universityShortName: 'UOG', programs: ['BS', 'BBA'], matric: 0.20, inter: 0.60, entryTest: 0.20, hafizBonus: 20, entryTestId: 'nat', formulaLabel: 'Matric 20% + FSc 60% + NAT 20%', source: 'https://www.uog.edu.pk/admissions/', entryTestNote: 'NAT' },
  { universityId: 'uajk', universityShortName: 'UAJK', programs: ['BS', 'BBA', 'LLB'], matric: 0.40, inter: 0.60, entryTest: 0.00, hafizBonus: 20, entryTestId: null, formulaLabel: 'Matric 40% + Inter 60% (no entry test)', source: 'https://www.ajku.edu.pk/admissions/', entryTestNote: 'No entry test required' },
  { universityId: 'uaf', universityShortName: 'UAF', programs: ['BS Agriculture', 'BS Food Science', 'DVM', 'BS Horticulture'], matric: 0.20, inter: 0.60, entryTest: 0.20, hafizBonus: 20, entryTestId: 'nat', formulaLabel: 'Matric 20% + FSc 60% + NAT 20%', source: 'https://www.uaf.edu.pk/admissions/', entryTestNote: 'NAT or UAF test' },
  // ── ARTS / DESIGN ─────────────────────────────────────────────────────────
  { universityId: 'nca', universityShortName: 'NCA', programs: ['BFA', 'BDes', 'BArch'], matric: 0.00, inter: 0.20, entryTest: 0.50, hafizBonus: 0, entryTestId: 'nca', formulaLabel: 'FSc/FA 20% + NCA Aptitude Test 50% + Portfolio 30%', source: 'https://www.nca.edu.pk/admissions/', entryTestNote: 'Portfolio review is 30% of merit' },
  { universityId: 'bnu', universityShortName: 'BNU', programs: ['BS', 'BFA', 'BDes'], matric: 0.00, inter: 0.30, entryTest: 0.40, hafizBonus: 0, entryTestId: 'nat', formulaLabel: 'FSc/FA 30% + BNU Test 40% + Interview/Portfolio 30%', source: 'https://www.bnu.edu.pk/admissions/', entryTestNote: 'BNU own test + interview' },
  // ── DEFAULT ───────────────────────────────────────────────────────────────
  { universityId: '_default_test', universityShortName: '_DEFAULT_TEST', programs: ['Any'], matric: 0.10, inter: 0.40, entryTest: 0.50, hafizBonus: 0, entryTestId: 'nat', formulaLabel: 'Matric 10% + FSc 40% + Entry Test 50% (Standard)', source: 'https://hec.gov.pk', entryTestNote: 'HEC standard formula' },
  { universityId: '_default_no_test', universityShortName: '_DEFAULT_NO_TEST', programs: ['Any'], matric: 0.20, inter: 0.80, entryTest: 0.00, hafizBonus: 0, entryTestId: null, formulaLabel: 'Matric 20% + FSc 80% (No Entry Test)', source: 'https://hec.gov.pk', entryTestNote: undefined },
];

// ─────────────────────────────────────────────────────────────────────────────
// QUOTA TYPES
// ─────────────────────────────────────────────────────────────────────────────

export const QUOTA_TYPES: QuotaType[] = [
  {
    id: 'open',
    name: 'Open Merit',
    description: 'General category — highest merit required; open to all students',
    typicalReduction: 0,
    eligibilityCriteria: ['All students with required qualifications'],
  },
  {
    id: 'self-finance',
    name: 'Self-Finance',
    description: 'Lower merit required but full fee paid by student (no government subsidy)',
    typicalReduction: 3,          // typically 3–8 points below open merit
    eligibilityCriteria: ['Student pays full unsubsidised fee', 'Similar academic requirements'],
  },
  {
    id: 'women',
    name: 'Women Quota',
    description: '5–15% of seats reserved for female students in many universities',
    typicalReduction: 2,
    eligibilityCriteria: ['Female students only', 'Same academic requirements but separate merit list'],
  },
  {
    id: 'fata_pata',
    name: 'FATA/PATA Quota',
    description: 'Reserved seats for students from tribal districts (formerly FATA, now KPK merged districts)',
    typicalReduction: 15,          // significant reduction — designed for access
    eligibilityCriteria: [
      'Domicile from former FATA/PATA districts',
      'Districts: Khyber, Kurram, North Waziristan, South Waziristan, Bajaur, Mohmand, Orakzai',
      'Proof of domicile required',
    ],
  },
  {
    id: 'balochistan',
    name: 'Balochistan Quota',
    description: 'Reserved seats for students from Balochistan in federal/national universities',
    typicalReduction: 15,
    eligibilityCriteria: [
      'Balochistan domicile holder',
      'Specially at NUST, COMSATS, QAU, and HEC-affiliated institutions',
    ],
  },
  {
    id: 'azad_kashmir',
    name: 'AJK Quota',
    description: 'Reserved seats for Azad Jammu & Kashmir students',
    typicalReduction: 10,
    eligibilityCriteria: ['AJK domicile holder'],
  },
  {
    id: 'disabled',
    name: 'Special Persons Quota',
    description: '2% of seats reserved for students with disabilities per HEC policy',
    typicalReduction: 10,
    eligibilityCriteria: [
      'NADRA disability certificate',
      'Physical, visual, hearing, or intellectual disability',
      'Minimum 40% marks in matric and inter',
    ],
  },
  {
    id: 'hafiz',
    name: 'Hafiz-e-Quran Bonus',
    description: '20 extra marks added to aggregate (standard across all public university formulas)',
    typicalReduction: -20,        // negative = bonus, lowers the effective threshold
    eligibilityCriteria: [
      'Hifz certificate from recognised madrassa',
      'Verification at university admission office',
    ],
  },
  {
    id: 'sports',
    name: 'Sports Quota',
    description: 'Reserved for students with national/provincial-level sports representation',
    typicalReduction: 10,
    eligibilityCriteria: [
      'National or Provincial sports certificate',
      'Pakistan Sports Board or Provincial Sports Directorate letter',
      'Usually 1–5 seats per university',
    ],
  },
  {
    id: 'nrp',
    name: 'NRP / Overseas Pakistani',
    description: 'Seats reserved for Non-Resident Pakistanis and overseas Pakistani children',
    typicalReduction: 0,          // separate merit list, not directly comparable
    eligibilityCriteria: [
      'Pakistani passport + overseas residency/citizenship',
      'O/A Levels or equivalent international qualifications accepted',
      'Fee usually in USD/GBP (international rate)',
    ],
  },
  {
    id: 'army',
    name: 'Armed Forces Quota',
    description: 'Reserved seats for children of Pakistan Army/Navy/Air Force personnel',
    typicalReduction: 8,
    eligibilityCriteria: [
      'Father/mother serving in Pakistan Armed Forces',
      'Service certificate from relevant HQ',
      'Most prominent at Bahria, NUST, PAF-IAST, Army Medical College',
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CALCULATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalise a raw entry test score to a 0–100 percentage using the test's total marks.
 */
export function entryTestToPercent(score: number, testId: EntryTestId): number {
  const meta = ENTRY_TESTS_META[testId];
  if (!meta) return score; // assume already a percentage
  return Math.min(100, (score / meta.totalMarks) * 100);
}

/**
 * Get the best matching formula for a given university ID.
 */
export function getFormulaForUniversity(universityId: string): UniversityFormula {
  const id = universityId.toLowerCase();
  const match = UNIVERSITY_FORMULAS.find(f => f.universityId.toLowerCase() === id);
  return match ?? UNIVERSITY_FORMULAS.find(f => f.universityId === '_default_test')!;
}

/**
 * Main aggregate calculation function.
 */
export function calculateAggregate(input: MeritCalculationInput): MeritCalculationResult {
  const matricPct = (input.matricMarks / input.matricTotal) * 100;
  const interPct  = (input.interMarks  / input.interTotal)  * 100;

  // Determine formula
  const formula = input.universityId
    ? getFormulaForUniversity(input.universityId)
    : input.entryTestScore != null
      ? (UNIVERSITY_FORMULAS.find(f => f.universityId === '_default_test') ?? UNIVERSITY_FORMULAS[UNIVERSITY_FORMULAS.length - 2])
      : (UNIVERSITY_FORMULAS.find(f => f.universityId === '_default_no_test') ?? UNIVERSITY_FORMULAS[UNIVERSITY_FORMULAS.length - 1]);

  // Entry test percentage — normalise using test's total marks
  let entryTestPct: number | null = null;
  if (input.entryTestScore != null) {
    const total = input.entryTestTotal ?? (formula.entryTestId ? ENTRY_TESTS_META[formula.entryTestId]?.totalMarks : 100) ?? 100;
    entryTestPct = Math.min(100, (input.entryTestScore / total) * 100);
  }

  // If formula requires test but none provided, fall back to no-test formula
  const effectiveFormula = (entryTestPct === null && formula.entryTest > 0)
    ? (UNIVERSITY_FORMULAS.find(f => f.universityId === '_default_no_test')!)
    : formula;

  const matricContribution   = matricPct   * effectiveFormula.matric;
  const interContribution    = interPct    * effectiveFormula.inter;
  const entryTestContribution = (entryTestPct ?? 0) * effectiveFormula.entryTest;
  const hafizBonus            = input.isHafiz ? effectiveFormula.hafizBonus : 0;
  const total = matricContribution + interContribution + entryTestContribution + hafizBonus;

  // Chance estimation — generic buckets
  let chanceLevel: MeritCalculationResult['chanceLevel'] = 'unknown';
  if (total >= 90) chanceLevel = 'excellent';
  else if (total >= 80) chanceLevel = 'good';
  else if (total >= 70) chanceLevel = 'moderate';
  else if (total >= 60) chanceLevel = 'low';
  else chanceLevel = 'very_low';

  // Quota note
  let quotaNote: string | undefined;
  if (input.quotaType && input.quotaType !== 'open') {
    const quota = QUOTA_TYPES.find(q => q.id === input.quotaType);
    if (quota) {
      const adj = quota.typicalReduction > 0
        ? `Typically ${quota.typicalReduction} points below open merit`
        : quota.typicalReduction < 0
          ? `+${Math.abs(quota.typicalReduction)} bonus marks added to your aggregate`
          : 'Separate merit list applies';
      quotaNote = `${quota.name}: ${adj}. ${quota.description}`;
    }
  }

  return {
    aggregate: Math.round(total * 100) / 100,
    matricPercent: Math.round(matricPct * 100) / 100,
    interPercent:  Math.round(interPct  * 100) / 100,
    entryTestPercent: entryTestPct !== null ? Math.round(entryTestPct * 100) / 100 : null,
    formulaUsed: effectiveFormula.formulaLabel,
    universityFormula: formula,
    breakdown: {
      matricContribution:    Math.round(matricContribution    * 100) / 100,
      interContribution:     Math.round(interContribution     * 100) / 100,
      entryTestContribution: Math.round(entryTestContribution * 100) / 100,
      hafizBonus:            hafizBonus,
      total:                 Math.round(total * 100) / 100,
    },
    chanceLevel,
    quotaNote,
  };
}

/**
 * Compare a user's calculated aggregate against historical merit records for a
 * given university and program, returning a qualified chance assessment.
 */
export function assessChanceAgainstMerit(
  userAggregate: number,
  closingMerit: number,
  openingMerit?: number,
): {
  chanceLevel: MeritCalculationResult['chanceLevel'];
  gapPoints: number;           // positive = above closing merit (good)
  meritBand: 'above_opening' | 'between' | 'above_closing' | 'below_closing';
  message: string;
} {
  const gap = userAggregate - closingMerit;

  if (openingMerit && userAggregate >= openingMerit) {
    return { chanceLevel: 'excellent', gapPoints: gap, meritBand: 'above_opening', message: `Your aggregate exceeds last year's opening merit — excellent chance. You're ${(userAggregate - openingMerit).toFixed(1)} points above opening merit.` };
  }
  if (openingMerit && userAggregate >= closingMerit && userAggregate < openingMerit) {
    return { chanceLevel: 'good', gapPoints: gap, meritBand: 'between', message: `Within the merit band — good chance (between opening and closing merit). Competition will be high.` };
  }
  if (gap >= 0) {
    return { chanceLevel: 'good', gapPoints: gap, meritBand: 'above_closing', message: `Above closing merit by ${gap.toFixed(1)} points — strong chance if trends hold.` };
  }
  if (gap >= -3) {
    return { chanceLevel: 'moderate', gapPoints: gap, meritBand: 'below_closing', message: `Only ${Math.abs(gap).toFixed(1)} points below closing merit — borderline. Check self-finance and quota seats.` };
  }
  if (gap >= -8) {
    return { chanceLevel: 'low', gapPoints: gap, meritBand: 'below_closing', message: `${Math.abs(gap).toFixed(1)} points below closing merit — low chance for open merit. Consider self-finance or related programs.` };
  }
  return { chanceLevel: 'very_low', gapPoints: gap, meritBand: 'below_closing', message: `${Math.abs(gap).toFixed(1)} points below closing merit — very unlikely for open merit. Look at safety schools or different programs.` };
}

/**
 * Given a user's profile, return all quota types they MAY qualify for.
 * Actual eligibility must be verified by the university.
 */
export function detectPotentialQuotas(userProfile: {
  gender?: 'male' | 'female';
  province?: string;
  city?: string;
  isHafiz?: boolean;
  hasSportsAchievement?: boolean;
  isDisabled?: boolean;
  fatherInArmedForces?: boolean;
  isOverseasPakistani?: boolean;
}): QuotaType[] {
  const possible: QuotaType[] = [];
  const { gender, province, city, isHafiz, hasSportsAchievement, isDisabled, fatherInArmedForces, isOverseasPakistani } = userProfile;
  const cityLower = (city || '').toLowerCase();
  const provinceLower = (province || '').toLowerCase();

  // Everyone qualifies for open
  possible.push(QUOTA_TYPES.find(q => q.id === 'open')!);

  if (gender === 'female') possible.push(QUOTA_TYPES.find(q => q.id === 'women')!);

  // FATA/PATA — KPK merged districts
  const fataCities = ['bajaur', 'mohmand', 'khyber', 'orakzai', 'kurram', 'waziristan', 'tank', 'malakand', 'chitral', 'dir', 'shangla', 'kohistan', 'swat', 'buner'];
  if (fataCities.some(c => cityLower.includes(c)) || (provinceLower.includes('kpk') && fataCities.some(c => cityLower.includes(c)))) {
    possible.push(QUOTA_TYPES.find(q => q.id === 'fata_pata')!);
  }

  if (provinceLower.includes('balochistan')) possible.push(QUOTA_TYPES.find(q => q.id === 'balochistan')!);
  if (provinceLower.includes('ajk') || provinceLower.includes('azad') || provinceLower.includes('kashmir')) possible.push(QUOTA_TYPES.find(q => q.id === 'azad_kashmir')!);

  if (isHafiz) possible.push(QUOTA_TYPES.find(q => q.id === 'hafiz')!);
  if (hasSportsAchievement) possible.push(QUOTA_TYPES.find(q => q.id === 'sports')!);
  if (isDisabled) possible.push(QUOTA_TYPES.find(q => q.id === 'disabled')!);
  if (fatherInArmedForces) possible.push(QUOTA_TYPES.find(q => q.id === 'army')!);
  if (isOverseasPakistani) possible.push(QUOTA_TYPES.find(q => q.id === 'nrp')!);

  return possible.filter(Boolean);
}

export default calculateAggregate;
