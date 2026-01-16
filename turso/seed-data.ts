/**
 * Turso Data Seeder
 * Migrates existing static data from TypeScript files to Turso database
 * 
 * Run this script with: npx ts-node turso/seed-data.ts
 */

import {createClient} from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({path: path.resolve(__dirname, '../.env')});

// Get Turso credentials from environment
const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  console.error('❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env');
  console.log('Please add:');
  console.log('TURSO_DATABASE_URL=libsql://pakuni-static-data-xxx.turso.io');
  console.log('TURSO_AUTH_TOKEN=your_token_here');
  process.exit(1);
}

const client = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

// Import data from source files
// Note: These imports are done dynamically to handle the TypeScript files

async function loadUniversitiesData() {
  // Read and parse universities.ts
  const filePath = path.resolve(__dirname, '../src/data/universities.ts');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract the UNIVERSITIES array using regex
  const match = content.match(/export const UNIVERSITIES[^=]*=\s*\[([\s\S]*?)\];[\s]*(?:export|\/\/|$)/);
  if (!match) {
    console.log('Could not find UNIVERSITIES export, trying alternate pattern...');
    return [];
  }
  
  // For now, we'll use eval carefully or manual parsing
  // This is a development script, not production code
  console.log('📊 Loading universities data...');
  return [];
}

// Generate insert SQL for universities
function generateUniversitySql(uni: any): string {
  const id = uni.short_name?.toLowerCase().replace(/\s+/g, '-') || 
             uni.name.toLowerCase().replace(/\s+/g, '-').substring(0, 20);
  
  return `INSERT OR REPLACE INTO universities (
    id, name, short_name, type, province, city, address, website, email, phone,
    established_year, ranking_hec, ranking_national, is_hec_recognized, logo_url,
    description, admission_url, campuses, status_notes, application_steps
  ) VALUES (
    '${escape(id)}',
    '${escape(uni.name)}',
    '${escape(uni.short_name || '')}',
    '${escape(uni.type || 'public')}',
    '${escape(uni.province || '')}',
    '${escape(uni.city || '')}',
    '${escape(uni.address || '')}',
    '${escape(uni.website || '')}',
    '${escape(uni.email || '')}',
    '${escape(uni.phone || '')}',
    ${uni.established_year || 'NULL'},
    ${uni.ranking_hec ? `'${escape(uni.ranking_hec)}'` : 'NULL'},
    ${uni.ranking_national || 'NULL'},
    ${uni.is_hec_recognized ? 1 : 0},
    '${escape(uni.logo_url || '')}',
    '${escape(uni.description || '')}',
    '${escape(uni.admission_url || '')}',
    '${JSON.stringify(uni.campuses || [])}',
    '${escape(uni.status_notes || '')}',
    '${JSON.stringify(uni.application_steps || [])}'
  );`;
}

function escape(str: string): string {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

async function runSchema() {
  console.log('🚀 Setting up Turso database schema...\n');
  
  const schemaPath = path.resolve(__dirname, './schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  
  // Split schema into individual statements
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  console.log(`📝 Executing ${statements.length} schema statements...`);
  
  for (const statement of statements) {
    try {
      await client.execute(statement);
      process.stdout.write('.');
    } catch (error: any) {
      // Ignore "already exists" errors
      if (!error.message?.includes('already exists')) {
        console.error(`\n❌ Error: ${error.message}`);
        console.error(`Statement: ${statement.substring(0, 100)}...`);
      }
    }
  }
  
  console.log('\n✅ Schema created successfully!\n');
}

async function seedSampleData() {
  console.log('📦 Seeding sample data...\n');
  
  // Sample universities
  const universities = [
    {
      id: 'nust',
      name: 'National University of Sciences and Technology',
      short_name: 'NUST',
      type: 'public',
      province: 'islamabad',
      city: 'Islamabad',
      established_year: 1991,
      ranking_hec: 'W4',
      ranking_national: 1,
      is_hec_recognized: true,
      website: 'https://nust.edu.pk',
      description: 'Top engineering and technology university in Pakistan',
      admission_url: 'https://nust.edu.pk/admissions/',
      campuses: JSON.stringify(['Islamabad', 'Rawalpindi', 'Karachi', 'Quetta']),
      status_notes: 'NET Registration Open',
      application_steps: JSON.stringify([
        'Register on NUST admission portal',
        'Pay NET fee via designated banks',
        'Select NET test date',
        'Appear in NET',
        'Apply to desired programs based on NET score'
      ])
    },
    {
      id: 'lums',
      name: 'Lahore University of Management Sciences',
      short_name: 'LUMS',
      type: 'private',
      province: 'punjab',
      city: 'Lahore',
      established_year: 1985,
      ranking_hec: 'W4',
      ranking_national: 2,
      is_hec_recognized: true,
      website: 'https://lums.edu.pk',
      description: 'Premier private research university known for business and economics',
      admission_url: 'https://admissions.lums.edu.pk/',
      campuses: JSON.stringify(['Lahore']),
      status_notes: 'Fall 2026 Applications Opening Soon',
      application_steps: JSON.stringify([
        'Create account on LUMS admission portal',
        'Submit online application with documents',
        'Pay application fee',
        'Submit SAT/LCAT scores',
        'Attend interview if shortlisted'
      ])
    },
    {
      id: 'giki',
      name: 'Ghulam Ishaq Khan Institute',
      short_name: 'GIKI',
      type: 'private',
      province: 'kpk',
      city: 'Topi',
      established_year: 1993,
      ranking_hec: 'W4',
      ranking_national: 3,
      is_hec_recognized: true,
      website: 'https://giki.edu.pk',
      description: 'Top private engineering institute with residential campus',
      admission_url: 'https://giki.edu.pk/admissions/',
      campuses: JSON.stringify(['Topi']),
      status_notes: 'GIKI Test Registration Expected April 2026'
    },
    {
      id: 'pu',
      name: 'University of the Punjab',
      short_name: 'PU',
      type: 'public',
      province: 'punjab',
      city: 'Lahore',
      established_year: 1882,
      ranking_hec: 'W4',
      ranking_national: 5,
      is_hec_recognized: true,
      website: 'https://pu.edu.pk',
      description: 'Oldest and largest public university in Pakistan'
    },
    {
      id: 'uet-lahore',
      name: 'University of Engineering and Technology Lahore',
      short_name: 'UET Lahore',
      type: 'public',
      province: 'punjab',
      city: 'Lahore',
      established_year: 1961,
      ranking_hec: 'W4',
      ranking_national: 4,
      is_hec_recognized: true,
      website: 'https://uet.edu.pk',
      description: 'Premier public engineering university in Punjab'
    }
  ];
  
  for (const uni of universities) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO universities (
        id, name, short_name, type, province, city, established_year,
        ranking_hec, ranking_national, is_hec_recognized, website,
        description, admission_url, campuses, status_notes, application_steps
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        uni.id, uni.name, uni.short_name, uni.type, uni.province, uni.city,
        uni.established_year, uni.ranking_hec, uni.ranking_national,
        uni.is_hec_recognized ? 1 : 0, uni.website, uni.description || null,
        uni.admission_url || null, uni.campuses || null,
        uni.status_notes || null, uni.application_steps || null
      ]
    });
    console.log(`  ✓ Added university: ${uni.short_name}`);
  }
  
  // Sample entry tests
  const entryTests = [
    {
      id: 'mdcat-2026',
      name: 'MDCAT',
      full_name: 'Medical & Dental College Admission Test',
      conducting_body: 'PMC (Pakistan Medical Commission)',
      description: 'National level entrance test for medical and dental colleges',
      applicable_for: JSON.stringify(['MBBS', 'BDS']),
      registration_start: '2026-06-01',
      registration_deadline: '2026-07-31',
      test_date: '2026-08-25',
      result_date: '2026-09-15',
      website: 'https://www.pmc.gov.pk',
      fee: 5500,
      eligibility: JSON.stringify([
        'FSc Pre-Medical with 60%+',
        'A-Levels with Biology, Chemistry, Physics/Math',
        'Pakistani national or dual national'
      ]),
      tips: JSON.stringify([
        'Focus on Biology - highest weightage',
        'Practice PMC past papers',
        'Time management is crucial'
      ]),
      provinces: JSON.stringify(['All Pakistan'])
    },
    {
      id: 'net-2026',
      name: 'NET',
      full_name: 'NUST Entry Test',
      conducting_body: 'National University of Sciences and Technology',
      description: 'Computer-based test for NUST undergraduate admissions',
      applicable_for: JSON.stringify(['Engineering', 'Computer Science', 'Business', 'Medical']),
      registration_start: '2026-01-15',
      registration_deadline: '2026-06-30',
      test_date: '2026-02-01',
      result_date: '2026-07-10',
      website: 'https://nust.edu.pk/admissions/',
      fee: 3500,
      eligibility: JSON.stringify([
        'FSc/A-Levels with relevant subjects',
        'Minimum 60% in Matric',
        'Age limit: 22 years for engineering'
      ]),
      tips: JSON.stringify([
        'Multiple attempts allowed - best score counts',
        'Computer-based test - practice on screen',
        'Strong math foundation essential'
      ]),
      provinces: JSON.stringify(['All Pakistan'])
    },
    {
      id: 'ecat-2026',
      name: 'ECAT',
      full_name: 'Engineering College Admission Test',
      conducting_body: 'UET Lahore',
      description: 'Entry test for engineering universities in Punjab',
      applicable_for: JSON.stringify(['Engineering', 'Technology']),
      registration_start: '2026-05-01',
      registration_deadline: '2026-06-15',
      test_date: '2026-07-01',
      result_date: '2026-07-20',
      website: 'https://uet.edu.pk/admissions/',
      fee: 3000,
      eligibility: JSON.stringify([
        'FSc Pre-Engineering with 60%+',
        'DAE with 60%+'
      ]),
      provinces: JSON.stringify(['Punjab'])
    }
  ];
  
  for (const test of entryTests) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO entry_tests (
        id, name, full_name, conducting_body, description, applicable_for,
        registration_start, registration_deadline, test_date, result_date,
        website, fee, eligibility, tips, provinces
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        test.id, test.name, test.full_name, test.conducting_body, test.description,
        test.applicable_for, test.registration_start, test.registration_deadline,
        test.test_date, test.result_date, test.website, test.fee,
        test.eligibility, test.tips || null, test.provinces
      ]
    });
    console.log(`  ✓ Added entry test: ${test.name}`);
  }
  
  // Sample scholarships
  const scholarships = [
    {
      id: 'hec-need-based',
      name: 'HEC Need-Based Scholarship',
      provider: 'Higher Education Commission',
      type: 'need_based',
      coverage_percentage: 100,
      monthly_stipend: 10000,
      description: 'Full scholarship for financially deserving students',
      eligibility: JSON.stringify([
        'Pakistani national',
        'Family income < 45,000/month',
        'Minimum 60% in last exam',
        'Enrolled in HEC recognized university'
      ]),
      deadline: '2026-03-31',
      website: 'https://hec.gov.pk/scholarships'
    },
    {
      id: 'pm-laptop',
      name: 'PM Laptop Scheme',
      provider: 'Government of Pakistan',
      type: 'government',
      coverage_percentage: 0,
      description: 'Free laptops for high achieving students',
      eligibility: JSON.stringify([
        '60%+ in graduation',
        'Pakistani national',
        'Enrolled in HEC recognized university'
      ]),
      website: 'https://pmnls.hec.gov.pk'
    },
    {
      id: 'ehsaas-scholarship',
      name: 'Ehsaas Undergraduate Scholarship',
      provider: 'Government of Pakistan',
      type: 'need_based',
      coverage_percentage: 100,
      monthly_stipend: 4000,
      description: 'Full tuition fee waiver for deserving students',
      eligibility: JSON.stringify([
        'Family income < 45,000/month',
        'Admission in undergraduate program',
        'Pakistani national'
      ]),
      deadline: '2026-02-28',
      website: 'https://ehsaas.nadra.gov.pk'
    }
  ];
  
  for (const sch of scholarships) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO scholarships (
        id, name, provider, type, coverage_percentage, monthly_stipend,
        description, eligibility, deadline, website
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        sch.id, sch.name, sch.provider, sch.type, sch.coverage_percentage,
        sch.monthly_stipend || null, sch.description, sch.eligibility,
        sch.deadline || null, sch.website || null
      ]
    });
    console.log(`  ✓ Added scholarship: ${sch.name}`);
  }
  
  // Update data versions
  await client.execute(`
    UPDATE data_versions SET 
      version = version + 1, 
      last_updated = datetime('now'),
      record_count = (SELECT COUNT(*) FROM universities)
    WHERE table_name = 'universities'
  `);
  
  await client.execute(`
    UPDATE data_versions SET 
      version = version + 1, 
      last_updated = datetime('now'),
      record_count = (SELECT COUNT(*) FROM entry_tests)
    WHERE table_name = 'entry_tests'
  `);
  
  await client.execute(`
    UPDATE data_versions SET 
      version = version + 1, 
      last_updated = datetime('now'),
      record_count = (SELECT COUNT(*) FROM scholarships)
    WHERE table_name = 'scholarships'
  `);
  
  console.log('\n✅ Sample data seeded successfully!');
}

async function verifyData() {
  console.log('\n📊 Verifying data...\n');
  
  const tables = ['universities', 'entry_tests', 'scholarships', 'deadlines', 'programs', 'careers'];
  
  for (const table of tables) {
    const result = await client.execute(`SELECT COUNT(*) as count FROM ${table}`);
    const count = (result.rows[0] as any).count;
    console.log(`  ${table}: ${count} records`);
  }
  
  // Show data versions
  console.log('\n📅 Data versions:');
  const versions = await client.execute('SELECT * FROM data_versions');
  for (const row of versions.rows as any[]) {
    console.log(`  ${row.table_name}: v${row.version} (${row.record_count} records, updated: ${row.last_updated})`);
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           PakUni Turso Database Setup & Seeder              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log(`🔗 Database: ${TURSO_DATABASE_URL}\n`);
  
  try {
    // Test connection
    await client.execute('SELECT 1');
    console.log('✅ Connected to Turso successfully!\n');
    
    // Run schema
    await runSchema();
    
    // Seed sample data
    await seedSampleData();
    
    // Verify
    await verifyData();
    
    console.log('\n🎉 Turso database setup complete!');
    console.log('\nNext steps:');
    console.log('1. Run the full data import: npm run turso:import-all');
    console.log('2. Update .env with TURSO credentials');
    console.log('3. Test the app with hybrid database');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
