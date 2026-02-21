/**
 * Subject Guide - Static data (types, subject groups, individual subjects).
 */

// ============================================================================
// TYPES
// ============================================================================

export interface Subject {
  id: string;
  name: string;
  iconName: string;
  description: string;
  category: 'science' | 'arts' | 'commerce' | 'technical';
  careers: string[];
  universities: string[];
  entryTests: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  tips: string[];
}

export interface SubjectGroup {
  id: string;
  name: string;
  iconName: string;
  color: string;
  description: string;
  compulsory: string[];
  electives: string[];
  careers: string[];
  universities: string[];
  boardExams: string;
  entryTests: string[];
}

// ============================================================================
// SUBJECT GROUPS (FSc/Intermediate)
// ============================================================================

export const SUBJECT_GROUPS: SubjectGroup[] = [
  {
    id: 'pre-medical', name: 'Pre-Medical', iconName: 'medkit', color: '#E53935',
    description: 'For students aspiring to become doctors, dentists, or work in healthcare',
    compulsory: ['Biology', 'Chemistry', 'Physics', 'English', 'Urdu/Islamiat/Pak Studies'],
    electives: ['Psychology', 'Health & Physical Education'],
    careers: ['Doctor (MBBS)', 'Dentist (BDS)', 'Pharmacist', 'Veterinarian', 'Physiotherapist', 'Nurse', 'Nutritionist'],
    universities: ['KE Lahore', 'AKU', 'DUHS', 'UHS', 'CMC Lahore', 'CMH Lahore'],
    boardExams: 'FSc Pre-Medical', entryTests: ['MDCAT', 'UHS Entry Test', 'AKU Entry Test'],
  },
  {
    id: 'pre-engineering', name: 'Pre-Engineering', iconName: 'construct', color: '#4573DF',
    description: 'For students interested in engineering, technology, and applied sciences',
    compulsory: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Urdu/Islamiat/Pak Studies'],
    electives: ['Computer Science', 'Statistics'],
    careers: ['Software Engineer', 'Electrical Engineer', 'Civil Engineer', 'Mechanical Engineer', 'Architect', 'Computer Scientist'],
    universities: ['NUST', 'GIKI', 'UET Lahore', 'NED', 'FAST-NU', 'COMSATS'],
    boardExams: 'FSc Pre-Engineering', entryTests: ['ECAT', 'NET', 'GIKI Test', 'FAST-NU Test', 'NED Test'],
  },
  {
    id: 'ics', name: 'ICS (Computer Science)', iconName: 'code-slash', color: '#4573DF',
    description: 'For students passionate about computers, programming, and IT',
    compulsory: ['Computer Science', 'Mathematics', 'Physics', 'English', 'Urdu/Islamiat/Pak Studies'],
    electives: ['Statistics', 'Economics'],
    careers: ['Software Developer', 'Data Scientist', 'Web Developer', 'Cybersecurity Analyst', 'AI Engineer', 'Game Developer'],
    universities: ['FAST-NU', 'LUMS', 'ITU', 'COMSATS', 'NUST', 'PUCIT'],
    boardExams: 'ICS', entryTests: ['FAST-NU Test', 'NET', 'LUMS SAT'],
  },
  {
    id: 'icom', name: 'I.Com (Commerce)', iconName: 'trending-up', color: '#6A1B9A',
    description: 'For students interested in business, finance, and commerce',
    compulsory: ['Principles of Accounting', 'Principles of Commerce', 'Economics', 'English', 'Urdu/Islamiat/Pak Studies'],
    electives: ['Business Mathematics', 'Computer Science', 'Statistics'],
    careers: ['Chartered Accountant (CA)', 'Banker', 'Financial Analyst', 'Tax Consultant', 'Business Manager', 'Auditor'],
    universities: ['LUMS', 'IBA Karachi', 'SZABIST', 'LSE', 'ICMAP', 'ICAP'],
    boardExams: 'I.Com', entryTests: ['LUMS SAT', 'IBA Test', 'NTS NAT-IE'],
  },
  {
    id: 'fa-arts', name: 'F.A (Arts/Humanities)', iconName: 'book', color: '#FF5722',
    description: 'For students interested in humanities, social sciences, and creative fields',
    compulsory: ['History', 'Pakistan Studies', 'English', 'Urdu', 'Islamiat'],
    electives: ['Civics', 'Economics', 'Psychology', 'Sociology', 'Fine Arts', 'Education'],
    careers: ['Lawyer', 'Journalist', 'Teacher', 'Psychologist', 'Civil Servant (CSS)', 'Diplomat', 'Social Worker'],
    universities: ['Punjab University', 'Karachi University', 'QAU', 'GCU', 'FC College'],
    boardExams: 'F.A', entryTests: ['LAT', 'NTS NAT-IE', 'CSS'],
  },
  {
    id: 'fa-general-science', name: 'F.A General Science', iconName: 'flask', color: '#FB8C00',
    description: 'Combination of science and arts for diverse career options',
    compulsory: ['Mathematics or Statistics', 'Economics', 'English', 'Urdu/Islamiat/Pak Studies'],
    electives: ['Geography', 'Computer Science', 'Psychology'],
    careers: ['Economist', 'Statistician', 'Teacher', 'Researcher', 'Data Analyst'],
    universities: ['Punjab University', 'QAU', 'PIDE', 'IBA'],
    boardExams: 'F.A General Science', entryTests: ['NTS NAT-IE', 'University Tests'],
  },
];

// ============================================================================
// INDIVIDUAL SUBJECTS
// ============================================================================

export const SUBJECTS: Subject[] = [
  {
    id: 'biology', name: 'Biology', iconName: 'leaf',
    description: 'Study of living organisms, their structure, function, and evolution',
    category: 'science', careers: ['Doctor', 'Dentist', 'Pharmacist', 'Biotechnologist', 'Microbiologist'],
    universities: ['Medical Colleges', 'Pharmacy Schools', 'Biology Departments'],
    entryTests: ['MDCAT', 'HAT'], difficulty: 'hard',
    tips: ['Focus on understanding concepts, not just memorizing', 'Use diagrams to remember complex processes', 'Practice MDCAT past papers regularly', 'Create mnemonics for long scientific names'],
  },
  {
    id: 'physics', name: 'Physics', iconName: 'planet',
    description: 'Study of matter, energy, and the fundamental forces of nature',
    category: 'science', careers: ['Engineer', 'Physicist', 'Astronomer', 'Medical Physicist'],
    universities: ['Engineering Universities', 'Physics Departments'],
    entryTests: ['ECAT', 'NET', 'MDCAT'], difficulty: 'hard',
    tips: ['Master the formulas and when to use them', 'Practice numerical problems daily', 'Understand derivations, not just memorize', 'Visualize concepts with real-world examples'],
  },
  {
    id: 'chemistry', name: 'Chemistry', iconName: 'flask',
    description: 'Study of substances, their properties, and chemical reactions',
    category: 'science', careers: ['Chemist', 'Pharmacist', 'Chemical Engineer', 'Research Scientist'],
    universities: ['All Science Universities'], entryTests: ['MDCAT', 'ECAT', 'HAT'], difficulty: 'medium',
    tips: ['Learn organic reactions step by step', 'Create reaction charts for revision', 'Practice balancing equations', 'Understand the periodic table trends'],
  },
  {
    id: 'mathematics', name: 'Mathematics', iconName: 'calculator',
    description: 'Study of numbers, quantities, shapes, and patterns',
    category: 'science', careers: ['Engineer', 'Data Scientist', 'Actuary', 'Mathematician', 'Economist'],
    universities: ['All Engineering & IT Universities'], entryTests: ['ECAT', 'NET', 'GIKI Test', 'SAT'], difficulty: 'hard',
    tips: ['Practice problems daily - consistency is key', 'Understand concepts before memorizing formulas', 'Solve previous years entry test papers', 'Focus on weak areas with extra practice'],
  },
  {
    id: 'computer-science', name: 'Computer Science', iconName: 'code-slash',
    description: 'Study of computers, programming, and computational systems',
    category: 'technical', careers: ['Software Developer', 'Data Scientist', 'Cybersecurity Expert', 'AI Engineer'],
    universities: ['FAST-NU', 'NUST', 'ITU', 'LUMS', 'COMSATS'], entryTests: ['FAST Test', 'NET', 'NAT-CS'], difficulty: 'medium',
    tips: ['Practice coding problems on online platforms', 'Build small projects to apply knowledge', 'Learn flowcharts and algorithms well', 'Understand both theory and practical applications'],
  },
  {
    id: 'economics', name: 'Economics', iconName: 'trending-up',
    description: 'Study of production, distribution, and consumption of goods and services',
    category: 'commerce', careers: ['Economist', 'Banker', 'Policy Analyst', 'Business Consultant'],
    universities: ['LUMS', 'IBA', 'PIDE', 'QAU'], entryTests: ['NAT-IE', 'LUMS SAT', 'IBA Test'], difficulty: 'medium',
    tips: ['Relate concepts to real-world Pakistani economy', 'Read business news regularly', 'Practice graphs and calculations', 'Understand micro and macro economics differences'],
  },
  {
    id: 'accounting', name: 'Accounting', iconName: 'receipt',
    description: 'Recording, classifying, and summarizing financial transactions',
    category: 'commerce', careers: ['Chartered Accountant', 'Auditor', 'Financial Analyst', 'Tax Consultant'],
    universities: ['ICAP', 'ICMAP', 'Business Schools'], entryTests: ['ICAP CAF', 'NAT-IE'], difficulty: 'medium',
    tips: ['Practice journal entries daily', 'Understand the accounting equation', 'Learn to read financial statements', 'Practice with real company examples'],
  },
  {
    id: 'english', name: 'English', iconName: 'language',
    description: 'Study of English language, literature, and communication skills',
    category: 'arts', careers: ['Content Writer', 'Teacher', 'Journalist', 'Translator', 'Diplomat'],
    universities: ['All Universities'], entryTests: ['All Entry Tests', 'IELTS', 'SAT'], difficulty: 'easy',
    tips: ['Read English newspapers and novels', 'Practice writing essays and summaries', 'Learn grammar rules thoroughly', 'Expand vocabulary through reading'],
  },
  {
    id: 'psychology', name: 'Psychology', iconName: 'body',
    description: 'Study of mind, behavior, and mental processes',
    category: 'arts', careers: ['Psychologist', 'Counselor', 'HR Manager', 'Marketing Researcher'],
    universities: ['Punjab University', 'GCU', 'Bahria University'], entryTests: ['NAT-IA', 'University Tests'], difficulty: 'medium',
    tips: ['Relate concepts to everyday observations', 'Learn key psychologists and their theories', 'Understand research methods', 'Practice case study analysis'],
  },
];

// ============================================================================
// CAREER PATH SHORTCUTS
// ============================================================================

export const CAREER_PATHS = [
  {groupId: 'pre-medical', icon: 'medkit-outline', color: '#E53935', title: 'Want to be a Doctor?', steps: ['Pre-Medical', 'MDCAT', 'Medical']},
  {groupId: 'ics', icon: 'laptop-outline', color: '#4573DF', title: 'Want to be a Software Engineer?', steps: ['ICS/Pre-Eng', 'FAST/NET', 'CS Degree']},
  {groupId: 'icom', icon: 'bar-chart-outline', color: '#6A1B9A', title: 'Want to be a CA?', steps: ['I.Com', 'CAF', 'ICAP']},
  {groupId: 'fa-arts', icon: 'briefcase-outline', color: '#FF5722', title: 'Want to be a Lawyer?', steps: ['F.A', 'LAT', 'LLB']},
];
