/**
 * Import Kaggle Datasets to ENHANCE Existing PakUni Features
 * 
 * Focus: Enrich existing data, NOT add new unrelated features
 * 
 * 1. Universities → Add geolocation, contact info, map URLs
 * 2. Careers → Add job market stats, demand levels, top cities
 * 3. Programs → Link to job market demand
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

// Use the kaggle-data folder where we downloaded files
const KAGGLE_DIR = path.join(__dirname, '..', 'kaggle-data');
const OUTPUT_DIR = path.join(__dirname, 'processed');

// ============================================================================
// TYPES
// ============================================================================

interface UniversityEnhancement {
  name: string;
  short_name?: string;
  latitude?: number;
  longitude?: number;
  map_url?: string;
  contact_phone?: string;
  contact_email?: string;
  total_campuses?: number;
  campus_locations?: string[];
  established_year?: number;
}

interface JobMarketStats {
  field: string;
  total_jobs: number;
  top_cities: string[];
  top_skills: string[];
  common_titles: string[];
  common_departments: string[];
  experience_distribution: {
    entry: number;
    mid: number;
    senior: number;
  };
  demand_level: 'low' | 'medium' | 'high' | 'very_high';
}

interface CareerEnhancement {
  field: string;
  job_count: number;
  top_cities: string[];
  common_titles: string[];
  market_trend: 'growing' | 'stable' | 'declining';
}

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ============================================================================
// PROCESS HEC UNIVERSITIES - Enhance existing university data
// ============================================================================

function processHECUniversities(): UniversityEnhancement[] {
  console.log('\n📍 Processing HEC Universities for enhancements...');
  
  // Match the actual file names we downloaded
  const targetFiles = [
    'universities.csv',  // HEC accredited with geolocation
    'All the Universities of Pakistan.csv'  // Additional data
  ];
  
  const files = fs.readdirSync(KAGGLE_DIR).filter(f => 
    targetFiles.some(t => f.toLowerCase() === t.toLowerCase())
  );
  
  if (files.length === 0) {
    console.log('⚠️  HEC Universities dataset not found');
    console.log('   Looking in:', KAGGLE_DIR);
    console.log('   Available files:', fs.readdirSync(KAGGLE_DIR));
    return [];
  }
  
  const enhancements: UniversityEnhancement[] = [];
  const processedNames = new Set<string>();
  
  for (const file of files) {
    if (!file.endsWith('.csv')) continue;
    console.log(`   Processing: ${file}`);
    
    const content = fs.readFileSync(path.join(KAGGLE_DIR, file), 'utf-8');
    const records = parse(content, { columns: true, skip_empty_lines: true, bom: true });
    
    for (const record of records) {
      // Handle different column names in different files
      const name = record['University Name'] || record['University'] || record['name'] || '';
      
      // Skip duplicates
      const normalizedName = name.toLowerCase().trim();
      if (processedNames.has(normalizedName)) continue;
      processedNames.add(normalizedName);
      
      const enhancement: UniversityEnhancement = {
        name: name.trim(),
        latitude: parseFloat(record['Latitude'] || record['lat']) || undefined,
        longitude: parseFloat(record['Longitude'] || record['lng'] || record['long']) || undefined,
        map_url: record['Google Map URL'] || record['map_url'] || record['Map URL'],
        contact_phone: extractPhone(record['Contact Information'] || record['Contact Number'] || record['phone'] || ''),
        contact_email: extractEmail(record['Contact Information'] || record['Email'] || record['email'] || ''),
        established_year: parseInt(record['Established Since'] || record['Established'] || record['Year']) || undefined,
      };
      
      // Parse campuses from different formats
      const campusStr = record['Campuses'] || '';
      if (campusStr) {
        const campuses = campusStr.split(/[,;]/).map((c: string) => c.trim()).filter(Boolean);
        enhancement.total_campuses = campuses.length || 1;
        enhancement.campus_locations = campuses;
      }
      
      if (enhancement.name && (enhancement.latitude || enhancement.map_url || enhancement.contact_phone)) {
        enhancements.push(enhancement);
      }
    }
  }
  
  console.log(`   ✅ Found ${enhancements.length} university enhancements`);
  return enhancements;
}

// Helper to extract phone from contact info
function extractPhone(text: string): string | undefined {
  const phoneMatch = text.match(/(\+92[\d\s-]+|\d{2,4}[\s-]\d{6,8})/);
  return phoneMatch ? phoneMatch[0].trim() : undefined;
}

// Helper to extract email from contact info
function extractEmail(text: string): string | undefined {
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  return emailMatch ? emailMatch[0] : undefined;
}

// ============================================================================
// PROCESS JOB MARKET - Aggregate stats by field for career guidance
// ============================================================================

function processJobMarket(): { stats: JobMarketStats[], careerEnhancements: CareerEnhancement[] } {
  console.log('\n💼 Processing Job Market for career enhancements...');
  
  // Match actual downloaded job files
  const targetFiles = [
    'Pakistan Available Job Dec 19 - Mar-21.csv',
    'RozeePK-Jobs-2024.csv',
    'future_jobs_dataset.csv'
  ];
  
  const files = fs.readdirSync(KAGGLE_DIR).filter(f => 
    targetFiles.some(t => f.toLowerCase() === t.toLowerCase())
  );
  
  if (files.length === 0) {
    console.log('⚠️  Job Market dataset not found');
    console.log('   Looking in:', KAGGLE_DIR);
    return { stats: [], careerEnhancements: [] };
  }
  
  // Aggregate data by field
  const fieldData: Record<string, {
    jobs: number;
    cities: Record<string, number>;
    titles: Record<string, number>;
    departments: Record<string, number>;
    skills: Record<string, number>;
    experience: { entry: number; mid: number; senior: number };
    salaryData: number[];
  }> = {};
  
  for (const file of files) {
    if (!file.endsWith('.csv')) continue;
    console.log(`   Processing: ${file}`);
    
    try {
      const content = fs.readFileSync(path.join(KAGGLE_DIR, file), 'utf-8');
      const records = parse(content, { columns: true, skip_empty_lines: true, bom: true, relax_column_count: true });
      
      console.log(`   ... Found ${records.length} job records`);
      
      for (const record of records) {
        // Handle different column names across files
        const title = record['Job Name'] || record['Title'] || record['job_title'] || record['Job Title'] || '';
        const dept = record['Department'] || record['Functional Area'] || record['industry'] || '';
        const field = categorizeJobToField(title, dept);
        
        // Handle different city column names
        let city = record['City'] || record['Job Location'] || record['location'] || 'Pakistan';
        city = cleanCity(city);
        
        const exp = record['Experience Required'] || record['Minimum Experience'] || record['experience'] || '';
        const desc = record['JD'] || record['Job Description'] || record['skills_required'] || '';
        
        // Extract salary if available
        const salaryStr = record['Salary'] || record['salary_usd'] || '';
        const salary = extractSalary(salaryStr);
        
        if (!fieldData[field]) {
          fieldData[field] = {
            jobs: 0,
            cities: {},
            titles: {},
            departments: {},
            skills: {},
            experience: { entry: 0, mid: 0, senior: 0 },
            salaryData: []
          };
        }
        
        const fd = fieldData[field];
        fd.jobs++;
        
        if (city && city !== 'Pakistan') {
          fd.cities[city] = (fd.cities[city] || 0) + 1;
        }
        
        if (title) {
          // Normalize title for grouping
          const normalizedTitle = normalizeTitle(title);
          fd.titles[normalizedTitle] = (fd.titles[normalizedTitle] || 0) + 1;
        }
        
        if (dept) {
          fd.departments[dept] = (fd.departments[dept] || 0) + 1;
        }
        
        // Categorize experience
        const expLower = exp.toLowerCase();
        if (expLower.includes('fresh') || expLower.includes('0') || expLower.includes('entry') || expLower === '') {
          fd.experience.entry++;
        } else if (expLower.includes('5+') || expLower.includes('senior') || expLower.includes('10') || expLower.includes('8')) {
          fd.experience.senior++;
        } else {
          fd.experience.mid++;
        }
        
        // Extract skills from description
        const skills = extractSkills(desc + ' ' + title);
        for (const skill of skills) {
          fd.skills[skill] = (fd.skills[skill] || 0) + 1;
        }
        
        if (salary > 0) {
          fd.salaryData.push(salary);
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Error processing ${file}:`, error);
    }
  }
  
  // Convert to stats objects
  const stats: JobMarketStats[] = [];
  const careerEnhancements: CareerEnhancement[] = [];
  
  // Calculate total jobs for demand level calibration
  const totalJobs = Object.values(fieldData).reduce((sum, d) => sum + d.jobs, 0);
  const avgJobsPerField = totalJobs / Object.keys(fieldData).length;
  
  for (const [field, data] of Object.entries(fieldData)) {
    if (data.jobs < 5) continue; // Skip fields with too few jobs
    
    const topCities = Object.entries(data.cities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([city]) => city);
    
    const topTitles = Object.entries(data.titles)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([title]) => title);
    
    const topDepts = Object.entries(data.departments)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([dept]) => dept);
    
    const topSkills = Object.entries(data.skills)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill]) => skill);
    
    // Determine demand level relative to average
    let demandLevel: 'low' | 'medium' | 'high' | 'very_high' = 'medium';
    if (data.jobs > avgJobsPerField * 2) demandLevel = 'very_high';
    else if (data.jobs > avgJobsPerField * 1.2) demandLevel = 'high';
    else if (data.jobs < avgJobsPerField * 0.5) demandLevel = 'low';
    
    stats.push({
      field,
      total_jobs: data.jobs,
      top_cities: topCities,
      top_skills: topSkills,
      common_titles: topTitles,
      common_departments: topDepts,
      experience_distribution: data.experience,
      demand_level: demandLevel,
    });
    
    careerEnhancements.push({
      field,
      job_count: data.jobs,
      top_cities: topCities,
      common_titles: topTitles,
      market_trend: demandLevel === 'very_high' || demandLevel === 'high' ? 'growing' : demandLevel === 'medium' ? 'stable' : 'declining',
    });
  }
  
  // Sort by job count
  stats.sort((a, b) => b.total_jobs - a.total_jobs);
  careerEnhancements.sort((a, b) => b.job_count - a.job_count);
  
  console.log(`   ✅ Generated stats for ${stats.length} career fields`);
  console.log(`   📊 Total jobs processed: ${totalJobs}`);
  return { stats, careerEnhancements };
}

// Clean city names
function cleanCity(city: string): string {
  if (!city) return 'Pakistan';
  return city
    .replace(/\n/g, '')
    .replace(/\s+/g, ' ')
    .replace(/,\s*Pakistan$/i, '')
    .trim()
    .split(',')[0]
    .trim();
}

// Normalize job titles for grouping
function normalizeTitle(title: string): string {
  return title
    .replace(/\s+(sr|jr|senior|junior|lead|head|chief|principal)\s+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 50);
}

// Extract salary from various formats
function extractSalary(salaryStr: string): number {
  if (!salaryStr) return 0;
  const numMatch = salaryStr.match(/[\d,]+/);
  if (numMatch) {
    return parseInt(numMatch[0].replace(/,/g, '')) || 0;
  }
  return 0;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function categorizeJobToField(title: string, dept: string): string {
  const combined = `${title} ${dept}`.toLowerCase();
  
  const categories: Record<string, string[]> = {
    'Software Engineering': ['software', 'developer', 'programmer', 'full stack', 'frontend', 'backend', 'web developer', 'mobile developer', 'app developer', '.net', 'java developer', 'python developer'],
    'Data Science & AI': ['data scientist', 'machine learning', 'ai', 'artificial intelligence', 'deep learning', 'data analyst', 'analytics', 'big data', 'ml engineer', 'data engineer'],
    'Medical & Healthcare': ['doctor', 'nurse', 'medical', 'health', 'pharma', 'lab', 'dental', 'clinical', 'physician', 'surgeon', 'healthcare', 'hospital'],
    'Business & Management': ['manager', 'business', 'operations', 'strategy', 'executive', 'director', 'ceo', 'coo', 'general manager', 'project manager', 'product manager'],
    'Finance & Banking': ['accountant', 'finance', 'audit', 'tax', 'banking', 'investment', 'financial', 'chartered', 'cpa', 'accounts', 'treasury'],
    'Marketing & Digital': ['marketing', 'digital marketing', 'seo', 'sem', 'social media', 'content', 'brand', 'advertising', 'growth', 'ppc'],
    'Sales & Business Development': ['sales', 'business development', 'account manager', 'territory', 'sales executive', 'bdm', 'client relations'],
    'IT Infrastructure': ['network', 'database', 'system admin', 'security', 'cloud', 'devops', 'infrastructure', 'dba', 'system engineer', 'it support', 'helpdesk'],
    'Education & Training': ['teacher', 'professor', 'lecturer', 'trainer', 'instructor', 'tutor', 'education', 'academic', 'faculty'],
    'Design & Creative': ['designer', 'graphic', 'ui', 'ux', 'creative', 'artist', 'video', 'animation', 'visual', 'illustrator'],
    'HR & Administration': ['hr', 'human resource', 'admin', 'office', 'receptionist', 'secretary', 'recruitment', 'talent', 'payroll'],
    'Engineering (Other)': ['engineer', 'mechanical', 'electrical', 'civil', 'chemical', 'structural', 'manufacturing', 'production'],
    'Customer Service': ['customer service', 'customer support', 'call center', 'bpo', 'client service', 'support executive'],
    'Legal': ['lawyer', 'legal', 'advocate', 'attorney', 'law', 'compliance', 'paralegal'],
    'Logistics & Supply Chain': ['logistics', 'supply chain', 'warehouse', 'procurement', 'import', 'export', 'shipping'],
    'Quality Assurance': ['qa', 'quality', 'testing', 'test engineer', 'automation testing', 'manual testing', 'sqa'],
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(kw => combined.includes(kw))) {
      return category;
    }
  }
  return 'Other';
}

function extractSkills(description: string): string[] {
  const commonSkills = [
    // Programming Languages
    'python', 'java', 'javascript', 'typescript', 'c#', 'c++', 'php', 'ruby', 'swift', 'kotlin', 'go', 'rust',
    // Web Frameworks
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel', '.net', 'asp.net',
    // Mobile
    'react native', 'flutter', 'android', 'ios', 'swift', 'kotlin',
    // Databases
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'sql server',
    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'terraform',
    // Tools
    'git', 'jira', 'excel', 'ms office', 'photoshop', 'figma', 'sketch',
    // Soft Skills
    'communication', 'leadership', 'teamwork', 'problem solving', 'analytical',
    // Methodologies
    'agile', 'scrum', 'kanban', 'project management',
    // Data & Analytics
    'data analysis', 'machine learning', 'tensorflow', 'pytorch', 'tableau', 'power bi', 'statistics',
    // Business
    'accounting', 'sap', 'erp', 'crm', 'salesforce', 'digital marketing', 'seo',
  ];
  
  const desc = description.toLowerCase();
  return commonSkills.filter(skill => desc.includes(skill));
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║    PakUni - Enhance Existing Features with Kaggle Data        ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  
  // Check for kaggle datasets
  if (!fs.existsSync(KAGGLE_DIR)) {
    console.log('\n❌ Kaggle datasets directory not found!');
    console.log('\nPlease download datasets first:');
    console.log('   1. Run: npm run kaggle:download');
    console.log('   2. Or manually download from Kaggle URLs');
    return;
  }
  
  const files = fs.readdirSync(KAGGLE_DIR).filter(f => f.endsWith('.csv'));
  if (files.length === 0) {
    console.log('\n❌ No CSV files found!');
    console.log('\nDownload datasets to: data-import/kaggle-datasets/');
    return;
  }
  
  console.log(`\n📊 Found ${files.length} CSV files to process`);
  
  // Process each dataset type
  const universityEnhancements = processHECUniversities();
  const { stats: jobStats, careerEnhancements } = processJobMarket();
  
  // Save processed data
  console.log('\n📁 Saving processed data...');
  
  if (universityEnhancements.length > 0) {
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'university-enhancements.json'),
      JSON.stringify(universityEnhancements, null, 2)
    );
    console.log('   ✅ university-enhancements.json');
  }
  
  if (jobStats.length > 0) {
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'job-market-stats.json'),
      JSON.stringify(jobStats, null, 2)
    );
    console.log('   ✅ job-market-stats.json');
  }
  
  if (careerEnhancements.length > 0) {
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'career-enhancements.json'),
      JSON.stringify(careerEnhancements, null, 2)
    );
    console.log('   ✅ career-enhancements.json');
  }
  
  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 Enhancement Summary:');
  console.log(`   🏫 Universities to enhance: ${universityEnhancements.length}`);
  console.log(`   💼 Career fields with job data: ${careerEnhancements.length}`);
  console.log(`   📈 Job market stats generated: ${jobStats.length}`);
  console.log('═══════════════════════════════════════════════════════════════');
  
  console.log('\n✅ Processing complete!');
  console.log('\nNext: Run npm run kaggle:import to update Turso database');
}

main().catch(console.error);
