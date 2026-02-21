/**
 * University Fee Data — Per Semester (PKR)
 * Covers tuition only unless noted. Includes hostel ranges where available.
 * Data period: 2025-2026 academic year.
 * Sources: Official university fee schedules and admission notices.
 *
 * Fee types:
 *  - openMerit:     Government-subsidised seat (public universities)
 *  - selfFinance:   Full-cost seat at same university (public)
 *  - regular:       Standard fee for private university
 *  - international: NRP / IELTS / overseas fee
 */

export interface ProgramFee {
  programCategory: string;   // 'medical' | 'engineering' | 'cs' | 'business' | 'arts' | 'general'
  openMerit?: number;        // PKR per semester
  selfFinance?: number;      // PKR per semester
  regular?: number;          // PKR per semester (private uni)
  international?: number;    // USD per semester  (optional)
  hostelPerSemester?: number;// PKR approximate
  note?: string;
}

export interface UniversityFeeData {
  universityId: string;
  shortName: string;
  type: 'public' | 'private' | 'semi-govt';
  fees: ProgramFee[];
  scholarships: ScholarshipSummary[];
  lastUpdated: string;       // "2025" → data is from 2025 fee schedule
  officialFeeUrl?: string;
}

export interface ScholarshipSummary {
  name: string;
  coverage: string;          // "50% tuition" | "Full + stipend" | "Rs 20,000/sem"
  criteria: string;          // "90%+ aggregate" | "Need-based | GPA 3.5+"
  seats?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// FEE DATA
// ─────────────────────────────────────────────────────────────────────────────

export const UNIVERSITY_FEES: UniversityFeeData[] = [
  // ── PUBLIC MEDICAL ────────────────────────────────────────────────────────
  {
    universityId: 'kemu',
    shortName: 'KEMU',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.kemu.edu.pk/fee-structure',
    fees: [
      { programCategory: 'medical', openMerit: 140000, selfFinance: 800000, hostelPerSemester: 40000, note: 'MBBS 5 years + 1 year house job. Open merit is heavily subsidised.' },
    ],
    scholarships: [
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Family income < Rs 45,000/month' },
      { name: 'Prime Minister Scholarship', coverage: 'Full tuition + stipend', criteria: 'Merit + need-based' },
    ],
  },
  {
    universityId: 'dow',
    shortName: 'DOW / DUHS',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.duhs.edu.pk/fee-structure',
    fees: [
      { programCategory: 'medical', openMerit: 120000, selfFinance: 750000, hostelPerSemester: 35000, note: 'Sindh province public medical. Self-finance is significantly higher.' },
    ],
    scholarships: [
      { name: 'Sindh Government Scholarship', coverage: '100% fee waiver', criteria: 'Open merit + Sindh domicile' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Family income < Rs 45,000/month' },
    ],
  },
  {
    universityId: 'kmu',
    shortName: 'KMU',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.kmu.edu.pk/fee',
    fees: [
      { programCategory: 'medical', openMerit: 110000, selfFinance: 780000, hostelPerSemester: 32000, note: 'KPK public medical. One of the most affordable MBBS programs.' },
      { programCategory: 'general', openMerit: 30000, selfFinance: 120000 },
    ],
    scholarships: [
      { name: 'KPK Government Scholarship', coverage: 'Full fee waiver', criteria: 'KPK domicile + open merit' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'nums',
    shortName: 'NUMS',
    type: 'semi-govt',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.nums.edu.pk/fee-structure',
    fees: [
      { programCategory: 'medical', openMerit: 650000, selfFinance: 1200000, hostelPerSemester: 60000, note: 'NUMS-affiliated CMH colleges. Higher fee due to army-run setup.' },
    ],
    scholarships: [
      { name: 'Armed Forces Scholarship', coverage: '50–100% tuition', criteria: 'Father/mother serving in armed forces' },
      { name: 'Merit Scholarship', coverage: 'Rs 50,000 per semester', criteria: 'Top 10% aggregate' },
    ],
  },
  {
    universityId: 'aku',
    shortName: 'AKU',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.aku.edu/admissions/fees',
    fees: [
      { programCategory: 'medical', regular: 950000, hostelPerSemester: 90000, note: 'Most expensive MBBS in Pakistan but also most generous scholarship program.' },
    ],
    scholarships: [
      { name: 'AKU Scholarship (Need-Based)', coverage: 'Up to 100% tuition + hostel', criteria: 'Need-based; 60%+ of students receive aid', seats: 60 },
      { name: 'AKU Merit Award', coverage: '25–50% tuition', criteria: 'Top academic performance in AKU test' },
    ],
  },
  {
    universityId: 'riphah',
    shortName: 'RIPHAH',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://riphah.edu.pk/admissions/fee-structure/',
    fees: [
      { programCategory: 'medical', regular: 850000, hostelPerSemester: 65000, note: 'Private MBBS. RIPHAH also offers Pharmacy, Physical Therapy at lower fees.' },
      { programCategory: 'general', regular: 100000 },
    ],
    scholarships: [
      { name: 'Riphah Merit Scholarship', coverage: '25–50% tuition', criteria: '85%+ aggregate in MDCAT + academics' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Family income < Rs 45,000/month' },
    ],
  },
  // ── PUBLIC ENGINEERING ────────────────────────────────────────────────────
  {
    universityId: 'nust',
    shortName: 'NUST',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://nust.edu.pk/admissions/fee-structure/',
    fees: [
      { programCategory: 'engineering', openMerit: 105000, selfFinance: 310000, hostelPerSemester: 50000, note: 'Islamabad-based. Self-finance seats have 3× higher fee but same quality.' },
      { programCategory: 'cs', openMerit: 105000, selfFinance: 310000, hostelPerSemester: 50000 },
    ],
    scholarships: [
      { name: 'NUST Merit Scholarship', coverage: 'Full tuition', criteria: 'Top 5 students per program', seats: 5 },
      { name: 'HEC Need-Based Scholarship', coverage: 'Full tuition', criteria: 'Family income < Rs 45,000/month' },
      { name: 'NUST Financial Assistance', coverage: '25–75% tuition', criteria: 'GPA 3.0+ + need-based' },
    ],
  },
  {
    universityId: 'uet',
    shortName: 'UET',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://uet.edu.pk/admissions/fees/',
    fees: [
      { programCategory: 'engineering', openMerit: 45000, selfFinance: 180000, hostelPerSemester: 28000, note: "UET Lahore — one of Pakistan's cheapest engineering programs." },
    ],
    scholarships: [
      { name: 'UET Need-Based', coverage: 'Full tuition', criteria: 'Need-based + 60%+ marks' },
      { name: 'Shahbaz Sharif Scholarship', coverage: 'Full tuition + stipend', criteria: 'Punjab domicile + merit' },
    ],
  },
  {
    universityId: 'giki',
    shortName: 'GIKI',
    type: 'semi-govt',
    lastUpdated: '2025',
    officialFeeUrl: 'https://giki.edu.pk/admissions/fee-structure/',
    fees: [
      { programCategory: 'engineering', regular: 310000, hostelPerSemester: 55000, note: 'GIKI is residential — hostel is practically mandatory. Strong scholarship program.' },
    ],
    scholarships: [
      { name: 'GIKI Merit Scholarship', coverage: 'Up to 100% tuition', criteria: 'Top aggregate in GIKI test; tiered', seats: 30 },
      { name: 'Need-Based Grant', coverage: 'Up to 75% tuition', criteria: 'Family income < Rs 60,000/month + GPA 2.5+' },
    ],
  },
  {
    universityId: 'pieas',
    shortName: 'PIEAS',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.pieas.edu.pk/admissions/fee.htm',
    fees: [
      { programCategory: 'engineering', openMerit: 18000, selfFinance: 100000, hostelPerSemester: 24000, note: 'PIEAS is one of the most affordable elite engineering institutions.' },
    ],
    scholarships: [
      { name: 'PAEC Scholarship', coverage: 'Full tuition + stipend Rs 10,000/month', criteria: 'Merit; PAEC employees\' children get preference' },
    ],
  },
  {
    universityId: 'neduet',
    shortName: 'NEDUET',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.neduet.edu.pk/admissions/fee-structure',
    fees: [
      { programCategory: 'engineering', openMerit: 55000, selfFinance: 200000, hostelPerSemester: 30000, note: 'Karachi-based. Sindh domicile preferred.' },
    ],
    scholarships: [
      { name: 'Sindh Government Scholarship', coverage: 'Full tuition', criteria: 'Sindh domicile + open merit' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'comsats',
    shortName: 'COMSATS',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.cuonline.edu.pk/fee-structure',
    fees: [
      { programCategory: 'engineering', openMerit: 75000, selfFinance: 200000, hostelPerSemester: 35000, note: 'Multiple campuses: Islamabad, Lahore, Wah, Abbottabad, Vehari, Sahiwal.' },
      { programCategory: 'cs', openMerit: 75000, selfFinance: 200000 },
      { programCategory: 'business', openMerit: 60000, selfFinance: 160000 },
    ],
    scholarships: [
      { name: 'COMSATS Merit Scholarship', coverage: 'Full tuition', criteria: 'Top 5% aggregate entering' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
      { name: 'COMSATS Financial Assistance', coverage: '25–50% tuition', criteria: 'GPA 3.0+ + need' },
    ],
  },
  // ── ELITE PRIVATE / SEMI-GOVT ─────────────────────────────────────────────
  {
    universityId: 'lums',
    shortName: 'LUMS',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://lums.edu.pk/admissions/financial-information',
    fees: [
      { programCategory: 'business', regular: 550000, hostelPerSemester: 120000, note: 'LUMS charges flat rate across programs. One of the highest in Pakistan.' },
      { programCategory: 'cs', regular: 550000, hostelPerSemester: 120000 },
      { programCategory: 'engineering', regular: 550000, hostelPerSemester: 120000 },
    ],
    scholarships: [
      { name: 'LUMS National Outreach Programme (NOP)', coverage: 'Full tuition + hostel + stipend', criteria: 'Rural/low-income background; rigorous selection', seats: 400 },
      { name: 'LUMS Merit Scholarship', coverage: '25–100% tuition', criteria: 'SAT/LCAT score + CGPA; tiered' },
      { name: 'Shahid Hussain Foundation', coverage: 'Full scholarship', criteria: 'Need + merit; select awardees' },
    ],
  },
  {
    universityId: 'iba',
    shortName: 'IBA Karachi',
    type: 'semi-govt',
    lastUpdated: '2025',
    officialFeeUrl: 'https://iba.edu.pk/admissions/fees/',
    fees: [
      { programCategory: 'business', regular: 280000, hostelPerSemester: 75000, note: 'IBA is govt-subsidised despite semi-private status — offers best value-for-money in business education.' },
      { programCategory: 'cs', regular: 250000 },
    ],
    scholarships: [
      { name: 'IBA Need-Based Scholarship', coverage: 'Up to 100% tuition', criteria: 'Need-based; applies after IBA admission test', seats: 150 },
      { name: 'IBA Merit Scholarship', coverage: '25–50% tuition', criteria: 'Top 10% in IBA Test' },
    ],
  },
  // ── FAST (NUCES) ──────────────────────────────────────────────────────────
  {
    universityId: 'fast',
    shortName: 'FAST-NUCES',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://nu.edu.pk/Admissions/FeeStructure',
    fees: [
      { programCategory: 'cs', openMerit: 95000, selfFinance: 190000, hostelPerSemester: 45000, note: 'Campuses in Lahore, Karachi, Islamabad, Peshawar, Faisalabad, Chiniot-Faisalabad.' },
      { programCategory: 'engineering', openMerit: 95000, selfFinance: 190000 },
    ],
    scholarships: [
      { name: 'FAST Merit Scholarship', coverage: 'Full tuition', criteria: 'Top aggregate in FAT; ~top 5 per program' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  // ── BAHRIA ────────────────────────────────────────────────────────────────
  {
    universityId: 'bahria',
    shortName: 'BAHRIA',
    type: 'semi-govt',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.bahria.edu.pk/admissions/fee-structure/',
    fees: [
      { programCategory: 'engineering', regular: 150000, hostelPerSemester: 55000, note: 'Campuses in Karachi and Islamabad. Navy-run; armed forces quota available.' },
      { programCategory: 'cs', regular: 130000 },
      { programCategory: 'business', regular: 110000 },
    ],
    scholarships: [
      { name: 'Armed Forces Scholarship', coverage: '50% tuition', criteria: 'Father/mother in Pakistan Navy/Army/Air Force' },
      { name: 'Bahria Merit Scholarship', coverage: '25–50% tuition', criteria: '85%+ aggregate' },
    ],
  },
  // ── ITU ────────────────────────────────────────────────────────────────────
  {
    universityId: 'itu',
    shortName: 'ITU',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://itu.edu.pk/admissions/fee-structure/',
    fees: [
      { programCategory: 'cs', openMerit: 95000, selfFinance: 250000, hostelPerSemester: 50000, note: 'Punjab govt. Competitive for Data Science and AI programs.' },
      { programCategory: 'engineering', openMerit: 95000, selfFinance: 250000 },
    ],
    scholarships: [
      { name: 'ITU Merit Scholarship', coverage: 'Full tuition', criteria: 'Top 5 per program' },
      { name: 'Punjab CM Laptop + Scholarship', coverage: 'Laptop + 40% tuition', criteria: 'Punjab domicile + merit' },
    ],
  },
  // ── SZABIST ───────────────────────────────────────────────────────────────
  {
    universityId: 'szabist',
    shortName: 'SZABIST',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.szabist-isb.edu.pk/admissions/fee-structure/',
    fees: [
      { programCategory: 'cs', regular: 130000 },
      { programCategory: 'business', regular: 120000 },
      { programCategory: 'engineering', regular: 140000 },
    ],
    scholarships: [
      { name: 'SZABIST Merit Scholarship', coverage: '25–50% tuition', criteria: '80%+ aggregate' },
      { name: 'Zulfikar Ali Bhutto Scholarship', coverage: '100% tuition', criteria: 'Need-based; select awardees' },
    ],
  },
  // ── UCP ───────────────────────────────────────────────────────────────────
  {
    universityId: 'ucp',
    shortName: 'UCP',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://ucp.edu.pk/admissions/fee-structure/',
    fees: [
      { programCategory: 'cs', regular: 90000 },
      { programCategory: 'business', regular: 80000 },
      { programCategory: 'engineering', regular: 100000 },
      { programCategory: 'medical', regular: 650000, note: 'UCP has pharmacy and allied health programs' },
    ],
    scholarships: [
      { name: 'UCP Merit Scholarship', coverage: '25–100% tuition', criteria: '75%+ aggregate; tiered' },
    ],
  },
  // ── UMT ────────────────────────────────────────────────────────────────────
  {
    universityId: 'umt',
    shortName: 'UMT',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.umt.edu.pk/admissions/fee-structure/',
    fees: [
      { programCategory: 'cs', regular: 85000 },
      { programCategory: 'business', regular: 80000 },
      { programCategory: 'engineering', regular: 95000 },
    ],
    scholarships: [
      { name: 'UMT Academic Excellence', coverage: '25–100% tuition', criteria: '75%+ aggregate; tiered by marks band' },
    ],
  },
  // ── SUPERIOR ──────────────────────────────────────────────────────────────
  {
    universityId: 'superior',
    shortName: 'SUPERIOR',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://superior.edu.pk/admissions/fee-structure/',
    fees: [
      { programCategory: 'cs', regular: 65000 },
      { programCategory: 'business', regular: 60000 },
      { programCategory: 'engineering', regular: 75000 },
    ],
    scholarships: [
      { name: 'Superior Merit Scholarship', coverage: '25–100% tuition', criteria: 'Band-based: 90%+ = 100%, 80–89% = 50%, 70–79% = 25%' },
    ],
  },
  // ── PU ────────────────────────────────────────────────────────────────────
  {
    universityId: 'pu',
    shortName: 'PU',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.pu.edu.pk/admissions/fee-structure',
    fees: [
      { programCategory: 'general', openMerit: 18000, selfFinance: 65000, hostelPerSemester: 22000, note: 'One of the cheapest public universities in Pakistan.' },
      { programCategory: 'engineering', openMerit: 35000, selfFinance: 120000 },
      { programCategory: 'cs', openMerit: 25000, selfFinance: 85000 },
      { programCategory: 'business', openMerit: 20000, selfFinance: 70000 },
    ],
    scholarships: [
      { name: 'PU Merit Scholarship', coverage: 'Full tuition', criteria: 'Top 5 students per program' },
      { name: 'Punjab CM Scholarship', coverage: 'Full tuition + stipend', criteria: 'Punjab domicile + need + merit' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Family income threshold' },
    ],
  },
  // ── BZU ────────────────────────────────────────────────────────────────────
  {
    universityId: 'bzu',
    shortName: 'BZU',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.bzu.edu.pk/admissions/fee',
    fees: [
      { programCategory: 'general', openMerit: 16000, selfFinance: 55000, hostelPerSemester: 18000 },
      { programCategory: 'engineering', openMerit: 28000, selfFinance: 95000 },
    ],
    scholarships: [
      { name: 'Pakistan PEEF', coverage: 'Full tuition', criteria: 'Punjab domicile + need' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  // ── QAU ────────────────────────────────────────────────────────────────────
  {
    universityId: 'qau',
    shortName: 'QAU',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.qau.edu.pk/admissions/',
    fees: [
      { programCategory: 'general', openMerit: 12000, selfFinance: 50000, hostelPerSemester: 20000, note: 'Quaid-i-Azam University, Islamabad. Very affordable.' },
    ],
    scholarships: [
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
      { name: 'PM Scholarship', coverage: 'Full + stipend', criteria: 'Merit + need' },
    ],
  },
  // ── NCA ────────────────────────────────────────────────────────────────────
  {
    universityId: 'nca',
    shortName: 'NCA',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.nca.edu.pk/admissions/',
    fees: [
      { programCategory: 'arts', openMerit: 22000, selfFinance: 75000, hostelPerSemester: 25000, note: 'Fine arts, architecture, graphic design, film.' },
    ],
    scholarships: [
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
      { name: 'PM Scholarship', coverage: 'Full + stipend', criteria: 'Merit + need' },
    ],
  },
  // ── ABASYN ────────────────────────────────────────────────────────────────
  {
    universityId: 'abasyn',
    shortName: 'ABASYN',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://abasyn.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', regular: 55000 },
      { programCategory: 'business', regular: 50000 },
      { programCategory: 'engineering', regular: 65000 },
    ],
    scholarships: [
      { name: 'Abasyn Merit Scholarship', coverage: '25–100% tuition', criteria: 'Marks-band based: 80%+ = 50%, 90%+ = 100%' },
    ],
  },
  // ── NAMAL ─────────────────────────────────────────────────────────────────
  {
    universityId: 'namal',
    shortName: 'NAMAL',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://namal.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', regular: 110000, hostelPerSemester: 50000, note: 'Affiliated with University of Bradford (UK). Mianwali campus.' },
      { programCategory: 'engineering', regular: 115000, hostelPerSemester: 50000 },
    ],
    scholarships: [
      { name: 'Namal Full Scholarship', coverage: 'Full tuition + hostel', criteria: 'Need-based; Imran Khan foundation supported', seats: 100 },
      { name: 'Merit Award', coverage: '25–75% tuition', criteria: '80%+ aggregate' },
    ],
  },
  // ── HABIB ─────────────────────────────────────────────────────────────────
  {
    universityId: 'habib',
    shortName: 'HABIB',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://hu.edu.pk/admissions/fee-structure',
    fees: [
      { programCategory: 'cs', regular: 270000, hostelPerSemester: 100000, note: 'Karachi. Research-focused; US-style liberal arts+CS approach.' },
      { programCategory: 'engineering', regular: 290000, hostelPerSemester: 100000 },
    ],
    scholarships: [
      { name: 'Habib Need-Based', coverage: 'Up to 100% tuition', criteria: 'Need-based; generous endowment', seats: 80 },
      { name: 'Habib Merit Award', coverage: '25–50% tuition', criteria: 'High SAT/A-level equivalent' },
    ],
  },
  // ── ADDITIONAL PUBLIC ENGINEERING ─────────────────────────────────────────
  {
    universityId: 'uet-taxila',
    shortName: 'UET Taxila',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://uettaxila.edu.pk/admissions/',
    fees: [
      { programCategory: 'engineering', openMerit: 55000, selfFinance: 175000, hostelPerSemester: 28000, note: 'Public engineering. ECAT-based admission.' },
      { programCategory: 'cs', openMerit: 55000, selfFinance: 175000, hostelPerSemester: 28000 },
    ],
    scholarships: [
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Family income < Rs 45,000/month' },
      { name: 'Merit Scholarship', coverage: '50% tuition', criteria: 'Top 5% ECAT aggregate' },
    ],
  },
  {
    universityId: 'uet-peshawar',
    shortName: 'UET Peshawar',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://uetpeshawar.edu.pk/admissions/',
    fees: [
      { programCategory: 'engineering', openMerit: 50000, selfFinance: 160000, hostelPerSemester: 25000, note: 'KPK public engineering. ETEA-based.' },
      { programCategory: 'cs', openMerit: 50000, selfFinance: 160000 },
    ],
    scholarships: [
      { name: 'KPK Govt Scholarship', coverage: 'Full fee waiver', criteria: 'KPK domicile + top merit' },
      { name: 'FATA/PATA Scholarship', coverage: 'Full tuition', criteria: 'FATA/PATA domicile' },
    ],
  },
  {
    universityId: 'ned',
    shortName: 'NED',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.neduet.edu.pk/admissions',
    fees: [
      { programCategory: 'engineering', openMerit: 70000, selfFinance: 220000, hostelPerSemester: 35000, note: 'Sindh public engineering. NED Entry Test.' },
      { programCategory: 'cs', openMerit: 70000, selfFinance: 220000 },
    ],
    scholarships: [
      { name: 'Sindh Govt Scholarship', coverage: '100% fee waiver', criteria: 'Sindh domicile + top 10%' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'muet',
    shortName: 'MUET',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.muet.edu.pk/admissions/',
    fees: [
      { programCategory: 'engineering', openMerit: 55000, selfFinance: 170000, hostelPerSemester: 30000, note: 'Sindh public engineering. No separate entry test (academic merit only).' },
      { programCategory: 'cs', openMerit: 55000, selfFinance: 170000 },
    ],
    scholarships: [
      { name: 'Sindh Govt Scholarship', coverage: 'Full tuition', criteria: 'Sindh rural/underprivileged domicile' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'kfueit',
    shortName: 'KFUEIT',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.kfueit.edu.pk/admissions/',
    fees: [
      { programCategory: 'engineering', openMerit: 52000, selfFinance: 165000, hostelPerSemester: 25000 },
      { programCategory: 'cs', openMerit: 52000, selfFinance: 165000 },
      { programCategory: 'business', openMerit: 45000, selfFinance: 140000 },
    ],
    scholarships: [
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
      { name: 'Merit Scholarship', coverage: '25–50% tuition', criteria: 'Top 5% in program' },
    ],
  },
  {
    universityId: 'nfciet',
    shortName: 'NFCIET',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://nfciet.edu.pk/admissions/',
    fees: [
      { programCategory: 'engineering', openMerit: 48000, selfFinance: 150000, hostelPerSemester: 22000 },
      { programCategory: 'cs', openMerit: 48000, selfFinance: 150000 },
    ],
    scholarships: [
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  // ── ADDITIONAL PUBLIC MEDICAL ──────────────────────────────────────────────
  {
    universityId: 'aimc',
    shortName: 'AIMC',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.aimc.com.pk/',
    fees: [
      { programCategory: 'medical', openMerit: 145000, selfFinance: 820000, hostelPerSemester: 40000, note: 'Punjab public medical via UHS.' },
    ],
    scholarships: [
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
      { name: 'Punjab Endowment Fund', coverage: '50–100% tuition', criteria: 'Need + merit' },
    ],
  },
  {
    universityId: 'fjmu',
    shortName: 'FJMU',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.fjmu.edu.pk/',
    fees: [
      { programCategory: 'medical', openMerit: 138000, selfFinance: 800000, hostelPerSemester: 38000, note: 'Women-only Punjab public medical.' },
    ],
    scholarships: [
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'rmc',
    shortName: 'RMU',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://rmu.edu.pk/admissions/',
    fees: [
      { programCategory: 'medical', openMerit: 140000, selfFinance: 810000, hostelPerSemester: 38000 },
      { programCategory: 'general', openMerit: 35000, selfFinance: 120000 },
    ],
    scholarships: [
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'lumhs',
    shortName: 'LUMHS',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://lumhs.edu.pk/admissions/',
    fees: [
      { programCategory: 'medical', openMerit: 120000, selfFinance: 750000, hostelPerSemester: 35000, note: 'Sindh public medical.' },
    ],
    scholarships: [
      { name: 'Sindh Govt Scholarship', coverage: '100% fee waiver', criteria: 'Sindh domicile + open merit' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'jsmu',
    shortName: 'JSMU',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.jsmu.edu.pk/admissions/',
    fees: [
      { programCategory: 'medical', openMerit: 115000, selfFinance: 740000, hostelPerSemester: 32000 },
      { programCategory: 'general', openMerit: 30000, selfFinance: 100000 },
    ],
    scholarships: [
      { name: 'Sindh Govt Scholarship', coverage: '100% fee waiver', criteria: 'Sindh domicile + top merit' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'kmu',
    shortName: 'KMU',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.kmu.edu.pk/fee',
    fees: [
      { programCategory: 'medical', openMerit: 110000, selfFinance: 780000, hostelPerSemester: 32000, note: 'KPK public medical by ETEA MDCAT.' },
      { programCategory: 'general', openMerit: 28000, selfFinance: 110000 },
    ],
    scholarships: [
      { name: 'KPK Govt Scholarship', coverage: 'Full fee waiver', criteria: 'KPK domicile + open merit' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
      { name: 'FATA/PATA Scholarship', coverage: 'Full tuition', criteria: 'FATA/PATA domicile' },
    ],
  },
  {
    universityId: 'bumhs',
    shortName: 'BUMHS',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://bumhs.edu.pk/admissions/',
    fees: [
      { programCategory: 'medical', openMerit: 100000, selfFinance: 700000, hostelPerSemester: 30000, note: 'Balochistan public medical.' },
    ],
    scholarships: [
      { name: 'Balochistan Govt Scholarship', coverage: 'Full fee waiver', criteria: 'Balochistan domicile + top merit' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'gandhara',
    shortName: 'GANDHARA',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://gandhara.edu.pk/admissions/',
    fees: [
      { programCategory: 'medical', regular: 720000, hostelPerSemester: 55000, note: 'KPK private medical.' },
      { programCategory: 'general', regular: 65000 },
    ],
    scholarships: [
      { name: 'Merit Scholarship', coverage: '25–50% tuition', criteria: '85%+ MDCAT aggregate' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'hamdard',
    shortName: 'HAMDARD',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.hamdard.edu.pk/admissions/',
    fees: [
      { programCategory: 'medical', regular: 750000, hostelPerSemester: 60000 },
      { programCategory: 'general', regular: 90000, note: 'Pharm-D, DPT, Health Sciences' },
      { programCategory: 'cs', regular: 85000 },
      { programCategory: 'business', regular: 80000 },
    ],
    scholarships: [
      { name: 'Hamdard Merit Scholarship', coverage: '25–75% tuition', criteria: '85%+ aggregate' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'zu',
    shortName: 'ZU',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://zu.edu.pk/admissions/',
    fees: [
      { programCategory: 'medical', regular: 820000, hostelPerSemester: 65000 },
      { programCategory: 'general', regular: 95000, note: 'Nursing, DPT, Allied Health' },
      { programCategory: 'cs', regular: 90000 },
      { programCategory: 'business', regular: 85000 },
    ],
    scholarships: [
      { name: 'ZU Merit Scholarship', coverage: '25–50% tuition', criteria: '85%+ aggregate' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'isra',
    shortName: 'ISRA',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.isra.edu.pk/admissions/',
    fees: [
      { programCategory: 'medical', regular: 700000, hostelPerSemester: 50000 },
      { programCategory: 'general', regular: 60000 },
    ],
    scholarships: [
      { name: 'Isra Merit Scholarship', coverage: '25–50% tuition', criteria: '80%+ MDCAT aggregate' },
    ],
  },
  {
    universityId: 'baqai',
    shortName: 'BAQAI',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://baqai.edu.pk/admissions/',
    fees: [
      { programCategory: 'medical', regular: 680000, hostelPerSemester: 48000 },
    ],
    scholarships: [
      { name: 'Baqai Merit Scholarship', coverage: '25% tuition', criteria: '82%+ MDCAT aggregate' },
    ],
  },
  // ── PRIVATE ENGINEERING / CS ──────────────────────────────────────────────
  {
    universityId: 'au',
    shortName: 'AU',
    type: 'semi-govt',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.au.edu.pk/admissions/',
    fees: [
      { programCategory: 'engineering', openMerit: 95000, selfFinance: 270000, hostelPerSemester: 45000, note: 'Army-run semi-govt. 20% seats for armed forces children at open merit rate.' },
      { programCategory: 'cs', openMerit: 95000, selfFinance: 270000 },
      { programCategory: 'business', openMerit: 80000, selfFinance: 230000 },
    ],
    scholarships: [
      { name: 'Armed Forces Scholarship', coverage: '50% tuition', criteria: 'Child of serving armed forces personnel' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
      { name: 'Merit Scholarship', coverage: '25–50% tuition', criteria: 'Top 10% in program' },
    ],
  },
  {
    universityId: 'ist',
    shortName: 'IST',
    type: 'semi-govt',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.ist.edu.pk/admissions',
    fees: [
      { programCategory: 'engineering', openMerit: 90000, selfFinance: 260000, hostelPerSemester: 45000 },
      { programCategory: 'cs', openMerit: 90000, selfFinance: 260000 },
    ],
    scholarships: [
      { name: 'IST Merit Scholarship', coverage: 'Full tuition', criteria: 'Top 3 students per program' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'cust',
    shortName: 'CUST',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://cust.edu.pk/admissions/',
    fees: [
      { programCategory: 'engineering', regular: 110000, hostelPerSemester: 42000 },
      { programCategory: 'cs', regular: 110000 },
      { programCategory: 'business', regular: 90000 },
    ],
    scholarships: [
      { name: 'CUST Merit Scholarship', coverage: '25–50% tuition', criteria: '80%+ aggregate' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'dsu',
    shortName: 'DSU',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.dsu.edu.pk/admissions/',
    fees: [
      { programCategory: 'engineering', regular: 115000, hostelPerSemester: 45000 },
      { programCategory: 'cs', regular: 115000 },
      { programCategory: 'business', regular: 95000 },
    ],
    scholarships: [
      { name: 'DSU Merit Scholarship', coverage: '25–75% tuition', criteria: '80%+ aggregate' },
    ],
  },
  {
    universityId: 'suit',
    shortName: 'SARHAD',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.suit.edu.pk/admissions/',
    fees: [
      { programCategory: 'engineering', regular: 75000, hostelPerSemester: 30000 },
      { programCategory: 'cs', regular: 75000 },
      { programCategory: 'business', regular: 60000 },
    ],
    scholarships: [
      { name: 'FATA/PATA Scholarship', coverage: '50% tuition', criteria: 'FATA/PATA domicile' },
      { name: 'Merit Scholarship', coverage: '25% tuition', criteria: '75%+ aggregate' },
    ],
  },
  {
    universityId: 'giki',
    shortName: 'GIKI',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://giki.edu.pk/admissions/',
    fees: [
      { programCategory: 'engineering', openMerit: 180000, selfFinance: 380000, hostelPerSemester: 60000, note: 'GIKI is private but elite; open merit = regular scholarship seat.' },
      { programCategory: 'cs', openMerit: 180000, selfFinance: 380000 },
    ],
    scholarships: [
      { name: 'GIKI Merit Scholarship', coverage: 'Up to 100% tuition', criteria: 'Top scores in GIKI admission test', seats: 20 },
      { name: 'Need-Based Grant', coverage: '50–100% tuition', criteria: 'Family income < Rs 50,000/month' },
    ],
  },
  {
    universityId: 'itu',
    shortName: 'ITU',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://itu.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', openMerit: 55000, selfFinance: 175000, hostelPerSemester: 35000 },
      { programCategory: 'engineering', openMerit: 55000, selfFinance: 175000 },
    ],
    scholarships: [
      { name: 'ITU Merit Scholarship', coverage: 'Full tuition', criteria: 'Top 10 students per batch', seats: 10 },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'cecos',
    shortName: 'CECOS',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.cecos.edu.pk/admissions/',
    fees: [
      { programCategory: 'engineering', regular: 80000, hostelPerSemester: 32000 },
      { programCategory: 'cs', regular: 80000 },
      { programCategory: 'business', regular: 65000 },
    ],
    scholarships: [
      { name: 'FATA/PATA Scholarship', coverage: '50% tuition', criteria: 'FATA/PATA domicile' },
      { name: 'Merit Scholarship', coverage: '25% tuition', criteria: '75%+ aggregate' },
    ],
  },
  {
    universityId: 'ssuet',
    shortName: 'SSUET',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.ssuet.edu.pk/admissions/',
    fees: [
      { programCategory: 'engineering', regular: 85000, hostelPerSemester: 35000 },
      { programCategory: 'cs', regular: 85000 },
      { programCategory: 'business', regular: 70000 },
    ],
    scholarships: [
      { name: 'Sindh Quota Scholarship', coverage: '50% tuition', criteria: 'Rural Sindh domicile' },
      { name: 'Merit Scholarship', coverage: '25% tuition', criteria: '75%+ aggregate' },
    ],
  },
  {
    universityId: 'lgu',
    shortName: 'LGU',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://lgu.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', regular: 80000 },
      { programCategory: 'engineering', regular: 85000 },
      { programCategory: 'business', regular: 65000 },
    ],
    scholarships: [
      { name: 'Merit Scholarship', coverage: '25–50% tuition', criteria: '80%+ aggregate' },
      { name: 'Armed Forces Scholarship', coverage: '50% tuition', criteria: 'Armed forces children' },
    ],
  },
  {
    universityId: 'hitecuni',
    shortName: 'HITEC',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://hitecuni.edu.pk/admissions/',
    fees: [
      { programCategory: 'engineering', regular: 90000, hostelPerSemester: 38000 },
      { programCategory: 'cs', regular: 90000 },
      { programCategory: 'business', regular: 75000 },
    ],
    scholarships: [
      { name: 'Merit Scholarship', coverage: '25–50% tuition', criteria: '80%+ aggregate' },
    ],
  },
  {
    universityId: 'iqra',
    shortName: 'IQRA',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://iqra.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', regular: 72000 },
      { programCategory: 'business', regular: 68000 },
      { programCategory: 'general', regular: 55000 },
    ],
    scholarships: [
      { name: 'Iqra Merit Scholarship', coverage: '25–50% tuition', criteria: '75%+ aggregate' },
    ],
  },
  // ── PUBLIC GENERAL UNIVERSITIES ───────────────────────────────────────────
  {
    universityId: 'pu',
    shortName: 'PU',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://admission.pu.edu.pk/',
    fees: [
      { programCategory: 'cs', openMerit: 32000, selfFinance: 95000, hostelPerSemester: 22000, note: 'Punjab University. PUCIT (Computer Science) has higher fee than Arts departments.' },
      { programCategory: 'general', openMerit: 18000, selfFinance: 55000, hostelPerSemester: 20000 },
      { programCategory: 'business', openMerit: 22000, selfFinance: 65000 },
    ],
    scholarships: [
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
      { name: 'PU Chancellor Scholarship', coverage: '50% tuition', criteria: 'Top 5% in program' },
    ],
  },
  {
    universityId: 'gcu',
    shortName: 'GCU',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://gcu.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', openMerit: 28000, selfFinance: 85000, hostelPerSemester: 20000 },
      { programCategory: 'general', openMerit: 15000, selfFinance: 50000 },
      { programCategory: 'engineering', openMerit: 28000, selfFinance: 85000 },
    ],
    scholarships: [
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
      { name: 'Govt Merit Scholarship', coverage: '25–50% tuition', criteria: 'Top 10% in program' },
    ],
  },
  {
    universityId: 'gcuf',
    shortName: 'GCUF',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://gcuf.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', openMerit: 25000, selfFinance: 75000, hostelPerSemester: 18000 },
      { programCategory: 'general', openMerit: 12000, selfFinance: 40000 },
    ],
    scholarships: [
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'uok',
    shortName: 'UoK',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.uok.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', openMerit: 30000, selfFinance: 90000, hostelPerSemester: 22000, note: 'University of Karachi. Low-cost Sindh public university.' },
      { programCategory: 'general', openMerit: 14000, selfFinance: 45000 },
      { programCategory: 'business', openMerit: 18000, selfFinance: 55000 },
    ],
    scholarships: [
      { name: 'Sindh Govt Scholarship', coverage: 'Full tuition', criteria: 'Need + Sindh domicile' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'qau',
    shortName: 'QAU',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.qau.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', openMerit: 35000, selfFinance: 105000, hostelPerSemester: 25000 },
      { programCategory: 'general', openMerit: 18000, selfFinance: 55000 },
      { programCategory: 'business', openMerit: 22000, selfFinance: 65000 },
      { programCategory: 'medical', openMerit: 40000, selfFinance: 120000, note: 'Pharmacy department' },
    ],
    scholarships: [
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
      { name: 'FATA/PATA Scholarship', coverage: 'Full tuition', criteria: 'FATA/PATA domicile' },
    ],
  },
  {
    universityId: 'iiu',
    shortName: 'IIUI',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.iiu.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', openMerit: 30000, selfFinance: 90000, hostelPerSemester: 22000 },
      { programCategory: 'general', openMerit: 15000, selfFinance: 48000 },
      { programCategory: 'engineering', openMerit: 32000, selfFinance: 95000 },
      { programCategory: 'business', openMerit: 20000, selfFinance: 60000 },
    ],
    scholarships: [
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
      { name: 'IIU Merit Scholarship', coverage: '25–50% tuition', criteria: 'Top 5% in program' },
    ],
  },
  {
    universityId: 'numl',
    shortName: 'NUML',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://numl.edu.pk/admissions/',
    fees: [
      { programCategory: 'general', openMerit: 20000, selfFinance: 60000, hostelPerSemester: 20000, note: 'Language-focused public university.' },
      { programCategory: 'business', openMerit: 22000, selfFinance: 65000 },
      { programCategory: 'cs', openMerit: 25000, selfFinance: 75000 },
    ],
    scholarships: [
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'aiou',
    shortName: 'AIOU',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.aiou.edu.pk/admissions/',
    fees: [
      { programCategory: 'general', openMerit: 5500, note: 'Distance learning university. Per course fee, very affordable.' },
      { programCategory: 'cs', openMerit: 6500 },
      { programCategory: 'business', openMerit: 6000 },
    ],
    scholarships: [
      { name: 'HEC Need-Based', coverage: 'Fee waiver', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'bzu',
    shortName: 'BZU',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.bzu.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', openMerit: 28000, selfFinance: 85000, hostelPerSemester: 20000 },
      { programCategory: 'general', openMerit: 14000, selfFinance: 45000 },
      { programCategory: 'medical', openMerit: 145000, selfFinance: 820000, note: 'Via Nishtar Medical University affiliated colleges' },
    ],
    scholarships: [
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'iub',
    shortName: 'IUB',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.iub.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', openMerit: 26000, selfFinance: 78000, hostelPerSemester: 18000 },
      { programCategory: 'general', openMerit: 13000, selfFinance: 42000 },
      { programCategory: 'medical', openMerit: 38000, selfFinance: 115000, note: 'Pharmacy department' },
    ],
    scholarships: [
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'uos',
    shortName: 'UoS',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.uos.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', openMerit: 25000, selfFinance: 75000, hostelPerSemester: 18000 },
      { programCategory: 'general', openMerit: 12000, selfFinance: 38000 },
      { programCategory: 'medical', openMerit: 38000, selfFinance: 115000, note: 'Pharmacy department' },
    ],
    scholarships: [
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'uog',
    shortName: 'UoG',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://uog.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', openMerit: 25000, selfFinance: 75000, hostelPerSemester: 18000 },
      { programCategory: 'general', openMerit: 12000, selfFinance: 38000 },
      { programCategory: 'business', openMerit: 15000, selfFinance: 45000 },
    ],
    scholarships: [
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'uaf',
    shortName: 'UAF',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.uaf.edu.pk/admissions/',
    fees: [
      { programCategory: 'general', openMerit: 22000, selfFinance: 68000, hostelPerSemester: 18000, note: 'Agriculture university. Includes veterinary programs.' },
      { programCategory: 'medical', openMerit: 45000, selfFinance: 140000, note: 'DVM program' },
      { programCategory: 'engineering', openMerit: 28000, selfFinance: 85000, note: 'Agricultural Engineering' },
    ],
    scholarships: [
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'uop',
    shortName: 'UoP',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.uop.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', openMerit: 28000, selfFinance: 85000, hostelPerSemester: 20000 },
      { programCategory: 'general', openMerit: 14000, selfFinance: 45000 },
      { programCategory: 'medical', openMerit: 40000, selfFinance: 120000, note: 'Pharmacy department' },
    ],
    scholarships: [
      { name: 'KPK Govt Scholarship', coverage: 'Full tuition', criteria: 'KPK domicile + financial need' },
      { name: 'FATA/PATA Scholarship', coverage: 'Full tuition', criteria: 'FATA/PATA domicile' },
    ],
  },
  {
    universityId: 'uom',
    shortName: 'UoM',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.uom.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', openMerit: 22000, selfFinance: 68000, hostelPerSemester: 18000 },
      { programCategory: 'general', openMerit: 12000, selfFinance: 38000 },
    ],
    scholarships: [
      { name: 'KPK Govt Scholarship', coverage: 'Full tuition', criteria: 'Financial need + KPK domicile' },
      { name: 'FATA/PATA Scholarship', coverage: 'Full tuition', criteria: 'FATA/PATA domicile' },
    ],
  },
  {
    universityId: 'usindh',
    shortName: 'UniSindh',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.usindh.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', openMerit: 22000, selfFinance: 68000, hostelPerSemester: 18000 },
      { programCategory: 'general', openMerit: 10000, selfFinance: 33000 },
      { programCategory: 'business', openMerit: 14000, selfFinance: 44000 },
    ],
    scholarships: [
      { name: 'Sindh Govt Scholarship', coverage: 'Full tuition', criteria: 'Sindh rural quota + financial need' },
    ],
  },
  {
    universityId: 'uob',
    shortName: 'UoB',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.uob.edu.pk/admissions/',
    fees: [
      { programCategory: 'general', openMerit: 12000, selfFinance: 38000, hostelPerSemester: 15000, note: 'Very low-cost Balochistan public university.' },
      { programCategory: 'cs', openMerit: 18000, selfFinance: 55000 },
    ],
    scholarships: [
      { name: 'Balochistan Govt Scholarship', coverage: 'Full tuition', criteria: 'Balochistan domicile + need' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'buitms',
    shortName: 'BUITEMS',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.buitms.edu.pk/admissions/',
    fees: [
      { programCategory: 'engineering', openMerit: 35000, selfFinance: 105000, hostelPerSemester: 22000 },
      { programCategory: 'cs', openMerit: 35000, selfFinance: 105000 },
      { programCategory: 'business', openMerit: 25000, selfFinance: 75000 },
    ],
    scholarships: [
      { name: 'Balochistan Govt Scholarship', coverage: 'Full tuition', criteria: 'Balochistan domicile + need' },
    ],
  },
  {
    universityId: 'vu',
    shortName: 'VU',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.vu.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', openMerit: 8500, note: 'Virtual University. Per credit hour fee. Fully online.' },
      { programCategory: 'business', openMerit: 8000 },
      { programCategory: 'general', openMerit: 7500 },
    ],
    scholarships: [
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  // ── PRIVATE BUSINESS / MANAGEMENT ─────────────────────────────────────────
  {
    universityId: 'imsciences',
    shortName: 'IMSciences',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.imsciences.edu.pk/admissions/',
    fees: [
      { programCategory: 'business', regular: 75000, hostelPerSemester: 28000 },
    ],
    scholarships: [
      { name: 'IMSciences Merit Scholarship', coverage: '25–50% tuition', criteria: '80%+ aggregate' },
      { name: 'KPK Govt Scholarship', coverage: '50% tuition', criteria: 'KPK domicile + financial need' },
    ],
  },
  {
    universityId: 'lahoreschool',
    shortName: 'LSE',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://lahoreschool.edu.pk/admissions/',
    fees: [
      { programCategory: 'business', regular: 130000, hostelPerSemester: 50000 },
      { programCategory: 'cs', regular: 130000 },
    ],
    scholarships: [
      { name: 'LSE Need-Based', coverage: 'Up to 50% tuition', criteria: 'Financial need + merit' },
    ],
  },
  {
    universityId: 'ncbae',
    shortName: 'NCBA&E',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.ncbae.edu.pk/admissions/',
    fees: [
      { programCategory: 'business', regular: 90000, hostelPerSemester: 35000 },
      { programCategory: 'cs', regular: 90000 },
    ],
    scholarships: [
      { name: 'Merit Scholarship', coverage: '25–50% tuition', criteria: '80%+ aggregate' },
    ],
  },
  {
    universityId: 'iobm',
    shortName: 'IoBM',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.iobm.edu.pk/admissions/',
    fees: [
      { programCategory: 'business', regular: 105000, hostelPerSemester: 40000 },
      { programCategory: 'cs', regular: 100000 },
      { programCategory: 'engineering', regular: 105000 },
    ],
    scholarships: [
      { name: 'Merit Scholarship', coverage: '25–75% tuition', criteria: '80%+ aggregate' },
      { name: 'Need-Based Grant', coverage: '25–50% tuition', criteria: 'Financial need + 70%+ merit' },
    ],
  },
  {
    universityId: 'kinnaird',
    shortName: 'KCW',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.kinnaird.edu.pk/admissions/',
    fees: [
      { programCategory: 'general', regular: 75000, hostelPerSemester: 32000 },
      { programCategory: 'cs', regular: 80000 },
      { programCategory: 'business', regular: 78000 },
    ],
    scholarships: [
      { name: 'Kinnaird Scholarship', coverage: '25–75% tuition', criteria: 'Merit + need-based' },
    ],
  },
  {
    universityId: 'fccollege',
    shortName: 'FCCU',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.fccollege.edu.pk/admissions/',
    fees: [
      { programCategory: 'general', regular: 90000, hostelPerSemester: 40000 },
      { programCategory: 'cs', regular: 95000 },
      { programCategory: 'business', regular: 92000 },
    ],
    scholarships: [
      { name: 'FC Scholarship', coverage: '25–100% tuition', criteria: 'Need + merit based' },
    ],
  },
  {
    universityId: 'namal',
    shortName: 'NAMAL',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://namal.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', regular: 115000, hostelPerSemester: 45000 },
      { programCategory: 'engineering', regular: 115000 },
      { programCategory: 'business', regular: 100000 },
    ],
    scholarships: [
      { name: 'Namal Need-Based', coverage: 'Up to 100% tuition + hostel', criteria: 'Need-based; most students receive aid', seats: 60 },
      { name: 'Merit Scholarship', coverage: '25–50% tuition', criteria: '80%+ aggregate' },
    ],
  },
  {
    universityId: 'umt',
    shortName: 'UMT',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://umt.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', regular: 88000, hostelPerSemester: 35000 },
      { programCategory: 'engineering', regular: 90000 },
      { programCategory: 'business', regular: 80000 },
      { programCategory: 'general', regular: 65000 },
    ],
    scholarships: [
      { name: 'Merit Scholarship', coverage: '25–50% tuition', criteria: '80%+ aggregate' },
      { name: 'Need-Based Grant', coverage: '25–50% tuition', criteria: 'Financial need' },
    ],
  },
  {
    universityId: 'ucp',
    shortName: 'UCP',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://ucp.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', regular: 90000, hostelPerSemester: 38000 },
      { programCategory: 'engineering', regular: 92000 },
      { programCategory: 'business', regular: 82000 },
      { programCategory: 'medical', regular: 850000, note: 'MBBS program' },
    ],
    scholarships: [
      { name: 'UCP Merit Scholarship', coverage: '25–75% tuition', criteria: '80%+ aggregate or 85%+ MDCAT' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'jinnah',
    shortName: 'MAJU',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.jinnah.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', regular: 82000 },
      { programCategory: 'engineering', regular: 85000 },
      { programCategory: 'business', regular: 75000 },
    ],
    scholarships: [
      { name: 'Merit Scholarship', coverage: '25–50% tuition', criteria: '75%+ aggregate' },
    ],
  },
  {
    universityId: 'superior',
    shortName: 'SUPERIOR',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://superior.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', regular: 68000 },
      { programCategory: 'engineering', regular: 72000 },
      { programCategory: 'business', regular: 62000 },
    ],
    scholarships: [
      { name: 'Merit Scholarship', coverage: '25–50% tuition', criteria: '75%+ aggregate' },
    ],
  },
  {
    universityId: 'leads',
    shortName: 'LEADS',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://leads.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', regular: 65000 },
      { programCategory: 'engineering', regular: 68000 },
      { programCategory: 'business', regular: 60000 },
    ],
    scholarships: [
      { name: 'Merit Scholarship', coverage: '25–50% tuition', criteria: '75%+ aggregate' },
    ],
  },
  {
    universityId: 'abasyn',
    shortName: 'ABASYN',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.abasyn.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', regular: 72000, hostelPerSemester: 28000 },
      { programCategory: 'business', regular: 65000 },
      { programCategory: 'general', regular: 55000 },
    ],
    scholarships: [
      { name: 'FATA/PATA Scholarship', coverage: '50% tuition', criteria: 'FATA/PATA domicile' },
      { name: 'Merit Scholarship', coverage: '25% tuition', criteria: '75%+ aggregate' },
    ],
  },
  {
    universityId: 'szabist',
    shortName: 'SZABIST',
    type: 'private',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.szabist.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', regular: 95000, hostelPerSemester: 42000 },
      { programCategory: 'business', regular: 88000 },
      { programCategory: 'general', regular: 75000 },
    ],
    scholarships: [
      { name: 'SZABIST Merit Scholarship', coverage: '25–50% tuition', criteria: '80%+ aggregate' },
      { name: 'Need-Based Grant', coverage: '25–50% tuition', criteria: 'Financial need' },
    ],
  },
  {
    universityId: 'iba-suk',
    shortName: 'SIBA',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://iba-suk.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', openMerit: 40000, selfFinance: 125000, hostelPerSemester: 25000 },
      { programCategory: 'engineering', openMerit: 40000, selfFinance: 125000 },
      { programCategory: 'business', openMerit: 30000, selfFinance: 95000 },
    ],
    scholarships: [
      { name: 'Sindh Govt Scholarship', coverage: 'Full tuition', criteria: 'Sindh rural domicile + need' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'quest',
    shortName: 'QUEST',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://quest.edu.pk/admissions/',
    fees: [
      { programCategory: 'engineering', openMerit: 38000, selfFinance: 115000, hostelPerSemester: 22000 },
      { programCategory: 'cs', openMerit: 38000, selfFinance: 115000 },
    ],
    scholarships: [
      { name: 'Sindh Govt Scholarship', coverage: 'Full tuition', criteria: 'Sindh domicile + financial need' },
    ],
  },
  {
    universityId: 'kiu',
    shortName: 'KIU',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://kiu.edu.pk/admissions/',
    fees: [
      { programCategory: 'cs', openMerit: 20000, selfFinance: 60000, hostelPerSemester: 15000, note: 'Very affordable GB public university.' },
      { programCategory: 'general', openMerit: 10000, selfFinance: 32000 },
    ],
    scholarships: [
      { name: 'GB Govt Scholarship', coverage: 'Full tuition', criteria: 'GB domicile + financial need' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'uajk',
    shortName: 'UoAJK',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://www.ajku.edu.pk/',
    fees: [
      { programCategory: 'cs', openMerit: 22000, selfFinance: 68000, hostelPerSemester: 16000, note: 'AJK public university. Low-cost.' },
      { programCategory: 'engineering', openMerit: 28000, selfFinance: 85000 },
      { programCategory: 'general', openMerit: 11000, selfFinance: 35000 },
    ],
    scholarships: [
      { name: 'AJK Govt Scholarship', coverage: 'Full tuition', criteria: 'AJK domicile + need' },
      { name: 'HEC Need-Based', coverage: 'Full tuition', criteria: 'Need-based' },
    ],
  },
  {
    universityId: 'must',
    shortName: 'MUST',
    type: 'public',
    lastUpdated: '2025',
    officialFeeUrl: 'https://must.edu.pk/admission/',
    fees: [
      { programCategory: 'engineering', openMerit: 30000, selfFinance: 90000, hostelPerSemester: 18000 },
      { programCategory: 'cs', openMerit: 28000, selfFinance: 85000 },
    ],
    scholarships: [
      { name: 'AJK Govt Scholarship', coverage: 'Full tuition', criteria: 'AJK domicile + need-based' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Get fee data for a university */
export function getUniversityFees(universityId: string): UniversityFeeData | undefined {
  return UNIVERSITY_FEES.find(u => u.universityId.toLowerCase() === universityId.toLowerCase());
}

/** Get fee for a specific program category and merit type */
export function getProgramFee(
  universityId: string,
  programCategory: string,
  meritType: 'openMerit' | 'selfFinance' | 'regular' = 'openMerit',
): number | null {
  const uniData = getUniversityFees(universityId);
  if (!uniData) return null;

  const programFee = uniData.fees.find(f =>
    f.programCategory.toLowerCase() === programCategory.toLowerCase(),
  );
  if (!programFee) return null;

  return (programFee as any)[meritType] ?? null;
}

/** Format PKR fee as readable string (e.g. "Rs 1.05L/sem") */
export function formatFeeShort(fee: number): string {
  if (fee >= 100000) return `Rs ${(fee / 100000).toFixed(1)}L/sem`;
  if (fee >= 1000) return `Rs ${(fee / 1000).toFixed(0)}K/sem`;
  return `Rs ${fee}/sem`;
}

/** Get total program cost estimate (fee × total semesters) */
export function estimateTotalCost(
  universityId: string,
  programCategory: string,
  programDurationYears: number,
  meritType: 'openMerit' | 'selfFinance' | 'regular' = 'openMerit',
  includeHostel: boolean = false,
): { tuitionTotal: number; hostelTotal: number; grandTotal: number } | null {
  const uniData = getUniversityFees(universityId);
  if (!uniData) return null;

  const programFee = uniData.fees.find(f =>
    f.programCategory.toLowerCase() === programCategory.toLowerCase(),
  );
  if (!programFee) return null;

  const semesterFee: number = (programFee as any)[meritType] ?? 0;
  const hostelFee: number = programFee.hostelPerSemester ?? 0;
  const totalSemesters = programDurationYears * 2;

  const tuitionTotal = semesterFee * totalSemesters;
  const hostelTotal = includeHostel ? hostelFee * totalSemesters : 0;

  return { tuitionTotal, hostelTotal, grandTotal: tuitionTotal + hostelTotal };
}

export default UNIVERSITY_FEES;
