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
}

export const ENTRY_TESTS_DATA: EntryTestData[] = [
  {
    id: 'mdcat-2026',
    name: 'MDCAT',
    full_name: 'Medical and Dental College Admission Test',
    conducting_body: 'Pakistan Medical Commission (PMC)',
    description: 'National level entrance test for admission to MBBS and BDS programs in all medical and dental colleges of Pakistan.',
    applicable_for: ['MBBS', 'BDS', 'Medical', 'Dental'],
    registration_start: '2026-06-01',
    registration_deadline: '2026-07-31',
    test_date: '2026-08-25',
    result_date: '2026-09-15',
    website: 'https://www.pmc.gov.pk/',
    fee: 5500,
    eligibility: [
      'FSc Pre-Medical with minimum 65% marks',
      'A-Levels with Biology, Chemistry, Physics/Math',
      'Pakistani citizen or overseas Pakistani',
      'Age: No upper limit for MBBS',
    ],
    test_format: {
      total_marks: 210,
      total_questions: 210,
      duration_minutes: 210,
      negative_marking: false,
      sections: [
        {name: 'Biology', questions: 80, marks: 80},
        {name: 'Chemistry', questions: 60, marks: 60},
        {name: 'Physics', questions: 50, marks: 50},
        {name: 'English', questions: 20, marks: 20},
      ],
    },
    tips: [
      'Focus on FSc syllabus - 80% questions from it',
      'Practice past papers from PMC website',
      'Biology has highest weightage - prioritize it',
      'Time management is key - 1 min per question',
    ],
    provinces: ['All Pakistan'],
  },
  {
    id: 'ecat-2026',
    name: 'ECAT',
    full_name: 'Engineering College Admission Test',
    conducting_body: 'UET (Lahore, Peshawar, Taxila)',
    description: 'Entrance test for admission to engineering programs in Punjab and KPK universities.',
    applicable_for: ['Engineering', 'BSc Engineering', 'Technology'],
    registration_start: '2026-05-15',
    registration_deadline: '2026-06-30',
    test_date: '2026-07-20',
    result_date: '2026-08-05',
    website: 'https://uet.edu.pk/ecat/',
    fee: 2500,
    eligibility: [
      'FSc Pre-Engineering with minimum 60% marks',
      'A-Levels with Physics, Chemistry, Math',
      'Punjab/KPK domicile for respective UET',
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
      'Negative marking exists - avoid guessing',
      'Focus on FSc Part 2 topics',
    ],
    provinces: ['Punjab', 'KPK'],
  },
  {
    id: 'net-2026',
    name: 'NET',
    full_name: 'NUST Entry Test',
    conducting_body: 'National University of Sciences and Technology',
    description: 'Computer-based entrance test for admission to all undergraduate programs at NUST.',
    applicable_for: ['Engineering', 'Computer Science', 'Business', 'Social Sciences', 'Medical'],
    registration_start: '2026-01-15',
    registration_deadline: '2026-05-31',
    test_date: '2026-02-01', // Multiple dates
    result_date: '2026-06-15',
    website: 'https://nust.edu.pk/admissions/',
    fee: 3500,
    eligibility: [
      'Minimum 60% in Matric',
      'Appearing/passed FSc or equivalent',
      'No age limit',
    ],
    test_format: {
      total_marks: 200,
      total_questions: 200,
      duration_minutes: 180,
      negative_marking: true,
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
    ],
    provinces: ['All Pakistan'],
  },
  {
    id: 'giki-2026',
    name: 'GIKI Test',
    full_name: 'GIK Institute Admission Test',
    conducting_body: 'Ghulam Ishaq Khan Institute',
    description: 'Entrance test for admission to engineering and management programs at GIKI.',
    applicable_for: ['Engineering', 'Computer Science', 'Management Sciences'],
    registration_start: '2026-03-01',
    registration_deadline: '2026-05-15',
    test_date: '2026-06-01',
    result_date: '2026-06-20',
    website: 'https://giki.edu.pk/admissions/',
    fee: 3000,
    eligibility: [
      'Minimum 60% in FSc Pre-Engineering',
      'A-Levels with relevant subjects',
      'SAT scores also accepted',
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
        {name: 'IQ', questions: 10, marks: 10},
      ],
    },
    tips: [
      'Strong math foundation required',
      'Practice logical reasoning',
      'Time is limited - work fast',
      'Similar to SAT in difficulty',
    ],
    provinces: ['All Pakistan'],
  },
  {
    id: 'fast-nu-2026',
    name: 'FAST-NU Test',
    full_name: 'FAST National University Entry Test',
    conducting_body: 'FAST-NUCES',
    description: 'Entrance test for Computer Science and Engineering programs at FAST-NU campuses.',
    applicable_for: ['Computer Science', 'Software Engineering', 'Electrical Engineering', 'Data Science'],
    registration_start: '2026-04-01',
    registration_deadline: '2026-06-15',
    test_date: '2026-07-01',
    result_date: '2026-07-15',
    website: 'https://nu.edu.pk/Admissions',
    fee: 2000,
    eligibility: [
      'Minimum 60% in FSc or equivalent',
      'Pre-Engineering, ICS, or A-Levels',
      'Mathematics required',
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
      'Strong focus on Analytical Reasoning',
      'No Physics/Chemistry - Math focused',
      'Practice IQ and pattern questions',
      'English includes vocabulary',
    ],
    provinces: ['All Pakistan'],
  },
  {
    id: 'lums-sat-2026',
    name: 'LUMS CBT / SAT',
    full_name: 'LUMS Common Admission Test / SAT',
    conducting_body: 'Lahore University of Management Sciences',
    description: 'LUMS accepts SAT scores or conducts its own CBT for admission.',
    applicable_for: ['Business', 'Computer Science', 'Engineering', 'Social Sciences', 'Law'],
    registration_start: '2026-09-01',
    registration_deadline: '2026-01-15',
    test_date: '2026-02-01',
    result_date: '2026-03-15',
    website: 'https://lums.edu.pk/admissions',
    fee: 5000,
    eligibility: [
      'Minimum 70% in Matric and Inter',
      'A-Levels with strong grades',
      'SAT score 1100+ (optional)',
    ],
    test_format: {
      total_marks: 100,
      total_questions: 60,
      duration_minutes: 120,
      negative_marking: false,
      sections: [
        {name: 'Quantitative', questions: 25, marks: 40},
        {name: 'Verbal', questions: 25, marks: 40},
        {name: 'Analytical Writing', questions: 2, marks: 20},
      ],
    },
    tips: [
      'SAT score can replace LUMS test',
      'Strong focus on verbal reasoning',
      'Writing skills are evaluated',
      'Apply early for NOP scholarship',
    ],
    provinces: ['All Pakistan'],
  },
  {
    id: 'nat-ie-2026',
    name: 'NAT-IE',
    full_name: 'National Aptitude Test (Science/Engineering)',
    conducting_body: 'National Testing Service (NTS)',
    description: 'General aptitude test accepted by many universities for engineering programs.',
    applicable_for: ['Engineering', 'Sciences', 'IT'],
    registration_start: '2026-05-01',
    registration_deadline: '2026-06-10',
    test_date: '2026-06-25',
    result_date: '2026-07-10',
    website: 'https://nts.org.pk/',
    fee: 1200,
    eligibility: [
      'FSc or equivalent qualification',
      'No minimum marks required for test',
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
      'Score valid for 1 year',
      'Accepted by many universities',
      'Good backup option',
      'Practice NTS past papers',
    ],
    provinces: ['All Pakistan'],
  },
  {
    id: 'hap-lat-2026',
    name: 'LAT',
    full_name: 'Law Admission Test',
    conducting_body: 'HEC Pakistan',
    description: 'Mandatory test for admission to 5-year LLB programs in Pakistan.',
    applicable_for: ['LLB', 'Law', 'Legal Studies'],
    registration_start: '2026-07-01',
    registration_deadline: '2026-08-15',
    test_date: '2026-09-01',
    result_date: '2026-09-20',
    website: 'https://etc.hec.gov.pk/',
    fee: 2500,
    eligibility: [
      'Passed Intermediate/A-Levels',
      'Minimum 45% marks in Inter',
      'No age limit',
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
      'Focus on current affairs',
      'Pakistan Studies is important',
      'Practice English comprehension',
      'Score valid for 2 years',
    ],
    provinces: ['All Pakistan'],
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
