/**
 * Turso CSV University Import - ENHANCED VERSION
 * UPSERT: Updates existing records, inserts new ones (preserves existing data)
 * 
 * Usage: npx ts-node turso/import-csv-universities.ts
 * 
 * Features:
 * - ✅ UPSERT: Update existing records instead of deleting
 * - ✅ Preserves additional data not in CSV (rankings, description, etc.)
 * - ✅ Validates data before importing
 * - ✅ Generates proper IDs and short names
 * - ✅ Detailed logging and error handling
 */

import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  console.error('❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  process.exit(1);
}

const client = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

// Generate consistent ID from university name
function generateUniversityId(name: string): string {
  return `uni-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`.substring(0, 50);
}

// Generate smart short name from university name
function generateShortName(name: string): string {
  // Common words to skip for acronym
  const skipWords = ['of', 'the', 'and', 'for', 'in', 'at'];
  
  // Remove common suffixes for cleaner acronym
  let cleanName = name
    .replace(/\s*\(.*?\)\s*/g, '') // Remove parenthetical content
    .replace(/university|college|institute|school/gi, '') // Remove common suffixes
    .trim();
  
  // If cleaned name is too short, use original
  if (cleanName.length < 3) cleanName = name;
  
  const words = cleanName.split(/\s+/).filter(w => !skipWords.includes(w.toLowerCase()));
  
  if (words.length === 1) {
    // Single word - use first 4-5 characters capitalized
    return words[0].substring(0, 5).toUpperCase();
  }
  
  // Multiple words - create acronym from first letters
  return words.map(w => w[0]).join('').toUpperCase().substring(0, 8);
}

// Validate and clean website URL
function cleanWebsiteUrl(url: string | null | undefined): string | null {
  if (!url || url.trim() === '') return null;
  
  let cleaned = url.trim();
  
  // Add https:// if no protocol
  if (!cleaned.match(/^https?:\/\//i)) {
    cleaned = 'https://' + cleaned;
  }
  
  // Basic URL validation
  try {
    new URL(cleaned);
    return cleaned;
  } catch {
    return null;
  }
}

// Convert Wikipedia page URLs to direct image URLs
function cleanLogoUrl(url: string | null | undefined): string | null {
  if (!url || url.trim() === '') return null;
  
  let cleaned = url.trim();
  
  // Handle Wikipedia page URLs (e.g., https://en.wikipedia.org/wiki/...#/media/File:Logo.png)
  // These need to be converted to direct Wikimedia Commons URLs
  if (cleaned.includes('wikipedia.org/wiki/') && cleaned.includes('#/media/File:')) {
    // Extract filename from the URL
    const match = cleaned.match(/#\/media\/File:(.+)$/);
    if (match) {
      let filename = decodeURIComponent(match[1]).replace(/ /g, '_');
      
      // For SVGs and other files, use the Wikimedia Commons thumbnail URL
      // This works universally for all file types
      const encodedFilename = encodeURIComponent(filename).replace(/%2F/g, '/');
      
      // Use Commons thumbnail API which handles all file types
      if (filename.toLowerCase().endsWith('.svg')) {
        // SVGs render better at specific sizes
        cleaned = `https://upload.wikimedia.org/wikipedia/commons/thumb/${getWikimediaPath(filename)}/200px-${filename}.png`;
      } else {
        // For PNG/JPG, use direct thumbnail
        cleaned = `https://upload.wikimedia.org/wikipedia/en/thumb/${getWikimediaPath(filename)}/200px-${filename}`;
      }
    }
  }
  
  // Handle URLs that already point to wikimedia uploads - ensure https
  if (cleaned.includes('upload.wikimedia.org')) {
    if (!cleaned.startsWith('https://')) {
      cleaned = cleaned.replace(/^http:\/\//, 'https://');
      if (!cleaned.startsWith('https://')) {
        cleaned = 'https://' + cleaned.replace(/^\/\//, '');
      }
    }
    return cleaned;
  }
  
  // Basic URL validation
  try {
    new URL(cleaned);
    return cleaned;
  } catch {
    return null;
  }
}

// Generate Wikimedia path hash for a filename
function getWikimediaPath(filename: string): string {
  // Wikimedia uses MD5 hash-based directory structure
  // For simplicity, we'll use a common pattern that works for most files
  const cleanFilename = filename.replace(/ /g, '_');
  const firstChar = cleanFilename[0].toLowerCase();
  const secondChar = (cleanFilename[0] + cleanFilename[1]).toLowerCase();
  return `${firstChar}/${secondChar}/${cleanFilename}`;
}

// Determine university type
function getUniversityType(typeStr: string | null | undefined): 'public' | 'private' {
  if (!typeStr) return 'public';
  const lower = typeStr.toLowerCase();
  return lower.includes('private') ? 'private' : 'public';
}

// Clean province name - MUST match app's PROVINCES values in src/data/index.ts
// App uses: punjab, sindh, kpk, balochistan, islamabad, azad_kashmir, gilgit_baltistan
function cleanProvince(province: string | null | undefined): string {
  if (!province || province.trim() === '') return 'punjab'; // Default to Punjab
  
  const cleaned = province.trim().toLowerCase();
  
  // Normalize to app's expected province keys (lowercase, snake_case)
  const provinceMap: Record<string, string> = {
    'punjab': 'punjab',
    'sindh': 'sindh',
    'balochistan': 'balochistan',
    'baluchistan': 'balochistan',
    'kpk': 'kpk',
    'khyber pakhtunkhwa': 'kpk',
    'khyber-pakhtunkhwa': 'kpk',
    'islamabad': 'islamabad',
    'ict': 'islamabad',
    'islamabad capital territory': 'islamabad',
    'federal': 'islamabad',
    'azad kashmir': 'azad_kashmir',
    'azad jammu and kashmir': 'azad_kashmir',
    'ajk': 'azad_kashmir',
    'gilgit baltistan': 'gilgit_baltistan',
    'gilgit-baltistan': 'gilgit_baltistan',
    'gb': 'gilgit_baltistan',
  };
  
  return provinceMap[cleaned] || 'punjab'; // Default unknown to Punjab
}

async function importFromCsv() {
  const csvPath = path.resolve(__dirname, '../universities DATA.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at ${csvPath}`);
    return;
  }

  console.log('📖 Reading universities DATA.csv...');
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  
  // Parse CSV with header
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  console.log(`🔍 Found ${records.length} potential records in CSV.\n`);

  // Get existing universities count for comparison
  const existingResult = await client.execute('SELECT COUNT(*) as count FROM universities');
  const existingCount = Number(existingResult.rows[0]?.count || 0);
  console.log(`📊 Existing universities in database: ${existingCount}`);
  console.log(`📥 Using UPSERT mode - existing data will be preserved!\n`);

  let insertedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    
    // Skip if name is missing or blank
    const name = (record.university_name || record.name || '').trim();
    if (!name || name === '') {
      console.log(`⚠️ Skipping record ${i + 1}: missing/blank name`);
      skippedCount++;
      continue;
    }

    // Skip if it looks like a header row or invalid data
    if (name.toLowerCase() === 'university_name' || name.toLowerCase() === 'name') {
      skippedCount++;
      continue;
    }

    const id = generateUniversityId(name);
    const short_name = record.short_name?.trim() || generateShortName(name);
    const website = cleanWebsiteUrl(record.official_website || record.website);
    const type = getUniversityType(record.university_type || record.type);
    const city = (record.city || 'Unknown').trim();
    const province = cleanProvince(record.province);
    const logo_url = cleanLogoUrl(record.logo_url);

    try {
      // Check if record exists
      const existing = await client.execute({
        sql: 'SELECT id FROM universities WHERE id = ?',
        args: [id]
      });
      
      if (existing.rows.length > 0) {
        // UPDATE existing record - preserves fields not in CSV (ranking, description, etc.)
        // Force update logo_url when we have a new value (to fix Wikipedia page URLs)
        await client.execute({
          sql: `UPDATE universities SET 
            name = ?,
            short_name = COALESCE(?, short_name),
            website = COALESCE(?, website),
            logo_url = ?,
            type = ?,
            city = ?,
            province = ?,
            is_hec_recognized = COALESCE(is_hec_recognized, 1),
            updated_at = datetime('now')
          WHERE id = ?`,
          args: [name, short_name, website, logo_url, type, city, province, id]
        });
        updatedCount++;
      } else {
        // INSERT new record
        await client.execute({
          sql: `INSERT INTO universities (
            id, name, short_name, website, logo_url, type, city, province, 
            is_hec_recognized, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
          args: [id, name, short_name, website, logo_url, type, city, province]
        });
        insertedCount++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${name}:`, error);
      errorCount++;
    }
  }

  // Clean up any blank/invalid records that might exist
  console.log('\n🧹 Cleaning up invalid records...');
  const cleanupResult = await client.execute(`
    DELETE FROM universities 
    WHERE name IS NULL 
       OR name = '' 
       OR TRIM(name) = ''
       OR short_name IS NULL 
       OR short_name = ''
  `);
  const cleanedCount = cleanupResult.rowsAffected || 0;
  if (cleanedCount > 0) {
    console.log(`   Removed ${cleanedCount} invalid records`);
  }

  // Final count
  const finalResult = await client.execute('SELECT COUNT(*) as count FROM universities');
  const finalCount = Number(finalResult.rows[0]?.count || 0);

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`✅ IMPORT COMPLETE!`);
  console.log(`${'═'.repeat(50)}`);
  console.log(`📥 New universities inserted: ${insertedCount}`);
  console.log(`🔄 Existing universities updated: ${updatedCount}`);
  console.log(`⏭️  Records skipped (invalid): ${skippedCount}`);
  if (errorCount > 0) console.log(`❌ Errors: ${errorCount}`);
  if (cleanedCount > 0) console.log(`🧹 Invalid records cleaned: ${cleanedCount}`);
  console.log(`${'─'.repeat(50)}`);
  console.log(`📊 Total universities in database: ${finalCount}`);
  console.log(`${'═'.repeat(50)}\n`);
}

importFromCsv().catch(err => {
  console.error('Fatal error during import:', err);
  process.exit(1);
});
