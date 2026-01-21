/**
 * Quick verification script for university data
 */

import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function verify() {
  console.log('📊 UNIVERSITY DATA VERIFICATION\n');
  console.log('═'.repeat(50));
  
  // Total count
  const total = await client.execute('SELECT COUNT(*) as count FROM universities');
  console.log(`📍 Total universities: ${total.rows[0].count}`);
  
  // With website
  const withWebsite = await client.execute("SELECT COUNT(*) as count FROM universities WHERE website IS NOT NULL AND website != ''");
  console.log(`🌐 With website: ${withWebsite.rows[0].count}`);
  
  // By type
  const byType = await client.execute("SELECT type, COUNT(*) as count FROM universities GROUP BY type");
  console.log('\n📋 By Type:');
  byType.rows.forEach(r => console.log(`   ${r.type}: ${r.count}`));
  
  // By province
  const byProvince = await client.execute("SELECT province, COUNT(*) as count FROM universities GROUP BY province ORDER BY count DESC");
  console.log('\n🗺️  By Province:');
  byProvince.rows.forEach(r => console.log(`   ${r.province}: ${r.count}`));
  
  // Sample universities with websites
  const samples = await client.execute("SELECT name, short_name, website, logo_url, city, type FROM universities WHERE website IS NOT NULL AND website != '' LIMIT 5");
  console.log('\n🏛️  Sample Universities with Websites:');
  samples.rows.forEach(r => {
    console.log(`   • ${r.name} (${r.short_name})`);
    console.log(`     ${r.type} - ${r.city}`);
    console.log(`     Website: ${r.website}`);
    console.log(`     Logo URL: ${r.logo_url || '(none)'}`);
    console.log('');
  });
  
  // Check logo_url coverage
  const withLogo = await client.execute("SELECT COUNT(*) as count FROM universities WHERE logo_url IS NOT NULL AND logo_url != ''");
  console.log(`🖼️  With logo URL: ${withLogo.rows[0].count}`);
  
  // Check for any blank/invalid records
  const blanks = await client.execute("SELECT COUNT(*) as count FROM universities WHERE name IS NULL OR name = '' OR TRIM(name) = ''");
  console.log(`⚠️  Blank/Invalid records: ${blanks.rows[0].count}`);
  
  console.log('\n' + '═'.repeat(50));
  console.log('✅ Verification Complete!');
}

verify().catch(console.error);
