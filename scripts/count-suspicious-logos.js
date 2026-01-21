require('dotenv').config();
const {createClient} = require('@libsql/client');
const c = createClient({url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN});
(async () => {
  const res = await c.execute(`SELECT id, name, logo_url FROM universities WHERE logo_url IS NULL OR logo_url = '' OR logo_url LIKE '%encrypted-tbn0.%' OR logo_url LIKE 'data:%' OR logo_url LIKE '%gstatic%'`);
  console.log('Remaining count:', res.rows.length);
  res.rows.forEach(r => console.log(` - ${r.id}: ${r.name} -> ${r.logo_url}`));
})();