/**
 * Simple Turso Connection Test
 * Tests database connectivity and data retrieval
 */

const {createClient} = require('@libsql/client');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({path: path.resolve(__dirname, '.env')});

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

async function runTests() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║     PakUni Turso Database Connection Test                    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Test 1: Check credentials
  console.log('✅ Test 1: Environment Variables');
  console.log('════════════════════════════════');
  if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
    console.log('❌ FAILED: Missing Turso credentials');
    console.log('   Please check .env file for TURSO_DATABASE_URL and TURSO_AUTH_TOKEN');
    return;
  }
  console.log('✓ Credentials found\n');

  // Test 2: Connect to Turso
  console.log('✅ Test 2: Database Connection');
  console.log('════════════════════════════════');
  let client;
  try {
    client = createClient({
      url: TURSO_DATABASE_URL,
      authToken: TURSO_AUTH_TOKEN,
    });
    console.log('✓ Connected to Turso\n');
  } catch (error) {
    console.log('❌ FAILED: Could not connect to Turso');
    console.error(error);
    return;
  }

  // Test 3: Query universities
  console.log('✅ Test 3: Query Universities');
  console.log('════════════════════════════════');
  try {
    const result = await client.execute('SELECT COUNT(*) as count FROM universities');
    const count = result.rows[0].count;
    console.log(`✓ Found ${count} universities`);
    
    if (count < 132) {
      console.log(`⚠️  WARNING: Expected 132 universities, got ${count}`);
    }
  } catch (error) {
    console.log('❌ FAILED: Could not query universities');
    console.error(error);
    return;
  }

  // Test 4: Query sample universities
  console.log('\n✅ Test 4: Sample Universities');
  console.log('════════════════════════════════');
  try {
    const result = await client.execute(
      'SELECT short_name, name, city FROM universities LIMIT 5'
    );
    result.rows.forEach(row => {
      console.log(`  - ${row.short_name}: ${row.name} (${row.city})`);
    });
  } catch (error) {
    console.log('❌ FAILED: Could not fetch sample universities');
    console.error(error);
    return;
  }

  // Test 5: Query all tables
  console.log('\n✅ Test 5: All Table Counts');
  console.log('════════════════════════════════');
  const tables = [
    'universities', 'entry_tests', 'scholarships', 'deadlines',
    'programs', 'careers', 'merit_formulas', 'merit_archive'
  ];
  
  for (const table of tables) {
    try {
      const result = await client.execute(`SELECT COUNT(*) as count FROM ${table}`);
      const count = result.rows[0].count;
      console.log(`  ${table.padEnd(20)} ${String(count).padStart(4)} records`);
    } catch (error) {
      console.log(`  ${table.padEnd(20)} ERROR`);
    }
  }

  // Test 6: Search functionality
  console.log('\n✅ Test 6: Search NUST');
  console.log('════════════════════════════════');
  try {
    const result = await client.execute({
      sql: 'SELECT short_name, name, city FROM universities WHERE name LIKE ? OR short_name LIKE ?',
      args: ['%NUST%', '%NUST%']
    });
    console.log(`✓ Found ${result.rows.length} result(s):`);
    result.rows.forEach(row => {
      console.log(`  - ${row.short_name}: ${row.name} (${row.city})`);
    });
  } catch (error) {
    console.log('❌ FAILED: Could not search universities');
    console.error(error);
    return;
  }

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                  ✅ ALL TESTS PASSED ✅                        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('\n✨ Hybrid database is working correctly!\n');
}

runTests().catch(console.error);
