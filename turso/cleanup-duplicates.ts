/**
 * Clean up duplicate university records
 * Caused by ID truncation inconsistency between old and new import scripts
 */

import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function cleanupDuplicates() {
  console.log('🔍 Finding duplicate universities by name...\n');
  
  // Find universities with same name but different IDs
  const duplicates = await client.execute(`
    SELECT name, COUNT(*) as count 
    FROM universities 
    GROUP BY name 
    HAVING COUNT(*) > 1
    ORDER BY count DESC
  `);
  
  if (duplicates.rows.length === 0) {
    console.log('✅ No duplicates found!');
    return;
  }
  
  console.log(`Found ${duplicates.rows.length} names with duplicates:\n`);
  
  for (const row of duplicates.rows) {
    console.log(`📋 "${row.name}" (${row.count} records)`);
    
    // Get all records for this name
    const records = await client.execute({
      sql: 'SELECT id, name, logo_url, updated_at FROM universities WHERE name = ? ORDER BY LENGTH(id) DESC',
      args: [row.name]
    });
    
    // Keep the one with the longest ID (more correct), delete others
    const keep = records.rows[0];
    const deleteIds = records.rows.slice(1).map(r => r.id);
    
    console.log(`   Keeping: ${keep.id}`);
    console.log(`   Deleting: ${deleteIds.join(', ')}`);
    
    for (const deleteId of deleteIds) {
      await client.execute({
        sql: 'DELETE FROM universities WHERE id = ?',
        args: [deleteId]
      });
    }
    console.log('');
  }
  
  // Final count
  const finalResult = await client.execute('SELECT COUNT(*) as count FROM universities');
  console.log(`\n✅ Cleanup complete! Total universities: ${finalResult.rows[0].count}`);
}

cleanupDuplicates().catch(console.error);
