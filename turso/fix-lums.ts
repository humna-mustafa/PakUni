/**
 * Fix LUMS logo URL directly
 */

import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function fix() {
  // Check what IDs exist for LUMS
  console.log('Looking for LUMS records...\n');
  const lums = await client.execute("SELECT id, name, logo_url FROM universities WHERE name LIKE '%Lahore University of Management%' OR name LIKE '%LUMS%'");
  lums.rows.forEach(r => {
    console.log(`ID: ${r.id}`);
    console.log(`Name: ${r.name}`);
    console.log(`Logo: ${r.logo_url}`);
    console.log('');
  });

  // Generate ID the same way as import script
  const name = 'Lahore University of Management Sciences';
  const expectedId = `uni-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`.substring(0, 50);
  console.log('Expected ID from import script:', expectedId);

  // Fix the logo URL directly
  const newLogoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/l/la/Lahore_University_of_Management_Sciences_Logo.svg/200px-Lahore_University_of_Management_Sciences_Logo.svg.png';
  
  console.log('\nUpdating all LUMS records...');
  const result = await client.execute({
    sql: "UPDATE universities SET logo_url = ? WHERE name LIKE '%Lahore University of Management%'",
    args: [newLogoUrl]
  });
  console.log('Rows updated:', result.rowsAffected);
  
  // Verify
  console.log('\nVerifying...');
  const verify = await client.execute("SELECT name, logo_url FROM universities WHERE name LIKE '%Lahore University of Management%'");
  verify.rows.forEach(r => {
    console.log(`${r.name}:`);
    console.log(`  ${r.logo_url}`);
  });
}

fix();
