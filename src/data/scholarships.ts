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
  'default': { primary: '#6366F1', secondary: '#8B5CF6', gradient: ['#4F46E5', '#6366F1', '#8B5CF6'] },
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
    description: 'Scholarships for students from Balochistan to pursue higher education.',
    eligibility: [
      'Balochistan domicile holder',
      'Minimum 60% marks in previous examination',
      'Family income below PKR 40,000 per month',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: true,
    covers_books: true,
    monthly_stipend: 10000,
    required_documents: [
      'Balochistan domicile',
      'Income certificate',
      'Academic certificates',
      'CNIC copies',
    ],
    application_deadline: 'June-July yearly',
    website: 'https://www.bef.gob.pk/',
    min_percentage: 60,
    max_family_income: 40000,
    is_active: true,
    available_at: ['UoB', 'BUITEMS', 'BUHS', 'SBK', 'LUAWMS', 'UoBalochistan'],
    application_method: 'online_portal',
    application_steps: [
      'Visit BEF official website',
      'Create account and fill application',
      'Upload required documents',
      'Submit before deadline',
    ],
    renewal_required: true,
    renewal_criteria: 'Maintain passing grades',
    status_notes: 'Only for Balochistan domicile holders',
  },
  {
    id: 'sef-scholarship',
    name: 'SEF (Sindh Education Foundation) Scholarship',
    provider: 'Sindh Government',
    type: 'need_based',
    description: 'Scholarship program for deserving students from Sindh province.',
    eligibility: [
      'Sindh domicile holder',
      'Minimum 60% marks in previous examination',
      'Family income below PKR 35,000 per month',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: 6000,
    required_documents: [
      'Sindh domicile certificate',
      'Income proof',
      'Academic transcripts',
      'CNIC copies',
    ],
    application_deadline: 'August yearly',
    website: 'https://www.sef.org.pk/',
    min_percentage: 60,
    max_family_income: 35000,
    is_active: true,
    available_at: ['UoK', 'KU', 'NED', 'MUET', 'SALU', 'IBA', 'SZABIST', 'LUMHS', 'SMIU', 'DUHS', 'UoS'],
    application_method: 'online_portal',
    application_steps: [
      'Visit SEF website',
      'Complete online application',
      'Upload documents',
      'Submit before deadline',
    ],
    renewal_required: true,
    renewal_criteria: 'Maintain satisfactory academic progress',
    status_notes: 'Only for Sindh domicile holders',
  },
  {
    id: 'pm-fee-reimbursement',
    name: 'PM Fee Reimbursement Scheme for Less Developed Areas',
    provider: 'Higher Education Commission',
    type: 'government',
    description: 'Full fee reimbursement for students from less developed areas (Balochistan, FATA, Gilgit-Baltistan, AJK, Southern Punjab).',
    eligibility: [
      'Domicile from less developed areas',
      'Admitted in public sector HEC recognized university',
      'Minimum 60% marks in intermediate',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'Domicile certificate from eligible area',
      'Academic certificates',
      'University admission letter',
      'Fee challan',
    ],
    application_deadline: 'Within first semester of admission',
    website: 'https://www.hec.gov.pk/english/scholarshipsgrants/',
    min_percentage: 60,
    max_family_income: null,
    is_active: true,
    available_at: ['ALL_PUBLIC', 'QAU', 'NUST', 'CUI', 'UET', 'PU', 'UoK', 'BZU', 'GCU', 'IIU', 'NED', 'UoP', 'UoB', 'UoAJK', 'KUST', 'BUITEMS', 'KIU'],
    application_method: 'university_office',
    application_steps: [
      'Collect form from university financial aid office',
      'Submit domicile from eligible area',
      'Provide admission and fee documents',
      'University processes with HEC',
    ],
    renewal_required: true,
    renewal_criteria: 'Maintain enrollment and satisfactory progress',
    status_notes: 'Eligible areas: Balochistan, FATA/Merged Districts, GB, AJK, Southern Punjab',
  },
  // ========== MERIT-BASED SCHOLARSHIPS ==========
  {
    id: 'hec-indigenous-phd',
    name: 'HEC Indigenous PhD Fellowship',
    provider: 'Higher Education Commission',
    type: 'merit_based',
    description: 'Fully funded PhD scholarships for faculty members and fresh graduates.',
    eligibility: [
      'Pakistani national',
      'MS/MPhil degree with CGPA 3.0/4.0 or 60% marks',
      "Master's degree in relevant field",
      'GAT General with 50+ marks',
      'Age below 40 years',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: true,
    monthly_stipend: 60000,
    required_documents: [
      'HEC verified degrees',
      'GAT score card',
      'Research proposal',
      'NOC from employer (if employed)',
    ],
    application_deadline: 'Varies - check HEC website',
    website: 'https://www.hec.gov.pk/english/scholarshipsgrants/PhD/',
    min_percentage: 60,
    max_family_income: null,
    is_active: true,
    available_at: ['ALL_PUBLIC', 'QAU', 'NUST', 'CUI', 'PIEAS', 'UET', 'PU', 'UoK', 'GCU', 'IIU', 'NED', 'MUET'],
    application_method: 'online_portal',
    application_steps: [
      'Visit HEC scholarship portal',
      'Select Indigenous PhD program',
      'Fill profile and academic details',
      'Upload GAT score and research proposal',
      'Submit before deadline'
    ],
    status_notes: 'Check HEC portal for current call for applications',
  },
  {
    id: 'nust-undergraduate-merit',
    name: 'NUST Merit Scholarship',
    provider: 'National University of Sciences & Technology',
    type: 'merit_based',
    description: 'Full and partial tuition waivers for high achievers in NET exam.',
    eligibility: [
      'NET score in top 100 nationally',
      'FSc/A-Level marks above 85%',
      'Maintain CGPA 3.5+ to continue scholarship',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'NET score card',
      'Academic certificates',
      'CNIC copy',
    ],
    application_deadline: 'At time of admission',
    website: 'https://nust.edu.pk/admissions/',
    min_percentage: 85,
    max_family_income: null,
    is_active: true,
    available_at: ['NUST'],
    application_method: 'direct_admission',
    application_steps: [
      'Appear in NUST Entry Test (NET)',
      'Secure top position in merit list',
      'Scholarship is automatically awarded during admission'
    ],
    status_notes: 'Based purely on NET performance',
  },
  {
    id: 'lums-nos',
    name: 'LUMS National Outreach Programme (NOP)',
    provider: 'LUMS',
    type: 'need_based',
    description: '100% scholarship for talented students from lower-income backgrounds.',
    eligibility: [
      'Family income below PKR 150,000 per month',
      'Minimum 80% marks in matric and intermediate',
      'Clear LUMS admission process',
      'Pakistani national studying in Pakistan',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: true,
    covers_books: true,
    monthly_stipend: 10000,
    required_documents: [
      'Financial aid application',
      'Tax returns or income proof',
      'Property documents',
      'Academic transcripts',
    ],
    application_deadline: 'With LUMS application (January-February)',
    website: 'https://lums.edu.pk/financial-aid',
    min_percentage: 80,
    max_family_income: 150000,
    is_active: true,
    available_at: ['LUMS'],
    application_method: 'both_portal_university',
    application_steps: [
      'Apply for LUMS admission',
      'Select NOP option in application',
      'Fill separate financial aid section',
      'Submit family income and wealth documents',
      'Clear LUMS entrance test (SAT/LUMS test)',
      'Attend NOP summer workshop if selected'
    ],
    status_notes: 'One of Pakistans most prestigious need-based programs',
  },
  {
    id: 'iba-talent-hunt',
    name: 'IBA Talent Hunt Program',
    provider: 'IBA Karachi',
    type: 'need_based',
    description: '100% scholarship for students from government schools across Pakistan.',
    eligibility: [
      'Studied in government school',
      'Family income below PKR 50,000 per month',
      'Minimum 80% marks in matric',
      'Clear IBA admission test',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: true,
    covers_books: true,
    monthly_stipend: 8000,
    required_documents: [
      'Government school certificate',
      'Income proof',
      'Academic transcripts',
      'CNIC copies',
    ],
    application_deadline: 'December-January yearly',
    website: 'https://iba.edu.pk/talent-hunt-program.php',
    min_percentage: 80,
    max_family_income: 50000,
    is_active: true,
    available_at: ['IBA'],
    application_method: 'online_portal',
    application_steps: [
      'Register on IBA Talent Hunt portal',
      'Submit government school proof',
      'Appear in assessment test',
      'Selected candidates get free training for IBA test',
      'Clear final IBA admission test'
    ],
    status_notes: 'Focused on students from marginalized areas',
  },
  {
    id: 'giki-scholarship',
    name: 'GIKI Financial Assistance',
    provider: 'GIK Institute',
    type: 'need_based',
    description: 'Need-based financial assistance for deserving students.',
    eligibility: [
      'Admitted to GIKI',
      'Demonstrated financial need',
      'Maintain good academic standing',
    ],
    coverage_percentage: 50,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'Financial aid application',
      'Income proof',
      'Academic transcripts',
    ],
    application_deadline: 'With admission',
    website: 'https://giki.edu.pk/admissions/',
    min_percentage: 70,
    max_family_income: 100000,
    is_active: true,
    available_at: ['GIKI'],
    application_method: 'university_office',
    application_steps: [
      'Apply to GIKI admission',
      'Submit financial aid form with admission desk',
      'Provide income and asset details',
      'Initial grant awarded for first year'
    ],
    status_notes: 'Assistance is reviewed annually',
  },
  {
    id: 'fast-merit',
    name: 'FAST Merit Scholarship',
    provider: 'FAST-NUCES',
    type: 'merit_based',
    description: 'Merit-based scholarship for top performers in NU entry test.',
    eligibility: [
      'Top 50 in FAST entry test',
      'FSc marks above 80%',
      'Maintain CGPA 3.0+',
    ],
    coverage_percentage: 50,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'Entry test score',
      'Academic certificates',
    ],
    application_deadline: 'At time of admission',
    website: 'https://nu.edu.pk/Admissions',
    min_percentage: 80,
    max_family_income: null,
    is_active: true,
    available_at: ['FAST'],
    application_method: 'direct_admission',
    application_steps: [
      'Take NU Admission Test',
      'Scholarship awarded to top merit list candidates',
      'Maintain CGPA to continue'
    ],
    status_notes: 'Partial waiver for high achievers',
  },
  {
    id: 'cui-merit',
    name: 'COMSATS Merit Scholarship',
    provider: 'COMSATS University',
    type: 'merit_based',
    description: 'Scholarship for position holders and high achievers.',
    eligibility: [
      '85%+ marks in intermediate',
      'Board position holders get 100% waiver',
      'Maintain CGPA 3.5+',
    ],
    coverage_percentage: 75,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'Academic certificates',
      'Position holder certificate (if applicable)',
    ],
    application_deadline: 'At time of admission',
    website: 'https://www.comsats.edu.pk/Scholarships.aspx',
    min_percentage: 85,
    max_family_income: null,
    is_active: true,
    available_at: ['CUI'],
    application_method: 'direct_admission',
    application_steps: [
      'Apply to COMSATS through their portal',
      'Merit is calculated automatically',
      'High achievers receive fee waivers in offer letter'
    ],
    status_notes: 'Available across all COMSATS campuses',
  },
  {
    id: 'uet-merit',
    name: 'UET Merit Scholarship',
    provider: 'UET Lahore',
    type: 'merit_based',
    description: 'Full tuition waiver for ECAT toppers.',
    eligibility: [
      'Top 100 in ECAT',
      'FSc marks above 85%',
      'Maintain GPA 3.0+',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'ECAT score card',
      'Academic certificates',
    ],
    application_deadline: 'At time of admission',
    website: 'https://uet.edu.pk/home/',
    min_percentage: 85,
    max_family_income: null,
    is_active: true,
    available_at: ['UET'],
    application_method: 'direct_admission',
    application_steps: [
      'Participate in ECAT',
      'Secure top rank for free-ship program',
      'Verification of documents at admission desk'
    ],
    status_notes: 'Only for open merit candidates',
  },
  // ========== HAFIZ-E-QURAN SCHOLARSHIPS ==========
  {
    id: 'hafiz-general',
    name: 'Hafiz-e-Quran Scholarship',
    provider: 'Various Universities',
    type: 'hafiz_e_quran',
    description: 'Fee concession for Huffaz. Typically 20-50% tuition waiver.',
    eligibility: [
      'Valid Hafiz-e-Quran certificate from recognized institution',
      'Must pass Hafiz verification test at university',
    ],
    coverage_percentage: 25,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'Hafiz-e-Quran certificate from Wafaq-ul-Madaris',
      'Pass university Hafiz verification',
    ],
    application_deadline: 'At time of admission',
    website: '',
    min_percentage: null,
    max_family_income: null,
    is_active: true,
    available_at: ['ALL_PUBLIC', 'ALL_PRIVATE', 'UET', 'PU', 'BZU', 'GCU', 'IIU', 'CUI', 'UoK', 'NED', 'UAF', 'UMT', 'LUMS', 'FAST', 'NUST'],
    application_method: 'university_office',
    application_steps: [
      'Check checkbox for Hafiz-e-Quran in admission form',
      'Submit Hafiz certificate during document submission',
      'Appear for interview/test at university department'
    ],
    status_notes: 'Standard across most public universities in Pakistan',
  },
  {
    id: 'merit-hafiz-bonus',
    name: 'Hafiz-e-Quran Merit Bonus',
    provider: 'UHS, UET, and Punjab Universities',
    type: 'hafiz_e_quran',
    description: '20 marks bonus added to aggregate for Huffaz in MDCAT and ECAT.',
    eligibility: [
      'Valid Hafiz-e-Quran certificate',
      'Must pass verbal test',
      'Only applicable in Punjab public universities',
    ],
    coverage_percentage: 0,
    covers_tuition: false,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'Hafiz certificate',
      'Pass Hafiz verification test',
    ],
    application_deadline: 'During admission process',
    website: 'https://www.uhs.edu.pk/mdcat',
    min_percentage: null,
    max_family_income: null,
    is_active: true,
    available_at: ['UET', 'KEMU', 'UHS', 'PU', 'BZU', 'GCU', 'UAF', 'UVAS', 'UoG', 'AIMC', 'SMC', 'RMC', 'NMC', 'FMC'],
    application_method: 'university_office',
    application_steps: [
      'Select Hafiz category in admission portal',
      'Download and print special Hafiz form',
      'Visit UHS/UET for oral test',
      'Bonus marks added to final aggregate'
    ],
    status_notes: 'Critical for competitive medical/engineering admissions',
  },
  // ========== PRIVATE SECTOR SCHOLARSHIPS ==========
  {
    id: 'ihsan-trust',
    name: 'Ihsan Trust Education Loan',
    provider: 'Ihsan Trust (Interest-free)',
    type: 'private',
    description: 'Interest-free education loan (Qarz-e-Hasna). Repayment starts after graduation.',
    eligibility: [
      'Pakistani citizen',
      'Admitted in HEC recognized university',
      'Family income below PKR 100,000 per month',
      'Two guarantors required',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: true,
    covers_books: true,
    monthly_stipend: null,
    required_documents: [
      'Application form',
      'Admission letter',
      'Income proof',
      'CNIC copies of student, parents, and guarantors',
    ],
    application_deadline: 'Rolling basis',
    website: 'https://www.ihsantrust.org.pk/',
    min_percentage: null,
    max_family_income: 100000,
    is_active: true,
    available_at: ['ALL_HEC', 'LUMS', 'IBA', 'NUST', 'GIKI', 'FAST', 'CUI', 'NED', 'UET', 'PU', 'UoK', 'QAU'],
    application_method: 'mail_application',
    application_steps: [
      'Download application form from Ihsan Trust website',
      'Fill and attach all required documents',
      'Mail to their Karachi office',
      'Attend interview in Karachi or regional center',
      'Amount is disbursed directly to university'
    ],
    status_notes: 'Repaid in easy installments after getting a job',
  },
  {
    id: 'csc-scholarship',
    name: 'Chinese Government Scholarship (CSC)',
    provider: 'China Scholarship Council',
    type: 'government',
    description: 'Fully funded scholarship for Pakistani students to study in China.',
    eligibility: [
      'Pakistani citizen in good health',
      'Under 35 years for Masters, under 40 for PhD',
      'Minimum 60% marks in previous degree',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: true,
    covers_books: true,
    monthly_stipend: 42000,
    required_documents: [
      'CSC application form',
      'Acceptance letter from Chinese university',
      'Study plan',
      'Medical certificate',
    ],
    application_deadline: 'December-February yearly',
    website: 'https://www.campuschina.org/',
    min_percentage: 60,
    max_family_income: null,
    is_active: true,
    available_at: ['FOREIGN'],
    application_method: 'both_portal_university',
    application_steps: [
      'Apply online at CSC portal',
      'Choose category A (through HEC) or category B (Direct to Uni)',
      'Submit separate application to Chinese university through their portal',
      'Wait for result on HEC website for Category A'
    ],
    status_notes: 'One of best foreign scholarship options for Pakistanis',
  },
  {
    id: 'usaid-merit-scholarship',
    name: 'USAID Merit & Needs Based Scholarship',
    provider: 'USAID',
    type: 'need_based',
    description: 'Scholarship for undergraduate students from disadvantaged backgrounds.',
    eligibility: [
      'Enrolled in partner university',
      'Family income below PKR 45,000 per month',
      'Minimum 60% marks',
      'Female students get preference',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: true,
    monthly_stipend: 5000,
    required_documents: [
      'University enrollment',
      'Income certificate',
      'Academic records',
    ],
    application_deadline: 'Via university financial aid office',
    website: 'https://www.usaid.gov/pakistan/education',
    min_percentage: 60,
    max_family_income: 45000,
    is_active: true,
    available_at: ['UoP', 'UoK', 'UoB', 'KUST', 'BUITEMS', 'UoAJK', 'KIU'],
  },
  {
    id: 'dawood-foundation',
    name: 'Dawood Foundation Scholarship',
    provider: 'Dawood Foundation',
    type: 'merit_based',
    description: 'Scholarship for outstanding students pursuing engineering education.',
    eligibility: [
      'Minimum 80% marks in FSc',
      'Admitted in recognized engineering program',
      'Maintain high academic standing',
    ],
    coverage_percentage: 75,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'Academic records',
      'Admission letter',
    ],
    application_deadline: 'August-September',
    website: 'https://dawoodfoundation.org/',
    min_percentage: 80,
    max_family_income: null,
    is_active: true,
    available_at: ['NED', 'MUET', 'UET', 'GIKI', 'NUST', 'PIEAS'],
  },
  // ========== SPECIAL CATEGORY SCHOLARSHIPS ==========
  {
    id: 'disabled-quota',
    name: 'Disabled Persons Scholarship',
    provider: 'Government of Pakistan',
    type: 'disabled',
    description: 'Reserved seats and fee waivers for persons with disabilities.',
    eligibility: [
      'Valid disability certificate from government hospital',
      '2% seats reserved in all public universities',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: 3000,
    required_documents: [
      'Disability certificate',
      'Medical board certificate',
      'CNIC copy',
    ],
    application_deadline: 'At time of admission',
    website: 'https://www.hec.gov.pk/',
    min_percentage: null,
    max_family_income: null,
    is_active: true,
    available_at: ['ALL_PUBLIC', 'QAU', 'NUST', 'CUI', 'UET', 'PU', 'UoK', 'BZU', 'GCU', 'IIU', 'NED', 'MUET', 'UoP'],
  },
  {
    id: 'sports-quota',
    name: 'Sports Quota Scholarship',
    provider: 'Various Universities',
    type: 'sports',
    description: 'Reserved seats and scholarships for outstanding sportspersons.',
    eligibility: [
      'National or international level sports representation',
      'Certificate from Pakistan Sports Board',
    ],
    coverage_percentage: 50,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: null,
    required_documents: [
      'Sports certificates',
      'NOC from Pakistan Sports Board',
    ],
    application_deadline: 'At time of admission',
    website: '',
    min_percentage: null,
    max_family_income: null,
    is_active: true,
    available_at: ['ALL_PUBLIC', 'PU', 'UoK', 'UET', 'BZU', 'GCU', 'NED', 'MUET', 'UoP', 'LUMS', 'NUST'],
    application_method: 'university_office',
    application_steps: [
      'Apply during university trials',
      'Submit sports certificates with admission form',
      'Appear for trials at university grounds',
      'Verification from Sports Board'
    ],
    status_notes: 'Based on active sports involvement',
  },
  {
    id: 'fata-scholarship',
    name: 'FATA/Merged Districts Scholarship',
    provider: 'Higher Education Commission',
    type: 'government',
    description: 'Special scholarship for students from former FATA (merged districts of KPK).',
    eligibility: [
      'Domicile from merged districts',
      'Enrolled in HEC recognized university',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: true,
    covers_books: true,
    monthly_stipend: 8000,
    required_documents: [
      'Merged districts domicile',
      'Admission letter',
      'CNIC copies',
    ],
    application_deadline: 'With admission',
    website: 'https://www.hec.gov.pk/',
    min_percentage: null,
    max_family_income: null,
    is_active: true,
    available_at: ['ALL_PUBLIC', 'UoP', 'KUST', 'IMS', 'QAU', 'NUST', 'CUI', 'IIU', 'UET'],
    application_method: 'online_portal',
    application_steps: [
      'Wait for advertisement on HEC website',
      'Create account and fill special FATA form',
      'Upload domicile and academic records',
      'Submit and print application'
    ],
    status_notes: 'Highly recommended for students from merged districts',
  },
  {
    id: 'kinship-orphan',
    name: 'Orphan Students Scholarship',
    provider: 'Various Universities',
    type: 'need_based',
    description: 'Full fee waiver for orphan students.',
    eligibility: [
      'Death certificate of parent(s)',
      'Guardian income certificate',
    ],
    coverage_percentage: 100,
    covers_tuition: true,
    covers_hostel: false,
    covers_books: false,
    monthly_stipend: 3000,
    required_documents: [
      'Parent death certificate',
      'Guardian CNIC',
      'Income proof',
    ],
    application_deadline: 'At time of admission',
    website: '',
    min_percentage: null,
    max_family_income: null,
    is_active: true,
    available_at: ['ALL_PUBLIC', 'PU', 'UoK', 'UET', 'BZU', 'GCU', 'IIU', 'NED', 'QAU', 'CUI', 'NUST'],
    application_method: 'university_office',
    application_steps: [
      'Submit parent death certificate with admission docs',
      'Visit financial aid office',
      'Submit guardian income affidavit',
      'Waiver applies from first semester'
    ],
    status_notes: 'Most public universities offer 100% waiver',
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
