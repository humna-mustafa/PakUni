/**
 * Extract merit data from meritArchive.ts into JSON files
 * Run: node scripts/extract-merit-json.js
 */
const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, '..', 'src', 'data', 'meritArchive.ts');
const content = fs.readFileSync(srcFile, 'utf8');

// ========== 1. Extract MERIT_RECORDS ==========
const recordsMatch = content.match(/export const MERIT_RECORDS: MeritRecord\[\] = (\[[\s\S]*?\n\]);/);
if (!recordsMatch) {
  console.error('Could not find MERIT_RECORDS array');
  process.exit(1);
}

let recordsStr = recordsMatch[1]
  .replace(/'Fall' as const/g, '"Fall"')
  .replace(/'Spring' as const/g, '"Spring"')
  .replace(/'open' as const/g, '"open"')
  .replace(/'self-finance' as const/g, '"self-finance"')
  .replace(/'reserved' as const/g, '"reserved"')
  .replace(/'/g, '"')
  .replace(/\/\/.*$/gm, '')
  // Quote unquoted object keys: word: value -> "word": value
  .replace(/(\s+)(\w+):/g, '$1"$2":')
  .replace(/,(\s*[}\]])/g, '$1');

const records = JSON.parse(recordsStr);
const recordsOut = path.join(__dirname, '..', 'src', 'data', 'meritRecords.json');
fs.writeFileSync(recordsOut, JSON.stringify(records, null, 2));
console.log(`Created meritRecords.json: ${records.length} records`);

// ========== 2. Extract UNIVERSITY_MERIT_INFO via eval ==========
const infoMatch = content.match(/export const UNIVERSITY_MERIT_INFO: Record<string, UniversityMeritInfo> = (\{[\s\S]*?\n\});/);
if (!infoMatch) {
  console.error('Could not find UNIVERSITY_MERIT_INFO');
  process.exit(1);
}

// Use indirect eval to parse the JS object literal (not JSON)
const info = eval('(' + infoMatch[1] + ')');
const infoOut = path.join(__dirname, '..', 'src', 'data', 'universityMeritInfo.json');
fs.writeFileSync(infoOut, JSON.stringify(info, null, 2));
console.log(`Created universityMeritInfo.json: ${Object.keys(info).length} universities`);
