/**
 * University Polls Data
 * Permanent polls with categories for university comparisons
 */

export interface PollOption {
  id: string;
  name: string;
  shortName?: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  category: 'campus' | 'academics' | 'facilities' | 'career' | 'overall' | 'student-life' | 'admissions';
  description: string;
  options: PollOption[];
  totalVotes: number;
  isActive: boolean;
  createdAt: string;
}

export const POLL_CATEGORIES = [
  {id: 'all', name: 'All Polls', iconName: 'grid-outline'},
  {id: 'campus', name: 'Campus Life', iconName: 'people-outline'},
  {id: 'academics', name: 'Academics', iconName: 'school-outline'},
  {id: 'facilities', name: 'Facilities', iconName: 'business-outline'},
  {id: 'career', name: 'Career', iconName: 'briefcase-outline'},
  {id: 'overall', name: 'Overall', iconName: 'trophy-outline'},
  {id: 'student-life', name: 'Student Life', iconName: 'heart-outline'},
  {id: 'admissions', name: 'Admissions', iconName: 'clipboard-outline'},
];

// Sample polls - In production, these would come from Supabase
export const POLLS_DATA: Poll[] = [
  {
    id: 'poll-1',
    question: 'Best Campus Life in Pakistan?',
    category: 'campus',
    description: 'Which university offers the best overall campus experience?',
    options: [
      {id: 'opt-1', name: 'LUMS', shortName: 'LUMS', votes: 2847},
      {id: 'opt-2', name: 'NUST', shortName: 'NUST', votes: 3256},
      {id: 'opt-3', name: 'GIKI', shortName: 'GIKI', votes: 1523},
      {id: 'opt-4', name: 'FAST-NU', shortName: 'FAST', votes: 1892},
      {id: 'opt-5', name: 'IBA Karachi', shortName: 'IBA', votes: 1124},
    ],
    totalVotes: 10642,
    isActive: true,
    createdAt: '2024-01-15',
  },
  {
    id: 'poll-2',
    question: 'Best Computer Science Faculty?',
    category: 'academics',
    description: 'Which university has the strongest CS department?',
    options: [
      {id: 'opt-1', name: 'FAST-NU', shortName: 'FAST', votes: 4521},
      {id: 'opt-2', name: 'NUST', shortName: 'NUST', votes: 3892},
      {id: 'opt-3', name: 'LUMS', shortName: 'LUMS', votes: 2156},
      {id: 'opt-4', name: 'COMSATS', shortName: 'CUI', votes: 2834},
      {id: 'opt-5', name: 'ITU', shortName: 'ITU', votes: 1245},
    ],
    totalVotes: 14648,
    isActive: true,
    createdAt: '2024-01-20',
  },
  {
    id: 'poll-3',
    question: 'Best Engineering University?',
    category: 'academics',
    description: 'Which university leads in engineering education?',
    options: [
      {id: 'opt-1', name: 'NUST', shortName: 'NUST', votes: 5234},
      {id: 'opt-2', name: 'UET Lahore', shortName: 'UET', votes: 3156},
      {id: 'opt-3', name: 'GIKI', shortName: 'GIKI', votes: 2987},
      {id: 'opt-4', name: 'NED Karachi', shortName: 'NED', votes: 2145},
      {id: 'opt-5', name: 'PIEAS', shortName: 'PIEAS', votes: 1823},
    ],
    totalVotes: 15345,
    isActive: true,
    createdAt: '2024-02-01',
  },
  {
    id: 'poll-4',
    question: 'Best Sports Facilities?',
    category: 'facilities',
    description: 'Which university has the best sports infrastructure?',
    options: [
      {id: 'opt-1', name: 'LUMS', shortName: 'LUMS', votes: 2156},
      {id: 'opt-2', name: 'Punjab University', shortName: 'PU', votes: 1845},
      {id: 'opt-3', name: 'NUST', shortName: 'NUST', votes: 2678},
      {id: 'opt-4', name: 'UET Lahore', shortName: 'UET', votes: 1234},
      {id: 'opt-5', name: 'Quaid-e-Azam University', shortName: 'QAU', votes: 987},
    ],
    totalVotes: 8900,
    isActive: true,
    createdAt: '2024-02-10',
  },
  {
    id: 'poll-5',
    question: 'Best Medical University?',
    category: 'academics',
    description: 'Which medical university is the best in Pakistan?',
    options: [
      {id: 'opt-1', name: 'Aga Khan University', shortName: 'AKU', votes: 4567},
      {id: 'opt-2', name: 'King Edward Medical', shortName: 'KEMU', votes: 3892},
      {id: 'opt-3', name: 'Dow University', shortName: 'DUHS', votes: 2345},
      {id: 'opt-4', name: 'Allama Iqbal Medical', shortName: 'AIMC', votes: 1987},
      {id: 'opt-5', name: 'Army Medical College', shortName: 'AMC', votes: 2156},
    ],
    totalVotes: 14947,
    isActive: true,
    createdAt: '2024-02-15',
  },
  {
    id: 'poll-6',
    question: 'Best for Job Placements?',
    category: 'career',
    description: 'Which university has the highest job placement rate?',
    options: [
      {id: 'opt-1', name: 'LUMS', shortName: 'LUMS', votes: 5123},
      {id: 'opt-2', name: 'IBA Karachi', shortName: 'IBA', votes: 4567},
      {id: 'opt-3', name: 'NUST', shortName: 'NUST', votes: 3845},
      {id: 'opt-4', name: 'FAST-NU', shortName: 'FAST', votes: 2987},
      {id: 'opt-5', name: 'GIK Institute', shortName: 'GIKI', votes: 1756},
    ],
    totalVotes: 18278,
    isActive: true,
    createdAt: '2024-03-01',
  },
  {
    id: 'poll-7',
    question: 'Best Library & Research Facilities?',
    category: 'facilities',
    description: 'Which university has the best library and research resources?',
    options: [
      {id: 'opt-1', name: 'Quaid-e-Azam University', shortName: 'QAU', votes: 2345},
      {id: 'opt-2', name: 'LUMS', shortName: 'LUMS', votes: 3156},
      {id: 'opt-3', name: 'Punjab University', shortName: 'PU', votes: 1987},
      {id: 'opt-4', name: 'NUST', shortName: 'NUST', votes: 2678},
      {id: 'opt-5', name: 'University of Karachi', shortName: 'UoK', votes: 1456},
    ],
    totalVotes: 11622,
    isActive: true,
    createdAt: '2024-03-10',
  },
  {
    id: 'poll-8',
    question: 'Best Business School?',
    category: 'academics',
    description: 'Which university has the best MBA/BBA programs?',
    options: [
      {id: 'opt-1', name: 'LUMS', shortName: 'LUMS', votes: 6234},
      {id: 'opt-2', name: 'IBA Karachi', shortName: 'IBA', votes: 5892},
      {id: 'opt-3', name: 'Lahore School of Economics', shortName: 'LSE', votes: 2156},
      {id: 'opt-4', name: 'NUST Business School', shortName: 'NBS', votes: 2478},
      {id: 'opt-5', name: 'SZABIST', shortName: 'SZABIST', votes: 1234},
    ],
    totalVotes: 17994,
    isActive: true,
    createdAt: '2024-03-20',
  },
  {
    id: 'poll-9',
    question: 'Best Hostel Facilities?',
    category: 'facilities',
    description: 'Which university provides the best hostel experience?',
    options: [
      {id: 'opt-1', name: 'GIKI', shortName: 'GIKI', votes: 3567},
      {id: 'opt-2', name: 'LUMS', shortName: 'LUMS', votes: 2987},
      {id: 'opt-3', name: 'NUST', shortName: 'NUST', votes: 2456},
      {id: 'opt-4', name: 'IBA Karachi', shortName: 'IBA', votes: 1678},
      {id: 'opt-5', name: 'Air University', shortName: 'AU', votes: 1234},
    ],
    totalVotes: 11922,
    isActive: true,
    createdAt: '2024-04-01',
  },
  {
    id: 'poll-10',
    question: 'Overall Best University in Pakistan?',
    category: 'overall',
    description: 'Considering everything - academics, facilities, career - which is the best?',
    options: [
      {id: 'opt-1', name: 'LUMS', shortName: 'LUMS', votes: 7845},
      {id: 'opt-2', name: 'NUST', shortName: 'NUST', votes: 8234},
      {id: 'opt-3', name: 'Aga Khan University', shortName: 'AKU', votes: 4567},
      {id: 'opt-4', name: 'FAST-NU', shortName: 'FAST', votes: 3892},
      {id: 'opt-5', name: 'Quaid-e-Azam University', shortName: 'QAU', votes: 3156},
    ],
    totalVotes: 27694,
    isActive: true,
    createdAt: '2024-04-15',
  },
  // Student Life & Admissions Polls
  {
    id: 'poll-11',
    question: 'Hardest Entry Test in Pakistan?',
    category: 'admissions',
    description: 'Which university entrance exam is the most difficult?',
    options: [
      {id: 'opt-1', name: 'NUST NET', shortName: 'NET', votes: 5234},
      {id: 'opt-2', name: 'LUMS SAT/LCAT', shortName: 'LCAT', votes: 3892},
      {id: 'opt-3', name: 'GIKI Test', shortName: 'GIKI', votes: 4156},
      {id: 'opt-4', name: 'MDCAT', shortName: 'MDCAT', votes: 6789},
      {id: 'opt-5', name: 'IBA Test', shortName: 'IBA', votes: 2987},
    ],
    totalVotes: 23058,
    isActive: true,
    createdAt: '2024-05-01',
  },
  {
    id: 'poll-12',
    question: 'Best Career After FSc Pre-Engineering?',
    category: 'career',
    description: 'If you are in FSc Pre-Engineering, which career path is best?',
    options: [
      {id: 'opt-1', name: 'Software Engineering', shortName: 'SE', votes: 8567},
      {id: 'opt-2', name: 'Electrical Engineering', shortName: 'EE', votes: 3234},
      {id: 'opt-3', name: 'Civil Engineering', shortName: 'Civil', votes: 2156},
      {id: 'opt-4', name: 'Mechanical Engineering', shortName: 'ME', votes: 1987},
      {id: 'opt-5', name: 'Data Science / AI', shortName: 'DS/AI', votes: 5678},
    ],
    totalVotes: 21622,
    isActive: true,
    createdAt: '2024-05-10',
  },
  {
    id: 'poll-13',
    question: 'Best Career After FSc Pre-Medical?',
    category: 'career',
    description: 'If you are in FSc Pre-Medical, which career path is best?',
    options: [
      {id: 'opt-1', name: 'MBBS Doctor', shortName: 'MBBS', votes: 9234},
      {id: 'opt-2', name: 'BDS Dentist', shortName: 'BDS', votes: 2156},
      {id: 'opt-3', name: 'Pharm-D Pharmacist', shortName: 'Pharm-D', votes: 3456},
      {id: 'opt-4', name: 'Veterinary Doctor', shortName: 'DVM', votes: 1234},
      {id: 'opt-5', name: 'Biotechnology / Research', shortName: 'Biotech', votes: 2678},
    ],
    totalVotes: 18758,
    isActive: true,
    createdAt: '2024-05-15',
  },
  {
    id: 'poll-14',
    question: 'Most Stressful Study Period?',
    category: 'student-life',
    description: 'Which phase of education is the most stressful for Pakistani students?',
    options: [
      {id: 'opt-1', name: 'Matric Board Exams', shortName: 'Matric', votes: 4567},
      {id: 'opt-2', name: 'FSc / Intermediate', shortName: 'FSc', votes: 7234},
      {id: 'opt-3', name: 'Entry Test Prep', shortName: 'Entry Test', votes: 8912},
      {id: 'opt-4', name: 'University Finals', shortName: 'Finals', votes: 3456},
      {id: 'opt-5', name: 'CSS / Job Prep', shortName: 'CSS', votes: 2345},
    ],
    totalVotes: 26514,
    isActive: true,
    createdAt: '2024-05-20',
  },
  {
    id: 'poll-15',
    question: 'Best City to Study In?',
    category: 'campus',
    description: 'Which Pakistani city offers the best student experience?',
    options: [
      {id: 'opt-1', name: 'Lahore', shortName: 'LHR', votes: 8567},
      {id: 'opt-2', name: 'Islamabad', shortName: 'ISB', votes: 7234},
      {id: 'opt-3', name: 'Karachi', shortName: 'KHI', votes: 5678},
      {id: 'opt-4', name: 'Peshawar', shortName: 'PEW', votes: 1234},
      {id: 'opt-5', name: 'Multan', shortName: 'MUL', votes: 987},
    ],
    totalVotes: 23700,
    isActive: true,
    createdAt: '2024-06-01',
  },
  {
    id: 'poll-16',
    question: 'Worth Taking Gap Year for Entry Tests?',
    category: 'admissions',
    description: 'Is it worth taking a gap year to prepare for entry tests?',
    options: [
      {id: 'opt-1', name: 'Yes, definitely worth it', shortName: 'Yes', votes: 6789},
      {id: 'opt-2', name: 'Only for top unis', shortName: 'Top Unis Only', votes: 4567},
      {id: 'opt-3', name: 'No, waste of time', shortName: 'No', votes: 2345},
      {id: 'opt-4', name: 'Depends on situation', shortName: 'Depends', votes: 5678},
    ],
    totalVotes: 19379,
    isActive: true,
    createdAt: '2024-06-10',
  },
  {
    id: 'poll-17',
    question: 'Most Useful Skill for Students?',
    category: 'student-life',
    description: 'Which skill should every Pakistani student learn?',
    options: [
      {id: 'opt-1', name: 'Programming / Coding', shortName: 'Coding', votes: 7890},
      {id: 'opt-2', name: 'English Communication', shortName: 'English', votes: 6234},
      {id: 'opt-3', name: 'Freelancing Skills', shortName: 'Freelance', votes: 5678},
      {id: 'opt-4', name: 'Digital Marketing', shortName: 'Marketing', votes: 2345},
      {id: 'opt-5', name: 'Graphic Design', shortName: 'Design', votes: 3456},
    ],
    totalVotes: 25603,
    isActive: true,
    createdAt: '2024-06-15',
  },
  {
    id: 'poll-18',
    question: 'Best Side Income for Students?',
    category: 'student-life',
    description: 'What is the best way for students to earn while studying?',
    options: [
      {id: 'opt-1', name: 'Freelancing', shortName: 'Freelance', votes: 8234},
      {id: 'opt-2', name: 'Tutoring / Teaching', shortName: 'Tutoring', votes: 5678},
      {id: 'opt-3', name: 'Content Creation', shortName: 'Content', votes: 3456},
      {id: 'opt-4', name: 'Part-time Job', shortName: 'Job', votes: 2345},
      {id: 'opt-5', name: 'Dropshipping / E-commerce', shortName: 'E-com', votes: 1987},
    ],
    totalVotes: 21700,
    isActive: true,
    createdAt: '2024-06-20',
  },
  {
    id: 'poll-19',
    question: 'Should Parents Choose Career?',
    category: 'career',
    description: 'Should Pakistani parents decide their children\'s career?',
    options: [
      {id: 'opt-1', name: 'No, student should choose', shortName: 'Student', votes: 12345},
      {id: 'opt-2', name: 'Yes, parents know best', shortName: 'Parents', votes: 3456},
      {id: 'opt-3', name: 'Both should decide together', shortName: 'Together', votes: 8765},
      {id: 'opt-4', name: 'Depends on maturity', shortName: 'Depends', votes: 4567},
    ],
    totalVotes: 29133,
    isActive: true,
    createdAt: '2024-06-25',
  },
  {
    id: 'poll-20',
    question: 'Best Entry Test Prep Academy?',
    category: 'admissions',
    description: 'Which academy is best for entry test preparation?',
    options: [
      {id: 'opt-1', name: 'KIPS', shortName: 'KIPS', votes: 6789},
      {id: 'opt-2', name: 'Punjab College', shortName: 'Punjab', votes: 4567},
      {id: 'opt-3', name: 'STEP', shortName: 'STEP', votes: 3456},
      {id: 'opt-4', name: 'Online Self-Study', shortName: 'Self-Study', votes: 5678},
      {id: 'opt-5', name: 'Edvanced / Nearpeer', shortName: 'Online', votes: 4234},
    ],
    totalVotes: 24724,
    isActive: true,
    createdAt: '2024-07-01',
  },
];

export default POLLS_DATA;
