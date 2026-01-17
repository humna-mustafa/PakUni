// Comprehensive Scholarships Data for Pakistani Students
// Real and verified scholarship information with university availability

export type ScholarshipType = 'need_based' | 'merit_based' | 'hafiz_e_quran' | 'sports' | 'disabled' | 'government' | 'private';

export type ApplicationMethod = 
  | 'online_portal'           // Apply through scholarship provider's portal
  | 'university_office'       // Apply through university financial aid office
  | 'both_portal_university'  // Apply through both portal and university
  | 'direct_admission'        // Applied automatically during admission
  | 'government_portal'       // Apply through government portal (NADRA, etc.)
  | 'embassy'                 // Apply through embassy (for foreign scholarships)
  | 'mail_application';       // Physical mail application

export interface ScholarshipData {
  id: string;
  name: string;
  provider: string;
  type: ScholarshipType;
  description: string;
  eligibility: string[];
  coverage_percentage: number;
  covers_tuition: boolean;
  covers_hostel: boolean;
  covers_books: boolean;
  monthly_stipend: number | null;
  required_documents: string[];
  application_deadline: string;
  website: string;
  min_percentage: number | null;
  max_family_income: number | null;
  is_active: boolean;
  // Universities where this scholarship is available
  // Use 'ALL_PUBLIC', 'ALL_PRIVATE', 'ALL_HEC' for broad availability
  // Use specific university short_names like 'NUST', 'LUMS', 'UET' for specific universities
  available_at: string[];
  // NEW FIELDS for enhanced UX (optional for backward compatibility)
  application_method?: ApplicationMethod;
  application_steps?: string[];
  renewal_required?: boolean;
  renewal_criteria?: string;
  status_notes?: string; // Any current status notes (e.g., "Applications open for Fall 2024")
}

// Brand colors for scholarship providers
export const SCHOLARSHIP_BRAND_COLORS: Record<string, { primary: string; secondary: string; gradient: string[] }> = {
  // Government Programs
  'ehsaas': { primary: '#1A5F2A', secondary: '#2E8B3D', gradient: ['#1A5F2A', '#2E8B3D', '#3CB371'] },
  'hec': { primary: '#1B5E20', secondary: '#4CAF50', gradient: ['#0d3311', '#1B5E20', '#388E3C'] },
  'peef': { primary: '#11783B', secondary: '#FFD700', gradient: ['#0a4a24', '#11783B', '#FFD700'] },
  'bef': { primary: '#006633', secondary: '#228B22', gradient: ['#004D26', '#006633', '#228B22'] },
  'sef': { primary: '#003366', secondary: '#0055A5', gradient: ['#002244', '#003366', '#0055A5'] },
  
  // University Programs
  'nust': { primary: '#003366', secondary: '#0055A5', gradient: ['#002244', '#003366', '#0055A5'] },
  'lums': { primary: '#8B0000', secondary: '#B22222', gradient: ['#660000', '#8B0000', '#B22222'] },
  'iba': { primary: '#00274C', secondary: '#003366', gradient: ['#001A33', '#00274C', '#003366'] },
  'giki': { primary: '#006633', secondary: '#228B22', gradient: ['#004D26', '#006633', '#228B22'] },
  'fast': { primary: '#0066CC', secondary: '#0099FF', gradient: ['#004499', '#0066CC', '#0099FF'] },
  'cui': { primary: '#004B87', secondary: '#0066B3', gradient: ['#003366', '#004B87', '#0066B3'] },
  'uet': { primary: '#8B4513', secondary: '#A0522D', gradient: ['#663311', '#8B4513', '#A0522D'] },
  
  // Private/NGO Programs
  'ihsan': { primary: '#006633', secondary: '#228B22', gradient: ['#004D26', '#006633', '#228B22'] },
  'dawood': { primary: '#003366', secondary: '#0055A5', gradient: ['#002244', '#003366', '#0055A5'] },
  'usaid': { primary: '#B22234', secondary: '#3C3B6E', gradient: ['#8B0000', '#B22234', '#3C3B6E'] },
  'csc': { primary: '#DE2910', secondary: '#FFDE00', gradient: ['#B01E0E', '#DE2910', '#FF4433'] },
  
  // Default
  'default': { primary: '#4573DF', secondary: '#4573DF', gradient: ['#3660C9', '#4573DF', '#4573DF'] },
};

// Get brand colors for a scholarship
export const getScholarshipBrandColors = (scholarshipNameOrId: string, provider?: string): { primary: string; secondary: string; accent?: string; gradient: string[] } | null => {
  const searchTerm = scholarshipNameOrId.toLowerCase();
  
  // Check by scholarship ID/name patterns
  if (searchTerm.includes('ehsaas') || searchTerm.includes('ehsas')) return SCHOLARSHIP_BRAND_COLORS.ehsaas;
  if (searchTerm.includes('hec') || searchTerm.includes('pm-fee') || searchTerm.includes('prime minister')) return SCHOLARSHIP_BRAND_COLORS.hec;
  if (searchTerm.includes('peef')) return SCHOLARSHIP_BRAND_COLORS.peef;
  if (searchTerm.includes('bef') || searchTerm.includes('balochistan education')) return SCHOLARSHIP_BRAND_COLORS.bef;
  if (searchTerm.includes('sef') || searchTerm.includes('sindh education')) return SCHOLARSHIP_BRAND_COLORS.sef;
  if (searchTerm.includes('nust')) return SCHOLARSHIP_BRAND_COLORS.nust;
  if (searchTerm.includes('lums')) return SCHOLARSHIP_BRAND_COLORS.lums;
  if (searchTerm.includes('iba')) return SCHOLARSHIP_BRAND_COLORS.iba;
  if (searchTerm.includes('giki')) return SCHOLARSHIP_BRAND_COLORS.giki;
  if (searchTerm.includes('fast')) return SCHOLARSHIP_BRAND_COLORS.fast;
  if (searchTerm.includes('cui') || searchTerm.includes('comsats')) return SCHOLARSHIP_BRAND_COLORS.cui;
  if (searchTerm.includes('uet')) return SCHOLARSHIP_BRAND_COLORS.uet;
  if (searchTerm.includes('ihsan')) return SCHOLARSHIP_BRAND_COLORS.ihsan;
  if (searchTerm.includes('dawood')) return SCHOLARSHIP_BRAND_COLORS.dawood;
  if (searchTerm.includes('usaid')) return SCHOLARSHIP_BRAND_COLORS.usaid;
  if (searchTerm.includes('csc') || searchTerm.includes('chinese')) return SCHOLARSHIP_BRAND_COLORS.csc;
  
  // Check by provider name if provided
  if (provider) {
    const providerLower = provider.toLowerCase();
    if (providerLower.includes('ehsaas')) return SCHOLARSHIP_BRAND_COLORS.ehsaas;
    if (providerLower.includes('hec') || providerLower.includes('higher education')) return SCHOLARSHIP_BRAND_COLORS.hec;
    if (providerLower.includes('peef') || providerLower.includes('punjab education')) return SCHOLARSHIP_BRAND_COLORS.peef;
    if (providerLower.includes('lums')) return SCHOLARSHIP_BRAND_COLORS.lums;
    if (providerLower.includes('nust')) return SCHOLARSHIP_BRAND_COLORS.nust;
  }
  
  return null;
};

// Application method labels for display
export const APPLICATION_METHOD_LABELS: Record<ApplicationMethod, { label: string; icon: string; description: string }> = {
  'online_portal': { 
    label: 'Online Portal', 
    icon: 'globe-outline', 
    description: 'Apply through the scholarship provider\'s official website' 
  },
  'university_office': { 
    label: 'University Office', 
    icon: 'business-outline', 
    description: 'Submit application through your university\'s financial aid office' 
  },
  'both_portal_university': { 
    label: 'Portal + University', 
    icon: 'layers-outline', 
    description: 'Apply online and submit documents to university' 
  },
  'direct_admission': { 
    label: 'During Admission', 
    icon: 'checkmark-circle-outline', 
    description: 'Automatically considered during admission process' 
  },
  'government_portal': { 
    label: 'Government Portal', 
    icon: 'shield-checkmark-outline', 
    description: 'Apply through official government website (NADRA, etc.)' 
  },
  'embassy': { 
    label: 'Embassy Application', 
    icon: 'flag-outline', 
    description: 'Apply through the relevant country\'s embassy' 
  },
  'mail_application': { 
    label: 'Mail Application', 
    icon: 'mail-outline', 
    description: 'Send physical application by mail' 
  },
};

export const SCHOLARSHIPS: ScholarshipData[] = [
  // ========== GOVERNMENT SCHOLARSHIPS ==========
  {
    id: 'ehsaas-undergraduate',
    name: 'Ehsaas Undergraduate Scholarship',
    provider: 'Government of Pakistan (Ehsaas Program)',
    type: 'need_based',
    description: 'Fully funded scholarship for deserving students from low-income families studying in HEC recognized universities.',
    eligibility: [
      'Family income below PKR 45,000 per month',
      'Enrolled in 4-year undergraduate program at HEC recognized university',
      'Fresh admission or currently enrolled student',
      'Pakistani citizen with valid CNIC',
      'Age below 22 years at the time of application',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: true,
    covers_books: true,
    monthly_stipend: 4000,
    required_documents: [
      'CNIC copy (student and parents)',
      'Income certificate',
      'Domicile certificate',
      'Latest fee challan',
      'University enrollment letter',
      'SSC and HSSC marksheets',
    ],
    application_deadline: 'November-December yearly',
    website: 'https://ehsaas.nadra.gov.pk/ehsaasUnderGrad/',
    min_percentage: 60,
    max_family_income: 45000,
    is_active: true,
    available_at: ['ALL_PUBLIC', 'QAU', 'NUST', 'CUI', 'PIEAS', 'UET', 'PU', 'UoK', 'UoS', 'UoP', 'BZU', 'GCU', 'IIU', 'NED', 'MUET', 'UAF', 'UVAS', 'UoG', 'UoB', 'UoAJK', 'KUST', 'BUITEMS', 'UoBalochistan', 'IST', 'GCWU', 'KU', 'SZABIST', 'FCC', 'FAST', 'GIKI'],
    application_method: 'government_portal',
    application_steps: [
      'Visit ehsaas.nadra.gov.pk/ehsaasUnderGrad/',
      'Register with your CNIC and mobile number',
      'Complete the online application form',
      'Upload required documents (scanned copies)',
      'Submit application before deadline',
      'University will verify your enrollment',
      'Wait for merit list announcement',
    ],
    renewal_required: true,
    renewal_criteria: 'Maintain minimum 2.0 CGPA and submit renewal application each year',
    status_notes: 'Applications typically open in November-December for the academic year',
  },
  {
    id: 'hec-need-based',
    name: 'HEC Need Based Scholarship',
    provider: 'Higher Education Commission (HEC)',
    type: 'need_based',
    description: 'Financial support for talented students who lack resources for higher education. Available at all public sector universities.',
    eligibility: [
      'Admitted in HEC recognized public sector university',
      'Family income below PKR 50,000 per month',
      'No other scholarship recipient',
      'Minimum 60% marks in previous examination',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: 5000,
    required_documents: [
      'Need-based scholarship application form',
      'Income affidavit on stamp paper',
      'CNIC copies',
      'Utility bills',
      'Academic transcripts',
    ],
    application_deadline: 'Within 2 months of admission',
    website: 'https://www.hec.gov.pk/english/scholarshipsgrants/NBS/',
    min_percentage: 60,
    max_family_income: 50000,
    is_active: true,
    available_at: ['ALL_PUBLIC', 'QAU', 'NUST', 'CUI', 'PIEAS', 'UET', 'PU', 'UoK', 'UoS', 'UoP', 'BZU', 'GCU', 'IIU', 'NED', 'MUET', 'UAF', 'UVAS', 'UoG', 'UoB', 'UoAJK', 'KUST', 'BUITEMS', 'IST', 'KU', 'AIOU'],
    application_method: 'university_office',
    application_steps: [
      'Collect NBS application form from university financial aid office',
      'Get income affidavit on judicial stamp paper',
      'Gather all required documents',
      'Submit complete application to university office',
      'University forwards applications to HEC',
      'HEC reviews and approves scholarships',
    ],
    renewal_required: true,
    renewal_criteria: 'Maintain minimum CGPA 2.5 and clear all courses',
    status_notes: 'Apply within first 2 months of admission',
  },
  {
    id: 'peef-scholarship',
    name: 'PEEF (Punjab Educational Endowment Fund)',
    provider: 'Punjab Government',
    type: 'need_based',
    description: 'Scholarships for talented students from underprivileged backgrounds in Punjab.',
    eligibility: [
      'Punjab domicile holder',
      'Family income below PKR 30,000 per month',
      'Minimum 60% marks in matric and intermediate',
      'Enrolled in recognized educational institution',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: true,
    covers_books: false,
    monthly_stipend: 8000,
    required_documents: [
      'Punjab domicile certificate',
      'Income certificate from DC office',
      'Academic certificates',
      'Admission letter',
      'CNIC copies',
    ],
    application_deadline: 'August-September yearly',
    website: 'https://www.peef.org.pk/',
    min_percentage: 60,
    max_family_income: 30000,
    is_active: true,
    available_at: ['PU', 'UET', 'GCU', 'BZU', 'GCWU', 'KEMU', 'UAF', 'UVAS', 'UoG', 'UoS', 'LCWU', 'FCC', 'UoE', 'UMT', 'LUMS', 'FAST', 'ITU', 'UCP', 'UoL'],
    application_method: 'online_portal',
    application_steps: [
      'Visit www.peef.org.pk and create account',
      'Fill online application form completely',
      'Upload scanned documents',
      'Get income certificate from DC office beforehand',
      'Submit application before deadline',
      'Print application receipt',
      'Attend interview if shortlisted',
    ],
    renewal_required: true,
    renewal_criteria: 'Maintain 2.5 CGPA and submit renewal application',
    status_notes: 'Only for Punjab domicile holders',
  },
  {
    id: 'bef-scholarship',
    name: 'BEF (Balochistan Educational Endowment Fund)',
    provider: 'Balochistan Government',
    type: 'need_based',
    description: 'Scholarships for students from Balochistan to pursue higher education. Targets marginalized districts and students from low-income families.',
    eligibility: [
      'Balochistan domicile holder',
      'Minimum 60% marks in previous examination',
      'Family income below PKR 40,000 per month',
      'Regular student in a recognized institution',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: true,
    covers_books: true,
    monthly_stipend: 10000,
    required_documents: [
      'Balochistan domicile',
      'Income certificate (signed by Tehsildar)',
      'Academic certificates (attested)',
      'CNIC/B-Form copies',
      'Last paid fee challan',
    ],
    application_deadline: 'June-July yearly',
    website: 'https://www.bef.gob.pk/',
    min_percentage: 60,
    max_family_income: 40000,
    is_active: true,
    available_at: ['UoB', 'BUITEMS', 'BUHS', 'SBK', 'LUAWMS', 'UoBalochistan'],
    application_method: 'online_portal',
    application_steps: [
      'Visit BEF official website (www.bef.gob.pk)',
      'Create account using CNIC and active email',
      'Fill out the comprehensive scholarship application form',
      'Upload digital copies of all required documents',
      'Submit application and save the tracking ID',
      'Physical verification may be performed at your district office',
    ],
    renewal_required: true,
    renewal_criteria: 'Maintain passing grades and minimum 75% attendance',
    status_notes: 'Only for Balochistan domicile holders. Priority for outlying districts.',
  },
  {
    id: 'sef-scholarship',
    name: 'SEF (Sindh Education Foundation) Scholarship',
    provider: 'Sindh Government',
    type: 'need_based',
    description: 'Scholarship program for deserving students from Sindh province, focusing on talented students from rural and underprivileged areas.',
    eligibility: [
      'Sindh domicile holder',
      'Minimum 60% marks in previous examination',
      'Family income below PKR 35,000 per month',
      'Student of public or SEF-supported school/college',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: 6000,
    required_documents: [
      'Sindh domicile certificate',
      'Income proof (Official certificate)',
      'Academic transcripts and certificates',
      'CNIC/B-Form copies of student and guardian',
    ],
    application_deadline: 'August yearly',
    website: 'https://www.sef.org.pk/',
    min_percentage: 60,
    max_family_income: 35000,
    is_active: true,
    available_at: ['UoK', 'KU', 'NED', 'MUET', 'SALU', 'IBA', 'SZABIST', 'LUMHS', 'SMIU', 'DUHS', 'UoS'],
    application_method: 'online_portal',
    application_steps: [
      'Visit SEF website and navigate to Scholarship section',
      'Register on the Sindh Education Foundation portal',
      'Complete the multi-page online application',
      'Upload scanned documents as per instructions',
      'Submit before the deadline in August',
      'Wait for the merit list announcement on the website',
    ],
    renewal_required: true,
    renewal_criteria: 'Maintain satisfactory academic progress and disciplinary record',
    status_notes: 'Only for Sindh domicile holders. Focus on merit-cum-need.',
  },
  {
    id: 'pm-fee-reimbursement',
    name: 'PM Fee Reimbursement Scheme',
    provider: 'Higher Education Commission',
    type: 'government',
    description: 'Full fee reimbursement for students from less developed areas of Pakistan including Balochistan, FATA, GB, AJK, and Southern Punjab.',
    eligibility: [
      'Domicile from less developed areas',
      'Admitted in public sector HEC recognized university',
      'Minimum 60% marks in previous degree',
      'Maintaining required percentage in current semester',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'Domicile certificate from eligible area',
      'Academic certificates (SSC/HSSC)',
      'University admission letter',
      'Current semester fee challan',
    ],
    application_deadline: 'Within first semester of admission',
    website: 'https://www.hec.gov.pk/english/scholarshipsgrants/',
    min_percentage: 60,
    max_family_income: null,
    is_active: true,
    available_at: ['ALL_PUBLIC', 'QAU', 'NUST', 'CUI', 'UET', 'PU', 'UoK', 'BZU', 'GCU', 'IIU', 'NED', 'UoP', 'UoB', 'UoAJK', 'KUST', 'BUITEMS', 'KIU'],
    application_method: 'university_office',
    application_steps: [
      'Visit the university Financial Aid/Student Affairs office',
      'Obtain the Prime Minister Fee Reimbursement form',
      'Submit verified domicile from eligible district',
      'Provide current admission and fee paid records',
      'University verifies and uploads data to the HEC PMFR portal',
      'HEC releases funds directly to university to reimburse your fees',
    ],
    renewal_required: true,
    renewal_criteria: 'Maintain enrollment and clear all semester subjects',
    status_notes: 'Eligible areas include: Balochistan, FATA, GB, AJK, Southern Punjab (Multan, Bahawalpur, DG Khan divisions).',
  },
  // ========== MERIT-BASED SCHOLARSHIPS ==========
  {
    id: 'hec-indigenous-phd',
    name: 'HEC Indigenous PhD Fellowship',
    provider: 'Higher Education Commission',
    type: 'merit_based',
    description: 'Fully funded PhD scholarships for faculty members and fresh graduates wishing to pursue PhD in HEC recognized universities of Pakistan.',
    eligibility: [
      'Pakistani/AJK national',
      'MS/MPhil degree with CGPA 3.0/4.0 or 60% marks',
      "Master's degree in relevant field with no 3rd division",
      'GAT General (by NTS) or HAT (by ETC) with 50+ marks',
      'Age below 40 years for regular employees, 35 for others',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: true,
    monthly_stipend: 60000,
    required_documents: [
      'All academic degrees verified by HEC',
      'Valid GAT/HAT score card',
      'Research proposal (1000-1500 words)',
      'NOC from employer (for regular employees)',
      'Domicile and CNIC copies',
    ],
    application_deadline: 'Varies - check HEC website',
    website: 'https://www.hec.gov.pk/english/scholarshipsgrants/PhD/',
    min_percentage: 60,
    max_family_income: null,
    is_active: true,
    available_at: ['ALL_PUBLIC', 'QAU', 'NUST', 'CUI', 'PIEAS', 'UET', 'PU', 'UoK', 'GCU', 'IIU', 'NED', 'MUET'],
    application_method: 'online_portal',
    application_steps: [
      'Apply online via research.hec.gov.pk or official HEC portal',
      'Select Indigenous PhD Fellowship program',
      'Complete complete profile and upload attested degrees',
      'Enter HAT/GAT score details',
      'Submit application and pay processing fee at HBL',
      'Upload paid bank challan to the portal',
    ],
    status_notes: 'Highly competitive fellowship for PhD scholars. Check HEC for batch-wise openings.',
  },
  {
    id: 'nust-undergraduate-merit',
    name: 'NUST Merit Scholarship',
    provider: 'National University of Sciences & Technology',
    type: 'merit_based',
    description: 'Full and partial tuition waivers for high achievers in NUST Entry Test (NET).',
    eligibility: [
      'NET score in top 100 nationally for first year',
      'FSc/A-Level marks above 85% for admission',
      'Pakistani national admitted on Merit',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'NET score card',
      'HSSC or equivalent marksheet',
      'CNIC/B-Form copy',
    ],
    application_deadline: 'At time of admission',
    website: 'https://nust.edu.pk/admissions/',
    min_percentage: 85,
    max_family_income: null,
    is_active: true,
    available_at: ['NUST'],
    application_method: 'direct_admission',
    application_steps: [
      'Register for NUST Entry Test (NET)',
      'Secure top merit rank in the admission list',
      'The scholarship award is mentioned in the Admission Offer Letter',
      'Accept admission and fulfill renewal criteria to continue',
    ],
    renewal_required: true,
    renewal_criteria: 'Maintain a minimum CGPA of 3.50+ in each semester',
    status_notes: 'Based purely on NET aggregate performance.',
  },
  {
    id: 'lums-nos',
    name: 'LUMS National Outreach Programme (NOP)',
    provider: 'LUMS',
    type: 'need_based',
    description: 'Prestigious 100% scholarship for talented students from lower-income backgrounds across Pakistan. Covers all educational expenses.',
    eligibility: [
      'Family income below PKR 150,000 per month',
      'Minimum 80% marks in Matriculation',
      'Pakistani national',
      'Must clear LUMS admission criteria (SAT/Test and Interviews)',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: true,
    covers_books: true,
    monthly_stipend: 10000,
    required_documents: [
      'Financial aid application form',
      'Tax returns and bank statements (family)',
      'Utility bills of last 6 months',
      'Wealth statement and property documents',
      'Academic transcripts of all previous levels',
    ],
    application_deadline: 'With LUMS admission (January-February)',
    website: 'https://lums.edu.pk/financial-aid',
    min_percentage: 80,
    max_family_income: 150000,
    is_active: true,
    available_at: ['LUMS'],
    application_method: 'both_portal_university',
    application_steps: [
      'Apply online for LUMS admission via lums.edu.pk',
      'Mark your interest in the NOP program in the application',
      'Complete the detailed Financial Aid section in the portal',
      'Submit all supporting financial documents (scanned)',
      'Appear in SAT or LUMS Entrance Test',
      'Attend the NOP summer workshop if shortlisted initially',
    ],
    status_notes: 'The NOP is a life-changing scholarship for meritorious students from poor backgrounds.',
  },
  {
    id: 'iba-talent-hunt',
    name: 'IBA National Talent Hunt Program',
    provider: 'IBA Karachi',
    type: 'need_based',
    description: '100% scholarship for students from government schools/colleges from all provinces of Pakistan.',
    eligibility: [
      'Passed Matric/Intermediate from a government school',
      'Family income below PKR 50,000 per month',
      'Minimum 80% marks in matric/inter',
      'Must clear the IBA THP entry test',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: true,
    covers_books: true,
    monthly_stipend: 8000,
    required_documents: [
      'Government school/college certificate',
      'Family income certificate/Salary slip',
      'Academic transcripts (SSC/HSSC)',
      'CNIC/B-Form of applicant and parent',
    ],
    application_deadline: 'December-January yearly',
    website: 'https://iba.edu.pk/talent-hunt-program.php',
    min_percentage: 80,
    max_family_income: 50000,
    is_active: true,
    available_at: ['IBA'],
    application_method: 'online_portal',
    application_steps: [
      'Register on the IBA National Talent Hunt portal',
      'Submit proof of government schooling and income',
      'Appear in the initial THP assessment test',
      'Selected students get orientation and training for IBA admission',
      'Clear the standard IBA admission test and interview',
    ],
    status_notes: 'Open to students from all over Pakistan who studied in government institutions.',
  },
  {
    id: 'giki-scholarship',
    name: 'GIKI Financial Assistance',
    provider: 'GIK Institute',
    type: 'need_based',
    description: 'Need-based financial assistance for deserving students to cover tuition fees and other educational expenses at GIKI.',
    eligibility: [
      'Admitted to GIKI merit list',
      'Demonstrated genuine financial need',
      'Pakistani national',
      'Must maintain good academic standing for renewal',
    ],
    coverage_percentage: 50,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'GIKI financial aid application form',
      'Income proof (Salary slip/Pension book)',
      'Bank statements of parents',
      'Wealth statement and utility bills',
    ],
    application_deadline: 'At time of admission',
    website: 'https://giki.edu.pk/admissions/',
    min_percentage: 70,
    max_family_income: 100000,
    is_active: true,
    available_at: ['GIKI'],
    application_method: 'university_office',
    application_steps: [
      'Fill out the admission application on GIKI portal',
      'Download and complete the GIKI Financial Assistance Form',
      'Submit the form with all financial proofs at the admission desk during interview',
      'Initial grant is decided by the GIKI scholarship committee',
    ],
    status_notes: 'Financial aid is reviewed annually based on student performance.',
  },
  {
    id: 'fast-merit',
    name: 'FAST Merit Scholarship',
    provider: 'FAST-NUCES',
    type: 'merit_based',
    description: 'Merit-based partial scholarship for top performers in the NU Entry Test across all FAST campuses.',
    eligibility: [
      'Top 50 candidates in the NU Entry Test (National level)',
      'HSSC marks above 80%',
      'Pakistani national admitted on merit',
    ],
    coverage_percentage: 50,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'NU entry test result card',
      'HSSC or equivalent certificates',
    ],
    application_deadline: 'At time of admission',
    website: 'https://nu.edu.pk/Admissions',
    min_percentage: 80,
    max_family_income: null,
    is_active: true,
    available_at: ['FAST'],
    application_method: 'direct_admission',
    application_steps: [
      'Appear in the NU (FAST) Admission Test',
      'Scholarship is automatically offered to top merit position holders in the selection letter',
      'Fulfill the mandatory CGPA requirement (3.0+) to continue scholarship in next semesters',
    ],
    status_notes: 'Highly competitive, purely merit-based partial waiver.',
  },
  {
    id: 'cui-merit',
    name: 'COMSATS Merit Scholarship',
    provider: 'COMSATS University',
    type: 'merit_based',
    description: 'Generous merit scholarship for board position holders and high achievers in NTS/CUI test.',
    eligibility: [
      '85%+ marks in HSSC for partial waiver',
      'Board position holders (1st, 2nd, 3rd) get 100% waiver',
      'Maintain CGPA 3.5+ for continuity',
    ],
    coverage_percentage: 75,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'Academic certificates and marksheets',
      'Board position certificate (if applicable)',
      'Valid NTS/CUI test result',
    ],
    application_deadline: 'During admission cycle',
    website: 'https://www.comsats.edu.pk/Scholarships.aspx',
    min_percentage: 85,
    max_family_income: null,
    is_active: true,
    available_at: ['CUI'],
    application_method: 'direct_admission',
    application_steps: [
      'Apply to COMSATS Islamabad or any regional campus',
      'The admission system automatically calculates merit and applies scholarship weightage',
      'Waiver amount is included in the first semester fee challan',
    ],
    status_notes: 'Scholarship applies to tuition fees only.',
  },
  {
    id: 'uet-merit',
    name: 'UET Merit Scholarship',
    provider: 'UET Lahore',
    type: 'merit_based',
    description: 'Full tuition fee waiver for top-tier ECAT performers admitted to UET Lahore and its sub-campuses.',
    eligibility: [
      'Secure a position in the top 100 on the combined aggregate list',
      'HSSC marks above 85%',
      'Admitted on open merit seats',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'ECAT score card',
      'HSSC and SSC certificates',
      'CNIC/B-Form copy',
    ],
    application_deadline: 'During admission',
    website: 'https://uet.edu.pk/home/',
    min_percentage: 85,
    max_family_income: null,
    is_active: true,
    available_at: ['UET'],
    application_method: 'direct_admission',
    application_steps: [
      'Take the ECAT entry test',
      'Check position in the UET merit list',
      'Free-ship is automatically applied for top candidates during the document verification stage',
    ],
    status_notes: 'Available for the first 2 semesters, continuation based on GPA.',
  },
  // ========== HAFIZ-E-QURAN SCHOLARSHIPS ==========
  {
    id: 'hafiz-general',
    name: 'Hafiz-e-Quran Fee Concession',
    provider: 'Public & Private Universities',
    type: 'hafiz_e_quran',
    description: 'Fee concession/waiver for students who have memorized the Holy Quran. Provided by almost all public and many private universities.',
    eligibility: [
      'Valid Hafiz-e-Quran certificate from a recognized Wafaq',
      'Must pass an oral verification test by the university religious affairs committee',
      'Pakistani national',
    ],
    coverage_percentage: 25,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'Hafiz-e-Quran certificate (Wafaq-ul-Madaris/Tanzeem-ul-Madaris etc.)',
      'Verification form from university office',
    ],
    application_deadline: 'At time of admission',
    website: '',
    min_percentage: null,
    max_family_income: null,
    is_active: true,
    available_at: ['ALL_PUBLIC', 'ALL_PRIVATE', 'UET', 'PU', 'BZU', 'GCU', 'IIU', 'CUI', 'UoK', 'NED', 'UAF', 'UMT', 'LUMS', 'FAST', 'NUST'],
    application_method: 'university_office',
    application_steps: [
      'Tick the "Hafiz-e-Quran" box in the university admission form',
      'Submit the Hafiz certificate along with other documents',
      'Apper before the specialized committee for hifz verification test',
      'After approval, get the revised fee challan from accounts office',
    ],
    status_notes: 'Standard scholarship benefit for Huffaz in Pakistan.',
  },
  {
    id: 'merit-hafiz-bonus',
    name: 'Hifz-e-Quran Entry Test Bonus',
    provider: 'Provincial Admission Committees',
    type: 'hafiz_e_quran',
    description: 'Not a financial scholarship but a critical 20 marks merit bonus added to final aggregate for medical and engineering admissions (Punjab focus).',
    eligibility: [
      'Recognized Hifz certificate',
      'Must pass competitive oral test conducted by UHS/UET',
    ],
    coverage_percentage: 0,
    covers_tuition: false,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'Hafiz certificate (sanad)',
      'Hifz test roll number slip',
    ],
    application_deadline: 'During entry test registration',
    website: 'https://www.uhs.edu.pk/mdcat',
    min_percentage: null,
    max_family_income: null,
    is_active: true,
    available_at: ['UET', 'KEMU', 'UHS', 'PU', 'BZU', 'GCU', 'UAF', 'UVAS', 'UoG', 'AIMC', 'SMC', 'RMC', 'NMC', 'FMC'],
    application_method: 'university_office',
    application_steps: [
      'Select Hafiz-e-Quran status during MDCAT/ECAT online registration',
      'Print the separate Hafiz verification test slip',
      'Appear for the oral hifz test at the designated medical/engineering college',
      'Qualified candidates get +20 marks added to their total aggregate',
    ],
    status_notes: 'Extremely important for improving merit ranking.',
  },
  // ========== PRIVATE SECTOR SCHOLARSHIPS ==========
  {
    id: 'ihsan-trust',
    name: 'Ihsan Trust Interest-free Loan',
    provider: 'Ihsan Trust',
    type: 'private',
    description: 'Unique interest-free education loan (Qarz-e-Hasna) for students unable to pay fees. Loan is repaid in small installments after the student gets a job.',
    eligibility: [
      'Pakistani citizen admitted in a partner university',
      'Genuine financial inability to pay full semester fees',
      'Family income below PKR 100,000 per month',
      'Maintain minimum 2.50+ CGPA',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: true,
    covers_books: true,
    monthly_stipend: null,
    required_documents: [
      'Downloaded and filled Ihsan Trust form',
      'Income certificate/Salary slip',
      'Last 6 months utility bills',
      'Academic results and university fee schedule',
    ],
    application_deadline: 'Rolling basis (apply anytime)',
    website: 'https://www.ihsantrust.org.pk/',
    min_percentage: null,
    max_family_income: 100000,
    is_active: true,
    available_at: ['ALL_HEC', 'LUMS', 'IBA', 'NUST', 'GIKI', 'FAST', 'CUI', 'NED', 'UET', 'PU', 'UoK', 'QAU'],
    application_method: 'mail_application',
    application_steps: [
      'Download form from Ihsan Trust website',
      'Fill and attach all mandatory financial proofs',
      'Courier the application package to Ihsan Trust head office in Karachi',
      'Attend the interview in person or via video link if invited',
      'Disbursement is made directly to the university account',
    ],
    status_notes: 'One of the best private financial aid programs in Pakistan.',
  },
  {
    id: 'csc-scholarship',
    name: 'CSC (Chinese Government) Scholarship',
    provider: 'China Scholarship Council',
    type: 'government',
    description: 'Full scholarship covering tuition, accommodation, and generous monthly stipend for Bachelors, Masters, and PhD in China.',
    eligibility: [
      'Pakistani national (non-Chinese citizen)',
      'Under 25 for Bachelors, 35 for Masters, 40 for PhD',
      'Strong academic record (60% minimum)',
      'IELTS/TOEFL may be required by some universities',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: true,
    covers_books: true,
    monthly_stipend: 42000,
    required_documents: [
      'CSC Online form',
      'Two recommendation letters',
      'Detailed Study Plan or Research Proposal',
      'Physical Examination Form (Medical)',
      'Higher education degrees/notarized transcripts',
    ],
    application_deadline: 'December-February yearly',
    website: 'https://www.campuschina.org/',
    min_percentage: 60,
    max_family_income: null,
    is_active: true,
    available_at: ['FOREIGN'],
    application_method: 'both_portal_university',
    application_steps: [
      'Apply online on the CSC portal (campuschina.org)',
      'Identify and apply to a Chinese host university through their portal',
      'Obtain a Pre-admission letter if possible',
      'For Category A, apply through HEC Web portal when they announce the call',
      'Wait for the final selection lists usually in July/August',
    ],
    status_notes: 'Fully funded opportunity for international exposure.',
  },
  {
    id: 'usaid-merit-scholarship',
    name: 'USAID Merit & Needs Scholarship',
    provider: 'USAID (via HEC)',
    type: 'need_based',
    description: 'Fully funded scholarship specifically for students from rural and underprivileged areas focused on Agriculture, Health, and Social Sciences.',
    eligibility: [
      'Family income below PKR 45,000 per month',
      'Currently enrolled in a USAID partner public university',
      'Minimum 60% marks in previous degree',
      'Female and students from rural districts highly encouraged',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: true,
    monthly_stipend: 5000,
    required_documents: [
      'Detailed financial assessment form',
      'Income certificates/Salary slips',
      'Utility bills and domicile',
      'Academic results and admission letter',
    ],
    application_deadline: 'Check university scheduled dates',
    website: 'https://www.usaid.gov/pakistan/education',
    min_percentage: 60,
    max_family_income: 45000,
    is_active: true,
    available_at: ['UoP', 'UoK', 'UoB', 'KUST', 'BUITEMS', 'UoAJK', 'KIU'],
    application_method: 'university_office',
    application_steps: [
      'Grab the USAID Scholarship form from your university Financial Aid office',
      'Submit the form with complete family background details',
      'Institutional Scholarship Award Committee (ISAC) interviews candidates',
      'Final approval from HEC and USAID representatives',
    ],
    status_notes: 'Very helpful for students in Agriculture and Health sectors.',
  },
  {
    id: 'dawood-foundation',
    name: 'Dawood Foundation Scholarship',
    provider: 'Dawood Foundation',
    type: 'merit_based',
    description: 'Financial support for high-achieving students pursuing professional degrees in Engineering and Technology at top institutes.',
    eligibility: [
      'Minimum 80% marks in Inter/FSc',
      'Admitted in a top-rank engineering university (UET/NUST/GIKI)',
      'Pakistani national',
    ],
    coverage_percentage: 75,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'SSC/HSSC degree copies',
      'University admission offer letter',
      'Photographs and CNIC',
    ],
    application_deadline: 'August-September yearly',
    website: 'https://dawoodfoundation.org/',
    min_percentage: 80,
    max_family_income: null,
    is_active: true,
    available_at: ['NED', 'MUET', 'UET', 'GIKI', 'NUST', 'PIEAS'],
    application_method: 'online_portal',
    application_steps: [
      'Visit the Dawood Foundation official website',
      'Apply online when the scholarship portal opens for the year',
      'Upload academic transcripts',
      'Shortlisted students appear in a written proficiency test',
      'Final interview for selected candidates',
    ],
    status_notes: 'Empowering engineering excellence in Pakistan.',
  },
  // ========== SPECIAL CATEGORY SCHOLARSHIPS ==========
  {
    id: 'disabled-quota',
    name: 'Disabled Persons Fee Waiver',
    provider: 'HEC & Government',
    type: 'disabled',
    description: 'Full tuition fee waiver and reserved seats in all HEC recognized public universities for persons with disabilities.',
    eligibility: [
      'Genuine disability (Physically Challenged/Visually Impaired etc.)',
      'Disability certificate from Social Welfare Department/Govt Hospital',
      'Admission on Reserved Seat for Disabled',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: 3000,
    required_documents: [
      'Govt Disability Certificate',
      'Board medical report',
      'Admission details',
    ],
    application_deadline: 'During admission',
    website: 'https://www.hec.gov.pk/',
    min_percentage: null,
    max_family_income: null,
    is_active: true,
    available_at: ['ALL_PUBLIC', 'QAU', 'NUST', 'CUI', 'UET', 'PU', 'UoK', 'BZU', 'GCU', 'IIU', 'NED', 'MUET', 'UoP'],
    application_method: 'university_office',
    application_steps: [
      'Apply on the reserved seat for Disabled category',
      'Submit the Disability certificate along with the admission form',
      'Visit the university health board if requested for verification',
      'Fee waiver is applied to the first challan after hboard clearance',
    ],
    status_notes: 'Full support for inclusive education in Pakistan.',
  },
  {
    id: 'sports-quota',
    name: 'Sports Excellence Scholarship',
    provider: 'Various Universities',
    type: 'sports',
    description: 'Scholarships for students who excel in sports at National or Inter-Board level.',
    eligibility: [
      'National color or board-level representation in recognized sports',
      'Must pass university sports trials',
    ],
    coverage_percentage: 50,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'Sports board certificate',
      'Medals/Awards/Participation proof',
    ],
    application_deadline: 'During admission',
    website: '',
    min_percentage: null,
    max_family_income: null,
    is_active: true,
    available_at: ['ALL_PUBLIC', 'PU', 'UoK', 'UET', 'BZU', 'GCU', 'NED', 'MUET', 'UoP', 'LUMS', 'NUST'],
    application_method: 'university_office',
    application_steps: [
      'Apply on Sports Reserved seats in the university form',
      'Attach sports merit certificates',
      'Appear in trials at the university sports complex on scheduled date',
      'Selection list is announced based on trial points and academic weightage',
    ],
    status_notes: 'Waiver continues if the student represents the university in inter-varsity games.',
  },
  {
    id: 'fata-scholarship',
    name: 'HEC FATA/Merged Districts Scholarship',
    provider: 'Higher Education Commission',
    type: 'government',
    description: 'Special fully funded scholarship program for students from former FATA (now Merged Districts) and Balochistan.',
    eligibility: [
      'Domicile of Merged Districts (KPK) or Balochistan',
      'Admitted in HEC recognized universities of Pakistan',
      'Studied in local district school/college preferably',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: true,
    covers_books: true,
    monthly_stipend: 8000,
    required_documents: [
      'Domicile certificate (Merged Districts)',
      'Academic results',
      'Admission fee receipt',
    ],
    application_deadline: 'Check HEC portal announcements',
    website: 'https://www.hec.gov.pk/',
    min_percentage: null,
    max_family_income: null,
    is_active: true,
    available_at: ['ALL_PUBLIC', 'UoP', 'KUST', 'IMS', 'QAU', 'NUST', 'CUI', 'IIU', 'UET'],
    application_method: 'online_portal',
    application_steps: [
      'Wait for the official advertisement on HEC website/newspapers',
      'Apply via the HEC e-portal specifically for Merged Districts scholarship',
      'Generate and pay the application fee',
      'Appear in the aptitude test conducted by ETC (HEC)',
    ],
    status_notes: 'Major support for students from remote merged tribal districts.',
  },
  {
    id: 'kinship-orphan',
    name: 'Orphan/Kinship Fee Waiver',
    provider: 'Public Sector Universities',
    type: 'need_based',
    description: '100% tuition fee waiver for orphan students and partial waiver (kinship) for siblings studying in the same university.',
    eligibility: [
      'Death of father/guardian (for Orphan waiver)',
      'Real sibling already studying in university (for Kinship)',
      'Regular student maintaining passing grades',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: 3000,
    required_documents: [
      'Death Certificate (verified)',
      'Sibling admission record (for Kinship)',
      'Affidavit of dependency',
    ],
    application_deadline: 'Within first month of each semester',
    website: '',
    min_percentage: null,
    max_family_income: null,
    is_active: true,
    available_at: ['ALL_PUBLIC', 'PU', 'UoK', 'UET', 'BZU', 'GCU', 'IIU', 'NED', 'QAU', 'CUI', 'NUST'],
    application_method: 'university_office',
    application_steps: [
      'Visit your department chairman office or Financial Aid office',
      'Submit parent death certificate and affidavit',
      'For kinship, provide sibling ID card and fee receipt',
      'Submit the application to the Registrar office for approval',
    ],
    status_notes: 'Most public universities have a dedicated fund for orphan students.',
  },
  // ========== INTERNATIONAL SCHOLARSHIPS ==========
  {
    id: 'fulbright-pakistan',
    name: 'Fulbright Scholarship',
    provider: 'United States Educational Foundation in Pakistan (USEFP)',
    type: 'merit_based',
    description: 'Prestigious fully funded scholarship for Pakistani students to pursue Masters or PhD in the United States. Covers tuition, living, travel, and health insurance.',
    eligibility: [
      'Pakistani citizen residing in Pakistan',
      'Minimum 16 years of education for Masters',
      'Minimum 18 years for PhD',
      'At least 3 years work experience preferred',
      'CGPA 3.0/4.0 or 1st division',
      'Valid passport',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: true,
    covers_books: true,
    monthly_stipend: 175000,
    required_documents: [
      'Online application form',
      'Academic transcripts (attested)',
      'Three recommendation letters',
      'Statement of Purpose (SOP)',
      'Resume/CV',
      'Valid passport copy',
      'GRE scores (for some programs)',
    ],
    application_deadline: 'May yearly',
    website: 'https://www.usefp.org/',
    min_percentage: 60,
    max_family_income: null,
    is_active: true,
    available_at: ['FOREIGN'],
    application_method: 'online_portal',
    application_steps: [
      'Create account on USEFP portal (usefp.org)',
      'Complete the Fulbright Application Form online',
      'Upload all required documents',
      'Request recommendation letters from referees',
      'Submit by May deadline',
      'Shortlisted candidates are called for interviews',
      'Final selection announced by October',
    ],
    renewal_required: false,
    renewal_criteria: 'Maintain satisfactory academic progress',
    status_notes: 'Most prestigious US scholarship for Pakistanis. Highly competitive.',
  },
  {
    id: 'chevening-uk',
    name: 'Chevening Scholarship (UK)',
    provider: 'UK Foreign, Commonwealth & Development Office',
    type: 'merit_based',
    description: 'Fully funded one-year Masters degree in any UK university. Covers tuition, monthly stipend, travel costs, and arrival allowance.',
    eligibility: [
      'Pakistani citizen',
      'At least 2 years work experience',
      "Bachelor's degree (undergraduate)",
      'Return to Pakistan for minimum 2 years after completion',
      'Not previously received UK Government funded scholarship',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: true,
    covers_books: false,
    monthly_stipend: 160000,
    required_documents: [
      'Online application form',
      'Academic transcripts',
      'Two reference letters',
      'Personal statement',
      'Valid passport',
      'Proof of work experience',
    ],
    application_deadline: 'November yearly',
    website: 'https://www.chevening.org/scholarship/pakistan/',
    min_percentage: 60,
    max_family_income: null,
    is_active: true,
    available_at: ['FOREIGN'],
    application_method: 'online_portal',
    application_steps: [
      'Apply online at chevening.org',
      'Select up to 3 UK university courses',
      'Complete 4 essays (personal statement)',
      'Provide referee details for 2 references',
      'Shortlisted candidates attend interviews in Pakistan (Jan-Mar)',
      'Results announced in June',
    ],
    renewal_required: false,
    renewal_criteria: 'One-year program - no renewal needed',
    status_notes: 'UK government flagship scholarship. Strong leadership focus.',
  },
  {
    id: 'daad-germany',
    name: 'DAAD Scholarship (Germany)',
    provider: 'German Academic Exchange Service (DAAD)',
    type: 'merit_based',
    description: 'Scholarship for Masters and PhD studies in Germany. Covers tuition (free in most German universities), monthly stipend, health insurance, and travel.',
    eligibility: [
      'Pakistani citizen',
      "Bachelor's degree with good grades",
      'German or English proficiency (depending on program)',
      'Relevant work experience preferred',
      'Clear study plan and motivation',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: true,
    monthly_stipend: 140000,
    required_documents: [
      'DAAD portal application',
      'Academic transcripts',
      'Two academic recommendation letters',
      'Motivation letter',
      'CV in Europass format',
      'Language certificate (German/English)',
      'Research proposal (for PhD)',
    ],
    application_deadline: 'October-November yearly',
    website: 'https://www.daad.de/en/',
    min_percentage: 60,
    max_family_income: null,
    is_active: true,
    available_at: ['FOREIGN'],
    application_method: 'online_portal',
    application_steps: [
      'Create account on DAAD Portal',
      'Find suitable programs on daad.de',
      'Complete online application with all documents',
      'Submit before October deadline',
      'Interviews conducted in Islamabad/Karachi',
      'Results in March-April',
    ],
    renewal_required: true,
    renewal_criteria: 'Maintain good academic standing',
    status_notes: 'Germany has free tuition at public universities.',
  },
  {
    id: 'commonwealth-scholarship',
    name: 'Commonwealth Scholarship (UK)',
    provider: 'Commonwealth Scholarship Commission',
    type: 'merit_based',
    description: 'Fully funded scholarship for Masters and PhD in UK universities for Commonwealth country citizens including Pakistan.',
    eligibility: [
      'Pakistani citizen (Commonwealth member)',
      "Bachelor's degree with First Division",
      'Strong academic record',
      'Demonstrate potential for leadership',
      'Return to Pakistan after completion',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: true,
    covers_books: true,
    monthly_stipend: 155000,
    required_documents: [
      'Online application form',
      'Academic transcripts (verified)',
      'Two academic references',
      'Study plan/Research proposal',
      'Personal statement',
    ],
    application_deadline: 'October-December yearly',
    website: 'https://cscuk.fcdo.gov.uk/scholarships/',
    min_percentage: 70,
    max_family_income: null,
    is_active: true,
    available_at: ['FOREIGN'],
    application_method: 'both_portal_university',
    application_steps: [
      'Apply through HEC Pakistan portal',
      'HEC nominates candidates to CSC',
      'Complete CSC online application',
      'Submit study plan and references',
      'Attend interview if shortlisted',
    ],
    renewal_required: false,
    renewal_criteria: 'N/A',
    status_notes: 'Apply through HEC for Pakistan nominations.',
  },
  {
    id: 'australia-awards',
    name: 'Australia Awards Scholarship',
    provider: 'Australian Government (DFAT)',
    type: 'merit_based',
    description: 'Prestigious scholarship for Masters and PhD in Australian universities. Full funding including tuition, living allowance, travel, and health cover.',
    eligibility: [
      'Pakistani citizen',
      "Bachelor's degree with good grades",
      'At least 2 years work experience',
      'English proficiency (IELTS 6.5+)',
      'Return to Pakistan for 2 years after completion',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: true,
    covers_books: true,
    monthly_stipend: 170000,
    required_documents: [
      'Online application form',
      'Academic transcripts',
      'IELTS/TOEFL score',
      'Two professional references',
      'Statement of Purpose',
      'Work experience certificates',
    ],
    application_deadline: 'April-May yearly',
    website: 'https://www.dfat.gov.au/people-to-people/australia-awards',
    min_percentage: 60,
    max_family_income: null,
    is_active: true,
    available_at: ['FOREIGN'],
    application_method: 'online_portal',
    application_steps: [
      'Apply online at Australia Awards portal',
      'Submit academic and work documents',
      'Provide English proficiency score',
      'Shortlisted candidates interviewed',
      'Results announced by December',
    ],
    renewal_required: false,
    renewal_criteria: 'Maintain satisfactory progress',
    status_notes: 'Focus on development-related fields for Pakistan.',
  },
  {
    id: 'turkish-burslari',
    name: 'Türkiye Burslari (Turkish Government)',
    provider: 'Turkish Government',
    type: 'government',
    description: 'Full scholarship for undergraduate, Masters, and PhD in Turkish universities. Includes Turkish language course, tuition, accommodation, and monthly stipend.',
    eligibility: [
      'Non-Turkish citizen',
      'Under 21 for undergraduate, 30 for Masters, 35 for PhD',
      'Minimum 70% for undergraduate, 75% for Masters/PhD',
      'No previous degree from Turkey',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: true,
    covers_books: false,
    monthly_stipend: 35000,
    required_documents: [
      'Online application form',
      'Academic transcripts',
      'National ID/Passport copy',
      'Recommendation letter',
      'Personal statement',
      'Language certificate (if available)',
    ],
    application_deadline: 'January-February yearly',
    website: 'https://turkiyeburslari.gov.tr/',
    min_percentage: 70,
    max_family_income: null,
    is_active: true,
    available_at: ['FOREIGN'],
    application_method: 'online_portal',
    application_steps: [
      'Create account on turkiyeburslari.gov.tr',
      'Complete online application with all details',
      'Upload required documents',
      'Submit before February deadline',
      'Shortlisted candidates interviewed in Pakistan (May-June)',
      'Results announced in August',
      'Start with 1-year Turkish language course',
    ],
    renewal_required: false,
    renewal_criteria: 'Maintain academic standing',
    status_notes: 'Very popular scholarship - thousands apply from Pakistan.',
  },
  {
    id: 'korean-gks',
    name: 'Korean Government Scholarship (GKS)',
    provider: 'National Institute for International Education (NIIED)',
    type: 'government',
    description: 'Fully funded scholarship for undergraduate and graduate studies in South Korea. Includes Korean language training, tuition, living allowance, and medical insurance.',
    eligibility: [
      'Pakistani citizen',
      'Under 25 for undergraduate, 40 for graduate',
      'Minimum 80% marks in relevant degree',
      'Good health',
      'Not enrolled in Korean university before',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: true,
    covers_books: true,
    monthly_stipend: 50000,
    required_documents: [
      'Application form',
      'Personal statement',
      'Study plan',
      'Two recommendation letters',
      'Academic transcripts',
      'Language proficiency certificate',
      'Health certificate',
    ],
    application_deadline: 'February-March yearly',
    website: 'https://www.studyinkorea.go.kr/',
    min_percentage: 80,
    max_family_income: null,
    is_active: true,
    available_at: ['FOREIGN'],
    application_method: 'embassy',
    application_steps: [
      'Apply through Korean Embassy in Islamabad',
      'Or apply through Korean universities directly',
      'Submit complete application package',
      'Interview at embassy if shortlisted',
      'Final selection by NIIED Korea',
      '1-year Korean language training included',
    ],
    renewal_required: false,
    renewal_criteria: 'Maintain CGPA 3.0+',
    status_notes: 'Includes 1-year Korean language training before degree.',
  },
  {
    id: 'mext-japan',
    name: 'MEXT Scholarship (Japan)',
    provider: 'Japanese Ministry of Education (MEXT)',
    type: 'government',
    description: 'Japanese government scholarship for research students, undergraduate, and graduate studies. Fully funded with generous monthly stipend.',
    eligibility: [
      'Pakistani citizen',
      'Under 35 for research students',
      'Under 25 for undergraduate',
      'Strong academic record',
      'Willingness to learn Japanese',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: true,
    monthly_stipend: 65000,
    required_documents: [
      'Application form',
      'Academic transcripts',
      'Research plan (for research students)',
      'Recommendation from professor',
      'Medical certificate',
      'Language certificates (English/Japanese)',
    ],
    application_deadline: 'April yearly',
    website: 'https://www.pk.emb-japan.go.jp/',
    min_percentage: 75,
    max_family_income: null,
    is_active: true,
    available_at: ['FOREIGN'],
    application_method: 'embassy',
    application_steps: [
      'Check Japanese Embassy Pakistan website for announcements',
      'Download and complete application form',
      'Submit to Japanese Embassy Islamabad',
      'Pass document screening',
      'Appear for written exam and interview',
      'Final selection by MEXT in Japan',
    ],
    renewal_required: true,
    renewal_criteria: 'Annual review of academic progress',
    status_notes: 'Highly prestigious - includes Japanese language training.',
  },
  {
    id: 'erasmus-mundus',
    name: 'Erasmus Mundus Joint Masters',
    provider: 'European Union',
    type: 'merit_based',
    description: 'EU-funded scholarships for joint Masters programs across multiple European universities. Covers tuition, travel, installation, and monthly subsistence.',
    eligibility: [
      'Pakistani citizen (from partner country)',
      "Bachelor's degree in relevant field",
      'English proficiency (IELTS 6.5+)',
      'Strong academic record',
      'Motivation for international study',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: 120000,
    required_documents: [
      'Online application to specific EMJMD program',
      'Academic transcripts (attested)',
      'English proficiency certificate',
      'Two recommendation letters',
      'CV and motivation letter',
      'Valid passport',
    ],
    application_deadline: 'Program-specific (Jan-Feb mostly)',
    website: 'https://erasmus-plus.ec.europa.eu/',
    min_percentage: 65,
    max_family_income: null,
    is_active: true,
    available_at: ['FOREIGN'],
    application_method: 'online_portal',
    application_steps: [
      'Search EMJMD programs on ec.europa.eu/programmes/erasmus-plus',
      'Select programs matching your field',
      'Apply directly to consortium university',
      'Submit all required documents online',
      'Each program has its own deadline (mostly Jan-Feb)',
      'Results in April-May',
    ],
    renewal_required: false,
    renewal_criteria: 'N/A - covers full program duration',
    status_notes: 'Study at multiple European universities.',
  },
  {
    id: 'hec-overseas-phd',
    name: 'HEC Overseas PhD Scholarship',
    provider: 'Higher Education Commission Pakistan',
    type: 'merit_based',
    description: 'Fully funded PhD scholarship for Pakistani faculty and fresh graduates to study abroad at top-ranked universities worldwide.',
    eligibility: [
      'Pakistani/AJK national',
      'MS/MPhil with CGPA 3.0/4.0 or First Division',
      "Master's degree with no 3rd division in academic career",
      'Age below 40 for employees, 35 for others',
      'Valid HAT score (50+ marks)',
      'Admission in top 200 QS/THE ranked university',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: true,
    covers_books: true,
    monthly_stipend: 180000,
    required_documents: [
      'HEC verified degrees',
      'HAT score card',
      'Admission offer from foreign university',
      'NOC from employer (if employed)',
      'Research proposal',
      'IELTS/TOEFL score',
      'Passport copy',
    ],
    application_deadline: 'Varies by batch - check HEC portal',
    website: 'https://www.hec.gov.pk/english/scholarshipsgrants/',
    min_percentage: 60,
    max_family_income: null,
    is_active: true,
    available_at: ['FOREIGN'],
    application_method: 'online_portal',
    application_steps: [
      'Secure admission in top 200 QS/THE ranked university',
      'Clear HAT exam with 50+ marks',
      'Apply online via HEC e-portal when batch announced',
      'Upload all required documents including admission letter',
      'Selection based on admission, test score, and research plan',
    ],
    renewal_required: true,
    renewal_criteria: 'Annual progress reports and supervisor evaluation',
    status_notes: 'Major HEC program for international PhD studies.',
  },
  // ========== ADDITIONAL UNIVERSITY SCHOLARSHIPS ==========
  {
    id: 'aku-financial-aid',
    name: 'AKU Financial Assistance',
    provider: 'Aga Khan University',
    type: 'need_based',
    description: 'Comprehensive need-based financial aid for deserving students at AKU covering tuition and living expenses.',
    eligibility: [
      'Admitted to AKU program',
      'Demonstrated financial need',
      'Pakistani or international student',
      'Strong academic record',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: true,
    covers_books: true,
    monthly_stipend: 10000,
    required_documents: [
      'AKU Financial Aid Application Form',
      'Family income documents',
      'Bank statements',
      'Property and asset declarations',
      'Academic transcripts',
    ],
    application_deadline: 'With admission application',
    website: 'https://www.aku.edu/admissions/financialaid/',
    min_percentage: 70,
    max_family_income: 200000,
    is_active: true,
    available_at: ['AKU'],
    application_method: 'university_office',
    application_steps: [
      'Apply for AKU admission',
      'Mark interest in financial aid in application',
      'Submit detailed financial aid application',
      'Provide all supporting financial documents',
      'Attend financial aid interview if required',
    ],
    renewal_required: true,
    renewal_criteria: 'Maintain satisfactory academic progress',
    status_notes: 'AKU has substantial financial aid budget.',
  },
  {
    id: 'szabist-scholarship',
    name: 'SZABIST Merit Scholarship',
    provider: 'SZABIST',
    type: 'merit_based',
    description: 'Merit-based scholarships for high achievers in board exams and SZABIST admission test.',
    eligibility: [
      '90%+ marks in HSSC for 100% waiver',
      '85%+ marks for 50% waiver',
      'Maintain 3.5+ CGPA',
      'Admitted on merit',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'HSSC marksheet',
      'SZABIST admission result',
      'CNIC copy',
    ],
    application_deadline: 'During admission',
    website: 'https://szabist.edu.pk/',
    min_percentage: 85,
    max_family_income: null,
    is_active: true,
    available_at: ['SZABIST'],
    application_method: 'direct_admission',
    application_steps: [
      'Apply to SZABIST admission',
      'Scholarship automatically applied based on HSSC marks',
      'Maintain required CGPA for continuation',
    ],
    renewal_required: true,
    renewal_criteria: 'CGPA 3.5+ each semester',
    status_notes: 'Automatic for board toppers.',
  },
  {
    id: 'umt-scholarship',
    name: 'UMT Financial Aid Program',
    provider: 'University of Management and Technology',
    type: 'need_based',
    description: 'Comprehensive financial aid for deserving students at UMT Lahore including merit and need-based support.',
    eligibility: [
      'Admitted to UMT program',
      'Financial need demonstrated',
      'Good academic record',
      'Pakistani national',
    ],
    coverage_percentage: 50,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'UMT Financial Aid form',
      'Income certificate',
      'Academic transcripts',
      'CNIC copies',
    ],
    application_deadline: 'During admission',
    website: 'https://www.umt.edu.pk/',
    min_percentage: 60,
    max_family_income: 80000,
    is_active: true,
    available_at: ['UMT'],
    application_method: 'university_office',
    application_steps: [
      'Apply to UMT admission',
      'Submit financial aid application',
      'Provide income documentation',
      'Wait for financial aid committee decision',
    ],
    renewal_required: true,
    renewal_criteria: 'Maintain good standing',
    status_notes: 'Available at all UMT campuses.',
  },
  {
    id: 'riphah-scholarship',
    name: 'Riphah Foundation Scholarship',
    provider: 'Riphah International University',
    type: 'need_based',
    description: 'Need and merit-based scholarships for students at Riphah University campuses.',
    eligibility: [
      'Admitted to Riphah program',
      'Financial need OR high merit',
      'Pakistani national',
    ],
    coverage_percentage: 50,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'Scholarship application form',
      'Income proof',
      'Academic certificates',
    ],
    application_deadline: 'During admission',
    website: 'https://www.riphah.edu.pk/',
    min_percentage: 70,
    max_family_income: 60000,
    is_active: true,
    available_at: ['Riphah'],
    application_method: 'university_office',
    application_steps: [
      'Apply to Riphah admission',
      'Submit scholarship form with documents',
      'Interview if shortlisted',
    ],
    renewal_required: true,
    renewal_criteria: 'Maintain CGPA 2.5+',
    status_notes: 'Islamic values-based institution.',
  },
  {
    id: 'aiou-fee-waiver',
    name: 'AIOU Fee Concession',
    provider: 'Allama Iqbal Open University',
    type: 'need_based',
    description: 'Fee concession for deserving students at AIOU - Pakistan\'s largest open and distance learning university.',
    eligibility: [
      'Enrolled in AIOU program',
      'Low family income',
      'Pakistani national',
      'Disabled persons get priority',
    ],
    coverage_percentage: 50,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'Fee concession form',
      'Income certificate',
      'CNIC copy',
      'Disability certificate (if applicable)',
    ],
    application_deadline: 'During registration',
    website: 'https://aiou.edu.pk/',
    min_percentage: null,
    max_family_income: 30000,
    is_active: true,
    available_at: ['AIOU'],
    application_method: 'university_office',
    application_steps: [
      'Register for AIOU program',
      'Submit fee concession form to regional office',
      'Provide income proof',
      'Wait for approval',
    ],
    renewal_required: true,
    renewal_criteria: 'Apply each semester',
    status_notes: 'Open university - flexible learning.',
  },
  {
    id: 'bahria-scholarship',
    name: 'Bahria University Scholarship',
    provider: 'Bahria University',
    type: 'merit_based',
    description: 'Merit and need-based scholarships at Bahria University campuses. Special waivers for children of armed forces personnel.',
    eligibility: [
      'Admitted to Bahria program',
      'High HSSC marks for merit scholarship',
      'Children of armed forces personnel get special consideration',
    ],
    coverage_percentage: 50,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'HSSC marksheet',
      'Parent service certificate (if armed forces)',
      'Income documents (for need-based)',
    ],
    application_deadline: 'During admission',
    website: 'https://www.bahria.edu.pk/',
    min_percentage: 80,
    max_family_income: null,
    is_active: true,
    available_at: ['Bahria'],
    application_method: 'direct_admission',
    application_steps: [
      'Apply to Bahria University',
      'Scholarship considered during admission',
      'Provide armed forces relationship proof if applicable',
    ],
    renewal_required: true,
    renewal_criteria: 'Maintain required CGPA',
    status_notes: 'Special benefits for armed forces families.',
  },
  {
    id: 'air-university-scholarship',
    name: 'Air University Scholarship',
    provider: 'Air University',
    type: 'merit_based',
    description: 'Merit-based and PAF family scholarships at Air University campuses.',
    eligibility: [
      'Admitted to Air University',
      'High merit position',
      'Children of PAF personnel get preference',
    ],
    coverage_percentage: 50,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'Admission test result',
      'HSSC marksheet',
      'PAF service proof (if applicable)',
    ],
    application_deadline: 'During admission',
    website: 'https://au.edu.pk/',
    min_percentage: 80,
    max_family_income: null,
    is_active: true,
    available_at: ['AU'],
    application_method: 'direct_admission',
    application_steps: [
      'Apply to Air University',
      'Scholarship based on admission merit',
      'Submit PAF connection documents if applicable',
    ],
    renewal_required: true,
    renewal_criteria: 'Maintain good academic standing',
    status_notes: 'PAF-affiliated university.',
  },
];

// Helper function to check if a scholarship is available at a university
export const isScholarshipAvailableAt = (scholarship: ScholarshipData, universityShortName: string, universityType: string): boolean => {
  const availableAt = scholarship.available_at;
  
  // Check for specific university
  if (availableAt.includes(universityShortName)) {
    return true;
  }
  
  // Check for broad categories
  if (availableAt.includes('ALL_HEC')) {
    return true;
  }
  
  if (availableAt.includes('ALL_PUBLIC') && universityType === 'public') {
    return true;
  }
  
  if (availableAt.includes('ALL_PRIVATE') && universityType === 'private') {
    return true;
  }
  
  return false;
};

// Get scholarships available at a specific university
export const getScholarshipsForUniversity = (universityShortName: string, universityType: string): ScholarshipData[] => {
  return SCHOLARSHIPS.filter(scholarship => 
    isScholarshipAvailableAt(scholarship, universityShortName, universityType)
  );
};

// Get count of universities where scholarship is available
export const getScholarshipUniversityCount = (scholarship: ScholarshipData): { specific: number; categories: string[] } => {
  const specificUnis = scholarship.available_at.filter(
    uni => !['ALL_PUBLIC', 'ALL_PRIVATE', 'ALL_HEC', 'FOREIGN'].includes(uni)
  );
  
  const categories = scholarship.available_at.filter(
    uni => ['ALL_PUBLIC', 'ALL_PRIVATE', 'ALL_HEC'].includes(uni)
  );
  
  return {
    specific: specificUnis.length,
    categories,
  };
};

// Get human-readable availability text
export const getScholarshipAvailabilityText = (scholarship: ScholarshipData): string => {
  const { specific, categories } = getScholarshipUniversityCount(scholarship);
  
  if (scholarship.available_at.includes('FOREIGN')) {
    return 'Foreign universities';
  }
  
  const parts: string[] = [];
  
  if (categories.includes('ALL_PUBLIC')) {
    parts.push('All public universities');
  }
  if (categories.includes('ALL_PRIVATE')) {
    parts.push('All private universities');
  }
  if (categories.includes('ALL_HEC')) {
    parts.push('All HEC recognized universities');
  }
  
  if (specific > 0) {
    if (parts.length > 0) {
      parts.push(`+ ${specific} specific universities`);
    } else {
      parts.push(`${specific} universities`);
    }
  }
  
  return parts.join(', ') || 'Not specified';
};

// Get list of specific universities (short names) for a scholarship
export const getScholarshipSpecificUniversities = (scholarship: ScholarshipData): string[] => {
  return scholarship.available_at.filter(
    uni => !['ALL_PUBLIC', 'ALL_PRIVATE', 'ALL_HEC', 'FOREIGN'].includes(uni)
  );
};

// Check if scholarship has broad availability (ALL_PUBLIC, etc.)
export const hasBroadAvailability = (scholarship: ScholarshipData): boolean => {
  return scholarship.available_at.some(
    uni => ['ALL_PUBLIC', 'ALL_PRIVATE', 'ALL_HEC'].includes(uni)
  );
};

// Get active scholarships only
export const getActiveScholarships = (): ScholarshipData[] => {
  return SCHOLARSHIPS.filter(s => s.is_active);
};

// Get scholarships by type
export const getScholarshipsByType = (type: ScholarshipType): ScholarshipData[] => {
  return SCHOLARSHIPS.filter(s => s.type === type);
};

// Get scholarships with stipend
export const getScholarshipsWithStipend = (): ScholarshipData[] => {
  return SCHOLARSHIPS.filter(s => s.monthly_stipend && s.monthly_stipend > 0);
};

// Filter scholarships by income limit
export const getScholarshipsByIncomeLimit = (monthlyIncome: number): ScholarshipData[] => {
  return SCHOLARSHIPS.filter(s => 
    s.max_family_income === null || s.max_family_income >= monthlyIncome
  );
};

// Search scholarships by text
export const searchScholarships = (query: string): ScholarshipData[] => {
  const searchLower = query.toLowerCase().trim();
  if (!searchLower) return SCHOLARSHIPS;
  
  return SCHOLARSHIPS.filter(s => 
    s.name.toLowerCase().includes(searchLower) ||
    s.provider.toLowerCase().includes(searchLower) ||
    s.description.toLowerCase().includes(searchLower) ||
    s.type.toLowerCase().includes(searchLower)
  );
};

export default SCHOLARSHIPS;


