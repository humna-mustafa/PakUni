require('dotenv').config();
const { createClient } = require('@libsql/client');

const c = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Update COMSATS logo URL
const newLogoUrl = 'https://www.comsats.edu.pk/assets/img/COMSATS-logo.png';

c.execute(
  'UPDATE universities SET logo_url = ? WHERE id = ?',
  [newLogoUrl, 'uni-comsats-university-islamabad']
)
  .then(r => {
    console.log('✅ COMSATS logo updated!');
    console.log('Updated rows:', r.rowsAffected);
    
    // Verify the update
    return c.execute('SELECT id, name, logo_url FROM universities WHERE id = ?', ['uni-comsats-university-islamabad']);
  })
  .then(r => {
    console.log('\nUpdated COMSATS entry:');
    r.rows.forEach(row => {
      console.log(`ID: ${row.id}`);
      console.log(`Name: ${row.name}`);
      console.log(`Logo URL: ${row.logo_url}`);
    });
  })
  .catch(err => console.error('Error:', err));
