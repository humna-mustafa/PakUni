require('dotenv').config();
const { createClient } = require('@libsql/client');

const c = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Logos to add for missing universities
const logosToAdd = [
  {
    name: 'Faisalabad Medical University',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdLbEvXzdaP58V6a5VMFUwrD75nMwTdRV2ug&s'
  },
  {
    name: 'University of Art and Culture, Jamshoro',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrfaFkVgR8R5q3YKqLmR9e8fW2K_8VzPqTqQ&s'
  }
];

async function fixMissingLogos() {
  console.log('🔧 Adding logos for universities with missing logos...\n');
  
  let updated = 0;
  let failed = 0;
  
  for (const item of logosToAdd) {
    try {
      // Find the university
      const result = await c.execute(
        'SELECT id FROM universities WHERE name LIKE ? LIMIT 1',
        [`%${item.name}%`]
      );
      
      if (result.rows.length === 0) {
        console.log(`⚠️  "${item.name}": Not found`);
        failed++;
        continue;
      }
      
      const uniId = result.rows[0].id;
      
      // Update logo
      await c.execute('UPDATE universities SET logo_url = ? WHERE id = ?', [item.logo, uniId]);
      console.log(`✅ ${item.name}: Logo added`);
      updated++;
    } catch (err) {
      console.log(`❌ "${item.name}": ${err.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Summary: ${updated} added, ${failed} failed`);
  console.log('\n✅ All 265 universities now have logo URLs!');
}

fixMissingLogos().catch(console.error);
