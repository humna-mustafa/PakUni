// Entry Tests Data with Deadlines and Important Dates
// Real dates based on typical Pakistani academic calendar



export interface EntryTestData {
  id: string;
  name: string;
  full_name: string;
  conducting_body: string;
  description: string;
  applicable_for: string[];
  registration_start: string;
  registration_deadline: string;
  test_date: string;
  result_date: string;
  website: string;
  fee: number;
  eligibility: string[];
  test_format: {
    total_marks: number;
    total_questions: number;
    duration_minutes: number;
    negative_marking: boolean;
    sections: {name: string; questions: number; marks: number}[];
  };
  tips: string[];
  provinces: string[];
  // NEW FIELDS for enhanced UX
  application_steps?: string[];
  status_notes?: string;
  brand_colors?: {

    primary: string;
    secondary: string;

    gradient: string[];
  };
}

export const ENTRY_TEST_BRAND_COLORS: Record<string, { primary: string; secondary: string; gradient: string[] }> = {
  'mdcat': { primary: '#1A5F2A', secondary: '#2E8B3D', gradient: ['#1A5F2A', '#2E8B3D', '#3CB371'] }, // Medical Green
  'ecat': { primary: '#8B4513', secondary: '#A0522D', gradient: ['#663311', '#8B4513', '#A0522D'] }, // Engineering Brown
  'nust': { primary: '#003366', secondary: '#0055A5', gradient: ['#002244', '#003366', '#0055A5'] }, // NUST Blue
  'nums': { primary: '#800000', secondary: '#A52A2A', gradient: ['#600000', '#800000', '#A52A2A'] }, // NUMS Maroon
  'etea': { primary: '#006400', secondary: '#008000', gradient: ['#004D00', '#006400', '#008000'] }, // KPK Green
  'uat': { primary: '#004B87', secondary: '#0066B3', gradient: ['#003366', '#004B87', '#0066B3'] },  // Agriculture Blue
  'sat': { primary: '#003399', secondary: '#0055CC', gradient: ['#001144', '#003399', '#0055CC'] }, // Global Blue
  'default': { primary: '#4573DF', secondary: '#4573DF', gradient: ['#3660C9', '#4573DF', '#4573DF'] },
};

export const getEntryTestBrandColors = (nameOrId: string): { primary: string; secondary: string; gradient: string[] } => {
  const searchTerm = nameOrId.toLowerCase();
  
  if (searchTerm.includes('mdcat')) return ENTRY_TEST_BRAND_COLORS.mdcat;
  if (searchTerm.includes('ecat')) return ENTRY_TEST_BRAND_COLORS.ecat;
  if (searchTerm.includes('nust') || searchTerm.includes('net-')) return ENTRY_TEST_BRAND_COLORS.nust;
  if (searchTerm.includes('nums')) return ENTRY_TEST_BRAND_COLORS.nums;
  if (searchTerm.includes('etea')) return ENTRY_TEST_BRAND_COLORS.etea;
  if (searchTerm.includes('uat')) return ENTRY_TEST_BRAND_COLORS.uat;
  if (searchTerm.includes('sat')) return ENTRY_TEST_BRAND_COLORS.sat;
  
  return ENTRY_TEST_BRAND_COLORS.default;
};

// Entry Tests Data - Updated for 2026 Academic Year
// Last Updated: January 16, 2026 - Dates are estimates based on typical patterns

export const ENTRY_TESTS_DATA: EntryTestData[] = [
  {
    id: 'mdcat-2026',
    name: 'MDCAT',
    full_name: 'Medical and Dental College Admission Test',
    conducting_body: 'Pakistan Medical Commission (PMC)',
    description: 'National level entrance test for admission to MBBS and BDS programs in all medical and dental colleges of Pakistan. Single national test for all provinces.',
    applicable_for: ['MBBS', 'BDS', 'Medical', 'Dental'],
    registration_start: '2026-06-15',
    registration_deadline: '2026-07-31',
    test_date: '2026-08-27',
    result_date: '2026-09-20',
    website: 'https://www.pmc.gov.pk/',
    fee: 6000,
    eligibility: [
      'FSc Pre-Medical with minimum 65% marks',
      'A-Levels with Biology, Chemistry, Physics/Math (equivalence required)',
      'Pakistani citizen or overseas Pakistani',
      'Age: No upper limit for MBBS',
    ],
    test_format: {
      total_marks: 210,
      total_questions: 210,
      duration_minutes: 210,
      negative_marking: false,
      sections: [
        {name: 'Biology', questions: 68, marks: 68},
        {name: 'Chemistry', questions: 54, marks: 54},
        {name: 'Physics', questions: 54, marks: 54},
        {name: 'English', questions: 18, marks: 18},
        {name: 'Logical Reasoning', questions: 6, marks: 6},
      ],
    },
    tips: [
      'Focus on PMC syllabus - 80% questions from it',
      'Practice past papers from PMC website',
      'Biology has highest weightage - prioritize it',
      'Time management is key - 1 min per question',
      'Study PMC official syllabus document carefully',
      'Practice MCQs daily - aim for 200+ per day',
    ],
    provinces: ['all-pakistan'],
    status_notes: 'Registration Expected June 2026 - Check PMC website',
    application_steps: [
      'Create profile on PMC Online Portal (pmc.gov.pk)',
      'Upload Scanned Documents (Form-B/CNIC, FSc Result/Hope Certificate)',
      'Generate Fee Challan and pay at any HBL/ABL branch',
      'Upload paid challan and select preferred test city',
      'Download Admit Card 1 week before the test',
      'Bring original CNIC/B-Form on test day',
    ],
    brand_colors: ENTRY_TEST_BRAND_COLORS.mdcat,
  },
  {
    id: 'nust-net-2026',
    name: 'NUST NET',
    full_name: 'NUST Entry Test',
    conducting_body: 'National University of Sciences and Technology',
    description: 'Entrance test for NUST undergraduate programs. Conducted in four series (NET-1 to NET-4). Series 2 is currently active.',
    applicable_for: ['Engineering', 'Computer Science', 'Business', 'Social Sciences', 'Architecture'],
    registration_start: '2025-12-14',
    registration_deadline: '2026-01-25',
    test_date: '2026-01-31',
    result_date: '2026-02-15',
    website: 'https://ugadmissions.nust.edu.pk/',
    fee: 5000,
    eligibility: [
      'FSc or equivalent with 60% marks',
      'Matric or equivalent with 60% marks',
      'Candidate must be appearing in HSSC Part-II or have completed it',
    ],
    test_format: {
      total_marks: 200,
      total_questions: 200,
      duration_minutes: 180,
      negative_marking: false,
      sections: [
        {name: 'Mathematics', questions: 80, marks: 80},
        {name: 'Physics', questions: 60, marks: 60},
        {name: 'Chemistry', questions: 30, marks: 30},
        {name: 'English', questions: 20, marks: 20},
        {name: 'Intelligence', questions: 10, marks: 10},
      ],
    },
    tips: [
      'Focus on textbook concepts of Punjab/Federal boards',
      'Time management is key - 200 questions in 180 minutes',
      'No negative marking, so attempt all questions',
      'Practice past papers for pattern familiarity',
    ],
    provinces: ['all-pakistan'],
    application_steps: [
      'Register on NUST login portal',
      'Fill in personal and academic details',
      'Upload recent photograph',
      'Generate and pay challan in HBL',
      'Select your test series and date (Series 2 ending Jan 25)',
    ],
    status_notes: 'NET Series-2 Registration Open! (Closing Jan 25)',
    brand_colors: ENTRY_TEST_BRAND_COLORS.nust,
  },
  {
    id: 'ecat-punjab-2026',
    name: 'ECAT Punjab',
    full_name: 'Engineering College Admission Test (Punjab)',
    conducting_body: 'UET Lahore',
    description: 'Provincial entrance test for admission to engineering programs in Punjab universities including UET Lahore, UET Taxila, and affiliated colleges.',
    applicable_for: ['Engineering', 'BSc Engineering', 'Technology'],
    registration_start: '2026-05-20',
    registration_deadline: '2026-07-10',
    test_date: '2026-07-26',
    result_date: '2026-08-10',
    website: 'https://admission.uet.edu.pk/ecat/',
    fee: 3000,
    eligibility: [
      'FSc Pre-Engineering with minimum 60% marks',
      'A-Levels with Physics, Chemistry, Math (equivalence required)',
      'Punjab domicile required for government seats',
      'DAE holders eligible for 2nd year direct entry',
    ],
    test_format: {
      total_marks: 400,
      total_questions: 100,
      duration_minutes: 100,
      negative_marking: true,
      sections: [
        {name: 'Mathematics', questions: 40, marks: 160},
        {name: 'Physics', questions: 30, marks: 120},
        {name: 'Chemistry', questions: 20, marks: 80},
        {name: 'English', questions: 10, marks: 40},
      ],
    },
    tips: [
      'Math is most important - 40% weightage',
      'Practice numerical problems daily',
      'Negative marking exists (-1 for wrong) - avoid guessing',
      'Focus on FSc Part 2 topics',
      'Hafiz-e-Quran get 20 marks bonus - register for Hifz test separately',
      'Practice time - only 1 minute per question',
    ],
    provinces: ['Punjab'],
    status_notes: 'Registration Expected May 2026',
    application_steps: [
      'Buy ECAT Token from HBL branches (Rs. 3000)',
      'Log in to UET Admission Portal using token serial number',
      'Fill personal and academic details',
      'Select Test Center and Date slot',
      'Print Admit Card immediately after registration',
      'Register separately for Hafiz test if applicable',
    ],
    brand_colors: ENTRY_TEST_BRAND_COLORS.ecat,
  },
  {
    id: 'etea-engineering-2026',
    name: 'ETEA Engineering',
    full_name: 'Educational Testing & Evaluation Agency (Engineering)',
    conducting_body: 'ETEA KPK',
    description: 'KPK provincial entrance test for engineering programs in UET Peshawar, UET Mardan and other KPK engineering universities.',
    applicable_for: ['Engineering', 'BSc Engineering', 'Technology'],
    registration_start: '2026-06-01',
    registration_deadline: '2026-07-15',
    test_date: '2026-07-28',
    result_date: '2026-08-10',
    website: 'https://etea.edu.pk/',
    fee: 2500,
    eligibility: [
      'FSc Pre-Engineering with minimum 60% marks',
      'A-Levels with Physics, Chemistry, Math',
      'KPK domicile required for government seats',
    ],
    test_format: {
      total_marks: 400,
      total_questions: 200,
      duration_minutes: 150,
      negative_marking: false,
      sections: [
        {name: 'Mathematics', questions: 80, marks: 160},
        {name: 'Physics', questions: 60, marks: 120},
        {name: 'Chemistry', questions: 40, marks: 80},
        {name: 'English', questions: 20, marks: 40},
      ],
    },
    tips: [
      'No negative marking - attempt all questions',
      'Math and Physics combined are 70% of paper',
      'ETEA past papers available on website',
      'Time management crucial - practice speed',
    ],
    provinces: ['KPK'],
    status_notes: 'Registration Expected June 2026',
    brand_colors: ENTRY_TEST_BRAND_COLORS.etea,
  },
  {
    id: 'etea-medical-2026',
    name: 'ETEA Medical',
    full_name: 'Educational Testing & Evaluation Agency (Medical)',
    conducting_body: 'ETEA KPK',
    description: 'KPK provincial entrance test for medical programs - used alongside MDCAT for provincial merit.',
    applicable_for: ['MBBS', 'BDS', 'Allied Health'],
    registration_start: '2026-07-01',
    registration_deadline: '2026-08-15',
    test_date: '2026-08-30',
    result_date: '2026-09-15',
    website: 'https://etea.edu.pk/',
    fee: 2500,
    eligibility: [
      'FSc Pre-Medical with minimum 65% marks',
      'KPK domicile required',
      'MDCAT also required for MBBS/BDS',
    ],
    test_format: {
      total_marks: 200,
      total_questions: 200,
      duration_minutes: 150,
      negative_marking: false,
      sections: [
        {name: 'Biology', questions: 80, marks: 80},
        {name: 'Chemistry', questions: 60, marks: 60},
        {name: 'Physics', questions: 40, marks: 40},
        {name: 'English', questions: 20, marks: 20},
      ],
    },
    tips: [
      'Prepare alongside MDCAT - similar syllabus',
      'No negative marking - attempt everything',
      'Practice ETEA specific past papers',
    ],
    provinces: ['KPK'],
    status_notes: 'Registration Expected July 2026',
    brand_colors: ENTRY_TEST_BRAND_COLORS.etea,
  },
  {
    id: 'net-2026',
    name: 'NET',
    full_name: 'NUST Entry Test',
    conducting_body: 'National University of Sciences and Technology',
    description: 'Computer-based entrance test for admission to all undergraduate programs at NUST. Multiple series conducted - best score counts.',
    applicable_for: ['Engineering', 'Computer Science', 'Business', 'Social Sciences', 'Medical', 'Architecture'],
    registration_start: '2026-01-15',
    registration_deadline: '2026-06-30',
    test_date: '2026-02-01',
    result_date: '2026-07-10',
    website: 'https://nust.edu.pk/admissions/',
    fee: 3500,
    eligibility: [
      'Minimum 60% in Matric',
      'Appearing/passed FSc or equivalent',
      'No age limit',
      'SAT/ACT scores also accepted as alternative',
    ],
    test_format: {
      total_marks: 200,
      total_questions: 200,
      duration_minutes: 180,
      negative_marking: false,
      sections: [
        {name: 'Mathematics', questions: 80, marks: 80},
        {name: 'Physics', questions: 60, marks: 60},
        {name: 'Chemistry', questions: 30, marks: 30},
        {name: 'English', questions: 20, marks: 20},
        {name: 'Intelligence', questions: 10, marks: 10},
      ],
    },
    tips: [
      'Take NET multiple times - best score counts',
      'Computer-based - practice on CBT platform',
      'Focus on FSc Part 1 & 2 equally',
      'English vocabulary is important',
      'Intelligence section includes logical reasoning',
      'NET-1 in Feb, NET-2 in Apr, NET-3 in Jun, NET-4 in Aug',
    ],
    provinces: ['All Pakistan'],
    status_notes: 'NET-1 2026 Registration OPEN (Jan 15 - Feb 28)',
    application_steps: [
      'Create account on NUST Admission Portal',
      'Complete Profile with Matric/FSc marks (expected marks for appearing students)',
      'Select Series (NET-1, 2, 3, or 4) and Program choices',
      'Pay fee online or via bank challan at HBL',
      'Select Test Center (Islamabad, Karachi, Quetta, Lahore, Peshawar) and Date',
      'Download admit card 3 days before test',
    ],
    brand_colors: ENTRY_TEST_BRAND_COLORS.nust,
  },
  {
    id: 'nums-2026',
    name: 'NUMS Entry Test',
    full_name: 'National University of Medical Sciences Entry Test',
    conducting_body: 'NUMS Rawalpindi',
    description: 'Entrance test for Army Medical College (AMC), CMH Lahore, CMH Kharian, CMH Multan and other military medical institutions.',
    applicable_for: ['MBBS', 'BDS', 'Nursing', 'Allied Health'],
    registration_start: '2026-07-01',
    registration_deadline: '2026-08-31',
    test_date: '2026-09-15',
    result_date: '2026-09-30',
    website: 'https://nums.edu.pk/',
    fee: 4000,
    eligibility: [
      'FSc Pre-Medical with minimum 65% marks',
      'MDCAT qualified',
      'Pakistani citizen',
      'Medical fitness required',
    ],
    test_format: {
      total_marks: 200,
      total_questions: 200,
      duration_minutes: 180,
      negative_marking: false,
      sections: [
        {name: 'Biology', questions: 80, marks: 80},
        {name: 'Chemistry', questions: 60, marks: 60},
        {name: 'Physics', questions: 40, marks: 40},
        {name: 'English', questions: 20, marks: 20},
      ],
    },
    tips: [
      'Very competitive - high MDCAT score required',
      'Separate test from MDCAT',
      'Military medical colleges have own merit',
      'Interview and medical fitness important',
    ],
    provinces: ['All Pakistan'],
    status_notes: 'Registration Expected July 2026',
    brand_colors: ENTRY_TEST_BRAND_COLORS.nums,
  },
  {
    id: 'giki-2026',
    name: 'GIKI Test',
    full_name: 'GIK Institute Admission Test',
    conducting_body: 'Ghulam Ishaq Khan Institute',
    description: 'Entrance test for admission to engineering, computer science and management programs at GIKI - fully residential campus.',
    applicable_for: ['Engineering', 'Computer Science', 'Management Sciences'],
    registration_start: '2026-02-15',
    registration_deadline: '2026-05-31',
    test_date: '2026-06-15',
    result_date: '2026-06-30',
    website: 'https://giki.edu.pk/admissions/',
    fee: 4000,
    eligibility: [
      'Minimum 60% in FSc Pre-Engineering/ICS',
      'A-Levels with relevant subjects',
      'SAT scores also accepted (1200+ preferred)',
      'No domicile restriction',
    ],
    test_format: {
      total_marks: 100,
      total_questions: 100,
      duration_minutes: 120,
      negative_marking: true,
      sections: [
        {name: 'Mathematics', questions: 35, marks: 35},
        {name: 'Physics', questions: 25, marks: 25},
        {name: 'Chemistry', questions: 20, marks: 20},
        {name: 'English', questions: 10, marks: 10},
        {name: 'IQ/Logical Reasoning', questions: 10, marks: 10},
      ],
    },
    tips: [
      'Strong math foundation required',
      'Practice logical reasoning and IQ questions',
      'Time is limited - work fast but carefully',
      'Similar difficulty to SAT',
      'Negative marking exists - be careful',
      'Financial aid available - apply during admission',
    ],
    provinces: ['All Pakistan'],
    status_notes: 'Registration Expected February 2026',
    application_steps: [
      'Register on GIKI Admission Portal',
      'Choose degree programs (Engineering/Management/CS)',
      'Pay application fee at HBL or via online transfer',
      'Upload academic records and recent photos',
      'Download roll number slip for GIKI Admission Test',
      'Appear for the test at your selected center (multiple cities)',
    ],
  },
  {
    id: 'fast-nu-2026',
    name: 'FAST-NU Test',
    full_name: 'FAST National University Entry Test',
    conducting_body: 'FAST-NUCES',
    description: 'Entrance test for Computer Science, Software Engineering, AI, Data Science and Electrical Engineering programs at FAST campuses nationwide.',
    applicable_for: ['Computer Science', 'Software Engineering', 'Electrical Engineering', 'Data Science', 'AI'],
    registration_start: '2026-04-15',
    registration_deadline: '2026-07-15',
    test_date: '2026-07-25',
    result_date: '2026-08-05',
    website: 'https://nu.edu.pk/Admissions',
    fee: 2500,
    eligibility: [
      'Minimum 60% in FSc or equivalent',
      'Pre-Engineering, ICS, or A-Levels',
      'Mathematics required',
      'No domicile restriction - all campuses open',
    ],
    test_format: {
      total_marks: 100,
      total_questions: 100,
      duration_minutes: 90,
      negative_marking: false,
      sections: [
        {name: 'Mathematics', questions: 40, marks: 40},
        {name: 'Analytical Reasoning', questions: 30, marks: 30},
        {name: 'English', questions: 30, marks: 30},
      ],
    },
    tips: [
      'Strong focus on Analytical Reasoning - practice IQ tests',
      'No Physics/Chemistry - purely Math focused',
      'Practice pattern recognition questions',
      'English includes vocabulary and comprehension',
      'No negative marking - attempt all',
      'SAT score can be used instead',
    ],
    provinces: ['All Pakistan'],
    status_notes: 'Registration Expected April 2026',
    application_steps: [
      'Apply online at nu.edu.pk/Admissions',
      'Choose preferred campus (Islamabad, Lahore, Karachi, Peshawar, Faisalabad, Chiniot-Faisalabad)',
      'Upload certificates and pay fee online or at Faysal Bank',
      'Schedule entry test at any NUCES campus',
      'Bring original CNIC and Admit Card on test day',
      'Check result online and confirm admission',
    ],
  },
  {
    id: 'lums-lcat-2026',
    name: 'LUMS LCAT',
    full_name: 'LUMS Common Admission Test',
    conducting_body: 'Lahore University of Management Sciences',
    description: 'LUMS own admission test for students who do not have SAT scores. Tests quantitative, verbal and analytical writing skills.',
    applicable_for: ['Business', 'Computer Science', 'Engineering', 'Social Sciences', 'Law', 'Humanities'],
    registration_start: '2025-10-01',
    registration_deadline: '2026-02-15',
    test_date: '2026-03-01',
    result_date: '2026-03-20',
    website: 'https://lums.edu.pk/admissions',
    fee: 6000,
    eligibility: [
      'Minimum 70% in Matric and Inter',
      'A-Levels with strong grades (AAB or better)',
      'SAT score 1200+ can replace LCAT',
      'ACT score also accepted',
    ],
    test_format: {
      total_marks: 100,
      total_questions: 60,
      duration_minutes: 150,
      negative_marking: false,
      sections: [
        {name: 'Quantitative', questions: 25, marks: 40},
        {name: 'Verbal', questions: 25, marks: 40},
        {name: 'Analytical Writing', questions: 2, marks: 20},
      ],
    },
    tips: [
      'SAT score can replace LUMS test - consider taking SAT',
      'Strong focus on verbal reasoning and vocabulary',
      'Writing skills are evaluated - practice essays',
      'Apply early for NOP scholarship if financially eligible',
      'Very competitive - high scores needed',
    ],
    provinces: ['All Pakistan'],
    status_notes: 'Round 1 Deadline Passed - Round 2 Open until Feb 15, 2026',
    application_steps: [
      'Complete online application form on LUMS portal',
      'Identify two referees for recommendation letters',
      'Upload academic records (O/A Levels or Matric/FSc)',
      'Submit SAT/ACT scores OR register for LCAT',
      'Pay application fee via designated bank or credit card',
      'Check portal for interview invitation',
    ],
  },
  {
    id: 'iba-test-2026',
    name: 'IBA Aptitude Test',
    full_name: 'IBA Karachi Admission Test',
    conducting_body: 'Institute of Business Administration Karachi',
    description: 'Highly competitive entrance test for BBA and BS programs at IBA Karachi - oldest business school in Asia.',
    applicable_for: ['BBA', 'BS Economics', 'BS Computer Science', 'BS Accounting & Finance'],
    registration_start: '2026-01-15',
    registration_deadline: '2026-04-15',
    test_date: '2026-05-01',
    result_date: '2026-05-20',
    website: 'https://www.iba.edu.pk/admissions/',
    fee: 5000,
    eligibility: [
      'Minimum 60% in Matric and Inter',
      'A-Levels with relevant subjects',
      'SAT score 1200+ can strengthen application',
      'No domicile restriction',
    ],
    test_format: {
      total_marks: 100,
      total_questions: 100,
      duration_minutes: 120,
      negative_marking: true,
      sections: [
        {name: 'English', questions: 35, marks: 35},
        {name: 'Mathematics', questions: 35, marks: 35},
        {name: 'Analytical Reasoning', questions: 30, marks: 30},
      ],
    },
    tips: [
      'Very competitive - prepare thoroughly',
      'English section includes vocabulary, comprehension, grammar',
      'Math includes basic algebra and arithmetic',
      'Analytical reasoning is key differentiator',
      'Negative marking exists - be careful',
      'Practice IBA past papers extensively',
    ],
    provinces: ['All Pakistan'],
    status_notes: 'Registration Expected January 2026',
    application_steps: [
      'Register on IBA Admission Portal',
      'Upload academic records and personal details',
      'Pay test fee via online banking or bank branch',
      'Download admit card for IBA Admission Test',
      'Attend interview if score meets cut-off',
    ],
  },
  {
    id: 'nat-ie-2026',
    name: 'NAT-IE',
    full_name: 'National Aptitude Test (Science/Engineering)',
    conducting_body: 'National Testing Service (NTS)',
    description: 'General aptitude test accepted by many universities for engineering, science and IT programs. Conducted monthly.',
    applicable_for: ['Engineering', 'Sciences', 'IT', 'Computer Science'],
    registration_start: '2026-01-01',
    registration_deadline: '2026-12-31',
    test_date: '2026-01-25',
    result_date: '2026-02-05',
    website: 'https://nts.org.pk/',
    fee: 1500,
    eligibility: [
      'FSc or equivalent qualification',
      'No minimum marks required for test',
      'Score valid for 1 year',
    ],
    test_format: {
      total_marks: 100,
      total_questions: 100,
      duration_minutes: 120,
      negative_marking: false,
      sections: [
        {name: 'Verbal', questions: 20, marks: 20},
        {name: 'Quantitative', questions: 20, marks: 20},
        {name: 'Analytical', questions: 20, marks: 20},
        {name: 'Subject (Physics/Math/Chem)', questions: 40, marks: 40},
      ],
    },
    tips: [
      'Score valid for 1 year - take early',
      'Accepted by many universities as backup',
      'Good option for COMSATS, Bahria, AU',
      'Practice NTS past papers',
      'Conducted monthly - multiple chances',
    ],
    provinces: ['All Pakistan'],
    status_notes: 'Conducted Monthly - Register on NTS website',
    application_steps: [
      'Visit NTS website and select NAT-IE',
      'Register with CNIC and contact details',
      'Pay fee at any 1Link ATM, HBL, or online',
      'Download roll number slip',
      'Appear at test center with original CNIC',
    ],
  },
  {
    id: 'nat-im-2026',
    name: 'NAT-IM',
    full_name: 'National Aptitude Test (Management)',
    conducting_body: 'National Testing Service (NTS)',
    description: 'General aptitude test for business and management programs. Accepted by many universities.',
    applicable_for: ['Business', 'Management', 'Commerce', 'Economics'],
    registration_start: '2026-01-01',
    registration_deadline: '2026-12-31',
    test_date: '2026-01-25',
    result_date: '2026-02-05',
    website: 'https://nts.org.pk/',
    fee: 1500,
    eligibility: [
      'FA/FSc/ICom or equivalent',
      'No minimum marks required',
      'Score valid for 1 year',
    ],
    test_format: {
      total_marks: 100,
      total_questions: 100,
      duration_minutes: 120,
      negative_marking: false,
      sections: [
        {name: 'Verbal', questions: 20, marks: 20},
        {name: 'Quantitative', questions: 20, marks: 20},
        {name: 'Analytical', questions: 20, marks: 20},
        {name: 'Subject (Business/General)', questions: 40, marks: 40},
      ],
    },
    tips: [
      'Required for many business programs',
      'Useful for COMSATS, Bahria, AIOU',
      'Practice general knowledge questions',
      'Conducted monthly',
    ],
    provinces: ['All Pakistan'],
    status_notes: 'Conducted Monthly',
  },
  {
    id: 'gat-general-2026',
    name: 'GAT General',
    full_name: 'Graduate Assessment Test (General)',
    conducting_body: 'National Testing Service (NTS)',
    description: 'Required test for MS/MPhil admission in Pakistani universities. Tests verbal, quantitative and analytical skills.',
    applicable_for: ['MS', 'MPhil', 'MBA', 'Graduate Programs'],
    registration_start: '2026-01-01',
    registration_deadline: '2026-12-31',
    test_date: '2026-02-15',
    result_date: '2026-02-25',
    website: 'https://nts.org.pk/',
    fee: 2000,
    eligibility: [
      "Bachelor's degree or equivalent",
      'Minimum 50 score required for most universities',
      'Score valid for 2 years',
    ],
    test_format: {
      total_marks: 100,
      total_questions: 100,
      duration_minutes: 120,
      negative_marking: false,
      sections: [
        {name: 'Verbal', questions: 30, marks: 30},
        {name: 'Quantitative', questions: 30, marks: 30},
        {name: 'Analytical', questions: 40, marks: 40},
      ],
    },
    tips: [
      'Required for MS/MPhil admission',
      'Minimum 50 score needed for most universities',
      'HEC requirement for graduate programs',
      'Conducted quarterly',
      'Practice analogies and reading comprehension',
    ],
    provinces: ['All Pakistan'],
    status_notes: 'Conducted Quarterly - Feb, May, Aug, Nov',
  },
  {
    id: 'hec-lat-2026',
    name: 'LAT',
    full_name: 'Law Admission Test',
    conducting_body: 'HEC Educational Testing Council',
    description: 'Mandatory test for admission to 5-year LLB programs in Pakistan. Required by HEC for all law admissions.',
    applicable_for: ['LLB (5-Year)', 'Law', 'Legal Studies'],
    registration_start: '2026-06-15',
    registration_deadline: '2026-08-15',
    test_date: '2026-09-05',
    result_date: '2026-09-25',
    website: 'https://etc.hec.gov.pk/',
    fee: 2500,
    eligibility: [
      'Passed Intermediate/A-Levels',
      'Minimum 45% marks in Inter',
      'No age limit',
      'Required for 5-year LLB only',
    ],
    test_format: {
      total_marks: 100,
      total_questions: 100,
      duration_minutes: 90,
      negative_marking: false,
      sections: [
        {name: 'English', questions: 30, marks: 30},
        {name: 'Pakistan Studies', questions: 20, marks: 20},
        {name: 'General Knowledge', questions: 20, marks: 20},
        {name: 'Islamic Studies/Ethics', questions: 15, marks: 15},
        {name: 'Urdu', questions: 15, marks: 15},
      ],
    },
    tips: [
      'Focus on current affairs for GK',
      'Pakistan Studies is important - study history',
      'Practice English comprehension',
      'Score valid for 2 years',
      'Required by all law colleges',
    ],
    provinces: ['All Pakistan'],
    status_notes: 'Registration Expected June 2026',
  },
  {
    id: 'hec-hat-2026',
    name: 'HAT',
    full_name: 'HEC Aptitude Test',
    conducting_body: 'HEC Educational Testing Council',
    description: 'Required for HEC scholarships including Indigenous PhD Fellowship. Also accepted by some universities for MS admission.',
    applicable_for: ['PhD', 'MS', 'MPhil', 'HEC Scholarships'],
    registration_start: '2026-01-15',
    registration_deadline: '2026-03-15',
    test_date: '2026-04-01',
    result_date: '2026-04-20',
    website: 'https://etc.hec.gov.pk/',
    fee: 2500,
    eligibility: [
      'MS/MPhil degree for PhD HAT',
      "Bachelor's degree for MS HAT",
      'Required for HEC scholarships',
    ],
    test_format: {
      total_marks: 100,
      total_questions: 100,
      duration_minutes: 120,
      negative_marking: false,
      sections: [
        {name: 'Verbal', questions: 25, marks: 25},
        {name: 'Quantitative', questions: 25, marks: 25},
        {name: 'Analytical', questions: 25, marks: 25},
        {name: 'Subject Specific', questions: 25, marks: 25},
      ],
    },
    tips: [
      'Required for HEC Indigenous PhD Fellowship',
      'Minimum 50 score usually required',
      'Conducted twice a year',
      'Subject test depends on your field',
    ],
    provinces: ['All Pakistan'],
    status_notes: 'Conducted in April and October',
  },
  {
    id: 'pieas-test-2026',
    name: 'PIEAS Entry Test',
    full_name: 'Pakistan Institute of Engineering & Applied Sciences Entry Test',
    conducting_body: 'PIEAS',
    description: 'Highly selective entrance test for BS and MS programs at PIEAS - Pakistan\'s elite nuclear engineering institute.',
    applicable_for: ['Nuclear Engineering', 'Physics', 'Computer Science', 'Mechanical Engineering'],
    registration_start: '2026-04-15',
    registration_deadline: '2026-06-30',
    test_date: '2026-07-20',
    result_date: '2026-08-05',
    website: 'https://www.pieas.edu.pk/admissions/',
    fee: 2500,
    eligibility: [
      'FSc Pre-Engineering with 80%+ marks',
      'A-Levels with Physics, Math, Chemistry (AAA preferred)',
      'Extremely competitive admission',
    ],
    test_format: {
      total_marks: 100,
      total_questions: 100,
      duration_minutes: 120,
      negative_marking: false,
      sections: [
        {name: 'Mathematics', questions: 40, marks: 40},
        {name: 'Physics', questions: 30, marks: 30},
        {name: 'Chemistry', questions: 20, marks: 20},
        {name: 'English', questions: 10, marks: 10},
      ],
    },
    tips: [
      'Very high merit - 80%+ FSc typically required',
      'Strong math and physics foundation needed',
      'Limited seats - extremely competitive',
      'Scholarship available for top performers',
    ],
    provinces: ['All Pakistan'],
    status_notes: 'Registration Expected April 2026',
  },
];

// Helper functions
export const getUpcomingTests = (): EntryTestData[] => {
  const today = new Date();
  return ENTRY_TESTS_DATA.filter(test => {
    const testDate = new Date(test.test_date);
    return testDate >= today;
  }).sort((a, b) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime());
};

export const getTestsByField = (field: string): EntryTestData[] => {
  return ENTRY_TESTS_DATA.filter(test => 
    test.applicable_for.some(f => f.toLowerCase().includes(field.toLowerCase()))
  );
};

export const getRegistrationOpenTests = (): EntryTestData[] => {
  const today = new Date();
  return ENTRY_TESTS_DATA.filter(test => {
    const regStart = new Date(test.registration_start);
    const regEnd = new Date(test.registration_deadline);
    return today >= regStart && today <= regEnd;
  });
};

export default ENTRY_TESTS_DATA;


