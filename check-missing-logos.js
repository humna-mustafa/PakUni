require('dotenv').config();
const { createClient } = require('@libsql/client');

const c = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function findProblematicLogos() {
  console.log('🔍 Scanning for universities with missing/problematic logos...\n');
  
  // Get all universities with empty logo URLs
  const result = await c.execute(
    'SELECT id, name, city FROM universities WHERE logo_url = "" OR logo_url IS NULL ORDER BY id'
  );
  
  if (result.rows.length === 0) {
    console.log('✅ All universities have logo URLs assigned!');
    return;
  }
  
  console.log(`Found ${result.rows.length} universities with missing logos:\n`);
  result.rows.forEach((uni, i) => {
    console.log(`${i + 1}. ID ${uni.id}: ${uni.name} (${uni.city})`);
  });
  
  return result.rows;
}

findProblematicLogos().catch(console.error);
