/**
 * Interest Quiz data - questions, career mappings
 */

export interface QuizOption {
  text: string;
  iconName: string;
  careers: string[];
}

export interface QuizQuestion {
  id: number;
  category: string;
  question: string;
  iconName: string;
  options: QuizOption[];
}

export interface CareerMeta {
  entryTest: string;       // Required entry test(s)
  salaryRange: string;     // Avg monthly salary in PKR
  degree: string;          // Required degree
  duration: string;        // Duration
  topUniversities: string; // 3 top unis in Pakistan
  outlook: 'High' | 'Medium' | 'Very High'; // Job market outlook
  outlookColor: string;
  icon: string;
}

export const CAREER_METADATA: Record<string, CareerMeta> = {
  'medicine': {
    entryTest: 'MDCAT', salaryRange: '1.5L – 5L+/mo', degree: 'MBBS (5 yr)',
    duration: '5 yrs + 1 yr house job', topUniversities: 'AKU, KEMU, NUMS',
    outlook: 'Very High', outlookColor: '#16A34A', icon: 'medkit-outline',
  },
  'dentistry': {
    entryTest: 'MDCAT', salaryRange: '80K – 3L/mo', degree: 'BDS (4 yr)',
    duration: '4 yrs + 1 yr internship', topUniversities: 'AKU, UoK, NUMS',
    outlook: 'High', outlookColor: '#2563EB', icon: 'fitness-outline',
  },
  'pharmacy': {
    entryTest: 'MDCAT', salaryRange: '60K – 2L/mo', degree: 'Pharm-D (5 yr)',
    duration: '5 yrs', topUniversities: 'UoP, UoK, Hamdard',
    outlook: 'High', outlookColor: '#2563EB', icon: 'flask-outline',
  },
  'software-engineering': {
    entryTest: 'NUST NET / FAST FAT', salaryRange: '80K – 5L+/mo', degree: 'BS CS/SE (4 yr)',
    duration: '4 yrs', topUniversities: 'FAST, NUST, LUMS',
    outlook: 'Very High', outlookColor: '#16A34A', icon: 'code-slash-outline',
  },
  'electrical-engineering': {
    entryTest: 'ECAT / NUST NET', salaryRange: '70K – 3L/mo', degree: 'BE EE (4 yr)',
    duration: '4 yrs', topUniversities: 'NUST, UET, GIKI',
    outlook: 'High', outlookColor: '#2563EB', icon: 'flash-outline',
  },
  'mechanical-engineering': {
    entryTest: 'ECAT / NUST NET', salaryRange: '70K – 2.5L/mo', degree: 'BE Mech (4 yr)',
    duration: '4 yrs', topUniversities: 'NUST, UET, GIKI',
    outlook: 'High', outlookColor: '#2563EB', icon: 'cog-outline',
  },
  'civil-engineering': {
    entryTest: 'ECAT / NUST NET', salaryRange: '70K – 3L/mo', degree: 'BE Civil (4 yr)',
    duration: '4 yrs', topUniversities: 'NED, UET, NUST',
    outlook: 'High', outlookColor: '#2563EB', icon: 'business-outline',
  },
  'business-finance': {
    entryTest: 'LCAT / IBA Test', salaryRange: '60K – 4L/mo', degree: 'BBA/BS Finance (4 yr)',
    duration: '4 yrs', topUniversities: 'LUMS, IBA, NBS',
    outlook: 'High', outlookColor: '#2563EB', icon: 'trending-up-outline',
  },
  'chartered-accountant': {
    entryTest: 'ICAP Stages', salaryRange: '1L – 6L+/mo', degree: 'CA (ICAP)',
    duration: '3–5 yrs (part-time)', topUniversities: 'ICAP accredited',
    outlook: 'Very High', outlookColor: '#16A34A', icon: 'calculator-outline',
  },
  'law': {
    entryTest: 'HEC LAT / LCAT', salaryRange: '60K – 5L+/mo', degree: 'LLB (3 yr) / LLB 5-yr',
    duration: '3–5 yrs', topUniversities: 'LUMS, PU Law, IU Islamabad',
    outlook: 'High', outlookColor: '#2563EB', icon: 'scales-outline',
  },
  'graphic-design': {
    entryTest: 'NCA / BNU Test', salaryRange: '40K – 2L+/mo', degree: 'BFA / BS Design (4 yr)',
    duration: '4 yrs', topUniversities: 'NCA, BNU, Indus Valley',
    outlook: 'Medium', outlookColor: '#D97706', icon: 'color-palette-outline',
  },
  'teaching': {
    entryTest: 'None / NTS', salaryRange: '35K – 1.5L/mo', degree: 'B.Ed / BS Education',
    duration: '2–4 yrs', topUniversities: 'IU, AIOU, UVAS',
    outlook: 'High', outlookColor: '#2563EB', icon: 'school-outline',
  },
  'journalism': {
    entryTest: 'None', salaryRange: '40K – 2L/mo', degree: 'BS Mass Comm (4 yr)',
    duration: '4 yrs', topUniversities: 'AU, PU, BNU',
    outlook: 'Medium', outlookColor: '#D97706', icon: 'megaphone-outline',
  },
  'civil-services': {
    entryTest: 'FPSC CSS', salaryRange: '1L – 4L+/mo', degree: 'Any BS (4 yr)',
    duration: '4 yr degree + CSS prep', topUniversities: 'Any well-reputed uni',
    outlook: 'High', outlookColor: '#2563EB', icon: 'globe-outline',
  },
  'aviation-pilot': {
    entryTest: 'ATPL / CAA Tests', salaryRange: '2L – 10L+/mo', degree: 'CPL / ATPL',
    duration: '18 mo – 2 yrs', topUniversities: 'NACA, Air Force',
    outlook: 'High', outlookColor: '#2563EB', icon: 'airplane-outline',
  },
  'data-science-ai': {
    entryTest: 'NUST NET / FAST FAT', salaryRange: '1L – 6L+/mo', degree: 'BS DS/AI/CS (4 yr)',
    duration: '4 yrs', topUniversities: 'FAST, NUST, ITU',
    outlook: 'Very High', outlookColor: '#16A34A', icon: 'analytics-outline',
  },
  'psychology': {
    entryTest: 'None / Uni Test', salaryRange: '45K – 2L/mo', degree: 'BS Psychology (4 yr)',
    duration: '4 yrs', topUniversities: 'QAU, COMSATS, LUMS',
    outlook: 'Medium', outlookColor: '#D97706', icon: 'brain-outline',
  },
  'architecture': {
    entryTest: 'NCA / Uni Test', salaryRange: '60K – 3L/mo', degree: 'B.Arch (5 yr)',
    duration: '5 yrs', topUniversities: 'NCA, NED, BNU',
    outlook: 'High', outlookColor: '#2563EB', icon: 'triangle-outline',
  },
  'armed-forces': {
    entryTest: 'ISSB', salaryRange: '80K – 4L+/mo', degree: 'BSc (via Military Academy)',
    duration: '4 yrs', topUniversities: 'PMA, PNA, PAF Academy',
    outlook: 'High', outlookColor: '#2563EB', icon: 'shield-outline',
  },
  'agriculture': {
    entryTest: 'NAT / Uni Test', salaryRange: '45K – 2L/mo', degree: 'BS Agriculture (4 yr)',
    duration: '4 yrs', topUniversities: 'UAF, UVAS, SAU',
    outlook: 'High', outlookColor: '#2563EB', icon: 'leaf-outline',
  },
  'fashion-design': {
    entryTest: 'Indus / NCA Test', salaryRange: '40K – 2L+/mo', degree: 'BFA Fashion (4 yr)',
    duration: '4 yrs', topUniversities: 'Indus Valley, NCA, PIFAD',
    outlook: 'Medium', outlookColor: '#D97706', icon: 'shirt-outline',
  },
};

export const CAREER_DISPLAY_NAMES: Record<string, string> = {
  'medicine': 'Medicine (MBBS/Doctor)',
  'dentistry': 'Dentistry (BDS)',
  'pharmacy': 'Pharmacy (Pharm-D)',
  'software-engineering': 'Software Engineering',
  'electrical-engineering': 'Electrical Engineering',
  'mechanical-engineering': 'Mechanical Engineering',
  'civil-engineering': 'Civil Engineering',
  'business-finance': 'Business & Finance',
  'chartered-accountant': 'Chartered Accountant',
  'law': 'Law (LLB)',
  'graphic-design': 'Graphic Design',
  'teaching': 'Teaching & Education',
  'journalism': 'Journalism & Media',
  'civil-services': 'Civil Services (CSS)',
  'aviation-pilot': 'Aviation Pilot',
  'data-science-ai': 'Data Science & AI',
  'psychology': 'Psychology',
  'architecture': 'Architecture',
  'armed-forces': 'Armed Forces / Defence',
  'agriculture': 'Agriculture & Food Science',
  'fashion-design': 'Fashion & Textile Design',
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1, category: 'interests', question: 'What do you enjoy doing in your free time?', iconName: 'color-palette-outline',
    options: [
      {text: 'Building or fixing things', iconName: 'construct-outline', careers: ['electrical-engineering', 'civil-engineering', 'software-engineering']},
      {text: 'Reading or writing', iconName: 'book-outline', careers: ['law', 'journalism', 'teaching']},
      {text: 'Playing with computers/gadgets', iconName: 'laptop-outline', careers: ['software-engineering', 'data-science-ai', 'electrical-engineering']},
      {text: 'Helping people with problems', iconName: 'heart-outline', careers: ['medicine', 'psychology', 'teaching']},
    ],
  },
  {
    id: 2, category: 'subjects', question: 'Which subject do you enjoy most?', iconName: 'book-outline',
    options: [
      {text: 'Mathematics & Physics', iconName: 'calculator-outline', careers: ['electrical-engineering', 'civil-engineering', 'data-science-ai', 'chartered-accountant']},
      {text: 'Biology & Chemistry', iconName: 'flask-outline', careers: ['medicine', 'dentistry', 'psychology']},
      {text: 'English & Languages', iconName: 'document-text-outline', careers: ['law', 'journalism', 'teaching']},
      {text: 'Computer & IT', iconName: 'desktop-outline', careers: ['software-engineering', 'data-science-ai']},
    ],
  },
  {
    id: 3, category: 'workstyle', question: 'How do you prefer to work?', iconName: 'briefcase-outline',
    options: [
      {text: 'Alone, focused on deep work', iconName: 'flag-outline', careers: ['software-engineering', 'data-science-ai', 'graphic-design', 'journalism']},
      {text: 'In a collaborative team', iconName: 'people-outline', careers: ['business-finance', 'civil-engineering', 'teaching']},
      {text: 'Outdoors or in the field', iconName: 'leaf-outline', careers: ['civil-engineering', 'journalism', 'civil-services', 'aviation-pilot']},
      {text: 'Directly with clients/patients', iconName: 'medkit-outline', careers: ['medicine', 'dentistry', 'psychology', 'teaching']},
    ],
  },
  {
    id: 4, category: 'motivation', question: 'What motivates you the most?', iconName: 'star-outline',
    options: [
      {text: 'Earning well & financial security', iconName: 'wallet-outline', careers: ['business-finance', 'chartered-accountant', 'software-engineering', 'medicine']},
      {text: 'Helping society & making impact', iconName: 'globe-outline', careers: ['medicine', 'psychology', 'civil-services', 'teaching']},
      {text: 'Creating & innovating new things', iconName: 'bulb-outline', careers: ['graphic-design', 'software-engineering', 'data-science-ai', 'electrical-engineering']},
      {text: 'Learning & gaining knowledge', iconName: 'school-outline', careers: ['data-science-ai', 'teaching', 'law', 'psychology']},
    ],
  },
  {
    id: 5, category: 'stress', question: 'How do you handle pressure?', iconName: 'pulse-outline',
    options: [
      {text: 'Stay calm, make a plan', iconName: 'clipboard-outline', careers: ['medicine', 'law', 'civil-services', 'aviation-pilot']},
      {text: 'Get creative with solutions', iconName: 'color-palette-outline', careers: ['graphic-design', 'journalism', 'software-engineering']},
      {text: 'Solve problems quickly & move on', iconName: 'flash-outline', careers: ['software-engineering', 'journalism', 'electrical-engineering']},
      {text: 'Discuss with others for ideas', iconName: 'chatbubble-outline', careers: ['psychology', 'teaching', 'business-finance']},
    ],
  },
  {
    id: 6, category: 'skills', question: 'What are you naturally good at?', iconName: 'sparkles-outline',
    options: [
      {text: 'Analyzing data & finding patterns', iconName: 'analytics-outline', careers: ['data-science-ai', 'chartered-accountant', 'business-finance', 'software-engineering']},
      {text: 'Communicating & persuading others', iconName: 'megaphone-outline', careers: ['law', 'journalism', 'business-finance', 'civil-services']},
      {text: 'Understanding & helping people', iconName: 'heart-outline', careers: ['psychology', 'medicine', 'teaching', 'dentistry']},
      {text: 'Designing & creating visuals', iconName: 'brush-outline', careers: ['graphic-design', 'civil-engineering', 'software-engineering']},
    ],
  },
  {
    id: 7, category: 'environment', question: 'What work environment appeals to you?', iconName: 'business-outline',
    options: [
      {text: 'Corporate office with structure', iconName: 'business-outline', careers: ['business-finance', 'chartered-accountant', 'civil-services', 'law']},
      {text: 'Hospital or healthcare setting', iconName: 'medkit-outline', careers: ['medicine', 'dentistry', 'psychology']},
      {text: 'Startup or creative agency', iconName: 'rocket-outline', careers: ['software-engineering', 'graphic-design', 'data-science-ai', 'journalism']},
      {text: 'Remote or freelance work', iconName: 'home-outline', careers: ['software-engineering', 'graphic-design', 'data-science-ai', 'journalism']},
    ],
  },
  {
    id: 8, category: 'leadership', question: 'How do you see yourself in a team?', iconName: 'people-outline',
    options: [
      {text: 'Leading & making decisions', iconName: 'ribbon-outline', careers: ['business-finance', 'civil-services', 'law', 'medicine']},
      {text: 'Expert who provides solutions', iconName: 'bulb-outline', careers: ['software-engineering', 'electrical-engineering', 'medicine', 'data-science-ai']},
      {text: 'Supporting & helping team succeed', iconName: 'hand-left-outline', careers: ['teaching', 'psychology', 'journalism']},
      {text: 'Working independently on tasks', iconName: 'person-outline', careers: ['software-engineering', 'graphic-design', 'chartered-accountant', 'data-science-ai']},
    ],
  },
  {
    id: 9, category: 'risk', question: 'How do you feel about taking risks?', iconName: 'shield-outline',
    options: [
      {text: 'Love taking calculated risks', iconName: 'trending-up-outline', careers: ['business-finance', 'aviation-pilot', 'software-engineering']},
      {text: 'Prefer stable, secure career', iconName: 'shield-checkmark-outline', careers: ['civil-services', 'teaching', 'medicine', 'chartered-accountant']},
      {text: 'Okay with moderate risks', iconName: 'swap-horizontal-outline', careers: ['software-engineering', 'journalism', 'graphic-design', 'data-science-ai']},
      {text: 'Risk depends on the reward', iconName: 'scale-outline', careers: ['law', 'business-finance', 'chartered-accountant']},
    ],
  },
  {
    id: 10, category: 'future', question: "What's most important for your future career?", iconName: 'rocket-outline',
    options: [
      {text: 'High salary & benefits', iconName: 'cash-outline', careers: ['medicine', 'software-engineering', 'chartered-accountant', 'law']},
      {text: 'Work-life balance', iconName: 'heart-circle-outline', careers: ['teaching', 'civil-services', 'psychology', 'graphic-design']},
      {text: 'Growth & learning opportunities', iconName: 'trending-up-outline', careers: ['software-engineering', 'data-science-ai', 'business-finance', 'journalism']},
      {text: 'Job security & stability', iconName: 'shield-outline', careers: ['civil-services', 'medicine', 'teaching', 'chartered-accountant']},
    ],
  },
  {
    id: 11, category: 'pakcontext', question: 'Which type of problem do you want to solve for Pakistan?', iconName: 'globe-outline',
    options: [
      {text: 'Healthcare access & medical crisis', iconName: 'medkit-outline', careers: ['medicine', 'dentistry', 'pharmacy', 'psychology']},
      {text: 'Technology & digital economy', iconName: 'code-slash-outline', careers: ['software-engineering', 'data-science-ai', 'electrical-engineering']},
      {text: 'Governance & justice system', iconName: 'scales-outline', careers: ['law', 'civil-services', 'journalism']},
      {text: 'Food security & agriculture', iconName: 'leaf-outline', careers: ['agriculture', 'civil-engineering', 'business-finance']},
    ],
  },
  {
    id: 12, category: 'education', question: 'Which secondary education group would you choose?', iconName: 'school-outline',
    options: [
      {text: 'Pre-Medical (Biology, Chemistry)', iconName: 'flask-outline', careers: ['medicine', 'dentistry', 'pharmacy', 'psychology', 'agriculture']},
      {text: 'Pre-Engineering (Math, Physics)', iconName: 'calculator-outline', careers: ['software-engineering', 'electrical-engineering', 'civil-engineering', 'mechanical-engineering', 'data-science-ai']},
      {text: 'Commerce / ICS (Accounts)', iconName: 'briefcase-outline', careers: ['business-finance', 'chartered-accountant', 'law', 'civil-services']},
      {text: 'Arts / Humanities', iconName: 'color-palette-outline', careers: ['journalism', 'teaching', 'graphic-design', 'fashion-design', 'architecture']},
    ],
  },
  {
    id: 13, category: 'lifestyle', question: 'Which lifestyle suits you best?', iconName: 'home-outline',
    options: [
      {text: 'Prestigious title & social respect', iconName: 'ribbon-outline', careers: ['medicine', 'law', 'civil-services', 'armed-forces']},
      {text: 'Remote work & freedom', iconName: 'wifi-outline', careers: ['software-engineering', 'graphic-design', 'data-science-ai', 'journalism']},
      {text: 'Steady 9-5, family time', iconName: 'people-circle-outline', careers: ['teaching', 'civil-services', 'chartered-accountant', 'pharmacy']},
      {text: 'Adventure & challenge', iconName: 'airplane-outline', careers: ['aviation-pilot', 'armed-forces', 'civil-engineering', 'journalism']},
    ],
  },
  {
    id: 14, category: 'talent', question: 'Your friends would describe your strongest trait as:', iconName: 'star-outline',
    options: [
      {text: 'Super organized & detail-oriented', iconName: 'list-outline', careers: ['chartered-accountant', 'medicine', 'architecture', 'civil-services']},
      {text: 'Creative & always full of ideas', iconName: 'bulb-outline', careers: ['graphic-design', 'architecture', 'fashion-design', 'journalism', 'software-engineering']},
      {text: 'Confident speaker & negotiator', iconName: 'mic-outline', careers: ['law', 'business-finance', 'journalism', 'civil-services']},
      {text: 'Problem-solver & logical thinker', iconName: 'git-branch-outline', careers: ['software-engineering', 'data-science-ai', 'electrical-engineering', 'mechanical-engineering']},
    ],
  },
  {
    id: 15, category: 'income', question: 'What is your primary income goal?', iconName: 'cash-outline',
    options: [
      {text: 'Highest possible (even if difficult)', iconName: 'trending-up-outline', careers: ['medicine', 'software-engineering', 'chartered-accountant', 'law']},
      {text: 'Good enough with less stress', iconName: 'checkmark-circle-outline', careers: ['teaching', 'pharmacy', 'civil-services', 'agriculture']},
      {text: 'Build my own business/freelance', iconName: 'rocket-outline', careers: ['software-engineering', 'graphic-design', 'data-science-ai', 'fashion-design']},
      {text: 'Government pension & security', iconName: 'shield-outline', careers: ['civil-services', 'armed-forces', 'teaching', 'chartered-accountant']},
    ],
  },
];
