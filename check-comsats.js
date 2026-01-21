require('dotenv').config();
const { createClient } = require('@libsql/client');

const c = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

c.execute('SELECT id, name, website, logo_url FROM universities WHERE name LIKE ? OR name LIKE ?', ['%COMSATS%', '%Comsats%'])
  .then(r => {
    console.log('COMSATS entries:\n');
    if (r.rows.length === 0) {
      console.log('No COMSATS found. Searching all universities...');
      return c.execute('SELECT id, name, website, logo_url FROM universities ORDER BY name');
    }
    r.rows.forEach(x => console.log(JSON.stringify(x, null, 2)));
  })
  .then(r => {
    if (r && r.rows) {
      console.log('\nFirst 10 universities:');
      r.rows.slice(0, 10).forEach(x => console.log(`${x.id}. ${x.name} - ${x.logo_url}`));
    }
  });
