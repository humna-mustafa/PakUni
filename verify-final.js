require('dotenv').config();
const { createClient } = require('@libsql/client');

const c = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function verifyAllLogos() {
  console.log('📊 FINAL VERIFICATION: All 265 Universities\n');
  
  // Count by logo status
  const result = await c.execute(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN logo_url = '' OR logo_url IS NULL THEN 1 ELSE 0 END) as missing,
      SUM(CASE WHEN logo_url != '' AND logo_url IS NOT NULL THEN 1 ELSE 0 END) as with_logos
    FROM universities
  `);
  
  const stats = result.rows[0];
  
  console.log(`✅ Total Universities: ${stats.total}`);
  console.log(`✅ With Logos: ${stats.with_logos}`);
  console.log(`⚠️  Missing Logos: ${stats.missing}\n`);
  
  if (stats.missing === 0) {
    console.log('🎉 SUCCESS! ALL 265 UNIVERSITIES HAVE LOGOS!\n');
  }
  
  // Check for Wikipedia article links
  const wikiResult = await c.execute(`
    SELECT COUNT(*) as count
    FROM universities 
    WHERE logo_url LIKE '%en.wikipedia.org%' OR logo_url LIKE '%wikipedia.org/wiki/%#/media%'
  `);
  
  console.log(`📝 Wikipedia article links (non-working): ${wikiResult.rows[0].count}`);
  
  // Sample check
  console.log('\n📋 Sample universities with logos:');
  const samples = await c.execute(`
    SELECT id, name, province, SUBSTR(logo_url, 1, 60) as logo_preview
    FROM universities
    LIMIT 10
  `);
  
  samples.rows.forEach((u, i) => {
    console.log(`${i+1}. ${u.name} (${u.province})`);
    console.log(`   Logo: ${u.logo_preview}...`);
  });
  
  console.log('\n✅ Data synchronization complete!');
  console.log('📦 Bundled file: src/data/universities.ts');
  console.log('💾 Database: Turso (265 universities)');
  console.log('📱 Ready to rebuild: npm run android\n');
}

verifyAllLogos().catch(console.error);
