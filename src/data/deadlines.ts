/**
 * Admission Deadlines Data
 * Contains deadline information for major Pakistani universities
 */

export interface AdmissionDeadline {
  id: string;
  universityId: string;
  universityName: string;
  universityShortName: string;
  programType: 'undergraduate' | 'graduate' | 'phd' | 'professional';
  programCategory: string;
  title: string;
  description?: string;
  applicationStartDate: string; // ISO date string
  applicationDeadline: string; // ISO date string
  entryTestDate?: string;
  resultDate?: string;
  classStartDate?: string;
  fee?: number;
  link?: string;
  status: 'upcoming' | 'open' | 'closing-soon' | 'closed';
  isHighlighted?: boolean;
}

export interface FollowedUniversity {
  universityId: string;
  followedAt: string;
  notificationsEnabled: boolean;
}

// Sample admission deadlines (actual dates would be updated annually)
export const ADMISSION_DEADLINES: AdmissionDeadline[] = [
  // NUST
  {
    id: 'nust-ug-2025',
    universityId: 'nust',
    universityName: 'National University of Sciences and Technology',
    universityShortName: 'NUST',
    programType: 'undergraduate',
    programCategory: 'engineering',
    title: 'Undergraduate Engineering Admissions 2025',
    description: 'BS programs in Engineering, Computer Science, Business, and more',
    applicationStartDate: '2025-01-15',
    applicationDeadline: '2025-04-30',
    entryTestDate: '2025-06-15',
    resultDate: '2025-07-15',
    classStartDate: '2025-09-01',
    fee: 3000,
    link: 'https://nust.edu.pk/admissions',
    status: 'upcoming',
    isHighlighted: true,
  },
  {
    id: 'nust-net-1-2025',
    universityId: 'nust',
    universityName: 'National University of Sciences and Technology',
    universityShortName: 'NUST',
    programType: 'undergraduate',
    programCategory: 'general',
    title: 'NET-1 Test Registration',
    description: 'First NET test for undergraduate admissions',
    applicationStartDate: '2025-01-15',
    applicationDeadline: '2025-02-28',
    entryTestDate: '2025-03-15',
    fee: 2500,
    status: 'open',
  },
  // LUMS
  {
    id: 'lums-ug-2025',
    universityId: 'lums',
    universityName: 'Lahore University of Management Sciences',
    universityShortName: 'LUMS',
    programType: 'undergraduate',
    programCategory: 'general',
    title: 'Undergraduate Admissions 2025',
    description: 'Apply for BSc, BA, BS programs across all schools',
    applicationStartDate: '2025-01-01',
    applicationDeadline: '2025-02-15',
    entryTestDate: '2025-03-10',
    resultDate: '2025-04-20',
    classStartDate: '2025-08-25',
    fee: 5000,
    link: 'https://lums.edu.pk/admissions',
    status: 'closing-soon',
    isHighlighted: true,
  },
  {
    id: 'lums-mba-2025',
    universityId: 'lums',
    universityName: 'Lahore University of Management Sciences',
    universityShortName: 'LUMS',
    programType: 'graduate',
    programCategory: 'business',
    title: 'MBA Program Admissions',
    description: 'Full-time MBA at Suleman Dawood School of Business',
    applicationStartDate: '2025-01-15',
    applicationDeadline: '2025-03-31',
    fee: 7500,
    status: 'open',
  },
  // FAST-NUCES
  {
    id: 'fast-ug-2025',
    universityId: 'fast',
    universityName: 'FAST National University',
    universityShortName: 'FAST',
    programType: 'undergraduate',
    programCategory: 'computer-science',
    title: 'BS Computer Science Admissions',
    description: 'Apply for BS CS, SE, AI, DS programs at all campuses',
    applicationStartDate: '2025-03-01',
    applicationDeadline: '2025-06-15',
    entryTestDate: '2025-07-01',
    resultDate: '2025-07-20',
    classStartDate: '2025-09-01',
    fee: 2000,
    link: 'https://nu.edu.pk/Admissions',
    status: 'upcoming',
    isHighlighted: true,
  },
  // GIKI
  {
    id: 'giki-ug-2025',
    universityId: 'giki',
    universityName: 'Ghulam Ishaq Khan Institute',
    universityShortName: 'GIKI',
    programType: 'undergraduate',
    programCategory: 'engineering',
    title: 'Engineering Admissions 2025',
    description: 'BS Engineering programs - Top ranked engineering university',
    applicationStartDate: '2025-02-01',
    applicationDeadline: '2025-05-15',
    entryTestDate: '2025-06-10',
    resultDate: '2025-07-01',
    classStartDate: '2025-08-15',
    fee: 3500,
    status: 'open',
    isHighlighted: true,
  },
  // COMSATS
  {
    id: 'comsats-ug-2025',
    universityId: 'comsats',
    universityName: 'COMSATS University Islamabad',
    universityShortName: 'COMSATS',
    programType: 'undergraduate',
    programCategory: 'general',
    title: 'Fall 2025 Admissions',
    description: 'BS programs across all COMSATS campuses',
    applicationStartDate: '2025-05-01',
    applicationDeadline: '2025-07-31',
    classStartDate: '2025-09-15',
    fee: 1500,
    status: 'upcoming',
  },
  // PIEAS
  {
    id: 'pieas-ug-2025',
    universityId: 'pieas',
    universityName: 'Pakistan Institute of Engineering & Applied Sciences',
    universityShortName: 'PIEAS',
    programType: 'undergraduate',
    programCategory: 'engineering',
    title: 'BS Engineering Admissions',
    description: 'Top nuclear engineering programs',
    applicationStartDate: '2025-04-01',
    applicationDeadline: '2025-06-30',
    entryTestDate: '2025-07-15',
    fee: 2000,
    status: 'upcoming',
    isHighlighted: true,
  },
  // Punjab University
  {
    id: 'pu-mbbs-2025',
    universityId: 'pu',
    universityName: 'University of the Punjab',
    universityShortName: 'PU',
    programType: 'professional',
    programCategory: 'medical',
    title: 'MBBS/BDS Admissions',
    description: 'Medical and Dental programs via MDCAT',
    applicationStartDate: '2025-07-01',
    applicationDeadline: '2025-10-15',
    fee: 2500,
    status: 'upcoming',
  },
  // IBA Karachi
  {
    id: 'iba-bba-2025',
    universityId: 'iba',
    universityName: 'Institute of Business Administration',
    universityShortName: 'IBA',
    programType: 'undergraduate',
    programCategory: 'business',
    title: 'BBA Program Admissions',
    description: 'Premier business school in Pakistan',
    applicationStartDate: '2025-01-15',
    applicationDeadline: '2025-03-15',
    entryTestDate: '2025-04-05',
    fee: 4000,
    link: 'https://iba.edu.pk',
    status: 'open',
    isHighlighted: true,
  },
  // UET Lahore
  {
    id: 'uet-ug-2025',
    universityId: 'uet',
    universityName: 'University of Engineering and Technology',
    universityShortName: 'UET',
    programType: 'undergraduate',
    programCategory: 'engineering',
    title: 'Engineering Admissions via ECAT',
    description: 'Apply for engineering programs through Punjab ECAT',
    applicationStartDate: '2025-06-01',
    applicationDeadline: '2025-08-15',
    entryTestDate: '2025-07-20',
    fee: 2000,
    status: 'upcoming',
  },
  // AKU Medical
  {
    id: 'aku-mbbs-2025',
    universityId: 'aku',
    universityName: 'Aga Khan University',
    universityShortName: 'AKU',
    programType: 'professional',
    programCategory: 'medical',
    title: 'MBBS Admissions 2025',
    description: 'Top medical school with excellent clinical training',
    applicationStartDate: '2025-08-01',
    applicationDeadline: '2025-10-31',
    fee: 6000,
    status: 'upcoming',
    isHighlighted: true,
  },
  // NCA
  {
    id: 'nca-bfa-2025',
    universityId: 'nca',
    universityName: 'National College of Arts',
    universityShortName: 'NCA',
    programType: 'undergraduate',
    programCategory: 'arts',
    title: 'BFA/BDes Admissions',
    description: 'Fine Arts and Design programs',
    applicationStartDate: '2025-04-01',
    applicationDeadline: '2025-06-15',
    entryTestDate: '2025-07-01',
    fee: 3000,
    status: 'upcoming',
  },
  // IST
  {
    id: 'ist-ug-2025',
    universityId: 'ist',
    universityName: 'Institute of Space Technology',
    universityShortName: 'IST',
    programType: 'undergraduate',
    programCategory: 'engineering',
    title: 'BS Aerospace Engineering',
    description: 'Specialized space technology programs',
    applicationStartDate: '2025-04-15',
    applicationDeadline: '2025-06-30',
    fee: 2500,
    status: 'upcoming',
  },
  // PUCIT
  {
    id: 'pucit-bscs-2025',
    universityId: 'pucit',
    universityName: 'Punjab University College of IT',
    universityShortName: 'PUCIT',
    programType: 'undergraduate',
    programCategory: 'computer-science',
    title: 'BS Computer Science',
    description: 'Computer Science programs at PUCIT',
    applicationStartDate: '2025-06-01',
    applicationDeadline: '2025-08-31',
    fee: 1800,
    status: 'upcoming',
  },
];

// Program categories for filtering
export const PROGRAM_CATEGORIES = [
  {id: 'all', name: 'All Programs', iconName: 'apps-outline'},
  {id: 'engineering', name: 'Engineering', iconName: 'construct-outline'},
  {id: 'computer-science', name: 'Computer Science', iconName: 'code-slash-outline'},
  {id: 'medical', name: 'Medical', iconName: 'medkit-outline'},
  {id: 'business', name: 'Business', iconName: 'briefcase-outline'},
  {id: 'arts', name: 'Arts & Design', iconName: 'color-palette-outline'},
  {id: 'general', name: 'General', iconName: 'school-outline'},
];

// Helper functions
export const getUpcomingDeadlines = (days: number = 30): AdmissionDeadline[] => {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);

  return ADMISSION_DEADLINES.filter(d => {
    const deadline = new Date(d.applicationDeadline);
    return deadline >= now && deadline <= futureDate;
  }).sort((a, b) => 
    new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime()
  );
};

export const getDeadlinesByUniversity = (universityId: string): AdmissionDeadline[] => {
  return ADMISSION_DEADLINES.filter(d => d.universityId === universityId);
};

export const getHighlightedDeadlines = (): AdmissionDeadline[] => {
  return ADMISSION_DEADLINES.filter(d => d.isHighlighted);
};

export const getDeadlineStatus = (deadline: AdmissionDeadline): string => {
  const now = new Date();
  const deadlineDate = new Date(deadline.applicationDeadline);
  const startDate = new Date(deadline.applicationStartDate);
  const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (now < startDate) return 'upcoming';
  if (daysLeft < 0) return 'closed';
  if (daysLeft <= 7) return 'closing-soon';
  return 'open';
};

export const getDaysUntilDeadline = (deadline: AdmissionDeadline): number => {
  const now = new Date();
  const deadlineDate = new Date(deadline.applicationDeadline);
  return Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};
