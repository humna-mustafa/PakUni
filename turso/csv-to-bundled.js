/**
 * Generate bundled universities.ts from CSV - Pure Node.js (no Turso)
 * Usage: node turso/csv-to-bundled.js
 */

const fs = require('fs');
const path = require('path');

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') { inQuotes = !inQuotes; }
    else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
    else { current += char; }
  }
  values.push(current.trim());
  return values;
}

function normalizeProvince(province) {
  if (!province) return 'punjab';
  const p = province.toLowerCase().trim();
  if (p.includes('punjab')) return 'punjab';
  if (p.includes('sindh')) return 'sindh';
  if (p.includes('kpk') || p.includes('khyber') || p.includes('pakhtunkhwa')) return 'kpk';
  if (p.includes('baloch') || p.includes('baluch')) return 'balochistan';
  if (p.includes('islamabad') || p.includes('ict') || p.includes('federal') || p.includes('capital')) return 'islamabad';
  if (p.includes('azad') || p.includes('kashmir') || p.includes('ajk')) return 'azad_kashmir';
  if (p.includes('gilgit') || p.includes('baltistan') || p.includes('gb')) return 'gilgit_baltistan';
  return 'punjab';
}

function normalizeType(type) {
  if (!type) return 'public';
  const t = type.toLowerCase().trim();
  if (t.includes('private')) return 'private';
  if (t.includes('semi') || t.includes('autonomous')) return 'semi_government';
  return 'public';
}

function cleanUrl(url) {
  if (!url || url === '#' || url === 'N/A') return '';
  let cleaned = url.trim();
  if (cleaned && !cleaned.startsWith('http')) {
    cleaned = 'https://' + cleaned;
  }
  return cleaned;
}

function cleanLogoUrl(url) {
  if (!url || url === '#' || url === 'N/A' || url === 'nan') return '';
  let cleaned = url.trim();
  // Skip invalid logos
  if (cleaned.toLowerCase().includes('not have logo') || 
      cleaned.toLowerCase().includes('dangerous website') ||
      cleaned.startsWith('data:image')) {
    return '';
  }
  // Convert Wikipedia article page URLs to empty (they don't load as images)
  // Wikipedia article links contain #/media/File: which is not a direct image URL
  if (cleaned.includes('#/media/File:') || cleaned.includes('/wiki/') && cleaned.includes('#/media/')) {
    return '';
  }
  if (cleaned && !cleaned.startsWith('http')) {
    cleaned = 'https://' + cleaned;
  }
  return cleaned;
}

// Read CSV - Use the latest updated CSV file
const csvPath = path.resolve(__dirname, '../universities DATA (1).csv');
console.log('📖 Reading CSV from:', csvPath);

const content = fs.readFileSync(csvPath, 'utf-8');
const lines = content.split('\n').filter(l => l.trim());
const headers = parseCSVLine(lines[0]);

console.log('Headers:', headers.slice(0, 8));

// Parse universities
const universities = [];
for (let i = 1; i < lines.length; i++) {
  const values = parseCSVLine(lines[i]);
  const name = values[1];
  if (!name || name.length === 0 || name === 'university_name') continue;
  
  universities.push({
    name: name,
    short_name: values[2] || name.split(' ').map(w => w[0]).join('').toUpperCase(),
    website: cleanUrl(values[3]),
    logo_url: cleanLogoUrl(values[4]),
    type: normalizeType(values[5]),
    city: values[6] || 'Unknown',
    province: normalizeProvince(values[7]),
  });
}

console.log(`📊 Found ${universities.length} universities in CSV`);

// Remove duplicates by name (case-insensitive)
const seen = new Map();
const deduped = [];
universities.forEach(u => {
  const key = u.name.toLowerCase().trim();
  if (!seen.has(key)) {
    seen.set(key, true);
    deduped.push(u);
  } else {
    console.log(`⚠️  Removing duplicate: ${u.name}`);
  }
});
console.log(`📊 After dedup: ${deduped.length} universities`);

// Sort by name for consistent ordering
deduped.sort((a, b) => a.name.localeCompare(b.name));

// Generate TypeScript content
let output = '';
output += '// Comprehensive Pakistani Universities Data\n';
output += `// Auto-generated from CSV on ${new Date().toISOString().split('T')[0]}\n`;
output += '// DO NOT EDIT MANUALLY - Run: node turso/csv-to-bundled.js\n\n';

output += `export interface CampusData {
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

export const UNIVERSITIES: UniversityData[] = [\n`;

deduped.forEach((u, index) => {
  const id = index + 1;
  output += `  {
    id: ${id},
    name: ${JSON.stringify(u.name)},
    short_name: ${JSON.stringify(u.short_name)},
    type: "${u.type}",
    province: "${u.province}",
    city: ${JSON.stringify(u.city)},
    address: "",
    website: ${JSON.stringify(u.website)},
    email: "",
    phone: "",
    established_year: 2000,
    ranking_hec: "W3",
    ranking_national: null,
    is_hec_recognized: true,
    logo_url: ${JSON.stringify(u.logo_url)},
    description: ${JSON.stringify(`${u.name} is a ${u.type} university located in ${u.city}, ${u.province}.`)},
    admission_url: ${JSON.stringify(u.website)},
    campuses: [${JSON.stringify(u.city)}],
  },\n`;
});

output += '];\n\nexport default UNIVERSITIES;\n';

// Write file
const outputPath = path.resolve(__dirname, '../src/data/universities.ts');
fs.writeFileSync(outputPath, output, 'utf-8');

console.log(`✅ Generated ${deduped.length} universities to:`);
console.log(`   ${outputPath}`);

// Stats
const byProvince = {};
deduped.forEach(u => {
  byProvince[u.province] = (byProvince[u.province] || 0) + 1;
});

console.log('\n📊 Province breakdown:');
Object.entries(byProvince)
  .sort((a, b) => b[1] - a[1])
  .forEach(([prov, count]) => {
    console.log(`   ${prov}: ${count}`);
  });

const byType = {};
deduped.forEach(u => {
  byType[u.type] = (byType[u.type] || 0) + 1;
});

console.log('\n📊 Type breakdown:');
Object.entries(byType).forEach(([type, count]) => {
  console.log(`   ${type}: ${count}`);
});

console.log('\n✅ Done! Rebuild app to see changes: npm run android');
