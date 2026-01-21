require('dotenv').config();
const { createClient } = require('@libsql/client');

const c = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function check() {
  // Check COMSATS entry
  const comsats = await c.execute(`
    SELECT id, name, logo_url FROM universities WHERE name LIKE '%COMSATS%'
  `);
  console.log('COMSATS in database:');
  console.log(JSON.stringify(comsats.rows, null, 2));
  
  // Check ID 5 (COMSATS should be here per logo file)
  const id5 = await c.execute(`SELECT id, name, logo_url FROM universities WHERE id = 5`);
  console.log('\nID 5 in database:');
  console.log(JSON.stringify(id5.rows, null, 2));
  
  // Check ID 30 (what the bundled file says COMSATS has)
  const id30 = await c.execute(`SELECT id, name, logo_url FROM universities WHERE id = 30`);
  console.log('\nID 30 in database:');
  console.log(JSON.stringify(id30.rows, null, 2));
}

check().catch(console.error);
