/**
 * Export Turso Universities to Bundled Data File
 * 
 * This script syncs data from Turso DB to src/data/universities.ts
 * so the React Native app can use it (libsql doesn't work in RN).
 * 
 * Usage: npx ts-node turso/export-to-bundled.ts
 * Run this after any Turso data updates to sync to the app.
 */

import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

interface UniversityRow {
  id: string;
  name: string;
  short_name: string;
  type: string;
  province: string;
  city: string;
  address: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  established_year: number | null;
  ranking_hec: string | null;
  ranking_national: number | null;
  is_hec_recognized: number;
  logo_url: string | null;
  description: string | null;
  admission_url: string | null;
  campuses: string | null;
  status_notes: string | null;
  application_steps: string | null;
}

async function exportToBundled() {
  console.log('📤 Exporting Turso universities to bundled data file...\n');

  // Fetch all universities from Turso
  const result = await client.execute(`
    SELECT * FROM universities 
    WHERE name IS NOT NULL AND name != '' AND TRIM(name) != ''
    ORDER BY ranking_national ASC NULLS LAST, name ASC
  `);

  const universities = result.rows as unknown as UniversityRow[];
  console.log(`📊 Found ${universities.length} universities in Turso\n`);

  // Generate TypeScript file content
  const fileContent = `// Comprehensive Pakistani Universities Data
// Auto-generated from Turso database on ${new Date().toISOString().split('T')[0]}
// DO NOT EDIT MANUALLY - Run: npx ts-node turso/export-to-bundled.ts

export interface CampusData {
  id: string;
  name: string;
  city: string;
  address: string;
  phone?: string;
  email?: string;
  is_main: boolean;
  type?: 'public' | 'private' | 'semi_government';
}

export interface UniversityData {
  id: number;
  name: string;
  short_name: string;
  type: 'public' | 'private' | 'semi_government';
  province: string;
  city: string;
  address: string;
  website: string;
  email: string;
  phone: string;
  established_year: number;
  ranking_hec: string;
  ranking_national: number | null;
  is_hec_recognized: boolean;
  logo_url: string;
  description: string;
  admission_url: string;
  campuses: string[];
  campus_details?: CampusData[];
  status_notes?: string;
  application_steps?: string[];
}

export const UNIVERSITIES: UniversityData[] = [
${universities.map((uni, index) => {
  // Parse JSON arrays safely
  let campuses: string[] = [];
  let applicationSteps: string[] = [];
  
  try {
    campuses = uni.campuses ? JSON.parse(uni.campuses) : [];
  } catch { campuses = []; }
  
  try {
    applicationSteps = uni.application_steps ? JSON.parse(uni.application_steps) : [];
  } catch { applicationSteps = []; }

  // Extract numeric ID from string ID like "uni-lahore-university-of-management-sciences"
  const numericId = index + 1;
  
  return `  {
    id: ${numericId},
    name: ${JSON.stringify(uni.name)},
    short_name: ${JSON.stringify(uni.short_name)},
    type: ${JSON.stringify(uni.type as 'public' | 'private')},
    province: ${JSON.stringify(uni.province)},
    city: ${JSON.stringify(uni.city || 'Unknown')},
    address: ${JSON.stringify(uni.address || '')},
    website: ${JSON.stringify(uni.website || '')},
    email: ${JSON.stringify(uni.email || '')},
    phone: ${JSON.stringify(uni.phone || '')},
    established_year: ${uni.established_year || 2000},
    ranking_hec: ${JSON.stringify(uni.ranking_hec || 'W3')},
    ranking_national: ${uni.ranking_national || 'null'},
    is_hec_recognized: ${uni.is_hec_recognized ? 'true' : 'false'},
    logo_url: ${JSON.stringify(uni.logo_url || '')},
    description: ${JSON.stringify(uni.description || `${uni.name} is a ${uni.type} university located in ${uni.city}, ${uni.province}.`)},
    admission_url: ${JSON.stringify(uni.admission_url || uni.website || '')},
    campuses: ${JSON.stringify(campuses.length > 0 ? campuses : [uni.city || 'Main Campus'])},${uni.status_notes ? `\n    status_notes: ${JSON.stringify(uni.status_notes)},` : ''}${applicationSteps.length > 0 ? `\n    application_steps: ${JSON.stringify(applicationSteps)},` : ''}
  }`;
}).join(',\n')}
];

export default UNIVERSITIES;
`;

  // Write to file
  const outputPath = path.resolve(__dirname, '../src/data/universities.ts');
  fs.writeFileSync(outputPath, fileContent, 'utf-8');

  console.log(`✅ Exported ${universities.length} universities to:`);
  console.log(`   ${outputPath}\n`);

  // Show province breakdown
  const byProvince: Record<string, number> = {};
  universities.forEach(u => {
    byProvince[u.province] = (byProvince[u.province] || 0) + 1;
  });
  
  console.log('📊 Province breakdown:');
  Object.entries(byProvince)
    .sort((a, b) => b[1] - a[1])
    .forEach(([prov, count]) => {
      console.log(`   ${prov}: ${count}`);
    });

  console.log('\n✅ Done! The app will now show all universities.');
  console.log('   Rebuild the app to see changes: npm run android');
}

exportToBundled().catch(err => {
  console.error('❌ Export failed:', err);
  process.exit(1);
});
