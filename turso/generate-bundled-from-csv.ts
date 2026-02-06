/**
 * Generate bundled universities.ts directly from CSV
 * Bypasses network issues with Turso export
 * 
 * Usage: npx ts-node turso/generate-bundled-from-csv.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface CSVRow {
  id: string;
  university_name: string;
  short_name: string;
  province: string;
  city: string;
  university_type: string;
  official_website: string;
  logo_url: string;
}

function parseCSV(content: string): CSVRow[] {
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  const idIndex = headers.findIndex(h => h === 'id');
  const nameIndex = headers.findIndex(h => h === 'university_name');
  const shortNameIndex = headers.findIndex(h => h === 'short_name');
  const provinceIndex = headers.findIndex(h => h === 'province');
  const cityIndex = headers.findIndex(h => h === 'city');
  const typeIndex = headers.findIndex(h => h === 'university_type');
  const websiteIndex = headers.findIndex(h => h === 'official_website');
  const logoIndex = headers.findIndex(h => h === 'logo_url');
  
  const rows: CSVRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV handling quoted values with commas
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));
    
    if (values.length >= 8) {
      const name = values[nameIndex]?.trim();
      if (name && name.length > 0) {
        rows.push({
          id: values[idIndex]?.trim() || '',
          university_name: name,
          short_name: values[shortNameIndex]?.trim() || '',
          province: values[provinceIndex]?.trim() || '',
          city: values[cityIndex]?.trim() || '',
          university_type: values[typeIndex]?.trim() || '',
          official_website: values[websiteIndex]?.trim() || '',
          logo_url: values[logoIndex]?.trim() || '',
        });
      }
    }
  }
  
  return rows;
}

function normalizeProvince(province: string): string {
  const p = province.toLowerCase().trim();
  if (p.includes('punjab')) return 'punjab';
  if (p.includes('sindh')) return 'sindh';
  if (p.includes('kpk') || p.includes('khyber') || p.includes('pakhtunkhwa')) return 'kpk';
  if (p.includes('baloch') || p.includes('baluch')) return 'balochistan';
  if (p.includes('islamabad') || p.includes('ict') || p.includes('federal')) return 'islamabad';
  if (p.includes('azad') || p.includes('kashmir') || p.includes('ajk')) return 'azad_kashmir';
  if (p.includes('gilgit') || p.includes('baltistan') || p.includes('gb')) return 'gilgit_baltistan';
  return province.toLowerCase() || 'punjab';
}

function normalizeType(type: string): 'public' | 'private' | 'semi_government' {
  const t = type.toLowerCase().trim();
  if (t.includes('private')) return 'private';
  if (t.includes('semi') || t.includes('autonomous')) return 'semi_government';
  return 'public';
}

function cleanUrl(url: string): string {
  if (!url || url === '#' || url === 'N/A') return '';
  let cleaned = url.trim();
  if (cleaned && !cleaned.startsWith('http')) {
    cleaned = 'https://' + cleaned;
  }
  return cleaned;
}

async function generateBundled() {
  console.log('📖 Reading CSV file...');
  const csvPath = path.resolve(__dirname, '../universities DATA.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  const rows = parseCSV(csvContent);
  console.log(`📊 Found ${rows.length} universities in CSV\n`);
  
  // Sort by name for consistent ordering
  rows.sort((a, b) => a.university_name.localeCompare(b.university_name));
  
  // Generate TypeScript file
  const lines: string[] = [];
  lines.push('// Comprehensive Pakistani Universities Data');
  lines.push(`// Auto-generated from CSV on ${new Date().toISOString().split('T')[0]}`);
  lines.push('// DO NOT EDIT MANUALLY - Run: npx ts-node turso/generate-bundled-from-csv.ts');
  lines.push('');
  lines.push('export interface CampusData {');
  lines.push('  id: string;');
  lines.push('  name: string;');
  lines.push('  city: string;');
  lines.push('  address: string;');
  lines.push('  phone?: string;');
  lines.push('  email?: string;');
  lines.push('  is_main: boolean;');
  lines.push("  type?: 'public' | 'private' | 'semi_government';");
  lines.push('}');
  lines.push('');
  lines.push('export interface UniversityData {');
  lines.push('  id: number;');
  lines.push('  name: string;');
  lines.push('  short_name: string;');
  lines.push("  type: 'public' | 'private' | 'semi_government';");
  lines.push('  province: string;');
  lines.push('  city: string;');
  lines.push('  address: string;');
  lines.push('  website: string;');
  lines.push('  email: string;');
  lines.push('  phone: string;');
  lines.push('  established_year: number;');
  lines.push('  ranking_hec: string;');
  lines.push('  ranking_national: number | null;');
  lines.push('  is_hec_recognized: boolean;');
  lines.push('  logo_url: string;');
  lines.push('  description: string;');
  lines.push('  admission_url: string;');
  lines.push('  campuses: string[];');
  lines.push('  campus_details?: CampusData[];');
  lines.push('  status_notes?: string;');
  lines.push('  application_steps?: string[];');
  lines.push('}');
  lines.push('');
  lines.push('export const UNIVERSITIES: UniversityData[] = [');
  
  rows.forEach((row, index) => {
    const id = index + 1;
    const province = normalizeProvince(row.province);
    const type = normalizeType(row.university_type);
    const website = cleanUrl(row.official_website);
    const logoUrl = cleanUrl(row.logo_url);
    const city = row.city || 'Unknown';
    
    lines.push('  {');
    lines.push(`    id: ${id},`);
    lines.push(`    name: ${JSON.stringify(row.university_name)},`);
    lines.push(`    short_name: ${JSON.stringify(row.short_name || row.university_name.split(' ').map(w => w[0]).join(''))},`);
    lines.push(`    type: "${type}",`);
    lines.push(`    province: "${province}",`);
    lines.push(`    city: ${JSON.stringify(city)},`);
    lines.push(`    address: "",`);
    lines.push(`    website: ${JSON.stringify(website)},`);
    lines.push(`    email: "",`);
    lines.push(`    phone: "",`);
    lines.push(`    established_year: 2000,`);
    lines.push(`    ranking_hec: "W3",`);
    lines.push(`    ranking_national: null,`);
    lines.push(`    is_hec_recognized: true,`);
    lines.push(`    logo_url: ${JSON.stringify(logoUrl)},`);
    lines.push(`    description: ${JSON.stringify(`${row.university_name} is a ${type} university located in ${city}, ${province}.`)},`);
    lines.push(`    admission_url: ${JSON.stringify(website)},`);
    lines.push(`    campuses: [${JSON.stringify(city)}],`);
    lines.push('  },');
  });
  
  lines.push('];');
  lines.push('');
  lines.push('export default UNIVERSITIES;');
  
  // Write file
  const outputPath = path.resolve(__dirname, '../src/data/universities.ts');
  fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8');
  
  console.log(`✅ Generated bundled file with ${rows.length} universities`);
  console.log(`   Output: ${outputPath}`);
  
  // Province breakdown
  const byProvince: Record<string, number> = {};
  rows.forEach(r => {
    const p = normalizeProvince(r.province);
    byProvince[p] = (byProvince[p] || 0) + 1;
  });
  
  console.log('\n📊 Province breakdown:');
  Object.entries(byProvince)
    .sort((a, b) => b[1] - a[1])
    .forEach(([prov, count]) => {
      console.log(`   ${prov}: ${count}`);
    });
  
  // Type breakdown
  const byType: Record<string, number> = {};
  rows.forEach(r => {
    const t = normalizeType(r.university_type);
    byType[t] = (byType[t] || 0) + 1;
  });
  
  console.log('\n📊 Type breakdown:');
  Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    
  console.log('\n✅ Done! Rebuild the app to see changes: npm run android');
}

generateBundled().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
