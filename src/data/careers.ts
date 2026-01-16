// Comprehensive Career Guidance Data for Pakistani Students
// Real information about career paths, salaries, and industry demand in Pakistan

export interface CareerField {
  id: string;
  name: string;
  iconName: string;
  iconColor: string;
  description: string;
  scope_pakistan: 'excellent' | 'good' | 'moderate' | 'limited';
  demand_trend: 'rising' | 'stable' | 'declining';
  average_starting_salary: number; // PKR per month
  average_mid_career_salary: number;
  average_senior_salary: number;
  required_education: string[];
  key_skills: string[];
  top_employers: string[];
  job_titles: string[];
  pros: string[];
  cons: string[];
  future_outlook: string;
  related_entry_tests: string[];
  suitable_for: string[]; // personality types
}

export interface CareerPath {
  id: string;
  title: string;
  field_id: string;
  steps: {
    stage: string;
    duration: string;
    description: string;
    requirements: string[];
  }[];
  typical_timeline: string;
  estimated_cost: string;
}

export const CAREER_FIELDS: CareerField[] = [
  // ========== MEDICAL & HEALTH SCIENCES ==========
  {
    id: 'medicine',
    name: 'Medicine (MBBS Doctor)',
    iconName: 'medkit',
    iconColor: '#E53935',
    description: 'Become a licensed physician to diagnose and treat illnesses. Most respected profession in Pakistan with excellent job security.',
    scope_pakistan: 'excellent',
    demand_trend: 'rising',
    average_starting_salary: 100000,
    average_mid_career_salary: 300000,
    average_senior_salary: 800000,
    required_education: [
      'FSc Pre-Medical (minimum 65%)',
      'MBBS (5 years + 1 year house job)',
      'Specialization (FCPS/MCPS) - 4-5 years',
    ],
    key_skills: [
      'Analytical thinking',
      'Empathy',
      'Communication',
      'Decision making under pressure',
      'Continuous learning',
    ],
    top_employers: [
      'Government Hospitals (BPS-17)',
      'Private Hospitals (Shaukat Khanum, Aga Khan, Shifa)',
      'Armed Forces Hospitals (CMH, MH)',
      'Own Practice/Clinic',
    ],
    job_titles: [
      'House Officer',
      'Medical Officer',
      'Registrar',
      'Consultant',
      'Professor',
    ],
    pros: [
      'High social respect',
      'Job security',
      'Ability to save lives',
      'Good income potential',
      'International opportunities',
    ],
    cons: [
      'Very long education (10+ years)',
      'High stress and responsibility',
      'Long working hours',
      'Expensive education',
      'Emotional toll',
    ],
    future_outlook: 'Pakistan has a doctor-to-patient ratio of 1:1000, far below WHO recommendations. Demand will remain high for decades.',
    related_entry_tests: ['MDCAT'],
    suitable_for: ['Analytical', 'Caring', 'Patient', 'Hardworking'],
  },
  {
    id: 'dentistry',
    name: 'Dentistry (BDS Doctor)',
    iconName: 'happy',
    iconColor: '#EC407A',
    description: 'Specialize in oral health, from routine cleanings to complex surgeries. Growing field with excellent private practice potential.',
    scope_pakistan: 'good',
    demand_trend: 'rising',
    average_starting_salary: 80000,
    average_mid_career_salary: 200000,
    average_senior_salary: 500000,
    required_education: [
      'FSc Pre-Medical (minimum 65%)',
      'BDS (4 years + 1 year house job)',
      'Specialization optional (FCPS Orthodontics, etc.)',
    ],
    key_skills: [
      'Fine motor skills',
      'Attention to detail',
      'Patient communication',
      'Artistic sense',
      'Business acumen',
    ],
    top_employers: [
      'Government Dental Hospitals',
      'Private Dental Clinics',
      'Corporate Dental Chains',
      'Own Practice',
    ],
    job_titles: [
      'House Officer',
      'General Dentist',
      'Orthodontist',
      'Oral Surgeon',
      'Endodontist',
    ],
    pros: [
      'Better work-life balance than MBBS',
      'High private practice potential',
      'Growing cosmetic dentistry demand',
      'Less stressful than general medicine',
    ],
    cons: [
      'Fewer government jobs',
      'Requires investment for own clinic',
      'Limited hospital roles',
    ],
    future_outlook: 'Growing awareness of dental health and cosmetic procedures is driving demand. Private practice is most lucrative.',
    related_entry_tests: ['MDCAT'],
    suitable_for: ['Detail-oriented', 'Artistic', 'Entrepreneurial'],
  },

  // ========== ENGINEERING ==========
  {
    id: 'software-engineering',
    name: 'Software Engineering',
    iconName: 'code-slash',
    iconColor: '#1E88E5',
    description: 'Design and develop software applications. Highest paying field in Pakistan with excellent international remote work opportunities.',
    scope_pakistan: 'excellent',
    demand_trend: 'rising',
    average_starting_salary: 80000,
    average_mid_career_salary: 300000,
    average_senior_salary: 1000000,
    required_education: [
      'FSc Pre-Engineering or ICS (minimum 60%)',
      'BS Software Engineering/Computer Science (4 years)',
      'Optional: MS/PhD for research roles',
    ],
    key_skills: [
      'Programming (Python, JavaScript, Java)',
      'Problem solving',
      'Logical thinking',
      'Teamwork',
      'Continuous learning',
    ],
    top_employers: [
      'Tech Giants (Google, Microsoft, Meta - remote)',
      'Pakistani Unicorns (Careem, Bykea, Daraz)',
      'Software Houses (Systems Limited, Folio3, NetSol)',
      'Freelancing Platforms',
      'Own Startup',
    ],
    job_titles: [
      'Junior Developer',
      'Software Engineer',
      'Senior Engineer',
      'Tech Lead',
      'CTO/Principal Engineer',
    ],
    pros: [
      'Highest salary growth',
      'Remote work opportunities',
      'International careers',
      'Freelancing income',
      'Creative problem solving',
    ],
    cons: [
      'Fast-changing technologies',
      'Sedentary lifestyle',
      'Tight deadlines',
      'Ageism concerns after 40',
    ],
    future_outlook: 'Pakistan\'s IT exports growing 30%+ annually. AI, Cloud, and Mobile are hot areas. Best career for $ income.',
    related_entry_tests: ['ECAT', 'FAST-NU', 'NUST NET', 'GIKI'],
    suitable_for: ['Logical', 'Creative', 'Self-learner', 'Tech enthusiast'],
  },
  {
    id: 'electrical-engineering',
    name: 'Electrical Engineering',
    iconName: 'flash',
    iconColor: '#FFA000',
    description: 'Design electrical systems, power generation, and electronics. Strong demand in power sector and manufacturing.',
    scope_pakistan: 'good',
    demand_trend: 'stable',
    average_starting_salary: 60000,
    average_mid_career_salary: 150000,
    average_senior_salary: 400000,
    required_education: [
      'FSc Pre-Engineering (minimum 60%)',
      'BSc Electrical Engineering (4 years)',
      'PEC Registration mandatory',
    ],
    key_skills: [
      'Circuit design',
      'Mathematics',
      'Problem solving',
      'CAD software',
      'Project management',
    ],
    top_employers: [
      'WAPDA/NEPRA',
      'K-Electric',
      'NTDC',
      'Private Power Plants',
      'Manufacturing Industries',
      'Telecommunications',
    ],
    job_titles: [
      'Junior Engineer',
      'Design Engineer',
      'Project Engineer',
      'Manager Engineering',
      'Chief Engineer',
    ],
    pros: [
      'Government jobs available',
      'Stable career',
      'Power sector always needs engineers',
      'Can work abroad (Gulf)',
    ],
    cons: [
      'Lower salaries than IT',
      'May require field work',
      'Government jobs have slow promotion',
    ],
    future_outlook: 'Renewable energy (solar, wind) is creating new opportunities. Power sector reforms will increase private sector jobs.',
    related_entry_tests: ['ECAT', 'NUST NET', 'GIKI'],
    suitable_for: ['Analytical', 'Practical', 'Math-oriented'],
  },
  {
    id: 'civil-engineering',
    name: 'Civil Engineering',
    iconName: 'construct',
    iconColor: '#FB8C00',
    description: 'Design and oversee construction of infrastructure like roads, bridges, and buildings.',
    scope_pakistan: 'good',
    demand_trend: 'stable',
    average_starting_salary: 55000,
    average_mid_career_salary: 120000,
    average_senior_salary: 350000,
    required_education: [
      'FSc Pre-Engineering (minimum 60%)',
      'BSc Civil Engineering (4 years)',
      'PEC Registration mandatory',
    ],
    key_skills: [
      'AutoCAD/Civil 3D',
      'Structural analysis',
      'Project management',
      'Site supervision',
      'Cost estimation',
    ],
    top_employers: [
      'NHA (National Highway Authority)',
      'FWO (Frontier Works Organization)',
      'NLC (National Logistics Cell)',
      'Construction Companies (Habib, Descon)',
      'Real Estate Developers',
    ],
    job_titles: [
      'Site Engineer',
      'Design Engineer',
      'Project Manager',
      'Construction Manager',
      'Director Projects',
    ],
    pros: [
      'CPEC projects creating jobs',
      'Government positions available',
      'Own construction business possible',
      'Gulf opportunities',
    ],
    cons: [
      'Field work in harsh conditions',
      'Project-based employment',
      'Lower salaries in early career',
    ],
    future_outlook: 'Infrastructure development under CPEC and housing schemes will sustain demand. Smart city projects are emerging.',
    related_entry_tests: ['ECAT', 'NUST NET'],
    suitable_for: ['Practical', 'Leadership-oriented', 'Outdoor enthusiast'],
  },

  // ========== BUSINESS & COMMERCE ==========
  {
    id: 'business-finance',
    name: 'Business & Finance',
    iconName: 'trending-up',
    iconColor: '#43A047',
    description: 'Manage business operations, investments, and financial planning. Essential for corporate and banking sectors.',
    scope_pakistan: 'excellent',
    demand_trend: 'rising',
    average_starting_salary: 50000,
    average_mid_career_salary: 150000,
    average_senior_salary: 500000,
    required_education: [
      'I.Com/A-Levels Commerce',
      'BBA/BS Accounting & Finance (4 years)',
      'MBA for senior roles',
      'Professional certifications (CA, ACCA, CFA)',
    ],
    key_skills: [
      'Financial analysis',
      'Excel & financial modeling',
      'Communication',
      'Strategic thinking',
      'Leadership',
    ],
    top_employers: [
      'Banks (HBL, UBL, MCB, NBP)',
      'Investment Firms',
      'Multinational Corporations',
      'Big 4 Auditing Firms',
      'Startups',
    ],
    job_titles: [
      'Management Trainee',
      'Financial Analyst',
      'Manager',
      'CFO',
      'CEO',
    ],
    pros: [
      'Many job opportunities',
      'Can work in any industry',
      'Leadership roles',
      'Own business potential',
    ],
    cons: [
      'Competitive field',
      'Requires certifications for top roles',
      'Long hours in banking',
    ],
    future_outlook: 'Fintech is revolutionizing finance. Digital banking and investment apps are creating new roles.',
    related_entry_tests: ['NAT-IE', 'LUMS', 'IBA'],
    suitable_for: ['Analytical', 'Communicative', 'Ambitious'],
  },
  {
    id: 'chartered-accountant',
    name: 'Chartered Accountant (CA)',
    iconName: 'calculator',
    iconColor: '#2E7D32',
    description: 'Most prestigious commerce qualification. Become an expert in auditing, taxation, and financial management.',
    scope_pakistan: 'excellent',
    demand_trend: 'stable',
    average_starting_salary: 40000,
    average_mid_career_salary: 200000,
    average_senior_salary: 800000,
    required_education: [
      'I.Com/A-Levels Commerce',
      'CA Foundation',
      'CA Intermediate (3 years articleship)',
      'CA Final',
    ],
    key_skills: [
      'Accounting standards (IFRS)',
      'Taxation laws',
      'Auditing',
      'Analytical thinking',
      'Integrity',
    ],
    top_employers: [
      'Big 4 (KPMG, EY, Deloitte, PwC)',
      'Mid-tier Audit Firms',
      'Corporate Finance Departments',
      'Own Practice',
    ],
    job_titles: [
      'Audit Trainee',
      'Senior Auditor',
      'Audit Manager',
      'Partner',
      'CFO',
    ],
    pros: [
      'Highly respected qualification',
      'International recognition',
      'High earning potential',
      'Own firm possible',
    ],
    cons: [
      'Very difficult exams',
      'Low pay during articleship',
      'Long working hours',
      '5+ years to qualify',
    ],
    future_outlook: 'Always in demand. Digital auditing and ESG reporting are new growth areas.',
    related_entry_tests: ['ICAP Foundation'],
    suitable_for: ['Detail-oriented', 'Ethical', 'Persistent'],
  },

  // ========== LAW ==========
  {
    id: 'law',
    name: 'Law & Legal Practice',
    iconName: 'shield-checkmark',
    iconColor: '#5D4037',
    description: 'Advocate for justice in courts, provide legal counsel, or work in corporate law. Respected profession with diverse specializations.',
    scope_pakistan: 'good',
    demand_trend: 'stable',
    average_starting_salary: 40000,
    average_mid_career_salary: 150000,
    average_senior_salary: 600000,
    required_education: [
      'FA/FSc/A-Levels (any stream)',
      'LLB (5 years) or BA-LLB',
      'Bar Council License',
    ],
    key_skills: [
      'Legal research',
      'Public speaking',
      'Analytical writing',
      'Negotiation',
      'Critical thinking',
    ],
    top_employers: [
      'Law Chambers (Senior Advocates)',
      'Corporate Law Firms (Haidermota, RIAA)',
      'Banks Legal Departments',
      'Corporate Legal Teams',
      'Judiciary (CSS)',
    ],
    job_titles: [
      'Associate',
      'Senior Associate',
      'Partner',
      'Judge (via CSS)',
      'Legal Advisor',
    ],
    pros: [
      'Respected profession',
      'Independence in private practice',
      'Can specialize (corporate, criminal, IP)',
      'Judiciary path via CSS',
    ],
    cons: [
      'Takes years to build reputation',
      'Irregular income initially',
      'Stressful court environment',
    ],
    future_outlook: 'Corporate law and IP law are growing. Cyber law is emerging field. Judiciary reforms may improve prospects.',
    related_entry_tests: ['LAT', 'LUMS', 'University Entry Tests'],
    suitable_for: ['Articulate', 'Logical', 'Public speaker'],
  },

  // ========== CREATIVE ARTS ==========
  {
    id: 'graphic-design',
    name: 'Graphic Design & UI/UX',
    iconName: 'brush',
    iconColor: '#7B1FA2',
    description: 'Create visual content for brands, apps, and websites. Growing field with freelancing opportunities.',
    scope_pakistan: 'good',
    demand_trend: 'rising',
    average_starting_salary: 50000,
    average_mid_career_salary: 150000,
    average_senior_salary: 400000,
    required_education: [
      'FA/FSc/A-Levels',
      'BS Design/Fine Arts (4 years)',
      'Or self-taught with strong portfolio',
    ],
    key_skills: [
      'Adobe Creative Suite',
      'Figma/Sketch',
      'Typography',
      'Color theory',
      'UX principles',
    ],
    top_employers: [
      'Advertising Agencies',
      'Tech Companies',
      'Design Studios',
      'Freelancing',
    ],
    job_titles: [
      'Junior Designer',
      'UI/UX Designer',
      'Senior Designer',
      'Art Director',
      'Creative Director',
    ],
    pros: [
      'Creative expression',
      'Freelancing income in $',
      'Remote work possible',
      'Growing demand',
    ],
    cons: [
      'Subjective criticism',
      'Tight deadlines',
      'Need to keep updating skills',
    ],
    future_outlook: 'UI/UX is highest paying design field. Motion graphics and 3D design are emerging trends.',
    related_entry_tests: ['NCA Entry Test', 'BNU'],
    suitable_for: ['Creative', 'Visual thinker', 'Tech-savvy'],
  },

  // ========== TEACHING ==========
  {
    id: 'teaching',
    name: 'Teaching & Education',
    iconName: 'school',
    iconColor: '#1976D2',
    description: 'Shape future generations as a teacher. From school teaching to university professor.',
    scope_pakistan: 'good',
    demand_trend: 'stable',
    average_starting_salary: 35000,
    average_mid_career_salary: 80000,
    average_senior_salary: 200000,
    required_education: [
      'Any intermediate',
      'BS Education/Subject Major',
      'B.Ed/M.Ed for schools',
      'PhD for university',
    ],
    key_skills: [
      'Communication',
      'Patience',
      'Subject expertise',
      'Classroom management',
      'Adaptability',
    ],
    top_employers: [
      'Government Schools (BPS)',
      'Private Schools (Beaconhouse, City, LGS)',
      'O/A Level Schools',
      'Universities',
      'Online Teaching',
    ],
    job_titles: [
      'Teacher',
      'Senior Teacher',
      'Coordinator',
      'Principal',
      'Professor',
    ],
    pros: [
      'Noble profession',
      'Job security',
      'Vacations',
      'Can do tuition/online teaching',
    ],
    cons: [
      'Lower salaries',
      'Limited growth',
      'Stressful classroom management',
    ],
    future_outlook: 'EdTech is creating new opportunities. Online teaching platforms allow $ income.',
    related_entry_tests: ['NTS Educators', 'University Entry'],
    suitable_for: ['Patient', 'Communicative', 'Caring'],
  },

  // ========== MEDIA ==========
  {
    id: 'journalism',
    name: 'Journalism & Media',
    iconName: 'videocam',
    iconColor: '#D32F2F',
    description: 'Report news, create content, and work in broadcasting or digital media.',
    scope_pakistan: 'moderate',
    demand_trend: 'declining',
    average_starting_salary: 40000,
    average_mid_career_salary: 100000,
    average_senior_salary: 300000,
    required_education: [
      'FA/FSc',
      'BS Mass Communication',
      'Journalism diploma',
    ],
    key_skills: [
      'Writing',
      'Research',
      'Video editing',
      'Social media',
      'Public speaking',
    ],
    top_employers: [
      'TV Channels (ARY, Geo, Dawn)',
      'Newspapers (Dawn, Express)',
      'Digital Media',
      'Freelancing',
    ],
    job_titles: [
      'Reporter',
      'Producer',
      'Anchor',
      'Editor',
      'Director',
    ],
    pros: [
      'Exciting field',
      'Influence public opinion',
      'Meet important people',
    ],
    cons: [
      'Job insecurity',
      'Political pressures',
      'Declining traditional media',
    ],
    future_outlook: 'Traditional media declining. Digital content creation and social media influencing are growing alternatives.',
    related_entry_tests: ['University Entry Tests'],
    suitable_for: ['Curious', 'Writer', 'Extrovert'],
  },
  
  // ========== GOV & PUBLIC SERVICE ==========
  {
    id: 'civil-services',
    name: 'Civil Services (CSS/PMS)',
    iconName: 'flag',
    iconColor: '#2E7D32',
    description: 'Premier administrative service of Pakistan. Bureaucracy roles in administration, police, foreign service, etc.',
    scope_pakistan: 'excellent',
    demand_trend: 'stable',
    average_starting_salary: 60000,
    average_mid_career_salary: 150000,
    average_senior_salary: 400000,
    required_education: [
      'Bachelor\'s Degree (14 years education minimum)',
      'Pass CSS or PMS Competitive Exam',
      'Age limit: 21-30 years',
    ],
    key_skills: [
      'General Knowledge',
      'English Essay Writing',
      'Current Affairs',
      'Leadership',
      'Decision Making',
    ],
    top_employers: [
      'Government of Pakistan',
      'Provincial Governments',
      'Police Service of Pakistan',
      'Foreign Office',
      'FBR (Customs/IRS)',
    ],
    job_titles: [
      'Assistant Commissioner',
      'ASP (Assistant Superintendent Police)',
      'Section Officer',
      'Secretary',
      ' Ambassador',
    ],
    pros: [
      'Immense power and authority',
      'Job security (Government)',
      'Social prestige',
      'Perks (House, Car, Protocol)',
    ],
    cons: [
      'Extremely competitive (2% pass rate)',
      'Political interference',
      'Rigid hierarchy',
      'Frequent transfers',
    ],
    future_outlook: 'Remains the most sought-after career for power and prestige in Pakistan. Reforms may change structure but not appeal.',
    related_entry_tests: ['CSS Exam', 'PMS Exam'],
    suitable_for: ['Leader', 'Patriotic', 'Analytic', 'Resilient'],
  },

  // ========== AVIATION ==========
  {
    id: 'aviation-pilot',
    name: 'Commercial Pilot',
    iconName: 'airplane',
    iconColor: '#0288D1',
    description: 'Fly commercial aircraft for airlines. High-status, high-responsibility job with travel benefits.',
    scope_pakistan: 'moderate',
    demand_trend: 'rising',
    average_starting_salary: 300000,
    average_mid_career_salary: 800000,
    average_senior_salary: 1500000,
    required_education: [
      'FSc/A-Levels (Physics & Math preferred)',
      'Student Pilot License (SPL)',
      'Private Pilot License (PPL)',
      'Commercial Pilot License (CPL)',
    ],
    key_skills: [
      'Situational Awareness',
      'Technical Aptitude',
      'Quick Decision Making',
      'English Proficiency',
      'Physical Fitness',
    ],
    top_employers: [
      'PIA',
      'Airblue',
      'Serene Air',
      'Fly Jinnah',
      'International Airlines (Emirates, Qatar, etc.)',
    ],
    job_titles: [
      'Cadet Pilot',
      'First Officer (Co-Pilot)',
      'Senior First Officer',
      'Captain',
      'Instructor',
    ],
    pros: [
      'Very high salary',
      'Travel the world',
      'Non-routine work',
      'Discounted travel for family',
    ],
    cons: [
      'Extremely expensive training (50-80 Lakhs)',
      'Irregular schedule/Jet lag',
      'Health risks (Radiation, Sitting)',
      'High responsibility',
    ],
    future_outlook: 'Global pilot shortage predicted. Pakistani airlines expanding fleets. Gulf carriers often hire Pakistani pilots.',
    related_entry_tests: ['Flying School Entrance', 'CAA Exams'],
    suitable_for: ['Focused', 'Calm', 'Adventurous', 'Disciplined'],
  },

  // ========== EMERGING TECH ==========
  {
    id: 'data-science-ai',
    name: 'Data Science & AI',
    iconName: 'hardware-chip',
    iconColor: '#7C4DFF',
    description: 'Analyze complex data and build AI models. The future of tech industry with massive global demand.',
    scope_pakistan: 'excellent',
    demand_trend: 'rising',
    average_starting_salary: 100000,
    average_mid_career_salary: 350000,
    average_senior_salary: 1200000,
    required_education: [
      'BS CS / Data Science / AI',
      'Strong Math/Statistics background',
      'Python/R programming',
    ],
    key_skills: [
      'Machine Learning',
      'Statistics',
      'Python/Pandas/Scikit-learn',
      'Data Visualization',
      'Big Data Tools',
    ],
    top_employers: [
      'Afiniti',
      'Educative',
      'Careem',
      'Systems Ltd',
      'Remote US/EU Companies',
    ],
    job_titles: [
      'Data Analyst',
      'Data Scientist',
      'Machine Learning Engineer',
      'AI Researcher',
      'Business Intelligence Lead',
    ],
    pros: [
      'Cutting-edge technology',
      'Very high salaries',
      'Intellectually challenging',
      'Remote work friendly',
    ],
    cons: [
      'Requires constant studying',
      'High barrier to entry',
      'Complex problem solving',
    ],
    future_outlook: 'AI is taking over every industry. Data scientists are the new "rockstars" of tech.',
    related_entry_tests: ['University Entry Tests'],
    suitable_for: ['Math-lover', 'Curious', 'Problem-solver'],
  },

  // ========== SOCIAL SCIENCES ==========
  {
    id: 'psychology',
    name: 'Psychology & Therapy',
    iconName: 'people',
    iconColor: '#00897B',
    description: 'Study human behavior and mental processes. Help people overcome mental health challenges.',
    scope_pakistan: 'good',
    demand_trend: 'rising',
    average_starting_salary: 40000,
    average_mid_career_salary: 120000,
    average_senior_salary: 300000,
    required_education: [
      'BS Psychology (4 years)',
      'MS Clinical Psychology (for clinical practice)',
      'PhD (for research/academic)',
    ],
    key_skills: [
      'Empathy',
      'Active Listening',
      'Critical Thinking',
      'Ethics',
      'Research Methods',
    ],
    top_employers: [
      'Hospitals (Psychiatry Dept)',
      'Rehabilitation Centers',
      'Schools/Universities',
      'Private Clinics',
      'NGOs',
    ],
    job_titles: [
      'Clinical Psychologist',
      'Counselor',
      'School Psychologist',
      'HR Specialist',
      'Organizational Psychologist',
    ],
    pros: [
      'Growing awareness of mental health',
      'Helping profession',
      'Private practice potential',
      'Flexible work hours',
    ],
    cons: [
      'Stigma still exists',
      'Emotional burnout risk',
      'Master\'s degree needed for good jobs',
    ],
    future_outlook: 'Mental health awareness is exploding in Pakistan. Corporate wellness and school counseling are growing fields.',
    related_entry_tests: ['University Entry Tests'],
    suitable_for: ['Empathetic', 'Listener', 'Patient'],
  },
];

export const CAREER_PATHS: CareerPath[] = [
  {
    id: 'path-doctor',
    title: 'Becoming a Doctor in Pakistan',
    field_id: 'medicine',
    steps: [
      {
        stage: 'FSc Pre-Medical',
        duration: '2 years',
        description: 'Complete FSc with Biology, Chemistry, Physics',
        requirements: ['Minimum 65% marks for MDCAT', 'Choose good college'],
      },
      {
        stage: 'MDCAT Preparation',
        duration: '3-6 months',
        description: 'Prepare for the national medical entrance exam',
        requirements: ['Register with PMC', 'Use official syllabus', 'Join academy or self-study'],
      },
      {
        stage: 'MBBS Admission',
        duration: '1-2 months',
        description: 'Apply to medical colleges based on MDCAT score',
        requirements: ['Merit position', 'Document verification', 'Fee payment'],
      },
      {
        stage: 'MBBS Studies',
        duration: '5 years',
        description: 'Complete medical education with clinical rotations',
        requirements: ['Pass professional exams', 'Clinical skills', 'Research optional'],
      },
      {
        stage: 'House Job',
        duration: '1 year',
        description: 'Mandatory internship in teaching hospital',
        requirements: ['Rotate through departments', 'Complete logbook'],
      },
      {
        stage: 'Specialization (FCPS)',
        duration: '4-5 years',
        description: 'Become a specialist in chosen field',
        requirements: ['Pass FCPS Part 1', 'Residency training', 'Pass FCPS Part 2'],
      },
    ],
    typical_timeline: '11-13 years after FSc',
    estimated_cost: 'PKR 20-50 Lakh (Government) to 1-2 Crore (Private)',
  },
  {
    id: 'path-software-engineer',
    title: 'Becoming a Software Engineer',
    field_id: 'software-engineering',
    steps: [
      {
        stage: 'FSc Pre-Engineering / ICS',
        duration: '2 years',
        description: 'Complete intermediate with Math and Physics (or Computer)',
        requirements: ['Minimum 60% marks', 'Strong math foundation'],
      },
      {
        stage: 'Entry Test Preparation',
        duration: '2-4 months',
        description: 'Prepare for university entrance exams',
        requirements: ['ECAT for UET', 'NET for NUST', 'FAST/GIKI tests'],
      },
      {
        stage: 'BS Degree',
        duration: '4 years',
        description: 'Complete Software Engineering or CS degree',
        requirements: ['Programming courses', 'Projects', 'Internships'],
      },
      {
        stage: 'Internship',
        duration: '3-6 months',
        description: 'Gain real-world experience',
        requirements: ['Apply to companies', 'Build portfolio', 'Networking'],
      },
      {
        stage: 'Junior Developer',
        duration: '1-2 years',
        description: 'First full-time job',
        requirements: ['DSA knowledge', 'System design basics', 'Team collaboration'],
      },
      {
        stage: 'Career Growth',
        duration: 'Ongoing',
        description: 'Advance to senior roles or freelancing',
        requirements: ['Continuous learning', 'Specialization', 'Leadership skills'],
      },
    ],
    typical_timeline: '4-5 years after FSc for first job',
    estimated_cost: 'PKR 5-15 Lakh (Government) to 30-50 Lakh (Private/Abroad)',
  },
  {
    id: 'path-ca',
    title: 'Becoming a Chartered Accountant',
    field_id: 'chartered-accountant',
    steps: [
      {
        stage: 'I.Com / A-Levels',
        duration: '2 years',
        description: 'Complete commerce intermediate',
        requirements: ['Strong accounting basics', '50%+ marks'],
      },
      {
        stage: 'CA Foundation',
        duration: '3-6 months',
        description: 'Entry level ICAP exams',
        requirements: ['4 papers', 'Accounting, Law, Business, Quantitative'],
      },
      {
        stage: 'Articleship + CAF',
        duration: '3 years',
        description: 'Work at audit firm while studying CAF papers',
        requirements: ['Register with audit firm', 'Pass 6 CAF papers', 'Low stipend'],
      },
      {
        stage: 'CFAP Module',
        duration: '1 year',
        description: 'Advanced papers while completing articleship',
        requirements: ['4 advanced papers', 'Complete articleship hours'],
      },
      {
        stage: 'MSA Module',
        duration: '6 months',
        description: 'Final module with multi-subject assessment',
        requirements: ['Case study based exam', 'Final interviews'],
      },
      {
        stage: 'Qualification',
        duration: 'After passing',
        description: 'Become a qualified Chartered Accountant',
        requirements: ['Register with ICAP', 'Practice license', 'CPD hours'],
      },
    ],
    typical_timeline: '5-7 years after I.Com',
    estimated_cost: 'PKR 3-5 Lakh (exam fees + registration)',
  },
  {
    id: 'path-css',
    title: 'Becoming a CSP Officer (CSS)',
    field_id: 'civil-services',
    steps: [
      {
        stage: 'Bachelor\'s Degree',
        duration: '4 years',
        description: 'Complete 14 years of education (min. 2nd division)',
        requirements: ['Any degree allowed', 'Develop reading habit', 'Age 21+'],
      },
      {
        stage: 'CSS Preparation',
        duration: '6-12 months',
        description: 'Intensive study of 12 subjects (6 compulsory, 6 optional)',
        requirements: ['English Essay mastery', 'Current Affairs', 'Join academy/self-study'],
      },
      {
        stage: 'Written Exam',
        duration: '1 week',
        description: 'FPSC conducted exam in February each year',
        requirements: ['Pass all compulsory', 'Aggregate 50%', 'Pass options'],
      },
      {
        stage: 'Medical & Psychological',
        duration: '2-3 days',
        description: 'Physical and mental fitness assessment',
        requirements: ['Detailed medical checkup', 'Group discussions', 'Psych analysis'],
      },
      {
        stage: 'Final Interview',
        duration: '30 mins',
        description: 'Panel interview with FPSC members',
        requirements: ['Confidence', 'Knowledge depth', 'Communication skills'],
      },
      {
        stage: 'Training (CSA)',
        duration: '6 months',
        description: 'Common Training Program (CTP) at Civil Services Academy',
        requirements: ['Residential training', 'Networking', 'Skill building'],
      },
    ],
    typical_timeline: '1-2 years after Graduation',
    estimated_cost: 'PKR 50k-1 Lakh (Books/Academy fees)',
  },
  {
    id: 'path-pilot',
    title: 'Becoming a Commercial Pilot',
    field_id: 'aviation-pilot',
    steps: [
      {
        stage: 'Medical & Ground School',
        duration: '3-4 months',
        description: 'Class 2 Medical and Ground subjects for SPL',
        requirements: ['Pass Medical', 'Pass CAA exams', 'English check'],
      },
      {
        stage: 'Student Pilot License (SPL)',
        duration: '1 month',
        description: 'First license to start flying training',
        requirements: ['Issue by CAA', 'Join Flying Club'],
      },
      {
        stage: 'Private Pilot License (PPL)',
        duration: '4-6 months',
        description: 'First major milestone. 40-50 hours flying.',
        requirements: ['Solo flight', 'Cross-country flying', 'CAA PPL Exams'],
      },
      {
        stage: 'Commercial Pilot License (CPL)',
        duration: '12-18 months',
        description: 'Professional license. 150+ hours flying.',
        requirements: ['Instrument Rating (IR)', 'Complex aircraft', 'CPL Exams'],
      },
      {
        stage: 'Frozen ATPL',
        duration: 'Optional',
        description: 'Airline Transport Pilot License theory',
        requirements: ['14 CAA exams', 'Needed for major airlines'],
      },
      {
        stage: 'Airline Induction',
        duration: '3-6 months',
        description: 'Selection process for airlines',
        requirements: ['Simulator check', 'Interview', 'Type Rating (Boeing/Airbus)'],
      },
    ],
    typical_timeline: '18-24 months for CPL',
    estimated_cost: 'PKR 60-90 Lakhs (Training + Exams)',
  },
];


// Helper functions
export const getCareersByDemand = (demand: 'rising' | 'stable' | 'declining') => {
  return CAREER_FIELDS.filter(c => c.demand_trend === demand);
};

export const getCareersByScope = (scope: 'excellent' | 'good' | 'moderate' | 'limited') => {
  return CAREER_FIELDS.filter(c => c.scope_pakistan === scope);
};

export const getHighPayingCareers = () => {
  return [...CAREER_FIELDS].sort((a, b) => b.average_mid_career_salary - a.average_mid_career_salary);
};

export const getCareerPath = (fieldId: string) => {
  return CAREER_PATHS.find(p => p.field_id === fieldId);
};
