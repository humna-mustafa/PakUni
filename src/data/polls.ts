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
  category: 'campus' | 'academics' | 'facilities' | 'career' | 'overall';
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
];

export default POLLS_DATA;
