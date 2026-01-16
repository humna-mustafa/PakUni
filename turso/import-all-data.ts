/**
 * Turso Full Data Import
 * Imports all static data from existing TypeScript files to Turso
 * 
 * Run: npx ts-node turso/import-all-data.ts
 */

import {createClient, Client} from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({path: path.resolve(__dirname, '../.env')});

// Import data from source files
import {UNIVERSITIES} from '../src/data/universities';
import {ENTRY_TESTS_DATA} from '../src/data/entryTests';
import {SCHOLARSHIPS} from '../src/data/scholarships';
import {ADMISSION_DEADLINES} from '../src/data/deadlines';
import {PROGRAMS} from '../src/data/programs';
import {CAREER_PATHS} from '../src/data/careers';
import {MERIT_FORMULAS} from '../src/data/meritFormulas';
import {MERIT_RECORDS} from '../src/data/meritArchive';

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  console.error('❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  process.exit(1);
}

const client = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

// Helper to generate unique IDs
function generateId(name: string, prefix: string = ''): string {
  const slug = name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 30);
  return prefix ? `${prefix}-${slug}` : slug;
}

// Helper to safely stringify JSON
function safeJson(value: any): string | null {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return JSON.stringify(value);
}

async function importUniversities() {
  console.log('\n📚 Importing universities...');
  let count = 0;
  
  for (const uni of UNIVERSITIES) {
    try {
      const id = generateId(uni.short_name || uni.name, 'uni');
      
      await client.execute({
        sql: `INSERT OR REPLACE INTO universities (
          id, name, short_name, type, province, city, address, website, email, phone,
          established_year, ranking_hec, ranking_national, is_hec_recognized, logo_url,
          description, admission_url, campuses, status_notes, application_steps
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          uni.name,
          uni.short_name || '',
          uni.type || 'public',
          uni.province || '',
          uni.city || '',
          uni.address || null,
          uni.website || null,
          uni.email || null,
          uni.phone || null,
          uni.established_year || null,
          uni.ranking_hec || null,
          uni.ranking_national || null,
          uni.is_hec_recognized ? 1 : 0,
          uni.logo_url || null,
          uni.description || null,
          uni.admission_url || null,
          safeJson(uni.campuses),
          (uni as any).status_notes || null,
          safeJson((uni as any).application_steps),
        ]
      });
      count++;
      if (count % 10 === 0) process.stdout.write('.');
    } catch (error) {
      console.error(`\n  ❌ Error importing ${uni.name}:`, error);
    }
  }
  
  console.log(`\n  ✅ Imported ${count} universities`);
  return count;
}

async function importEntryTests() {
  console.log('\n📝 Importing entry tests...');
  let count = 0;
  
  for (const test of ENTRY_TESTS_DATA) {
    try {
      await client.execute({
        sql: `INSERT OR REPLACE INTO entry_tests (
          id, name, full_name, conducting_body, description, applicable_for,
          registration_start, registration_deadline, test_date, result_date,
          website, fee, eligibility, test_format, tips, provinces, status_notes,
          brand_colors, application_steps
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          test.id,
          test.name,
          test.full_name,
          test.conducting_body,
          test.description || null,
          safeJson(test.applicable_for),
          test.registration_start || null,
          test.registration_deadline,
          test.test_date,
          test.result_date || null,
          test.website || null,
          test.fee || 0,
          safeJson(test.eligibility),
          safeJson(test.test_format),
          safeJson(test.tips),
          safeJson(test.provinces),
          test.status_notes || null,
          safeJson(test.brand_colors),
          safeJson((test as any).application_steps),
        ]
      });
      count++;
    } catch (error) {
      console.error(`\n  ❌ Error importing ${test.name}:`, error);
    }
  }
  
  console.log(`  ✅ Imported ${count} entry tests`);
  return count;
}

async function importScholarships() {
  console.log('\n🎓 Importing scholarships...');
  let count = 0;
  
  for (const sch of SCHOLARSHIPS) {
    try {
      await client.execute({
        sql: `INSERT OR REPLACE INTO scholarships (
          id, name, provider, type, coverage_percentage, monthly_stipend,
          description, eligibility, deadline, website, how_to_apply, applicable_universities
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          sch.id,
          sch.name,
          sch.provider || 'Unknown',
          sch.type || 'merit_based',
          sch.coverage_percentage || 0,
          sch.monthly_stipend || null,
          sch.description || null,
          safeJson(sch.eligibility),
          sch.application_deadline || null,
          sch.website || null,
          safeJson(sch.application_steps),
          safeJson(sch.available_at),
        ]
      });
      count++;
    } catch (error) {
      console.error(`\n  ❌ Error importing ${sch.name}:`, error);
    }
  }
  
  console.log(`  ✅ Imported ${count} scholarships`);
  return count;
}

async function importDeadlines() {
  console.log('\n📅 Importing deadlines...');
  let count = 0;
  
  for (const deadline of ADMISSION_DEADLINES) {
    try {
      await client.execute({
        sql: `INSERT OR REPLACE INTO deadlines (
          id, university_id, university_name, university_short_name, program_type,
          program_category, title, description, application_start_date, application_deadline,
          entry_test_date, result_date, class_start_date, fee, link, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          deadline.id,
          generateId(deadline.universityShortName, 'uni'),
          deadline.universityName,
          deadline.universityShortName,
          deadline.programType || 'undergraduate',
          deadline.programCategory || null,
          deadline.title,
          deadline.description || null,
          deadline.applicationStartDate || null,
          deadline.applicationDeadline,
          deadline.entryTestDate || null,
          deadline.resultDate || null,
          deadline.classStartDate || null,
          deadline.fee || null,
          deadline.link || null,
          deadline.status || 'upcoming',
        ]
      });
      count++;
    } catch (error) {
      console.error(`\n  ❌ Error importing deadline ${deadline.id}:`, error);
    }
  }
  
  console.log(`  ✅ Imported ${count} deadlines`);
  return count;
}

async function importPrograms() {
  console.log('\n📖 Importing programs...');
  let count = 0;
  
  for (const program of PROGRAMS) {
    try {
      await client.execute({
        sql: `INSERT OR REPLACE INTO programs (
          id, name, short_name, field, duration_years, degree_type,
          description, eligibility, career_paths, entry_tests
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          program.id,
          program.name,
          program.degree_title || null,
          program.field || 'general',
          program.duration_years || 4,
          program.level || 'bachelor',
          program.eligibility || null,
          safeJson(program.required_subjects),
          safeJson(program.career_prospects),
          program.entry_test ? JSON.stringify([program.entry_test]) : null,
        ]
      });
      count++;
    } catch (error) {
      console.error(`\n  ❌ Error importing ${program.name}:`, error);
    }
  }
  
  console.log(`  ✅ Imported ${count} programs`);
  return count;
}

async function importCareers() {
  console.log('\n💼 Importing careers...');
  let count = 0;
  
  // Import career fields (they serve as careers)
  const {CAREER_FIELDS} = await import('../src/data/careers');
  
  for (const career of CAREER_FIELDS) {
    try {
      await client.execute({
        sql: `INSERT OR REPLACE INTO careers (
          id, name, field, description, salary_range_min, salary_range_max,
          demand_level, growth_potential, required_education, skills_required, job_titles
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          career.id,
          career.name,
          career.id, // field is same as id
          career.description || null,
          career.average_starting_salary || null,
          career.average_senior_salary || null,
          career.scope_pakistan === 'excellent' ? 'high' : career.scope_pakistan === 'good' ? 'medium' : 'low',
          career.demand_trend === 'rising' ? 'excellent' : career.demand_trend === 'stable' ? 'good' : 'limited',
          safeJson(career.required_education),
          safeJson(career.key_skills),
          safeJson(career.job_titles),
        ]
      });
      count++;
    } catch (error) {
      console.error(`\n  ❌ Error importing ${career.name}:`, error);
    }
  }
  
  console.log(`  ✅ Imported ${count} careers`);
  return count;
}

async function importMeritFormulas() {
  console.log('\n📊 Importing merit formulas...');
  let count = 0;
  
  for (const formula of MERIT_FORMULAS) {
    try {
      await client.execute({
        sql: `INSERT OR REPLACE INTO merit_formulas (
          id, university_id, university_name, program_category,
          matric_weight, inter_weight, entry_test_weight, hafiz_bonus, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          formula.id,
          generateId(formula.university, 'uni'),
          formula.university,
          formula.applicable_fields?.join(', ') || 'general',
          formula.matric_weightage || 0,
          formula.inter_weightage || 0,
          formula.entry_test_weightage || 0,
          formula.hafiz_bonus || 0,
          formula.description || null,
        ]
      });
      count++;
    } catch (error) {
      console.error(`\n  ❌ Error importing formula:`, error);
    }
  }
  
  console.log(`  ✅ Imported ${count} merit formulas`);
  return count;
}

async function importMeritArchive() {
  console.log('\n📜 Importing merit archive...');
  let count = 0;
  
  for (const record of MERIT_RECORDS) {
    try {
      await client.execute({
        sql: `INSERT OR REPLACE INTO merit_archive (
          id, university_id, university_name, program_name, year, round,
          merit_percentage, closing_merit, seats_available, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          record.id,
          record.universityId,
          record.universityName,
          record.programName,
          record.year,
          1, // default round
          record.closingMerit,
          record.openingMerit || null,
          record.totalSeats || null,
          `${record.session} ${record.year} - ${record.meritType}`,
        ]
      });
      count++;
      if (count % 50 === 0) process.stdout.write('.');
    } catch (error) {
      console.error(`\n  ❌ Error importing merit record:`, error);
    }
  }
  
  console.log(`\n  ✅ Imported ${count} merit archive records`);
  return count;
}

async function updateVersions(counts: Record<string, number>) {
  console.log('\n📊 Updating version info...');
  
  for (const [table, count] of Object.entries(counts)) {
    await client.execute({
      sql: `UPDATE data_versions SET 
        version = version + 1, 
        last_updated = datetime('now'),
        record_count = ?
      WHERE table_name = ?`,
      args: [count, table]
    });
  }
}

async function verifyImport() {
  console.log('\n📊 Verification Summary:');
  console.log('═'.repeat(50));
  
  const tables = ['universities', 'entry_tests', 'scholarships', 'deadlines', 'programs', 'careers', 'merit_formulas', 'merit_archive'];
  
  for (const table of tables) {
    const result = await client.execute(`SELECT COUNT(*) as count FROM ${table}`);
    const count = (result.rows[0] as any).count;
    console.log(`  ${table.padEnd(20)} ${count.toString().padStart(5)} records`);
  }
  
  console.log('═'.repeat(50));
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║         PakUni - Full Data Import to Turso                     ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  
  try {
    // Test connection
    await client.execute('SELECT 1');
    console.log('\n✅ Connected to Turso');
    
    const counts: Record<string, number> = {};
    
    // Import all data
    counts.universities = await importUniversities();
    counts.entry_tests = await importEntryTests();
    counts.scholarships = await importScholarships();
    counts.deadlines = await importDeadlines();
    counts.programs = await importPrograms();
    counts.careers = await importCareers();
    counts.merit_formulas = await importMeritFormulas();
    counts.merit_archive = await importMeritArchive();
    
    // Update versions
    await updateVersions(counts);
    
    // Verify
    await verifyImport();
    
    console.log('\n🎉 Full data import complete!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

main();
