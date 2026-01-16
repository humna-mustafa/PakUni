/**
 * Turso Admin CLI
 * Quick commands for managing PakUni static data
 * 
 * Usage:
 *   npx ts-node turso/admin.ts [command]
 * 
 * Commands:
 *   stats     - Show data statistics
 *   sync      - Full re-import from TypeScript files
 *   clear     - Clear all data
 *   query     - Run a SQL query
 */

import {createClient} from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({path: path.resolve(__dirname, '../.env')});

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

async function showStats() {
  console.log('\n📊 PakUni Turso Database Statistics');
  console.log('═'.repeat(50));
  
  const tables = [
    'universities', 'entry_tests', 'scholarships', 'deadlines',
    'programs', 'careers', 'merit_formulas', 'merit_archive'
  ];
  
  for (const table of tables) {
    try {
      const result = await client.execute(`SELECT COUNT(*) as count FROM ${table}`);
      const count = (result.rows[0] as any).count;
      console.log(`  ${table.padEnd(20)} ${count.toString().padStart(5)} records`);
    } catch (error) {
      console.log(`  ${table.padEnd(20)} ERROR`);
    }
  }
  
  // Show versions
  console.log('\n📅 Data Versions:');
  try {
    const versions = await client.execute('SELECT * FROM data_versions ORDER BY table_name');
    for (const row of versions.rows as any[]) {
      console.log(`  ${row.table_name}: v${row.version} (${row.record_count} records)`);
    }
  } catch (error) {
    console.log('  Could not fetch version info');
  }
  
  console.log('═'.repeat(50));
}

async function runQuery(sql: string) {
  console.log(`\n🔍 Running: ${sql}\n`);
  try {
    const result = await client.execute(sql);
    if (result.rows.length === 0) {
      console.log('No results');
    } else {
      console.table(result.rows);
    }
  } catch (error) {
    console.error('❌ Query error:', error);
  }
}

async function clearData() {
  console.log('\n⚠️  Clearing all data...');
  
  const tables = [
    'merit_archive', 'merit_formulas', 'deadlines', 
    'careers', 'programs', 'scholarships', 'entry_tests', 'universities'
  ];
  
  for (const table of tables) {
    try {
      await client.execute(`DELETE FROM ${table}`);
      console.log(`  ✓ Cleared ${table}`);
    } catch (error) {
      console.log(`  ✗ Failed to clear ${table}`);
    }
  }
  
  console.log('\n✅ All data cleared');
}

async function searchUniversities(query: string) {
  console.log(`\n🔍 Searching universities for: "${query}"\n`);
  
  const result = await client.execute({
    sql: `SELECT short_name, name, city, province, ranking_national 
          FROM universities 
          WHERE name LIKE ? OR short_name LIKE ? OR city LIKE ?
          ORDER BY ranking_national ASC NULLS LAST
          LIMIT 20`,
    args: [`%${query}%`, `%${query}%`, `%${query}%`]
  });
  
  if (result.rows.length === 0) {
    console.log('No universities found');
  } else {
    console.table(result.rows);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'stats';
  
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║              PakUni Turso Admin CLI                            ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  
  switch (command) {
    case 'stats':
      await showStats();
      break;
      
    case 'clear':
      if (args[1] === '--confirm') {
        await clearData();
      } else {
        console.log('\n⚠️  To clear data, run: npm run turso:admin clear --confirm');
      }
      break;
      
    case 'query':
    case 'sql':
      if (args[1]) {
        await runQuery(args.slice(1).join(' '));
      } else {
        console.log('Usage: npm run turso:admin query "SELECT * FROM universities LIMIT 5"');
      }
      break;
      
    case 'search':
      if (args[1]) {
        await searchUniversities(args[1]);
      } else {
        console.log('Usage: npm run turso:admin search NUST');
      }
      break;
      
    case 'help':
    default:
      console.log(`
Commands:
  stats              Show data statistics
  clear --confirm    Clear all data (requires confirmation)
  query "SQL"        Run a SQL query
  search "term"      Search universities
  
Examples:
  npm run turso:admin stats
  npm run turso:admin search "NUST"
  npm run turso:admin query "SELECT * FROM entry_tests"
      `);
  }
}

main().catch(console.error);
