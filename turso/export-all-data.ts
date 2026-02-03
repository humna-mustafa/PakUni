/**
 * Export All Turso Data to Bundled Files
 * 
 * Syncs: universities, scholarships, merit_archive, deadlines
 * Usage: npx ts-node turso/export-all-data-v2.ts
 */

import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// ============================================================================
// MERIT ARCHIVE EXPORT
// ============================================================================

async function exportMeritArchive() {
  console.log('\n📤 Exporting merit_archive...');

  const result = await client.execute(
    'SELECT * FROM merit_archive ORDER BY year DESC, university_name ASC, program_name ASC'
  );

  const records = result.rows as any[];
  console.log('   Found ' + records.length + ' merit records');

  const lines: string[] = [];
  lines.push('/**');
  lines.push(' * Past Merit Lists Data');
  lines.push(' * Historical closing merits for Pakistani universities');
  lines.push(' * Auto-generated from Turso on ' + new Date().toISOString().split('T')[0]);
  lines.push(' * DO NOT EDIT MANUALLY - Run: npx ts-node turso/export-all-data-v2.ts');
  lines.push(' */');
  lines.push('');
  lines.push('export interface MeritRecord {');
  lines.push('  id: string;');
  lines.push('  universityId: string;');
  lines.push('  universityName: string;');
  lines.push('  universityShortName: string;');
  lines.push('  programName: string;');
  lines.push('  programCode?: string;');
  lines.push('  year: number;');
  lines.push("  session: 'Fall' | 'Spring';");
  lines.push("  meritType: 'open' | 'self-finance' | 'reserved';");
  lines.push('  closingMerit: number;');
  lines.push('  openingMerit?: number;');
  lines.push('  totalSeats: number;');
  lines.push('  applicants?: number;');
  lines.push('  category: string;');
  lines.push('  city: string;');
  lines.push('  province: string;');
  lines.push('}');
  lines.push('');
  lines.push('export interface YearlyTrend {');
  lines.push('  year: number;');
  lines.push('  merit: number;');
  lines.push('}');
  lines.push('');
  lines.push('export const MERIT_RECORDS: MeritRecord[] = [');

  for (const r of records) {
    const shortName = r.university_id?.toString().split('-')[0]?.toUpperCase() || 
                      r.university_name?.toString().split(' ')[0] || 'UNI';
    const closingMerit = r.closing_merit || r.merit_percentage;
    const programStr = (r.program_name || '').toLowerCase();
    const category = programStr.includes('computer') ? 'computer-science' :
                     programStr.includes('electrical') ? 'electrical-engineering' :
                     programStr.includes('mechanical') ? 'mechanical-engineering' :
                     programStr.includes('civil') ? 'civil-engineering' :
                     programStr.includes('medical') || programStr.includes('mbbs') ? 'medical' :
                     programStr.includes('bba') || programStr.includes('business') ? 'business' :
                     'general';
    
    lines.push('  {');
    lines.push('    id: ' + JSON.stringify(r.id || '') + ',');
    lines.push('    universityId: ' + JSON.stringify(r.university_id || '') + ',');
    lines.push('    universityName: ' + JSON.stringify(r.university_name || '') + ',');
    lines.push('    universityShortName: ' + JSON.stringify(shortName) + ',');
    lines.push('    programName: ' + JSON.stringify(r.program_name || '') + ',');
    lines.push('    year: ' + (r.year || 2024) + ',');
    lines.push("    session: 'Fall' as const,");
    lines.push("    meritType: 'open' as const,");
    lines.push('    closingMerit: ' + (closingMerit || 80) + ',');
    lines.push('    totalSeats: ' + (r.seats_available || 100) + ',');
    lines.push('    category: ' + JSON.stringify(category) + ',');
    lines.push("    city: 'Unknown',");
    lines.push("    province: 'Unknown',");
    lines.push('  },');
  }

  lines.push('];');
  lines.push('');
  lines.push('export default MERIT_RECORDS;');

  const outputPath = path.resolve(__dirname, '../src/data/meritArchive.ts');
  fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8');
  console.log('   ✅ Exported to ' + outputPath);
  
  return records.length;
}

// ============================================================================
// SCHOLARSHIPS EXPORT  
// ============================================================================

async function exportScholarships() {
  console.log('\n📤 Exporting scholarships...');

  const result = await client.execute(
    'SELECT * FROM scholarships ORDER BY type ASC, name ASC'
  );

  const records = result.rows as any[];
  console.log('   Found ' + records.length + ' scholarships');

  const parseArray = (str: string | null): string[] => {
    if (!str) return [];
    try {
      return JSON.parse(str);
    } catch {
      return str.split(',').map(s => s.trim()).filter(Boolean);
    }
  };

  const lines: string[] = [];
  lines.push('// Comprehensive Scholarships Data for Pakistani Students');
  lines.push('// Auto-generated from Turso on ' + new Date().toISOString().split('T')[0]);
  lines.push('// DO NOT EDIT MANUALLY - Run: npx ts-node turso/export-all-data-v2.ts');
  lines.push('');
  lines.push('export interface ScholarshipData {');
  lines.push('  id: string;');
  lines.push('  name: string;');
  lines.push('  provider: string;');
  lines.push('  description: string;');
  lines.push("  type: 'government' | 'private' | 'institutional' | 'international' | 'need-based' | 'merit-based' | 'sports' | 'hafiz-e-quran' | 'special';");
  lines.push("  coverageType: 'full' | 'partial' | 'tuition' | 'monthly-stipend' | 'one-time';");
  lines.push('  tuitionCoverage: number | null;');
  lines.push('  monthlyStipend: number | null;');
  lines.push('  otherBenefits: string[];');
  lines.push('  eligibility: string[];');
  lines.push('  requiredDocuments: string[];');
  lines.push('  applicationProcess: string[];');
  lines.push("  applicationMethod: 'online' | 'offline' | 'both' | 'university-portal' | 'hec-portal' | 'embassy';");
  lines.push('  website: string;');
  lines.push('  deadline: string | null;');
  lines.push("  status: 'open' | 'upcoming' | 'closed';");
  lines.push('  targetAudience: string[];');
  lines.push('  provinces: string[];');
  lines.push('}');
  lines.push('');
  lines.push('export const SCHOLARSHIPS: ScholarshipData[] = [');

  for (const r of records) {
    const eligibility = parseArray(r.eligibility);
    const howToApply = parseArray(r.how_to_apply);
    const universities = parseArray(r.applicable_universities);
    const coverageType = r.coverage_percentage && r.coverage_percentage >= 100 ? 'full' : 
                         r.monthly_stipend ? 'monthly-stipend' : 'partial';
    
    // Determine status based on deadline
    let status = 'upcoming';
    if (r.deadline) {
      const deadlineDate = new Date(r.deadline);
      const now = new Date();
      const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) status = 'closed';
      else if (diffDays <= 30) status = 'open';
      else status = 'upcoming';
    }
    
    lines.push('  {');
    lines.push('    id: ' + JSON.stringify(r.id || '') + ',');
    lines.push('    name: ' + JSON.stringify(r.name || '') + ',');
    lines.push('    provider: ' + JSON.stringify(r.provider || '') + ',');
    lines.push('    description: ' + JSON.stringify(r.description || '') + ',');
    lines.push('    type: ' + JSON.stringify(r.type || 'government') + " as ScholarshipData['type'],");
    lines.push("    coverageType: '" + coverageType + "' as ScholarshipData['coverageType'],");
    lines.push('    tuitionCoverage: ' + (r.coverage_percentage || 'null') + ',');
    lines.push('    monthlyStipend: ' + (r.monthly_stipend || 'null') + ',');
    lines.push('    otherBenefits: [],');
    lines.push('    eligibility: ' + JSON.stringify(eligibility) + ',');
    lines.push('    requiredDocuments: [],');
    lines.push('    applicationProcess: ' + JSON.stringify(howToApply) + ',');
    lines.push("    applicationMethod: 'online' as const,");
    lines.push('    website: ' + JSON.stringify(r.website || '') + ',');
    lines.push('    deadline: ' + (r.deadline ? JSON.stringify(r.deadline) : 'null') + ',');
    lines.push("    status: '" + status + "' as ScholarshipData['status'],");
    lines.push('    targetAudience: ' + JSON.stringify(universities.length > 0 ? universities : ['All students']) + ',');
    lines.push("    provinces: ['All'],");
    lines.push('  },');
  }

  lines.push('];');
  lines.push('');
  lines.push('export default SCHOLARSHIPS;');

  const outputPath = path.resolve(__dirname, '../src/data/scholarships.ts');
  fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8');
  console.log('   ✅ Exported to ' + outputPath);
  
  return records.length;
}

// ============================================================================
// DEADLINES EXPORT
// ============================================================================

async function exportDeadlines() {
  console.log('\n📤 Exporting deadlines...');

  const result = await client.execute(
    'SELECT * FROM deadlines ORDER BY application_deadline ASC'
  );

  const records = result.rows as any[];
  console.log('   Found ' + records.length + ' deadlines');

  const lines: string[] = [];
  lines.push('/**');
  lines.push(' * Admission Deadlines Data');
  lines.push(' * Auto-generated from Turso on ' + new Date().toISOString().split('T')[0]);
  lines.push(' * Contains deadline information for major Pakistani universities');
  lines.push(' * DO NOT EDIT MANUALLY - Run: npx ts-node turso/export-all-data-v2.ts');
  lines.push(' */');
  lines.push('');
  lines.push('export interface AdmissionDeadline {');
  lines.push('  id: string;');
  lines.push('  universityId: string;');
  lines.push('  universityName: string;');
  lines.push('  universityShortName: string;');
  lines.push("  programType: 'undergraduate' | 'graduate' | 'phd' | 'professional';");
  lines.push('  programCategory: string;');
  lines.push('  title: string;');
  lines.push('  description?: string;');
  lines.push('  applicationStartDate: string;');
  lines.push('  applicationDeadline: string;');
  lines.push('  entryTestDate?: string;');
  lines.push('  resultDate?: string;');
  lines.push('  classStartDate?: string;');
  lines.push('  fee?: number;');
  lines.push('  link?: string;');
  lines.push("  status: 'upcoming' | 'open' | 'closing-soon' | 'closed';");
  lines.push('  isHighlighted?: boolean;');
  lines.push('}');
  lines.push('');
  lines.push('export interface FollowedUniversity {');
  lines.push('  universityId: string;');
  lines.push('  followedAt: string;');
  lines.push('  notificationsEnabled: boolean;');
  lines.push('}');
  lines.push('');
  lines.push('export const ADMISSION_DEADLINES: AdmissionDeadline[] = [');

  for (const r of records) {
    lines.push('  {');
    lines.push('    id: ' + JSON.stringify(r.id || '') + ',');
    lines.push('    universityId: ' + JSON.stringify(r.university_id || '') + ',');
    lines.push('    universityName: ' + JSON.stringify(r.university_name || '') + ',');
    lines.push('    universityShortName: ' + JSON.stringify(r.university_short_name || '') + ',');
    lines.push('    programType: ' + JSON.stringify(r.program_type || 'undergraduate') + " as AdmissionDeadline['programType'],");
    lines.push('    programCategory: ' + JSON.stringify(r.program_category || 'general') + ',');
    lines.push('    title: ' + JSON.stringify(r.title || '') + ',');
    if (r.description) {
      lines.push('    description: ' + JSON.stringify(r.description) + ',');
    }
    lines.push('    applicationStartDate: ' + JSON.stringify(r.application_start_date || new Date().toISOString().split('T')[0]) + ',');
    lines.push('    applicationDeadline: ' + JSON.stringify(r.application_deadline || '') + ',');
    if (r.entry_test_date) {
      lines.push('    entryTestDate: ' + JSON.stringify(r.entry_test_date) + ',');
    }
    if (r.result_date) {
      lines.push('    resultDate: ' + JSON.stringify(r.result_date) + ',');
    }
    if (r.class_start_date) {
      lines.push('    classStartDate: ' + JSON.stringify(r.class_start_date) + ',');
    }
    if (r.fee) {
      lines.push('    fee: ' + r.fee + ',');
    }
    if (r.link) {
      lines.push('    link: ' + JSON.stringify(r.link) + ',');
    }
    lines.push('    status: ' + JSON.stringify(r.status || 'upcoming') + " as AdmissionDeadline['status'],");
    lines.push('  },');
  }

  lines.push('];');
  lines.push('');
  lines.push('export default ADMISSION_DEADLINES;');

  const outputPath = path.resolve(__dirname, '../src/data/deadlines.ts');
  fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8');
  console.log('   ✅ Exported to ' + outputPath);
  
  return records.length;
}

// ============================================================================
// MAIN
// ============================================================================

async function exportAll() {
  console.log('🚀 Exporting all Turso data to bundled files...\n');
  console.log('='.repeat(60));

  try {
    // Universities (already have a separate script)
    console.log('\n📤 Universities: Run export-to-bundled.ts separately');
    
    const meritCount = await exportMeritArchive();
    const scholarshipCount = await exportScholarships();
    const deadlineCount = await exportDeadlines();

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL EXPORTS COMPLETE');
    console.log('   Merit Records: ' + meritCount);
    console.log('   Scholarships: ' + scholarshipCount);
    console.log('   Deadlines: ' + deadlineCount);
    console.log('\n📱 Rebuild the app to see changes: npm run android');
  } catch (err) {
    console.error('❌ Export failed:', err);
    process.exit(1);
  }
}

exportAll().catch(err => {
  console.error(err);
  process.exit(1);
});
